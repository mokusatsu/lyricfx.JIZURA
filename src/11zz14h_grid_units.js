/* Native Swiss grid hold owners; no renderer or source layout changes. */
(() => {
'use strict';
const A=J.placement,ID=[1,0,0,1,0,0];
function gridUnits({W,H,cut,plan,st,holdOnly=true,holdWindow}){
 const p=cut.params;
 if(cut.layout!=='swissGrid'||!holdOnly||!holdWindow||cut.placementLayoutsC||cut.layoutCRecipe||
    (cut.treat||'none')!=='none'||!['cut','flicker','invertBox'].includes(cut.enter)||
    !['cut','tyStrike'].includes(cut.exit)||!['still','knCounterRock'].includes(cut.hold)||
    !(cut.motionScale==null||cut.motionScale>=0&&cut.motionScale<=1)||
    !['a','b'].includes(p.variant)||!['circle','square','bar'].includes(p.shape)||
    !(cut.decor||[]).every(d=>d.id==='memphis'))return null;
 const chunks=(p.chunks?.length?p.chunks:[cut.text.trim()]).filter(Boolean),k=chunks.length;
 if(!k||k>3)return null;
 // Each native main has mi=i*3, so its entrance can end after the global
 // lyric hold begins. Do not certify those delayed entrance frames.
 const ready=cut.start+3*(k-1)*(cut.stagger||0)+(cut.enter==='cut'?0:Math.max(.01,cut.inDur));
 if(holdWindow.native.start<ready||holdWindow.native.end>cut.start+cut.dur-(cut.exit==='cut'?0:cut.outDur))return null;
 const u=Math.min(W,H),port=H>W*1.08,ls=J.clamp(u*.024,14,34),cols=port?4:6,rows=port?8:6,m=u*.07;
 const gx0=m*1.35,gx1=W-m,gy0=m,gy1=H-m,cw=(gx1-gx0)/cols,rh=(gy1-gy0)/rows,X=c=>gx0+c*cw,Y=r=>gy0+r*rh,units=[];
 const add=(owner,kind,x0,y0,x1,y1)=>units.push({owner,kind,bounds:{x0,y0,x1,y1}});
 const plain=(it,owner)=>A.itemGeometry(it,ID,{pass:'main',scale:1}).glyphs.forEach(g=>units.push({owner:owner+'.glyph.'+g.index,kind:'glyph',bounds:A.bounds([g.polygon])}));
 // Grid progress stays in [0,1] in hold. Each line retains its own full-length
 // support rather than filling the otherwise empty interiors of its cells.
 const linePad=Math.max(1,u*.0012)/2+1;
 for(let c=0;c<=cols;c++)add('swiss.grid.column.'+c,'line',X(c)-linePad,gy0-linePad,X(c)+linePad,gy1+linePad);
 for(let r=0;r<=rows;r++)add('swiss.grid.row.'+r,'line',gx0-linePad,Y(r)-linePad,gx1+linePad,Y(r)+linePad);
 const mono=st.fonts.mono?.[0]||'mono';
 for(let c=0;c<cols;c++)plain({text:String(c+1).padStart(2,'0'),font:mono,size:ls*.7,align:'left',x:X(c)+ls*.3,y:gy0-ls*.6},'swiss.columnLabel.'+c);
 const half=Math.ceil(cols/2),pl=k===1?[{c:0,r:port?2:1,span:cols,hr:port?2.4:2.6}]:p.variant==='a'?
  [{c:0,r:1,span:cols,hr:port?2:2.2},{c:port?1:half,r:rows-(k>2?3:2),span:cols-(port?1:half),hr:1},{c:port?1:half,r:rows-2+(port?.2:.1),span:cols-(port?1:half),hr:1}]:
  [0,1,2].map(i=>{const c=Math.round(i*cols/(k+(port?1.5:.8)));return{c,r:(port?1:.6)+i*(rows-1.6)/k,span:cols-c,hr:port?1.6:1.4};});
 const sizes=chunks.map((ch,i)=>Math.min(J.fitSize(ch,p.font,pl[i].span*cw-cw*.12,pl[i].hr*rh*.9,{track:-.01}),u*.28));
 if(k>1&&p.variant==='a')for(let i=1;i<k;i++)sizes[i]=Math.min(sizes[i],sizes[0]*.6,Math.min(...sizes.slice(1)));
 const mains=[],boxes=[];
 for(let i=0;i<k;i++){
  const ch=chunks[i],q=pl[i],size=sizes[i],x=X(q.c)+cw*.06,y=Y(q.r)+size*.56,w=J.measure({text:ch,font:p.font,size,track:-.01}).w;
  boxes.push([x,Y(q.r),x+w,Y(q.r)+size*1.12]);
  const h=Math.max(3,u*.005);add('swiss.mainRule.'+i,'rule',X(q.c)-1,Y(q.r)-h-1,X(q.c)+Math.min(q.span*cw,w+cw*.12)+1,Y(q.r)+1);
  const main=A.centerCircle.sourceUnits({text:ch,font:p.font,size,x,y,align:'left',track:-.01,mi:i*3},{...cut,layout:'center',area:null,params:{}},plan,{holdOnly:true});
  if(!main)return null;
  units.push(...main.units.map(g=>({...g,owner:'swiss.main.'+i+'.'+g.owner})));mains.push(main);
 }
 const cands=[[cols-2,rows-2,2],[0,rows-2,2],[cols-2,0,2],[cols-1,rows-1,1],[0,rows-1,1],[cols-1,0,1]],free=cands.find(([c,r,s])=>!boxes.some(b=>b[0]<X(c+s)&&b[2]>X(c)&&b[1]<Y(r+s)&&b[3]>Y(r)));
 if(free){
  const [c,r,s]=free,bw=s*cw,bh=s*rh,cx=X(c)+bw/2,cy=Y(r)+bh/2,R=Math.min(bw,bh)*.46;
  // outBack(t,1.2) is bounded by 1+4*s^3/(27*(s+1)^2).
  const q=1+4*1.2**3/(27*2.2**2),pad=1;
  if(p.shape==='bar')add('swiss.accent','shape',X(c)+cw*.06-pad,cy-rh*.12-pad,X(c)+cw*.06+(bw-cw*.12)*q+pad,cy+rh*.12+pad);
  else add('swiss.accent','shape',cx-R*q-pad,cy-R*q-pad,cx+R*q+pad,cy+R*q+pad);
 }
 if(p.label)plain({text:'JIZURA  ／  No.'+String(Math.max(0,cut.line|0)+1).padStart(2,'0')+'  ／  '+J.fmtTime(cut.start),font:mono,size:ls*.8,track:.25,x:m*.62,y:(gy0+gy1)/2,rot:-90},'swiss.sideLabel');
 const ranges=Object.fromEntries(['x0','x1','y0','y1'].map(key=>[key,[
  (key.endsWith('0')?Math.min:Math.max)(...mains.map(x=>x.bbRanges[key][0])),
  (key.endsWith('0')?Math.min:Math.max)(...mains.map(x=>x.bbRanges[key][1]))]]));
 const cachedPartial=cut.exit==='cut'&&cut.outDur>0,decorRanges=cachedPartial?Object.fromEntries(['x0','x1','y0','y1'].map(key=>[key,[Math.min(...mains.map(x=>x.bbRangesAny[key][0])),Math.max(...mains.map(x=>x.bbRangesAny[key][1]))]])):ranges;
 for(const d of cut.decor||[]){const parts=A.memphisUnits({W,H,P:d,bbRanges:[decorRanges],includeFallback:cachedPartial});if(!parts?.length)return null;units.push(...parts);}
 return {units,bbRanges:ranges,scope:'native-hold'};
}
A.gridUnits=gridUnits;
})();
