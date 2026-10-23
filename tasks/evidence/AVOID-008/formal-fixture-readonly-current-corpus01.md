# AVOID-008 formal fixture read-only findings

結論: 旧formalの不一致は旧fixture e01ffdc6で発生した歴史的FAIL。現在fixture 7650c0e2 + corpus 4add5fb9には、該当保存値へ戻す最小正規化が既に実装されている。現版正式1000で再現したとは言えず、現在の未解決ブロッカーとして引き継がない。コード変更・追加pins・測定・browser・公開結果確認は未実施。

## 失敗runとiterationの厳密な区別

正本prefix: `/workspace/lyricfx.JIZURA/tasks/evidence/AVOID-008/performance/`。
- `final-c34-cache128-formal01/results.json` SHA256 `34ec11ec1fbcc04193c47f6244b37f61ebfc36c70cfac1dc4b94fc4948288f9c`。2026-10-22T20:49:07.784Z–20:49:32.031Z、--formal、baseline commit `2bb3f864b5d40361961d8ad2aabeec24bfb5d1cb`、n=1000/on=true/side=baseline。旧fixture `dev/avoidance/layouts-c-perf-fixture.js` SHA256 `e01ffdc6f44a11a86653c58ee1cbdc78a1bfeea83e9014c8058bb082211ba0d2`。iterations0–8は実行済みでlastProgress=8。その後fixture.js:37の全iteration一致mustが失敗。旧formal rawには個別hash/bytesが戻っておらず、「旧formalでiteration6が最初」と直接断定できない。
- 既存の別診断 `formal128-baseline1000-input-diagnostic01/results.json` SHA256 `b8db759a83599db79ddce533222c4aa0a06d232af0bbf5140901c6dfb94c8652` は同じbaseline/n/on/sideで9回を保存。iteration0–5 raw SHA256=`943704c839404b181763398b47d5e08c3356a2ad3d6a6b50238e138fad635eaa`、iteration6–8=`6c3d6fbf8e4f1f33a9fe781b45ecfe33e3f5f41832effaf18f358ac9411b51f7`。全9回のpre/postHashJSON bytes一致。iteration6はこの既存診断で最初に観測された変化。

## 実際の差と原因の確度

`formal128-baseline1000-input-diagnostic01/exact-input-diff-v2.json` SHA256 `017665a8a5efb7e9e878e71b19b49b732e8464ec0cd7f639e17ff077a25e83d1`。保存normalized-0とnormalized-6を読んで確認:
- `$.cuts[25].params.cats`: [願望,健康,失物,待人] → [願望,失物,待人,旅行]。
- `$.cuts[59].stagger`: 0.05723495483282022 → 0.05596318808267824。
- `$.cuts[59].treatP`: {k:0.04515427183476277} → {rev:true}。missingとnullは別。
- `$.cuts[133].stagger`: 0.027160235925111922 → 0.03850558422738686（後続nameTagにも波及）。
- 総leaf差204 = cats87/stagger67/treatP50。field単位117 = cats29/stagger67/treatP21。

保存`baseline2bb-index.html.gz`（raw SHA256 `ad7257a257ff7bfc43c07fe06bc83490d3cdf8b7fcf716019eb9b3e70e67ce57`）に `cats: KUJI_CAT.slice().sort(() => rng() - 0.5).slice(0, 4)` が存在。乱数を使う不整合比較と後続stagger/treatPへの同RNG消費波及というソース上の説明は強い。正確なcomparator呼出回数/JIT切替は計測していないため未確定。親の既存`parent-baseline1000-input-diagnostic01-review.json`もこの限界を明記。

## 現在のfixtureは既に対処済み

`/workspace/avoid008-final-c34/dev/avoidance/layouts-c-perf-shadow-native-fixture.js` SHA256 `7650c0e2015ef6393334c7d05e121b5ee3de7202790e4f41bbfe01b76445a471` と `layouts-c-perf-normalized-corpus.json` SHA256 `4add5fb9e1e7616b02a45aa6b72c3eb76f1acbbfe42a09e42ec3976dde204afc` を静的確認。

normalizeの末尾でpinKnownSourceFields(plan,n)を呼び、元native plan生成後、既知117fieldだけを保存corpusの同値へ戻す。cats/treatPは既存container identityを保持、既知own keysのみ除去してmissingを復元。hashチェックは緩和せず、未知変化は失敗する。

保存iteration6 JSONのメモリ上コピーへ既存corpusの117pinsを適用する読取解析のみ実施し、iteration0のparsed JSONとの完全一致を確認。保存iteration0は実1000cuts/1000regions/34layout IDs。これは既知差に対する静的・保存入力の裏付けであり、現browserでの正式実行結果ではない。

期待hashは現fixture/corpusとも100 ON=`f6eef273216bb998c7dc1174901381e54ff833a0cf2d2ed75e34c32ab4a82792`、100 OFF=`11d008d2ca8b392f64da31c89706342ab989d1f05788ecfdd29dd64533b420c4`、1000 ON=`943704c839404b181763398b47d5e08c3356a2ad3d6a6b50238e138fad635eaa`、1000 OFF=`d103dcc821f66e8a697912cd7a22d469ea05bc8f2565cb8ef67d8c2a5d0dc9e4`。1000 OFFはcorpus上enabled=falseだけから導出、未実行/未qualifiedという制限が明記されている。

提案: 新たなfixture修正は現時点で不要。親の性能修正完了・正式実行承認後、現765/4addを固定し100/1000×ON/OFF×baseline/candidate、3warmups+6samples、80render/16warm、実cut/region/34ID、実record/replay/observation、元2x/+3msを維持して正式検証する。その際未知hash差が出ればFAILとrawを保持し、期待hashやpinsを推測で追加しない。旧formal FAILと現1000未実行は別に記録する。
