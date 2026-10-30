from pathlib import Path
import sys
r=Path(sys.argv[1]).resolve();d=Path(__file__).resolve().parent;B=r/'dev/avoidance/bulbs86';V=B/'variable-ui86cc';S=r/'src'
def rep(s,a,b):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,b)
def put(n,s):(d/n).write_text(s)
for n,source in [('11zz03_bulbs_frame_data80.js',V/'frame-data86.js'),('11zz07_bulbs_owner80.js',V/'model-owner86.js'),('11zz06a_bulbs_compose86.js',B/'composed-input86bu/compose-scope86.js'),('11zz06b_bulbs_account86.js',B/'layout-accounting86j/account86.js'),('11zz06c_bulbs_root86.js',V/'root86.js'),('11zz06d_bulbs_generator86.js',V/'scalar-generator86.js'),('11zz06e_bulbs_post86.js',V/'post86.js'),('11zz06f_bulbs_fast86.js',B/'viewport-normal86bp/fast86.js'),('11zz08a_bulbs_geometry86.js',V/'geometry86.js'),('11zz08b_bulbs_replay86.js',V/'replay86.js')]:put(n,source.read_text())
s=(V/'controller86.js').read_text();helper="""// Editable avoidance inputs must never reach an unproved stock frame path.
function targetCut(plan,c){return c.layout==='bulbs'&&A.placementCutPreserved86cm(plan,c)!==true;}
function targetsCut(plan,cut){return !!cut&&plan?.lyricAvoidanceIndex?.enabled===true&&Array.isArray(plan.lyricAvoidanceIndex.regions)&&plan.lyricAvoidanceIndex.regions.length>0&&Array.isArray(plan.cuts)&&plan.cuts.includes(cut)&&targetCut(plan,cut);}
function targetsPreview(plan){return plan?.lyricAvoidanceIndex?.enabled===true&&Array.isArray(plan.lyricAvoidanceIndex.regions)&&plan.lyricAvoidanceIndex.regions.length>0&&Array.isArray(plan.cuts)&&plan.cuts.some(c=>targetCut(plan,c));}
function targetsFrame(plan,t){if(!targetsPreview(plan)||plan.layerVisibility?.lyrics===false)return false;const h=J.stepDur(plan.fx,plan.fps);if(!Number.isFinite(t)||!Number.isFinite(h)||h<=0)return true;const q=Math.floor(t/h+1e-6)*h;return[1.6/24,.8/24,0].some(lag=>J.lyricCutsAt(plan,Math.max(0,q-lag)).some(c=>targetCut(plan,c)));}
""";s=rep(s,'function connectRenderer(){',helper+'function connectRenderer(){');s=rep(s,'needs:(plan,opt)=>opt.bulbsFrame80!==undefined||planBindings?.needs(plan)===true','needs:(plan,opt)=>opt.bulbsFrame80!==undefined||planBindings?.needs(plan)===true||targetsFrame(plan,opt.avoidanceRealTime)');s=rep(s,'A.bulbsFrameController80=Object.freeze({installPlanIssuer80,','A.bulbsFrameController80=Object.freeze({targetsCut,targetsPreview,targetsFrame,installPlanIssuer80,');put('11zz09_bulbs_controller80.js',s)
s=(V/'adapter86.js').read_text();frag=(V/'runtime-fragment.js').read_text();s=rep(s,'+(preparedStage?.proofReservation||0);','+(preparedStage?.proofReservation||0)+C.serializedBytes(uiInputKey86bx||null);');s=rep(s,'F.connectRenderer();',frag+'\nF.connectRenderer();');put('11zz10_bulbs_adapter80.js',s)
put('11zz11_bulbs_session86.js',(B/'failure-ui86cl/session86.js').read_text())
# Product UI is derived from a frozen pre-connection source to avoid recursive insertion.
s=(d/'12_ui.base.js').read_text();s=rep(s,'/* WebAudio player',(d/'ui-fragment.js').read_text()+'\n/* WebAudio player');s=rep(s,'function replan() {',"function replan() {\n  bulbsSession86ci.invalidate('replan');bulbsReplanning86ci=true;try{");s=rep(s,'  clearTimeout(warmTimer); warmTimer = setTimeout(warm, 450);',"  clearTimeout(warmTimer); warmTimer = setTimeout(warm, 450);\n  }finally{bulbsReplanning86ci=false;}if(bulbsTarget86ci(S.plan))bulbsSession86ci.begin();else bulbsSession86ci.stop();");s=rep(s,'const replanSoon = (ms = 220) => {',"const replanSoon = (ms = 220) => { bulbsSession86ci.invalidate('debounce');")
s=rep(s,'  if (c.width !== pw || c.height !== ph) { c.width = pw; c.height = ph; }',"  if(c.width!==pw||c.height!==ph){bulbsSession86ci.invalidate('viewport');c.width=pw;c.height=ph;if(!bulbsReplanning86ci&&bulbsTarget86ci(S.plan))bulbsSession86ci.begin();}")
s=rep(s,'S.need = true; autosave(); ensureFonts(); drawSwatch(); showNow();', 'S.need = true; autosave(); if(!bulbsTarget86ci(S.plan))ensureFonts(); drawSwatch(); showNow();')
s=rep(s,'function drawPreviewFrame(ctx, {renderer=S.renderer,fast=false}={}) {',"""function drawPreviewFrame(ctx, {renderer=S.renderer,fast=false}={}) {
  if(bulbsTarget86ci(S.plan)&&S.plan.layerVisibility?.lyrics!==false){
    if(renderer!==S.renderer||ctx.canvas!==$('view'))throw bulbsBoundary86ci('output');
  }
  if(bulbsState86ci)showBulbsState86ci(bulbsState86ci);
  if(J.placement.bulbsFrameController80.targetsFrame(S.plan,S.t)){
    if(S.areaEdit){bulbsSession86ci.reject('BULBS_UI_AREA_UNSUPPORTED');clearBulbsView86ci(ctx);return;}
    if(!bulbsSession86ci.frame(ctx,S.t,{scale:ctx.canvas.width/S.plan.W,fast,noTrans:false,noPost:false}))clearBulbsView86ci(ctx);
    return;
  }""")
