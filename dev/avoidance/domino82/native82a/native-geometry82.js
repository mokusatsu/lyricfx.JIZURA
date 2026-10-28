/* Unregistered native arithmetic extraction. rowsD must be the unchanged
   source rowsOf result. No ownership, clipping, support or safe certificate. */
(()=>{'use strict';const A=J.placement,E=J.E;
function layout(env,rowsD){const {W,H}=env,cut=env.cut,Pm=cut.params,u=Math.min(W,H),n=J.glyphCount(cut.text);if(n<1)return null;
 const rows=rowsD.length,per=Math.max(...rowsD.map(r=>r.length)),asp=Pm.pips?1.9:1.45,gapK=.5;
 const w=Math.min(W*.84/(per+(per-1)*gapK),H*.72/(rows*asp+(rows-1)*.35),u*.2),h=w*asp,g=w*gapK,thick=w*.12;
 const lean=Math.asin(J.clamp((g-thick*.2)/h,0,.95))/J.DEG,T0=.1,dT=J.clamp(cut.dur*.3/n,.04,.09),rise=.26;
 const outDur=Math.max(.3,Math.min(cut.dur*.35,(cut.outDur||.3)+.25)),oStart=cut.dur-outDur;
 return{n,rows,per,asp,gapK,w,h,g,thick,lean,T0,dT,rise,outDur,oStart};}
function row(env,l,r,cnt){const {W,H}=env,{rows,h,w,g}=l,yF=H/2+(r-(rows-1)/2)*(h+w*.35)+h/2;
 return{yF,ground:[[W/2-(cnt*(w+g))/2-w*.4,yF],[W/2+(cnt*(w+g))/2+w*.4,yF]],groundWidth:Math.max(1,Math.min(W,H)*.0018)};}
function pose(env,l,{j,i,cnt,yF}){const {w,g,lean,T0,dT,rise,oStart}=l,lt=env.lt,xc=env.W/2+(j-(cnt-1)/2)*(w+g),ti=T0+i*dT,fu=J.clamp((lt-ti)/rise);let th=0,pivot=0;
 if(fu<1){th=-(j===0?88:lean)*(1-E.outBack(fu,1.6));pivot=-1}
 const fo=(lt-oStart-j*.05)/.3;if(fo>0){th=(j===cnt-1?88:lean)*E.inQuad(Math.min(1,fo));pivot=1}
 const px=xc+pivot*w/2,py=yF,ca=Math.cos(th*J.DEG),sa=Math.sin(th*J.DEG),M=[ca,sa,-sa,ca,px-(ca*pivot*w/2)+0,py-sa*pivot*w/2];
 const vis=J.clamp((lt-ti+.08)/.1)*(1-E.inCubic(J.clamp((env.pOut-.7)/.3)));
 return{xc,ti,fu,fo,th,pivot,px,py,ca,sa,M,vis};}
Object.defineProperty(A,'dominoNativeGeometry82a',{value:Object.freeze({layout,row,pose,sourceOnly:true,certificateIssuer:false})});})();
