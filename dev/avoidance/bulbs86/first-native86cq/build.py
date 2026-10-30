from pathlib import Path
import sys,subprocess,json,hashlib
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();mode=sys.argv[3];variant=sys.argv[4]if len(sys.argv)>4 else'success';assert mode in ['old','new']and variant in ['success','failure'];U=Path(__file__).resolve().parent
subprocess.run([sys.executable,str(U.parent/'product-ui86ci/build-test.py'),str(R),str(D)],check=True)
def rep(s,a,b):
 assert s.count(a)==1,(a[:180],s.count(a));return s.replace(a,b)
mapping=[('11zz03_bulbs_frame_data80.js','frame-data86cq.js'),('11zz06d_bulbs_generator86.js','compiler86cq.js'),('11zz07_bulbs_owner80.js','owner86cq.js'),('11zz10_bulbs_adapter80.js','adapter86cq.js')];s=(D/'candidate-ja.html').read_text()
if mode=='new':
 for old,new in mapping:s=rep(s,(R/'src'/old).read_text(),(U/new).read_text())
owner=(U/'owner86cq.js').read_text()if mode=='new'else(R/'src/11zz07_bulbs_owner80.js').read_text();changed=rep(owner,'resident.set(r.key,entry);residentBytes+=entry.bytes;', 'window.observeBulbsModel86cq?.(entry.model);resident.set(r.key,entry);residentBytes+=entry.bytes;');changed=rep(changed,'r.handle=handle;r.cached=null;counts.reuses++;','window.observeBulbsModel86cq?.(entry.model);r.handle=handle;r.cached=null;counts.reuses++;');s=rep(s,owner,changed)
compiler=(U/'compiler86cq.js').read_text()if mode=='new'else(R/'src/11zz06d_bulbs_generator86.js').read_text();s=rep(s,compiler,rep(compiler,'for(const recipe of recipes){activeHeld=', 'for(const recipe of recipes){window.recipeOwners86cq++;activeHeld='))
adapter=(U/'adapter86cq.js').read_text()if mode=='new'else(R/'src/11zz10_bulbs_adapter80.js').read_text();s=rep(s,adapter,rep(adapter,'uiFormal86bx=f;', 'uiFormal86bx=f;window.observeBulbsFormal86cq?.(f);'))
controller=(R/'src/11zz09_bulbs_controller80.js').read_text();a=controller.index('function* directRecordIterator86br(');z=controller.index('// Genuine opaque record job.',a);part=controller[a:z].replace('return{record,ownerReservation}', 'window.observeBulbsProof86cq?.(record);return{record,ownerReservation}');s=rep(s,controller,controller[:a]+part+controller[z:])
(D/'candidate-ja.html').write_text(s);browser=(U/'browser-test.js').read_text();(D/'browser-test.js').write_text(browser);(D/'mode.json').write_text(json.dumps({'mode':mode,'variant':variant})+'\n');p=(D/'probe.cjs').read_text();p=rep(p,"await call(page,'productUI86ci')","await call(page,'firstNative86cq',"+json.dumps({'mode':mode,'variant':variant})+")");(D/'probe.cjs').write_text(p)
paths={Path(p['path'])for p in json.loads((D/'pins.json').read_text())}|{p for p in U.iterdir()if p.is_file()}|{p for p in D.iterdir()if p.is_file()and p.name!='pins.json'};(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(paths)],indent=2)+'\n');print(json.dumps({'producer':True,'mode':mode,'variant':variant,'pins':len(paths)}))
