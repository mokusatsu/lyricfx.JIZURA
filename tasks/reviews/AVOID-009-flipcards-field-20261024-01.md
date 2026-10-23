# カードの場を維持する修正版 — 動作確認待ち

朝の「カード配置を変更前のまま、あるいは周囲へ追加して開く位置で避ける」への対応。元12セルの位置・寸法を保ち、周囲へ4セルを追加して歌詞のカードを開く。未選択中央セルは文字のない裏面、元の補助peekは保持する。元のseed・文字順・めくる時刻を維持。主文字・隅文字は完全な字体付着のため.9、紙サイズは不変。

[原寸・60fps MP4の変更前後](https://jizura-motion-review-20261024.mokusatsu.chatgpt.site/review/AVOID-009/flipcards-field-20261024-01/)

確認点は、元の場を残したまま周囲を開く構成が意図に合うか、開く順序と文字の追いやすさ。親がコード・rawを受入、fresh-context gpt-6.1-sol/mediumが8PNGを目視照合し、元セル維持・追加非重複・主歌詞可読を確認。静止画の結果を動画全体の承認にしていない。利用者はこの新しい版には未回答。

実装gpt-6.1-sol/medium、親がコードと生テストをレビュー。source product3b95d601。native60の両240フレームを原寸960×540・4秒で符号化し、親が5376多角形・27101頂点、全sourcePlan/cut条件一致を独立照合。tableなし・縦長・明示倍率1等の制約不足や正式性能未合格を対応成功とは扱わない。

Sites公開元bf9ec732d8ef6ad855e86e283be7c9fe8580e6d5、公開操作の元の戻り値succeeded。公開結果へのアクセス・HTTP/hash・画像動画・起動・状態pollingは利用者の永久禁止に従い0回。[公開操作記録](../evidence/AVOID-009/revisions-20261024/flipcards-field02/publication-operation01.json)。以前の比較版は保持する。009全体は未完、010以降へは進まない。
