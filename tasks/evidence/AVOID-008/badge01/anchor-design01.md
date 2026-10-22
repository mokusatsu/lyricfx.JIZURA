# 名札の source-specific screen-anchor 接続（未受入候補）

対象は明示 opt-in C の `nameTag` のみ。native 比例寸法の joint translation が不成立の場合に、native aspect の離散寸法で screen-anchor 接続を試す。現在の代表 positive は portrait hello=.71、school=.72。見出し・学級欄・文字領域の比率は source のまま。960横の across=.5 は旧未受入候補であり、この設計の成功例には含めない。

## source motion

固定 region offset を `(ox,oy)`、`q=outBack(clamp(lt/.5),1.6)`、`z=inCubic(pOut)` とする。source body の中心を hold 中は stage center のまま記録し、以下を source render 内で適用する。

- entry translation: `(q-1)*(ox,.35H+oy)`
- exit translation: `z*(.1W-ox,.5H-oy)`
- replay は従来どおり region 固定 `(ox,oy)` を一度加える。
- rotation は `tilt*q+(1-q)*(-25)+18z` の元式、alpha と時計も元式を維持。

したがって画面上 center は entry q=0 で `(W/2,H/2-.35H)`、hold q=1,z=0 で `(W/2+ox,H/2+oy)`、exit q=1,z=1 で `(W/2+.1W,H)` となる。元の端点へ接続するが、途中の移動量・軌跡は変わる。入場 drop の係数 `.35H+oy`、退場 dx/dy は非負を要求し、native top-entry / down-right fall を反転する候補を拒否する。横成分の追加は明示された接続の一部である。

portrait 1080x1920 の native entry drop は672px。hello は約52px (+横14px)、school は約83px (+横14px) と大きく短縮される。native exit dy=960px は各約1580/1549pxへ増える。時計・回転一致を「元の動き同一」とは扱わない。登場/退場感、fadeに見えるか、サイズの意味について独立視覚判定が必要。

## stage/circle の別契約

静止 hold は全 owned paper/pin/grid/header/metadata/primary を stage 内・円外に保持する。entry/exit の一時的な円通過は元契約の許容範囲であり、数値の hold 実績へ数えない。

各 source primary event の identity は main文字/metadata文字/font identity/shape kind と同一 kind の occurrence で対応する。元 source event が全 stage 内にある連続 entry clear-suffix と exit clear-prefix を個別に求め、候補では少なくとも同じ区間を stage 内に保つ。native crop を全時間禁止する契約ではない。

entry の `qMax=1+4*1.6^3/(27*2.6^2)` まで含む。q は overshoot 後1へ戻るため、native suffix の上端を1で切らない。すべての点について `A*cos(theta+beta*u)+B*sin(theta+beta*u)+d*u` の区間端点と導関数0の解析根を評価し、独立 x/y 範囲の全4corner を hull に含める。raw recorder が world-axis AABB として観測する `line` は、その sweep AABB を別に包含する。camera/support reserve を加えた後に元 source の prefix/suffix の境界を二分探索で保守側へ求める。

anchor 候補では motion envelope が offset に依存するため、hold の有限候補を `solveBasic.accept` で個別に照合する。source 自体は offset ごと再recordしない。採用 offset の entry/exit envelopes を保存し、render 時は actual event polygons の包絡・stage包含を検査して違反なら replay 前に拒否する。region offset の時刻依存補間は使わない。

## 現在の証拠

- `probe12-entry-suffix`: 旧 native fall 候補に entry suffix を追加すると portrait 不足。以前の crop05 の新規 metadata/paper entry crop を成功へ昇格しない。
- `probe13-anchor` / `probe14-anchor-fields`: anchor prototype 数値。後者の追加 anchor-field 候補は positive を増やさず撤去。歴史的 source pins のまま保持。
- `crop06-anchor`: 主歌詞・metadata・全owned のサンプル入退場 crop 早期化/長期化なし。ただし横 hello は旧acrossを採用するため意匠未受入。
- `motion01`: 現 source、portrait2条件×96f runtime、全ownerの中心端点/角度、helper-rebound実alpha各6点、forged solver safe の entry/exit 2拒否。数値のみ。
- `badge-preview02`: 現 source portrait2条件、immutable2bb別pageの同条件before、24fps96f native Canvas MP4＋原寸keys。独立実見は親が手配。画像/動画を実装担当は実見しない。

公開結果の確認は利用者指示により禁止・対象外。C34全体、他font/aspect/longtext/全region、性能上限の受入を意味しない。
