from pathlib import Path
import sys
r=Path(sys.argv[1]);d=Path(__file__).parent;s=(r/'src/12_ui.js').read_text()
a='/* WebAudio player';assert s.count(a)==1;s=s.replace(a,(d/'ui-fragment.js').read_text()+'\n'+a)
a='function replan() {';s=s.replace(a,a+"\n  bulbsSession86bx.invalidate('replan');",1)
a='  clearTimeout(warmTimer); warmTimer = setTimeout(warm, 450);';assert s.count(a)==1;s=s.replace(a,a+"\n  if(S.plan.cuts.some(c=>c.layout==='bulbs'))bulbsSession86bx.begin();else bulbsSession86bx.stop();")
a='const replanSoon = (ms = 220) => {';assert s.count(a)==1;s=s.replace(a,a+" bulbsSession86bx.invalidate('debounce');")
a='  if (c.width !== pw || c.height !== ph) { c.width = pw; c.height = ph; }';assert s.count(a)==1;s=s.replace(a,"  if(c.width!==pw||c.height!==ph){bulbsSession86bx.invalidate('viewport');c.width=pw;c.height=ph;if(S.plan.cuts.some(c=>c.layout==='bulbs'))bulbsSession86bx.begin();}")
a='function drawPreviewFrame(ctx, {renderer=S.renderer,fast=false}={}) {';assert s.count(a)==1;s=s.replace(a,a+"\n  if(bulbsSession86bx.frame(ctx,S.t,{scale:ctx.canvas.width/S.plan.W,fast,noTrans:!!S.areaEdit,noPost:!!S.areaEdit}))return;")
a='J.uiApi = { toast,';assert s.count(a)==1;s=s.replace(a,'J.uiApi = { bulbsSessionState86bx:bulbsSession86bx.state, toast,')
Path(sys.argv[2]).write_text(s)
