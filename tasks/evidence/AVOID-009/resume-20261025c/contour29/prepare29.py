from pathlib import Path
import json,hashlib,ast,subprocess
H=Path('/dev/shm/avoid009-contour26/source29');R=Path('/workspace/lyricfx.JIZURA');P=H.parent
b=(P/'source28/contour28-browser.js').read_text()
old="f.family.replace(/[\"']/g,'').trim()==='Dela Gothic One'&&f.status==='loaded'"
new="f.family.replace(/[\"']/g,'').trim()===J.FONTS.dela.family.replace(/[\"']/g,'').trim()&&String(f.weight)===String(J.FONTS.dela.weight)&&f.status==='loaded'"
assert old in b;b=b.replace(old,new,1)
old="compact=async r=>{const{pixels,...rest}=r;return{...rest,pixelSHA256:await sha(pixels)};},rows=[];"
new="compact=async r=>{const{pixels,...rest}=r;const digest=await sha(pixels);let binary='';for(let i=0;i<pixels.length;i+=32768)binary+=String.fromCharCode(...pixels.subarray(i,i+32768));await window.contour29StoreRGBA({sha256:digest,base64:btoa(binary)});return{...rest,pixelSHA256:digest};},rows=[];const emitRow=async row=>{rows.push(row);await window.contour29StoreRow(row);};"
assert old in b;b=b.replace(old,new,1);b=b.replace('rows.push({t,own,','await emitRow({t,own,')
(H/'browser29.js').write_text(b)
(H/'driver29.js').write_text(r'''(async function initContour29(input){
const run=await runLayoutsBFixture(J,{layout:'contour',control:'fullstage',ghost:true,W:960,H:540,seed:1205,text:'風の先へ',params:{font:'dela',fb:'dela',side:1,rings:6,speed:.375,col:'sub',place:'low'}},{newPath:false,fonts:input.fonts,renderInitial:false,exportDataURL:false});
run.plan.duration=4.150001;run.plan.fps=60;run.plan.fx.koma=0;run.plan.lyricAvoidanceIndex.regions[0].end=run.plan.duration;if(J.lang!==run.plan.lang)J.setLang(run.plan.lang);
const audit=window.layoutsBFixtureFontAudit;for(const f of input.fonts.faces){const actual=audit.faces.find(a=>a.id===f.id);if(!actual||actual.sha256!==f.sourceSHA256||actual.family!==f.family||actual.status!=='loaded')throw Error('CONTOUR29_FIXTURE_FONT_BINDING');}
return{plan:run.plan,fontAudit:audit,actualFontPolicy:'existing hash-pinned editorial fixture; dela ID maps sans-bold; not real Dela font qualification',rendererUsedForInitialPaint:false};
})''')
