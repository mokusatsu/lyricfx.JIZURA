/* AVOID-004 internal opt-in stage foundation. No product-default activation. */
(() => {
'use strict';
const A = J.placement = {}, ID = [1,0,0,1,0,0], MAX_EVENTS = 4096, MAX_GLYPHS = 16384;
const fail = (code, message) => { const e = new Error(message); e.code = code; throw e; };
const finite = values => values.every(Number.isFinite);
A.multiply = (a,b) => [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
A.affine = m => { if (!Array.isArray(m) || m.length!==6 || !finite(m)) fail('INVALID_AFFINE','Finite affine required'); const d=m[0]*m[3]-m[1]*m[2]; if(!Number.isFinite(d))fail('INVALID_AFFINE','Affine determinant overflow'); if(Math.abs(d)<=1e-12*Math.max(1,Math.abs(m[0]*m[3]),Math.abs(m[1]*m[2])))fail('SINGULAR_AFFINE','Singular parent/item transform'); return m; };
A.inverse = m => { A.affine(m); const [a,b,c,d,e,f]=m,n=a*d-b*c; const out=[d/n,-b/n,-c/n,a/n,(c*f-d*e)/n,(b*e-a*f)/n];if(!finite(out))fail('INVALID_AFFINE','Inverse overflow');return out; };
A.point = (m,p) => [m[0]*p[0]+m[2]*p[1]+m[4],m[1]*p[0]+m[3]*p[1]+m[5]];
const trans=(x=0,y=0)=>[1,0,0,1,x,y], scale=(x=1,y=x)=>[x,0,0,y,0,0];
const rotate=d=>{const r=d*J.DEG,c=Math.cos(r),s=Math.sin(r);return [c,s,-s,c,0,0];};
const shear=d=>[1,0,Math.tan(d*J.DEG),1,0,0];
const compose=(...ms)=>ms.reduce(A.multiply,ID);
const matrix=ctx=>{const m=ctx.getTransform();return [m.a,m.b,m.c,m.d,m.e,m.f];};
const rect=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
A.bounds = polygons => {if(!Array.isArray(polygons)||polygons.some(p=>!Array.isArray(p)||p.length<3||p.some(v=>!Array.isArray(v)||v.length!==2)))fail('UNMEASURED_INK','Invalid polygon');let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity,count=0;polygons.forEach(poly=>poly.forEach(p=>{if(!finite(p))fail('UNMEASURED_INK','Empty/nonfinite ink');count++;x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);}));if(!count)fail('UNMEASURED_INK','Empty/nonfinite ink');return {x0,y0,x1,y1};};
A.convexHull=points=>{const sorted=points.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),out=[];for(let i=0;i<sorted.length;i++){const p=sorted[i];while(out.length>1&&cross(out[out.length-2],out[out.length-1],p)<=0)out.pop();out.push(p);}out.pop();const lowerLength=out.length;for(let i=sorted.length-1;i>=0;i--){const p=sorted[i];while(out.length>lowerLength+1&&cross(out[out.length-2],out[out.length-1],p)<=0)out.pop();out.push(p);}out.pop();return out;};
// Exact old angular samples, privately reused. A changed TAU cannot reuse a
// stale table. At most the existing 32/64-point shape tables are retained.
let shapeTau;const shapeCircles=new Map();
function shapeUnitCircle(N){if(shapeTau!==J.TAU){shapeCircles.clear();shapeTau=J.TAU;}let unit=shapeCircles.get(N);if(!unit){unit=Array.from({length:N},(_,i)=>{const a=(i+.5)*J.TAU/N;return [Math.cos(a),Math.sin(a)];});shapeCircles.set(N,unit);}return unit;}
function roundedRectHull(corners,radius){
 const x0=Math.min(corners[0][0],corners[1][0]),x1=Math.max(corners[0][0],corners[1][0]),y0=Math.min(corners[0][1],corners[3][1]),y1=Math.max(corners[0][1],corners[3][1]),canonical=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],unit=shapeUnitCircle(32);
 // A vertex contributes to this rectangle+32-gon Minkowski hull only if its
 // normal cone meets that corner's quadrant. Include both boundary vertices;
 // these are the same old points, not a coarser angular approximation.
 const indices=[i=>i>=15&&i<=24,i=>i===0||i>=23,i=>i<=8||i===31,i=>i>=7&&i<=16];
 return A.convexHull(canonical.flatMap((corner,j)=>unit.flatMap((v,i)=>indices[j](i)?[[corner[0]+radius*v[0],corner[1]+radius*v[1]]]:[])));
}
let measureCtx;
const measure=()=>measureCtx||(measureCtx=document.createElement('canvas').getContext('2d'));
A.bufferStats=()=>({contexts:measureCtx?1:0,maxContexts:1,pixels:measureCtx?measureCtx.canvas.width*measureCtx.canvas.height:0,maxPixels:1,perGlyphStageBuffers:0});
A.measurementContext=()=>measurementContext();
function measurementContext(){const c=measure();if(c.canvas.width!==1||c.canvas.height!==1){c.canvas.width=1;c.canvas.height=1;}return c;}
let inkMetricRevision=-1;const inkMetrics=new Map(),MAX_INK_METRICS=4096;
function inkMetric(ctx,font,ch){const revision=J.metrics.revision||0;if(inkMetricRevision!==revision){inkMetrics.clear();inkMetricRevision=revision;}const key=font+'\u0000'+ch;let value=inkMetrics.get(key);if(!value){ctx.font=font;const m=ctx.measureText(ch);value={actualBoundingBoxLeft:m.actualBoundingBoxLeft,actualBoundingBoxRight:m.actualBoundingBoxRight,actualBoundingBoxAscent:m.actualBoundingBoxAscent,actualBoundingBoxDescent:m.actualBoundingBoxDescent};if(inkMetrics.size>=MAX_INK_METRICS)inkMetrics.delete(inkMetrics.keys().next().value);inkMetrics.set(key,value);}return value;}
A.inkMetricCacheStats=()=>({revision:inkMetricRevision,entries:inkMetrics.size,maxEntries:MAX_INK_METRICS});
/* Public adapter boundary: same font, center/middle baseline and exact Canvas transform order as drawItem.
   Unsupported effects fail explicitly; returned polygons conservatively include glyph ink + stroke. */
