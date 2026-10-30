from pathlib import Path
import sys,json,hashlib,shutil,subprocess
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();E=Path('/workspace/jizura-logic-evidence-20261027');S=E/'bulbs-ui-session-source86bx06';B=R/'dev/avoidance/bulbs86';U=B/'ui-session86bx';V=Path(__file__).resolve().parent;W=B/'design-prepare86bw';D.mkdir(exist_ok=False)
for n in ['qt-service-visible.py','browser.js','product-browser.js','geometry86.js','gate-browser.js','spec.json']:shutil.copy2(S/n,D/n)
h=(S/'candidate-ja.html').read_text()
def swap(a,z):
 global h
 assert h.count(a)==1,(a[:100],h.count(a));h=h.replace(a,z)
for n in ['root86.js','geometry86.js','post86.js','scalar-generator86.js','model-owner86.js','controller86.js','replay86.js']:swap((W/n).read_text(),(V/n).read_text())
a=(W/'adapter86.js').read_text().split('F.connectRenderer();')[0].replace('+(preparedStage?.proofReservation||0);','+(preparedStage?.proofReservation||0)+C.serializedBytes(uiInputKey86bx||null);')+(U/'runtime-fragment.js').read_text()
z=(V/'adapter86.js').read_text().split('F.connectRenderer();')[0].replace('+(preparedStage?.proofReservation||0);','+(preparedStage?.proofReservation||0)+C.serializedBytes(uiInputKey86bx||null);')+(V/'runtime-fragment.js').read_text();swap(a,z)
swap((U/'session86.js').read_text(),(V/'session86.js').read_text());(D/'candidate-ja.html').write_text(h)
p=(S/'probe.cjs').read_text();p=p.replace("const actual=store('design-prepare',await page.evaluate(async()=>{", "for(const test of [{width:720,radius:.2,y:.2},{width:480,radius:.2,y:.2},{width:480,radius:.1,y:.1}]){const actual=store('ui-'+test.width+'-r'+test.radius,await page.evaluate(async(test)=>{const {width}=test;")
p=p.replace("vp.style.width='720px';vp.style.height='405px';", "if(width===720){vp.style.width='720px';vp.style.height='405px'}else{vp.classList.remove('preview-fullscreen');vp.style.width='';vp.style.height=''};")
p=p.replace('view.width=720;view.height=405;', 'assertViewport86ca();')
p=p.replace("const view=document.getElementById('view');", "const view=document.getElementById('view');function assertViewport86ca(){if(view.width!==width||view.height!==Math.round(width*9/16))throw Error('ACTUAL_VIEWPORT_'+view.width+'x'+view.height)}")
p=p.replace('c.width=720;c.height=405;', 'c.width=view.width;c.height=view.height;').replace('getImageData(0,0,720,405)', 'getImageData(0,0,c.width,c.height)')
p=p.replace("center:{x:.5,y:.2},radius:.2","center:{x:.5,y:test.y},radius:test.radius")
p=p.replace("const oldState=state();", "const actualViewport={width:view.width,height:view.height};const oldState=state();")
p=p.replace('return{fontCancelled,circleCancelled,plan,unchanged:', 'return{actualViewport,fontCancelled,circleCancelled,plan,unchanged:')
p=p.replace("}));valid(actual);assert(actual.unchanged);assert(actual.final.admitted);result.summary=actual;", "},test));valid(actual);if(actual.failureState){assert.equal(actual.failureState.error,'BULBS86BJ_INSUFFICIENT_SPACE');assert.equal(actual.failureState.ready,false);assert.equal(actual.stats.owner.residentModels,0);assert.equal(actual.stats.reservation.records,0);assert.equal(actual.stats.reservation.bindings,0);}else{assert(actual.unchanged);assert(actual.final.admitted);}(result.summaries??=[]).push({test,actual});}")
(D/'probe.cjs').write_text(p)
paths=[x for x in D.iterdir() if x.is_file()]+[x for x in V.iterdir() if x.is_file()]+list((R/'dev/avoidance/qt-resource-runtime').glob('*.py'))+[R/'dev/avoidance/bulbs80/product80y/fixture.js',R/'dev/avoidance/layouts-c-editorial-fonts/manifest.json']
(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(set(paths))],indent=2)+'\n');print(D)
