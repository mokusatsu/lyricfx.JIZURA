from pathlib import Path
import sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);s=(root/'src/11zz08_bulbs_destination80.js').read_text()
s=s.replace('const A=J.placement,P=', 'const A=J.placement,V=A.bulbsViewportRoot86ae,P=',1)
s=s.replace('function replay({renderer,plan,ctx,model,recipeId,delta,diagnostic=false,onScalar=null,afterPristine=null,reservedBytes=0}){',"function* replay({renderer,plan,ctx,model,recipeId,delta,viewport,ownerReservation,beforeResume,onAccounting}){\n const diagnostic=false,onScalar=null,afterPristine=null;need(typeof ownerReservation==='function'&&typeof beforeResume==='function'&&typeof onAccounting==='function','BULBS86AF_PRIVATE_OWNER_CALLBACK');const scale=viewport.scale,width=viewport.width,height=viewport.height;need(Number.isFinite(scale)&&scale>0&&scale<=1&&width===Math.round(960*scale)&&height===Math.round(540*scale),'BULBS86AF_VIEWPORT');need(V&&typeof V.makeEnv==='function','BULBS86AF_SOURCE');beforeResume();let reservedBytes=ownerReservation();")
s=s.replace('ctx.canvas.width===960&&ctx.canvas.height===540','ctx.canvas.width===width&&ctx.canvas.height===height')
s=s.replace('modelBytes=C.serializedBytes(model),','modelBytes=C.serializedBytes(model),')
s=s.replace("need(n<=8388608,'BULBS80Z_MEMORY_BUDGET',{n,limit:8388608});","need(n<=8388608,'BULBS80Z_MEMORY_BUDGET',{n,limit:8388608});onAccounting(n-reservedBytes);")
# Resident model is already inside the private owner total. Retain independent
# measured size as a cross-check and account the new model reference metadata.
s=s.replace('const refs=new Map();',"need(Array.isArray(model.schedule)&&model.schedule.length>0&&model.schedule.length<=1536&&Array.isArray(model.localTable.references)&&model.localTable.references.length<=6144&&/^[a-z][a-z0-9-]{0,31}$/.test(recipeId),'BULBS86AF_INDEX_SCOPE');const initialWorkUpperBound=model.schedule.length*512+2*C.serializedBytes(plan)+16384;need(reservedBytes+initialWorkUpperBound<=8388608,'BULBS86AF_INDEX_BUDGET');onAccounting(initialWorkUpperBound);const refs=new Map();")
s=s.replace('for(const r of model.localTable.references){if(r.recipe!==recipeId)continue;',"for(const r of model.localTable.references){need(Object.keys(r).sort().join(',')==='n,pass,recipe,template'&&Number.isInteger(r.n)&&r.n>=0&&r.n<512&&['B','A','main'].includes(r.pass)&&typeof r.recipe==='string'&&/^[a-z][a-z0-9-]{0,31}$/.test(r.recipe)&&Number.isInteger(r.template)&&r.template>=0&&r.template<6144,'BULBS86AF_INDEX_SCOPE');if(r.recipe!==recipeId)continue;")
s=s.replace('work=null;yield Object.freeze({completed:rootCount});', 'work=null;const checkpoint=Object.freeze({completed:rootCount});budget({checkpoint});yield checkpoint;')
s=s.replace("beforeResume();let reservedBytes=ownerReservation();","const viewportMetadataBytes=C.serializedBytes({viewport:{scale,width,height},privateCallbacks:3,metadataReservation:1024})+1024;beforeResume();let reservedBytes=ownerReservation();")
s=s.replace('const n=reservedBytes+modelBytes+refsBytes+',"const n=reservedBytes+96+viewportMetadataBytes+refsBytes+")
s=s.replace('if(afterPristine)afterPristine();try{for(const entry of model.schedule){ctx.save();try{',"need(Number.isSafeInteger(reservedBytes)&&reservedBytes>=modelBytes,'BULBS86AF_OWNER_MODEL_RESERVATION');if(afterPristine)afterPristine();try{for(const entry of model.schedule){need(A.bulbsViewportRoot86ae===V,'BULBS86AF_SOURCE');beforeResume();reservedBytes=ownerReservation();need(Number.isSafeInteger(reservedBytes)&&reservedBytes>=modelBytes,'BULBS86AF_OWNER_MODEL_RESERVATION');ctx.save();try{")
s=s.replace('env=P.makeEnv(renderer,plan,cut,ctx,own,entry.realTime),root=P.matrix(ctx);need(root.length===entry.root.length&&root.every((v,i)=>Object.is(v,entry.root[i])),\'BULBS80Z_ACTUAL_ROOT\');',"env=V.makeEnv(renderer,plan,cut,ctx,own,entry.realTime,scale),root=P.matrix(ctx);need(root.length===6&&root.every(Number.isFinite),'BULBS86AF_ACTUAL_ROOT');")
s=s.replace('}finally{ctx.restore();}work=null;}','}finally{ctx.restore();}work=null;yield Object.freeze({completed:rootCount});}')
s=s.replace("const heldInput=held.snapshot()", "need(A.bulbsViewportRoot86ae===V,'BULBS86AF_SOURCE');beforeResume();reservedBytes=ownerReservation();need(Number.isSafeInteger(reservedBytes)&&reservedBytes>=modelBytes,'BULBS86AF_OWNER_MODEL_RESERVATION');const heldInput=held.snapshot()")
s=s.replace("kind:'bulbs-normal-detail-off-replay80'", "kind:'bulbs-viewport-replay86af',viewport:{scale,width,height},domain:'source-only-owner-internal-proposal'")
s=s.replace("meaning:'caller reserved prior oracle rows + supplied model", "modelAlreadyInsideOwnerReservation:true,modelReferenceReservation:96,meaning:'latest private owner total includes supplied resident model; new model reference96 + viewport working")
s=s.replace('return result;',"beforeResume();reservedBytes=ownerReservation();need(A.bulbsViewportRoot86ae===V,'BULBS86AF_SOURCE');budget({heldInput,quality,result});return result;")
s=s.replace('work=null;yield Object.freeze({completed:rootCount});','work=null;const checkpoint=Object.freeze({completed:rootCount});budget({checkpoint});yield checkpoint;')
s=s.replace("A.bulbsNormalReplay80=Object.freeze", "A.bulbsViewportReplay86af=Object.freeze")
# This generator is an unregistered private-owner integration dependency. It does
# not change the existing canonical replay or issue any model/frame authority.
assert 'A.bulbsNormalReplay80=Object.freeze' not in s
assert 'env=V.makeEnv' in s and 'yield checkpoint' in s
s='/* UNREGISTERED viewport proposal generator; callbacks must be private owner closures. No authority. */\n'+s
out.mkdir(parents=True,exist_ok=True);(out/'replay86.js').write_text(s)
