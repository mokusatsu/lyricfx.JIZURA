# AVOID-008 original formal100/1000 — unmet performance

One parent-authorized --formal invocation from runtime04/spec230 helperf33aef6099ce4c1b5e063a0af8b916b6d01657c7 and reviewed wrapper6c558a7430f4ba17c52f67a7432c8a955b00c0ae68bc2d63b0c7416410c186e1, product9bdb23287879ae12f054af7ef71d4ea725a56534/full84 JA0f0989faa968e4e1c165543e8837a16f41e234a909c31cfbc7d438a7af260874. Model gpt-6.1-sol medium. Original6cc runner/765fixture/4addcorpus/2bb baseline, all8sides100/1000ON/OFF baseline/candidate,3warm+6measured planning samples,80render/16warm,2x/+3ms and1800000ms bound unchanged. No retry/source/helper/input edits.

FormalExecutedtrue/passedfalse. All8sides complete, countsValid/candidateFullCoverage/actualPipelineValid/pinnedFontCorpusQualified/inputParity true; each side has100or1000cuts/regions,6measured planning points/64measured render frames, renderErrors empty. Candidate ON actual80record/80replay at both sizes. The only error is original formal contract assertion ERR_ASSERTION; no source/workload/cleanup error.

Formal p95 comparisons (baseline→candidate planning ms; ratio; additional render p95 ms):
-100ON:47.899999991→100.699999988;2.102296451; +4.0. Planning and render unmet.
-100OFF:43.100000009→89.200000003;2.069605568; -0.799999982. Planning unmet.
-1000ON:423.700000003→1636.599999994;3.862638659; +3.0. Planning unmet, render at limit.
-1000OFF:386.299999997→625.200000018;1.618431271; +0.200000003. Within original limits.

Current1000ON completed cache hits8/miss1/store1, repairMemo fullReads8/fastReads0/compiles0/capped8/fallbacks0.100ON fullReads1/fastReads7/compiles1/capped0. Thus real current1000 capacity exclusion is now observed; old historical payload count remains a separate source. Native bounds1000ON hits12455/misses226/entries226/caps0/evictions0, no entry-shortage inference. No cap or threshold change made in this run.

Raw results.json.gz SHA256268f43b1ec516ac69a4893cafc10512ab0213a01ff39119299faaea5b1009d31 (162332bytes), original JSON/gzip and all phase/cache/output/call/observation detail retained. Manifest records8side parts/config/comparisons/flags/actual current1000 caps. Original gate/preload/runtime/product86/package173 support files retained.

Actual node395559/startTicks11848077, Python395555 Popen.wait kernel1/reapedtrue/gonetrue,07:07:48→07:09:39UTC. Awaited browser/server close in unchanged runner6cc finally before post scan/save, before/after livejobs0, Z separate. Full execution.json.gz/stdout.log.gz retained. Support violations/input/product/package/gate drift empty. Prelaunch612667392bytes, support after597385216, wrapper post-results-save597291008 all above250MiB. After termination only,103identical gzip inputs hardlinked to verified candidate browser archives with compressed/decoded SHA and inode receipt; raw/pins unchanged. Post-storage604696576bytes free.

Formal failure is retained, no performance success claim or hidden standard100/render failures. No CDP/profile/security mutation/fuzz/images/video/public verification. Large temp/tmp. Parent review and separately authorized source/pure capacity work follows; no further browser/timing authorized by this handoff.
