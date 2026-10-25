/* Native flipCards: bounded source faces and attached glyph/rank projection.
   Edge-on text is retained. Full certification requires the narrow D-only
   finite forward-projection recorder capability, never a relaxed A.affine. */
(() => {
'use strict';
const stockPush=J.CAMERA.push?.get;
const A=J.placement,ID=[1,0,0,1,0,0],fail=(code,message)=>{const e=Error(message);e.code=code;throw e;},norm=t=>String(t||'').replace(/\s/g,''),rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
function attached(vertices,g){
 // Front face: sin in[0,1], sc2=1+.1sin, glyph y=sc2²*localY.
 // A clamped edge-on plate only improves the negative-x support; take the
 // minimum of unclamped and centred support so both branches are included.
 return vertices.every(([x,y])=>Math.abs(x)<=g.cw/2+1e-7&&[0,1].every(sn=>Math.abs(y)*(1+.1*sn)<=g.chh/2*(1+.2*sn*Math.min(0,x/g.cw))+1e-7));
}
function proof(renderer,plan,cut,retainNativeFailure=false){
 const ctx=A.measurementContext();ctx.reset();const count=[...norm(cut.text)].length,fd=J.clamp(cut.dur*.12,.22,.36),gapT=J.clamp(cut.dur*.34/count,.04,.12),time=cut.start+Math.max(cut.dur/2,.12+(count-1)*gapT+fd+1e-6),env=renderer.makeEnv(ctx,plan,cut,cut.palette||plan.style.schemes[cut.scheme%plan.style.schemes.length],{pass:'main',t:time,realTime:time,lt:time-cut.start,ltb:time-cut.start,step:0,scale:1,allowFilter:false,placementEnvelope:true}),program=A.record(renderer,env),g=program.nativeDGeometry;
 if(!program.measurementSupported)fail('UNSUPPORTED_MEASUREMENT',JSON.stringify(program.diagnostics));if(g?.kind!=='flipCards'||!g.cards?.length||![g.k,g.cw,g.chh,g.lw,g.fd,g.gapT,g.fontScale].every(Number.isFinite)||g.k<=0)fail('FLIPCARDS_SOURCE_GEOMETRY','Finite canonical native face/card metadata required');
 const main=program.events.filter(e=>e.kind==='item'&&e.args[0].placementDSource?.kind==='main');if(main.length!==g.cards.length||norm(main.map(e=>e.args[0].text).join(''))!==norm(cut.text))fail('SOURCE_COVERAGE','Every lyric card must have one complete main source glyph in original reading order');
 const units=[],attachmentFailures=[];for(const cd of g.cards){const owner='flipCards.card.'+cd.index,events=program.events.filter(e=>e.role==='primary'&&e.owner===owner),items=events.filter(e=>e.kind==='item'),ranks=items.filter(e=>e.args[0].placementDSource?.kind==='rank'),centre=items.filter(e=>e.args[0].placementDSource?.kind==='main');if(centre.length!==1||ranks.length!==(g.idx?2:0)||items.length!==1+ranks.length||items.some(e=>e.args[0].placementDSource.index!==cd.index||e.args[0].text!==cd.ch))fail('SOURCE_COVERAGE','Main glyph and both original corner ranks must remain attached to their source card');
  const fontOutlines=[],deviceGuarded=[];for(const event of items){const geometry=A.itemGeometry(event.args[0],ID,env);if(!attached(geometry.inkPolygons.flat(),g)){const detail={index:cd.index,kind:event.args[0].placementDSource.kind,corner:event.args[0].placementDSource.corner??null,size:event.args[0].size,bounds:A.bounds(geometry.inkPolygons),vertices:geometry.inkPolygons};if(!retainNativeFailure)fail('CARD_ATTACHMENT_OVERFLOW','Complete font/stroke/font-space guard exceeds native card writing support: '+JSON.stringify(detail));attachmentFailures.push(detail);}fontOutlines.push(...geometry.inkPolygons);deviceGuarded.push(...geometry.polygons);}
  const glyphBounds=A.bounds(deviceGuarded),guard=8*g.lw+10,x0=Math.min(-g.cw*.55-guard,glyphBounds.x0*1.1-20),x1=Math.max(g.cw*.55+g.k*.125+guard,glyphBounds.x1*1.1+20),y0=Math.min(-g.chh*.605-guard,glyphBounds.y0*1.21-20),y1=Math.max(g.chh*.605+g.k*.175+guard,glyphBounds.y1*1.21+20),source=rect(cd.x+x0,cd.y+y0,cd.x+x1,cd.y+y1),envelope=A.cameraEnvelope([source],{...plan,fx:cut.effectFx||plan.fx,style:cut.effectStyle||plan.style},cut,20);
  units.push({owner,source:{index:cd.index,text:cd.ch,ord:cd.ord,mainGlyphs:1,rankGlyphs:ranks.length,fontOutlines,localBounds:[x0,y0,x1,y1],attachment:'font+stroke+font guard support; device AA guard separately retained in complete stage envelope'},envelopes:[envelope]});
 }
 const allowedDecor=new Set();if(g.fieldRecipe){if(g.fieldDraws.length!==g.fieldCells.length||new Set(g.fieldDraws).size!==g.fieldCells.length||g.fieldCells.some(c=>!g.fieldDraws.includes(c.id)))fail('FLIPCARDS_FIELD_LEDGER','Exactly one physical draw per full field cell required');for(const c of g.fieldCells)if(c.assignedLyricIndex==null)allowedDecor.add(c.owner);
  const primaryItems=program.events.filter(e=>e.role==='primary'&&e.kind==='item'),paper=program.events.filter(e=>e.kind!=='item');if(primaryItems.length&&paper.some(e=>e.order>primaryItems[0].order))fail('FLIPCARDS_PAINT_ORDER','Every field paper/shape/shadow must precede original source rank/main glyphs');
 }else if(g.table){const rows=Math.max(...g.cards.map(c=>c.r))+1,per=Math.max(...g.cards.map(c=>c.cnt));for(const r of [-1,rows])for(let j=0;j<per;j++)allowedDecor.add('flipCards.table.'+r+'.'+j);}
 if(program.events.some(e=>e.role==='primary'&&!units.some(u=>u.owner===e.owner)||e.role!=='primary'&&(e.role!=='independentDecor'||!allowedDecor.has(e.owner))))fail('UNMEASURED_OWNER','Exact lyric primary and source-ledger literal ownership required');
 return {g,units,envelopes:units.flatMap(u=>u.envelopes),...(attachmentFailures.length?{error:{code:'CARD_ATTACHMENT_OVERFLOW',message:'Native guarded attachment failed; retain source geometry only for diagnostics and excluded fallback',details:attachmentFailures}}:{}),quality:{complete:true,sourceGlyphs:main.length,rankGlyphs:g.idx?main.length*2:0,minPrimaryPx:g.k*.6*g.fontScale*(cut.contentScale??1),minRankPx:g.idx?g.k*.15*g.fontScale*(cut.contentScale??1):null,nativeCardSize:g.k,physicalFontAttachment:attachmentFailures.length===0,nativeAttachmentFailures:attachmentFailures,deviceAA:'Conservative device-axis guards are stage/circle support, not a claim that guarded edge-on rectangles fit physical paper.'}};
}
// One regular source lattice covers the inverse viewport. Stock push is a
// centre-preserving zoom-in; base>=1 means [0,W]x[0,H] contains that viewport.
function domain(plan,cut){
 const fx=cut.effectFx||plan.fx,style=cut.effectStyle||plan.style,base=cut.contentScale??1,motion=cut.motionScale??1;
 if(cut.cam!=='push'||J.CAMERA.push?.get!==stockPush||!Number.isFinite(base)||base<1||base>4||!Number.isFinite(motion)||motion<0||motion>1||!Number.isFinite(fx.motion)||fx.motion<0||fx.motion>1||(style.ghost??0)>0||(fx.chroma??0)>0||(plan.events||[]).some(e=>e.type==='shake'||e.type==='chroma'))fail('FLIPCARDS_FULLSCREEN_CAMERA_DOMAIN','Full field currently requires unchanged stock push, contentScale1..4, motionScale0..1, fx.motion0..1, no ghost/chroma/shake');
 return {base,motion,fx,maxScale:base*Math.max(1,1+.03*Math.max(J.clamp(fx.motion*1.25,0,1.25),fx.motion)*motion,1.02)};
}
function gridCells(g,plan,grid){
 const sx=g.k*1.16,sy=g.chh+g.k*.16,{x,y}=grid;
 if(![x,y].every(Number.isFinite))fail('FLIPCARDS_FIELD_RECIPE','Finite lattice phase required');
 const c0=Math.floor((g.cw/2-x)/sx),c1=Math.ceil((plan.W-g.cw/2-x)/sx),r0=Math.floor((g.chh/2-y)/sy),r1=Math.ceil((plan.H-g.chh/2-y)/sy),nc=c1-c0+1,nr=r1-r0+1;
 if(![c0,c1,r0,r1,nc,nr].every(Number.isSafeInteger)||nc<1||nr<1||nc>512||nr>512||nc*nr>512)fail('FLIPCARDS_FIELD_CAPACITY','Full field cell ceiling512 before allocation');
 const cells=[];for(let row=r0;row<=r1;row++)for(let column=c0;column<=c1;column++)cells.push({id:'field.'+row+'.'+column,row,column,x:x+column*sx,y:y+row*sy});return cells;
}
function sourceEnvelope(source,cell,plan,cut){
 const b=source.localBounds,p=rect(cell.x+b[0],cell.y+b[1],cell.x+b[2],cell.y+b[3]);
 return A.cameraEnvelope([p],{...plan,fx:cut.effectFx||plan.fx,style:cut.effectStyle||plan.style},cut,20);
}
function clearPrimary(envelope,plan,regions){return envelope.every(v=>v[0]>=0&&v[0]<=plan.W&&v[1]>=0&&v[1]<=plan.H)&&regions.every(r=>A.clear([envelope],r.circle,Math.max(2,.005*Math.min(plan.W,plan.H))));}
function fontCore(source){
 const points=source.fontOutlines.flat();if(!points.length)fail('SOURCE_COVERAGE','Complete measured source font core required');
 return [Math.min(...points.map(p=>p[0]))*1.1,Math.min(...points.map(p=>p[1]))*1.21,Math.max(...points.map(p=>p[0]))*1.1,Math.max(...points.map(p=>p[1]))*1.21];
}
function primaryPair(a,b,g,base){
 const dx=Math.abs(a.x-b.x),sameRow=Math.abs(a.y-b.y)<=1e-7,paperHalf=.5*Math.sqrt(1.01)*g.k,faceGap=dx-2*paperHalf;
 const ac=fontCore(a.source),bc=fontCore(b.source),fontGap=dx-Math.max(Math.abs(ac[0]),Math.abs(ac[2]))-Math.max(Math.abs(bc[0]),Math.abs(bc[2]))-20/Math.min(1,base);
 return {kind:'same-row-physical-face-and-complete-font-core-vs-later-full-AA',sameRow,faceGap,fontGap,safe:sameRow&&faceGap>1e-7&&fontGap>1e-7,paperHalf,deviceGlyphGuard:20/Math.min(1,base)};
}
function pairLedger(trial,plan,cut){
 const g=trial.g,cells=g.fieldCells,{base}=domain(plan,cut);
 if(!g.fieldRecipe||!Array.isArray(cells)||cells.length>512)fail('FLIPCARDS_FIELD_LEDGER','Complete bounded full field required');
 const pathAA=10/Math.min(1,base),textAA=20/Math.min(1,base),outline=g.lw*Math.SQRT2/2*10+pathAA,flipBody=[-.55*g.k-outline,-.605*g.chh-outline,.675*g.k+outline,.605*g.chh+.175*g.k+outline],blankBody=[-g.cw/2-outline,-g.chh/2-outline,g.cw/2+g.k*.05+outline,g.chh/2+g.k*.07+outline],supports=[],primaryPairs=[];
 for(const cell of cells){const unit=cell.assignedLyricIndex==null?null:trial.units.find(u=>u.source.index===cell.assignedLyricIndex),ink=[];
  if(unit)ink.push(...unit.source.fontOutlines);else if(cell.origin==='native-table'&&g.peek)for(const text of ['？','★'])ink.push(...A.itemGeometry({text,font:cut.params.font,size:g.k*.46,x:0,y:0},ID,{pass:'main',scale:1}).inkPolygons);
  const points=ink.flat(),core=points.length?[Math.min(0,...points.map(v=>v[0]))*1.1,Math.min(0,...points.map(v=>v[1]))*1.21,Math.max(0,...points.map(v=>v[0]))*1.1,Math.max(0,...points.map(v=>v[1]))*1.21]:null,glyph=core?[core[0]-textAA,core[1]-textAA,core[2]+textAA,core[3]+textAA]:null;
  const body=unit||cell.origin==='native-table'&&g.peek?flipBody:blankBody,b=glyph?[Math.min(body[0],glyph[0]),Math.min(body[1],glyph[1]),Math.max(body[2],glyph[2]),Math.max(body[3],glyph[3])]:body;
  supports.push({cellId:cell.id,origin:cell.origin,assignedLyricIndex:cell.assignedLyricIndex??null,contentKind:cell.contentKind,bodyPhase:unit||cell.origin==='native-table'&&g.peek?'full-native-flip':'closed-p0',body:rect(cell.x+body[0],cell.y+body[1],cell.x+body[2],cell.y+body[3]),glyph:glyph?rect(cell.x+glyph[0],cell.y+glyph[1],cell.x+glyph[2],cell.y+glyph[3]):null,completeFontCore:core?rect(cell.x+core[0],cell.y+core[1],cell.x+core[2],cell.y+core[3]):null,bounds:[cell.x+b[0],cell.y+b[1],cell.x+b[2],cell.y+b[3]]});
 }
 const pairs=[];for(let i=0;i<supports.length;i++)for(let j=i+1;j<supports.length;j++){const a=supports[i],b=supports[j];if(a.assignedLyricIndex==null&&b.assignedLyricIndex==null)continue;
  const gap=Math.max(b.bounds[0]-a.bounds[2],a.bounds[0]-b.bounds[2],b.bounds[1]-a.bounds[3],a.bounds[1]-b.bounds[3]);pairs.push({a:a.cellId,b:b.cellId,gap,diagnosticOnly:true});
  if(a.assignedLyricIndex!=null&&b.assignedLyricIndex!=null){const ca=cells[i],cb=cells[j],proof=primaryPair({...ca,source:trial.units[a.assignedLyricIndex].source},{...cb,source:trial.units[b.assignedLyricIndex].source},g,base);primaryPairs.push({a:a.cellId,b:b.cellId,...proof});if(!proof.safe)fail('FLIPCARDS_PRIMARY_OCCLUSION','Same-row physical faces and complete-font-core versus later full glyph AA must remain separated');}
 }
 const x=cells.map(c=>c.x),y=cells.map(c=>c.y),columns=new Set(cells.map(c=>c.column)).size,rows=new Set(cells.map(c=>c.row)).size,extent=[Math.min(...x)-g.cw/2,Math.min(...y)-g.chh/2,Math.max(...x)+g.cw/2,Math.max(...y)+g.chh/2];
 if(columns*rows!==cells.length||extent[0]>0||extent[1]>0||extent[2]<plan.W||extent[3]<plan.H)fail('FLIPCARDS_VIEWPORT_COVERAGE','All intersecting regular lattice cells must cover viewport edges');
 return {kind:'fullscreen-field-two-pass-physical-face-and-complete-font-nonocclusion',space:'common stock push affine, scale.1..4',paintOrder:'all-paper-then-source-glyphs-v1',cells,supports,pairs,primaryPairs,coverage:{columns,rows,count:cells.length,extent,missingLatticeCells:0,inverseViewport:'stock push centre zoom-in with contentScale>=1; source viewport contains every inverse viewport'},fullRasterPairOverlapCount:pairs.filter(p=>p.gap<=1e-7).length,fullRasterPairsAreDiagnostic:true,rimHaloSeparation:false};
}
function searchField(template,plan,cut,regions,visit){
 const g=template.g,{base,maxScale}=domain(plan,cut),sx=g.k*1.16,sy=g.chh+g.k*.16,n=g.cards.length,bounds=template.units.map(u=>u.source.localBounds),lo=Math.min(...bounds.map(b=>b[0])),hi=Math.max(...bounds.map(b=>b[2])),top=Math.min(...bounds.map(b=>b[1])),bottom=Math.max(...bounds.map(b=>b[3]));
 const admissible=(size,l,h)=>({min:Math.max(...[base,maxScale].map(s=>size/2+(20-size/2)/s-l)),max:Math.min(...[base,maxScale].map(s=>size/2+(size-20-size/2)/s-h))}),xr=admissible(plan.W,lo,hi),yr=admissible(plan.H,top,bottom);
 if(xr.min>xr.max||yr.min>yr.max)return {nodes:0,candidates:0,phaseCount:0,reason:'complete-stage-envelope'};
 const nativeX=plan.W/2-(Math.max(...g.cards.map(c=>c.cnt))-1)*sx/2,nativeY=plan.H/2-(g.rows-1)*sy/2,phase=(x,anchor,pitch)=>x+Math.round((anchor-x)/pitch)*pitch,xPhases=[],yPhases=[];
 const add=(arr,x)=>{if(Number.isFinite(x)&&!arr.some(a=>Math.abs(a-x)<1e-7))arr.push(x);};
 const span=Math.floor((xr.max-xr.min)/sx);if(!Number.isSafeInteger(span)||span>512)fail('FLIPCARDS_SEARCH_CAPACITY','Bounded stage-native-pitch span required');
 for(let d=span;d>=Math.max(0,span-13);d--)add(xPhases,phase((xr.min+xr.max-d*sx)/2,nativeX,sx));add(xPhases,nativeX);add(xPhases,nativeX+sx/2);
 for(const y of [plan.H/2,(yr.min+yr.max)/2,nativeY,nativeY+sy/2])add(yPhases,phase(y,nativeY,sy));
 if(xPhases.length*yPhases.length>64)fail('FLIPCARDS_CANDIDATE_BUDGET','At most64 source-derived field phases');
 let nodes=0,candidates=0,done=false,budget=false;
 for(const x of xPhases){for(const y of yPhases){const grid={x,y},cells=gridCells(g,plan,grid),rows=Array.from(new Set(cells.map(c=>c.row))).sort((a,b)=>Math.abs(y+a*sy-plan.H/2)-Math.abs(y+b*sy-plan.H/2)||a-b);
  for(const row of rows){const line=cells.filter(c=>c.row===row);if(line.length<n)continue;
   const eligibility=template.units.map(u=>line.map(c=>clearPrimary(sourceEnvelope(u.source,c,plan,cut),plan,regions)));
   const chosen=[];
   const dfs=(i,from)=>{if(done||budget)return;if(nodes>=4096){budget=true;return;}nodes++;if(i===n){if(candidates>=64){budget=true;return;}candidates++;done=visit({strategy:'fullscreen-stationary-field-v3',fontScale:g.fontScale,grid,assignments:chosen.map(c=>c.id)});return;}
    for(let j=from;j<=line.length-(n-i);j++){if(!eligibility[i][j])continue;const c=line[j],candidate={...c,source:template.units[i].source};if(chosen.some((p,k)=>!primaryPair({...p,source:template.units[k].source},candidate,g,base).safe))continue;chosen.push(c);dfs(i+1,j+1);chosen.pop();if(done||budget)return;}
   };dfs(0,0);if(done||budget)break;
  }if(done||budget)break;
 }if(done||budget)break;}
 return {nodes,candidates,phaseCount:xPhases.length*yPhases.length,budgetExhausted:budget};
}
function finalize({plan,cut,revision,stepDur,reachTail,explicitSize}){
 if(cut.enter!=='cut'||cut.exit!=='cut'||cut.hold!=='still'||cut.treat!=='none'||!['ltr','random'].includes(cut.params.order)||!['accent','ink'].includes(cut.params.back)||['table','peek','idx'].some(k=>typeof cut.params[k]!=='boolean'))fail('UNSUPPORTED_PARAMETER_RANGE','Native flipCards cut/cut/still, no treatment and original boolean/order/back parameters required');
 const count=[...norm(cut.text)].length;if(count<1||count>14)fail('UNSUPPORTED_PARAMETER_RANGE','Native flipCards1..14 lyric glyphs required');
 domain(plan,cut);const capability=A.layoutsDProjectionCapability?.('flipCards-face');if(capability?.version!==1||capability.kind!=='finite-forward-text')fail('D_FINITE_PROJECTION_PENDING','Unchanged narrow finite-forward projection bridge required');
 const renderer=Object.create(J.Renderer.prototype),native=proof(renderer,plan,cut,true),evaluationRange=[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail],rawRegions=plan.lyricAvoidanceIndex.regions;
 if(!Array.isArray(rawRegions)||rawRegions.length>64)fail('UNSUPPORTED_PARAMETER_RANGE','At most64 regions before source region allocation');
 const regions=rawRegions.map((r,i)=>({start:r.start,end:Math.min(r.end??rawRegions[i+1]?.start??plan.duration,plan.duration),region:r.id,circle:{cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)}})).filter(r=>r.start<evaluationRange[1]&&r.end>evaluationRange[0]&&r.end>r.start),attempts=[],searches=[];
 if(!regions.length)fail('UNSUPPORTED_PARAMETER_RANGE','One to64 active avoidance regions required');
 const sx=native.g.k*1.16,sy=native.g.chh+native.g.k*.16,seedGrid={x:plan.W/2-(Math.max(...native.g.cards.map(c=>c.cnt))-1)*sx/2,y:plan.H/2-(native.g.rows-1)*sy/2},seedCells=gridCells(native.g,plan,seedGrid);
 let chosen=null;for(const fontScale of explicitSize?[1]:[1,.95,.9,.85,.8,.75]){try{
   if(seedCells.length<count)fail('FLIPCARDS_FIELD_CAPACITY','Full field has fewer cells than source owners');
   const template=proof(renderer,plan,{...cut,layoutDRecipe:{strategy:'fullscreen-stationary-field-v3',fontScale,grid:seedGrid,assignments:seedCells.slice(0,count).map(c=>c.id)}});
   if(template.quality.minPrimaryPx<Math.min(native.quality.minPrimaryPx,Math.max(18,.035*Math.min(plan.W,plan.H)))-1e-7||native.quality.minRankPx!=null&&template.quality.minRankPx<Math.min(native.quality.minRankPx,12)-1e-7)fail('READABILITY_FLOOR','Native primary/rank readable floor required');
   const search=searchField(template,plan,cut,regions,recipe=>{try{const trial=proof(renderer,plan,{...cut,layoutDRecipe:recipe});if(!trial.envelopes.every(p=>clearPrimary(p,plan,regions))){attempts.push({recipe,status:'insufficient-space',reason:'complete-primary-stage-or-circle-envelope'});return false;}
     const ledger=pairLedger(trial,plan,cut);chosen={trial,recipe,ledger};attempts.push({recipe,status:'safe',reason:'one full viewport field, fixed source assignment, complete primary and two-pass font/physical-face proofs'});return true;
    }catch(e){attempts.push({recipe,status:'unsupported',reason:e.code||'DRAW_PROGRAM_ERROR',details:e.message});return false;}});searches.push({fontScale,...search});
  }catch(e){attempts.push({fontScale,status:'unsupported',reason:e.code||'DRAW_PROGRAM_ERROR',details:e.message});}if(chosen)break;}
 const selected=chosen?.trial||native,segments=regions.map(r=>({...r,from:[0,0],to:[0,0],status:chosen?'safe':'insufficient-space',decision:chosen?'certified':'excluded-during-avoidance',composition:chosen?.recipe||null,envelopes:selected.envelopes,unitProofs:selected.units,fieldLedger:chosen?.ledger||null,attempts}));
 return {kind:'layouts-d-source-native',version:1,revision,evaluationRange,measurementSupported:true,units:[{owner:'flipCards.composition',segments}],sourceProof:{kind:'analytic-card-face-and-glyph-projection-intervals',coverage:native.quality,nativeAttachmentStatus:native.error?'unsupported-native-attachment':'complete',selectedAttachment:'Unchanged complete font/stroke/font-space attachment required; native failure never selected safe',projection:capability,interval:'Unchanged full-phase primary card/glyph/rank/shadow rectangles and cameraEnvelope(...,20), scale.1..4',chronology:'Original count/order/seed/ord/ti/fd/gapT/appear/po/mi retained; ON all paper then original source glyph groups',field:'Full source-derived regular field; every original lyric assigned once; literal p0 blanks contain no latent lyric; original table literal peeks share whole-grid phase and original clocks',paintOrder:'all-paper-then-source-glyphs-v1',pairContract:'Physical paper cores and complete-font-core versus later glyph full AA separated; both-object AA halos may overlap; circle/stage all original full AA retained',cameraDomain:'Unchanged stock push with contentScale1..4 and nonnegative motion0..1; inverse viewport contained in source stage',explicitSizePreserved:explicitSize,candidateBudget:{fontLevels:explicitSize?1:6,maxPhases:64,maxAssignmentsPerFont:64,maxAttempts:384,maxFieldCells:512,maxRegions:64,maxOwners:14,maxSearchNodesPerFont:4096},searches,attemptCount:attempts.length},safety:chosen?'certified-bounded-adapter':'insufficient-space'};
}

const contains=(p,poly)=>{let pos=false,neg=false;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],v=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(v>1e-5)pos=true;if(v< -1e-5)neg=true;}return !(pos&&neg);};
function render({renderer,env,trajectory}){
 A.validateFinal(env.plan);domain(env.plan,env.cut);const scale=env.scale??1;if(!Number.isFinite(scale)||scale<.1||scale>4)fail('UNSUPPORTED_RENDER_SCALE','FlipCards certified scale .1..4 required');const unit=trajectory.units[0],active=unit.segments.find(s=>s.start<=env.realTime&&env.realTime<s.end),offset=A.offsetAt(unit,env.realTime);if(active?.status==='insufficient-space')fail('FLIPCARDS_COMPOSITION_EXCLUDED','No common full viewport field assignment satisfies complete primary and two-pass physical/font proofs');if(offset.some(v=>v!==0))fail('FLIPCARDS_FIELD_MOVED','Stationary field requires fixed zero offset');if(active?.composition){const cut={...env.cut,layoutDRecipe:active.composition};env=renderer.makeEnv(env.ctx,env.plan,cut,env.sc,{...env,cut});}
 const program=A.record(renderer,env);if(!program.measurementSupported)fail('UNSUPPORTED_MEASUREMENT',JSON.stringify(program.diagnostics));const primary=program.events.filter(e=>e.role==='primary').map(event=>({event,polygons:event.polygons.map(p=>p.map(v=>[v[0]/scale,v[1]/scale]))})),covered=!active||primary.every(({event,polygons})=>{const proof=active.unitProofs.find(u=>u.owner===event.owner);return proof&&polygons.every(p=>proof.envelopes.some(q=>p.every(v=>contains(v,q))));});if(!covered)fail('D_ENVELOPE_VIOLATION','Actual primary card/glyph/rank event escaped its complete source interval');
 const polygons=primary.flatMap(e=>e.polygons.map(p=>p.map(v=>[v[0]+offset[0],v[1]+offset[1]]))),region=J.resolveAvoidanceAt(env.plan,env.realTime),circle=region?J.avoidanceCirclePixels(region,env.plan.W,env.plan.H):null,clear=!polygons.length||A.clear(polygons,circle,Math.max(2,.005*Math.min(env.plan.W,env.plan.H))),stageContained=polygons.every(p=>p.every(v=>v[0]>=0&&v[0]<=env.plan.W&&v[1]>=0&&v[1]<=env.plan.H));if(active?.status==='safe'&&(!clear||!stageContained))fail('D_SOURCE_SAFETY_VIOLATION','Actual lyric card/glyph/rank ink escaped stage or active circle');
 env.placementObservation?.({cut:env.cut.index,realTime:env.realTime,motionTime:env.t,pass:env.pass,offset,measurementSupported:true,envelopeCovered:covered,stageContained,strictCircleClear:clear,safety:active?.status==='insufficient-space'?'conflict':clear?'safe':'conflict',polygons,events:program.events.map(e=>({kind:e.kind,role:e.role,owner:e.owner,order:e.order,polygons:e.polygons}))});A.replay(env,program,offset);
}
A.registerLayoutsDAdapter('flipCards',{id:'flipCards-fullscreen-field-v3',finalize,render});
})();
