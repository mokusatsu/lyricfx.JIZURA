# UNACCEPTED accordion WIP recovery01

Base90909a0. Product implementation gpt-6.1-sol/medium. Parent source/raw review is pending; this is not a candidate acceptance or task completion.

Restore in isolated checkout/source copy of90909a0. Apply accordion-root09a.patch and accordion-source.patch with patch --fuzz=0 -p1. Add src/09q_layoutsD_accordion.js. Keep true-before src__11p_layoutsD.js.before.gz at tasks/evidence/AVOID-009/accordion01/. Use existing repo assets/vendor and pinned dev/avoidance/layouts-c-editorial-fonts (manifest/hash included); do not change TLS/proxy/CA. Build only isolated tree using PYTHONDONTWRITEBYTECODE=1 python3 build.py.

Commands from isolated root, JIZURA_BROWSER=/usr/bin/chromium and normal local socket permission:
- ACCORDION_REPORT=matrix04.json node dev/avoidance/layouts-d-accordion-test.cjs
- ACCORDION_REPORT=parity04.json node dev/avoidance/layouts-d-accordion-parity.cjs
- ACCORDION_REPORT=transport03.json node dev/avoidance/layouts-d-accordion-transport.cjs
- ACCORDION_REPORT=vertical01.json node dev/avoidance/layouts-d-accordion-vertical.cjs
- node dev/avoidance/layouts-d-accordion-nonimpact.cjs (baseline repository path currently /workspace/lyricfx.JIZURA for read-only git show90909a0; change that baseline cwd for another machine before pinning a new invocation)
Reports require fresh filenames and snapshot before execution. Local fixtures block all remote requests.

Preserved findings: transport01=24/432 pixel failures caused by live camera root rounded on measurement reset; rootdiagnostic01=22/96 in selected subset. Approved narrow unchanged-accordion root capture reuses existing replay, transport02=432/432 matches. Parent then identified vertical proof axes reversed (fontY must be along and fontX across); actual source rendering unchanged. Current09q includes this proof-only correction. matrix03 and parity03 predate that review correction; current matrix04/parity04/vertical01 are being run. No prior failed raw has been replaced.

Pre-review matrix03:81 cases49safe31insufficient1unsupported; OFF12×6 RGBA and native72 plus18 original-source chronology comparisons passed. Nonimpact01:whole90909a0 OFF/other C/D18conditions72RGBA and3 cache cases passed. These are pre-review source pins, not final-current proof acceptance. No formal performance success, media or public result checks. Human review remains batch queue23:01UTC.
