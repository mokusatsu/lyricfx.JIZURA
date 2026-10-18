# AVOID-003 親レビュー

## 公開前判定（2026-10-18 UTC）

- 実装担当: 指定どおり gpt-6.1-sol / reasoning effort medium。親は製品実装を代行せず、コード/試験/比較ツールをレビューして修正を担当へ返した。
- 対象: c930c0977e1247865dcd5e45c4e9eb064b89f0fe からの003差分。モデルSHA-256 `fcafeeae6affe51df2c9dbea1f09a440e36343976208069c24efcc3ec0ebea0d`、比較 `local-20261018-03`、manifest SHA-256 `ce885af40d40d99dcb1cc11537b6681ec4eb2824df96d31334695424caa34fce`。
- validator/resolver、plannerの最終duration、merge/replace/import/pack/saveの副作用順、LS不正データの保存/素材削除防止、生成日英HTML、試験のassertionと結果を確認した。途中指摘と担当の修正は[引継ぎ](../../reviews/AVOID-003-local-20261018-03.md)に記録。未解決のコード指摘なし。
- 親の独立した線形区間走査と製品binary indexの照合: 300 project×20領域、逆順入力・境界・乱数時刻・raw/plan一致・非破壊を35,916件、十進最短区間8件で確認。すべて一致。[機械記録](parent-model-check.json)の実装hashが最終候補と一致する。
- 担当の17 checks、実素材/フォント入り30 assertions、既存6試験、日英起動、fresh build一致をログと照合。既存試験の期待値を変更していない。
- 42ケース/168 PNGの条件・before固定commit・after実関数・原寸画像・独立canonical値を確認。比較validatorのclone配信修正後、無改変cloneが通り、8変異がそれぞれ意図した理由で拒否されている。
- 旧AVOID-002の成果物/validator/証拠に差分なし。無関係なpyc差分なし。`git diff --check` 成功。
- 既存 `project_file_test.cjs` は初期cut数 expected0/actual1 で失敗し、保存本体未到達。003の限定モデルroundtrip成功で置き換えずAVOID-013へ保持する。

判定: コードとローカル結果を承認し、公開検証へ進める。公開画像/manifest/日英HTMLと実起動の確認が済むまでは実環境検証待ち。人間の動作確認要否・最終完了は公開後に判定する。

実行中環境の最新観測は[publication-environment.json](publication-environment.json)。spec/observed revision=3、observations_current=true、unrestricted/enforced、connected。これは実行中インスタンスの観測であり、保存された環境設定の編集だけから反映を推測していない。継承proxy・CA・TLS検証を維持した通常HTTPSは[publication-https.log](publication-https.log)でHTTP200/verify0。実装時のrevision2観測は履歴として保持する。
