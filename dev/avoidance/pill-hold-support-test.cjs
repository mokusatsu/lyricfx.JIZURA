const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'../..')+'/',s={window:{},console};vm.createContext(s);const run=f=>vm.runInContext(fs.readFileSync(root+f,'utf8'),s,{filename:f});run('src/01_util.js');const J=s.window.J;J.placement={simpleCircle:{}};J.HOLD={};J.register=(k,id,d)=>{if(k==='hold')J.HOLD[id]=d;};
J.fitSize=()=>48;J.measure=it=>({w:it.text.length*it.size*.6,h:it.size});J.romaji=t=>t;J.lum=()=>0;
J.layoutText=it=>{const out=[...it.text].map((ch,i)=>({i,li:0,ch,x:(i-(it.text.length-1)/2)*it.size*.6,y:0,vx:0,vy:0,w:it.size*.6,h:it.size}));out.N=out.length;return out;};
const polygon=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const A=J.placement;A.bounds=ps=>{const p=ps.flat();return{x0:Math.min(...p.map(p=>p[0])),x1:Math.max(...p.map(p=>p[0])),y0:Math.min(...p.map(p=>p[1])),y1:Math.max(...p.map(p=>p[1]))};};
A.itemGeometry=it=>{const glyphs=J.layoutText(it).filter(g=>g.ch.trim()).map(g=>({index:g.i,polygon:polygon(it.x+g.x-g.w/2,it.y-g.h/2,it.x+g.x+g.w/2,it.y+g.h/2)}));return{glyphs,polygons:glyphs.map(g=>g.polygon)};};
run('src/06_layouts.js');run('src/11p_kinetic2.js');run('src/11zz14a_center_circle.js');run('src/11zz14b_memphis_units.js');run('src/11zz20_block_formulas.js');run('src/11zz14c_pill_units.js');
let cases=0,plates=0,rockCorners=0;
for(const [W,H]of[[960,540],[540,960]])for(const text of['ONE TWO','短い歌詞'])for(const smalls of[false,true]){
 const st={fonts:{body:['body']}},cut={layout:'pill',text,line:2,start:1,inDur:.5,dur:4,params:{font:'display',smalls},enter:'invertBox',exit:'tyStrike',hold:'knCounterRock',words:text.split(/\s+/),treat:'none',decor:[{id:'memphis',seed:4,n:3,v:2}]},plan={W,H,fx:{motion:.7},style:st},sc={accent:'#f00',fg:'#fff'};
 const support=A.pillUnits({W,H,cut,plan,st,sc});assert(support&&support.units.length);assert(!support.units.some(u=>u.owner==='center.invertBox'||u.owner.startsWith('center.strike')));
 const main=A.nativeBlockCircle.geometry({W,H,cut,st,sc}).items[0];
 for(const lt of[.51,.65,1,2]){
  const ctx={save(){},restore(){},beginPath(){},rect(){},clip(){},createLinearGradient(){return{addColorStop(){}};}};
  J.mainDraw=()=>({x0:0,y0:0,x1:W,y1:H});
  J.LAYOUTS.pill.render({W,H,cut,st,sc,ctx,lt,pOut:0,pass:'main',rrect(x,y,w,h,r,g,a,filled,c,lw=0){const b={x0:x-lw/2,y0:y-lw/2,x1:x+w+lw/2,y1:y+h+lw/2};assert(support.units.some(u=>u.kind==='plate'&&b.x0>=u.bounds.x0-1e-8&&b.x1<=u.bounds.x1+1e-8&&b.y0>=u.bounds.y0-1e-8&&b.y1<=u.bounds.y1+1e-8));plates++;},draw(){}});
  const it={...main,charFns:[]};J.HOLD.knCounterRock.apply({cut,fx:plan.fx,lt,ltb:lt},it,1);
  for(const g of J.layoutText(it).filter(g=>g.ch.trim())){const c=it.charFns[0]?.(g.i,g)||{},t=(c.rot||0)*J.DEG,b=support.units.find(u=>u.owner==='pill.main.glyph.'+g.i).bounds;for(const x of[-g.w/2,g.w/2])for(const y of[-g.h/2,g.h/2]){const px=it.x+g.x+(c.dx||0)+x*Math.cos(t)-y*Math.sin(t),py=it.y+(c.dy||0)+x*Math.sin(t)+y*Math.cos(t);if(px>=main.clipX[0]&&px<=main.clipX[1])assert(px>=b.x0-1e-7&&px<=b.x1+1e-7&&py>=b.y0-1e-7&&py<=b.y1+1e-7);rockCorners++;}}
 }
 assert.equal(A.pillUnits({W,H,cut:{...cut,hold:'unproven'},plan,st,sc}),null);cases++;
}
console.log(JSON.stringify({status:'PASS',cases,plates,rockCorners,scope:'source formulas and native pill rendering; synthetic glyph metrics; no Canvas raster, post or circle acceptance'}));
