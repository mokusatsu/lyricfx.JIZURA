# Domino source paint 82al

実装担当: gpt-6.1-sol / medium。82ak の凍結済み private owner と全時計モデルを再利用し、480×270 の実 Canvas で元描画と Y 移動描画を比較する独立単位。製品 source は変更しない。

## 確認した範囲

管理 Qt `domino-source-paint-actual82al02` は complete=true。最初の32 owner の比較成功を保存してから残りへ進め、全250 owner、3064 paint、808 glyph、11空 owner を確認した。native/destination の入力・時計・root・RNG・fit・font/TextMetrics・paint inventory・X 座標・Canvas 状態・clip は一致する。全 destination paint が保守支持に含まれ、全支持の Y と円回避を Fraction で独立検査した。モデルは82ak実行結果と全件一致する。

43支持は元演出の X 範囲外を保持する。これは全方向 stage 内の合格ではない。X 移動・縮小・部品削除・新しい clip はなく、元の canvas viewport による X clip を維持する。explicit clip 呼出しは0。

これは owner.borrow 内の source paint 比較であり、正式 plan 発行、current-frame controller、stock Renderer.frame の描画前拒否、normal preview options、製品 UI 接続の資格を与えない。旧 sourceShift binder は試験用で、権限発行には使わない。次の最小単位は既存正式 issuer/controller をこの入力由来 owner/viewport/時計へ接続し、通常 options の境界を別途証明すること。

## 再検証

repo root で実行する。既存 raw の検査であり再描画しない。

```sh
node dev/avoidance/domino82/source-paint82al/test.cjs
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/domino82/source-paint82al/check.py /workspace/jizura-logic-evidence-20261027
```

pure8件は comparator の意味ある拒否条件（X matrix/path、font、clip、inventory、support X、owner）を検査する。Canvas の証明は既存実 raw の checker が担う。checker は223実行時 source pin、19 raw hash、各8MiB/総128MiB/gzip32MiB上限、全支持と実 paint の包含、世代失効、解放、正常終了を検査する。最終 source snapshot が存在すればその bytes/hash も検査する。

生成は `python dev/avoidance/domino82/source-paint82al/generate.py "$PWD"`。生成 browser の再生成 byte 一致と5 JS/CJS syntax check を確認済み。新しい sidecar を生成する場合は `python dev/avoidance/domino82/source-paint82al/build.py "$PWD" <new-source-directory>`。凍結済み source02 を上書きしない。observer の由来と hash は observer-provenance.json に固定した。

## 実行記録と制限

証跡基点 `/workspace/jizura-logic-evidence-20261027`：

- `domino-source-paint-source82al01`: 生成のみ、Qt未実行。
- `domino-source-paint-source82al02`: producer成功・223pin一致後の実行source。
- `domino-source-paint-preflight82al02.json`: 空き10,404,986,880 B、1GiB floor＋32MiB見積、Qt live0 / 旧zombie1132。
- `domino-source-paint-actual82al02`: 19raw / JSON24,207,413 B / gzip1,508,506 B。正常3窓close、所有子回収、signal0、port閉。
- 同 `-runtime/host.json`: 管理runnerの独立 lifecycle 記録。

実行コマンド（完了済み、再実行不要）：

```sh
BILLBOARD_MODEL81_RELEASE=PREPARE_PROFILE81P PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/qt-resource-runtime/run_probe.py /workspace/jizura-logic-evidence-20261027/domino-source-paint-source82al02 /workspace/jizura-logic-evidence-20261027/domino-source-paint-actual82al02 --expected-bytes 33554432 --timeout 180
```

単発の準備6175.3ms / max step106.3ms / 501steps は性能受入や高速化の証明ではない。終了後もQt live0、旧zombie1132、最新startTicks20062245で増加なし。世代変更後の旧handleは DOMINO82P_GENERATION_STALE、pending/resident/surface は0。1つの入力・480×270の条件であり、他入力/viewportへの一般的対応、正式性能、通常UI完成は未確認。PNG/動画生成・閲覧、公開確認は行っていない。82ak凍結物・既存製品は変更していない。
