/* AVOID-005 opt-in adapters. Continuous layout sweeps, never frame-sampled admission. */
(() => {
'use strict';
const A=J.placement,ID=[1,0,0,1,0,0],rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
A.basicLayouts=['center','mixed','vcols','marquee','tile','scatter','wave','huge','labels','condensed','gloss','type','diag','circle','stack','pill'];
const bounds=ps=>A.bounds(ps),fail=(code,message)=>{const e=new Error(message);e.code=code;throw e;};
// Per-solve compiled edges are local; the bounded value cache below owns copies.
// Translation is evaluated by moving the circle, avoiding polygon allocations.
function compileCircleClear(polygons){
 A.bounds(polygons);const prepared=polygons.map(p=>({box:bounds([p]),edges:p.map((b,i)=>{const a=p[(i+p.length-1)%p.length],dx=b[0]-a[0],dy=b[1]-a[1];return [a[0],a[1],b[0],b[1],dx,dy,dx*dx+dy*dy];})}));
 return (cx,cy,r)=>{const R2=r*r;for(const {box:b,edges}of prepared){const bx=cx-Math.max(b.x0,Math.min(b.x1,cx)),by=cy-Math.max(b.y0,Math.min(b.y1,cy));if(bx*bx+by*by>R2)continue;let inside=false;for(const [ax,ay,bx,by,dx,dy,l]of edges){const dot=(cx-ax)*dx+(cy-ay)*dy,u=l?Math.max(0,Math.min(1,dot/l)):0,x=cx-ax-u*dx,y=cy-ay-u*dy;if(x*x+y*y<=R2)return false;if((ay>cy)!==(by>cy)&&cx<(bx-ax)*(cy-ay)/(by-ay)+ax)inside=!inside;}if(inside)return false;}return true;};
}
// Circle-aware finite candidate search. Local corner fits are admitted: this does
// not divide the free stage into the four rectangles outside the circle's bbox.
const solveBasicRaw=(polygons,circle,W,H,seed=0,options={})=>{
 const b=options.fitBounds||bounds(polygons),margin=Math.max(2,.005*Math.min(W,H)),eps=.0001;
 const fits=d=>b.x0+d[0]>=0&&b.y0+d[1]>=0&&b.x1+d[0]<=W&&b.y1+d[1]<=H;
 const prepared=compileCircleClear(polygons);
 const clear=d=>(!circle||prepared(circle.cx-d[0],circle.cy-d[1],circle.r+margin))&&(!options.accept||options.accept(d));
 if(fits([0,0])&&clear([0,0]))return {offset:[0,0],status:'safe',direction:'unchanged'};
 const clamp=d=>[Math.max(-b.x0,Math.min(W-b.x1,d[0])),Math.max(-b.y0,Math.min(H-b.y1,d[1]))];
 if(b.x1-b.x0>W||b.y1-b.y0>H)return {offset:[0,0],status:'insufficient-space',reason:'unit-envelope-exceeds-stage'};
 const points=polygons.flat(),candidates=[clamp([0,0])],preferred=J.r(seed,51),band=circle?circle.cy/H:.5;
 if(circle){const supportHull=options.supportHull?A.convexHull(points):null,supportPoints=supportHull?.length>=3?supportHull:points,relativeX=new Float64Array(supportPoints.length),relativeY=new Float64Array(supportPoints.length);for(let i=0;i<supportPoints.length;i++){relativeX[i]=supportPoints[i][0]-circle.cx;relativeY[i]=supportPoints[i][1]-circle.cy;}const normals=Array.from({length:72},(_,i)=>[Math.cos(i*Math.PI/36),Math.sin(i*Math.PI/36)]);
  for(const polygon of polygons)for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len)normals.push([-dy/len,dx/len],[dy/len,-dx/len]);}
  const normalOffsets=new Map();
  for(const n of normals){
   const key=n.map(v=>Object.is(v,-0)?'-0':String(v)).join(',');let offset=normalOffsets.get(key);
   if(!offset){let support=Infinity;for(let i=0;i<relativeX.length;i++)support=Math.min(support,relativeX[i]*n[0]+relativeY[i]*n[1]);
    const distance=Math.max(0,circle.r+margin+eps-support);offset=clamp(n.map(v=>v*distance));normalOffsets.set(key,offset);}
   // Retain every original candidate position/order, including the final
   // offset-Map winner's signed zeros; only repeated support work is reused.
   candidates.push(offset);
  }
 }
 // Include stage corners and circle-adjacent corner placements even when the
 // support-plane candidate is too conservative for an actual polygon corner.
 const xs=[-b.x0,W-b.x1,0],ys=[-b.y0,H-b.y1,0];
 if(circle){xs.push(circle.cx-circle.r-margin-b.x1-eps,circle.cx+circle.r+margin-b.x0+eps);ys.push(circle.cy-circle.r-margin-b.y1-eps,circle.cy+circle.r+margin-b.y0+eps);}
 for(const x of xs)for(const y of ys)candidates.push([x,y]);
 const direction=d=>Math.abs(d[0])>Math.abs(d[1])?(d[0]<0?'left':'right'):(d[1]<0?'above':'below');
 const directions=directionPreference(circle||{cx:W/2,cy:H/2,r:0},W,H,seed);
 const favored=directions[0];
 const cost=d=>Math.hypot(...d)+(direction(d)===favored?0:Math.min(W,H)*.5)+(directions.includes(direction(d))?0:Math.max(W,H)*4);
 const ranked=[...new Map(candidates.map(d=>[d.join(','),d])).values()].map(d=>({d,cost:cost(d)})).sort((a,b)=>a.cost-b.cost);
 for(const {d} of ranked)if(fits(d)&&clear(d))return {offset:d,status:'safe',direction:direction(d)};
 return {offset:[0,0],status:'insufficient-space',reason:'bounded-candidate-search-exhausted'};
};
// Pure value reuse across repeated planning. Callback-constrained solves bypass
// this cache because their semantic constraints are not represented by geometry.
let solverRevision=-1,solverBytes=0,solverHits=0,solverMisses=0;const solverCache=new Map(),MAX_SOLVES=8192,MAX_SOLVE_BYTES=8*1024*1024;
A.solveBasic=(polygons,circle,W,H,seed=0,options={})=>{
 if(options.accept)return solveBasicRaw(polygons,circle,W,H,seed,options);
 const revision=J.metrics.revision||0;if(revision!==solverRevision){solverCache.clear();solverBytes=0;solverRevision=revision;}
 const key=JSON.stringify({revision,polygons,circle,W,H,seed,fitBounds:options.fitBounds,...(options.supportHull?{supportHull:true}:{})});let cached=solverCache.get(key);
 if(cached){solverHits++;solverCache.delete(key);solverCache.set(key,cached);return cached.result;}
 solverMisses++;const result=ownFrozen(solveBasicRaw(polygons,circle,W,H,seed,options)),bytes=key.length*2+JSON.stringify(result).length*2;
 if(bytes<=MAX_SOLVE_BYTES){while(solverCache.size>=MAX_SOLVES||solverBytes+bytes>MAX_SOLVE_BYTES){const oldest=solverCache.keys().next().value;solverBytes-=solverCache.get(oldest).bytes;solverCache.delete(oldest);}solverCache.set(key,{result,bytes});solverBytes+=bytes;}
 return result;
};
A.solverCacheStats=()=>({revision:solverRevision,entries:solverCache.size,hits:solverHits,misses:solverMisses,serializedBytes:solverBytes,maxEntries:MAX_SOLVES,maxSerializedBytes:MAX_SOLVE_BYTES});
/* The rectangle/circle Minkowski boundary is extended outside each tangent.
   The guard joins the stage edge continuously; there is no clear/colliding jump.
   For g<R the nearest point has squared distance g²+(cy-y-h)² >= R².
   For g>=R horizontal separation alone proves clearance. */
