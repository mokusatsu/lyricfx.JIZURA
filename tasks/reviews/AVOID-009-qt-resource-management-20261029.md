# Qt試験の資源管理と容量整理

利用者は、ディスクを整理しながら作業し、試験ページとプロセスの回収・同時数制限・生成前容量確認を求めた。親は作業環境を読み取り確認し、QtWebEngine zombie 1,132件、うち既存zombieの親はPID 1であること、稼働中Qtは0件と確認。既存のPID 1配下zombieはこの作業からwaitできず、実行環境側の親による回収が必要。無関係なプロセスや親にsignalは送っていない。

実装担当 gpt-6.1-sol / medium が [管理runner](../../dev/avoidance/qt-resource-runtime/README.md) を新規作成。親はsourceと6件の軽量試験を確認・再実行。共有flockで管理対象試験は同時1件、生成前に1 GiB以上の余裕と予定出力量を確認する。所有ページは通常APIで閉じ、runner自身に限るsubreaperで所有直接子・採用された孤児子をwaitする。起動・識別・timeout・取消の失敗、子孫を確認できない場合は成功にしない。既存の凍結済み証跡は変更しない。

保護を維持した実Qtのplain page 3枚を使う1回の小試験では、close 3件、service/Node exit 0、子3件wait回収、強制signal 0、残存0、port閉を確認。親は保存済みhostと5 source pinを再照合しcheckerを再実行した。これはローカルQt lifecycle 1回の結果であり、host全体の突然の停止後の回収や既存zombieの解消を保証しない。

容量整理は最新復元ZIP v120を別bare repoへの復元で確認し、古いZIPと展開コピーについて全file構成・checksum・未commit差分・HEAD祖先関係・bundle baseを確認。差異のないv11–v119のZIP 109件および展開109件のみ削除し、v120と構成の異なるv2–v10を保持。導入済みElectronの72ファイルと完全一致したダウンロードZIP 123,909,792 Bのみ削除し、導入済み本体を保持。空きは1,752,719,360→2,105,106,432 B（約352 MB増）。詳細台帳はrepo外 `/workspace/jizura-cleanup-20261029-recovery.jsonl` と `...-recovery-dirs.jsonl`。証跡・原本・他worktree・Python実行環境およびそのhardlinkを共有するcacheは削除していない。未commitのdesign-viewport86bv 5ファイルは別場所へコピーしhash照合済み。
