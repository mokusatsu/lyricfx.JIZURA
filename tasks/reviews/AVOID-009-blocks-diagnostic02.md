# blocks branch別診断02 — 親source/raw限定受入

実装担当blocks_readonly_plan01、gpt-6.1-sol / medium。親がsource02/math/runner02と115canonical・466runtime入力の実hashを確認して実行33837を行い、exit0・8条件・errors0を取得した。親は画像動画を閲覧していない。公開操作・公開確認はいずれも不要で実行0。

## 独立照合

[親の再現script](../evidence/AVOID-009/blocks-bounded01/parent-blocks-diagnostic02.py)は[保存raw02](../evidence/AVOID-009/blocks-bounded01/raw02/diagnostic02.raw.json.gz)に対し、元の演算順によるFloat64単調predicateのfirstTrueと直前false/不存在340件、266branchの両端、49個の元font実測値を独立照合した。元描画との139組と強制source249組の画素/命令一致も確認。実描画10895event・117208頂点、強制5687event・60458頂点について、各event全体が正しいowner/pass/branch/時刻範囲の一つのhullに含まれることを確認した。時刻隣接cellのunionでの誤受入はしない。

109候補のうち59stage-policy不確定、16条件付きtranslation候補、3circle不足、31hold不足。21217候補branch polygonのstage/circleとhold判定を独立再計算した。[数値結果](../evidence/AVOID-009/blocks-bounded01/parent-diagnostic02-review.json)が正本。expiredな36観測は診断として保持し、実エンジンの保証へ使わない。

16候補は円の入口/動く退出の緩和を使う診断であり、全寿命の安全認定ではない。通常4字と縦長GO GO GOで元の形・字号・運動を保つ共通移動候補を見つけたが、他条件を数学的不可能とも縮小必須とも断定しない。mainへのadapter登録はない。限定D対応ID数の加算は0。

## 次のgateと残条件

singlecut/wholecutを覆う1region・worst-AA scale.5で同一候補・offset0へ復帰した後の全残留tail・source依存とdecoded初回/再finalizeの検査を満たす最小adapterを隔離SOURCEだけ依頼。非整列mainがfallback開始時に残る場合はtyped unsupported。native時計や寿命を変えて通さない。親source/raw review、正式性能、人間による配置/動作確認は未完。13:00JSTまでに完成しなければWIPを保持し、既存製品へ無理に統合しない。

診断は内部証拠だけなので新たな人間確認を求めない。後続の見た目を変えるadapterが受入済みになる場合は原寸native60fps MP4と文脈なしsolの画像照合を別gateで用意する。山exit13の未回答は承認に変更しない。009全体は実装中、010以降は未着手。
