# Domino previous-model reuse 82aq

担当 gpt-6.1-sol / medium。開始HEAD f0ce0edd。未コミット82ao製品差分はそのまま保持し、候補HTMLだけへ派生5moduleとdomino字体入口を接続した。82apのnative全件cacheは採用していない。親レビュー前の最小独立単位であり、製品反映は未実施。

## 契約

ownerが前回の成立immutable model/clockを1件だけ私有保持する。replan/beginではbitmapを消し、certificate/ticket/handleを先に失効させる。font/viewport/source依存と、円index以外の全normalized inputが同一なら同円はそのmodelを新世代へ発行する。円だけ違う場合は前回dyを優先し、全支持を新円へ評価する。幾何・字体計測は再利用し、全時刻250owner/3064支持の保証は省かない。source X clip保持とY/円保証を分離し、43 X範囲外を全方向stage内と扱わない。

前回dyが新円に衝突したら直ちに再利用を止め、cache/job内参照を解放して既存cold生成へ戻る。他候補はこの時だけ既存の解析的候補1つを使う。再利用不適合を理由に従来対応入力を拒否しない。明示cancel/stop、入力イベント、viewport変更、source/font依存差はcache破棄/coldへ。activeなframeの既存revision/世代/現在支持guardは維持する。

追加保持は前回モデル1件/clockの共有。モデルrows/index/staticInputはfrozenで共有し、新円時に全モデル配列を複製しない。旧/新modelのserialized sizeを保守的に同時予約し、8MiB上限を緩めていない。明示取消ではpreviousもdropする。JS heap/RSSを計測した値ではない。

## 字体入口

初版new01はREUSE_MISSEDで失敗した。UI字体waitが同じ字体でもensureFontsを再度呼び、metrics.clearでrevisionを上げる通常経路が原因。revisionを無視する変更はしていない。

domino waitFontsの入口だけに、完了済みrequest（文字/字体/役割/lang/fallback定義）、loaded FontFace集合のidentity/属性、loader、同じmetrics.revisionのsnapshotを1つ保持する。全て一致する場合だけ重複load/cache clearを省く。共有queueのdrain完了後にsnapshotを保存する。独立clear、実字体/Face属性/fallback/要求文字の差、loading状態、確認不能は元のloadへ戻り、ownerの厳密なrevision比較によりcoldになる。電球/ドカンの字体入口は変更しない。

## 同条件の各1回の実UI観測

証拠基点 /workspace/jizura-logic-evidence-20261027。旧01と新03の同じ480×270入力/円/字体/runtimeを比較。wallはreplan直前からready確認＋2RAFまで、字体wait/通常UI作業を含む。hash計算はwall計測後。maxStepはsessionがruntime.step前後で計測し、finalize/font waitの個別時間ではない。

| 条件 | old wall | new wall | old max step | new max step | new準備native/shifted |
|---|---:|---:|---:|---:|---:|
| 初回cold | 5224.6ms | 5937.7ms | 39.8ms | 53.2ms | 500/250 |
| 同入力replan | 4637.6ms | 192.7ms | 31.3ms | 14.9ms | 0/0 |
| 円のみ変更 | 4689.1ms | 335.6ms | 26.7ms | 24.4ms | 0/0 |

同入力/円変更では全semantic model(budget除外)/全rows/clock/normal .2秒frame/dyがoldと一致。円変更は250owner/3064支持を再検査し、独立checkerも以前の同支持boundsをFractionで新円/Y評価する。準備native/shiftedが0でも描画前の現在frame計測は従来どおり残る。候補は前回位置1つで、変更円でも同じdy141.88506953843137を採用した。これは各1回の条件付き値で安定性能や一般入力の受入ではない。coldは改善していない。

## 必須境界の残件run

