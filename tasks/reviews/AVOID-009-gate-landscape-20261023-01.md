# AVOID-009 折り紙（扉）の横長優先

- 比較URL: https://jizura-all-motion-20261021.mokusatsu.chatgpt.site/review/AVOID-009/gate-landscape-20261023-01/
- 状態: 公開操作待ち。人間の動作確認は未回答。
- 変更前は前回公開した回避試作、変更後は横長優先の修正版。D回避導入前は参考リンクとして分ける。

「最初から同時再生」で、右側の縦4行から下側の横長1行になった紙面を比較してください。横長の紙面に収まった文字の読みやすさと、左右の扉が開閉する感じに違和感がないかを確認します。円ガイドは初期ONで、切り替え可能です。確認対象を扉1例に絞っています。

## 修正内容と判断

利用者の「入りきる場合は横長にして納める」を採用。元の紙面・文字サイズのまま配置できる場合は最優先で保持し、次に幅が高さの1.2倍以上の横長候補を試す。元行構成・全文1行・7列を、元の字体サイズから60%まで段階的に評価する。それでも成立しなければ旧来の再配置候補へ進む。下側への固定ではない。1.2は左右に開く扉の印象を保ち、僅かな幅広を横長優先に含めないための設計閾値。明示サイズを縮めず、元の可読サイズ下限も維持する。

代表は文字71.32→61.13px（前回から約14%縮小）、紙745.81×110.04px、全文1行、offset[0,159.74]。65%候補ではカメラ・折り運動・ガードを含む全区間包絡が収まらないため、60%候補を採用。紙面を横へ押し潰す変形や、円との余白・描画範囲判定の緩和は行わない。

変更は09nの候補順と横長判定のみ。元の描画・左右扉のclock/折り・文字の付着判定・包絡証明・runtime guardは変更なし。四隅折り（blintz）と回避OFFを保持。[親コード/rawレビュー](../evidence/AVOID-009/parent-gate-landscape01-review.json)。

## 証拠と範囲

- 開始commit77cf9e0、固定source09n SHA-256 `acebd097b681c2a928c457d132826fb0e68f5343397fcdd5609b143aa3f4d4ca`。[freeze](../evidence/AVOID-009/gate-landscape01/origami-gate-wide-freeze01.json)。実装はgpt-6.1-sol / medium、別tree。親が102source/raw pin、128証明polygon・16,580実観測polygonの円距離とstage包含を独立照合。
- 同条件前後51ケースはsafe33→36、safeから不足への低下0。元の構成のまま成立した9例は構成・offset一致。actual blintz13例のtrajectory一致、OFF24frameのRGBA hash一致。拡張32例、保護8条件、明示サイズ2条件、alpha1描画3時刻も確認。
- 動画は960×540、60fps、4秒、240frames。旧動画を変更前へ同一bytesで再利用し、新しい変更後だけ同じ歌詞・字体・円(.5,.42,r.2)・seed704・カメラ・時刻で生成。新240framesの描画ガード成功。親は16assets hashと2本の実ffprobe値を照合。[media manifest](../evidence/AVOID-009/gate-landscape01/media-manifest.json) / [local検証](../evidence/AVOID-009/gate-landscape01/media-local-verification.json)。
- 別コンテキストgpt-6.1-sol / mediumが6PNGと追加3コマで[視覚PASS](../evidence/AVOID-009/gate-landscape01/independent-visual01.md)。連続再生や全コマの人眼検査ではない。親の画像・動画閲覧は0。
- 公開結果確認は利用者指示により中止・対象外。公開操作の戻り値を記録し、公開先の接続・動画・画像・起動・状態pollingは行わない。

AVOID-009全体は実装中。他D演出・custom実回避・正式性能基準は未完。今回の修正を全D対応の完成や、他3例の人間OKとは扱わない。既知のcore3失敗とAVOID-013保存未検証も引き続き保持する。
