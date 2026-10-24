/* SOURCE ONLY: actual canonical JA AFTER, frozen native JA BEFORE. No product overlay. */
(()=>{'use strict';const clean=x=>JSON.parse(JSON.stringify(x)),need=(v,m)=>{if(!v)throw Error(m);},options={noPost:true,noHud:true,noTrans:true,noMedia:true,noForeground:true,fast:true};
window.tilesMedia01={async setup({fonts,after,expectedRevision}){
 const r=await runLayoutsBFixture(J,{layout:'tiles',control:'off',ghost:true,W:960,H:540,text:'風の先へ',seed:1205,params:{from:'right',score:true}},{newPath:false,fonts,renderInitial:false,exportDataURL:false});
 const p=r.plan;p.duration=4.150001;p.fps=60;p.fx.koma=0;p.lyricAvoidanceIndex.enabled=true;p.lyricAvoidanceIndex.regions[0].end=4.150001;J.setLang('ja');
 const sourceJSON=JSON.stringify(p),sourcePlan=clean(p),c=p.cuts[0];need(c.start===0&&c.end===4&&c.dur===4&&c.seed===1205&&c.text==='風の先へ','Exact SOURCE48 fixture required');
 if(after){r.plan=J.finalizePlacementPlan(p,{layoutsD:true});const tr=r.plan.cuts[0].placementTrajectory;need(tr?.sourceAdapter===expectedRevision&&tr?.certificate?.revision===expectedRevision&&tr?.safety==='certified-hold-adapter','Accepted SOURCE49 lineage required');}
 const cv=document.createElement('canvas');cv.width=960;cv.height=540;const ctx=cv.getContext('2d');need(ctx.getContextAttributes().alpha===true,'Default alpha Canvas required');
 window.tilesMedia01State={r,p,cv,ctx,after,sourceJSON,renderJSON:JSON.stringify(r.plan),warnings:[]};const s=window.tilesMedia01State,warn=console.warn.bind(console);console.warn=(...a)=>{s.warnings.push(a.map(v=>v?.message||String(v)));warn(...a);};
 return{sourcePlan,renderPlan:clean(r.plan),fontAudit:window.layoutsBFixtureFontAudit,fontLoaded:r.observation.fontLoaded,dpr:devicePixelRatio,canvasAttrs:ctx.getContextAttributes(),options,qualifiedLanguage:J.lang,nativeFunction:J.LAYOUTS.tiles.render.toString()};
},async frame(j){const s=window.tilesMedia01State,observations=[];s.warnings=[];const t=j/60,b=new ArrayBuffer(8),dv=new DataView(b);dv.setFloat64(0,t,false);
 s.r.renderer.frame(s.ctx,s.r.plan,t,{...options,placementObservation:o=>observations.push(o)});
 need(JSON.stringify(s.p)===s.sourceJSON&&JSON.stringify(s.r.plan)===s.renderJSON,'Immutable plans changed');
 const rgba=s.ctx.getImageData(0,0,960,540).data,pixelHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',rgba))).map(v=>v.toString(16).padStart(2,'0')).join('');
 return{j,time:t,timeBits:dv.getBigUint64(0,false).toString(),pixelHash,observations:clean(observations),warnings:clean(s.warnings),png:s.cv.toDataURL('image/png')};}};
})();
