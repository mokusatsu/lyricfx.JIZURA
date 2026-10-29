# Limited dedicated preview 86b

Source-only; ordinary UI is not installed. The helper creates its own canonical render surface and a separate, exclusively owned preview. It never resets a supplied UI canvas. Native width reset intentionally clears the owned preview state/clip/transform only after admission, rendering and generation checks succeed. A native failure after the copy commit begins has no rollback guarantee.

Actual01 completed once, exit 0; 20 pinned inputs unchanged, three compressed/decoded raw hashes verified. Existing product80y genuine J.plan lineage fixture was used with explicit test adjustments before J.finalizePlacementPlan. Stock controller/owner guards and 8 MiB proof limit were unchanged. No context equivalence shortcut, observer or UI hook was installed.

At t=1 direct stock RGBA and dedicated-preview RGBA matched: `f7ed141b46f293768a91926efc2a0ea3b1e512336edc6a7a3f71010ab64b4e3a`. Current plan alpha was 255 throughout; this does not qualify transparent plans. Surface was 960×540, sRGB, unorm8. Revision invalidation returned STALE_PLACEMENT_PLAN and preserved a nonempty sentinel hash `1ac4e191ab451ed956796d9e043b02068edaeca76e4f7ca1460bc8a90ad6582c`. Owner compiles remained 1.

Cold finalization 18,447 ms; unobserved single direct frame 30.4 ms, helper frame/copy 29.6 ms. One pair is not a performance comparison or 60 fps/UI acceptance. Native timer/rAF and visibility preflight passed. Node exited 0; service terminated -15 via normal runner cleanup; both PIDs absent and port connect returned111.

Only noPost:true, fast:true, scale:1 are accepted. Ordinary UI uses other combinations and remains unconnected. Post effects, scaling, layers, transparent output, full concurrent backing-store/RSS accounting and asynchronous practical preparation remain unqualified. The helper keeps two 960×540 surfaces (nominal RGBA backing 4,147,200 bytes), separate from serialized proof accounting.

Pure command: `node preview-test.cjs` — 19 mock DOM/renderer/admission checks. Actual gate source: sibling `bulbs-preview-gate-source86b`; evidence: sibling `bulbs-preview86b-actual01`. Raw/media remain outside Git.
