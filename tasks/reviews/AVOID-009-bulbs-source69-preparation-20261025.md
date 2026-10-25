# 電球69：fresh source proof / adapter source準備（親実行gate前）

基準work `4a76100c63b3a8b55c7c12ad9e98656ba37f9599`。原寸HTMLの元bytesは4d837と同一という親確認を受領。実装gpt-6.1-sol/medium、親source/rawレビュー。68はprimitive/seam限定受入であり、`evidence/AVOID-009/resume-20261025/source68-accepted-snapshot/` の6原文/manifestを変更していない。69は新規段階で、68の31件/親Fraction1003件をCanvas/adapterの合格へ拡大しない。

## 今回のsource

- `src/11p_layoutsEf_bulbs_proof69.js`: 59のdyadic atomと品質算術を抽出。P48から汎用clock/makeEnv/contextState/paintSignatureだけを参照し、tiles admission/capabilityを拡大しない。各passで元rendererからfresh native catalogを取得し、同clock/params/sourceInputs/元N(t)・灯列を確認してrecipeへ渡す。recipe判定のための保存済native atlasを入力にしない。
- native zeroではnative/directの全paintKeyを比較する。全text state（letterSpacing/wordSpacing等）・実CTM・path各CTM・paintに意味のあるstate・metricsを含む。未使用fill時のstroke/font stateまで同一と主張しない。元の全raw stateはdiagnosticへ残す。record/replayもowner単位で同じpaintKeyを比較するが、これだけを独立recipe fidelityの合格にしない。
- stock Canvas methodをmodule読込時にcaptureし、各計測前にpristineを検査する。unknown drawImage/clip/putImageData/clearRect、未対応filter/shadow/Path2D引数はtyped拒否。追加のCyber/prototype fuzzを行わない。
- `src/11p_layoutsEg_bulbs_adapter69.js`: fresh full-Number-domain取得、品質、有限候補、actual destination全時計再認定、cache2/8MiB、描画前preflight、単回issuer、登録を準備。source69の登録はソース上の追加であり、現在の追跡HTMLにはまだbuildしていない。実browserの認定結果は0。
- product支持はpass×semantic owner（face/shadow/outline/lyric/subtitle、ringごとのbulb/halo/glint）の全状態AABB union。各元primitiveのsourceMemberCountと包含を検査し、全catalog/個体paintをcacheに保持しない。穴を回避に使わない保守モデルで、不成立は一般的不可能性ではない。rawdiagnosticは全primitive/全品質failureを保持。cacheは品質failure総数と最初16 witnessを保持し、省略数を推測せず総数から把握できる。
- 毎pass prefixでretained＋semantic key＋最大tupleのbytesを測定し8MiBで停止する。destination/frameでも別途budgetを確認する。単なるJS heap/RSS保証ではない。過去55の記録上限失敗を再合格にせず、上限を引き上げない。
- 候補counterは最大32のside移動候補＋最大4のzero検査＝最大36。recipe/位置の早期winner後はnot-evaluatedを残す。
- `src/09_render.js`: bulbs専用のprepare/take/finish issuerのみを追加。全選択passの計測・品質・円/画面条件はclear/background/bitmap書込み前に完了させ、実描画はpreflight済programを一度だけ使う。不足/未認定を元位置のsafe表示へ戻さない。

source/plan/font revision/font faces/metrics/helpers/Renderer.frameとCanvas methodsをproof/cache/frameの前後にbindする。初回はJAの59固定familyに限定し、plan.lang不一致をtyped拒否して言語を強制しない。明示サイズ等の範囲外も保持/診断し、general capabilityとして宣言しない。

## runner / 独立経路

