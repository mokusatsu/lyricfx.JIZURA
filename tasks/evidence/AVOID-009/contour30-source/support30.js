/* Contour-local wrapper only. Uses existing69 exact dyadic atom and68 predicates. */
(function contourSupport30(J){'use strict';
const B=J.placement.bulbsProof69,K=B.kernel,G=J.placement.bulbsGeometry68;
const need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c});};
function one(p,ordinal){
 const s=p.state;need(p.role==='primary'&&/^contour\.(hero|body|metadata|line)$/.test(p.owner),'C30_OWNER');
 need(s.blend==='source-over'&&s.filter==='none'&&!s.shadowBlur&&!s.shadowOffsetX&&!s.shadowOffsetY&&['rgba(0, 0, 0, 0)','transparent'].includes(s.shadowColor)&&!s.dash.length,'C30_EFFECT_STATE');
 need(['fillText','strokeText','stroke'].includes(p.kind),'C30_DRAW_KIND');
 // Only the active paint style is constrained; inactive nonstring markers stay in raw.
 need(typeof s[p.kind.startsWith('stroke')?'strokeStyle':'fillStyle']==='string','C30_ACTIVE_STYLE');
 need(Number.isFinite(s.alpha)&&s.alpha>=0&&s.alpha<=1,'C30_ALPHA');if(s.alpha===0)return null;
 let q=p,rule='unchanged-fill-text';
 if(p.kind==='strokeText'){
  need(p.owner==='contour.hero'&&s.lineJoin==='round'&&p.args.length===3&&s.lineWidth>0&&Number.isFinite(s.lineWidth),'C30_ROUND_TEXT');
  // Existing atom computes F(lineWidth)*F(miterLimit/2); one makes exact halfWidth.
  q={...p,state:{...s,miterLimit:1}};rule='round-text-exact-half-linewidth';
 }else if(p.kind==='stroke'){
  need(p.owner==='contour.line'&&s.lineCap==='butt'&&p.path.length===2&&p.path[0].key==='moveTo'&&p.path[1].key==='lineTo'&&p.path.every(c=>B.same(c.matrix,p.matrix)),'C30_TWO_POINT_LINE');
  const a=J.placement.tilesProof48.support({...p,ordinal},{owner:p.owner,primitive:{kind:'line'}});
  return{ordinal,owner:p.owner,pass:p.pass,rule:'existing48-two-point-butt-line',polygon:null,exactBounds:null,bounds:a.bounds,foundation:a.foundation};
 }else need(p.args.length===3,'C30_TEXT_MAXWIDTH');
 const a=K.atom(q),bounds=Object.fromEntries(Object.entries(a.bounds).map(([k,v])=>[k,K.directed(v,k.endsWith('1'))]));
 return{ordinal,owner:p.owner,pass:p.pass,rule,polygon:a.polygon.map(K.pointSerial),exactBounds:Object.fromEntries(Object.entries(a.bounds).map(([k,v])=>[k,K.serial(v)])),bounds,foundation:a.foundation};
}
function supports(records){return records.map(one).filter(Boolean);}
function evaluate(rows,circle){return G.evaluation(rows,circle,[0,0]);}
function quality(rows,calls,spec){const body=calls.find(x=>x.name==='mainDraw')?.args[0],ratio=body?513*spec.heroScale/body.size:null;
 const union=xs=>xs.length?{x0:Math.min(...xs.map(x=>x.bounds.x0)),x1:Math.max(...xs.map(x=>x.bounds.x1)),y0:Math.min(...xs.map(x=>x.bounds.y0)),y1:Math.max(...xs.map(x=>x.bounds.y1))}:null;
 const hero=union(rows.filter(x=>x.owner==='contour.hero')),bodyGroup=union(rows.filter(x=>x.owner!=='contour.hero')),groupSeparated=hero&&bodyGroup?hero.x1<bodyGroup.x0||bodyGroup.x1<hero.x0||hero.y1<bodyGroup.y0||bodyGroup.y1<hero.y0:null;
 return{heroScale:spec.heroScale,nativeBodySize:body?.size??null,heroBodyRatio:ratio,ratioAtLeastThree:ratio!==null&&ratio>=3,heroGroupBounds:hero,bodyGroupBounds:bodyGroup,groupEnvelopesSeparated:groupSeparated,diagnosticOnly:true,notAcceptancePredicate:true,noNewGapFloor:true};}

return Object.freeze({supports,evaluate,quality});
})
