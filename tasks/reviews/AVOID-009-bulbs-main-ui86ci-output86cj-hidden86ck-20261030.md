# AVOID-009 — 電球main UI86ci / 出力境界86cj / 非表示準備86ck

状態：最小製品接続を実装し、限定ローカル検証・親のsource/raw/管理runner確認まで完了。最終の製品統合判定、コミット/push、人間の利用上の確認要否は親が記録する。電球の承認済み固定動作を再承認へ戻す変更ではない。009全体、全入力/他演出一般化、書出し同値、正式性能合格ではない。

継続担当は親指定のproduct_finalize。開始HEAD e4097c35、元の41tracked/untracked差分は `/workspace/jizura-recovery-product86ci-20261030` にhash照合して保全済み。担当はcommit/pushなし。他演出の実装拡張、共有rendererの大規模例外復旧、公開/Sites/Pages閲覧、媒体生成/閲覧は行っていない。

## 変更と親レビューの指摘解消

86ciは既存86ccの限定prepare/frame pipelineを製品main UIへ接続。準備中/取消/再試行/typed unsupportedを表示し、入力/debounce/replan/実Canvasサイズの世代失効を先に行う。fonts/旧queued step/旧readyの結果を公開しない。対象のarea/detail/alternate Renderer/画像動画出力をmain-only境界へ限定。個別根拠は [86ci README](../../dev/avoidance/bulbs86/product-ui86ci/README.md)。準備9–11秒を高速と呼ばず、同期step中には取消イベントを処理できず次yieldで失効する制約を記録した。

親がAE/JSON/直接出力入口の漏れを発見し86cjで解消。`src/11_export.js` の共通preflightを `planForAE/exportMP4/exportPNGZip` 冒頭に置き、通常UIのAEはfilename前、CEPはconnect前・plan変換・保存直前、MCPはaudit/font作業前で拒否。`project/settings/favorites`は保存可能な編集データとして維持。非表示lyricsは出力から除外されるため許可し、UIの出力predicateも同じ条件へ限定した。個別根拠は [86cj README](../../dev/avoidance/bulbs86/ae-output86cj/README.md)。CEP host/Node fs/保存先はmockで、実AEコンポ/実出力ファイルは作成していない。

親が非表示でも電球準備を始める過剰動作を発見し86ckで解消。UI専用 `bulbsTarget86ci` の1行をvisible lyrics条件へ限定。hidden initial/replan/resizeはsession inactive/compiles0、実レイヤーボタンで表示復帰するとfonts→preparing/compiles1、再hideで旧queued世代を停止・解放する。通常アプリのfont処理全体を止めたとは主張しない。個別根拠は [86ck README](../../dev/avoidance/bulbs86/hidden-ui86ck/README.md)。

## 検証と限界

- 86ci pure63件：session14、追加failure/race28、font queue6、routing15。fonts/stage/begin/step/finalize例外、旧font rejectの新ready後到着、queued plan差替を含む。
- 86cj pure57件：対象資源生成前拒否、非対象AE JSONの旧版byte同値、CEP file/string・2await race、MCP編集形式保存、hidden lyrics除外。86ck pure9件：hidden short-circuit/visible復帰等。
- 86ci実UI01：取消遅延6.4ms、ready7.919s/maxstep61.2ms、入力失効、INSUFFICIENT_SPACE、center exact hash復帰、area/export/screenshot拒否。
- 86ci境界実UI03 JA/EN：準備中resize480×270→398×224で失効、遅延旧font完了順序、現font例外、部分画像を書いてthrow後にalpha0/モデルrecordsbindings0。readyはJA9.415s/maxstep67.4ms、EN8.388s/maxstep91.3ms。center/回避off bulbs/dominoes/burst/contour/crossword各1frame smokeは全時刻同値証明ではない。
- 86cj実UI02 JA/EN：対象のAE/MP4/PNG/MCP拒否、project/settingsと非対象AEの実UI保存経路(mock)、hidden AE stripping/MP4 dialog許可/MP4 PNG admission、mock CEPのfile/string枝。
- 86ck実UI01 JA/EN：hidden compiles0、表示復帰preparing/compiles1、hide解放・旧公開なし、再show/cancel/center handoff。9秒の完了proofは重複実行していない。

86ci境界02は幅600pxがheight制約で480pxのままとなった試験fixtureの `RESIZE_STALE` 失敗として保持し、400pxを用いる別source03で解消。86cj01もhidden除外修正前の限定結果として保持。全6実行で3窓通常close/所有子回収/signals0/remaining0/port閉を照合。生成前容量は1GiB floor+4MiBを満たし、Qt同時実行なし。

現在の全証跡checkerは `PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/bulbs86/hidden-ui86ck/check-evidence.py /workspace/jizura-logic-evidence-20261027`。親もpure9件と6実行source/raw/回収checkerを独立再実行PASS。最終86ck188pinはcurrentに直接一致。過去current-pathとの差は新設pre-edit/historical recoveryの原本bytes/SHAと照合し、`currentSourcePinDifferences`として公開する。旧raw/result/sourceを更新して成功へ置換していない。復元path/元hashは各map.jsonとREADMEに記録。