s=rep(s,'function warm() {',"function warm() {\n  if(bulbsTarget86ci(S.plan))return;")
s=rep(s,'function openAreaEditor(index,fromPreview=false) {',"function openAreaEditor(index,fromPreview=false) {\n  if(bulbsTarget86ci(S.plan)&&J.placement.bulbsFrameController80.targetsCut(S.plan,S.plan.cuts.find(c=>c.line===index))){toast(bulbsBoundary86ci('area').message);return;}")
s=rep(s,'function openCutDetails(layer,index,part=0) {',"function openCutDetails(layer,index,part=0) {\n  if(layer==='lyrics'&&bulbsTarget86ci(S.plan)&&J.placement.bulbsFrameController80.targetsCut(S.plan,S.plan.cuts.find(c=>c.line===index&&c.part===part))){toast(bulbsBoundary86ci('detail').message);return;}")
s=rep(s,'function openExportDialog(kind) {',"function openExportDialog(kind) {\n  if(bulbsTarget86ci(S.plan)&&S.plan.layerVisibility?.lyrics!==false){toast(bulbsBoundary86ci('output').message);return;}")
s=rep(s,'async function runExport(kind) {',"async function runExport(kind) {\n  if(bulbsTarget86ci(S.plan)&&S.plan.layerVisibility?.lyrics!==false){toast(bulbsBoundary86ci('output').message);return;}")
s=rep(s,'function startShortPreview(){',"function startShortPreview(){\n  if(bulbsTarget86ci(S.plan)&&S.plan.layerVisibility?.lyrics!==false){stopShortPreview();$('shortExportError').textContent=bulbsBoundary86ci('output').message;return;}")
s=rep(s,'await J.ensureFonts(txt, keys);','await trackFonts86ci(()=>J.ensureFonts(txt, keys));')
s=rep(s,"thumbFonts = J.ensureFonts('字面', [...new Set(J.STYLE_ORDER.map(k => J.STYLES[k].fonts.display[0]))])","thumbFonts = trackFonts86ci(()=>J.ensureFonts('字面', [...new Set(J.STYLE_ORDER.map(k => J.STYLES[k].fonts.display[0]))]))")
s=rep(s,"  $('btnAE').addEventListener('click', async () => {", "  $('btnAE').addEventListener('click', async () => {\n    try{J.assertPlanOutputSupported(S.plan)}catch(err){toast(err.message);return;}")
s=rep(s,"  screenshot.addEventListener('click',async()=>{\n    screenshot.disabled=true;\n    try{", "  screenshot.addEventListener('click',async()=>{\n    screenshot.disabled=true;\n    try{\n      J.assertPlanOutputSupported(S.plan);")
s=rep(s,'J.uiApi = { toast,',"J.uiApi = { bulbsSessionState86ci:bulbsSession86ci.state, toast,");put('12_ui.js',s)
