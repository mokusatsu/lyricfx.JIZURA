# 円形回避：共通契約・描画経路・証明設計

## 結論と状態

三演出に共通して、主文字のbboxだけでは円回避を判定できない。所有する物体・メタ情報・影・残像を列挙し、実時刻とpass時刻、局所変換とcamera、元のclipと回避による欠落を分けて扱う必要がある。

本書は固定コミット`e44551ae2d3fabd599f29f5f81de8b8ed5fc053e`のソース調査と設計案である。実装、描画実行、フォント実測、画像・動画の確認、安全成立の認定は含まない。以下の「既存」はソース上で確認した処理、「提案」は後続の実装で満たすべき条件を表す。

## 1. 採用契約

| 項目 | 採用されている条件 | 根拠 |
|---|---|---|
| 標準円 | center=(.5,.42)、radius=.2 | `dev/avoidance/contract.json:4–13` |
| 値域 | center各軸0～1、radius 0.02～0.45、最大1000region、最短region 0.04秒 | 同:14–25 |
| 座標 | 元ステージpx。`C=(cxW,cyH)`、`R=radius·min(W,H)` | 同:26–31、`tasks/avoidance-design.md:144–150` |
| 余白 | `m=max(2px,.005min(W,H))` | contract:28–29 |
| 接触 | 原文`"contactIsCollision": true`。境界への接触も衝突 | 同:30 |
| インク | alpha>=1/255を対象。glyph/ruby/strokeと有限なshadow支持を含む | 同:31,67–79 |
| 時間 | `start<=t<resolvedEnd`。null終端は次startまたは最終合成尺。gapは回避なし。overlapは拒否 | 同:33–40 |
| 優先順位 | OFF/autoPlacement=falseを保持。emphasis免除。非強調のmanual/lockは保持し、実競合を診断 | 同:42–48 |
| サイズ | 明示サイズ記法を保持。無理に縮小しない | 同:67–70 |
| 通常主歌詞 | 全画面の軌道で回避し、円形マスク・演出全体の縮小で代替しない | 同:47,73–79 |
| 所有 | 原文`default all lyric-bearing draw units to primary`。未解決所有を成功扱いしない | 同:95–99 |
| 候補選好 | cyが中央帯0.45～0.55なら全方向、上なら左右・下、下なら左右・上を優先 | 同:73–79 |

現仕様はregion内の中心・半径が固定で、境界で切り替わる。連続移動は拡張を考慮する設計であって、実装済みではない。中心や半径を連続関数に一般化するときは、物体側だけでなく円側の移動・膨張も区間評価へ含める。〔`tasks/avoidance-design.md:34–38`、`src/08ca_lyric_avoidance.js:65–89`〕

単数形`tile`のtiledAux許可を、Dの`tiles`へ引き継がない。bulbsのsubtitle、billboardのNo./timeも、文字が小さいことだけで独立装飾にはしない。旧監査表は分類・設計入力であり、実装受入の証明ではない。〔`tasks/avoidance-design.md:222,362–365`、`tasks/evidence/AVOID-009/inventory-audit01.md:3,40–43,64`〕

`adaptiveLayoutsA`内の18px等の文字下限や64/128候補上限は、そのスコープの契約である。Dの三演出へ自動適用しない。一方、Dのsafe-holdに0.04秒以上の明示窓を要求する検査は`src/09k_layoutsD_placement.js:55`に存在する。領域最短.04秒と保持最短.04秒は別の条件であり、いずれも長文の可読性そのものの保証ではない。

## 2. 時計と描画寿命

