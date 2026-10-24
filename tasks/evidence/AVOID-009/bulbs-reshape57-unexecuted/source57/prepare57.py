"""Static source extraction/generation only; never imports the application."""
from pathlib import Path
import hashlib,json
root=Path('/workspace/lyricfx.JIZURA');out=root/'work/avoid009-bulbs57-reshape/runner'
s=(root/'src/11p_layoutsD.js').read_text()
helpers=s[s.index('const U = env'):s.index('/* ================================================================== 1 cube')]
outline=s[s.index('const resample = (pts, d, maxN = 160)'):s.index('/* ================================================================== 13 bulbs')]
block=s[s.index("reg('bulbs', {"):s.index('/* ================================================================== 14 ledScroll')]
b=block[block.index('  render(env) {')+len('  render(env) {'):block.rindex('  },\n});')]
changes=[]
def change(old,new):
 global b
 assert b.count(old)==1,(old,b.count(old));b=b.replace(old,new);changes.append({'before':old,'after':new})
change("const text = brk(cut.text, port ? 5 : 8);","const text = recipe.writingText;")
start='const size = Math.min(J.fitSize(text, Pm.font, maxW, maxH, o)'
a=b.index(start);z=b.index(';',a)
change(b[a:z+1],'const size = reference.size * recipe.scale;')
change('const ss = Math.max(smallSize(env), size * 0.16);','const ss = reference.ss;')
change('const padX = size * 0.75, padY = size * 0.62;','const padX = size * recipe.pad[0], padY = size * recipe.pad[1];')
change('const r = J.clamp(size * 0.075, 4, u * 0.022);','const r = reference.r * recipe.radiusScale;')
change('const pts = resample(insetPoints, r * 3.3, 140);','const pts = resampleCount57(insetPoints, reference.rings[ri].N);')
change("const sz = Math.min(fs, J.fitSize(t, bodyF(env), bw - padX, ss * 1.2, { track: 0.18 }));","const sz = reference.subtitle.size;")
change('const nativeD = cut.placementLayoutsD === true;',"const nativeD = cut.placementLayoutsD === true;\n    if (!recipe || !reference || cut.text!=='風の先へ' || Pm.shape!=='board' || !Pm.sub || env.W!==960 || env.H!==540) throw Error('RECIPE57_FIXED_SCOPE');")
change('if(captureD)catalog.bb=clone(bb);',"if(captureD){catalog.bb=clone(bb);catalog.reshape57={recipe:clone(recipe),originalSize:reference.size,originalRadius:reference.r,originalN:reference.rings.map(r=>r.N),sourceCaption:clone(reference.subtitle),notNativeGeometry:true};}")
change("kind:'bulbs-native-catalog',version:1,nativeOnly:true", "kind:'bulbs-reshape57-diagnostic-catalog',version:1,nativeOnly:false,sourceNativeClockUnchanged:true")
change('spacing:r*3.3,maxN:140,segmentsRecomputedMetadata:segments,totalLengthRecomputedMetadata:segments.reduce((a,b)=>a+b,0)', 'nominalRecipeSpacing:r*3.3,sourceNativeSpacing:reference.rings[ri].spacing,originalN:reference.rings[ri].N,actualArcStep57:segments.reduce((a,b)=>a+b,0)/N,maxN:140,segmentsRecomputedMetadata:segments,totalLengthRecomputedMetadata:segments.reduce((a,b)=>a+b,0)')
change("derivation:'inset evaluated once; original resample result; segment lengths separately recomputed metadata only'", "derivation:'new inset evaluated once; fixed source-original N; actualArcStep57 from separately recomputed segment lengths; geometry changed, not native resample result'")
fixed=outline[:outline.index('const rrPts')]
fixed=fixed.replace('const resample = (pts, d, maxN = 160) => {','const resampleCount57 = (pts, N) => {\n  if(!Number.isInteger(N)||N<4||N>140)throw Error(\'RECIPE57_ORIGINAL_N\');')
fixed=fixed.replace('const N = Math.max(4, Math.min(maxN, Math.round(L / d))), step = L / N, out = [];','const step = L / N, out = [];')
rr=outline[outline.index('const rrPts'):]
header="/* SOURCE57 isolated diagnostic geometry; no registration, adapter, or native source replacement. */\n(()=>{'use strict';const E=J.E;\n"
generated=header+helpers+rr+fixed+'\nwindow.renderBulbsRecipe57=function(env,recipe,reference){'+b+'\n};\n})();\n'
(out/'recipe57.js').write_text(generated)
(out.parent/'source-diff57.json').write_text(json.dumps({'source':'src/11p_layoutsD.js','sourceSHA256':hashlib.sha256(s.encode()).hexdigest(),'scope':'helpers exact; resample fixed original N; explicit render geometry replacements only','changes':changes,'resampleChanges':['explicit N input with4..140 guard','original segments/step/while/lerp order retained']},ensure_ascii=False,indent=2)+'\n')
prior=(root/'work/avoid009-bulbs56-diagnostic/runner/browser56.js').read_text()
browser=prior.replace('SOURCE56','SOURCE57').replace('Bulbs56','Bulbs57').replace('bulbs56','bulbs57')
browser=browser.replace('async({state,delta=[0,0]})=>','async({state,delta=[0,0],recipe=null,referencePasses=null,referenceSHA256=null})=>')
browser=browser.replace("let current=null,observer;window.bulbs57Partial=", "const paint=env=>{if(!recipe)return Reflect.apply(oldDraw,r,[env]);const ref=referencePasses?.find(p=>p.pass===env.pass);need(ref&&ref.lt===env.lt&&ref.ltb===env.ltb&&ref.step===env.step,'RECIPE_REFERENCE_CLOCK');need(!(env.cut.decor||[]).length&&!env.cut.effectsOnly,'RECIPE_DIRECT_DRAWCUT_SCOPE');return window.renderBulbsRecipe57(env,recipe,ref.catalog);};let current=null,observer;window.bulbs57Partial=")
browser=browser.replace('spec:run.spec,state,delta,passes,made','spec:run.spec,state,delta,recipe,passes,made')
browser=browser.replace('const originalSHA256=await hash(ctx);observer=spy(ctx,()=>current);',"const originalSHA256=await hash(ctx);let recipeUnobservedSHA256=null;if(recipe){r.drawCut=env=>{if(!delta[0]&&!delta[1])return paint(env);const inv=J.placement.inverse(matrix(env.ctx));env.ctx.save();try{env.ctx.translate(inv[0]*delta[0]+inv[2]*delta[1],inv[1]*delta[0]+inv[3]*delta[1]);return paint(env);}finally{env.ctx.restore();}};r.frame(ctx,run.plan,state.firstTime,options);recipeUnobservedSHA256=await hash(ctx);if(drawOwn)Object.defineProperty(r,'drawCut',drawOwn);else delete r.drawCut;}observer=spy(ctx,()=>current);")
browser=browser.replace('return Reflect.apply(oldDraw,this,[env]);','return paint(env);')
browser=browser.replace("if(!delta[0]&&!delta[1])need(originalSHA256===observedSHA256,'NATIVE_OBSERVER_PIXEL_MISMATCH');", "if(recipe)need(recipeUnobservedSHA256===observedSHA256,'RECIPE_OBSERVER_PIXEL_MISMATCH');if(!recipe&&!delta[0]&&!delta[1])need(originalSHA256===observedSHA256,'NATIVE_OBSERVER_PIXEL_MISMATCH');")
browser=browser.replace('delta,originalSHA256,observedSHA256,zeroObserverEqual:', 'delta,recipe,originalSHA256,recipeUnobservedSHA256,observedSHA256,zeroObserverEqual:')
browser=browser.replace('zeroObserverEqual:!delta[0]&&!delta[1]?originalSHA256===observedSHA256:null', 'observerPixelEqual:recipe?recipeUnobservedSHA256===observedSHA256:(!delta[0]&&!delta[1]?originalSHA256===observedSHA256:null),nativeZeroObserverEqual:recipe?null:(!delta[0]&&!delta[1]?originalSHA256===observedSHA256:null)')
browser=browser.replace('r.frame(ctx,run.plan,state.firstTime,options);const originalSHA256=await hash(ctx);', "let originalSHA256;if(recipe){need(typeof referenceSHA256==='string'&&/^[0-9a-f]{64}$/.test(referenceSHA256),'NATIVE_REFERENCE_SHA');originalSHA256=referenceSHA256;}else{r.frame(ctx,run.plan,state.firstTime,options);originalSHA256=await hash(ctx);}")
browser=browser.replace('delta,recipe,originalSHA256,recipeUnobservedSHA256,observedSHA256','delta,recipe,originalSHA256,nativeReferenceSHA256:originalSHA256,originalSHA256Source:recipe?\"native acquisition at same n; capturedPreviously\":\"fresh original native frame in this sample\",actualNativeFrameRecaptured:!recipe,recipeUnobservedSHA256,observedSHA256')
browser=browser.replace("window.initBulbs57=async({spec,fonts})=>{const r=","window.initBulbs57=async({spec,fonts})=>{need(spec.id==='four-wind'&&spec.text==='風の先へ'&&spec.sub===true,'RESHAPE57_FIXED_FIXTURE');const r=")
browser=browser.replace('helpers:[J.mainDraw,','helpers:[window.renderBulbsRecipe57,J.mainDraw,')
browser=browser[:browser.index('function make(run,own)')]+'})();\n'
(out/'browser57.js').write_text(browser)
for name in ['kernel','selfcheck']:
 text=(root/f'work/avoid009-bulbs56-diagnostic/runner/{name}56.cjs').read_text()
 (out/f'{name}57.cjs').write_text(text.replace('kernel56.cjs','kernel57.cjs').replace('SOURCE56-pure-math-data-selfcheck','SOURCE57-parent-pure-math-data-selfcheck'))
print('Generated static source57 recipe/browser; no app executed')
