/* AVOID-009 contour26: pure design prototype; no registry or Canvas integration.
 * All returns are source expectations or candidate specifications, never safety certificates.
 * Retains the native expression order for scale=1. */
'use strict';
const clamp=x=>Math.max(0,Math.min(1,x));
const E={inCubic:x=>{x=clamp(x);return x*x*x;},outCubic:x=>{x=clamp(x);return 1-Math.pow(1-x,3);}};
const fail=(code,details)=>({status:'unsupported',code,details,geometryCertified:false});
function nativeHero(x){
 const {W,H,params:p,lt,ltb,pOut,pass,big}=x;
 const port=H>W*1.08;
 const bs=Math.min(H*.95,W*(port?1.05:.7));
 const bx=W/2+p.side*W*(port?.12:.2),by=H*.5;
 const out=1-E.inCubic(pOut),cin=E.outCubic(clamp((lt-0)/Math.max(.01,.5)))*out;
 const paints=[];
 // Absence in A/B is deliberate, even when the body has ghost passes.
 if(pass==='main'&&big&&cin>.01){
  const K=p.rings,gap=bs*.03,lw=Math.max(1.2,bs*.0028);
  const ph=((ltb*p.speed)%1+1)%1;
  const grow=E.outCubic(clamp(lt/.9));
  for(let k=K;k>=1;k--){
   const wk=2*gap*(k-1+ph)*grow+gap*.6;
   const a=(k===K?1-ph:1)*(1-.1*k)*cin;
   if(a<=.01)continue;
   paints.push({kind:'strokeText',args:[big,bx,by],alpha:a*.8,paint:'lineC',lineWidth:wk+lw,k});
   paints.push({kind:'strokeText',args:[big,bx,by],alpha:.94*cin,paint:'bg',lineWidth:Math.max(.1,wk-lw),k});
  }
  paints.push({kind:'fillText',args:[big,bx,by],alpha:.94*cin,paint:'bg'});
  paints.push({kind:'strokeText',args:[big,bx,by],alpha:cin,paint:'lineC',lineWidth:lw*1.6,k:0});
 }
 return {status:'expectation-only',geometryCertified:false,bs,bx,by,cin,paints};
}
const family=Object.freeze({W:960,H:540,lang:'ja',text:'風の先へ',seed:1205,params:Object.freeze({font:'dela',fb:'dela',side:1,rings:6,speed:.375,col:'sub',place:'low'}),fps:60,enter:'cut',exit:'cut',hold:'still',treat:'none',cam:'push',camP:Object.freeze({a:.022,dir:1}),contentScale:1,motionScale:1});
// These are proposed explicit size policies, not claims that any candidate fits.
const scales=Object.freeze([1,.85,.7,.55,.5]);
function scope(x){
 if(x.sourceKnown!==true)return fail('CONTOUR26_UNKNOWN_SOURCE');
 if(x.drawing||x.effectsOnly)return fail('CONTOUR26_CUSTOM_DRAWING');
 if(x.lyricSize!=null||x.contentScale!==1||x.motionScale!==1)return fail('CONTOUR26_EXPLICIT_SIZE_OR_SCALE');
 if(x.W!==960||x.H!==540||x.lang!=='ja'||x.text!==family.text||x.seed!==1205)return fail('CONTOUR26_FIXED_FAMILY_ONLY');
 const p=x.params;if(!p||Object.keys(p).length!==Object.keys(family.params).length||Object.keys(family.params).some(k=>!Object.is(p[k],family.params[k])))return fail('CONTOUR26_PARAMS_OUTSIDE_FAMILY');
 if(x.enter!=='cut'||x.exit!=='cut'||x.hold!=='still'||x.treat!=='none'||x.cam!=='push'||x.fps!==60||x.camP?.a!==.022||x.camP?.dir!==1)return fail('CONTOUR26_OPERATIONS_OUTSIDE_FAMILY');
 if(x.extraInputsAbsent!==true)return fail('CONTOUR26_EXTRA_INPUTS_UNREVIEWED');
 return {status:'eligible-for-source-study',geometryCertified:false};
}
function recipes(x){
 const s=scope(x);if(s.status==='unsupported')return s;
 const rows=[{id:'native-joint',native:true,heroScale:1,bodySize:'native',bodyWrap:'native-8',metadata:'attached-to-returned-body-bb',positions:'zero-then-max8-common-translations'}];
 for(const heroScale of scales)for(const heroSide of[-1,1])rows.push({id:'related-field-'+heroSide+'-'+heroScale,native:false,heroScale,heroSide,bodySide:-heroSide,bodySize:'native',bodyWrap:'native-8',metadata:'attached-to-returned-body-bb',positions:'max8-common-translations-after-relative-anchor-fit',quality:{minHeroScale:.5,minHeroBodySizeRatio:3,sourceGlyphUnchanged:true,noNewCrop:true,heroBodySeparation:true}});
 return {status:'candidate-specifications-only',geometryCertified:false,recipes:rows,limits:{recipes:11,positionsPerRecipe:8,totalPlacementEvaluations:88},entryExitCircleRelaxation:false};
}
module.exports={nativeHero,scope,recipes,family,scales};
