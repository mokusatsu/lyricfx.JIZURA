/* AVOID-008: native paper/object adapters. Stage dimensions and source clocks
   remain native. Interval bounds below describe source transforms, not frames. */
(() => {
'use strict';
const A=J.placement,ids=['ema','ransom','vinyl','cassette','bookSpine','polaroid','stampSheet','postcard','letterPaper','calendar'];
const fail=(code,message)=>{const e=new Error(message);e.code=code;throw e;};
const tag=(env,role,key,body)=>{env.drawOwnership={role,owner:env.cut.layout+'.'+key};env.placementCBody=body?{...body,key:env.cut.layout+'.'+key}:null;};
A.layoutsCObjectsTag=tag;
const physicalScale=(e,cut)=>['fixed','stamp-replica','book-pile','book-shelf','calendar-month'].includes(e.nativeCBody?.kind)?1:cut.layoutCRecipe?.objectScale??1;
const norm=t=>String(t??'').replace(/\s/g,''),rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const corners=b=>rect(b.x0,b.y0,b.x1,b.y1),finite=v=>typeof v==='number'?Number.isFinite(v):!v||typeof v!=='object'||Object.values(v).every(finite);
const matrix=([x,y,a,sx,sy])=>{const c=Math.cos(a*J.DEG),s=Math.sin(a*J.DEG);return [c*sx,s*sx,-s*sy,c*sy,x,y];};
const polygonContains=(p,poly)=>{let pos=false,neg=false;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],v=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(v>1e-5)pos=true;if(v< -1e-5)neg=true;}return !(pos&&neg);};
const contains=(p,b,eps=1e-5)=>p[0]>=b.x0-eps&&p[0]<=b.x1+eps&&p[1]>=b.y0-eps&&p[1]<=b.y1+eps;
const back=s=>4*s*s*s/(27*(s+1)*(s+1)); // exact max(outBack(x,s))-1 on x in [0,1]
function mul(a,b){const v=[a[0]*b[0],a[0]*b[1],a[1]*b[0],a[1]*b[1]];return [Math.min(...v),Math.max(...v)];}
function trig(a,b,cos){const f=cos?Math.cos:Math.sin,vals=[f(a),f(b)],base=cos?0:Math.PI/2;for(let k=Math.ceil((a-base)/Math.PI);base+k*Math.PI<b;k++)vals.push(f(base+k*Math.PI));return [Math.min(...vals),Math.max(...vals)];}
function sweep(local,pose){
 const pts=[];const span=pose.angle[1]-pose.angle[0],N=Math.max(1,Math.ceil(Math.abs(span)/4));if(N>256)fail('C_OBJECT_ANGLE_DOMAIN','Object source angle range is not bounded');
 for(let j=0;j<N;j++){const a=(pose.angle[0]+span*j/N)*J.DEG,b=(pose.angle[0]+span*(j+1)/N)*J.DEG,cs=trig(a,b,true),sn=trig(a,b,false);
  for(const [x,y]of corners(local)){const xx=mul([x,x],pose.sx),yy=mul([y,y],pose.sy),cx=mul(cs,xx),sy=mul(sn,yy),sx=mul(sn,xx),cy=mul(cs,yy);const x0=pose.x[0]+cx[0]-sy[1],x1=pose.x[1]+cx[1]-sy[0],y0=pose.y[0]+sx[0]+cy[0],y1=pose.y[1]+sx[1]+cy[1];pts.push([x0,y0],[x1,y0],[x1,y1],[x0,y1]);}}
 return A.convexHull(pts);
}
function pose(s,full,entry){
 let [x,y,angle]=s.frame;const [ax,ay]=s.anchor;let dx=[0,0],dy=[0,0],a=[angle,angle],k=[1,1];
 switch(s.kind){
 case 'ema':{const swing=Math.abs(s.swing),h=full?2*swing+.8:swing*Math.exp(-2.6*Math.max(0,entry-.08))+.8;a=[-h,h];if(full)dy=[-.5*s.H,.5*s.H*back(1.3)];break;}
 case 'ransom':a=[s.rot,s.rot];if(full)k=[.75,1.5];break;
 case 'vinyl-label':case 'vinyl-arm':a=[0,0];if(full)k=[.9,1];break;
 case 'vinyl-disc':a=[0,0];if(full){if(s.port)dy=[0,.81*s.S];else dx=[0,.81*s.S];}else{if(s.port)dy=[s.S*.56,s.S*.56];else dx=[s.S*.56,s.S*.56];}break;
 case 'vinyl-sleeve':a=[0,0];if(full){if(s.port)dy=[0,.25*s.S];else dx=[0,.25*s.S];}break;
 case 'cassette':a=full?[Math.min(0,s.tilt),Math.max(0,s.tilt)+12]:[s.tilt,s.tilt];if(full)dy=[0,.6*s.H];break;
 case 'book-pile':a=[0,0];if(full)dy=[-.6*s.H+s.exitDrop,0];break;
 case 'book-shelf':a=[0,0];dy=full?[-s.lift,2.05*s.h]:[-s.lift,-s.lift];break;
 case 'polaroid':a=full?[s.tilt,s.tilt+14]:[s.tilt,s.tilt];if(full)dy=[-.15*s.H,.1*s.H*(s.index+1)];break;
 case 'stamp-hero':a=full?[-6,14+6*back(1.3)]:[0,0];if(full){k=[.9,1+.1*back(1.3)+(s.tear?.06:0)];if(s.tear){dx=[0,s.cell*.4];dy=[-s.cell*.8,0];}}break;
 case 'stamp-replica':a=[0,0];if(full)k=[0,1+back(1.5)];break;
 case 'postcard':a=full?[s.tilt-18,s.tilt+10]:[s.tilt,s.tilt];if(full){dx=[-.4*s.W,.3*s.W];dy=[0,.05*s.H];}break;
 case 'letterPaper':a=[0,0];if(full&&s.port)dy=[0,.3*s.H];break;
 case 'fixed':case 'calendar-pad':case 'calendar-month':a=[0,0];break;
 default:fail('C_OBJECT_SOURCE_MODEL','Unclassified source body '+s.kind);
 }
 const scale=s.objectScale??1;
 // Sleeve entrance and disc travel are proportional to their physical size.
 const proportional=['vinyl-disc','vinyl-sleeve'].includes(s.kind)?scale:1;
 return {x:[ax+dx[0]*proportional,ax+dx[1]*proportional],y:[ay+dy[0]*proportional,ay+dy[1]*proportional],angle:a,sx:k.map(v=>v*scale),sy:k.map(v=>v*scale)};
}
// Monotone easing interval endpoints, with the exact outBack interior
// maximum included. This keeps native angle/drop correlations over time.
function easeRange(name,t0,t1,start,len,s=1.3){const x0=J.clamp((t0-start)/len),x1=J.clamp((t1-start)/len),f=name==='back'?x=>J.E.outBack(x,s):J.E[name],v=[f(x0),f(x1)];if(name==='back'){const q=1-2*s/(3*(s+1));if(x0<=q&&q<=x1)v.push(f(q));}return [Math.min(...v),Math.max(...v)];}
const invRange=r=>[1-r[1],1-r[0]],times=(r,k)=>k>=0?r.map(x=>x*k):[r[1]*k,r[0]*k],add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
function intervalPose(s,cut,t0,t1,entry){
 const base=pose(s,false,entry),[ax,ay]=s.anchor,scale=s.objectScale??1,po=cut.outDur>0?[J.clamp((t0-(cut.dur-cut.outDur))/cut.outDur),J.clamp((t1-(cut.dur-cut.outDur))/cut.outDur)]:[0,0],eo=po.map(J.E.inCubic);let dx=[0,0],dy=[0,0],a=base.angle,k=[1,1];
 switch(s.kind){
 case 'ema':{const td=[Math.max(0,t0-.08),Math.max(0,t1-.08)],en=easeRange('back',t0,t1,.08,.45,1.3);dy=times(invRange(en),-.5*s.H);const ex=[Math.exp(-2.6*td[1]),Math.exp(-2.6*td[0])],co=trig(td[0]*6,td[1]*6,true),r=mul(mul(ex,co),td.map(x=>J.clamp(x/.1)));a=add(add(times(r,s.swing),[-.8,.8]),times(eo,s.swing));break;}
 case 'ransom':{const q=easeRange('outCubic',t0,t1,s.tStart,.16),z=add([1,1],times(invRange(q),.5));k=mul(z,add([1,1],times(eo,-.25)));break;}
 case 'vinyl-label':case 'vinyl-arm':k=add([.9,.9],times(easeRange('outCubic',t0,t1,0,.4),.1));break;
 case 'vinyl-disc':case 'vinyl-sleeve':{const off=times(invRange(easeRange('outExpo',t0,t1,0,.45)),s.S*.25);let travel=off;if(s.kind==='vinyl-disc'){const slide=mul(easeRange('inOutCubic',t0,t1,.25,.7),invRange(po.map(J.E.inOutCubic)));travel=add(off,times(slide,s.S*.56));}if(s.port)dy=times(travel,scale);else dx=times(travel,scale);break;}
 case 'cassette':{const d=invRange(easeRange('outCubic',t0,t1,0,.5));dy=add(times(d,s.H*.6),times(eo,s.H*.15));a=add(times(invRange(eo),s.tilt),times(d,12));break;}
 case 'book-pile':dy=add(times(invRange(easeRange('outCubic',t0,t1,s.tStart,.3)),-s.H*.6),times(eo,s.exitDrop));break;
 case 'book-shelf':{const e=easeRange('outExpo',t0,t1,s.tStart,.4),lift=mul(times(easeRange('inOutCubic',t0,t1,.35,.4),s.lift),invRange(eo));dy=add(add(times(invRange(e),s.h),times(lift,-1)),times(eo,s.h*1.05));break;}
 case 'polaroid':{const d=invRange(easeRange('outCubic',t0,t1,s.tStart,.4));dy=add(times(d,-s.H*.15),times(eo,s.H*.1*(s.index+1)));a=add([s.tilt,s.tilt],times(d,14));break;}
 case 'stamp-hero':{const he=easeRange('back',t0,t1,.12,.35,1.3),tear=s.tear?eo:[0,0];dx=times(tear,s.cell*.4);dy=times(tear,-s.cell*.8);a=add(times(tear,14),times(invRange(he),-6));k=add(add([.9,.9],times(he,.1)),times(tear,.06));break;}
 case 'stamp-replica':return pose(s,true,entry);
 case 'postcard':{const d=invRange(easeRange('outCubic',t0,t1,0,.55));dx=add(times(d,-s.W*.4),times(eo,s.W*.3));dy=times(d,s.H*.05);a=add(add([s.tilt,s.tilt],times(d,-18)),times(eo,10));break;}
 case 'letterPaper':if(s.port)dy=add(times(invRange(easeRange('outCubic',t0,t1,0,.45)),s.H*.25),times(eo,s.H*.05));break;
 }
 return {x:[ax+dx[0],ax+dx[1]],y:[ay+dy[0],ay+dy[1]],angle:a,sx:times(k,scale),sy:times(k,scale)};
}
function textStage(local,s,plan,cut,entry){const points=[],N=96;for(let j=0;j<N;j++){const p=sweep(local,intervalPose(s,cut,cut.dur*j/N,cut.dur*(j+1)/N,entry));points.push(...p);}let polygon=A.convexHull(points);if(s.kind==='book-shelf'){const b=A.bounds([polygon]);polygon=rect(b.x0,b.y0,b.x1,Math.min(b.y1,s.anchor[1]+s.h-1));}return camera([polygon],plan,cut,20);}
function record(renderer,plan,cut,time){const ctx=A.measurementContext();ctx.reset();const env=renderer.makeEnv(ctx,plan,cut,cut.palette||plan.style.schemes[cut.scheme%plan.style.schemes.length],{pass:'main',t:time,realTime:time,lt:time-cut.start,ltb:time-cut.start,step:Math.floor(time*(plan.fps||24)),scale:1,allowFilter:false});const p=A.record(renderer,env);if(!p.measurementSupported)fail('C_OBJECT_RECORD',JSON.stringify(p.diagnostics));return p;}
function sourceMapping(program,cut){
 const items=program.events.filter(e=>e.kind==='item'),main=items.filter(e=>e.args[0].placementMain).map(e=>({text:e.args[0].text,font:e.args[0].font,size:e.args[0].size,mi:e.args[0].mi??0,physicalScale:physicalScale(e,cut),owner:e.owner}));
 if(!main.length||norm(main.map(x=>x.text).join(''))!==norm(cut.text))fail('C_OBJECT_SOURCE_COVERAGE','Every ordered native lyric occurrence must be retained');
 const metadata=items.filter(e=>!e.args[0].placementMain).map(e=>({text:e.args[0].text,font:e.args[0].font,size:e.args[0].size,physicalScale:physicalScale(e,cut),owner:e.owner}));
 const nativeText=program.events.filter(e=>e.kind==='nativeText').map(e=>{const css=e.args[3].font,m=/(?:^|\s)([+]?(?:\d+(?:\.\d*)?|\.\d+))px(?=\s|\/)/.exec(css);const size=m?Number(m[1]):NaN;if(!Number.isFinite(size)||size<=0)fail('C_OBJECT_NATIVE_TEXT_FONT','Positive finite CSS px size required');return {text:e.args[0],font:css,cssWithoutSize:css.slice(0,m.index)+css.slice(m.index).replace(m[1]+'px','{size}px'),size,physicalScale:physicalScale(e,cut),owner:e.owner};});
 return {main,metadata,nativeText,shapes:program.events.filter(e=>!['item','nativeText'].includes(e.kind)).map(e=>({kind:e.kind,owner:e.owner})),roles:[...new Set(program.events.map(e=>e.role+':'+e.owner))]};
}
function camera(polygons,plan,cut,reserve){return A.cameraEnvelope(polygons,{...plan,fx:cut.effectFx||plan.fx,style:cut.effectStyle||plan.style},cut,reserve);}
function strictEntry(s,cut){switch(s.kind){case 'fixed':case 'calendar-pad':return 0;case 'ema':return .53;case 'ransom':return s.tStart+.16;case 'vinyl-label':return Math.max(.5,cut.inDur+.35);case 'vinyl-arm':return .9;case 'vinyl-disc':return .95;case 'vinyl-sleeve':return .45;case 'cassette':return .5;case 'book-pile':return s.tStart+.3;case 'book-shelf':return .75;case 'polaroid':return s.tStart+.4;case 'stamp-hero':return .47;case 'stamp-replica':return s.tStart+.3;case 'postcard':return .55;case 'letterPaper':return s.port?.45:0;case 'calendar-month':return .47;default:fail('C_OBJECT_SOURCE_MODEL','Unclassified native body phase');}}
function bodies(program,plan,cut,entry){
 const grouped=new Map();
 for(const e of program.events){if(!['primary','independentDecor'].includes(e.role))fail('C_OBJECT_UNCLASSIFIED_ROLE','Object ink may not be silently auxiliary');if(e.role!=='primary')continue;const s=e.nativeCBody;if(!s?.key||!s.frame||!s.anchor||!s.support)fail('C_OBJECT_UNCLASSIFIED_INK','Every owned source event requires its native body model');
  const inv=A.inverse(matrix(s.frame)),local=e.polygons.map(p=>p.map(v=>A.point(inv,v)));const key=s.key;
  let g=grouped.get(key);if(!g){g={source:s,points:[],textPoints:[],main:[],kinds:new Set()};grouped.set(key,g);}g.points.push(...local.flat());if(e.kind==='item'||e.kind==='nativeText')g.textPoints.push(...local.flat());g.kinds.add(e.kind);
  if(e.kind==='item'&&e.args[0].placementMain){const z={x0:s.support[0],y0:s.support[1],x1:s.support[2],y1:s.support[3]};const ink=(e.inkPolygons||e.polygons).flat().map(v=>A.point(inv,v));if(ink.some(p=>!contains(p,z,1)))fail('C_OBJECT_OWNED_FIELD','Complete primary ink escaped its native physical writing surface');g.main.push(e.args[0]);}
 }
 if(!grouped.size)fail('C_OBJECT_EMPTY_SOURCE','Owned object source is empty');
 const result=[];
 for(const [owner,g]of grouped){const s={...g.source,objectScale:['fixed','stamp-replica','book-pile','book-shelf','calendar-month'].includes(g.source.kind)?1:cut.layoutCRecipe?.objectScale??1},support=rect(...s.support);let local=A.bounds([support,...(g.points.length?[A.convexHull(g.points)]:[])]),holdLocal=local,fullLocal=local;
  // Disc radial metadata turns continuously; measured body support includes the
  // entire record and its label. Arc text/lyric ink must fit inside that support.
  if(['vinyl-label','vinyl-disc'].includes(s.kind)){const r=s.kind==='vinyl-label'?s.R:s.S*.47,pad=Math.max(8,Math.min(plan.W,plan.H)*.012);if(g.textPoints.some(p=>Math.hypot(...p)>r+pad))fail('C_OBJECT_DISC_INK','Measured label ink exceeds the native disc support');local=holdLocal=fullLocal={x0:-r-pad,y0:-r-pad,x1:r+pad,y1:r+pad};}
  if(s.kind==='calendar-pad'){
   // All back pages/binding stay fixed. The foreground page rotates +/-28deg
   // about (x0+.1/.9pw,y0+.08ph), then drops .6ph*tear^2.
   // This local rectangle encloses both parity pivots and every page corner.
   const px=(s.day%2?-.4:.4)*s.pw,py=-s.ph/2+s.bindH,angle=s.day%2?[0,28]:[-28,0],page={x0:-s.pw/2-px,x1:s.pw/2-px,y0:0,y1:s.ph-s.bindH+s.ph*.6},turn=A.bounds([sweep(page,{x:[px,px],y:[py,py],angle,sx:[1,1],sy:[1,1]})]);
   fullLocal={x0:Math.min(local.x0,turn.x0),x1:Math.max(local.x1,turn.x1),y0:Math.min(local.y0,turn.y0),y1:Math.max(local.y1,turn.y1)};
  }
  if(s.kind==='calendar-month')fullLocal={x0:Math.min(s.tcx,s.X1)-s.anchor[0]-20,x1:Math.max(s.tcx+s.cell,s.X1+s.PW)-s.anchor[0]+20,y0:Math.min(s.tcy,s.Y1)-s.anchor[1]-20,y1:Math.max(s.tcy+s.rh,s.Y1+s.PH)-s.anchor[1]+20};
  // Native entry/exit shadows absent at rest (stamp tear) are bounded explicitly.
  if(s.kind==='stamp-hero'){const p=Math.min(plan.W,plan.H)*.08;fullLocal={x0:fullLocal.x0-p,y0:fullLocal.y0-p,x1:fullLocal.x1+p,y1:fullLocal.y1+p};}
  const strictFrom=strictEntry(s,cut),hp=pose(s,false,strictFrom),fp=pose(s,true,strictFrom),hold=camera([sweep(holdLocal,hp)],plan,cut,20),full=camera([sweep(fullLocal,fp)],plan,cut,20);
  // The stage regression contract protects real readable ink. Paper edges and
  // native shadows may enter/leave the stage without becoming a glyph crop.
  let textFull=null,textHold=null,visibilityText=null;
  if(g.textPoints.length){let textLocal=A.bounds([A.convexHull(g.textPoints)]);
   // Persistent radial metadata and himekuri's tear use the same full support.
   if(['vinyl-label','vinyl-disc','calendar-pad','calendar-month'].includes(s.kind))textLocal=fullLocal;
   // This is an analytic interval partition. No source frame is sampled.
   // Every easing/sine/product is bounded throughout each time subinterval.
   textFull=textStage(textLocal,s,plan,cut,entry);textHold=camera([sweep(textLocal,hp)],plan,cut,20);visibilityText=sweep(textLocal,hp);
  }
  result.push({owner,source:s,strictFrom,strictExit:['fixed','letterPaper','stamp-replica'].includes(s.kind)&&!(s.kind==='letterPaper'&&s.port),local,fullLocal,hold,full,textFull,textHold,visibilityText,visibilityBody:sweep(fullLocal,fp),holdPose:hp,fullPose:fp,kinds:[...g.kinds]});
 }
 return result;
}
// Separating axes prove that a reflow never lets a later opaque owned body
// cover already readable text, even while that later body is entering/exiting.
function disjoint(a,b){
 for(const poly of [a,b])for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],axis=[p[1]-q[1],q[0]-p[0]],aa=a.map(v=>v[0]*axis[0]+v[1]*axis[1]),bb=b.map(v=>v[0]*axis[0]+v[1]*axis[1]);if(Math.max(...aa)<Math.min(...bb)-1e-6||Math.max(...bb)<Math.min(...aa)-1e-6)return true;}
 return false;
}
function reflowVisibility(bs,recipe){
 if(!recipe.ransomColumns&&!recipe.slotPitch)return null;
 let checked=0;
 for(let i=0;i<bs.length;i++)if(bs[i].visibilityText)for(let j=i+1;j<bs.length;j++){checked++;if(!disjoint(bs[i].visibilityText,bs[j].visibilityBody))fail('C_OBJECT_REFLOW_OCCLUSION','Later full-motion owned body can cover readable earlier text: '+bs[i].owner+' / '+bs[j].owner);}
 return {rule:'Earlier strict real-text envelope disjoint from every later full-motion owned support in common source coordinates; common camera affine preserves disjointness, no extra circle reserve imposed; painter order and clocks retained',checked};
}
function recipes(cut,explicitSize){
 if(explicitSize||cut.layout==='bookSpine'||cut.layout==='calendar'&&cut.params.variant==='month')return [];
 const choices=[.95,.9,.85,.8,.75,.7].map(objectScale=>({objectScale,strategy:cut.layout+'-owned-object-size'}));
 if(cut.layout==='ransom'){const n=[...norm(cut.text)].length;choices.push({objectScale:.85,ransomColumns:Math.max(1,Math.ceil(n/2)),ransomPitch:[1.6,1.7],strategy:'ransom-native-scrap-rows'},{objectScale:.7,ransomColumns:Math.max(1,Math.ceil(n/3)),ransomPitch:[1.65,1.7],strategy:'ransom-native-scrap-rows'});}
 if(cut.layout==='polaroid'&&cut.params.chunks.length>1)choices.push({objectScale:.85,slotPitch:.95,strategy:'polaroid-native-slot-pitch'},{objectScale:.7,slotPitch:1.05,strategy:'polaroid-native-slot-pitch'});
 return choices;
}
function entryFor(cut){const p=cut.params,n=[...norm(cut.text)].length;
 switch(cut.layout){case 'ema':return .6;case 'ransom':return .03+(n-1)*J.clamp(.4/n,.025,.07)+.16;case 'vinyl':return p.variant==='label'?Math.max(.9,cut.inDur+.35):.95;case 'cassette':return .5;case 'bookSpine':return p.variant==='pile'?.04+(Math.min(6,p.books.length)-1)*.09+.3:Math.max(.75,.03+Math.ceil(p.books.length/2)*.05+.4);case 'polaroid':return .02+((p.chunks?.length||1)-1)*.16+1;case 'stampSheet':return Math.max(.47,.35+.03*(p.cols+p.rows-2));case 'postcard':return Math.max(.7,cut.inDur+.38);case 'letterPaper':return .5;case 'calendar':return .5;default:fail('C_OBJECT_SOURCE_MODEL','Unknown object ID');}
}
function quality(program,native,plan,cut,explicitSize){
 const got=sourceMapping(program,cut),expected=sourceMapping(native,cut),scale=cut.layoutCRecipe?.objectScale??1,content=cut.contentScale??1,floor=Math.max(18,.035*Math.min(plan.W,plan.H)),secondaryFloor=Math.max(12,.02*Math.min(plan.W,plan.H));
 const strip=x=>x.map(({size,physicalScale,...v})=>v);
 if(JSON.stringify(strip(got.main))!==JSON.stringify(strip(expected.main))||JSON.stringify(strip(got.metadata))!==JSON.stringify(strip(expected.metadata))||JSON.stringify(got.nativeText.map(({size,font,physicalScale,...v})=>v))!==JSON.stringify(expected.nativeText.map(({size,font,physicalScale,...v})=>v))||JSON.stringify(got.shapes)!==JSON.stringify(expected.shapes))fail('C_OBJECT_SOURCE_MAPPING','Recipe changed native source copy/font/clock/shape ownership');
 for(let i=0;i<got.main.length;i++){const actual=got.main[i].size*got.main[i].physicalScale,ratio=actual/expected.main[i].size;if(ratio<.7-1e-8||actual*content<floor-1e-8||explicitSize&&Math.abs(ratio-1)>1e-8)fail('C_OBJECT_SIZE_FLOOR','Primary actual font floor/native ratio/explicit size must be preserved');}
 for(let i=0;i<got.metadata.length;i++){const actual=got.metadata[i].size*got.metadata[i].physicalScale,n=expected.metadata[i].size;if(actual<n*.7-1e-8||actual*content<Math.min(n*content,secondaryFloor)-1e-8)fail('C_OBJECT_METADATA_FLOOR','Native meaningful copy and metadata need a readable actual size');}
 for(let i=0;i<got.nativeText.length;i++){const actual=got.nativeText[i].size*got.nativeText[i].physicalScale,n=expected.nativeText[i].size;if(actual<n*.7-1e-8||actual*content<Math.min(n*content,secondaryFloor)-1e-8)fail('C_OBJECT_NATIVE_TEXT_FLOOR','Raw Canvas text actual CSS px size must remain readable');}
 return {mapping:got,mainFloor:floor,secondaryFloor,objectScale:scale,minMainPx:Math.min(...got.main.map(x=>x.size*x.physicalScale*content)),explicitSizePreserved:!explicitSize||scale===1};
}
function offsetDomain(candidate,native,plan,cut){
 // Source-native crop is permitted only where it already existed. For native
 // size a translation away from a crossed stage edge can never worsen that
 // edge. Otherwise the complete sweep must remain inside. Size candidates
 // require full entry/exit stage containment: no crop is excused by shrinking.
 const b=A.bounds(candidate.map(x=>x.textFull).filter(Boolean));if((cut.layoutCRecipe?.objectScale??1)!==1)return {minX:-b.x0,maxX:plan.W-b.x1,minY:-b.y0,maxY:plan.H-b.y1,rule:'candidate full owned sweep inside stage'};
 const n=A.bounds(native.map(x=>x.textFull).filter(Boolean));return {minX:n.x0<0?0:-n.x0,maxX:n.x1>plan.W?0:plan.W-n.x1,minY:n.y0<0?0:-n.y0,maxY:n.y1>plan.H?0:plan.H-n.y1,rule:'continuous native crop monotonicity; never move farther through a crossed edge'};
}
function solve(envelopes,circle,plan,cut,domain){if(domain.minX>domain.maxX||domain.minY>domain.maxY)return {status:'insufficient-space',offset:[0,0],reason:'native-stage-sweep-has-no-crop-preserving-offset'};return A.solveBasic(envelopes,circle,plan.W,plan.H,cut.seed,{accept:d=>d[0]>=domain.minX-1e-7&&d[0]<=domain.maxX+1e-7&&d[1]>=domain.minY-1e-7&&d[1]<=domain.maxY+1e-7});}
function validate(cut){
 if(A.layoutsCObjectsTag!==tag)fail('C_OBJECT_SOURCE_HOOK','Object source ownership hook identity changed');if(cut.treat!=='none'||cut.enter!=='cut'||cut.exit!=='cut'||cut.hold!=='still')fail('C_OBJECT_EFFECT_DOMAIN','Dedicated object proofs presently support source-native clocks with cut/cut/still and no treatment');if(!finite(cut.params))fail('C_OBJECT_PARAMETER_DOMAIN','Finite source object params required');


 const p=cut.params,one=(v,list)=>list.includes(v),between=(v,a,b)=>Number.isFinite(v)&&v>=a-1e-8&&v<=b+1e-8,int=(v,a,b)=>Number.isInteger(v)&&between(v,a,b),font=v=>typeof v==='string'&&!!J.FONTS[v],bool=v=>typeof v==='boolean';let good=font(p.font);
 switch(cut.layout){
 case 'ema':good=good&&bool(p.vert)&&one(p.emblem,['sun','wave','mount','knot'])&&between(Math.abs(p.swing),12,20)&&Array.isArray(p.back)&&p.back.length===7&&p.back.every(v=>Array.isArray(v)&&v.length===4&&between(v[0],-1,1)&&between(v[1],-8,8)&&between(v[2],.8,1.05)&&int(v[3],0,99));break;
 case 'ransom':good=Array.isArray(p.fonts)&&p.fonts.length>0&&p.fonts.every(font)&&Array.isArray(p.look)&&p.look.length===[...String(cut.text).trim().replace(/[\s　]+/g,' ')].length&&p.look.every(v=>Array.isArray(v)&&v.length===6&&int(v[0],0,p.fonts.length-1)&&int(v[1],0,5)&&between(v[2],-9,9)&&between(v[3],.84,1.16)&&between(v[4],-.1,.1)&&int(v[5],0,999))&&between(p.tilt,-3,3)&&bool(p.shadow);break;
 case 'vinyl':good=good&&one(p.variant,['label','sleeve'])&&one(p.side,['A','B'])&&one(p.rpm,['33⅓','45'])&&one(p.sleeve,['ink','accent','card'])&&int(p.cat,100,9999)&&bool(p.arm);break;
 case 'cassette':good=good&&one(p.shell,['ink','accent','clear'])&&one(p.band,['accent','ink','stripe'])&&one(p.side,['A','B'])&&between(p.tilt,-4,4)&&one(p.len,['C-46','C-60','C-90']);break;
 case 'bookSpine':good=good&&one(p.variant,['pile','shelf'])&&Array.isArray(p.books)&&between(p.books.length,5,12)&&p.books.every(v=>Array.isArray(v)&&v.length===4&&between(v[0],.5,1)&&between(v[1],.62,.92)&&int(v[2],0,5)&&int(v[3],0,3))&&one(p.hero,['ink','accent'])&&int(p.vol,1,24);break;
 case 'polaroid':good=good&&font(p.pen)&&Array.isArray(p.chunks)&&between(p.chunks.length,1,3)&&p.chunks.every(v=>typeof v==='string'&&norm(v))&&norm(p.chunks.join(''))===norm(cut.text)&&Array.isArray(p.tilts)&&p.tilts.length===3&&p.tilts.every(v=>between(v,-7,7))&&one(p.img,['dark','accent','dusk'])&&bool(p.tape);break;
 case 'stampSheet':good=good&&((p.cols===3&&p.rows===5)||(p.cols===5&&p.rows===3))&&int(p.hc,0,1)&&int(p.hr,0,1)&&one(p.val,[63,84,94,110,120,140])&&one(p.motif,['circle','wave','char'])&&bool(p.tear);break;
 case 'postcard':good=good&&between(p.tilt,-5,5)&&one(p.val,[63,85,110])&&/^\d{7}$/.test(p.zip)&&between(p.mark,-18,18)&&one(p.stamp,['circle','mount','wave']);break;
 case 'letterPaper':good=good&&one(p.variant,['tate','yoko'])&&one(p.rule,['accent','sub'])&&bool(p.sign);break;
 case 'calendar':good=good&&one(p.variant,['month','himekuri'])&&int(p.month,0,11)&&int(p.off,0,6)&&int(p.day,3,27)&&one(p.days,[30,31]);break;
 }
 if(!good)fail('C_OBJECT_PARAMETER_DOMAIN','Native planned object/font/shape parameter domain required');
}

