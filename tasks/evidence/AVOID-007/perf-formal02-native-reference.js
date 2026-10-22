/* AVOID-007 B25: explicit opt-in source-native adapters. Product default stays off. */
(() => {
'use strict';
const A=J.placement;
A.layoutsB25=['rain','hanging','tunnel','wordCloud','bounceLine','elastic','crossBands','stickerBomb','neon','keycaps','bubbles','slotMachine','flipBoard','credits','zoomRepeat','splitHalves','columnsBig','dotMatrix','depthStack','typeSpecimen','kanjiFocus','halfVertical','curtain','equalizer','tape'];
const fail=(code,message)=>{const e=new Error(message);e.code=code;throw e;},rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],flat=t=>[...String(t||'').replace(/\s/g,'')];
function record(renderer,plan,cut,time,extra={}){
 const ctx=A.measurementContext();ctx.reset();const env=renderer.makeEnv(ctx,plan,cut,cut.palette||plan.style.schemes[cut.scheme%plan.style.schemes.length],{pass:'main',t:time,realTime:time,lt:time-cut.start,ltb:time-cut.start,step:Math.floor(time*24),scale:1,allowFilter:false,placementEnvelope:true,...extra});
 const program=A.record(renderer,env);if(!program.measurementSupported)fail('UNSUPPORTED_MEASUREMENT',JSON.stringify(program.diagnostics));return program;
}
function inkPolygons(event){
 // The common recorder uses a whole AABB for lines. For a known two-point
 // native butt stroke, the endpoint hull plus the same recorded stroke/AA
 // padding is conservative and avoids treating its empty AABB corners as ink.
 if(event.kind==='line'&&event.args[0].length===2){const points=event.args[0].map(p=>A.point(event.matrix,p)),b=A.bounds(event.polygons),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),pad=Math.max(Math.min(...xs)-b.x0,Math.min(...ys)-b.y0,b.x1-Math.max(...xs),b.y1-Math.max(...ys));event={...event,polygons:[A.convexHull(points.flatMap(p=>rect(p[0]-pad,p[1]-pad,p[0]+pad,p[1]+pad)))]};}
 const clips=(event.clips||[]).map(c=>{
  if(!c.commands)return c;const points=[];
  for(const [kind,a]of c.commands){if(kind==='arc'){const [x,y,r]=a;points.push([x-r,y-r],[x+r,y+r]);}else if(kind==='arcTo'){const [x,y,x2,y2,r]=a;points.push([x-r,y-r],[x+r,y+r],[x2,y2]);}else if(kind==='rect'){const [x,y,w,h]=a;points.push([x,y],[x+w,y+h]);}else if(kind==='moveTo'||kind==='lineTo')points.push(a);}
  if(!points.length)fail('UNSUPPORTED_MEASUREMENT','Empty native B clip bound');const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys);return {...c,args:[x,y,Math.max(...xs)-x,Math.max(...ys)-y]};
 });
 return A.layoutsAClip({...event,clips});
}
A.layoutsBClip=inkPolygons;
// B-only completed recipe proof cache. Native recording/source validation and
// native region solving still run before every reuse. Only exact plain data is
// admitted; keys include the complete native source and every clock dependency.
const faceIdentities=new WeakMap(),functionIdentities=new WeakMap();let nextFaceIdentity=1,nextFunctionIdentity=1,recipeRevision=-1;
function recipeFunctionIdentity(fn){if(typeof fn!=='function')return null;if(!functionIdentities.has(fn))functionIdentities.set(fn,nextFunctionIdentity++);return functionIdentities.get(fn);}
function recipePackTree(value){
 const nodes=[],intern=new Map(),visit=v=>{if(v===null||typeof v!=='object')return v;const node=Array.isArray(v)?['a',v.map(visit)]:['o',Object.keys(v).map(k=>[k,visit(v[k])])],key=JSON.stringify(node);let id=intern.get(key);if(id===undefined){id=nodes.length;nodes.push(node);intern.set(key,id);}return {r:id};};
 const root=visit(value);return JSON.stringify({codec:'B007-lossless-tree-v1',root,nodes});
}
function recipeUnpackTree(text){
 const packed=JSON.parse(text);if(packed.codec!=='B007-lossless-tree-v1')throw Error('B cache codec');const memo=[];
 const visit=v=>{if(v===null||typeof v!=='object')return v;const id=v.r;if(!Number.isInteger(id)||id<0||id>=packed.nodes.length)throw Error('B cache reference');if(memo[id])return memo[id];const [kind,data]=packed.nodes[id],out=kind==='a'?[]:{};memo[id]=out;if(kind==='a')for(const child of data)out.push(visit(child));else if(kind==='o')for(const [k,child]of data)Object.defineProperty(out,k,{value:visit(child),enumerable:true,writable:true,configurable:true});else throw Error('B cache node');return out;};return visit(packed.root);
}

function recipeSafeData(value){
 const seen=new WeakSet(),walk=v=>{
  if(v===undefined)return {__b007type:'undefined'};
  if(typeof v==='number'){if(!Number.isFinite(v))throw Error('nonfinite');return Object.is(v,-0)?{__b007type:'negative-zero'}:v;}
  if(v===null||typeof v==='string'||typeof v==='boolean')return v;
  if(typeof v!=='object'||seen.has(v)||Object.getOwnPropertySymbols(v).length||Object.hasOwn(v,'__b007type'))throw Error('opaque');
  const array=Array.isArray(v),proto=Object.getPrototypeOf(v),keys=Object.getOwnPropertyNames(v);
  if(array){if(proto!==Array.prototype||keys.length!==v.length+1||keys.some(k=>k!=='length'&&(!/^(0|[1-9]\d*)$/.test(k)||Number(k)>=v.length)))throw Error('noncanonical array');}
  else if(proto!==Object.prototype&&proto!==null)throw Error('opaque prototype');
  seen.add(v);const out=array?[]:Object.create(null);if(!array&&proto===null)out.__b007type='null-prototype';
  for(const key of keys){if(array&&key==='length')continue;const d=Object.getOwnPropertyDescriptor(v,key);if(!d||!Object.hasOwn(d,'value')||!d.enumerable)throw Error('accessor/nonenumerable');Object.defineProperty(out,key,{value:walk(d.value),enumerable:true,writable:true,configurable:true});}
  seen.delete(v);return out;
 };return walk(value);
}
function recipeRestoreData(value){const walk=v=>{if(v&&typeof v==='object'){if(Object.isFrozen(v))return v;if(v.__b007type==='undefined')return undefined;if(v.__b007type==='negative-zero')return -0;if(v.__b007type==='null-prototype'){delete v.__b007type;Object.setPrototypeOf(v,null);}for(const key of Object.keys(v))Object.defineProperty(v,key,{value:walk(v[key]),enumerable:true,writable:true,configurable:true});Object.freeze(v);}return v;};return walk(value);}


