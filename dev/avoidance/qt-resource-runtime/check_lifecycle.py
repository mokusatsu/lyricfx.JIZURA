"""Audit the saved tiny lifecycle run. No Qt/browser/process is started."""
import hashlib
import json
from pathlib import Path
import sys

out = Path(sys.argv[1]).resolve()
runtime = out.with_name(out.name+'-runtime')
host = json.loads((runtime/'host.json').read_text())
probe = json.loads((out/'result.json').read_text())
startup = json.loads((runtime/'startup.json').read_text())
assert host['complete'] and host['probeExit'] == 0
assert host['normalPageShutdownRequested'] and host['normalPageClosureConfirmed']
assert probe['complete'] and probe['pages'] == 3 and startup['createdPages'] == 3
pages = host['pages']
assert pages['created'] == 3 and sorted(pages['closed']) == [0, 1, 2]
assert pages['serviceReturned'] and not pages['errors']
cleanup = host['cleanup']
assert cleanup['complete'] and not cleanup['remaining'] and not cleanup['signals']
assert not cleanup['ownershipFailures'] and not cleanup['signalFailures']
assert all(x['exit'] == 0 for x in cleanup['roots'].values())
assert cleanup['reaped'] and all(x['exit'] == 0 for x in cleanup['reaped'])
assert host['debugPortClosed']
space = host['capacityBeforeGeneration']
assert space['minimumFreeBytes'] >= 1024**3
assert space['availableBytes'] >= space['minimumFreeBytes'] + space['expectedBytes']
assert len(host['runtimeSources']) == 5
for pin in host['runtimeSources']:
    data = Path(pin['path']).read_bytes()
    assert len(data) == pin['bytes'] and hashlib.sha256(data).hexdigest() == pin['sha256']
print(json.dumps({'normalClosedPages': 3, 'rootExits': {k: v['exit'] for k, v in cleanup['roots'].items()},
                  'waitReaped': len(cleanup['reaped']), 'forcedSignals': 0, 'portClosed': True,
                  'scope': 'saved one-run protected Qt lifecycle only; not product/media/render or host-disconnection acceptance'}))
