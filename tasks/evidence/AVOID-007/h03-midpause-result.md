# H03 input mid-play pause: final incremental correction

This isolated increment follows reviewed e0dc0eb. Each input MP4 now independently
seeks to decoded0.5s, plays until currentTime advances by at least1/24s while
playing/ready, pauses before ended, waits125ms, and records unchanged time. Guards
require paused=true, ended=false, playing=true at progression, decoded seek0.5,
matching numeric start/played/paused/after-wait times, >=100ms observed wait, and
paused-time stability within1e-6s. An ended-only pause, no progress, or drift rejects.
Only then does the existing input helper seek decoded0 and measure the complete
12s continuous run with its unchanged >=284/288, ended12, zeroDrop/zeroCorrupt and
failure-absent criteria. Its timeout-only qualified body is unchanged.

The H03 private runner projects only the corresponding numeric pause times,
boolean states and existing numeric decoded-seek whitelist. It enforces the same
mid-play conditions. Free text/headers/unknown failure values remain unprojected;
raw failure markers still reject. Main25 projection and criteria are unchanged.

Fresh offline qualification: H03 15/15 Node tests, runner 7/7 (existing six plus
H03 group including ended-only/drifting/no-progress negatives), tracked Python
CLI 2/2. `h03-midpause-offline01.json` records actual commands, log hashes and all
eight source pre/end hashes, unchanged. CLI uses only a runtime-generated memory
sentinel through stdin. `h03-midpause-generation-proof01.json` records six exact
native generation function-byte matches versus e0dc0eb. The isolated baseline
object was used only to create this static receipt; tests/runtime do not need it.

No shared files, product, fixture, main review helper, bridge, Pages audit or CLI
harness changed. No actual browser, capture, ffmpeg, real network, publication or
credential was used. Synthetic VM/contract results do not establish actual H03
MP4 playback or public validation; those remain pending parent authorization.
