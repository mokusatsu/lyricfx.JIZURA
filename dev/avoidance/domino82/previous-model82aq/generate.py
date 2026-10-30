from pathlib import Path
import sys
R=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;D=R/'dev/avoidance/domino82';P=D/'product-ui82ao'
def rep(s,a,b):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,b)
s=(D/'ui-projection82ak/model82ak.js').read_text();marker="Object.defineProperty(A,'dominoUIDestinationModel82ak'";a=s.index(marker)
helper="""// Reuse a privately collected immutable model; only its circle/source key change.
function* retarget(model,{sourceKey,circle,reservedBytes}){need(collected.has(model),'DOMINO82AQ_PREVIOUS_MODEL');let checkedOwn=0,checkedSupports=0,peak=reservedBytes+model.budget.residentBytes;
 for(const row of model.rows){for(let i=0;i<row.supports.length;i+=16){const supports=row.supports.slice(i,i+16),evaluation=G.evaluation(supports,circle,[0,0],model.viewport),work=C.serializedBytes({supports,evaluation});peak=Math.max(peak,reservedBytes+model.budget.residentBytes+work);need(peak<=8388608,'DOMINO82AQ_REUSE_BUDGET');checkedSupports+=evaluation.checked;if(evaluation.failures.some(f=>f.circle))return{model:null,checkedOwn,checkedSupports};}checkedOwn++;if(checkedOwn%16===0)yield{phase:'previous-circle',checkedOwn,checkedSupports};}
 const next={...model,sourceKey,circle:copy(circle),budget:{...model.budget,peak,residentBytes:0}};next.budget.residentBytes=C.serializedBytes(next);need(reservedBytes+model.budget.residentBytes+next.budget.residentBytes<=8388608,'DOMINO82AQ_REUSE_BUDGET');copyFreeze(next);collected.add(next);return{model:next,checkedOwn,checkedSupports};
}
"""
s=s[:a]+helper+s[a:];s=rep(s,'{create,checkCurrent,sourceOnly:', '{create,checkCurrent,retarget,sourceOnly:');(U/'model82aq.js').write_text(s)
s=(P/'owner82ao.js').read_text()
s=rep(s,'let epoch=0,job=null,record=null,busy=false;', 'let epoch=0,job=null,record=null,busy=false,previous=null;')
s=rep(s,'const counters={starts:0,', 'const counters={sameReuse:0,circleReuse:0,reuseRejected:0,recheckedOwn:0,recheckedSupports:0,starts:0,')
a=s.index(' function* build(j){');z=s.index('const {plan,surface,circle,reservedBytes}=j,',a)
warm="""if(j.cached){let old=j.cached;j.cached=null;const heldBytes=j.reservedBytes+old.metadata+old.reservedBytes+C.serializedBytes({plan:j.plan,dep:j.dep,circle:j.circle,sourceKey:j.sourceKey});if(old.model.sourceKey===j.sourceKey){need(heldBytes+old.model.budget.residentBytes<=8388608,'DOMINO82AQ_REUSE_BUDGET');j.clock=old.clock;counters.sameReuse++;return old.model;}let attempt=M.retarget(old.model,{sourceKey:j.sourceKey,circle:j.circle,reservedBytes:heldBytes}),result,next;do{next=attempt.next();if(!next.done)yield next.value}while(!next.done);result=next.value;counters.recheckedOwn+=result.checkedOwn;counters.recheckedSupports+=result.checkedSupports;if(result.model){j.clock=old.clock;counters.circleReuse++;return result.model;}counters.reuseRejected++;attempt=null;result=null;next=null;old=null;}
 """
s=s[:z]+warm+s[z:]
# Capture only native-shape data; circle does not enter the source renderer.
s=rep(s,'const snapshot=denseCopy(plan),sourceKey=key(snapshot);', 'const snapshot=denseCopy(plan),sourceKey=key(snapshot),shapeKey=key({...snapshot,lyricAvoidanceIndex:null}),cached=previous&&previous.shapeKey===shapeKey&&dependencyMatches(previous.dep)?previous:null;previous=null;')
s=rep(s,'reservedBytes,generator:null,ready:null}', 'reservedBytes,cached,shapeKey,generator:null,ready:null}')
# Preserve the model alone while clearing every public handle/ticket upstream.
needle='function configureViewport(input){idle();';i=s.index(needle)
s=s[:i]+"""function park(){idle();if(record)previous={model:record.model,clock:record.clock,dep:record.dep,shapeKey:key({...record.plan,lyricAvoidanceIndex:null}),metadata:record.metadata,reservedBytes:record.reservedBytes};dispose();}
 """+s[i:]
s=rep(s,'viewport=candidate;viewportBytes=', "if(candidate.width!==viewport.width||candidate.height!==viewport.height||candidate.scale!==viewport.scale)previous=null;viewport=candidate;viewportBytes=")
s=rep(s,'function drop(){idle();dispose();}', 'function drop(){idle();previous=null;dispose();}')
s=rep(s,'Object.freeze({configureViewport,begin,', 'Object.freeze({park,configureViewport,begin,')
s=rep(s,'...counters,pending:!!job,', '...counters,cached:!!previous,cachedBytes:previous?previous.metadata+previous.reservedBytes+previous.model.budget.residentBytes:0,pending:!!job,')
(U/'owner82aq.js').write_text(s)
s=(P/'controller82ao.js').read_text();s=rep(s,"if(!reusable){clearCertificates();ticketRecord=null;owner.drop();stage=", "if(!reusable){clearCertificates();ticketRecord=null;owner.park();stage=");needle='   cancelPrepared(){';i=s.index(needle);s=s[:i]+"""   parkPrepared(){need(!active,'DOMINO82Q_FRAME_ACTIVE');clearCertificates();stage=null;ticketRecord=null;owner.park();},
"""+s[i:];(U/'controller82aq.js').write_text(s)
s=(P/'runtime82ao.js').read_text();s=rep(s,'function cancel(){','function cancel(reason){');s=rep(s,'if(api)api.cancelPrepared();else ctrl.drop()', "if(api){if(['replan','begin','debounce'].includes(reason))api.parkPrepared();else api.cancelPrepared()}else ctrl.drop()");(U/'runtime82aq.js').write_text(s)
s=(P/'session82ao.js').read_text();s=rep(s,'function cancelRuntime(){','function cancelRuntime(reason){');s=rep(s,'runtime.cancel();','runtime.cancel(reason);');s=rep(s,'details=null;cancelRuntime();','details=null;cancelRuntime(reason);');s=rep(s,'active=true;invalidate();','active=true;invalidate(\'begin\');');(U/'session82aq.js').write_text(s)
