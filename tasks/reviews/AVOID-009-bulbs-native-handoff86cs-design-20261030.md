# 86cs native handoff feasibility — implementation stopped

Static inspection by gpt-6.1-sol / medium after the 86cq/86cr trials. No source
implementation, new Qt execution, performance measurement or product adoption.
The user's requirement to avoid a new large mechanism takes priority.

The proposed continuation would reuse native-only results when that candidate
fails and calculate only the remaining three recipes. Estimated minimum scope:
six modules and approximately 20–25 edit locations (an estimate, not an implemented
diff):

| Module | Required local changes |
| --- | --- |
| 11zz03_bulbs_frame_data80.js | Explicit internal native-singleton construction, then original four-row frame data. |
| 11zz06d_bulbs_generator86.js | Seed owned native results, reconstruct per-clock native reference descriptors, calculate three recipes, assemble/account the full model. |
| 11zz02_bulbs_local80.js | Import privately owned frozen templates/references, preserve canonical key/id/duplicate-reference bookkeeping without deep copying. |
| 11zz07_bulbs_owner80.js | Hold native data once, consume under identical input/font revision/faces/clock/context/viewport, transfer resource ownership, clear on cancellation/other failure. |
| 11zz09_bulbs_controller80.js | Hand off native data only for the expected native candidate failure before the existing throw path evicts it. No drawing permission may survive. |
| 11zz10_bulbs_adapter80.js | Invalidate the old generation/ticket/bitmap, distinguish this one private continuation from ordinary cancellation, start the remaining work. |

The completed native model retains schedule(root/q/out/nativeN), static
layout/subtitle/radius, support groups, local templates/operands, metrics and
held quality data. It does **not** retain every D.nativeAt descriptor and its
per-clock source ring points. D.recipeAt reads layout/r/subtitle/ring.N plus
q/out/culled, so a thin reference descriptor appears reconstructible from owned
saved values and the existing subtitle formula. Its exact clock, cull and
rounding equivalence has not been implemented or tested.

Frozen template/metric/held/group values can be shared by reference in principle.
The current localTable.add always clones/validates/interns; avoiding a whole-model
copy still requires a new private seed-import path with correct key/id ledgers.
The native held records, metric entries, recipe order, clock coverage and source
glyph operands must survive that transfer as well, not just aggregate bounds.
The final full candidate order and all-clock quality/destination proof must
remain the original ones. No external model/raw re-input API is proposed.

Source geometry readers do not introduce an ambient RNG handoff; ordinary env
construction, per-recipe layouts and source glyph/font calls would still run for
the remaining recipes. Nevertheless metrics-cache order, subtitle fit/revision,
Canvas state and side effects cannot simply be assumed equivalent after changing
pass order. No replay/hash or glyph/RNG/side-effect comparison was performed.

The fixture's original full serialized peak is 3825235 B and completed native
model 406171 B. Their sum alone fits 8MiB but is **not** an established combined
upper bound: owner entry/dependency/seed metadata, canonical template index keys,
old/new output construction and shared-reference accounting must also be
included. Existing admission near 8MiB must not become a new rejection solely
because the cache is retained. Ownership would have to move from the old resident
into the remaining compiler work, releasing the old root, rather than retaining
two full models or discounting live data without proof. No general safe 8MiB
handoff bound is established.

This is larger than a one- or two-site optimization. Therefore implementation is
stopped under the user's scope constraint. Feasibility and performance are
unproven; the idea is not declared mathematically impossible. Both the successful
and unsuccessful 86cq/86cr original source/raw/results remain preserved. Their
results are not overwritten by this design assessment. Initial cold preparation
speed remains unresolved. Parent reviewed the scope and stopped this proposal under the user’s size constraint; work commit/push is parent-owned.
