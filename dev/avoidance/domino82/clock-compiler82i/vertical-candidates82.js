/* Candidate construction only. No shifted Canvas guarantee or certificate. */
(()=>{'use strict';const A=J.placement,B=A.dominoAffineSupport82c,C=A.bulbsScalarCompiler80,need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c})},finite=x=>typeof x==='number'&&Number.isFinite(x),up=x=>B.next(x,true),down=x=>B.next(x,false);
function create({W,H,circle,expected,reservedBytes=0}){
 need(finite(W)&&finite(H)&&W>0&&H>0&&circle&&[circle.cx,circle.cy,circle.r].every(finite)&&circle.cx>=0&&circle.cx<=W&&circle.cy>=0&&circle.cy<H/2&&circle.r>0&&circle.cy+circle.r<H,'DOMINO82H_UPPER_CIRCLE_DOMAIN');
 need(Array.isArray(expected)&&expected.length>0&&expected.length<=1536&&expected.every((x,i)=>Number.isSafeInteger(x.n)&&x.n>=0&&['B','A','main'].includes(x.pass)&&expected.findIndex(y=>y.n===x.n&&y.pass===x.pass)===i),'DOMINO82H_CLOCK_DOMAIN');
 need(Number.isSafeInteger(reservedBytes)&&reservedBytes>=0,'DOMINO82H_RESERVED');
 const clocks=expected.map(x=>Object.freeze({n:x.n,pass:x.pass})),region=Object.freeze({cx:circle.cx,cy:circle.cy,r:circle.r});let next=0,live=true,lower=-Infinity,upper=Infinity,below=-Infinity,potentialSupports=0,peak=0;
 const baseBytes=C.serializedBytes({W,H,circle:region,clocks,reservedBytes});
 function budget(work,sampleBytes=0){const bytes=reservedBytes+baseBytes+sampleBytes+C.serializedBytes({next,live,lower:finite(lower)?lower:null,upper:finite(upper)?upper:null,below:finite(below)?below:null,potentialSupports,peak,work});peak=Math.max(peak,bytes);need(bytes<=8388608,'DOMINO82H_SERIALIZED_WORKING_BUDGET');return bytes;}
 function close(){live=false;clocks.length=0;}
 function add({n,pass,sample}){need(live,'DOMINO82H_CLOSED');try{
  need(next<clocks.length&&n===clocks[next].n&&pass===clocks[next].pass,'DOMINO82H_CLOCK_COVERAGE');
  need(sample?.kind==='domino-native-matrix-support82d'&&sample.input?.rowsD?.length===1&&sample.input.layout?.n>=2&&sample.input.layout.n<=7,'DOMINO82H_ONE_ROW_DOMAIN');
  const m=sample.root;need(Array.isArray(m)&&m.length===6&&m.every(finite)&&m[0]>0&&Object.is(m[0],m[3])&&m[1]===0&&m[2]===0,'DOMINO82H_POSITIVE_UNIFORM_ROOT');
  need(Array.isArray(sample.supports),'DOMINO82H_SUPPORTS');const sampleBytes=C.serializedBytes(sample);budget({n,pass},sampleBytes);const s=m[0],edge=up(region.cy+region.r);
  for(const support of sample.supports){const b=support.bounds;need(support.owner==='dominoes.row.0'&&b&&[b.x0,b.x1,b.y0,b.y1].every(finite)&&b.x0<=b.x1&&b.y0<=b.y1,'DOMINO82H_SUPPORT');
   // Directed arithmetic encloses ideal source-Y translation only. Actual
   // operation-order CTM and X identity must be checked by a later gate.
   lower=Math.max(lower,up(up(-b.y0)/s));upper=Math.min(upper,down(down(H-b.y1)/s));below=Math.max(below,up(up(edge-b.y0)/s));need([lower,upper,below].every(finite),'DOMINO82H_NUMERIC_OVERFLOW');potentialSupports++;budget({n,pass,support,edge,s},sampleBytes);
  }next++;budget({n,pass});
 }catch(e){close();throw e;}}
 function finish(){need(live,'DOMINO82H_CLOSED');try{need(next===clocks.length,'DOMINO82H_INCOMPLETE_CLOCKS');need(potentialSupports>0,'DOMINO82H_NO_SUPPORTS');const dy=Math.max(0,lower,below);if(!(finite(dy)&&finite(upper)&&dy<=upper))throw Object.assign(Error('DOMINO82H_INSUFFICIENT_VERTICAL_SPACE'),{code:'DOMINO82H_INSUFFICIENT_VERTICAL_SPACE',details:{dy,lower,upper,below,own:next,potentialSupports}});const result={kind:'domino-source-y-candidates82h',candidates:[{kind:'source-y',dx:0,dy}],coverage:{own:next,supports:potentialSupports},constraints:{lower,upper,below},sourceXClipUnchangedClaim:false,actualDestinationRequired:true,safetyAccepted:false,notGlobalImpossibility:true,budget:{limit:8388608,peak,definition:'serialized clock list/circle/constraint accumulator/current sample/current support and caller reservation; encoder heap excluded'}};budget({result});result.budget.peak=peak;close();return Object.freeze(result);}catch(e){close();throw e;}}
 budget(null);return Object.freeze({add,finish,cancel:close,retainedBytes:()=>budget(null)});
}
Object.defineProperty(A,'dominoVerticalCandidates82i',{value:Object.freeze({create,sourceOnly:true,certificateIssuer:false})});})();