const textDefaults={fontKerning:['auto'],letterSpacing:['0px'],wordSpacing:['0px'],textRendering:['auto'],fontStretch:['normal'],fontVariantCaps:['normal'],direction:['inherit','ltr'],lang:['inherit']};
const defaultTextValue=(key,value)=>['letterSpacing','wordSpacing'].includes(key)?value===''||/^[-+]?0(?:\.0+)?(?:[a-z]+)?$/i.test(String(value).trim()):textDefaults[key].includes(value);
const validateTextState=ctx=>{for(const [key,allowed]of Object.entries(textDefaults))if(key in ctx&&!defaultTextValue(key,ctx[key]))fail('UNSUPPORTED_TEXT_STATE','Default '+key+' required');if(ctx.canvas?.getAttribute?.('lang')||typeof getComputedStyle==='function'&&getComputedStyle(ctx.canvas).direction==='rtl')fail('UNSUPPORTED_TEXT_STATE','Default canvas language/direction required');};
A.itemGeometry = (it,parent=ID,env={pass:'main',scale:1},options={}) => {
  A.affine(parent);if(env.ctx)validateTextState(env.ctx);
  for(const k of ['pieceFn','blur','shadow','extrude','pattern'])if(it[k])fail('UNSUPPORTED_ITEM',k+' requires a bounded adapter');
  const ctx=measurementContext(), lay=J.layoutText(it), sx=it.sx||1,sy=it.sy||1;
  if(lay.length>MAX_GLYPHS)fail('GEOMETRY_LIMIT','Glyph limit exceeded');
  const im=compose(parent,trans(it.x,it.y),rotate(it.rot||0),shear(it.skew||0));A.affine(im);
  const polygons=[],glyphs=[];
  for(const g of lay){
    const c=it.charFn?it.charFn(g.i,g,lay.N):null;
    if(c?.hide||!g.ch.trim()||(it.alpha??1)*(c?.a??1)*(env.pass!=='main'?(it.ghostAlpha??1):1)<=.002)continue;
    if(c?.blur)fail('UNSUPPORTED_ITEM','Per-character blur');
    const ch=c?.ch||g.ch,cs=c?.s??1,csx=sx*cs*(c?.sx||1),csy=sy*cs*(c?.sy||1);
    const gm=compose(im,trans(g.x*sx+g.vx*sx+(c?.dx||0),g.y*sy+g.vy*sy+(c?.dy||0)),rotate((c?.rot||0)+(g.r90?90:0)),shear(c?.skew||0),scale(csx,csy));A.affine(gm);
    const font=J.fontCSS(it.font,it.size,ch);ctx.textAlign='center';ctx.textBaseline='middle';
    const m=inkMetric(ctx,font,ch),pad=(it.stroke>0?it.stroke:((c?.outline||it.dash!=null)?Math.max(1,it.size*.02):0))/Math.sqrt(Math.abs(csx*csy))/2+1;
    const vals=[m.actualBoundingBoxLeft,m.actualBoundingBoxRight,m.actualBoundingBoxAscent,m.actualBoundingBoxDescent,pad];
    if(!finite(vals))fail('UNMEASURED_INK','TextMetrics actual ink unavailable');
    // One font-space pixel guards font-grid/metrics rounding. Two device pixels
    // cover raster grid fitting plus edge coverage at the alpha threshold.
    A.inverse(gm);
    const inkPolygon=rect(-vals[0]-pad,-vals[2]-pad,vals[0]+vals[1]+pad*2,vals[2]+vals[3]+pad*2).map(p=>A.point(gm,p));
    // Owned-text validation consumes this exact un-clipped ink, not raster
    // AA. At ordinary coordinates the omitted +/-2 hull is necessarily finite
    // and nondegenerate. Uncertain coordinates retain the complete operation.
    const p=options.validationOnly&&inkPolygon.every(q=>q.every(v=>Number.isFinite(v)&&Math.abs(v)<=1e7))?inkPolygon:A.convexHull(inkPolygon.flatMap(q=>[[q[0]-2,q[1]-2],[q[0]+2,q[1]-2],[q[0]+2,q[1]+2],[q[0]-2,q[1]+2]]));
    polygons.push(p);glyphs.push({index:g.i,ch,font,matrix:gm,inkPolygon,polygon:p});
  }
  return {polygons,glyphs,inkPolygons:glyphs.map(g=>g.inkPolygon),...(options.validationOnly?{validationOnly:true,measurement:'validation-only un-clipped TextMetrics ink; not a geometry certificate'}:{measurement:'actual TextMetrics + stroke + one font-space pixel + two device-pixel raster guard'})};
};
/* Future piece adapter must supply final ink polygons, not untransformed glyph centers. */
A.pieceGeometry = (polygons,parent=ID) => {A.affine(parent);A.bounds(polygons);return polygons.map(p=>p.map(v=>A.point(parent,v)));};
A.withRole = (env,role,owner,fn) => {if(!['primary','tiledAux','independentDecor'].includes(role))fail('INVALID_ROLE','Unknown draw ownership');const prior=env.drawOwnership;env.drawOwnership={role,owner:String(owner)};try{return fn();}finally{env.drawOwnership=prior;}};
function snapshotItem(it){const copy={...it};delete copy._lay;delete copy._m;delete copy.charFns;delete copy.pieceFns;delete copy.pre;delete copy.post;return copy;}
function recordedItemBounds(it){const lay=J.layoutText(it),boxes=[];for(const g of lay){const v=it.charFn?it.charFn(g.i,g,lay.N):null;if(!g.ch.trim()||v?.hide||(it.alpha??1)*(v?.a??1)<=.002)continue;const cs=v?.s??1;boxes.push({x:g.x*(it.sx||1)+g.vx*(it.sx||1)+(v?.dx||0),y:g.y*(it.sy||1)+g.vy*(it.sy||1)+(v?.dy||0),w:g.w*(it.sx||1)*cs,h:g.h*(it.sy||1)*cs});}if(!boxes.length)return null;return {x0:it.x+Math.min(...boxes.map(b=>b.x-b.w/2)),x1:it.x+Math.max(...boxes.map(b=>b.x+b.w/2)),y0:it.y+Math.min(...boxes.map(b=>b.y-b.h/2)),y1:it.y+Math.max(...boxes.map(b=>b.y+b.h/2)),cx:it.x,cy:it.y,boxes};}
A.record = (renderer,env,options={}) => {
  // Validation prepasses are never geometry certificates or replay programs.
  const validationOnly=options.validationOnly===true;let shapeValidationUncertain=false;
  validateTextState(env.ctx);
  if(env.ctx.filter!=='none'||env.ctx.shadowBlur||env.ctx.shadowOffsetX||env.ctx.shadowOffsetY||!['rgba(0, 0, 0, 0)','transparent'].includes(env.ctx.shadowColor))fail('UNSUPPORTED_DRAW_PROGRAM','Initial filter/shadow state requires a bounded adapter');
  const c=measurementContext();c.reset();c.setTransform(...matrix(env.ctx));c.globalCompositeOperation=env.ctx.globalCompositeOperation;c.globalAlpha=env.ctx.globalAlpha;c.miterLimit=env.ctx.miterLimit;c.setLineDash(env.ctx.getLineDash());c.lineDashOffset=env.ctx.lineDashOffset;c.lineCap=env.ctx.lineCap;c.lineJoin=env.ctx.lineJoin;
  const nativeA26=env.cut.placementLayoutsA===true;let nativeRoot=nativeA26?matrix(c):null,nativeOps=[];const nativeStack=[],nativeState=()=>({root:nativeRoot.slice(),ops:nativeOps.map(([k,v])=>[k,v.slice()])});
  const events=[],diagnostics=[],gradients=new WeakMap();let recorder,glyphCount=0,clips=[],pathRect=null,pathInvalid=false,pathPoints=[],pathClosed=false,pathMatrix=null;const clipStack=[];
  const budget=env.placementBudget?(validationOnly?{...env.placementBudget}:env.placementBudget):{events:0,glyphs:0};
  const push=(kind,args,polygons,knownMatrix)=>{if(++budget.events>MAX_EVENTS)fail('GEOMETRY_LIMIT','Frame draw event ceiling exceeded');if(events.length>=MAX_EVENTS)fail('GEOMETRY_LIMIT','Draw event ceiling exceeded');const ownership=recorder.drawOwnership||{role:'primary',owner:'cut:'+env.cut.index};if(env.placementEnvelope&&recorder.placementBounds)polygons=[recorder.placementBounds];const m=knownMatrix||matrix(c);A.affine(m);if(polygons.length)A.bounds(polygons);events.push({...(nativeA26?{nativeTransform:nativeState(),nativeSweep:recorder.layoutASweep?jsonClone(recorder.layoutASweep):null}:{}),...(recorder.layoutAMotion?{nativeMotion:recorder.layoutAMotion}:{}),kind,args:args.map(v=>v&&typeof v==='object'&&gradients.has(v)?gradients.get(v):v),clips:clips.map(v=>({...v})),matrix:m,polygons,key:kind==='item'&&args[0].placementRouteKey||ownership.owner,role:ownership.role,owner:ownership.owner,blend:c.globalCompositeOperation,alpha:c.globalAlpha,state:{lineCap:c.lineCap,lineJoin:c.lineJoin,miterLimit:c.miterLimit,dash:c.getLineDash(),dashOffset:c.lineDashOffset},order:events.length});};
  const proxy=new Proxy(c,{get(target,k){
    if(k==='save')return ()=>{clipStack.push(clips.slice());if(nativeA26)nativeStack.push(nativeState());target.save();};
    if(k==='restore')return ()=>{clips=clipStack.pop()||[];const state=nativeA26?nativeStack.pop():null;if(state){nativeRoot=state.root;nativeOps=state.ops;}target.restore();};
    if(env.cut.placementLayoutsA&&['translate','rotate','scale','transform'].includes(k))return (...args)=>{if(!finite(args))fail('INVALID_AFFINE','Finite native transform required');target[k](...args);nativeOps.push([k,args]);};
    if(env.cut.placementLayoutsA&&['setTransform','resetTransform'].includes(k))return (...args)=>{target[k](...args);nativeRoot=matrix(c);nativeOps=[];};
    if(k==='beginPath')return ()=>{pathRect=null;pathInvalid=false;pathPoints=[];pathClosed=false;pathMatrix=null;target.beginPath();};
    if(k==='rect')return (...args)=>{if(args.length!==4||!finite(args))fail('INVALID_GEOMETRY','Finite rectangular clip path required');if(pathRect||pathPoints.length)pathInvalid=true;pathRect={args,matrix:matrix(c),...(nativeA26?{nativeTransform:nativeState()}:{})};target.rect(...args);};
    if(env.cut.placementLayoutsA&&['moveTo','lineTo','closePath'].includes(k))return (...args)=>{if(k==='closePath')pathClosed=true;else {const m=matrix(c);if(!pathMatrix)pathMatrix=m;if(pathRect||!finite(args)||args.length!==2||k==='moveTo'&&pathPoints.length||m.some((v,i)=>v!==pathMatrix[i]))pathInvalid=true;pathPoints.push(args);}return target[k](...args);};
    if(env.cut.placementLayoutsA&&k==='fill')return (...args)=>{if(args.length||pathInvalid||pathPoints.length<3||!pathClosed||matrix(c).some((v,i)=>v!==pathMatrix[i])||typeof target.fillStyle!=='string')fail('UNSUPPORTED_DRAW_PROGRAM','Only finite native polygon fills with solid paint are supported');const m=matrix(c),polygon=pathPoints.map(p=>A.point(m,p)),guard=A.convexHull(polygon.flatMap(p=>[[p[0]-1,p[1]-1],[p[0]+1,p[1]-1],[p[0]+1,p[1]+1],[p[0]-1,p[1]+1]]));push('nativePolygon',[pathPoints.map(p=>p.slice()),target.fillStyle],[guard]);};
    if(env.cut.placementLayoutsA&&k==='fillText')return (value,x,y,...rest)=>{if(rest.length||!finite([x,y])||typeof target.fillStyle!=='string')fail('UNSUPPORTED_DRAW_PROGRAM','Only finite native fastRow solid text is supported');const text=String(value),count=[...text].length;glyphCount+=count;budget.glyphs+=count;if(glyphCount>MAX_GLYPHS||budget.glyphs>MAX_GLYPHS)fail('GEOMETRY_LIMIT','Native text glyph ceiling exceeded');for(const key of Object.keys(textDefaults))if(key!=='letterSpacing'&&key in target&&!defaultTextValue(key,target[key]))fail('UNSUPPORTED_TEXT_STATE','Default '+key+' required');if(target.letterSpacing!==''&&(!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)px$/.test(target.letterSpacing)||!Number.isFinite(parseFloat(target.letterSpacing))))fail('UNSUPPORTED_TEXT_STATE','Finite pixel letterSpacing required: '+String(target.letterSpacing));const m=matrix(c),tm=target.measureText(text),pad=1;const ink=rect(x-tm.actualBoundingBoxLeft-pad,y-tm.actualBoundingBoxAscent-pad,tm.actualBoundingBoxLeft+tm.actualBoundingBoxRight+2*pad,tm.actualBoundingBoxAscent+tm.actualBoundingBoxDescent+2*pad).map(p=>A.point(m,p)),polygon=A.convexHull(ink.flatMap(p=>[[p[0]-2,p[1]-2],[p[0]+2,p[1]-2],[p[0]+2,p[1]+2],[p[0]-2,p[1]+2]]));push('nativeText',[text,x,y,{font:target.font,letterSpacing:target.letterSpacing,textAlign:target.textAlign,textBaseline:target.textBaseline,fillStyle:target.fillStyle}],[polygon]);};
    if(['arc','arcTo','ellipse','moveTo','lineTo','bezierCurveTo','quadraticCurveTo','closePath','roundRect'].includes(k))return (...args)=>{pathInvalid=true;return target[k](...args);};
    if(k==='clip')return (...args)=>{if(env.cut.placementLayoutsA&&!args.length&&!pathInvalid&&pathPoints.length>=3&&pathClosed&&matrix(c).every((v,i)=>v===pathMatrix[i])){clips.push({points:pathPoints.map(p=>p.slice()),matrix:matrix(c),nativeTransform:nativeState(),worldFixed:env.cut.layout==='splitScreen'});return;}if(!env.cut.placementUnits||args.length||!pathRect||pathInvalid)fail('UNSUPPORTED_DRAW_PROGRAM','Only argument-free single owned rectangular clips are adapted');clips.push(pathRect);};
    if(k==='createLinearGradient')return (...args)=>{const paint=target.createLinearGradient(...args),stops=[],entry={placementGradient:true,args,matrix:matrix(c),stops};gradients.set(paint,entry);const add=paint.addColorStop.bind(paint);paint.addColorStop=(...stop)=>{stops.push(stop);add(...stop);};return paint;};
    if(k==='fillRect')return (x,y,w,h)=>{if(!finite([x,y,w,h]))fail('INVALID_GEOMETRY','Finite rectangle required');if(!w||!h)return;const m=matrix(c),inv=A.inverse(m),aaX=Math.abs(inv[0])+Math.abs(inv[2]),aaY=Math.abs(inv[1])+Math.abs(inv[3]);push('rect',[x,y,w,h,target.fillStyle],[rect(Math.min(x,x+w)-aaX,Math.min(y,y+h)-aaY,Math.abs(w)+2*aaX,Math.abs(h)+2*aaY).map(p=>A.point(m,p))]);};if(['fill','stroke','fillText','strokeText','drawImage','putImageData','clearRect'].includes(k))return ()=>fail('UNSUPPORTED_DRAW_PROGRAM','Unadapted Canvas operation '+k);const v=target[k];return typeof v==='function'?v.bind(target):v;},set(target,k,v){if(textDefaults[k]&&!defaultTextValue(k,v)&&!(env.cut.placementLayoutsA&&k==='letterSpacing'&&/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)px$/.test(String(v))&&Number.isFinite(parseFloat(v))))fail('UNSUPPORTED_TEXT_STATE','Default '+k+' required');if((['shadowBlur','shadowOffsetX','shadowOffsetY'].includes(k)&&v!==0)||(k==='shadowColor'&&!['rgba(0, 0, 0, 0)','transparent'].includes(v)))fail('UNSUPPORTED_DRAW_PROGRAM','Unbounded shape shadow');if(k==='filter'&&v!=='none')fail('UNSUPPORTED_DRAW_PROGRAM','Spatial filter');target[k]=v;return true;}});
  recorder=renderer.makeEnv(proxy,env.plan,env.cut,env.sc,{...env,ctx:proxy,placementRecording:true});
  if(env.placementEnvelope){recorder.pIn=1;recorder.pOut=0;}
  recorder.placementRecorder={item(it){const count=[...String(it.text||'')].length;glyphCount+=count;budget.glyphs+=count;if(budget.glyphs>MAX_GLYPHS)fail('GEOMETRY_LIMIT','Frame glyph ceiling exceeded');if(glyphCount>MAX_GLYPHS)fail('GEOMETRY_LIMIT','Program glyph ceiling exceeded');if(env.pass!=='main'&&it.ghost===false)return null;if(env.cut.placementUnits&&recorder.drawOwnership?.role==='tiledAux'&&!it.charFn){for(const key of ['pieceFn','blur','shadow','extrude','pattern'])if(it[key])fail('UNSUPPORTED_ITEM',key+' requires a bounded adapter');if(!finite([it.x,it.y,it.size,it.sx??1,it.sy??1,it.rot??0,it.skew??0,it.track??0,it.lead??1.3]))fail('UNMEASURED_INK','Finite auxiliary text geometry required');push('item',[snapshotItem(it)],[]);return recordedItemBounds(it);}let ink=A.itemGeometry(it,matrix(c),env,{validationOnly});if(env.placementEnvelope&&it.placementSweep){const sweep=it.placementSweep,local=A.itemGeometry({...it,x:0,y:0,rot:0},ID,env).polygons;const b=A.bounds(local);ink={...ink,polygons:[rect(sweep.x0+b.x0,sweep.y0+b.y0,sweep.x1-sweep.x0+b.x1-b.x0,sweep.y1-sweep.y0+b.y1-b.y0)]};}if(env.cut.placementGlyphs&&it.placementMain){for(const glyph of ink.glyphs){const copy=snapshotItem(it);copy.placementGlyphIndex=glyph.index;copy.placementRouteKey='huge.main.glyph.'+glyph.index;push('item',[copy],[glyph.polygon]);const event=events.at(-1);event.owner=copy.placementRouteKey;event.anchor=[glyph.matrix[4],glyph.matrix[5]];event.inkPolygons=[glyph.inkPolygon];}}else{push('item',[snapshotItem(it)],ink.polygons);events.at(-1).inkPolygons=ink.inkPolygons;}return recordedItemBounds(it);}};
  recorder.withDrawRole=(role,owner,fn)=>A.withRole(recorder,role,owner,fn);
  recorder.withPlacementBounds=(bounds,fn)=>{const previous=recorder.placementBounds;recorder.placementBounds=bounds;try{return fn();}finally{recorder.placementBounds=previous;}};
  // High-level shape adapters preserve the original operation and painter order.
  for(const name of ['circle','arc','rrect'])recorder[name]=(...args)=>{
    let x,y,w,h,pad=0;
    if(name==='circle'||name==='arc'){const [cx,cy,r]=args;if(r<=0)return;const lw=name==='circle'?(args[4]?args[5]??1:0):args[6]??1;pad+=lw/2;x=cx-r;y=cy-r;w=h=2*r;}
    else { [x,y,w,h]=args;if(w<=0||h<=0)return;pad+=(args[8]?args[9]??1:0)/2; }
    const alpha=name==='circle'?args[6]??1:name==='arc'?args[7]??1:args[6]??1,ghost=name==='circle'?args[7]??true:name==='arc'?args[8]??true:args[7]??true;
    if(alpha<=0||env.pass!=='main'&&!ghost)return;
    const m=matrix(c);A.affine(m);let local;
    if(validationOnly){
      // Finite scalar/affine guards keep malformed shapes on the full recorder
      // path, which supplies its original diagnostic before any owned failure.
      // Only ordinary well-conditioned recipe coordinates may omit hull arithmetic.
      const radius=name==='rrect'?Math.min(args[4],w/2,h/2):args[2];
      const linearNorm=Math.hypot(...m.slice(0,4)),det=Math.abs(m[0]*m[3]-m[1]*m[2]);
      // Admit only ordinary native recipe coordinates. This deliberately falls
      // back for huge-origin/tiny-shape rounding, nearly singular transforms,
      // unusual angular tables and negative stroke extents rather than trying
      // to infer whether the omitted floating-point hull would degenerate.
      if(!finite([x,y,w,h,pad,radius])||radius<0||pad<0||J.TAU!==Math.PI*2||
         Math.max(Math.abs(x),Math.abs(y),w,h,pad,radius)>1e5||Math.min(w,h)<.01||
         linearNorm>100||det/linearNorm<.01||Math.max(Math.abs(m[4]),Math.abs(m[5]))>1e6)shapeValidationUncertain=true;
      push(name,args,[],m);return;
    }
    if(name==='circle'||name==='arc'){
      const [cx,cy,r]=args,N=64,outer=c.lineCap==='square'&&(name==='arc'||c.getLineDash().length)?Math.hypot(r+pad,pad):r+pad,radius=outer/Math.cos(Math.PI/N);
      local=shapeUnitCircle(N).map(v=>[cx+radius*v[0],cy+radius*v[1]]);
    }else{
      const r=Math.min(args[4],w/2,h/2);if(!Number.isFinite(r)||r<0)fail('INVALID_GEOMETRY','Finite nonnegative rounded rectangle radius required');
      const N=32,capPad=c.lineCap==='square'&&c.getLineDash().length?Math.SQRT2*pad:pad,radius=(r+capPad)/Math.cos(Math.PI/N),corners=[[x+r,y+r],[x+w-r,y+r],[x+w-r,y+h-r],[x+r,y+h-r]];
      local=r===0?rect(x-pad,y-pad,w+2*pad,h+2*pad):roundedRectHull(corners,radius);
    }
    // The circumscribed local polygon contains the complete curved shape and
    // stroke. Device-axis Minkowski padding covers one pixel of raster AA even
    // under tiny/nonuniform/sheared affine transforms.
    const polygon=A.convexHull(local.flatMap(p=>{const q=A.point(m,p);return [[q[0]-1,q[1]-1],[q[0]+1,q[1]-1],[q[0]+1,q[1]+1],[q[0]-1,q[1]+1]];}));
    push(name,args,[polygon],m);
  };
  if(env.cut.placementLayoutsA)recorder.blob=(pts,color,alpha=1,ghost=true)=>{if(alpha<=0||env.pass!=='main'&&!ghost)return;if(pts.length<3)fail('INVALID_GEOMETRY','Native blob requires three control points');const m=matrix(c),polygon=A.convexHull(pts.flatMap(p=>{const q=A.point(m,p);return [[q[0]-1,q[1]-1],[q[0]+1,q[1]-1],[q[0]+1,q[1]+1],[q[0]-1,q[1]+1]];}));push('blob',[pts,color,alpha,ghost],[polygon]);};
  recorder.line=(pts,color,lw=1,alpha=1,ghost=true)=>{if(env.pass!=='main'){if(!ghost)return;color=env.passColor;}if(!color||alpha<=0||pts.length<2)return;const ps=pts.map(p=>A.point(matrix(c),p)),pad=lw*Math.hypot(c.getTransform().a,c.getTransform().b,c.getTransform().c,c.getTransform().d)/2*(env.cut.placementLayoutsA?Math.max(1,...pts.slice(1,-1).map((p,i)=>{const a=pts[i],b=pts[i+2],ax=a[0]-p[0],ay=a[1]-p[1],bx=b[0]-p[0],by=b[1]-p[1],len=Math.hypot(ax,ay)*Math.hypot(bx,by);if(!len)return 1;const ratio=1/Math.sqrt(Math.max(1e-12,(1-(ax*bx+ay*by)/len)/2));return ratio>c.miterLimit?1:ratio;})):(pts.length>2?c.miterLimit:1))+1;const b={x0:Math.min(...ps.map(p=>p[0])),y0:Math.min(...ps.map(p=>p[1])),x1:Math.max(...ps.map(p=>p[0])),y1:Math.max(...ps.map(p=>p[1]))};c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=lw;c.lineJoin='miter';c.lineCap='butt';push('line',[pts,color,lw,alpha,{miterLimit:c.miterLimit,dash:c.getLineDash(),dashOffset:c.lineDashOffset}],[rect(b.x0-pad,b.y0-pad,b.x1-b.x0+pad*2,b.y1-b.y0+pad*2)]);c.globalAlpha=1;};
  try{renderer.drawCut(recorder);}catch(e){diagnostics.push({code:e.code||'DRAW_PROGRAM_ERROR',message:e.message});}
  return {events,diagnostics,measurementSupported:!validationOnly&&diagnostics.length===0,...(validationOnly?{validationOnly:true,validationSupported:diagnostics.length===0&&!shapeValidationUncertain}:{})};
};
const applyNativeTransform=(ctx,shift,state,fallback)=>{ctx.setTransform(...compose(shift,state?.root||fallback));if(state)for(const [key,args]of state.ops)ctx[key](...args);};
A.replay = (env,program,offset,decorOffsets={}) => {
  if(program.validationOnly||!program.measurementSupported)fail('UNSUPPORTED_DRAW_PROGRAM','Refusing incomplete draw program');
  for(const e of program.events){const moved=e.role==='primary'?(Array.isArray(offset)?offset:offset[e.key??e.owner]||[0,0]):decorOffsets[e.key??e.owner]||[0,0];const ctx=env.ctx;ctx.save();try{const shift=trans(moved[0]*(env.scale||1),moved[1]*(env.scale||1));for(const clip of e.clips||[]){applyNativeTransform(ctx,clip.worldFixed?ID:shift,clip.nativeTransform,clip.matrix);ctx.beginPath();if(clip.points){clip.points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();}else ctx.rect(...clip.args);ctx.clip();}applyNativeTransform(ctx,shift,e.nativeTransform,e.matrix);const eventArgs=e.args.map(v=>{if(!v?.placementGradient)return v;ctx.save();ctx.setTransform(...compose(shift,v.matrix));const gradient=ctx.createLinearGradient(...v.args);for(const stop of v.stops)gradient.addColorStop(...stop);ctx.restore();return gradient;});ctx.globalCompositeOperation=e.blend;ctx.globalAlpha=e.alpha;ctx.lineCap=e.state.lineCap;ctx.lineJoin=e.state.lineJoin;ctx.miterLimit=e.state.miterLimit;ctx.setLineDash(e.state.dash);ctx.lineDashOffset=e.state.dashOffset;
    if(e.kind==='nativePolygon'){ctx.fillStyle=eventArgs[1];ctx.beginPath();eventArgs[0].forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();}
    else if(e.kind==='nativeText'){Object.assign(ctx,eventArgs[3]);ctx.fillText(...eventArgs.slice(0,3));}
    else if(e.kind==='item'){let it=e.args[0];if(it.placementGlyphIndex!=null){it={...it};const full=J.layoutText(it),one=full.filter(g=>g.i===it.placementGlyphIndex);Object.assign(one,{N:full.N,W:full.W,H:full.H});it._lay=one;}J.drawItem({...env,placementRecorder:null},it);}
    else if(e.kind==='rect'){ctx.fillStyle=eventArgs[4];ctx.fillRect(...eventArgs.slice(0,4));}
    else if(['circle','arc','rrect','blob'].includes(e.kind))env[e.kind](...eventArgs);
    else if(e.kind==='line'){const [pts,col,lw,a,state]=e.args;ctx.globalAlpha=a;ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.lineJoin='miter';ctx.lineCap='butt';ctx.miterLimit=state.miterLimit;ctx.setLineDash(state.dash);ctx.lineDashOffset=state.dashOffset;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();}
    else fail('UNSUPPORTED_DRAW_PROGRAM','Unknown recorded draw kind '+e.kind);
  }finally{ctx.restore();}}
};
// A strict axis gap can only reject work when floating-point edge evaluation
// remains far from the circle. Unusual numeric ranges retain the original loop.
function circleAxisSeparated(box,circle,R){
 const magnitude=Math.max(Math.abs(box.x0),Math.abs(box.x1),Math.abs(box.y0),Math.abs(box.y1),Math.abs(circle.cx),Math.abs(circle.cy),Math.abs(R));
 if(!Number.isFinite(magnitude)||magnitude>1e7)return false;
 const guard=64*Number.EPSILON*(1+magnitude),limit=R+guard;
 return box.x0-circle.cx>limit||circle.cx-box.x1>limit||box.y0-circle.cy>limit||circle.cy-box.y1>limit;
}
A.clear = (polygons,circle,margin=0) => {
  const allBounds=A.bounds(polygons);if(!Number.isFinite(margin)||margin<0)fail('INVALID_GEOMETRY','Invalid margin');if(!circle)return true;if(!finite([circle.cx,circle.cy,circle.r])||circle.r<0)fail('INVALID_GEOMETRY','Invalid circle');const c=[circle.cx,circle.cy],R=circle.r+margin;
  if(circleAxisSeparated(allBounds,circle,R))return true;
  for(const ps of polygons){if(ps.length>8&&circleAxisSeparated(A.bounds([ps]),circle,R))continue;let inside=false;for(let i=0,j=ps.length-1;i<ps.length;j=i++) {const a=ps[j],b=ps[i],dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy,u=l?J.clamp(((c[0]-a[0])*dx+(c[1]-a[1])*dy)/l):0;if(Math.hypot(c[0]-a[0]-u*dx,c[1]-a[1]-u*dy)<=R)return false;if((a[1]>c[1])!==(b[1]>c[1])&&c[0]<(b[0]-a[0])*(c[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}if(inside)return false;}return true;
};
/* A linear translation sweeps each convex ink polygon into its endpoint hull.
   This conservative AABB certificate covers the entire interval, including middle collisions. */
A.certifySegment = (polygons,from,to,circle,margin=0) => {const b=A.bounds(polygons.flatMap(p=>[p.map(v=>[v[0]+from[0],v[1]+from[1]]),p.map(v=>[v[0]+to[0],v[1]+to[1]])]));return A.clear([rect(b.x0,b.y0,b.x1-b.x0,b.y1-b.y0)],circle,margin);};
A.solve = (polygons,circle,W,H) => {
  if(!finite([W,H])||W<=0||H<=0)fail('INVALID_GEOMETRY','Positive finite stage required');
  const b=A.bounds(polygons),margin=Math.max(2,.005*Math.min(W,H)),eps=1e-4;
  const fits=d=>b.x0+d[0]>=0&&b.y0+d[1]>=0&&b.x1+d[0]<=W&&b.y1+d[1]<=H;
  const shift=d=>polygons.map(p=>p.map(v=>[v[0]+d[0],v[1]+d[1]]));
  const candidates=[[0,0]];if(circle){const r=circle.r+margin+eps;candidates.push([circle.cx-r-b.x1,0],[circle.cx+r-b.x0,0]);if(circle.cy/H>=.45)candidates.push([0,circle.cy-r-b.y1]);if(circle.cy/H<=.55)candidates.push([0,circle.cy+r-b.y0]);}
  candidates.sort((a,b)=>Math.hypot(...a)-Math.hypot(...b));
  for(const d of candidates)if(fits(d)&&(!circle||A.clear(shift(d),circle,margin)))return {offset:d,status:'safe',margin};
  return {offset:[0,0],status:'insufficient-space',margin};
};
const signature=plan=>{const source={...plan};delete source.placementFinalization;source.cuts=plan.cuts.map(c=>{const n={...c};delete n.placementTrajectory;delete n.fullStagePlacement;delete n.placementUnits;delete n.placementGlyphs;delete n.placementLayoutsA;delete n.placementAdaptiveTrial;delete n.layoutARecipe;delete n.layoutAHoldRange;delete n.placementSelectionOrigin;return n;});return JSON.stringify(source);};
A.planSignature=signature;
const finalized=new WeakMap(),requests=new WeakMap(),sources=new WeakMap();
const oldPlan=J.plan;
J.plan=function(project,...args){const plan=oldPlan(project,...args),intrinsicScales={};for(const c of plan.cuts){const scale=J.areaIntrinsicScales?.get(c);if(c.suppressed&&scale!=null&&c.area&&c.areaMode==='auto'){intrinsicScales[c.index]={observed:c.contentScale,scale};}}sources.set(plan,{locked:plan.cuts.filter(c=>project.overrides?.[c.line]?.lock).map(c=>c.index),intrinsicScales,layoutOrigins:Object.fromEntries(plan.cuts.map(c=>[c.index,{layout:c.layout,kind:project.overrides?.[c.line]?.layout||Object.hasOwn(project.lyricCutOptions?.[`${c.line}:${c.part}`]?.details||{},'layout')?'explicit':'automatic'}])),explicitSizes:plan.cuts.filter(c=>c.lyricSize!=null||Object.hasOwn(project.lyricCutOptions?.[`${c.line}:${c.part}`]?.details||{},'contentScale')).map(c=>c.index)});return plan;};
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const jsonClone=v=>JSON.parse(JSON.stringify(v));
/* Final composition and font loading must precede this detached, idempotent operation.
   No automatic media-duration inference and no render-time repair of stale plans. */
J.finalizePlacementPlan = (input,options={}) => {
  const prior=finalized.get(input), sig=signature(input),revision=J.metrics.revision||0,optionsCacheable=options.layoutsA!==true||A.layoutsAOptionsFinite(options);
  if(optionsCacheable&&prior?.signature===sig&&prior.revision===revision&&prior.options===JSON.stringify(options))return input;
  if(!Number.isFinite(input.duration))fail('FINAL_DURATION_REQUIRED','Final composed duration required');
  if(!sources.has(input))fail('SOURCE_PLAN_REQUIRED','Finalize an actual composed J.plan result; serialized clones require replanning from project');
  const lineage=sources.get(input),plan=jsonClone(input);delete plan.placementFinalization;
  if(lineage.originalCuts)plan.cuts=jsonClone(lineage.originalCuts);
  const originalCuts=jsonClone(plan.cuts);
  const diagnostics=[],stepDur=J.stepDur(plan.fx,plan.fps),maxSupportedTransDur=.6,maxStep=1;
  // All frame passes share the effectCut's style/FX/clock. Reject mixed unsupported state once.
  const unsupportedPlanFX=!(Number.isFinite(stepDur)&&stepDur>0&&stepDur<=maxStep)||plan.cuts.some(c=>c.effectStyle||c.effectFx||c.trans&&c.trans!=='none'&&(c.trans!=='wipe'||!Number.isFinite(c.transDur??.35)||(c.transDur??.35)<0||(c.transDur??.35)>maxSupportedTransDur))||(plan.events||[]).some(e=>!['chroma','shake'].includes(e.type))||plan.style?.glow!==0;
  // Root quantization + recursive previous-frame quantization, one maximum ghost lag,
  // transition duration, permitted cut gap and previous-rest-frame/rounding allowance.
  const reachTail=maxSupportedTransDur+2*stepDur+1.6/24+.06+.01;
  for(const cut of plan.cuts){
    const original=jsonClone(cut);
    delete cut.fullStagePlacement;delete cut.placementTrajectory;delete cut.placementUnits;delete cut.placementGlyphs;delete cut.placementLayoutsA;delete cut.placementAdaptiveTrial;delete cut.layoutARecipe;delete cut.layoutAHoldRange;delete cut.placementSelectionOrigin;
    if(options.cutIndices&&!options.cutIndices.includes(cut.index))continue;
    if(plan.lyricAvoidanceIndex?.enabled!==true||sources.get(input)?.locked.includes(cut.index)||['manual','notation'].includes(cut.areaMode)||cut.placementLocked||cut.emphasis){diagnostics.push({cut:cut.index,code:'PRESERVED_LEGACY',safety:'not-evaluated'});continue;}
    if(!(A.basicLayouts.includes(cut.layout)||options.layoutsA===true&&A.layoutsA26?.includes(cut.layout))||!['cut'].includes(cut.enter)||!['cut'].includes(cut.exit)||(cut.groupExit??cut.exit)!=='cut'||cut.hold!=='still'||(cut.decor||[]).length||!['none','marker'].includes(cut.treat||'none')||!['push','panL','panR','dutch'].includes(cut.cam)||cut.drawing||cut.effectsOnly||J.activeMask?.(cut)){diagnostics.push({cut:cut.index,code:'UNSUPPORTED_ADAPTER',safety:'unsupported'});continue;}
    const fxCheck=cut.effectFx||plan.fx,stCheck=cut.effectStyle||plan.style,numbers=[plan.W,plan.H,cut.contentScale??1,cut.motionScale??1,fxCheck.motion??.7,fxCheck.chroma??.7,stCheck.ghost??1,cut.camP?.a??.022,cut.camP?.dir??1];
    if(!finite(numbers)||plan.W<=0||plan.H<=0||(cut.contentScale??1)<=0||(cut.motionScale??1)<0||(cut.motionScale??1)>1||(fxCheck.motion??.7)<0||(fxCheck.motion??.7)>1||(fxCheck.chroma??.7)<0||(stCheck.ghost??1)<0||(cut.camP?.a??0)<0||Math.abs(cut.camP?.dir??1)>1||(plan.events||[]).some(e=>!finite([e.t,e.amp])||e.amp<0)){diagnostics.push({cut:cut.index,code:'UNSUPPORTED_PARAMETER_RANGE',safety:'unsupported'});continue;}
    if(options.basicLayouts!==true&&!(options.layoutsA===true&&A.layoutsA26?.includes(cut.layout))&&!['center','tile'].includes(cut.layout)){diagnostics.push({cut:cut.index,code:'UNSUPPORTED_ADAPTER',safety:'unsupported'});continue;}
    if(unsupportedPlanFX){diagnostics.push({cut:cut.index,code:'UNSUPPORTED_POST_FX',safety:'unsupported'});continue;}
    const L=J.LAYOUTS[cut.layout],intrinsic=lineage.intrinsicScales?.[cut.index];if((options.basicLayouts===true||options.layoutsA===true&&A.layoutsA26?.includes(cut.layout))&&cut.area&&cut.areaMode==='auto'&&intrinsic&&cut.contentScale===intrinsic.observed)cut.contentScale=intrinsic.scale;cut.area=null;cut.fullStagePlacement=true;
    const fresh=L.plan(J.rng(J.h(cut.seed,318)),{text:cut.text,n:[...cut.text.replace(/\s/g,'')].length,W:plan.W,H:plan.H,dur:cut.dur},cut.effectStyle||plan.style);
    // These two foundation adapters have no geometry-dependent random fields. Preserve the chosen look.
    cut.params={...fresh,...cut.params};
    Object.assign(cut.params,options.params?.[cut.index]||{});
    if(options.layoutsA===true&&A.layoutsA26?.includes(cut.layout)){A.finalizeLayoutsA(plan,cut,original,diagnostics,{revision,stepDur,reachTail,adaptive:options.layoutsAAdaptive===true,explicitSize:lineage.explicitSizes?.includes(cut.index)||cut.lyricSize!=null,selectionOrigin:lineage.layoutOrigins?.[cut.index]?.layout===cut.layout?lineage.layoutOrigins[cut.index].kind:'unknown'});continue;}
    if(options.basicLayouts===true){A.finalizeBasic(plan,cut,original,diagnostics,{revision,stepDur,reachTail});continue;}
    const renderer=Object.create(J.Renderer.prototype),ctx=measurementContext();ctx.reset();
    const env=renderer.makeEnv(ctx,plan,cut,cut.palette||plan.style.schemes[cut.scheme%plan.style.schemes.length],{pass:'main',t:cut.start+cut.dur/2,realTime:cut.start+cut.dur/2,lt:cut.dur/2,ltb:cut.dur/2,pIn:1,pOut:0,step:0,scale:1,allowFilter:false});env.pIn=1;env.pOut=0;
    const program=A.record(renderer,env),ps=program.events.filter(e=>e.role==='primary').flatMap(e=>e.polygons);
    if(!program.measurementSupported||!ps.length){plan.cuts[plan.cuts.indexOf(cut)]=original;diagnostics.push({cut:cut.index,code:'UNSUPPORTED_MEASUREMENT',details:program.diagnostics,safety:'unsupported'});continue;}
    // Rest geometry is invariant for these adapters (marker grows inside its full rest plate).
    // A rectangular interval envelope covers the supported bounded camera rotation/scale/translation and chroma/shake passes. Twenty stage pixels cover the two-device-pixel glyph raster guard at certified render scales >=0.1.
    const motion=cut.motionScale??1,fx=cut.effectFx||plan.fx,K=J.clamp((fx.motion??.7)*1.25,0,1.25),s=(cut.contentScale??1)*Math.max(1,1+.03*Math.max(K,fx.motion??.7)*motion,1.02);
    const bx=Math.max(...ps.flat().map(p=>Math.abs(p[0]-plan.W/2))),by=Math.max(...ps.flat().map(p=>Math.abs(p[1]-plan.H/2))),sn=cut.cam==='dutch'?Math.sin(5*J.DEG):0;
    const rx=(bx+by*sn)*s+20,ry=(by+bx*sn)*s+20;
    const ev=plan.events||[],chroma=(fx.chroma??.7)*(plan.style.ghost??1)*(1+ev.filter(e=>e.type==='chroma').reduce((a,e)=>a+Math.abs(e.amp),0)+.9),shake=ev.filter(e=>e.type==='shake').reduce((a,e)=>a+Math.abs(e.amp),0);
    const dx=(['panL','panR'].includes(cut.cam)?plan.W*Math.abs(cut.camP?.a||.022)*K:0)*motion+(3.4*chroma+16*shake)*plan.H/1080*motion;
    const dy=(1.9*chroma+11*shake)*plan.H/1080*motion;
    const envelope=rect(plan.W/2-rx-dx,plan.H/2-ry-dy,(rx+dx)*2,(ry+dy)*2);
    const regions=plan.lyricAvoidanceIndex?.regions||[];
    const segments=[],evaluationRange=[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail];
    for(let i=0;i<regions.length;i++){const r=regions[i],end=Math.min(r.end??regions[i+1]?.start??plan.duration,plan.duration);if(r.start>=evaluationRange[1])break;if(end<=evaluationRange[0]||end<=r.start)continue;const circle={cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)},solution=A.solve([envelope],circle,plan.W,plan.H);segments.push({start:r.start,end,from:solution.offset,to:solution.offset,status:solution.status,region:r.id});}
    cut.placementTrajectory={version:1,kind:'piecewise-stage-translation',revision,segments,envelope,evaluationRange,measurementSupported:true,safety:segments.some(s=>s.status!=='safe')?'insufficient-space':'certified-bounded-adapter'};
    diagnostics.push({cut:cut.index,code:'STAGED_ADAPTER',measurement:'supported',safety:cut.placementTrajectory.safety});
  }
  plan.placementFinalization={version:1,revision,diagnostics,duration:plan.duration};
  finalized.set(plan,{signature:signature(plan),revision,options:optionsCacheable?JSON.stringify(options):null});sources.set(plan,{...lineage,originalCuts});return freeze(plan);
};
J.finalizePlacementPlanAsync = async (plan,wait,options={}) => {const token={},sig=signature(plan);requests.set(plan,token);await wait; if(requests.get(plan)!==token||signature(plan)!==sig)fail('STALE_FINALIZATION','A newer request or composed plan superseded this result');return J.finalizePlacementPlan(plan,options);};
A.validateFinal = plan => {const rec=finalized.get(plan);if(!rec||rec.revision!==(J.metrics.revision||0)||!Object.isFrozen(plan))fail('STALE_PLACEMENT_PLAN','Refinalize after font/compose changes');};
A.offsetAt=(trajectory,t)=>{const s=trajectory.segments.find(s=>s.start<=t&&t<s.end);if(!s)return [0,0];const u=(t-s.start)/(s.end-s.start);return [J.lerp(s.from[0],s.to[0],u),J.lerp(s.from[1],s.to[1],u)];};
A.render = (renderer,env) => {
  if(env.cut.placementTrajectory?.kind==='ordered-huge-route')return A.renderHuge(renderer,env);
  if(env.cut.placementTrajectory?.kind==='ordered-wave-route')return A.renderWave(renderer,env);
  if(env.cut.placementTrajectory?.kind==='layouts-a-joint-translation')return A.renderLayoutsA(renderer,env);
  if(env.cut.placementTrajectory?.kind==='owned-unit-translation')return A.renderBasic(renderer,env);
  A.validateFinal(env.plan);if((env.scale||1)<.1||(env.scale||1)>4)fail('UNSUPPORTED_RENDER_SCALE','Staged certified scale range is 0.1 through 4');const program=A.record(renderer,env),offset=A.offsetAt(env.cut.placementTrajectory,env.realTime),scale=env.scale||1;
  const polygons=program.events.filter(e=>e.role==='primary').flatMap(e=>e.polygons).map(p=>p.map(v=>[v[0]/scale+offset[0],v[1]/scale+offset[1]]));
  const resolved=J.resolveAvoidanceAt(env.plan,env.realTime),circle=resolved?J.avoidanceCirclePixels(resolved,env.plan.W,env.plan.H):null;
  const safe=program.measurementSupported&&(!polygons.length||A.clear(polygons,circle,Math.max(2,.005*Math.min(env.W,env.H))));
  if(!program.measurementSupported)fail('UNSUPPORTED_DRAW_PROGRAM',JSON.stringify(program.diagnostics));
  env.placementObservation?.({cut:env.cut.index,realTime:env.realTime,motionTime:env.t,pass:env.pass,offset,measurementSupported:true,safety:safe?'safe':'conflict',events:program.events.map(e=>({kind:e.kind,role:e.role,owner:e.owner,order:e.order,blend:e.blend,polygons:e.polygons})),polygons});
  A.replay(env,program,offset);
};
})();
