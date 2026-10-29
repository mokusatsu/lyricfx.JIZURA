# 電球：直接画面モデルから正式計画への限定接続（86bj/86bl）

実装担当 gpt-6.1-sol / medium。現在の画面モデルから入力由来の候補を導き、実際の P.shift 後の全支持・品質を検査して既存 issuer と runtime admission に渡す source-only 試作。描画時は入力・字体・source・context・世代を再確認し、失効した model は破棄する。親は差分と mock owner 57・既存controller 53項目を確認した。

実Canvasでは真正 J.plan から一つのmodelを準備し、候補 index 0 の one-row-compact を選択。画面上の移動 [0,72.3007882629842]、論理座標 [0,96.40105101731227]。正式planから j=12/60/231 を描画し、既存原本と9 own・325描画記録・RGBA hash 3件が一致。alias、範囲外post、世代変更、復元後旧ticketは描画前に拒否してbitmap不変。親が58入力・15 raw・既存参照を照合しcheckerを再実行した。最初86bkは試験がcloneを渡して SOURCE_PLAN_REQUIRED と正しく拒否、真正planを渡す試験修正後の86blで通過した。

対象は風の先へ、seed1205、720×405、倍率0.75、noPost・fastの限定経路。入力変更後の新planと実文字・字体・円の失効検証は別途必要。準備15,107.7 ms、最大step712.6 ms、正式finalize4,892 ms、記録付き3frame 24.2–34.7 msは単発値であり、通常UI・60fps性能未達。製品に未インストール、他演出も完了扱いにしない。

保存時の `git diff --check` は、86bl の固定pin対象 `generate.py` の末尾空行1件を指摘した。実行時の固定bytesを保持するため、その空白をそのまま保存する。生成された製品コードの空白ではない。
