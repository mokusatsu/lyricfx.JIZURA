# 電球の通常フレーム：CPU サンプリング診断

2026-10-28、既存環境で未変更の80o試作を使用した診断。Node 24.19.0、Qt runtime / QtWebEngine 6.11.2、Chromium 140.0.7339.225。プロファイラーを有効にして通常描画250回、続いて元描画250回を実行した。描画・Canvas・J helper の置き換えや paint observer は使用していない。通常描画を先に測った順序、プロファイラーと protocol 処理の影響があるため、この結果を既存の非診断性能測定や UI の性能判定に置き換えない。

literal exit 0、complete=true、errors=[]。34入力 pins と30 rawの bytes / 両 SHA256 を親が照合した。decoded 6,124,985 bytes / gzip 2,498,675 bytes。Qt PID 28769 は終了・回収され、port 9333 は未使用。profile の記録上限と、証明状態の従来どおりの8MiB上限は別である。

通常描画は4,540 samples、そのうち garbage collector の leaf は3,068 samples。元描画は1,672 samples、そのうち garbage collector は1,103 samplesだった。両経路で多いため、これだけで通常描画の遅延原因を特定できない。通常描画の leaf には `exact` 106、`byteLength` 82、`jsonStringBytes` 78 samplesもあり、source の正確な依存 snapshot と serialized 容量計算に関わる関数が観測された。sample 数は時間や割当量を直接証明せず、native 呼出しは JS 呼出し元へ帰属し得る。

`scalar-metrics80.js`、`model-owner80.js`、`frame-controller80.js` の script body はそれぞれ固定入力と hash 一致した。inline HTML の script body を HTML ファイル全体の hash と同一視していない。scriptId 29 の `Debugger.getScriptSource` は `No script for id: 29` と失敗し、対応不明として記録した。profile 自体は完走しており、未取得の body を推測していない。

次の変更候補は、全時計の支持と品質、字体・source 依存の照合、退去後の拒否、容量上限を保ったまま、通常 frame 内の反復 serialization / snapshot に伴う割当を削減すること。変更前に source 差分と純粋検証、実描画での同値・失効・時間の検証を行う。製品 adapter / cache / UI や残5演出への接続は未完。1秒は利用者指定の受入閾値ではない。

詳細 raw は Git 外の `/workspace/jizura-logic-evidence-20261027/bulbs-frame-profile80-actual01`。baseJA / seed1205 の診断であり、EN や別 renderer の性能資格ではない。画像・動画、公開 URL、Sites / Pages は確認していない。
