# 承認済み6候補の一般化 — 2026-10-27

担当 gpt-6.1-sol / medium。承認の正本は[台帳](AVOID-009-review-ledger-20261027.md)。親の電球設計・source段階レビュー受入後、限定数値検証中。全6の統合と009全体は未完。

電球はG.recipesForで入力のコードポイントと書記素が1対1の1〜16文字から有限候補を生成する。空白・明示改行・結合記号・制御文字・複雑な書記素は理由付きunsupported。元の明示行組や空白を消して採用しない。native、横1行compact、連続読順2行、同.95の最大4候補を評価する。1文字には2行候補を作らない。G.recipesの旧固定リストは既存試験互換のために保持し、製品acquire/selectionは動的familyだけを使う。

scopeは960×540/60fps・単一4秒cutと全tail region・stock Dela board/chase・push・切替入退場・既定FX/noPost/fastに限定。JA/ENとuint32 seed、円位置/半径を可変にする。native catalogの実字号・副題・glyph列/索引を基準に、すべての塗り/輪郭kindの重複を含む文字順を検査する。行間は全kindの支持unionを比較する。元の副題と字号を固定No.01/129.6に置き換えない。明示lyricSize・追加FX・複数cut/regionは今回もtyped unsupported。

元全時計、4recipe×最大8移動先、全所有支持、1fontpx/2devicepx条件付き包絡、円余白2.7、論理灯間hard3/preferred4.86、8MiB proof/2entry cache、描画前issued-frame preflightを維持する。有限候補の不成立はinsufficient-spaceであり一般的不可能性ではない。共有描画例外復旧は変更しない。

新pure111チェックは全文/重複/1字/長文/英字・拒否入力・実binding・動的副題・kind欠落/文字順・輪郭だけの行間違反を検査しPASS。既存Node source68/69/70/71の74チェックもPASS。純粋試験をCanvas合格とは扱わない。

実Canvas証拠はrepo外 `/workspace/jizura-logic-evidence-20261027/bulbs-actual-source/` と個別runへ保存する。元tracked HTMLに対し対象4srcの旧全文各1箇所を新全文へ置換したcandidateと比較。全250 clock.firstTimeのnativeRGBA、全727選択pass×全recipeの詳細観測、採用時の全250product/独立native-closure oracleRGBAを評価する。時刻はfinite Number時計のfirstTime代表であり、過去媒体j/60とは区別する。画像/動画生成・閲覧・公開結果確認0。

後続は看板72、domino、burst、contour、crosswordの順に、各専用source seam・全所有物・native文字/時計不変・入力ごとの有限候補・未成立境界を統合する。隔離固定試作のregistry単純登録で全入力を適格にしない。

## 2026-10-27 fixed-upper 数値受入と実用性の不合格

`bulbs-fixed-upper-actual01` はproducer exit0/complete=true/errors0。親の `bulbs-final-parent-review01.json` は4,643詳細record（2,058,535,768 JSON bytes）を照合し、144,200 positive支持のexact Fraction再計算、62,720灯間pair、全4recipe・採用destination727 pass、native前後250 pair、product／独立native-closure oracle250 pairの一致を限定受入した。入力は風の先へ/seed1205/960×540/60fps/上側円(.5,.2,.2)と既定FX/noPost、時刻はclock.firstTime。全品質項目を親が独立再計算した主張ではなく、別文字列・別seed・別円・EN基底・fullPostFXの受入ではない。

採用はone-row-compact／bottom／delta [0,94.40105101731217]。既存全4recipe検証を減らさずに記録した新runtimeの結果であり、過去動画や旧runtimeの検証を流用していない。

診断無効の `bulbs-performance-actual01` はexit0/complete=true/errors0。cold acquire **1,021,578.7ms（約17分1.6秒）**、上位cache hit92ms、上位のみclear後proof-cache hit99.5ms、代表frameのpreflight＋描画はn0=341.6ms、n14=1038.8ms、n90=1256.6ms、n231=1087.3ms、n249=5.6ms。これは通常操作へ使える性能ではなく、実用性は不合格。raw保存IOを含む前runと混同せず、この値だけでも設計見直しが必要。正式性能は未受入のまま。

元のimmutable HEAD245232 baselineの既存5ブラウザー試験は、別担当が原試験を改変せずJA/ENの計10 fresh Qt processで全exit0とした。132pin不変・cleanupErrors0・9333解放を確認した環境基準であり、新しい一般化ロジックの回帰合格ではない。既存pure等を含む基本回帰と新ロジック受入を分ける。

今後はruntimeでの全frame raw描画／全geometry再証明を廃止する設計を優先する。native純幾何descriptor、安い量子化scalar clock compile、全到達CSS字号の実TextMetrics、全所有物の入力由来包絡、円非依存geometry cacheとplan/circle certificate cacheを分ける。未知時刻の間引き、保存atlasをruntimeの解にすること、固定seed候補への逆戻りは行わない。確実な包絡を作れない入力はtyped unsupportedとする。全6のsource-only overlayは保持し、現source4pinは変更していない。

暫定実用目標はfonts準備済みsupported single cutで初回操作<=1秒、円だけの変更<=100ms、通常frame追加p95<=3ms（nativeを同条件で併測）。既存正式性能基準を変更するものではない。現状src/12_ui.jsの通常呼出しはJ.planであり、layoutsD:trueによるfinalizeは検証harnessの明示API。API latencyをUI E2E合格とは呼ばず、通常UI接続／診断表示／出力接続の009・017依存を分けて扱う。

新source-onlyの看板76／domino75／burst77／contour78／crossword79は、固定入力分岐を入力由来の有限候補へ替える準備。source／一部pureのみでCanvas・実用性能は未受入。新runtime設計の成立確認より先に本体へ登録・公開せず、同じ6動画の再承認も求めない。
