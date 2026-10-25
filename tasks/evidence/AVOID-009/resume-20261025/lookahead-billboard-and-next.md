# 看板以降の先読み（read-only照合、2026-10-25）

bulbs69の別担当作業は変更・重複していない。現ソースと保存済み設計/67隔離sourceのみを読み、実装・実行・browser・画像・Git操作は0。このメモは適用案であり認定API/配置成功/新たな動作承認ではない。新visual stopは約6独立effect、現0、仮順は bulbs → billboard → dominoes → burst → crossword → contour。bulbsの現担当・親レビューを先行し、新規タスクを作らない。実装を依頼する場合は指定gpt-6.1-sol/medium、親source/rawレビュー、画像は文脈なしsol、公開結果確認永久0/親画像0を継続する。

## billboard：接地したまま再構成する

照合先は `src/11p_layoutsD.js:1854` のnative63、`external-design-20261024/03_billboard.md`、`billboard-transport67/source67/src/09a_placement.js` とstock witness。現63は全ownerをprimaryにし、post/brace/catwalk/ground/frame/face/光束+illumination/灯具/歌詞/番号+開始時刻の順を明示している。返却bbは全構造の支持ではない。groundはstage幅の.03W〜.97W、y=.94Hであり、看板と一括平行移動する対象にしない。独立decorへ再分類・除外・円で切り抜きもしない。固定ground自体が円に衝突する状態は、この候補族のinsufficient-spaceであって削除で通さない。

最小の物理recipe案は一枚のboardの幅/高さ・原点と文字writing fieldをside領域へ再配置し、boardに付着するframe/全文/No.とcut.start時刻/lamp/catwalkを同じ相対関係で動かすこと。groundの座標・alpha・所有・描画順・cameraは元のまま。post上端は新y0+bh、下端は元groundY、brace接続は残り長の.25/.90へ再計算する。catwalkはy0+1.1bh、lamp arm/body/lensは元の相対式を維持。groundまでの長さが非正・部材が交差/逆転するrecipeは拒否。boardを複数に分断しない。groundまでを含む全primary支持、文字のtreatment/残像、stroke/raster guardでstage/円を確認する。side幅不足は明示し、無制限な縮小や字幕/灯具削減へ逃がさない。

rise=.08Hの入場outCubicと退出pOut³*.05H、lampのstep由来flicker・i別点灯/消灯・ltb由来sweep、source主文字のmiAt(.3)/汎用ENTER/HOLD/EXIT・全passを維持する。coneにはa0乗算が元々ない一方、illuminationは.55*平均on*a0、lensはon>.5である。この差を同じフェードへ統一しない。No./時刻tag、字幕は元の文字対応/内容/時計/所有を維持し、字幕レイヤーを看板面clipへ吸い込まない。

clipを測定支持に使えるのは、元renderer自身が作るboard矩形clip内のcone/illuminationだけ。visible supportを「元4頂点光束の保守支持 ∩ 元board clip支持」へ狭める検討はできるが、clip作成時matrixとfill時matrix、radial生成matrix/6引数/全stop（alpha0を含む）、entry alpha/blend、描画/所有順まで同じsourceから検証する。glyph/metadata/構造へclipを拡張しない。有限gradient半径や透明stopを根拠に支持を恣意的に削らず、不確かなAA境界は保守余白を持つ。

## generic primitive再生を必須にしない小さい経路

現mainのA.recordは一般のraw fill/stroke/strokeText等を拒否し、billboardのsource clip+radial経路は未対応。隔離67はprivate WeakMap、same-turn/state/font/stock依存束縛、同一effectiveFX、全owner primaryと元paint順を検査するが、zero offsetだけでmeasurementSupported=false/geometryUnsupported=true。旧646rawは失われたため、その実行合格を再利用しない。保存source/失敗64〜66は設計上の注意として読めるだけである。

比較すべき小さい案は、A.recordの一般機能を増やさず、billboard専用private recipe bindingを持つ原renderer経路を用意すること。具体的には同じimmutable plan/cut/recipe/font revision/stock関数identity・effectiveFX・pass時刻・root/Canvas文字状態から、同sourceをpaint-suppressed preflightしてowner/形状/clock/clip/materialと全primary支持を収集し、全候補gateを描画前に終える。直後に同じbinding/入力が不変であることを再検査して、原rendererがそのrecipeをdirect実描画する。preflightと実描画で入力を再生成/RNG進行させず、出力前のsource suppressionは元のCanvas状態更新とcall順を保存する。追加のeventごとのsave/restoreやletterSpacingの再代入を挿入しない（64〜66/67のspacing差の教訓）。

これは「既存63を変更せずoffsetだけ渡せば接地再構成できる」という案ではない。recipeの影響を受けるboard/text/構造の式だけを明示したsource固有の経路が要り、通常recipeなしでは元sourceと完全一致させる。関数closure内部を書換える代理・stockのglobal monkey patch・汎用gradient解放は避ける。nativeRendererの意味とprivate bindingを親がレビューし、未認定APIとして比較評価する。将来D adapterへつなぐ場合も専用source/支持/区間proofが必要で、direct描画だけを安全性認定にしない。

