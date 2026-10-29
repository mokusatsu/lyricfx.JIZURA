from pathlib import Path
import sys
repo=Path(sys.argv[1]);dest=Path(sys.argv[2]);s=(repo/'dev/avoidance/bulbs86/owner-handoff86c/model-owner86.js').read_text()
s=s.replace('let cooperativeReservation=null;', 'let cooperativeReservation=null,cooperativeInputAccounting=null;')
# Only a private owner-generated frozen snapshot qualifies. Mutable guard,
# protocol, model, candidate, resident lists and all other fields stay live.
needle='function account(own=0,extra=null){'
helper="""function accountStateBytes(extra,registeredReservation){const original={pending,borrowWork,extra,counts,registeredReservation,entryKeys:[...resident.keys()],entryIds:[...resident.values()].map(e=>e.id)};const memo=cooperativeInputAccounting;if(!memo||pending!==memo.marker||pending.input!==memo.input)return bytes(original);const pendingCopy={...pending,input:null},view={...original,pending:pendingCopy},management=bytes({inputBytes:memo.inputBytes,pendingKeys:Object.keys(pending),cacheReferenceSlots:2})+(Object.keys(pending).length+2)*96,encoded=bytes(view)+memo.inputBytes-4;return encoded+management;}
"""
assert s.count(needle)==1;s=s.replace(needle,helper+needle)
a='bytes({pending,borrowWork,extra,counts,registeredReservation,entryKeys:[...resident.keys()],entryIds:[...resident.values()].map(e=>e.id)})';assert s.count(a)==2;s=s.replace(a,'accountStateBytes(extra,registeredReservation)')
a='const marker=pending;const ownReservation=()=>bytes({phase:state.phase,steps:state.steps,key:r.key,fullKey:r.fullKey,depKey:r.depKey,context:r.context,expectedContext:r.expectedContext,own:r.own,handle:r.handle});cooperativeReservation=ownReservation;'
b="""const marker=pending;let reservationFixedBytes=null;const ownReservation=()=>{const original={phase:state.phase,steps:state.steps,key:r.key,fullKey:r.fullKey,depKey:r.depKey,context:r.context,expectedContext:r.expectedContext,own:r.own,handle:r.handle};if(reservationFixedBytes===null)return bytes(original);const dynamic={phase:state.phase,steps:state.steps,expectedContext:r.expectedContext,own:r.own,handle:r.handle},management=bytes({reservationFixedBytes,staticFieldCount:4})+4*96,encoded=reservationFixedBytes+bytes(dynamic)-1;return encoded+management;};cooperativeReservation=ownReservation;"""
assert s.count(a)==1;s=s.replace(a,b)
s=s.replace('r.context=contextSnapshot(ctx);r.expectedContext=', 'marker.contextSample=contextSnapshot(ctx);keyData(marker.contextSample);r.context=freeze(clone(marker.contextSample));account();marker.contextSample=null;r.expectedContext=')
a='r.depKey=keys(dependency(renderer));verify();r.input=freeze(clone(plan));marker.input=r.input;account();'
b='r.depKey=keys(dependency(renderer));reservationFixedBytes=bytes({key:r.key,fullKey:r.fullKey,depKey:r.depKey,context:r.context});verify();r.input=freeze(clone(plan));marker.input=r.input;cooperativeInputAccounting={marker,input:r.input,inputBytes:bytes(r.input)};account();'
assert s.count(a)==1;s=s.replace(a,b)
s=s.replace("if(pending===marker)pending=null;", "if(pending===marker)pending=null;if(cooperativeInputAccounting?.marker===marker)cooperativeInputAccounting=null;")
dest.write_text(s)
