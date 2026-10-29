# Stage capacity prerequisite (source-only)

Run `node dev/avoidance/billboard81/stage-source-compare81ag/capacity-check.cjs /workspace/jizura-logic-evidence-20261027/billboard-stage-budget81ad-actual01/budget.json.gz`.

This reuses the saved actual normalized plan and the original codec/source-key implementation. It reproduces the recorded stage 115872 B, committed stage 116380 B, and rejected issue 134620 B. Removing only the duplicate source signature (5217 encoded bytes) would reduce issue to 113700 B. Charging incoming plan and empty comparison scratch alongside the retained stage gives 113664 B. These figures retain the conservative factor four and fixed 4096 B reservation.

The old raw does not retain the dependency fingerprint content. The checker infers its **encoded length** (17968 B) from the recorded total and uses an equal-length ASCII surrogate. This proves capacity arithmetic, not dependency identity, owner authority, or actual finalization. Including a simultaneous fresh fingerprint in that comparison costs 185628 B, exceeding the unchanged 131072 B cap even before nonempty comparison scratch. No new actual model, finalizer, frame, or media was generated.

The previous guard constructs a current fingerprint without explicitly including that temporary string in its stage reservation. The source-signature removal alone is therefore insufficient evidence to proceed. No adapter or dependency implementation was changed. The original 81ac/ad/ae failures remain unchanged.

Resume billboard only with a concrete dependency comparison that validates the same current reference IDs, fonts/font-face descriptors, metrics revision, language, constants and adapter dependency set, preserves order and exact numeric encoding, and charges its temporaries without constructing a second large snapshot/string. Validate source-key equivalence, saved-shape capacity, ownership and invalidation before actual finalization. Retain scale1/noPost/fast scope, full clock/paint guards, and 62 s preparation limitation; ordinary UI remains incomplete.
