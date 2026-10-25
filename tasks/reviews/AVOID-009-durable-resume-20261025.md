# Git に保存した資料からの再開（2026-10-25）

利用者指示により、後続作業で workspace だけのファイルを必要としないよう、追加資料を GitHub の `archive/avoid009-workspace-20261025` へ push 済み。保存コミット `683a50d492cb2ee2967a3e7ffff40f350610dfbd`、1349ファイル/167224148B。元返値の new branch/Done を記録し、公開URL接続や公開結果確認はしていない。

別環境では work の最新版に加え、この保存用ブランチを取得する。必要資料は保存コミット内の次のGitパスにある（/workspace外の旧パスは出所の記録にすぎず、継続条件にしない）。

- tasks/evidence/AVOID-009/evening-20261024/storage-capacity-objects16/workspace-durability01/README.md と archive-scope.json：保存範囲・再開方法・全blob対応表。
- 同 original-design-e44551ae.zip：利用者提供ZIP原本。
- tasks/evidence/AVOID-009/evening-20261024/storage-capacity-objects16/commit-rounds-durable01/：過去の専用インデックス2版とstate/receipt/review/result全8原本、全バイト照合済みXZとmanifest。
- work/avoid009-capacity-objects16/untracked-009-blob-audit.json：1275件照合、998件のGit原本対応、277件の新規保存原本。コード・未採用試作・失敗・入力・画像の保存は実装や検証の合格ではない。

古い外部private index/keeper/SHMやinodeを別環境の必須入力にしない。保存したインデックスは履歴証拠であり、再適用しない。取得後の実HEAD・Git状態・保護対象と現環境を確認し、必要な新しい実行手順を指定担当が準備して親がレビューする。既存の保護対象65件/PYC7は元環境の保全記録であり、新環境が同一inode/PYC状態になるとは主張しない。コード正本とlockfileはGitから取得できる。

最新承認はマグネット・タイル・電球の指定固定比較。電球adapterと横長/左右の形状自動選択は未実装。看板63はnative基盤、67は本体未統合で、旧SHMにしかなかった全rawは現在アクセス不能・Git未保存のまま。過去の親レビューを全raw保存済みに変えず、必要なら新規検証として実行する。009全体・正式性能・保存本体は未完。保存試験の既知cut0/1失敗はAVOID-013。

実装・修正はgpt-6.1-sol/medium子、親がsource/rawレビュー。画像は文脈なしsol、親画像動画0。公開結果確認は永久禁止（URL/HTTP/hash/画像動画/起動/smoke/deploy polling/予約/子への委任を含む）。

約26.7GBの既存未追跡一時出力を全量保存したものではない。001-008等の一時出力・複製・依存物を継続の正本として参照しない。新たに必要な未保存原本が判明した場合は、そのまま進めず先にGitまたはProjectsへ保存する。RAW67は存在を確認できないため保存対象に補完できない。既存ファイルを削除していない。
