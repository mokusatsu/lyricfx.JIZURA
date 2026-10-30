/* Approved upper-circle / one-row domino composition. Original source X and
 * all native paints stay unchanged; only the existing source row-Y seam moves.
 * Continuous angle extrema replace any clock/frame enumeration. */
(() => {
'use strict';
const A=J.placement,S=A.simpleCircle,G=A.dominoNativeGeometry82a,P=A.dominoNativeParts82b,Shift=A.dominoSourceShift82j,ids=new Set(['dominoes']),native=J.LAYOUTS.dominoes.render,ID=[1,0,0,1,0,0];
const handles=(plan,cut)=>ids.has(cut.layout)&&!cut.placementTrajectory&&(S.preparedCut(plan,cut)||A.placementCutPreserved86cm(plan,cut)===false);
const rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
// y(theta)=x*sin(theta)+y*cos(theta); only endpoints and its stationary
// angles can be extrema. These are geometric critical points, not time samples.
function rotatedY(points,pivot,from,to,w){
 let low=Infinity,high=-Infinity;
 for(const [px,py]of points){const x=px-pivot*w/2,theta=Math.atan2(x,py),angles=[from,to];
  for(let k=-2;k<=2;k++){const a=theta+k*Math.PI;if(a>from&&a<to)angles.push(a);}
  for(const a of angles){const y=x*Math.sin(a)+py*Math.cos(a);low=Math.min(low,y);high=Math.max(high,y);}
 }
 return {low,high};
}
function prepare(plan,cut,{scale=1,region,previous}={}){
 const unsupported=reason=>({diagnostic:{cut:cut.index,status:'unsupported',reason,requiresNoPost:true}}),W=plan.W,H=plan.H,p=cut.params,fx=plan.fx,st=plan.style;
 if(cut.area||cut.enter!=='cut'||cut.exit!=='cut'||(cut.groupExit??cut.exit)!=='cut'||cut.hold!=='still'||(cut.treat||'none')!=='none'||cut.cam!=='push'||(cut.contentScale??1)!==1||cut.lyricSize!=null||cut.emphasis||cut.drawing||cut.effectsOnly||cut.group!=null||cut.groupId!=null||cut.mask||cut.maskP||(cut.decor||[]).length||cut.trans&&cut.trans!=='none'||cut.effectFx||cut.effectStyle||(cut.effects||[]).length)return unsupported('UNSUPPORTED_DOMINO_SOURCE_SCOPE');
 if((plan.events||[]).length||(plan.beats||[]).length||plan.energy||(plan.customEffects||[]).length)return unsupported('UNSUPPORTED_DOMINO_GLOBAL_EFFECT');
 if(!Number.isFinite(scale)||scale<=0||scale>4||![W,H,fx.motion??.7,fx.chroma??.7,st.ghost??1,cut.motionScale??1].every(Number.isFinite)||W<=0||H<=0||(fx.motion??.7)<0||(fx.motion??.7)>1||(fx.chroma??.7)<0||(st.ghost??1)<0||(cut.motionScale??1)<0||(cut.motionScale??1)>1)return unsupported('UNSUPPORTED_DOMINO_PARAMETER_RANGE');
 if(!p||!J.FONTS[p.font]||!['light','ink'].includes(p.face)||typeof p.pips!=='boolean'||typeof cut.text!=='string'||cut.text.length>64||J.glyphCount(cut.text)<2||J.glyphCount(cut.text)>7)return unsupported('UNSUPPORTED_DOMINO_ONE_ROW_INPUT');
 // Keep the existing upper-only domain. A normal/central circle or native
 // two-row chain retains its previous unsupported path.
 if(!region||region.center.y<0||region.center.y>.25)return unsupported('UNSUPPORTED_DOMINO_UPPER_CIRCLE');
 const env={W,H,cut,sc:cut.palette||st.schemes[cut.scheme%st.schemes.length],st:{...st,...(cut.fonts?{fonts:cut.fonts}:{})},lt:1.5,ltb:1.5,pOut:0,pass:'main'},input=A.dominoSourceInput82d(env);
 if(!input||input.rowsD.length!==1)return unsupported('UNSUPPORTED_DOMINO_TWO_ROWS');
 const l=input.layout,row=input.rowsD[0],ground=G.row(env,l,0,row.length),{w,h,lean}=l;
 // The native ground is fixed to the moving chain. Original butt-line support
 // uses the same conservative miter guard as the existing source sampler.
 let y0=ground.yF-ground.groundWidth*5,y1=ground.yF+ground.groundWidth*5,tiles=0,parts=0;
 const back=1.6,overshoot=4*back**3/(27*(back+1)**2);
 for(let j=0;j<row.length;j++){
  if(row[j]===' ')continue;
  const i=tiles++,nativeParts=P.tile(env,l,{M:ID,vis:1,ti:l.T0+i*l.dT},{i,char:row[j]},input.palette),points=[];
  for(const part of nativeParts){const a=part.args;parts++;
   if(part.kind==='poly')points.push(...a[0]);
   else if(part.kind==='rrect')points.push(...rect(a[0],a[1],a[0]+a[2],a[1]+a[3]));
   else if(part.kind==='circle')points.push(...rect(a[0]-a[2],a[1]-a[2],a[0]+a[2],a[1]+a[2]));
   else if(part.kind==='line'){const b=A.bounds([rect(Math.min(...a[0].map(p=>p[0])),Math.min(...a[0].map(p=>p[1])),Math.max(...a[0].map(p=>p[0])),Math.max(...a[0].map(p=>p[1])))]),pad=a[2]*5;points.push(...rect(b.x0-pad,b.y0-pad,b.x1+pad,b.y1+pad));}
   else if(part.kind==='glyph')points.push(...A.itemGeometry(a[0],ID,{pass:'main',scale:1}).polygons.flat());
   else return unsupported('UNSUPPORTED_DOMINO_NATIVE_PART');
  }
  const entry=(j===0?88:lean)*J.DEG,exit=(j===row.length-1?88:lean)*J.DEG;
  const bounds=[rotatedY(points,-1,-entry,entry*overshoot,w),rotatedY(points,1,0,exit,w),rotatedY(points,0,0,0,w)];
  for(const b of bounds){y0=Math.min(y0,ground.yF+b.low);y1=Math.max(y1,ground.yF+b.high);}
 }
 if(!tiles||![y0,y1].every(Number.isFinite))return unsupported('UNSUPPORTED_DOMINO_EMPTY_SUPPORT');
 const circle={cx:region.center.x*W,cy:region.center.y*H,r:region.radius*Math.min(W,H)},margin=Math.max(2,.005*Math.min(W,H))+1,motion=cut.motionScale??1,maxScale=1+.03*(fx.motion??.7)*motion,chroma=(fx.chroma??.7)*(st.ghost??1),raster=2/scale,ghost=1.9*chroma*H/1080*motion;
 let lower=0,upper=Infinity;
 for(const s of [1,maxScale]){
  lower=Math.max(lower,(circle.cy+circle.r+margin+raster+ghost-H/2)/s+H/2-y0,(margin+raster+ghost-H/2)/s+H/2-y0);
  upper=Math.min(upper,(H-margin-raster-ghost-H/2)/s+H/2-y1);
 }
 if(!(Number.isFinite(lower)&&Number.isFinite(upper)&&lower<upper))return {diagnostic:{cut:cut.index,status:'insufficient-space',reason:'NO_SAFE_DOMINO_VERTICAL_INTERVAL',requiresNoPost:true,sourceY:{y0,y1},interval:{lower,upper},allClockGeneration:false}};
 // Native first when already clear, then the approved interior/midpoint policy.
 // No X shift, font/tile scale, row change or additional clip is introduced.
 const prior=previous?.plan?.cuts.find(c=>c.index===cut.index)?.simpleCircleRecipe?.domino,candidates=[...(lower===0?[0]:[]),...(prior&&prior.dy>=lower&&prior.dy<=upper?[prior.dy]:[]),(lower+upper)/2],dy=candidates[0];
 const recipe={W,H,scale,dy,requiresNoPost:true};
 return {area:null,recipe,diagnostic:{cut:cut.index,status:'safe',direction:'down',method:'domino-native-parts-continuous-angle-extrema',sourceY:{y0,y1},interval:{lower,upper},dy,rows:1,tiles,parts,candidates:candidates.length,reusedPosition:prior?.dy===dy,sourceXClipUnchanged:true,yStageStrict:true,circleStrict:true,requiresNoPost:true,allClockGeneration:false}};
}
A.dominoCircle=Object.freeze({ids,handles,prepare});
J.LAYOUTS.dominoes.render=function(env){const r=env.cut.simpleCircleRecipe?.domino;if(!r)return native(env);if(env.W!==r.W||env.H!==r.H||env.scale!==r.scale)throw Object.assign(Error('Domino recipe viewport changed'),{code:'UNSUPPORTED_DOMINO_RUNTIME_VIEWPORT'});return Shift.withShift(env,r.dy,()=>native(env));};
})();
