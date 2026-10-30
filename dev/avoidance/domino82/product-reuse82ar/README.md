# Domino product previous-model reuse 82ar

担当 gpt-6.1-sol / medium。開始HEAD0d0b7475。保存済み82aqの5moduleと字体入口を、既存未commit82aoの製品接続へ反映した。82ao元sourceはdomino-product-ui82ao-before-performance82apの28files/14,297,666B、82aq frozenはsourceprep06-finalで保持する。元差分を消さず、AO generatorを呼んだ後にcore内module置換とDOM字体入口だけを適用する。

## 製品動作

同入力再準備は前回の私有model/clockを新世代へ発行する。円だけ変われば前回dyを優先して全支持を新円評価。不適合は旧cache参照を解放し元cold候補生成へ戻る。新入力・字体/公開metrics revision・viewport差はcoldへ。旧bitmapとcertificate/ticket/handleは先に失効。明示cancel/stopはpreviousも解放する。字体revisionを緩めず、完了済みの同一字体要求/Face集合・属性/fallback/同revisionだけ重複loadを省く。電球/ドカンの字体入口は変更しない。

保全AOからの製品差はsrc/11zz13_domino_core82.js、src/12_ui.js、index.html、en/index.htmlだけ。既存AOのrenderer/native source/output/パネル接続は保持。4module(model/owner/runtime/session)はAQとbyte同一。controllerは後述の非対象routing条件1個だけ追加差がある。AQ frozenは変更していない。

## 実製品01

同じ480入力の主な数値（各1回の条件付き値）:

| 条件 | wall | max step | 準備native/shifted |
|---|---:|---:|---:|
| 初回 | 6888.9ms | 157.3ms | 500/250 |
| 同入力replan | 209.7ms | 9.0ms | 0/0 |
| 円再評価 | 686.2ms | 42.8ms | 0/0 |
| 不適合cold fallback | 5428.8ms | 49.7ms | 500/250 |

AQ実行の同条件と全semantic model/normal frame/dyが一致。全250owner/3064支持を新円で評価し、衝突時は合計81支持で打ち切りcoldへ。dy227.2677143492043とcold描画hashが旧版対照に一致する。prepare内計測を省いても描画前の現在frame評価は残る。43 X範囲外は原clipの保持であり全方向stage内ではない。

旧planのbitmap前拒否4件、取消後cached/resident/pending/active/ticket/surface/ownedPlanBytes全0。共通/AE/MP4/PNG入口はDOMINO_UI_OUTPUT_UNSUPPORTEDでproject/encoder処理前に拒否。UI screenshot/export dialog/位置編集/詳細も対象を拒否し、main readyを保持。画像/動画/file/AE生成保存は行わない。既存burst480・bulbs自然480の正常描画hashは82ao03と一致、3session排他とcenter復帰hash一致を確認した。

## 非対象routingの局所修正

01後のpureで、未準備診断だけでもplanBinding.needsがplan全体をhook対象にする旧AO条件を再現。mixed planのmanual時刻まで拒否しうるため、82ar内でその1条件を正式trajectory/sourceAdapterの存在へ置換した。診断だけの場合は既存frame target判定に従い、formal trajectory/ticket/対象時刻は引き続きprivate guardへ入る。raw aliasをauthorityにはしない。

pure7件でmanual時刻false、対象時刻/正式trajectory/ticket true、他演出falseを検査。02はmixed manual/locked各1件だけ実行。UIと正式finalized planの別Renderer hash一致、auto対象時刻bitmap前拒否、元位置編集/詳細open-closeを確認。01成功のwarm/円/他演出を再実行しない。01のsourceはsourceprep01へ保存し、最新02との差を分離した。

## 未解消のcold留保

AQ new04ではcold17838.7ms/max1157msを観測した。phase profileが空で場所/原因は未確定。字体loaded8/unready0/revision4が安定していても事前poll gap544.5msがあり、CPU/GC/個別font待機時間は記録がない。環境負荷と断定しない。現製品01の別の6.889秒という値で解消扱いにしない。初回cold/新入力の性能目標は未達・未判定のまま、warm改善を安定性能や全入力の受入へ拡張しない。

## 独立再検証

証拠基点 /workspace/jizura-logic-evidence-20261027。追加Qt不要。

    node dev/avoidance/domino82/product-reuse82ar/routing-test.cjs
    PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/domino82/product-reuse82ar/check.py /workspace/jizura-logic-evidence-20261027

01は181pin/2raw、02は183pin/2raw、両方complete=true/errors0/postPins不変。各actualのproduct-ui.json.gz/result.json、同名-runtime/host.jsonが正本。01の変更3pinはdomino-product-reuse82ar-sourceprep01/pins.jsonへ解決。旧raw/result不変。両run正常3窓close/所有子回収/signal0/port閉、Qt旧zombie1132/live0。各生成前10GB以上、1GiB floor＋各16MiB、同時1件、各raw8MiB/総128MiB/gzip32MiB/owner8MiB上限を維持。媒体/公開0。

生成: python dev/avoidance/domino82/product-reuse82ar/generate.py "$PWD"
日英build: PYTHONDONTWRITEBYTECODE=1 python build.py
再生成byte一致を確認。builderはbuild-test.py ROOT NEW_SOURCE、routing残件は末尾routing。source01/02を上書きしない。完了済み02:

    BILLBOARD_MODEL81_RELEASE=PREPARE_PROFILE81P PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/qt-resource-runtime/run_probe.py /workspace/jizura-logic-evidence-20261027/domino-product-reuse-source82ar02 /workspace/jizura-logic-evidence-20261027/domino-product-reuse-actual82ar02 --expected-bytes 16777216 --timeout 180

## 既存回帰と歴史checker

現製品の合格根拠は82ar01/02と本checker。旧83be rawを現製品の実行証拠にはしない。既存83be pureは非対象DOMのVM stub/stop戻りstateだけを加え、56+30件PASS。旧83be checkerの「現在src/UI/HTMLが旧版そのもの」という前提は、旧final source snapshotを解決して検査する歴史範囲へ明示変更した。出力historicalProductSnapshots=true。修正前test/check.pyをburst-product-ui83be-sourceprep13-fixture82arに保存し旧raw/resultは不変。

電球のfont queue6、route15、session14/race28、hidden9、failure99、routing50、AE38/hidden4/MCP15もPASS。これらはpure/mock回帰で、実描画は本製品runと区別する。旧snapshot整合とfixture互換維持を新製品全入力合格に使わない。
