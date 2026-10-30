from pathlib import Path
import sys,subprocess,shutil,json,hashlib
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();U=Path(__file__).resolve().parent
subprocess.run([sys.executable,str(U.parent/'ui-input83az/build.py'),str(R),str(D)],check=True)
shutil.copy2(U/'browser.js',D/'new-browser.js');shutil.copy2(U/'evaluate83ba.js',D/'new-evaluate83ba.js')
p=(D/'probe.cjs').read_text().replace("'new-observer','new-browser'","'new-observer','new-evaluate83ba','new-browser'").replace('for(const width of [640,480])','for(const width of [640])')
a="const proof=store('proof-'+width";i=p.index(a);p=p[:i]+"const diagnosis=store('diagnosis-'+width,await call(page,'diagnoseBurstUI83ba'));valid(diagnosis);"+p[i:]
(D/'probe.cjs').write_text(p);pins=json.loads((D/'pins.json').read_text());paths={Path(x['path'])for x in pins}|{p for p in U.iterdir()if p.is_file()}|{D/'new-evaluate83ba.js'}
(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(paths)],indent=2)+'\n')
