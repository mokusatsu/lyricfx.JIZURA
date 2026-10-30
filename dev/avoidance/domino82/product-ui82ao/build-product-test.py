from pathlib import Path
import sys,subprocess,shutil,json,hashlib
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();U=Path(__file__).resolve().parent
subprocess.run([sys.executable,str(R/'dev/avoidance/bulbs86/product-ui86ci/build-test.py'),str(R),str(D)],check=True)
shutil.copy2(U/'invalidation-test.js',D/'browser-test.js');s=(D/'probe.cjs').read_text().replace("'productUI86ci'","'productUI82ao'").replace('errors:result.errors,postPinsUnchanged','errors:result.errors.map(e=>({code:e.code,message:e.message?.slice(0,240)})),postPinsUnchanged');(D/'probe.cjs').write_text(s)
s=(D/'candidate-ja.html').read_text();marker='/* ============================================================\n   JIZURA — editor UI';assert s.count(marker)==1;s=s.replace(marker,"/* Test startup is center. */\n(()=>{const p=J.defaultProject();p.lang='ja';p.title='';p.lyrics='[00:00]待機';p.overrides={0:{layout:'center',single:true}};localStorage.setItem('jizura.project.v1',JSON.stringify(p))})();\n"+marker)
runtime=(U/'runtime82ao.js').read_text();assert s.count(runtime)==1;patched=runtime
for a,b in [('ctrl=A.dominoUIFrameController82ao.create({viewport,currentGeneration:()=>generation});','ctrl=A.dominoUIFrameController82ao.create({viewport,currentGeneration:()=>generation});window.observeDominoConstruct82ao?.();'),("A.registerLayoutsDAdapter('dominoes',api.adapter)","A.registerLayoutsDAdapter('dominoes',api.adapter);window.observeDominoRegister82ao?.()"),('return renderer.frame(ctx,formal,t,{...opt,scale:viewport.scale})','window.observeDominoFormal82ao?.(formal,ctrl.stats());return renderer.frame(ctx,formal,t,{...opt,scale:viewport.scale})'),('viewport=null}\n function stage(plan)','viewport=null;window.observeDominoCancel82ao?.(ctrl?.stats()||null)}\n function stage(plan)')]:
 assert patched.count(a)==1,a;patched=patched.replace(a,b)
s=s.replace(runtime,patched)
(D/'candidate-ja.html').write_text(s)
pins=json.loads((D/'pins.json').read_text());paths={Path(p['path'])for p in pins}|{p for p in U.iterdir()if p.is_file()}|{R/'src/11zz13_domino_core82.js'};(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(paths)],indent=2)+'\n')
