from pathlib import Path
import sys
repo=Path(sys.argv[1]);dest=Path(sys.argv[2]);s=(repo/'dev/avoidance/bulbs80/preparation80ab/scalar-generator80.js').read_text()
s=s.replace("const A=J.placement,FD=", "const A=J.placement,FA=A.bulbsFinalFrameAccounting86g,createFinalAccount=FA.create,FD=")
s=s.replace("const budget=(work,extraBytes=0)=>{const transient=measuredBytes(work)+extraBytes;", "const budget=(work,extraBytes=0,precomputed=null)=>{const transient=(precomputed===null?measuredBytes(work):precomputed)+extraBytes;need(Number.isSafeInteger(transient)&&transient>=0,'BULBS86G_TRANSIENT');")
a="const frameData=FD.build({nativeLayout,preparedSubtitle,recipes,preparedLayouts,heldInput,clocks,schedule,onWork:frameDataWork=>budget({heldInput,heldQualityResults,localPayload,frameDataWork})});"
b="need(A.bulbsFinalFrameAccounting86g===FA&&FA.create===createFinalAccount,'BULBS86G_SOURCE');const finalAccount=createFinalAccount({codec:{serializedBytes:measuredBytes}});let frameData;try{frameData=FD.build({nativeLayout,preparedSubtitle,recipes,preparedLayouts,heldInput,clocks,schedule,onWork:frameDataWork=>{need(A.bulbsFinalFrameAccounting86g===FA&&FA.create===createFinalAccount,'BULBS86G_SOURCE');const work={heldInput,heldQualityResults,localPayload,frameDataWork},count=finalAccount.read(work);budget(work,0,count.upperBytes)}})}finally{finalAccount.clear()}"
assert s.count(a)==1;s=s.replace(a,b)
s=s.replace("not JS heap/RSS.", "FD work static graph is privately frozen and exact-value bytes reused; dynamic clockRows/current are recounted every callback, plus fixed cache reference/number/container management upper bound. Not JS heap/RSS.")
dest.write_text(s)
