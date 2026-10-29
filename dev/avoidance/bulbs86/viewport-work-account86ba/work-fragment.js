// Same original occurrence count. Only owner-model fields, never mutable work,
// group/held/metrics/extra, can use this replay-local immutable-object cache.
const memo86ba=new WeakMap();let memoCount86ba=0,memoLedger86ba=0;const audit86ba=false;
function budgetWorkBytes86ba(extra){
 const view=work&&{...work};let adjustment=0;
 if(view)for(const k of ['entry','template','ref','unshiftedRoot','support','item','glyph']){
  const value=view[k];if(!value||typeof value!=='object'||!Object.isFrozen(value))continue;
  let encoded=memo86ba.get(value);if(encoded===undefined){encoded=bytes(value);need(memoCount86ba<65536,'BULBS86BA_CACHE_LIMIT');memoCount86ba++;memoLedger86ba+=bytes({encodedBytes:encoded,keyReferenceSlots:1})+96;memo86ba.set(value,encoded)}
  // Null stands in one occurrence only. Add its full old encoding back each time.
  view[k]=null;adjustment+=encoded-4;
 }
 const payload={groupEntries:[...groups],heldEntries:[...held.records],counters:{rootCount,glyphMatrices,rootBytes,glyphMatrixBytes,peak,reservedBytes},work:view,extra},sameOldBytes=bytes(payload)+adjustment;
 if(audit86ba)need(sameOldBytes===bytes({...payload,work}),'BULBS86BA_EXACT_ACCOUNTING');
 const management=memoLedger86ba+bytes({memoCount:memoCount86ba,memoLedger:memoLedger86ba,modelReferenceSlots:1,viewReferenceSlots:2*(work?Object.keys(work).length:0)+4})+2*(work?Object.keys(work).length:0)*96+1024;
 return sameOldBytes+management;
}
