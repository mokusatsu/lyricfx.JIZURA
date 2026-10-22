# AVOID-007 H03 exact-window amendment

The parent approved changing the prospective supplemental capture interval from
absolute [6,10) to [3,7), keeping 24fps, 96frames and four-second output duration.
Read-only source: `h03-native-plan01.json` (shared evidence SHA256
`8bc8672b7e6d030d1c4692454a2d226ceedf5117b2287a0f414a9404f300a79d`)
and its log. Native e96 planning produced eight retained cuts from the three
input lines and a native end7.5s; the old interval would include native-empty
later frames. This is a pre-capture condition change explicitly approved on that
evidence, not a tolerance change or manual extension of original cuts/slots/ends.

The bridge verifier and synthetic manifest now require exactly
`{absoluteStart:3,absoluteEnd:7,fps:24,frames:96,duration:4}`. A specific negative
case rejects the old [6,10) object. All other identity/source/font-role/outcome/
receipt/media/subset/privacy gates remain. No fixture/native parameters or MP4
bytes were altered here. Parent owns eventual freeze and actual supplemental
capture; reusing the two original input MP4 byte assets is its approved plan.

`browser-phase-bridge01.log`: all14 offline tests pass, including committed-source
main-only four-file/hub byte golden and unchanged Pages audit. Original earlier
[6,10) design/tests/receipts remain historical; this amendment supersedes only the
future H03 window. No real supplement, URL, capture or publication is claimed.
