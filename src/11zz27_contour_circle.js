/* Approved contour composition: half-size rings left, native lyric/attachments right.
 * One source construction plus continuous ring/camera bounds; no frame generation.
 * The caller must admit noPost before applying this recipe. */
(() => {
'use strict';
const A=J.placement,S=A.simpleCircle,E=J.E,ids=new Set(['contour']),native=J.LAYOUTS.contour.render;
const rect=b=>[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]];
const handles=(plan,cut)=>ids.has(cut.layout)&&!cut.placementTrajectory&&(S.preparedCut(plan,cut)||A.placementCutPreserved86cm(plan,cut)===false);
function prepare(plan,cut,{scale=1,region,previous}={}){
 const unsupported=reason=>({diagnostic:{cut:cut.index,status:'unsupported',reason,requiresNoPost:true}}),p=cut.params,W=plan.W,H=plan.H,fx=cut.effectFx||plan.fx,st=cut.effectStyle||plan.style;
 if(cut.area||cut.enter!=='cut'||cut.exit!=='cut'||(cut.groupExit??cut.exit)!=='cut'||cut.hold!=='still'||(cut.treat||'none')!=='none'||cut.cam!=='push'||(cut.contentScale??1)!==1||cut.lyricSize!=null||cut.emphasis||cut.drawing||cut.effectsOnly||cut.group!=null||cut.groupId!=null||cut.mask||cut.maskP||(cut.decor||[]).length||cut.trans&&cut.trans!=='none'||cut.effectFx||cut.effectStyle)return unsupported('UNSUPPORTED_CONTOUR_SOURCE_SCOPE');
 if((plan.events||[]).length||(plan.beats||[]).length||plan.energy||plan.customEffects?.length)return unsupported('UNSUPPORTED_CONTOUR_GLOBAL_EFFECT');
 if(!Number.isFinite(scale)||scale<=0||scale>4||![W,H,fx.motion??.7,fx.chroma??.7,st.ghost??1,cut.motionScale??1].every(Number.isFinite)||W<=0||H<=0||(fx.motion??.7)<0||(fx.motion??.7)>1||(fx.chroma??.7)<0||(st.ghost??1)<0||(cut.motionScale??1)<0||(cut.motionScale??1)>1)return unsupported('UNSUPPORTED_CONTOUR_PARAMETER_RANGE');
 if(!p||!J.FONTS[p.font]||!J.FONTS[p.fb]||![-1,1].includes(p.side)||![4,5,6].includes(p.rings)||!Number.isFinite(p.speed)||p.speed<.25||p.speed>.5||!['sub','accent'].includes(p.col)||!['low','center'].includes(p.place)||typeof cut.text!=='string'||!cut.text.trim()||cut.text.length>64||J.glyphCount(cut.text)>16)return unsupported('UNSUPPORTED_CONTOUR_INPUT');
 // Native source keeps its own chunking, fit, nominal bbox and attachment text.
 // Reading that structure once avoids a second copy of the source chunk algorithm.
 const sourceCut={...cut,simpleCircleRecipe:undefined},program=A.sourceFormulaBase.construct(Object.create(J.Renderer.prototype),plan,sourceCut,{time:1.5,sourceD:true}),items=program.events.filter(e=>e.kind==='item'),body=items.find(e=>e.args[0].placementMain)?.args[0],attached=program.events.filter(e=>e.kind==='item'||e.kind==='line');
 if(!body||!items.some(e=>e.args[0].ghost===false)||!attached.length)return unsupported('UNSUPPORTED_CONTOUR_SOURCE_STRUCTURE');
 const t0=cut.text.replace(/\s+/g,''),chars=[...t0],big=chars.find(c=>J.isKanji(c))||chars.find(c=>!J.isPunct(c)&&!J.isSmallKana(c))||chars[0]||'',port=H>W*1.08,bs=Math.min(H*.95,W*(port?1.05:.7))*.5;
 const ctx=A.measurementContext();ctx.font=J.fontCSS(p.fb,bs);ctx.textAlign='center';ctx.textBaseline='middle';const m=ctx.measureText(big),ink=[m.actualBoundingBoxLeft,m.actualBoundingBoxRight,m.actualBoundingBoxAscent,m.actualBoundingBoxDescent];
 if(!ink.every(Number.isFinite))return unsupported('UNSUPPORTED_CONTOUR_INK');
 // ph,grow in [0,1]: every original ring/background/fill/final outline is
 // contained by this maximum round stroke. Half-size recomputes gap and lw.
 const gap=bs*.03,lw=Math.max(1.2,bs*.0028),stroke=Math.max(2*gap*p.rings+gap*.6+lw,lw*1.6),pad=1+stroke/2;
 const hero={bounds:{x0:-ink[0]-pad,y0:-ink[2]-pad,x1:ink[1]+pad,y1:ink[3]+pad},renderScale:scale},bodyBounds=A.bounds(attached.flatMap(e=>e.polygons)),bodyLocal={bounds:bodyBounds,body:bodyBounds,renderScale:scale};hero.body=hero.bounds;
 const motion=cut.motionScale??1,chroma=(fx.chroma??.7)*(st.ghost??1),maxScale=1+.03*(fx.motion??.7)*motion;
 // Only push and native chroma passes are admitted. noPost has no bloom,
 // resampling, event displacement or filter. Raster guard is in stage units.
 function projection(ghost){return(local,offset)=>{
  const b=local.bounds,points=[];for(const x of [b.x0+offset.x,b.x1+offset.x])for(const y of [b.y0+offset.y,b.y1+offset.y])for(const s of [1,maxScale])points.push([W/2+(x-W/2)*s,H/2+(y-H/2)*s]);
  const q=A.bounds([points]),dx=2/scale+(ghost?3.4*chroma*H/1080*motion:0),dy=2/scale+(ghost?1.9*chroma*H/1080*motion:0);return rect({x0:q.x0-dx,y0:q.y0-dy,x1:q.x1+dx,y1:q.y1+dy});
 };}
 const heroDomain=S.domain(plan,cut,region,projection(false)),bodyDomain=S.domain(plan,cut,region,projection(true)),margin=heroDomain.pad;
 const side=(domain,direction)=>{const r=domain.regions.find(r=>r.direction===direction);return {...r,x0:Math.max(margin,r.x0),y0:margin,x1:Math.min(W-margin,r.x1),y1:H-margin};},left=side(heroDomain,'left'),right=side(bodyDomain,'right');
 const prior=previous?.plan?.cuts.find(c=>c.index===cut.index)?.simpleCircleRecipe?.contour;
 let heroPlace=heroDomain.place(hero,left),bodyPlace=bodyDomain.place(bodyLocal,right),reusedPosition=false;
 if(prior?.W===W&&prior.H===H&&prior.body.text===body.text&&prior.body.size===body.size&&prior.big===big&&prior.bs===bs){const he=heroDomain.fit(hero,prior.heroPosition,left),be=bodyDomain.fit(bodyLocal,prior.bodyOffset,right);if(he&&be){heroPlace={offset:prior.heroPosition.slice(),envelope:he};bodyPlace={offset:prior.bodyOffset.slice(),envelope:be};reusedPosition=true;}}
 if(!heroPlace||!bodyPlace)return {diagnostic:{cut:cut.index,status:'insufficient-space',reason:'NO_SAFE_CONTOUR_LEFT_RIGHT_COMPOSITION',requiresNoPost:true,heroBounds:hero.bounds,bodyBounds,allClockGeneration:false}};
 const recipe={W,H,scale,big,bs,heroPosition:heroPlace.offset,bodyOffset:bodyPlace.offset,body:{text:body.text,font:body.font,size:body.size,x:body.x,y:body.y,track:body.track,lead:body.lead},requiresNoPost:true};
 return {area:null,recipe,diagnostic:{cut:cut.index,status:'safe',method:'contour-half-hero-native-body-continuous-bounds',direction:'left-right',heroScale:.5,bodySize:body.size,heroEnvelope:heroPlace.envelope,bodyEnvelope:bodyPlace.envelope,envelope:[...heroPlace.envelope,...bodyPlace.envelope],requiresNoPost:true,reusedPosition,allClockGeneration:false,structuralPasses:1}};
}
function render(env,r){
 if(env.W!==r.W||env.H!==r.H||env.scale!==r.scale)throw Object.assign(Error('Contour recipe viewport changed'),{code:'UNSUPPORTED_CONTOUR_RUNTIME_VIEWPORT'});
 const {ctx,sc,cut}=env,p=cut.params,bs=r.bs,[bx,by]=r.heroPosition,big=r.big,lineC=p.col==='accent'?sc.accent:sc.sub,out=1-E.inCubic(env.pOut),cin=E.outCubic(J.clamp(env.lt/.5))*out;
 // Original direct ring painter: same order, alpha, grow and phase clocks.
 if(env.pass==='main'&&big&&cin>.01){
  const K=p.rings,gap=bs*.03,lw=Math.max(1.2,bs*.0028),ph=((env.ltb*p.speed)%1+1)%1,grow=E.outCubic(J.clamp(env.lt/.9));
  ctx.save();try{
   ctx.font=J.fontCSS(p.fb,bs);ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
   for(let k=K;k>=1;k--){const wk=2*gap*(k-1+ph)*grow+gap*.6,a=(k===K?1-ph:1)*(1-.1*k)*cin;if(a<=.01)continue;
    ctx.globalAlpha=a*.8;ctx.strokeStyle=lineC;ctx.lineWidth=wk+lw;ctx.strokeText(big,bx,by);
    ctx.globalAlpha=.94*cin;ctx.strokeStyle=sc.bg;ctx.lineWidth=Math.max(.1,wk-lw);ctx.strokeText(big,bx,by);
   }
   ctx.globalAlpha=.94*cin;ctx.fillStyle=sc.bg;ctx.fillText(big,bx,by);
   ctx.globalAlpha=cin;ctx.strokeStyle=lineC;ctx.lineWidth=lw*1.6;ctx.strokeText(big,bx,by);
  }finally{ctx.restore();}
 }
 const it=r.body,bb=J.mainDraw(env,{...it,x:it.x+r.bodyOffset[0],y:it.y+r.bodyOffset[1],color:sc.fg}),la=E.outCubic(J.clamp((env.lt-.3)/.4))*out;
 if(bb&&la>0){const u=Math.min(env.W,env.H),ls=J.clamp(u*.024,13,32)*.9;
  env.line([[bb.x0,bb.y0-ls*1.2],[bb.x0+(bb.x1-bb.x0)*la,bb.y0-ls*1.2]],lineC,Math.max(1,u*.0015),.8,false);
  env.draw({text:`${big}  ─  No.${String(Math.max(0,cut.line|0)+1).padStart(2,'0')}`,font:env.st.fonts.mono?.[0]||'mono',size:ls,track:.2,align:'left',x:bb.x0,y:bb.y0-ls*2.3,color:sc.sub,alpha:la,ghost:false});
 }
 return bb;
}
A.contourCircle=Object.freeze({ids,handles,prepare});
J.LAYOUTS.contour.render=function(env){const r=env.cut.simpleCircleRecipe?.contour;return r?render(env,r):native(env);};
})();
