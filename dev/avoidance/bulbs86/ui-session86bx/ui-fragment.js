// Candidate UI connection. Editable S.plan remains the original compose output.
const bulbsSession86bx=J.placement.bulbsUISession86bx.create({
 runtime:J.placement.bulbsUIRuntime86bx,readPlan:()=>S.plan,
 async waitFonts(plan){await ensureFonts();await J.ensureFonts(S.project.lyrics,J.fontsOfPlan(plan));await J.ensureFonts('字面',[...new Set(J.STYLE_ORDER.map(k=>J.STYLES[k].fonts.display[0]))]);await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))},
 schedule:fn=>setTimeout(fn,0),now:()=>performance.now(),
 hide(ctx){ctx.save();try{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height)}finally{ctx.restore()}},
 onState(state){if(!state.active)return;S.need=true;if(['empty','fonts','preparing','unsupported'].includes(state.phase)){const c=$('view');if(c){const x=c.getContext('2d');x.save();try{x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,c.width,c.height)}finally{x.restore()}}}showMsg(state.phase==='fonts'||state.phase==='preparing'?'回避配置を準備中…':state.phase==='unsupported'?'この入力は現在の回避配置に対応していません。':null)}
});
// Capture runs before target handlers and their debounce/font awaits.
for(const event of ['input','change'])document.addEventListener(event,e=>{if(['lyrics','lyricAvoidanceStrength','lyricGroupAvoidanceStrength'].includes(e.target.id)||e.target.closest?.('#fontRoles'))bulbsSession86bx.invalidate('input')},true);