- old04/new04の衝突円(center .5,.2/radius .2): previous候補は81支持/23ownerまでで衝突を確定し、coldへ戻った。native500/shifted250、dy227.2677143492043、全model/rows/clock/render hashが旧coldと一致。
- new04独立J.metrics.clear: native500/shifted250、再利用せずready。厳密なrevision失効を維持。
- new04実UIの見出しfont selectをgothic_boldへ変更: cold計算してready。ただし固定params.font=delaが優先するため、描画glyph自体は変わらない条件である。
- new04 240×135: cold native500/shifted250でready。
- new05実lyrics入力「風の先まで」: cold native552/shifted276、276owner/4316支持でready。
- new05 params.font=gothic_boldという実glyph字体変更要求: 従来の限定scopeによりDOMINO82AK_PARAMSでunsupported、旧画像/旧権限は非公開。別glyph字体を表示できた証拠ではない。
- 各入力前clear、旧planのbitmap前拒否、最後の明示cancel/透明bitmapを確認。

**未解消のcold遅延: new04初回wall17838.7ms/maxStep1157ms。** session elapsed17733.9msで、step501/compile1/destination250は通常と同数。phase profileは空で、1157msのphase/indexは不明。page-initはloaded faces8/unready0/revision4/loading event0が安定したが、50ms pollの実gap544.5msがprepare前に記録されている。他runの同gapは約50–68ms。font wait個別、CPU/GC/各step時刻はなく原因未確定。環境負荷と断定しない。new05初回6063.6ms/max169.4ms、変更lyrics6273ms/max65.9msも保存。これらを解消済みとせず、製品適用判断へ引き継ぐ。

## 証拠と再検証

    node dev/avoidance/domino82/previous-model82aq/model-test.cjs
    node dev/avoidance/domino82/previous-model82aq/font-test.cjs
    PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/domino82/previous-model82aq/check.py /workspace/jizura-logic-evidence-20261027

pure8+8件は実model generator/実字体入口をsynthetic geometry/font stateで検査。実Canvas/実UIは以下rawで区別する。全semantic model/rows/clockはchecksum比較であり、新旧model全rawを重複出力していない。

| 実行 | 状態 | pin | raw |
|---|---|---:|---:|
| old-actual82aq01 | 成功・3条件旧対照 | 206 | 2 |
| new-actual82aq01 | 失敗REUSE_MISSED、cold描画は成功 | 206 | 2 |
| new-source82aq02 | producer改行escape失敗、Qt未開始 | — | 0 |
| new-actual82aq03 | 成功・字体入口修正後3条件 | 209 | 2 |
| old-actual82aq04 | 成功・cold円対照 | 210 | 2 |
| new-actual82aq04 | 成功・revision/円/font設定/viewport | 210 | 2 |
| new-actual82aq05 | 成功・実文字/glyph字体scope | 211 | 2 |

名前のprefixは全てdomino-previous-model-。各actualのproduct-ui.json.gz/result.jsonと同名-runtime/host.jsonが正本。旧build pinはsourceprep01/03/04/pins.jsonのsnapshotへ解決し、失敗/旧raw/resultは不変。最新05はcurrent一致。全6実行で正常3窓close/所有子回収/signal0/port閉、Qt live0/旧zombie1132。容量は各生成前10GB以上、同時1件、1GiB floor＋各16MiBを確認。各raw8MiB/総128MiB/gzip32MiB/owner serialized8MiBを維持。画像/動画生成・閲覧、公開確認0。

生成: python dev/avoidance/domino82/previous-model82aq/generate.py "$PWD"
5moduleの再生成byte一致を確認。候補builderはbuild.py ROOT NEW_SOURCE old|new、残件は末尾residual、最後の文字/字体はinput-font。凍結sourceを上書きしない。既存82ao未commitのproduct source/builderが依存であり、単独commitだけで製品生成できるとは扱わない。復元正本はdomino-product-ui82ao-before-performance82ap/pins.jsonの28files/14,297,666B。checkerは現在も全不変と照合する。

管理runnerの完了済み例（再実行不要）:

    BILLBOARD_MODEL81_RELEASE=PREPARE_PROFILE81P PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/qt-resource-runtime/run_probe.py /workspace/jizura-logic-evidence-20261027/domino-previous-model-new-source82aq05 /workspace/jizura-logic-evidence-20261027/domino-previous-model-new-actual82aq05 --expected-bytes 16777216 --timeout 180

製品反映は親レビュー後。82aoの未完font/円/output等の旧作業や、cold遅延を本単位のwarm改善だけで完了扱いにしない。
