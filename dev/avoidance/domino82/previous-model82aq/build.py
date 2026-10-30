from pathlib import Path
import sys,subprocess,shutil,json,hashlib
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();mode=sys.argv[3];residual=len(sys.argv)>4 and sys.argv[4]=='residual';inputFont=len(sys.argv)>4 and sys.argv[4]=='input-font';assert mode in ['old','new'];U=Path(__file__).resolve().parent;P=R/'dev/avoidance/domino82/product-ui82ao'
subprocess.run([sys.executable,str(P/'build-product-test.py'),str(R),str(D)],check=True)
s=(D/'candidate-ja.html').read_text()
mapping=[('ui-projection82ak/model82ak.js','model82aq.js'),('product-ui82ao/owner82ao.js','owner82aq.js'),('product-ui82ao/controller82ao.js','controller82aq.js'),('product-ui82ao/runtime82ao.js','runtime82aq.js'),('product-ui82ao/session82ao.js','session82aq.js')]
# Base builder instruments only runtime; restore that source before exact replacement.
runtime=(P/'runtime82ao.js').read_text();instrumented=runtime
for a,b in [('ctrl=A.dominoUIFrameController82ao.create({viewport,currentGeneration:()=>generation});','ctrl=A.dominoUIFrameController82ao.create({viewport,currentGeneration:()=>generation});window.observeDominoConstruct82ao?.();'),("A.registerLayoutsDAdapter('dominoes',api.adapter)","A.registerLayoutsDAdapter('dominoes',api.adapter);window.observeDominoRegister82ao?.()"),('return renderer.frame(ctx,formal,t,{...opt,scale:viewport.scale})','window.observeDominoFormal82ao?.(formal,ctrl.stats());return renderer.frame(ctx,formal,t,{...opt,scale:viewport.scale})'),('viewport=null}\n function stage(plan)','viewport=null;window.observeDominoCancel82ao?.(ctrl?.stats()||null)}\n function stage(plan)')]:assert instrumented.count(a)==1;instrumented=instrumented.replace(a,b)
assert s.count(instrumented)==1;s=s.replace(instrumented,runtime)
if mode=='new':
 for old,new in mapping:
  a=(R/'dev/avoidance/domino82'/old).read_text();b=(U/new).read_text();assert s.count(a)==1,old;s=s.replace(a,b)
if mode=='new':
 a=s.index('const dominoSession82ao=');z=s.index("$('dominoCancel')",a);fragment=s[a:z];begin=fragment.index(' waitFonts(');end=fragment.index('\n schedule:',begin);fragment=fragment[:begin]+(U/'font-wait-method.js').read_text().rstrip()+fragment[end:];s=s[:a]+(U/'font-phase.js').read_text()+fragment+s[z:]
# Test hooks are scoped to the selected owner/runtime, not shared prototypes.
owner=(U/'owner82aq.js').read_text()if mode=='new'else(P/'owner82ao.js').read_text();modified=owner
for a,b in [('nativeResult=S.sample(env,{reservedBytes:reserved});','window.nativeSamples82aq++;nativeResult=S.sample(env,{reservedBytes:reserved});'),('shiftResult=D.sample(env,','window.shiftedSamples82aq++;shiftResult=D.sample(env,'),('const model=j.ready,clock=j.clock,plan=j.plan,','window.observeDominoModel82aq?.(j.ready,j.clock);const model=j.ready,clock=j.clock,plan=j.plan,')]:assert modified.count(a)==1,a;modified=modified.replace(a,b)
assert s.count(owner)==1;s=s.replace(owner,modified)
needle='sample=S.sample(env,{reservedBytes:reservation});';assert s.count(needle)==1;s=s.replace(needle,'window.nativeSamples82aq++;'+needle)
runtime=(U/'runtime82aq.js').read_text()if mode=='new'else runtime;modified=runtime;needle='return renderer.frame(ctx,formal,t,{...opt,scale:viewport.scale})';assert modified.count(needle)==1;modified=modified.replace(needle,'window.observeDominoFormal82ao?.(formal,ctrl.stats());'+needle);assert s.count(runtime)==1;s=s.replace(runtime,modified)
(D/'candidate-ja.html').write_text(s);shutil.copy2(U/('input-font-test.js'if inputFont else'residual-test.js'if residual else'browser-test.js'),D/'browser-test.js');(D/'mode.json').write_text(json.dumps({'mode':mode})+'\n');p=(D/'probe.cjs').read_text();needle="await call(page,'productUI82ao')";assert p.count(needle)==1;p=p.replace(needle,"await call(page,'previousModel82aq',"+json.dumps({'mode':mode})+")");(D/'probe.cjs').write_text(p)
pins=json.loads((D/'pins.json').read_text());paths={Path(p['path'])for p in pins}|{p for p in U.iterdir()if p.is_file()}|{p for p in D.iterdir()if p.is_file()and p.name!='pins.json'};(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(paths)],indent=2)+'\n')
