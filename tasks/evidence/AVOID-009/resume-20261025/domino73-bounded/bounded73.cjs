/* Isolated SOURCE73 planning/paint-pair primitives. No registration or safe certificate. */
'use strict';
const POLICY='domino73-vertical-source-x-preserved-v1';
const need=(v,code)=>{if(!v)throw Object.assign(Error(code),{code});};
const finiteBox=b=>b&&['x0','x1','y0','y1'].every(k=>Number.isFinite(b[k]))&&b.x0<=b.x1&&b.y0<=b.y1;
function family(cut){
 need(cut&&['風の先へ','風の先へ歩いて行くよ'].includes(cut.text)&&cut.seed===1205&&cut.dur===4&&cut.inDur===.35&&cut.outDur===.4&&cut.start===0&&(cut.renderStart??0)===0&&(cut.end??4)===4&&(cut.displayEnd??4)===4,'DOMINO73_BOUNDED_FAMILY');
 need(cut.params?.font==='dela'&&cut.params.face==='light'&&cut.params.pips===true&&cut.enter==='cut'&&cut.exit==='cut'&&cut.hold==='still'&&cut.cam==='push'&&cut.camP?.a===.022&&cut.camP.dir===1&&(cut.contentScale??1)===1&&(cut.motionScale??1)===1&&cut.lyricSize==null&&!cut.area,'DOMINO73_BOUNDED_OPERATIONS');
 need(Number.isFinite(cut.stagger)&&cut.stagger>0,'DOMINO73_SOURCE_STAGGER_REQUIRED');
 return{rowCount:cut.text==='風の先へ'?1:2,text:cut.text,sourceStagger:cut.stagger,scaleSupported:false,status:'scope-only-unproven',requiresFreshSourceAndFontBinding:true};
}
function union(rows){return{x0:Math.min(...rows.map(b=>b.x0)),x1:Math.max(...rows.map(b=>b.x1)),y0:Math.min(...rows.map(b=>b.y0)),y1:Math.max(...rows.map(b=>b.y1))};}
function candidates(heldRows,circle,G){
 need(Array.isArray(heldRows)&&heldRows.length>=1&&heldRows.length<=2&&heldRows.every(finiteBox),'DOMINO73_HELD_SOURCE_ROWS');
 need(circle.cx===480&&[.42*540,.2*540].includes(circle.cy)&&circle.r===108&&circle.margin===2.7,'DOMINO73_INITIAL_CIRCLE_SCOPE');
 need(G&&typeof G.positions==='function','DOMINO73_GEOMETRY68_REQUIRED');
 const seeds=b=>{const out=[0];for(const p of G.positions([{owner:'dominoes.heuristic-source-row',bounds:b}],circle,{evaluate:false})){if(p.delta[0]===0&&!out.some(v=>Object.is(v,p.delta[1])))out.push(p.delta[1]);}need(out.length<=5,'DOMINO73_VERTICAL_SEED_BUDGET');return out;};
 const result=[],seen=new Set(),add=(kind,dy)=>{const key=dy.join(',');if(seen.has(key))return;seen.add(key);const rowDeltas=dy.map(y=>[0,y]);result.push({id:'domino73-candidate-'+result.length,kind,deltas:kind==='native'?[]:kind==='joint-translation'?[rowDeltas[0]]:rowDeltas,rowDeltas,scale:1,policy:POLICY,status:'uncertified-heuristic-source-coordinate-seed',requiresActualDestinationProof:true});};
 for(const y of seeds(union(heldRows)))add(y===0?'native':'joint-translation',heldRows.map(()=>y));
 if(heldRows.length===2){const a=seeds(heldRows[0]),b=seeds(heldRows[1]);for(const x of a)for(const y of b){if(y<x)continue;add('row-translation',[x,y]);}}
 need(result.length<=(heldRows.length===1?5:30),'DOMINO73_FINITE_CANDIDATE_BUDGET');
 return{policy:POLICY,candidates:result,maximumCandidates:heldRows.length===1?5:30,geometryCertified:false,sourceRowsUnchanged:true,heuristicOnly:true,notGlobalImpossibility:true};
}
function evaluatePairs(native,destination,circle,G,{emptyPositivePaintSource=false}={}){
 need(Array.isArray(native)&&Array.isArray(destination)&&native.length===destination.length&&native.length<=2048,'DOMINO73_PAIRED_SUPPORT_COUNT');
 need(G&&typeof G.evaluation==='function','DOMINO73_GEOMETRY68_REQUIRED');
 if(native.length===0)return{policy:POLICY,passed:emptyPositivePaintSource===true,checked:0,reason:emptyPositivePaintSource?'native-and-destination-no-positive-paints':'missing-source-positive-paint-proof',certificateIssued:false};
 const failures=[];let nativeXOutside=0;
 for(let i=0;i<native.length;i++){
  const a=native[i],b=destination[i];need(finiteBox(a.bounds)&&finiteBox(b.bounds),'DOMINO73_SUPPORT_BOX');
  need(a.role==='primary'&&b.role==='primary'&&a.owner===b.owner&&/^dominoes\.row\.[01]$/.test(a.owner)&&a.ordinal===i&&b.ordinal===i&&typeof a.semanticKey==='string'&&a.semanticKey.length>0&&a.semanticKey===b.semanticKey,'DOMINO73_SOURCE_PAINT_PAIR_IDENTITY');
  const sameX=Object.is(a.bounds.x0,b.bounds.x0)&&Object.is(a.bounds.x1,b.bounds.x1),yStage=b.bounds.y0>=0&&b.bounds.y1<=540,sourceXStage=a.bounds.x0>=0&&a.bounds.x1<=960;
  if(!sourceXStage)nativeXOutside++;
  const geometry=G.evaluation([b],circle,[0,0]);
  const circleFailure=geometry.failures.some(f=>f.circle);
  if(!sameX||!yStage||circleFailure)failures.push({index:i,owner:b.owner,sourceXChanged:!sameX,yStageFailure:!yStage,circleFailure});
 }
 return{policy:POLICY,passed:failures.length===0,checked:native.length,nativeXOutside,failures,fullStageStrictClaim:false,circlePolicy:'strict-at-every-materialized-own-clock',allClockCoverageEstablished:false,sourceXClipUnchanged:!failures.some(f=>f.sourceXChanged),certificateIssued:false};
}
module.exports={POLICY,family,candidates,evaluatePairs};
