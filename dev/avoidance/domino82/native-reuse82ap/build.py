from pathlib import Path
import sys,shutil,json,hashlib
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();mode=sys.argv[3];assert mode in ['old','new'];U=Path(__file__).resolve().parent;S=Path('/workspace/jizura-logic-evidence-20261027/domino-normal-options-source82an02');D.mkdir(exist_ok=False)
for p in S.iterdir():
 if p.is_file()and p.name!='pins.json':shutil.copy2(p,D/p.name)
if mode=='new':
 shutil.copy2(U/'compiler82ap.js',D/'compiler82ak.js');shutil.copy2(U/'owner82ap.js',D/'owner82ak.js')
s=(D/'compiler82ak.js').read_text();needle='sample=S.sample(env,{reservedBytes:reservation});';assert s.count(needle)==1;s=s.replace(needle,'window.nativeSampleCount82ap++;'+needle);(D/'compiler82ak.js').write_text(s)
s=(D/'owner82ak.js').read_text();needle='nativeResult=S.sample(env,{reservedBytes:reserved});'
if mode=='old':assert s.count(needle)==1;s=s.replace(needle,'window.nativeSampleCount82ap++;'+needle)
else:assert needle not in s
needle='shiftResult=D.sample(env,';assert s.count(needle)==1;s=s.replace(needle,'window.shiftedSampleCount82ap++;'+needle);needle='const model=j.ready,clock=j.clock,plan=j.plan,';assert s.count(needle)==1;s=s.replace(needle,'window.observeModel82ap?.(j.ready,j.clock);'+needle);(D/'owner82ak.js').write_text(s)
source=(R/'dev/avoidance/domino82/ui-frame82am/browser-test.js').read_text();a=source.index('window.drawDominoUIFrame82am=');source=source[:a];source=source.replace('window.prepareDominoUIFrame82am=','window.prepareDominoReuse82ap=');source=source.replace("const ctrl=A.dominoUIFrameController82am.create", "record.mode='"+mode+"';window.nativeSampleCount82ap=0;window.shiftedSampleCount82ap=0;stateCapture=null;window.observeModel82ap=(m,c)=>{stateCapture={model:m,clock:c}};const outerStart=performance.now();const ctrl=A.dominoUIFrameController82am.create");source=source.replace("record.phase='formal-ready';return C.exact(record);","record.totalPrepareWallMs=performance.now()-outerStart;record.nativeSampleCalls=window.nativeSampleCount82ap;record.shiftedSampleCalls=window.shiftedSampleCount82ap;record.phase='formal-ready';return C.exact(record);")
shutil.copy2(U/'finish-fragment.js',D/'finish-fragment.js');(D/'browser-test.js').write_text(source.replace("let state=null;","let state=null,stateCapture=null;")+(U/'finish-fragment.js').read_text()+'\n})();\n')
p=(D/'probe.cjs').read_text().replace(str(S),str(D));p=p.replace("'prepareDominoNormal82an'","'prepareDominoReuse82ap'");a=p.index("const frames=store(");z=p.index('verify();',a);p=p[:a]+"const finish=store('finish',await call(page,'finishDominoReuse82ap'));valid(finish);"+p[z:];(D/'probe.cjs').write_text(p)
paths={p for p in D.iterdir()if p.is_file()}|{p for p in U.iterdir()if p.is_file()}|set((R/'src').glob('*.js'))|{R/'AGENTS.md',R/'dev/avoidance/bulbs80/product80y/fixture.js',R/'dev/avoidance/layouts-c-editorial-fonts/manifest.json'}|set((R/'dev/avoidance/qt-resource-runtime').glob('*.py'));(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(paths)],indent=2)+'\n')
