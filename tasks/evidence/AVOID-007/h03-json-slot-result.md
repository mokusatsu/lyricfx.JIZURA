# H03 serialized initial: one known native unset slot

Incremental follow-up to f01e7c2, which has not yet been integrated by parent.
Before/after pairGuard and its narrow media placementSeed witness stay byte-exact.
A separate serializedInitialGuard handles only JSON-saved initial versus fresh
native initial in nativeParity. It first retains lifeGuard's full eight native
clocks/params/occurrences checks, requires saved rawLifetime[7].slotEnd to have no
own property and fresh rawLifetime[7].slotEnd to be own undefined, with expected
final native slot explicitly unset. It removes only that property from a
comparison descriptor copy, retaining every other descriptor/prototype and never
mutating either argument, before calling unchanged pairGuard.

Zero, null, finite values, missing original-absence evidence, another index,
another field, changed clock or params reject. The original before/after pairGuard
still rejects this rawLifetime difference itself; no generic JSON roundtrip or
new before/after equivalence is introduced. nativeParity report records the exact
omission path, serialized absent/fresh own-undefined and native-unset meaning,
with completeRawSchemaIdentity=false. Completion requires this boundary evidence.
Private runner remains unchanged and its existing whitelist omits this extra
report field; this increment does not claim it appears in private-runner output.

The added test fixes the actual eight rawLifetime JSON rows from failed capture01
before initial, whose full raw initial SHA256 is
660b080a411cd21feaf6ca794edfefe1d9f0a5c3e70a283feb8b4abd724c6dfd.
It recreates the actual fixture's slotEnd:c.slotEnd property map, checks original
JSON absence and fresh own undefined, verifies unchanged inputs, and tests strict
zero/null/value/other-index/other-key/clock/params/original-presence negatives.
No test depends on the failed capture directory or shared runtime being present.

Fresh offline qualification: H03 Node17/17, unchanged private runner7/7, tracked
Python CLI2/2. h03-json-slot-offline01.json records commands, raw logs and eight
source pre/end hashes; all unchanged. Static proof records ten function-byte
matches versus f01e7c2, including pairGuard/pairWitnessGuard and all six native
generation functions, with unchanged main/encoder helper hash. Baseline Git object
was used only to create that receipt, never as a test/runtime dependency.

Only isolated H03 tool/test and evidence changed. No shared product, fixture,
source, main review helper, bridge, runner, audit or CLI harness changed. No actual
browser, capture, media processing, ffmpeg, network, credential or publication ran.
Actual replacement acquisition and native/browser/public parity remain pending.
