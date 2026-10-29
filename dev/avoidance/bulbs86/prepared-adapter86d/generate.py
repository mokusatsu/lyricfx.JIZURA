from pathlib import Path
import sys
repo=Path(sys.argv[1]);out=Path(sys.argv[2]);D=Path(__file__).parent
s=(repo/'src/11zz10_bulbs_adapter80.js').read_text();s=s.replace("let work=null;const reservedBytes=()=>C.serializedBytes({work})+3*65536;", "let preparedStage=null,stageGeneration=0;let work=null;const reservedBytes=()=>C.serializedBytes({work,stage:preparedStage&&{generation:preparedStage.generation,key:preparedStage.key,plan:preparedStage.plan,phase:preparedStage.phase,handle:preparedStage.handle}})+3*65536;")
s=s.replace('function finalize({plan,cut,revision,stepDur,reachTail,explicitSize}){',(D/'stage-fragment.js').read_text()+'\nfunction finalize({plan,cut,revision,stepDur,reachTail,explicitSize}){')
s=s.replace('const handle=O.prepare({renderer,plan:work.nativePlan,ctx});','const handle=requirePrepared(work.nativePlan);')
assert 'O.prepare(' not in s
out.write_text(s)
