'use strict';
// Pure source-path checks. No browser, font-ink or product acceptance is claimed.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'../..'),sandbox={window:{},console};vm.createContext(sandbox);
const run=p=>vm.runInContext(fs.readFileSync(path.join(root,p),'utf8'),sandbox,{filename:p});
run('src/01_util.js');const J=sandbox.window.J;J.placement={};J.DECOR={};
J.centerBB=env=>({x0:env.W*.35,x1:env.W*.65,y0:env.H*.4,y1:env.H*.6});
J.register=(kind,id,value)=>{if(kind==='decor')J.DECOR[id]=value;};
run('src/11p_decorB.js');run('src/11zz14a_center_circle.js');run('src/11zz14b_memphis_units.js');
let paints=0,draws=0;
for(const [W,H] of [[960,540],[540,960],[1920,1080]])for(const [ix,iy] of [[0,0],[W*.35,H*.3],[W*.75,H*.8]]){
 const cut={layout:'center',enter:'invertBox',exit:'tyStrike',hold:'knCounterRock',treat:'none',params:{},decor:[{id:'memphis'}],inDur:.6};
 const main={x0:-W*.12,y0:-H*.1,x1:W*.12,y1:H*.1},local={bounds:main,body:main,centerMainBounds:main},item={x:ix,y:iy},plan={W,H};
 const bound=J.placement.centerCircle.stageBounds(local,item,plan,cut);
 for(let seed=0;seed<8;seed++)for(let v=0;v<6;v++)for(let ti=0;ti<=20;ti++){
  let matrix=[1,0,0,1,0,0],stack=[],points=[],partSupport=[];
  const point=(x,y)=>points.push([matrix[0]*x+matrix[2]*y+matrix[4],matrix[1]*x+matrix[3]*y+matrix[5]]);
  const ctx={lineWidth:0,save(){stack.push(matrix.slice());},restore(){matrix=stack.pop();},translate(x,y){matrix[4]+=matrix[0]*x+matrix[2]*y;matrix[5]+=matrix[1]*x+matrix[3]*y;},rotate(a){const c=Math.cos(a),s=Math.sin(a),[a0,b,c0,d]=matrix;matrix[0]=a0*c+c0*s;matrix[1]=b*c+d*s;matrix[2]=-a0*s+c0*c;matrix[3]=-b*s+d*c;},beginPath(){points=[];},moveTo:point,lineTo:point,closePath(){},arc(x,y,r){for(let i=0;i<32;i++)point(x+r*Math.cos(i*Math.PI/16),y+r*Math.sin(i*Math.PI/16));},stroke(){check(ctx.lineWidth/2);},fill(){check(0);}};
  function check(pad){for(const [x,y]of points){assert(x-pad>=bound.x0+ix-1e-8&&x+pad<=bound.x1+ix+1e-8&&y-pad>=bound.y0+iy-1e-8&&y+pad<=bound.y1+iy+1e-8,`memphis outside support ${W}x${H}, ${ix},${iy}, seed${seed}, v${v}, time${ti}`);assert(partSupport.some(({bounds:b})=>x-pad>=b.x0-1e-8&&x+pad<=b.x1+1e-8&&y-pad>=b.y0-1e-8&&y+pad<=b.y1+1e-8),'source point outside primitive union');paints++;}}
  const bb={x0:main.x0+ix,y0:main.y0+iy,x1:main.x1+ix,y1:main.y1+iy,cx:ix,cy:iy};
  const env={W,H,ctx,cut:{...cut},pass:'main',lt:ti*.12,ltb:ti*.12,pOut:0,sc:{bg:'#000000',fg:'#ffffff',accent:'#ff0000',accent2:'#00ff00'}};
  partSupport=J.placement.memphisUnits({W,H,P:{seed,n:3,v},bbRanges:seed%2?[bb]:[],includeFallback:!(seed%2)});assert(partSupport.length);
  J.DECOR.memphis.draw(env,seed%2?bb:null,{seed,n:3,v});draws++;
 }
}
// The composition renderer retains native subtitle/underline formulas while
// translating their horizontal anchor with the reflowed main item.
const calls=[],bb={x0:100,y0:80,x1:400,y1:160};J.mainDraw=()=>bb;
const cut={params:{sub:true,under:true},lineText:'full line',text:'part'},item={x:250,y:100,size:50};
const env={cut,W:960,H:540,sc:{fg:'#fff',sub:'#aaa',accent:'#f00'},st:{fonts:{body:['body']}},pIn:.8,pOut:.2,draw:x=>calls.push(['text',x]),line:(...x)=>calls.push(['line',...x])};
assert.strictEqual(J.placement.centerCircle.render(env,item),bb);assert.equal(calls.length,2);assert.equal(calls[0][1].x,item.x);assert.equal(calls[0][1].y,bb.y1+540*.07);assert.equal(calls[0][1].ghost,false);assert.equal(calls[1][1][0][1],bb.y1+item.size*.14);
// Exercise the actual native word-pivot implementation against the analytic
// hull with deterministic synthetic glyph metrics, including multiline input.
const holds={};J.register=(kind,id,value)=>{if(kind==='hold')holds[id]=value;};run('src/11p_kinetic2.js');
J.layoutText=it=>{const out=[];let i=0;for(const [li,line] of it.text.split('\n').entries())for(const [ci,ch]of [...line].entries())out.push({i:i++,li,ch,x:ci*it.size*.6,y:li*it.size*1.2,vx:0,vy:0,w:it.size*.6,h:it.size});out.N=out.length;return out;};
J.itemBox=it=>{const L=J.layoutText(it),x0=Math.min(...L.map(g=>g.x-g.w/2)),x1=Math.max(...L.map(g=>g.x+g.w/2)),y0=Math.min(...L.map(g=>g.y-g.h/2)),y1=Math.max(...L.map(g=>g.y+g.h/2));return {x0,y0,x1,y1,w:x1-x0,h:y1-y0,cx:(x0+x1)/2,cy:(y0+y1)/2};};
let rockPoints=0;
for(const text of ['ONE TWO THREE','ONE\nTWO THREE','LONGWORD'])for(const motion of [0,.7,1]){
 const it={text,font:'synthetic',size:80,x:0,y:0,sx:1,sy:1,charFns:[]},cut={layout:'center',enter:'invertBox',exit:'tyStrike',hold:'knCounterRock',params:{},words:text.split(/\s+/)},plan={fx:{motion},W:960,H:540};
 const base=J.itemBox(it),support=J.placement.centerCircle.envelope(it,cut,plan,{bounds:base,body:base}).centerMainBounds;
 for(let t=0;t<=100;t++){
  it.charFns=[];holds.knCounterRock.apply({cut,fx:plan.fx,lt:t*.05,ltb:t*.05},it,1);
  for(const g of J.layoutText(it)){const c=it.charFns[0]?.(g.i,g)||{},th=(c.rot||0)*J.DEG;for(const dx of [-g.w/2,g.w/2])for(const dy of [-g.h/2,g.h/2]){const x=g.x+(c.dx||0)+dx*Math.cos(th)-dy*Math.sin(th),y=g.y+(c.dy||0)+dx*Math.sin(th)+dy*Math.cos(th);assert(x>=support.x0-1e-8&&x<=support.x1+1e-8&&y>=support.y0-1e-8&&y<=support.y1+1e-8);rockPoints++;}}
 }
}
let measuredFont;J.placement.itemGeometry=it=>{measuredFont=it.font;return {polygons:[[[0,0],[20,0],[20,20],[0,20]]]};};J.placement.bounds=()=>({x0:0,y0:0,x1:20,y1:20});
const subCut={layout:'center',enter:'cut',exit:'cut',hold:'still',params:{sub:true},text:'part',lineText:'full',fonts:{body:['cut-body']},effectStyle:{fonts:{body:['effect-body']}}};
J.placement.centerCircle.envelope({text:'part',size:80,sx:1,sy:1},subCut,{W:960,H:540,fx:{motion:.7},style:{fonts:{body:['plan-body']}}},{bounds:{x0:0,y0:0,x1:100,y1:100},body:{x0:0,y0:0,x1:100,y1:100}});assert.equal(measuredFont,'cut-body');
J.HOLD=holds;J.placement.itemGeometry=it=>({glyphs:J.layoutText(it).filter(g=>g.ch.trim()).map(g=>({index:g.i,polygon:[[g.x-g.w/2,g.y-g.h/2],[g.x+g.w/2,g.y-g.h/2],[g.x+g.w/2,g.y+g.h/2],[g.x-g.w/2,g.y+g.h/2]]}))});
let unitPoints=0;
for(const text of ['ONE TWO THREE','ONE\nTWO THREE','LONGWORD'])for(const motionScale of [0,.3,1]){
 const item={text,font:'synthetic',size:80,x:400,y:200,sx:1,sy:1},cut={layout:'center',enter:'invertBox',exit:'tyStrike',hold:'knCounterRock',treat:'none',motionScale,params:{under:true},words:text.split(/\s+/)},plan={fx:{motion:.7}};
 const support=J.placement.centerCircle.sourceUnits(item,cut,plan);
 for(let t=0;t<=100;t++){
  const it={...item,charFns:[]};holds.knCounterRock.apply({cut,fx:plan.fx,lt:t*.05,ltb:t*.05},it,1);
  for(const g of J.layoutText(it).filter(g=>g.ch.trim())){const c=it.charFns[0]?.(g.i,g)||{},th=(c.rot||0)*J.DEG*motionScale,b=support.units.find(u=>u.owner==='center.glyph.'+g.i).bounds;for(const dx of [-g.w/2,g.w/2])for(const dy of [-g.h/2,g.h/2]){const x=item.x+g.x+(c.dx||0)*motionScale+dx*Math.cos(th)-dy*Math.sin(th),y=item.y+g.y+(c.dy||0)*motionScale+dx*Math.sin(th)+dy*Math.cos(th);assert(x>=b.x0-1e-7&&x<=b.x1+1e-7&&y>=b.y0-1e-7&&y<=b.y1+1e-7);unitPoints++;}}
 }
}
console.log(JSON.stringify({status:'PASS',draws,checkedSourcePoints:paints,rockPoints,unitPoints,compositionCalls:calls.length,scope:'pure source path; synthetic glyph metrics; no font ink, Canvas raster, post or circle acceptance'}));
