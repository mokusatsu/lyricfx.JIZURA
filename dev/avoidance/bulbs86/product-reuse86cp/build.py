from pathlib import Path
import sys,subprocess,json,hashlib
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();variant=sys.argv[3]if len(sys.argv)>3 else'main';assert variant in ['main','boundaries','routing','remaining'];U=Path(__file__).resolve().parent;Q=U.parent/'previous-model86co'
subprocess.run([sys.executable,str(Q/'build.py'),str(R),str(D),'new','residual'],check=True)
def rep(s,a,b):
 assert s.count(a)==1,(a[:160],s.count(a));return s.replace(a,b)
browser=(D/'browser-test.js').read_text();browser=browser[:browser.index("try{set(project('center'))")]
browser=rep(browser,'window.previousBulbs86co=', 'window.productReuse86cp=')
effect=(R/'dev/avoidance/domino82/product-reuse82ar/product-test.js').read_text();a=effect.index('function project(');z=effect.index('\nfunction set(',a);browser+=effect[a:z].replace('function project(','function effectProject(',1)+'\n'
if variant=='routing':browser=(U.parent/'routing-ui86cm/browser-test.js').read_text()+'\nwindow.productReuse86cp=window.routingUI86cm;\n'
elif variant=='remaining':
 main=(U/'main-body.js').read_text();tail=main[main.index('record.outputs=[];'):];tail=rep(tail,'}return record', '}record.mixed=await window.routingUI86cm();return record');browser=(U.parent/'routing-ui86cm/browser-test.js').read_text()+'\n'+browser+"try{set(project('center'));await J.uiApi.ensureFonts();await document.fonts.ready;await raf();await run('ready-for-remaining',()=>set(project()));\n"+tail
else:browser+=(U/(variant+'-body.js')).read_text()
(D/'browser-test.js').write_text(browser)
p=(D/'probe.cjs').read_text();p=rep(p,"await call(page,'previousBulbs86co'","await call(page,'productReuse86cp'");p=rep(p,"stage:'Bulbs dedicated canonical preview one frame and stale sentinel; no ordinary UI qualification'", "stage:'Actual product bulbs warm reuse86cp; normal cold/warm/fallback/invalidation and bounded regressions; no media'");(D/'probe.cjs').write_text(p)
(D/'variant.json').write_text(json.dumps({'variant':variant})+'\n')
pins=json.loads((D/'pins.json').read_text());paths={Path(p['path'])for p in pins}|{p for p in U.iterdir()if p.is_file()}|{p for p in D.iterdir()if p.is_file()and p.name!='pins.json'}
if variant in ['routing','remaining']:paths.add(U.parent/'routing-ui86cm/browser-test.js')
(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(paths)],indent=2)+'\n');print(json.dumps({'producer':True,'variant':variant,'pins':len(paths)}))
