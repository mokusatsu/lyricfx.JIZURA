/* Geometry leaves retained from billboard81, magnets21/29 and tiles48/49.
 * Finite-clock acceptance remains scoped to its original fixture. These source
 * bounds do not run their offline compilers, ownership checks or frame scans. */
(() => {
'use strict';
const A=J.placement,S=A.simpleCircle,ID=[1,0,0,1,0,0];
const rectangle=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const box=points=>{const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);return {x0:Math.min(...xs),y0:Math.min(...ys),x1:Math.max(...xs),y1:Math.max(...ys)};};
function billboard(env){
 const G=A.billboardNativeGeometry81,g=G.initial(env),nativeSize=G.mainSize(env,g),units=[];
 // Original rise is the sum of bounded entry .08H and exit .05H. Ground is fixed.
 for(const rise of [0,env.H*.13]){
  const d={...g,y0:g.by+rise,a0:1},lw=G.lineWidth(Math.min(env.W,env.H)),pw=G.postWidth(g.bw),brace=G.braces(d),cwY=G.deckY(d.y0,d.bh),common={...d,lw,pw,cwY,...brace};
  const part=(name,kind,v={})=>{const a=G.part(env,name,{...common,...v});let p,pad=0;if(kind==='rect')p=rectangle(a[0],a[1],a[0]+a[2],a[1]+a[3]);else if(kind==='circle')p=rectangle(a[0]-a[2],a[1]-a[2],a[0]+a[2],a[1]+a[2]);else {p=a[0];if(kind==='line')pad=a[2]*5;}const b=box(p);units.push({part:name,role:name==='ground'?'fixedSupport':'primary',polygon:rectangle(b.x0-pad-2,b.y0-pad-2,b.x1+pad+2,b.y1+pad+2)});};
  for(const px of [g.bx+g.bw*.22,g.bx+g.bw*.78])part('post','rect',{px});
  part('brace0','line');part('brace1','line');part('deck','rect');for(let i=0;i<=10;i++)part('upright','rect',{i});part('rail','line');part('ground','line');part('frame','rect');part('face','rect');
  // Every cone and illumination is clipped by the original board rectangle.
  units.push({part:'all-cones-and-illumination',role:'primary',polygon:rectangle(g.bx,d.y0,g.bx+g.bw,d.y0+g.bh)});
  for(let i=0;i<env.cut.params.lamps;i++){const loc=G.lampPosition({...d,L:env.cut.params.lamps},i);part('arm','line',loc);part('body','poly',loc);part('lens','circle',loc);}
  const items=[G.mainItem(env,d,nativeSize)];if(env.cut.params.tag){const fs=G.tagSize(env,d.bh);items.push(G.tagNumber(env,d,fs),G.tagTime(env,d,fs));}
  for(const item of items){const local=item===items[0]?S.itemEnvelope(item,env.cut):{bounds:A.bounds(A.itemGeometry(item,ID,{pass:'main',scale:1}).polygons)};const b=local.bounds;units.push({part:'text',role:'primary',item,polygon:rectangle(b.x0+item.x,b.y0+item.y,b.x1+item.x,b.y1+item.y)});}
 }
 return {units,nativeSize,source:'billboard81a-c 19-part formulas /81d potential cone clip support',contract:{fixedGround:true,jointBoardPostsLampsText:true,nativeLampCountAndClock:true,originalFontFirst:true}};
}
function prepareBillboard(plan,cut,{scale,region,previous}){
 const unsupported=reason=>({diagnostic:{cut:cut.index,status:'unsupported',reason,previousAcceptedPathRetained:true}});
 if(cut.placementTrajectory||cut.area?.angle)return unsupported('SOURCE_FORMULA_BILLBOARD_VIEWPORT_TRANSPORT');
 const renderer=Object.create(J.Renderer.prototype),ctx=document.createElement('canvas').getContext('2d'),W=cut.area?plan.W*cut.area.w:plan.W,H=cut.area?plan.H*cut.area.h:plan.H,env=renderer.makeEnv(ctx,{...plan,W,H},{...cut,area:null},cut.palette||plan.style.schemes[cut.scheme%plan.style.schemes.length],{pass:'main',t:cut.start+1.5,realTime:cut.start+1.5,lt:1.5,ltb:1.5,pIn:1,pOut:0,step:0,scale,allowFilter:false}),G=A.billboardNativeGeometry81,native=G.initial(env),nativeSize=G.mainSize(env,native);
 const recipes=[{id:'native',text:native.text,bw:native.bw,bh:native.bh,bx:native.bx,by:native.by,mainSize:nativeSize}];
 for(const side of ['left','right'])recipes.push({...recipes[0],id:'native-'+side,bx:side==='left'?W*.04:W-W*.04-native.bw});
 if(!/\s/u.test(cut.text))for(const ratio of cut.lyricSize==null?[1,.72]:[1])for(const side of ['left','right'])recipes.push({id:'reflow2-'+ratio+'-'+side,text:J.splitLines(cut.text,Math.ceil([...cut.text].length/2)),bw:W*.32,bh:H*.6,bx:side==='left'?W*.04:W*.64,by:H*.07,mainSize:nativeSize*ratio});
 const domain=S.domain(plan,cut,region,A.nativeBlockCircle.viewportProject(plan,cut,scale,{fixedViewport:true})),candidates=[];
 for(const recipe of recipes){const item={text:recipe.text,font:cut.params.font,size:recipe.mainSize,track:.04,lead:1.1},m=J.measure(item);if(m.w>recipe.bw*.9||m.h>recipe.bh*.78)continue;
  const scene={...recipe,layout:'billboard'},e={...env,cut:{...cut,simpleCircleRecipe:{scene}}},geometry=billboard(e),main=geometry.units.filter(u=>u.role==='primary').map(u=>u.polygon),fixed=geometry.units.filter(u=>u.role==='fixedSupport').map(u=>u.polygon),b=A.bounds(main),local={bounds:b,body:b,renderScale:scale};
  if(fixed.some(p=>{const q=A.nativeBlockCircle.viewportProject(plan,cut,scale,{fixedViewport:true})({bounds:A.bounds([p]),body:A.bounds([p]),renderScale:scale},{x:0,y:0},plan,cut),bb=A.bounds([q]),clipped=rectangle(Math.max(0,bb.x0),Math.max(0,bb.y0),Math.min(plan.W,bb.x1),Math.min(plan.H,bb.y1));return !A.clear([clipped],domain.circle,domain.pad);}))continue;
  // Recipes move the board/posts/lights themselves. The ground is never translated.
  for(const r of domain.regions){const envelope=domain.fit(local,[0,0],r);if(envelope)candidates.push({scene,region:r,envelope,fitness:Math.abs(Math.log(((b.x1-b.x0)/(b.y1-b.y0))/((r.x1-r.x0)/(r.y1-r.y0)))),distance:Math.hypot((recipe.bx-native.bx)/W,(recipe.by-native.by)/H)});}
 }
 for(let i=candidates.length-1;i>=0;i--)if(candidates[i].scene.mainSize<nativeSize&&candidates.some(c=>c.region.direction===candidates[i].region.direction&&c.scene.mainSize===nativeSize))candidates.splice(i,1);
 const old=previous?.policy===S.policy?previous.diagnostics.find(d=>d.cut===cut.index&&d.status==='safe'):null;candidates.sort((a,b)=>b.region.score-a.region.score||a.fitness-b.fitness||a.distance-b.distance||Number(b.region.direction===old?.direction)-Number(a.region.direction===old?.direction));const win=candidates[0];
 return win?{area:cut.area||null,sceneRecipe:win.scene,diagnostic:{cut:cut.index,status:'safe',direction:win.region.direction,region:win.region,envelope:win.envelope,method:'billboard81-input-recipes-and-fixed-ground',nativeSize,mainSize:win.scene.mainSize,allClockGeneration:false,productAdmissionPending:true}}:{diagnostic:{cut:cut.index,status:'insufficient-space',reason:'NO_SAFE_BILLBOARD_SOURCE_RECIPE',productAdmissionPending:true}};
}
function tiles(program){
 const g=program.nativeDGeometry,units=[];if(g?.kind!=='tiles-native-catalog')throw Object.assign(Error('Tiles source descriptor missing'),{code:'SOURCE_FORMULA_TILES_DESCRIPTOR'});
 for(const e of program.events){const match=/^tiles\.tile\.(\d+)\./.exec(e.owner||'');const tile=match&&g.tiles.find(t=>t.i===Number(match[1]));if(!tile){units.push({part:e.owner,phase:'all',polygons:e.polygons,body:e.bodyPolygons||e.polygons});continue;}const b=A.bounds(e.polygons),bounce=g.k*.06;units.push({part:e.owner,tile:tile.i,phase:'held',body:e.bodyPolygons||e.polygons,polygons:[rectangle(b.x0,b.y0-bounce,b.x1,b.y1)]});}
 return {units,stage:g.stage,source:'tiles48/49 source tile/rack geometry and entry/exit policy',contract:{movingEntryExitCircleException:true,originalRightEntryAndLeftExit:true,rowsAndTileOrder:true,rackAndScoreRetained:true},motion:g.tiles.map(t=>({i:t.i,entryFrom:g.params.from,entryStart:t.t1,entryDuration:g.fd,entryRotation:g.params.from==='drop'?30:10,entryDrop:g.stage[1]*.5,heldBounce:g.k*.06,exitStagger:t.exitSourceJ/Math.max(1,t.cnt)*.4,exitTargetX:-3*g.k}))};
}
function magnets(program){
 const g=program.nativeDGeometry;if(g?.kind!=='magnets-native-catalog')throw Object.assign(Error('Magnets source descriptor missing'),{code:'SOURCE_FORMULA_MAGNETS_DESCRIPTOR'});
 // Reuse the native21/29 size/lift domains. Source ink is scaled once, with
 // the existing font-grid/device raster guard; no 23k CSS-bin sweep at startup.
 const units=g.glyphs.map(v=>{const raw=A.itemGeometry({text:v.ch,font:g.params.font,size:v.size,x:0,y:0,rot:v.rot,stroke:v.size*.08},ID,{pass:'main',scale:1}),b=A.bounds(raw.polygons),item={text:v.ch,font:g.params.font,size:v.size,x:0,y:0,stroke:v.size*.08,plain:true},full=S.itemEnvelope(item,program.sourceCut).bounds,r=Math.hypot(Math.max(Math.abs(full.x0),Math.abs(full.x1)),Math.max(Math.abs(full.y0),Math.abs(full.y1)))*1.28+4,rx=Math.max(Math.abs(b.x0),Math.abs(b.x1))*1.28+4,ry=Math.max(Math.abs(b.y0),Math.abs(b.y1))*1.28+4;return {glyph:v.q,part:'lyric-depth-and-body',phase:'all',body:[rectangle(v.x-rx,v.y-ry,v.x+rx+v.size*.16,v.y+ry+v.size*.24)],polygons:[rectangle(v.x-r,v.y-r,v.x+r+v.size*.16,v.y+r+v.size*.24)]};});
 return {units,glyphs:g.glyphs,stage:g.stage,scene:g.scene,decoys:g.decoys,source:'magnets21/29 continuous snap [.95,1.28], lift [0,1], depth offsets and fixed rounded-board/handle/decoys',contract:{fixedRoundedBoard:true,fixedHandleAndDecoys:true,wholeGlyphDepthBody:true,nativeGlyphOrderAndSize:true,movingEntryPolicy:'retain existing magnets29 admission; no new blanket full-motion circle claim'},metricPolicy:'scaled actual source ink + source stroke + existing raster guard; original full-bin fixture acceptance is not generalized'};
}
function prepareNativeScene(plan,cut,{scale,region,previous}){
 const unsupported=reason=>({diagnostic:{cut:cut.index,status:'unsupported',reason,previousAcceptedPathRetained:true}});
 // Preserve the old accepted scene domain; other FX/viewports keep their old path.
 if(cut.area?.angle||cut.placementTrajectory||(cut.decor||[]).some(d=>!J.DECOR[d.id]))return unsupported('SOURCE_FORMULA_SCENE_TRANSPORT_DOMAIN');
 if(cut.layout==='tiles'&&cut.params.from!=='right')return unsupported('SOURCE_FORMULA_TILE_ENTRY_DOMAIN');
 const scene=construct(Object.create(J.Renderer.prototype),plan,cut),W=plan.W,H=plan.H,nativeW=scene.stage[0],nativeH=scene.stage[1],domain=S.domain(plan,cut,region,A.nativeBlockCircle.viewportProject(plan,cut,scale,{fixedViewport:true})),candidates=[],all=scene.units.flatMap(u=>u.polygons||[u.polygon]),bounds=A.bounds(all),local={bounds,body:A.bounds(scene.units.flatMap(u=>u.body||u.polygons||[u.polygon])),renderScale:scale};
 if(cut.layout==='tiles'){
  const k=Math.max(...scene.motion.map(q=>q.heldBounce/.06)),pad=k*.25;local.bounds={...bounds,y0:bounds.y0-pad,y1:bounds.y1+pad};local.body={...local.body,y0:local.body.y0-pad,y1:local.body.y1+pad};
 }
 const board=scene.scene?.board,handle=scene.scene?.handle,margin=domain.pad,inner=board?{x0:board.x+board.r+margin,x1:board.x+board.w-board.r-margin,y0:nativeH*.09+board.r+margin,y1:nativeH*.05+board.h-board.r-margin}:null;
 const obstacleBoxes=[];if(handle)obstacleBoxes.push({x0:handle.x,y0:handle.y,x1:handle.x+handle.w,y1:handle.y+handle.h});
 for(const v of scene.decoys||[]){const ps=A.itemGeometry({text:v.ch,font:v.font,size:v.size*1.25,x:v.x,y:v.y,rot:v.rot,stroke:v.size*.08},ID,{pass:'main',scale:1}).polygons,b=A.bounds(ps);obstacleBoxes.push({x0:b.x0-4,y0:b.y0-4,x1:b.x1+v.size*.05+4,y1:b.y1+v.size*.07+4});}
 const attached=(b,offset)=>{const m={x0:b.x0+offset[0],y0:b.y0+offset[1],x1:b.x1+offset[0],y1:b.y1+offset[1]};if(!inner)return m.x0>=0&&m.y0>=0&&m.x1<=nativeW&&m.y1<=nativeH;return m.x0>=inner.x0&&m.x1<=inner.x1&&m.y0>=inner.y0&&m.y1<=inner.y1&&obstacleBoxes.every(o=>m.x1+margin<o.x0||m.x0-margin>o.x1||m.y1+margin<o.y0||m.y0-margin>o.y1);};
 for(const r of domain.regions){const placed=domain.place(local,r);if(placed&&attached(local.body,placed.offset))candidates.push({...placed,region:r,groups:[{from:0,to:scene.glyphs?.length??Infinity,offset:placed.offset}],fitness:Math.abs(Math.log(((bounds.x1-bounds.x0)/(bounds.y1-bounds.y0))/((r.x1-r.x0)/(r.y1-r.y0)))),distance:Math.hypot(placed.offset[0]/W,placed.offset[1]/H)});}
 // Original accepted magnets split: two consecutive halves, preserving left→right.
 if(!candidates.length&&cut.layout==='magnets'&&scene.glyphs.length===4){const ranges=[[0,2],[2,4]],parts=ranges.map(([from,to])=>{const b=A.bounds(scene.units.filter(u=>u.glyph>=from&&u.glyph<to).flatMap(u=>u.polygons));return {bounds:b,body:A.bounds(scene.units.filter(u=>u.glyph>=from&&u.glyph<to).flatMap(u=>u.body||u.polygons)),renderScale:scale};}),left=domain.regions.find(r=>r.direction==='left'),right=domain.regions.find(r=>r.direction==='right'),p=domain.place(parts[0],left),q=domain.place(parts[1],right);
  if(p&&q&&attached(parts[0].body,p.offset)&&attached(parts[1].body,q.offset)&&parts[0].bounds.x1+p.offset[0]<parts[1].bounds.x0+q.offset[0]){const r=left.score>=right.score?left:right;candidates.push({region:r,envelope:[...p.envelope,...q.envelope],groups:ranges.map(([from,to],i)=>({from,to,offset:[p,q][i].offset})),fitness:0,distance:Math.hypot(...p.offset.map((v,i)=>v/[W,H][i]))+Math.hypot(...q.offset.map((v,i)=>v/[W,H][i]))});}
 }
 const old=previous?.policy===S.policy?previous.diagnostics.find(d=>d.cut===cut.index&&d.status==='safe'):null;candidates.sort((a,b)=>b.region.score-a.region.score||a.fitness-b.fitness||a.distance-b.distance||Number(b.region.direction===old?.direction)-Number(a.region.direction===old?.direction));const win=candidates[0];if(!win)return {diagnostic:{cut:cut.index,status:'insufficient-space',reason:'NO_SAFE_NATIVE_SCENE',source:scene.source,productAdmissionPending:true}};
 const recipe=cut.layout==='tiles'?{layout:'tiles',offset:win.groups[0].offset}:{layout:'magnets',groups:win.groups};
 return {area:cut.area||null,sceneRecipe:recipe,diagnostic:{cut:cut.index,status:'safe',direction:win.region.direction,envelope:win.envelope,method:'source-scene-units-with-native-fixed-and-phase-contract',source:scene.source,contract:scene.contract,allClockGeneration:false,productAdmissionPending:true}};
}
function construct(renderer,plan,cut){
 const area=cut.area,W=area?plan.W*area.w:plan.W,H=area?plan.H*area.h:plan.H,ctx=document.createElement('canvas').getContext('2d'),env=renderer.makeEnv(ctx,{...plan,W,H},{...cut,area:null},cut.palette||plan.style.schemes[cut.scheme%plan.style.schemes.length],{pass:'main',t:cut.start+Math.max(1.5,cut.dur/2),realTime:cut.start+Math.max(1.5,cut.dur/2),lt:Math.max(1.5,cut.dur/2),ltb:Math.max(1.5,cut.dur/2),pIn:1,pOut:0,step:0,scale:1,allowFilter:false});
 if(cut.layout==='billboard')return billboard(env);
 const time=cut.layout==='tiles'?.12+J.glyphCount(cut.text)*J.clamp(cut.dur*.36/J.glyphCount(cut.text),.05,.12)+.28:.18+J.glyphCount(cut.text)*J.clamp(cut.dur*.32/J.glyphCount(cut.text),.04,.1)+.16;
 const program=A.sourceFormulaBase.construct(renderer,plan,cut,{W,H,time,sourceD:true});return cut.layout==='tiles'?tiles(program):magnets(program);
}
for(const id of ['billboard','tiles','magnets'])A.sourceFormulaCircle.ids.add(id);
A.knownSceneGeometry=Object.freeze({construct,billboard,tiles,magnets,prepareBillboard,prepareNativeScene});
})();
