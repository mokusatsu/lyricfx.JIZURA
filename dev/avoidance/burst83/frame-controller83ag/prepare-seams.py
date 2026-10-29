from pathlib import Path
import tempfile,shutil,subprocess,sys,json,hashlib,difflib
D=Path(__file__).resolve().parent;R=Path(sys.argv[1])
with tempfile.TemporaryDirectory(prefix='burst83ag-seam-') as td:
 t=Path(td)
 for n in ['prepare-source.py','prepare-renderer.py']:shutil.copy2(R/'dev/avoidance/burst83/frame-seam83ad'/n,t/n)
 subprocess.run([sys.executable,str(t/'prepare-source.py'),str(R)],check=True);subprocess.run([sys.executable,str(t/'prepare-renderer.py'),str(R/'src/09_render.js')],check=True)
 src=(t/'11p_layoutsD-frame83.js').read_text();ren=(t/'09_render-frame83.js').read_text()
s=src;a=s.index("Object.defineProperty(J.placement,'installBurstSource83ad'");b=s.index('\n}});',a)+5;block=s[a:b];new=block.replace("Object.defineProperty(J.placement,'installBurstSource83ad',{configurable:true,value:()=>{","const installBurstSource83ag=()=>{")
assert new.endswith('\n}});');new=new[:-5]+"\n};\nObject.defineProperty(J.placement,'installBurstSource83ad',{configurable:true,value:installBurstSource83ag});\nObject.defineProperty(J.placement,'burstSourceInstallerIdentity83ag',{value:()=>installBurstSource83ag});\nObject.defineProperty(J.placement,'burstRenderIdentity83ag',{value:()=>nativeSources.get('burst')});";s=s[:a]+new+s[b:]
r=ren;a=r.index("Object.defineProperty(J,'installBurstFrame83ad'");b=r.index('\n}});',a)+5;block=r[a:b];new=block.replace("Object.defineProperty(J,'installBurstFrame83ad',{configurable:true,value:hooks=>{","const installBurstFrame83ag=hooks=>{");assert new.endswith('\n}});');new=new[:-5]+'''
};
let burstBlocked83ag=false,burstRequired83ag=false;
const burstTarget83ag=(plan,opt={})=>opt.burstFrame83ad!==undefined||!!plan?.burstRuntime83ag||(burstRequired83ag&&plan?.lyricAvoidanceIndex?.enabled===true&&(!Array.isArray(plan.lyricAvoidanceIndex.regions)||plan.lyricAvoidanceIndex.regions.length>0)&&Array.isArray(plan.cuts)&&plan.cuts.some(c=>c.layout==='burst'&&!c.placementLocked&&!['manual','notation'].includes(c.areaMode)));
Object.defineProperty(J,'installBurstFrame83ad',{configurable:true,value:installBurstFrame83ag});
Object.defineProperty(J,'burstFrameInstallerIdentity83ag',{value:()=>installBurstFrame83ag});
Object.defineProperty(J,'blockBurstFrame83ag',{value:()=>{burstBlocked83ag=true}});
Object.defineProperty(J,'burstFrameBlocked83ag',{value:()=>burstBlocked83ag});
Object.defineProperty(J,'requireBurstProof83ag',{value:()=>{burstRequired83ag=true}});
Object.defineProperty(J,'burstFrameTarget83ag',{value:burstTarget83ag});''';r=r[:a]+new+r[b:]
a='  frame(ctx, plan, t, opt = {}) {';assert r.count(a)==1;r=r.replace(a,a+"\n    if(burstBlocked83ag&&burstTarget83ag(plan,opt))throw Object.assign(Error('BURST83AG_BOOTSTRAP_BLOCKED'),{code:'BURST83AG_BOOTSTRAP_BLOCKED'});",1)
for name,old,new in [('11p_layoutsD-controller83.js',src,s),('09_render-controller83.js',ren,r)]:
 (D/name).write_text(new);(D/(name+'.patch')).write_text(''.join(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='83ad/'+name,tofile='83ag/'+name,n=0)))
(D/'seam-boundary.json').write_text(json.dumps({'baseSourceSHA256':hashlib.sha256(src.encode()).hexdigest(),'baseRendererSHA256':hashlib.sha256(ren.encode()).hexdigest(),'sourceSHA256':hashlib.sha256(s.encode()).hexdigest(),'rendererSHA256':hashlib.sha256(r.encode()).hexdigest(),'scope':'protected original installer identities and monotone target fail-closed bootstrap; uninstalled/disabled route unchanged; controller still required'},indent=2)+'\n')
