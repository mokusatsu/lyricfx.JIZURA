/* Offline exact legacy quality predicates. No certificate/renderer registration.
   Support derives actual observed paint/metrics; source clip is the only clip. */
(()=>{'use strict';const A=J.placement,P=A.tilesProof48,need=(v,code,details)=>{if(!v)throw Object.assign(Error(code),{code,details})},same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function support(p,g){
 need(p.state.alpha>=0&&p.state.alpha<=1&&p.state.filter==='none'&&!p.state.shadowBlur&&!p.state.shadowOffsetX&&!p.state.shadowOffsetY&&['rgba(0, 0, 0, 0)','transparent'].includes(p.state.shadowColor)&&!p.state.dash.length,'BILLBOARD81E_PAINT_EFFECT');
 let r={...p,primitive:{kind:p.kind==='stroke'?'line':'poly'}};
 if(p.kind==='fill'&&p.path.some(c=>c.key==='arc')){need(p.path.length===1&&p.path[0].key==='arc'&&same(p.path[0].matrix,p.matrix),'BILLBOARD81E_SOURCE_ARC');const[x,y,rad,a,b]=p.path[0].args;need(a===0&&b===J.TAU&&rad>=0,'BILLBOARD81E_FULL_CIRCLE');r={...r,kind:'fillRect',args:[x-rad,y-rad,2*rad,2*rad]};}
 const s=P.support(r),b=s.bounds;
 if(p.owner.endsWith('.cone')||p.owner==='billboard.board.illumination'){
  need(p.clips.length===1&&g.sourceOwnClip&&same(p.clips[0].matrix,g.sourceOwnClip.matrix)&&p.clips[0].path.length===1&&p.clips[0].path[0].key==='rect'&&same(p.clips[0].path[0].args,g.sourceOwnClip.rectangle),'BILLBOARD81E_ORIGINAL_CLIP_ONLY');
  const c=P.support({...p,kind:'fillRect',args:g.sourceOwnClip.rectangle,matrix:g.sourceOwnClip.matrix,primitive:null}).bounds;
  b.x0=Math.max(b.x0,c.x0);b.y0=Math.max(b.y0,c.y0);b.x1=Math.min(b.x1,c.x1);b.y1=Math.min(b.y1,c.y1);
 }else need(p.clips.length===0,'BILLBOARD81E_NO_NEW_CLIP');
 return{owner:p.owner,ordinal:p.ordinal??0,bounds:b,foundation:s.foundation,sourceOwnClipOnly:p.clips.length===1};
}
function quality(native,direct,explicitSize){
 const n=native.catalog,g=direct.catalog,ratio=g.mainSize/n.mainSize,floor=Math.max(18,.035*Math.min(...g.stage)),secondaryFloor=Math.max(12,.02*Math.min(...g.stage));
 const norm=s=>s.replace(/\s/g,'');need(norm(n.text)===norm(g.text)&&same(n.clock,g.clock)&&same(n.params,g.params)&&same(n.sourceInputs,g.sourceInputs)&&same(n.lampStates,g.lampStates),'BILLBOARD81E_NATIVE_SEMANTICS_CLOCK');
 need(Math.abs(ratio-(g.recipe81?.fontRatio??1))<1e-12,'BILLBOARD81E_EXPLICIT_FONT_STAGE');
 need(ratio>=.7-1e-8&&g.mainSize>=floor&&(!explicitSize||Math.abs(ratio-1)<=1e-8),'BILLBOARD81E_READABLE_SIZE',{ratio,size:g.mainSize,floor,explicitSize});
 const metadata=g.sourceCalls.filter(c=>c.owner.startsWith('billboard.tag.')),original=n.sourceCalls.filter(c=>c.owner.startsWith('billboard.tag.'));
 need(metadata.length===original.length&&metadata.every((c,i)=>{const a=c.arguments[0],b=original[i].arguments[0];return a.text===b.text&&a.font===b.font&&a.size>=b.size*.7&&a.size>=Math.min(b.size,secondaryFloor); }),'BILLBOARD81E_METADATA_READABILITY');
 const glyphs=direct.paint.filter(p=>p.kind.endsWith('Text')&&p.owner==='billboard.lyric.main'&&p.state.alpha>0),tags=direct.paint.filter(p=>p.kind.endsWith('Text')&&p.owner.startsWith('billboard.tag.')&&p.state.alpha>0);
 const words=sample=>sample.paint.filter(p=>p.kind.endsWith('Text')&&p.owner==='billboard.lyric.main').map(p=>p.args[0]);need(same(words(native),words(direct)),'BILLBOARD81E_ALL_SOURCE_GLYPHS_ORDER');
 // Real unmasked text metrics must remain inside the face and below metadata.
 const face=P.support({...direct.paint[0],kind:'fillRect',args:[g.bx,g.y0,g.bw,g.bh],matrix:g.root,primitive:null}).bounds;
 const inside=p=>{const b=support(p,g).bounds;return b.x0>=face.x0&&b.x1<=face.x1&&b.y0>=face.y0&&b.y1<=face.y1;};
 need([...glyphs,...tags].every(inside),'BILLBOARD81E_TEXT_FACE');
 const field=P.support({...direct.paint[0],kind:'fillRect',args:[g.bx+g.bw*.08,g.y0+g.bh*.17+(g.params.tag?g.bh*.03:0),g.bw*.84,g.bh*.66],matrix:g.root,primitive:null}).bounds;
 need(glyphs.every(p=>{const b=support(p,g).bounds;return b.x0>=field.x0&&b.x1<=field.x1&&b.y0>=field.y0&&b.y1<=field.y1;}),'BILLBOARD81E_MAIN_WRITING_FIELD');
 for(const a of glyphs)for(const b of tags){const x=support(a,g).bounds,y=support(b,g).bounds;need(x.x1<y.x0||y.x1<x.x0||x.y1<y.y0||y.y1<x.y0,'BILLBOARD81E_TAG_LYRIC_OVERLAP');}
 return{ratio,mainSize:g.mainSize,floor,secondaryFloor,metadata:metadata.length,measuredGlyphPaints:glyphs.length,writingFieldPassed:true};
}
Object.defineProperty(A,'billboardQuality81',{value:Object.freeze({support,quality,sourceOnly:true,certificateIssuer:false})});
})();
