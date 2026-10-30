from pathlib import Path
import sys,subprocess,json,hashlib
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();mode=sys.argv[3];variant=sys.argv[4];assert mode in ['old','new']and variant in ['success','failure'];U=Path(__file__).resolve().parent
subprocess.run([sys.executable,str(U.parent/'product-ui86ci/build-test.py'),str(R),str(D)],check=True)
def rep(s,a,b):
 assert s.count(a)==1,(a[:150],s.count(a));return s.replace(a,b)
s=(D/'candidate-ja.html').read_text();original=(R/'src/11zz06d_bulbs_generator86.js').read_text();compiler=(U/'compiler86cr.js').read_text()if mode=='new'else original
# Identical measurement-only local counters, no prototype replacement.
compiler=rep(compiler,'function byteLength(x', 'let codecNodes86cr=0,codecTop86cr=0,codecOutputBytes86cr=0,codecHits86cr=0,codecBypassed86cr=0;const budgetSamples86cr=[];window.codecStats86cr=()=>({nodes:codecNodes86cr,topCalls:codecTop86cr,requestedBytes:codecOutputBytes86cr,cacheHits:codecHits86cr,bypassedBytes:codecBypassed86cr,budgetSamples:budgetSamples86cr});function byteLength(x')
compiler=rep(compiler,'function byteLength(x,scalar=null){'if mode=='new'else'function byteLength(x){', ('function byteLength(x,scalar=null){'if mode=='new'else'function byteLength(x){')+'codecNodes86cr++;')
a='try{return byteLength(x,scalarSizes)}'if mode=='new'else'try{return byteLength(x)}';compiler=rep(compiler,a,'try{codecTop86cr++;const n='+('byteLength(x,scalarSizes)'if mode=='new'else'byteLength(x)')+';codecOutputBytes86cr+=n;return n}')
if mode=='new':
 compiler=rep(compiler,'if(x===scalar.native)return scalar.nativeBytes;', 'if(x===scalar.native){codecHits86cr++;codecBypassed86cr+=scalar.nativeBytes;return scalar.nativeBytes;}')
 compiler=rep(compiler,'if(x===scalar.current)return scalar.currentBytes;', 'if(x===scalar.current){codecHits86cr++;codecBypassed86cr+=scalar.currentBytes;return scalar.currentBytes;}')
compiler=rep(compiler,'const retained=retainedBytes(),bytes=retained+transient;', 'const retained=retainedBytes(),bytes=retained+transient;budgetSamples86cr.push([retained,transient]);')
compiler=rep(compiler,'for(const recipe of recipes){', 'for(const recipe of recipes){window.recipeOwners86cr++;')
s=rep(s,original,compiler)
owner=(R/'src/11zz07_bulbs_owner80.js').read_text();s=rep(s,owner,rep(owner,'resident.set(r.key,entry);residentBytes+=entry.bytes;', 'window.observeBulbsModel86cr?.(entry.model);resident.set(r.key,entry);residentBytes+=entry.bytes;'))
adapter=(R/'src/11zz10_bulbs_adapter80.js').read_text();s=rep(s,adapter,rep(adapter,'uiFormal86bx=f;', 'uiFormal86bx=f;window.observeBulbsFormal86cr?.(f);'))
controller=(R/'src/11zz09_bulbs_controller80.js').read_text();a=controller.index('function* directRecordIterator86br(');z=controller.index('// Genuine opaque record job.',a);part=controller[a:z].replace('return{record,ownerReservation}', 'window.observeBulbsProof86cr?.(record);return{record,ownerReservation}');s=rep(s,controller,controller[:a]+part+controller[z:])
(D/'candidate-ja.html').write_text(s);(D/'browser-test.js').write_text((U/'browser-test.js').read_text());p=(D/'probe.cjs').read_text();p=rep(p,"await call(page,'productUI86ci')","await call(page,'firstNative86cr',"+json.dumps({'mode':mode,'variant':variant})+")");(D/'probe.cjs').write_text(p)
paths={Path(p['path'])for p in json.loads((D/'pins.json').read_text())}|{p for p in U.iterdir()if p.is_file()}|{p for p in D.iterdir()if p.is_file()and p.name!='pins.json'};(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(paths)],indent=2)+'\n');print(json.dumps({'producer':True,'mode':mode,'variant':variant,'pins':len(paths)}))
