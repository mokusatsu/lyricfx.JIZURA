from pathlib import Path
import sys
R=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent
def rep(s,a,b):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,b)
s=(R/'src/11zz07_bulbs_owner80.js').read_text()
s=rep(s,'const counts={compiles:0,hits:0,evictions:0}', 'const counts={compiles:0,hits:0,evictions:0,reuses:0}')
# Park one immutable model, while deleting its old public handle immediately.
s=rep(s,'function lookup(handle)', '''function park(handle){need(!pending&&!borrowed,'BULBS80N_REENTRANT');const e=lookup(handle);handles.delete(handle);e.handle=null;e.currentGeneration86bj=null;e.sourcePlan86bj=null;e.parked86co=true;for(const key of [...resident.keys()])if(key!==e.key)evict(key);account();}
function clearParked(){need(!pending&&!borrowed,'BULBS80N_REENTRANT');for(const e of [...resident.values()])if(e.parked86co)evict(e.key);}
function lookup(handle)''')
s=rep(s,'handle:null,busy:false,expectedContext:null}', 'handle:null,cached:null,busy:false,expectedContext:null}')
needle="r.input=freeze(clone(plan));marker.input=r.input;"
s=rep(s,needle,"""const cached=resident.get(r.key);if(cached?.parked86co&&cached.renderer===renderer&&cached.ctx===ctx&&cached.depKey===r.depKey&&keys(cached.context)===r.expectedContext){r.cached=cached;state.phase='reusing';return}for(const e of [...resident.values()])if(e.parked86co)evict(e.key);"""+needle)
s=rep(s,"verify();need(state.phase==='preparing','BULBS86C_PHASE');", """verify();if(state.phase==='reusing'){const entry=r.cached;need(resident.get(r.key)===entry,'BULBS80N_MODEL_NOT_ADMITTED');const handle=Object.freeze({kind:'bulbs-owned-model-handle80',id:++serial});const data={id:entry.id,key:r.key,fullKey:r.fullKey,depKey:r.depKey,dependency:entry.dependency,context:r.context,model:entry.model};residentBytes-=entry.bytes;Object.assign(entry,{fullKey:r.fullKey,handle,currentGeneration86bj:isCurrent,sourcePlan86bj:plan,parked86co:false,bytes:bytes(data)+bytes({key:r.key,handle,currentGenerationCallbackSlots:1,currentInputReferenceSlots:1})+2*96});residentBytes+=entry.bytes;handles.set(handle,entry.id);r.handle=handle;r.cached=null;counts.reuses++;state.lastStep={phase:'previous-model',ms:0};state.steps++;clear('complete');account();need(resident.get(r.key)===entry,'BULBS80N_MODEL_NOT_ADMITTED');return Object.freeze({...state,modelExposed:false})}need(state.phase==='preparing','BULBS86C_PHASE');""")
s=rep(s,'r.iterator=null;r.input=null;r.model=null;', 'r.iterator=null;r.input=null;r.model=null;r.cached=null;')
s=rep(s,'{beginPreparation86c,installPlanDependencies80', '{park,clearParked,beginPreparation86c,installPlanDependencies80')
(U/'owner86co.js').write_text(s)
s=(R/'src/11zz09_bulbs_controller80.js').read_text()
s=rep(s,'let inspection=null,planBindings=null,adapterReservation=()=>0;', "let inspection=null,planBindings=null,adapterReservation=()=>0,previous86co=null;const reuse86co={accepted:0,rejected:0,checkedSupports:0,candidates:0};")
needle='  for(const row of model.frameData.recipes)'
a=s.index(needle)
s=s[:a]+'''  let previous=previous86co;previous86co=null;if(previous){recordsBytes-=previous.serializedBytes;let passed=previous.modelId===access.residentId(handle)&&exactSame(previous.evaluationRange,evaluationRange)&&exactSame(previous.viewport,viewport)&&exactSame(previous.profile,profile);if(passed){for(const g of previous.groups){reuse86co.checkedSupports++;if(!VG.evaluation([{owner:g.pass+'.'+g.semantic,bounds:g.bounds}],circle,[0,0],viewport).passed){passed=false;break}}}if(passed){reuse86co.accepted++;const record={...previous,id:++serial,handle,renderer,plan:frozenPlan,circle,profile,deps:deps(renderer),sourceKey:planBindings?planBindings.sourceKey(frozenPlan):null};record.serializedBytes=C.serializedBytes({id:record.id,sourceKey:record.sourceKey,evaluationRange,circle,recipeId:record.recipeId,delta:record.delta,viewport,directViewport86bj:true,profile,groups:record.groups,held:record.held,referenceEntries:[...record.referenceIndex],dependency:record.deps,plan:frozenPlan});previous=null;ownerReservation=onWork(record.serializedBytes+8192);return{record,ownerReservation}}reuse86co.rejected++;previous=null;}
'''+s[a:]
s=rep(s,'const selected=candidates[index],recipeId=selected.recipeId,delta=selected.delta.slice();work=null;candidates.length=0;', 'reuse86co.candidates+=candidates.length;const selected=candidates[index],recipeId=selected.recipeId,delta=selected.delta.slice();work=null;candidates.length=0;') if s.count('const selected=candidates[index],recipeId=selected.recipeId,delta=selected.delta.slice();work=null;candidates.length=0;')==1 else s.replace('const selected=candidates[index],recipeId=selected.recipeId,delta=selected.delta.slice();work=null;candidates.length=0;', 'reuse86co.candidates+=candidates.length;const selected=candidates[index],recipeId=selected.recipeId,delta=selected.delta.slice();work=null;candidates.length=0;',1)
s=rep(s,'const releaseTicket=ticket=>{', 'const clearPrevious=()=>{if(previous86co){recordsBytes-=previous86co.serializedBytes;previous86co=null}};const releaseTicket=(ticket,keep=false)=>{')
s=rep(s,'recordsBytes-=rec.serializedBytes;onAccount(planBindings.serializedBytes())', '''recordsBytes-=rec.serializedBytes;clearPrevious();if(keep&&rec.directViewport86bj){previous86co={modelId:rec.modelId,referenceIndex:rec.referenceIndex,evaluationRange:rec.evaluationRange,recipeId:rec.recipeId,delta:rec.delta,viewport:rec.viewport,directViewport86bj:true,profile:rec.profile,groups:rec.groups,held:rec.held};previous86co.serializedBytes=C.serializedBytes({...previous86co,referenceIndex:[...rec.referenceIndex]})+1024;recordsBytes+=previous86co.serializedBytes}onAccount(planBindings.serializedBytes())''')
s=rep(s,'Object.freeze({resources:()=>Object.freeze({records:records.size,', 'Object.freeze({clearPrevious,resources:()=>Object.freeze({reuse:{...reuse86co},previousBytes:previous86co?.serializedBytes||0,records:records.size,')
s=rep(s,'drop:certificate=>{', 'drop:(certificate,keep=false)=>{')
s=rep(s,'try{releaseTicket(released.ticket)}', 'try{releaseTicket(released.ticket,keep)}')
(U/'controller86co.js').write_text(s)
s=(R/'src/11zz10_bulbs_adapter80.js').read_text()
s=rep(s,'function revokeStage(){', 'function revokeStage(keep=false){')
s=rep(s,'if(old.certificate)issuer.drop(old.certificate);else if(old.created)issuer.releaseTicket(old.created.ticket)', 'if(old.certificate)issuer.drop(old.certificate,keep);else if(old.created)issuer.releaseTicket(old.created.ticket,keep)')
s=rep(s,'if(old.handle)O.drop(old.handle)', 'if(old.handle){if(keep&&old.phase===\'complete\')O.park(old.handle);else O.drop(old.handle)}')
s=rep(s,'if(failure)throw failure}}', 'if(failure)throw failure}if(!keep){issuer.clearPrevious();O.clearParked()}}')
s=rep(s,'cancel(){revokeStage();return stageState()}', "cancel(reason){revokeStage(['replan','begin','debounce','stage'].includes(reason));return stageState()}")
s=rep(s,"current.phase='preparing';issuer.checkBudget(0);", "if(current.job.state().phase!=='reusing')issuer.clearPrevious();current.phase='preparing';issuer.checkBudget(0);")
# A new native plan is staged only after the old stage has relinquished authority.
s=rep(s,"if(!preparedStage||preparedStage.key!==key){revokeStage();", "if(!preparedStage||preparedStage.key!==key){revokeStage(true);")
s=rep(s,'preparationApi.cancel();cv.width=view.width;', "preparationApi.cancel('stage');cv.width=view.width;")
s=rep(s,'cancel(){uiFormal86bx=null;uiInputKey86bx=null;return preparationApi.cancel()}', 'cancel(reason){uiFormal86bx=null;uiInputKey86bx=null;return preparationApi.cancel(reason)}')
(U/'adapter86co.js').write_text(s)
s=(R/'src/11zz11_bulbs_session86.js').read_text()
s=rep(s,'function cancelRuntime(){', 'function cancelRuntime(reason){')
s=rep(s,'runtime.cancel();', 'runtime.cancel(reason);')
s=rep(s,"error=null;details=null;cancelRuntime();", "error=null;details=null;cancelRuntime(reason);")
s=rep(s,'active=true;invalidate();', "active=true;invalidate('begin');")
(U/'session86co.js').write_text(s)
s=(R/'src/12_ui.js').read_text();a=s.index(' async waitFonts(plan,isCurrent){');z=s.index('\n schedule:',a)
# Reuse the existing, reviewed completed-font predicate and face snapshot helper.
# No new shared font cache or weaker revision policy.
method=s[a:z].replace('dominoFontReady82aq','bulbsFontReady86co')
a=s.index(' waitFonts(plan,isCurrent){');z=s.index('\n schedule:',a)
s=s[:a]+method+s[z:];s=rep(s,'let bulbsReplanning86ci=false,bulbsState86ci=null;', 'let bulbsReplanning86ci=false,bulbsState86ci=null,bulbsFontReady86co=null;')
(U/'ui86co.js').write_text(s)