function recipeEncode(value){return recipePackTree(recipeSafeData(value));}
function recipeDecode(text){return recipeRestoreData(recipeUnpackTree(text));}
function createRecipePool(){
 const MAX_BYTES=8*1024*1024,MAX_CONTEXTS=1024,MAX_ENTRIES=4096,BASE=16384,ENTRY=1024,HEADER=2048;
 const entries=new Map(),nodesByKey=new Map(),nodePrototype=Object.freeze(Object.create(null));let header=null,nextID=1,epoch=0,generation=0,bytes=BASE,hits=0,misses=0,bypasses=0,evictions=0;
 const isNode=v=>v!==null&&typeof v==='object'&&Object.getPrototypeOf(v)===nodePrototype;
 function intern(kind,data,transaction){const encoded=data.map(v=>isNode(v)?{r:v.id}:v),key=JSON.stringify([kind,encoded]);let node=nodesByKey.get(key)||transaction.get(key);if(node)return node;const scalarBytes=data.reduce((n,v)=>n+(typeof v==='string'?v.length*2:0),0);node=Object.assign(Object.create(nodePrototype),{id:nextID++,kind,data,key,refs:0,bytes:key.length*2+scalarBytes+288+16*data.length});transaction.set(key,node);return node;}
 function visit(v,transaction){if(v===null||typeof v!=='object')return v;if(Array.isArray(v))return intern('a',v.map(x=>visit(x,transaction)),transaction);const data=[];for(const k of Object.keys(v))data.push(k,visit(v[k],transaction));return intern('o',data,transaction);}
 function restore(root){const memo=new Map();function read(v){if(!isNode(v))return v;if(memo.has(v.id))return memo.get(v.id);const out=v.kind==='a'?[]:{};memo.set(v.id,out);if(v.kind==='a')for(const child of v.data)out.push(read(child));else for(let i=0;i<v.data.length;i+=2)Object.defineProperty(out,v.data[i],{value:read(v.data[i+1]),enumerable:true,writable:true,configurable:true});return out;}return read(root);}
 function retain(n){if(!isNode(n))return;if(n.refs++>0)return;nodesByKey.set(n.key,n);bytes+=n.bytes;for(const child of n.data)if(isNode(child))retain(child);}
 function release(n){if(!isNode(n))return;if(n.refs<=0)throw Error('B cache owner underflow');if(--n.refs)return;if(nodesByKey.get(n.key)===n)nodesByKey.delete(n.key);bytes-=n.bytes;for(const child of n.data)if(isNode(child))release(child);}
 function remove(id,evicted=false){const entry=entries.get(id);if(!entry)return;entries.delete(id);generation++;bytes-=ENTRY;release(entry.key);release(entry.payload);if(evicted)evictions++;}
 function closure(roots){const all=new Set(),add=n=>{if(!isNode(n)||all.has(n))return;all.add(n);for(const child of n.data)if(isNode(child))add(child);};roots.forEach(add);return all;}
 return {
  context(shared,cut,snapshot){const transaction=new Map(),common=header?.snapshot===snapshot?header.root:visit(shared,transaction),specific=visit(cut,transaction),root=intern('a',[common,specific],transaction);return {root,common,snapshot,transaction,epoch,generation};},
  read(context){if(!context||context.epoch!==epoch||context.generation!==generation){bypasses++;return null;}const e=entries.get(context.root.id);if(!e){misses++;return null;}entries.delete(context.root.id);entries.set(context.root.id,e);hits++;return restore(e.payload);},
  keep(context,value){if(!context||context.epoch!==epoch||context.generation!==generation){bypasses++;return false;}const payload=visit(value,context.transaction),required=closure([context.root,payload,context.common]),headerBytes=context.snapshot.length*2+HEADER,standalone=BASE+ENTRY+headerBytes+Array.from(required).reduce((n,x)=>n+x.bytes,0);if(standalone>MAX_BYTES){bypasses++;return false;}
   // All validation/encoding has completed. Commit only after the incoming
   // closure itself is known to fit; no user callback runs in this phase.
   remove(context.root.id);const newHeader=header?.snapshot!==context.snapshot;if(newHeader&&header){bytes-=header.bytes;release(header.root);header=null;}
   const missing=()=>Array.from(required).reduce((n,x)=>n+(x.refs===0?x.bytes:0),0),extraHeader=newHeader?headerBytes:0;
   while(entries.size&&(bytes+missing()+ENTRY+extraHeader>MAX_BYTES||entries.size>=MAX_CONTEXTS||entries.size>=MAX_ENTRIES))remove(entries.keys().next().value,true);
   if(bytes+missing()+ENTRY+extraHeader>MAX_BYTES)throw Error('B cache transaction accounting');
   retain(context.root);retain(payload);bytes+=ENTRY;entries.set(context.root.id,{key:context.root,payload});if(newHeader){retain(context.common);bytes+=headerBytes;header={snapshot:context.snapshot,root:context.common,bytes:headerBytes};}generation++;return true;
  },
  clear(){for(const id of Array.from(entries.keys()))remove(id);if(header){release(header.root);header=null;}nodesByKey.clear();epoch++;generation++;bytes=BASE;hits=misses=bypasses=evictions=0;},
  bypass(){bypasses++;},
  stats(){let keyBytes=0,payloadBytes=0,nodeBookkeeping=0,scalarBytes=0;for(const n of nodesByKey.values()){keyBytes+=n.key.length*2;scalarBytes+=n.data.reduce((s,v)=>s+(typeof v==='string'?v.length*2:0),0);nodeBookkeeping+=288+16*n.data.length;}payloadBytes=scalarBytes;return {contexts:entries.size,entries:entries.size,nodes:nodesByKey.size,hits,misses,bypasses,evictions,serializedBytes:bytes,keyBytes,payloadBytes,bookkeepingReserved:BASE+ENTRY*entries.size+nodeBookkeeping+(header?HEADER:0),commonSnapshotBytes:header?header.snapshot.length*2:0,maxSerializedBytes:MAX_BYTES,maxContexts:MAX_CONTEXTS,maxEntries:MAX_ENTRIES};},
  // Pure accounting/mutation tests use these closure-only operations in an
  // isolated VM; product callers receive only the normal context/read/keep API.
  remove(id){remove(id);},dropHeader(){if(header){bytes-=header.bytes;release(header.root);header=null;generation++;}},
 };
}

const recipePool=createRecipePool();
A.clearLayoutsBRecipeCache=()=>{recipePool.clear();recipeRevision=J.metrics.revision||0;};
A.layoutsBRecipeCacheStats=()=>({revision:recipeRevision,...recipePool.stats()});
function recipeContext(plan,cut,original,explicitSize,evaluationRange,nativeMapping,cacheInputs,guardOnly=false){
 if(recipeRevision!==(J.metrics.revision||0))A.clearLayoutsBRecipeCache();
 try{
  if(typeof document==='undefined'||document.fonts.status!=='loaded')throw Error('fonts not ready');const faces=Array.from(document.fonts);if(faces.length>128||faces.some(f=>f.status!=='loaded'))throw Error('font readiness domain');
  const readiness=faces.map(f=>{if(!faceIdentities.has(f))faceIdentities.set(f,nextFaceIdentity++);return {identity:faceIdentities.get(f),family:f.family,style:f.style,weight:f.weight,stretch:f.stretch,unicodeRange:f.unicodeRange,status:f.status};});
  const effectiveCut={...cut};for(const key of ['placementTrajectory','placementUnits','fullStagePlacement','placementLayoutsB','layoutBRecipe','layoutBEvaluationRange'])delete effectiveCut[key];
  const regions=plan.lyricAvoidanceIndex.regions.map((r,i)=>({...r,end:Math.min(r.end??plan.lyricAvoidanceIndex.regions[i+1]?.start??plan.duration,plan.duration)})).filter(r=>r.start<evaluationRange[1]&&r.end>evaluationRange[0]&&r.end>r.start);
  const seams=[['layout.render',J.LAYOUTS[cut.layout]?.render],['layout.plan',J.LAYOUTS[cut.layout]?.plan],['Renderer.makeEnv',J.Renderer.prototype.makeEnv],['Renderer.drawCut',J.Renderer.prototype.drawCut],...['record','solveBasic','itemGeometry','cameraEnvelope','layoutsAClip','bounds','convexHull','clear','layoutsBSourceMapping','layoutsBOwnedTopology'].map(k=>['placement.'+k,A[k]]),...['drawItem','mainDraw','layoutText','measure','fontCSS','fontForChar','faceOf','h','r','clamp','chunkText','splitLines','romaji'].map(k=>['J.'+k,J[k]]),['metrics.adv',J.metrics.adv],...Object.keys(J.E).sort().map(k=>['E.'+k,J.E[k]]),...Object.keys(A.layoutsBEditorial||{}).sort().map(k=>['editorial.'+k,A.layoutsBEditorial[k]])].map(([name,fn])=>[name,recipeFunctionIdentity(fn)]);
  const shared=recipeSafeData({version:'B007-global-pool-v1',revision:J.metrics.revision||0,language:J.lang,fonts:J.FONTS,fontReadiness:readiness,functionIdentities:seams.filter(([name])=>!name.startsWith('layout.')),W:plan.W,H:plan.H,style:plan.style,fx:plan.fx,fps:plan.fps,duration:plan.duration,events:plan.events||[],beats:plan.beats||[],rawGlobalComposedInputs:{style:cacheInputs?.style,fx:cacheInputs?.fx,events:cacheInputs?.events,beats:cacheInputs?.beats}}),specific=recipeSafeData({cut:original,effectiveCut,rawComposedCut:cacheInputs?.cut,explicitSize,evaluationRange,regions,nativeMapping,layoutFunctionIdentities:seams.filter(([name])=>name.startsWith('layout.'))}),snapshot=JSON.stringify(shared),cutSnapshot=JSON.stringify(specific);
  if(guardOnly)return {snapshot,cutSnapshot};const context=recipePool.context(shared,specific,snapshot);context.cutSnapshot=cutSnapshot;context.verify=()=>{const current=recipeContext(plan,cut,original,explicitSize,evaluationRange,nativeMapping,cacheInputs,true);return current?.snapshot===snapshot&&current?.cutSnapshot===cutSnapshot;};return context;
 }catch{recipePool.bypass();return null;}
}

