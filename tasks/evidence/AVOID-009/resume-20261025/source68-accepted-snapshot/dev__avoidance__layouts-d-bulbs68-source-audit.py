"""Inverse SOURCE68's exact declared insertions; no build/browser/Git mutation."""
from pathlib import Path
import argparse, hashlib, json, subprocess
p=argparse.ArgumentParser();p.add_argument('--baseline-ref',required=True);args=p.parse_args()
root=Path(__file__).resolve().parents[2]
def native(f):
 return subprocess.check_output(['git','show',args.baseline_ref+':'+f],cwd=root).decode()
f='src/11p_layoutsD.js';s=(root/f).read_text();base=native(f)
a=s.index('/* SOURCE68: an explicit, synchronous recipe binding.');b=s.index("reg('bulbs', {",a);s=s[:a]+s[b:]
a=s.index("reg('bulbs', {");b=s.index('\nreg(',a+8);body=s[a:b]
subs=[
("    const nativeD = cut.placementLayoutsD === true;\n    const recipeBinding68=env[bulbsRecipe68Key]||null;\n    if(recipeBinding68)bulbs68Scope(env,recipeBinding68.recipe,recipeBinding68.reference);","    const nativeD = cut.placementLayoutsD === true;"),
("    if(recipeBinding68&&catalog){catalog.kind='bulbs-recipe68-catalog';catalog.nativeOnly=false;catalog.recipe68=bulbs68Clone(recipeBinding68.recipe);catalog.sourceProof={kind:'bulbs68-declared-recipe-only',geometryCertified:false,nativeGeometry:false,sourceGlyphIndices:[0,1,2,3],sourceClocksUnchanged:true};}\n",''),
("    const text = recipeBinding68?recipeBinding68.recipe.writingText:brk(cut.text, port ? 5 : 8);","    const text = brk(cut.text, port ? 5 : 8);"),
('    const size = recipeBinding68?recipeBinding68.reference.size*recipeBinding68.recipe.scale:Math.min(J.fitSize','    const size = Math.min(J.fitSize'),
('    const ss = recipeBinding68?recipeBinding68.reference.ss:Math.max(smallSize(env), size * 0.16);','    const ss = Math.max(smallSize(env), size * 0.16);'),
('    const padX = recipeBinding68?size*recipeBinding68.recipe.pad[0]:size * 0.75, padY = recipeBinding68?size*recipeBinding68.recipe.pad[1]:size * 0.62;','    const padX = size * 0.75, padY = size * 0.62;'),
('    const r = recipeBinding68?recipeBinding68.reference.r*recipeBinding68.recipe.radiusScale:J.clamp(size * 0.075, 4, u * 0.022);','    const r = J.clamp(size * 0.075, 4, u * 0.022);'),
('      const pts = recipeBinding68?bulbs68Resample(insetPoints,recipeBinding68.reference.rings[ri].N):resample(insetPoints, r * 3.3, 140);','      const pts = resample(insetPoints, r * 3.3, 140);'),
('      const sz = recipeBinding68?recipeBinding68.reference.subtitle.size:Math.min(fs, J.fitSize(t, bodyF(env), bw - padX, ss * 1.2, { track: 0.18 }));','      const sz = Math.min(fs, J.fitSize(t, bodyF(env), bw - padX, ss * 1.2, { track: 0.18 }));'),
('    if(captureD){catalog.bb=clone(bb);if(recipeBinding68){catalog.lyric.sourceGlyphIndices=[0,1,2,3];catalog.recipe68OriginalN=recipeBinding68.reference.rings.map(r=>r.N);catalog.recipe68OriginalClock=clone(recipeBinding68.reference.clock);}}','    if(captureD)catalog.bb=clone(bb);')]
subs.append(("if(recipeBinding68){ring.nativeCount=recipeBinding68.reference.rings[ri].N;ring.actualStep=ring.totalLengthRecomputedMetadata/N;ring.spacing=ring.actualStep;ring.derivation='recipe68 outline resampled at fixed native N(t); actualStep is new perimeter/N, not radius*3.3';}",''))
for new,old in subs:
 assert body.count(new)==1,new
 body=body.replace(new,old,1)
s=s[:a]+body+s[b:];assert s==base,'11p outside declared recipe branches changed'
f='src/09a_placement.js';s=(root/f).read_text();line="  if(nativeBulbs51&&program.nativeDGeometry?.kind==='bulbs-recipe68-catalog'){program.bulbsRecipe68Transport={...program.nativeBulbsTransport51,kind:'bulbs-recipe68-live-root-effective-fx',nativeGeometry:false,safetyCertificate:false};delete program.nativeBulbsTransport51;}\n";assert s.count(line)==1;s=s.replace(line,'');assert s==native(f),'09a outside recipe labelling changed'
print(json.dumps({'status':'PASS','baseline':args.baseline_ref,'inverseSourceBytes':True,'changesOutsideBulbsRecipe':False,'browserExecutions':0,'sourceAuditOnly':True}))
