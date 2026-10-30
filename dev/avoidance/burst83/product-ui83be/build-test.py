from pathlib import Path
import sys,subprocess,shutil,json,hashlib
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();U=Path(__file__).resolve().parent
subprocess.run([sys.executable,str(R/'dev/avoidance/bulbs86/product-ui86ci/build-test.py'),str(R),str(D)],check=True)
shutil.copy2(U/'mixed-suffix-test.js',D/'browser-test.js')
p=D/'probe.cjs';s=p.read_text().replace("'productUI86ci'","'productUI83be'").replace('errors:result.errors,postPinsUnchanged','errors:result.errors.map(e=>({code:e.code,message:e.message?.slice(0,240)})),postPinsUnchanged');p.write_text(s)
p=D/'candidate-ja.html';s=p.read_text();marker='/* ============================================================\n   JIZURA — editor UI';assert s.count(marker)==1;prelude="/* TEST83BE startup stays center until the gate configures the real UI. */\n(()=>{const p=J.defaultProject();p.lang='ja';p.title='';p.lyrics='[00:00]待機';p.overrides={0:{layout:'center',single:true}};localStorage.setItem('jizura.project.v1',JSON.stringify(p))})();\n";s=s.replace(marker,prelude+marker)
needle='return renderer.frame(ctx,formal,t,{...opt,scale:viewport.scale})';assert s.count(needle)==1;s=s.replace(needle,'window.observeProductFormal83be?.(formal,unit.stats());'+needle);needle='viewport=null}';assert s.count(needle)==1;s=s.replace(needle,'viewport=null;window.observeProductCancel83be?.(unit?.stats()||null)}');p.write_text(s)
pins=json.loads((D/'pins.json').read_text());paths={Path(p['path'])for p in pins}|{p for p in U.rglob('*')if p.is_file()}|{R/'src/11zz12_burst_core83.js'};(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(paths)],indent=2)+'\n')
