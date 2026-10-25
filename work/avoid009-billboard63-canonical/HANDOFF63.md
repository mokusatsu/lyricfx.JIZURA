# SOURCE63 provisional handoff — NOT FROZEN / NOT EXECUTED

Final pins/seal WAIT parent62 independent raw acceptance+manifest and parent-owned frozen JAEN manifest. SOURCE62 held immutable. Parent must review fullsource before release.

Apply afterseal: PYTHONDONTWRITEBYTECODE=1 BILLBOARD63_APPLY_RELEASE=PARENT_REVIEWED_EXACT_D_NORMAL_BUILD BILLBOARD63_FROZEN_MANIFEST=<pinned JSON manifest> BILLBOARD63_BUILD_OUT=$BASE/billboard63.build01 python3 -B work/avoid009-billboard63-canonical/apply63.py

Each language separately: BILLBOARD63_RELEASE=PARENT_REVIEWED_NATIVE_CATALOG_SOURCE BILLBOARD63_LANGUAGE=ja (thenen) BILLBOARD63_POST_PINS=$BASE/billboard63.build01/post-pins63.json BILLBOARD63_FROZEN_MANIFEST=<same manifest> BILLBOARD63_BUILD_OUT=$BASE/billboard63.build01 BILLBOARD63_OUTPUT=$BASE/billboard63.ja.raw01 (thenen) TMPDIR=$BASE/browser-tmp29-network02 /opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node work/avoid009-billboard63-canonical/runner/runner63.cjs

Then AFTER baseline: PYTHONDONTWRITEBYTECODE=1 BILLBOARD63_BASELINE_RELEASE=PARENT_REVIEWED_CANONICAL_AFTER BILLBOARD63_BUILD_OUT=$BASE/billboard63.build01 BILLBOARD63_BASELINE_OUT=$BASE/billboard63.baseline01 python3 -B work/avoid009-billboard63-canonical/baseline63.py

All actual commands parent-only. Before artifacts canbe read only byparentkeeper. Output literalchunks+fullvalues/partialfailures; preserve source/runtime/font/index/PYC/raw. No canonical changes already performed bypreparer.