function finalize({plan,cut,revision,stepDur,reachTail,explicitSize}){
 validate(cut);cut.placementUnits=true;cut.placementLayoutsC=true;cut.fullStagePlacement=true;
 const entry=entryFor(cut),holdWindow=[cut.start+entry,cut.end-cut.outDur];if(holdWindow[1]-holdWindow[0]<.04)fail('C_OBJECT_HOLD_WINDOW','No .04s native settled source window before exit');
 const renderer=Object.create(J.Renderer.prototype),time=holdWindow[0]+.0001,program=record(renderer,plan,cut,time),source=sourceMapping(program,cut),nativeBodies=bodies(program,plan,cut,entry),baseQuality=quality(program,program,plan,cut,explicitSize),evaluationRange=[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail],segments=[],cache=new Map();
 const candidates=recipes(cut,explicitSize),perCutLimit=candidates.length;let reconstructed=0,trialRecordCalls=0,cacheHits=0,rejected=0,rejectedCacheHits=0;
 for(let i=0;i<plan.lyricAvoidanceIndex.regions.length;i++){
  const r=plan.lyricAvoidanceIndex.regions[i],end=Math.min(r.end??plan.lyricAvoidanceIndex.regions[i+1]?.start??plan.duration,plan.duration);if(r.start>=evaluationRange[1])break;if(end<=evaluationRange[0]||end<=r.start)continue;
  const circle={cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)};let selected={bodies:nativeBodies,quality:baseQuality,recipe:null,domain:offsetDomain(nativeBodies,nativeBodies,plan,cut)},solution=solve(nativeBodies.map(x=>x.hold),circle,plan,cut,selected.domain);const attempts=[{strategy:'native-owned-unit-joint-translation',status:solution.status,reason:solution.reason??null}];
  for(const recipe of solution.status==='safe'?[]:candidates){const objectScale=recipe.objectScale,key=JSON.stringify(recipe);
   try{
    let trial;
    if(cache.has(key)){cacheHits++;trial=cache.get(key);if(trial.error){rejectedCacheHits++;fail(trial.error.code,trial.error.message);}}
    else{
     if(reconstructed>=perCutLimit)fail('C_OBJECT_CANDIDATE_BUDGET','Per-cut object reconstruction hard budget exhausted');
     reconstructed++;
     try{const trialCut={...cut,layoutCRecipe:recipe};trialRecordCalls++;const p=record(renderer,plan,trialCut,time),q=quality(p,program,plan,trialCut,explicitSize),bs=bodies(p,plan,trialCut,entry),visibility=reflowVisibility(bs,recipe);trial={bodies:bs,quality:{...q,reflowVisibility:visibility},recipe:trialCut.layoutCRecipe,domain:offsetDomain(bs,nativeBodies,plan,trialCut)};cache.set(key,trial);}
     catch(e){rejected++;cache.set(key,{error:{code:e.code||'DRAW_PROGRAM_ERROR',message:e.message}});throw e;}
    }
    const solved=solve(trial.bodies.map(x=>x.hold),circle,plan,cut,trial.domain);attempts.push({strategy:trial.recipe.strategy,objectScale,status:solved.status,reason:solved.reason??null});if(solved.status==='safe'){selected=trial;solution=solved;break;}
   }catch(e){attempts.push({strategy:recipe.strategy,recipe,objectScale,status:'rejected',reason:e.code||'DRAW_PROGRAM_ERROR',message:e.message});}
  }
  const safe=solution.status==='safe';segments.push({start:r.start,end,region:r.id,circle,from:solution.offset,to:solution.offset,status:safe?'safe-hold':'insufficient-space',decision:safe?'certified-hold-adapter':'excluded-during-avoidance',failure:safe?null:'no-source-object-composition-with-stage-and-readable-font-proof',holdWindow,safetyScope:'native-owned-object-entry-exit-circle-relaxed',composition:selected.recipe,quality:selected.quality,domain:selected.domain,envelopes:selected.bodies.map(x=>x.hold),stageEnvelopes:selected.bodies.map(x=>x.full),bodies:selected.bodies,attempts});
 }
 return {version:1,kind:'layouts-c-source-native',revision,evaluationRange,holdWindow,units:[{owner:cut.layout+'.composition',envelopes:nativeBodies.map(x=>x.hold),segments}],sourceProof:{adapter:'c-objects',mode:'source-analytic-affine-interval',sourceMapping:source,bodyKinds:nativeBodies.map(x=>({owner:x.owner,kind:x.source.kind})),continuousFontCSS:{scope:'stampSheet first-glyph replicas and denomination metadata',rule:'Fixed native final CSS font, continuous native e CTM; effective size and original positions/clocks retained',AAChange:'ON-only hinting/AA can differ from varying CSS size; OFF untouched'},nativeStageRule:'Entry/exit circle relaxation is independent from continuous stage-crop constraints. Size candidates require complete sweep containment.',clocks:'Original lt/ltb/pOut; ema persistent damped swing + sin; disc/reel full local radial support; all source clipping and painter order replayed',intervalArithmetic:'OutBack exact overshoot; sin/cos extrema on every angle interval; independent bounded source position/scale products; body corner convex hull then stock cameraEnvelope',objectSize:'Only individual physical objects, uniformly about native object pivots; no W/H changes or viewport scaling; paper/font/metadata/clip all share physical scale',candidateBudget:{nativeRecordCalls:1,trialRecordCalls,reconstructed,unique:cache.size,cacheHits,rejected,rejectedCacheHits,perCutLimit},limitations:['cut/cut/still + no treatment only','bookSpine and month calendar size recipe not yet supported','Insufficient segments preserve original source; not certified safe']},measurementSupported:true,safety:segments.every(s=>s.status==='safe-hold')?'certified-hold-adapter':'insufficient-space',explicitSizePreserved:explicitSize};
}
function render({renderer,env,trajectory:tr}){
 validate(env.cut);const unit=tr.units[0],active=unit.segments.find(s=>s.start<=env.realTime&&env.realTime<s.end),offset=A.offsetAt(unit,env.realTime),scale=env.scale||1;
 if(active?.composition){const cut={...env.cut,layoutCRecipe:active.composition};env=renderer.makeEnv(env.ctx,env.plan,cut,env.sc,{...env,cut});}
 const program=A.record(renderer,env);if(!program.measurementSupported)fail('C_OBJECT_RECORD',JSON.stringify(program.diagnostics));const primary=program.events.filter(e=>e.role==='primary'),polygons=primary.flatMap(e=>e.polygons).map(p=>p.map(q=>[q[0]/scale,q[1]/scale])),inHold=env.t>=tr.holdWindow[0]&&env.t<=tr.holdWindow[1];
 // Bounds are checked by source body, including every late-appearing shadow,
 // metadata and raw Canvas path. Unclassified ink is never silently replayed.
 const bs=active?.bodies;let covered=true,stageCovered=true;const strictEvents=[],strictPolygons=[],violations=[];
 for(const e of primary){if(!e.nativeCBody?.key)fail('C_OBJECT_UNCLASSIFIED_INK','Runtime primary missing source body');const body=bs?.find(b=>b.owner===e.nativeCBody.key);if(!body){if(active)fail('C_OBJECT_SOURCE_BODY_CHANGED','Unknown runtime body');continue;}const strict=env.lt>=body.strictFrom&&(env.pOut<=0||body.strictExit);if(strict){strictEvents.push(e.order);strictPolygons.push(...e.polygons.map(p=>p.map(q=>[q[0]/scale+offset[0],q[1]/scale+offset[1]])));}for(const p of e.polygons.flat().map(q=>[q[0]/scale,q[1]/scale])){if(!polygonContains(p,body.full)){stageCovered=false;violations.push({owner:e.owner,kind:e.kind,scope:'full',point:p});}if(strict&&!polygonContains(p,body.hold)){covered=false;violations.push({owner:e.owner,kind:e.kind,scope:'strict',point:p});}}}
 if(active&&(!covered||!stageCovered))fail('C_OBJECT_ENVELOPE_VIOLATION','Runtime object ink escaped its continuous native source envelope '+JSON.stringify({lt:env.lt,pOut:env.pOut,violations:violations.slice(0,4)}));
 const moved=polygons.map(p=>p.map(v=>[v[0]+offset[0],v[1]+offset[1]])),region=J.resolveAvoidanceAt(env.plan,env.realTime),circle=region?J.avoidanceCirclePixels(region,env.plan.W,env.plan.H):null,clear=!moved.length||A.clear(moved,circle,Math.max(2,.005*Math.min(env.plan.W,env.plan.H))),safe=active?.status==='safe-hold';
 const strictClear=!strictPolygons.length||A.clear(strictPolygons,circle,Math.max(2,.005*Math.min(env.plan.W,env.plan.H)));
 if(safe&&!strictClear)fail('C_OBJECT_CIRCLE_VIOLATION','Certified object hold collided with circle');
 env.placementObservation?.({cut:env.cut.index,realTime:env.realTime,motionTime:env.t,pass:env.pass,offset,measurementSupported:true,envelopeCovered:covered,stageEnvelopeCovered:stageCovered,stageContained:moved.every(p=>p.every(v=>v[0]>=0&&v[0]<=env.plan.W&&v[1]>=0&&v[1]<=env.plan.H)),safety:active?.status==='insufficient-space'?'conflict':clear?'safe':strictClear?'source-entry-exit-relaxed':'conflict',safetyScope:active?.safetyScope||'no-active-region',polygons:moved,strictPolygons,strictEventOrders:strictEvents,events:program.events.map(e=>({kind:e.kind,role:e.role,owner:e.owner,order:e.order,polygons:e.polygons}))});
 const decorOffsets={};if(['ema','bookSpine','stampSheet'].includes(env.cut.layout))for(const e of program.events)if(e.role==='independentDecor')decorOffsets[e.key??e.owner]=offset;
 A.replay(env,program,offset,decorOffsets);
}
for(const id of ids)A.registerLayoutsCAdapter(id,{id:'c-objects',finalize,render});
})();
