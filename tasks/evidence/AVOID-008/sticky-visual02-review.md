# AVOID-008 sticky-preview02 独立画像・動画再照合

**結果: PASS（提示された2条件の視覚照合範囲）。** preview01でFAILだったexit終盤の紙/文字cropは解消した。付箋全体と『先へ』がf93までstage内に残り、f94・f95はnativeで空。entry・hold・exitの付箋造形、可読性、一体の動きに新規退行を認めない。preview01のFAIL記録は変更せず保持する。

## 同一性と今回の実見範囲

ローカルbundle `work/avoid008-c-preview/sticky-preview02/`。manifest SHA256は指定の `eeef356179ca535454c663a9203a9dc00302270cee6a669535a98a7a0caa470d` と一致。index.htmlを含む全21assetsの実bytes数/SHA256がmanifest記載に一致した。beforeの2MP4・6native key PNG・2frameログは、preview01の対応ファイルと実bytes比較でも全て同一。このためbeforeの全192frames/6key画像については、自身のsticky-visual01既実見をcarryし、今回の再実見とは記録しない。hashのみでafterの視覚PASSにはしていない。

afterの2MP4を全frame原寸PNG decodeし、ffprobe count_framesでも各96frames、24fps、4秒を確認。今回新たに両after f0〜f95を全て実見、計192frames。各24framesを載せた8枚のcontact sheetで連続静止照合した（landscape各320×180、portrait各180×320）。リアルタイム動画再生ではない。

さらにafter native key PNG 6枚（両条件×f6,f36,f91）を原寸表示で実見。旧FAIL区間の両条件f90,f91,f92,f93をdecoded原寸単frameで必ず確認し、f94,f95も原寸で空を確認。上側に移動したportraitはentryの上端が近いためf1,f2も原寸追加確認し、全紙輪郭がstage内にあることを確認した。証拠は `scratch/avoid008-sticky-visual02/` の192 decoded PNGと8contact sheets。decodeファイルは1始まり連番で、`094.png`が0始まりf93。

条件は960×540と1080×1920、seed704、『風の先へ』、同一NotoCJK font、circle (.5,.5),r .2。after候補はlandscape .85/pitch1で左上、portrait .95/pitch1で上。位置/縮小の違い自体を退行とはしていない。

## 項目別観測

| 項目 | 判定 | 観測根拠 |
|---|---|---|
| 紙/折角/影/上部帯/字面の一体感 | PASS | 水色の紙、暗めの上部帯、右下の折角、右下への影、濃い字面を保持。全てが同じnoteの傾きと落下に従う。紙だけ静止、字だけ別移動、分裂はない。独立ピンはbeforeにも明瞭には見えず、欠落を主張しない。 |
| entry squash/順序/時期 | PASS（24fps観測） | f0空、f1暗い大きめの紙、f2明るい紙で文字なし、f3から全文字、f4〜6で落ち着く。before既実見と同じ順序・時期。portrait f1/f2は上端が近いが切れていない。 |
| holdの可読性と全stage配置 | PASS | landscapeはbeforeより小さく左上寄りだが、4文字を判読できる。portraitは上寄り。両方 `風の` / `先へ` の同じ2行を保ち、文字重なり・欠落なし。f6,f36原寸で字と紙の全体を確認。 |
| exitのpeel/回転/fall/fade | PASS（24fps観測） | f89付近から傾きと下向き移動が増え、f90〜93でnote全体が反時計回りに傾いて下へ移動。f93は明らかに暗まるが全文字を読め、f94/f95は空。beforeの時期と一致。折角が回転/fade中に平らに近づく見え方も、元のexitと同じ連動に見える。 |
| portrait旧FAILの解消 | PASS | f90(3.750秒)、f91(3.7917秒)、f92(3.8333秒)、f93(3.875秒)を原寸確認。明るいf92でも『先』下部を含め全文字が残る。f93でも『先へ』全体、紙の底辺/側辺がstage内にあり、画面下端での途中切断はない。 |
| landscape旧FAILの解消 | PASS | 同じf90〜93原寸で紙の右辺/右下折角/字面がstage内。f93も右辺と下辺が完結し、stage端での切断はない。 |
| 意図しないcrop・重なり・分裂・欠落 | PASS | 全192frames contact sheetと上記原寸追加確認の範囲で認めない。旧01のportrait可読性欠損・landscape紙cropを再現しない。 |

今回確認した範囲に未解決の重大な視覚退行はない。これはこの2素材の視覚PASSであり、他条件を含むC33全体の受入判定ではない。

circle guideは画像にないため、円境界の数値判定は**未確認・対象外**。厳密なalpha値/サブフレーム時期は未計測。付箋1枚・4文字・seed704のみであり、複数付箋の順番や別文字列/seed/半径は未試験。source実装レビューは担当外。公開アクセス/公開結果確認は利用者指示により対象外で、今回一切行っていない。

全decode・probe・画像作成は終了し、常駐media処理は残していない。product/test/docsおよび旧01証拠は変更していない。
