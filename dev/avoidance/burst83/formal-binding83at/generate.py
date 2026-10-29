from pathlib import Path
import sys
r=Path(sys.argv[1]).resolve();d=Path(__file__).resolve().parent
def rep(s,a,b):
 assert s.count(a)==1,a
 return s.replace(a,b)
s=(r/'dev/avoidance/domino82/prepared-binding82ac/plan-binding82.js').read_text().replace('dominoPlanBinding82ac','burstPlanBinding83at').replace('domino-owned-plan-certificate82ac','burst-owned-plan-certificate83at').replace("'dominoes'","'burst'")
(d/'plan-binding83.js').write_text(s)
s=(r/'dev/avoidance/burst83/time-domain83as/private-controller83.js').read_text()
s=rep(s,'function start(plan,renderer,options={}){',(d/'formal-fragment.js').read_text()+'\nfunction start(plan,renderer,options={}){')
s=rep(s,'function refs(){return[T,',"function refs(){return[A.burstPlanBinding83at,A.burstPlanBinding83at?.create,A.validateFinal,A.layoutsDCacheAdapterDependencies,...(typeof A.layoutsDCacheAdapterDependencies==='function'?A.layoutsDCacheAdapterDependencies().flat():[]),T,")
s=rep(s,'function target(plan,opt={}){return published.has(plan)||J.burstFrameTarget83ag(plan,opt)}','function target(plan,opt={}){return published.has(plan)||formalBinding83at?.needs(plan)||J.burstFrameTarget83ag(plan,opt)}')
s=rep(s,"const binding=published.get(plan);need(binding,'BURST83AG_PREPARE_REQUIRED');const r=entries.get(binding.handle);need(r&&r.publication===plan,'BURST83AG_STALE_PLAN');", "let binding=published.get(plan),formal=false;if(!binding&&formalBinding83at?.needs(plan)){const ticket=formalBinding83at.assertReady(plan);binding={handle:formalTickets83at.get(ticket)};formal=true}need(binding,'BURST83AG_PREPARE_REQUIRED');const r=entries.get(binding.handle);need(r&&(formal||r.publication===plan),'BURST83AG_STALE_PLAN');")
s=rep(s,"const api=Object.freeze({start:serial(start),", "const api=Object.freeze({issueFormal:serial(issueFormal83at),runtimeAdmission:plan=>formalBinding83at.admit(plan),formalLifecycle:serial(formalLifecycle83at),clearFormal:serial(clearFormal83at),formalStats:()=>Object.freeze({bindings:formalBinding83at.size(),bindingBytes:formalBinding83at.serializedBytes(),certificates:formalCertificates83at.size}),start:serial(start),")
s=rep(s,'const passes=new Map(),reserved=r.reservedBytes+r.residentBytes+r.publicationBytes+C.serializedBytes(r.proof)+262176;', 'const passes=new Map(),reserved=r.reservedBytes+r.residentBytes+r.publicationBytes+C.serializedBytes(r.proof)+262176+(formal?formalBinding83at.serializedBytes()+C.serializedBytes([...formalCertificates83at])+4096:0);')
(d/'private-controller83.js').write_text(s)
s=(r/'dev/avoidance/burst83/stage-fastguard83ap/prepared-handoff83.js').read_text()
s=rep(s,"function revoke(){if(ready){", "function revoke(){owner.clearFormal();if(ready){")
a="adapter:Object.freeze({...unit.adapter,finalize:serial(args=>{if(currentInner){currentInner.cancel();job=null;currentInner=null}try{return unit.adapter.finalize(args)}catch(e){if(e.code!=='BURST83AJ_PREPARE_REQUIRED'){generation++;stage=null;revoke()}throw e}})})"
b="adapter:Object.freeze({...unit.adapter,id:'burst_prepared83at',finalize:serial(args=>{if(currentInner){currentInner.cancel();job=null;currentInner=null}try{return unit.adapter.finalize(args)}catch(e){if(e.code!=='BURST83AJ_PREPARE_REQUIRED'){generation++;stage=null;revoke();throw e}if(!ready||readyGeneration!==generation){if(ready)revoke();throw e}unit.staged();return owner.issueFormal(ready,args)}}),runtimeAdmission:({plan})=>owner.runtimeAdmission(plan),finalizationLifecycle:serial(args=>owner.formalLifecycle(args))})"
s=rep(s,a,b)
s=rep(s,"canIssueSafeTrajectory:false", "canIssueSafeTrajectory:true,formal:owner.formalStats()")
(d/'prepared-handoff83.js').write_text(s)
