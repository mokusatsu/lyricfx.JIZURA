# Outcome: not adopted before measurement

Parent selected against this prototype because per-append descriptor/key scans can outweigh saving only the first hull. This is a structural candidate-selection decision, **not a measured performance failure**. Pure/build results and the harness failure history remain intact. No browser/timing/public run occurred.

The original manifest and HANDOFF describe the historical candidate checkpoint. Candidate source/JAEN/helper are preserved losslessly in their `.candidate.gz` files; baseline bytes are in `.before.gz`, with `source.patch` as an additional source reconstruction. `not-adopted-and-restoration.json` records exact baseline restoration of only09a and the two HTML files. Other untracked paths were left untouched.

The test helper is historical prototype validation. To reproduce it later, reconstruct the candidate09a into a separate disposable tree from its fixed gzip before invoking the helper; live09a in this tree has intentionally returned to baseline. Do not run it against the restored product and label that a prototype regression.
