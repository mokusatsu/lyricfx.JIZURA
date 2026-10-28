# 電球 source80x：後始末結果と限定診断の試作

2026-10-28。実装担当 gpt-6.1-sol / medium。親が固定20ファイルの bytes / SHA256 と source を確認し、5模擬試験を独立再実行。未登録の source-only unit `9b7fe0f1`、製品未適用。80w の後始末中に予約計算が投げても、証明の削除結果から controller record の削除を試み、元の失敗値を変えずに伝える。失敗計画の権限を先に削除し、最新1件の上限付き診断を保持する。共有 Canvas 例外復旧は変更しない。

実09a / 09kと提案adapterをmock planner / compiler / contextに接続した53 checks、後始末異常19 checks、null / number / string / frozen Errorの4型76 checks（19を4回、重複あり）、既存cache互換88 checks、診断上限1,012 checksが通った。故障注入時は record 1 / binding 1、予約215,023 bytesが前後一致。1,000 callbacksを全て実行し失敗数1,000を記録、詳細は一時・保持とも16件まで。最悪UTF16入力のexact serialized 34,064 bytesは64KiB枠内。旧記録・一時データ・新記録の同時保持を考慮し3枠を8MiB予算内に予約する。これはJS heapや実Canvasの保証ではない。

実08 J.plan / Canvas / 文字列と円の変更、旧69切替、通常UI optionと非同期準備、他5演出は未検証・未接続。新しい人間確認は不要で6動画の承認を維持。証拠はGit外 `/workspace/jizura-logic-evidence-20261027/bulbs-cleanup-result-source80x`、Gitにはsourceと試験のみ保存。
