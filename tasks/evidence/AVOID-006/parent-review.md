# AVOID-006 親レビュー

2026-10-19。候補はまだ受入・公開していない。実装は `gpt-6.1-sol / medium` の担当へ委任し、親が下記を確認する。

## 固定基準と通信

- 変更前は `b64ee11e9a762942643babd4f637ded8efdd8b42`。005のStack修正を利用者が受入済み。基準HTML/src/devは `/workspace/work/avoid006-before` に固定。
- 開始時の実行環境は spec/observed 38/38、observations_current=true、unrestricted/enforced。保存設定参照、実行中policy、通常HTTPSの結果をそれぞれ initial-environment.json / runtime-network-policy.json / initial-https.log に保持。proxy・CA・TLS検証は維持。
- 005完了記録b64ee11のPages実行 [39236698470](https://github.com/mokusatsu/lyricfx.JIZURA/actions/runs/39236698470) は成功。これは006候補の公開検証ではない。
- 変更前で必須回帰3本（upstream_parts / imported_effect_details / effect_preview）を元のassertionのまま実行し、日英とも成功。Windows固定browser指定だけ既存のpreloadで `/usr/bin/chromium` に置換した。原始ログは [baseline-before](baseline-before/results.json)。変更後も同じ3本が成功。最終候補の節を参照。

## 実装担当への指摘と受入基準

1. splitScreenは文字だけが移動しても、反転色の背景境界との関係を失わないこと。背景のclipはworld固定、所有するコマや窓のclipは所有単位に追従させ、実画素で確認する。
2. 新規Canvas polygon/nativeText記録は混在path・座標行列変更・未対応text stateを黙って受理しない。raw textにも既存glyph上限を適用し、device pixelのAA余白を確保する。旧004の拒否試験を弱めない。
3. 時刻を固定した描画1枚を全区間の証明にしない。出現時だけの要素、複製、overshoot、clip、退出も含む解析的な包絡と、受理するparameter範囲をsourceごとに記録する。実時刻・画素検査は反証検査として別に扱う。
4. 通知・フィルム・券面の元からの画面端cropと、回避のために主歌詞を画面外へ逃がすことを区別する。holdの可視性・文字と枠・読む順を保持し、stageでboundsを切り捨てただけの判定を認めない。
5. 全26IDに実際の安全例とframe証拠を用意する。小さな端の円を用いる場合は標準条件との違いを明記し、動かない診断例だけを実用的な回避の成立として扱わない。
6. subtitleBarの大きな淡い複製とperspectiveの奥行き複製はprimary。補助はsourceで特定したjustified埋め草、ticker帯反復、edgeFrame外周反復だけ。分類を主歌詞の有無や名前だけで決めない。
7. 主歌詞・所有板・注釈を一体で動かし、Stackで否認した独立分散を再導入しない。contentScale・cameraを含む座標系は実呼出順で検証する。
8. 初期のtransparent primary画素auditは `{...env,ctx}` だけを差し替えており、makeEnvが閉包に保持するcircle/arc/rrectの描画先を切り替えていなかった。所有板の画素を取り逃がすため担当へ修正を返した。audit用makeEnvの再生成、alpha>=1、円とmarginの検査、文字が円外で板だけ円へ侵入する負例を必須とした。欠陥helperを使った比較capture/public検証は未実施。
9. 包絡のcoverageは、primitiveの各頂点が別々の包絡に入るだけでは不足する。primitive全体が同じ凸包絡に収まる判定へ修正し、間隙をまたぐ辺の見逃しを防ぐ。この強化で見つかったpanels/filmstripの反例を修正担当へ返した。
10. `layoutsA:true` 単独でも抑制行の本来のcontentScaleを復元する。再finalizeで選択対象・parameter・font revisionが変わる場合、前回の軌道を残さず原入力から計算する。
11. justifiedの極小正densによる予算判定前の巨大反復生成を拒否し、native parameterの範囲・配列/文字列の資源上限を定義する。
12. subtitleBarの淡い大文字のmotion識別をサイズheuristicに依存させない。明示したsource metadataで包絡を作り、下部の字幕が固定帯から離れないようbar配置では縦移動を認めない。撮影UIの固定文字はsource-backedな独立装飾として分類する。
13. thought bubbleのblobがreplayで抜ける不備を修正し、未知event種別を黙って落とさず失敗させる。全26IDのnative記録/再生の画素一致を必須とする。
14. filmstripの送り方向は傾き後の軸に沿う。panelsの鋭角joinはCanvasのmiter limit超過時のbevelを含めて境界を求める。解析包絡の修正を実時刻coverageと独立oracleで検証する。
15. filmstripのflattened matrix再生に微小RGB差が出たため、A26だけでnative transform命令順を保持する修正を依頼した。最新の予備検査は26ID×4時刻の104枚がRGB/alphaとも完全一致し、許容誤差の例外は導入していない。最終候補での再検査と旧basic経路の回帰が残る。
16. variant試験で任意のunsupportedを成功に数えない。許可する未対応理由を限定し、描画例外や測定の欠落は失敗として残す。標準探索・安全例・角の小円による診断例を比較画面で区別する。
17. 親の独立検査で、受理する出力scale 0.1/0.5/2/4と担当試験とは別の6時刻を組み合わせたところ、lowerThirdとmirrorが `ENVELOPE_VIOLATION` で失敗した。残り24IDは576 frameの検査を通過したが、全26ID合格とは扱わず修正を返した。通常A26の78枚と旧basic16の48枚は基準b64ee11と完全一致。[失敗時の固定ログと再現script](parent-preliminary-01/result.log)を保存し、修正後に再検証する。

## 比較ツールの親確認（製品受入前）

- 分離worktreeで作成した4ファイルを統合。変更前はb64ee11のHTML/sourceに固定し、描画scriptを変更せず編集UIの起動だけを隔離した文書で実行する。原本と実行文書の両方のhash・正規化手順を保持する。
- 8組の予備比較、16枚の原寸再描画、同じ時計による4動画、desktop/mobile操作を検証済み。破損12件と実再生開始後の描画失敗注入1件を拒否した。[担当記録・ログ](tooling/AVOID-006-tooling-report.md)。
- 最終定義は187組。予備比較後に全26IDの安全例定義を更新しているため、予備比較を187組の実行証拠には使わない。最終撮影・公開全byte検証・日英起動は未実施。

## 親による最終候補の独立検査

候補JA `38b8edf31aaecaa667e1e0248ccc5fa3bbf68380333f819683fdfb6494f3ebe4`、EN `9fe491dc1bf791b8567fa8e088ba4e705d78de04556c9439891e1ec51c5e9cb5`。実装担当が製品source/生成HTMLを固定した後に実施。

- lowerThirdの移動する端の四角、mirrorの移動する水平線の端点に対し、全移動区間の包絡へ実寸を含める修正を確認。鏡像の揺れは中間時刻の任意の偏りを基準とせず、準備時の水平偏位を0にして最大振幅±0.035×文字サイズを包含する。AA余白を一律に広げる変更ではない。
- [独立script](parent-independent.cjs)で、元のA26描画78枚（26ID×3時刻）と旧basic16のstaged描画48枚（16ID×3時刻）がb64ee11と完全一致。親が追加した624実frame（26ID×出力scale 0.1/0.5/2/4×6時刻）も全件成功。区間包絡と実描画polygonの13,242件を別oracleで検査し、侵入・coverage失敗・描画例外なし。[結果](parent-independent.json)。
- upstream_parts / imported_effect_details / effect_previewは元のassertionのまま変更後も日英成功。実行前後のHTML hash一致も検査。[結果](parent-final-regression/results.json)。変更前の3本も成功しており、既知の保存初期cut不一致をこの結果で成功へ置換していない。

## 最終コード・試験承認（2026-10-19）

親は上記17件の指摘への実装、26IDのsource対応表、解析契約、最終試験のscript/log hashをレビューし、固定候補のコードを承認した。これは比較画像・公開版・人間の動作確認の完了判定とは別である。

- [最終機能試験8本](final-candidate/functional-summary.json)は全てexit 0。494条件はsafe 162 / insufficient 332 / unsupported 0 / errors 0。26IDの安全例、104枚のnative記録/再生一致、26件のprimary raster auditを含む。
- acceptance 40検査・recorder負例7・variant 69、832実frameと15,156独立polygon、splitScreen/subtitleBarの明暗4条件の実画素コントラストを確認。safeと制約不足を区別し、標準位置で全26IDが避けられるとは主張しない。
- 旧basic 144条件、acceptance 46検査と144 raster、stage 118、Stack 30条件と60 controlが成功。Stackの一体配置を保つ。
- [既存basic性能](parent-basic-perf.log)をブラウザ競合なしで実行。100/1000カットのplanning倍率は1.950/1.890、追加render p95は1.30/1.10msで既存2倍/+3ms予算内。A26全体の最終性能評価は017であり、この結果と同一視しない。
- [時計境界の補助検査](parent-clock-boundary-probe.json)8条件16frameも成功。build再生成後も固定source/JA/EN/fixture/inventoryの10 hashが一致。

残る必須条件は187組の比較撮影と親の目視、公開全byte・日英起動・操作検証、人間による演出の動作確認。006は未完了で、007には進まない。

## 比較撮影01の失敗（受入・公開しない）

187組と4動画を撮影後、生成比較HTMLのフォントcoverage検査がU+25B8で失敗した。実行時の描画記録にも含まれるfilmstripの記号U+25B8が同梱Noto自体にないことを担当が特定した。文字集合への単純追加では解決しないため、ライセンスを含む固定した記号fontをUIとCanvasに同条件で供給し、実描画文字のcoverageも検査する修正を依頼した。製品コードや幾何試験の失敗ではない。manifestなしの部分成果物を公開せず、[失敗ログ](capture-01-failed.log)と[全ファイルhash・退避先](capture-01-failed.json)を保存。修正後は未使用のbuild IDで再撮影し、01を上書きしない。

### 記号フォント修正の親承認

指定担当の比較ツール3ファイルだけをレビュー・統合した。[統合hash](tooling/font-fix-integration.json)。Notoに収録済みのglyphを置換しないdisjoint cmap / unicode-rangeを用い、Notoにない記号のDejaVu subsetとライセンスを同梱。UIと実描画iframeで測定前に読み込む。最終HTMLだけでなくCanvasのactualTextDrawsもcoverage検査へ追加した。

[回帰結果](tooling/layouts-a-font-regression-final.log): 全187定義×4表示分岐、失敗01の実際の最終HTML、source escapeだけで記号を表す反例、6つの原寸raster/metric比較、filmstripの実描画hold PNG/文字/paramsが成功。Chromiumの実使用faceがdownloaded DejaVuであることも確認。比較用フォントの不足を黙示system fallbackで成功扱いしない。製品・fixture・入力条件の固定10hashは不変。新しいbuild02を撮影する。

## 最終ローカル比較・目視（2026-10-19）

build `local-20261019-02`。187組・374UI PNG・374原寸PNG・4動画、775assetsを生成。ローカルvalidatorは全374原寸再描画一致、日英アプリ起動、画像表示、比較mode、項目リンクに成功。破損12件と再生開始後の実描画失敗1件の拒否も成功。[検証集約](local-verification.json)。

親は[通常通信の操作検査](local-parent-ui/results.json)で26安全例リンク、mirror/perspective/splitScreen/edgeFrame/ticker/chatの実再生・シーク、保存不変、font revision不変、同時刻描画、スマホ幅を確認。外部リクエスト・page errorは0。全9枚のcontact grid（26anchor＋8注釈/補助/enter例）、comparison top、mobile sample、edgeFrame原寸を実際に開いて目視した。主歌詞・枠・順序・反射・遠近の結合、文字サイズの維持を確認。全187組を人間相当の目視で確認したという意味ではない。

8つの角の小円診断例（justified/subtitleBar/splitScreen/sideways/panels/filmstrip/quote/ticket）は通常の中央円の回避成功を示さない。rulerは円外にある元配置を保持する例。非ゼロoffsetだけを実侵入の解消証拠とはしない。H03ではtickerのLIVEタグが主歌詞とともに動き、補助帯との距離が変わる。edgeFrameの主歌詞は外周に近づく。所有する要素のまとまりと、補助を元位置に残す契約には整合するが、演出としての自然さを人間に確認する。

コード・ローカル試験・比較成果物を承認し、公開検証へ進める。人間の演出確認は必要と判断し、公開が通っても回答前に006を完了しない。007へ進まない。

コミット前のwhitespace検査では、原文のまま同梱したDejaVuライセンスの2行だけ末尾空白が報告された。固定bundleのライセンスbytesは変更せず保持し、この1ファイルを除くstaged全差分の検査が成功。実装sourceの警告を除外したものではない。
