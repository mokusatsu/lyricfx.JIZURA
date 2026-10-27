# カスタム診断paramsの入力分離

基準HEAD `4c198240965cc69529558269f2d6fe1af65098a1`、branch `resume-local-20261027`。AVOID-009のcustom component契約・手動座標保持の継続。実装gpt-6.1-sol / medium、親がソース・呼出元・試験結果をレビューした。新差分はローカルのみで外部反映未承認。

## 問題と変更

`customDrawingCapability`が返すprogram.paramsは浅いmergeだけだったため、有効なネストしたJSON object/arrayを元のdefinition/cut/decor/eventと共有していた。親の再現ではreport側nested.xを変更すると元の0.2が0.9へ変わった。公開診断APIの所有権の問題であり、通常finalizerは入力を複製・結果をfreezeするため、実描画の破損が起きたという証拠ではない。

merged paramsのネストしたportable JSON値だけを複製する。値・override優先順・top-level undefined/-0を保持し、描画、手動座標、unsupported診断、adapter登録、cache schemaは変えない。循環参照や非JSON値への一般clone対応は導入しない。既存customEffectSpecの入力契約を前提とする。

## 親レビューと検証

- 新Node VM回帰: **11ケースPASS**。有効program groupのlayout/bg/trans/decor/fx、cut/owned/global event、default/override、双方向変更の隔離、fresh report、JSON roundtrip、frozen入力、absent/undefinedを検査。
- 同じ試験を変更前HEADのmoduleで親再実行: exit1、`layout: input/report nested ownership`で失敗。修正が元の不具合を検出することを確認。
- 既存custom boundary: **13ケース／34 inventory PASS**。新rawは`/tmp/jizura-custom-parent-hlgs4oq0/boundary.json`。過去のCanvas証拠を今回の結果には流用していない。
- `PYTHONDONTWRITEBYTECODE=1 python build.py`成功。日英HTMLをそれぞれ旧moduleへ逆置換すると基準HEADのHTMLと全byte一致。変更は対象moduleのみ。
- `git diff --check`成功。最終ソースの親指摘なし。

呼出元は`09a_placement.js`のfinalizerとglobal-event wrapper。既存cache依存収集はplacement関数identityを含む。歴史的source SHA pinは更新・緩和せず、旧証拠は旧版だけの証拠として保持する。

## 残る候補と阻害

| 次の項目 | 現在の阻害／必要条件 |
|---|---|
| 009の6固定候補の登録・見た目変更 | 人間承認未回答。今回の内部修正で承認を代行しない。 |
| 009の残りD/custom完全区間adapter・実描画証明 | 新候補展開禁止、実Canvas起動不可。customをunsupportedのまま保持。 |
| 009の正式性能 | 既存layouts-d-perf.cjsはブラウザー・実描画を要する。Node合成で代用して合格にしない。 |
| Canvas例外復旧 | 実Canvas起動がsandboxエラー。大幅な共有基盤修正は別途承認待ち。 |
| 010/011 | 一覧の技術依存だけで現行の6候補固定・後続ゲートを解除しない。新演出展開には現行範囲の変更が必要。 |
| 019/018/012 | 009/010/011等が未完。依存を飛ばさない。 |
| 013保存・Undo等／014〜017 | 012以降の依存未完。既知のcut0期待不一致も013の引継ぎとして保持。 |
| レビュー媒体・旧188件 | 実体未取得。新生成・保全済みと扱わない。 |

今回の内部API修正は動作確認の新候補ではなく、人間のコードレビューは不要。実Canvas、全D/custom、正式性能、6候補の人間承認、009全体は未完。公開確認・設定回避・媒体生成・pushは0。調べた現行TODOの残りは上記の実環境／承認／依存条件が必要なため、無関係な新仕事を作らず保留する。
