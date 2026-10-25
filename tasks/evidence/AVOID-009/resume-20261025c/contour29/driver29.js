(async function initContour29(input){
const run=await runLayoutsBFixture(J,{layout:'contour',control:'fullstage',ghost:true,W:960,H:540,seed:1205,text:'風の先へ',params:{font:'dela',fb:'dela',side:1,rings:6,speed:.375,col:'sub',place:'low'}},{newPath:false,fonts:input.fonts,renderInitial:false,exportDataURL:false});
run.plan.duration=4.150001;run.plan.fps=60;run.plan.fx.koma=0;run.plan.lyricAvoidanceIndex.regions[0].end=run.plan.duration;if(J.lang!==run.plan.lang)J.setLang(run.plan.lang);
const audit=window.layoutsBFixtureFontAudit;for(const f of input.fonts.faces){const actual=audit.faces.find(a=>a.id===f.id);if(!actual||actual.sha256!==f.sourceSHA256||actual.family!==f.family||actual.status!=='loaded')throw Error('CONTOUR29_FIXTURE_FONT_BINDING');}
return{plan:run.plan,fontAudit:audit,actualFontPolicy:'existing hash-pinned editorial fixture; dela ID maps sans-bold; not real Dela font qualification',rendererUsedForInitialPaint:false};
})