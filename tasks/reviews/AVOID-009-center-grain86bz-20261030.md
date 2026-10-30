# 電球 UI 試作：center 回帰の粒子対照（86bz）

実装・診断担当 gpt-6.1-sol / medium。先行 86bx の center 回帰 07・08 は別 Renderer 間の画素 hash 不一致として失敗のまま保持する。その後、同じ plan でも Renderer ごとに `Math.random` から粒子を生成することを確認し、86bz で粒子だけを揃える限定対照を行った。

Qt 6.11.0 / WebEngine 6.11.2 / Chromium 140、720×405、t=0.5、center、通常描画オプション。元の plan は変更せず、texture 強度は 0.6、style grain は 0.4 のまま。元の candidate/reference は異なる粒子と画素 hash を示した。試験内で reference の粒子 4 枚を candidate と同じバイトに一時的に置き換えると通常 UI と stock frame の両 hash が candidate と一致し、元の粒子へ戻すと reference の元 hash に戻った。字体 face、文字計測値、layout、plan は両者一致。この入力・時刻では粒子の差が hash 不一致を説明する。粒子以外の一般的な回帰や全演出・全時刻を保証するものではない。

親が source pin 11 件、raw 6 件の hash と対照・復元の数値関係を独立照合。実行は管理 Qt runner による一回で、3 窓正常 close、所有子回収、残存子・強制 signal 0、port 閉を確認。原本・粒子データ・runtime sidecar は Git 外 `/workspace/jizura-logic-evidence-20261027/bulbs-center-grain86bz-actual01` と対応 source に保持し、生成スクリプトのみを Git に残す。これは参考対照であり 07・08 の失敗結果を書き換えない。

86bx は自然な 480×270 viewport に未対応。限定 720×405 でも約 12.4 秒の準備と最大 550 ms の処理区間、全時刻の独立 paint oracle 未実施が残るため、製品への自動登録・性能合格にはしない。承認済み動画、製品 source、公開 Site は変更していない。