function recipeRead(context){if(!context)return null;const value=recipePool.read(context);return value?recipeRestoreData(value):null;}
function recipeKeep(context,value){if(!context)return;if(!context.verify()){recipePool.bypass();return;}let safe;try{safe=recipeSafeData(value);}catch{recipePool.bypass();return;}recipePool.keep(context,safe);}
const cellIDs=['keycaps','bubbles','slotMachine','flipBoard'];
function sourceRestTime(cut){return cut.start+(cellIDs.includes(cut.layout)?Math.max(1.5,.5+[...String(cut.text).trim()].length*.2):1.5);}
function cellEnvelopes(program,plan,cut){
 const g=program.nativeGeometry;if(!g||g.kind!=='cells')fail('UNSUPPORTED_MEASUREMENT','B source cell geometry missing');const {k,cells}=g,U=Math.min(plan.W,plan.H),polygons=[],id=cut.layout;
 for(const c of cells){if(!c.ch.trim()&&id!=='flipBoard')continue;let shape;
  if(id==='bubbles'){
   const kind=J.isKanji(c.ch)?1:J.isSmallKana(c.ch)||J.isPunct(c.ch)?.7:.86,R=k*.5*kind*(.94+.12*J.r(cut.seed,c.i,5)),entryEnd=.42+Math.max(0,cells.length-1)*.05,grow=cut.dur-cut.outDur>=entryEnd?1.35:1.155*1.35,outer=R*grow,radius=Math.max(outer/Math.cos(Math.PI/64)+Math.max(1.2,R*.035)/2,.78*outer+Math.max(1.5,R*.07)/2,Math.SQRT2*.52*outer+Math.max(1.5,R*.05)),range=cut.layoutBEvaluationRange.map(t=>t-cut.start),lifts=range.flatMap(t=>(cut.layoutBRecipe?.commonLift?[1]:[.7,1.3]).map(a=>-plan.H*cut.params.rise*t*a)),dx=R*.1+k*.1,dy=R*.06+k*.14;
   const ink=A.bounds(A.itemGeometry({text:c.ch,font:cut.params.font,size:R*1.05,x:0,y:0},[1,0,0,1,0,0],{pass:'main',scale:1}).polygons),left=Math.max(radius,-ink.x0),right=Math.max(radius,ink.x1),top=Math.max(radius,-ink.y0),bottom=Math.max(radius,ink.y1);
   shape=rect(c.x-dx-left,c.y+Math.min(...lifts)-dy-top,c.x+dx+right,c.y+Math.max(...lifts)+dy+bottom);
  }else if(id==='keycaps'){
   const d=k*.15;shape=rect(c.x-k*.55,c.y-k*.55,c.x+k*.55,c.y+k*.55+d*1.1);
  }else{
   let hx=k/2,hy=k*(id==='slotMachine'?1.34:1.32)/2;
   if(id==='flipBoard')for(const ch of [...new Set([c.ch,...(g.revealPool||[])])].filter(ch=>ch.trim())){const b=A.bounds(A.itemGeometry({text:ch,font:cut.params.font,size:k*.78,x:0,y:0},[1,0,0,1,0,0],{pass:'main',scale:1}).polygons);hx=Math.max(hx,-b.x0,b.x1);hy=Math.max(hy,-b.y0,b.y1);}
   shape=rect(c.x-hx-2,c.y-hy-2,c.x+hx+2,c.y+hy+2);
  }
  polygons.push(A.cameraEnvelope([shape],plan,cut,20));
 }
 // Backing plate, cabinet, payline/arrows and semantic header are source-static.
 // Cell-local moving/reveal ink above is independently bounded across all phases.
 for(const e of program.events.filter(e=>e.role==='primary'&&!/^cell-/.test(e.nativeGroup||'')))for(const p of e.polygons)polygons.push(A.cameraEnvelope([p],plan,cut,e.kind==='item'?20:10));
 return polygons;
}
function glyphBox(font,size,ch,extra={}){return A.bounds(A.itemGeometry({text:ch,font,size,x:0,y:0,...extra},[1,0,0,1,0,0],{pass:'main',scale:1}).polygons);}
function rainEnvelopes(program,plan,cut,mainOnly=false){
 const g=program.nativeGeometry;if(!g||g.kind!=='rain')fail('UNSUPPORTED_MEASUREMENT','Rain source geometry missing');const {base,gl,pool,trailN,ts,tsp}=g,out=[];
 const trails=pool.map(ch=>glyphBox(cut.params.rf,ts,ch.repeat(trailN),{track:.12,vertical:true,align:'left'})),tb={x0:Math.min(...trails.map(b=>b.x0)),y0:Math.min(...trails.map(b=>b.y0)),x1:Math.max(...trails.map(b=>b.x1)),y1:Math.max(...trails.map(b=>b.y1))};
 for(const q of gl){const b=glyphBox(base.font,base.size,q.ch,{vertical:base.vertical});out.push(A.cameraEnvelope([rect(q.x+b.x0,q.y+b.y0,q.x+b.x1,q.y+b.y1)],plan,cut,20));if(mainOnly)continue;
  // Only the delivery lead uses a fixed fontCSS and continuous uniform scale.
  // Thus native size growth is exact while the glyph ink cannot change hinting
  // midway. Signed products retain punctuation/kana offsets and ts>base cases.
  const fixed=glyphBox(base.font,base.size,q.ch,{vertical:base.vertical}),scales=[Math.min(ts/base.size,1),Math.max(ts/base.size,1)],lead={x0:Math.min(...scales.map(k=>fixed.x0*k))-2,y0:Math.min(...scales.map(k=>fixed.y0*k))-2,x1:Math.max(...scales.map(k=>fixed.x1*k))+2,y1:Math.max(...scales.map(k=>fixed.y1*k))+2},lo=Math.min(-2*tsp,q.y),hi=Math.max(-2*tsp,q.y);out.push(A.cameraEnvelope([rect(q.x+lead.x0,lo+lead.y0,q.x+lead.x1,hi+lead.y1)],plan,cut,20));
  // Independent product bounds contain the complete quadratic head / cubic
  // size-coupled tail origin, including every pool glyph at every vertical slot.
  const y0=lo-Math.max(ts,base.size)/2-trailN*tsp,y1=hi-Math.min(ts,base.size)/2-trailN*tsp;out.push(A.cameraEnvelope([rect(q.x+tb.x0,y0+tb.y0,q.x+tb.x1,y1+tb.y1)],plan,cut,20));
 }
 return out;
}
function bounceEnvelopes(program,plan,cut){
 const g=program.nativeGeometry;if(!g||g.kind!=='bounceLine')fail('UNSUPPORTED_MEASUREMENT','Bounce source geometry missing');const {base,gl}=g,S=base.size,out=[],lines=new Map(),sn=Math.sin(7*J.DEG);
 for(const q of gl){const b=glyphBox(base.font,S,q.ch),x=Math.max(-b.x0,b.x1)*1.2,y=Math.max(-b.y0,b.y1)*1.08,hx=x+y*sn,hy=y+x*sn;out.push(A.cameraEnvelope([rect(q.x-hx,q.y-.04*S-S*cut.params.hop-hy,q.x+hx,q.y+.12*S+hy)],plan,cut,20));
  if(cut.params.shadow)out.push(A.cameraEnvelope([rect(q.x-.408*S,q.y+.56*S-.0816*S,q.x+.408*S,q.y+.56*S+.0816*S)],plan,cut,10));
  const line=lines.get(q.li)||{x0:Infinity,x1:-Infinity,y:q.y+.6*S};line.x0=Math.min(line.x0,q.x-q.w/2);line.x1=Math.max(line.x1,q.x+q.w/2);lines.set(q.li,line);
 }
 const lw=Math.max(1.5,Math.min(plan.W,plan.H)*.0022),pad=lw*1.6;
 if(cut.params.line!=='none')for(const l of lines.values())out.push(A.cameraEnvelope([rect(l.x0-.35*S-pad,l.y-pad,l.x1+.35*S+pad,l.y+pad)],plan,cut,10));return out;
}
function hangingEnvelopes(program,plan,cut,withoutRail=false){
 const g=program.nativeGeometry;if(!g||g.kind!=='hanging')fail('UNSUPPORTED_MEASUREMENT','Suspension source geometry missing');const out=[],B=1+4*1.4**3/(27*(1.4+1)**2);
 for(const q of g.items){if(!String(cut.text).trim())continue;const pivot=[q.ax,g.railY],angle=(cut.params.amp+cut.params.kick)*Math.abs(q.dk*q.ampK)*g.angleScale,sweep=p=>A.layoutsASweep(p,{pivot,angle});
  out.push(A.cameraEnvelope([sweep(rect(q.ax-g.strokeW,g.railY-g.strokeW,q.ax+g.strokeW,g.railY+1.05*q.L+g.strokeW))],plan,cut,10));
  if(cut.params.rail){const radius=Math.max(2.5,Math.min(plan.W,plan.H)*.004);out.push(A.cameraEnvelope([rect(q.ax-radius,g.railY-radius,q.ax+radius,g.railY+radius)],plan,cut,10));}
  const ch=[...String(cut.text).trim().replace(/[\s\u3000]+/g,' ')][q.i];if(!ch?.trim())continue;
  if(cut.params.tag){const hole=Math.max(2,g.size*.055),hx=Math.max(g.tagW/2,hole)*B,hy=Math.max(g.tagH/2,g.tagH*.4+hole)*B;out.push(A.cameraEnvelope([sweep(rect(q.ax-hx,g.railY+.95*q.L+q.attach-hy,q.ax+hx,g.railY+1.05*q.L+q.attach+hy))],plan,cut,10));}
  const b=glyphBox(cut.params.font,g.csize,ch),offset=cut.params.tag?g.tagH*.06:0;out.push(A.cameraEnvelope([sweep(rect(q.ax+b.x0,g.railY+.95*q.L+q.attach+offset+b.y0,q.ax+b.x1,g.railY+1.05*q.L+q.attach+offset+b.y1))],plan,cut,20));
 }
 if(cut.params.rail&&!withoutRail)out.push(A.cameraEnvelope([rect(plan.W/2-g.railSpan,g.railY-g.strokeW,plan.W/2+g.railSpan,g.railY+g.strokeW)],plan,cut,10));return out;
}
function fixedEnvelopes(program,plan,cut){return program.events.filter(e=>e.role==='primary'&&e.args[0]?.placementFixedStage).flatMap(e=>inkPolygons(e).map(p=>{const b=A.bounds([p]);return A.cameraEnvelope([rect(b.x0,b.y0-plan.H*.025,b.x1,b.y1+plan.H*.025)],plan,cut,20);}));}
function copyEnvelopes(program,plan,cut){
 const g=program.nativeGeometry;if(!g)fail('UNSUPPORTED_MEASUREMENT','B primary copy geometry missing');const U=Math.min(plan.W,plan.H);
 if(cut.layout==='depthStack'){
  const common={text:g.mt,font:cut.params.font,size:g.size,x:g.cx,y:g.cy,track:.03,lead:1.1,stroke:Math.max(1,g.size*.014)},ink=A.bounds(A.itemGeometry(common,[1,0,0,1,0,0],{pass:'main',scale:1}).polygons),layout=rect(g.cx-g.mm.w/2,g.cy-g.mm.h/2,g.cx+g.mm.w/2,g.cy+g.mm.h/2),vx=g.cx+g.dx*U*g.dist,vy=g.cy+g.dy*U*g.dist,sx=g.sway?U*.05:0,sy=g.sway?U*.035:0,pad=Math.max(3,Math.max(1,U*.0013)/2+2),points=[...rect(ink.x0-pad,ink.y0-pad,ink.x1+pad,ink.y1+pad),...layout,...rect(vx-sx-pad,vy-sy-pad,vx+sx+pad,vy+sy+pad)];
  return [A.cameraEnvelope([A.convexHull(points)],plan,cut,20)];
 }
 const scales=[1,1.1232],fixed=glyphBox(g.font,g.big,g.fch,{stroke:Math.max(1.2,g.big*1.1232*.004)}),giant=rect(g.bx+Math.min(...scales.map(k=>fixed.x0*k))-2,g.by+Math.min(...scales.map(k=>fixed.y0*k))-2,g.bx+Math.max(...scales.map(k=>fixed.x1*k))+2,g.by+Math.max(...scales.map(k=>fixed.y1*k))+2),rest=program.events.filter(e=>e.role==='primary'&&!(e.kind==='item'&&e.args[0].placementSource?.copy==='focus')).flatMap(e=>inkPolygons(e).map(p=>{if(e.kind!=='item'){const b=A.bounds([p]);p=rect(b.x0-(b.x1-b.x0)*.132,b.y0-(b.y1-b.y0)*.132,b.x1+(b.x1-b.x0)*.132,b.y1+(b.y1-b.y0)*.132);}return A.cameraEnvelope([p],plan,cut,e.kind==='item'?20:10);}));
 return [A.cameraEnvelope([giant],plan,cut,20),...rest];
}
function equalizerEnvelopes(program,plan,cut){
 const g=program.nativeGeometry;if(g?.kind!=='equalizer')fail('UNSUPPORTED_MEASUREMENT','Equalizer source geometry missing');const out=[],lw=Math.max(1,Math.min(plan.W,plan.H)*.0016),rows=new Map();
 for(const q of g.items){const b=glyphBox(cut.params.font,g.size,q.ch),peak=cut.params.peaks?g.sw*.1:0,top=q.yb-q.hmax-g.size*.62-peak,bottom=q.yb-g.size*.62-peak;out.push(A.cameraEnvelope([rect(q.x+b.x0,top+b.y0,q.x+b.x1,bottom+b.y1)],plan,cut,20));
  const height=Math.max(3,g.sw*.05),barTop=q.yb-q.hmax-(cut.params.peaks?height+g.sw*.04:0),barBottom=cut.params.style==='mirror'?q.yb+2*lw+.35*q.hmax:q.yb;out.push(A.cameraEnvelope([rect(q.x-q.bw/2-1,barTop-1,q.x+q.bw/2+1,barBottom+1)],plan,cut,10));
  const row=Math.floor(q.i/g.per),r=rows.get(row)||{left:Infinity,right:-Infinity,y:q.yb};r.left=Math.min(r.left,q.x-g.sw*.7);r.right=Math.max(r.right,q.x+g.sw*.7);rows.set(row,r);
 }for(const r of rows.values())out.push(A.cameraEnvelope([rect(r.left-lw,r.y-lw,r.right+lw,r.y+lw)],plan,cut,10));return out;
}
function envelope(program,plan,cut){
 if(A.layoutsBEditorial?.supports(cut.layout))return A.layoutsBEditorial.envelope(program,plan,cut);
 if(cut.layout==='elastic'){
 const g=program.nativeGeometry;if(g?.kind!=='elastic')fail('UNSUPPORTED_MEASUREMENT','Elastic source geometry missing');const spring=1+3/Math.sqrt(13)*Math.exp(-2/3*(Math.PI-Math.atan(2/3))),kmax=1.6*spring,kmin=1-Math.exp(-4.3),out=[],S=g.size,amp=S*cut.params.amp,angle=Math.atan(Math.PI*amp/Math.max(1,2*g.half*kmin))/J.DEG+Math.abs(g.ang),R=Math.max(5,S*.1),lw=Math.max(1.5,S*.03),B=275/243;
 const point=(a,d,row)=>{const rad=g.ang*J.DEG,dy=(row-(g.rowCount-1)/2)*S*3.2;return g.vert?[plan.W/2+d,plan.H/2+a]:[plan.W/2+a*Math.cos(rad)-d*Math.sin(rad),plan.H/2+a*Math.sin(rad)+d*Math.cos(rad)+dy];};
 for(const q of g.gl){const b=glyphBox(cut.params.font,S,q.ch,{vertical:g.vert}),x=Math.max(Math.abs(b.x0),Math.abs(b.x1)),y=Math.max(Math.abs(b.y0),Math.abs(b.y1)),sn=Math.sin(Math.min(90,angle)*J.DEG),hx=g.vert?Math.max(2.582*x,x*1.007+1.6*y*sn):Math.max(1.6*x+1.007*y*sn,1.6*x+2.582*y*Math.sin(Math.abs(g.ang)*J.DEG)),hy=g.vert?1.6*y+1.007*x*sn:Math.max(2.582*y+1.6*x*Math.sin(Math.abs(g.ang)*J.DEG),y*1.007+1.6*x*sn),a=g.vert?q.y:q.x,row=g.vert?0:q.li,bb=A.bounds([rect(Math.min(.04*a,kmax*a),-amp,Math.max(.04*a,kmax*a),amp).map(p=>point(p[0],p[1],row))]);out.push(A.cameraEnvelope([rect(bb.x0-hx,bb.y0-hy,bb.x1+hx,bb.y1+hy)],plan,cut,20));}
 for(let row=0;row<g.rowCount;row++){const bb=A.bounds([rect(-g.half*kmax,-amp,g.half*kmax,amp).map(p=>point(p[0],p[1],row))]),pad=Math.max(lw*10,R*(3.2+1.3*B)+lw);out.push(A.cameraEnvelope([rect(bb.x0-pad,bb.y0-pad,bb.x1+pad,bb.y1+pad)],plan,cut,10));}return out;
 }
 if(cut.layout==='splitHalves'){const g=program.nativeGeometry;if(g?.kind!=='split')fail('UNSUPPORTED_MEASUREMENT','Split source geometry missing');const out=[],off=plan.W*.72*g.pathScale+(cut.params.variant==='shear'?.175*g.size:0),gap=cut.params.gap*g.size/2,lw=Math.max(1.5,g.size*.016);for(const q of g.lines){const b=glyphBox(cut.params.font,g.size,q.ln,{track:.04});out.push(A.cameraEnvelope([rect(plan.W/2+b.x0-off,q.y+b.y0-gap,plan.W/2+b.x1+off,q.y+b.y1+gap)],plan,cut,20));out.push(A.cameraEnvelope([rect(plan.W/2-q.half-lw*1.6,q.y-lw*1.6,plan.W/2+q.half+lw*1.6,q.y+lw*1.6)],plan,cut,10));}return out;}
 if(cut.layout==='stickerBomb'){const g=program.nativeGeometry;if(g?.kind!=='stickers')fail('UNSUPPORTED_MEASUREMENT','Sticker source geometry missing');return program.events.filter(e=>e.role==='primary').flatMap(e=>inkPolygons(e).map(p=>{const item=g.items.find(it=>'sticker-'+it.index===e.nativeGroup),pivot=item?[item.x,item.y]:[plan.W/2,plan.H/2];return A.cameraEnvelope([A.layoutsASweep(p,{pivot,angle:14,scale:[.94,1.404]})],plan,cut,e.kind==='item'?20:10);}));}
 if(cut.layout==='equalizer')return equalizerEnvelopes(program,plan,cut);
 if(['depthStack','kanjiFocus'].includes(cut.layout))return copyEnvelopes(program,plan,cut);
 if(cut.layout==='hanging')return hangingEnvelopes(program,plan,cut);
 if(cut.layout==='rain')return rainEnvelopes(program,plan,cut);if(cut.layout==='bounceLine')return bounceEnvelopes(program,plan,cut);
 if(cellIDs.includes(cut.layout))return cellEnvelopes(program,plan,cut);
 const id=cut.layout,events=program.events.filter(e=>e.role==='primary'&&!e.args[0]?.placementFixedStage),polygons=events.flatMap(e=>e.polygons);if(!polygons.length)fail('UNSUPPORTED_MEASUREMENT','Empty B primary program');
 if(!['tunnel','wordCloud','crossBands','neon','zoomRepeat','curtain','columnsBig','halfVertical','dotMatrix','tape'].includes(id))fail('B_INTERVAL_ADAPTER_PENDING','Source interval adapter not yet implemented: '+id);
 if(id==='dotMatrix'){const g=program.nativeGeometry;if(!g)fail('UNSUPPORTED_MEASUREMENT','LED source grid missing');const w=g.smp.cols*g.p,h=g.smp.rows*g.p,pad=cut.params.panel?g.p*1.2+Math.max(1,g.p*.12)/2:2;return [A.cameraEnvelope([rect(plan.W/2-w/2-pad,plan.H/2-h/2-pad,plan.W/2+w/2+pad,plan.H/2+h/2+pad)],plan,cut,20)];}
 return events.flatMap(e=>inkPolygons(e).map(p=>{
  // The native central sign/outline/main item is static under cut/still.
  // Cross plate outBack(1.6) has its unique extremum <1.1; both exit
  // multipliers are <=1. This dilation includes its owned shadow/border.
  if(['columnsBig','halfVertical'].includes(id)&&e.kind!=='item'){const b=A.bounds([p]),dx=(b.x1-b.x0)*.132,dy=(b.y1-b.y0)*.132;p=rect(b.x0-dx,b.y0-dy,b.x1+dx,b.y1+dy);}
  if(id==='crossBands'&&e.kind!=='item')p=A.layoutsASweep(p,{pivot:[plan.W/2,plan.H/2],scale:[1,1.1]});
  // Theatre slate is drawn only after open>.9. Native yt then lies
  // between rest and rest+.1*(H/2-rest); y=yt/2. Main lyric is static.
  if(id==='curtain'&&e.kind==='item'&&!e.args[0].placementMain){const b=A.bounds([p]);p=rect(b.x0,b.y0-plan.H*.025,b.x1,b.y1+plan.H*.025);}
  return A.cameraEnvelope([p],plan,cut,e.kind==='item'?20:10);
 }));
}
function ownedTopology(program,cut){
 if(!['elastic','equalizer'].includes(cut.layout))return;
 const g=program.nativeGeometry,primary=program.events.filter(e=>e.role==='primary'),groups=new Map();for(const e of primary){const key=e.nativeGroup||'composition',list=groups.get(key)||[];list.push(e.kind);groups.set(key,list);}
 const verify=(group,expected)=>{const actual=(groups.get(group)||[]).slice().sort();if(JSON.stringify(actual)!==JSON.stringify(expected.slice().sort()))fail('OWNED_TOPOLOGY','Missing/duplicated owned '+cut.layout+' shape in '+group);groups.delete(group);};
 if(cut.layout==='elastic'){
  for(let r=0;r<g.rowCount;r++){verify('elastic-band-'+r,['line','line']);verify('elastic-anchor-'+r,cut.params.anchor==='dot'?['circle','circle']:cut.params.anchor==='ring'?['circle','circle','circle','circle']:['line','line','circle','circle','circle','circle']);}
  g.gl.forEach((q,i)=>verify('glyph-'+i,['item']));
 }else{
  for(let r=0;r<g.rows;r++)verify('baseline-'+r,['line']);
  for(const q of g.items){const bars=q.hmax<=.5?0:cut.params.style==='blocks'?Math.floor(q.hmax/Math.max(4,g.sw*.14)):cut.params.style==='mirror'?2:1;verify('band-'+q.i,['item',...Array(bars+(cut.params.peaks?1:0)).fill('rect')]);}
 }
 if(groups.size)fail('OWNED_TOPOLOGY','Unclassified primary '+cut.layout+' group: '+[...groups.keys()].join(','));
}
A.layoutsBOwnedTopology=ownedTopology;
function sourceMapping(native,prepared,cut){
 ownedTopology(native,cut);ownedTopology(prepared,cut);
 if(A.layoutsBEditorial?.supports(cut.layout))return A.layoutsBEditorial.sourceMapping(native,prepared,cut);
 const sources=program=>program.events.filter(e=>e.role==='primary'&&e.kind==='item'&&e.args[0].placementSource).map(e=>{const i=e.args[0],r=i.placementSource;if(r.text!==flat(cut.text).slice(r.start,r.end).join('')||r.text!==flat(i.text).join(''))fail('SOURCE_COVERAGE','B source index/text mismatch');return {copy:r.copy,fragment:r.fragment,start:r.start,end:r.end,originalCodepointOffsets:r.originalCodepointOffsets,text:r.text,font:i.font,mi:i.mi??null,owner:e.owner};});
 const metadata=program=>program.events.filter(e=>e.role==='primary'&&e.kind==='item'&&!e.args[0].placementSource).map(e=>({text:e.args[0].text,font:e.args[0].font,group:e.nativeGroup,owner:e.owner,fixedStage:e.args[0].placementFixedStage===true}));
 const shape=program=>program.events.filter(e=>e.role==='primary'&&e.kind!=='item'&&!(cut.layout==='slotMachine'&&e.nativeGroup==='payline')&&!(cut.layout==='bounceLine'&&/^baseline-/.test(e.nativeGroup))&&!['equalizer','elastic'].includes(cut.layout)).map(e=>({kind:e.kind,group:e.nativeGroup,owner:e.owner}));
 const canonical=rows=>rows.map(r=>JSON.stringify(r)).sort(),expected={sources:sources(native),metadata:metadata(native),shapes:shape(native)},actual={sources:sources(prepared),metadata:metadata(prepared),shapes:shape(prepared)};
 for(const k of Object.keys(expected))if(JSON.stringify(canonical(expected[k]))!==JSON.stringify(canonical(actual[k])))fail('NATIVE_SEMANTIC_MAPPING','B native/recipe '+k+' mapping changed');
 if(cellIDs.includes(cut.layout)){const identity=p=>({sourceCells:p.nativeGeometry.cells.map(c=>({i:c.i,ch:c.ch})),revealPool:p.nativeGeometry.revealPool||null});if(cut.layout==='slotMachine'&&cut.params.line){for(const p of [native,prepared]){const line=p.events.filter(e=>e.nativeGroup==='payline'),rows=p.nativeGeometry.rows;if(line.filter(e=>e.kind==='line').length!==rows||line.filter(e=>e.kind==='nativePath').length!==rows*2)fail('OWNED_ROW_MAPPING','Each ordered reel row needs its own native payline and two arrows');}}
 expected.cellIdentity=identity(native);actual.cellIdentity=identity(prepared);if(JSON.stringify(expected.cellIdentity)!==JSON.stringify(actual.cellIdentity))fail('NATIVE_SEMANTIC_MAPPING','B cell/reveal pool identity changed');}
 if(cut.layout==='elastic'){const identity=p=>p.nativeGeometry.gl.map((g,i)=>({i,ch:g.ch,mi:i*.5}));expected.elasticIdentity=identity(native);actual.elasticIdentity=identity(prepared);if(JSON.stringify(expected.elasticIdentity)!==JSON.stringify(actual.elasticIdentity))fail('NATIVE_SEMANTIC_MAPPING','Elastic source occurrence/global motion index changed');}
 if(cut.layout==='tape'){expected.stripClock=native.nativeGeometry.strips;actual.stripClock=prepared.nativeGeometry.strips;if(JSON.stringify(expected.stripClock)!==JSON.stringify(actual.stripClock))fail('NATIVE_SEMANTIC_MAPPING','Tape strip/cross/piece source order or reveal clock changed');}
 if(cut.layout==='stickerBomb'){const identity=p=>p.nativeGeometry.items.map(({index,word,t0,rot})=>({index,word,t0,rot}));expected.stickerClock=identity(native);actual.stickerClock=identity(prepared);if(JSON.stringify(expected.stickerClock)!==JSON.stringify(actual.stickerClock))fail('NATIVE_SEMANTIC_MAPPING','Sticker source order, labels or slap clock changed');}
 if(cut.layout==='hanging'){const identity=p=>p.nativeGeometry.items.map(q=>({i:q.i,ta:q.ta,w:q.w,dk:q.dk,ampK:q.ampK}));expected.suspensionIdentity=identity(native);actual.suspensionIdentity=identity(prepared);if(JSON.stringify(expected.suspensionIdentity)!==JSON.stringify(actual.suspensionIdentity))fail('NATIVE_SEMANTIC_MAPPING','Suspension native period/angle/entry phase changed');}
 if(cut.layout==='equalizer'){const identity=p=>p.nativeGeometry.items.map(q=>({i:q.i,ch:q.ch,signalKey:q.signalKey}));expected.signalIdentity=identity(native);actual.signalIdentity=identity(prepared);if(JSON.stringify(expected.signalIdentity)!==JSON.stringify(actual.signalIdentity))fail('NATIVE_SEMANTIC_MAPPING','Equalizer native signal key changed');}
 if(cut.layout==='rain'){const identity=p=>({pool:p.nativeGeometry.pool,rank:p.nativeGeometry.rank,span:p.nativeGeometry.span,fd:p.nativeGeometry.fd,trailN:p.nativeGeometry.trailN,vertical:p.nativeGeometry.vertical});expected.deliveryIdentity=identity(native);actual.deliveryIdentity=identity(prepared);if(JSON.stringify(expected.deliveryIdentity)!==JSON.stringify(actual.deliveryIdentity))fail('NATIVE_SEMANTIC_MAPPING','Rain source rank/delivery phase/pool changed');}
 return {expected,actual,complete:true,rule:'Every observed native primary source pass/range/font, metadata text/font/group and owned shape kind/group retained at the same native clock; no character-count substitute'};
}
A.layoutsBSourceMapping=sourceMapping;
function effectiveSize(item){
 if(item.placementContinuousFontScale){
  if(!['delivery-lead','depth-copy','focus-giant','keycap-glyph','bubble-glyph'].includes(item.placementContinuousFontScale)||!(item.sx>0)||item.sx!==item.sy||Math.abs(item.size*item.sx-item.placementEffectiveSize)>1e-7)fail('EFFECTIVE_FONT_SIZE','Fixed-CSS primary glyph must preserve exact positive uniform effective size');return item.size*item.sx;
 }return item.size;
}
function nativeSizeQuality(native,prepared,explicitSize){
 const collect=p=>{const m=new Map();for(const e of p.events.filter(e=>e.role==='primary'&&e.kind==='item')){const i=e.args[0],r=i.placementSource,key=JSON.stringify({font:i.font,source:r?{start:r.start,end:r.end,copy:r.copy,fragment:r.fragment}:null,metadata:r?null:{text:String(i.text).replace(/\n/g,''),group:e.nativeGroup}}),a=m.get(key)||[];a.push(effectiveSize(i));m.set(key,a);}for(const a of m.values())a.sort((a,b)=>a-b);return m;};
 const before=collect(native),after=collect(prepared),ratios=[];for(const [key,sizes]of before){const actual=after.get(key);if(!actual||actual.length!==sizes.length)fail('NATIVE_SIZE_MAPPING','Primary actual-size occurrences changed');sizes.forEach((size,i)=>{const ratio=actual[i]/size;ratios.push(ratio);if(ratio<.7-1e-9||(explicitSize&&Math.abs(ratio-1)>1e-9))fail('NATIVE_SIZE_FLOOR','Every primary copy must retain >=.70 native actual font size; explicit sizes must remain equal');});}
 return {minNativeActualRatio:Math.min(...ratios),actualPrimarySizes:ratios.length,explicitSize};
}

