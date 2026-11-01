# 通常 UI の保持時点観測（保存用）

`cadd216f` の試行に使った13演出の probe source と Qt CDP helper のコピー。QtWebEngine / pywebview を使い、同じセッションで UI の演出切替と歌詞変更、対象 cut の描画呼出し、対象 cut を除いた A/B の円内画素差を記録した。呼出しや画素差は clip 後の全文字・付属物の完全性、全保持時刻、全入力を証明しない。独立背景や対象 cut 全体を消す A/B の限界も結果で区別する。観測結果の要約は `tasks/reviews/AVOID-009-circle-normal-ui-20261101.md`。

原本の `probe.cjs` は実行環境に依存するパス `/workspace/jizura-bulbs-product-20261029` と `/workspace/jizura-browser-runtime-20261027/qt-page.cjs` を固定し、`qt-service-visible.py` は同 runtime の logs と `/workspace/jizura-regen-20261027` の font manifest を使う。別環境で動かすにはこれらを適切に設定し、Node の WebSocket、PyQt6 / QtWebEngine、pywebview、8字体を準備する。コピーした `qt-page.cjs` は同 helper の原本である。環境や入力が異なる場合は過去結果を合格として流用しない。

実行は `dev/avoidance/qt-resource-runtime/README.md` に従い容量確認・同時1件・終了回収を行う。出力はリポジトリ外に置く。対応状況を示す診断、描画あり、円内差、clip 可視性は別の結果として扱う。

`boundary-probe-trial.patch` はこの source から、不採用の保持期試作を観測した5演出・開始/終了境界用 source への差分。適用先はこのディレクトリ内のコピーであり、製品ソースへの patch ではない。

`memphis-input/` の3ファイルは別の取得 probe。通常 UI の corners / staircase / mixed について最初に一致した `memphisUnits` 入力を記録し、元関数の戻値を変えない。mixed は未採用 provider の試作を含む。実行時には、このディレクトリの `qt-service-visible.py` を probe と同じディレクトリへコピーするほか、上記の固定パス・runtime 条件を満たす必要がある。入力の保存は全候補や描画合格を示さない。

`viewport-diagnostic/` は通常 UI の完全 plan を読み、mixed / scatter の先頭 cut に `prepareViewport` を直接呼ぶ限定診断。実行環境と shared Qt service の前提は同じ。通常 prepare 全体や実描画の受入とは区別する。

`viewport-diagnostic/units-observer.patch` は、この限定診断に unit 出力観測だけを加えた差分。観測のため関数を一時的にラップし、結果記録にはその処理時間も含まれる。

`owner-candidate-probe.patch` は、このディレクトリの原本から mixed / scatter と対照 center を観測した未採用 owner 試作の probe への差分。診断と実描画は分けて記録する。