- `dev/avoidance/layouts-d-bulbs69-source-test.cjs`: pure module load、native品質policy、Canvas書込み抑止/restore/unknown channel、semantic union/包含、issuer登録、診断binding cleanup等。**24件PASS**。実font/Canvas/配置試験ではない。
- `dev/avoidance/layouts-d-bulbs69-source-audit.py`: 68 snapshot SHA保持、59算術の完全一致、品質の宣言したnative/recipe policy以外の一致、09_renderの逆変換で基準Gitblob一致、product pixel readback0を確認。**PASS**。68 source31件も再実行PASS。
- `layouts-d-bulbs69-oracle-primitives.js` / `layouts-d-bulbs69-oracle.js`: 60の独立原render closureへの幾何引数差替え経路を別ファイルへ準備。1行/元font/2行.95を明示対応し、ring点は独立prefix/binary lookupで求める。recipe binding/record/replayを呼ばない。native winnerは原native経路と比較する。
- `layouts-d-bulbs69-browser.js`: 新しいJ.plan由来fixtureと原font/backend/clockから実行。元planを保持してfinalize、全250状態の原寸hash/issued frame、独立oracleを比較。defaultで既承認59A/旧deltaを別fresh controlとして計測するが、winnerを旧right293へ固定しない。
- `layouts-d-bulbs69-runner.cjs`: explicit candidate/baseline HTMLとbrowser pathを受ける。localhost以外は中断、公開URLは使用しない。基準HTMLを別pageで全250 native比較し、candidateのnativeが一致することを確認後、fresh control→product→独立oracleを検査する。source69純粋なself一致だけの成功にはしない。

raw転送は同期local XHRを用い、未awaitの巨大queueを溜めない。Node側は既存59 catalog/root/paintmatrix codecで全値を復元しdeepEqualしてからgzip保存する。table100000/各key64MiB/全serialized256MiBを維持。rootの大きなHTML複製は不要で、baselineは親がGitblobからRAMへ供給できる。runner依存の旧kernel59/catalog59は保存ブランチにある原文のGitパスとSHAを新pinsへ記録する。

**runnerは未実行**。source syntax/pure/auditだけ実行した。実行には親の全source/runtime/依存/入力SHAレビューと明示releaseが必要。引数は `--candidate-html --baseline-html --output-dir --browser-path`（全て絶対パス）、release環境値は `BULBS69_RELEASE=PARENT_REVIEWED_SOURCE69_LOCAL_ONLY`。outputは新規`/dev/shm/`配下だけで、同じ実行process namespace内で親のdurable archiverがGit/Projectsへ保存するまでRAM_ONLYである。runnerのcompleteはローカル試験完走だけで、raw保存完了ではない。旧67のようにnamespace終了後までRAMだけへ残さない。

## 残るgateと継続

browser/build/fixture freeze/画像動画/公開結果確認/Git操作は0。current sourceは未実行・未認定。親sourceレビュー→必要修正→新HEAD/indexに固定→新環境runtimeとdurable archiver確認→default限定actualが次。通常stale/negative、他円位置/半径、JAEN build/基本6試験と必要MP4はこの先のgateであり未実施を成功にしない。旧失敗rawと68原本を保持する。

同じ担当が初回raw受入後、文字量→viewport→seed→font/FX→board/subなし→arrow/doubleへ明示境界を広げる。必要な見た目変更だけ原寸60fps MP4とbefore/after HTMLを準備し、別文脈sol静止・利用者動作確認へ回す。親画像動画0・公開結果確認永久禁止。看板native63からの新規transportと残りD/customも順次継続し、全009/正式性能/保存本体完了にはしない。


source自己レビュー追加: admitted WeakMapはatlas本体を保持せずcache keyのみを保持する。cache2 eviction後はfresh proofを再取得・照合する。planがcertificateを保持してもcache外atlasを無制限に延命しない。実cache eviction/redecodeのbrowser検証は次の通常negative gateで未実施。

最新利用者指示は既存009内で新規の人間視覚確認候補が約6effect積み上がるまで順次続行。実装・自動試験・親レビュー済みの候補だけを数え、現在新規待ち0。旧固定承認/未実施/同effect複数画像は加算しない。bulbsを中断せず、billboard→dominoes→burst→crossword→contourをsource依存に従い仮順として継続する。
