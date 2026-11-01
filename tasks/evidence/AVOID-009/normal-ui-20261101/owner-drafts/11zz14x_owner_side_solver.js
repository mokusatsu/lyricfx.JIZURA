/* Bounded side candidates for already measured native mixed/scatter owners. */
(()=>{'use strict';
const A=J.placement,rect=b=>[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]],shift=(b,d)=>({x0:b.x0+d[0],y0:b.y0+d[1],x1:b.x1+d[0],y1:b.y1+d[1]}),overlap=(a,b)=>Math.max(0,Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0))*Math.max(0,Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0));
function ownerSideCandidate({components,plan,cut,scale,holdWindow,region}){
 const W=plan.W,H=plan.H,a=cut.area,sw=W*a.w,sh=H*a.h,items=components.items,furniture=components.fixedFurniture;
 if(items.length<2||!holdWindow||!a||a.angle)return null;
 // The bounded trial covers a single native left-to-right reading run only.
 if(items.some((v,i)=>v.mi!==i||i&&(v.itemBounds.x0+v.itemBounds.x1)<=items[i-1].itemBounds.x0+items[i-1].itemBounds.x1))return null;
 const project=A.nativeBlockCircle.viewportProject(plan,cut,scale,{allCutsBloom:true,allCutsChroma:true,activeRange:holdWindow.real,bloomSigma:4.5}),circle={cx:region.center.x*W,cy:region.center.y*H,r:region.radius*Math.min(W,H)},pad=Math.max(2,.005*Math.min(W,H))+1;
 const inFrame=b=>b.x0>=0&&b.y0>=0&&b.x1<=W&&b.y1<=H;
 const pass=u=>{const local={bounds:u.bounds,body:u.bounds,renderScale:scale,ghost:u.ghost},body=A.bounds([project(local,{x:0,y:0},plan,cut,true)]),b=A.bounds([project(local,{x:0,y:0},plan,cut)]),clipped={x0:Math.max(0,b.x0),y0:Math.max(0,b.y0),x1:Math.min(W,b.x1),y1:Math.min(H,b.y1)};return inFrame(body)&&(clipped.x0>=clipped.x1||clipped.y0>=clipped.y1||A.clear([rect(clipped)],circle,pad));};
 // Static native extras are fixed and must themselves avoid the obstacle.
 if(!furniture.every(pass))return null;
 let checked=0;
 for(const fraction of [.18,.3])for(const sign of [-1,1])for(let split=1;split<items.length;split++){
  const offsets=items.map((_,i)=>[0,(i<split?sign:-sign)*sh*fraction]),moved=items.map((u,i)=>shift(u.itemBounds,offsets[i]));
  let valid=true;
  for(let i=0;i<items.length&&valid;i++){
   for(let j=0;j<i;j++)if(overlap(moved[i],moved[j])>overlap(items[i].itemBounds,items[j].itemBounds)+1e-6){valid=false;break;}
   for(const f of furniture)if(overlap(moved[i],f.bounds)>overlap(items[i].itemBounds,f.bounds)+1e-6){valid=false;break;}
   if(valid&&!pass({bounds:moved[i]}))valid=false;
  }
  if(!valid)continue;
  // One source program was already measured; only promising candidates build
  // decoration. Bound the expensive checks rather than regenerate per trial.
  if(++checked>3)return null;
  const complete=A.movedMemphisSupport({components,offsets,cacheRanges:[],plan,cut,scale,holdWindow});if(!complete||!complete.units.every(u=>{const b=u.bounds,c={x0:Math.max(0,b.x0),y0:Math.max(0,b.y0),x1:Math.min(W,b.x1),y1:Math.min(H,b.y1)};return inFrame(u.body)&&(c.x0>=c.x1||c.y0>=c.y1||A.clear([rect(c)],circle,pad));}))continue;
  return {offsets,units:complete.units};
 }
 return null;
}
A.ownerSideCandidate=ownerSideCandidate;
})();
