# 電球 source80v：未登録 adapter と資源寿命の試作

2026-10-28。実装担当 gpt-6.1-sol / medium。親が18ファイルの bytes / SHA256、ソースと試験の範囲を照合し、模擬試験25 + 88 checksを独立再実行した。未登録の source-only unit `864926a5`。製品登録・生成HTML・UIは変更していない。

新 adapter は実 finalizer が作る working plan を元に、入力由来モデル・有限候補・配置先再評価・所有証明を接続する提案。callback がある adapter の検証成功または失敗で同期 data-lifetime callback を呼び、失敗時の provisional ticket / certificate を解放する。既存 callback なし、admission のみ、lifecycle 付きの registry 4 / 5 / 6 要素と cache dependency identity を区別する。候補探索中の一時データと binding / controller は serialized 予約量に含む。これは JS heap や Canvas bitmap の測定ではない。

mock compiler / geometry / context を使った実提案 adapter・09k・owner / controller / binding の25 checksで、通常発行、clone / option 拒否、明示sizeの失敗marker、証明発行後の09k検証失敗と次のfinalize復帰を確認。失敗前後の record 1 / binding 1、予約13,629 bytesが一致。別の88 checksでは実09kと09a / 09g断片をmockで実行し、callback identityと従来互換を確認した。bitmap counterは合成であり実描画の証明ではない。

**製品への適用は未可。** 09kの validated 後、09a cache / lineage / freeze 終了前の例外に対するdata cleanupが未完成。さらに実 J.plan / Canvas、09aのworking planとproof対応、旧69 registrationとの切替、late-load、font / text / 円変更、実描画before-bitmap拒否と回復、UI noPost / scale / noGhost条件、非同期準備は未検証。共有Canvasの例外復旧は変更しない。看板以下5演出も未完。追加の人間動作確認を求める変更ではなく、6動画の承認は保持する。

正本は Git 外 `/workspace/jizura-logic-evidence-20261027/bulbs-adapter-source80v`。Git には必要なsourceと模擬testのみを保存し、媒体・巨大rawは含めない。
