"""Small process/API fixtures. This suite never launches Qt, a browser, or media."""
import json
import io
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch

from owned_runtime import ExclusiveRun, OwnedChildren, ResourceRefusal, enable_subreaper, require_space

D = Path(__file__).resolve().parent


def worker(mode):
    enable_subreaper()
    owned = OwnedChildren()
    if mode == 'normal':
        program = "import sys; assert sys.stdin.readline()=='shutdown\\n'"
    elif mode == 'startup-failure':
        program = 'raise SystemExit(7)'
    elif mode == 'orphan':
        program = "import subprocess,sys; subprocess.Popen([sys.executable,'-c','import time; time.sleep(.15)'])"
    elif mode == 'escaped-orphan':
        program = "import subprocess,sys; subprocess.Popen([sys.executable,'-c','import time; time.sleep(.15)'],start_new_session=True)"
    elif mode in ('timeout', 'exception'):
        program = "import subprocess,sys,time,signal; signal.signal(signal.SIGTERM,signal.SIG_IGN); subprocess.Popen([sys.executable,'-c','import time,signal; signal.signal(signal.SIGTERM,signal.SIG_IGN); time.sleep(30)']); print('ready',flush=True); time.sleep(30)"
    else:
        raise ValueError(mode)
    proc = subprocess.Popen([sys.executable, '-c', program], stdin=subprocess.PIPE,
                            stdout=subprocess.PIPE, start_new_session=True, text=True)
    owned.add(proc, 'fixture')
    if mode == 'normal':
        proc.stdin.write('shutdown\n')
        proc.stdin.flush()
        proc.stdin.close()
    if mode in ('timeout', 'exception'):
        assert proc.stdout.readline() == 'ready\n'
        owned.snapshot()
    try:
        if mode == 'exception':
            raise RuntimeError('fixture failure after spawn')
    except RuntimeError:
        pass
    finally:
        report = owned.close(.25, .15, 1)
    assert report['complete'] and not report['remaining']
    assert not owned.snapshot()
    if mode == 'startup-failure':
        assert proc.returncode == 7
    if mode in ('timeout', 'exception'):
        assert any(x['signal'] == signal.SIGKILL for x in report['signals'])
    print(json.dumps(report))


def runner_worker(mode):
    # Run the actual supervisor control flow with tiny owned Python children.
    # Only the Qt/page/network and Node payload are replaced, not process cleanup.
    import run_probe
    original_popen = subprocess.Popen
    with tempfile.TemporaryDirectory() as t:
        root = Path(t)
        source = root/'source'
        source.mkdir()
        (source/'probe.cjs').write_text('// no browser fixture')
        (source/'qt-service-visible.py').write_text('# no Qt fixture')
        out = root/'result'
        spawned = []

        def spawn(command, **kwargs):
            if '--source-service' in command:
                spawned.append('service')
                report = command[command.index('--resource-report')+1]
                program = ('raise SystemExit(5)' if mode == 'service-failure' else
                           "import sys,json,pathlib; assert sys.stdin.readline()=='shutdown\\n'; pathlib.Path(sys.argv[1]).write_text(json.dumps({'created':3,'closed':[0,1,2],'serviceReturned':True,'errors':[]}))")
                return original_popen([sys.executable, '-c', program, report], **kwargs)
            spawned.append('node')
            program = 'raise SystemExit(6)' if mode == 'node-failure' else 'import time;time.sleep(.7)' if mode == 'timeout' else 'import time;time.sleep(.05)'
            return original_popen([sys.executable, '-c', program], **kwargs)

        class ClosedPort:
            def connect_ex(self, _address): return 111
            def close(self): pass

        def pages(*_args, **_kwargs):
            if mode == 'service-failure':
                raise OSError('fixture service unavailable')
            return io.BytesIO(json.dumps([{'type':'page'}]*3).encode())

        argv = [str(D/'run_probe.py'), str(source), str(out), '--python', sys.executable,
                '--minimum-free', str(1024**3), '--expected-bytes', '0', '--timeout', '.1',
                '--lock', str(root/'lock')]
        with patch.object(sys, 'argv', argv), patch.object(subprocess, 'Popen', spawn), \
             patch.object(run_probe.socket, 'socket', ClosedPort), \
             patch.object(run_probe.urllib.request, 'urlopen', pages):
            code = run_probe.main()
        report = json.loads((root/'result-runtime'/'host.json').read_text())
        assert report['cleanup']['complete'] and not report['cleanup']['remaining']
        assert code == (0 if mode == 'normal' else 1)
        if mode == 'normal':
            assert report['normalPageClosureConfirmed'] and report['complete']
        elif mode == 'service-failure':
            assert spawned == ['service'] and report['failure']['type'] == 'ResourceRefusal'
        elif mode == 'timeout':
            assert report['failure']['type'] == 'TimeoutError'
        else:
            assert report['probeExit'] == 6 and not report['complete']
        print(json.dumps({'mode': mode, 'code': code, 'spawned': spawned,
                          'cleanupComplete': True}))