A.basicRouteLimit=(x,halfWidth,halfHeight,circle,axisLength,perpLength,side)=>{
 const swapped=side==='left'||side==='right',near=side==='above'||side==='left';
 const c=swapped?{cx:circle.cy,cy:circle.cx,r:circle.r}:circle;
 const cy=near?c.cy:perpLength-c.cy;
 const gap=Math.max(0,Math.abs(x-c.cx)-halfWidth),R=c.r;
 const arc=gap<R?cy-halfHeight-Math.sqrt(Math.max(0,R*R-gap*gap)):
  cy-halfHeight+(perpLength-cy)*Math.min(1,(gap-R)/Math.max(1,R));
 return near?arc:perpLength-arc;
};
A.basicRoutePoint=(native,route)=>{
 const {circle,W,H,side,halfWidth:w,halfHeight:h}=route,swap=side==='left'||side==='right',near=side==='above'||side==='left';
 const a=swap?H:W,b=swap?W:H,x=route.nativeCropAxis?(swap?native[1]:native[0]):J.clamp(swap?native[1]:native[0],w,a-w),y0=J.clamp(swap?native[0]:native[1],h,b-h);
 const limit=A.basicRouteLimit(x,w,h,circle,a,b,side),y=near?Math.min(y0,limit):Math.max(y0,limit);
 if(y<h-1e-7||y>b-h+1e-7)fail('INSUFFICIENT_ROUTE_DOMAIN','Selected continuous route has no visible passage');
 return swap?[y,x]:[x,y];
};
// The side is fixed for an entire avoidance interval. These are universal bounds
// on the entire route domain, rather than samples of its animated evaluation.
A.certifyBasicRoute=route=>{
 const {W,H,circle,side,halfWidth:w,halfHeight:h}=route,swap=side==='left'||side==='right',near=side==='above'||side==='left',a=swap?H:W,b=swap?W:H;
 if(![W,H,circle.cx,circle.cy,circle.r,w,h].every(Number.isFinite)||w<=0||h<=0||2*w>a||2*h>b)return false;
 const center=swap?circle.cy:circle.cx,x=J.clamp(center,w,a-w),limit=A.basicRouteLimit(x,w,h,circle,a,b,side);
 return near?limit>=h:limit<=b-h;
};
function directionPreference(circle,W,H,seed){
 const band=circle.cy/H,all=['left','right','above','below'],weights=all.map(d=>d==='above'?Math.max(.05,1-Math.max(0,.45-band)*5):d==='below'?Math.max(.05,1-Math.max(0,band-.55)*5):1);
 let p=J.r(seed,51)*weights.reduce((a,b)=>a+b,0),chosen=0;for(;chosen<3&&p>=weights[chosen];chosen++)p-=weights[chosen];
 return [all[chosen],...all.filter((_,i)=>i!==chosen)];
}
function prepareWave(plan,cut,program,evaluationRange,revision){
 const items=program.events.filter(e=>e.role==='primary'&&e.kind==='item');
 if(!items.length||items.some(e=>e.kind!=='item'))fail('UNSUPPORTED_MEASUREMENT','Wave requires measured glyph draw events');
 const main=items.filter(e=>e.args[0].placementMain),P=cut.params,n=[...cut.text.replace(/\s+/g,'')].length;
 if(main.length!==n)fail('UNSUPPORTED_MEASUREMENT','Wave main glyph sequence is incomplete');
 let halfWidth=0,halfHeight=0;
 const angle=Math.atan(Math.abs(plan.H*P.amp*J.TAU*P.freq/plan.W))+(cut.cam==='dutch'?5*J.DEG:0),maxScale=(cut.contentScale??1)*Math.max(1.02,1+.03*Math.max(J.clamp((plan.fx.motion??.7)*1.25,0,1.25),plan.fx.motion??.7)*(cut.motionScale??1));
 const extrema=(x,y,vertical)=>{const candidates=[-angle,0,angle],root=vertical?Math.atan2(x,y):Math.atan2(-y,x);for(let k=-2;k<=2;k++){const a=root+k*Math.PI;if(a>=-angle&&a<=angle)candidates.push(a);}return Math.max(...candidates.map(a=>Math.abs(vertical?x*Math.sin(a)+y*Math.cos(a):x*Math.cos(a)-y*Math.sin(a))));};
 const centers={};
 for(const e of items){const it=e.args[0],ink=A.itemGeometry({...it,x:0,y:0,rot:0},ID,{scale:1,pass:'main'}),box=bounds(ink.inkPolygons),center=[(box.x0+box.x1)/2,(box.y0+box.y1)/2];centers[e.key]=center;for(const p of ink.inkPolygons.flat()){const q=p.map((v,i)=>v-center[i]);halfWidth=Math.max(halfWidth,extrema(...q,false));halfHeight=Math.max(halfHeight,extrema(...q,true));}}
 halfWidth=halfWidth*maxScale+20;halfHeight=halfHeight*maxScale+20;
 const stride=Math.max(main[0].args[0].size*1.05,2*halfWidth+1),width=(n-1)*stride+2*halfWidth;
 // Main glyph cells are disjoint. Native trailing copies can cross cells and
 // the original canvas boundary; their ordered phase offsets stay unchanged.
 const domainFits=width<=plan.W;
 const radius=Math.hypot(halfWidth,halfHeight);
 const units=items.map(e=>({owner:e.owner,key:e.key,localCenter:centers[e.key]})),segments=[],solutions=new Map();
 for(let i=0;i<plan.lyricAvoidanceIndex.regions.length;i++){
  const r=plan.lyricAvoidanceIndex.regions[i],end=Math.min(r.end??plan.lyricAvoidanceIndex.regions[i+1]?.start??plan.duration,plan.duration);
  if(r.start>=evaluationRange[1])break;if(end<=evaluationRange[0]||end<=r.start)continue;
  const circle={cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)+Math.max(2,.005*Math.min(plan.W,plan.H))+.0001};
  const sides=directionPreference(circle,plan.W,plan.H,J.h(cut.seed,581)).filter(s=>s==='above'||s==='below');
  const key=JSON.stringify(circle);let side=solutions.get(key);if(side===undefined){side=domainFits&&sides.find(side=>A.certifyBasicRoute({circle,W:plan.W,H:plan.H,side,halfWidth,halfHeight}))||null;solutions.set(key,side);}
  segments.push({start:r.start,end,circle,side:side||null,status:side?'safe':'insufficient-space',region:r.id});
 }
 return {version:1,kind:'ordered-wave-route',revision,evaluationRange,units,segments,radius,halfWidth,halfHeight,stride,width,n,measurementSupported:true,safety:segments.every(s=>s.status==='safe')?'certified-continuous-route':'insufficient-space',proof:'universal-Minkowski-boundary; disjoint main glyph x intervals; strict phase order for native trails'};
}
function overlapBounds(a,b){return a.x0<b.x1&&b.x0<a.x1&&a.y0<b.y1&&b.y0<a.y1;}
// Stack is a single repetition run. A joint affine progression keeps every
// adjacent native anchor equally spaced; rows themselves are never resized,
// rotated, reordered, or independently placed. Search only a bounded family:
// native vertical spacing, then 75–87.5% vertical spacing with horizontal
// increments bounded by 25% stage width and twice the native copy distance. The complete camera/ghost/AA envelopes, not
// anchor samples, certify every candidate for the whole evaluation interval.
function solveStack(units,circle,plan,cut){
 const anchors=units.map(u=>u.stackAnchor),n=units.length;
 if(n<2||anchors.some(p=>!p))return units.map(()=>({offset:[0,0],status:'insufficient-space',reason:'stack-anchor-metadata-incomplete'}));
 const native=anchors[1].map((v,i)=>v-anchors[0][i]),length=Math.hypot(...native),cy=(n-1)/2;
 const boxes=units.map(u=>bounds([u.envelope])),area=(a,b)=>Math.max(0,Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0))*Math.max(0,Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0));
 const candidates=[];
 // Favor a gentle diagonal with original vertical spacing before tilting the
 // progression; the latter keeps at least half the camera-scaled y step.
 for(const factor of [.25,-.25,.5,-.5,.75,-.75,1,-1])candidates.push([native[0]+length*factor,native[1]]);
 for(const y of [.875,.75])for(const factor of [1, -1, 1.5, -1.5, 2, -2])candidates.push([native[0]+Math.sign(factor)*Math.min(plan.W*.25,length*Math.abs(factor)),native[1]*y]);
 for(const step of candidates){
  const angle=cut.cam==='dutch'?5*J.DEG:0,minY=(Math.abs(native[1])*Math.cos(angle)-Math.abs(native[0])*Math.sin(angle))*(cut.contentScale??1);
  if(minY<=0||minY+Math.sign(native[1])*(step[1]-native[1])<minY*.5)continue;
  const offsets=units.map((_,i)=>step.map((v,j)=>(v-native[j])*(i-cy)));
  const polygons=units.map((u,i)=>u.envelope.map(p=>p.map((v,j)=>v+offsets[i][j])));
  // Native layering is intentional, but avoidance may not increase any pair's
  // overlap. In particular a tilted run may not collapse wide rows together.
  const moved=polygons.map(p=>bounds([p]));let readable=true;
  for(let i=0;i<n;i++)for(let j=0;j<i;j++)if(area(moved[i],moved[j])>area(boxes[i],boxes[j])+1e-6)readable=false;
  if(!readable)continue;
  const solution=A.solveBasic(polygons,circle,plan.W,plan.H,J.h(cut.seed,581));
  if(solution.status==='safe')return offsets.map(offset=>({...solution,offset:offset.map((v,j)=>v+solution.offset[j]),proof:{kind:'joint-stack-progression',nativeStep:native,step,copyCount:n,rule:'constant adjacent anchor displacement; native y order; no increased pairwise envelope overlap; full continuous envelope containment and circle clearance'}}));
 }
 return units.map(()=>({offset:[0,0],status:'insufficient-space',reason:'joint-stack-candidate-family-exhausted'}));
}
function orderedStaticSolutions(units,circle,plan,cut){
 const W=plan.W,H=plan.H,seed=J.h(cut.seed,581),boxes=units.map(u=>bounds([u.envelope]));
 const fitBounds=cut.layout==='diag'?units[0].fitBounds:undefined;
 const whole=A.solveBasic(units.map(u=>u.envelope),circle,W,H,seed,{fitBounds});
 if(whole.status==='safe')return units.map(()=>whole);
 if(cut.layout==='stack')return solveStack(units,circle,plan,cut);
 // Attachments already share an owner. Only an actual glyph reading run has
 // inter-owner order; whole-phrase repetitions and scatter captions are separate
 // phrases, so a bbox overlap does not turn them into one indivisible object.
 const groups=units.map((_,i)=>[i]);
 const isRun=i=>cut.layout==='mixed'||cut.layout==='scatter'&&units[i].owner.startsWith('scatter.unit.');
 groups.sort((a,b)=>Number(isRun(b[0]))-Number(isRun(a[0]))||((boxes[b[0]].x1-boxes[b[0]].x0)*(boxes[b[0]].y1-boxes[b[0]].y0)-(boxes[a[0]].x1-boxes[a[0]].x0)*(boxes[a[0]].y1-boxes[a[0]].y0)));
 const chosen=[],result=units.map(()=>({offset:[0,0],status:'insufficient-space',reason:'ordered-owner-candidate-family-exhausted'}));
 const intersection=(a,b)=>Math.max(0,Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0))*Math.max(0,Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0));
 const moved=(b,d)=>({x0:b.x0+d[0],x1:b.x1+d[0],y0:b.y0+d[1],y1:b.y1+d[1]});
 for(const g of groups){
  const accept=d=>chosen.every(({indices,offset})=>g.every(a=>indices.every(b=>{
   const next=moved(boxes[a],d),prev=moved(boxes[b],offset),oldArea=intersection(boxes[a],boxes[b]),newArea=intersection(next,prev);
   if(newArea>oldArea+1e-6)return false;
   const dx=(boxes[a].x0+boxes[a].x1-boxes[b].x0-boxes[b].x1)/2,dy=(boxes[a].y0+boxes[a].y1-boxes[b].y0-boxes[b].y1)/2;
   const nx=(next.x0+next.x1-prev.x0-prev.x1)/2,ny=(next.y0+next.y1-prev.y0-prev.y1)/2;
   if(Math.hypot(nx,ny)<Math.min(Math.hypot(dx,dy)*.5,Math.min(W,H)*.02))return false;
   return !isRun(a)||!isRun(b)||dx*nx>0;

  })));
  const solution=A.solveBasic(g.map(i=>units[i].envelope),circle,W,H,seed,{accept});
  if(solution.status!=='safe')return result;
  chosen.push({indices:g,offset:solution.offset});for(const i of g)result[i]=solution;
 }
 return result;
}
function orbitCertificate(plan,cut,circle,offset=[0,0]){
 const P=cut.params,R=Math.min(plan.H*.3,plan.W*.36),fs=Math.min(plan.H*.062,plan.W*.052),text=cut.text.replace(/\s+/g,'');
 let words=P.unit==='char'?[...text].filter(c=>!J.isPunct(c)):(cut.words?.length?cut.words:[text]);if(!words.length)words=[text];
 const halfWidth=Math.max(...words.map(text=>{const m=J.measure({text,font:P.font,size:fs,track:.04});return (m.w+fs*.7)*1.133/2;})),halfHeight=fs*1.36*1.133/2;
 const motion=cut.motionScale??1,fx=plan.fx,K=J.clamp((fx.motion??.7)*1.25,0,1.25),base=cut.contentScale??1,maxScale=base*Math.max(1.02,1+.03*Math.max(K,fx.motion??.7)*motion),events=plan.events||[];
 const chroma=(fx.chroma??.7)*(plan.style.ghost??1)*(1+events.filter(e=>e.type==='chroma').reduce((n,e)=>n+e.amp,0)+.9),shake=events.filter(e=>e.type==='shake').reduce((n,e)=>n+e.amp,0);
 const dx=(['panL','panR'].includes(cut.cam)?plan.W*Math.abs(cut.camP?.a||.022)*K*motion:0)+(3.4*chroma+16*shake)*plan.H/1080*motion,dy=(1.9*chroma+11*shake)*plan.H/1080*motion;
 const drift=Math.hypot(dx,dy),ink=10,d=Math.hypot(plan.W/2+offset[0]-circle.cx,plan.H/2+offset[1]-circle.cy),inner=cut.params.center==='word'?0:Math.max(0,R-halfWidth)*base,outer=Math.hypot(R+halfWidth,halfHeight)*maxScale;
 const centerDistance=d>=inner&&d<=outer?0:Math.min(Math.abs(d-inner),Math.abs(d-outer));
 return {safe:centerDistance>circle.r+Math.max(2,.005*Math.min(plan.W,plan.H))+ink+drift&&outer+ink+drift<=Math.min(plan.W/2+offset[0],plan.W/2-offset[0],plan.H/2+offset[1],plan.H/2-offset[1]),R,inner,outer,halfWidth,halfHeight,ink,drift,centerDistance,proof:'full continuous native orbit annulus; radial plate width and tangential height, bounded camera scale/translation/AA'};
}
function solveOrbit(plan,cut,circle){
 const base=orbitCertificate(plan,cut,circle),pad=base.outer+base.ink+base.drift,x0=pad-plan.W/2,x1=plan.W/2-pad,y0=pad-plan.H/2,y1=plan.H/2-pad;
 if(x0>x1||y0>y1)return null;
 const clamp=d=>[J.clamp(d[0],x0,x1),J.clamp(d[1],y0,y1)],candidates=[clamp([0,0])];
 for(const x of [x0,x1,0])for(const y of [y0,y1,0])candidates.push(clamp([x,y]));
 const R=circle.r+Math.max(2,.005*Math.min(plan.W,plan.H))+base.outer+base.ink+base.drift+.0001;
 for(let i=0;i<72;i++){const a=i*Math.PI/36;candidates.push(clamp([circle.cx+R*Math.cos(a)-plan.W/2,circle.cy+R*Math.sin(a)-plan.H/2]));}
 const preferred=directionPreference(circle,plan.W,plan.H,J.h(cut.seed,581))[0],direction=d=>Math.abs(d[0])>Math.abs(d[1])?(d[0]<0?'left':'right'):(d[1]<0?'above':'below');
 candidates.sort((a,b)=>Math.hypot(...a)-Math.hypot(...b)+(direction(a)===preferred?0:Math.min(plan.W,plan.H)*.5)-(direction(b)===preferred?0:Math.min(plan.W,plan.H)*.5));
 for(const offset of candidates){const proof=orbitCertificate(plan,cut,circle,offset);if(proof.safe)return {offset,status:'safe',direction:offset.every(v=>v===0)?'unchanged':direction(offset),proof};}
 return null;
}
function hull(points){const sorted=points.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),out=[];for(let i=0;i<sorted.length;i++){const p=sorted[i];while(out.length>1&&cross(out[out.length-2],out[out.length-1],p)<=0)out.pop();out.push(p);}out.pop();const lowerLength=out.length;for(let i=sorted.length-1;i>=0;i--){const p=sorted[i];while(out.length>lowerLength+1&&cross(out[out.length-2],out[out.length-1],p)<=0)out.pop();out.push(p);}out.pop();return out;}

