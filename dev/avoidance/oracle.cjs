// Verification only. No production/planner imports. Input is already in stage pixels.
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
function segmentDistance(c,a,b){const d=sub(b,a),n=dot(d,d),t=n?Math.max(0,Math.min(1,dot(sub(c,a),d)/n)):0;
  return Math.hypot(c[0]-a[0]-t*d[0],c[1]-a[1]-t*d[1]);
}
function polygonClear(circle,points,margin=0){if(!circle || ![circle.cx,circle.cy,circle.r,margin].every(Number.isFinite) || circle.r<0 || margin<0 || !Array.isArray(points) || points.length<3 || points.some(p=>!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)))throw new TypeError("unmeasured or invalid ink boundary");
  let inside=false;
  const c=[circle.cx,circle.cy];
  for(let i=0,j=points.length-1;
  i<points.length;
  j=i++){
    const a=points[j],b=points[i];
    if(segmentDistance(c,a,b)<=circle.r+margin+1e-7)return false;
    if((a[1]>c[1])!==(b[1]>c[1])&&c[0]<(b[0]-a[0])*(c[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }return !inside;
}
function circlePixels(W,H,center,radius){return {cx:W*center.x,cy:H*center.y,r:Math.min(W,H)*radius};
}
module.exports={segmentDistance,polygonClear,circlePixels};
