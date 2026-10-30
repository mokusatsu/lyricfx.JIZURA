from pathlib import Path
import sys,subprocess
R=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent
def rep(s,a,b):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,b)
f=(R/'dev/avoidance/burst83/product-ui83be/ui-fragment.js').read_text()
line=next(x for x in f.splitlines()if x.startswith('function beginPlacementSessions83be'))
f=f.replace(line+'\n','')
for a,b in [('burstBoundary83be','dominoBoundary82ao'),('burstTarget83be','dominoTarget82ao'),('burstState83be','dominoState82ao'),('burstError83be','dominoError82ao'),('showBurstState83be','showDominoState82ao'),('burstSession83be','dominoSession82ao'),('burstUIBoundary83be','dominoUIBoundary82ao'),('burstUISession83bd','dominoUISession82ao'),('burstUIRuntime83bd','dominoUIRuntime82ao'),('burstPreparation','dominoPreparation'),('burstCancel','dominoCancel'),('burstRetry','dominoRetry'),('BURST_UI','DOMINO_UI'),('ドカン','ドミノ'),('burst avoidance','domino avoidance'),('Burst avoidance','Domino avoidance')]:f=f.replace(a,b)
(U/'ui-fragment.js').write_text(f)
s=subprocess.check_output(['git','show','53f85a14:src/12_ui.js'],cwd=R,text=True);s=rep(s,'/* WebAudio player',f+'\n/* WebAudio player')
a=line
b="""function beginPlacementSessions83be(){const pairs=[[bulbsSession86ci,bulbsTarget86ci(S.plan)],[burstSession83be,burstTarget83be(S.plan)],[dominoSession82ao,dominoTarget82ao(S.plan)]],targets=pairs.filter(p=>p[1]);if(targets.length>1){for(const [session]of pairs)session.reject('MIXED_AVOIDANCE_UNSUPPORTED');return}let cleanupFailed=false;for(const [session,target]of pairs)if(!target){const state=session.stop();cleanupFailed=cleanupFailed||!!state.cleanupError}if(targets.length){if(cleanupFailed)targets[0][0].reject('OTHER_AVOIDANCE_CLEANUP_FAILED');else targets[0][0].begin()}}"""
s=rep(s,a,b)
for reason in ['replan','debounce','viewport']:
 a="burstSession83be.invalidate('"+reason+"');";s=rep(s,a,a+"dominoSession82ao.invalidate('"+reason+"');")
s=rep(s,'if(!bulbsTarget86ci(S.plan)&&!burstTarget83be(S.plan))ensureFonts();','if(!bulbsTarget86ci(S.plan)&&!burstTarget83be(S.plan)&&!dominoTarget82ao(S.plan))ensureFonts();')
s=rep(s,'if(bulbsTarget86ci(S.plan)||burstTarget83be(S.plan))return;','if(bulbsTarget86ci(S.plan)||burstTarget83be(S.plan)||dominoTarget82ao(S.plan))return;')
s=rep(s,'function drawPreviewFrame(ctx, {renderer=S.renderer,fast=false}={}) {',"""function drawPreviewFrame(ctx, {renderer=S.renderer,fast=false}={}) {
  if(dominoTarget82ao(S.plan)&&(renderer!==S.renderer||ctx.canvas!==$('view')))throw dominoError82ao('output');
  if(dominoState82ao)showDominoState82ao(dominoState82ao);
  if(dominoBoundary82ao.targetsFrame(S.plan,S.t)){
    if(S.areaEdit){dominoSession82ao.reject('DOMINO_UI_AREA_UNSUPPORTED');clearBulbsView86ci(ctx);return;}
    if(!dominoSession82ao.frame(ctx,S.t,{scale:ctx.canvas.width/S.plan.W,fast,noTrans:false,noPost:false}))clearBulbsView86ci(ctx);
    return;
  }""")
s=rep(s,"if(layer==='lyrics'&&burstTarget83be(S.plan)", "if(layer==='lyrics'&&dominoTarget82ao(S.plan)&&dominoBoundary82ao.targetsCut(S.plan,S.plan.cuts.find(c=>c.line===index&&c.part===part))){toast(dominoError82ao('detail').message);return;}\n  if(layer==='lyrics'&&burstTarget83be(S.plan)")
s=rep(s,'if(burstTarget83be(S.plan)&&burstBoundary83be.targetsCut', "if(dominoTarget82ao(S.plan)&&dominoBoundary82ao.targetsCut(S.plan,S.plan.cuts.find(c=>c.line===index))){toast(dominoError82ao('area').message);return;}\n  if(burstTarget83be(S.plan)&&burstBoundary83be.targetsCut")
s=rep(s,"if(burstTarget83be(S.plan)){stopShortPreview();", "if(dominoTarget82ao(S.plan)){stopShortPreview();$('shortExportError').textContent=dominoError82ao('output').message;return;}\n  if(burstTarget83be(S.plan)){stopShortPreview();")
a="if(burstTarget83be(S.plan)){toast(burstError83be('output').message);return;}";assert s.count(a)==2;s=s.replace(a,"if(dominoTarget82ao(S.plan)){toast(dominoError82ao('output').message);return;}\n  "+a)
s=rep(s,'J.uiApi = { burstSessionState83be:', 'J.uiApi = { dominoSessionState82ao:dominoSession82ao.state, burstSessionState83be:')
(U/'12_ui-candidate.js').write_text(s)
