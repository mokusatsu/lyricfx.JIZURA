"""Source-only provenance and inverse renderer audit. No browser/build/freeze."""
from pathlib import Path
import hashlib,json,subprocess
root=Path(__file__).resolve().parents[2]
base='4a76100c63b3a8b55c7c12ad9e98656ba37f9599'
def read(name):return (root/name).read_text()
manifest=json.loads(read('tasks/evidence/AVOID-009/resume-20261025/source68-accepted-snapshot/manifest.json'))
for row in manifest['files']:
 data=(root/row['snapshot']).read_bytes();assert hashlib.sha256(data).hexdigest()==row['sha256']
for name in ['src/11p_layoutsD.js','src/09a_placement.js','src/11p_layoutsEe_bulbs_geometry68.js']:
 row=next(r for r in manifest['files'] if r['path']==name);assert hashlib.sha256((root/name).read_bytes()).hexdigest()==row['sha256'],name+' changed after source68 acceptance'
s=read('src/11p_layoutsEf_bulbs_proof69.js');k=read('tasks/evidence/AVOID-009/bulbs-focused59/source59/runner/kernel59.cjs');expected=k[k.index('function norm('):k.index('function group(')];a=s.index('const K=(()=>{\n')+len('const K=(()=>{\n');b=s.index('return{F,serial,pointSerial,atom,',a);assert s[a:b]==expected,'59 arithmetic/atom changed'
q=read('tasks/evidence/AVOID-009/bulbs-focused59/source59/runner/quality59.cjs');q=q[q.index('const F=K.F'):q.index('module.exports=')];q=q.replace("assert(recipe.id==='fieldA'&&recipe.neighborHardMinimum===3&&recipe.radiusScale===.8||recipe.id==='fieldB'&&recipe.neighborHardMinimum===4.86&&recipe.radiusScale===.7,'FOCUSED_NEIGHBOR_POLICY');","assert(recipe.native===true||recipe.neighborHardMinimum===3&&recipe.radiusScale===.8,'BULBS69_NEIGHBOR_POLICY');")
a=s.index('const Q=(()=>{\n')+len('const Q=(()=>{\n');b=s.index('return{quality};})();',a);assert s[a:b]==q,'59 quality changed outside declared recipe admission'
r=read('src/09_render.js');a=r.index('// SOURCE69: bulbs-only preflight issuer, before every bitmap write.');b=r.index('\nconst mk =',a);r=r[:a]+r[b:]
# The original blank line is before the inserted comment.
for line in ["    const bulbs69Frame=bulbs69Hooks?.needs(plan)?bulbs69Hooks.prepare(Object.freeze({renderer:this,ctx,plan,t,opt})):null;\n","        if(bulbs69Frame)bulbs69Frames.set(env,Object.freeze({renderer:this,ctx:X,plan,cut,frame:bulbs69Frame,pass:P.pass}));\n","    if(bulbs69Frame)bulbs69Hooks.finish(bulbs69Frame);\n"]:
 assert r.count(line)==1;r=r.replace(line,'')
baseline=subprocess.check_output(['git','show',base+':src/09_render.js'],cwd=root).decode()
# Two blank lines surround the new declaration block, restore the single original.
r=r.replace('}});\n\n\nconst mk =','}});\n\nconst mk =',1)
assert r==baseline,'09 renderer changed outside declared bulbs issuer'
assert 'getImageData' not in s and 'getImageData' not in read('src/11p_layoutsEg_bulbs_adapter69.js'),'Product pixel readback introduced'
print(json.dumps({'status':'PASS','baseline':base,'source68SnapshotsUnchanged':True,'arithmetic59Exact':True,'quality59OnlyDeclaredRecipePolicyChange':True,'rendererInverseExact':True,'browserExecutions':0}))
