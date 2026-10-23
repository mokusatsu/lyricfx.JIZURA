# Repair memo finite capacity only

09g changes only three limit literals: 65536 operations, 1048576 charged slots, 8388608 string characters. Original 128MiB pool, codecs/admission, compile/read/cap/fallback/clear/eviction algorithms remain exact; latest one memo. Historical old-fixture1000 requires26732/610744/2633970 and now full1/fast2 with complete descriptor/alias/freeze equality and fresh graphs. This does not establish current1000 exact counts or performance success. Current formal observed full8/capped8; prior formal FAIL remains.

Retention is bounded by65536 four-field instructions and charged path elements (1048576 slots), at most two path arrays per instruction, and8388608 UTF16 characters (16MiB logical character storage). Array headers and VM overhead are additional bounded implementation costs; this is not an exact heap/RSS claim. Memo retains existing entry/payload reference, no output graph.

Pure7 includes saved historical1000 and exact/just-over boundaries for each limit. Existing165 plus5 lifecycle pass with dynamic cap input sizes. Existing dense66 reads/6 lifecycle pass. Tests are offline; context verification stub and synthetic brand used only in pure harness, production admission unchanged. Large graphs are generated/read in /tmp; no new HTML/archive duplication. Build and isolated reverse build match baseline JA/EN exactly;83 other sources exact. Browser/performance/CDP not run. Original thresholds and previous FAIL unchanged.

Commands: `node --expose-gc --max-old-space-size=3072 dev/avoidance/layouts-c-repair-capacity-pure.cjs /tmp/avoid008-repair-capacity01`; `node --max-old-space-size=2048 dev/avoidance/layouts-c-validated-repair-memo-pure.cjs /tmp/avoid008-repair-capacity01`; dense helper requires historical before-freeze.cjs third argv.
