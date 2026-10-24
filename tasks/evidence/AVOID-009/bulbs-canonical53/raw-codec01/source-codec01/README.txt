AVOID-009 SOURCE53 lossless cross-run evidence codec01 — SOURCE ONLY

This replaces planned capacity11 execution, NOT product53 implementation. Frozen
work/avoid009-capacity-writing11 remains untouched, no11VERIFY/RELEASE/PREPARE done.
Actual53 and sixAFTER were pending when preparation began; parent has now accepted
full53raw+sixAFTER postpins without findings. Final revised source review/gate still
required before any actualcodec/restore. No execution inferred from that raw gate. Syntax/parser checks are NOT storage roundtrip
execution/acceptance. No app/browser/images/network/public/Git/index/canonical changes.
Existing task evidence-driven skill/reviewpolicy apply. Source53DIRTY/60absents/PYC7/
full51raw/source/inputarchive/14PNGabsence/uploads/unrelated remain untouched.

Goal: preserve EXACT ALL NEW53 JSON/gzip/metadata bytes, with retained51 fullvalues
as immutable base. Package is explicitly NON-STANDALONE. Must permanently retain
accepted51archive, storage51/manifest51/gzip-reproduction51, pinned Node24 executable
and all4 Node codec sources + Python basebuilder + base51-pins/source-seal. No raw original deleted by codec.
Estimated <2MB is a hypothesis only. Explicit storage ceilings: each decodedrecord
<=8MiB, each serialized encodedentry <=8MiB; incremental perentry serialized-byte
accounting plus header <=16MiB totalpayloadJSON; finalcompressedpackage <=2MiB.
Restore/verify/basebuilder enforce2MiBpackage+16MiBboundedgzipdecode too. Accounted
record+metadata entries are checked BEFORE aggregateJSONstringify. Literal-heavy
input that cannot fit fails BEFOREoutput creation; keepalloriginals, neverdropfields.
Caps bound this codec's stored representation, NOT measured JS heap/performance
acceptance or productserialization budget. Measure actual package size after run;
no ratio/acceptance claim in this SOURCE preparation.
Do not force reuse/omit data to meet size. If fallback/qualification cannot match
exactbytes, STOP report; preserve originals/failures, do not release capacity11.

Immutable accepted51 base (PUSHEDafa3d3b5704f8445eb593f43abcdf76a0b7401e8):
archive tasks/evidence/AVOID-009/bulbs-transport51/bulbs51.raw01.lossless.tar.xz
12237408B SHA256 d00ffa5213e9c63028dc7490fcf82d7906ad09179d47fcfe2b0f2b2488fa02ad
Git blob05a70daba492d28a1a499fefb0036071fa59b585; fullbytes==pinnedHEADblob verified.
storage51.json SHA25683fa041cdb564a78e73f06dc0eaf3e6fafb1120b924dd59633892972442e5903
manifest51.json SHA2563fedbc209e26cac78e12be16d2b87840b7e98dc77697dfe806c7fbcbba1b767e
gzip-reproduction51.json SHA2563b66a9798da1414899afa63e33b0ca5fe6a89b604f622d676e5308a005260db4
Each ROOT file fullbytes==afa Gitblob verified; base51-pins records size/blob/SHA.
570base records,755archive members, maxbase recordJSON5180897B. Runtime Nodev24.19.0
executableSHA256bc17c508ffeed0ec622934f9b7fa72f8e78da65350e63c3eceb56fa688aa5e12.
No huge51data duplicated into new53package. Parent uses EXISTING actual53/reference51
one-pass verified derived extraction; codec rehashes all755existing member bytes,
exactmember set+receipt, storedmanifest==canonicalmanifest, full ROOTbasefiles==Git.
Raw53/reference51 is derived acceptedinput, not new observations. Exact original
reference51/reference53.json receipt retained literal with full provenance/seals.
No fresh extraction, historical app retest or alternative keeper namespace here.

