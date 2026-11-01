/* Circle-ranked bounded native owner arrangements; coarse candidates run first. */
(()=>{'use strict';
const A=J.placement,rect=b=>[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]],shift=(b,d)=>({x0:b.x0+d[0],y0:b.y0+d[1],x1:b.x1+d[0],y1:b.y1+d[1]}),overlap=(a,b)=>Math.max(0,Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0))*Math.max(0,Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0));
function ownerSideCandidate({components,plan,cut,scale,holdWindow,region,previous}){
 const W=plan.W,H=plan.H,a=cut.area,sw=W*a.w,sh=H*a.h,items=components.items,furniture=components.fixedFurniture;
 if(items.length<2||!holdWindow||!a||a.angle)return null;
 // A single native left-to-right run is required, including nontrivial order.
 if(items.some((v,i)=>v.mi!==i||i&&(v.itemBounds.x0+v.itemBounds.x1)<=items[i-1].itemBounds.x0+items[i-1].itemBounds.x1))return null;
 const domain=A.simpleCircle.domain(plan,{...cut,simpleCircleClip:true},region),circle=domain.circle,pad=domain.pad,
       project=A.nativeBlockCircle.viewportProject(plan,cut,scale,{allCutsBloom:true,allCutsChroma:true,activeRange:holdWindow.real,bloomSigma:4.5}),
       pre=A.nativeBlockCircle.viewportProject(plan,cut,scale,{allCutsChroma:true,activeRange:holdWindow.real,preClip:true}),
       native={x0:a.x*W,y0:a.y*H,x1:(a.x+a.w)*W,y1:(a.y+a.h)*H};
 const stage=(u,fn=project,body=false)=>A.bounds([fn({bounds:u.bounds,body:u.bounds,renderScale:scale,ghost:u.ghost},{x:0,y:0},plan,cut,body)]),inRect=(b,r)=>b.x0>=r.x0&&b.y0>=r.y0&&b.x1<=r.x1&&b.y1<=r.y1,inFrame=b=>inRect(b,{x0:0,y0:0,x1:W,y1:H});
 const clipped=b=>({x0:Math.max(0,b.x0),y0:Math.max(0,b.y0),x1:Math.min(W,b.x1),y1:Math.min(H,b.y1)}),clear=b=>{b=clipped(b);return b.x0>=b.x1||b.y0>=b.y1||A.clear([rect(b)],circle,pad);};
 if(!furniture.every(u=>inFrame(stage(u,project,true))&&clear(stage(u))))return null;
 const regions=domain.regions.filter(r=>r.x0<r.x1&&r.y0<r.y1).sort((x,y)=>y.score-x.score);if(!regions.length)return null;
 // Keep the original native run order in each region; candidate offsets are
 // source-local and are reprojected through the real camera for every owner.
 const center=b=>[(b.x0+b.x1)/2,(b.y0+b.y1)/2],groupBounds=group=>({x0:Math.min(...group.map(i=>items[i].itemBounds.x0)),y0:Math.min(...group.map(i=>items[i].itemBounds.y0)),x1:Math.max(...group.map(i=>items[i].itemBounds.x1)),y1:Math.max(...group.map(i=>items[i].itemBounds.y1))}),intersect=(r)=>({x0:Math.max(r.x0,native.x0),y0:Math.max(r.y0,native.y0),x1:Math.min(r.x1,native.x1),y1:Math.min(r.y1,native.y1)});
 const possible=[];
 for(const main of regions){const side=regions.filter(r=>r.direction!==main.direction&&(['up','down'].includes(r.direction)!==['up','down'].includes(main.direction)));
 for(const sr of [null,...side])for(let split=sr?1:items.length;split<=items.length;split++){
  if(sr&&split===items.length)continue;
  const rs=[intersect(main),...(sr?[intersect(sr)]:[])];if(rs.some(r=>r.x0>=r.x1||r.y0>=r.y1))continue;
  const groups=[items.map((_,i)=>i).slice(0,split),...(sr?[items.map((_,i)=>i).slice(split)]:[])],offsets=Array(items.length);
  for(let g=0;g<groups.length;g++){const b=groupBounds(groups[g]),p=center(b),t=center(rs[g]),d=[t[0]-native.x0-p[0],t[1]-native.y0-p[1]];for(const i of groups[g])offsets[i]=d;}
  if(offsets.length!==items.length||!items.every((_,i)=>Array.isArray(offsets[i])&&offsets[i].length===2&&offsets[i].every(Number.isFinite)))continue;
  const moved=items.map((u,i)=>shift(u.itemBounds,offsets[i]));
  // A row has a common nonempty vertical intersection across *all* glyphs,
  // with strictly increasing x; overlap chains cannot fake a single line.
  const row=indices=>Math.max(...indices.map(i=>moved[i].y0))<Math.min(...indices.map(i=>moved[i].y1))&&indices.every((i,j)=>!j||(moved[i].x0+moved[i].x1)>(moved[indices[j-1]].x0+moved[indices[j-1]].x1));
  let valid=groups.every(row);
  if(valid&&groups.length===2){const first=groups[0],second=groups[1],all=first.concat(second),oneLine=offsets[first[0]][1]===offsets[second[0]][1]&&row(all),firstAbove=Math.max(...first.map(i=>moved[i].y1))<Math.min(...second.map(i=>moved[i].y0));valid=oneLine||firstAbove;}
  for(let i=0;i<items.length&&valid;i++){
   for(let j=0;j<i;j++)if(overlap(moved[i],moved[j])>overlap(items[i].itemBounds,items[j].itemBounds)+1e-6){valid=false;break;}
   for(const f of furniture)if(overlap(moved[i],f.bounds)>overlap(items[i].itemBounds,f.bounds)+1e-6){valid=false;break;}
   const u={bounds:moved[i]},body=stage(u,project,true),local=stage(u,pre,false),r=i<split?main:sr;
   if(valid&&(!inRect(body,r)||!inRect(local,native)||!inFrame(body)||!clear(stage(u))))valid=false;
  }
  if(!valid)continue;
  const b={x0:Math.min(...moved.map(x=>x.x0)),y0:Math.min(...moved.map(x=>x.y0)),x1:Math.max(...moved.map(x=>x.x1)),y1:Math.max(...moved.map(x=>x.y1))},w=b.x1-b.x0,h=b.y1-b.y0,rw=main.x1-main.x0,rh=main.y1-main.y0;
  const fitness=w>0&&h>0&&rw>0&&rh>0?Math.abs(Math.log((w/h)/(rw/rh))):Infinity,movement=offsets.reduce((n,d)=>n+Math.hypot(d[0]/sw,d[1]/sh),0)/offsets.length;
  possible.push({offsets,direction:main.direction,region:main,fitness,movement});
 }
 }
 const old=previous?.policy===A.simpleCircle.policy?previous.diagnostics?.find(d=>d.cut===cut.index&&d.status==='safe')?.direction:null;
 possible.sort((a,b)=>b.region.score-a.region.score||a.fitness-b.fitness||a.movement-b.movement||Number(b.direction===old)-Number(a.direction===old));
 let expensive=0;
 for(const candidate of possible){
  // Exhausting a resource budget does not prove the remaining candidates fail.
  if(expensive++>=3)return {exhausted:true};
  const offsets=candidate.offsets;
  const complete=A.movedMemphisSupport({components,offsets,cacheRanges:[],plan,cut,scale,holdWindow});
  if(!complete||!complete.units.every(u=>inFrame(u.body)&&clear(u.bounds)))continue;
  const immutable=Object.freeze(offsets.map(d=>Object.freeze(d.slice())));
  return {offsets:immutable,units:complete.units,direction:candidate.direction,region:candidate.region};
 }

 return null;
}
A.ownerSideCandidate=ownerSideCandidate;
})();
