 // The owned entry fields never change after issue. Its external plan can still
 // be finalized, so cache only after data validation and complete deep freezing.
 function cacheableRetained86bc(){if(pending!==null)return false;for(const e of entries.values()){if(!Object.isFrozen(e.plan))return false;data(e.plan);if(!deepFrozen(e.plan))return false}return true}
 function bytes(){let oldBytes=frozenRetainedBytes86bc;if(oldBytes===null){oldBytes=codec.serializedBytes(retained());if(cacheableRetained86bc())frozenRetainedBytes86bc=oldBytes}
  if(audit86bc&&frozenRetainedBytes86bc!==null)need(frozenRetainedBytes86bc===codec.serializedBytes(retained()),'BULBS86BC_EXACT_ACCOUNTING');
  const management=codec.serializedBytes({frozenRetainedBytes:frozenRetainedBytes86bc,cacheNumericSlots:1})+96,n=oldBytes+management;need(Number.isSafeInteger(n)&&n>=0&&n<=8388608,'BULBS80T_BINDING_BUDGET');return n}
