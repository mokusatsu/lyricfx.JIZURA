# Fixed three/five distance score terms

08c composeLyricArea one scoreline only:two map distance outputs and five-anchor spread temporary pluscallbacks replaced by explicit3/5Math.min arguments. Same eightMath.abs calls left-to-right, same x+cw/2 and y+ch/2 subtraction operands (parenthesized1/3,2/3), multiplications/addition order. Allcandidate/RNG/score accumulation/tie/clear/overlap/clamp loops andsize/zone logic unchanged. No cache/caps/sourcekey/native geometry/record/replay changes.

Sharedcomposition scope is required originalJ.plan hotspot work:accepted231CPU warm3..8 source2521041us,compose735141us leaf over6calls. Those are samplingdiagnostic estimates, no performancepass/causal effect claim. This changes sharedcomposition numericimplementation and preserves normalnon-C behavior; not a newplacement algorithm.

Immutable oldfunction+overlap oracle byteexact from1b source. Curated24geometry×24seed=576normalconditions coverwide/narrow/edge/minsize/fixed/obstacles/zone/fgCenter/placementseed/emphasis/suppression andminclamps. FullresultV8bytes,176702candidate score/geometry Float64LE,176990realutilRNGdraws/state/calls/interleavedorder/hashcalls, everyMath/clamp/overlap argument/callorder match. Tests instrument actualutilRNG after unchangedstate transition and privatefunctioncalls offline; no intrinsic/prototype/Proxy/fuzz cases. Inputunchanged. Result/score/RNG/order hashes retained percase.

Build andisolatedreversebuild JAEN pass;83other sources exact; replacing1scoreline reverses all08c bytes. No newretainedstate/fallback/inputrestriction. ActualJ.plan9normalizedhash revalidation remains pending:next original765 fixture run checksall9 hashes against fixed4add, after parentpairedacceptance/separategate. No browser/perf/CDP/public/images run. PriorformalFAIL unchanged; no implied speed success.

Command:node --max-old-space-size=768 dev/avoidance/layouts-c-compose-distance-score-pure.cjs /tmp/avoid008-compose-distance-score01 tasks/evidence/AVOID-008/performance/compose-distance-score01/before-compose-lyric-area.js
