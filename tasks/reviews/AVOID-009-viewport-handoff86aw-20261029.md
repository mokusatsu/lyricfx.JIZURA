# 電球：viewport 候補の私有受け渡し試作（86aw）

実装担当 gpt-6.1-sol / medium。既存の一度だけ設定される frame access に、所有者が保持する ready token と候補番号から同期的に借用する内部経路を追加した source-only 試作。外部から model や候補データを渡す API は追加していない。親は差分を確認し、正規生成一致・mock 92項目と既存 handoff 30項目を再実行した。

前後の入力・円・字体・世代・context・source 確認と、拒否・例外・非同期返値・予算超過時の破棄は mock で確認。借用 callback は信頼する controller 内部に限定し、model と context を外部へ返さないことが後続実装の条件。実Canvas、描画時の資格、正式 plan と通常UIへの接続、実用性能は未検証・未完。
