# ドカン：正式計画が要求する時間境界（83as）

実装担当 gpt-6.1-sol / medium。既存の時刻selectorと私有controllerを、model・initial-model・全3passが空の区間に限定して扱う source-only 差分。genericの要求範囲は縮めず、この入力の範囲 [-1/60,4.77] を維持。元の10実時刻rawを再利用し、親が純粋581項目・controller mock25項目と実Canvas checkerを再実行した。

Qtの5新時刻では開始前がsourceN0、最初の境界がsourceN1、終了後は全3selectorが空。拡大tailの2時刻は同じ元rendererのnoLyrics背景RGBAと一致。範囲外2件と別planは描画前に拒否しbitmap不変。54固定入力・3 rawの hash を親が確認。現serviceにownerがなかったため今回のみ全250 states・727 ownを準備し、16,569.5 ms、最大step44.6 msの単発値を記録した。既存10時刻は再描画していない。

これは限定時間域の技術検証であり、正式 J.finalize、通常UI、実用性能の合格ではない。次は真正ownerと既存issuerの限定binding、実plan/描画、失効の確認を行う。
