# Domino native sample reuse 82ap

担当 gpt-6.1-sol / medium。開始HEAD62934a19。既存の未コミット82ao製品差分は変更せず、独立sidecarだけで同条件を比較した。これは単発・固定順の最小性能観測であり、製品反映や目標達成の記録ではない。

## 変更は1点

250ownerの候補作成で計測したnative sampleを、そのprepare内の採用解検証で再利用する。旧版はnative候補250＋採用先native250＋shifted250=750sample。新版はnative250＋shifted250=500sample。候補は元の解析的intervalから決める1つのdyで、候補数/採用dy/全owner/全part/時計を減らさない。全候補の総当たりやサンプル順位付けは追加していない。

compilerが内部で生成したnative rowをprivate jobが保持する。外部raw/modelをauthorityにしない。既に検査した内部値に新しいschema再検査を加えない。nativeRowsのserialized byte数を各rowで1度だけ累積し、compilerとownerの8MiB予約に含める。採用先のshifted sampleと全支持の円/Y/原X同一性評価は従来どおり行う。消費後native row参照をnullにする。取消/旧generation/破棄は従来のjob寿命境界を使う。

保持増の見積は旧82alの全250native sampleでexact JSON2,395,124B、ほかrow識別/配列管理が数KB。これはJS heap/RSSの測定ではない。採用検証中は元cache全量を保守的に予約し続ける。8MiB上限を緩めず新版実行を完了した。sample保持により大きな同期serializationが増えるためmax step悪化も記録する。

## 固定順の同条件比較

証拠基点 /workspace/jizura-logic-evidence-20261027。凍結domino-normal-options-source82an02のHTML/normal controller/issuer/root/geometry/字体/sourceを両版へ同じbyteでコピー。現在の82ao製品bundleは用いていない。480×270・同じ入力/円/字体・同じ250owner・同一runtimeでold→newを1回ずつ、別Qt processで実行。

| 測定 | old | new |
|---|---:|---:|
| 総prepare wall | 6018.9ms | 5352.9ms |
| owner begin→正式ready loop計測 | 5826.6ms | 5226.9ms |
| step数 | 501 | 501 |
| max同期step | 38.3ms | 93.3ms |
| native sample | 500 | 250 |
| shifted sample | 250 | 250 |
| 採用owner | 250 | 250 |
| 候補数 | 1 | 1 |

総wallは666.0ms/11.065%短縮した単発観測。字体は事前ロード済み。計測開始はcontroller作成前、終了は正式plan ready後で、同じ未準備bitmap拒否probeを含む。loop elapsedはbeginPrepared前から正式ready後。新旧の同期計測は同じ範囲。normal描画/hash計算は計測終了後。固定順/各1回で、安定改善・正式性能受入とは断定しない。5秒以上と同期93.3msが残り、製品には適用していない。

全semantic modelのhashは2659553528b80e417f6cf3f7c33706083f340bb9f8e2163304a6fc2d23ecc019。model全keys（全rows/supports/glyphs/index含む）をexact-Float64化し、性能/予約に依存するbudgetだけを除いたchecksumで一致する。新model全rawを重複出力していないため、checkerはpin済みのhash生成範囲も検査する。全clock hashも一致。採用sourceDy141.88506953843137、候補数1は元vertical/visual sourceが保証する数で、driverのfieldはその定数を記録する。normal .2秒のframe hashは2bd27d22abbe581d046c7e575c3b6b7f15721bd89b929d11122146c56ad59f9dで両版一致。全時刻の実paintを再描画する比較ではない。原X clip保持/Y円と全方向stage内を混同しない。

両版complete=true、各178pin/3raw、旧generationはDOMINO82P_GENERATION_STALE、owner/pending/active/ticket/surface全解放。両runで正常3窓close/所有子回収/signal0/port閉。終了後Qt live0/旧zombie1132増加なし。容量10.26GB、1GiB floor＋各16MiBを確認し、同時実行1件。媒体生成/閲覧・公開確認0。

## 独立再検証

repo rootから既存rawのみ検査する。追加Qtは不要。

    PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/domino82/native-reuse82ap/check.py /workspace/jizura-logic-evidence-20261027

checkerは両版pin/raw/cap/lifecycle、同input/viewport/円、変更しないsourceのbyte一致、全semantic model/全clock/採用結果/normal frame hash、sample数、解放、82ao保全差分不変を検査する。最終snapshotがあれば同じbyte/hashを確認する。

生成: python dev/avoidance/domino82/native-reuse82ap/generate.py "$PWD"
compiler/owner 2moduleの再生成byte一致を確認する。
sidecar生成: python dev/avoidance/domino82/native-reuse82ap/build.py "$PWD" <new-source-directory> old
新版は最後の引数new。凍結済みsourceを上書きしない。

完了済みrun（再実行不要）:

    BILLBOARD_MODEL81_RELEASE=PREPARE_PROFILE81P PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/qt-resource-runtime/run_probe.py /workspace/jizura-logic-evidence-20261027/domino-native-reuse-old-source82ap01 /workspace/jizura-logic-evidence-20261027/domino-native-reuse-old-actual82ap01 --expected-bytes 16777216 --timeout 180
    BILLBOARD_MODEL81_RELEASE=PREPARE_PROFILE81P PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/qt-resource-runtime/run_probe.py /workspace/jizura-logic-evidence-20261027/domino-native-reuse-new-source82ap01 /workspace/jizura-logic-evidence-20261027/domino-native-reuse-new-actual82ap01 --expected-bytes 16777216 --timeout 180

総wall/loop/countは各actualのproduct-ui.json.gz、hash/normal描画/解放はfinish.json.gz、実体台帳はresult.json、回収は同名-runtime/host.json。比較の基盤と8MiB/各raw8MiB/総128MiB/gzip32MiB上限を維持した。

82ao保全はdomino-product-ui82ao-before-performance82ap/pins.jsonの28files/14,297,666B。旧製品差分も変更していない。実験2runは失敗なし。今後の製品適用・追加実験・他入力への一般化は親レビュー後に判断する。
