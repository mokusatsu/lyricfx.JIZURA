from pathlib import Path
import sys,subprocess,json,hashlib,shutil
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();mode=sys.argv[3];residual=len(sys.argv)>4 and sys.argv[4]=='residual';assert mode in ['old','new'];U=Path(__file__).resolve().parent
subprocess.run([sys.executable,str(U.parent/'product-ui86ci/build-test.py'),str(R),str(D)],check=True)
s=(D/'candidate-ja.html').read_text()
mapping=[('11zz07_bulbs_owner80.js','owner86co.js'),('11zz09_bulbs_controller80.js','controller86co.js'),('11zz10_bulbs_adapter80.js','adapter86co.js'),('11zz11_bulbs_session86.js','session86co.js'),('12_ui.js','ui86co.js')]
def rep(s,a,b):
 assert s.count(a)==1,(a[:160],s.count(a));return s.replace(a,b)
if mode=='new':
 for old,new in mapping:s=rep(s,(R/'src'/old).read_text(),(U/new).read_text())
# Source-local observers capture numeric coverage and genuine private authority;
# no prototype/function replacement or raw payload admission.
owner=(U/'owner86co.js').read_text()if mode=='new'else(R/'src/11zz07_bulbs_owner80.js').read_text()
changed=rep(owner,'resident.set(r.key,entry);residentBytes+=entry.bytes;', 'window.observeBulbsModel86co?.(entry.model);resident.set(r.key,entry);residentBytes+=entry.bytes;')
if mode=='new':changed=rep(changed,'r.handle=handle;r.cached=null;counts.reuses++;','window.observeBulbsModel86co?.(entry.model);r.handle=handle;r.cached=null;counts.reuses++;')
s=rep(s,owner,changed)
adapter=(U/'adapter86co.js').read_text()if mode=='new'else(R/'src/11zz10_bulbs_adapter80.js').read_text()
s=rep(s,adapter,rep(adapter,'uiFormal86bx=f;', 'uiFormal86bx=f;window.observeBulbsFormal86co?.(f);'))
geometry=(R/'src/11zz08a_bulbs_geometry86.js').read_text()
changed=rep(geometry,'function evaluation(supports,c,delta,viewport){validViewport(viewport);validSupports(supports);validCircle(c);', 'function evaluation(supports,c,delta,viewport){if(window.bulbsEvaluation86co){window.bulbsEvaluation86co.calls++;window.bulbsEvaluation86co.supports+=supports.length}validViewport(viewport);validSupports(supports);validCircle(c);')
s=rep(s,geometry,changed)
controller=(U/'controller86co.js').read_text()if mode=='new'else(R/'src/11zz09_bulbs_controller80.js').read_text();a=controller.index('function* directRecordIterator86br(');z=controller.index('// Genuine opaque record job.',a);part=controller[a:z];assert part.count('return{record,ownerReservation}')==(2 if mode=='new'else 1);part=part.replace('return{record,ownerReservation}','window.observeBulbsProof86co?.(record);return{record,ownerReservation}');s=rep(s,controller,controller[:a]+part+controller[z:])
(D/'candidate-ja.html').write_text(s)
browser=(U/'browser-test.js').read_text()
if residual:
 browser=browser[:browser.index("try{set(project('center'))")]+(U/'residual-body.js').read_text()
 browser=rep(browser,'let model=null,formal=null;', 'let model=null,formal=null,proof=null;')
 browser=rep(browser,'window.observeBulbsFormal86co=p=>formal=p;', 'window.observeBulbsFormal86co=p=>formal=p;window.observeBulbsProof86co=p=>proof=p;')
 browser=rep(browser,'const hash=await sha(new TextEncoder().encode(JSON.stringify(C.exact(model))));', "const semantic={...model};delete semantic.timing;delete semantic.budget;const hash=await sha(new TextEncoder().encode(JSON.stringify(C.exact(semantic))));")
 browser=rep(browser,'modelBytes:C.serializedBytes(model),', "modelBytes:C.serializedBytes(model),counts:model.counts,proof:{groups:proof.groups,scalarContributions:proof.groups.reduce((n,g)=>n+g.scalarContributions,0),referenceCount:proof.referenceIndex.size},")
 browser=rep(browser,"change();need(!state().ready&&clear(),'OLD_BITMAP_VISIBLE');if(old)", "change();const parkedStats=stats();need(!state().ready&&clear(),'OLD_BITMAP_VISIBLE');if(old)")
 browser=rep(browser,'stats:stats(),compiles:', 'stats:stats(),parkedStats,compiles:')
(D/'browser-test.js').write_text(browser);(D/'mode.json').write_text(json.dumps({'mode':mode,'residual':residual})+'\n')
p=(D/'probe.cjs').read_text();p=rep(p,"await call(page,'productUI86ci')","await call(page,'previousBulbs86co',"+json.dumps({'mode':mode})+")");(D/'probe.cjs').write_text(p)
pins=json.loads((D/'pins.json').read_text());paths={Path(p['path'])for p in pins}|{p for p in U.iterdir()if p.is_file()}|{p for p in D.iterdir()if p.is_file()and p.name!='pins.json'}
(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(paths)],indent=2)+'\n');print(json.dumps({'producer':True,'mode':mode,'pins':len(paths),'source':str(D)}))
