from pathlib import Path
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-balloons-stage04';s=(R/'work/avoid009-balloons-translation03/src/balloons-diagnostic03.js').read_text()
def sub(a,b):
 global s
 assert s.count(a)==1,a
 s=s.replace(a,b)
sub('balloonsNativeTranslationDiagnostic03','balloonsNativeStageDiagnostic04')
sub("candidates:81,intervalOperations", "candidates:128,familyCandidates:81,intervalOperations")
sub("function candidateChecks(ledger,plan,cut,d,hold,region)","function candidateChecks(ledger,plan,cut,d,hold,region,legacyCandidates=[])")
a="const xs=empty?[0]:Array.from({length:9},(_,i)=>x0+(x1-x0)*i/8),ys=empty?[0]:Array.from({length:9},(_,i)=>y0+(y1-y0)*i/8),candidates=empty?[[0,0]]:xs.flatMap(x=>ys.map(y=>[x,y]));"
b="const xs=empty?[0]:Array.from({length:9},(_,i)=>x0+(x1-x0)*i/8),ys=empty?[0]:Array.from({length:9},(_,i)=>y0+(y1-y0)*i/8),candidateRows=[[0,0],...xs.map(x=>[x,0]),...ys.map(y=>[0,y]),...legacyCandidates,...(empty?[]:xs.flatMap(x=>ys.map(y=>[x,y])))],candidates=[...new Map(candidateRows.map(p=>[p.join(','),p])).values()];"
sub(a,b)
a="return {region,holdIntersection:intersection,holdEnough,stageOffsetSlab:slab,emptyConservativeSlab:empty,attempts,finiteSearchFailureIsNotImpossibility:true};"
b="const rank=attempt=>attempt.status==='full-circle-diagnostic-candidate'?0:attempt.status==='selective-moving-diagnostic-candidate'?1:2,rankedCandidateIndices=attempts.map((_,i)=>i).sort((a,b)=>rank(attempts[a])-rank(attempts[b])||Math.hypot(...attempts[a].offset)-Math.hypot(...attempts[b].offset)||a-b);return {region,holdIntersection:intersection,holdEnough,stageOffsetSlab:slab,emptyConservativeSlab:empty,attempts,rankedCandidateIndices,zeroAndAxesExplicit:true,legacyCandidateCount:legacyCandidates.length,finiteSearchFailureIsNotImpossibility:true};"
sub(a,b)
a="push('string.'+k,R(Math.min(a.x[0],b.x[0])-guard,Math.max(a.x[1],b.x[1])+guard),R(Math.min(a.y[0],b.y[0])-guard,Math.max(a.y[1],b.y[1])+guard),{entry:state.entry&&!(cut.params.tie==='free'&&state.freeClampPossible),freeClampPossible:state.freeClampPossible,strokeWidth:g.lw,miterLimit:10});"
b=a+"parts[parts.length-1].endpointLocals=[a,b].map(p=>boxHull(R(p.x[0]-guard,p.x[1]+guard),R(p.y[0]-guard,p.y[1]+guard)));parts[parts.length-1].fractions=[k/10,(k+1)/10];"
sub(a,b)
a="const push=p=>{const polygon=envelope(p.local,pass,plan,cut,d);ledger.push({owner:p.owner,q:p.q,part:p.part,pass:pass.pass,lag:pass.lag,sourceRange:[cell.lo,cell.hi],realRange:[Math.max(0,cut.start+cell.lo+pass.lag-d.step),cut.start+cell.hi+pass.lag+d.step],phase:p.phase,polygon,bounds:A.bounds([polygon])});};"
b="const push=p=>{const endpointPolygons=p.endpointLocals?.map(local=>envelope(local,pass,plan,cut,d)),polygon=endpointPolygons?A.convexHull(endpointPolygons.flat()):envelope(p.local,pass,plan,cut,d);ledger.push({owner:p.owner,q:p.q,part:p.part,pass:pass.pass,lag:pass.lag,sourceRange:[cell.lo,cell.hi],realRange:[Math.max(0,cut.start+cell.lo+pass.lag-d.step),cut.start+cell.hi+pass.lag+d.step],phase:p.phase,polygon,bounds:A.bounds([polygon]),...(endpointPolygons?{endpointPolygons,fractions:p.fractions}: {})});};"
sub(a,b)
sub("const trials=candidateChecks(ledger,plan,cut,d,hold,region),remaining=", "const trials=candidateChecks(ledger,plan,cut,d,hold,region,options.legacyCandidates||[]),family=stageFamily(ledger,plan,cut,d,hold,region,g,trials),remaining=")
a="if(JSON.stringify(plan)!==before)fail('SOURCE_MUTATION','Diagnostic must not mutate original plan');"
b="const tqAtEnd=Math.floor(region.end/d.step+1e-6)*d.step,selectorAtEnd=d.passes.map(pass=>{const tp=Math.max(0,tqAtEnd-pass.lag);return {pass:pass.pass,lag:pass.lag,tq:tqAtEnd,tp,active:J.lyricCutsAt(plan,tp).some(v=>v.index===cut.index),effectiveEnd:J.lyricRenderCut(plan.cuts[0]).end};}),endExpired=selectorAtEnd.every(v=>!v.active&&v.tp>=v.effectiveEnd);Object.assign(retentionTail,{selectorAtEnd,endExpired,noReentryByMonotoneTpAndFixedSelector:endExpired,status:plan.duration<d.sourceExpiryUpperBound?'unsupported-plan-duration-retention-tail':endExpired?'all-source-selectors-expired-at-region-end':retentionTail.status});\n "+a
sub(a,b)
sub("ledger,trials,retentionTail,directedOperations", "ledger,trials,family,retentionTail,directedOperations")
sub("kind:'balloons-native-translation-diagnostic03'", "kind:'balloons-native-stage-diagnostic04'")
sub("status:'diagnostic-only',sourceUnchanged:true,branches:", "status:'diagnostic-only',sourceUnchanged:true,stringModel:'Each guarded endpoint remains separate until its constant stage delta, then segment convex hull; zero-family support matches native04',branches:")
family=r'''
function stageFamily(ledger,plan,cut,d,hold,region,g,nativeTrials){
 const eligible=nativeTrials.attempts.filter(a=>a.status==='full-circle-diagnostic-candidate'||a.status==='selective-moving-diagnostic-candidate');
 if(g.glyphs.length!==4||g.nR!==1||cut.params.tie!=='bunch')return {status:'unsupported-original-family-domain',nativeTie:cut.params.tie,glyphs:g.glyphs.length,rows:g.nR,attempts:[],certificate:false};
 if(eligible.length)return {status:'not-needed-native-translation-candidate-exists',attempts:[],certificate:false};
 const glyphs=ledger.filter(e=>e.q!=null&&!e.part.startsWith('string.')),held=glyphs.filter(e=>e.part==='body'&&!e.phase.entry&&!e.phase.exit),left=held.filter(e=>e.q<2),right=held.filter(e=>e.q>=2);
 if(!left.length||!right.length)return {status:'inconclusive-held-support',attempts:[],certificate:false};
 const margin=Math.max(2,.005*Math.min(plan.W,plan.H)),needLeft=Math.max(0,...left.map(e=>e.bounds.x1-(region.circle.cx-region.circle.r-margin))),needRight=Math.max(0,...right.map(e=>region.circle.cx+region.circle.r+margin-e.bounds.x0)),availableLeft=Math.max(0,Math.min(...glyphs.filter(e=>e.q<2).map(e=>e.bounds.x0))),availableRight=Math.max(0,Math.min(...glyphs.filter(e=>e.q>=2).map(e=>plan.W-e.bounds.x1)));
 const levels=(need,available)=>[...new Set([0,...[1,2,3,4].map(k=>Math.min(available,need)*k/4),...[1,2,3,4].map(k=>available*k/4)])].sort((a,b)=>a-b),Ls=levels(needLeft,availableLeft),Rs=levels(needRight,availableRight),holdIntersection=[Math.max(hold[0],region.start),Math.min(hold[1],region.end)],holdEnough=hold[1]-hold[0]>=.04&&holdIntersection[1]-holdIntersection[0]>=.04;
 const deltaAt=(q,L,R)=>[q<2?-L:R,0],endpointDelta=dg=>[.06*dg[0],0],vertexDelta=(dg,f)=>[(1-f)*dg[0]+f*endpointDelta(dg)[0],0],shift=(poly,delta)=>delta[0]===0&&delta[1]===0?poly.map(p=>p.slice()):poly.map(p=>[p[0]+delta[0],p[1]+delta[1]]);
 const moved=(e,L,R)=>{if(e.q==null)return e.polygon.map(p=>p.slice());const dg=deltaAt(e.q,L,R);if(e.endpointPolygons){if(e.endpointPolygons.length!==2||e.fractions.length!==2)fail('STRING_ENDPOINT_MODEL','Two source endpoint hulls required');return A.convexHull(e.endpointPolygons.flatMap((poly,i)=>shift(poly,vertexDelta(dg,e.fractions[i]))));}return shift(e.polygon,dg);};
 let zeroDeltaSupportExact=true;for(const e of ledger)if(JSON.stringify(moved(e,0,0))!==JSON.stringify(e.polygon))zeroDeltaSupportExact=false;
 if(!zeroDeltaSupportExact)fail('ZERO_STAGE_DELTA_SUPPORT','Native04 and zero-family support must be exact');
 const attempts=[];
 for(const L of Ls)for(const R of Rs){if(attempts.length>=limits.familyCandidates)break;let stage=0,full=0,selective=0;const worst={stage:null,full:null,selective:null};
  for(const e of ledger){const polygon=moved(e,L,R),b=A.bounds([polygon]),stageOK=b.x0>=0&&b.x1<=plan.W&&(b.y0>=0||e.phase.exit)&&(b.y1<=plan.H||e.phase.entry);if(!stageOK){stage++;worst.stage??={owner:e.owner,pass:e.pass,range:e.sourceRange,bounds:b};}
   if(e.realRange[0]>=region.end||e.realRange[1]<=region.start)continue;if(!A.clear([polygon],region.circle,margin)){full++;worst.full??={owner:e.owner,pass:e.pass,range:e.sourceRange};if(!e.phase.entry&&!e.phase.exit){selective++;worst.selective??=worst.full;}}
  }
  attempts.push({leftDelta:[-L,0],rightDelta:[R,0],anchorDelta:[0,0],maxDisplacement:Math.max(L,R),sumSquares:2*L*L+2*R*R,fullCircleFailures:full,selectiveMovingCircleFailures:selective,stageFailures:stage,holdEnough,worst,status:!holdEnough?'hold-insufficient':stage?'conservative-stage-insufficient':full===0?'full-circle-diagnostic-candidate':selective===0?'selective-moving-diagnostic-candidate':'conservative-circle-insufficient',certificate:false});
 }
 const rank=a=>a.status==='full-circle-diagnostic-candidate'?0:a.status==='selective-moving-diagnostic-candidate'?1:2,rankedCandidateIndices=attempts.map((_,i)=>i).sort((a,b)=>rank(attempts[a])-rank(attempts[b])||attempts[a].maxDisplacement-attempts[b].maxDisplacement||attempts[a].sumSquares-attempts[b].sumSquares||a-b);
 return {status:'finite-two-group-stage-family-diagnostic',coordinateSpace:'constant stage deltas after original camera',groups:[[0,1],[2,3]],anchorDelta:[0,0],needLeft,needRight,availableLeft,availableRight,leftLevels:Ls,rightLevels:Rs,zeroDeltaSupportExact,holdIntersection,holdEnough,attempts,rankedCandidateIndices,certificate:false,finiteFamilyFailureIsNotImpossibility:true,velocityInvariant:'Every original output point receives a time-independent stage delta; no new camera/source/font/size/time term',stringInvariant:'de=(.06dg.x+.94da.x,da.y); each original vertex gets (1-f)dg+f*de, with da0'};
}
'''
sub('A.balloonsNativeStageDiagnostic04=async function',family+'\nA.balloonsNativeStageDiagnostic04=async function')
(D/'src/balloons-stage-diagnostic04.js').write_text(s)
