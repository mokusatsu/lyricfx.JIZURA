# Approved128MiB bounded cache checkpoint

16MiB source/results are preserved at `605282741d3a97cca2618a31dff87255114fae94`. This child checkpoint remains in `/workspace/avoid008-cache-final`, branch `avoid008-cache-final`, based on final source gate `f828ff234d8f45659734af58397233a9fdf71c50`. It does not qualify all34 as safe or complete AVOID-008.

Product delta is exactly one constant in09g: `CACHE_BYTES=16*1024*1024` → `128*1024*1024`, explicitly approved after the parent's review of actual full-input sizing. Entry limit32, header512, LRU, both UTF8/UTF16 ledgers, codec/source dependencies, normal finalization/restore/freeze, geometry, AA, bounds, candidates/order, clocks, source09a and all other83 sources stay byte identical to6052827. Reversing cap and original cache seams recovers every one of the84 gate sources. This cap accounts for stored key/payload strings plus headers, not all browser heap, transient copies, caller plans or exact physical Map overhead.

09g SHA256 `67f04fd9cd0b94fcbecc397f775c941bf1d2432c029d43fd882f85538a6585c2`.
JA/EN were rebuilt from unchanged final34 source plus this cap change:

- JA `a509c6ca7318baa7ba27e720a9962d10daf4cb32d7a099b1a92cfab426d3a030`
- EN `83321b2c41f16b805c5bbb263fed2d17e08f2e26b1d0e6ed2c92ca3a33bba435`

`owned-source-driver-manifest.json` records exact product/driver/fixture/runner bytes and provenance. Product change is separate from the approved harness budget adaptation and new large-probe driver. Existing size-sweep driver, immutable fixture and formal perf runner are unchanged and were not executed. Baseline2bb/thresholds/warmups/formal9calls remain unchanged.

## Fresh correctness and two ledger rejection scopes

The latest normal40/schema/23deps/18native driver ran once in a fresh browser at `final-c34-cache128-correctness01`, exit0,104pins start=end. Full normal40 values/graph aliases and all18 native frame results are additionally byte identical to the accepted16MiB run. Actual cold records410, warm0. Normal registry31, schema-only20→21 and failing synthetic adapter total1 with exact warm failed-original/diagnosis restore.4 nonC controls pass. LRU40stores/8evictions/32entries proves entry-bound eviction. Normal34 outcomes remain13hold/19insufficient/2preserved (shoji filter-support, priceTag pendulum); none are promoted.18 selected native pairs have zero render errors;15 have observations and3 invalid-parameter preserved-native pairs have no placement observation.

The old fixed17MiB title fixture is retained in6052827 history but cannot exceed a128MiB cap. It was explicitly replaced, not silently relabelled, by two cap-derived fixtures. Title is outside rendering and controlOFF, so these do not alter source glyphs or geometry and actual record calls remain0. The exact original cacheEncode is injected read-only outside J/A for payload accounting. Each individual key and payload fits both budgets, so positive lastAttemptPayloadBytes proves complete payload encoding; only the combined selected ledger rejects.

| fixture | title chars | actual key UTF8 / UTF16 | payload UTF8 / UTF16 | total+512 UTF8 / resident | rejecting ledger |
|---|---:|---:|---:|---:|---|
|ASCII `x`|37,748,736 = ceil(cap×9/32)|38,025,160 /76,046,824|37,755,233 /75,510,242|75,780,905 /151,557,578|UTF16 only|
|CJK `界`|26,843,546 = ceil(cap/5)|80,807,062 /54,236,444|80,537,135 /53,699,862|161,344,709 /107,936,818|UTF8 only|

Cap is134,217,728 bytes. Each fixture's first/second stats show misses1→2, bypasses1→2, stores0/hits0/entries0. Actual key/payload counters and readonly payload lengths independently produce both ledger totals. Full encoded output values/aliases match across both bypasses; source input is unchanged. Raw report records both snapshots, graph SHA and exact fixture construction.

## Same1000-input non-timed large probe

Only `layouts-c-final-cache-large-probe.cjs` ran at `final-c34-cache128-large01`, exit0. It does not sweep100/1000 again: one bootstrap native fixture, then the exact old1000 normalized input, one cold finalization and one warm finalization. No warmup/repeated samples/render recapture/baseline/p95/timing/performance result is executed or claimed. A5min own-browser watchdog bounds the job, not a performance statistic.

Old normalized JSON, new normalized JSON match byte for byte:1,547,895bytes / SHA256 `943704c839404b181763398b47d5e08c3356a2ad3d6a6b50238e138fad635eaa`. Old16MiB full graph, new128 cold and new128 warm graph are exactly equal:46,328,110UTF8bytes /92,230,472UTF16bytes / SHA256 `97cb974a05a860f359de318213327fd8804da42ba96a6b578ea3755ff5eb3d0e`. The unchanged original codec decodes/re-encodes that same graph exactly in browser and independent Node verification. This preserves complete values and internal alias topology, not only JSON values or selected geometry.

Cold actually reconstructs1000 C cuts /5998 records, stores1, misses1, bypass0. Warm adds one whole-result hit, C finalizations0 and records0; the returned immutable result is detached. Historical candidateBudget remains old proof and is not reported as warm work. All34 IDs,1000 regions/cuts,31 registry and source-known34 are retained. Statuses remain648hold/294insufficient/58preserved, exactly the old graph.

Actual stored key2,636,268UTF8 /5,181,816UTF16 + payload46,328,110 /92,230,472 +512header =48,964,890serialized /97,412,800resident, both below128MiB. Warm lastAttemptPayloadBytes0 means no fresh payload encoding on hit; stored payloadSerializedBytes remains46,328,110. Warm pool charge stays97,412,800.

The old size01 key was2UTF8/4UTF16bytes larger. We do not carry that old key count into this run. Old sizing had100 before1000, whereas the new probe has only1000 in a fresh realm; dependency object/function identities and the private ordinal history are run-local (clear does not reset identity IDs). Input, font bytes, output graph and source except cap are proved unchanged. Raw key text is intentionally private/not exported, so no individual field is asserted to explain the2byte difference. The actual new key counters and ledger charges above are used throughout.

## Fixed evidence and limits

104correctness and105large-probe source/compiled/driver/font pins match both live files and each archived gzip. Both drivers close own browser/server in finally; independent final verification observes no live non-zombie Chromium/ffmpeg. `verify-final.cjs` checks all gate-source reversals, old/new40 outputs/aliases/native frames, each dual-ledger rejection snapshot/accounting, new/old normalized and complete graph byte equality, original codec roundtrip, actual record/finalize counters, pool ledgers and input hashes. Static source/body assertions and syntax checks pass.

Each new original pretty report is canonical `results.raw.json.gz` with raw bytes/SHA and lossless receipt; compact driver results.json.gz is semantically identical. Only our new redundant raw JSON files were removed. Existing16MiB evidence, original graph/normalized inputs and all old FAILs remain untouched. Main/index/other worktrees were not edited; external origins were aborted and public results were never accessed. No images were viewed. The node_modules symlink remains untracked. Formal/timed diagnostic/next performance gate remains parent-owned and unauthorized by this checkpoint.
