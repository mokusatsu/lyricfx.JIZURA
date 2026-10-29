from pathlib import Path
import shutil,subprocess,sys,tempfile
root=Path(sys.argv[1]).resolve();d=root/'dev/avoidance/bulbs86/viewport-direct-controller86bj'
with tempfile.TemporaryDirectory()as t:
 out=Path(t);subprocess.run([sys.executable,str(d/'generate.py'),str(root),str(out)],check=True)
 for name in ['model-owner86.js','controller86.js','adapter86.js']:
  assert(out/name).read_bytes()==(d/name).read_bytes();subprocess.run(['node','--check',str(out/name)],check=True)
 s=(root/'dev/avoidance/bulbs86/owner-accounting86o/handoff-test.cjs').read_text().replace('A.bulbsNativeGeometry80={};','A.bulbsViewportRoot86ae={makeEnv(){}};A.bulbsNativeGeometry80={};').replace("ctx={profile:'stock',","ctx={canvas:{width:720,height:405},profile:'stock',")
 s=s.replace("ok(prepare(p)===h&&compileCalls===0);", "reject(()=>prepare(p),'BULBS86BE_COOPERATIVE_ONLY');ok(compileCalls===0);")
 s=s.replace("kind:'test-only-generator-model',text:","kind:'test-only-generator-model',revision:'bulbs-current-viewport-scalar86be-v1',viewport:Object.freeze({scale:.75,width:720,height:405}),deviceDelta:Object.freeze([0,0]),text:")
 s+=(d/'owner-test-fragment.cjs').read_text();(out/'owner-test.cjs').write_text(s)
 subprocess.run(['node',str(out/'owner-test.cjs'),str(root/'src/11zz05_bulbs_renderer_time80.js')],check=True)
 reg=root/'dev/avoidance/bulbs86/viewport-controller86ax/controller-regression.cjs';shutil.copy2(reg,out/reg.name);subprocess.run(['node',str(out/reg.name),str(root)],check=True)
