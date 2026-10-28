# 電球 source80u：所有モデルと計画証明の結合試作

2026-10-28。実装担当 gpt-6.1-sol / medium、親が source と純粋試験を確認。80r の所有モデルとフレーム制御に 80t の private plan-binding factory を接続した未登録試作を `e103fcd5` に保存した。製品 adapter / UI は未接続。

owner は binding factory、validator、frame controller、runtime admission と registry collector の依存 identity を確認する。controller は保持中の model ticket と元入力の key を private issuer に渡し、最終計画に対する証明を確認してから frame の準備に進む。binding の保持量は owner の外部予約 getter と合算する。証明を発行した plan の実体、ticket、trajectory、入力値を確認し、退去済み・別オブジェクト・変更済みの結果を再利用しない。

親は evidence の2 source と生成手順、test を読み、26 checks を独立再実行した。実 owner / controller / binding / registry を使うが compiler・context・最終 validator と bitmap counter は mock。可変 working plan への発行後に trajectory / diagnostics を加え freeze する模擬経路、別 renderer、plan clone、文字列・円の変更、insufficient、unsupported marker、noPost 省略、validator / collector の差替、証明 drop と model 退去を確認した。prepare 以外の mock compile は 0、拒否時の synthetic bitmap counter は 0。これは実 Canvas の bitmap 不変の証拠ではない。

実 `J.plan` / 09a finalizer の working plan と frozen plan、失敗時の provisional certificate 解放、実 Canvas、既存69 adapter との切替と通常 UI option は未検証。限定 `noPost` / `fast` は通常 UI の全呼出をカバーしない。UI の入力変更時の失効と非同期準備も未接続。看板以下5演出も未完。既承認6動画の再生成・再承認は行わない。人間の追加判断が必要な表示変更はこの source-only 単位に含まれない。

Git 外の正本は `/workspace/jizura-logic-evidence-20261027/bulbs-binding-controller-source80u`。画像・動画・巨大 raw は Git に含めない。