最小の検証順は、(1)新fresh pinsでrecipeなしzeroのoff/on全call/owner/font状態/paint+RGBAを原rendererへ照合、(2)side recipeをsource式から独立計算してpost接地/brace/catwalk/lamp/clip/全文tagを照合、(3)landscape3灯とportrait4灯、tag有無、日英/改行、light/accent、main/A/B、元非default文字状態・非identity rootを含むsource clock節点と点灯閾値前後/入退場で測定、(4)全区間支持の根拠と有限raw再現を分け、circle/stage全primary gate、(5)source/font/recipe/FX/canvas/clip等の変更を描画前に拒否しpartial paint0、別のeffectと共有基盤が不変か確認すること。未対応scopeを正しく拒否し、未測定をPASSにしない。最小stock fixtureから始めても、字幕/ghost/groundを黙って削ってscopeを合わせない。

## 後続4演出：現在のprimitiveと付着関係

**dominoes**（`src/11p_layoutsD.js:2464`）：env.line/poly/rrect/circle、ctx.save/transform/restore、drawAff→mainDrawなので、既存event語彙で各固定時刻を記録できる見込みはあるが、現時点の専用adapter/全区間認定はない。各牌はshadow/側面/face/分割線/pips/文字を同じMに付着し、原T0+i*dTの立上り、j別の右倒れ、端牌88度/中間lean、pivotと接地線を保持する。row ground線は、専用実装/所有レビュー前のこの先読みでは保守的にprimaryへ含める。既存 `inventory-audit01.md:50` はfloor lineをindependentDecor候補として名前付き分類済みであり、本メモはその根拠を否定/確定分類へ上書きしない。実装時はsource単位の所有と牌の接地/付着を親レビューして確定する。無文字だけを独立分類の根拠にせず、decorと認めても線を削除せず、元の意図・位置・時計と牌の足元との関係を明示する。recipeは牌w/h/g・row pitchと接地位置を一緒に算定し、位相/順番は固定。最小検査はpips有無、1/2row、左右端と中間の起立/倒れ境界、rigid M下の文字+全牌支持と固定列groundの円/stage。単に文字中心を移す案は不可。

**burst**（`:2530`）：shock circle・speed line・debris poly・3層star・mainDrawは既存語彙での記録候補。ただしstep/3由来boil、step依存のline出現、qのoutBack overshoot/縮退、各starの別RNG、文字q上限と回転.6倍の違いをそのまま残す。外側ring/line/debrisは、専用実装/所有レビュー前の保守既定として全primary支持へ含める。一方、既存 `inventory-audit01.md:51` はshock ring/speed lines/debrisをindependentDecor候補として名前付き分類済みである。実装時は各source単位の所有・中心への付着を親レビューして確定し、無文字だけでは独立としない。decor分類でも元装飾を消さず、元の意図・位置/中心・時計を固定するかplate中心へ付着させるかをsource根拠付きで明示する。まず一つの印刷plate+全文のwriting field/rx/ryと付着中心をrecipe化し、付随rayのsource比率を保存する。最小検査はq<=.01境界、ring終端.45、debris終端.9/size>.5、boil切替、全spike頂点/文字・camera後の保守支持。巨大なspeed/debrisを除外して成立させない。

**crossword**（`:2024`）：env.rect/line/draw/mainDrawのみで、既存primitive/text記録のscope内を静的には期待できるが、実record成功やnative adapterは未検証。grid/全黒マス/番号/pencil crossing/主文字/clueは同じcell系に付着させる。row生成・対称black散布とendcap・採番・交差文字RNG・typed進行/active-cell highlight・clueのbelow/side分岐を保持し、改配置はcell寸法/board原点/clue fieldを同時に再計算。最小検査はportrait/landscape・1/2語群・clue有無・typing直前直後/全表示・黒/白/歌詞マス対応と全文/番号/clue支持。clueや背景gridをdecor扱いして除外しない。

**contour**（`:3251`）：main/A/Bの主文字は通常mainDrawで測定候補だが、main限定の巨大文字輪郭はraw ctx.strokeText/fillTextのため、現A.recordの一般経路ではUNSUPPORTED_DRAW_PROGRAMとなる。ringの外側stroke→background色の内側strokeという上描き順、最後のfill+細stroke、font fbとTextMetrics、phase wrap/alpha閾値、全文側の別font・side/low配置、bb付着の横線とNo.を保持する。現状はsource固有direct-render/preflightでraw glyph strokeの保守support（全lineWidth/miter/AA）を測れるかを先に検討し、background塗りで消えた内側を安易に安全領域へ引かない。最小検査は漢字選択/非漢字fallback・両side・rings4/6・phase wrap/閾値/出入場・巨大glyph全strokeと全文/線/番号の支持。輪郭の巨大文字もprimary、見えない扱い/除外は禁止。

共有基盤への変更はこれらのsource固有経路で不足が証明された後に親が判断する。どれも現時点はsource照合上の案で、既承認基盤・既存許可scopeを変更しない。
