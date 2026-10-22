# AVOID-007 equalizer 修正版02の動作確認

[変更前後のMP4](https://jizura-all-motion-20261021.mokusatsu.chatgpt.site/review/AVOID-007/equalizer-row-20261022-02/) ／ [English](https://jizura-all-motion-20261021.mokusatsu.chatgpt.site/review/AVOID-007/equalizer-row-20261022-02/en.html)

今回の確認対象はequalizerだけ。**一列の帯が共通の基準線から上下する、レベルメーターらしい見え方になっているか**を確認する。文字・棒・細い棒・ピーク表示が同じ帯に追従し、文字が読めることも見る。利用者の回答はまだ未受領。コードレビューは依頼しない。

変更前はe96の元の全画面演出。変更後は元の行数・文字サイズ・棒の高さを維持し、横間隔を詰めて全体を右側へ移動する。両方とも同じ1920×1080・4秒/24fps・歌詞/seed/8字体。初案01は棒が浅い箱に見えたため不採用で、このリンクは改善した02を指す。

実装はgpt-6.1-sol / medium、親がコードとテスト結果をレビューした。数値03の21負例・9 OFF一致・48信号照合、親の独立1096polygon/168glyph-pair照合、日英ローカル起動が成功。親は画像を開かず、コンテキストを遮断したsolが新after全96framesと4原寸PNGを実見し、元beforeは自身の既実見と同bytes接続した。判定はこのfixtureのmeter意図・可読性・画面内保持のPASS。円ガイドは動画に含まれないため、見えない円の境界を人間の視覚確認項目にはしない。

build `equalizer-row-20261022-02`、manifest SHA-256 `88c6fa4f9f92d49edf404f4b34ee950494237e843706c810093b117608bbf30a`、Sites source `27ad485977c28b4c62e2cc82833952bc6d8ff301`。公開操作は成功の戻り値を保存済み。公開後の結果確認は利用者指示により恒久停止しており、未実施を成功とは記録しない。

新しく指摘された演出意図の最終判断が必要なため、この項目だけ人間の動作確認へ返す。回答までは007未完了/008以降未着手。旧01視覚FAIL、旧H03 cross-owner/media FAILとbubble背景contrast FAIL、保存013の既知初期cut数不一致は保持する。

証拠: [親の数値照合](../evidence/AVOID-007/parent-equalizer-row03-geometry.json)、[素材の照合](../evidence/AVOID-007/parent-equalizer-native02-review.json)、[独立視覚レビュー](../evidence/AVOID-007/equalizer-row-visual02-review.md)、[公開操作の戻り値](../evidence/AVOID-007/equalizer-sites-publication02.json)。