Encoding:
Encoder reads exact53manifest literal bytes; requires complete/noerrors/nopartial/
noinFlight/postpinsunchanged and completed==expected, explicit parent's after6 gate.
Walks ALLnew files+directories except sole deriveddirectory reference51. Everynew
metadata byte, manifest and alltop-level row fields except pair stored literally.
For each record, every original fragment gzip bytes/hash and decodedbytes/hash
checked, concatfullrecord JSONbytes/SHA checked, original1MiB byte boundaries checked.
Each originalgzip must exactly equal Node24 gzipSync(decoded,{level:9,mtime:0}).
All new .reference.id/JSONSHA256/JSONBytes verified against FULL51row reassembly;
each basefragment fullbytes/hash and fullrow JSONSHA/size validated, then parsed.
Store .pair as base51 fullpairref + exhaustive ordered delta tree:
 same => full existing basevalue, never hash-only observations;
 literal => complete exact target JSONvalue (type changes/new keys included);
 array => targetlength and every targetitem patch in order (truncation explicit);
 object => FULL targetkey-order list and every targetkey patch (omitted basekeys
 deleted, all newkeys complete literals; integerkey JS order verified at decode).
TopLevelOrder + every other top-level field retained, no rewritten expectations,
renamed fields, removed actualdifferences, locale/URL normalization or rounding.
Most tuple/whole pair exactbase reuse is anticipated, not assumed. ENstyle.name/
desc/fontAudit origins captured as exact real string deltas; every other changed
value/key/order also preserved. Encoder trials patch and requires JSON.stringify
fullreconstructed53 object EXACT originalraw bytes. Any canonical/delta/reference
inability falls back to COMPLETE decodedJSON bytes (base64) with retainedreason.
No failure/difference hidden. Every representation still checked by fullraw SHA.

Pure storage51 large/small files may reference51 only if regenerated original51gzip
FULLbytes exactly equal original53gzip; otherwise store literaldecodedgzipbytes.
Every other .gz literaldecodedbytes must regenerate exact originalgzip; unsupported
nonstandardgzip raises failure, no false qualification. Every other file literal
originalbytes, not summaries/hashes. Parent must preserve any oversized fallback.
Package is gzipJSON containing fullmetadata/rows/deltas/literals/fullinventory,
exact derivedreference extractionreceipt and requiredsource/base seals.

Independent restore:
Separate restore53.cjs does NOT import encoder/patch/trial or app code. Its own
ordered tree decoder reassembles full53 JSON from full51values+exhaustivedeltas or
literalwholeJSON; verifies fullrowbytes/SHA, regenerates exact1MiB fragments and
everygzip/hash using pinnedNode. Reconstructs allothermetadata/storagefiles and
allnonderiveddirectory paths. Verifies EVERY output byte/hash against package's
fulloriginalinventory before exclusive writes into NEW officialSHMdirectory.
Restores exactreference53receipt only under reference51 (does not duplicate755
acceptedinputmembers). Manifest storedpathstrings stay EXACT oldmetadata, not
rewritten to newdir. This is byte restoration, not new runtime observations.

Independent final verify-directory53.cjs does NOT import encoder/decoder. It compares
fulloriginal53/restored file+directory inventory (only reference51 excluded), then
DIRECT FULL FILE BYTE EQUALITY for EVERY newfile, EVERY gzip decodedbyte equality,
EVERY originalgzip == pinnedNode24gzip9/mtime0 exactbytes, EVERY fullrecord JSONconcat
==restoredconcat; canonicalJSONStringify must equal originalrawbytes for delta-tagged
records. LiteralwholeJSON fallback qualifies by exactraw+gzipbytes, with its actual
canonicalJSONStringifyOriginalExact boolean retained (may befalse, no normalization). Exactliteralmanifest
and source/refreceipt compare too. Allvalues/clocks/points/ordinals/keyorders remain.
A noncanonicalJSON literalfallback is accepted only through fullbyte restoration;
report retains canonical=false and literalrepresentation instead of inventing canonical
equivalence. A noncanonical delta remains a failure. Directory/reference originals notdeleted.
No successful claims from encoder alone; require full restore + finalverifier receipt.
No writes into source/base directories, no cleanup, no overwrites. Partial newoutput
is retained on errors; fresh newout names/fresh review before retry, no blindreruns.
Writes only newofficialSHM outputs/reports after fullinputvalidation, filefsync/wx.

Parent fullsource review plan:
Read base51-pins and common53.cjs fully: SHA/wholeGitblob/Node exactpins, all755base
members/receipt, fullrow reassembly, noapp imports, officialnewSHMpath/readonlyGit.
Read encode53 entirely: paironly delta/topLevelOrder/otherfieldliteral/fallback,
allpart originalbytes/bounds/gzip selfcheck, storage fullbyte-only reuse, fullmetadata.
Read restore53 entirely independently: ownordered decoder/fullraw+gzip seals,
allfile/directory inventory, noencoder import, NEWout only, nooriginal deletion.
Read verify-directory53 fully: directeveryfilebyte/everygzip/everyrecord/manifest/
receipt compare, canonical stringify qualification, reports outside compared dirs.
Read rebuild-base51.py fully: pinned51wholearchive/Gitblob and all755member byte
checks, exact oldreference53receipt seeded into NEWbase only, separate derivedreport.
Read static audit/source-seal and independently hash ALLsources/basepins. Parent
must review source53raw+AFTER6postpins first; hashes/parser-only checks aren't runtime.

