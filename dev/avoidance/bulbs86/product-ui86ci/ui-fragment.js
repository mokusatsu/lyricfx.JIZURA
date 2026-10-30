let bulbsReplanning86ci=false,bulbsState86ci=null;
// Serialize generation font phases, including already-started UI/font-thumbnail requests.
function createBulbsFontQueue86ci(){let tail=Promise.resolve();const pending=new Set();function track(factory){const p=Promise.resolve().then(factory);pending.add(p);p.then(()=>pending.delete(p),()=>pending.delete(p));return p}async function drain(){for(;;){if(pending.size)await Promise.allSettled([...pending]);await Promise.resolve();if(!pending.size)return}}function run(isCurrent,work){const job=tail.then(async()=>{await drain();if(!isCurrent())return;await work();await drain()});tail=job.catch(()=>{});return job}return Object.freeze({track,run});}
const bulbsFontQueue86ci=createBulbsFontQueue86ci(),trackFonts86ci=factory=>bulbsFontQueue86ci.track(factory);

// The editable plan stays mutable. Only the private current generation is drawn.
const bulbsTarget86ci=plan=>plan?.layerVisibility?.lyrics!==false&&J.placement.bulbsFrameController80.targetsPreview(plan);
const bulbsBoundary86ci=kind=>Object.assign(new Error(J.mediaLabel(
  kind==='area'?'電球の回避プレビューでは位置編集にまだ対応していません。':kind==='detail'?'電球の回避配置はメインプレビューで確認してください。':'電球の回避配置は現在メインプレビューのみ対応しています。画像・動画の保存にはまだ対応していません。',
  kind==='area'?'Position editing is not yet supported for the bulbs avoidance preview.':kind==='detail'?'Check bulbs avoidance in the main preview.':'Bulbs avoidance currently supports the main preview only. Image and video output are not yet supported.'
)),{code:'BULBS_UI_'+kind.toUpperCase()+'_UNSUPPORTED'});
function clearBulbsView86ci(ctx){ctx.save();try{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height)}finally{ctx.restore()}}
function showBulbsState86ci(state){const box=$('bulbsPreparation'),label=$('bulbsPreparationText'),cancel=$('bulbsCancel'),retry=$('bulbsRetry');if(!box)return;const pending=state.active&&['empty','fonts','preparing'].includes(state.phase),blocked=!!state.cleanupError||state.active&&['cancelled','unsupported'].includes(state.phase);box.hidden=(!pending&&!blocked)||!J.placement.bulbsFrameController80.targetsFrame(S.plan,S.t);cancel.hidden=!pending;retry.hidden=!blocked||!!state.cleanupError;cancel.textContent=J.mediaLabel('準備を中止','Cancel preparation');retry.textContent=J.mediaLabel('再準備','Try again');label.textContent=state.phase==='cancelled'?J.mediaLabel('準備を中止しました。','Preparation cancelled.'):state.phase==='unsupported'?J.mediaLabel('この条件では電球の回避配置を表示できません。入力やプレビューサイズを変更してください。','Bulbs avoidance is unavailable for these conditions. Change the input or preview size.'):J.mediaLabel('電球の回避配置を準備中…','Preparing bulbs avoidance…');if(state.cleanupError)label.textContent+=' '+J.mediaLabel('準備の終了処理に失敗しました。再読み込みしてください。','Preparation cleanup failed. Reload the app.');}
const bulbsSession86ci=J.placement.bulbsUISession86bx.create({
 runtime:J.placement.bulbsUIRuntime86bx,readPlan:()=>S.plan,
 waitFonts(plan,isCurrent){return bulbsFontQueue86ci.run(isCurrent,async()=>{const lyrics=S.project.lyrics;await ensureFonts();if(!isCurrent())return;await trackFonts86ci(()=>J.ensureFonts(lyrics,J.fontsOfPlan(plan)));if(!isCurrent())return;await trackFonts86ci(()=>J.ensureFonts('字面',[...new Set(J.STYLE_ORDER.map(k=>J.STYLES[k].fonts.display[0]))]));if(!isCurrent())return;await document.fonts.ready;if(!isCurrent())return;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))});},
 schedule:fn=>setTimeout(fn,0),now:()=>performance.now(),hide:clearBulbsView86ci,
 onState(state){bulbsState86ci=state;showBulbsState86ci(state);if(!state.active&&!state.cleanupError)return;S.need=true;if(!state.ready){const c=$('view');if(c)clearBulbsView86ci(c.getContext('2d'))}}
});
$('bulbsCancel').addEventListener('click',()=>{bulbsSession86ci.cancel();S.need=true});
$('bulbsRetry').addEventListener('click',()=>{if(bulbsTarget86ci(S.plan)&&!S.areaEdit)bulbsSession86ci.begin()});
for(const event of ['input','change'])document.addEventListener(event,e=>{if(['lyrics','lyricAvoidanceStrength','lyricGroupAvoidanceStrength'].includes(e.target.id)||e.target.closest?.('#fontRoles'))bulbsSession86ci.invalidate('input')},true);
