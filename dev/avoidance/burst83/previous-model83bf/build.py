from pathlib import Path
import sys,subprocess,json,hashlib
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();mode=sys.argv[3];variant=sys.argv[4]if len(sys.argv)>4 else'same';assert variant in ['same','circle','boundaries','remaining','font-cancel']and mode in ['old','new'];U=Path(__file__).resolve().parent
subprocess.run([sys.executable,str(R/'dev/avoidance/bulbs86/product-ui86ci/build-test.py'),str(R),str(D)],check=True)
def rep(s,a,b):
 assert s.count(a)==1,(a[:160],s.count(a));return s.replace(a,b)
core=(R/'src/11zz12_burst_core83.js').read_text();markers=json.loads((U/'module-markers.json').read_text());parts=[core[core.index(markers[i]):core.index(markers[i+1])]for i in range(4)];newparts=[(U/n).read_text()for n in ['owner83bf.js','handoff83bf.js','runtime83bf.js','session83bf.js']];s=(D/'candidate-ja.html').read_text()
if mode=='new':
 for a,b in zip(parts,newparts):s=rep(s,a,b)
 s=rep(s,(R/'src/12_ui.js').read_text(),(U/'ui83bf.js').read_text())
owner=(newparts if mode=='new'else parts)[0];changed=owner
a='R.replay(env,{...row,shiftedRoot:row.root},delta,{reservedBytes:proofReservation+workBytes})';changed=rep(changed,a,'(window.prepareReplays83bf++,'+a+')')
a='evaluateOwned83bb(env,row,result,circle,viewport,delta,proofReservation+workBytes)';changed=rep(changed,a,'(window.checkedSupports83bf+=result.supports.length,'+a+')')
a='return{choices,chosen,sourceUnion,zeroClear:zero.passed,';changed=rep(changed,a,'window.generatedCandidates83bf+=choices.length;'+a)
if mode=='old':changed=rep(changed,'let iterator=M.compile(', 'window.preparationCompiles83bf++;let iterator=M.compile(')
else:changed=rep(changed,'reuse83bf.compiles++;iterator=M.compile(', 'window.preparationCompiles83bf++;reuse83bf.compiles++;iterator=M.compile(')
changed=rep(changed,'entries.set(handle,{check,clear,model,proof,', 'window.observeBurstModel83bf?.(model,proof);entries.set(handle,{check,clear,model,proof,');s=rep(s,owner,changed)
runtime=(newparts if mode=='new'else parts)[2];changed=rep(runtime,'formal=result}', 'formal=result;window.observeBurstFormal83bf?.(formal,unit.stats())}');changed=rep(changed,'viewport=null}', 'window.observeBurstCancel83bf?.(unit?.stats()||null);viewport=null}');s=rep(s,runtime,changed)
(D/'candidate-ja.html').write_text(s)
browser=(U/'browser-test.js').read_text()
if variant!='same':
 body=(U/('circle-body.js'if variant=='circle'else'boundary-body.js')).read_text()
 if variant=='remaining':body="try{vp.classList.add('preview-fullscreen');vp.style.width='480px';vp.style.height='270px';set(project('center'));await J.uiApi.ensureFonts();await document.fonts.ready;await raf();await run('resume-before-viewport',()=>{const p=project('burst');p.lyrics='[00:00]風の先まで';set(p)});\n"+body[body.index("await run('viewport-change'"):]
 if variant=='font-cancel':body="try{vp.classList.add('preview-fullscreen');vp.style.width='640px';vp.style.height='360px';set(project('center'));await J.uiApi.ensureFonts();await document.fonts.ready;await raf();await run('owner-for-font-cancel',()=>{const p=project('burst');p.lyrics='[00:00]風の先まで';set(p)});\n"+body[body.index("const old=formal;J.ui.project"):]
 browser=browser[:browser.index("try{vp.classList.add('preview-fullscreen')")]+body
 browser=rep(browser,'const record={mode,cases:[],stale:[]};','const record={mode,cases:[],stale:[],cancels:[]};window.observeBurstCancel83bf=s=>{if(s)record.cancels.push(s)};')
fixture=(R/'dev/avoidance/domino82/product-reuse82ar/product-test.js').read_text();a=fixture.index('function project(');z=fixture.index('\nfunction set(',a);browser=rep(browser,'// PROJECT_FIXTURE',fixture[a:z]);(D/'browser-test.js').write_text(browser)
p=(D/'probe.cjs').read_text();p=rep(p,"await call(page,'productUI86ci')","await call(page,'previousBurst83bf',"+json.dumps({'mode':mode})+")");(D/'probe.cjs').write_text(p);(D/'mode.json').write_text(json.dumps({'mode':mode})+'\n')
paths={Path(p['path'])for p in json.loads((D/'pins.json').read_text())}|{p for p in U.iterdir()if p.is_file()}|{p for p in D.iterdir()if p.is_file()and p.name!='pins.json'}
(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(paths)],indent=2)+'\n');print(json.dumps({'producer':True,'mode':mode,'pins':len(paths)}))