| 名前 | ソースの処理 | 出典 |
|---|---|---|
| 実時刻t | `Renderer.frame`入力。`avoidanceRealTime`の既定値 | `src/09_render.js:66–68` |
| 描画刻みΔ | koma>0なら1/koma、その他は1/(fps\|\|24) | `src/08_planner.js:65–67` |
| tq | `floor(t/Δ+1e-6)·Δ` | `src/09_render.js:98–104` |
| pass | B→A→main。lagは1.6/24、0.8/24、0秒 | 同:187–195 |
| tp | `max(0,tq-lag)` | 同:194 |
| lt | `tp-cut.start` | 同:216–221 |
| ltb | `lt+lag`。tp=0へのclampが効く冒頭では単純なtqとの差にしない | 同:221 |
| 外側step | `floor(tq/clock+1e-6)`。画面全体のshake方向に使用 | 同:174,185 |
| env.step | `floor(tp/clock+1e-6)`。clockはkoma>0ならΔ、それ以外1/24。A/Bでは外側stepと異なり得る | 同:100–103,221 |
| pOut | outDur>0なら`clamp((lt-(dur-outDur))/outDur)`、その他0 | 同:349 |
| pIn | renderStartのleadを考慮する場合と通常inDurの場合がある | 同:337–348 |
| 有効cut | 先に`insertedAtPlayhead && start<=tp<end`の最初のcutがあれば、その1件だけを優先。それ以外は非blankかつ`renderStart??start <= tp < displayEnd??end` | `src/08e_lyric_features.js:429–432` |
| 描画用cut | groupではdur/endをdisplayEndへ延長し、groupExit/groupOutDurを反映 | 同:434–437 |
| transition | 旧cutの`prev.end-1e-3`等の状態を現在のrealTimeで再描画 | `src/09_render.js:279–290` |

全passは現在の実時刻の円を避ける。A/Bの物体を過去の円で評価する方式では、円が切り替わった直後を保証できない。mainの失効後にもA/Bやtransitionの旧フレームが残るため、単純なcut.endを評価終端にしない。

量子化区間が一定でも、全ての座標が一定とは限らない。chroma/shakeのイベント減衰とbeatPulseは実時刻tから計算され、pass offset等を変える。実際の`+1e-6`、Float64の境界、clamp、step、eventの開始終了を含む区間分割が必要である。〔`src/09_render.js:159–185`〕

## 3. cameraと局所変換

全ステージ描画の出力scaleを除いたcameraは、次の順序で合成される。

\[
M_p(t)=T(W/2+\mu(sh_x+off_x+cam_x),\,
H/2+\mu(sh_y+off_y+cam_y))
R(\mu cam_{\rm rot}\pi/180)
H_x(\tan(\mu cam_{\rm skx}\pi/180))
S(s_c l_x,s_c l_y)T(-W/2,-H/2).
\]

ここで`μ=cut.motionScale??1`、`s_c=lerp(1,cam.s??1,μ)·contentScale`、`l_x=lerp(1,cam.sx??1,μ)`、`l_y=lerp(1,cam.sy??1,μ)`である。局所物体行列はこの右側へ合成する。〔`src/09_render.js:218,240–252`〕

| camera | 性質 | 出典 |
|---|---|---|
| push | `1+.03·env.fx.motion·clamp(lt/max(.3,dur))`のscale | `src/05b_registry.js:28–32` |
| panL/panR | 線形とinOutSineの混合による横移動、scale=1.02 | `src/11p_looks.js:842–858` |
| dutch | inOutSineによる回転と時間依存zoom | 同:864–866 |
| その他 | blur、shear、noise、拍同期等を含む拡張がある | 同:868–903、`src/11p_bgcamB.js:1133–1248` |

既存finalizerのcamera対応域はpush/panL/panR/dutchである。未登録の`none`を指定するとpushへのfallbackになり得るため、恒等cameraの根拠にしない。〔`src/09a_placement.js:430`、`src/09_render.js:224`〕

配置Δをstage座標で定義するなら、目標は`T(Δ)M_pQ_u`である。局所座標へ同じ数値Δを加える`M_pT(Δ)Q_u`とは一般に一致しない。camera逆行列で換算する方式では特異行列を明示診断し、既存のevent再生を使う方式でもcameraを二度掛けない。

元のmanual areaには回転とclipがある。新しい自動回避は全stageで行い、manual/lockの座標系を勝手に解放しない。〔`src/09_render.js:240–247,332–334`〕

## 4. 文字と図形の計測

`J.measure`はadvance・tracking・leadから求める配置寸法であり、完全な字体のインク境界ではない。`J.drawItem`が返すbboxにも`rotation ignored except translate`という制限がある。回避判定では、実CSS fontのactualBoundingBoxと実際の局所・camera変換を用いる。〔`src/03_text.js:11–58,206–210,298–306`〕

