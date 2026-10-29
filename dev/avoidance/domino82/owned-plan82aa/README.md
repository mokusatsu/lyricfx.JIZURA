# Domino owner-generated immutable plan key reuse 82aa

Unregistered source-only normal-frame accounting/input-key optimization. No ordinaryUI or finalizer/cache installation and no preparation-time speed claim.

The owner alone allocates `denseCopy(record.plan)` in publishImmutablePlan(handle,input). It never adopts or memoizes input, even an external frozen alias or Proxy. Input is checked with the existing dense descriptor/prototype/hole/symbol/cycle rules and exact Float64 key. The generated tree has new ordinary owned objects/arrays, contains no external mutable object references or accessors, is recursively frozen and has a single private record identity. Descriptor inspection of arbitrary input is not used as authority. Unknown fields, order, undefined and signed zero stay in the source key. No inherited field is part of the key; existing dense-data source validation remains.

Only that internally generated identity reuses the prior canonical source key. External aliases/Proxy/mutable plans use the previous full key path. Every original generation/dependency/platform/source/font comparison remains, including the after-borrow inline check and before/after each paint. Dependency validation happens before the key cache, so failed dependency admission does not use the shortcut. The published plan alone cannot authorize a frame; the genuine owner handle and private controller ticket are still required. Drop/new preparation releases the owner-held plan and key-cache metadata. The controller replaces its own frozenCopy allocation with this owner publication, retaining all previous ticket/selector/CTM/current-support/bitmap-before-preflight checks.

Unpublished record/undefined cannot satisfy identity equality. Publication rechecks generation and dependencies immediately before publication, including after the original input was traversed for serialized accounting. A dynamic Proxy changing generation is rejected; no cached plan is published.

`ownedPlanBytes` counts another full serialized owned-plan representation, wrapper/proof/framing and reference slot conservatively; it is added to owner resident caps and every withPrepared caller reservation. Publication additionally counts input, checked clone and candidate simultaneously before committing. Existing global8MiB is unchanged, not a heap/backing-store/RSS bound. Runtime only increments fixed-size counters and reuses immutable byte lengths; no whole-model serialization or compile is added to normalframe.

Commands:

    node owner-regression-test.cjs /path/to/geometry68.js /path/to/scalar-metrics80.js /path/to/visual-policy82.js
    node controller-test.cjs /path/to/geometry68.js /path/to/scalar-metrics80.js /path/to/visual-policy82.js /path/to/owner82p-test.cjs

58 owner /28 controller mock checks pass with only the established test-only native DOM capability replacement. Cached vs external key counters, byte-reservation increase, deep freeze/ownership, accessor/sparse/cyclic/symbol/custom prototype rejection, undefined/null before publication, generation change during publication, revision/eviction/drop and prior controller guards are covered. RealCanvas same-condition model/frame/profile comparison is next; performance benefit is not inferred from pure checks. Current preparation17–20s, source-only time controller and formaltrajectory/finalizer/cache/UI gaps remain.