Parent-only commands (NOTexecuted; replace actualpaths/seals, never inventednamespace):
Use /opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node in official
keeper8802 namespace /dev/shm/avoid009-evening-20261024. Source-dir below denotes
/workspace/lyricfx.JIZURA/work/avoid009-bulbs53-raw-codec01. Serialize RUN_DONE.

node SOURCE_DIR/encode53.cjs --raw53 EXACT_ORIGINAL53_SHM_DIR \
 --base51 EXACT_ORIGINAL53_SHM_DIR/reference51 --out NEW_CODEC_SHM_DIR \
 --base-pins-sha256 EXACT_BASE51_PINS_SHA256 --manifest53-sha256 EXACT_ORIGINAL53_MANIFEST_SHA256 \
 --parent53-and-after6-reviewed PARENT_ACCEPTED_RAW53_AND_AFTER6_POSTPINS

Read encode-report and exactpayload SHA/size; inspect fallback reasons/delta counts,
not just anticipatedreuseratio. No claim restorecomplete yet.

node SOURCE_DIR/restore53.cjs --package NEW_CODEC_SHM_DIR/payload53.json.gz \
 --package-sha256 EXACT_PACKAGE_SHA256 --base51 EXACT_ORIGINAL53_SHM_DIR/reference51 \
 --out DIFFERENT_NEW_RESTORED53_SHM_DIR --base-pins-sha256 EXACT_BASE51_PINS_SHA256

node SOURCE_DIR/verify-directory53.cjs --original53 EXACT_ORIGINAL53_SHM_DIR \
 --restored53 DIFFERENT_NEW_RESTORED53_SHM_DIR --package NEW_CODEC_SHM_DIR/payload53.json.gz \
 --package-sha256 EXACT_PACKAGE_SHA256 --report NEW_OUTSIDE_DIR_VERIFICATION_SHM_FILE

Only after parent's FULLreceipt/rawreview+independent checks may parent copy exact
smallpayload/reports/codecsource/seals durably to ROOT and commit via correctcurrent
index procedure. Codec itself never writes ROOT/canonical or Git. Report original
51archive immutabledependency and Nodecodec requirement plainly. No 11release yet.
Future reproduction after keeperloss:
python -B SOURCE_DIR/rebuild-base51.py --package EXACT_SAVED_PACKAGE_SHM_FILE \
 --package-sha256 EXACT_PACKAGE_SHA256 --base-pins-sha256 EXACT_BASE51_PINS_SHA256 \
 --out NEW_REBUILT_BASE51_SHM_DIR --report NEW_SEPARATE_BASE_REBUILD_REPORT_SHM_FILE

Builder verifies package/source/basepins/ROOTretained51fullarchive+Gitblob and all755
TAR members, decodes51 ONCE into NEWofficialSHM base (neveroverwrite old/original),
then seeds EXACT originalreference53receipt literal from package into base/reference53.json.
A new timestamp belongs only to separate newderived-input report; oldreceipt is not
regenerated or rewritten. Entirebase fileinventory is755members+that exactreceipt.
Then restore53 with --base51 NEW_REBUILT_BASE51_SHM_DIR and a differentNEWout. It
independently verifies everybase member/pinned51metadata and preserves old53receipt.
Node24 retainedcodec required; noapp execution/newobservations. If original53dir is
lost, this reconstructs bytes against previouslyqualified package inventory/hashes;
do not claim a fresh directcomparison to unavailable originals. Preserve the prior
full-directory byte-verification receipt durably alongside package.

Currentencoder consumes existing actual53reference51, no second370MBcopy toROOT.
Package is explicitly NON-STANDALONE, immutable51base retained. Never infer decoded
inputreferences as new53observations. Existingfrozen11 untouched and unexecuted.
Pre-parent draft allsources/seal e1d805... and parentfindings retained unmodified in
pre-parent-findings01. Revised source fullreview pending; actualcodec/restore/builder0.
