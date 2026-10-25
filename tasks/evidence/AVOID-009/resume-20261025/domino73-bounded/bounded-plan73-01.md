# ドミノ73 bounded回避: 次段階提案（隔離sourceのみ）

既受入: actual02同270rawのsource fidelity、親訂正checker PASS（104 native比較/52 moved比較/4575paints/1045glyph/156rowclock、再描画0）。これは回避adapter/全時計支持の受入ではない。旧source/runner/checker/失敗report/runは変更しない。

## 採用を提案する契約

設計名 `domino73-vertical-source-x-preserved-v1`。現contractのfull-stage trajectory/no primary circle mask、所有primary原則、明示size保持とplaybookのsource時計/入退場/物理関係を適用。Rootcontract/playbookの文言は変更しない。親source/raw受入前は新policy未認定。

元の入口/出口には画面左右clipがある。原寸source式の1row w108/h205.2ではlt=.03先頭face minX=-22.074997704318434、lt=3.9末尾maxX=982.0749977043184。lt1.5先頭minX=183。これは未変換source面の算術事実で、AA/影/印字/camera/各ownpassを含むactual支持証明ではない。hold/groundを入口と一緒にstage外へ逃がしてよい根拠にはならない。

今回はdx=0だけ。各ownclock/各primitiveのnativeとdestinationのx支持両端をObject.is exact比較し、左右clipが元と全く同じことを必須にする。新左右crop0、上下は全phase strict。元のheldで左右cropがなければdestinationも同じ。circleはstage clip前の全支持に対して全phase strict、画面外部分も捨てない。新clipや新phase例外の基盤は不要、現row ownerで各paintを元sequenceと対応づける。full-stage-strictというラベルは付けず、source-x-preserved/y-stage-strict/circle-strictを明記する。

## 初期有限familyと戦略

現source-fidelity代表2text「風の先へ」「風の先へ歩いて行くよ」、seed1205、960×540、dela/light/pips、4s、in.35/out.4、cut/cut/still、camera push(.022,1)、元motion/content scale1。staggerはcompose原値をfresh source witnessから保持（4字は.02579145403462462、他へ流用しない）。元rowsD membership/各row pitch/gap/lean/gi/j/ti/mi/全文/pips/印字/影/接地line/全ownpassを保持。

円は初期default(.5,.42,.2)とupper(.5,.2,.2)、margin2.7pxだけ。viewport/text/grapheme/空白/改行/明示size/他font/face/pips/FX/camera/source plan差異はtyped unsupported。原source capture/plan/style/font/helper/frame bindingは既存69 fresh依存と同じ考え方で必須。今回のfamily関数はscope検査だけで証明を発行しない。

1. 元位置(native)、次にwhole-rowchain composition共同vertical移動。元held source支持から既存G68 positionsの上下候補(最大4)+0。source-plane候補はheuristicでありcamera変換後の合格証拠ではない。
2. 2rowでは元rowchainの各vertical候補を組合わせる。row内をglyph分解せず接地lineごと移す。row0が上/row1が下の読順と元の行間を縮めない（dy1>=dy0）。全row同dyは既出jointへ重複排除。最大5joint+25row=30候補、1row最大5。recipe payloadは既存runtime73 withRecipeのnative([])/joint([common delta])/row([row0,row1])と同じ。
3. tile/fontの縮小・pitch変更・折返し・回転・行再分割は未実装、採用しない。有限候補なし/未評価は理由付き不足・未認定であり、演出不能や連続空間の不存在証明ではない。

中央円では保持中の広いchainを上下へ収められない可能性がある。実支持未確認の今は可能/不可能を断定しない。upperの1row下移動を優先して調べる。strict circle全phase成立0なら、既に許可された元入退場event限定の円緩和を別段階で検討する。hold/固定groundを巻き込まないため必要なときだけ自shimへtile/ground source所有idを追加し、元gi/mi/source時計を変えない。今回その緩和もtile seamも追加しない。

## 今回の最小実装

bounded73.cjs: family scope、有限vertical recipe候補、同clock native/destination支持pairの判定。circleは既存G68 dyadic exact AABB判定を再利用。各pairはordinal/row owner/primary/semanticKey（元draw引数・pips・文字・clock/style等、移した座標以外）同一が前提。unknown paint/不明な所有・支持・source依存はunsupported。x支持変化・上下stage外・circle接触は不合格。emptyは元positive paint無しの明示証拠がなければ不合格。helperはcertificate/safe flagを発行しない。

bounded-test73.cjs: 既存real util/ease/G68/runtime73をpure読込。native左右overflowの同一維持、悪化/上下/circle拒否、clip外circleの支持を捨てないこと、empty typed、候補数/全dx0/scale1/読順行間/既存runtime payload互換、family unsupportedを軽量確認。source face entry/exit算術事実とholdの区別を確認。新Canvas0/CPU重試験0。

## 親review後の次工程

同じ2familyだけ、原Renderer.frameと元pass列から60fps 250state+実active ownpassをnative1回採取し、全primary primitiveを既存条件付きgeometry builderで計測（TextMetrics/AA padding、stroke/shadow/ghost/各CTM込み）。held source rowsは候補seed用。任意時刻/別入力を未確認のままsafeにしない。

有限候補はsource時計/全描画内容を保持し、候補ごとactualdestinationの全ownpass支持を再認定する。移動した実CTMのF32丸めを元bbox+dyだけで代用しない。x支持同一/上下strict/circle exactを判定し、独立元closure経路で全文/painter order/時計/shape/style/原動作を照合。実行していない候補はnot-evaluated。勝者だけ採用、proof入力source/font/params/clockがstaleならtyped拒否。全clock preflight/raw受入までsafe adapter登録/完成宣言0。

Rootsource/HTML/共有基盤/Git書込なし。新raw保存先はSites Source pending方式。比較MP4/PNG/HTMLはSitesのみ。公開確認/保存後readback/拒否payload再試行0。
