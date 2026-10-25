# AVOID-009 の保存資料と再開方法

保存先は GitHub の `archive/avoid009-workspace-20261025` ブランチ。この文書を含むコミットが push されたことは、利用者への最終報告と Git push の元返値で判定する。公開 URL の検証は行わない。

別環境ではこのブランチを取得し、リポジトリ内の AGENTS.md、tasks/AVOID-009.md、batch-20261023 の progress.json / resume-checkpoint.md と本書を読む。work の a5bc1de1 が本保存の基点であり、保存用コミットを新しい製品実装・試験合格とは扱わない。

## workspace の消失に依存しない保存先

- archive-scope.json: 保存対象全ファイルの Git blob 対応表。元の外部パスは出所の記録であり、継続に必要な参照先ではない。
- original-design-e44551ae.zip: 利用者提供の元 ZIP。
- ../commit-rounds-durable01/historical-rounds.tar.xz と manifest.json: 以前リポジトリ外だけに存在したインデックス2版と state/receipt/review/result JSON の全8原本。
- work/avoid009-capacity-objects16/preserve_commit_rounds16.py: 上記の全バイト照合と履歴抽出用。抽出は旧インデックスの適用を意味しない。
- work/avoid009-capacity-objects16/untracked-009-blob-audit.json: 1275件の照合記録。998件の既存 Git 原本との対応を含む。
- 277件の未保存原本も本ブランチへそのまま格納する。追加のコード・試作・失敗記録・入力スナップショット・画像は、記録された合格範囲を超えて承認されたことにはならない。

## 継続時の注意

古い /workspace/avoid009-private-commit16-20261025 や /dev/shm の実在を前提にしない。古い専用インデックスの round1/2 は導入済みであり、再使用しない。別環境では Git から取得した現 HEAD/作業ツリー/保護対象を読み取り確認し、必要なら現環境に合った新しい専用インデックス手順を指定 sol/medium 担当が準備し、親がレビューする。元の端末と同じ inode/PYC/skip 状態が再現されるとは主張しない。依存導入は lockfile に従う。

タイル・電球・マグネットの指定固定比較は動作承認済み。電球 adapter と横長/左右の自動形状選択は未実装。看板67の旧 SHM にしかなかった全 raw はアクセス不能であり、本保存にも存在しない。必要時は新しい実行として検証する。009全体、正式性能、保存本体は未完。公開結果確認永久禁止、親画像動画0、実装 sol6.1/medium 子、画像照合は文脈なし sol を維持。

以前の001-008等を含む約26.7GBの未追跡一時出力を全量保存したものではない。それらを本タスクの継続に必要な正本として参照しない。必要な原本がそこにしかないと新たに判明した場合は、未保存と明記して先に Git または Projects へ保管する。今回の保存対象は archive-scope.json で限定・確認できる。
