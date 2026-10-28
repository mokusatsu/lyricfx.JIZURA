# 電球準備分割 source80ab

2026-10-28。実装担当 gpt-6.1-sol / medium。親が固定12filesのbytes / SHA256とsourceを確認、mock job 40 checks・実ownerとmock compiler/contextの71 checksを独立再実行した。未登録 source-only unit `e30a4914`。製品の準備経路・UIは変更しない。

元のscalar compilerをgenerator化し、各ownの全recipe / held / local / budget処理後にtaskへ制御を返す。元の外側Canvas saveとパス間の状態carryを専用context内に保持し、cancel / 失効時はfinallyで復元する。入力・世代・字体 / source依存を各再開とfinish前に確認し、途中の計算と完成未移譲のmodelを既存8MiB serialized予算に含める。模擬試験はcancel・世代/文字列/字体変更・予算・queued古jobと新jobの隔離・timer heartbeatを確認した。

実Canvasでの全model / 全時計一致、区切りごとの時間とheartbeat遅延は未測定。最終HQ / localStore / freezeは一つの同期stepに残り、UI実用性は未判定。試作のfinishは検査用に完成modelを返すが、製品採用時はprivate ownerへ原子的に移譲しUIへ露出しない必要がある。UIの通常option、世代失効、publicationと看板以下5演出も未完。既承認動画の再確認は不要。Git外source `/workspace/jizura-logic-evidence-20261027/bulbs-prepare-source80ab`、媒体・巨大rawのGit追加なし。
