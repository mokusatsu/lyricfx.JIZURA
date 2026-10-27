## 2026-10-27 22:15 UTC — 承認済み6候補をロジックへ

利用者「動画はどれもOKです 固定候補はもういいのでロジックに落としてください」。親からの対象特定は Sites source `ba6e987910967666a622055477e49307990bcecb` / project `appgprj_6ae0bda657c88191b9ddec956ceb911f` 掲載の6固定比較（電球、看板、domino upper-one-row、burst two-row-half、contour hero-half-body-native、crossword58A default-left-bottom）。この6件の動作は HUMAN_APPROVED。同じ固定候補の再承認は不要。古い未承認・旧集約予定は各時点の履歴として保持する。

今回の実装担当は gpt-6.1-sol / medium、開始 branch `work/avoid009-approved-logic-20261027`、HEAD `245232cf874e4859061c6e19c0d0b7dbdcb11460`、開始時clean。独立worktree `/workspace/jizura-logic-20261027`。順序は電球69の入力一般化→看板72統合→ドミノ／ドカン→輪郭／クロスワード。固定文字列・seed・座標だけの分岐から、各入力の元描画と全所有物・全時計を数値評価する有限候補へ進める。成立しない入力は typed unsupported / insufficient-space を維持する。

承認は固定表示の動作に限り、全入力・全FX・正式性能・009全体完了への拡張ではない。通常円2段ドミノとnoPost境界を維持する。共有描画の大幅な例外安全再設計は別承認待ち。既存Sites動画変更、公開URL/HTTP/hash/画像動画閲覧、保存後readback、新しい比較媒体・巨大rawのGit追加は禁止。新証拠はrepo外 `/workspace/jizura-logic-evidence-20261027`。親が設計・ソース・rawをレビューし、commit/pushは親が担当する。

# 歌詞回避の実装手引き（AVOID-009、2026-10-25）

目的は円の周囲へ「その演出として読める構成」を置くこと。以下は実装・差戻し・限定受入から得た原則であり、全入力の合格宣言ではない。現在の正本は [009](AVOID-009.md)、契約は [contract.json](../dev/avoidance/contract.json)。184IDの分類・mappingは対応漏れを探す索引であり、184IDの実装完了ではない。

## 実装前の短いチェック

1. 元の全文・読順・字幕/番号・文字を載せる面・支持物・意味のある残像を列挙する。mainDrawのbboxだけでは判定しない。既定はprimary。大量であることだけを理由に補助へ落とさない。
2. 元ステージW/Hを保ち、所有物ごとに形を組み直す。演出全体を小さなcanvas/areaへ縮小したり、主歌詞を円マスクで消したりしない。
3. realTime（領域選択）と各passのlt/ltb/量子化/遅延/入退場を分ける。mainが保持中でもghostが移動中とは限らない。元cut終了後のdisplayEnd・残像失効までを扱う。
4. 元の物理関係を保つ。文字と面、風船と糸、振り子と支点、山と落下/退出、照明と看板を一緒に設計する。時計が同じでも振幅を変えると速度と残像間隔は変わる。
5. camera→局所変換→FXの合成順と所有境界を確認する。clip作成時の行列、painter order、影/halo/ルビ/stroke、直接Canvas文字、sampling元を取りこぼさない。
6. OFF・強調・手動area・lock・明示サイズを優先する。明示サイズが入らない場合は不足を診断し、縮めて成功にしない。

## 戦略は演出ごとに決める

「移動→分割→縮小」を全演出へ固定しない。既存の安全な元構成は保持する。その先の候補順と不採用条件はID別に宣言する。

