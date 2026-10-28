# D adapter の runtime admission と cache

2026-10-28。実装担当 gpt-6.1-sol / medium、親が source・試験・raw を照合。09k の private adapter registry は任意の `runtimeAdmission` を保持し、その identity を09gの cache 依存に含める。callback がない既存 adapter は従来の4要素の依存行を維持する。新しい admission helper は差し替え不可で、callback の false / 例外 / Promise は受入としない。

09a の prior-finalized shortcut と、09g の completed payload decode / repair 後の両方で、返却・edge 登録・LRU / hit 更新より前に admission を確認する。拒否は `admissionRejects` と miss に数え、既存の dependency drift / bypass と分ける。通常 finalize は引き続き実 `J.plan` lineage と `originalCuts` 復元を使う。callback 自体に compile / paint や証明再発行を任せる契約ではない。

これは製品側の共通 cache 接続部分であり、bulbs80 の callback / certificate、最終 plan への所有権結合、frame 登録は未実装。実電球での退去後拒否や通常 finalize からの復帰を、試験用 adapter の結果から合格としない。大規模な共有 Canvas 例外復旧は変更していない。

## 検証

- 実09k source と09a entry / originalCuts 復元および09g read / collector / clear の source fragment を使う80項目の pure mock checks PASS。helper の差し替え拒否、4 / 5要素互換、callback false / throw / Promise、decoded alias miss、counter・lineage を検査。実 codec / Canvas の代用ではない。
- 既定の `build.py` で日英 HTML を生成し、再実行時も両 SHA256 不変。`node dev/lyric_test.js` PASS。
- Qt 6.11.2 / Chromium 140、固定8字体、実 J.plan / finalize / completed codec / cache で検証。JA と EN page / plan それぞれについて、既存 stickyNotes、balloons、fisheye の cold / prior / decoded、JSON・alias / descriptor graph と各3組の全 RGBA SHA256 が一致。2言語で計18 frame pairs。stickyNotes と balloons は既存 certified-hold、fisheye は certified-bounded の事前条件を満たした。EN page / plan の歌詞は日本語「風の先へ」であり、英語歌詞の新資格ではない。
- 試験専用 wall adapter は常に `insufficient-space` を返し、描画せず cache / lineage のみ検査。owned prior、decoded alias miss、false / throw、resident 消失、foreign serialized input 拒否、別 callback の追加による cache 依存変化を確認。実 bulbs の geometry / safety と混同しない。

最初の試験は、試験専用の2件目の登録先 `origami` が既に登録されており失敗した。登録は拒否され、結果と raw は保持した。未登録を確認した `shadowPlay` へ test-only 登録先だけを変更し、日本語の未完ケースのみ検証した。

その後、EN の既存プランが `STALE_PLACEMENT_PLAN` で失効した。非描画診断では EN plan / revision が有効な後、同一 UI の JA plan は変わらないまま共有言語が JA に戻り revision が変化した。同種の失効は80s未適用 HEADでも再現し、font loading events は観測されなかった。呼出元の直接 trace は未実施。テストでは既存 UI warm / fonts の安定を待ってから新規 `J.plan` し、以後の revision 不変と通常の frame 検証を維持した。これは UI の競合修正・性能受入ではない。前の失敗2件と両診断を保持している。

親は各結果の pins と raw の bytes / SHA256 を照合し、結果を独立確認した。生データは Git 外の `/workspace/jizura-logic-evidence-20261027/cache-product80s-actual01`、`cache-product80s-recovery02-actual01`、`cache-product80s-recovery03-actual01` と両 `cache-language-*80s-actual01`。画像・動画や公開 URL は確認せず、Git に media / raw を含めない。
