# H03 native pair: narrow optional placementSeed equivalence

The actual capture01 log reports BEFORE owning `placementSeed: undefined` while
AFTER lacks the property. `src/08d_media.js` creates this own optional value;
`src/08c_composition.js` uses it only when Number.isFinite. Finalization's JSON
clone removes undefined. The failure is raw field presence, not a media position,
seed value, video clock or pixel difference. The frozen product/main02 and the
failed capture01 directory are untouched.

pairGuard now permits only own undefined versus absent at
media.cuts[i].placementSeed and foreground.cuts[i].placementSeed. Comparison copies
preserve every other own descriptor, array property and prototype, omit just this
optional undefined property, and never mutate arguments. Zero, null, finite seed
values and all other undefined fields are retained. Other field loss, changed
seed, placement or timing still fails, as do missing required proof fields.
No generic JSON roundtrip is used for normalization.

pairGuard returns a direction-specific witness with explicit before/after field
presence and a list of permitted differences. Capture stores it as indexed raw
`observations/<case>-pair-equivalence.json` and references its path/SHA in the case
manifest. The witness explicitly sets completeRawSchemaIdentity=false. JSON
initial observation files cannot retain own undefined; validateFiles checks this
known serialization loss against the sealed acquisition fact without asserting
complete raw schema identity. Native parity additionally compares the fresh raw
field presence to the captured witness for that side.

The new synthetic case exercises actual pairGuard: exact BEFORE-own-undefined /
AFTER-absent acceptance and its reverse; unchanged original arguments; witness
JSON preservation; zero/null/value/changed seed/position/time/other undefined and
missing required proof rejection; corrupted witness rejection. Fake fixtures now
use actual media/foreground objects containing cuts, matching the real API.

Fresh final-byte qualification: H03 Node16/16, existing private runner7/7 and tracked
Python CLI2/2. h03-placement-seed-offline01.json records eight pre/end source hashes,
commands and raw log hashes; all pins stayed unchanged. The generation proof shows
prepare/runtimeInit/openFixture/frame/inputProbe/playInputVideo/pauseInputVideo
byte-identical to reviewed44fbf58. Capture differs only by saving the witness asset;
main review/encoder helper bytes remain unchanged. The isolated baseline object
was used only to create that static receipt, never as a test/runtime dependency.

No actual browser, media capture, ffmpeg, network, credential or publication ran.
This qualifies the narrow comparison and evidence contracts offline, and does not
claim a successful replacement H03 capture, real playback or public validation.
Only the isolated new H03 tool/test and these evidence files changed. Shared
product/source, H03 fixture, main review helper, bridge, private runner, audit and
CLI harness remain untouched.