class ManagedRuntimeTests(unittest.TestCase):
    def test_actual_runner_control_flow_with_lightweight_owned_children(self):
        for mode in ('normal', 'service-failure', 'node-failure', 'timeout'):
            with self.subTest(mode=mode):
                result = subprocess.run([sys.executable, __file__, '--runner-worker', mode],
                                        capture_output=True, text=True, timeout=5)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertTrue(json.loads(result.stdout)['cleanupComplete'])
    def test_owned_exit_paths_reap_descendants_without_touching_external_child(self):
        unrelated = subprocess.Popen([sys.executable, '-c', 'import time;time.sleep(30)'])
        try:
            for mode in ('normal', 'startup-failure', 'orphan', 'escaped-orphan', 'timeout', 'exception'):
                with self.subTest(mode=mode):
                    result = subprocess.run([sys.executable, __file__, '--worker', mode],
                                            capture_output=True, text=True, timeout=6)
                    self.assertEqual(result.returncode, 0, result.stderr)
                    report = json.loads(result.stdout)
                    self.assertTrue(report['complete'])
                    self.assertTrue(report['reaped'])
                    self.assertIsNone(unrelated.poll())
        finally:
            unrelated.terminate()
            unrelated.wait(timeout=3)

    def test_registration_failure_reaps_direct_child_and_fails_closed(self):
        script = '''
import json,subprocess,sys
from unittest.mock import patch
import owned_runtime as R
R.enable_subreaper(); owned=R.OwnedChildren()
p=subprocess.Popen([sys.executable,'-c','import time;time.sleep(30)'],start_new_session=True)
with patch.object(R,'process_records',lambda:{}):
 try:owned.add(p,'unverified')
 except R.ResourceRefusal:pass
 report=owned.close(.02,.2,.2)
assert p.returncode is not None and not report['complete'] and report['ownershipFailures']
print(json.dumps(report))
'''
        result = subprocess.run([sys.executable, '-c', script], cwd=D,
                                capture_output=True, text=True, timeout=3)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse(json.loads(result.stdout)['complete'])

    def test_lock_refuses_overlap_and_releases(self):
        with tempfile.TemporaryDirectory() as t:
            path = Path(t)/'lock'
            with ExclusiveRun(path):
                script = 'from owned_runtime import ExclusiveRun; import sys;\nwith ExclusiveRun(sys.argv[1]): pass'
                result = subprocess.run([sys.executable, '-c', script, str(path)],
                                        cwd=D, capture_output=True, text=True)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('another managed Qt test is active', result.stderr)
            with ExclusiveRun(path):
                pass

    def test_capacity_refuses_before_any_runtime_or_probe_is_created(self):
        with tempfile.TemporaryDirectory() as t:
            root = Path(t)
            source = root/'source'
            source.mkdir()
            for name in ('probe.cjs', 'qt-service-visible.py'):
                (source/name).write_text('raise Exception("must not execute")')
            out = root/'output'
            result = subprocess.run([sys.executable, str(D/'run_probe.py'), str(source),
                                     str(out), '--minimum-free', str(2**63-1),
                                     '--lock', str(root/'lock')], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('insufficient capacity before generation', result.stderr)
            self.assertFalse(out.exists())
            self.assertFalse(out.with_name(out.name+'-runtime').exists())
            self.assertGreaterEqual(require_space(root, 0)['availableBytes'], 0)

    def test_service_normal_destroy_on_shutdown_and_eof(self):
        fake = '''
import threading
ended=threading.Event()
class Event:
 def __init__(self):self.callbacks=[]
 def __iadd__(self,fn):self.callbacks.append(fn);return self
 def fire(self):
  for fn in self.callbacks:fn()
class Window:
 def __init__(self):
  self.events=type('Events',(),{'closed':Event()})()
 def destroy(self):self.events.closed.fire();ended.set()
def create_window(*args,**kwargs):return Window()
def start(fn,*args,**kwargs):fn();assert ended.wait(2)
'''
        with tempfile.TemporaryDirectory() as t:
            root = Path(t)
            (root/'webview.py').write_text(fake)
            source = root/'service.py'
            source.write_text("import webview\nwindows=[webview.create_window(str(i)) for i in range(3)]\nwebview.start(lambda:None)\n")
            env = os.environ.copy()
            env['PYTHONPATH'] = str(root)
            for control in ('shutdown\n', ''):
                report = root/('pages-shutdown.json' if control else 'pages-eof.json')
                result = subprocess.run([sys.executable, str(D/'qt_service.py'),
                                         '--source-service', str(source), '--resource-report',
                                         str(report)], input=control, env=env, capture_output=True,
                                        text=True, timeout=4)
                self.assertEqual(result.returncode, 0, result.stderr)
                value = json.loads(report.read_text())
                self.assertEqual(value['created'], 3)
                self.assertEqual(sorted(value['closed']), [0, 1, 2])
                self.assertTrue(value['serviceReturned'])
                self.assertFalse(value['errors'])


if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == '--worker':
        worker(sys.argv[2])
    elif len(sys.argv) == 3 and sys.argv[1] == '--runner-worker':
        runner_worker(sys.argv[2])
    else:
        unittest.main()
