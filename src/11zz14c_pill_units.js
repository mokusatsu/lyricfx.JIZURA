/* Native pill viewport supports. Rendering stays on nativeIdentity unchanged. */
(() => {
'use strict';
const A=J.placement,ID=[1,0,0,1,0,0];
function pillUnits({W,H,cut,plan,st,sc,holdOnly=true,holdWindow}){
 if(cut.layout!=='pill'||!holdOnly||(cut.treat||'none')!=='none'||
    !['cut','flicker','invertBox','tyRubyDrop'].includes(cut.enter)||!['cut','tyStrike'].includes(cut.exit)||
    !['still','knCounterRock','scanBand'].includes(cut.hold)||
    !(cut.motionScale==null||cut.motionScale>=0&&cut.motionScale<=1)||
    !(cut.decor||[]).every(d=>['memphis','starburst'].includes(d.id)))return null;
 if(cut.enter==='tyRubyDrop'&&(!holdWindow||holdWindow.native.start<cut.start+Math.max(.01,cut.inDur)))return null;
 const env={W,H,cut,plan,st,sc},g=A.nativeBlockCircle.geometry(env),item=g.items[0];
 // Reuse the proven glyph/word-pivot math only. The synthetic center has no
 // center subtitle/rule: pill owns its own independent plates and labels.
 const textCut={...cut,layout:'center',area:null,params:{}},main=A.centerCircle.sourceUnits(item,textCut,plan,{holdOnly:true});
 if(!main)return null;
 const units=[],clip=item.clipX;
 for(const u of main.units){
  const b={...u.bounds,x0:Math.max(u.bounds.x0,clip[0]),x1:Math.min(u.bounds.x1,clip[1])};
  if(b.x0<b.x1)units.push({...u,owner:u.owner.replace(/^center\./,'pill.main.'),bounds:b});
 }
 // geometry is the source pill formula: its first plate covers all native
 // expansion values, and each subsequent label plate includes outBack's
 // analytic maximum plus its native 1.3px stroke. Keep those owners separate.
 g.shapes.forEach((p,i)=>units.push({owner:i?'pill.labelPlate.'+(i-1):'pill.plate',kind:'plate',bounds:A.bounds([p])}));
 // Label glyphs do not use mainDraw; their alpha changes but their source
 // font, size, tracking and position stay fixed throughout the hold window.
 g.plain.forEach((p,i)=>A.itemGeometry(p,ID,{pass:'main',scale:1}).glyphs.forEach(glyph=>units.push({
  owner:'pill.label.'+i+'.glyph.'+glyph.index,kind:'glyph',bounds:A.bounds([glyph.polygon])
 })));
 // Native decor receives mainDraw's returned glyph-box ranges, even where
 // the capsule's canvas clip hides main ink. It does not receive plate bounds.
 const cachedPartial=cut.exit==='cut'&&cut.outDur>0;
 for(const d of cut.decor||[]){
  const options={W,H,P:d,cut,st,bbRanges:[cachedPartial?main.bbRangesAny:main.bbRanges],includeFallback:cachedPartial},parts=d.id==='memphis'?A.memphisUnits(options):A.starburstUnits?.(options);
  if(!parts?.length)return null;
  units.push(...parts);
 }
 return {units,bbRanges:main.bbRanges,glyphBB:main.glyphBB,scope:'native-hold'};
}
A.pillUnits=pillUnits;
})();
