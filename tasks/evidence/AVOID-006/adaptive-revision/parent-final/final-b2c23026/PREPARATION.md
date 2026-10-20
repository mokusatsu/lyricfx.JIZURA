# b2c23026 parent independent suite preparation

Prepared only; no suite or browser has run. Do not treat this directory as successful evidence. Old final-850e43d6 scripts/results remain unchanged.

Seven existing scripts copied. Five are byte-identical. Only parent-parity.cjs output destination and receipt.py candidate identity/functional-summary input/provenance guards changed; no test cases, thresholds, seeds, expected geometry or baseline roots changed. See path-adaptation.diff and prepared-inputs.json.

The after/ fixtures (index.html, dev/avoidance/layouts-a-fixture.js, src/09a_placement.js) are frozen current-source copies with SHA-256 recorded. Full-path and shape-parity consume these copies. Other unchanged suites consume the current worktree, as before; before running, verify current JA/EN/source hashes still match prepared inputs and the successful functional summary. If candidate changes, prepare a new directory.

The new functional summary must be completed successfully and contain sourceHashes plus exact b2c23026/e4b4c311 compiled hashes. The receipt rejects not-run, stale-candidate or incomplete functional evidence. Its current not-run state is not an approval.

After parent review and CPU release only, execute each existing script from the repository root with stdout/stderr redirected to the corresponding file here: baseline-run.py → baseline-run.log; startup.cjs → startup.log; parent-parity.cjs → parent-parity.log; full-path.cjs → full-path.log; negative.cjs → negative.log; shape-parity.cjs → shape-parity.log; finally receipt.py → receipt.log. Set JIZURA_BROWSER=/usr/bin/chromium as in the old baseline runner. Use python3 -B for Python and node for CJS. Never redirect to old final-850e43d6 results. Check each exit code before proceeding.
