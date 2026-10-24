#!/usr/bin/env python3
"""Owned-PTY namespace keeper. Start with the official SHM/network grant; credentials use stdin only.

Starts the reviewed OPEN helper, then accepts one JSON command at a time:
{"action":"RUN","argv":["python","-B","/path/reviewed.py"],"cwd":"/absolute/path","envUpdates":{}}
{"action":"EXIT"}
Send nested helper credentials only after that helper prints READY. Never batch commands.
No shell, credentials, command payloads, or child output are logged by this manager.
"""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import termios

BASE = Path('/dev/shm/avoid009-afternoon-20261024')
OPEN = Path('/tmp/avoid009-afternoon-storage-source02/open_source.py')
OPEN_SHA = '22168925a9737ff6addcbf046685b9c505ebab851549e4ef3a9fdbc63ecb0483'
SHELLS = {'sh', 'bash', 'dash', 'zsh', 'ksh', 'csh', 'tcsh', 'fish', 'pwsh', 'powershell', 'cmd', 'cmd.exe'}


def require(ok):
    if not ok:
        raise ValueError('invalid request')


def line_from_fd(fd):
    # No buffered reader: child PTY credential reads must receive their own input.
    data = bytearray()
    while True:
        char = os.read(fd, 1)
        if not char:
            return None if not data else bytes(data)
        if char == b'\n':
            return bytes(data)
        data.extend(char)
        require(len(data) <= 1048576)


def safe_command(request):
    require(isinstance(request, dict) and request.get('action') == 'RUN')
    require(set(request) <= {'action', 'argv', 'cwd', 'envUpdates'})
    argv = request.get('argv')
    require(isinstance(argv, list) and 1 <= len(argv) <= 256)
    require(all(isinstance(a, str) and '\0' not in a for a in argv))
    require(bool(argv[0]) and Path(argv[0]).name.lower() not in SHELLS)
    # Authentication belongs exclusively in a nested reviewed helper's hidden stdin.
    require(not any('authorization:' in a.lower() for a in argv))
    cwd = request.get('cwd', str(BASE))
    require(isinstance(cwd, str) and Path(cwd).is_absolute() and Path(cwd).is_dir())
    changes = request.get('envUpdates', {})
    require(isinstance(changes, dict))
    env = os.environ.copy()
    for key, value in changes.items():
        require(isinstance(key, str) and key and '=' not in key and '\0' not in key)
        require(not any(word in key.upper() for word in ['TOKEN', 'AUTH', 'PASSWORD', 'SECRET', 'CREDENTIAL']))
        require(value is None or (isinstance(value, str) and '\0' not in value and 'authorization:' not in value.lower()))
        if value is None:
            env.pop(key, None)
        else:
            env[key] = value
    return argv, cwd, env


def main():
    if not sys.stdin.isatty():
        raise SystemExit('Owned PTY required.')
    fd = sys.stdin.fileno()
    original = termios.tcgetattr(fd)
    hidden = termios.tcgetattr(fd)
    hidden[3] &= ~termios.ECHO
    termios.tcsetattr(fd, termios.TCSADRAIN, hidden)
    try:
        require(OPEN.is_file() and not OPEN.is_symlink())
        require(hashlib.sha256(OPEN.read_bytes()).hexdigest() == OPEN_SHA)
        require(not BASE.is_symlink())
        BASE.mkdir(mode=0o700, parents=False, exist_ok=True)
        require(BASE.is_dir())
        # Same process tree/permission namespace. The child owns credential input.
        opened = subprocess.run([sys.executable, '-B', str(OPEN), 'OPEN'], shell=False).returncode
        print(json.dumps({'event':'MANAGER_READY','openExit':opened,'namespaceAlive':True}), flush=True)
        while True:
            raw = line_from_fd(fd)
            if raw is None:
                print(json.dumps({'event':'MANAGER_EOF','namespaceClosing':True}), flush=True)
                return
            try:
                request = json.loads(raw)
                if request == {'action':'EXIT'}:
                    print(json.dumps({'event':'MANAGER_EXIT','namespaceClosing':True}), flush=True)
                    return
                argv, cwd, env = safe_command(request)
            except (ValueError, TypeError, OSError):
                print(json.dumps({'event':'COMMAND_REFUSED','namespaceAlive':True}), flush=True)
                continue
            # Child inherits this owned PTY and namespace. Never capture/reprint its streams.
            try:
                result = subprocess.run(argv, cwd=cwd, env=env, shell=False)
                print(json.dumps({'event':'RUN_DONE','exitCode':result.returncode,'namespaceAlive':True}), flush=True)
            except OSError:
                print(json.dumps({'event':'RUN_START_FAILED','namespaceAlive':True}), flush=True)
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, original)


if __name__ == '__main__':
    main()
