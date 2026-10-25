# 円形回避の確認候補（2026-10-25）

約6演出の候補をためるまで独立作業を続ける。現在、技術検証とMP4・静止照合まで済んだ演出は1件、閲覧用公開まで用意できた新候補は0件。人間の未回答を承認にしない。

| 演出 | 技術検証 | 人間の動作確認 | 閲覧用公開・保存 |
|---|---|---|---|
| 電球：上寄り円→横1段下／右円→2段左 | 限定family source/raw/canonical日英・6テスト、500exact時刻画素、57,680支持、4MP4/12PNG、freshsol6対PASS | 未承認。静止だけでは点灯順・動きを判定しない | GitHub旧保存版あり。Sites追加・公開は認証経路拒否で保留 |
| 看板 | 隔離local native58、全Number proof/12frame、通常拒否、不足時除外などproducerPASS。親source/raw照合中 | MP4未生成・未依頼 | raw/source保存は具体承認転送後も自動審査拒否。RAM保持、Git保存済みにしない |
| ドミノ | 後続 | 未着手 | 未着手 |
| バースト | 後続 | 未着手 | 未着手 |
| クロスワード | 後続 | 未着手 | 未着手 |
| 等高線 | 後続 | 未着手 | 未着手 |

## 電球の既存GitHub保存版

コミット `ad866b427c1c3d8d2f3b45ff5cbc484e77f6afb6`、ブランチ `archive/avoid009-bulbs69-media71-actual01-20261025-attempt1`。公開URLを確認した記録ではなく、保存操作成功の元返値とGitパスを示す。

共通パス：`tasks/evidence/AVOID-009/bulbs-source69-runs/avoid009-bulbs69-media71-actual01-20261025/raw/public/`

- 変更前／後MP4：`videos/upper-before.mp4`、`videos/upper-after.mp4`、`videos/right-before.mp4`、`videos/right-after.mp4`。
- 比較閲覧HTML：`index.html`。4posterは同`posters/`。
- 原寸静止12枚：共通パスの1階層上 `raw/images/{upper,right}-{before,after}-{014,090,231}.png`。

9閲覧ファイルは合計4,475,831B。生成完走は1506records/60,208,158JSONB。元の親checkerの時計schema誤りは原本のまま保持し、訂正版の独立照合だけを再実行してPASS。動画再生成・再取得なし。技術根拠は `../evidence/AVOID-009/resume-20261025/source71/parent-media71-acceptance01.json` と同fresh-sol-static-review71-01.json。

## 現在の保留理由

Sitesの既存非公開project `appgprj_6adbafe9f07c8191ab0b404c53caab16` へ9ファイルを追記するための短期tokenを、sandbox外TTYへ入力する操作が自動審査で拒否された。token未送信、helperは中止、SourceGit操作・Site保存/公開0。通常managed環境の一時領域不足も起動前に確認。拒否経路を迂回しない。公開URL/HTTP/hash/画像動画/起動/smoke/deploy pollingは今後も実施しない。

看板local02の具体承認は実行担当へ質問・回答をそのまま転送され、担当も受領を確認した。しかしscopeを96件/24.57MBへ絞った正規申請も実行前拒否。正確な審査理由は `../evidence/AVOID-009/resume-20261025/billboard72-final-save-blocker01.json`。異なる3runを含む11.45MB最小案を512件の承認へ広げていない。

## 保存方針

最新利用者指示により、今後の比較MP4・PNG・閲覧HTMLはSitesへ。コード・設計・再開手順・必要検証記録はGitHubへ。既存GitHubアセットは削除・履歴変更しない。全AVOID-009・全入力対応・正式性能・保存本体は未完。保存既存cut期待0/実際1はAVOID-013。
