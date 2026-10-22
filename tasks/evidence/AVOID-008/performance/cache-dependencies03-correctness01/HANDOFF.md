# One fresh correctness run for reviewed dependency representation

Source/build input commit843f7b09f00a033c7ddd9120608949fe57f2bc20,09g acd53f14e3ff03c8486d09ede3a579cd204d4a52317f3e6c992166204d2b87fc,JA01c9280a086705379db2927c0bac0d7d0dcc8b35d626585be4ac03a7fef92b53,ENb68d17bb6af7937f41b9fad8219561cdaa8355f9135df720e68b73535761919e. Complete104consumed source/compiled/driver/font pins start=end and live match; archived input gzip files retain exact bytes.

Exactly one parent-authorized local loopback correctness run:

```
JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-c-final-cache-test.cjs tasks/evidence/AVOID-008/performance/cache-dependencies03-correctness01
```

No driver changes, expected-value changes, additional browser/performance/size1000/CDP/formal/encoder/MP4 run. Exit0/errors0/input drift0.40normal/control pairs preserve full finalized JSON and internal graph aliases;18cold/warm native-frame pairs preserve exact pixels/full recorded traces.25original dependency negatives,4nonC controls,separate schema20→21registered failure/restore/warm,32entry LRU/8evictions and both128MiB oversized-ledger controls pass. Unsupported/insufficient results remain preserved (13certified-hold,20insufficient,7unsupported/control rows); this is not40safe or34all-condition acceptance.

Compared against accepted decoder-only6d run `../cache-decoder01-correctness01/results.raw.json.gz`: every field under results and registrySchema.results was compared, including complete serialized values/graph strings/digests/traces/call counters/diagnostics/controls/budget output.62,676scalar or complete-string leaves;534differences, all intentionally changed actual key/ledger charges. No other difference. `full-field-old-new-comparison.json` retains every changed path/old/new value. It does not skip large strings: equality is checked on the full string; only a differing string would be represented in the report by hash/length. No false full-row byte equality claim.

The only allowed changed numeric field names are keySerializedBytes,lastAttemptKeyBytes,lastAttemptKeyResidentBytes,serializedBytes,residentStringAndHeaderBytes, and oversized charges keyUTF8/keyUTF16/serialized/resident. Payload bytes/history/geometry/aliases/native observations and counters are identical.110actual pool ledger snapshots satisfy key+payload+headers and both128MiB limits; actual oversized total formulas and two real bypasses each are verified. See summary.json for actual values, not old-key carried stats.

Actual planning record counters:410cold/0warm across40pairs; all40 completed-result hits have1hit/1store. Historical candidateBudget numbers are retained proof history, not current reconstruction. Actual native calls recorded by frame rows:18cold+18warm; actual recorded observations15+15; errors0. Three frames on each side follow preserved unsupported/control native paths, so no18-observation claim. This unchanged driver has NO independent render record/replay counters; null fields explicitly retain that measurement gap, and observation counts are not relabeled replay measurements. Parent accepted this distinction without rerunning the suite solely for another counter.

Driver finally completed browser.close/server.close; runner exited0 and its PID335507 is gone. No live Chromium remains (zombies separately excluded). Browser slot was released to parent immediately after exit. Disk729MiB before/719observed during,719302656bytes after receipt (250MiB reserve retained). No heap-peak measurement claim.

Original pretty raw12,859,701bytes/SHAe11c2d933547414ac7dfc704ffcaf9d8159cf9697b04e551455d40f2925a379e is losslessly preserved as `results.raw.json.gz` with `raw-result-identity.json`. Only this run's duplicate pretty raw was removed; compact results.json.gz is separate. All historical FAIL/raw remain unchanged. No speed result is asserted, and original random performance corpus94/100staged/76of80C observations plus prior speed failures are still unresolved. Await parent review/new gate.
