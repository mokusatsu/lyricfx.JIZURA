"""Managed entry point for future frozen Qt probe directories, max one run."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import signal
import socket
import subprocess
import sys
import time
import urllib.request

from owned_runtime import (ExclusiveRun, OwnedChildren, ResourceRefusal,
                           enable_subreaper, require_space, write_report)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('source', type=Path)
    p.add_argument('output', type=Path)
    p.add_argument('--python', type=Path, default=Path('/workspace/jizura-browser-runtime-20261027/pywebview-venv/bin/python'))
    p.add_argument('--lock', type=Path, default=Path('/tmp/jizura-managed-qt-test.lock'))
    p.add_argument('--timeout', type=float, default=1800)
    p.add_argument('--minimum-free', type=int, default=1024**3)
    p.add_argument('--expected-bytes', type=int, default=256*1024**2)
    args = p.parse_args()
    source, output = args.source.resolve(), args.output.resolve()
    if args.timeout <= 0 or output.exists() or args.minimum_free < 1024**3:
        p.error('positive timeout, fresh output and at least 1 GiB spare floor are required')
    if not output.parent.is_dir() or not (source/'probe.cjs').is_file() or not (source/'qt-service-visible.py').is_file():
        p.error('existing output parent and frozen probe/service are required')
    if any('SANDBOX' in k for k in os.environ) or '--no-sandbox' in os.environ.get('QTWEBENGINE_CHROMIUM_FLAGS', ''):
        raise ResourceRefusal('sandbox override is outside this runner')
    runtime = output.with_name(output.name+'-runtime')
    report = {'complete': False, 'source': str(source), 'output': str(output),
              'scope': 'owned process lifecycle; probe acceptance remains separate'}
    report['runtimeSources'] = []
    for path in [Path(__file__), Path(__file__).with_name('owned_runtime.py'),
                 Path(__file__).with_name('qt_service.py'), source/'qt-service-visible.py',
                 source/'probe.cjs']:
        data = path.read_bytes()
        report['runtimeSources'].append({'path': str(path.resolve()), 'bytes': len(data),
                                         'sha256': hashlib.sha256(data).hexdigest()})
    children = OwnedChildren()
    service = node = None
    code = 1

    def interrupted(signum, _frame):
        raise InterruptedError('managed probe interrupted by signal '+str(signum))

    with ExclusiveRun(args.lock):
        report['capacityBeforeGeneration'] = require_space(output.parent, args.minimum_free, args.expected_bytes)
        enable_subreaper()
        runtime.mkdir(exist_ok=False)
        for sig in (signal.SIGINT, signal.SIGTERM):
            signal.signal(sig, interrupted)
        env = os.environ.copy()
        env.update(QT_QPA_PLATFORM='offscreen', QTWEBENGINE_REMOTE_DEBUGGING='127.0.0.1:9333',
                   JIZURA_QT_STARTUP_REPORT=str(runtime/'startup.json'),
                   BILLBOARD_MODEL81_RELEASE='PREPARE_PROFILE81P')
        try:
            check = socket.socket()
            try:
                if check.connect_ex(('127.0.0.1', 9333)) == 0:
                    raise ResourceRefusal('an existing Qt debugging service is active')
            finally:
                check.close()
            with (runtime/'service.log').open('xb') as log:
                service = subprocess.Popen(
                    [str(args.python), str(Path(__file__).with_name('qt_service.py')),
                     '--source-service', str(source/'qt-service-visible.py'),
                     '--resource-report', str(runtime/'pages.json')],
                    stdin=subprocess.PIPE, stdout=log, stderr=subprocess.STDOUT,
                    env=env, start_new_session=True, text=True)
                children.add(service, 'service')
                deadline = time.monotonic()+30
                while time.monotonic() < deadline:
                    if service.poll() is not None:
                        raise ResourceRefusal('owned Qt service failed during startup')
                    try:
                        with urllib.request.urlopen('http://127.0.0.1:9333/json/list', timeout=1) as response:
                            targets = json.load(response)
                        if len([x for x in targets if x.get('type') == 'page']) == 3:
                            break
                    except OSError:
                        pass
                    time.sleep(.05)
                else:
                    raise TimeoutError('owned Qt startup timeout')
                require_space(output.parent, args.minimum_free, args.expected_bytes)
                node = subprocess.Popen(['node', str(source/'probe.cjs'), str(output)],
                                        env=env, start_new_session=True)
                children.add(node, 'node')
                deadline = time.monotonic()+args.timeout
                while node.poll() is None:
                    if service.poll() is not None:
                        raise ResourceRefusal('owned Qt service exited before its probe')
                    children.snapshot()
                    require_space(output.parent, args.minimum_free)
                    if time.monotonic() >= deadline:
                        raise TimeoutError('owned probe execution timeout')
                    time.sleep(.1)
                code = node.returncode
                report['probeExit'] = code
        except BaseException as error:
            report['failure'] = {'type': type(error).__name__, 'message': str(error)}
        finally:
            # Stop accepting further signals while bounded cleanup runs.
            for sig in (signal.SIGINT, signal.SIGTERM):
                signal.signal(sig, signal.SIG_IGN)
            if service is not None and service.poll() is None and service.stdin is not None:
                try:
                    service.stdin.write('shutdown\n')
                    service.stdin.flush()
                    service.stdin.close()
                    report['normalPageShutdownRequested'] = True
                except (OSError, ValueError):
                    report['normalPageShutdownRequested'] = False
            report['cleanup'] = children.close()
            check = socket.socket()
            try:
                report['debugPortClosed'] = check.connect_ex(('127.0.0.1', 9333)) != 0
            finally:
                check.close()
            pages = runtime/'pages.json'
            if pages.exists():
                report['pages'] = json.loads(pages.read_text())
            page_state = report.get('pages', {})
            report['normalPageClosureConfirmed'] = (
                page_state.get('created') == 3 and
                sorted(page_state.get('closed', [])) == [0, 1, 2] and
                page_state.get('serviceReturned') is True and not page_state.get('errors'))
            report['complete'] = (report['cleanup']['complete'] and report['debugPortClosed']
                                  and report['normalPageClosureConfirmed'] and code == 0
                                  and 'failure' not in report)
            write_report(runtime/'host.json', report)
    return 0 if report['complete'] else 1


if __name__ == '__main__':
    sys.exit(main())
