# 電球 source80o：現在フレームの検査と直接描画

2026-10-28。実装担当 gpt-6.1-sol / medium、親が source / raw を独立照合。掲載済み6候補の人間承認を維持し、同じ動画の再承認は求めない。今回の結果は未登録の実験経路の限定数値検証であり、製品 adapter / 上位 cache / UI 接続の完了ではない。

準備済みの入力所有モデルと、元 Canvas 操作列で検証した配置先から、現在の時刻に対応する最大3パスだけを検査する。全時計のモデル生成・配置計算・held quality 評価を通常 frame から呼ばない。時計索引は準備時に実 selector の全 active 行と順序を照合する。任意の実時刻は Float64 preimage 内で照合し、`firstTime` に置き換えない。

描画前に同じ入力、モデル在籍、既存の正確な字体・描画依存、実 Canvas 状態、現在の root / glyph CTM / TextMetrics と支持包含を確認する。新しい Canvas も現在フレームの実測で検査する。描画時には私有の一回限りの発行情報を使い、元の `P.shift` と native source を直接実行する。文字・字幕・輪郭・電球・halo / glint と所有情報を保持し、詳細 catalog 配列は生成しない。観測していない catalog を作ったことにはしない。

親レビューで、簡略化し過ぎた字体依存、配置記録と次の compile の同時容量、挿入後の容量拒否、未終了 token の保持、末尾時刻の適用範囲を指摘・修正した。全 owner accounting は既存配置記録と active frame の予約も含む。描画終了・失敗時には token / lease を失効する。共有 Canvas の例外後復旧は変更していない。

## 検証

- `frame-data-test.cjs`：親も19項目 PASS。native layout の対応、active clock の欠落・順序、時刻範囲など。Canvas の資格を意味しない。
- dev の4 JS / test は実行版と byte 一致。3 patch は空 context 行の whitespace 検査に合わせて zero-context 形式へ変換し、隔離した作業コピーへの適用結果が実行版と byte 一致することを親が検証した。演算・描画ソースの変更はない。
- Qt actual01：literal exit 0、complete=true、errors=[]、39 pins 不変。37 raw、decoded 7,722,341 bytes / gzip 409,434 bytes。全 raw の両 hash / bytes を親が照合した。
- 復帰後の追加比較も含め、13比較フレーム / 34 own パス / 884 paint 記録。時刻境界、逆順 seek、新しい Canvas を含み、旧 source68 の独立直接描画と primitive / path / arguments / state / owner / clock / root / result が一致。全画面 RGBA の SHA256 も一致した。親は画像・動画を閲覧していない。
- 未知 ticket、別 plan、期間外、負時刻、context 不一致、モデル退去、通常 `J.addUserFont` による字体変更の7ケースで、指定した型付き拒否、bitmap 不変、compile 増分0を確認。
- 二重 prepare、未消費 finish、失効後 abort / finish と、その後の通常描画を確認。モデル退去後は明示 prepare 1回で再生成し、その後の描画は compile 0で oracle と再一致。
- Qt service PID 27073 は終了・回収済み、port 9333 は未使用を親も確認。公開 URL / HTTP / media 確認、Site 変更、Git への raw / media 追加は0。

実行系は Node 24.19.0、PyQt 6.11.0、Qt runtime / QtWebEngine 6.11.2、Chromium 140.0.7339.225。固定8字体。同じ Qt 系列の新実験であり、旧 Playwright Chromium の受入を流用しない。

## 性能と残る範囲

診断 observer を入れる前に、同じ Canvas で元描画→新描画を250組測定した。測定呼出し内に raw I/O はないが、初期化結果は先に export 済み。JS / native Canvas API の実行時間であり、UI / rAF / display / GPU fence の測定ではない。元描画と compact recipe では描く幾何が異なり、純粋な管理処理の overhead だけを取り出した値でもない。

| 指標 | 元描画 | 新描画 | 各対の差 |
| --- | ---: | ---: | ---: |
| 中央値 | 1.8 ms | 5.0 ms | 2.9 ms |
| p95（nearest rank） | 23.6 ms | 34.1 ms | 32.4 ms |

新描画は47 / 250件が16.7 msを超え、最大210.3 ms。準備・配置先作成を含む初期化計測区間は16.3544秒。原因はまだ特定していない。全時計再計算を frame から外した構造上の改善と、実用性能の達成は別である。1秒は利用者指定の受入閾値ではなく、今回も性能合格を宣言しない。

初回は日本語「風の先へ」seed1205、960×540、noPost / fast / scale1、単一cutの限定域。入力由来の候補選択結果は one-row-compact、delta `[0,94.40105101731228]`。固定値を通す分岐はない。`0 <= t < plan.duration` の未確定 native plan と実験用 opt ticket だけを扱い、既存69の広い登録済み時刻範囲を置き換えない。別文字列・別円のモデル検証80nを、別文字列・別円の通常 frame 検証と数えない。

次は成功する別文字列・別円の通常 frame、遅延の支配項の観測、製品 admission / cache 接続、UI の分割準備と依存整理。残5演出は未接続であり、看板の source descriptor / 全部品・全時計検証契約を別途準備済み。共有 Canvas の大幅な例外復旧変更は引き続き別扱い。

正本証拠は repo 外の `/workspace/jizura-logic-evidence-20261027/bulbs-frame80-actual01`、`bulbs-frame80-parent-review01.json`、`parent-frame80-review.py`。製品 src の未保存試作と混同せず、dev unit のみを段階保存する。
