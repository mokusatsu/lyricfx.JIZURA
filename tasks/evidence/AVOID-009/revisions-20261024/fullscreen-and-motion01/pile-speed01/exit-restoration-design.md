# 調査後の最小修正案（未実装・未承認）

狙いは承認済みholdの山形状/位置、新入口、字体、when/.34秒、.5秒fadeを保ち、退場の山に伴う縦移動とghost lag差分を元へ戻すこと。全落下物理を同一化する案ではない。

単純にrecipe.Aoutだけを4倍にすると、surfaceで作る山頂点は下がる一方でfloorは固定なので、山本体の形まで変わる。連続証明はfloor/maxRise/heap/主文字/dustに依存し、単一scalarの変更で完了とはいえない。

より局所的には、現所有物の描画内容を決定した後、全primary所有物を同じsource Y量 d(t)=(nativeAout-currentAout)*inCubic(pOut)だけ剛体で下方移動する。山本体の閉じた多角形のfloor頂点も、heapの全文字も、主文字も、dustも同時に移す。現source membership/cap/break/heap抽選、当初のnativeSurfによる採否は変えない。カメラ適用前のsource移動とし、各passの実lt/pOutで個別に求める。固定のmain時刻をA/Bへ共用すると残像速度を復元できない。

当該例 d(t)=99.09*pOut³。退場前pOut=0ではd=0なのでhold全体、新入口、落下/bounce/字体/元時計は完全に同じ。退場中には現rise33.03*pOut³に99.09*pOut³を足すため、元のrise132.12*pOut³と同じ縦の速度/加速度/時間遅延変位になる。ただし静止位置/字体傾きが元と違い、pushの時刻別scaleによる残像差は微小に違うため『全画面で残像変位完全一致・全物理同一』とは主張しない。

最終frame239で追加するsource移動はmain87.21267578px / A66.38255859px / B49.16509766px。カメラ後はmain88.90623693px / A67.66083774px / B50.10384374px。「風」のA−mainの縦差は現-6.82043239pxに-21.24539919pxを加え、-28.06583158pxとなる（元source再構成-28.15013219pxとの差.08430pxは静止配置等に伴うcamera差）。B−mainは-51.72379959px（元-51.89239079pxとの差.16859px）。山に伴う遅延変位は戻る。

stageの下辺への影響は不可避。既存完全settled/all-material証明のmaxYは720pxで余白0、最終rawの実polygon最大Yは695.79714655px。この移動を加えると最終mainの最大Yは784.70338348pxになる。単に全相stage内と記録するのは誤り。元nativeのsource退場に限ったbottom出口policyとtruthful ledgerが必要になる。top/lateralは厳守、入口top例外と混同せず、owner/pass/pOut/元source退場位相/expiry/下辺外の実頂点を明示する。画面clipで見えなくなることと安全証明で所有物を消すことは別。全geometryを円との証明・観測に残す。

当該代表push例では、現在の完全settled/mainおよび全material unit証明のY最小は331.22269571pxで、円中心Y302.4pxより28.82px下にある（pile.glyph.0.2）。pushはY移動を正のscaleで垂直下へ写すので、これら全頂点/凸包が下方へ移動しても円との距離は縮まらない。従って既存circle marginを維持したまま、bottom退場だけを限定許容する設計の根拠がある。ただしこれは代表pushの数値/解析上の見通し。dutch等で移動が斜めへ写る場合や別の円位置では同じ単調性を無条件に流用できず、新全退場包絡を再計算する必要がある。

製品実装する場合は、proof bounds/owner event geometry/actual observation/runtime dependency binding/serialized certificateを同じsourceY輸送として同期し、body floorも含む全所有物とsource-ledgerを取りこぼさない設計が必要。入口ルールを一般的stage例外へ拡張しない。old064/ee5のhold一致、入口一致、各pass退場差分、明示bottom ledger、円厳守、左右/上辺厳守を検証する。これらの実装/ブラウザ試験は未実施であり、この文書は解析提案のみ。
