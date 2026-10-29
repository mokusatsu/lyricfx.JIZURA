from pathlib import Path
import sys
repo=Path(sys.argv[1]);dest=Path(sys.argv[2]);s=(repo/'src/11zz08_bulbs_destination80.js').read_text()
s=s.replace('const A=J.placement,P=', 'const A=J.placement,RA=A.bulbsReplayAccounting86s,createPrivateAccounting=RA.create,P=',1)
s=s.replace('let peak=0,glyphMatrices=0,work=null,', 'let peak=0,privateAccounting=null,glyphMatrices=0,work=null,',1)
a='const n=reservedBytes+modelBytes+refsBytes+baseBytes+rootBytes+glyphMatrixBytes+bytes({groupEntries:[...groups],heldEntries:[...held.records],counters:{rootCount,glyphMatrices,rootBytes,glyphMatrixBytes,peak,reservedBytes},work,extra});'
b="const current={groupEntries:[...groups],heldEntries:[...held.records],counters:{rootCount,glyphMatrices,rootBytes,glyphMatrixBytes,peak,reservedBytes},work,extra};const n=reservedBytes+modelBytes+refsBytes+baseBytes+rootBytes+glyphMatrixBytes+(privateAccounting?privateAccounting.count(current).upperBytes:bytes(current));"
assert s.count(a)==1;s=s.replace(a,b)
a=' if(afterPristine)afterPristine();try{'
b=" if(!diagnostic&&onScalar===null&&afterPristine===null){need(A.bulbsReplayAccounting86s===RA&&RA.create===createPrivateAccounting,'BULBS86S_SOURCE');const copyWorking=reservedBytes+modelBytes+refsBytes+baseBytes+rootBytes+glyphMatrixBytes+RA.copyWorkingBytes;peak=Math.max(peak,copyWorking);need(copyWorking<=8388608,'BULBS80Z_MEMORY_BUDGET',{n:copyWorking,limit:8388608});privateAccounting=createPrivateAccounting({source:heldSource})}if(afterPristine)afterPristine();try{"
assert s.count(a)==1;s=s.replace(a,b)
s=s.replace('sp:heldSource.face},culled:', 'sp:privateAccounting?privateAccounting.geometry.face:heldSource.face},culled:')
s=s.replace('r:heldSource.r,rings:heldSource.rings}', 'r:heldSource.r,rings:privateAccounting?privateAccounting.geometry.rings:heldSource.rings}')
s=s.replace('resource:{modelBytes,refsBytes,', 'resource:{privateGeometryBytes:privateAccounting?.retainedBytes||0,privateManagementBytes:privateAccounting?.managementBytes||0,privateCloneWorkingReservation:privateAccounting?RA.copyWorkingBytes:0,modelBytes,refsBytes,')
s=s.replace('}finally{refs.clear();groups.clear();held.records.clear();}', '}finally{privateAccounting?.clear();refs.clear();groups.clear();held.records.clear();}')
dest.write_text(s)