| 意図 | 有効だった順序・注意 | 実際の根拠 |
|---|---|---|
| 写真フィルム | ライカ判36×24=3:2（縦回転2:3）、画面端まで帯/穴列、元scroll/順次出現を一緒に守る。コマ形だけ直して帯を短くした版も差戻しになった。 | [006正式07](reviews/AVOID-006-local-20261021-07.md)、[006履歴](AVOID-006.md) |
| 切り離す半券 | 文字配置だけでなく終盤の切離量・回転・退場を保つ。小さな移動量で円に収めても元演出の回復ではない。 | [006正式07](reviews/AVOID-006-local-20261021-07.md) |
| 積層/レベルメーター | Stackは行同士の積層を保持（斜めは可、行の散在は不可）。equalizerは共通baselineの一列を保持し、棒の高さを小さな箱へ変えない。 | [005](AVOID-005.md)、[equalizer修正版02](reviews/AVOID-007-equalizer-row-20261022-02.md) |
| 一枚の紙/看板 | 一枚を保った形状・自然な行組み・余白調整。必要なら文字だけの局所縮小。扉は入る横長を優先する指定がある。 | [扉の横長優先](reviews/AVOID-009-gate-landscape-20261023-01.md)、[電球固定候補](reviews/AVOID-009-bulbs-native-reflow-20261025-01.md) |
| 場から対象を選ぶ | 場を保持して円に当たらない開く位置を選ぶ。整然とした2行へ並べ直すだけでは演出意図を満たさなかった。 | [全面カード](reviews/AVOID-009-fullscreen-card-20261024-01.md)、旧flipcards-selected/fieldの差戻し |
| 物理物体の群れ | 元サイズ/運動の共同移動、連続した文字群の再配置、糸や支持の再接続。群ごとの自由移動だけでは不十分。 | [風船stage11](reviews/AVOID-009-balloons-stage11.md)、[マグネット](reviews/AVOID-009-magnets-native-20261024-01.md) |
| 立体/折り | 面の比率と折り/回転を保ち、面内のwriting field・pitchを変える。紙を扁平化して幾何だけ通す案は失敗。 | [selected比較](reviews/AVOID-009-selected-20261023-01.md)、`evidence/AVOID-009/parent-origami05-review.json` |
| 落下・積層 | settled配置だけでなく元の画面外入口、退出振幅、残像間隔を保持する。 | [山exit13](reviews/AVOID-009-pile-exit-20261024-01.md)、[入口診断](reviews/AVOID-009-pile-entry-20261024-01.md) |

どの有限候補も成立しない場合は、`insufficient-space` / `unsupported` と理由・未評価範囲を返す。採用除外は元演出の回避成功に数えない。保守包絡の不成立は実インク衝突や一般的不可能性の証明ではない。017のUI/出力への接続が未完なら、その状態も残す。

## 幾何の必須条件と見た目の目標を分ける

円・画面包含・全文・所有面への付着・実際のhaloと文字の離隔などのhard条件は維持する。美観のpreferred値は別に記録する。電球58では品質11候補と保持時回避38候補の共通解0だった。59のAは論理電球間隔hard3px / preferred4.86px、Bはhard4.86pxという意図的な品質方針の変更である。旧58失敗を成功へ書き換えていない。円の実効半径110.7px/余白2.7px、全文、元N(t)、字幕、q/out、所有物は変えず、Aのpreferred不足も全記録した。Aの表示済み固定候補は独立原描画照合60と利用者動作OKを得たが、一般adapterはまだない。

証拠: `evidence/AVOID-009/bulbs-reshape58/parent-screen-facts58.json`、`work/avoid009-bulbs59-focused/policy-revision59.json`、`evidence/AVOID-009/bulbs-oracle60/`。work資料は保存ブランチ内の同Gitパスから取得する。所在が失われた旧SHMを継続条件にしない。

side選択は「円が上なら必ず下」ではない。全phaseの所有形状が円と画面へ収まる候補を先に判定し、その中で元構成・読順・形状と余白を優先する。半径が増えれば同じ配置が成立しなくなる。contractの位置選好（中央=上下左右、上=左右/下、下=左右/上）は幾何合格の代用ではない。

入退場緩和は元ソースで実際に移動するeventだけに限定し、hold・固定plate・metadataを巻き添えにしない。safe-holdと全区間safeを区別する。電球Aは固定条件でfull-circle-strict成立したため、次実装で安易に緩和を追加する理由はない。

