/* Native hold supports only; rendering retains the original clipped viewport. */
(() => {
'use strict';
const A=J.placement,ID=[1,0,0,1,0,0];
const union=bs=>({x0:Math.min(...bs.map(b=>b.x0)),x1:Math.max(...bs.map(b=>b.x1)),y0:Math.min(...bs.map(b=>b.y0)),y1:Math.max(...bs.map(b=>b.y1))});
const grow=(b,p)=>({x0:b.x0-p,x1:b.x1+p,y0:b.y0-p,y1:b.y1+p});
function neonMagazineUnits({W,H,cut,plan,holdOnly=true,holdWindow}){
 if(!['neon','magazine'].includes(cut.layout)||!holdOnly||!holdWindow||cut.layoutBRecipe||cut.layoutCRecipe||
    (cut.treat||'none')!=='none'||!['cut','flicker','invertBox'].includes(cut.enter)||
    !['cut','tyStrike'].includes(cut.exit)||!['still','knCounterRock'].includes(cut.hold)||
    !(cut.decor||[]).every(d=>d.id==='memphis'))return null;
 // Frame shadowBlur is in device space. This source support is conservative
 // only while content/camera scaling does not shrink the native frame.
 if(cut.layout==='neon'&&((cut.contentScale??1)<1||!['push','panL','panR','dutch','dollyIn','beatPunch'].includes(cut.cam)))return null;
 // Every neon glyph exists by .04+.28; subsequent ignition only changes
 // brightness. Magazine's positive page unfold is enclosed analytically below.
 if(holdWindow.native.start<cut.start+(cut.layout==='neon'?.32:0)||holdWindow.native.end>cut.start+cut.dur-cut.outDur)return null;
 const sourcePlan={...plan,W,H},sourceCut={...cut,area:null,simpleCircleRecipe:null,enter:'cut',exit:'cut',hold:'still',params:{...cut.params,...(cut.layout==='neon'?{flick:false}:{})}},renderer=Object.create(J.Renderer.prototype);
 const programs=['main','A','B'].map(pass=>A.sourceFormulaBase.construct(renderer,sourcePlan,sourceCut,{W,H,time:.8,pass})),units=[],mainBoxes=[],mainRanges=[];
 // mainDraw's per-item delay remains native. A global hold label alone does
 // not establish that a late neon glyph has completed its own entrance.
 const mains=programs.flatMap(p=>p.events.filter(e=>e.kind==='item'&&e.args[0].placementMain));
 if(mains.some(e=>e.matrix.some((v,i)=>v!==ID[i])||e.args[0].rot||e.args[0].skew))return null;
 const delayed=mains.some(e=>holdWindow.native.start<cut.start+Math.max(.01,cut.inDur)+(e.args[0].mi|0)*(cut.stagger||0));
 // Late glyphs may still be in invertBox while earlier ones already rock.
 // Cover every glyph's complete native entry/hold/exit, every visible subset
 // returned to the underline/decor, and a fresh/held native decor fallback.
 const partialNeon=cut.layout==='neon'&&delayed;
 if(delayed&&!partialNeon||partialNeon&&(!['under','none'].includes(cut.params.frame)||cut.params.sub))return null;
 let frameDrift=0;
 const measured=programs.map(program=>program.events.map((event,index)=>{
  if(event.kind!=='item'||!event.args[0].placementMain)return {event,index};
  const original=event.args[0],item={...original,shadow:null,blur:0,extrude:null,charFn:null,charFns:[]},noHold=original.noHold||cut.layout==='magazine'&&!['still','jitter','breathe','glitchtick'].includes(cut.hold),textCut={...cut,layout:'center',area:null,params:{},hold:noHold?'still':cut.hold};
  const main=A.centerCircle.sourceUnits(item,textCut,sourcePlan,{holdOnly:!partialNeon});
  if(!main)return null;
  const rest=J.itemBox(item),r=main.bbRanges;
  frameDrift=Math.max(frameDrift,...['x0','x1','y0','y1'].flatMap(k=>r[k].map(v=>Math.abs(v-rest[k]))));
  mainBoxes.push(main.glyphBB);mainRanges.push(r);
  // The source recorder already bounded native tube blur, shadows and stroke.
  // Reuse that padding around the complete analytical rocking glyph sweep.
  const raw=A.bounds(A.itemGeometry(item,ID,{pass:'main',scale:1}).polygons),outer=A.bounds(event.polygons),pad=Math.max(0,raw.x0-outer.x0,raw.y0-outer.y0,outer.x1-raw.x1,outer.y1-raw.y1);
  return {event,index,parts:main.units.map(u=>({...u,owner:cut.layout+'.'+event.nativeGroup+'.'+u.owner,bounds:grow(u.bounds,pad)}))};
 }));
 if(measured.some(es=>es.some(e=>!e))||!mainBoxes.length)return null;
 const bbRanges=Object.fromEntries(['x0','x1','y0','y1'].map(k=>[k,partialNeon?[
  Math.min(...mainRanges.map(r=>r[k][0])),Math.max(...mainRanges.map(r=>r[k][1]))
 ]:[
  (k.endsWith('0')?Math.min:Math.max)(...mainRanges.map(r=>r[k][0])),
  (k.endsWith('0')?Math.min:Math.max)(...mainRanges.map(r=>r[k][1]))
 ]])),restMain=partialNeon?union(mains.map(e=>J.itemBox(e.args[0]))):null;
 for(const es of measured)for(const {event,index,parts}of es){
  if(parts){units.push(...parts);continue;}
  // Plates/pages remain filled primary objects. In particular the magazine
  // spread cannot be treated as empty merely because its glyphs are sparse.
  for(const polygon of event.polygons){
   const b=grow(A.bounds([polygon]),cut.layout==='neon'?frameDrift:0);
   if(partialNeon){
    // Underline endpoints are fb.x0-.275*size / fb.x1+.275*size;
    // its level is fb.y1+.42*size. Preserve the source's measured padding
    // (including outer tube shadow) at every visible-subset edge/level.
    if(event.kind!=='line'||cut.params.frame!=='under')return null;
    const rest=A.bounds([polygon]);
    b.x0=bbRanges.x0[0]+rest.x0-restMain.x0;
    b.x1=bbRanges.x1[1]+rest.x1-restMain.x1;
    b.y0=bbRanges.y1[0]+rest.y0-restMain.y1;
    b.y1=bbRanges.y1[1]+rest.y1-restMain.y1;
   }
   // q in [0,1] scales page B about the gutter. The union of each complete
   // primitive's endpoint rectangle and its zero-width gutter projection
   // encloses every intermediate q, including all text and image shapes.
   if(cut.layout==='magazine'&&event.nativeCBody?.kind==='editorial-phase'){
    const axis=H>W*1.08?'y':'x',gutter=axis==='y'?H/2:W/2;
    b[axis+'0']=Math.min(b[axis+'0'],gutter);b[axis+'1']=Math.max(b[axis+'1'],gutter);
   }
   units.push({owner:cut.layout+'.source.'+index,kind:event.kind,bounds:b});
  }
 }
 for(const d of cut.decor||[])units.push(...A.memphisUnits({W,H,P:d,bbRanges:[bbRanges],includeFallback:partialNeon}));
 // drawCut clips layout and both native decor layers before the post chain.
 const clipped=units.map(u=>({...u,bounds:{x0:Math.max(0,u.bounds.x0),y0:Math.max(0,u.bounds.y0),x1:Math.min(W,u.bounds.x1),y1:Math.min(H,u.bounds.y1)}})).filter(u=>u.bounds.x0<u.bounds.x1&&u.bounds.y0<u.bounds.y1);
 return {units:clipped,bbRanges,glyphBB:union(mainBoxes),scope:'native-hold',sourceConstructionTime:.8,...(partialNeon?{delayedGlyphScope:'all-native-clocks-and-any-visible-subset'}:{})};
}
A.neonMagazineUnits=neonMagazineUnits;
})();
