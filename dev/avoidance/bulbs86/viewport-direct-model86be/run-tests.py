from pathlib import Path
import subprocess,sys,tempfile
root=Path(sys.argv[1]).resolve();d=root/'dev/avoidance/bulbs86/viewport-direct-model86be'
with tempfile.TemporaryDirectory()as t:
 out=Path(t);subprocess.run([sys.executable,str(d/'generate.py'),str(root),str(out)],check=True)
 for name in ['scalar-generator86.js','model-owner86.js']:
  assert(out/name).read_bytes()==(d/name).read_bytes();subprocess.run(['node','--check',str(out/name)],check=True)
 s=(root/'dev/avoidance/bulbs86/owner-accounting86o/handoff-test.cjs').read_text().replace('A.bulbsNativeGeometry80={};','A.bulbsViewportRoot86ae={makeEnv(){}};A.bulbsNativeGeometry80={};').replace("ctx={profile:'stock',","ctx={canvas:{width:720,height:405},profile:'stock',")
 s=s.replace("ok(prepare(p)===h&&compileCalls===0);", "reject(()=>prepare(p),'BULBS86BE_COOPERATIVE_ONLY');ok(compileCalls===0);")
 s+='''\nj=begin();ctx.canvas.width=721;reject(()=>j.step(),'BULBS86BE_VIEWPORT_CONTEXT');ctx.canvas.width=720;reject(()=>j.step(),'BULBS86C_DISPOSED');j=begin();ctx.canvas.height=406;reject(()=>j.step(),'BULBS86BE_VIEWPORT_CONTEXT');ctx.canvas.height=405;reject(()=>j.step(),'BULBS86C_DISPOSED');j=begin();const oldRoot=A.bulbsViewportRoot86ae;A.bulbsViewportRoot86ae={makeEnv(){}};reject(()=>j.step(),'BULBS86BE_ROOT_SOURCE');A.bulbsViewportRoot86ae=oldRoot;reject(()=>j.step(),'BULBS86C_DISPOSED');reject(()=>prepare(p),'BULBS86BE_COOPERATIVE_ONLY');console.log(JSON.stringify({checks,scope:'direct viewport owner mock lifecycle/dimensions/source; no Canvas'}));\n'''
 (out/'handoff-test.cjs').write_text(s);subprocess.run(['node',str(out/'handoff-test.cjs'),str(root/'src/11zz05_bulbs_renderer_time80.js')],check=True)
