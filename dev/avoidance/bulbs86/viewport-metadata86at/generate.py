from pathlib import Path
import sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);s=(root/'dev/avoidance/bulbs86/viewport-aggregate86ao/model-owner86.js').read_text()
s=s.replace('viewportBusy86ag=false;', 'viewportBusy86ag=false;let viewportMetaRecord86at=null,viewportMetaPhase86at=null,viewportMetaSteps86at=-1;',1)
old="function viewportMetadata86ag(){const r=viewportJob86ag;viewportMeta86ag=r?bytes({phase:r.phase,steps:r.steps,entryId:r.entry.id,fullKey:r.fullKey,viewport:r.viewport,recipeId:r.recipeId,delta:r.delta,expectedContext:r.expectedContext,handleSlots:16})+16*96:0}"
new="""// These metadata fields are private and only phase/steps change before disposal.
// Reuse their count within that private state; all input/source/context checks stay live.
function viewportMetadata86ag(){const r=viewportJob86ag;if(r&&viewportMetaRecord86at===r&&viewportMetaPhase86at===r.phase&&viewportMetaSteps86at===r.steps)return;if(!r){viewportMetaRecord86at=null;viewportMetaPhase86at=null;viewportMetaSteps86at=-1;viewportMeta86ag=0;return}const memoBytes=bytes({phase:r.phase,steps:r.steps,recordReferenceSlots:1})+3*96;viewportMeta86ag=bytes({phase:r.phase,steps:r.steps,entryId:r.entry.id,fullKey:r.fullKey,viewport:r.viewport,recipeId:r.recipeId,delta:r.delta,expectedContext:r.expectedContext,handleSlots:16})+16*96+memoBytes;viewportMetaRecord86at=r;viewportMetaPhase86at=r.phase;viewportMetaSteps86at=r.steps}"""
assert s.count(old)==1;s=s.replace(old,new)
old='viewportJob86ag=null;viewportWork86ag=0;viewportMeta86ag=0;'
new='viewportJob86ag=null;viewportMetaRecord86at=null;viewportMetaPhase86at=null;viewportMetaSteps86at=-1;viewportWork86ag=0;viewportMeta86ag=0;'
assert s.count(old)==1;s=s.replace(old,new)
out.mkdir(parents=True,exist_ok=True);(out/'model-owner86.js').write_text(s)
