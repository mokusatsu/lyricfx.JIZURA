from pathlib import Path
import sys,subprocess,shutil,json,hashlib
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();U=Path(__file__).resolve().parent
subprocess.run([sys.executable,str(U.parent/'product-ui86ci/build-test.py'),str(R),str(D)],check=True)
shutil.copy2(U/'browser-test.js',D/'browser-test.js');p=(D/'probe.cjs').read_text().replace("'productUI86ci'","'liveBoundaries86cn'").replace("stage:'Bulbs dedicated canonical preview one frame and stale sentinel; no ordinary UI qualification'","stage:'Real product coordinator three missing live boundaries; no media'");(D/'probe.cjs').write_text(p)
pins=json.loads((D/'pins.json').read_text());paths={Path(x['path'])for x in pins}|{p for p in U.iterdir()if p.is_file()}
(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(paths)],indent=2)+'\n')
