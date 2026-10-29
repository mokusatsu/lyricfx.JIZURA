 // This fragment is inserted inside create(), beside the genuine private owner.
 // It is not a public factory accepting ticketState or arbitrary trajectories.
 const ADAPTER_ID='domino_prepared82ac',STAGE_RESERVE=262144,BINDING_RESERVE=131072;
 let planBinding=null,stage=null,provisional=null,certificates=[],adapterInstalled=false,privateAdapter=null;
 const BP=A.dominoPlanBinding82ac,IP=A.dominoFinalizerInput82s,finalValidate=A.validateFinal,runtimeHelper=A.layoutsDRuntimeAdmission,dependencyCollector=A.layoutsDCacheAdapterDependencies;
 const generationNow=()=>options.currentGeneration?options.currentGeneration():0;
 const adapterSource=()=>{need(A.dominoPlanBinding82ac===BP&&A.dominoFinalizerInput82s===IP&&A.validateFinal===finalValidate&&A.layoutsDRuntimeAdmission===runtimeHelper&&A.layoutsDCacheAdapterDependencies===dependencyCollector,'DOMINO82AC_BINDING_SOURCE');if(privateAdapter){const tuple=dependencyCollector().find(x=>x[0]==='dominoes'),expected=['dominoes',ADAPTER_ID,privateAdapter.finalize,privateAdapter.render,privateAdapter.runtimeAdmission,privateAdapter.finalizationLifecycle];need(tuple&&tuple.length===expected.length&&tuple.every((v,i)=>v===expected[i]),'DOMINO82AC_ADAPTER_IDENTITY');}};
 const stageAccount=work=>{const n=C.serializedBytes({stage,provisional,certificates,work})+4096;need(n<=STAGE_RESERVE,'DOMINO82AC_STAGE_BUDGET');return n};
 function releaseCertificate(certificate){const i=certificates.indexOf(certificate);if(i>=0){certificates.splice(i,1);planBinding.drop(certificate);}}
 function clearCertificates(){for(const certificate of certificates.slice())releaseCertificate(certificate);provisional=null;}
 function nativeRecord(){need(ticketRecord,'DOMINO82AC_PREPARE_REQUIRED');owner.validate(ticketRecord.handle,ticketRecord.plan);return ticketRecord;}
 function installPreparedAdapter(){need(!adapterInstalled&&!active&&!ticketRecord,'DOMINO82AC_INSTALL');need(BP&&IP&&typeof finalValidate==='function'&&typeof dependencyCollector==='function','DOMINO82AC_DEPENDENCIES');adapterInstalled=true;
  planBinding=BP.create({adapterId:ADAPTER_ID,codec:C,validateFinal:plan=>{adapterSource();finalValidate(plan)},onAccount:n=>{need(n<=BINDING_RESERVE,'DOMINO82AC_BINDING_BUDGET')},ticketState:ticket=>{adapterSource();const r=nativeRecord();need(r.ticket===ticket,'DOMINO82AC_TICKET');return{recordId:ticket.id,modelId:ticket.id,sourceKey:r.sourceKey}}});
  const adapter=Object.freeze({id:ADAPTER_ID,
   finalize({plan,cut,...evaluation}){need(!active,'DOMINO82Q_FRAME_ACTIVE');adapterSource();if(owner.stats().pending){owner.drop();ticketRecord=null;}let residentReserve=0;if(ticketRecord){try{owner.withPrepared(ticketRecord.handle,ticketRecord.plan,(m,c,b)=>{residentReserve=b.reservedBytes+b.modelBytes})}catch{clearCertificates();ticketRecord=null;owner.drop();}}const input=IP.project(plan,{phase:'working',reservedBytes:residentReserve+stageAccount(null)+BINDING_RESERVE});need(input.workingBytes+stageAccount(null)<=STAGE_RESERVE,'DOMINO82AC_STAGE_BUDGET');need(plan.cuts[0]===cut,'DOMINO82AC_CUT');const generation=generationNow();need(Number.isSafeInteger(generation),'DOMINO82P_GENERATION');
    let reusable=stage&&stage.key===input.sourceKey&&stage.generation===generation&&ticketRecord;try{if(reusable)nativeRecord()}catch{reusable=false;}
    if(!reusable){clearCertificates();ticketRecord=null;owner.drop();stage={plan:input.nativePlan,key:input.sourceKey,generation};stageAccount({input});need(false,'DOMINO82AC_PREPARE_REQUIRED');}
    need(!provisional,'DOMINO82AC_PENDING');const r=nativeRecord(),range=T.evaluationRange(plan,cut,evaluation);need(range.every((v,i)=>Object.is(v,r.evaluationRange[i])),'DOMINO82AC_TIME_RANGE');
    let trajectory;owner.withPrepared(r.handle,r.plan,model=>{const region=plan.lyricAvoidanceIndex.regions[0],circle={cx:region.center.x*plan.W,cy:region.center.y*plan.H,r:region.radius*Math.min(plan.W,plan.H)};need(['cx','cy','r'].every(k=>Object.is(circle[k],model.circle[k])),'DOMINO82AC_REGION');trajectory={kind:'layouts-d-source-native',version:1,revision:evaluation.revision,measurementSupported:true,evaluationRange:[...range],sourceProof:{kind:'domino-source-y-owned82ac',sourceDy:model.dy,rasterPad:2,own:model.coverage.own,timePolicy:'exact-model-preimages/initial-clamp/empty-tail'},safety:'certified-bounded-adapter',units:[{owner:'dominoes.row.0',segments:[{start:region.start,end:region.end,region:region.id,from:[0,0],to:[0,0],status:'safe',decision:'certified',circle}]}]};});
    // This dedicated source-Y route has no placement-unit replay. Keep native text metadata.
    delete cut.placementUnits;stageAccount({input,trajectory});while(certificates.length>=2)releaseCertificate(certificates[0]);const certificate=planBinding.issue({plan,ticket:r.ticket,trajectory});certificates.push(certificate);provisional={plan,certificate};try{stageAccount({trajectory});return{...trajectory,certificate}}catch(error){releaseCertificate(certificate);provisional=null;throw error}
   },runtimeAdmission:({plan})=>planBinding.admit(plan),
   finalizationLifecycle({phase,plan,trajectory}){adapterSource();if(phase==='failed'||phase==='aborted'){if(provisional){releaseCertificate(provisional.certificate);provisional=null;}else if(trajectory?.certificate)releaseCertificate(trajectory.certificate);stageAccount(null);return;}need(provisional&&provisional.plan===plan&&trajectory.certificate===provisional.certificate,'DOMINO82AC_LIFECYCLE');if(phase==='finalized'){planBinding.assertReady(plan);provisional=null;}stageAccount(null);},
   render(){need(false,'DOMINO82AC_PRIVATE_FRAME_REQUIRED')}
  });
  privateAdapter=adapter;return Object.freeze({adapter,
   beginPrepared(){adapterSource();need(stage&&stage.generation===generationNow(),'DOMINO82AC_STAGE_STALE');clearCertificates();const job=begin(stage.plan,{generation:stage.generation});return job;},
   stepPrepared:owner.step,
   commitPrepared(job){need(stage&&stage.generation===generationNow(),'DOMINO82AC_STAGE_STALE');commit(job,stage.plan);return Object.freeze({prepared:true,authority:false});},
   cancelPrepared(){need(!active,'DOMINO82Q_FRAME_ACTIVE');clearCertificates();stage=null;ticketRecord=null;owner.drop();},
   stats:()=>Object.freeze({staged:!!stage,prepared:!!ticketRecord,stageBytes:stageAccount(null),bindingBytes:planBinding.serializedBytes(),sourceOnly:true,uiConnected:false})
  });
 }
