# 看板81g：入力計測による候補幅の試作

2026-10-28。実装担当 gpt-6.1-sol / medium。親は固定17filesのbytes / SHA256とsourceを確認、純粋幅813 / family439 / model26 checksを独立再実行し、未登録source-only unit `d8893208` を保存。製品 / UIは未変更。

81f真ENの移動円では原brkが単語を保つため、従来307.2px板の0.72候補は667 ownでTEXT_FACE。品質閾値を緩めず、各文字サイズstageの現在文字列に対し、元J.layoutText anchorと同CSSのTextMetricsを測定、既存+1 fontpxのink幅からwriting field .84に必要な板幅を導出する。従来幅を下限にoutward ceilし、左右で測定を共有。7候補数・元brk / ground / font比 / タグは維持し、現入力のraw値を固定で埋め込まない。必要幅がstage / 円 / 構造条件を超えたら不足のまま。計測データ / layout配列属性 / caller予約を既存8MiB serialized予算へ合算。

幅は候補導出であり+2 devicepxや実CTM / 全clock品質の保証ではない。mock試験のため実Canvas / 全727own・7候補の品質/支持、別入力回帰、製品owner / frame / UIは未資格。元のEN失敗は保持し、次に同入力の移動円を中心に実字体・全時刻で再評価。正本はGit外 `/workspace/jizura-logic-evidence-20261027/billboard-adaptive-width-source81g`。媒体/巨大rawはGitに含めず、既承認動画の再確認は不要。

81g2修正：旧 `d8893208` はmeasurementの予算peakをfamilyのsemantic値に含め、caller予約量が違うと同じ幾何のissuer / compiler比較が不一致になる欠陥があった。実Canvas前に発見し旧版は履歴として保持、製品未適用。修正版 `8095f4ed` はmeasurementのpeakをphase callbackでfamily / width / overall peakに合算し、semantic familyから予算診断だけを分離。live measurement・コピー・report一時領域も計上し8MiBを変えない。固定17files hashと純粋813 / 439 / 28 checksを親独立確認し、issuerとcompilerのsemantic family全値一致を追加した。実CanvasのEN移動円 / 全clockと他入力回帰は引き続き未検証。

81g2英語pilot：真EN `HELLO` / seed1206 / 960×540、円(.75,.25,r=.12)で8時刻・変更4候補32比較、各21 own、計84 own / 1296 positive paint。可視Qt・8字体を確認、元clock / 文字順 / RNG / metadata比較と全84品質PASS。入力計測幅は元字号547px、0.72字号396px。両左候補はsampleの全支持がstage内・円に対しstrict clear、両右候補は円と衝突として拒否。準備95.8msはfamily生成のみ、全clock compiler 0回であり初回製品性能ではない。親は600 pins / 48 rawを全hash照合、独立Fractionで左候補648 positive paintのstage / 円clearと42 ownの文字品質・field / metadata / tag非重複を照合。独立検証script SHA256 `30ec9e6c08db2f35880ac8c5d4b51bd6cace67e334b26bdeeeb69cc498f3d02a`、品質 `47eae1ee0d2d97b2a2cbf735692208882e79d801b4fb5c2931093e1113abbb4a`。本件は8時刻のpilotで、全250時刻・実製品・UIの合格ではない。旧81f EN移動円の失敗は維持し、81g2で残242時刻を別途検証する。source/rawはGit外 `/workspace/jizura-logic-evidence-20261027/billboard-width-pilot-probe-source81g2` および `billboard-width81g2-pilot-actual01`。
