"""Linux, process-local ownership for offline Qt tests. No existing PID is adopted."""
from __future__ import annotations
import ctypes
import fcntl
import json
import os
from pathlib import Path
import signal
import time


class ResourceRefusal(RuntimeError):
    pass


def enable_subreaper():
    """Apply only to this standalone supervisor, before it creates children."""
    libc = ctypes.CDLL(None, use_errno=True)
    if libc.prctl(36, 1, 0, 0, 0) != 0:  # PR_SET_CHILD_SUBREAPER
        raise OSError(ctypes.get_errno(), 'process-local subreaper unavailable')
    value = ctypes.c_int()
    if libc.prctl(37, ctypes.byref(value), 0, 0, 0) != 0 or value.value != 1:
        raise ResourceRefusal('process-local subreaper verification failed')


class ExclusiveRun:
    def __init__(self, path):
        self.path = Path(path)
        self.fd = None

    def __enter__(self):
        self.fd = os.open(self.path, os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
        try:
            fcntl.flock(self.fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BaseException:
            os.close(self.fd)
            self.fd = None
            raise ResourceRefusal('another managed Qt test is active')
        return self

    def __exit__(self, *_):
        if self.fd is not None:
            os.close(self.fd)
            self.fd = None


def require_space(directory, minimum_free, expected_bytes=0):
    if minimum_free < 0 or expected_bytes < 0:
        raise ValueError('negative capacity requirement')
    free = os.statvfs(directory)
    available = free.f_bavail * free.f_frsize
    if available < minimum_free + expected_bytes:
        raise ResourceRefusal('insufficient capacity before generation')
    return {'availableBytes': available, 'minimumFreeBytes': minimum_free,
            'expectedBytes': expected_bytes}


def process_records():
    # Read only identifiers/state, not command lines or environment values.
    records = {}
    for path in Path('/proc').iterdir():
        if not path.name.isdigit():
            continue
        try:
            text = (path / 'stat').read_text()
            fields = text[text.rfind(')') + 2:].split()
            records[int(path.name)] = {
                'pid': int(path.name), 'state': fields[0], 'ppid': int(fields[1]),
                'group': int(fields[2]), 'session': int(fields[3]),
                'start': int(fields[19])}
        except (OSError, ValueError, IndexError):
            continue
    return records


class OwnedChildren:
    """Track only new-session children and their descendants, never old zombies."""
    def __init__(self):
        self.parent = os.getpid()
        self.roots = {}
        self.known = {}
        self.reaped = []
        self.signals = []
        self.signal_failures = []
        self.ownership_failures = []

    def add(self, proc, label):
        # Register the Popen handle before any fallible /proc inspection so even
        # startup/registration failures cannot skip the direct child in cleanup.
        self.roots[proc.pid] = (proc, label, None)
        record = process_records().get(proc.pid)
        if not record or record['ppid'] != self.parent or record['session'] != proc.pid:
            self.ownership_failures.append({'pid': proc.pid, 'label': label,
                                            'reason': 'session identity unavailable'})
            raise ResourceRefusal('owned child did not enter its dedicated session')
        self.roots[proc.pid] = (proc, label, record['start'])
        self.known[proc.pid] = record['start']

    def snapshot(self):
        rows = process_records()
        owned = {pid for pid, start in self.known.items()
                 if pid in rows and rows[pid]['start'] == start}
        while True:
            more = {pid for pid, row in rows.items()
                    if row['ppid'] in owned or row['ppid'] == self.parent}
            if more <= owned:
                break
            owned |= more
        result = []
        for pid in owned:
            row = rows[pid]
            self.known[pid] = row['start']
            result.append(row)
        return result

    def reap(self):
        # This is a dedicated supervisor: every child was launched here or was
        # adopted from one of its own new-session children by the subreaper.
        while True:
            try:
                pid, status = os.waitpid(-1, os.WNOHANG)
            except ChildProcessError:
                return False
            if pid == 0:
                return True
            code = os.waitstatus_to_exitcode(status)
            if pid in self.roots:
                self.roots[pid][0].returncode = code
            self.reaped.append({'pid': pid, 'exit': code})

    def send(self, sig):
        for row in self.snapshot():
            if row['state'] == 'Z':
                continue
            if any(x['pid'] == row['pid'] for x in self.signal_failures):
                continue
            # Recheck PID identity immediately before signalling.
            current = process_records().get(row['pid'])
            if not current or current['start'] != row['start']:
                continue
            try:
                os.kill(row['pid'], sig)
                self.signals.append({'pid': row['pid'], 'signal': int(sig)})
            except ProcessLookupError:
                pass
            except OSError as error:
                self.signal_failures.append({'pid': row['pid'], 'signal': int(sig),
                                             'errno': error.errno})

    def drain(self, timeout):
        end = time.monotonic() + timeout
        while True:
            children_present = self.reap()
            remaining = self.snapshot()
            if not remaining and not children_present:
                return []
            if time.monotonic() >= end:
                return remaining or [{'pid': None, 'state': 'unobserved-live-child'}]
            time.sleep(.02)

    def close(self, graceful_seconds=5, term_seconds=3, kill_seconds=3):
        # Caller first asks the owned Qt service to destroy its own windows.
        remaining = self.drain(graceful_seconds)
        if remaining:
            self.send(signal.SIGTERM)
            for proc, _label, _start in self.roots.values():
                if proc.poll() is None and not any(x['pid'] == proc.pid for x in self.signal_failures):
                    try:
                        proc.terminate()  # Unreaped Popen identity cannot be reused.
                    except ProcessLookupError:
                        pass
                    except OSError as error:
                        self.signal_failures.append({'pid': proc.pid, 'signal': int(signal.SIGTERM),
                                                     'errno': error.errno})
            remaining = self.drain(term_seconds)
        if remaining:
            self.send(signal.SIGKILL)
            for proc, _label, _start in self.roots.values():
                if proc.poll() is None and not any(x['pid'] == proc.pid for x in self.signal_failures):
                    try:
                        proc.kill()
                    except ProcessLookupError:
                        pass
                    except OSError as error:
                        self.signal_failures.append({'pid': proc.pid, 'signal': int(signal.SIGKILL),
                                                     'errno': error.errno})
            remaining = self.drain(kill_seconds)
        return {'complete': not remaining and not self.ownership_failures and not self.signal_failures,
                'remaining': [{'pid': x['pid'], 'state': x['state']} for x in remaining],
                'reaped': self.reaped, 'signals': self.signals,
                'ownershipFailures': self.ownership_failures,
                'signalFailures': self.signal_failures,
                'roots': {label: {'pid': proc.pid, 'exit': proc.returncode}
                          for proc, label, _ in self.roots.values()}}


def write_report(path, value):
    path = Path(path)
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    os.replace(temporary, path)
