/* AVOID-008 C source-native adapters. Explicit opt-in; incomplete recipes are
   reported individually and never counted as a certified C34 adapter. */
(() => {
'use strict';
const A=J.placement,fail=(code,message)=>{const e=new Error(message);e.code=code;throw e;};
A.layoutsC34=['magazine','headlineDeck','contents','footnote','proofread','numbered','poster','swissGrid','dictionary','ema','ransom','newspaper','vinyl','cassette','bookSpine','polaroid','stampSheet','postcard','letterPaper','calendar','chochin','routeMap','stationSign','noren','tanzaku','omikuji','kakejiku','shoji','clapper','warningLabel','priceTag','nameTag','stickyNotes','karuta'];
const externalAdapters=new Map();
// Whole-C-finalization exact reuse. No geometry/quality/search operation changes.
// One shared input key per finalization, never one whole-plan key per cut.
const completedPool=new Map(),cacheIDs=new WeakMap();let nextCacheID=1;
const CACHE_ENTRIES=32,CACHE_BYTES=128*1024*1024,CACHE_HEADER=512;
let lastAdmissionPayloadBytes=0,lastAdmissionPayloadResidentBytes=0,lastCompactPayloadResidentBytes=0,lastPayloadRejection=null;
let cacheBytes=0,cacheResidentBytes=0,lastKeyBytes=0,lastKeyResidentBytes=0,lastPayloadBytes=0,cacheCounters={hits:0,misses:0,stores:0,bypasses:0,evictions:0,identityDrifts:0};
const cacheID=v=>{if(!cacheIDs.has(v))cacheIDs.set(v,nextCacheID++);return cacheIDs.get(v);};
const dependencyJSONStringify=JSON.stringify,dependencyGlobal=globalThis,dependencyObject=Object,dependencyArray=Array,dependencyJSON=JSON,dependencyNumber=Number,dependencyObjectPrototype=Object.prototype,dependencyArrayPrototype=Array.prototype,dependencyDescriptor=Object.getOwnPropertyDescriptor,dependencyPrototype=Object.getPrototypeOf,dependencyHasOwn=Object.hasOwn,dependencyIs=Object.is,dependencyFinite=Number.isFinite,dependencySpecies=Symbol.species;
const dependencyMapDescriptor=dependencyDescriptor(dependencyArrayPrototype,'map'),dependencyConstructorDescriptor=dependencyDescriptor(dependencyArrayPrototype,'constructor'),dependencySpeciesDescriptor=dependencyDescriptor(dependencyArray,dependencySpecies);
// Exact plain data only: undefined/-0/null prototypes/ordered own properties
// survive. Accessors, symbols, sparse arrays, opaque objects and cycles bypass.
function cacheEncode(value){
 const active=new WeakSet(),objectIDs=new WeakMap(),nodes=[];let encodedChars=0;
 const visit=v=>{
  if(v===undefined)return ['u'];if(v===null)return ['n'];
  if(typeof v==='number'){if(!Number.isFinite(v))throw Error('nonfinite cache data');return ['d',Object.is(v,-0)?'-0':v];}
  if(typeof v==='string'&&v.length*2>CACHE_BYTES)throw Error('oversized cache string');if(typeof v==='string'||typeof v==='boolean')return [typeof v==='string'?'s':'b',v];
  if(typeof v!=='object'||active.has(v)||Object.getOwnPropertySymbols(v).length)throw Error('opaque cache data');if(objectIDs.has(v))return ['r',objectIDs.get(v)];
  const objectID=nodes.length;objectIDs.set(v,objectID);nodes.push(null);
  const array=Array.isArray(v),proto=Object.getPrototypeOf(v),keys=Object.getOwnPropertyNames(v);
  if(array?(proto!==Array.prototype||keys.length!==v.length+1||keys.some(k=>k!=='length'&&(!/^(0|[1-9]\d*)$/.test(k)||+k>=v.length))):(proto!==Object.prototype&&proto!==null))throw Error('opaque cache prototype');
  active.add(v);const data=[];for(const k of keys){if(array&&k==='length')continue;const d=Object.getOwnPropertyDescriptor(v,k);if(!d||!Object.hasOwn(d,'value')||!d.enumerable)throw Error('cache accessor');data.push(array?visit(d.value):[k,visit(d.value)]);}active.delete(v);
  const node=[array?'a':proto===null?'z':'o',data],key=JSON.stringify(node);encodedChars+=key.length+1;if(encodedChars*2>CACHE_BYTES)throw Error('oversized cache encoding');nodes[objectID]=node;return ['r',objectID];
 };
 const root=visit(value);return JSON.stringify({codec:'C008-exact-graph-v1',root,nodes});
}
function cacheDecode(text){
 const packed=JSON.parse(text);if(packed.codec!=='C008-exact-graph-v1')throw Error('C cache codec');const memo=[];
 const visit=v=>{switch(v[0]){case'u':return undefined;case'n':return null;case'd':return v[1]==='-0'?-0:v[1];case's':case'b':return v[1];case'r':{
  if(memo[v[1]])return memo[v[1]];const [kind,data]=packed.nodes[v[1]],out=kind==='a'?data:Object.fromEntries(data);if(kind==='z')Object.setPrototypeOf(out,null);memo[v[1]]=out;
  // Parsed arrays are fresh dense containers; fromEntries creates own writable
  // data slots (including __proto__) before assignment can see any prototype.
  if(kind==='a'){for(let i=0;i<data.length;i++)out[i]=visit(data[i]);}else for(const [key,child]of data)out[key]=visit(child);return out;
 }default:throw Error('C cache tag');}};
 return visit(packed.root);
}
// Private payload wire only. The unchanged old encoder remains admission authority.
const payloadParse=JSON.parse,payloadStringify=JSON.stringify,payloadDefine=Object.defineProperty,payloadSetPrototype=Object.setPrototypeOf,payloadNames=Object.getOwnPropertyNames,payloadArray=Array.isArray,payloadInteger=Number.isInteger,payloadEncoder=TextEncoder,payloadEncoderPrototype=TextEncoder.prototype,payloadEncodeDescriptor=dependencyDescriptor(TextEncoder.prototype,'encode');
function payloadGuard(){
 const same=(o,k,v)=>{const d=dependencyDescriptor(o,k);return d&&dependencyHasOwn(d,'value')&&d.value===v;};
 if(!same(dependencyGlobal,'Object',dependencyObject)||!same(dependencyGlobal,'Array',dependencyArray)||!same(dependencyGlobal,'JSON',dependencyJSON)||!same(dependencyGlobal,'Number',dependencyNumber)||!same(dependencyGlobal,'TextEncoder',payloadEncoder)||!same(dependencyJSON,'parse',payloadParse)||!same(dependencyJSON,'stringify',payloadStringify)||!same(dependencyObject,'defineProperty',payloadDefine)||!same(dependencyObject,'setPrototypeOf',payloadSetPrototype)||!same(dependencyObject,'getOwnPropertyNames',payloadNames)||!same(dependencyObject,'getOwnPropertyDescriptor',dependencyDescriptor)||!same(dependencyObject,'getPrototypeOf',dependencyPrototype)||!same(dependencyObject,'hasOwn',dependencyHasOwn)||!same(dependencyArray,'isArray',payloadArray)||!same(dependencyNumber,'isInteger',payloadInteger)||!same(payloadEncoder,'prototype',payloadEncoderPrototype))throw Error('C payload native seam');
 const d=dependencyDescriptor(payloadEncoderPrototype,'encode');if(!d||!dependencyHasOwn(d,'value')||d.value!==payloadEncodeDescriptor.value||d.get||d.set)throw Error('C payload encoding seam');
 if(dependencyDescriptor(dependencyObjectPrototype,'toJSON')||dependencyDescriptor(dependencyArrayPrototype,'toJSON'))throw Error('C payload JSON prototype seam');
}
function payloadCompact(oldText){
 payloadGuard();const packed=payloadParse(oldText);if(packed.codec!=='C008-exact-graph-v1')throw Error('C payload admission codec');
 const paths=[],states=[],aliases=[],scalars=[],nullPrototypes=[];let rootSpecial=packed.root[0]==='u'?'u':packed.root[0]==='d'&&packed.root[1]==='-0'?'-0':null;
 const wire={codec:'C008-payload-tree-repairs-v2',tree:null,aliases,scalars,nullPrototypes,rootSpecial},utf8=s=>new payloadEncoder().encode(s).length;
 const inlineChars=oldText.length,inlineBytes=utf8(oldText);let metadataChars=payloadStringify(wire).length-4,metadataBytes=utf8(payloadStringify(wire))-4;
 const check=()=>{if((inlineChars+metadataChars)*2>CACHE_BYTES||inlineBytes+metadataBytes>CACHE_BYTES)throw Error('C payload repair growth');};check();
 const charge=(section,chars,bytes)=>{metadataChars+=chars+(section.length?1:0);metadataBytes+=bytes+(section.length?1:0);check();};
 const rootPath={parent:null,key:null,depth:0,chars:2,bytes:2},childPath=(parent,key)=>{const s=payloadStringify(key),chars=parent.depth?parent.chars+1+s.length:2+s.length,bytes=parent.depth?parent.bytes+1+utf8(s):2+utf8(s);return {parent,key,depth:parent.depth+1,chars,bytes};};
 const materialize=p=>{const a=new Array(p.depth);for(let i=p.depth-1;i>=0;i--){payloadDefine(a,i,{value:p.key,enumerable:true,writable:true,configurable:true});p=p.parent;}return a;};
 const visit=(token,path,parent,key)=>{switch(token[0]){
  case'n':return null;case's':case'b':return token[1];case'd':if(token[1]!=='-0')return token[1];case'u':{
   const kind=token[0]==='u'?'u':'-0';if(!parent){rootSpecial=kind;}else{const k=payloadStringify(key),t=payloadStringify(kind);charge(scalars,4+t.length+parent.chars+k.length,4+utf8(t)+parent.bytes+utf8(k));scalars[scalars.length]=[kind,materialize(parent),key];}return null;
  }
  case'r':{
   const id=token[1];if(states[id]===1)throw Error('C payload cycle');if(states[id]===2){const target=paths[id],k=payloadStringify(key);charge(aliases,4+parent.chars+k.length+target.chars,4+parent.bytes+utf8(k)+target.bytes);aliases[aliases.length]=[materialize(parent),key,materialize(target)];return null;}
   states[id]=1;paths[id]=path;const node=packed.nodes[id],kind=node[0],data=node[1],out=kind==='a'?[]:{};
   if(kind==='z'){charge(nullPrototypes,path.chars,path.bytes);nullPrototypes[nullPrototypes.length]=materialize(path);}
   for(let i=0;i<data.length;i++){const k=kind==='a'?i:data[i][0],v=visit(kind==='a'?data[i]:data[i][1],childPath(path,k),path,k);payloadDefine(out,k,{value:v,enumerable:true,writable:true,configurable:true});}states[id]=2;return out;
  }
  default:throw Error('C payload admission tag');
 }};
 wire.tree=visit(packed.root,rootPath,null,null);wire.rootSpecial=rootSpecial;const text=payloadStringify(wire);if(text.length*2>CACHE_BYTES||utf8(text)>CACHE_BYTES)throw Error('C payload compact budget');payloadGuard();return text;
}
function payloadDecode(text){
 // UTF8 is charged before the private immutable wire is stored; avoid a warm copy.
 payloadGuard();if(text.length*2>CACHE_BYTES)throw Error('C payload wire budget');
 const p=payloadParse(text),names=payloadNames(p),expected=['codec','tree','aliases','scalars','nullPrototypes','rootSpecial'];if(names.length!==expected.length)throw Error('C payload schema');for(let i=0;i<expected.length;i++)if(!dependencyHasOwn(p,expected[i]))throw Error('C payload schema');
 if(p.codec!=='C008-payload-tree-repairs-v2'||!payloadArray(p.aliases)||!payloadArray(p.scalars)||!payloadArray(p.nullPrototypes)||p.rootSpecial!==null&&p.rootSpecial!=='u'&&p.rootSpecial!=='-0')throw Error('C payload schema');
 if(p.rootSpecial!==null){if(p.tree!==null||p.aliases.length||p.scalars.length||p.nullPrototypes.length)throw Error('C payload root marker');payloadGuard();return p.rootSpecial==='u'?undefined:-0;}
 const pending={},repairs=[],own=(o,k)=>{if(o===pending||!o||typeof o!=='object'||(payloadArray(o)?!payloadInteger(k)||k<0||k>=o.length:typeof k!=='string'))throw Error('C payload own path type');const d=dependencyDescriptor(o,k);if(!d||!dependencyHasOwn(d,'value')||!d.enumerable)throw Error('C payload own path');return d.value;},at=path=>{if(!payloadArray(path))throw Error('C payload path');let value=p.tree;for(let i=0;i<path.length;i++)value=own(value,path[i]);if(value===pending)throw Error('C payload alias path');return value;};
 for(let i=0;i<p.nullPrototypes.length;i++){const value=at(p.nullPrototypes[i]);if(!value||typeof value!=='object'||payloadArray(value)||dependencyPrototype(value)!==dependencyObjectPrototype)throw Error('C payload null prototype');payloadSetPrototype(value,null);}
 const reserve=(parentPath,key,value)=>{const parent=at(parentPath);if(own(parent,key)!==null)throw Error('C payload repair placeholder');payloadDefine(parent,key,{value:pending,enumerable:true,writable:true,configurable:true});repairs[repairs.length]=[parent,key,value];};
 for(let i=0;i<p.scalars.length;i++){const row=p.scalars[i];if(!payloadArray(row)||row.length!==3||row[0]!=='u'&&row[0]!=='-0')throw Error('C payload scalar repair');reserve(row[1],row[2],row[0]==='u'?undefined:-0);}
 const earlier=(target,parent,key)=>{if(!payloadArray(target)||!payloadArray(parent))throw Error('C payload alias path');let common=p.tree,i=0;const depth=parent.length+1;while(i<target.length&&i<depth&&target[i]===(i<parent.length?parent[i]:key)){common=own(common,target[i]);i++;}if(i===target.length||i===depth)throw Error('C payload cyclic alias');const a=target[i],b=i<parent.length?parent[i]:key;if(payloadArray(common)){if(!payloadInteger(a)||!payloadInteger(b)||a>=b)throw Error('C payload forward alias');}else{const keys=payloadNames(common);let ai=-1,bi=-1;for(let j=0;j<keys.length;j++){if(keys[j]===a)ai=j;if(keys[j]===b)bi=j;}if(ai<0||bi<0||ai>=bi)throw Error('C payload forward alias');}};
 for(let i=0;i<p.aliases.length;i++){const row=p.aliases[i];if(!payloadArray(row)||row.length!==3)throw Error('C payload alias repair');earlier(row[2],row[0],row[1]);const target=at(row[2]);if(!target||typeof target!=='object')throw Error('C payload alias target');reserve(row[0],row[1],target);}
 for(let i=0;i<repairs.length;i++){const r=repairs[i];payloadDefine(r[0],r[1],{value:r[2],enumerable:true,writable:true,configurable:true});}payloadGuard();return p.tree;
}
// Only decoded completed-plan arrays can enter this private, latest-generation registry.
// Bootstrap uses standard natives; later live helper replacements are never invoked.
const edgeApply=Reflect.apply,edgeCall=Function.prototype.call,edgeBind=Function.prototype.bind,edgeWeakMap=WeakMap;
const edgeGet=edgeApply(edgeBind,edgeCall,[WeakMap.prototype.get]),edgeSet=edgeApply(edgeBind,edgeCall,[WeakMap.prototype.set]);
const edgeDescriptor=Object.getOwnPropertyDescriptor,edgePrototype=Object.getPrototypeOf,edgeFrozen=Object.isFrozen,edgeArray=Array.isArray,edgeFinite=Number.isFinite,edgeDefine=Object.defineProperty,edgeArrayPrototype=Array.prototype,edgeHasOwn=Object.hasOwn;
const edgeGlobal=globalThis,edgeArrayConstructor=Array,edgeObjectPrototype=Object.prototype,edgeSpecies=Symbol.species;
const edgeSliceDescriptor=edgeDescriptor(edgeArrayPrototype,'slice'),edgeMapDescriptor=edgeDescriptor(edgeArrayPrototype,'map'),edgeConstructorDescriptor=edgeDescriptor(edgeArrayPrototype,'constructor'),edgeSpeciesDescriptor=edgeDescriptor(edgeArrayConstructor,edgeSpecies);
const edgeSlice=edgeApply(edgeBind,edgeCall,[edgeSliceDescriptor.value]),edgeMap=edgeApply(edgeBind,edgeCall,[edgeMapDescriptor.value]);
const edgeSameDescriptor=(a,b)=>{if(!a||!b)return false;const av=edgeHasOwn(a,'value'),bv=edgeHasOwn(b,'value');return av===bv&&a.enumerable===b.enumerable&&a.configurable===b.configurable&&(av?a.value===b.value&&a.writable===b.writable:a.get===b.get&&a.set===b.set);};
// Separate from payloadGuard: native slice/map still consult constructor/species.
// Decoded arrays and our fresh snapshots have no own constructor or method hooks.
function edgeArrayGuard(){
 const global=edgeDescriptor(edgeGlobal,'Array');
 return !!global&&edgeHasOwn(global,'value')&&global.value===edgeArrayConstructor&&edgePrototype(edgeArrayPrototype)===edgeObjectPrototype&&edgePrototype(edgeObjectPrototype)===null&&edgeSameDescriptor(edgeDescriptor(edgeArrayPrototype,'constructor'),edgeConstructorDescriptor)&&edgeSameDescriptor(edgeDescriptor(edgeArrayConstructor,edgeSpecies),edgeSpeciesDescriptor)&&edgeSameDescriptor(edgeDescriptor(edgeArrayPrototype,'slice'),edgeSliceDescriptor)&&edgeSameDescriptor(edgeDescriptor(edgeArrayPrototype,'map'),edgeMapDescriptor);
}
const EDGE_MAX_EDGES=65536,EDGE_MAX_POLYGONS=8192,EDGE_MAX_SLOTS=131072,edgeLimit={};
const edgeEmpty=()=>({map:new edgeWeakMap(),polygons:0,edges:0,slots:0,duplicates:0,capped:0,validations:0,rejected:0,hits:0,fallbacks:0,upfrontReads:0,snapshotPointRefs:0,reservedCoordinateSlots:0,coordinateDescriptorReads:0,edgeCoordinateReads:0,preparedPolygons:0,preparedEdges:0,registrationBypasses:0,preparationBypasses:0});
let edgeGeneration=0,edgeState=edgeEmpty();
function edgeRegisterFinal(result){
 const state=edgeEmpty();
 const read=(o,k)=>{if(state.slots>=EDGE_MAX_SLOTS)throw edgeLimit;state.slots++;state.upfrontReads++;if(!o||typeof o!=='object')return undefined;const d=edgeDescriptor(o,k);return d&&edgeHasOwn(d,'value')?d.value:undefined;};
 const each=(a,fn)=>{if(!edgeArray(a))return;for(let i=0;i<a.length;i++)fn(read(a,i));};
 const polygon=q=>{
  if(!edgeArray(q))return;if(edgeGet(state.map,q)){state.duplicates++;return;}
  if(state.polygons>=EDGE_MAX_POLYGONS||state.edges+q.length>EDGE_MAX_EDGES){state.capped++;return;}
  if(edgePrototype(q)!==edgeArrayPrototype||edgeDescriptor(q,'constructor')||edgeDescriptor(q,'slice'))return;
  // Reserve exactly the old q-index + x/y budget, without claiming coordinates
  // were read. Refuse before copying if even the conservative reservation fails.
  const reserve=q.length*3;if(state.slots+reserve>EDGE_MAX_SLOTS){state.slots=EDGE_MAX_SLOTS;throw edgeLimit;}
  state.slots+=reserve;state.reservedCoordinateSlots+=q.length*2;
  const points=edgeSlice(q);state.upfrontReads+=q.length;state.snapshotPointRefs+=q.length;
  edgeSet(state.map,q,{points,edges:null,length:q.length,valid:0});state.polygons++;state.edges+=q.length;
 };
 const fields=(o,names)=>{for(let i=0;i<names.length;i++)each(read(o,names[i]),polygon);};
 if(!edgeArrayGuard()){state.registrationBypasses++;edgeGeneration++;edgeState=state;return;}
 try{
  each(read(read(result,'plan'),'cuts'),cut=>{const tr=read(cut,'placementTrajectory');if(!tr)return;each(read(tr,'units'),unit=>{fields(unit,['envelopes','stageEnvelopes']);each(read(unit,'segments'),segment=>{fields(segment,['envelopes','stageEnvelopes','entryEnvelopes','exitEnvelopes','badgeEntryEnvelopes']);each(read(segment,'bodies'),body=>{const full=read(body,'full'),hold=read(body,'hold');if(full)polygon(full);if(hold)polygon(hold);});});});});
 }catch(e){if(e===edgeLimit)state.capped++;else{edgeGeneration++;edgeState=edgeEmpty();return;}}
 if(!edgeArrayGuard()){edgeGeneration++;edgeState=edgeEmpty();edgeState.registrationBypasses=1;return;}
 edgeGeneration++;edgeState=state;
}
function edgeContains(p,q,epsilon){
 const state=edgeState,record=edgeGet(state.map,q);if(!record){state.fallbacks++;return null;}
 if(!record.valid){
  state.validations++;let ok=edgeArrayGuard();if(!ok)state.preparationBypasses++;
  const ld=ok?edgeDescriptor(q,'length'):null;ok=ok&&edgePrototype(q)===edgeArrayPrototype&&edgeFrozen(q)&&!!ld&&edgeHasOwn(ld,'value')&&ld.value===record.length&&!ld.writable&&!ld.configurable;
  for(let i=0;ok&&i<record.length;i++){
   // Compare to the genuine parse-born original before inspecting any changed
   // reference. A replacement Proxy receives no descriptor/prototype traps.
   const d=edgeDescriptor(q,i),point=record.points[i];
   ok=!!d&&edgeHasOwn(d,'value')&&d.value===point&&!d.writable&&!d.configurable;
   if(!ok)break;
   ok=edgeArray(point)&&edgePrototype(point)===edgeArrayPrototype&&edgeFrozen(point)&&point.length===2;
   if(!ok)break;
   const x=edgeDescriptor(point,0),y=edgeDescriptor(point,1);state.coordinateDescriptorReads+=2;
   ok=!!x&&!!y&&edgeHasOwn(x,'value')&&edgeHasOwn(y,'value')&&!x.writable&&!x.configurable&&!y.writable&&!y.configurable&&typeof x.value==='number'&&typeof y.value==='number'&&edgeFinite(x.value)&&edgeFinite(y.value);
  }
  if(ok){
   // Every source coordinate is now frozen own primitive data. Native map uses
   // CreateDataProperty for its private output; no per-edge defineProperty loop.
   record.edges=edgeMap(record.points,(a,i)=>{const b=record.points[(i+1)%record.length];return [b[0]-a[0],b[1]-a[1],a[0],a[1]];});
   state.edgeCoordinateReads+=record.length*6;
   if(!edgeArrayGuard()){ok=false;state.preparationBypasses++;record.edges=null;}
  }
  record.valid=ok?1:-1;if(ok){state.preparedPolygons++;state.preparedEdges+=record.length;}else state.rejected++;
 }
 if(record.valid<0){state.fallbacks++;return null;}state.hits++;const edges=record.edges;let pos=false,neg=false;
 for(let i=0;i<record.length;i++){const e=edges[i],cross=e[0]*(p[1]-e[3])-e[1]*(p[0]-e[2]);if(cross>epsilon)pos=true;if(cross< -epsilon)neg=true;}return !(pos&&neg);
}
edgeDefine(A,'layoutsCImmutablePolygonContains',{value:edgeContains,writable:false,enumerable:true,configurable:false});
edgeDefine(A,'layoutsCImmutableEdgeStats',{value:()=>({generation:edgeGeneration,polygons:edgeState.polygons,edges:edgeState.edges,slots:edgeState.slots,duplicates:edgeState.duplicates,capped:edgeState.capped,validations:edgeState.validations,rejected:edgeState.rejected,hits:edgeState.hits,fallbacks:edgeState.fallbacks,upfrontReads:edgeState.upfrontReads,snapshotPointRefs:edgeState.snapshotPointRefs,reservedCoordinateSlots:edgeState.reservedCoordinateSlots,coordinateDescriptorReads:edgeState.coordinateDescriptorReads,edgeCoordinateReads:edgeState.edgeCoordinateReads,preparedPolygons:edgeState.preparedPolygons,preparedEdges:edgeState.preparedEdges,registrationBypasses:edgeState.registrationBypasses,preparationBypasses:edgeState.preparationBypasses,maxEdges:EDGE_MAX_EDGES,maxPolygons:EDGE_MAX_POLYGONS,maxSlots:EDGE_MAX_SLOTS}),writable:false,enumerable:true,configurable:false});

function cacheDependencies(){
 payloadGuard();
 if(typeof document==='undefined'||document.fonts.status!=='loaded')throw Error('C cache fonts not loaded');
 const faces=Array.from(document.fonts);if(faces.length>128||faces.some(f=>f.status!=='loaded'))throw Error('C cache font domain');
 const seams=[],seen=new WeakSet(),walk=(obj,path,depth)=>{if(!obj||seen.has(obj))return;seen.add(obj);for(const key of Object.getOwnPropertyNames(obj).sort()){if(['caller','callee','arguments'].includes(key))continue;const d=Object.getOwnPropertyDescriptor(obj,key);if(!d||!Object.hasOwn(d,'value')){seams.push([path+'.'+key,'accessor',d?.get?cacheID(d.get):null,d?.set?cacheID(d.set):null]);continue;}const v=d.value;if(typeof v==='function')seams.push([path+'.'+key,cacheID(v)]);else if(v===null||typeof v!=='object')seams.push([path+'.'+key,'data',v]);else if(depth&&(Object.getPrototypeOf(v)===Object.prototype||Array.isArray(v)))walk(v,path+'.'+key,depth-1);}};
 // All public placement/editorial/object helpers, easing/metrics/glyph methods
 // and registered native layouts participate, plus every root J function.
 walk(J,'J',0);walk(A,'placement',4);walk(J.E,'E',4);walk(J.metrics,'metrics',2);walk(J.glyphs,'glyphs',2);walk(J.Renderer.prototype,'Renderer',2);walk(J.LAYOUTS,'layouts',2);for(const [name,obj]of [['Math',Math],['JSON',JSON],['Object',Object],['Array',Array.prototype],['String',String.prototype],['Number',Number.prototype],['Map',Map.prototype],['Set',Set.prototype],['TextEncoder',TextEncoder.prototype]])walk(obj,'intrinsic.'+name,0);for(const name of ['CanvasRenderingContext2D','TextMetrics','FontFace']){const ctor=globalThis[name];if(typeof ctor==='function'){seams.push(['global.'+name,cacheID(ctor)]);walk(ctor.prototype,name+'.prototype',1);}}
 const fontGetter=Object.getOwnPropertyDescriptor(document,'fonts')||Object.getOwnPropertyDescriptor(Document.prototype,'fonts');const fontSetAccessor={get:fontGetter?.get?cacheID(fontGetter.get):null,set:fontGetter?.set?cacheID(fontGetter.set):null};
 const measurement=A.measurementContext(),measurementOwnSeams=[];for(const key of Object.getOwnPropertyNames(measurement).sort()){const d=Object.getOwnPropertyDescriptor(measurement,key);if(typeof d?.value==='function')measurementOwnSeams.push([key,'function',cacheID(d.value)]);else if(d?.get||d?.set)measurementOwnSeams.push([key,'accessor',d.get?cacheID(d.get):null,d.set?cacheID(d.set):null]);}
 const adapters=Array.from(externalAdapters,([id,a])=>[id,a.id,cacheID(a.finalize),cacheID(a.render)]);
 const metadata={version:'C008-completed-v1',revision:J.metrics.revision,language:J.lang,fonts:J.FONTS,fontSetIdentity:cacheID(document.fonts),fontSetAccessor,measurementContextIdentity:cacheID(measurement),measurementOwnSeams,devicePixelRatio:globalThis.devicePixelRatio,faces:faces.map(f=>({identity:cacheID(f),family:f.family,style:f.style,weight:f.weight,stretch:f.stretch,unicodeRange:f.unicodeRange,status:f.status,featureSettings:f.featureSettings,variationSettings:f.variationSettings,display:f.display,ascentOverride:f.ascentOverride,descentOverride:f.descentOverride,lineGapOverride:f.lineGapOverride})),seams,adapters};
 return cacheDependencyEncode(metadata);
}
// Only collector-owned dense tables use this representation. Arbitrary fonts
// retain the old graph codec; nonprimitive metadata can never lose cross-aliases.
function cacheDependencyEncode(m){
 const eligible=()=>{
  // Inspect live descriptors with captured natives: accessors are rejected,
  // never invoked. Native map must retain its dense own-slot/species behavior.
  const data=(object,key,value)=>{const d=dependencyDescriptor(object,key);return !!d&&dependencyHasOwn(d,'value')&&d.value===value;};
  const same=(a,b)=>{if(!a||!b)return a===b;const av=dependencyHasOwn(a,'value'),bv=dependencyHasOwn(b,'value');return av===bv&&a.enumerable===b.enumerable&&a.configurable===b.configurable&&(av?a.value===b.value&&a.writable===b.writable:a.get===b.get&&a.set===b.set);};
  if(!data(dependencyGlobal,'Object',dependencyObject)||!data(dependencyGlobal,'Array',dependencyArray)||!data(dependencyGlobal,'JSON',dependencyJSON)||!data(dependencyGlobal,'Number',dependencyNumber)||!data(dependencyObject,'prototype',dependencyObjectPrototype)||!data(dependencyArray,'prototype',dependencyArrayPrototype)||!data(dependencyObject,'getOwnPropertyDescriptor',dependencyDescriptor)||!data(dependencyObject,'getPrototypeOf',dependencyPrototype)||!data(dependencyObject,'hasOwn',dependencyHasOwn)||!data(dependencyObject,'is',dependencyIs)||!data(dependencyNumber,'isFinite',dependencyFinite)||!data(dependencyJSON,'stringify',dependencyJSONStringify)||!same(dependencyDescriptor(dependencyArrayPrototype,'map'),dependencyMapDescriptor)||!data(dependencyArrayPrototype,'constructor',dependencyArray)||!same(dependencyDescriptor(dependencyArrayPrototype,'constructor'),dependencyConstructorDescriptor)||!same(dependencyDescriptor(dependencyArray,dependencySpecies),dependencySpeciesDescriptor)||dependencyPrototype(dependencyArrayPrototype)!==dependencyObjectPrototype||dependencyPrototype(dependencyObjectPrototype)!==null||dependencyDescriptor(dependencyArrayPrototype,'toJSON')||dependencyDescriptor(dependencyObjectPrototype,'toJSON'))throw Error('C cache dependency JSON seam');
 };
 eligible();let upperBytes=1024;
 const scalar=v=>{let token,charge;if(v===undefined){token=['u'];charge=64;}else if(v===null){token=['n'];charge=64;}else if(typeof v==='number'){if(!dependencyFinite(v))throw Error('nonfinite dependency metadata');token=['d',dependencyIs(v,-0)?'-0':v];charge=64;}else if(typeof v==='string'){token=['s',v];charge=64+12*v.length;}else if(typeof v==='boolean'){token=['b',v];charge=64;}else throw Error('nonprimitive dependency metadata');upperBytes+=charge;if(upperBytes>CACHE_BYTES)throw Error('oversized dependency metadata');return token;};
 const rows=table=>table.map(row=>row.map(scalar)),fields=['identity','family','style','weight','stretch','unicodeRange','status','featureSettings','variationSettings','display','ascentOverride','descentOverride','lineGapOverride'];
 const metadata=[scalar(m.version),scalar(m.revision),scalar(m.language),scalar(m.fontSetIdentity),[scalar(m.fontSetAccessor.get),scalar(m.fontSetAccessor.set)],scalar(m.measurementContextIdentity),rows(m.measurementOwnSeams),scalar(m.devicePixelRatio),m.faces.map(face=>fields.map(key=>scalar(face[key]))),rows(m.seams),rows(m.adapters)];
 const fonts=cacheEncode(m.fonts);upperBytes+=64+12*fonts.length;if(upperBytes>CACHE_BYTES)throw Error('oversized dependency metadata');eligible();
 const result=dependencyJSONStringify(['C008-deps-primitive-table-v2',metadata,fonts]);eligible();return result;
}
A.clearLayoutsCFinalCache=()=>{completedPool.clear();cacheBytes=cacheResidentBytes=lastKeyBytes=lastKeyResidentBytes=lastPayloadBytes=lastAdmissionPayloadBytes=lastAdmissionPayloadResidentBytes=lastCompactPayloadResidentBytes=0;lastPayloadRejection=null;cacheCounters={hits:0,misses:0,stores:0,bypasses:0,evictions:0,identityDrifts:0};};
A.layoutsCFinalCacheStats=()=>({...cacheCounters,entries:completedPool.size,keySerializedBytes:Array.from(completedPool.values()).reduce((n,e)=>n+e.keyBytes,0),payloadSerializedBytes:Array.from(completedPool.values()).reduce((n,e)=>n+e.payloadBytes,0),managementBytes:completedPool.size*CACHE_HEADER,lastAttemptKeyBytes:lastKeyBytes,lastAttemptKeyResidentBytes:lastKeyResidentBytes,lastAttemptPayloadBytes:lastPayloadBytes,lastAttemptPayloadResidentBytes:lastCompactPayloadResidentBytes,lastAttemptAdmissionPayloadBytes:lastAdmissionPayloadBytes,lastAttemptAdmissionPayloadResidentBytes:lastAdmissionPayloadResidentBytes,lastPayloadRejection,serializedBytes:cacheBytes,residentStringAndHeaderBytes:cacheResidentBytes,maxEntries:CACHE_ENTRIES,maxSerializedBytes:CACHE_BYTES,maxResidentStringAndHeaderBytes:CACHE_BYTES,entryHeaderBytes:CACHE_HEADER,scope:'whole exact C finalization; hits do not reconstruct or claim candidate work'});
const beginFinalCache=(input,options,lineage)=>{
 if(options.layoutsC!==true||options.layoutsA===true||options.layoutsB===true)return null;
 try{const dependencies=cacheDependencies(),inputKey=cacheEncode({input,options,lineage}),key=dependencies+'\n'+inputKey,bytes=new TextEncoder().encode(key).length+CACHE_HEADER,resident=key.length*2+CACHE_HEADER;lastKeyBytes=bytes-CACHE_HEADER;lastKeyResidentBytes=key.length*2;lastPayloadBytes=lastAdmissionPayloadBytes=lastAdmissionPayloadResidentBytes=lastCompactPayloadResidentBytes=0;lastPayloadRejection=null;if(bytes>CACHE_BYTES||resident>CACHE_BYTES)throw Error('C cache oversized key');return {key,dependencies,inputKey,input,options,lineage};}catch{cacheCounters.bypasses++;return null;}
};
function verifyCacheContext(context){return cacheDependencies()===context.dependencies&&cacheEncode({input:context.input,options:context.options,lineage:context.lineage})===context.inputKey;}
const readFinalCache=context=>{
 if(!context)return null;const entry=completedPool.get(context.key);if(!entry){cacheCounters.misses++;return null;}
 try{if(!verifyCacheContext(context))throw Error('C cache dependency drift');const result=payloadDecode(entry.payload);edgeRegisterFinal(result);completedPool.delete(context.key);completedPool.set(context.key,entry);cacheCounters.hits++;return result;}catch{cacheCounters.identityDrifts++;cacheCounters.bypasses++;return null;}
};
const keepFinalCache=(context,result)=>{
 if(!context)return;try{if(!verifyCacheContext(context)){cacheCounters.identityDrifts++;throw Error('C cache dependency drift');}lastPayloadRejection='old-payload-codec';const oldPayload=cacheEncode(result),keyBytes=new TextEncoder().encode(context.key).length;lastAdmissionPayloadBytes=new TextEncoder().encode(oldPayload).length;lastAdmissionPayloadResidentBytes=oldPayload.length*2;lastPayloadRejection='old-entry';if(keyBytes+lastAdmissionPayloadBytes+CACHE_HEADER>CACHE_BYTES||context.key.length*2+lastAdmissionPayloadResidentBytes+CACHE_HEADER>CACHE_BYTES)throw Error('C cache old admission budget');lastPayloadRejection='compact-growth';const payload=payloadCompact(oldPayload),payloadBytes=new TextEncoder().encode(payload).length,bytes=keyBytes+payloadBytes+CACHE_HEADER,resident=(context.key.length+payload.length)*2+CACHE_HEADER;lastKeyBytes=keyBytes;lastPayloadBytes=payloadBytes;lastCompactPayloadResidentBytes=payload.length*2;lastPayloadRejection='compact-entry';if(bytes>CACHE_BYTES||resident>CACHE_BYTES)throw Error('C cache oversized result');lastPayloadRejection=null;const prior=completedPool.get(context.key);if(prior){cacheBytes-=prior.bytes;cacheResidentBytes-=prior.resident;completedPool.delete(context.key);}while(completedPool.size>=CACHE_ENTRIES||cacheBytes+bytes>CACHE_BYTES||cacheResidentBytes+resident>CACHE_BYTES){const [key,old]=completedPool.entries().next().value;completedPool.delete(key);cacheBytes-=old.bytes;cacheResidentBytes-=old.resident;cacheCounters.evictions++;}completedPool.set(context.key,Object.freeze({payload,keyBytes,payloadBytes,bytes,resident}));cacheBytes+=bytes;cacheResidentBytes+=resident;cacheCounters.stores++;}catch{cacheCounters.bypasses++;}
};
A.installLayoutsCFinalCache(Object.freeze({begin:beginFinalCache,read:readFinalCache,keep:keepFinalCache}));
A.registerLayoutsCAdapter=(layout,adapter)=>{
 if(!A.layoutsC34.includes(layout)||['stickyNotes','nameTag','clapper'].includes(layout)||externalAdapters.has(layout)||!adapter||typeof adapter.id!=='string'||!/^[A-Za-z0-9_-]{3,64}$/.test(adapter.id)||typeof adapter.finalize!=='function'||typeof adapter.render!=='function')fail('INVALID_C_ADAPTER_REGISTRATION','Unique C source ID, stable adapter ID, finalize and render functions required');
 externalAdapters.set(layout,Object.freeze({id:adapter.id,finalize:adapter.finalize,render:adapter.render}));
};
A.layoutsCRegisteredAdapters=()=>Array.from(externalAdapters,([layout,a])=>({layout,id:a.id}));
const freezeReadOnly=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freezeReadOnly);Object.freeze(value);}return value;};
function expectedRegions(plan,range){return plan.lyricAvoidanceIndex.regions.map((r,i)=>({...r,end:Math.min(r.end??plan.lyricAvoidanceIndex.regions[i+1]?.start??plan.duration,plan.duration)})).filter(r=>r.start<range[1]&&r.end>range[0]&&r.end>r.start);}
// Output-clipped blur support is deliberately incapable of safe certification.
A.assertLayoutsCShadowConflict=(tr,plan,cut)=>{
 const d=tr?.sourceProof?.outputDomain,segments=Array.isArray(tr?.units)&&tr.units.length===1?tr.units[0]?.segments:null,zero=p=>Array.isArray(p)&&p.length===2&&p.every(v=>v===0);
 if(cut.layout!=='shoji'||cut.params?.variant!=='shadow'||tr?.sourceAdapter&&tr.sourceAdapter!=='c-japanese'||tr?.measurementScope!=='clipped-output-conflict-only'||tr?.measurementSupported!==true||tr?.safety!=='insufficient-space'||d?.kind!=='native-output-clip'||d.version!==1||d.neverSafe!==true||d.W!==plan.W||d.H!==plan.H||d.preClipFilterSupport!==false||!Array.isArray(segments)||!segments.length||segments.some(s=>!s||s.status!=='insufficient-space'||s.decision!=='excluded-during-avoidance'||!zero(s.from)||!zero(s.to)||s.composition!=null))fail('SHADOW_OUTPUT_NEVER_SAFE','Native shadow output support only admits typed insufficient-space and zero offsets');
};
function validateExternalTrajectory(tr,plan,cut,revision,requiredRange){
 if(cut.layout==='shoji'&&cut.params?.variant==='shadow'||tr?.measurementScope==='clipped-output-conflict-only')A.assertLayoutsCShadowConflict(tr,plan,cut);
 const bad=message=>fail('INVALID_C_ADAPTER_RESULT',message),finitePair=a=>Array.isArray(a)&&a.length===2&&a.every(Number.isFinite);
 if(!tr||tr.kind!=='layouts-c-source-native'||tr.version!==1||tr.revision!==revision||tr.measurementSupported!==true||!Array.isArray(tr.units)||!tr.units.length||!tr.sourceProof||!['certified-bounded-adapter','certified-hold-adapter','insufficient-space'].includes(tr.safety))bad('Complete typed C source-native trajectory required');
 if(!finitePair(tr.evaluationRange)||tr.evaluationRange[0]>requiredRange[0]||tr.evaluationRange[1]<requiredRange[1])bad('C evaluation range must include source cut/render/display and composed ghost/transition reach');
 const regions=expectedRegions(plan,tr.evaluationRange),owners=new Set(),statuses=[];if(!regions.length)bad('Cannot certify an empty C region coverage');
 for(const unit of tr.units){
  if(typeof unit.owner!=='string'||!unit.owner||owners.has(unit.owner)||!Array.isArray(unit.segments)||unit.segments.length!==regions.length)bad('Unique C unit owner and complete nonempty region segments required');owners.add(unit.owner);
  for(let i=0;i<regions.length;i++){const s=unit.segments[i],r=regions[i],circle={cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)};
   if(!s||!Number.isFinite(s.start)||!Number.isFinite(s.end)||s.start>=s.end||s.start!==r.start||s.end!==r.end||s.region!==r.id||!finitePair(s.from)||!finitePair(s.to)||s.from.some((v,j)=>v!==s.to[j])||!['safe','safe-hold','insufficient-space'].includes(s.status))bad('C segment must exactly cover its source region with finite fixed offsets and typed status');
   if(!s.circle||Object.keys(circle).some(k=>!Number.isFinite(s.circle[k])||Math.abs(s.circle[k]-circle[k])>1e-8))bad('C segment circle differs from the resolved stage-pixel region');
   const decision=s.status==='safe'?'certified':s.status==='safe-hold'?'certified-hold-adapter':'excluded-during-avoidance';if(s.decision!==decision)bad('C segment decision/status mismatch');
   if(s.status==='safe-hold'){const hold=s.holdWindow||tr.holdWindow;if(!finitePair(hold)||hold[1]-hold[0]<.04||hold[0]<cut.start||hold[1]>cut.end)bad('C safe-hold requires at least .04s inside the actual source cut interval');}
   statuses.push(s.status);
  }
 }
 if(tr.safety==='certified-bounded-adapter'&&statuses.some(s=>s!=='safe')||tr.safety==='certified-hold-adapter'&&statuses.some(s=>!['safe','safe-hold'].includes(s))||tr.safety==='insufficient-space'&&!statuses.includes('insufficient-space'))bad('C root safety contradicts its actual segment outcomes');
}
A.layoutsCNativeFont=css=>{const raw=String(css),match=/(^|\s)((?:\d+(?:\.\d*)?|\.\d+))px(?=\s|\/|$)/.exec(raw);if(!match)fail('NATIVE_TEXT_FONT','Native Canvas font requires an explicit pixel size');const size=Number(match[2]);if(!Number.isFinite(size)||size<=0)fail('NATIVE_TEXT_FONT','Positive finite native Canvas pixel size required');const start=match.index+match[1].length;return {raw,size,identity:raw.slice(0,start)+'$SIZEpx'+raw.slice(start+match[2].length+2)};};
const normalized=t=>String(t||'').replace(/\s/g,'');
function cameraEnvelope(polygons,plan,cut,reserve){return A.cameraEnvelope(polygons,{...plan,fx:cut.effectFx||plan.fx,style:cut.effectStyle||plan.style},cut,reserve);}
function record(renderer,plan,cut,time){const ctx=A.measurementContext();ctx.reset();const env=renderer.makeEnv(ctx,plan,cut,cut.palette||plan.style.schemes[cut.scheme%plan.style.schemes.length],{pass:'main',t:time,realTime:time,lt:time-cut.start,ltb:time-cut.start,step:Math.floor(time*(plan.fps||24)),scale:1,allowFilter:false});const p=A.record(renderer,env);if(!p.measurementSupported)fail('UNSUPPORTED_MEASUREMENT',JSON.stringify(p.diagnostics));return p;}
function mapping(program,cut){
 const texts=program.events.filter(e=>e.role==='primary'&&e.kind==='item'&&e.args[0].placementMain).map(e=>e.args[0]),copy=texts.map(i=>normalized(i.text)).join('');
 if(copy!==normalized(cut.text))fail('SOURCE_COVERAGE','C ordered native primary source must contain every occurrence exactly once');
 return {complete:true,source:normalized(cut.text),main:texts.map((i,index)=>({index,text:i.text,font:i.font,size:i.size,mi:i.mi??0})),metadata:program.events.filter(e=>e.kind==='nativeText'||e.kind==='item'&&!e.args[0].placementMain).map(e=>({kind:e.kind,text:e.kind==='nativeText'?e.args[0]:e.args[0].text,font:e.kind==='nativeText'?A.layoutsCNativeFont(e.args[3].font).identity:e.args[0].font,size:e.kind==='nativeText'?A.layoutsCNativeFont(e.args[3].font).size:e.args[0].size})),shapes:program.events.filter(e=>!['item','nativeText'].includes(e.kind)).map(e=>({kind:e.kind,order:e.order,owner:e.owner})),rule:'Ordered native source occurrences, meaningful metadata and every owned shape retained; no substitute glyphs/plates'};
}
// Continuous interval arithmetic, not frame sampling. Every source exit point
// is R(angle+turn*z)*(dx,(1-.3*z)*dy) + pivot + z*drop, z in [0,1].
// Native entry adds only the known uniform squash scale about the same pivot.
function ownedPolygons(e,cut){
 if(cut.layout!=='clapper'||!['clapper-body','clapper-stick'].includes(e.nativeCBody?.kind)||e.kind==='item')return e.polygons;
 const clips=(e.clips||[]).map(c=>{if(!c.commands)return c;if(c.commands.length!==1||c.commands[0][0]!=='rect'||c.commands[0][1].length!==4||!c.commands[0][1].every(Number.isFinite))fail('UNSUPPORTED_C_SOURCE_CLIP','Clapper requires its single native rectangular stripe clip');return {...c,args:c.commands[0][1]};});
 return A.layoutsAClip({...e,clips});
}
function nativeEventKeys(program){const counts=new Map();return program.events.filter(e=>e.role==='primary').map(e=>{const it=e.kind==='item'?e.args[0]:null,base=it?['item',!!it.placementMain,normalized(it.text),it.font,it.placementGlyphIndex??'block'].join('|'):e.kind==='nativeText'?['nativeText',e.args[0],A.layoutsCNativeFont(e.args[3].font).identity].join('|'):e.kind,n=counts.get(base)||0;counts.set(base,n+1);return base+'#'+n;});}
// Exact extrema of A*cos(theta+beta*z)+B*sin(theta+beta*z)+d*z.
// Independent coordinate ranges contribute all four rectangle corners.
function badgeMotionEnvelope(e,plan,cut,loZ,hiZ,turn,moveX,moveY){
 const s=e.nativeCBody;if(s?.kind!=='name-badge'||s.minYScale!==1||s.maxEntryScale!==1)fail('BADGE_EXIT_MODEL_REQUIRED','Native rigid badge fall/turn source model required');
 const th=s.angle*J.DEG,beta=turn*J.DEG,c=Math.cos(th),sn=Math.sin(th),[px,py]=s.pivot,points=[];
 const range=(A,B,d)=>{const f=z=>A*Math.cos(th+beta*z)+B*Math.sin(th+beta*z)+d*z,values=[f(loZ),f(hiZ)],R=Math.hypot(A,B);if(beta&&R){const rhs=-d/(beta*R);if(Math.abs(rhs)<=1){const alpha=Math.atan2(A,B),root=Math.acos(rhs),lo=Math.min(th+alpha+beta*loZ,th+alpha+beta*hiZ),hi=Math.max(th+alpha+beta*loZ,th+alpha+beta*hiZ);for(const sign of [-1,1])for(let k=Math.ceil((lo-sign*root)/J.TAU);sign*root+k*J.TAU<=hi;k++){const z=(sign*root+k*J.TAU-alpha-th)/beta;if(z>loZ&&z<hiZ)values.push(f(z));}}}return [Math.min(...values),Math.max(...values)];};
 for(const [x,y]of e.polygons.flat()){const dx=c*(x-px)+sn*(y-py),dy=-sn*(x-px)+c*(y-py),xx=range(dx,-dy,moveX),yy=range(dy,dx,moveY);for(const a of xx)for(const b of yy)points.push([px+a,py+b]);}
 const swept=A.convexHull(points),b=e.kind==='line'?A.bounds([swept]):null;
 // The recorder observes env.line as a world-axis AABB at each frame. Its
 // observable geometry is not a covariant thin strip under the badge turn.
 const measured=b?[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]]:swept;
 return cameraEnvelope([measured],plan,cut,e.kind==='item'?20:10);
}
function badgeExitEnvelope(e,plan,cut,maxZ){const s=e.nativeCBody;return badgeMotionEnvelope(e,plan,cut,0,maxZ,s.turn,s.dx,s.dy);}
const badgeEntryMax=1+4*Math.pow(1.6,3)/(27*Math.pow(2.6,2));
function badgeEntryEnvelope(e,plan,cut,minQ){const s=e.nativeCBody;return badgeMotionEnvelope(e,plan,cut,minQ-1,badgeEntryMax-1,s.angle+25,s.entryDX||0,s.entryDY??plan.H*.35);}
function nativeBadgeEntryProof(program,plan,cut){
 if(cut.layout!=='nameTag')return null;const keys=nativeEventKeys(program),events=program.events.filter(e=>e.role==='primary'),limits=[];
 for(const e of events){const fits=q=>{const b=A.bounds([badgeEntryEnvelope(e,plan,cut,q)]);return b.x0>=0&&b.y0>=0&&b.x1<=plan.W&&b.y1<=plan.H;};let lo=0,hi=1;if(fits(0))hi=0;else {if(!fits(1))fail('BADGE_NATIVE_ENTRY_SUFFIX','Native badge overshoot has no stage-clear suffix through its source outBack maximum');for(let j=0;j<18;j++){const mid=(lo+hi)/2;if(fits(mid))hi=mid;else lo=mid;}}limits.push(hi);}
 return {kind:'per-native-owned-event-entry-clear-suffix',keys,limits,maxQ:badgeEntryMax,scope:'Preserve each native continuously stage-clear q suffix including the outBack overshoot; earlier source crop remains allowed'};
}
function badgeCandidateEntry(program,plan,cut,proof){if(!proof)return null;if(JSON.stringify(nativeEventKeys(program))!==JSON.stringify(proof.keys))fail('BADGE_ENTRY_EVENT_MAPPING','Every native badge event must retain its entry-proof identity');return program.events.filter(e=>e.role==='primary').map((e,i)=>badgeEntryEnvelope(e,plan,cut,proof.limits[i]));}
function nativeBadgeExitProof(program,plan,cut){
 if(cut.layout!=='nameTag')return null;const keys=nativeEventKeys(program),events=program.events.filter(e=>e.role==='primary'),limits=[];
 for(const e of events){const fits=z=>{const b=A.bounds([badgeExitEnvelope(e,plan,cut,z)]);return b.x0>=0&&b.y0>=0&&b.x1<=plan.W&&b.y1<=plan.H;};let lo=0,hi=1;if(fits(1))lo=1;else if(fits(0))for(let j=0;j<18;j++){const mid=(lo+hi)/2;if(fits(mid))lo=mid;else hi=mid;}limits.push(lo);}
 return {kind:'per-native-owned-event-exit-clear-prefix',keys,limits,scope:'For every matched event, preserve at least the continuously stage-clear native fall prefix; later native crop is permitted, no blanket exit-stage prohibition'};
}
function badgeCandidateExit(program,plan,cut,proof){if(!proof)return null;const keys=nativeEventKeys(program);if(JSON.stringify(keys)!==JSON.stringify(proof.keys))fail('BADGE_EXIT_EVENT_MAPPING','Every native badge event must retain its exit-proof identity');return program.events.filter(e=>e.role==='primary').map((e,i)=>badgeExitEnvelope(e,plan,cut,proof.limits[i]));}
// An anchor candidate retains its fixed region offset. Only the native
// source entry/fall displacement changes, keeping both original screen centre
// endpoints; no generic time-dependent translation is applied during replay.
function badgeAnchorMotion(program,plan,cut,entryProof,exitProof,offset){
 const events=program.events.map(e=>{if(e.role!=='primary')return e;const s=e.nativeCBody;return {...e,nativeCBody:{...s,entryDX:offset[0],entryDY:plan.H*.35+offset[1],dx:cut.outDur>0?s.dx-offset[0]:0,dy:cut.outDur>0?s.dy-offset[1]:0}};}),anchored={...program,events};
 const entry=badgeCandidateEntry(anchored,plan,cut,entryProof),exit=badgeCandidateExit(anchored,plan,cut,exitProof),b=A.bounds([...entry,...exit]);
 return {entry,exit,fit:b.x0+offset[0]>=0&&b.y0+offset[1]>=0&&b.x1+offset[0]<=plan.W&&b.y1+offset[1]<=plan.H};
}
function solveSource(trial,recipe,plan,cut,circle,entryProof,exitProof){
 if(!recipe?.anchorConnect)return A.solveBasic(trial.envelopes,circle,plan.W,plan.H,cut.seed,trial.stageEnvelopes?{fitBounds:sourceFitBounds(trial.stageEnvelopes,trial.entryEnvelopes,trial.exitEnvelopes,trial.badgeEntryEnvelopes)}:{});
 // Native vertical fall must remain downwards. The q overshoot and all
 // owner ink are still included in the event-specific source suffix/prefix.
 let selected=null;const solution=A.solveBasic(trial.envelopes,circle,plan.W,plan.H,cut.seed,{fitBounds:A.bounds(trial.stageEnvelopes),accept:offset=>{if(recipe.nonshorteningEntry&&(offset[1]<0||Math.hypot(plan.W*.1-offset[0],plan.H*.5-offset[1])<(recipe.objectScale??1)*Math.hypot(plan.W*.1,plan.H*.5)))return false;if(plan.H*.35+offset[1]<0||cut.outDur>0&&(plan.H*.5-offset[1]<0||plan.W*.1-offset[0]<0))return false;const proof=badgeAnchorMotion(trial.program,plan,cut,entryProof,exitProof,offset);if(proof.fit)selected=proof;return proof.fit;}});
 if(solution.status==='safe'){if(!selected)fail('BADGE_ANCHOR_PROOF_REQUIRED','Offset-dependent badge anchor connection requires its exact source envelopes');trial.badgeEntryEnvelopes=selected.entry;trial.exitEnvelopes=selected.exit;}
 return solution;
}
function sourceStageEnvelopes(program,plan,cut){
 if(!['stickyNotes','nameTag','clapper'].includes(cut.layout))return null;
 if(cut.layout==='nameTag')return program.events.filter(e=>e.role==='primary').map(e=>cameraEnvelope(e.polygons,plan,cut,e.kind==='item'?20:10));
 const trig=(a,b,cos)=>{const f=cos?Math.cos:Math.sin,v=[f(a),f(b)],base=cos?0:Math.PI/2;for(let k=Math.ceil((a-base)/Math.PI);base+k*Math.PI<b;k++)v.push(f(base+k*Math.PI));return [Math.min(...v),Math.max(...v)];},mul=(a,b)=>{const v=[a[0]*b[0],a[0]*b[1],a[1]*b[0],a[1]*b[1]];return [Math.min(...v),Math.max(...v)];},out=[];
 for(const e of program.events.filter(e=>e.role==='primary')){
  const s=e.nativeCBody;if(!s||!['sticky-note','name-badge','clapper-body','clapper-stick'].includes(s.kind))fail('SOURCE_STAGE_SWEEP_MISSING','Each sticky owned event requires its native note pivot/peel model');const theta=s.angle*J.DEG,c=Math.cos(theta),sn=Math.sin(theta),[px,py]=s.pivot,points=[];
  for(const [x,y]of ownedPolygons(e,cut).flat()){
   const dx=c*(x-px)+sn*(y-py),dy=-sn*(x-px)+c*(y-py);
   for(const scale of [1,s.maxEntryScale])points.push([px+(c*dx-sn*dy)*scale,py+(sn*dx+c*dy)*scale]);
   for(let j=0;j<32;j++){const z0=j/32,z1=(j+1)/32,angles=[theta+s.turn*J.DEG*z0,theta+s.turn*J.DEG*z1].sort((a,b)=>a-b),cs=trig(...angles,true),ss=trig(...angles,false),ys=mul([dy,dy],[1-(1-s.minYScale)*z1,1-(1-s.minYScale)*z0]),cx=mul(cs,[dx,dx]),sy=mul(ss,ys),sx=mul(ss,[dx,dx]),cy=mul(cs,ys),xx=[px+cx[0]-sy[1]+Math.min(s.dx*z0,s.dx*z1),px+cx[1]-sy[0]+Math.max(s.dx*z0,s.dx*z1)],yy=[py+sx[0]+cy[0]+Math.min(s.dy*z0,s.dy*z1),py+sx[1]+cy[1]+Math.max(s.dy*z0,s.dy*z1)];points.push([xx[0],yy[0]],[xx[0],yy[1]],[xx[1],yy[0]],[xx[1],yy[1]]);}
  }
  out.push(cameraEnvelope([A.convexHull(points)],plan,cut,e.kind==='item'?20:10));
 }return out;
}
// Clapper entry may retain its native bottom entry crop. Its upper-stick
// hinge arc, body drop and shake must still keep every owned pixel above the
// stage top and inside both horizontal edges. Circle entry relaxation is separate.
function sourceEntryEnvelopes(program,plan,cut){
 if(cut.layout!=='clapper')return null;
 const range=(a,b,lo,hi)=>{const f=t=>a*Math.cos(t)+b*Math.sin(t),v=[f(lo),f(hi)],root=Math.atan2(b,a);for(let k=Math.ceil((lo-root)/Math.PI);root+k*Math.PI<hi;k++)v.push(f(root+k*Math.PI));return [Math.min(...v),Math.max(...v)];};
 return program.events.filter(e=>e.role==='primary').map(e=>{
  const s=e.nativeCBody;if(!s||!['clapper-body','clapper-stick'].includes(s.kind))fail('SOURCE_ENTRY_SWEEP_MISSING','Clapper body or native upper-stick hinge required');
  const th=s.angle*J.DEG,c=Math.cos(th),sn=Math.sin(th),[px,py]=s.pivot,[hx,hy]=s.hinge||[0,0],base=[px+c*hx-sn*hy,py+sn*hx+c*hy],points=[];
  for(const [x,y]of ownedPolygons(e,cut).flat()){
   const dx=c*(x-px)+sn*(y-py)-hx,dy=-sn*(x-px)+c*(y-py)-hy,lo=th-(s.kind==='clapper-stick'?28*J.DEG:0),hi=th,xr=range(dx,-dy,lo,hi),yr=range(dy,dx,lo,hi);
   for(const xx of xr)for(const yy of yr)for(const sx of [-s.entryShake,s.entryShake])for(const sy of [-s.entryShake*.6,s.entryDrop+s.entryShake*.6])points.push([base[0]+xx+sx,base[1]+yy+sy]);
  }
  return cameraEnvelope([A.convexHull(points)],plan,cut,e.kind==='item'?20:10);
 });
}
function sourceFitBounds(stage,entry,exit,badgeEntry){if(!stage)return null;const b=A.bounds(stage);if(entry){const a=A.bounds(entry);b.x0=Math.min(b.x0,a.x0);b.x1=Math.max(b.x1,a.x1);b.y0=Math.min(b.y0,a.y0);}if(badgeEntry){const a=A.bounds(badgeEntry);b.x0=Math.min(b.x0,a.x0);b.y0=Math.min(b.y0,a.y0);b.x1=Math.max(b.x1,a.x1);b.y1=Math.max(b.y1,a.y1);}if(exit){const a=A.bounds(exit);b.x0=Math.min(b.x0,a.x0);b.y0=Math.min(b.y0,a.y0);b.x1=Math.max(b.x1,a.x1);b.y1=Math.max(b.y1,a.y1);}return b;}
function ownedQuality(program){
 let checked=0;for(const e of program.events.filter(e=>e.kind==='item'&&(e.args[0].placementMain||e.args[0].placementCOwnedZone))){const z=e.args[0].placementCOwnedZone;if(!z)fail('OWNED_ZONE_REQUIRED','C primary requires an explicit source-owned writing field');const local=[[z.x0,z.y0],[z.x1,z.y0],[z.x1,z.y1],[z.x0,z.y1]],zone=local.map(p=>A.point(e.matrix,p));if(!(z.x0<z.x1&&z.y0<z.y1)||!e.inkPolygons?.length||e.inkPolygons.some(poly=>poly.some(p=>!contains(p,zone))))fail('OWNED_TEXT_OUTSIDE_FIELD','C complete pre-clip primary ink escaped its source paper writing field '+JSON.stringify({text:e.args[0].text,size:e.args[0].size,zone:z}));checked++;}return {completePreClipWritingFields:checked};
}
function sourceCandidate(renderer,plan,cut,native,recipe,time,explicitSize,exitProof,entryProof){
 const trial={...cut,layoutCRecipe:recipe},program=record(renderer,plan,trial,time),source=mapping(program,trial),expected=mapping(native,cut),semanticMetadata=m=>m.map(({size,...rest})=>rest);
 if(source.main.length!==expected.main.length||JSON.stringify(semanticMetadata(source.metadata))!==JSON.stringify(semanticMetadata(expected.metadata))||JSON.stringify(source.shapes)!==JSON.stringify(expected.shapes))fail('NATIVE_SEMANTIC_MAPPING','C recipe must preserve every ordered native owned shape/metadata/copy');
 const ownership=ownedQuality(program);
 const short=Math.min(plan.W,plan.H),floor=Math.max(18,.035*short),secondaryFloor=Math.max(12,.02*short),scale=cut.contentScale??1,ratios=[];
 for(let i=0;i<source.main.length;i++){const n=expected.main[i],a=source.main[i],ratio=a.size/n.size,actualSize=a.size*scale;ratios.push(ratio);if(normalized(a.text)!==normalized(n.text)||a.font!==n.font||a.mi!==n.mi||ratio<.7-1e-8||actualSize<floor||explicitSize&&Math.abs(ratio-1)>1e-8)fail('NATIVE_SIZE_MAPPING','C source text/font/clock or actual font floor/explicit size changed '+JSON.stringify({native:n,actual:a,ratio,actualSize,floor,explicitSize}));}
 for(let i=0;i<source.metadata.length;i++){const n=expected.metadata[i],a=source.metadata[i];if(a.size<n.size*.7-1e-8||a.size*scale<Math.min(n.size*scale,secondaryFloor)-1e-8)fail('METADATA_SIZE_FLOOR','Every real native metadata copy must preserve its font ratio and readable floor');}
 return {program,source,badgeEntryEnvelopes:badgeCandidateEntry(program,plan,trial,entryProof),stageEnvelopes:sourceStageEnvelopes(program,plan,trial),entryEnvelopes:sourceEntryEnvelopes(program,plan,trial),exitEnvelopes:badgeCandidateExit(program,plan,trial,exitProof),quality:{...ownership,nativeFontSizePreserved:source.main.every((a,i)=>Math.abs(a.size-expected.main[i].size)<1e-8),minNativeFontRatio:Math.min(...ratios),minPrimaryPx:Math.min(...source.main.map(i=>i.size*scale)),floor,minSecondaryPx:source.metadata.length?Math.min(...source.metadata.map(i=>i.size*scale)):null,secondaryFloor},envelopes:program.events.filter(e=>e.role==='primary').map(e=>cameraEnvelope(ownedPolygons(e,trial),plan,trial,e.kind==='item'||e.kind==='nativeText'?20:10))};
}
function sourceStrategy(cut,explicitSize,plan){
 const p=cut.params;
 if(cut.layout==='stickyNotes'){
  if(!Array.isArray(p.chunks)||p.chunks.length<1||p.chunks.length>4||p.chunks.some(t=>typeof t!=='string')||!['cascade','scatter'].includes(p.layout)||!['glue','tape'].includes(p.pin)||!Array.isArray(p.rots)||p.rots.length!==4||p.rots.some(r=>Math.abs(r)>7)||!Array.isArray(p.offs)||p.offs.length!==4||p.offs.some(o=>Math.abs(o)>1)||!Array.isArray(p.cols)||p.cols.length!==4||p.cols.some(c=>!Number.isInteger(c)||c<0||c>3))fail('UNSUPPORTED_PARAMETER_RANGE','Sticky note native slot/angle/colour domain required');
  if(p.chunks.some(t=>t&&normalized(t)===''))fail('EMPTY_SOURCE_NOTE_UNSUPPORTED','Whitespace-only native note has no primary writing ink; its blank owned-paper role requires an explicit source model');
  if(normalized(p.chunks.join(''))!==normalized(cut.text))fail('SOURCE_COVERAGE','Sticky native chunks differ from actual lyric');
  return {entry:.03+(p.chunks.length-1)*.13+.22,native:'native-note-cluster-translation',candidates:[...[1.2,1.5,2].map(pitch=>({noteScale:1,pitch,strategy:'native-note-slot-pitch'})),...(explicitSize?[]:[.95,.9,.85,.8,.75,.7].flatMap(noteScale=>[1,1.2,1.5,2].map(pitch=>({noteScale,pitch,strategy:'source-note-size-and-slot-pitch'}))))],proof:{kind:'sticky-notes-static-hold-source-proof',entry:'Each native note entry uniformly squashes paper/fold/shadow/pin/glyphs; last start .03+(k-1)*.13, finish +.22',exit:'Source peel moves every owned note unit from cut.end-outDur',hold:'sq=1, peel=0, source slots/angles/font sizes fixed'}};
 }
 if(cut.layout==='nameTag'){
  if(!['hello','school'].includes(p.variant)||!Number.isFinite(p.tilt)||Math.abs(p.tilt)>6||!Number.isInteger(p.grade)||p.grade<1||p.grade>6||!Number.isInteger(p.cls)||p.cls<1||p.cls>4)fail('UNSUPPORTED_PARAMETER_RANGE','Name badge native variant/tilt/grade/class required');
  const scales=explicitSize?[]:[.95,.9,.85,.8,.75,.7],proportional=[...scales,...(explicitSize?[]:[.72,.71])].sort((a,b)=>b-a).map(objectScale=>({badgeMeasure:1,objectScale,exitAxis:'native',strategy:'native-proportional-badge-size'})),papers=[.65,.6,.55].map(objectScale=>({badgeMeasure:1,objectScale,preserveNativeType:true,nativeTypeRatio:explicitSize?1:.7,exitAxis:'native',strategy:'source-physical-badge-with-compensated-native-type'})),anchorPapers=papers.map(r=>({...r,anchorConnect:true,nonshorteningEntry:true,strategy:'source-physical-badge-compensated-type-and-screen-anchors'})),fields=[1,...scales].flatMap(objectScale=>[.95,.9,.85].map(badgeMeasure=>({badgeMeasure,objectScale,writingMeasure:true,exitAxis:'native',strategy:'modest-native-badge-writing-measure'}))),headerFields=!explicitSize?[.8,.75,.7].flatMap(objectScale=>[.9,.85,.8].map(badgeMeasure=>({badgeMeasure,objectScale,writingMeasure:true,...(p.variant==='hello'?{headerMeasure:.8}:{classMeasure:.5}),exitAxis:'native',strategy:'source-badge-header-and-two-line-writing-field'}))):[];
  return {entry:.5,stageStart:.5,stageEnd:'hold',native:'native-badge-translation',candidates:[...proportional,...papers,...anchorPapers,...fields,...headerFields],proof:{kind:'name-badge-static-hold-source-proof',entry:'Native outBack q including overshoot through .5; per-event native stage-clear suffix enforced. Anchor candidate reconnects the original screen centre endpoints with q*holdOffset',exit:'Native down-right eo fall and 18degree turn prioritized; discrete native-aspect sizes then explicit screen-anchor connection precede modest field measure; every event preserves its native stage-clear prefix; transverse exit excluded because its narrow badge/fade changed the source intent',hold:'Complete badge/clip/header/fields remain inside stage and circle-safe throughout hold; native crop-prefix/suffix bounded numerically, visual intent remains unaccepted'}};
 }
 if(cut.layout==='clapper'){
  if(!Number.isFinite(p.tilt)||Math.abs(p.tilt)>6||!/^A[1-9]$/.test(p.roll)||!Number.isInteger(p.take)||p.take<1||p.take>12)fail('UNSUPPORTED_PARAMETER_RANGE','Clapper native tilt/roll/take domain required');
  const measures=[.95,.9,.85,.8,.75],scales=explicitSize?[]:[.95,.9,.85,.8,.75,.7];
  return {entry:.57,stageStart:.57,native:'native-clapper-translation',candidates:[...measures.map(slateMeasure=>({boardScale:1,slateMeasure,strategy:'source-slate-writing-measure'})),...scales.flatMap(boardScale=>[1,...measures].map(slateMeasure=>({boardScale,slateMeasure,strategy:'source-clapper-size-and-writing-measure'}))),...[.8,.75,.7].filter(()=>!explicitSize).flatMap(boardScale=>[.9,.85,.8,.75].map(slateMeasure=>({boardScale,slateMeasure,metadataLayout:'stacked',strategy:'source-slate-labeled-cell-stack'}))),...[.65,.6,.55].filter(()=>!explicitSize).flatMap(boardScale=>[1,.95].map(slateMeasure=>({boardScale,slateMeasure,metadataLayout:'stacked',writingMeasure:true,strategy:'source-slate-size-with-preserved-native-font-floor'})))],proof:{kind:'clapper-native-static-hold-source-proof',entry:'Native .4 body drop, .42 upper-stick snap and (.42,.57) body shake retained; each actual moving unit has its own phase',exit:'Fixed native tilt and eo*.2H vertical drop retained with continuous full-owned stage sweep',hold:'After .57 every slate/stick/hinge/grid/label/value/lyric position is fixed; source metadata font retained'}};
 }
 fail('C_RECIPE_PENDING','C '+cut.layout+' owned-unit interval/recipe verification is pending');
}
const contains=(p,poly)=>{const cached=edgeContains(p,poly,1e-5);if(cached!==null)return cached;let pos=false,neg=false;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],cross=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(cross>1e-5)pos=true;if(cross< -1e-5)neg=true;}return !(pos&&neg);};
A.finalizeLayoutsC=(plan,cut,original,diagnostics,{revision,stepDur,reachTail,explicitSize=false})=>{
 try{
  const requiredRange=[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail];
  if(!expectedRegions(plan,requiredRange).length){plan.cuts[plan.cuts.indexOf(cut)]=original;diagnostics.push({cut:cut.index,code:'PRESERVED_NO_ACTIVE_REGION',safety:'not-evaluated'});return;}
  const external=externalAdapters.get(cut.layout);
  if(external){
   const trajectory=external.finalize(Object.freeze({plan,cut,original:freezeReadOnly(JSON.parse(JSON.stringify(original))),revision,stepDur,reachTail,explicitSize}));
   validateExternalTrajectory(trajectory,plan,cut,revision,requiredRange);
   cut.placementTrajectory={...trajectory,sourceAdapter:external.id};diagnostics.push({cut:cut.index,code:'STAGED_C_ADAPTER',adapter:external.id,safety:trajectory.safety});return;
  }
  if(cut.treat!=='none')fail('UNSUPPORTED_ADAPTER','C treatment requires a dedicated owned geometry proof');
  const finite=v=>typeof v==='number'?Number.isFinite(v):!v||typeof v!=='object'||Object.values(v).every(finite);if(!finite(cut.params))fail('UNSUPPORTED_PARAMETER_RANGE','Finite C source parameters required');
  const strategy=sourceStrategy(cut,explicitSize,plan),holdWindow=[cut.start+strategy.entry,cut.end-cut.outDur],candidateCache=new Map();let reconstructed=0,candidateHits=0;
  if(holdWindow[1]-holdWindow[0]<.04)fail('INSUFFICIENT_HOLD_WINDOW','C source needs at least .04s after its final native geometry entry and before native exit');
  cut.placementUnits=true;cut.placementLayoutsC=true;
  const renderer=Object.create(J.Renderer.prototype),program=record(renderer,plan,cut,holdWindow[0]+.0001),sourceMapping=mapping(program,cut),nativeOwnership=ownedQuality(program),badgeEntryProof=nativeBadgeEntryProof(program,plan,cut),badgeEntryEnvelopes=badgeCandidateEntry(program,plan,cut,badgeEntryProof),exitProof=nativeBadgeExitProof(program,plan,cut),exitEnvelopes=badgeCandidateExit(program,plan,cut,exitProof),stageEnvelopes=sourceStageEnvelopes(program,plan,cut),entryEnvelopes=sourceEntryEnvelopes(program,plan,cut),envelopes=program.events.filter(e=>e.role==='primary').map(e=>cameraEnvelope(ownedPolygons(e,cut),plan,cut,e.kind==='item'||e.kind==='nativeText'?20:10)),evaluationRange=[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail],segments=[];
  for(let i=0;i<plan.lyricAvoidanceIndex.regions.length;i++){const r=plan.lyricAvoidanceIndex.regions[i],end=Math.min(r.end??plan.lyricAvoidanceIndex.regions[i+1]?.start??plan.duration,plan.duration);if(r.start>=evaluationRange[1])break;if(end<=evaluationRange[0]||end<=r.start)continue;const circle={cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)};let selectedEnvelopes=envelopes,selectedStageEnvelopes=stageEnvelopes,selectedEntryEnvelopes=entryEnvelopes,selectedExitEnvelopes=exitEnvelopes,selectedBadgeEntryEnvelopes=badgeEntryEnvelopes,composition=null,quality=null,solution=A.solveBasic(envelopes,circle,plan.W,plan.H,cut.seed,stageEnvelopes?{fitBounds:sourceFitBounds(stageEnvelopes,entryEnvelopes,exitEnvelopes,badgeEntryEnvelopes)}:{});const attempts=[{strategy:strategy.native,status:solution.status,reason:solution.reason||null}];
   if(solution.status!=='safe'){
    const candidates=strategy.candidates;
    for(const recipe of candidates){try{const key=JSON.stringify(recipe);let trial=candidateCache.get(key);if(trial){candidateHits++;if(trial.error)fail(trial.error.code,trial.error.message);}else{if(reconstructed>=128)fail('CUT_CANDIDATE_BUDGET','C per-cut reconstruction budget exhausted');reconstructed++;try{trial=sourceCandidate(renderer,plan,cut,program,recipe,holdWindow[0]+.0001,explicitSize,exitProof,badgeEntryProof);candidateCache.set(key,trial);}catch(e){candidateCache.set(key,{error:{code:e.code||'DRAW_PROGRAM_ERROR',message:e.message}});throw e;}}const solved=solveSource(trial,recipe,plan,cut,circle,badgeEntryProof,exitProof);attempts.push({...recipe,status:solved.status,reason:solved.reason||null,holdBounds:A.bounds(trial.envelopes),stageBounds:trial.stageEnvelopes?A.bounds(trial.stageEnvelopes):null,quality:trial.quality});if(solved.status==='safe'){solution=solved;composition=recipe.anchorConnect?{...recipe,anchorOffset:solved.offset.slice()}:recipe;quality=trial.quality;selectedEnvelopes=trial.envelopes;selectedStageEnvelopes=trial.stageEnvelopes;selectedEntryEnvelopes=trial.entryEnvelopes;selectedExitEnvelopes=trial.exitEnvelopes;selectedBadgeEntryEnvelopes=trial.badgeEntryEnvelopes;break;}}catch(e){attempts.push({...recipe,status:'rejected',reason:e.code||'DRAW_PROGRAM_ERROR',details:e.message});}}
   }
   const safe=solution.status==='safe';segments.push({start:r.start,end,region:r.id,circle,from:solution.offset,to:solution.offset,status:safe?'safe-hold':'insufficient-space',decision:safe?'certified-hold-adapter':'excluded-during-avoidance',failure:safe?null:cut.layout+'-has-no-certified-composition',safetyScope:'source-owned-object-entry-exit-relaxed',holdWindow,attempts,composition,quality,envelopes:selectedEnvelopes,stageEnvelopes:selectedStageEnvelopes,entryEnvelopes:selectedEntryEnvelopes,exitEnvelopes:selectedExitEnvelopes,exitProof,badgeEntryProof,badgeEntryEnvelopes:selectedBadgeEntryEnvelopes,proof:{...strategy.proof,explicitSizePreserved:explicitSize}});}
  cut.placementTrajectory={version:1,kind:'layouts-c-source-native',revision,evaluationRange,holdWindow,stageWindow:[cut.start+(strategy.stageStart??0),strategy.stageEnd==='hold'?holdWindow[1]:evaluationRange[1]],units:[{owner:cut.layout+'.composition',envelopes,segments}],sourceProof:{sourceMapping,nativeOwnership,exitProof,badgeEntryProof,stageProof:stageEnvelopes?(cut.layout==='nameTag'?'Badge hold stage fit plus per-native-owned-event analytic stage-clear entry suffix/exit prefix; selected screen-anchor connection changes intermediate travel while preserving native screen centre endpoints, q/z clocks and angles; visual intent pending':'Continuous source-body affine intervals + camera envelope; named stageWindow is distinct from circle hold safety'):'pending source entry/exit stage scope',recipe:strategy.native,sourceIdentity:'unchanged registered C source + renderer/makeEnv prototypes',nativeFontSizePreserved:segments.every(s=>!s.composition||s.quality.nativeFontSizePreserved),ownedShapesPreserved:true,candidateBudget:{reconstructed,cacheHits:candidateHits,perCutLimit:128}},measurementSupported:true,safety:segments.every(s=>s.status==='safe-hold')?'certified-hold-adapter':'insufficient-space',explicitSizePreserved:explicitSize};
  diagnostics.push({cut:cut.index,code:'STAGED_C_ADAPTER',safety:cut.placementTrajectory.safety});
 }catch(e){plan.cuts[plan.cuts.indexOf(cut)]=original;diagnostics.push({cut:cut.index,code:e.code||'DRAW_PROGRAM_ERROR',details:e.message,safety:'unsupported'});}
};
A.renderLayoutsC=(renderer,env)=>{
 A.validateFinal(env.plan);const scale=env.scale||1;if(scale<.1||scale>4)fail('UNSUPPORTED_RENDER_SCALE','C certified render scale is .1..4');
 const external=externalAdapters.get(env.cut.layout);if(external){if(env.cut.layout==='shoji'&&env.cut.params?.variant==='shadow'||env.cut.placementTrajectory.measurementScope==='clipped-output-conflict-only')A.assertLayoutsCShadowConflict(env.cut.placementTrajectory,env.plan,env.cut);if(env.cut.placementTrajectory.sourceAdapter!==external.id||!A.layoutsCSourceKnown?.(env.cut.layout)||!A.layoutsCTransportKnown?.(renderer))fail('STALE_C_ADAPTER','Registered C source/renderer/adapter identity changed');return external.render(Object.freeze({renderer,env,trajectory:env.cut.placementTrajectory}));}
 const tr=env.cut.placementTrajectory,unit=tr.units[0],active=unit.segments.find(s=>s.start<=env.realTime&&env.realTime<s.end),offset=A.offsetAt(unit,env.realTime);if(active?.composition){const cut={...env.cut,layoutCRecipe:active.composition};env=renderer.makeEnv(env.ctx,env.plan,cut,env.sc,{...env,cut});}const program=A.record(renderer,env);if(!program.measurementSupported)fail('UNSUPPORTED_DRAW_PROGRAM',JSON.stringify(program.diagnostics));
 const inHold=env.t>=tr.holdWindow[0]&&env.t<=tr.holdWindow[1],groups=program.events.filter(e=>e.role==='primary').map(e=>({event:e,strict:e.nativeCBody?.entryEnd!=null?env.t>=e.nativeCBody.entryEnd&&env.t<=e.nativeCBody.exitStart&&!(e.nativeCBody.motionWindows||[]).some(w=>env.t>w[0]&&env.t<w[1]):inHold,polygons:ownedPolygons(e,env.cut).map(p=>p.map(q=>[q[0]/scale,q[1]/scale]))})),polygons=groups.flatMap(g=>g.polygons),covered=groups.filter(g=>g.strict).every(g=>g.polygons.every(p=>(active?.envelopes||unit.envelopes).some(q=>p.every(v=>contains(v,q)))));if(!covered)fail('ENVELOPE_VIOLATION','C '+env.cut.layout+' stationary owned unit escaped its source hold proof');
 const exitProof=active?.exitProof,exitKeys=exitProof?nativeEventKeys(program):[],exitZ=J.E.inCubic(env.pOut),exitProtected=exitProof&&env.t>=tr.holdWindow[0]?groups.map((g,i)=>({g,index:exitProof.keys.indexOf(exitKeys[i])})).filter(({index})=>index>=0&&exitZ<=exitProof.limits[index]+1e-12):[],exitEnvelopeCovered=exitProtected.every(({g,index})=>g.polygons.every(p=>p.every(v=>contains(v,active.exitEnvelopes[index])))),exitStageContained=exitProtected.every(({g})=>g.polygons.every(p=>p.every(v=>v[0]+offset[0]>=0&&v[0]+offset[0]<=env.plan.W&&v[1]+offset[1]>=0&&v[1]+offset[1]<=env.plan.H)));
 if(exitProof&&groups.some((g,i)=>!exitProof.keys.includes(exitKeys[i])))fail('BADGE_EXIT_EVENT_MAPPING','Rendered badge owned event has no source crop-prefix proof');if(exitProof&&!exitEnvelopeCovered)fail('BADGE_EXIT_ENVELOPE_VIOLATION','Native-prefix badge event escaped its analytic fall/turn bound '+JSON.stringify({time:env.t,z:exitZ,scale,events:exitProtected.filter(({g,index})=>!g.polygons.every(p=>p.every(v=>contains(v,active.exitEnvelopes[index])))).map(({g,index})=>({key:exitProof.keys[index],limit:exitProof.limits[index],actual:A.bounds(g.polygons),expected:A.bounds([active.exitEnvelopes[index]])}))}));if(exitProof&&active.status==='safe-hold'&&!exitStageContained)fail('BADGE_EARLY_EXIT_CROP','Badge event cropped earlier than its certified native source prefix');
 const badgeEntry=active?.badgeEntryProof,entryQ=J.E.outBack(J.clamp(env.lt/.5),1.6),badgeEntryKeys=badgeEntry?nativeEventKeys(program):[],badgeEntryProtected=badgeEntry&&env.t<tr.holdWindow[0]?groups.map((g,i)=>({g,index:badgeEntry.keys.indexOf(badgeEntryKeys[i])})).filter(({index})=>index>=0&&entryQ>=badgeEntry.limits[index]-1e-12):[],badgeEntryEnvelopeCovered=badgeEntryProtected.every(({g,index})=>g.polygons.every(p=>p.every(v=>contains(v,active.badgeEntryEnvelopes[index])))),badgeEntryStageContained=badgeEntryProtected.every(({g})=>g.polygons.every(p=>p.every(v=>v[0]+offset[0]>=0&&v[0]+offset[0]<=env.plan.W&&v[1]+offset[1]>=0&&v[1]+offset[1]<=env.plan.H)));
 if(badgeEntry&&groups.some((g,i)=>!badgeEntry.keys.includes(badgeEntryKeys[i])))fail('BADGE_ENTRY_EVENT_MAPPING','Rendered badge owned event has no native entry-suffix identity');if(!badgeEntryEnvelopeCovered)fail('BADGE_ENTRY_ENVELOPE_VIOLATION','Badge event escaped its analytic native outBack entry suffix');if(badgeEntry&&active.status==='safe-hold'&&!badgeEntryStageContained)fail('BADGE_LATE_ENTRY_CROP','Badge event remains cropped after its native source stage-clear suffix began');
 const entry=active?.entryEnvelopes,entryActive=!!entry&&env.t<tr.stageWindow[0],entryEnvelopeCovered=!entryActive||polygons.every(p=>entry.some(q=>p.every(v=>contains(v,q)))),entryStageContained=!entryActive||polygons.every(p=>p.every(v=>v[0]+offset[0]>=0&&v[0]+offset[0]<=env.plan.W&&v[1]+offset[1]>=0));
 if(entryActive&&!entryEnvelopeCovered)fail('ENTRY_ENVELOPE_VIOLATION','Clapper native hinge/drop/shake escaped its entry proof');if(entryActive&&active.status==='safe-hold'&&!entryStageContained)fail('ENTRY_STAGE_VIOLATION','Clapper entry introduced top or horizontal crop');
 const stage=active?.stageEnvelopes,stageActive=!!stage&&(!tr.stageWindow||env.t>=tr.stageWindow[0]&&env.t<=tr.stageWindow[1]),stageEnvelopeCovered=!stageActive||polygons.every(p=>stage.some(q=>p.every(v=>contains(v,q))));if(stageActive&&!stageEnvelopeCovered)fail('STAGE_ENVELOPE_VIOLATION','C source entry/exit escaped its continuous stage envelope');
 const moved=polygons.map(p=>p.map(v=>[v[0]+offset[0],v[1]+offset[1]])),stageContained=moved.every(p=>p.every(v=>v[0]>=0&&v[0]<=env.plan.W&&v[1]>=0&&v[1]<=env.plan.H));if(stageActive&&active.status==='safe-hold'&&!stageContained)fail('STAGE_CONTAINMENT_VIOLATION','C certified source entry/exit introduced stage crop');const region=J.resolveAvoidanceAt(env.plan,env.realTime),circle=region?J.avoidanceCirclePixels(region,env.plan.W,env.plan.H):null,clear=!moved.length||A.clear(moved,circle,Math.max(2,.005*Math.min(env.plan.W,env.plan.H))),strictPolygons=groups.filter(g=>g.strict).flatMap(g=>g.polygons.map(p=>p.map(v=>[v[0]+offset[0],v[1]+offset[1]]))),strictClear=!strictPolygons.length||A.clear(strictPolygons,circle,Math.max(2,.005*Math.min(env.plan.W,env.plan.H))),relaxed=!!active&&groups.some(g=>!g.strict);
 if(active?.status==='safe-hold'&&!strictClear)fail('HOLD_CIRCLE_VIOLATION','C stationary owned unit intersects the active avoidance circle');
 env.placementObservation?.({cut:env.cut.index,realTime:env.realTime,motionTime:env.t,pass:env.pass,offset,measurementSupported:true,envelopeCovered:covered,stageEnvelopeCovered,stageContained,entryEnvelopeCovered,entryStageContained,exitEnvelopeCovered,exitStageContained,badgeEntryEnvelopeCovered,badgeEntryStageContained,stationaryEvents:groups.filter(g=>g.strict).length,movingEvents:groups.filter(g=>!g.strict).length,strictCircleClear:strictClear,safety:active?.status==='insufficient-space'?'conflict':clear?'safe':relaxed&&strictClear?'source-entry-exit-relaxed':'conflict',safetyScope:active?.safetyScope||'no-active-region',polygons:moved,events:program.events.map(e=>({kind:e.kind,role:e.role,owner:e.owner,order:e.order,polygons:e.polygons}))});A.replay(env,program,offset);
};
})();
