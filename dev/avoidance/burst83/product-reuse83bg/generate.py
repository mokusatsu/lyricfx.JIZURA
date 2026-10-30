"""Apply the reviewed four burst fragments and its font entry; no shared engine changes."""
from pathlib import Path
import sys,json,hashlib
R=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;Q=U.parent/'previous-model83bf';markers=json.loads((Q/'module-markers.json').read_text());core=(R/'src/11zz12_burst_core83.js').read_text();names=['owner83bf.js','handoff83bf.js','runtime83bf.js','session83bf.js']
assert hashlib.sha256(core.encode()).hexdigest()=='5d4066030a8841e5ba548b8c71e33b5bd81c489bf974a29cfe7a629589d3a462'or all(core[core.index(markers[i]):core.index(markers[i+1])]==(Q/n).read_text()for i,n in enumerate(names))
ui=(R/'src/12_ui.js').read_bytes();assert ui==(Q/'ui83bf.js').read_bytes()or hashlib.sha256(ui).hexdigest()=='84d58e103a497f1fb748ae31d06ed6d02a37762a88d590ff90991fd0431869c4'
for i,name in enumerate(names):
 a=core.index(markers[i]);z=core.index(markers[i+1]);core=core[:a]+(Q/name).read_text()+core[z:]
(R/'src/11zz12_burst_core83.js').write_text(core);(R/'src/12_ui.js').write_bytes((Q/'ui83bf.js').read_bytes());(U/'module-map.json').write_text(json.dumps(names,indent=2)+'\n')