| 項目 | 確認した既存経路 | 設計上の注意 |
|---|---|---|
| fontCSS | `px.toFixed(2)`と文字別composite・言語face | 異なるCSS文字列を同一計測値で代用しない |
| advance | 100pxのmeasureText.width/100 | 実際のinkの張出しを表すとは限らない |
| 実ink | `A.itemGeometry`がactualBoundingBox4値を読む | glyphごとの変換を積み、strokeとAA guardも含める |
| 既存guard | font空間のstroke半幅＋1px、device軸±2px等 | 元ステージ余白mと別。出力scaleが変わる場合も保証範囲を固定 |
| validationOnly | 一部guardを省略する経路がある | 成功証明のgeometryとして転用しない |
| 特殊FX | pieceFn/blur/shadow/extrude/pattern等は既存計測に未対応部分 | 有限支持の専用モデルがなければunsupported |
| 字体変更 | metrics.clearでrevision増加 | 言語・font・load完了後の再計画が必要 |
| 動的文字列 | SCORE、No./time、代替文等 | 到達し得る文字列・サイズ・align・trackを区別 |

根拠：`src/02_fonts.js:123–127,169–205,359`、`src/02b_lang.js:105–110,132–148`、`src/09a_placement.js:67–105,469`。

最大字号1点のTextMetricsを比例変換して全CSS字号を保証しない。元rendererが実字号を変えるなら、そのfont文字列の全離散状態または正当な上界が必要である。Canvasのscaleだけが変わりCSS字号が固定なら、同じ字体の変換として扱えるが、AA・filter・出力scaleの支持は別に確認する。

## 5. 所有・clip・描画順

元の全インクを記録する台帳と、最終的な可視支持の台帳を分ける。pre-clipの記録は文字や所有物の欠落検知に使い、元から存在するclipの後の支持は円と実描画の関係に使う。新しいmaskやclipで主文字を欠落させて安全を作らない。

`mainDraw`はenter/hold/exit/treatを付加し、`drawFx`はstreak/echo・clip・bands・pre/post処理を持つ。`env.draw`や直接Canvas描画は、この全てを同じように通るわけではない。各演出の描画単位ごとに経路を記録する。〔`src/06_layouts.js:11–113`〕

clipには作成時のmatrix、対象owner、交差順、穴・和集合を記録する。後描きの前縁や枠をclipと混同しない。物体の投影影、縁、灯具、メタ情報は「小さい」ことを免除の根拠にせず、必要な所有関係と元のpainter orderを保つ。

既存Dのrecord/replayは利用候補だが、その利用だけで全区間証明にはならない。

| 境界 | 既存ソース上の状況 | 出典 |
|---|---|---|
| 未指定所有 | 原則primary、cut単位owner | `09a_placement.js:200–203` |
| イベント記録 | transform、clip、polygon、owner、role、blend、alpha、順序 | 同:200–203 |
| D図形 | poly/circle/arc/rrect/lineの記録処理 | 同:295–337 |
| 再生 | 元イベント順を保ちprimaryへstage offsetを適用 | 同:342–368 |
| D登録 | 専用finalize/renderとsource/interval proofが必要 | `09k_layoutsD_placement.js:43–63` |
| 未登録 | `D_SOURCE_PROOF_PENDING` | 同:61 |
| 宣言の意味 | 原文`A declaration is never a geometry certificate` | 同:1–2 |
| transport | custom wrapper後のdrawCut/makeEnv identityを封印 | `11za_layoutsD_transport.js:1–6` |

`A.record`によるmakeEnv再構成では、effective FXの再乗算とroot数値精度に注意が必要である。balloons向けの限定補正や既存演出向けのnative root経路を、三演出にも適用済みとみなさない。三演出でゼロ変位の元描画・命令・clock一致を検査するまでは検証課題である。〔`09a_placement.js:157–185,256–258,358`〕

## 6. 全時間区間を判定する方法

### 6.1 証明する述語

owner u、pass pの時刻tにおける可視インク集合を`P_{u,p}(t)`、有効円を`C(t),R(t)`とする。全区間safeの基本条件は

