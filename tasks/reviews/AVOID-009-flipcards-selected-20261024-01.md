# AVOID-009 カードの代表1例

- 状態: コード・通常機能/幾何・ローカル動画・独立静止コマ視覚照合済み。Sites公開操作はsucceededを返した。公開結果確認は行わず、人間の動作確認は今回の約8時間集約へ未回答のまま保存。
- 製品commit: `90909a0`（workへpush成功）。
- 比較URL: https://jizura-all-motion-20261021.mokusatsu.chatgpt.site/review/AVOID-009/flipcards-selected-20261024-01/
- 親コード/rawレビュー: [final03](../evidence/AVOID-009/parent-flipcards-final03-review.json)。公開結果確認は利用者の永久停止指示により実施しない。

横960×540のカード1例だけ。主カードの縦長比率とサイズ、めくれる順・速度は元のまま、主文字と隅文字を90%にして2列で右へ配置した。上下の裏向きカードや「？」「★」の覗きは元の位置・時計を保つ。

8時間後の確認時は「最初から同時再生」で、2行の読み順とめくれる動きが自然か、右側の主カードが裏向きカードや下側の星の覗きを一部覆う構成を許容できるかを確認する。コードレビューは不要。回答を受け取るまで動作確認OKにはしない。

変更前はwhole1b0d901の元flipCards描画をD finalizeなしで表示し、変更後は固定版flip03。前後のsourcePlan全文は同一。文字「風の先へ」、seed704、通常円(.5,.42)/半径.2、同font/params/clock、fps60。PNGコマ送りやHTML画面録画ではなく、原寸Canvasのアニメ部分をH264 MP4（各4秒・240frame）へ出力した。親は全assetのhash/byte、独立ffprobe、240固有入力frame/時計/変更後guardを確認し、画像動画を閲覧していない。[親メディアレビュー](../evidence/AVOID-009/flipcards-media03/parent-review01.json)。

別コンテキストのgpt-6.1-sol/mediumは8key PNGとMP4から追加抽出した8frameを視覚照合し、形・文字付着・順序・影を限定的に受入。上記の裏カード/星の重なりは人間の審美判断へ残す。実時間再生の承認や全演出の視覚成功には拡張しない。009全体は実装中。

[公開操作の戻り値](../evidence/AVOID-009/flipcards-media03/publication.json)を保存。Sites source commitは316ac3aaed393dc5c40f189c158fe384eb29c15f。公開先への追加アクセス・起動・動画再生・デプロイ状態pollingは0。
