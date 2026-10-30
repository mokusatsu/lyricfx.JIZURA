"""Source-only proposal over the current product burst owner; no product write."""
from pathlib import Path
import sys,json
R=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;core=(R/'src/11zz12_burst_core83.js').read_text()
def rep(s,a,b):
 assert s.count(a)==1,(a[:180],s.count(a));return s.replace(a,b)
markers=['/* dev/avoidance/burst83/viewport-session83bd/private-controller83.js */','/* dev/avoidance/burst83/viewport-session83bd/prepared-handoff83.js */','/* dev/avoidance/burst83/viewport-session83bd/runtime83bd.js */','/* dev/avoidance/burst83/viewport-session83bd/session83bd.js */','/* Selection only. Unknown lineage']
parts=[core[core.index(markers[i]):core.index(markers[i+1])]for i in range(4)]
s=parts[0]
s=rep(s,'let active=null,busy=false,next=1,activeFrame=null,', 'let previous83bf=null;const reuse83bf={compiles:0,replays:0,same:0,circle:0,rejected:0,checkedSupports:0,candidates:0};let active=null,busy=false,next=1,activeFrame=null,')
s=rep(s,'let resident=0;for(const r of entries.values())', 'let resident=previous83bf?.bytes||0;for(const r of entries.values())')
start=s.index('function start(plan,renderer,options={})')
s=s[:start]+'''// Only the circle geometry is excluded; all clock/style/text/layer inputs remain.
function shapeKey83bf(plan){return key({...plan,lyricAvoidanceIndex:{...plan.lyricAvoidanceIndex,regions:plan.lyricAvoidanceIndex.regions.map(({center,radius,...region})=>region)}})}
function park83bf(handle){const r=entries.get(handle);need(r,'BURST83S_UNKNOWN');previous83bf={model:r.model,proof:r.proof,dep:r.dep83bf,shapeKey:r.shapeKey83bf,signature:r.signature83bf,renderer:r.renderer83bf,residentBytes:r.residentBytes};previous83bf.bytes=r.reservedBytes+r.residentBytes+C.serializedBytes(r.proof)+4096;r.clear();}
'''+s[start:]
s=rep(s,'generation();guard(dep);need(key(plan)===signature,', 'generation();guard(dep);const shape=shapeKey83bf(copy),cached=previous83bf&&previous83bf.shapeKey===shape&&previous83bf.renderer===renderer&&matches(previous83bf.dep,dep)?previous83bf:null;previous83bf=null;need(key(plan)===signature,')
s=rep(s,"let state='building',model=null,handle=null,publication=null,residentBytes=0,proof=null,proofReservation=0,choices=null;", "let state=cached?(cached.signature===signature?'same':'previous'):'building',model=cached?(cached.signature===signature?cached.model:Object.freeze({...cached.model,sourceKey:signature})):null,handle=null,publication=null,residentBytes=cached?cached.residentBytes:0,proof=cached?(cached.signature===signature?cached.proof:{...cached.proof,circle,checkedOwn:0,checkedSupports:0,selection:{...cached.proof.selection,policy:'previous-position; exact full-owner replay for new circle'}}):null,proofReservation=cached?reservation+cached.residentBytes+C.serializedBytes(cached.proof)+131104:0,choices=null;")
s=rep(s,'let iterator=M.compile({plan:copy,renderer,ctx,deviceDelta:delta,reservedBytes:reservation,validate:check});', "let iterator=null;if(cached){delta=proof.delta;need(proofReservation<=8388608,'BURST83Z_PROOF_BUDGET')}else{reuse83bf.compiles++;iterator=M.compile({plan:copy,renderer,ctx,deviceDelta:delta,reservedBytes:reservation,validate:check})}")
# Drop the old cache wrapper after extracting shared model/proof references.
s=rep(s,'const shape=shapeKey83bf(copy),cached=', 'const shape=shapeKey83bf(copy);let cached=')
s=rep(s,'const clear=()=>{model=proof=choices=null;', 'cached=null;const clear=()=>{model=proof=choices=null;')
s=rep(s,'const check=()=>{generation();', "if(cached&&proofReservation>8388608){cached=null;model=proof=null;residentBytes=proofReservation=0;state='building'}const check=()=>{generation();")
s=rep(s,'let iterator=null;if(cached){', 'const reused83bf=!!cached;cached=null;let iterator=null;if(reused83bf){')
s=rep(s,'try{iterator.return()}finally{clear()}', 'try{iterator?.return()}finally{clear()}')if s.count('try{iterator.return()}finally{clear()}')==1 else s.replace('try{iterator.return()}finally{clear()}', 'try{iterator?.return()}finally{clear()}')
s=s.replace("(state==='building'||state==='proof')", "(['building','proof','previous','same'].includes(state))")
s=rep(s,"check();if(state==='proof'){", "check();if(['proof','previous','same'].includes(state)){const same83bf=state==='same',previous83bfAttempt=state==='previous';let result={budget:{peak:proof.peak}},evaluation=null,workBytes=0;if(!same83bf){")
s=rep(s,'workBytes=C.serializedBytes({envData,clock,own,rowRef:proof.checkedOwn}),result=R.replay(', 'workBytes83bf=C.serializedBytes({envData,clock,own,rowRef:proof.checkedOwn});workBytes=workBytes83bf;reuse83bf.replays++;result=R.replay(')
s=rep(s,'}),evaluation=evaluateOwned83bb(env,row,result,circle,viewport,delta,proofReservation+workBytes);const live=', '});const evaluation83bf=evaluateOwned83bb(env,row,result,circle,viewport,delta,proofReservation+workBytes);evaluation=evaluation83bf;reuse83bf.checkedSupports+=evaluation.checked;if(previous83bfAttempt&&!evaluation.passed){reuse83bf.rejected++;const selection=chooseDestination83ax(model.sourceUnion,circle,viewport);choices=selection.choices;need(selection.chosen,\'BURST83AX_FINITE_CANDIDATE_INSUFFICIENT\');reuse83bf.candidates+=choices.length;delta=owned(selection.chosen.delta);proof={circle,delta,viewport,selection:{side:selection.chosen.side,sourceUnion:selection.sourceUnion,zeroClear:selection.zeroClear,finiteCount:choices.length,policy:selection.policy},checkedOwn:0,checkedSupports:0,minStageSlack:viewport.width,peak:model.budget.peak,domain:\'sample-clock-states-only\',framePermission:false};residentBytes=C.serializedBytes(model)+C.serializedBytes(choices)+C.serializedBytes(selection)+4096;proofReservation=reservation+residentBytes+C.serializedBytes(proof)+131104;need(proofReservation<=8388608,\'BURST83Z_PROOF_BUDGET\');state=\'proof\';return Object.freeze({done:false,progress:Object.freeze({phase:\'fallback\',completedOwn:0})})}const live=')
s=rep(s,"proof.checkedSupports+=result.supports.length;check();if(proof.checkedOwn===model.tables[0].length){", "proof.checkedSupports+=result.supports.length;check();}if(same83bf||proof.checkedOwn===model.tables[0].length){if(same83bf)reuse83bf.same++;else if(previous83bfAttempt)reuse83bf.circle++;")
s=rep(s,'const preview=owned(proof),finalLive=proofReservation+workBytes+', 'const preview=owned(proof),finalLive=proofReservation+workBytes+')
s=rep(s,'entries.set(handle,{check,clear,model,proof,plan:copy,', 'entries.set(handle,{check,clear,model,proof,dep83bf:dep,shapeKey83bf:shape,signature83bf:signature,renderer83bf:renderer,plan:copy,')
s=rep(s,'const selection=chooseDestination83ax(model.sourceUnion,circle,viewport);choices=selection.choices;const chosen=', 'const selection=chooseDestination83ax(model.sourceUnion,circle,viewport);choices=selection.choices;reuse83bf.candidates+=choices.length;const chosen=')
s=rep(s,"return Object.freeze({done:false,progress:Object.freeze({phase:'proof',completedOwn:proof.checkedOwn})})", "return Object.freeze({done:false,progress:Object.freeze({phase:state,completedOwn:proof.checkedOwn})})")
s=rep(s,'viewport=viewport83bd(input);return true', 'const candidate=viewport83bd(input);if(candidate.width!==viewport.width||candidate.height!==viewport.height||candidate.scale!==viewport.scale)previous83bf=null;viewport=candidate;return true')
s=rep(s,'{plan,copy,signature,delta,circle,viewport,dependencyValues:', '{plan,copy,signature,shape,delta,circle,viewport,dependencyValues:')
s=rep(s,'{models:entries.size,activeFrame:', '{reuse:{...reuse83bf},cached:!!previous83bf,cachedBytes:previous83bf?.bytes||0,models:entries.size,activeFrame:')
s=rep(s,'start:serial(start),validate:', 'clearPrevious:serial(()=>{previous83bf=null}),park:serial(park83bf),start:serial(start),validate:')
(U/'owner83bf.js').write_text(s)
s=parts[1]
s=rep(s,'externalReservedBytes:()=>ready?readyPeak+publicationBytes+262176:0', 'externalReservedBytes:()=>ready?readyPeak+publicationBytes+262176:owner.resources().cachedBytes')
s=rep(s,'function revoke(){', 'function revoke(keep=false){')
s=rep(s,'try{owner.drop(ready)}', 'try{if(keep)owner.park(ready);else owner.drop(ready)}')
s=rep(s,'readyPeak=publicationBytes=0}}}', 'readyPeak=publicationBytes=0}}if(!keep)owner.clearPrevious()}')
needle='drop:serial(()=>{generation++;if(currentInner)currentInner.cancel();job=null;currentInner=null;revoke();stage=null;unit.drop()})'
s=rep(s,needle,needle+",park:serial(()=>{generation++;if(currentInner)currentInner.cancel();job=null;currentInner=null;revoke(true);stage=null;unit.drop()})")
(U/'handoff83bf.js').write_text(s)
s=parts[2];s=rep(s,'function cancel(){','function cancel(reason){');s=rep(s,'try{unit.drop()}', "try{if(['replan','begin','debounce'].includes(reason))unit.park();else unit.drop()}");(U/'runtime83bf.js').write_text(s)
s=parts[3];s=rep(s,'function cancelRuntime(){','function cancelRuntime(reason){');s=rep(s,'runtime.cancel();','runtime.cancel(reason);');s=rep(s,'error=null;details=null;cancelRuntime();','error=null;details=null;cancelRuntime(reason);');s=rep(s,'active=true;invalidate();',"active=true;invalidate('begin');");(U/'session83bf.js').write_text(s)
s=(R/'src/12_ui.js').read_text();a=s.index(' async waitFonts(plan,isCurrent){');z=s.index('\n schedule:',a);method=s[a:z].replace('bulbsFontReady86co','burstFontReady83bf');a=s.index(' waitFonts(plan,isCurrent){return bulbsFontQueue86ci.run');z=s.index('\n schedule:',a);s=s[:a]+method+s[z:];s=rep(s,'let burstState83be=null;', 'let burstState83be=null,burstFontReady83bf=null;');(U/'ui83bf.js').write_text(s)
(U/'module-markers.json').write_text(json.dumps(markers,indent=2)+'\n')
