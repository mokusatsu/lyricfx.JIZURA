# AVOID-009 domino previous-model reuse 82aq

gpt-6.1-sol / medium、開始HEADf0ce0edd。親が source・raw・結果を独立レビュー。82ao未commit製品差分は28files/14,297,666Bの保全snapshotと現path一致。対象はdev/avoidance/domino82/previous-model82aq/と本記録。製品へ未適用。

前回の私有model/clock1件を保持し、同入力同円は新世代へ再発行、円だけ変更なら前回dyの全250owner/3064支持を新円評価。不適合は81支持で早期打切り→元cold生成へ戻り、旧coldの全model/rows/clock/render hashと一致。公開certificate/ticket/handle/bitmapは先に失効。cancel/input/font依存/viewport差はcache破棄/coldへ。8MiB上限不変、model配列は共有。

初版new01のREUSE_MISSEDとproducer02失敗を保持。字体revisionを緩めず、DOM専用queue入口の完了済み要求/loaded Face集合・属性/fallback/同revisionが一致した時だけ重複font load/cache clearを省いた。独立revision/実UIfont設定/viewport/実lyricsはcoldを実証。glyph字体のscope外要求は従来どおりunsupported。font設定変更ではglyph自体がdela優先で不変だった制限を明記。

old01/new03各1回、同入力replan4637.6→192.7ms、円のみ4689.1→335.6ms、model/rows/clock/render/dy一致。同期maxは31.3→14.9ms/26.7→24.4ms。ただしcold初回は速くなっていない。new04のcold17838.7ms/max1157msは未解消の重大な留保。phase profileなし、事前pollにも544.5ms gap、font loaded8安定/イベント0、CPU/GC記録なしで原因未確定。new05初回max169.4msも保持。製品反映前に親へ渡す。

pure8+8/独立checker/5module再生成一致PASS。6実Qt run（失敗含む）全正常3窓close/子回収/signal0/port閉、旧zombie1132/live0。媒体/公開0。[README](../../dev/avoidance/domino82/previous-model82aq/README.md)に実行時版/旧pin snapshot/条件/上限/数値/残件を記録。最終snapshotは証跡基点domino-previous-model82aq-sourceprep06-final/pins.json。

親は pure16 と6実行の独立checker、45 pin・snapshotおよび5生成moduleの再現と構文を確認した。再準備の効果は製品適用を検討するに足るが、cold 17.84秒/max1157msの未解決、font設定変更の実glyph不変、対象入力の制限を保持する。warm単発改善を安定性能/全入力/全009完成にしない。