## 証拠の読み方と現在地

sourceレビューは実装経路と条件を確認する。rawレビューは記録された条件・全値を再計算する。静止画は標本の形・可読性を確認し、連続運動を保証しない。人間は固定版の実動作だけを確認する。いずれも他文字・全半径・全FX・性能へ自動拡張しない。親は画像動画を閲覧せず、必要な画像は別文脈solで照合する。公開結果確認は恒久禁止。

次表は履歴snapshotであり、開始HEAD `d08cd4d6be162b8ba9e93764a03b53c3551821e5` のsrc登録/分岐と受入記録の突合せ。登録13+fisheye直分岐=14IDに限定実装があるが、全面対応14/34という意味ではない。古いinventoryの全行`source-proof-pending`は初期分類値であり、現在判定には使わない。

| D ID | 現src実装 | 受入記録と残件 |
|---|---|---|
| cube | `09m`登録 | selected固定例OK。全条件/正式性能未完 |
| cylinder | `09o`登録 | cylinder-reflow固定例OK。band/各条件の限定を維持 |
| flipCards | `09p` fullscreen-field-v3登録 | fullscreen-card固定例OK。旧2行/field版は差戻し |
| accordion | `09q`登録 | accordion-selected固定2例OK。限定source |
| flag | `09r`登録 | flag-selected固定例OK、異常白帯省略の条件付き判断を保持 |
| ribbon | `09s`登録 | ribbon-selected固定例OK。限定source |
| pendulum | `09t`登録 | pendulum-selected固定3例OK。限定source |
| pile | `09x`登録 | pile-exit13固定例OK。旧入口/退出差の失敗を保持 |
| blocks | `11p_layoutsCb`登録 | native-translation03固定例OK。1cut/全体を覆う1regionのみ、複数region/gap未完 |
| balloons | `11p_layoutsDb`登録 | stage11固定例OK。bunch限定、free4/可変条件未完 |
| magnets | `11p_layoutsEb`登録 | native固定例OK。装飾overlapのmoving診断とstrict失敗を保持 |
| tiles | `11p_layoutsEd`登録 | canonical49限定adapter/固定例OK。4文字等の固定family、一般UI/export未完 |
| bulbs | `11p`native catalog、`09a`/`11zb`transport51のみ。adapter登録なし | native53統合。59/60の2行右側固定例OK。形状/side選択・adapter未実装 |
| billboard | `11p`native catalog63。adapter登録なし | canonical63内部受入。67 zero限定試験は未統合、全rawはlost/未保存で新規実行が必要 |
| fisheye | `09l`専用finalize分岐 | selected固定例OK、formal03限定性能受入。cold/全条件は別 |
| origami | `09n`登録 | gate横長/blintz固定例OK。元比率失敗は保持 |
| ledScroll | `11p`元render、`09k`分類のみ | 初期inventory以降の専用adapter受入を今回確認できず。未登録 |
| crowdBubbles | 同上 | 未登録。crowd lyricの所有除外は未確定 |
| crossword | 同上 | 未登録。grid/metadata/交差語の証明未確認 |
| wordSearch | 同上 | 未登録。主pathと補助kanaの分離/実回避未完 |
| puzzle | 同上 | 未登録。piece clip union/全文保持未確認 |
| shadowPlay | 同上 | 未登録。cast/blur/床と光源の証明未確認 |
| kaleido | 同上 | 未登録。hero実回避未完、補助反復は018 |
| dominoes | 同上 | 未登録。fall/face/pips共同配置未確認 |
| burst | 同上 | 未登録。plate ray/全文field未確認 |
| wall | 同上 | 未登録。透視/other-wall文字の証明未確認 |
| zipper | 同上 | 未登録。opaque cloth/reveal共同配置未確認 |
| sliceStack | 同上 | 未登録。slice/clip/extrusion全文保持未確認 |
| glitchGrid | 同上 | 未登録。source fragmentを補助扱いしない |
| mosaicTiles | 同上 | 未登録。sampler元/最終ink対応未確認 |
| maskReveal | 同上 | 未登録。glyph内textureはprimaryのまま |
| contour | 同上 | 未登録。直接Canvas文字/輪郭/metadata未確認 |
| halftoneBig | 同上 | 未登録。coverage sampler/duo/cap未確認 |
| stencil | 同上 | 未登録。evenodd clip/overspray/marks未確認 |
| custom（D34外） | `09k.customDrawingCapability/customGlobalEventCapabilities`で座標保持・typed unsupported | 初期13経路/39描画組と親境界レビューのみ。replace/overlay/component/global eventの実回避なし |

