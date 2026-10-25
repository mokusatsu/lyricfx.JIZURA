# 231退出時の下部表示 — 原本数値と元sourceだけの限定診断

結論：after固有のviewport切れ・最下段/鉛筆の新規描画欠落を示す数値はない。元crosswordレイアウトの退出時paper高さ縮小と行省略が、before/afterで同じownclock・同じ行/番号/鉛筆に適用されている。実装はctx.clipによる退場ではなく、元sourceのpaperH=gh*gaとra<=0での行スキップ。新しい画像/Canvas/encode/別時刻/新設計は行っていない。

j231=3.85s、dur4/outDur.4、exitcut。main pOut=.625、tout=1-pOut³=.755859375、tinは完了しているためga*R=.755859375*5=3.779296875。row0..4のraは[1,1,1,.779296875,0]。native-factory.js:97以降とprivate-factory.js:106以降は同じtout/ga/ra式で、ra<=0を番号/鉛筆描画の前にcontinueする。

mainはbefore/afterとも番号1..14の14call、最下段row4の15/16は省略。鉛筆も双方row3,col2の「す」だけ1call/1paint/alpha.755859375、row4,col2の「の」はcall自体が無い。B/A ownltは3.783333333333333/3.816666666666667で、遅延によりrow4raは約.5185908565/.2053674769。両方で16番号/2鉛筆callがあるが鉛筆は元sourceghost:falseのためbefore/afterとも実paint0。この対応は3ownpassでclock全値、番号ID、鉛筆cell/paintcount/alphaがexact一致。

紙下辺はmain before358.9724741px、after421.2669763px。rawTextMetricsによる「す」のinkbottomはbefore358.9227710px(紙下辺内.0497031px)、after421.5023879px(紙下辺下.2354116px)。元と縮小版は文字/紙の境界近傍にこの小差があるため、見た目の境界が完全同一とは主張しない。しかしafterも完全なglyphpaintが存在し、すの保守支持下端424.5211567pxは540pxviewportから十分内側。全aftermainpositive支持unionは[x2.00000065,y263.9947682,x374.6875890,y537.9999925]、B/Aも全支持stage内。したがってviewportが「す」を切った根拠はなく、未描画glyphを安全判定から除いた事実もない。TextMetrics/支持は既存conditionalmodelであり、画像上のAA/見え方そのものを再判定したものではない。

Renderer.drawCut(09_render.js:435付近)はL.renderを直接実行し、ここにclip処理は無い。fixturearea/maskは無し、opacity100/blendnormal、EXIT.cut.applyは空(05_anim.js:245付近)、mediaはnoPost等の既存限定scope。source内clip呼出は既存spyが拒否するが、j231はhealthytrue/supportError無し。destination/oracleの全numeric値と全2073600RGBAbytes一致、quality/strictcircle/stageもtrueである。

数値原本codecはtableDeltasの必要prefixを読んだ上でj231のnative/destination/oracle3frameとqualifier1行だけを復元した。他時刻frameの全量再検証・画像確認・新Canvas/encodeはしていない。結果はresult231.json、再現sourceはdiagnose231.py。元media/source/rawは変更なし。これはこの退出表現の保存根拠であり、新しい可読性/人間動作承認や条件変更ではない。
