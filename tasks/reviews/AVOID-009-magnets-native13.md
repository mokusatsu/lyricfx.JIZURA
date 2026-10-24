# マグネット native13 — 隔離した元描画の内部段階

gpt-6.1-sol / medium 子担当のsource全文・runnerを親がレビューし、親がローカル実行。native12は診断wrapperの想定違いで6失敗、raw/封印sourceを残した。元描画ソースを変えず、wrapper・単一unsupported診断・measurementSupported:falseを正確に検査したnative13は7条件237callsでexit0、errors/failures0。旧失敗を成功へ置換しない。

[親の独立raw照合](../evidence/AVOID-009/magnets-native13/parent-independent-review.json)では、変更前moduleとOFF/directの237画素・BB・stagger getter・全paint/CTM/order組、440盤面/取っ手、1106seeded glyph states、493DECOY depth/body組、746主文字depth/body組、69literal gradient枝を確認。元RNGをPythonで別計算し、源時計/原snapの不連続/影offset/サイズ/文字間隔と所有状態を照合、最大数値残差5.68e-14。元の全盤面・取っ手・4stopグラデーションは描画したままで、画像の目視は行っていない。

mainの既存recordは6条件すべて `UNSUPPORTED_RECORDED_PROGRAM` 内の唯一の `UNSUPPORTED_DRAW_PROGRAM / Unadapted Canvas operation fill` を返す。これはliteral rounded-gradient transportの未対応を実観測した結果で、再生成功や回避成功ではない。A/B部分成功でmain未対応を代替しない。catalogはdeep-owned/deep-frozenで、入力のfreeze/seal/extensibilityを変えていない。板等はこの封印13では未分類metadataのままである。

次SOURCE14ではinventory-audit01の39行と実sourceを根拠に、盤面・取っ手とその材質gradientをindependentDecorへ分類する案を親が受け入れた。文字に所有された影はprimaryのまま、DECOYは原リテラル/seeded端飾りのみ。盤面のwriting field・取っ手/帯関係を後続配置の条件から外さない。単に大きいから除外する判断ではない。

main・通常buildは未変更。円回避adapter数は加算0。元描画保持の内部検証で新たな動きはないため、13自体への人間確認は不要。丸みのある原pathと固定world gradientを保持するD-magnets限定transportを別gateで検証する。正式性能・保存本体・009全体は未完。
