# AVOID-008 immutable-edge separated CPU profile01

ONE source-bound parent-authorized run on spec215/215 current/running/connected; source8ff3dd8/JA f8515267, drivere55b1082, fixedfixturee1ef5650, ref8801cc5b. Parent gate/runtime04/fresh status explicitly consumed; new fresh status archive and manual start/end SHA checks retained. Previous unprofiled100 was spec214; this CPU profile is not a formal cross-runtime speed comparison. No product/driver/fixture change, extra timing, retry,1000, image/public/main action.

Original workload preserved:ON/OFF freshdocuments,4preparations outside profile,6extra whole-hit finalizations each profiled separately,original80frames16warm each rendered under separate profile. Four CPU profiles100us:ONwarm4669samples/render1837,OFFwarm942/render1021. Both6actualwholehits/0actualwarmrecords,fullvalue/internalalias/freshfrozenindependence asserts all passed. ON100staged/actualrecord80/replay80/observations80;OFF0stage/0record/replay/obs. Normalized/cut/observation/state/region/font/count inputs equal original100 diagnostic. Actualfullvalue/alias/normalized byte artifacts for both sides are also exactly equal to oldfd6 profile02 artifacts at the same sourceRevision6; this is byte proof only, not timing equivalence.

Original results658,807B SHA42cb0bca9692cb6994af525e5afef9f5d0af5436aa20d79c7a77b0f31bd9d8f9 losslessly stored results.raw.json.gz.117consumed archives match source/live/pins;173actualpackagefiles unchanged. Each of4CPUraw and6outputvalue/alias/sourcegz verified against rawSHA/byte count. Product86source+JAEN still fixed. Finallysource/package checks0drift,errors0,contaminatedfalse,ownedbrowser/serverclosed;runner364120gone,postMainThread-inclusive jobs0.250MiB reserve and300s guard retained. PID1zombies not killed.

## Actual warm-finalization sample partition (six calls)

|exclusive bucket|ON ms|OFF ms|
|---|---:|---:|
|edgeRegisterFinal actual09g ancestor|357.115|0 sampled|
|payloadDecode actual09g ancestor|142.560|6.586|
|whole input/options/lineage v1 encode|81.098|77.499|
|freeze|84.856|1.518|
|signature|33.274|21.433|
|dependency collection|22.464|12.793|
|typed metadata|30.439|25.255|
|font graph encoding|2.338|1.048|
|begin/context/read/verify/other|19.979|19.331|
|phase-rooted total|774.123|165.463|
|GC separate|62.811|4.598|
|outside phase-root stack separate|528.847|315.724|

Root partitions do not require phase clock anchors. edgeAppend self253.585ms is the largest ON self function, read at09g99 self76.855ms; these are actual declaration/source identities, not every globally-named read function. Registration-inclusive total is357.115ms, so self+inclusive values must not be added. This identifies private metadata construction as a measured cost deserving design review; no optimization or speed payoff is asserted. PayloadDecode self90.422ms; native JSON.parse may be charged to its containing JS line. Direct parse-vs-repair split is not separately proved.

## Render partition and attribution limits

ON phase-root299.890ms:record146.136ms (includes hull27.873);adapter checks/geometry/dispatch45.102;replay45.869;other62.597;validate/signature0.186. GC17.149/outside-root434.602 separate. These exclusive buckets partition rooted samples; inclusive rows overlap. Global record examples:itemGeometry23.406 inclusive,matrix8.841,layoutText7.834,jsonClone6.177,bounds6.436,recordedItemBounds3.460. edgeContains9.592ms includes its actual path but is not an independent hit counter; current fixture does not retain edgeStats, so browser02 hits are not reclassified as currentprofile counts.

**ONrender sequential anchor discrepancy is -29.423ms**, giving exclusionmargin29.623ms. All ONframes have0interior CPU samples under the preserved conservative mapping. Therefore no individual newspaper/warningLabel/stampSheet CPU attribution is valid. Their exact recorded walltimes under CDP are stampSheet20.300/6.700ms,newspaper12/8.900,warningLabel2.900/1.900; full34wall table retained. These do not explain the prior unprofiled tail causally and are not benchmark p95 improvement evidence. OFFrender margin2ms maps some interiors but remains approximate; root183.842/GC3.329/outside70.912 separate.

NavStart/Profiler same-TimeTicks is an inference, not exact cross-clock proof; scalar sample duration/global stack costs independent of anchors. Inclusive rows overlap; positionTicks are count-only source lines, not timestamps. Fixed aggregate64e0afdc ran exactly once;cpu-aggregate.json and lossless cpu-aggregate.raw.json.gz retained withSHA in summary. OldCPU files unchanged. No new implementation or additional measurement authorized; stop for parent review. Original100 unprofiledON3.17x/+5.1msFAIL remains unchanged.
