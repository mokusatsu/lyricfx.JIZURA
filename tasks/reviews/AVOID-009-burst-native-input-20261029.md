# Burst native input accessor83c

The source-only unit preserves the native burst render body and inserts an unused layout/scalar/palette reader. Parent independently checked all 7 source hashes and 6 tracked dependencies, then ran the portable runner: 24,002 synthetic-measurement checks and 24,015 checks with actual metrics/layout/fit source and a synthetic measureText context passed. Temporary regeneration reproduces the exact fragment, zero-context diff and boundary.

Palette cache reads preserve old hits, duplicate/invalid values and native 300/301-entry clear behavior without introducing writes. Font measurement is explicitly stateful: metrics misses change the dedicated measurement context and Map; clear increments revision. Actual loaded fonts, Canvas state, measurement values, revision/context effects and native paint remain unqualified pending the next gate.

Product registration, avoidance/support/quality certificates, whole-clock safety and UI performance are not supplied. Raw/generated full source/media remain outside Git. The small tracked dependencies and portable runner reproduce the pure unit without evidence paths. No authentication or push retry was performed.
