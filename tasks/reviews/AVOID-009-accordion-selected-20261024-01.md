# AVOID-009 蛇腹の代表2例

- 状態: コード・raw・ローカルMP4・独立静止コマ照合済み。Sites公開操作はsucceededを返した。公開結果確認は行わず、人間の動作確認は未回答のまま約8時間後の集約へ保存。
- 製品commit: `80f046d`（workへpush成功）。
- 比較URL: https://jizura-all-motion-20261021.mokusatsu.chatgpt.site/review/AVOID-009/accordion-selected-20261024-01/
- [親source/rawレビュー](../evidence/AVOID-009/parent-accordion-final04-review.json) ／ [親メディアレビュー](../evidence/AVOID-009/accordion-media04/parent-local-review01.json)。公開結果確認は永久停止指示に従い行わない。

横・縦の2例とも、文字サイズ106.92pxと元の折り方・出現順/時計を保ち、連続する帯を自然な境界で2本へ分けた。パネルは縦横比1.2を保持し、横は元の85%、縦は90%の物理寸法にした。

集約確認時は「最初から同時再生」で次を見る。

- 横: 右側の2段の帯でも、蛇腹としてつながって折れる印象と読みやすさが残るか。
- 縦: 4つの表紙を含む2列が自然か。現在は左列「風・の」から右列「先・へ」へ続く。日本語縦書きの右列先行との違いを許容できるか。

コードレビューは不要。縦の読み順は人間の判断が必要な独立の確認点なので、横だけに絞らず2例を残した。未回答を承認へ置換しない。

変更前はwhole90909a0の元蛇腹をD finalizeなしで表示し、変更後は固定版accordion04。同じsourcePlan・全Bfixture/8fonts・seed704・「風の先へ」・通常円(.5,.42)/半径.2、fps60。アニメ部分だけを原寸CanvasからH264 MP4へ出力し、4本とも4秒/240固有frame。変更後計480frameの時計/円余白/stage/所有包絡guardをローカル確認。親はsourcePlan全文同一、asset hash/byteと独立ffprobeを照合し画像動画は閲覧していない。

別コンテキストのgpt-6.1-sol/mediumは12key PNGとMP4から追加抽出した6frameを照合し、折り・文字付着・陰影・表紙を限定受入。実時間再生、全条件の視覚成功、009全体完了や人間の動作確認OKは主張しない。

[公開操作戻り値](../evidence/AVOID-009/accordion-media04/publication.json)を保存。Sites source commitはe844ccac1b3e52dbe2fc5213bfa1511751e92e9a。公開接続・動画再生・デプロイpollingは0。


## 2026-10-24 利用者の動作確認回答

最新回答: HUMAN_APPROVED。Userreviewedallmorningexamples andsaidallotherthanthreeexceptionsOK。朝のまとめをすべて確認し、指定3対象以外はOKとの明示回答。従来の未回答記述は当時の履歴として保持する。新しい版へ承認は自動転用しない。
