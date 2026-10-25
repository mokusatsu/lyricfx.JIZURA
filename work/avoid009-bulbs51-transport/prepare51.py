"""Source-only isolated bulbs transport edit recipe. No application invocation."""
from pathlib import Path
import hashlib,json
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-bulbs51-transport';original=(R/'src/09a_placement.js').read_text();s=original;edits=[]
def edit(before,after):
 global s
 assert s.count(before)==1,before;s=s.replace(before,after);edits.append({'before':before,'after':after})
anchor="const dTilesCut=cut=>"
pos=s.index(anchor)
line="const dBulbsCut=(renderer,env)=>env.cut?.placementLayoutsD===true&&!env.cut.placementLayoutsA&&!env.cut.placementLayoutsB&&!env.cut.placementLayoutsC&&env.cut.layout==='bulbs'&&!env.placementEnvelope&&!env.cut.placementUnits&&env.cut.enter==='cut'&&env.cut.exit==='cut'&&['still','jitter','breathe'].includes(env.cut.hold)&&env.cut.treat==='none'&&!env.cut.drawing&&!env.cut.effectsOnly&&!(env.cut.decor||[]).length&&['main','A','B'].includes(env.pass)&&Number.isFinite(env.fx?.motion)&&[env.t,env.lt,env.ltb,env.step,env.pIn,env.pOut].every(Number.isFinite)&&A.layoutsDSourceKnown?.('bulbs')&&A.layoutsDTransportKnown?.(renderer)&&A.bulbsTransport51Known?.(renderer)===true;\n"
edit(anchor,line+anchor)
edit('  recordMatrixEpoch++;',"  recordMatrixEpoch++;\n  const nativeBulbs51=env.cut?.placementLayoutsD===true&&env.cut.layout==='bulbs';\n  if(nativeBulbs51&&!dBulbsCut(renderer,env))fail('UNSUPPORTED_D_BULBS_TRANSPORT','Stock bulbs cut/cut/none with still/jitter/breathe, unchanged native helpers/renderer and finite effective motion required');")
edit('dMagnetsCut(env.cut)||dTilesCut(env.cut))', 'dMagnetsCut(env.cut)||dTilesCut(env.cut)||dBulbsCut(renderer,env))')
edit("  if(dBalloonsCut(env.cut)&&['main','A','B'].includes(env.pass)&&A.layoutsDTransportKnown?.(renderer))recorder.fx=env.fx;", "  if(dBalloonsCut(env.cut)&&['main','A','B'].includes(env.pass)&&A.layoutsDTransportKnown?.(renderer))recorder.fx=env.fx;\n  // Bulbs mainDraw consumes the already-effective source FX exactly once.\n  if(nativeBulbs51)recorder.fx=env.fx;")
edit('  const program={events,diagnostics,', "  if(nativeBulbs51&&recorder.placementDGeometry?.complete!==true)diagnostics.push({code:'UNSUPPORTED_D_BULBS_CATALOG',message:'Complete bounded source50 bulbs catalog required for this transport pilot'});\n  const program={events,diagnostics,...(nativeBulbs51?{nativeBulbsTransport51:{kind:'bulbs-original-live-root-effective-fx',effectiveFXIdentityPreserved:recorder.fx===env.fx,inputEffectiveFX:jsonClone(env.fx),recordedEffectiveFX:jsonClone(recorder.fx),actualRoot:nativeDOriginalRoot.slice(),pilotHolds:['still','jitter','breathe'],safetyCertificate:false}}:{}),")
(D/'src/09a_placement.js').write_text(s);(D/'evidence/edits51.json').write_text(json.dumps(edits,indent=2)+'\n');back=s
for e in reversed(edits):assert back.count(e['after'])==1;back=back.replace(e['after'],e['before'])
assert back==original
source=R/'tasks/evidence/AVOID-009/bulbs-native50/source50/src/11p_layoutsD.js';b=source.read_bytes();assert hashlib.sha256(b).hexdigest()=='9650acc45b91e6ef5e213eaa27a20fa6f91a547fa48812714dfa054f6c03fbd9';(D/'src/11p_layoutsD.js').write_bytes(b)
print(json.dumps({'kind':'SOURCE51-static-source-recipe','edits':len(edits),'inverseExact':True,'source50DExact':True,'appExecuted':False}))
