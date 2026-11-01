# 中央回避・通常 UI の途中保存（2026-11-01）

この保存は未完成の実装と再開情報であり、製品の配信や全演出の合格を示さない。検証対象の実装 commit は `cadd216f03d068682011e7bd18a5e966f272852c`。公開中の基準は `e5dffb6ce1b81fb10260ba30a3f4dc51823bdd87`。通常 UI の「歌詞が画面中央を避ける」で保持中に回避し、入退場中の一時通過は許容する。字幕・所有する装飾・文字順・書字方向・明示サイズと固定背景を保つ。

旧自動配置の円 blocker と新しい円回避が二重に適用されていたため、新経路に旧 blocker 適用前の自動領域と layout params を渡す。安全に成立しなければ、既存の自動領域を同じ所有部品判定で再試行し、自動サイズ使用をプレビューと出力に表示する。手動・ロック・強調・明示サイズはこの再計画から除く。文字・行・枠などは既存 source sweep の保持期支持を共通入口に接続した。反復背景や独立粒子を歌詞と一体移動しない。

既定歌詞・通常設定・先頭 cut に限定した一括走査では、中心固定7演出を除く177演出の配置計算成立は旧公開版9件、途中版15件だった。追加された19件の個別結果を同条件に対応づけると暫定34件だが、最新 commit の全件一括結果ではなく、全ての実描画・全文字の合格数でもない。中心固定例外7件、別 cut・別入力・不成立・未対応は別扱いとする。

保持期の代表1時点で対象 cut の実描画呼出しと円内画素差0を確認した新規の例は lowerThird、frameBox、quote、tyMargin、tyBaseline、zigzag、ruler、tyJustify、tyRuby、gridCells、genkou、kanjiFocus、tyIndexTable、tySquare、tyLineFocus、footnote、proofread、tyFullTrack、tyStatCount、notification、chat、numbered。quote / footnote / notification は円外の再描画差があり、円内限定の比較。clip 後の全文字・全付属物の完全可視性、光の微小な尾部、全保持時刻はこれだけでは証明していない。旧成立の condensed / ticket / neon / magazine は先頭 cut で保持時点の円内差0を再確認。詳細、入力、過去の失敗、不採用試作と Git 外の生記録の所在は [通常 UI レビュー記録](AVOID-009-circle-normal-ui-20261101.md) を参照する。

再開時はこの保存 branch を別 worktree で開き、`AGENTS.md` と上記レビュー記録を読む。作業先に既存の未コミット差分がある場合は上書きしない。`python3 build.py` は日英の製品用 index を生成する。Qt は `dev/avoidance/qt-resource-runtime/README.md` に従い、空き容量と同時実行を確認して管理 runner で実行し、作成した子プロセスを回収する。動画・PNG・閲覧用比較 HTML・大きな raw は GitHub に追加しない。公開前には同一 commit の Pages と通常 UI を確認する。

実行した13演出の観測 source と Qt helper は `dev/avoidance/normal-ui-circle-observer-20261101/`、直近2回の条件・source hash・演出別結果の縮約は `tasks/evidence/AVOID-009/normal-ui-20261101/held-observations.json` に保全する。後者の11演出試験は不採用試作を含むため、保存 commit の実装そのものの評価ではない。元の詳細 raw がない環境では縮約だけで clip 後の可視性を再判定できない。

残作業は、中心固定例外を除く大半の配置不成立、bulbs / burst / dominoes の通常経路、別 cut の全画面効果、clip 後の文字と所有物の可視性、実出力など。既存 09d recipe は画面座標で camera 適用済みの支持と旧 renderer に結び付く一方、新経路は viewport 内の支持を後から投影する。recipe だけを移すと二重変換や異なる clip の描画になるため、同じ recipe・所有物・固定 clip・保持窓を判定と描画へ渡す接続が必要。枠の寸法や関係を変える recipe は、元の構図維持条件との整合なしに採用しない。全画面巻戻し等の効果も、単一の小さな移動範囲として扱わない。

### Full-screen primary transport trial (unadopted)

The AVOID-004 full-stage/role assets were revisited. Native `cut.area` couples the source size, camera and clipping; changing its location moves scatter auxiliary text and its clip. The independent trial keeps the original source size/camera and releases only primary and attached Memphis to the canvas boundary, retaining the auxiliary clip. Its source and intermediate diffs are preserved in `tasks/evidence/AVOID-009/normal-ui-20261101/primary-stage-unadopted-wip.json`; they are not connected to the product build. It still needs correct stage-to-source candidate mapping, equal-score ordering, a fresh actual decor `sourceCut` identity or all reachable old cache bounds, and independent renderer validation.

Two direct diagnostics used normal-UI-generated inputs, but invoked the trial solver directly and did not validate rendering or the production route. For mixed they returned `PRIMARY_STAGE_OWNER_CANDIDATES_EXHAUSTED` (172.8 and 110.6 ms); scatter returned `PRIMARY_STAGE_FIXED_FURNITURE` (553.4 and 513.3 ms). The second run tested the changed same-offset candidate only. Neither finite search result proves physical impossibility. Run data remains outside Git at `/workspace/jizura-logic-evidence-20261027/normal-ui-primary-stage-diagnostic-actual-20261101-0{1,2}/`; both managed runs reported completion and owned process cleanup. The earlier provisional 34/177 is a combination of prior test revisions, not a new aggregate or a release count.

The Memphis BBC is a WeakMap keyed by the actual decor `sourceCut`, intentionally retaining the last valid bbox during hidden/exit frames. A direct seek can leave a past/future bbox until a valid hold bbox replaces it. Blind invalidation changes native hidden/exit behavior; the experimental support therefore must cover reachable history unless the actual decor source identity is fresh. Entry/exit circle crossing remains allowed; stationary owner events retain the hold requirement. Existing published Pages remains at `e5dffb6ce1b81fb10260ba30a3f4dc51823bdd87` and has not been redeployed.
