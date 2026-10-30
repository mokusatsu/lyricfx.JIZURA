"""Freeze a new boundary-only UI probe; never alters old actual/source directories."""
from pathlib import Path
import sys,subprocess,json,hashlib,shutil
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();U=Path(__file__).resolve().parent
subprocess.run([sys.executable,str(U/'build-test.py'),str(R),str(D)],check=True)
shutil.copy2(U/'boundary-browser.js',D/'boundary-browser.js')
p=(D/'probe.cjs').read_text();p=p.replace("['/candidate-ja.html',fs.readFileSync(D+'/candidate-ja.html')]","['/candidate-ja.html',fs.readFileSync(D+'/candidate-ja.html')],['/candidate-en.html',fs.readFileSync(D+'/candidate-en.html')]")
p=p.replace("D+'/browser-test.js']","D+'/browser-test.js',D+'/boundary-browser.js']")
p=p.replace("const actual=store('product-ui',await call(page,'productUI86ci'));valid(actual);result.summary=actual;", "const actual=store('boundary-ja',await call(page,'productUIBoundary86ci'));valid(actual);result.summary={ja:actual};await page.goto(origin+'/candidate-en.html');await page.waitForFunction(()=>window.J?.ui?.plan);for(const file of[R+'/dev/avoidance/bulbs80/product80y/fixture.js',D+'/browser.js',D+'/product-browser.js',D+'/boundary-browser.js'])await page.addScriptTag({content:fs.readFileSync(file,'utf8')});const enInit=store('en-init',await call(page,'initProduct80y',{fonts}));valid(enInit);const en=store('boundary-en',await call(page,'productUIBoundary86ci'));valid(en);result.summary.en=en;")
p=p.replace("stage:'Bulbs dedicated canonical preview one frame and stale sentinel; no ordinary UI qualification'","stage:'Real product JA/EN boundary-only missing matrix; no media'")
(D/'probe.cjs').write_text(p)
pins=json.loads((D/'pins.json').read_text());paths={Path(x['path']) for x in pins}|{U/'boundary-browser.js',U/'boundary-build.py',D/'boundary-browser.js'}
(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(paths)],indent=2)+'\n')
