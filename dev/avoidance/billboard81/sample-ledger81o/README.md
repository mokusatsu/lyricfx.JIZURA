# Billboard sampler append-only byte ledger81o

Unregistered accounting-only sampler change. Descriptor/root are created once and not mutated during the known synchronous native sampling call; supports and optional glyphRows only append fresh records and no existing record or nested bounds/ink/matrix is changed. Native layout/Canvas/metric helpers remain unchanged; arbitrary mutable callbacks are outside this source-only domain.

The exact byte size of descriptor/root is computed once. Each appended support/glyph row contributes its full original encoded size and one separator for every entry after the first. Empty arrays contribute2bytes, absent glyphRows null contributes4bytes. A wrapper measured with five null placeholders subtracts exactly20bytes before adding real values. Current work and final result are still serialized fully. All numeric ledger values plus their wrapper are added to retained work; the8MiB limit is unchanged, not heap/RSS.

ledger-test.cjs injects an independent slow reconstruction only into the VM test source: every budget equals the original full serialization plus the exact ledger representation. 8243 checks cover252samples, both texts, all3passes, entry/held/exit, glyphRows on/off, exact sample fields, initial and mid-call limit refusals with context restoration, invalid reservation. baseline81g2 is verbatim.

Run `node model-test.cjs /path/to/saved81m-unit` for50 checks (+100 bootstrap). model-test.cjs compares old/new derived quality/union/model using the81m integration source unit as an explicit path dependency; synthetic only. It does not use old raw as runtime input. Real representative Canvas profile is pending; no ownership, frame or UI qualification.
