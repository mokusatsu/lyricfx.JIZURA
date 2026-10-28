# 電球準備分割 source80ab

2026-10-28。実装担当 gpt-6.1-sol / medium。親が固定12filesのbytes / SHA256とsourceを確認、mock job 40 checks・実ownerとmock compiler/contextの71 checksを独立再実行した。未登録 source-only unit `e30a4914`。製品の準備経路・UIは変更しない。

元のscalar compilerをgenerator化し、各ownの全recipe / held / local / budget処理後にtaskへ制御を返す。元の外側Canvas saveとパス間の状態carryを専用context内に保持し、cancel / 失効時はfinallyで復元する。入力・世代・字体 / source依存を各再開とfinish前に確認し、途中の計算と完成未移譲のmodelを既存8MiB serialized予算に含める。模擬試験はcancel・世代/文字列/字体変更・予算・queued古jobと新jobの隔離・timer heartbeatを確認した。

実Canvasでの全model / 全時計一致、区切りごとの時間とheartbeat遅延は未測定。最終HQ / localStore / freezeは一つの同期stepに残り、UI実用性は未判定。試作のfinishは検査用に完成modelを返すが、製品採用時はprivate ownerへ原子的に移譲しUIへ露出しない必要がある。UIの通常option、世代失効、publicationと看板以下5演出も未完。既承認動画の再確認は不要。Git外source `/workspace/jizura-logic-evidence-20261027/bulbs-prepare-source80ab`、媒体・巨大rawのGit追加なし。

実Canvas初回（hidden Qt）は親確認の156 pins固定で一括モデルを保存した後、分割jobが約8分で727 own中55に留まったため親指示で中断。観測時の最大step約174.6ms、同期outer13,950.3ms、document.hidden=true。タイマー抑制は可能性であり原因確定ではない。runner literal exit130、Qt / node終了・port解放、2 rawと156 pinsを親hash照合。producer自身の終了処理はnode SIGTERMにより未実行で、未完を合格・失敗へ変換しない。正本はGit外 `/workspace/jizura-logic-evidence-20261027/bulbs-prepare80ab-actual01`、`bulbs-prepare80ab-progress01.json` と `bulbs-prepare80ab-stop01.json`。保護設定を変えないvisible条件を別途検証し、看板も独立して進める。

表示状態のQtで別実行（hidden=Falseのみ変更、sandbox等不変）はexit 0、10 raw / 159 pinsと両hashを親照合。同期・分割の全modelはtiming以外一致（727 own、2,908 refs、40 groups、250 clocks）、世代・入力・字体revision / API・abortの途中失効と後始末を確認。実測は同期13,785.2ms、分割合計24,659.2ms、728 stepsの中央値15.1ms / p95 34.8ms、最終step 9,442.9ms、10ms heartbeat最大間隔9,449.6ms。表示・非表示という条件の異なる2実行だけでは待ち時間の因果を断定しない。最終HQ / local finish等が約9.4秒連続するため現試作はUIに適用できず、分割・private owner移譲・UI publicationは未完。実行 `/workspace/jizura-logic-evidence-20261027/bulbs-prepare80ab-visible02-actual01`、試作は製品未適用。看板を独立に優先する。
