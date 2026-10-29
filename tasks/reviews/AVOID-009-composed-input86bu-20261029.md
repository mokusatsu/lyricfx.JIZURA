# 電球：実UI由来の時間・空メディア条件（86bu）

実装担当 gpt-6.1-sol / medium。固定4秒の代わりに単一cutの有限時間・in/outから元と同じFloat64 preimageと3passを導く専用source-only clock、および実composeの空media/foregroundを変更せず認める限定guardを試作。親がsource、異なる4長さ・境界・終了後・512状態上限を含む純粋20,437項目とfast guard mock23項目を再実行。未証明の短いtail・複数cut・effect等は拒否する。Canvas・正式描画・通常UIの成功ではない。

実QtでUIの `replan` により作った3入力は、空層がguardを通り、1入力の単一cutは156 states・384 selected passを通った。一方、outroによる複数cutや自動eventは対象外で、いずれもformal準備・描画には到達していない。plannerのdesign座標は長辺1920に正規化され、output resolutionを540にしても既存960×540限定の準備へは到達できない。元planを縮小せず、実plan寸法・Canvas・字体・円・device余白から一般化する必要がある。

実行時固定pinのうち純粋試験 `scope-test.cjs` は実行後に拡張されたため現在bytesとは異なる。元の3,771 B・SHA256 `6518436b0fcede297f90bff45f41a1ad9266f88d974785860008125b155b7003` は凍結source配下に再構成保存され、親が一致を確認した。preflight runtime sourceと3 rawのhashは一致。新規実Canvas描画・性能・製品適用は未検証。
