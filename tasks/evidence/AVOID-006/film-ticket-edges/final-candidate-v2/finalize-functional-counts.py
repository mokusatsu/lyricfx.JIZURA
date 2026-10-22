"""Derive required adaptive counts from the successful raw execution log only."""
import datetime
import hashlib
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent
SUMMARY = OUT / 'fixtures/functional-summary.json'
RAW = OUT / 'fixtures/functional-summary-runner-raw.json'
assert not RAW.exists(), 'fresh receipt derivation required'
raw_bytes = SUMMARY.read_bytes()
receipt = json.loads(raw_bytes)
assert receipt['passed'] and not receipt['failed'] and not receipt['notRun']
assert len(receipt['tests']) == 9
log = OUT / 'fixtures/layouts-a-adaptive-test.log'
log_bytes = log.read_bytes()
actual = json.loads(log_bytes.decode().strip().splitlines()[-1])
assert actual['passed'] and actual['compiledSHA256'] == receipt['compiledSHA256']
assert actual['compiledENSHA256'] == receipt['compiledENSHA256']
assert actual['sourceHashes'] == receipt['sourceHashes']
entry = next(t for t in receipt['tests'] if t['name'] == 'layouts-a-adaptive-test')
assert entry['exitCode'] == 0 and entry['logSHA256'] == hashlib.sha256(log_bytes).hexdigest()
assert 'counts' not in entry
counts = dict(anchors=sum(actual['anchors'].values()), matrix=sum(actual['matrix'].values()),
              controls=actual['controls'], explicitScales=actual['explicitScales'],
              boundaries=actual['boundaries'], anchorFrames=actual['anchorFrames'],
              motionCases=actual['motionCases'], motionFrames=actual['motionFrames'],
              motionParity=len(actual['motionParity']))
assert all(isinstance(n, int) and n > 0 for n in counts.values())
RAW.write_bytes(raw_bytes)
entry['counts'] = counts
SUMMARY.write_text(json.dumps(receipt, indent=2) + '\n')
provenance = dict(created=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                  scriptSHA256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
                  rawRunnerReceiptSHA256=hashlib.sha256(raw_bytes).hexdigest(),
                  finalReceiptSHA256=hashlib.sha256(SUMMARY.read_bytes()).hexdigest(),
                  adaptiveRawLogSHA256=hashlib.sha256(log_bytes).hexdigest(), counts=counts,
                  durationChanged=False,
                  runnerArchive='run-functional-executed.py',
                  runnerArchiveSHA256=hashlib.sha256((OUT / 'run-functional-executed.py').read_bytes()).hexdigest(),
                  runnerArchiveBasis='Reconstructed by reversing the observed counts-only edit after launch; no pre-run runner hash was captured, and no tracked or prehashed copy was available. Core test script/source/log hashes and monotonic execution durations are actual execution records.')
(OUT / 'functional-counts-provenance.json').write_text(json.dumps(provenance, indent=2) + '\n')
print(json.dumps(provenance))
