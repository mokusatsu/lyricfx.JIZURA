from pathlib import Path
import sys
r=Path(sys.argv[1]).resolve();d=Path(__file__).resolve().parent;b=r/'dev/avoidance/bulbs86';old=b/'design-prepare86bw'
def swap(s,a,v):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,v)
def put(n,s):(d/n).write_text(s)
# Exact uniform design-stage scale; limits preserve the existing <=1 viewport domain.
valid="Number.isInteger(ctx.canvas.width)&&ctx.canvas.width>0&&ctx.canvas.width<=1920&&Number.isInteger(ctx.canvas.height)&&ctx.canvas.height===Math.round(1080*(ctx.canvas.width/1920))"
for n in ['root86.js','geometry86.js','controller86.js','replay86.js']:
 s=(old/n).read_text()
 # Only obsolete non-direct fallback; its binding must use captured viewport, too.
 if n=='controller86.js':s=swap(s,'rec.viewport.scale===.375','rec.viewport.scale===rec.viewport.width/rec.plan.W')
 put(n,s)
s=(old/'scalar-generator86.js').read_text();s=swap(s,'ctx.canvas.width===720&&ctx.canvas.height===405',valid)
# Keep all original work/clock/geometry and accounting; add yields at bounded stage boundaries.
cp="yield Object.freeze({kind:'bulbs-own-checkpoint80ab',phase:PHASE,completed:scalarCount,total:clocks.actualCounts.selectedPasses});"
s=swap(s,'const heldInput=held.snapshot();',cp.replace('PHASE',"'held-snapshot'")+"const heldInput=held.snapshot();")
s=swap(s,'const qualityStart=performance.now()',cp.replace('PHASE',"'held-quality'")+"const qualityStart=performance.now()")
s=swap(s,'const localPayload=localStore.finish();',cp.replace('PHASE',"'local-finish'")+"const localPayload=localStore.finish();")
s=swap(s,"const finalAccount=createFinalAccount",cp.replace('PHASE',"'frame-data'")+"const finalAccount=createFinalAccount")
s=swap(s,'const model={viewport:',cp.replace('PHASE',"'model-output'")+"const model={viewport:")
put('scalar-generator86.js',s)
s=(old/'model-owner86.js').read_text();s=swap(s,'ctx.canvas.width===720&&ctx.canvas.height===405',valid);s=swap(s,'scale:.375,width:ctx.canvas.width','scale:ctx.canvas.width/1920,width:ctx.canvas.width');s=swap(s,'model.viewport?.scale===.375&&model.viewport.width===720&&model.viewport.height===405',"model.viewport?.scale===e.context.viewport.scale&&model.viewport.width===e.ctx.canvas.width&&model.viewport.height===e.ctx.canvas.height")
s=swap(s,'const next=r.iterator.next();state.steps++;',"const stepPhase=state.checkpoint||'scalar',stepStart=performance.now();const next=r.iterator.next();state.lastStep={phase:stepPhase,ms:performance.now()-stepStart};state.steps++;")
s=swap(s,"r.expectedContext=keys(contextSnapshot(ctx));verify();return Object.freeze({...state,modelExposed:false})", "state.checkpoint=next.value.phase||'scalar';r.expectedContext=keys(contextSnapshot(ctx));verify();return Object.freeze({...state,modelExposed:false})")
s=s.replace('phase:state.phase,steps:state.steps,', 'phase:state.phase,steps:state.steps,checkpoint:state.checkpoint,lastStep:state.lastStep,');s=s.replace('dedicated720x405 viewport','dedicated input-derived viewport');put('model-owner86.js',s)
s=(old/'post86.js').read_text();s=swap(s,'(opt.scale??1)!==.375',"!Number.isFinite(opt.scale??1)||(opt.scale??1)<=0||(opt.scale??1)>1||(opt.scale??1)!==ctx.canvas.width/plan.W")
s=swap(s,'apply(widthGet,canvas,[])===720&&apply(heightGet,canvas,[])===405',"plan.W===1920&&plan.H===1080&&apply(widthGet,canvas,[])===Math.round(plan.W*(opt.scale??1))&&apply(heightGet,canvas,[])===Math.round(plan.H*(opt.scale??1))")
put('post86.js',s)
s=(old/'adapter86.js').read_text();s=swap(s,"REV='bulbs-design-cooperative86bw-v1'","REV='bulbs-variable-ui86ca-v1'");s=swap(s,'const cv=document.createElement(\'canvas\');cv.width=720;cv.height=405;',"const cv=document.createElement('canvas');cv.width=1;cv.height=1;")
s=swap(s,"let preparedStage=null,stageGeneration=0;", "let preparedStage=null,stageGeneration=0;let lastStep86ca=null;")
s=swap(s,"phase:preparedStage?.phase||'empty',modelExposed", "phase:preparedStage?.phase||'empty',lastStep:lastStep86ca,modelExposed")
s=swap(s,"const status=current.job.step();", "const started=performance.now(),status=current.job.step();lastStep86ca={phase:status.lastStep?.phase||'compile',iteratorMs:status.lastStep?.ms??null,ms:performance.now()-started};")
s=swap(s,"const status=current.recordJob.step();", "const started=performance.now(),status=current.recordJob.step();lastStep86ca={phase:'proof',iteratorMs:null,ms:performance.now()-started};")
s=swap(s,'+3*65536+4096+', '+3*65536+4096+1024+');put('adapter86.js',s)
s=(b/'ui-session86bx/runtime-fragment.js').read_text();s=swap(s,"need(preparedStage&&stageKey(plan)===uiInputKey86bx,'BULBS86BX_INPUT');", "const view=document.getElementById('view');need(view&&view.width===cv.width&&view.height===cv.height,'BULBS86CA_VIEWPORT_STALE');need(preparedStage&&stageKey(plan)===uiInputKey86bx,'BULBS86BX_INPUT');")
s=swap(s,"view&&view.width===720&&view.height===405", "view&&plan.W===1920&&plan.H===1080&&Number.isInteger(view.width)&&view.width>0&&view.width<=plan.W&&Number.isInteger(view.height)&&view.height>0&&view.height===Math.round(plan.H*(view.width/plan.W))")
s=swap(s,"uiFormal86bx=null;uiInputKey86bx=stageKey(plan);", "preparationApi.cancel();cv.width=view.width;cv.height=view.height;uiFormal86bx=null;uiInputKey86bx=stageKey(plan);")
put('runtime-fragment.js',s)
s=(b/'ui-session86bx/session86.js').read_text();s=swap(s,'maxStepMs=0,stepCount=0;',"maxStepMs=0,stepCount=0,stepProfile={};");s=swap(s,'maxStepMs,stepCount,elapsedMs',"maxStepMs,stepCount,stepProfile:JSON.parse(JSON.stringify(stepProfile)),elapsedMs")
s=swap(s,'maxStepMs=0;stepCount=0;const g=',"maxStepMs=0;stepCount=0;stepProfile={};const g=")
s=swap(s,'s=runtime.step(p)',"s=runtime.step(p);const v=s.lastStep;if(v){const row=stepProfile[v.phase]||(stepProfile[v.phase]={count:0,totalMs:0,maxMs:0,maxIteratorMs:0});row.count++;row.totalMs+=v.ms;row.maxMs=Math.max(row.maxMs,v.ms);row.maxIteratorMs=Math.max(row.maxIteratorMs,v.iteratorMs||0)}")
put('session86.js',s)