共有rendererの任意例外後のCanvas stack/内部状態復元、全時刻paint/RGBA再証明、実AE host互換、正式性能や全入力対応は今回の合格に含めない。既存実装の通常利用境界に必要な局所修正のみ実施した。

## 親の最終ローカルレビュー

親は製品差分と通常・混在・編集・別renderer・各出力入口、font世代queueおよび後始末失敗時の局所coordinatorを確認。AE JSON/CEP/MCPと非表示lyrics時の過剰準備、null等のthrowおよびcleanup failureのsticky保持を指摘し、担当が86cj–86clで対応した。最終144 source pinは全byte/SHA一致。全7実行のchain checkerを親が再実行し、旧版の変更済みpinは実行時snapshotとの照合、最終190pinは現行bytes一致、失敗fixture02を失敗のまま保持した。管理runnerの3窓終了・子回収も各実行で確認した。

親がpure session14＋race28、font queue6、routing15、出力境界57、hidden9、failure99を再実行PASS。生成14 sourceのbyte一致・JS構文、独立tmp buildによる日英HTML完全一致、`git diff --check` を確認。実験は前述の限定入力・単発wall時間であり、実AE hostや幅広い入力・全時刻RGBA・正式性能の資格ではない。電球の既承認動画は再承認不要だが、新しい準備/中止/失敗UIの使いやすさは利用者の実操作による確認がまだない。公開Siteの閲覧・公開結果確認は実施しない。

## 最終局所failure修正86cl

その後の親source reviewでcoordinatorの `e.code/e.message` がnull/undefined throw時に二次例外となりpartial frameを残すバグを発見。任意throw値の防御的正規化、primary error/cleanupErrorの分離、draw開始generation固定、finally hideをcoordinatorに限定して修正した。cleanupがthrowした後は解放の確認ができないため、失敗をsession寿命中stickyにし、後のcancel成功でもfonts/stageへ再開しない。UIは終了処理失敗と再読み込みを表示し、retryを隠す。共有rendererのCanvas stack修復には拡大していない。

[86cl README](../../dev/avoidance/bulbs86/failure-ui86cl/README.md) のpure99件＋既存session42件PASS。小さい管理Qt JA/ENは実Canvas/実DOM/製品状態callbackとfixture runtimeのnull/undefined/cleanup throwを使用し、alpha0・unsupported・原因/cleanup別記録・sticky再開拒否を確認。実proof compile0、完了proof再実行なし。4raw/errors0/postpins不変、190current source pin一致、3窓close/子回収/remaining0/signals0/port閉。元の全raw/resultは不変。

現在の全証跡checkerは `failure-ui86cl/check-evidence.py` へ更新し、全7実行を照合。変更前の8sourceは新 `bulbs-failure-ui86cl-pre-edit/map.json` で復元可能。過去checker/前freezeは各時点の履歴として保持し、最新source freezeを別manifestに作成する。人間確認要否・製品統合の最終判定とcommit/pushは親が担当する。

## 最終preserved routing/スクショ修正86cm

親最終レビューで、混在planのarea/detailが選択cutを見ずbulbs全体を拒否する過剰制限、およびcontrollerが元finalizerのprivate行lock/emphasis保持条件を欠く回帰を発見。[86cm README](../../dev/avoidance/bulbs86/routing-ui86cm/README.md) のとおり09aの同一preserved helperをfinalizerと読み取り専用accessorで共用し、controller/UIを選択cut判定へ揃えた。未知の自動lineageはsafe bypassにせず対象として拒否を維持。スクショは共通preflightをCanvas/Renderer割当前へ移動。出力や描画の安全条件は緩めていない。

新pure50件・既存routing15件・出力57件PASS。管理Qt JA/ENは通常projectからmanual/notation/実際の行lock/emphasisと同一line別partを作り、preserved4行のarea/detail、同一line part1、target拒否、actual finalizerのPRESERVED_LEGACY一致、対象スクショ割当0、preserved-only/disabled/hidden準備なしと許可側Canvas sentinelを確認。全4raw/errors0/postpins不変、3窓close/回収/remaining0/signals0/port閉。画像動画生成/実save0、完了proof再実行なし。

現在chain checkerは `routing-ui86cm/check-evidence.py`（全8実行）。実行後に追加したAE pure loaderの新helper依存だけを新snapshot原本で照合し、残る製品source/browser pinはcurrent一致。変更前10fileと後のharness原本のmap/hashを新Git外namespaceへ保持。新freezeと最終source判定・commit/pushは親へ引継ぐ。

親の86cm最終確認：新pure50・既存routing15・出力57・局所failure99を独立再実行PASS。8実行のchain checkerは旧sourceの版差を保存済み実行時snapshotで解決してPASS、最新144 source/build pinもhash一致。生成14 sourceと独立tmpでの日英buildを再生成し全byte一致。実UIの成功・既存経路確認は記録した限定条件であり、9–11秒準備、出力/位置編集の未対応、実AE hostと他演出の広い回帰・全入力/正式性能は残る。新UIの実操作による使いやすさは未確認、旧動画の再承認は不要。