受入参照は [reviews/AVOID-009-*.md](reviews/) と `evidence/AVOID-009/batch-20261023/progress.json`。bulbs/billboard以外の未登録18IDは「専用回避実装なし」をsrc全登録から確認したもので、未追跡試作すべての不存在を主張しない。詳細原本は [再開記録](reviews/AVOID-009-durable-resume-20261025.md) と保存ブランチ `archive/avoid009-workspace-20261025` / `683a50d492cb2ee2967a3e7ffff40f350610dfbd`。

## 次に実装する順序

1. 電球: 人間OK済みの一枚看板構成を製品の有限候補選択へ接続する。[具体設計](reviews/AVOID-009-bulbs-next-design-20261025.md)。
2. 看板: native63を起点に新規zero fidelity→移送→所有構造の共同再配置。旧67全rawを再利用済みにしない。
3. 残り18ID: まず既存record/replayで表現できる物体（dominoes/burst）、次に直接文字（contour）を候補とする。各src依存と不足を読み、clip/sampler専用能力が必要な群より先に有限配置を実装する。これは技術上の仮順で、未調査の完成予測ではない。
4. 既存14IDの不足・複数region/gap・明示サイズとcustomを埋める。正式性能/保存本体/009全体は未合格、保存cut期待0/実際1はAVOID-013継続。010は未着手。


## 続行で得た適用例（2026-10-25、work13b3a119時点）

- 電球69/70は一枚の面・全文・元点灯時計を保つ有限行組とside選択を限定統合済み。新しい自動配置の固定比較71は人間未承認。以前OKの2行右側native例とは別。
- 看板72は板・照明・文字を一体で再配置し、元の地面へ柱と筋交いを再接続する。全面を小矩形へ縮めず、自然な2行と明示的な局所字号比.72を固定候補として評価。限定source/raw935tupleを親照合し、隔離通常JAENと本文不変6試験の前後各1回がPASS。製品Rootへはまだ未反映、原寸60fps代表比較は準備中。
- ドミノ73は列の文字順・pitch・傾き・global glyph index・倒れる時刻を保持する移送seamの実Canvas忠実性まで受入。短いTMPで起動し、同じ270rawに対して検査utilityの行番号型だけ訂正して親PASS、再描画0。円の安全性とは区別し、共同の上下移動→元の列単位の上下再配置を次候補とする。元からある左右端の入退場clipを、新しい画面外逃避の根拠にしない。
- ドカン74は共通中心の移動seamと5状態stub一致だけを親再実行。実Canvas・円回避・製品登録は未実施。

再利用する順序は、元構成・運動の不変条件を列挙→最小のprivateな配置入力→OFF/zeroと元描画の一致→所有形状と有限時計の評価→通常ビルド/必要回帰→必要な原寸MP4と独立sol静止照合→人間の動作確認。内部一致段階には根拠付きで人間確認を省略できるが、見た目を変える新候補は未回答のまま保管する。

比較HTML/MP4/PNGはSitesのみ。コード・設計・再開情報・必要な小さい検証記録はGitHub、原本数値資料は非配信Sourceへ保存。保存操作の返値を記録し、公開結果確認と保存後の取得確認は行わない。過去のHTML例外承認は今後の追加根拠に使わない。全009・正式性能・保存本体は未合格。
