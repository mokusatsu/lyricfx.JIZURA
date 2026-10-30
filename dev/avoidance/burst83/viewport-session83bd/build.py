from pathlib import Path
import sys,subprocess,shutil,json,hashlib
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();U=Path(__file__).resolve().parent;B=R/'dev/avoidance/burst83'
subprocess.run([sys.executable,str(B/'normal-options83bc/build.py'),str(R),str(D)],check=True)
for n in ['session83bd.js','runtime83bd.js','browser-test.js','private-controller83.js','prepared-handoff83.js','continuation-test.js']:shutil.copy2(U/n,D/n)
p=D/'prepared-handoff83.js';s=p.read_text();needle='const owner=createOwner({viewport}),guard=';assert s.count(needle)==1;p.write_text(s.replace(needle,'const owner=createOwner({viewport});window.inspectSessionOwner83bd?.(owner);const guard='))
p=D/'runtime83bd.js';s=p.read_text();needle='return renderer.frame(ctx,formal,t,';assert s.count(needle)==1;p.write_text(s.replace(needle,'window.beforeSessionDraw83bd?.(formal);return renderer.frame(ctx,formal,t,'))
p=D/'candidate-ja.html';s=p.read_text();needle='function drawPreviewFrame(ctx, {renderer=S.renderer,fast=false}={}) {';assert s.count(needle)==1;p.write_text(s.replace(needle,needle+"\n  if(window.burstPreviewBoundary83bd?.({ctx,plan:S.plan,t:S.t,renderer,fast}))return;"))
p=D/'probe.cjs';s=p.read_text().replace("'normal-browser83bc'","'normal-browser83bc','session83bd','runtime83bd','browser-test','continuation-test'").replace("'normalBurstOptions83bc'","'continueViewportSessionBurst83bd'");p.write_text(s)
p=D/'dependencies.json';m=json.loads(p.read_text());m['groups']['session-runtime83bd']=['J.placement.burstUISession83bd.create','J.placement.burstUIRuntime83bd.create'];p.write_text(json.dumps(m,indent=2)+'\n')
pins=json.loads((D/'pins.json').read_text());paths={Path(p['path'])for p in pins}|{p for p in U.iterdir()if p.is_file()}|{D/n for n in ['session83bd.js','runtime83bd.js','browser-test.js','private-controller83.js','prepared-handoff83.js']};(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(paths)],indent=2)+'\n')
