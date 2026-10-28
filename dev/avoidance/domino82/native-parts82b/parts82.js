/* Source invocation descriptors, not Canvas paint/support certificates.
   Supplied palette must be the unchanged native colour helpers' results. */
(()=>{'use strict';const A=J.placement;
const PIPS = [[], [[0, 0]], [[-1, -1], [1, 1]], [[-1, -1], [0, 0], [1, 1]], [[-1, -1], [1, -1], [-1, 1], [1, 1]], [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]];
function ground(env,l,row,palette){return{kind:'line',matrix:null,args:[row.ground,palette.ground,row.groundWidth,.5*J.E.outExpo(J.clamp((env.lt-0)/Math.max(.01,.3)))*(1-J.E.inCubic(env.pOut)),false]};}
function tile(env,l,pose,{i,char},palette){const{w,h,thick}=l,{M,vis,ti}=pose;if(vis<=0)return[];const out=[],T=(x,y)=>[M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5]],push=(kind,args,matrix=null)=>out.push({kind,matrix,args});
 push('poly',[[T(-w/2,0),T(w/2,0),T(w/2+w*.1,w*.04),T(-w/2+w*.1,w*.04)],palette.dark,.25*vis,false]);
 push('poly',[[T(w/2,-h+thick*.4),T(w/2+thick,-h+thick*.4+thick*.3),T(w/2+thick,thick*.3),T(w/2,0)],palette.side,vis,false]);
 push('rrect',[-w/2,-h,w,h,w*.1,palette.face,vis,env.lt<.6&&env.pOut<=0],M);
 if(env.cut.params.pips){push('line',[[[-w*.36,-h*.47],[w*.36,-h*.47]],palette.divider,Math.max(1,w*.03),vis,false],M);const pn=J.h(env.cut.seed,i,11)%7,pr=w*.07;for(const[a,b]of PIPS[pn])push('circle',[a*w*.22,-h*.235+b*w*.22,pr,palette.pip,null,0,vis,false],M);}
 const cyT=env.cut.params.pips?-h*.735:-h/2;push('glyph',[{text:char,font:env.cut.params.font,size:w*.7,x:0,y:cyT,color:palette.text,alpha:vis,noHold:!['still','jitter','breathe','glitchtick'].includes(env.cut.hold),mi:Math.max(0,ti)/Math.max(.005,env.cut.stagger||.04)}],M);return out;
}
Object.defineProperty(A,'dominoNativeParts82b',{value:Object.freeze({ground,tile,sourceOnly:true,certificateIssuer:false})});})();