\[
\forall u,p,\ \forall t\in I:\quad
g_{u,p}(t)=\operatorname{dist}(C(t),P_{u,p}(t))-R(t)-m>0.
\]

alpha閾値、線幅、有限shadow・複写、camera、必要なAA上界を`P`へ含める。円の接触条件と画面内条件は別であり、入退場で元から画面外へ出る場合も、許す辺・owner・時間を別記する。

alpha閾値で支持を切る場合は、複数イベントや残像の重なりも考慮する。各描画のalphaが単独で1/255未満であることだけでは、合成後の寄与まで閾値未満とは限らない。最初の診断では元ソースが実際に描く非ゼロ支持を保守的に全て含め、閾値による省略は合成の上界を示せる範囲に限る案とする。これは数値の小さい所有物を免除する条件ではない。

### 6.2 区間包含

時間区間`I_j`について`U_{u,p,j}⊇∪_{t∈I_j}P_{u,p}(t)`を構成する。円が固定なら`dist(C,U)>R+m`が安全の十分条件になる。連続する円では`C(I_j)`と`R_max(I_j)`も包含して下界を求める。

包絡は、単調区間・解析的極値・検証された区間演算・導関数上界などから作る。回転・三角関数・指数・積の依存が大きいときは時間区間を細分化する。端点二つの凸包が非線形軌道全体を含むとは限らない。

「有限個の時刻」でも、その間に全関連状態が一定であることをソースから証明し、離散状態と両側境界を漏れなく列挙できる場合は全区間判定の一部になる。ただし、任意に選んだ60fps画像や代表時刻の観察は、その証明とは異なる。

### 6.3 結果分類

| 報告区分 | 必要な証拠 |
|---|---|
| 全区間safe | 所有・文字完全性・stage条件と全区間の厳密余裕を示す包含証明 |
| safe-hold | 指定した動くowner/passのみの緩和、全静止物と保持窓のstrict証明、元の寿命保持 |
| 実衝突 | 特定時刻の実対象形状・可視条件について交差が成立する証拠。保守包絡だけでは不可 |
| inconclusive | 包絡が重なるが実衝突を示していない、または評価精度が足りない |
| 制約不足 | 明示した候補族・寸法・時間・可読条件で成立しないことを説明できる |
| unsupported／unmeasured | FX・clip・字体・時計等の能力または計測が不足 |
| budget-exhausted | 未探索の候補や未細分区間が残る。全候補不成立とは呼ばない |

これらは報告・診断の設計区分である。既存Dの成功status集合へ未採用の値を勝手に追加する実装案ではない。既存の`insufficient-space`だけでは意味を伝えにくい場合は、診断理由に未確定や候補族を明記する案を親へ渡す。

### 6.4 読める保持と完全性

幾何的な入場・退出の緩和は、フェード・点滅・文字出現だけで静止物を免除する理由にならない。表示中に一瞬だけ円外へ出る候補も、保持条件を満たさない。各region、各owner、各passについて、読むべき文字が揃った保持窓を同定する。

元の意図的な接触・覆い隠しと、新たな欠落を区別する。タイルとラック、看板と枠、電球と筐体は重なりが必要な場合がある。図形同士の全面非交差を条件にすると、元演出を壊すため、非遮蔽を要求する文字領域と意図的接触領域を分ける。

## 7. 実装担当へ渡す最初の段階

最初の段階はnative catalogとゼロ変位での一致確認である。元の文字列・所有物・clock・transform・clip・paintを採取し、同じ入力での元描画と比較する。回避位置の探索、adapter登録、共有rendererの変更を同時に行わない。

続いて、対応域を限定した解析診断、候補構成、全区間証明、実際の再生と独立照合、必要な動作判断へ分ける。src内の既存受入済み演出やmagnetsの変更はこの調査の範囲外である。共通基盤で必要そうな機能は各報告の第6節へ提案として列挙した。

性能契約は計画p95が基準2倍以内、追加描画p95が3ms以内だが、本調査では計測していない。過去の他演出の性能値を三演出の合格として流用しない。〔`dev/avoidance/contract.json:81–94`〕
