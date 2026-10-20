# AVOID-006 visual review: changes required

VIS006-01: subtitleBar-portrait-center at project 1.50s is certified but the reconstructed huge-copy second-row `へ` crosses the opaque subtitle plate. Its middle is hidden; the before original has no such occlusion. Source path and SHA256 are in review.json. This blocks overall visual acceptance pending correction and recapture.

Viewed: all8 normal-radius anchor before/after UI+original (32PNGs), other18 anchor and ticker/edgeFrame ownership before/after originals (40PNGs; hashes equal),48 after originals spanning radius0.1/0.45,portrait/square,short/long, plus the portrait subtitle before original. Total121 distinct source PNGs across76 distinct cases. Videos decoded fully but inspected by0.24s samples and targeted full frames, not every frame. No all174 visual or continuous flicker claim.

See inspected-assets.json for image paths/hashes, videos.json for video hashes/decode counts, video-viewed-sampling.json for sampled frame IDs. Intermediate contact sheets are derived inspection aids.
