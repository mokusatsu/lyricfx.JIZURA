"""Execute the unchanged nine-suite functional gate and focused regressions."""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import shutil
import time

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent / os.environ.get('FILM_TICKET_GATE_OUTPUT', 'final-candidate')
REUSE_ADAPTIVE = os.environ.get('FILM_TICKET_REUSE_ADAPTIVE', '1') == '1'
OUT.mkdir(exist_ok=True)
(OUT / 'fixtures').mkdir(exist_ok=True)
SUMMARY = OUT / 'fixtures/functional-summary.json'
assert not SUMMARY.exists(), 'fresh gate required'

def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

names = ['layouts-a-adaptive-test', 'layouts-a-test', 'layouts-a-acceptance',
         'layouts-a-scales', 'layouts-a-contrast', 'basic-test',
         'basic-acceptance', 'stage-test', 'stack-test']
result = dict(schema=1, passed=False, failed=[], notRun=names.copy(),
              model='gpt-6.1-sol', reasoningEffort='medium',
              compiledSHA256=digest(ROOT / 'index.html'),
              compiledENSHA256=digest(ROOT / 'en/index.html'),
              fixtureSHA256=digest(ROOT / 'dev/avoidance/layouts-a-fixture.js'),
              sourceHashes={str(p.relative_to(ROOT)): digest(p)
                            for p in sorted((ROOT / 'src').glob('*.js'))}, tests=[],
              note='Source-matched core gate; publication and human review are separate. '
                   'Parity reference is fixed 8193. Known unrelated feature/save failures are not reclassified.')
env = dict(os.environ, JIZURA_BROWSER='/usr/bin/chromium',
           JIZURA_PARITY_REFERENCE=str(Path(__file__).resolve().parent / 'baseline'))
for name in names:
    log = OUT / 'fixtures' / (name + '.log')
    assert not log.exists(), 'fresh log required: ' + name
    script = ROOT / 'dev/avoidance' / (name + '.cjs')
    suite_env = dict(env, JIZURA_TEST_REPORT=str(OUT / (name + '-report.json')))
    if name == 'layouts-a-adaptive-test' and REUSE_ADAPTIVE:
        # Reuse this session's successful identical-source execution. Preserve
        # the measured raw-log lifetime and state its basis, rather than invent
        # a monotonic timer that was not started for the earlier command.
        previous = OUT.parent / 'adaptive.log'
        timing = json.loads(subprocess.check_output(['node', '-e',
            "const s=require('fs').statSync(process.argv[1]);"
            "console.log(JSON.stringify({start:s.birthtimeMs,end:s.mtimeMs}));",
            str(previous)], text=True))
        raw = json.loads(previous.read_text().strip().splitlines()[-1])
        assert raw['passed'] and raw['compiledSHA256'] == result['compiledSHA256']
        assert raw['compiledENSHA256'] == result['compiledENSHA256']
        assert raw['sourceHashes'] == result['sourceHashes']
        shutil.copyfile(previous, log)
        exit_code, seconds = 0, (timing['end']-timing['start'])/1000
    else:
        started = time.monotonic()
        with log.open('xb') as stream:
            done = subprocess.run(['node', str(script)], cwd=ROOT, env=suite_env,
                                  stdout=stream, stderr=subprocess.STDOUT)
        exit_code, seconds = done.returncode, time.monotonic()-started
    entry = dict(name=name, exitCode=exit_code, seconds=seconds,
                 scriptSHA256=digest(script), logSHA256=digest(log),
                 logPath='fixtures/' + log.name)
    if name == 'layouts-a-adaptive-test' and REUSE_ADAPTIVE and exit_code == 0:
        entry['reusedFrom'] = str(previous.relative_to(ROOT))
        entry['durationBasis'] = 'Wall-clock approximation from shell-redirection log creation to final stdout write; excludes process cleanup. Monotonic execution duration was not recorded.'
        entry['durationIsApproximate'] = True
        entry['executionEvidence'] = 'The recorded exec command used > tasks/evidence/AVOID-006/film-ticket-edges/adaptive.log 2>&1 before starting node.'
        entry['rawLogTiming'] = timing
        raw = json.loads(log.read_text().strip().splitlines()[-1])
        entry['counts'] = dict(anchors=sum(raw['anchors'].values()),
                               matrix=sum(raw['matrix'].values()),
                               controls=raw['controls'], explicitScales=raw['explicitScales'],
                               boundaries=raw['boundaries'], anchorFrames=raw['anchorFrames'],
                               motionCases=raw['motionCases'], motionFrames=raw['motionFrames'],
                               motionParity=len(raw['motionParity']))
    result['tests'].append(entry)
    result['notRun'].remove(name)
    if exit_code:
        result['failed'].append(name)
    SUMMARY.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(entry), flush=True)
result['passed'] = not result['failed'] and not result['notRun']
SUMMARY.write_text(json.dumps(result, indent=2) + '\n')
raise SystemExit(0 if result['passed'] else 1)
