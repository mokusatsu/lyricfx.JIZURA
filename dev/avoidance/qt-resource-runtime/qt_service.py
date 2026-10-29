"""Wrap a frozen pywebview service without changing its bytes or sandbox flags."""
import argparse
import json
import runpy
import sys
import threading
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-service', type=Path, required=True)
    parser.add_argument('--resource-report', type=Path, required=True)
    parser.add_argument('--max-pages', type=int, default=3)
    args = parser.parse_args()
    if not 1 <= args.max_pages <= 3:
        raise ValueError('managed service permits one to three pages')
    import webview
    from owned_runtime import write_report
    create, start = webview.create_window, webview.start
    windows = []
    state = {'created': 0, 'closed': [], 'shutdownRequested': False, 'errors': []}
    report_lock = threading.RLock()
    control_thread = None

    def save():
        with report_lock:
            write_report(args.resource_report, state)

    def create_owned(*pos, **kw):
        if len(windows) >= args.max_pages:
            raise RuntimeError('managed Qt page limit reached')
        window = create(*pos, **kw)
        ordinal = len(windows)
        windows.append(window)
        state['created'] = len(windows)

        def closed():
            state['closed'].append(ordinal)
            save()

        window.events.closed += closed
        return window

    def stop():
        state['shutdownRequested'] = True
        for ordinal, window in reversed(list(enumerate(windows))):
            if ordinal in state['closed']:
                continue
            try:
                window.destroy()  # pywebview marshals the normal close API.
            except BaseException as error:
                state['errors'].append({'page': ordinal, 'type': type(error).__name__})
        save()

    def control():
        line = sys.stdin.readline()
        if line in ('shutdown\n', ''):
            stop()
        else:
            state['errors'].append({'type': 'InvalidControlMessage'})
            stop()

    def start_owned(function=None, *pos, **kw):
        nonlocal control_thread
        def ready(*callback_args):
            nonlocal control_thread
            try:
                if function is not None:
                    function(*callback_args)
            finally:
                save()
                control_thread = threading.Thread(target=control, daemon=True)
                control_thread.start()
        try:
            return start(ready, *pos, **kw)
        finally:
            if control_thread is not None:
                control_thread.join(timeout=1)
            state['serviceReturned'] = True
            save()

    webview.create_window, webview.start = create_owned, start_owned
    sys.argv = [str(args.source_service), '--media']
    runpy.run_path(str(args.source_service), run_name='__main__')


if __name__ == '__main__':
    main()
