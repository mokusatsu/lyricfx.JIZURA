from pathlib import Path
import sys,json,hashlib,shutil
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();S=Path('/workspace/jizura-logic-evidence-20261027/bulbs-variable-ui-source86cc01');U=Path(__file__).resolve().parent;D.mkdir(exist_ok=False)
for n in ['qt-service-visible.py','browser.js','product-browser.js','geometry86.js','gate-browser.js','spec.json']:shutil.copy2(S/n,D/n)
h=(S/'candidate-ja.html').read_text();a="Object.defineProperty(A,'bulbsUIRuntime86bx'";assert h.count(a)==1;h=h.replace(a,(U/'test-seam.js').read_text()+'\n'+a);(D/'candidate-ja.html').write_text(h)
for n in ['oracle.js','browser.js']:shutil.copy2(U/n,D/('test-'+n))
p=(S/'probe.cjs').read_text();a=p.index('for(const test of ');z=p.index('}catch(e){result.errors.push',a)
p=p[:a]+(U/'probe-body.cjs').read_text()+'\n'+p[z:];p=p.replace('128*1024**2','256*1024**2').replace('32*1024**2','64*1024**2').replace('Bulbs dedicated canonical preview one frame and stale sentinel; no ordinary UI qualification','Fresh source Canvas paint oracle at all reachable first/last preimage endpoints; conditional support, no continuous-time/RGBA theorem');(D/'probe.cjs').write_text(p)
paths=[x for x in D.iterdir()if x.is_file()]+[x for x in U.iterdir()if x.is_file()]+list((R/'dev/avoidance/qt-resource-runtime').glob('*.py'))+[R/'dev/avoidance/bulbs80/product80y/fixture.js',R/'dev/avoidance/layouts-c-editorial-fonts/manifest.json']
(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(set(paths))],indent=2)+'\n');print(D)
