# ドミノ73: Canvas gate source提出 / RAMのみ未永続

Root準備: work/avoid009-domino73-isolated/handoff73.md。既存source/pureは親実行PASS。ここにある新Canvas fidelity sourceは未実行・未保存。容量回復/親sourceレビューまでpause。

current4source: browser73.js、oracle-source73.cjs、runner73.cjs、pure-gate73.cjs。exactSHAはsource-submission73.json。draft01-*は過大だった2500frame初稿、未実行の履歴として保持。新ソースはRootへコピーしない。

限定範囲: 960×540、dela/light/pips、seed1205、風の先へ(1row)と風の先へ歩いて行くよ(10glyph/元2row)。lt=[0,.15,.35,.55,.76,1.5,3.8,4.05]×[main,A,B]の24tupleと、fractionalroot/scale代表(.23,B,.5)/(1.5,main,2)の2tuple。lag/makeEnvは既存native62と同じ原演算。計26tuple×2text×5mode=260直接描画/RGBA、init10件。原renderer全frameや250states/全pass安全proofは行わない。

5mode: 原HTML native、RAM overlay OFF、ON-zero、元closure oracle-moved、ON-moved(+17,-23)。元module同lexicalscopeに別native closureを置きoracleのyF/xc/接地線3幾何引数のみ変更、逆変換exact。lease/runtime/placement helperをoracleが呼ばない。native/OFF/ON-zeroはowner/追加row注記だけ比較projectionから除外、paint/state/順序/text/pips/接地線/clock/実CTM/bb/RGBAはexact。native/OFFもprimary native-chain owner、ONはprimary row owner。rawは注記を含む全値を残す。

同じ原ソースでもfinalvertex+deltaではF64順が変わるため、非zero期待値は元anchor移動後T(local)の順序を守る。これはsource fidelityであり独立支持幾何証明ではない。未知paint/styleはtyped停止。元演出/共有基盤/安全adapter変更なし。

pure（実行済み、ブラウザ無し）:
node /dev/shm/avoid009-domino73-sourceprepare-20261025/pure-gate73.cjs
HTML元module一致/overlay逆変換/oracle3引数逆監査/構文/既存source69 codec exactspan/undefined・-0 roundtrip PASS。

今後のproducer command案（未実行、単独では受入手順未完成）:
DOMINO73_RENDER_RELEASE=PARENT_REVIEWED_SOURCE73_NATIVE_FIDELITY node /dev/shm/avoid009-domino73-sourceprepare-20261025/runner73.cjs --output-dir <reviewed fresh RAM run/raw> --browser-path /usr/bin/chromium

親reviewed controllerのRootGuard/currentHEAD-index/source-runtime-input freeze→同namespace親rawchecker→成功失敗prefixの既存scopedarchiveが必要。producer自体はRAM_ONLY、controller/persistence未接続でRUN不可。codecは既存factoryを原文抽出、16MiB incoming/256MiB serialized/100k・64MiB各table上限据置。codec失敗incomingも保持し、各frameをassert前に記録。

Root/Git/source/HTML変更0、ブラウザ/build/encode/network0。PNG/MP4/閲覧HTMLの生成もGitHub追加も0。比較assetsは今後Sitesのみ。公開確認/保存後readback/拒否経路再試行0。新製品回避/全時計stage-circle/正式perf/savebody/humanmotionは未認定。