function fitBounds(program,plan,cut,envelopes){
 if(A.layoutsBEditorial?.supports(cut.layout))return A.layoutsBEditorial.fitBounds(program,plan,cut,envelopes);
 if(cut.layout==='splitHalves'){
  const g=program.nativeGeometry,hold=[];for(const q of g.lines){const b=glyphBox(cut.params.font,g.size,q.ln,{track:.04}),shear=cut.params.variant==='shear'?.175*g.size:0;hold.push(A.cameraEnvelope([rect(plan.W/2+b.x0-shear,q.y+b.y0-cut.params.gap*g.size/2,plan.W/2+b.x1+shear,q.y+b.y1+cut.params.gap*g.size/2)],plan,cut,20));}
  const body=A.bounds(hold),all=A.bounds(envelopes);return {...all,x0:cut.params.line==='full'?Math.min(0,body.x0):body.x0,x1:cut.params.line==='full'?Math.max(plan.W,body.x1):body.x1};
 }
 if(cut.layout==='rain')return A.bounds(rainEnvelopes(program,plan,cut,true));
 if(cut.layout==='hanging'&&cut.params.rail&&!cut.layoutBRecipe){const all=A.bounds(envelopes),body=A.bounds(hangingEnvelopes(program,plan,cut,true));return {...all,x0:Math.min(body.x0,Math.max(0,all.x0)),x1:Math.max(body.x1,Math.min(plan.W,all.x1))};}
}
A.layoutsBFitBounds=fitBounds;
function candidateRecipes(plan,cut,program,explicitSize){
 if(A.layoutsBEditorial?.supports(cut.layout))return A.layoutsBEditorial.candidates(plan,cut,program,explicitSize);
 const main=program.events.filter(e=>e.role==='primary'&&e.kind==='item'&&e.args[0].placementMain).map(e=>e.args[0]);if(!main.length)return [];
 const size=cut.layout==='hanging'?program.nativeGeometry.size:Math.max(...main.map(i=>i.size)),source=flat(cut.text),recipes=[];
 for(const fontScale of [1,.95,.9,.85,.8,.75,.7]){if(explicitSize&&fontScale!==1)continue;for(const per of [...new Set([Math.max(1,Math.ceil(source.length/2)),Math.max(1,Math.ceil(source.length/3)),1])]){
  const family={elastic:'elastic-axis-path',hanging:'suspension-row-path',splitHalves:'split-native-travel-readable-size',equalizer:'equalizer-native-signal-rows',depthStack:'depth-vanishing-path',kanjiFocus:'focus-oversized-pair',stickerBomb:'sticker-cluster-reflow',tape:'tape-strip-wrap',dotMatrix:'led-grid-wrap'}[cut.layout]||(cellIDs.includes(cut.layout)?'native-cell-row-wrap':'source-sign-wrap'),strategy=family+(fontScale===1?'':'-discrete-reduce');
  recipes.push({strategy,mainSize:size,fontScale,mainText:cut.layout==='splitHalves'?program.nativeGeometry.mt:['columnsBig','halfVertical','kanjiFocus'].includes(cut.layout)?cut.text:J.splitLines(cut.text,per),per,
   ...(cut.layout==='splitHalves'?{splitTravelScale:1}:{}),...(cut.layout==='equalizer'?{equalizerPer:per,equalizerHeightScale:.45}:{}),...(cut.layout==='depthStack'?{depthPathScale:.35}:{}),
   ...(cut.layout==='hanging'?{hangingPer:per,hangingAngleScale:.65,suspensionIdentity:Object.fromEntries(program.nativeGeometry.items.map(q=>[q.i,{w:q.w,dk:q.dk,ampK:q.ampK}]))}:{}),
   ...(cut.layout==='dotMatrix'?{dotD:program.nativeGeometry.D,dotPitch:program.nativeGeometry.p}:{}),...(cellIDs.includes(cut.layout)?{cellPer:per,...(cut.layout==='bubbles'?{cellStagger:false,commonLift:true}:{})}:{}),
   quality:{stageUnchanged:true,wholeEffectScale:false,sourceClocksUnchanged:true}});
 }}return recipes;
}
function prepareCandidate(plan,cut,program,renderer,recipe,explicitSize,budget){
 const key=JSON.stringify(recipe);if(budget.cache.has(key)){budget.hits++;const c=budget.cache.get(key);if(c.error)fail(c.error.code,c.error.message);return c;}
 if(budget.cache.size>=128)fail('CUT_CANDIDATE_BUDGET','At most 128 unique B source reconstructions per cut');
 try{
  const candidate={...cut,layoutBRecipe:recipe},prepared=record(renderer,plan,candidate,sourceRestTime(cut)),mapping=sourceMapping(program,prepared,cut),sizeQuality=nativeSizeQuality(program,prepared,explicitSize),items=prepared.events.filter(e=>e.role==='primary'&&e.kind==='item'),min=Math.min(...items.filter(e=>e.args[0].placementSource).map(e=>effectiveSize(e.args[0])*(cut.contentScale??1))),metadata=items.filter(e=>!e.args[0].placementSource);
  if(min<Math.max(18,Math.min(plan.W,plan.H)*.035)||metadata.some(e=>e.args[0].size*(cut.contentScale??1)<Math.max(12,Math.min(plan.W,plan.H)*.02)))fail('READABILITY_FLOOR','Observed B recipe text below declared floor');
  if(cut.layout==='kanjiFocus'&&(prepared.nativeGeometry.giantMainRatio<6||prepared.nativeGeometry.big<Math.min(plan.W,plan.H)*.45))fail('FOCUS_HIERARCHY','Huge focus must remain >=6x main and >=.45 short side');
  const quality={...recipe.quality,...sizeQuality,minPrimary:min,...(A.layoutsBEditorial?.supports(cut.layout)?A.layoutsBEditorial.quality(prepared,plan,candidate,{native:program,explicitSize}):{})},envelopes=envelope(prepared,plan,candidate),value={mapping,quality,envelopes,fitBounds:fitBounds(prepared,plan,candidate,envelopes)};budget.cache.set(key,value);return value;
 }catch(e){budget.cache.set(key,{error:{code:e.code||'DRAW_PROGRAM_ERROR',message:e.message}});throw e;}
}
function adaptSign(plan,cut,program,renderer,segment,circle,explicitSize,budget){
 let count=0;for(const recipe of candidateRecipes(plan,cut,program,explicitSize)){
  if(count>=64)break;const entry={strategy:recipe.strategy,fontScale:recipe.fontScale,per:recipe.per,candidateCount:++count};
  try{const prepared=prepareCandidate(plan,cut,program,renderer,recipe,explicitSize,budget),solution=A.solveBasic(prepared.envelopes,circle,plan.W,plan.H,J.h(cut.seed,581),{supportHull:true,fitBounds:prepared.fitBounds});
   if(solution.status!=='safe'){segment.attempts.push({...entry,status:'rejected',reason:'INSUFFICIENT_SPACE',envelopeBounds:A.bounds(prepared.envelopes),solverReason:solution.reason});continue;}
   Object.assign(segment,{status:'safe',decision:'certified',failure:null,from:solution.offset,to:solution.offset,envelopes:prepared.envelopes,stageFitBounds:prepared.fitBounds||A.bounds(prepared.envelopes),nativeCropPolicy:['rain','credits','splitHalves'].includes(cut.layout)?cut.layout+'-declared-native-screen-edge-crop':null,composition:{...recipe,mapping:prepared.mapping,quality:prepared.quality},proof:{kind:'source-native-owned-reflow',rule:'Native source/clocks, complete source/metadata/owned-shape mapping, full interval camera/AA, strict readability and native actual-size floor'}});segment.attempts.push({...entry,status:'safe'});return;
  }catch(e){segment.attempts.push({...entry,status:'rejected',reason:e.code||'DRAW_PROGRAM_ERROR',details:e.message});}
 }
}
A.layoutsBNativeEnvelopes=envelope;
A.finalizeLayoutsB=(plan,cut,original,diagnostics,{revision,stepDur,reachTail,explicitSize=false,cacheInputs})=>{
 const evaluationRange=[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail];
 try{
  if(!(cut.dur>0)||cut.inDur<0||cut.outDur<0)fail('UNSUPPORTED_PARAMETER_RANGE','B finite positive duration required');
  if([...String(cut.text).trim()].length>64)fail('GEOMETRY_LIMIT','B source glyph count exceeds bounded domain');
  if(cut.layout==='stickerBomb'&&(!Number.isInteger(cut.params.cnt)||cut.params.cnt<4||cut.params.cnt>6))fail('UNSUPPORTED_PARAMETER_RANGE','Sticker source-rest domain requires native integer count4..6; late custom stickers are not certified');
  if(cut.layout==='elastic'&&(!(cut.params.amp>=.3&&cut.params.amp<=.45)||!(cut.params.every>=1.1&&cut.params.every<=1.6)||!['dot','ring','pin'].includes(cut.params.anchor)||!['h','v','diag'].includes(cut.params.orient)))fail('UNSUPPORTED_PARAMETER_RANGE','Elastic native amplitude/period/anchor/axis domain');
  if(cut.layout==='equalizer'&&(!(cut.params.tempo>=.42&&cut.params.tempo<=.55)||!['bars','blocks','mirror'].includes(cut.params.style)||![0,2,3].includes(cut.params.thin)))fail('UNSUPPORTED_PARAMETER_RANGE','Equalizer native style/thin/tempo domain');
  if(cut.layout==='depthStack'&&(!(cut.params.dist>=.42&&cut.params.dist<=.62)||!Number.isInteger(cut.params.copies)||cut.params.copies<1||cut.params.copies>8))fail('UNSUPPORTED_PARAMETER_RANGE','Depth native distance/count domain');
  if(cut.layout==='kanjiFocus'&&[...String(cut.text)].some(c=>c.length>1))fail('FOCUS_OCCURRENCE_UNSUPPORTED','Native focus UTF16 accent occurrence requires separate mapping');
  if(cut.layout==='hanging'&&(!(cut.params.amp>=.06&&cut.params.amp<=.11)||!(cut.params.kick>=.16&&cut.params.kick<=.26)))fail('UNSUPPORTED_PARAMETER_RANGE','Suspension amp/kick outside native domain');
  if(cut.layout==='bounceLine'&&(!(cut.params.hop>=.38&&cut.params.hop<=.6)||!(cut.params.tempo>=.42&&cut.params.tempo<=.6)))fail('UNSUPPORTED_PARAMETER_RANGE','Bounce hop/tempo outside native domain');
  if(cut.layout==='bubbles'&&(!(cut.params.rise>=.018&&cut.params.rise<=.035)||!(cut.params.wob>=.6&&cut.params.wob<=1.2)))fail('UNSUPPORTED_PARAMETER_RANGE','Bubble rise/wob outside native domain');
  if(cut.treat!=='none')fail('UNSUPPORTED_ADAPTER','B treatment needs an owned interval adapter');
  const finite=v=>typeof v==='number'?Number.isFinite(v):!v||typeof v!=='object'||Object.values(v).every(finite);if(!finite(cut.params))fail('UNSUPPORTED_PARAMETER_RANGE','Nonfinite B native parameter');
  cut.placementUnits=true;cut.placementLayoutsB=true;cut.layoutBEvaluationRange=evaluationRange;const renderer=Object.create(J.Renderer.prototype),program=record(renderer,plan,cut,sourceRestTime(cut));
  const envelopes=envelope(program,plan,cut),fixed=fixedEnvelopes(program,plan,cut),segments=[],owner=cut.layout+'.composition',budget={cache:new Map(),hits:0},nativeMapping=sourceMapping(program,program,cut);let proofKey=null,priorProof=null,proofChecked=false,reusedSegments=0;const proofOutcomes=[];
  for(let i=0;i<plan.lyricAvoidanceIndex.regions.length;i++){
   const r=plan.lyricAvoidanceIndex.regions[i],end=Math.min(r.end??plan.lyricAvoidanceIndex.regions[i+1]?.start??plan.duration,plan.duration);if(r.start>=evaluationRange[1])break;if(end<=evaluationRange[0]||end<=r.start)continue;
   const circle={cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)},nativeFitBounds=fitBounds(program,plan,cut,envelopes),solution=A.solveBasic(envelopes,circle,plan.W,plan.H,J.h(cut.seed,581),{supportHull:true,fitBounds:nativeFitBounds});
   if(proofChecked&&proofKey&&!proofKey.verify())fail('PLANNING_DEPENDENCY_CHANGED','B recipe dependency changed between region decisions');
   const segment={start:r.start,end,region:r.id,circle,stageFitBounds:nativeFitBounds||A.bounds(envelopes),nativeCropPolicy:['rain','credits','splitHalves','hanging'].includes(cut.layout)?cut.layout+'-declared-native-screen-edge-crop':null,from:solution.offset,to:solution.offset,status:solution.status,decision:solution.status==='safe'?'certified':'excluded-during-avoidance',failure:solution.status==='safe'?null:'no-certified-composition',attempts:[{strategy:'native-joint-translation',status:solution.status}],proof:{kind:'source-static-sign-with-declared-owned-motion-envelope',clock:'native clocks, complete interval; camera and AA included'}};if(fixed.length&&!A.clear(fixed,circle,Math.max(2,.005*Math.min(plan.W,plan.H)))){segment.status='insufficient-space';segment.decision='excluded-during-avoidance';segment.failure='fixed-stage-metadata-conflict';segment.attempts.push({strategy:'native-slate-attachment',status:'rejected',reason:'FIXED_PRIMARY_CONFLICT'});}else if(solution.status!=='safe'){/* benchmark native-reference: no candidate search/cache; native insufficiency retained */}segments.push(segment);
  }
  if(!priorProof&&proofOutcomes.length)recipeKeep(proofKey,{outcomes:proofOutcomes,budget:{unique:budget.cache.size,cacheHits:budget.hits}});
  cut.placementTrajectory={version:1,kind:'layouts-b-source-native',revision,evaluationRange,units:[{owner,envelopes,fixedEnvelopes:fixed,segments}],sourceProof:{continuousFontCSS:{scope:'ON delivery lead, depth copies, focus giant, keycap and bubble glyph entry only',rule:'fixed CSS font and continuous native effective uniform scale; native positions/clocks/effective size/physical stroke unchanged',AAChange:'ON-only hinting/AA can differ; OFF original',finalDeviceGuard:'fixed ink has one font-pixel support plus two device pixels; scale interval adds final guard or native body/convex guard; camera reserve20 covers normalized 2device pixels at render scale>=.1'},mode:'source-envelope',time:sourceRestTime(cut),nativeEndpoints:{pIn:1,pOut:0},semanticMapping:nativeMapping,...(cut.layout==='rain'?{deliveryLead:{fontCSS:'fixed at source base.size',scale:'continuous hs/base.size on both axes; effective size equals native hs',ink:'signed fixed measured ink times full positive scale interval, plus final 2 design-pixel guard and camera reserve20 (render-scale domain .1..4)',AAChange:'ON-only hinting/AA may differ from variable CSS font size; OFF unchanged'}}:{}),candidateBudget:{unique:priorProof?.budget.unique??budget.cache.size,cacheHits:priorProof?.budget.cacheHits??budget.hits,actualReconstructed:budget.cache.size,reusedSegments,execution:reusedSegments?'prior proof attempts reused; no candidate trial claimed':'fresh candidate reconstruction',perRegionLimit:64,perCutLimit:128}},measurementSupported:true,safety:segments.every(s=>s.status==='safe')?'certified-bounded-adapter':'insufficient-space',explicitSizePreserved:explicitSize};
  diagnostics.push({cut:cut.index,code:'STAGED_ADAPTER',measurement:'supported',safety:cut.placementTrajectory.safety});
 }catch(e){plan.cuts[plan.cuts.indexOf(cut)]=original;diagnostics.push({cut:cut.index,code:e.code||'DRAW_PROGRAM_ERROR',details:e.message,safety:'unsupported'});}
};
A.renderLayoutsB=(renderer,env)=>{
 A.validateFinal(env.plan);const scale=env.scale||1;if(scale<.1||scale>4)fail('UNSUPPORTED_RENDER_SCALE','B certified scale range .1..4');const tr=env.cut.placementTrajectory,unit=tr.units[0],active=unit.segments.find(s=>s.start<=env.realTime&&env.realTime<s.end),offset=A.offsetAt(unit,env.realTime);if(active?.composition){const cut={...env.cut,layoutBRecipe:active.composition};env=renderer.makeEnv(env.ctx,env.plan,cut,env.sc,{...env,cut});}const program=A.record(renderer,env);if(!program.measurementSupported)fail('UNSUPPORTED_DRAW_PROGRAM',JSON.stringify(program.diagnostics));
 const inside=(p,poly)=>{let pos=false,neg=false;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],v=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(v>1e-5)pos=true;if(v< -1e-5)neg=true;}return !(pos&&neg);};
 const groups=program.events.filter(e=>e.role==='primary').map(e=>({event:e,fixed:e.args[0]?.placementFixedStage===true,polygons:inkPolygons(e).map(p=>p.map(v=>v.map(n=>n/scale)))})),covered=groups.every(g=>g.polygons.every(p=>(g.fixed?unit.fixedEnvelopes:active?.envelopes||unit.envelopes).some(q=>p.every(v=>inside(v,q)))));if(!covered)fail('ENVELOPE_VIOLATION','B '+env.cut.layout+' native primary escaped complete interval envelope at '+env.t+' '+JSON.stringify(groups.filter(g=>g.polygons.some(p=>!(g.fixed?unit.fixedEnvelopes:active?.envelopes||unit.envelopes).some(q=>p.every(v=>inside(v,q))))).map(g=>({kind:g.event.kind,group:g.event.nativeGroup,text:g.event.args[0]?.text,bounds:A.bounds(g.polygons)}))));
 const polygons=groups.flatMap(g=>g.polygons.map(p=>p.map(v=>[v[0]+(g.fixed?0:offset[0]),v[1]+(g.fixed?0:offset[1])]))),region=J.resolveAvoidanceAt(env.plan,env.realTime),circle=region?J.avoidanceCirclePixels(region,env.plan.W,env.plan.H):null,clear=!polygons.length||A.clear(polygons,circle,Math.max(2,.005*Math.min(env.plan.W,env.plan.H))),offsets={[unit.owner]:offset};for(const g of groups)if(g.fixed)offsets[g.event.key??g.event.owner]=[0,0];
 env.placementObservation?.({cut:env.cut.index,realTime:env.realTime,motionTime:env.t,pass:env.pass,offset:offsets,measurementSupported:true,envelopeCovered:covered,safety:(!active||active.status==='safe')&&clear?'safe':'conflict',polygons,fixedStageMetadata:groups.filter(g=>g.fixed).map(g=>({owner:g.event.owner,text:g.event.args[0].text,polygons:g.polygons})),events:program.events.map(e=>({kind:e.kind,role:e.role,owner:e.owner,order:e.order,polygons:e.polygons}))});A.replay(env,program,offsets);
};
})();
