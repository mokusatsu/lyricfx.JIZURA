from pathlib import Path
import sys,subprocess,shutil,json,hashlib
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();U=Path(__file__).resolve().parent
subprocess.run([sys.executable,str(U.parent/'ae-output86cj/build-test.py'),str(R),str(D)],check=True)
shutil.copy2(U/'browser-test.js',D/'browser-test.js');p=(D/'probe.cjs').read_text().replace("'aeOutput86cj'","'routingUI86cm'").replace('ae-output-ja','routing-ui-ja').replace('ae-output-en','routing-ui-en').replace('Real JA/EN product render output rejection and mocked CEP; no output media or real AE writes','Actual mixed preserved routing and eager screenshot preflight; no media or complete proof')
(D/'probe.cjs').write_text(p);pins=json.loads((D/'pins.json').read_text());paths={Path(x['path'])for x in pins}|{p for p in U.iterdir()if p.is_file()}
(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(paths)],indent=2)+'\n')
