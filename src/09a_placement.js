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
A.bounds = polygons => {if(!Array.isArray(polygons)||polygons.some(p=>!Array.isArray(p)||p.length<3||p.some(v=>!Array.isArray(v)||v.length!==2)))fail('UNMEASURED_INK','Invalid polygon');const ps=polygons.flat();if(!ps.length||ps.some(p=>!finite(p)))fail('UNMEASURED_INK','Empty/nonfinite ink');return {x0:Math.min(...ps.map(p=>p[0])),y0:Math.min(...ps.map(p=>p[1])),x1:Math.max(...ps.map(p=>p[0])),y1:Math.max(...ps.map(p=>p[1]))};};
let measureCtx;
const measure=()=>measureCtx||(measureCtx=document.createElement('canvas').getContext('2d'));
A.bufferStats=()=>({contexts:measureCtx?1:0,maxContexts:1,pixels:measureCtx?measureCtx.canvas.width*measureCtx.canvas.height:0,maxPixels:1,perGlyphStageBuffers:0});
function measurementContext(){const c=measure();if(c.canvas.width!==1||c.canvas.height!==1){c.canvas.width=1;c.canvas.height=1;}return c;}
/* Public adapter boundary: same font, center/middle baseline and exact Canvas transform order as drawItem.
   Unsupported effects fail explicitly; returned polygons conservatively include glyph ink + stroke. */
