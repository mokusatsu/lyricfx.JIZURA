# AVOID-009 円筒の横画面での再配置

- 比較URL: https://jizura-all-motion-20261021.mokusatsu.chatgpt.site/review/AVOID-009/cylinder-reflow-20261023-01/
- 状態: Sites公開操作がsucceededを返した。人間の動作確認は未回答。[公開操作記録](../evidence/AVOID-009/cylinder-canonical01/publication.json)。公開結果確認は実施していない。
- 製品commit: `694b289`（workへpush成功）。Sites source commit: `f71a64b2f6794536c32ed7d2df3f8002fb7fd641`。

「最初から同時再生」で、変更前後の円筒を比較してください。主歌詞を3行に組み直して円の右側へ配置しています。**円筒として回転する感じが残っているか、3行の主歌詞が読みやすいか**を確認します。円ガイドは初期ONで、切り替え可能です。

公開対象は、行構成を変更した横画面の1例に絞る。別の縦画面例もローカルで作成・検証・独立画像照合済みだが、元の構成・字体・時系列のまま平行移動するため、親が追加の人間確認不要と判定した。これは人間のOK回答ではない。

## 実装・レビュー

実装はgpt-6.1-sol / mediumの別tree担当。親が09oの円筒adapter、11pの円筒ブロック、09aの帯専用描画再生をレビューした。主歌詞だけでなく、全ての周回文字・裏面・反復slot・帯・ガラスをprimaryとして保護する。元の回転clock・方向・tilt・主歌詞mi/rowphase・周回文字数を保持し、半径と行組みを先に検討した後、局所的に字体サイズを調整する。明示サイズを縮めず、不足や未対応を成功に数えない。円筒をcenter-only軌道や補助歌詞へ扱い直していない。

横画面例は半径60%、主歌詞3行、主字体80%・周回字体70%。前後で歌詞・元のlineText/words・カメラ・円(.5,.42,r.2)・seed704・actual fontsを揃える。全周回slot（2rings×56）と元の読順・運動を保持する。帯のクリップは元の円筒形を再現するもので、回避用マスクではない。回避判定ではクリップ前の矩形全体も保護する。

- 開始commit14beefb。最新canonicalは09a/11pの限定差分と09o追加のみ、他sourceは同commitと一致。mainの性能WIP・gate09n・既存pycacheは保持。[統合記録](../evidence/AVOID-009/cylinder-canonical01/integration-receipt01.json)。
- 旧175条件は66安全/108不足/1未対応。親が305snapshot pin＋parity15入力、1,231証明polygon・141,035実polygonを独立照合。[旧checkpoint親レビュー](../evidence/AVOID-009/parent-cylinder-checkpoint04-review.json)。
- 最新canonical46条件は22安全/23不足/1未対応。親が308snapshot pin、435証明polygon・43,616実polygonを独立計算。回避OFF72組・clipless native108組・帯native324組のRGBA hash一致。別途whole14beefbとの18条件72組でC/D描画・safety/transport metadata一致。[最新親レビュー](../evidence/AVOID-009/parent-cylinder-canonical01-review.json)。
- native帯のreplayは元のlive camera rootを保持し、offset0/非0・scale.1を含めて照合。以前のroot丸め失敗は旧証拠へ保持し、許容誤差やガードを緩和していない。C/Bの描画機能へ帯専用経路を流用しない。
- ローカル2代表の動画は全4本が原寸60fps/240frames/4秒。変更後480frameがstrict guardを通過。親は33assets hashと4本の実ffprobeを照合。公開用1例は元のMP4/PNGを同一bytesでcarryし、再encodeしない。[公開用manifest](../evidence/AVOID-009/cylinder-canonical01/human-media-manifest.json) / [操作検証](../evidence/AVOID-009/cylinder-canonical01/human-media-local-verification.json)。
- 別コンテキストgpt-6.1-sol / mediumが20標本画像で縦横とも[視覚PASS](../evidence/AVOID-009/cylinder-canonical01/independent-visual01.md)。連続再生・全コマの人眼検査ではない。親の画像・動画閲覧は0。

公開結果確認は利用者指示により中止・対象外。公開操作の戻り値だけを記録し、公開先の接続・再生・画像・起動・状態pollingは実行しない。AVOID-009全体は実装中で、残りD・customの実回避、正式性能が未完。既知のcore3失敗と保存テスト本体未検証も成功に置換しない。
