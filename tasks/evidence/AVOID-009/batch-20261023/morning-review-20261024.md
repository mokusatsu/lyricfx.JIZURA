> 最新: 朝の13例は全件回答済み。11例受入、カードと山は修正版2件のみ未回答。[再確認まとめ](revision-review-20261024.md)。以下は初回依頼時の固定記録。

# 朝の動作確認まとめ（2026-10-24）

AVOID-009は実装中。D34 IDのうち10 IDで限定条件のソース・生テストを受入済みで、全体完了ではありません。010以降は未着手です。必要な見た目の確認だけ7ページ13例へ絞っています。全例は原寸のアニメ部分をnative60fps MP4で比較できます。以下はすべて未回答で、扉・円筒の既存OKを転用していません。

| 比較 | 確認点 |
| --- | --- |
| [魚眼・立方体・四隅折りの3例](https://jizura-all-motion-20261021.mokusatsu.chatgpt.site/review/AVOID-009/selected-20261023-01/) | 行配置後もレンズ・立方面・正方形の折り紙の感じが残るか。承認済みの観音開きは再確認不要。 |
| [カード1例](https://jizura-all-motion-20261021.mokusatsu.chatgpt.site/review/AVOID-009/flipcards-selected-20261024-01/) | 2行の流れとめくり方、下の星や裏面との重なり。 |
| [蛇腹の横・縦2例](https://jizura-all-motion-20261021.mokusatsu.chatgpt.site/review/AVOID-009/accordion-selected-20261024-01/) | 2本の折り紙として自然か。縦の読む順と表紙の見え方。 |
| [旗の横・縦2例](https://jizura-all-motion-20261021.mokusatsu.chatgpt.site/review/AVOID-009/flag-selected-20261024-01/) | 旗の比率・文字サイズ・短くなった昇降が許容できるか。 |
| [リボン1例](https://jizura-motion-review-20261024.mokusatsu.chatgpt.site/review/AVOID-009/ribbon-selected-20261024-01/) | 60%の文字の読みやすさ、狭く穏やかになった帯の自然さ。 |
| [振り子3例](https://jizura-motion-review-20261024.mokusatsu.chatgpt.site/review/AVOID-009/pendulum-selected-20261024-01/) | 球・扇・紙それぞれの文字サイズと短い吊り糸、揺れ方。 |
| [文字の山1例（今回追加）](https://jizura-motion-review-20261024.mokusatsu.chatgpt.site/review/AVOID-009/pile-selected-20261024-01/) | 左右2組でも一つの歌詞として読めるか。低い山・露出した平らな底・入退場の印象。 |

pileは元字号・時計を保持していますが、再配置で画面内への現れ方は変わります。親のソース・生結果レビューと、別文脈solの16静止コマ照合は完了。見た目の判断は未承認です。製品064cd99、媒体6ee41a86、公開操作succeeded（原呼出616）を固定しています。

公開結果確認は利用者指示により永久停止。公開先への接続・HTTP/hash・画像動画・起動/smoke・デプロイstatusの確認はしていません。公開操作の戻り値だけを記録しています。保存テストの既存cut期待0/実際1失敗は013への引継ぎのままで、保存成功とは扱っていません。


## 2026-10-24 回答受領後の更新

利用者は全例を確認済み。カード・横旗・pileの3対象を除く10例は動作確認OK。横旗の縦例はOK。カードは配置維持と開く位置の変更、横旗は根元の白い部分復元、pileは初期山非表示/画面外からの落下の2点を修正する。上の未回答表記は回答前の履歴。旧比較の固定版を維持し、修正版の再確認は必要な例に限定する。


## 2026-10-24 追加回答：白い帯は異常なら復元不要

利用者は「根元の白いのがむしろ異常だと判断される場合はなくていい」と追加回答。元の白い帯は、負u差分に由来するNaNの陰影値とCanvasの無効alpha無視で偶然白くなった最初の布区画と親が判定。意図したtrimでも支柱でもないため、条件付き許可に基づいて復元を取りやめ、現在の有限D描画を維持する。縦旗の既存OKも保持。11例受入・カード/pileの2修正待ちに更新。途中の隔離修正候補はmain未統合・ブラウザ未実行のまま中止し、原因調査とpatchを保存した。[判断記録](https://github.com/mokusatsu/lyricfx.JIZURA/blob/work/tasks/evidence/AVOID-009/revisions-20261024/flag-white-no-restore-decision01.json)。公開結果確認は0。
