/* Pure outward support for an observed finite affine CTM. Does not qualify
   Canvas acquisition, glyph metrics, stroke state or the raster AA premise. */
(()=>{'use strict';const A=J.placement,dv=new DataView(new ArrayBuffer(8)),need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c})};
function next(x,up){need(Number.isFinite(x),'DOMINO82C_FINITE');if(x===0)return up?Number.MIN_VALUE:-Number.MIN_VALUE;dv.setFloat64(0,x);dv.setBigUint64(0,dv.getBigUint64(0)+((x>0)===up?1n:-1n));const y=dv.getFloat64(0);need(Number.isFinite(y),'DOMINO82C_OVERFLOW');return y}
const lo=x=>next(x,false),hi=x=>next(x,true);
function affineBox(b,m,{localPad=0,devicePad=2}={}){need(b&&['x0','y0','x1','y1'].every(k=>Number.isFinite(b[k]))&&b.x0<=b.x1&&b.y0<=b.y1,'DOMINO82C_BOX');need(Array.isArray(m)&&m.length===6&&m.every(Number.isFinite),'DOMINO82C_MATRIX');need(Number.isFinite(localPad)&&localPad>=0&&Number.isFinite(devicePad)&&devicePad>=0,'DOMINO82C_PAD');const x=[lo(b.x0-localPad),hi(b.x1+localPad)],y=[lo(b.y0-localPad),hi(b.y1+localPad)];
 const axis=(a,c,t)=>{const ax=a>=0?[lo(a*x[0]),hi(a*x[1])]:[lo(a*x[1]),hi(a*x[0])],cy=c>=0?[lo(c*y[0]),hi(c*y[1])]:[lo(c*y[1]),hi(c*y[0])];return[lo(lo(lo(ax[0]+cy[0])+t)-devicePad),hi(hi(hi(ax[1]+cy[1])+t)+devicePad)]};
 const X=axis(m[0],m[2],m[4]),Y=axis(m[1],m[3],m[5]);return{x0:X[0],y0:Y[0],x1:X[1],y1:Y[1]};}
Object.defineProperty(A,'dominoAffineSupport82c',{value:Object.freeze({affineBox,next,sourceOnly:true,certificateIssuer:false})});})();
