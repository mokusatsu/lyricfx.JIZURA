# 看板：正式plan準備の容量再確認（81ag）

実装担当 gpt-6.1-sol / medium。保存済み81adの実plan形状を使い、親がraw hashと再現scriptを確認。旧stage 115,872 B・commit 116,380 B・issue 134,620 Bを再現し、131,072 B上限を維持した。

計画の重複signatureを除いたissueは113,700 Bだが、現dependency fingerprintの同時一時値まで保守的に計上する比較は185,628 B。旧rawにfingerprint内容はなく、記録値から推定した同じbyte長の代替文字列による容量算術であり、dependencyの真正性を示さない。元guardには一時fingerprintのstage会計が明示されていなかったため、signature除去だけを安全な接続成功としない。

看板のこの接続は保留。再開には、同じsource・字体・revision・言語・依存を大きな第二snapshotなしで厳密に比較し、一時値を計上できる具体策が必要。既存実描画は再生成していない。準備約62秒と通常UI未接続も残る。独立したドミノ・ドカンを先に進める。
