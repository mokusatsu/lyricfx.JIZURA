"""Apply only the five reviewed86co modules. Existing renderer/output/routing stay intact."""
from pathlib import Path
import json,sys,hashlib
R=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;Q=U.parent/'previous-model86co'
mapping=[('11zz07_bulbs_owner80.js','owner86co.js'),('11zz09_bulbs_controller80.js','controller86co.js'),('11zz10_bulbs_adapter80.js','adapter86co.js'),('11zz11_bulbs_session86.js','session86co.js'),('12_ui.js','ui86co.js')]
baseline={'11zz07_bulbs_owner80.js':'64b78ca61b564011ea67d7742a9c5f22079030503b439cfe436f7db0e04d8a12','11zz09_bulbs_controller80.js':'63aff57331fe203ea3952a0519bd1e989cd5755a6947b08ae7937a58db013f45','11zz10_bulbs_adapter80.js':'fd56fe2258f64c7aff7721aac634c976442317542582e1af0b3cc4c698297394','11zz11_bulbs_session86.js':'0eed97269d9cfe0acc50f967f8fbcbfcf7e3de74d57151ebd234f1fbef691187','12_ui.js':'5ebe499e221014081cf75030dbab4b1e9acfd875c1475a901e9b3c90d7556b79'}
for target,source in mapping:
 p=R/'src'/target;data=(Q/source).read_bytes();old=p.read_bytes()
 assert old==data or hashlib.sha256(old).hexdigest()==baseline[target],target
 p.write_bytes(data)
(U/'module-map.json').write_text(json.dumps(mapping,indent=2)+'\n')
