/* Native starburst decoration support, without sampling its clock. */
(() => {
'use strict';
const A=J.placement,ID=[1,0,0,1,0,0],pair=x=>Array.isArray(x)?x:[x,x];
function starburstUnits({W,H,P,cut,st,bbRanges,includeFallback=true}){
 if(!(W>0&&H>0&&Number.isFinite(W+H))||!P||!cut||!st?.fonts||!Array.isArray(bbRanges))return null;
 const U=Math.min(W,H)/1080,R=J.clamp(Math.min(W,H)*.068,44*U,88*U),size=R*2.2,gap=14*U,m=Math.round(Math.min(W,H)*.05),back=1+4*2.2**3/(27*3.2**2);
 // Match lyricChar and the five native labels. Other P.v values draw no text.
 const chars=[...String(cut.text||'')].filter(c=>c.trim()&&!J.isPunct(c)),kanji=chars.filter(J.isKanji),kana=chars.filter(c=>J.isKata(c)||J.isHira(c)||J.isLatin(c)),pool=kanji.length?kanji:kana.length?kana:chars,ch=pool.length?pool[J.h(cut.seed,9,5)%pool.length]:null,v=(P.v|0)%5,txt=[`No.${String(Math.max(0,Math.floor((cut.line|0)+1))).padStart(2,'0')}`,'NEW','HIT!',ch||'♪','LOVE'][v]||'',font=v===3?(st.fonts.serif?.[0]||'mincho'):(st.fonts.display?.[0]||'gothic_black');
 let fs=R*(v===3?.7:.42);const width=J.measure({text:txt,font,size:fs,track:.02}).w;if(width>R*1.15)fs*=R*1.15/width;
 let textRadius=0;if(txt){const polys=A.itemGeometry({text:txt,font,size:fs,x:0,y:0,track:.02},ID,{pass:'main',scale:1}).polygons;for(const poly of polys)for(const [x,y]of poly)textRadius=Math.max(textRadius,Math.hypot(x,y));}
 // The badge can rotate without bound; text counter-rotates by 85%, so a disk
 // encloses both through every clock. Stroke and text ink remain owned.
 const radius=back*Math.max(R,R*.7+Math.max(1,1.2*U)/2,textRadius)+2,source=bbRanges.slice();
 if(includeFallback)source.push({x0:W*.35,x1:W*.65,y0:H*.4,y1:H*.6});
 const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x)),out=[];
 for(const raw of source){
  const b=Object.fromEntries(['x0','x1','y0','y1'].map(k=>[k,pair(raw[k])]));
  if(Object.values(b).some(a=>a.length!==2||!a.every(Number.isFinite)||a[0]>a[1]))return null;
  // getBB clamps each edge unless that collapses the bbox. Enclose both the
  // clamped and restored possibilities without assuming edge correlation.
  for(const [key,edge,lower]of [['x0',W,true],['x1',W,false],['y0',H,true],['y1',H,false]]){
   const r=b[key],a=lower?Math.max(r[0],-edge*.1):Math.min(r[0],edge*1.1),z=lower?Math.max(r[1],-edge*.1):Math.min(r[1],edge*1.1);b[key]=[Math.min(r[0],a),Math.max(r[1],z)];
  }
  function place(x,y,margin){const xmax=Math.max(margin,W-margin-size),ymax=Math.max(margin,H-margin-size),xs=x.map(v=>clamp(v,margin,xmax)+size/2),ys=y.map(v=>clamp(v,margin,ymax)+size/2);out.push({owner:'decorB:starburst',kind:'badge',bounds:{x0:xs[0]-radius,y0:ys[0]-radius,x1:xs[1]+radius,y1:ys[1]+radius}});}
  const shift=(a,d)=>[a[0]+d,a[1]+d];
  // nearBB returns its first non-overlapping candidate. If its first choice
  // is separated for every bbox in this range, later choices are unreachable.
  const right=!!P.right,low=!!P.low,margin=m*.8,sep=gap*.4,guard=64*Number.EPSILON*(1+W+H+size+Math.max(...Object.values(b).flat().map(Math.abs))),xmax=Math.max(margin,W-margin-size),ymax=Math.max(margin,H-margin-size),odd=(P.v|0)%2!==0;
  const horizontalClear=gap*.6>guard&&(right?xmax>b.x1[1]+sep+guard:margin+size<b.x0[0]-sep-guard),verticalClear=gap*.6>guard&&(low?ymax>b.y1[1]+sep+guard:margin+size<b.y0[0]-sep-guard),firstClear=odd?horizontalClear:verticalClear,secondClear=odd?verticalClear:horizontalClear;
  if(firstClear||secondClear){
   const ax=right?shift(b.x1,-size):b.x0,ox=right?shift(b.x1,gap):shift(b.x0,-gap-size),ay=low?shift(b.y1,gap):shift(b.y0,-gap-size),iy=low?shift(b.y1,-size):b.y0;
   place(odd?ox:ax,odd?iy:ay,margin);
   // When only the second candidate is proven clear, the first can still
   // win for part of the bbox range. Retain both; native nearBB cannot reach
   // any later candidate after this guaranteed separating axis.
   if(!firstClear)place(odd?ax:ox,odd?ay:iy,margin);
   continue;
  }
  for(const right of [false,true])for(const low of [false,true]){
   const ax=right?shift(b.x1,-size):b.x0,ox=right?shift(b.x1,gap):shift(b.x0,-gap-size),ay=low?shift(b.y1,gap):shift(b.y0,-gap-size),iy=low?shift(b.y1,-size):b.y0;
   for(const [x,y]of [[ox,iy],[ax,ay],[ox,ay]])place(x,y,m*.8);
   // cornerSpot fallback uses its own (larger) margin.
   place([right?W-m-size:m,right?W-m-size:m],[low?H-m-size:m,low?H-m-size:m],m);
  }
 }
 return out.length?out:null;
}
A.starburstUnits=starburstUnits;
})();
