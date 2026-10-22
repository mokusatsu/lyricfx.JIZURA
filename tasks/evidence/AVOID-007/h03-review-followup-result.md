# H03 helper review follow-up: offline qualification

This incremental change addresses parent review of c6b4204. Existing main review,
bridge, product and main-owned fixture remain unchanged. The private runner is
changed only within the additionally authorized H03 input-playback projection and
completion boundary (runner baseline SHA256
2ae013f30050449db9e1ca72bf462af42f735a9d54d665c7f791ad7c4e3318f8).

The focused receipt must contain exactly six unique case/side negative rows, with
both positionDetected and timeDetected true. Reported outcomes must match actual
cut certificates: all eight certified with nonempty all-safe units/segments means
safe; any unsupported cut means unsupported; otherwise insufficient. Synthetic
insufficient/unsupported fixtures now carry their corresponding actual cut state.

The external active bridge helper joins pre/end browser input pins. Both original
published input MP4s now receive their own fresh playback pages inside phase B,
three decoded seeks (.5/6.5/11.5), decoded start at0, continuous twelve-second play,
ended at12s, >=284/288 decoded frames, zero dropped/corrupt frames, mandatory absence
of failure marker, explicit pause and final resource cleanup. The input helper's
source is the qualified main playback helper with its sole timeout changed from
12000 to30000ms; source equality and synthetic cleanup checks verify that boundary.
Comparison MP4 criteria remain unchanged at >=92/96,4s and zero drop/corruption.
All input paths/layers are distinct, raw-bound to the focused reused media and
known public assets; no input encoding or generation is changed.

Both before/after UI videos must be ready and advance at least1/24 second while
playing before either is paused. Both paused states are then required. UI evidence
records both sides; a first-video-only start or a cleared output cannot pass.
JA diagnosis labels map safe/insufficient/unsupported to 成立/空間不足/未対応, with
short corresponding missing-MP4 reasons. Numeric manifest enums are unchanged.

Private runner projection adds inputPlayback only for H03 and only when that field
exists. Known input asset paths and media/foreground layers, duration/frame/fps,
existing numeric seek/playback fields, and pause booleans/time are whitelisted.
Unknown fields, headers, free text and unknown failure text are discarded. Raw
failure markers still reject success, including otherwise full/ended counters.
H03 completion requires both original inputs and their numeric gates in addition
to the qualified H03 tool's exact success status. Source/cut/fixture/media mapping
qualification remains owned by the H03 tool. Main25 projection/criteria are kept.

The parent resumed pure Node/CLI qualification after formal CPU isolation ended.
Fresh final-byte results: H03 14/14 Node contracts, private runner 7/7 (the existing
six plus one H03 input evidence/negative group), tracked Python CLI 2/2. Commands,
raw logs and all eight source pre/end hashes are in
`h03-review-followup-offline01.json`; all source pins remained unchanged. The CLI
harness generates its sentinel in runtime memory and uses the existing tracked
Node fixture extraction, with no real credentials. CLI JSON and its actual log
are included separately. No old pre-stop log qualifies these final source bytes.

`h03-review-followup-generation-proof01.json` records exact function-byte equality
against reviewed c6b4204 for capture/prepare/runtimeInit/openFixture/frame/inputProbe.
The native capture pipeline was not changed by this follow-up. The baseline Git
object is used only to create this static comparison receipt; no checked-in test
or runtime validator depends on that isolated object being present in a clone.

Actual H03/new-main/focused/capture/browser/public qualification remains pending.
No real credential/network, browser, actual capture or ffmpeg ran. This offline
qualification does not establish twelve-second real video playback or UI success.
