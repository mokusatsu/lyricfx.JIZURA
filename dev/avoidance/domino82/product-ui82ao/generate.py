"""Bounded product connection from a pinned reviewed base and frozen owner dependencies."""
from pathlib import Path
import sys,subprocess,json
R=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;D=R/'dev/avoidance/domino82'
def base(n):return subprocess.check_output(['git','show','53f85a14:'+n],cwd=R,text=True)
def rep(s,a,b):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,b)
for script in ['generate-core.py','generate-ui.py']:subprocess.run([sys.executable,str(U/script),str(R)],check=True)
mapping={
'native-geometry82':'native82a/native-geometry82.js','parts82':'native-parts82b/parts82.js','scalar-support82':'sampler82d/scalar-support82.js','scalar-support-shift82':'source-shift82j/scalar-support82.js','visual-policy82':'visual-policy82m/visual-policy82.js','finalizer-input82':'finalizer-input82s/finalizer-input82.js',
**{n:'ui-projection82ak/'+n+'.js'for n in ['root82ak','compose82ak','geometry82ak','scope82ak','vertical82ak','compiler82ak','model82ak']},
'owner82ak':'product-ui82ao/owner82ao.js','renderer-time82am':'ui-frame82am/renderer-time82am.js','plan-binding82am':'ui-frame82am/plan-binding82am.js','post-scope82am':'ui-frame82am/post-scope82am.js','post-scope82an':'product-ui82ao/post-scope82ao.js','fast-scope82an':'normal-options82an/fast-scope82an.js','controller82am':'product-ui82ao/controller82ao.js','runtime82ao':'product-ui82ao/runtime82ao.js','session82ao':'product-ui82ao/session82ao.js','target82ao':'product-ui82ao/target82ao.js'}
(U/'bundle-map.json').write_text(json.dumps(mapping,indent=2)+'\n')
core='\n'.join((D/p).read_text()for p in mapping.values())+'\nJ.requireDominoProof82ao();\n';(R/'src/11zz13_domino_core82.js').write_text(core)
(R/'src/09_render.js').write_text((U/'renderer82ao.js').read_text())
s=base('src/11p_layoutsD.js');s=rep(s,"reg('dominoes', {",(D/'sampler82d/source-input-fragment.js').read_text()+(D/'source-shift82j/shift-fragment.js').read_text()+"reg('dominoes', {");old='const yF = H / 2 + (r - (rows - 1) / 2) * (h + w * 0.35) + h / 2;';s=rep(s,old,old[:-1]+' + J.placement.dominoSourceShift82j.read(env,rows);');(R/'src/11p_layoutsD.js').write_text(s)
s=base('src/09a_placement.js');needle='A.burstPostScope83bb?.neutralMissingGlow?.(plan)===true';s=rep(s,needle,needle+'||A.dominoPostScope82am?.neutralMissingGlow?.(plan)===true');(R/'src/09a_placement.js').write_text(s)
s=base('src/11_export.js');s=rep(s,'J.assertPlanOutputSupported = plan => {',"""J.assertPlanOutputSupported = plan => {
 if(plan?.layerVisibility?.lyrics!==false&&J.placement?.dominoUIBoundary82ao?.targetsPreview(plan))throw Object.assign(Error(J.mediaLabel('ドミノの回避配置は現在メインプレビューのみ対応しています。画像・動画・After Effects用の出力にはまだ対応していません。','Domino avoidance currently supports the main preview only. Image, video and After Effects output are not yet supported.')),{code:'DOMINO_UI_OUTPUT_UNSUPPORTED'});""");(R/'src/11_export.js').write_text(s)
(R/'src/12_ui.js').write_text((U/'12_ui-candidate.js').read_text())
s=base('app/body.html');panel='<div id="dominoPreparation" class="bulbs-preparation" hidden><span id="dominoPreparationText" role="status" aria-live="polite"></span><button id="dominoCancel" type="button">準備を中止</button><button id="dominoRetry" type="button" hidden>再準備</button></div>';s=rep(s,'<div id="viewMsg"',panel+'<div id="viewMsg"');(R/'app/body.html').write_text(s)
