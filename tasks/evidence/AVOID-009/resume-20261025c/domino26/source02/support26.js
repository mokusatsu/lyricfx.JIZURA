/* Isolated conditional supports. No clip, exclusion, AA claim beyond accepted48/69. */
(()=>{'use strict';
const P=J.placement.tilesProof48,K=J.placement.bulbsProof69.kernel,need=(v,c)=>{if(!v)throw Error(c);},same=J.placement.bulbsProof69.same;
function support26(record,primitive,ordinal){
 const r={...record,ordinal};need(r.role==='primary'&&/^dominoes\.row\.[01]$/.test(r.owner),'DOMINO26_UNKNOWN_OWNER');
 need(r.state.alpha>0&&r.state.filter==='none'&&!r.state.shadowBlur&&!r.state.shadowOffsetX&&!r.state.shadowOffsetY&&['rgba(0, 0, 0, 0)','transparent'].includes(r.state.shadowColor)&&!r.state.dash.length,'DOMINO26_PAINT_EFFECT');
 const activeStyle=r.kind.startsWith('stroke')?'strokeStyle':'fillStyle';
 need(typeof r.state[activeStyle]==='string','DOMINO26_ACTIVE_STYLE:'+activeStyle);
 need(r.matrix.every(Number.isFinite),'DOMINO26_STYLE_MATRIX');
 let bounds,foundation;
 if(r.kind==='fillText'||r.kind==='fill'&&r.path.some(c=>c.key==='arc')){
  if(r.kind==='fillText')need(r.args.length===3&&r.state.textAlign==='center'&&r.state.textBaseline==='middle','DOMINO26_TEXT_SCOPE');
  else need(primitive?.kind==='circle'&&r.args.length===0&&r.path.length===1&&r.path[0].key==='arc'&&r.path[0].args.length===5&&r.path[0].args[2]>=0&&same(r.path[0].matrix,r.matrix),'DOMINO26_CIRCLE_PATH');
  const atom=K.atom(r);bounds=Object.fromEntries(Object.entries(atom.bounds).map(([k,v])=>[k,K.directed(v,!k.endsWith('0'))]));foundation=atom.foundation;
 }else{
  need(['fill','stroke'].includes(r.kind)&&r.args.length===0&&primitive&&['poly','rrect','line'].includes(primitive.kind),'DOMINO26_UNKNOWN_PAINT');
  need(r.kind!=='stroke'||primitive.kind==='line'&&primitive.args[0].length===2,'DOMINO26_TWO_POINT_LINE');
  const s=P.support({...r,primitive});bounds=s.bounds;foundation=s.foundation;
 }
 return{role:'primary',owner:r.owner,ordinal,semanticKey:JSON.stringify({ordinal,owner:r.owner,pass:r.pass,kind:r.kind,state:r.state,text:r.kind==='fillText'?r.args[0]:null}),bounds,foundation};
}
window.domino26Support=Object.freeze({support:support26});
})();
