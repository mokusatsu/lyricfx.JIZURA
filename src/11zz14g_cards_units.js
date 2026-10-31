/* Native ticket and rows/scatter label supports during the declared hold. */
(() => {
'use strict';
const A=J.placement,ID=[1,0,0,1,0,0];
const rectangle=b=>[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]];
const bounds=ps=>A.bounds([ps]);
function cardsUnits({W,H,cut,plan,st,sc,holdWindow}){
 if(!['ticket','labels'].includes(cut.layout)||!holdWindow||cut.layoutARecipe||
    (cut.treat||'none')!=='none'||!['cut','flicker','invertBox'].includes(cut.enter)||
    !['cut','tyStrike'].includes(cut.exit)||!['still','knCounterRock'].includes(cut.hold)||
    !(cut.decor||[]).every(d=>d.id==='memphis')||holdWindow.native.end>cut.start+cut.dur-cut.outDur)return null;
 const units=[],add=(owner,b)=>units.push({owner,bounds:b}),p=cut.params;
 let bbRanges;
 if(cut.layout==='labels'){
  if(!['rows','scatter'].includes(p.variant))return null;
  const text=cut.text.replace(/\s+/g,'');
  let words=p.unit==='char'?[...text].filter(c=>!J.isPunct(c)):(cut.words?.length?cut.words:[text]);
  if(!words.length)words=[text];
  const k=words.length,fs=p.variant==='rows'?Math.min(H*.1,H*.7/(k*1.5)):H*.085,seed=cut.seed;
  for(let i=0;i<k;i++){
   const size=p.variant==='rows'?fs:fs*(.8+J.r(seed,i,10)*.5),x=p.variant==='rows'?W/2+J.rs(seed,i,5)*W*.12:W*(.15+.7*((i+.5)/k))+J.rs(seed,i,7)*W*.04,y=p.variant==='rows'?H/2+(i-(k-1)/2)*fs*1.55:H/2+J.rs(seed,i,8)*H*.25,angle=(p.variant==='rows'?J.rs(seed,i,6)*4:J.rs(seed,i,9)*22)*J.DEG;
   const item={text:words[i],font:p.font,size,x:0,y:0,track:.04},m=J.measure(item),plate={x0:-(m.w+size*.7)/2,y0:-size*.68,x1:(m.w+size*.7)/2,y1:size*.68},polys=A.itemGeometry(item,ID,{pass:'main',scale:1}).polygons;
   const b=polys.length?A.bounds([rectangle(plate),...polys]):plate,q=1+32/243,c=Math.cos(angle),s=Math.sin(angle),points=[[x,y],...rectangle(b).map(([a,b])=>[x+q*(a*c-b*s),y+q*(a*s+b*c)])];
   add('labels.label.'+i,bounds(points));
  }
  const b=p.variant==='rows'?{x0:W*.3,x1:W*.7,y0:H/2-k*fs*.8,y1:H/2+k*fs*.8}:{x0:W*.15,x1:W*.85,y0:H*.3,y1:H*.7};
  bbRanges=Object.fromEntries(Object.entries(b).map(([key,value])=>[key,[value,value]]));
 }else{
  // The tear starts when pOut becomes positive even if exit is cut; the
  // accepted hold ends before then. Earlier ghost passes may still be entering.
  const source={...cut,area:null,simpleCircleRecipe:null,enter:'cut',exit:'cut',hold:'still'},renderer=Object.create(J.Renderer.prototype),program=A.sourceFormulaBase.construct(renderer,{...plan,W,H},source,{W,H,time:.8,pass:'main'}),mains=program.events.filter(e=>e.kind==='item'&&e.args[0].placementMain);
  if(!mains.length||mains.some(e=>e.args[0].rot||e.args[0].skew))return null;
  const earliest=Math.max(0,holdWindow.native.start-cut.start-(holdWindow.step||0)-1.6/24),q=J.clamp(earliest/.5),turn=1-2*1.2/(3*(1+1.2)),e0=J.E.outBack(q,1.2),emax=q<=turn?J.E.outBack(turn,1.2):e0,emin=Math.min(1,e0),dy0=(1-emax)*H*.7,dy1=(1-emin)*H*.7,da=Math.max(Math.abs(1-emax),Math.abs(1-emin))*10*J.DEG;
  function moving(b){const r=Math.max(...rectangle(b).map(([x,y])=>Math.hypot(x-W/2,y-H/2))),d=2*r*Math.sin(da/2);return {x0:b.x0-d,x1:b.x1+d,y0:b.y0+dy0-d,y1:b.y1+dy1+d};}
  for(const [i,e]of program.events.entries()){
   if(e.kind==='item'&&e.args[0].placementMain){
    const main=A.centerCircle.sourceUnits(e.args[0],{...cut,layout:'center',area:null,params:{}}, {...plan,W,H},{holdOnly:false});if(!main)return null;
    for(const u of main.units)add('ticket.main.'+u.owner,moving(bounds(rectangle(u.bounds).map(v=>A.point(e.matrix,v)))));
   }else for(const poly of e.polygons)add('ticket.part.'+i,moving(bounds(poly)));
  }
  const port=H>W*1.08,tw=Math.min(W*(port?.9:.74),H*1.9),th=Math.min(tw*(port?.46:.38),H*.5),cx=W/2,cy=H/2;
  bbRanges={x0:[cx-tw/2,cx-tw/2],x1:[cx+tw/2,cx+tw/2],y0:[cy+dy0-th/2,cy+dy1-th/2],y1:[cy+dy0+th/2,cy+dy1+th/2]};
 }
 for(const d of cut.decor||[]){const parts=A.memphisUnits({W,H,P:d,bbRanges:[bbRanges],includeFallback:true});if(!parts?.length)return null;units.push(...parts);}
 return units.length?{units,bbRanges,scope:'native-hold'}:null;
}
A.cardsUnits=cardsUnits;
})();
