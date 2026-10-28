# Synchronous immutable fragment extension81af — unregistered

Compiler change: retain the first F.create through I.make, then add only newly available nativeInput/input-related immutable payloads. The second clear/create is replaced by add. Before the next recipe, external onScalar callback, yield, exit or exception, the existing clear/finally behavior remains. No sampler, geometry, metric, quality predicate, clock, candidate, source dependency or frame logic changes. This is not a product/UI registration or performance acceptance.

add retains the existing weak-key byte slots, encodes each new object once, and counts every live payload occurrence through the same exact-Float64 byte walker. Caller-owned samples/nativeInput/input and all whitelisted nested payloads must stay unchanged throughout the synchronous recipe section. Quality/group/current mutable work still uses the uncached recursive path. Construction reports include new values array, old+new metadata aliases, reservation rows, hits/active/byte counter and constructing flag. The cache metadata length is recomputed during construction; cached old metadata length cannot hide newly added entries. Before and after insertion callbacks bound the intermediate monotone numeric-slot growth; no external callback is invoked inside insertion. Reservation remains live through the second report. Codec implementation allocation/JS heap is excluded as before, not declared below8MiB.

Invalid/reentrant add and any construction/onWork exception clear both prior/new entries and rethrow. clear removes weak slots/metadata and permits normal uncached measurement of subsequently mutable values. No API promises correctness for caller mutation while immutable slots are active; this was already the original fragment contract.

Tests:

```
node fragments-test.cjs
node extension-test.cjs
node model-test.cjs <81m-unit-dir> <81o-scalar-support81.js> <81p-model-compiler81.js>
```

545 original byte checks,420 extension checks,567 same-generator model/immutability checks (+100/439 bootstrap) pass. Both HELLO/風風先先 use the same81p compileSteps generator before/after, each3states/9own×7. All model fields except conservative budget peak match. Tests observe126samples+126inputs per variant and verify hashes remain unchanged after the entire generator. Old252creates versus new126creates+126adds across two inputs. No Canvas timing or fullclock guarantee follows from synthetic tests. Real representative comparison must use the same generator, same clocks, input, wrapper setup and fresh pages; nested times/overhead are diagnostic.

The baseline codec is a verbatim copy from the existing81m unit. Product sources, current adapter capacity failures and earlier full models remain untouched. No new fullclock compile is needed for this representative gate.