const textDefaults={fontKerning:['auto'],letterSpacing:['0px'],wordSpacing:['0px'],textRendering:['auto'],fontStretch:['normal'],fontVariantCaps:['normal'],direction:['inherit','ltr'],lang:['inherit']};
const defaultTextValue=(key,value)=>['letterSpacing','wordSpacing'].includes(key)?value===''||/^[-+]?0(?:\.0+)?(?:[a-z]+)?$/i.test(String(value).trim()):textDefaults[key].includes(value);
const validateTextState=ctx=>{for(const [key,allowed]of Object.entries(textDefaults))if(key in ctx&&!defaultTextValue(key,ctx[key]))fail('UNSUPPORTED_TEXT_STATE','Default '+key+' required');if(ctx.canvas?.getAttribute?.('lang')||typeof getComputedStyle==='function'&&getComputedStyle(ctx.canvas).direction==='rtl')fail('UNSUPPORTED_TEXT_STATE','Default canvas language/direction required');};
A.itemGeometry = (it,parent=ID,env={pass:'main',scale:1}) => {
  A.affine(parent);if(env.ctx)validateTextState(env.ctx);
  for(const k of ['pieceFn','blur','shadow','extrude','pattern','gradient'])if(it[k])fail('UNSUPPORTED_ITEM',k+' requires a bounded adapter');
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
    ctx.font=J.fontCSS(it.font,it.size,ch);ctx.textAlign='center';ctx.textBaseline='middle';
    const m=ctx.measureText(ch),pad=(it.stroke>0?it.stroke:((c?.outline||it.dash!=null)?Math.max(1,it.size*.02):0))/Math.sqrt(Math.abs(csx*csy))/2;
    const vals=[m.actualBoundingBoxLeft,m.actualBoundingBoxRight,m.actualBoundingBoxAscent,m.actualBoundingBoxDescent,pad];
    if(!finite(vals))fail('UNMEASURED_INK','TextMetrics actual ink unavailable');
    // One device pixel, pulled through the inverse affine, covers Canvas edge antialiasing at the contract alpha threshold.
    const inv=A.inverse(gm),aaX=Math.abs(inv[0])+Math.abs(inv[2]),aaY=Math.abs(inv[1])+Math.abs(inv[3]);
    const p=rect(-vals[0]-pad-aaX,-vals[2]-pad-aaY,vals[0]+vals[1]+pad*2+aaX*2,vals[2]+vals[3]+pad*2+aaY*2).map(p=>A.point(gm,p));
    polygons.push(p);glyphs.push({index:g.i,ch,font:ctx.font,matrix:gm,polygon:p});
  }
  return {polygons,glyphs,measurement:'actual TextMetrics + stroke + inverse-affine one device pixel AA envelope'};
};
/* Future piece adapter must supply final ink polygons, not untransformed glyph centers. */
A.pieceGeometry = (polygons,parent=ID) => {A.affine(parent);A.bounds(polygons);return polygons.map(p=>p.map(v=>A.point(parent,v)));};
A.withRole = (env,role,owner,fn) => {if(!['primary','tiledAux','independentDecor'].includes(role))fail('INVALID_ROLE','Unknown draw ownership');const prior=env.drawOwnership;env.drawOwnership={role,owner:String(owner)};try{return fn();}finally{env.drawOwnership=prior;}};
function snapshotItem(it){const copy={...it};delete copy._lay;delete copy._m;delete copy.charFns;delete copy.pieceFns;delete copy.pre;delete copy.post;return copy;}
A.record = (renderer,env) => {
  validateTextState(env.ctx);
  if(env.ctx.filter!=='none'||env.ctx.shadowBlur||env.ctx.shadowOffsetX||env.ctx.shadowOffsetY||!['rgba(0, 0, 0, 0)','transparent'].includes(env.ctx.shadowColor))fail('UNSUPPORTED_DRAW_PROGRAM','Initial filter/shadow state requires a bounded adapter');
  const c=measurementContext();c.reset();c.setTransform(...matrix(env.ctx));c.globalCompositeOperation=env.ctx.globalCompositeOperation;c.globalAlpha=env.ctx.globalAlpha;c.miterLimit=env.ctx.miterLimit;c.setLineDash(env.ctx.getLineDash());c.lineDashOffset=env.ctx.lineDashOffset;c.lineCap=env.ctx.lineCap;c.lineJoin=env.ctx.lineJoin;
  const events=[],diagnostics=[];let recorder,glyphCount=0;
  const budget=env.placementBudget||{events:0,glyphs:0};
  const push=(kind,args,polygons)=>{if(++budget.events>MAX_EVENTS)fail('GEOMETRY_LIMIT','Frame draw event ceiling exceeded');if(events.length>=MAX_EVENTS)fail('GEOMETRY_LIMIT','Draw event ceiling exceeded');const ownership=recorder.drawOwnership||{role:'primary',owner:'cut:'+env.cut.index};const m=matrix(c);A.affine(m);if(polygons.length)A.bounds(polygons);events.push({kind,args,matrix:m,polygons,role:ownership.role,owner:ownership.owner,blend:c.globalCompositeOperation,alpha:c.globalAlpha,state:{lineCap:c.lineCap,lineJoin:c.lineJoin,miterLimit:c.miterLimit,dash:c.getLineDash(),dashOffset:c.lineDashOffset},order:events.length});};
  const proxy=new Proxy(c,{get(target,k){if(k==='fillRect')return (x,y,w,h)=>push('rect',[x,y,w,h,target.fillStyle], (()=>{const b=A.bounds([rect(x,y,w,h).map(p=>A.point(matrix(c),p))]);return [rect(b.x0-1,b.y0-1,b.x1-b.x0+2,b.y1-b.y0+2)];})());if(['fill','stroke','fillText','strokeText','drawImage','putImageData','clip','clearRect'].includes(k))return ()=>fail('UNSUPPORTED_DRAW_PROGRAM','Unadapted Canvas operation '+k);const v=target[k];return typeof v==='function'?v.bind(target):v;},set(target,k,v){if(textDefaults[k]&&!defaultTextValue(k,v))fail('UNSUPPORTED_TEXT_STATE','Default '+k+' required');if((['shadowBlur','shadowOffsetX','shadowOffsetY'].includes(k)&&v!==0)||(k==='shadowColor'&&!['rgba(0, 0, 0, 0)','transparent'].includes(v)))fail('UNSUPPORTED_DRAW_PROGRAM','Unbounded shape shadow');if(k==='filter'&&v!=='none')fail('UNSUPPORTED_DRAW_PROGRAM','Spatial filter');target[k]=v;return true;}});
  recorder=renderer.makeEnv(proxy,env.plan,env.cut,env.sc,{...env,ctx:proxy,placementRecording:true});
  recorder.placementRecorder={item(it){const count=[...String(it.text||'')].length;glyphCount+=count;budget.glyphs+=count;if(budget.glyphs>MAX_GLYPHS)fail('GEOMETRY_LIMIT','Frame glyph ceiling exceeded');if(glyphCount>MAX_GLYPHS)fail('GEOMETRY_LIMIT','Program glyph ceiling exceeded');if(env.pass!=='main'&&it.ghost===false)return null;const ink=A.itemGeometry(it,matrix(c),env);push('item',[snapshotItem(it)],ink.polygons);const lay=J.layoutText(it),boxes=[];for(const g of lay){const v=it.charFn?it.charFn(g.i,g,lay.N):null;if(!g.ch.trim()||v?.hide||(it.alpha??1)*(v?.a??1)<=.002)continue;const cs=v?.s??1;boxes.push({x:g.x*(it.sx||1)+g.vx*(it.sx||1)+(v?.dx||0),y:g.y*(it.sy||1)+g.vy*(it.sy||1)+(v?.dy||0),w:g.w*(it.sx||1)*cs,h:g.h*(it.sy||1)*cs});}if(!boxes.length)return null;return {x0:it.x+Math.min(...boxes.map(b=>b.x-b.w/2)),x1:it.x+Math.max(...boxes.map(b=>b.x+b.w/2)),y0:it.y+Math.min(...boxes.map(b=>b.y-b.h/2)),y1:it.y+Math.max(...boxes.map(b=>b.y+b.h/2)),cx:it.x,cy:it.y,boxes};}};
  recorder.withDrawRole=(role,owner,fn)=>A.withRole(recorder,role,owner,fn);
  recorder.line=(pts,color,lw=1,alpha=1,ghost=true)=>{if(env.pass!=='main'){if(!ghost)return;color=env.passColor;}if(!color||alpha<=0||pts.length<2)return;const ps=pts.map(p=>A.point(matrix(c),p)),pad=lw*Math.hypot(c.getTransform().a,c.getTransform().b,c.getTransform().c,c.getTransform().d)/2*(pts.length>2?c.miterLimit:1)+1;const b={x0:Math.min(...ps.map(p=>p[0])),y0:Math.min(...ps.map(p=>p[1])),x1:Math.max(...ps.map(p=>p[0])),y1:Math.max(...ps.map(p=>p[1]))};c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=lw;c.lineJoin='miter';c.lineCap='butt';push('line',[pts,color,lw,alpha,{miterLimit:c.miterLimit,dash:c.getLineDash(),dashOffset:c.lineDashOffset}],[rect(b.x0-pad,b.y0-pad,b.x1-b.x0+pad*2,b.y1-b.y0+pad*2)]);c.globalAlpha=1;};
  try{renderer.drawCut(recorder);}catch(e){diagnostics.push({code:e.code||'DRAW_PROGRAM_ERROR',message:e.message});}
  return {events,diagnostics,measurementSupported:diagnostics.length===0};
};
A.replay = (env,program,offset) => {
  if(!program.measurementSupported)fail('UNSUPPORTED_DRAW_PROGRAM','Refusing incomplete draw program');
  for(const e of program.events){const moved=e.role==='primary'?offset:[0,0];const ctx=env.ctx;ctx.save();try{ctx.setTransform(...compose(trans(moved[0]*(env.scale||1),moved[1]*(env.scale||1)),e.matrix));ctx.globalCompositeOperation=e.blend;ctx.globalAlpha=e.alpha;ctx.lineCap=e.state.lineCap;ctx.lineJoin=e.state.lineJoin;ctx.miterLimit=e.state.miterLimit;ctx.setLineDash(e.state.dash);ctx.lineDashOffset=e.state.dashOffset;
    if(e.kind==='item')J.drawItem({...env,placementRecorder:null},e.args[0]);
    else if(e.kind==='rect'){ctx.fillStyle=e.args[4];ctx.fillRect(...e.args.slice(0,4));}
    else if(e.kind==='line'){const [pts,col,lw,a,state]=e.args;ctx.globalAlpha=a;ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.lineJoin='miter';ctx.lineCap='butt';ctx.miterLimit=state.miterLimit;ctx.setLineDash(state.dash);ctx.lineDashOffset=state.dashOffset;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();}
  }finally{ctx.restore();}}
};
A.clear = (polygons,circle,margin=0) => {
  A.bounds(polygons);if(!Number.isFinite(margin)||margin<0)fail('INVALID_GEOMETRY','Invalid margin');if(!circle)return true;if(!finite([circle.cx,circle.cy,circle.r])||circle.r<0)fail('INVALID_GEOMETRY','Invalid circle');const c=[circle.cx,circle.cy],R=circle.r+margin;
  for(const ps of polygons){let inside=false;for(let i=0,j=ps.length-1;i<ps.length;j=i++) {const a=ps[j],b=ps[i],dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy,u=l?J.clamp(((c[0]-a[0])*dx+(c[1]-a[1])*dy)/l):0;if(Math.hypot(c[0]-a[0]-u*dx,c[1]-a[1]-u*dy)<=R)return false;if((a[1]>c[1])!==(b[1]>c[1])&&c[0]<(b[0]-a[0])*(c[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}if(inside)return false;}return true;
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
const signature=plan=>{const source={...plan};delete source.placementFinalization;source.cuts=plan.cuts.map(c=>{const n={...c};delete n.placementTrajectory;delete n.fullStagePlacement;return n;});return JSON.stringify(source);};
A.planSignature=signature;
const finalized=new WeakMap(),requests=new WeakMap(),sources=new WeakMap();
const oldPlan=J.plan;
J.plan=function(project,...args){const plan=oldPlan(project,...args);sources.set(plan,{locked:plan.cuts.filter(c=>project.overrides?.[c.line]?.lock).map(c=>c.index)});return plan;};
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const jsonClone=v=>JSON.parse(JSON.stringify(v));
/* Final composition and font loading must precede this detached, idempotent operation.
   No automatic media-duration inference and no render-time repair of stale plans. */
J.finalizePlacementPlan = (input,options={}) => {
  const prior=finalized.get(input), sig=signature(input),revision=J.metrics.revision||0;
  if(prior?.signature===sig&&prior.revision===revision&&prior.options===JSON.stringify(options))return input;
  if(!Number.isFinite(input.duration))fail('FINAL_DURATION_REQUIRED','Final composed duration required');
  if(!sources.has(input))fail('SOURCE_PLAN_REQUIRED','Finalize an actual composed J.plan result; serialized clones require replanning from project');
  const plan=jsonClone(input);delete plan.placementFinalization;
  const diagnostics=[],stepDur=J.stepDur(plan.fx,plan.fps),maxSupportedTransDur=.6,maxStep=1;
  // All frame passes share the effectCut's style/FX/clock. Reject mixed unsupported state once.
  const unsupportedPlanFX=!(Number.isFinite(stepDur)&&stepDur>0&&stepDur<=maxStep)||plan.cuts.some(c=>c.effectStyle||c.effectFx||c.trans&&c.trans!=='none'&&(c.trans!=='wipe'||!Number.isFinite(c.transDur??.35)||(c.transDur??.35)<0||(c.transDur??.35)>maxSupportedTransDur))||(plan.events||[]).some(e=>!['chroma','shake'].includes(e.type))||plan.style?.glow!==0;
  // Root quantization + recursive previous-frame quantization, one maximum ghost lag,
  // transition duration, permitted cut gap and previous-rest-frame/rounding allowance.
  const reachTail=maxSupportedTransDur+2*stepDur+1.6/24+.06+.01;
  for(const cut of plan.cuts){
    const original=jsonClone(cut);
    delete cut.fullStagePlacement;delete cut.placementTrajectory;
    if(options.cutIndices&&!options.cutIndices.includes(cut.index))continue;
    if(plan.lyricAvoidanceIndex?.enabled!==true||sources.get(input)?.locked.includes(cut.index)||['manual','notation'].includes(cut.areaMode)||cut.placementLocked||cut.emphasis){diagnostics.push({cut:cut.index,code:'PRESERVED_LEGACY',safety:'not-evaluated'});continue;}
    if(!['center','tile'].includes(cut.layout)||!['cut'].includes(cut.enter)||!['cut'].includes(cut.exit)||(cut.groupExit??cut.exit)!=='cut'||cut.hold!=='still'||(cut.decor||[]).length||!['none','marker'].includes(cut.treat||'none')||!['push','panL','panR','dutch'].includes(cut.cam)||cut.drawing||cut.effectsOnly||J.activeMask?.(cut)){diagnostics.push({cut:cut.index,code:'UNSUPPORTED_ADAPTER',safety:'unsupported'});continue;}
    const fxCheck=cut.effectFx||plan.fx,stCheck=cut.effectStyle||plan.style,numbers=[plan.W,plan.H,cut.contentScale??1,cut.motionScale??1,fxCheck.motion??.7,fxCheck.chroma??.7,stCheck.ghost??1,cut.camP?.a??.022,cut.camP?.dir??1];
    if(!finite(numbers)||plan.W<=0||plan.H<=0||(cut.contentScale??1)<=0||(cut.motionScale??1)<0||(cut.motionScale??1)>1||(fxCheck.motion??.7)<0||(fxCheck.motion??.7)>1||(fxCheck.chroma??.7)<0||(stCheck.ghost??1)<0||(cut.camP?.a??0)<0||Math.abs(cut.camP?.dir??1)>1||(plan.events||[]).some(e=>!finite([e.t,e.amp])||e.amp<0)){diagnostics.push({cut:cut.index,code:'UNSUPPORTED_PARAMETER_RANGE',safety:'unsupported'});continue;}
    if(unsupportedPlanFX){diagnostics.push({cut:cut.index,code:'UNSUPPORTED_POST_FX',safety:'unsupported'});continue;}
    const L=J.LAYOUTS[cut.layout];cut.area=null;cut.fullStagePlacement=true;
    const fresh=L.plan(J.rng(J.h(cut.seed,318)),{text:cut.text,n:[...cut.text.replace(/\s/g,'')].length,W:plan.W,H:plan.H,dur:cut.dur},cut.effectStyle||plan.style);
    // These two foundation adapters have no geometry-dependent random fields. Preserve the chosen look.
    cut.params={...fresh,...cut.params};
    Object.assign(cut.params,options.params?.[cut.index]||{});
    const renderer=Object.create(J.Renderer.prototype),ctx=measurementContext();ctx.reset();
    const env=renderer.makeEnv(ctx,plan,cut,cut.palette||plan.style.schemes[cut.scheme%plan.style.schemes.length],{pass:'main',t:cut.start+cut.dur/2,realTime:cut.start+cut.dur/2,lt:cut.dur/2,ltb:cut.dur/2,pIn:1,pOut:0,step:0,scale:1,allowFilter:false});env.pIn=1;env.pOut=0;
    const program=A.record(renderer,env),ps=program.events.filter(e=>e.role==='primary').flatMap(e=>e.polygons);
    if(!program.measurementSupported||!ps.length){plan.cuts[plan.cuts.indexOf(cut)]=original;diagnostics.push({cut:cut.index,code:'UNSUPPORTED_MEASUREMENT',details:program.diagnostics,safety:'unsupported'});continue;}
    // Rest geometry is invariant for these adapters (marker grows inside its full rest plate).
    // A rectangular interval envelope covers the supported bounded camera rotation/scale/translation and chroma/shake passes. Ten stage pixels cover AA for certified render scales >=0.1.
    const motion=cut.motionScale??1,fx=cut.effectFx||plan.fx,K=J.clamp((fx.motion??.7)*1.25,0,1.25),s=(cut.contentScale??1)*Math.max(1,1+.03*Math.max(K,fx.motion??.7)*motion,1.02);
    const bx=Math.max(...ps.flat().map(p=>Math.abs(p[0]-plan.W/2))),by=Math.max(...ps.flat().map(p=>Math.abs(p[1]-plan.H/2))),sn=cut.cam==='dutch'?Math.sin(5*J.DEG):0;
    const rx=(bx+by*sn)*s+10,ry=(by+bx*sn)*s+10;
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
  finalized.set(plan,{signature:signature(plan),revision,options:JSON.stringify(options)});sources.set(plan,sources.get(input)||{locked:[]});return freeze(plan);
};
J.finalizePlacementPlanAsync = async (plan,wait,options={}) => {const token={},sig=signature(plan);requests.set(plan,token);await wait; if(requests.get(plan)!==token||signature(plan)!==sig)fail('STALE_FINALIZATION','A newer request or composed plan superseded this result');return J.finalizePlacementPlan(plan,options);};
A.validateFinal = plan => {const rec=finalized.get(plan);if(!rec||rec.revision!==(J.metrics.revision||0)||!Object.isFrozen(plan))fail('STALE_PLACEMENT_PLAN','Refinalize after font/compose changes');};
A.offsetAt=(trajectory,t)=>{const s=trajectory.segments.find(s=>s.start<=t&&t<s.end);if(!s)return [0,0];const u=(t-s.start)/(s.end-s.start);return [J.lerp(s.from[0],s.to[0],u),J.lerp(s.from[1],s.to[1],u)];};
A.render = (renderer,env) => {
  A.validateFinal(env.plan);if((env.scale||1)<.1||(env.scale||1)>4)fail('UNSUPPORTED_RENDER_SCALE','Staged certified scale range is 0.1 through 4');const program=A.record(renderer,env),offset=A.offsetAt(env.cut.placementTrajectory,env.realTime),scale=env.scale||1;
  const polygons=program.events.filter(e=>e.role==='primary').flatMap(e=>e.polygons).map(p=>p.map(v=>[v[0]/scale+offset[0],v[1]/scale+offset[1]]));
  const resolved=J.resolveAvoidanceAt(env.plan,env.realTime),circle=resolved?J.avoidanceCirclePixels(resolved,env.plan.W,env.plan.H):null;
  const safe=program.measurementSupported&&(!polygons.length||A.clear(polygons,circle,Math.max(2,.005*Math.min(env.W,env.H))));
  if(!program.measurementSupported)fail('UNSUPPORTED_DRAW_PROGRAM',JSON.stringify(program.diagnostics));
  env.placementObservation?.({cut:env.cut.index,realTime:env.realTime,motionTime:env.t,pass:env.pass,offset,measurementSupported:true,safety:safe?'safe':'conflict',events:program.events.map(e=>({kind:e.kind,role:e.role,owner:e.owner,order:e.order,blend:e.blend,polygons:e.polygons})),polygons});
  A.replay(env,program,offset);
};
})();
