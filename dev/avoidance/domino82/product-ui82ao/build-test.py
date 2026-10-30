from pathlib import Path
import sys,subprocess,shutil,json,hashlib
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();U=Path(__file__).resolve().parent;B=R/'dev/avoidance/domino82'
def rep(s,a,b):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,b)
subprocess.run([sys.executable,str(B/'normal-options82an/build.py'),str(R),str(D)],check=True)
for src,dst in [('owner82ao.js','owner82ak.js'),('controller82ao.js','controller82am.js'),('post-scope82ao.js','post-scope82an.js'),('runtime82ao.js','runtime82ao.js'),('session82ao.js','session82ao.js'),('target82ao.js','target82ao.js')]:shutil.copy2(U/src,D/dst)
names=['native-geometry82','parts82','scalar-support82','scalar-support-shift82','visual-policy82','finalizer-input82','root82ak','compose82ak','geometry82ak','scope82ak','vertical82ak','compiler82ak','model82ak','owner82ak','renderer-time82am','plan-binding82am','post-scope82am','post-scope82an','fast-scope82an','controller82am','runtime82ao','session82ao','target82ao']
core='\n'.join((D/(n+'.js')).read_text()for n in names)+'\nJ.requireDominoProof82ao();\n';(D/'core82ao.js').write_text(core)
s=(D/'candidate-ja.html').read_text();render=(B/'ui-frame82am/renderer82am.js').read_text();needle='const domino82qFrames=new WeakMap();let domino82qHooks=null;';render=rep(render,needle,needle+"""
let dominoRequired82ao=false;
Object.defineProperty(J,'dominoFrameTarget82ao',{value:(plan,opt={})=>dominoRequired82ao&&(J.placement.dominoUIBoundary82ao?J.placement.dominoUIBoundary82ao.targetsFrame(plan,opt.avoidanceRealTime):plan?.layerVisibility?.lyrics!==false&&plan?.lyricAvoidanceIndex?.enabled===true&&(plan.cuts||[]).some(c=>c.layout==='dominoes'))});
Object.defineProperty(J,'requireDominoProof82ao',{configurable:true,value:()=>{dominoRequired82ao=true;delete J.requireDominoProof82ao}});
""")
render=rep(render,'  frame(ctx, plan, t, opt = {}) {',"""  frame(ctx, plan, t, opt = {}) {
    if(!domino82qHooks&&J.dominoFrameTarget82ao(plan,{...opt,avoidanceRealTime:opt.avoidanceRealTime??t}))throw Object.assign(Error('DOMINO_UI_PREPARE_REQUIRED'),{code:'DOMINO_UI_PREPARE_REQUIRED'});""")
render=rep(render,'  post(ctx, plan, t, tq, step, sc, scale, opt, allowFilter) {',"""  post(ctx, plan, t, tq, step, sc, scale, opt, allowFilter) {
    if(J.placement.dominoNormalPostScope82an?.needs(plan))J.placement.dominoNormalPostScope82an.assertBeforePost(plan,{...opt,scale},this,ctx);""")
a=s.index((R/'src/09_render.js').read_text()[:150]);z=s.index('/* AVOID-004 internal opt-in stage foundation',a);s=s[:a]+render+'\n'+s[z:]
ui=(R/'src/12_ui.js').read_text();s=rep(s,ui,(U/'12_ui-candidate.js').read_text())
marker='/* ============================================================\n   JIZURA — editor UI';s=rep(s,marker,core+'\n'+marker)
panel='<div id="dominoPreparation" class="bulbs-preparation" hidden><span id="dominoPreparationText" role="status" aria-live="polite"></span><button id="dominoCancel" type="button">準備を中止</button><button id="dominoRetry" type="button" hidden>再準備</button></div>';s=rep(s,'<div id="viewMsg"',panel+'<div id="viewMsg"')
s=rep(s,'J.assertPlanOutputSupported = plan => {',"""J.assertPlanOutputSupported = plan => {
 if(plan?.layerVisibility?.lyrics!==false&&J.placement?.dominoUIBoundary82ao?.targetsPreview(plan))throw Object.assign(Error(J.mediaLabel('ドミノの回避配置は現在メインプレビューのみ対応しています。画像・動画・After Effects用の出力にはまだ対応していません。','Domino avoidance currently supports the main preview only. Image, video and After Effects output are not yet supported.')),{code:'DOMINO_UI_OUTPUT_UNSUPPORTED'});""")
(D/'candidate-ja.html').write_text(s);(D/'renderer82ao.js').write_text(render);shutil.copy2(U/'browser-test.js',D/'browser-test.js')
p=(D/'probe.cjs').read_text();a=p.index('for(const file of[');z=p.index("const init=store(",a);p=p[:a]+"for(const file of[R+'/dev/avoidance/bulbs80/product80y/fixture.js',D+'/browser.js',D+'/product-browser.js',D+'/browser-test.js'])await page.addScriptTag({content:fs.readFileSync(file,'utf8')});\n"+p[z:];a=p.index("const actual=store(");z=p.index('verify();',a);p=p[:a]+"const actual=store('product-ui',await call(page,'productUI82ao'));valid(actual);result.summary=actual;"+p[z:];(D/'probe.cjs').write_text(p)
pins=json.loads((D/'pins.json').read_text());paths={Path(p['path'])for p in pins}|{p for p in U.iterdir()if p.is_file()}|{p for p in D.iterdir()if p.is_file()and p.name!='pins.json'};(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(paths)],indent=2)+'\n')
