/* AVOID-007 opt-in editorial source adapters. No default product activation. */
(()=>{
'use strict';
const A=J.placement,ids=['credits','typeSpecimen'],bad=(code,message)=>{const e=new Error(message);e.code=code;throw e;},rect=(a,b,c,d)=>[[a,b],[c,b],[c,d],[a,d]],plain=t=>[...String(t).replace(/\s/g,'')].join('');
const semantic=g=>g.kind==='credits'?{kind:g.kind,variant:g.variant,rows:g.rows,rowOrigins:g.rowOrigins,nativeFs:g.nativeFs,rowH:g.rowH,block:g.block,speed:g.speed,off:g.off,nativeMainText:g.nativeMainText,mainFont:g.mainFont,creditFont:g.creditFont,repeatCap:g.repeatCap,signedRemainder:g.signedRemainder,bandH:g.bandH}:{kind:g.kind,grid:g.grid,num:g.num,cells:g.cells};
function validate(plan,cut,g){
 if(!g||g.kind!==cut.layout)bad('EDITORIAL_SOURCE_MISSING','Missing full source editorial geometry');
 if(cut.layout==='credits'){
  if(!(cut.params.speed>=.035&&cut.params.speed<=.06)||!Number.isFinite(cut.params.off))bad('EDITORIAL_SCROLL_DOMAIN','Credits speed outside native .035..06 or nonfinite offset');
  if(!cut.layoutBEvaluationRange.every(t=>Number.isFinite((t-cut.start+cut.params.off)*cut.params.speed*plan.H)))bad('EDITORIAL_SCROLL_DOMAIN','Credits scroll arithmetic outside finite range');
  if(g.rowOrigins.some(r=>r.supported===false))bad('EDITORIAL_SOURCE_MAPPING','Native credit chunks cannot be mapped to ordered original codepoint occurrences');
  if(g.rows.length>48||g.rows.some(r=>[...r.value].length>256))bad('EDITORIAL_RECORD_LIMIT','Credits finite semantic source budget exceeded');
 }else if(g.cells.some(c=>!J.FONTS[c.font]))bad('EDITORIAL_FONT_MISSING','A real font key is required for every specimen cell');
}
function envelope(program,plan,cut,project=A.cameraEnvelope){
 const g=program.nativeGeometry;validate(plan,cut,g);const out=[];
 for(const e of program.events){if(e.role!=='primary')bad('EDITORIAL_OWNERSHIP','Every editorial draw must remain primary');for(let p of A.layoutsBClip(e)){
  if(cut.layout==='typeSpecimen'&&e.kind==='item'&&e.args[0].placementSource&&!e.args[0].placementMain){const b=A.bounds([p]);p=rect(b.x0,b.y0,b.x1,b.y1+1.5*g.captionSize);}
  out.push(project([p],plan,cut,e.kind==='item'?20:10));
 }}
 if(!out.length)bad('EDITORIAL_EMPTY','No full source events');
 return [...new Map(out.map(p=>[JSON.stringify(p),p])).values()];
}
function fitBounds(program,plan,cut,envelopes){
 if(cut.layout!=='credits')return A.bounds(envelopes);
 // Scroll enters/leaves the original Canvas. Only source scrolling records may
 // cross its implicit screen edge; main lyric and owned separator must fit.
 const fixed=program.events.filter(e=>e.nativeGroup==='main'||e.nativeGroup==='credit-separator').flatMap(e=>A.layoutsBClip(e).map(p=>A.cameraEnvelope([p],plan,cut,e.kind==='item'?20:10))),all=A.bounds(envelopes),b=A.bounds(fixed);
 return {...all,y0:Math.min(0,b.y0),y1:Math.max(plan.H,b.y1)};
}
function candidates(plan,cut,program,explicitSize){
 const g=program.nativeGeometry;validate(plan,cut,g);const W=plan.W,H=plan.H,M=Math.min(W,H),out=[];
 if(cut.layout==='credits'){
  // Credits prefer a paired lyric / scrolling-record lane, then a narrower
  // main wrap. Native fs,rowH,block,speed,off and signed remainder remain clocks.
  for(const per of [2,3,1])for(const right of [true,false])out.push({strategy:'credits-native-clock-paired-lanes',fontScale:1,mainText:J.splitLines(cut.text,per),mainSize:g.nativeMainSize,mainX:W*(right?.22:.78),creditX:W*(right?.76:.24),separatorX:W*(right?.65:.35),creditSize:Math.max(g.nativeFs,Math.max(18,.035*M),Math.max(12,.02*M)/.62),quality:{scrollClock:'signed JS remainder; unchanged native rowH/block/speed/off/rep<12',nativeCrop:'source scrolling records only; screen implicit crop after camera'}});
 }else{
  const n=g.cells.length,source=program.events.filter(e=>e.kind==='item'&&e.args[0].placementSource).map(e=>e.args[0]),captions=program.events.filter(e=>e.kind==='item'&&!e.args[0].placementSource).map(e=>e.args[0]),gap=.015*M,margin=.035*M,cap=Math.max(12,.02*M),padding=3;
  // Keep each native face's measured actual size first. Then apply only the
  // adopted explicit discrete reductions to every original specimen face.
  // Cell packing never calls fitSize to obtain an implicit extra reduction.
  for(const scale of (explicitSize?[1]:[1,.95,.9,.85,.8,.75,.7])){
   const measures=source.map((it,i)=>{
    const size=it.size*scale,b=A.bounds(A.itemGeometry({...it,size,x:0,y:0,align:'center'},[1,0,0,1,0,0],{pass:'main',scale:1}).polygons),w=Math.max(b.x1-b.x0+2*padding,...labelAtoms(captions[i].text).map(text=>J.measure({text,font:captions[i].font,size:cap,track:.08}).w)),label=wrapLabel(captions[i].text,captions[i].font,cap,w),labelH=J.measure({text:label,font:captions[i].font,size:cap,track:.08}).h,h=labelH+.8*cap+(b.y1-b.y0)+(i?1.5*cap:0)+2*padding;
    return {w,h,size,b,labelH};
   });
   let used=0,greedy=0;for(const m of measures){const width=used+(greedy?gap:0)+m.w;if(width>W-2*margin)break;used=width;greedy++;}
   for(const split of [...new Set([Math.max(1,greedy),1,Math.ceil(n/2)])])for(const mainTop of [true,false]){
    const first=measures.slice(0,split),second=measures.slice(split),heights=[Math.max(...first.map(m=>m.h)),second.length?Math.max(...second.map(m=>m.h)):0],cells=[];
    let x=margin;
    measures.forEach((m,i)=>{const row=i<split?0:1;if(i===split)x=margin;const top=row===0?mainTop:!mainTop,y=top?margin:H-margin-heights[row];cells.push({x,y,w:m.w,h:m.h,textSize:m.size,textX:x+padding-m.b.x0,textY:y+m.labelH+.8*cap+padding-m.b.y0});x+=m.w+gap;});
    out.push({strategy:scale===1?'specimen-native-size-label-wrap-bands':'specimen-discrete-size-ordered-bands',fontScale:scale,specimenCells:cells,captionSize:cap,quality:{allFaces:true,globalIndices:true,mainDominance:true,sizeRule:'native measured face size multiplied by declared discrete scale; no intrinsic fit reduction',nativeFaceSizes:source.map(it=>it.size),actualFaceSizes:measures.map(m=>m.size)}});
   }
  }

 }
 return out.slice(0,64);
}
function sourceMapping(native,prepared,cut){
 const expected=semantic(native.nativeGeometry),actual=semantic(prepared.nativeGeometry);
 if(JSON.stringify(expected)!==JSON.stringify(actual))bad('EDITORIAL_SOURCE_MAPPING','Editorial source rows/cell identity, fonts or native clocks changed');
 const items=p=>p.events.filter(e=>e.role==='primary'&&e.kind==='item').map(e=>{const it=e.args[0],s=it.placementSource;return {group:e.nativeGroup,text:s?plain(it.text):String(it.text).replace(/\n/g,''),font:it.font,source:s?{copy:s.copy,start:s.start,end:s.end,offsets:s.originalCodepointOffsets,text:s.text}:null,metadata:it.placementMetadata?.id??null};});
 const shapes=p=>p.events.filter(e=>e.role==='primary'&&e.kind!=='item').map(e=>({kind:e.kind,group:e.nativeGroup}));
 for(const [label,fn]of [['items',items],['shapes',shapes]])if(JSON.stringify(fn(native))!==JSON.stringify(fn(prepared)))bad('EDITORIAL_COPY_MAPPING','Editorial '+label+' count/source/copy/font/owned mapping changed');
 if(cut.layout==='typeSpecimen'){
  const labels=p=>p.events.filter(e=>e.role==='primary'&&e.kind==='item'&&!e.args[0].placementSource).map(e=>e.args[0].text),original=labels(native);
  labels(prepared).forEach((text,i)=>{let offset=0;const breaks=[];for(const ch of text){if(ch==='\n')breaks.push(offset);else offset+=ch.length;}offset=0;for(const atom of labelAtoms(original[i])){const end=offset+atom.trimEnd().length;if(breaks.some(b=>b>offset&&b<end))bad('EDITORIAL_LABEL_ATOM','Specimen caption number, word or style/weight split across lines');offset+=atom.length;}});
 }
 return {expected,actual,items:items(native),shapes:shapes(native),complete:true,rule:'Full source-envelope enumeration; all finite row/repeat/label/value or face/caption/rule identities, not visible-time samples'};
}
function quality(program,plan,cut,{native=null,explicitSize=false}={}){
 const items=program.events.filter(e=>e.role==='primary'&&e.kind==='item'),scale=cut.contentScale??1,M=Math.min(plan.W,plan.H),primary=items.filter(e=>e.args[0].placementSource),metadata=items.filter(e=>!e.args[0].placementSource);
 if(!primary.length||primary.some(e=>e.args[0].size*scale<Math.max(18,.035*M))||metadata.some(e=>e.args[0].size*scale<Math.max(12,.02*M)))bad('READABILITY_FLOOR','Editorial text below primary/metadata readability floor');
 if(explicitSize&&native){const original=native.events.filter(e=>e.role==='primary'&&e.kind==='item');if(items.some((e,i)=>e.args[0].size+1e-8<original[i].args[0].size))bad('EXPLICIT_SIZE_PRESERVED','Explicit editorial text size cannot be reduced by reflow');}
 if(cut.layout==='typeSpecimen'){
  const main=primary.filter(e=>e.args[0].placementMain).map(e=>e.args[0].size),other=primary.filter(e=>!e.args[0].placementMain).map(e=>e.args[0].size);
  const original=native?.events.filter(e=>e.kind==='item'&&e.args[0].placementSource).map(e=>e.args[0]),nativeMain=original?.find(it=>it.placementMain)?.size,nativeOther=original?.filter(it=>!it.placementMain).map(it=>it.size),required=nativeMain&&nativeOther?.length?nativeMain/Math.max(...nativeOther):1;
  if(Math.max(...main)/Math.max(...other)+1e-8<required)bad('SPECIMEN_HIERARCHY','Main specimen must retain its measured native size ratio plus original main rule/accent/role');
 }
 return {faceSizeChanges:cut.layout==='typeSpecimen'?primary.map((e,i)=>({copy:e.args[0].placementSource.copy,font:e.args[0].font,native: native?.events.filter(e=>e.kind==='item'&&e.args[0].placementSource)[i]?.args[0].size,actual:e.args[0].size,reason:'declared discrete specimen scale; native metric ink packed into ordered bands'})):undefined,minPrimary:Math.min(...primary.map(e=>e.args[0].size*scale)),minMetadata:Math.min(...metadata.map(e=>e.args[0].size*scale))};
}
// Retain every source space. A word owns its following spaces, so wrapping
// inserts only newlines. Keep the final face-style and numeric weight together.
function labelAtoms(text){const atoms=String(text).match(/\S+[^\S\n]*|[^\S\n]+|\n/g)||[];if(atoms.length>1&&/^\d{3,4}\s*$/.test(atoms[atoms.length-1])&&/^[A-Z][A-Z0-9_-]*\s+$/i.test(atoms[atoms.length-2]))atoms.splice(-2,2,atoms[atoms.length-2]+atoms[atoms.length-1]);return atoms;}
function wrapLabel(text,font,size,width){const lines=[];let line='';for(const atom of labelAtoms(text)){if(atom==='\n'){lines.push(line);line='';continue;}if(line&&J.measure({text:line+atom,font,size,track:.08}).w>width){lines.push(line);line='';}line+=atom;}if(line)lines.push(line);return lines.join('\n');}
A.layoutsBEditorial={wrapLabel,supports:id=>ids.includes(id),envelope,fitBounds,candidates,sourceMapping,quality};
})();
