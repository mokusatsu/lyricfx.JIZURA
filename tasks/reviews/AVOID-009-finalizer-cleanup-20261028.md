# 電球 source80w：最終確定時のデータ後始末試作

2026-10-28。実装担当 gpt-6.1-sol / medium。親が固定18ファイルの bytes / SHA256 を照合し、53 + 16 checks を独立再実行した。source-only unit `c2163053`、製品未適用。09a の新規計画確定を囲み、失敗時に abort と失敗計画の登録削除を試み、元の throw 値をそのまま返す。共有 Canvas の復旧は変更しない。

実09a finalizer全文・validator・09k・提案adapterに mock planner / compiler / geometry / context をつないだ53 checksで、cache keep / freeze の異常、null・primitive・frozen Errorの元値保持、複数adapterの途中失敗と正常計画への復帰を確認した。追加16 checksは後始末の予約計算に故障を注入し、bindingが削除された一方 controller record が残る場合を確認した。予約量は18,415→25,064 bytes、record 1→2、binding 1のまま。失敗planのvalidatorとadmissionは拒否し、元入力の再finalizeとbounded evictionで回復した。これらは模擬条件であり実J.plan / Canvasやheapの保証ではない。

後始末自体が失敗した場合の即時解放と永続的な診断は未保証で、**製品適用の阻害**として残る。実planner / Canvas、旧69切替、UI optionや非同期準備、他5演出も未完。既承認6動画の再確認は不要。詳細sourceと固定manifestは Git 外 `/workspace/jizura-logic-evidence-20261027/bulbs-finalizer-cleanup-source80w`、媒体・巨大rawはGitへ追加しない。
