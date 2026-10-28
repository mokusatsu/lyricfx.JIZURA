# 80x cleanup-result transport / bounded abort diagnostic — mock-only

Unapplied source proposal based on fixed80w. No actual08 J.plan/Canvas/product build/UI qualification. This unit addresses the frozen/null cleanup-account failure that previously left a controller proof record, while retaining original outer throw identity and the existing limited data-lifetime contract. It does not redesign shared Canvas restoration or extend rendering support.

Binding.release removes plan/certificate bindings first, then returns a frozen status {ticket,accountFailed,accountError} even if accounting throws any value. It never writes properties onto that value. Compatibility drop rethrows the original accountError after release. The private controller consumes release status, always attempts record deletion, and only then rethrows the first cleanup-account/record error. Normal supported finalizer cleanup runs outside an active frame; no asynchronous lifetime is introduced.

09a revokes failed-plan finalized/sources before invoking abort callbacks and always rethrows the original value unchanged.09k abort attempts all matching callbacks. Failure count is independent; only the first16 witness objects are ever retained in its temporary array. A.layoutsDFinalizationFailure returns one immutable latest metadata report: original throw type/code/message, attempted callback count, count of callbacks that threw,16bounded witnesses and authorityRevoked flag. Codes clip64 and messages256 UTF16 units. There are no plan/certificate/model/error/stack/cause references. This is latest-only diagnostic, not a history or a guarantee of arbitrary host/OOM recovery.

Capacity: each clipped report/witness representation is bounded by64KiB serialized capacity. The adapter conservatively reserves3*64KiB up front for old report + current bounded witness representation + replacement report, so temporary and retained diagnostic state are covered without changing the8MiB proof budget. Diagnostic tests execute1000failing callbacks, report1000failures, retain16witnesses, and use worst clipped unpaired UTF16:33583JSON bytes/34064exact-codec bytes. Source limits and max16 temporary retention are explicit. The reserve is conservative serialized accounting, not JavaScript heap8MiB.

Tests all PASS:
- outer-cleanup-test53: actual full09a/validator/09k/proposed adapter with mock planner/compiler/geometry/context; original null/primitive/frozen throws, multiple finalized/aborted callbacks and continued cleanup.
- cleanup-failure-test19: frozen account throw, both record+binding released, before/after215023B exact, failed-plan validation/lineage rejection, readonly persisted failure metadata and next finalization recovery.
- cleanup-values-test76 =19*4 (includes the single frozen case again): null/number/string/frozen cleanup throw values, unchanged primary throw and complete mock release/report.
- cache-lifecycle-test88: existing4/5tuple legacy cache/admission compatibility and lifecycle6tuple identity/type/failed cleanup against actual core fragments.
- diagnostic-bound-test1012:1000callback execution/count, max16 current/retained witnesses, immutable clipped metadata, exact serialization below reserved slot, latest-only replacement.

These are exception/protocol mock results, not real source geometry or actual J.plan lineage/bitmap acceptance. Remaining work: actual module composition/late load/old69registration switch, actual composed working plan/final source-key correspondence, positive/unsupported actual API+allparts/RGBA/clock tests, noPost/fast domain and ordinary UI publication boundary. Existing UI warm language race/setup isolation and unqualified performance remain separate. No Qt run or source applied to product for80x.

Repository checkpoint: JavaScript fixtures match fixed80x evidence; the outer and failure tests change only the path to `../admission80r`. The 09a/09g/09k files are test fixtures, not product sources. Run from the repository root:

```
node dev/avoidance/bulbs80/cleanup80x/outer-cleanup-test.cjs
node dev/avoidance/bulbs80/cleanup80x/cleanup-failure-test.cjs
node dev/avoidance/bulbs80/cleanup80x/cleanup-values-test.cjs
node dev/avoidance/bulbs80/cleanup80x/cache-lifecycle-test.cjs
node dev/avoidance/bulbs80/cleanup80x/diagnostic-bound-test.cjs
```
