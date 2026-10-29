from pathlib import Path
import shutil,json,hashlib
R=Path('/workspace/jizura-bulbs-product-20261029');E=Path('/workspace/jizura-logic-evidence-20261027');S=E/'bulbs-design-native-source86bv';D=E/'bulbs-design-prepare-source86bw05';B=R/'dev/avoidance/bulbs86';U=B/'design-prepare86bw';D.mkdir(exist_ok=True)
for n in ['qt-service-visible.py','browser.js','product-browser.js','geometry86.js','gate-browser.js','spec.json']:shutil.copy2(S/n,D/n)
h=(S/'candidate-ja.html').read_text();old=(B/'design-viewport86bv/root86.js').read_text();assert h.count(old)==1;h=h.replace(old,(U/'root86.js').read_text());a=h.index("Object.defineProperty(A,'testRecordAudit86br'");z=h.index('A.bulbsFrameController80=Object.freeze',a);h=h[:a]+h[z:]
for old,new in [('composed-input86bu/scalar-generator86.js','scalar-generator86.js'),('composed-input86bu/model-owner86.js','model-owner86.js'),('composed-input86bu/post86.js','post86.js'),('cooperative-record86br/replay86.js','replay86.js'),('cooperative-record86br/controller86.js','controller86.js')]:
 a=(B/old).read_text();assert h.count(a)==1,(old,h.count(a));v=(U/new).read_text()
 if new=='controller86.js':v=(U/'geometry86.js').read_text()+'\n'+v
 h=h.replace(a,v)
a=(B/'cooperative-record86br/adapter86.js').read_text().split('F.connectRenderer();')[0];assert h.count(a)==1
new=(U/'adapter86.js').read_text().split('F.connectRenderer();')[0]
# A diagnostic-only facade retains every model/ticket/context privately.
facade="""
let formal86bw=null;
Object.defineProperty(A,'designPrepareTest86bw',{value:Object.freeze({
 stage(plan){formal86bw=null;return J.finalizePlacementPlan(plan,{layoutsD:true}).placementFinalization},
 async prepare(){const start=performance.now(),steps=[];preparationApi.begin();while(['preparing','proof'].includes(preparationApi.state().phase)){const t=performance.now();preparationApi.step();steps.push(performance.now()-t);await new Promise(r=>setTimeout(r,0))}return{ms:performance.now()-start,maxStep:Math.max(...steps),steps,state:stageState(),stats:A.bulbs80Stats()}},
 finalize(plan){formal86bw=J.finalizePlacementPlan(plan,{layoutsD:true});return{admitted:A.layoutsDRuntimeAdmission(formal86bw),trajectory:formal86bw.cuts[0].placementTrajectory,stats:A.bulbs80Stats()}},
 draw(ctx,t){need(formal86bw,'TEST86BW_NOT_READY');return new J.Renderer().frame(ctx,formal86bw,t,{scale:ctx.canvas.width/formal86bw.W,fast:false,noPost:false})},
 cancel(){formal86bw=null;preparationApi.cancel();return A.bulbs80Stats()}
})});
"""
h=h.replace(a,new+facade);h=h.replace((R/'src/09a_placement.js').read_text(),(B/'design-viewport86bv/09a_placement.js').read_text())
(D/'candidate-ja.html').write_text(h)
p=(S/'probe.cjs').read_text().replace("R='/workspace/jizura-followup-20261029'", "R='/workspace/jizura-bulbs-product-20261029'")
i=p.index("const actual=store('actual-ui-scope'");p=p[:i]+"""const actual=store('design-prepare',await page.evaluate(async()=>{
 const A=J.placement,T=A.designPrepareTest86bw;J.uiApi.pause();
 const p=J.defaultProject();p.title='';p.lyrics='[00:00]風の先へ';p.lang='ja';p.seed=1205;p.videoSize={w:960,h:540};p.fps=60;p.style='blueprint';p.durationOverride=null;
 Object.assign(p.fx,{motion:.65,chroma:.25,texture:0,koma:0,hud:'off',decor:0,glitch:0,flash:false,bgSwitch:0});Object.assign(p.timing,{offset:0,tail:.5,lineScale:.9,bpm:0});p.overrides={0:{layout:'bulbs',single:true,enter:'cut',exit:'cut',hold:'still',treat:'none',bg:'none',cam:'push',decor:[]}};p.lyricCutOptions={'0:0':{details:{params:{font:'dela',shape:'board',chase:'chase',dir:1,sub:true},effectEvents:[]}}};p.lyricEffects={autoPlacement:true,avoidCenter:true};p.lyricAvoidance={version:1,regions:[{id:'ui',start:0,end:null,center:{x:.5,y:.2},radius:.2}]};
 J.ui.project=p;J.uiApi.syncUI();J.uiApi.replan();await J.uiApi.ensureFonts();await J.ensureFonts(p.lyrics,J.fontsOfPlan(J.ui.plan));await J.ensureFonts('字面',[...new Set(J.STYLE_ORDER.map(k=>J.STYLES[k].fonts.display[0]))]);await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const plan=J.ui.plan,before=JSON.stringify(plan);const staged=T.stage(plan),prepared=await T.prepare(),final=T.finalize(plan);const c=document.createElement('canvas');c.width=720;c.height=405;const ctx=c.getContext('2d');T.draw(ctx,.5);const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',ctx.getImageData(0,0,720,405).data))).map(x=>x.toString(16).padStart(2,'0')).join('');return{plan,unchanged:before===JSON.stringify(plan),staged,prepared,final,hash,released:T.cancel()};
}));valid(actual);assert(actual.unchanged);assert(actual.final.admitted);result.summary=actual;verify();assert.equal(result.errors.length,0);result.complete=true;
}catch(e){result.errors.push({code:e.code,message:e.message,stack:e.stack});process.exitCode=1}finally{if(browser)await browser.close();if(server)await new Promise(ok=>server.close(ok));try{verify();result.postPinsUnchanged=true}catch(e){result.errors.push({message:e.message});process.exitCode=1}save();console.log(JSON.stringify({complete:result.complete,raw:result.raw.length,errors:result.errors,postPinsUnchanged:result.postPinsUnchanged}));}})();
"""
(D/'probe.cjs').write_text(p)
paths=[str(x)for x in D.iterdir()if x.is_file()]+[str(x)for x in U.iterdir()if x.is_file()]+[str(x)for x in (R/'dev/avoidance/qt-resource-runtime').glob('*.py')]
# Font/fixture are actual local dependencies; old absolute worktree pins are not inherited.
paths += [str(R/'dev/avoidance/bulbs80/product80y/fixture.js'),str(R/'dev/avoidance/layouts-c-editorial-fonts/manifest.json')]
(D/'pins.json').write_text(json.dumps([{'path':p,'bytes':Path(p).stat().st_size,'sha256':hashlib.sha256(Path(p).read_bytes()).hexdigest()}for p in sorted(set(paths))],indent=2)+'\n')
print(D)