function prepareHuge(plan,cut,program,evaluationRange,revision){
 const grouped={};for(const e of program.events)if(e.role==='primary'&&e.polygons.length)(grouped[e.owner]||=[]).push(e);
 const base=cut.contentScale??1,K=J.clamp((plan.fx.motion??.7)*1.25,0,1.25),maxScale=base*Math.max(1.02,1+.03*Math.max(K,plan.fx.motion??.7)*(cut.motionScale??1)),angle=cut.cam==='dutch'?5*J.DEG:0,slack=5;
 const units=Object.entries(grouped).map(([owner,events])=>{
  const e=events[0],b=bounds(events.flatMap(e=>e.polygons)),anchor=[(b.x0+b.x1)/2,(b.y0+b.y1)/2],anchorOffset=e.anchor?anchor.map((v,i)=>v-e.anchor[i]):[0,0],points=events.flatMap(e=>(e.inkPolygons||e.polygons).flat()).map(p=>[p[0]-anchor[0],p[1]-anchor[1]]);
  let x=0,y=0;for(const p of points){const candidates=[-angle,0,angle];for(const root of [Math.atan2(-p[1],p[0]),Math.atan2(p[0],p[1])])for(let k=-2;k<=2;k++){const a=root+k*Math.PI;if(a>=-angle&&a<=angle)candidates.push(a);}for(const a of candidates){x=Math.max(x,Math.abs(p[0]*Math.cos(a)-p[1]*Math.sin(a)));y=Math.max(y,Math.abs(p[0]*Math.sin(a)+p[1]*Math.cos(a)));}}
  const halfWidth=x*maxScale+20,halfHeight=y*maxScale+20;
  return {owner,key:owner,nativeAnchor:anchor,anchorOffset,halfWidth,halfHeight,routeHalfWidth:halfWidth+slack,routeHalfHeight:halfHeight+slack,glyphIndex:e.args[0]?.placementGlyphIndex??null};
 });
 const main=units.filter(u=>u.glyphIndex!=null).sort((a,b)=>a.glyphIndex-b.glyphIndex),caption=units.find(u=>u.glyphIndex==null),nativeRows=program.events.find(e=>e.args[0]?.placementMain)?.args[0].text.split('\n').length||1;
 if(!main.length||units.length>main.length+1)fail('UNSUPPORTED_MEASUREMENT','Huge glyph and caption ownership is incomplete');
 const segments=[],solutions=new Map();
 for(let i=0;i<plan.lyricAvoidanceIndex.regions.length;i++){
  const r=plan.lyricAvoidanceIndex.regions[i],end=Math.min(r.end??plan.lyricAvoidanceIndex.regions[i+1]?.start??plan.duration,plan.duration);if(r.start>=evaluationRange[1])break;if(end<=evaluationRange[0]||end<=r.start)continue;
  const circle={cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)},key=JSON.stringify(circle);let solution=solutions.get(key);if(!solution){solution=solveHugeCells(main,caption,circle,plan,cut,nativeRows);solutions.set(key,solution);}
  segments.push({start:r.start,end,region:r.id,...solution});
 }
 return {version:1,kind:'ordered-huge-route',revision,evaluationRange,units,segments,slack,measurementSupported:true,safety:segments.every(s=>s.status==='safe')?'certified-continuous-route':'insufficient-space',proof:'unchanged glyph sizes; row-major ordered disjoint glyph cells; owned caption plate and text; universal bounded continuous native-motion map'};
}
function solveHugeCells(main,caption,circle,plan,cut,nativeRows){
 const W=plan.W,H=plan.H,margin=Math.max(2,.005*Math.min(W,H))+.0001,seed=J.h(cut.seed,581),gap=2,cell=(u,p)=>rect(p[0]-u.routeHalfWidth,p[1]-u.routeHalfHeight,p[0]+u.routeHalfWidth,p[1]+u.routeHalfHeight),nativeCost=(u,p)=>Math.hypot(p[0]-u.nativeAnchor[0],p[1]-u.nativeAnchor[1]);
 const attempted=[];
 for(let rows=nativeRows;rows<=Math.min(main.length,16);rows++){
  const per=Math.ceil(main.length/rows),lines=[];for(let i=0;i<main.length;i+=per)lines.push(main.slice(i,i+per));
  const widths=lines.map(line=>line.reduce((s,u)=>s+2*u.routeHalfWidth,0)+gap*(line.length-1)),heights=lines.map(line=>2*Math.max(...line.map(u=>u.routeHalfHeight))),height=heights.reduce((a,b)=>a+b,0)+gap*(lines.length-1);
  attempted.push({rows:lines.length,widths,height});if(height>H||widths.some(w=>w>W))continue;
  const origins=[0,H-height,(H-height)/2,Math.max(0,circle.cy-circle.r-margin-height),Math.min(H-height,circle.cy+circle.r+margin)];
  for(const top of origins){let y=top;const choices=[];let possible=true;
   for(let row=0;row<lines.length;row++){
    const line=lines[row],cy=y+heights[row]/2; y+=heights[row]+gap;const options=[];
    for(let split=-1;split<=line.length;split++){
     let x=split<0?(W-widths[row])/2:0;const positions=[];
     const rightWidth=split<0?0:line.slice(split).reduce((s,u)=>s+2*u.routeHalfWidth,0)+gap*Math.max(0,line.length-split-1);
     for(let j=0;j<line.length;j++){if(j===split)x=W-rightWidth;const u=line[j],p=[x+u.routeHalfWidth,cy];positions.push(p);x+=2*u.routeHalfWidth+gap;}
     if(positions.some((p,j)=>p[0]-line[j].routeHalfWidth<0||p[0]+line[j].routeHalfWidth>W)||positions.some((p,j)=>!A.clear([cell(line[j],p)],circle,margin)))continue;
     options.push({positions,cost:positions.reduce((s,p,j)=>s+nativeCost(line[j],p),0)});
    }
    options.sort((a,b)=>a.cost-b.cost);if(!options.length){possible=false;break;}choices.push(options);
   }
   if(!possible)continue;let combinations=0;
   const search=(row,placements,polygons)=>{
    if(++combinations>512)return null;
    if(row<lines.length){for(const choice of choices[row]){const next={...placements};lines[row].forEach((u,j)=>next[u.owner]=choice.positions[j]);const result=search(row+1,next,polygons.concat(lines[row].map((u,j)=>cell(u,choice.positions[j]))));if(result)return result;}return null;}
    if(caption){const native=cell(caption,caption.nativeAnchor),b=bounds([native]);const solution=A.solveBasic([native],circle,W,H,seed,{accept:d=>{const moved={x0:b.x0+d[0],x1:b.x1+d[0],y0:b.y0+d[1],y1:b.y1+d[1]};return polygons.every(p=>!overlapBounds(moved,bounds([p])));}});if(solution.status!=='safe')return null;placements[caption.owner]=[caption.nativeAnchor[0]+solution.offset[0],caption.nativeAnchor[1]+solution.offset[1]];}
    return {status:'safe',placements,rows:lines.length,proof:'all continuous glyph/camera positions lie in these disjoint cells; every complete cell is circle-clear and stage-contained'};
   };
   const result=search(0,{},[]);if(result)return result;
  }
 }
 return {status:'insufficient-space',placements:{},reason:'fixed-size-ordered-cell-family-exhausted',attempted,limitation:'This is failure of the declared ordered-cell route family, not proof that arbitrary glyph-ink interlocking is impossible.'};
}
A.renderHuge=(renderer,env)=>{
 A.validateFinal(env.plan);const scale=env.scale||1;if(scale<.1||scale>4)fail('UNSUPPORTED_RENDER_SCALE','Staged certified scale range is 0.1 through 4');
 const tr=env.cut.placementTrajectory,program=A.record(renderer,env),segment=tr.segments.find(s=>s.start<=env.realTime&&env.realTime<s.end),offsets={},polygons=[];
 if(!program.measurementSupported)fail('UNSUPPORTED_DRAW_PROGRAM',JSON.stringify(program.diagnostics));
 for(const e of program.events)if(e.role==='primary'&&e.polygons.length){const unit=tr.units.find(u=>u.owner===e.owner);if(!unit)fail('UNMEASURED_OWNER','Huge draw owner has no stable route');const anchor=e.anchor?e.anchor.map((v,i)=>(v+(i===0?e.matrix[0]*unit.anchorOffset[0]+e.matrix[2]*unit.anchorOffset[1]:e.matrix[1]*unit.anchorOffset[0]+e.matrix[3]*unit.anchorOffset[1]))/scale):A.point(e.matrix,unit.nativeAnchor).map(v=>v/scale),target=segment?.placements[e.owner];
  const destination=target?target.map((v,i)=>v+tr.slack*2/Math.PI*Math.atan((anchor[i]-unit.nativeAnchor[i])/tr.slack)):anchor,offset=offsets[e.owner]=destination.map((v,i)=>v-anchor[i]);
  for(const p of e.polygons){const normalized=p.map(v=>v.map(n=>n/scale));if(normalized.some(p=>Math.abs(p[0]-anchor[0])>unit.halfWidth+1e-6||Math.abs(p[1]-anchor[1])>unit.halfHeight+1e-6))fail('ENVELOPE_VIOLATION','Huge glyph escaped its stable body dimensions');polygons.push(normalized.map(p=>p.map((v,i)=>v+offset[i])));}
 }
 const resolved=J.resolveAvoidanceAt(env.plan,env.realTime),circle=resolved?J.avoidanceCirclePixels(resolved,env.plan.W,env.plan.H):null,clear=!polygons.length||A.clear(polygons,circle,Math.max(2,.005*Math.min(env.plan.W,env.plan.H)));
 env.placementObservation?.({cut:env.cut.index,realTime:env.realTime,motionTime:env.t,pass:env.pass,offset:offsets,measurementSupported:true,safety:(!segment||segment.status==='safe')&&clear?'safe':'conflict',envelopeCovered:true,events:program.events.map(e=>({kind:e.kind,role:e.role,owner:e.owner,key:e.key,order:e.order,blend:e.blend,polygons:e.polygons})),polygons});
 A.replay(env,program,offsets);
};
function cameraEnvelope(ps,plan,cut,aaReserve=10){
 const motion=cut.motionScale??1,fx=plan.fx,K=J.clamp((fx.motion??.7)*1.25,0,1.25),base=cut.contentScale??1,maxScale=base*Math.max(1,1+.03*Math.max(K,fx.motion??.7)*motion,1.02),angle=cut.cam==='dutch'?5*J.DEG:0;
 const events=plan.events||[],chroma=(fx.chroma??.7)*(plan.style.ghost??1)*(1+events.filter(e=>e.type==='chroma').reduce((n,e)=>n+e.amp,0)+.9),shake=events.filter(e=>e.type==='shake').reduce((n,e)=>n+e.amp,0);
 // Rotation relative to the native polygon is bounded by |p|*sin(a) in each
 // coordinate. Scale extrema and translation corners form its Minkowski hull.
 const turn=angle?Math.max(...ps.flat().map(p=>Math.hypot(p[0]-plan.W/2,p[1]-plan.H/2)))*maxScale*2*Math.sin(angle/2):0;
 const dx=aaReserve+turn+(['panL','panR'].includes(cut.cam)?plan.W*Math.abs(cut.camP?.a||.022)*K*motion:0)+(3.4*chroma+16*shake)*plan.H/1080*motion,dy=aaReserve+turn+(1.9*chroma+11*shake)*plan.H/1080*motion;
 const points=[],scales=[base,maxScale];for(const p of ps.flat())for(const s of scales){const px=plan.W/2+(p[0]-plan.W/2)*s,py=plan.H/2+(p[1]-plan.H/2)*s,x0=px+(-dx),x1=px+dx,y0=py+(-dy),y1=py+dy;points.push([x0,y0],[x0,y1],[x1,y0],[x1,y1]);}
 return hull(points);
}
A.cameraEnvelope=cameraEnvelope;
let preparationRevision=-1,preparationBytes=0,preparationResidentBytes=0,preparationRequests=0,preparationHits=0,preparationMisses=0;
const preparationCache=new Map(),MAX_PREPARATIONS=2048,MAX_PREPARATION_BYTES=64*1024*1024,MAX_RESIDENT_BYTES=56*1024*1024,MAX_FREQUENCY=255,FREQUENCY_AGE_REQUESTS=4096;
const ownFrozen=value=>{if(Array.isArray(value))return Object.freeze(value.map(ownFrozen));if(value&&typeof value==='object')return Object.freeze(Object.fromEntries(Object.entries(value).map(([k,v])=>[k,ownFrozen(v)])));return value;};
// This is serialized/cache-buffer accounting, not a measurement of JS heap.
// Exact keys, null ghost payloads, all per-entry bookkeeping and the request
// counter share the original 64MiB budget; ghosts share the 2048-entry ceiling.
const preparationControlBytes=()=>preparationCache.size?64:0;
function preparationEntryBytes(key,entry){
 const base=key.length*2+(entry.program?entry.programBytes:8);let bytes=base;
 for(let i=0;i<4;i++){const next=base+JSON.stringify({frequency:entry.frequency,programBytes:entry.programBytes,bytes}).length*2;if(next===bytes)return bytes;bytes=next;}
 return bytes;
}
function changePreparation(key,entry,change){
 const old=entry.bytes||0,oldResident=entry.program?old:0;change?.();entry.bytes=preparationEntryBytes(key,entry);preparationBytes+=entry.bytes-old;preparationResidentBytes+=(entry.program?entry.bytes:0)-oldResident;
}
function removePreparation(key,entry){preparationCache.delete(key);preparationBytes-=entry.bytes;if(entry.program)preparationResidentBytes-=entry.bytes;}
function leastPreparation(resident,exclude,ignored){let found=null;for(const [key,entry]of preparationCache){if(key===exclude||ignored?.has(key)||!!entry.program!==resident)continue;if(!found||entry.frequency<found[1].frequency)found=[key,entry];}return found;}
function ghostPreparation(key,entry){changePreparation(key,entry,()=>{entry.program=null;entry.programBytes=0;});}
function trimPreparation(){
 while(preparationResidentBytes>MAX_RESIDENT_BYTES){const victim=leastPreparation(true);if(!victim)break;ghostPreparation(...victim);}
 while(preparationCache.size>MAX_PREPARATIONS||preparationBytes+preparationControlBytes()>MAX_PREPARATION_BYTES){const ghost=leastPreparation(false);if(ghost){removePreparation(...ghost);continue;}const resident=leastPreparation(true);if(!resident)break;ghostPreparation(...resident);}
}
function resetPreparations(){preparationCache.clear();preparationBytes=preparationResidentBytes=preparationRequests=0;}
function preparationRequest(){
 if(++preparationRequests>=FREQUENCY_AGE_REQUESTS){preparationRequests=0;for(const [key,entry]of preparationCache)changePreparation(key,entry,()=>{entry.frequency>>=1;});}
}
// At an all-resident entry ceiling, plan the key slot and every payload
// eviction together. A rejected large candidate must not evict a small victim.
function admitPreparationAtEntryCeiling(key,entry,program,programBytes){
 const full={...entry,program,programBytes},fullBytes=preparationEntryBytes(key,full);
 if(fullBytes>MAX_RESIDENT_BYTES)return false;
 const victims=[],ignored=new Set();let residentRelease=0,totalRelease=0,removedKeys=0;
 while(preparationResidentBytes-residentRelease+fullBytes>MAX_RESIDENT_BYTES||preparationBytes-totalRelease+fullBytes+preparationControlBytes()>MAX_PREPARATION_BYTES||preparationCache.size+1-removedKeys>MAX_PREPARATIONS){
  const victim=leastPreparation(true,key,ignored);if(!victim||entry.frequency<=victim[1].frequency)return false;
  const remove=removedKeys===0;victims.push({victim,remove});ignored.add(victim[0]);residentRelease+=victim[1].bytes;
  totalRelease+=remove?victim[1].bytes:victim[1].bytes-preparationEntryBytes(victim[0],{...victim[1],program:null,programBytes:0});if(remove)removedKeys++;
 }
 for(const {victim,remove}of victims)remove?removePreparation(...victim):ghostPreparation(...victim);
 const adopted={program,programBytes,frequency:entry.frequency,bytes:0};preparationCache.set(key,adopted);changePreparation(key,adopted);trimPreparation();return true;
}
A.clearPreparationCache=()=>{resetPreparations();solverCache.clear();solverBytes=0;};
function preparedProgram(renderer,env,evaluationRange){
 const revision=J.metrics.revision||0;if(revision!==preparationRevision){resetPreparations();preparationRevision=revision;}
 preparationRequest();
 const key=JSON.stringify({revision,language:J.lang,cut:env.cut,W:env.plan.W,H:env.plan.H,style:env.plan.style,fx:env.plan.fx,fps:env.plan.fps,duration:env.plan.duration,evaluationRange});
 let entry=preparationCache.get(key);if(entry){const program=entry.program;changePreparation(key,entry,()=>{entry.frequency=Math.min(MAX_FREQUENCY,entry.frequency+1);});preparationCache.delete(key);preparationCache.set(key,entry);trimPreparation();if(program){preparationHits++;return program;}}
 preparationMisses++;const recorded=A.record(renderer,env);if(!recorded.measurementSupported)return recorded;
 const program=ownFrozen(recorded),programBytes=JSON.stringify(program).length*2;
 entry=preparationCache.get(key)||entry||{program:null,programBytes:0,frequency:1,bytes:0};
 if(!preparationCache.has(key)){entry={program:null,programBytes:0,frequency:entry.frequency,bytes:0};if(preparationEntryBytes(key,entry)+64>MAX_PREPARATION_BYTES)return program;if(preparationCache.size>=MAX_PREPARATIONS&&!leastPreparation(false)){admitPreparationAtEntryCeiling(key,entry,program,programBytes);return program;}preparationCache.set(key,entry);changePreparation(key,entry);trimPreparation();if(!preparationCache.has(key))return program;}
 const full={...entry,program,programBytes},fullBytes=preparationEntryBytes(key,full),additional=fullBytes-entry.bytes;
 if(fullBytes>MAX_RESIDENT_BYTES)return program;
 const victims=[],ignored=new Set();let residentRelease=0,totalRelease=0;
 while(preparationResidentBytes-residentRelease+fullBytes>MAX_RESIDENT_BYTES||preparationBytes-totalRelease+additional+preparationControlBytes()>MAX_PREPARATION_BYTES){
  const victim=leastPreparation(true,key,ignored);if(!victim||entry.frequency<=victim[1].frequency)return program;
  victims.push(victim);ignored.add(victim[0]);residentRelease+=victim[1].bytes;totalRelease+=victim[1].bytes-preparationEntryBytes(victim[0],{...victim[1],program:null,programBytes:0});
 }
 for(const victim of victims)ghostPreparation(...victim);
 changePreparation(key,entry,()=>{entry.program=program;entry.programBytes=programBytes;});trimPreparation();return program;
}
A.preparedProgram=preparedProgram;
A.preparationCacheStats=()=>{let residents=0,ghosts=0,ghostBytes=0,keyBytes=0,payloadBytes=0;for(const [key,entry]of preparationCache){keyBytes+=key.length*2;payloadBytes+=entry.program?entry.programBytes:8;if(entry.program)residents++;else{ghosts++;ghostBytes+=entry.bytes;}}const controlBytes=preparationControlBytes();return {revision:preparationRevision,entries:preparationCache.size,residentEntries:residents,ghostEntries:ghosts,hits:preparationHits,misses:preparationMisses,serializedBytes:preparationBytes+controlBytes,residentSerializedBytes:preparationResidentBytes,ghostSerializedBytes:ghostBytes,keySerializedBytes:keyBytes,payloadSerializedBytes:payloadBytes,bookkeepingSerializedBytes:preparationBytes-keyBytes-payloadBytes+controlBytes,controlSerializedBytes:controlBytes,frequencyRequests:preparationRequests,maxFrequency:MAX_FREQUENCY,ageRequests:FREQUENCY_AGE_REQUESTS,maxEntries:MAX_PREPARATIONS,maxSerializedBytes:MAX_PREPARATION_BYTES,maxResidentSerializedBytes:MAX_RESIDENT_BYTES,reservedMetadataBytes:MAX_PREPARATION_BYTES-MAX_RESIDENT_BYTES};};
A.finalizeBasic=(plan,cut,original,diagnostics,{revision,stepDur,reachTail})=>{
 const evaluationRange=[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail];
 try{
  // Every native parameter must be finite; count ceilings bound recording work.
  const visit=v=>{if(typeof v==='number'&&!Number.isFinite(v))fail('UNSUPPORTED_PARAMETER_RANGE','Nonfinite layout parameter');if(v&&typeof v==='object')Object.values(v).forEach(visit);};visit(cut.params);
  if(cut.layout==='circle'&&cut.params.variant==='eclipse')fail('UNSUPPORTED_ADAPTER','Eclipse shadow requires a bounded blur adapter');
  if(cut.layout==='wave'&&(!(cut.params.trail>=0&&cut.params.trail<=16)||Math.abs(cut.params.amp)>.5||Math.abs(cut.params.travel)>1))fail('UNSUPPORTED_PARAMETER_RANGE','Wave range requires trail 0..16, |amp|<=.5, |travel|<=1');
  cut.placementUnits=true;cut.placementGlyphs=cut.layout==='huge'&&(cut.treat||'none')==='none';
  const renderer=Object.create(J.Renderer.prototype),ctx=A.measurementContext();ctx.reset();
  const env=renderer.makeEnv(ctx,plan,cut,cut.palette||plan.style.schemes[cut.scheme%plan.style.schemes.length],{pass:'main',t:cut.start+cut.dur/2,realTime:cut.start+cut.dur/2,lt:cut.dur/2,ltb:cut.dur/2,pIn:1,pOut:0,step:0,scale:1,allowFilter:false,placementEnvelope:true});
  env.pIn=1;env.pOut=0;env.lt=cut.dur/2;env.ltb=env.lt;
  const lo=(evaluationRange[0]-cut.start)/cut.dur,hi=(evaluationRange[1]-cut.start)/cut.dur;
  if(!cut.placementGlyphs)env.hugeSweep=dir=>{const xs=[.5+(.5-lo)*.16*dir,.5+(.5-hi)*.16*dir];return {x0:Math.min(...xs)*plan.W,x1:Math.max(...xs)*plan.W,y0:plan.H*.52,y1:plan.H*.52};};
  const program=preparedProgram(renderer,env,evaluationRange);
  if(!program.measurementSupported)fail('UNSUPPORTED_MEASUREMENT',JSON.stringify(program.diagnostics));
  if(cut.placementGlyphs){cut.placementTrajectory=prepareHuge(plan,cut,program,evaluationRange,revision);diagnostics.push({cut:cut.index,code:'STAGED_ADAPTER',measurement:'supported',safety:cut.placementTrajectory.safety,units:cut.placementTrajectory.units.length});return;}
  if(cut.layout==='wave'){cut.placementTrajectory=prepareWave(plan,cut,program,evaluationRange,revision);diagnostics.push({cut:cut.index,code:'STAGED_ADAPTER',measurement:'supported',safety:cut.placementTrajectory.safety,units:cut.placementTrajectory.units.length});return;}
  const grouped={};for(const e of program.events)if(e.role==='primary'&&e.polygons.length)(grouped[e.owner]||= []).push(cameraEnvelope(e.inkPolygons||e.polygons,plan,cut,e.kind==='item'?20:10));
  if(!Object.keys(grouped).length)fail('UNSUPPORTED_MEASUREMENT','Empty primary envelope');
  const units=Object.entries(grouped).map(([owner,polygons])=>({owner,envelope:hull(polygons.flat()),segments:[]}));
  if(cut.layout==='stack')for(const unit of units){const event=program.events.find(e=>e.owner===unit.owner&&e.kind==='item');if(event)unit.stackAnchor=[event.args[0].x,event.args[0].y];}
  if(cut.layout==='diag'){const ink=program.events.filter(e=>e.role==='primary'&&e.kind==='item').flatMap(e=>e.polygons);if(ink.length)units[0].fitBounds=bounds([cameraEnvelope(ink,plan,cut,20)]);}
  const regions=plan.lyricAvoidanceIndex.regions,solutionsByCircle=new Map();
  for(let i=0;i<regions.length;i++){
   const r=regions[i],end=Math.min(r.end??regions[i+1]?.start??plan.duration,plan.duration);if(r.start>=evaluationRange[1])break;if(end<=evaluationRange[0]||end<=r.start)continue;
   const circle={cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)};
   const key=JSON.stringify(circle);let solutions=solutionsByCircle.get(key);if(!solutions){const orbit=cut.layout==='labels'&&cut.params.variant==='radial'?solveOrbit(plan,cut,circle):null;solutions=orbit?units.map(()=>orbit):orderedStaticSolutions(units,circle,plan,cut);solutionsByCircle.set(key,solutions);}
   for(const [index,unit] of units.entries()){const solution=solutions[index];unit.segments.push({start:r.start,end,from:solution.offset,to:solution.offset,status:solution.status,direction:solution.direction??null,reason:solution.reason??null,proof:solution.proof??null,region:r.id});}
  }
  cut.placementTrajectory={version:1,kind:'owned-unit-translation',revision,evaluationRange,units,measurementSupported:true,safety:units.some(u=>u.segments.some(s=>s.status!=='safe'))?'insufficient-space':'certified-bounded-adapter'};
  diagnostics.push({cut:cut.index,code:'STAGED_ADAPTER',measurement:'supported',safety:cut.placementTrajectory.safety,units:units.length});
 }catch(e){plan.cuts[plan.cuts.indexOf(cut)]=original;diagnostics.push({cut:cut.index,code:e.code||'DRAW_PROGRAM_ERROR',details:e.message,safety:'unsupported'});}
};
A.renderWave=(renderer,env)=>{
 A.validateFinal(env.plan);const scale=env.scale||1;if(scale<.1||scale>4)fail('UNSUPPORTED_RENDER_SCALE','Staged certified scale range is 0.1 through 4');
 const tr=env.cut.placementTrajectory,program=A.record(renderer,env),segment=tr.segments.find(s=>s.start<=env.realTime&&env.realTime<s.end),offsets={};
 if(!program.measurementSupported)fail('UNSUPPORTED_DRAW_PROGRAM',JSON.stringify(program.diagnostics));
 const P=env.cut.params,travel=P.travel,u0=.5-(env.lt/env.cut.dur-.5)*travel;
 // A common affine change of phase preserves every main/trail phase difference.
 // Travel remains continuous throughout the full certified evaluation interval.
 const available=env.plan.W-tr.width;
 // Smoothly bounded common travel has no parameter discontinuity at travel=0.
 // Its derivative is positive for every finite phase when spare width exists.
 const origin=tr.halfWidth+available/2+(available>0?available/2*Math.tanh(2*(u0-.5)*env.plan.W/available):0);
 const polygons=[];let covered=true;
 for(const e of program.events)if(e.role==='primary'&&e.polygons.length){
  const unit=tr.units.find(u=>u.key===e.key);if(!unit)fail('UNMEASURED_OWNER','Unmeasured wave route key');
  const it=e.args[0],angle=(it.rot||0)*J.DEG,center=unit.localCenter,local=[it.x+center[0]*Math.cos(angle)-center[1]*Math.sin(angle),it.y+center[0]*Math.sin(angle)+center[1]*Math.cos(angle)],anchor=A.point(e.matrix,local).map(v=>v/scale),i=it.placementPhaseIndex,k=it.placementTrailIndex;
  if(!Number.isInteger(i)||i<0||i>=tr.n||!Number.isInteger(k)||k<0||k>P.trail)fail('INVALID_PHASE_METADATA','Wave glyph and trail indices must be explicit integers');
  let destination=anchor;
  if(segment?.status==='safe'){
   const native=[origin+i*tr.stride+k*.2*tr.stride*Math.sign(travel),anchor[1]];
   destination=A.basicRoutePoint(native,{circle:segment.circle,W:env.plan.W,H:env.plan.H,side:segment.side,halfWidth:tr.halfWidth,halfHeight:tr.halfHeight,nativeCropAxis:true});
  }
  if(segment?.status==='safe'&&it.placementMain&&(destination[0]-tr.halfWidth<0||destination[0]+tr.halfWidth>env.plan.W||destination[1]-tr.halfHeight<0||destination[1]+tr.halfHeight>env.plan.H))fail('STAGE_CONTAINMENT_VIOLATION','Main wave glyph must remain visible throughout its route');
  const offset=offsets[e.key]=[destination[0]-anchor[0],destination[1]-anchor[1]];
  for(const p of e.polygons){const normalized=p.map(v=>v.map(n=>n/scale));if(normalized.some(v=>Math.abs(v[0]-anchor[0])>tr.halfWidth+1e-6||Math.abs(v[1]-anchor[1])>tr.halfHeight+1e-6))covered=false;polygons.push(normalized.map(v=>[v[0]+offset[0],v[1]+offset[1]]));}
 }
 if(!covered)fail('ENVELOPE_VIOLATION','Wave glyph escaped its stable rotation and camera bound');
 const resolved=J.resolveAvoidanceAt(env.plan,env.realTime),circle=resolved?J.avoidanceCirclePixels(resolved,env.plan.W,env.plan.H):null,clear=!polygons.length||A.clear(polygons,circle,Math.max(2,.005*Math.min(env.plan.W,env.plan.H)));
 env.placementObservation?.({cut:env.cut.index,realTime:env.realTime,motionTime:env.t,pass:env.pass,offset:offsets,measurementSupported:true,safety:(!segment||segment.status==='safe')&&clear?'safe':'conflict',envelopeCovered:true,events:program.events.map(e=>({kind:e.kind,role:e.role,owner:e.owner,key:e.key,order:e.order,blend:e.blend,polygons:e.polygons})),polygons});
 A.replay(env,program,offsets);
};
A.renderBasic=(renderer,env)=>{
 A.validateFinal(env.plan);const scale=env.scale||1;if(scale<.1||scale>4)fail('UNSUPPORTED_RENDER_SCALE','Staged certified scale range is 0.1 through 4');
 const trajectory=env.cut.placementTrajectory,program=A.record(renderer,env),offsets={};
 if(!program.measurementSupported)fail('UNSUPPORTED_DRAW_PROGRAM',JSON.stringify(program.diagnostics));
 for(const u of trajectory.units)offsets[u.owner]=A.offsetAt(u,env.realTime);
 const polygons=[];let covered=true;
 for(const e of program.events)if(e.role==='primary'&&e.polygons.length){const unit=trajectory.units.find(u=>u.owner===e.owner),offset=offsets[e.owner]||[0,0];if(!unit)fail('UNMEASURED_OWNER','Primary draw owner absent from continuous envelope');const b=bounds([unit.envelope]);for(const p of e.polygons){const normalized=p.map(v=>v.map(n=>n/scale));if(normalized.some(v=>v[0]<b.x0||v[0]>b.x1||v[1]<b.y0||v[1]>b.y1))covered=false;polygons.push(normalized.map(v=>[v[0]+offset[0],v[1]+offset[1]]));}}
 if(!covered)fail('ENVELOPE_VIOLATION','Actual ink escaped the continuous layout envelope');
 const resolved=J.resolveAvoidanceAt(env.plan,env.realTime),circle=resolved?J.avoidanceCirclePixels(resolved,env.plan.W,env.plan.H):null,clear=!polygons.length||A.clear(polygons,circle,Math.max(2,.005*Math.min(env.plan.W,env.plan.H)));
 const segments=trajectory.units.map(u=>u.segments.find(s=>s.start<=env.realTime&&env.realTime<s.end)),certified=segments.every(s=>!s||s.status==='safe');
 env.placementObservation?.({cut:env.cut.index,realTime:env.realTime,motionTime:env.t,pass:env.pass,offset:offsets,measurementSupported:true,safety:certified&&clear?'safe':'conflict',envelopeCovered:true,events:program.events.map(e=>({kind:e.kind,role:e.role,owner:e.owner,order:e.order,blend:e.blend,polygons:e.polygons})),polygons});
 const decorOffsets=cutOrbitDecor(env,trajectory);
 A.replay(env,program,offsets,decorOffsets);
};
function cutOrbitDecor(env,trajectory){if(env.cut.layout!=='labels'||env.cut.params.variant!=='radial'||env.cut.params.center!=='orb')return {};const first=trajectory.units[0];return first?{'labels.centerOrb':A.offsetAt(first,env.realTime)}:{};}
})();
