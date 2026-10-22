# Distinct H03 native-single-retention control validator checkpoint

New files layouts-b-h03-control-review.cjs/test.cjs copy the reviewed legacy550615
H03 pipeline into a distinct profile. The only other code change is the bridge's
exact profile/window switch. This patch deliberately excludes pending optional
gzip/old-tool work. Shared old550615, product, fixture/producer, general T/private
runner and immutable raw02 remain unchanged. Old raw02 eight-cut visualFAIL is not
reclassified by this control and is not a publication candidate.

Profile is exactly native-single-retention-v1 in config, manifest, runtime option,
initial and focused receipt, with an exact controlWindowProof and indexed approved
metadata02 SHA24358908cd3acc111ec684c7cb5aad5a982ee84ef7b6570a9ea5a4c7ae11887a.
Ordinary overrides retain single:true and the original seed704/text/fonts/stage/
circle/camera/native params. The three source lines start0/4.5/8, natural group
end/displayEnd9.5, slotEnd3.6/8/unset, retained0/1/2. All five raw native cuts are
kept in proof: the two known empty outro cuts3/4 remain9.5→10.75→12. Whole-line
source occurrence ranges, all clocks/params/effects and no inserted owner are
strictly guarded. No manual lifetime extension, parameter replanning or product
change is applied by this tool.

Capture window is half-open[.5,4.5),96frames24fps4s, keys3/15/36/90. Exactly one
actual owner0 spans the window, whose cells straddle native slotEnd3.6; display
continues naturally to9.5, five seconds beyond the window. Source cuts1/2 remain
retained but their later cross-owner overlap lies outside this control. UI starts
at2.0s, slider is .5+n/24, buttons .5/2.5/4/4.25 and runtime rejects end4.5 or any
out-of-window time. Live sequence has all four forward/reverse revisits without
adjacent duplicate-output race. UI labels candidate circle+foreground diagnostics,
uses 制約不足 / constraint insufficiency, preserves all three outcomes, and does
not infer circle-safe reasons from a hardcoded case name.

Focused classification independently recalculates actual primary support polygons
against the real foreground nonzero-alpha pixel AABB expanded to pixel-cell
exterior, using the exact producer SAT helper. It verifies every supplied summary
against raw geometry and requires both all cut circle certificates and every
sample's measured zero FG conflicts for safe. Before has no B support measurement
and remains explicitly unmeasured. Capture/native/live frames require single owner,
actual decoded witness consistency, circle observations and recomputed foreground
clearance for every requested frame. Tiled rain auxiliaries remain separately
identified. Before/after media and decoded clock/placement/rawRGBA stay unchanged.

Before/after raw pair comparison stays strict apart from the already reviewed
media-cut ownundefined placementSeed equivalence and its indexed witness. New
control serialized-initial versus fresh-initial guard has exactly five approved
JSON omissions: rawLifetime[2].slotEnd, rawAllEffects[3/4].group,
excludedNativeEffects[0/1].group. Saved absent and fresh ownundefined are required
for each, with all three/full-five native proofs checked first; zero/null/value,
other field/index, changed params and owner additions/removals reject. A distinct
schema/profile reports every omission with completeRawSchemaIdentity=false. Old
serialization schema and old[7] path do not pass the new guard.

All raw HTTP byte/hash/length/range, JA/EN controls, decoded seeks, complete playback
quality, native keys forward/reverse, mobile live checks and three owned browser
lifecycles are preserved. Four-second videos require >=92decoded/drop0/corrupt0/
ended4s and no failure marker. Original twelve-second input videos retain their
separate mid-play stable pause proof then decoded0→full12s >=284/drop0/corrupt0/
ended12s. Static source proof shows seven qualified probe/playback helpers exactly
unchanged and the same general T encoder/seek/proxy/TLS/origin/auth helper bytes.

Existing capture(config,dir), validateFiles(dir), validateBrowser(dir,{authorize,
baseURL,onProgress}) API remains. The shared draft's profile and metadataReceiptPath
fields are accepted. No gzip dependency is required. Bridge allows[.5,4.5) only
under the exact new profile, rejects unknown/null profiles and wrong paired clocks,
and keeps undefined-profile legacy[3,7) behavior byte-for-byte in output.

Fresh pure qualification: new synthetic7/7; approved actualfocused01 read-only
qualification8/8 (the same seven plus raw SHA-bound focused2be224b1…524acb); bridge
14/14 including committed golden output; legacy H03 unit17/17; private runner7/7;
tracked CLI2/2. h03-control-tool-offline01.json records commands/log hashes and all
source plus actual metadata/focused pre/end pins, unchanged. The actual guard
recomputes rain/bubbles safe and credits insufficient; independent FG conflict
arrays are0×8/0×8/[23,18,17,17,17,17,18,23]. Synthetic source/clock/owner/decoder/FG/
status/serialization/bridge/UI/portable-module negatives are included. Optional
--focused requires the approved raw receipt, never a substituted status fixture.

No actual Canvas render, capture, encode, ffmpeg, browser, network, Site or Pages
operation ran for this checkpoint. Parent's metadata/focused independent review
is external evidence, not new acquisition. Rawcapture→file→independent visual→
browser→private Sites→Pages publication/verification remain pending parent action.
