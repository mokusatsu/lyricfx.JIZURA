# Serialized immutable fragments81m

Unregistered private synchronous byte-count helper; does not change the exact-Float64 codec, geometric/quality calculation, thresholds, clock coverage or8MiB limit. 545 pure checks compare every result to original serializedBytes.

Caller may cache only objects proven unchanged during a synchronous private phase. Whitelist is computed once; repeated appearances still contribute their full original encoded byte length. Mutable working/filter/support/witness arrays are never cached. Compiler integration clears before external onScalar and in finally; there must be no await, external observer or shared mutation during a cache interval. This API is not a proof issuer.

Cache uses weak object keys plus numeric byte lengths. Serialized accounting explicitly includes both numeric WeakMap-entry representation and retained metadata tuples, counters/active flag/cached metadata byte length. Construction reports the whole whitelist reference array, both representations and maximal entry reservation before adding entries, then reports actual entries. Original serialized payload occurrences remain counted by the caller; this is not JS heap/RSS accounting. The cached metadata length is invariant while active because list structure is fixed, all numeric values use fixed-width16hex encoding, and active remains true.

clear replaces the WeakMap, drops metadata, disables reuse. Constructor whitelist/reservation/onWork references are nulled before API publication. Remaining scalar counters are included by metadataBytes if a cleared API is still held. After clear, changed former cached objects take the ordinary byte-count path.

Run node fragments-test.cjs. This independently saved unit has no compiler/model/Canvas/runtime/UI qualification. Integration candidate/tests in the parent evidence folder are separate work, not implied qualification.
