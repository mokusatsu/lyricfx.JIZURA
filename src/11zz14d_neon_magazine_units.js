/* Native hold supports only; rendering retains the original clipped viewport. */
(() => {
'use strict';
const A=J.placement,ID=[1,0,0,1,0,0];
const union=bs=>({x0:Math.min(...bs.map(b=>b.x0)),x1:Math.max(...bs.map(b=>b.x1)),y0:Math.min(...bs.map(b=>b.y0)),y1:Math.max(...bs.map(b=>b.y1))});
const grow=(b,p)=>({x0:b.x0-p,x1:b.x1+p,y0:b.y0-p,y1:b.y1+p});
function neonMagazineUnits({W,H,cut,plan,st,holdOnly=true,holdWindow}){
 if(!['neon','magazine'].includes(cut.layout)||!holdOnly||!holdWindow||cut.layoutBRecipe||cut.layoutCRecipe||
    (cut.treat||'none')!=='none'||!['cut','flicker','invertBox','tyRubyDrop'].includes(cut.enter)||
    !['cut','tyStrike'].includes(cut.exit)||!['still','knCounterRock','scanBand'].includes(cut.hold)||
    !(cut.decor||[]).every(d=>['memphis','starburst'].includes(d.id)))return null;
 // Canvas frame/subtitle shadows stay in device space while jelly can shrink
 // either source axis. Pull their support back through the smallest camera
 // singular value, including contentScale, before projecting the owners.
 const motion=cut.motionScale??1,fx=cut.effectFx||plan.fx,jelly=cut.cam==='jelly',K=J.clamp((fx.motion??.7)*motion*1.25,0,1.25),amp=jelly?Math.abs(cut.camP?.a||.055)*K*motion*1.45:0,minScale=(cut.contentScale??1)*(jelly?(1+.01*motion)*(1-amp):1);
 if(cut.layout==='neon'&&(!['push','panL','panR','dutch','dollyIn','beatPunch','jelly'].includes(cut.cam)||!(minScale>0)))return null;
 const shadowFactor=cut.layout==='neon'?1/Math.min(1,minScale):1,deviceShadowExtra=3*60*(shadowFactor-1);
 // Before .04+.28 the native ignition can hide any glyph. Include that
 // subset below; ignition changes visibility/brightness, never its position.
 // Magazine's positive page unfold is enclosed analytically below.
 if(holdWindow.native.start<cut.start||holdWindow.native.end>cut.start+cut.dur-cut.outDur)return null;
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
 const partialNeon=cut.layout==='neon'&&(delayed||holdWindow.native.start<cut.start+.32);
 // Bracket corners and subtitle centers move with the whole visible subset;
 // the per-glyph drift below is not a sweep of those independent owners.
 if(delayed&&!partialNeon||partialNeon&&(!['under','none'].includes(cut.params.frame)||cut.params.sub))return null;
 if(partialNeon&&(!['under','none'].includes(cut.params.frame)||cut.params.sub))return null;
 let frameDrift=0;
 const measured=programs.map(program=>program.events.map((event,index)=>{
  if(event.kind!=='item'||!event.args[0].placementMain)return {event,index};
  const original=event.args[0],item={...original,shadow:null,blur:0,extrude:null,charFn:null,charFns:[]},noHold=original.noHold||cut.layout==='magazine'&&!['still','jitter','breathe','glitchtick'].includes(cut.hold),textCut={...cut,layout:'center',area:null,params:{},hold:noHold?'still':cut.hold};
  const main=A.centerCircle.sourceUnits(item,textCut,sourcePlan,{holdOnly:!partialNeon||cut.enter==='tyRubyDrop'});
  if(!main)return null;
  const rest=J.itemBox(item),r=main.bbRanges;
  frameDrift=Math.max(frameDrift,...['x0','x1','y0','y1'].flatMap(k=>r[k].map(v=>Math.abs(v-rest[k]))));
  mainBoxes.push(main.glyphBB);mainRanges.push(r);
  // The source recorder already bounded native tube blur, shadows and stroke.
  // Reuse that padding around the complete analytical rocking glyph sweep.
  const raw=A.bounds(A.itemGeometry(item,ID,{pass:'main',scale:1}).polygons),outer=A.bounds(event.polygons),pad=Math.max(0,raw.x0-outer.x0,raw.y0-outer.y0,outer.x1-raw.x1,outer.y1-raw.y1);
  return {event,index,parts:main.units.map(u=>({...u,owner:cut.layout+'.'+event.nativeGroup+'.'+u.owner,bounds:grow(u.bounds,pad*shadowFactor)}))};
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
   const b=grow(A.bounds([polygon]),cut.layout==='neon'?frameDrift+deviceShadowExtra:0);
   if(partialNeon&&cut.params.frame==='under'&&!cut.params.sub){
    // Underline endpoints are fb.x0-.275*size / fb.x1+.275*size;
    // its level is fb.y1+.42*size. Preserve the source's measured padding
    // (including outer tube shadow) at every visible-subset edge/level.
    if(event.kind!=='line'||cut.params.frame!=='under')return null;
    const rest=A.bounds([polygon]);
    b.x0=bbRanges.x0[0]+rest.x0-restMain.x0-deviceShadowExtra;
    b.x1=bbRanges.x1[1]+rest.x1-restMain.x1+deviceShadowExtra;
    b.y0=bbRanges.y1[0]+rest.y0-restMain.y1-deviceShadowExtra;
    b.y1=bbRanges.y1[1]+rest.y1-restMain.y1+deviceShadowExtra;
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
 for(const d of cut.decor||[]){const options={W,H,P:d,cut,st:st||{...(cut.effectStyle||plan.style),...(cut.fonts?{fonts:cut.fonts}:{})},bbRanges:[bbRanges],includeFallback:partialNeon},parts=d.id==='memphis'?A.memphisUnits(options):A.starburstUnits?.(options);if(!parts?.length)return null;units.push(...parts);}
 // The viewport clip is applied after the camera transforms these units.
 return {units,bbRanges,glyphBB:union(mainBoxes),scope:'native-hold',sourceConstructionTime:.8,...(partialNeon?{delayedGlyphScope:'all-native-clocks-and-any-visible-subset'}:{})};
}
A.neonMagazineUnits=neonMagazineUnits;
})();
