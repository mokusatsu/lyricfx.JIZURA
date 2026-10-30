from pathlib import Path
import sys
R=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;D=R/'dev/avoidance/domino82'
def rep(s,a,b):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,b)
s=(D/'ui-projection82ak/compiler82ak.js').read_text()
s=rep(s,'let sample=null,env=null,work=null,acc=null,peak=0,processed=0;', 'let sample=null,env=null,work=null,acc=null,peak=0,processed=0,nativeRows=[],nativeBytes=2;')
s=rep(s,'const bytes=baseBytes+currentBytes()', 'const bytes=baseBytes+nativeBytes+currentBytes()')
s=rep(s,'const reservation=baseBytes+acc.retainedBytes()+currentBytes();','const reservation=baseBytes+nativeBytes+acc.retainedBytes()+currentBytes();')
s=rep(s,'processed++;check();', 'processed++;const row={n:state.n,pass:own.pass,sample};nativeBytes+=(nativeRows.length?1:0)+C.serializedBytes(row);nativeRows.push(row);check();')
s=rep(s,"selection,coverage:{states:", "selection,nativeRows,nativeBytes,coverage:{states:")
(U/'compiler82ap.js').write_text(s)
s=(D/'ui-projection82ak/owner82ak.js').read_text()
s=rep(s,'for(const state of clocks.states)for(const own of state.passes)if(own.active){surface.ctx.save();', 'let nativeIndex=0;for(const state of clocks.states)for(const own of state.passes)if(own.active){surface.ctx.save();')
s=rep(s,'nativeResult=S.sample(env,{reservedBytes:reserved});', 'nativeResult=proposal.nativeRows[nativeIndex++].sample;')
s=rep(s,'counters.destinationSamples++;}finally{nativeResult=null;', 'counters.destinationSamples++;proposal.nativeRows[nativeIndex-1]=null;}finally{nativeResult=null;')
(U/'owner82ap.js').write_text(s)
