# H03 control comparison captions

Only `pageHTML` captions and their existing bilingual UI test change. “Safe / 成立” now explicitly means the numerical circle-avoidance and foreground-support judgment, not visual acceptance. Videos are described as adopted examples which passed separate visual review. A numerically safe case without media is “この比較では未採用 / not selected for this comparison”, not pending approval.

All three numerical diagnoses and statuses are unchanged. The original two-pair bundle and its overall visual FAIL remain preserved; this change does not accept bubbles or the old bundle. A future rain-only fresh bundle requires its own authorized capture and validation. No capture, browser, media processing, network or publication ran for this change.

`h03-control-ui-source-proof01.json` proves the entire helper is byte-identical to commit `76521ba` after substituting only its `pageHTML` function. Every other exported function and constant is unchanged, including native/capture/runtime/decoded/clock paths. Before helper SHA is `0356dcdfb190c0600d6ef515a7e0bcaaa8cd20508255954c3fd91077de62ff5d`; after is `874b97823036eeb7da072e51cccab631b0be5d1bef50805be362c68ed2a14873`.

Fresh pure qualification: synthetic control 7, control with actual focused01 read-only input 8, bridge 14, legacy H03 17, private runner 7, and stdin CLI 2 all pass. Commands, raw log hashes, and identical pre/end source/input hashes are in `h03-control-ui-offline01.json`. The actual focused input qualification recalculates existing numerical diagnostics; it is not a new visual or browser review. No B/T/private runner/fixture/product/old H03 source changes are included.
