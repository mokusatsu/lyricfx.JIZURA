# AVOID-004 全画面の軌道と描画・境界計測の共通基盤

- 状態: 実環境検証待ち
- 段階: 基盤
- 技術依存: [AVOID-003](AVOID-003.md)
- 事業優先度: 未指定。記載順は技術上の推奨順。

## 開始前確認

- ブランチ・HEAD・git status: 着手時に記録する（このスレッドで実装は開始していない）。
- 共通解析基準: b7c23bf。スキル導入済みHEAD: 3c79480。着手時に差分を再確認する。
- 正本: [設計・根拠](avoidance-design.md)、[一覧](task-list.md)、[スキル](../.agents/skills/evidence-driven-task-management/SKILL.md)。
- 依存タスクの必須条件と証拠を確認する。完了を推測せず、未完条件を引き継ぐ。
- 対象ファイルに既存変更がある場合は競合を確認する。同時進行タスクは原則1件。

## 目的

自動歌詞のviewportと軌道を分け、カメラや文字変形を含めたステージ座標で一貫して扱う。

## 変更範囲

- 当該段階のGitHub Pages確認サンプル・変更前後のキャプチャ画像・比較HTML・公開manifest、確認依頼/回答記録。共通手順は[Pages人間確認運用](pages-human-review.md)と[比較画像・HTML契約](visual-review-comparison.md)。

- src/03_text.js、src/06_layouts.jsのmainDraw/drawFx、src/09_render.js
- src/08e_lyric_features.js、src/08h_cut_details.js、必要なら新規の最終plan hook
- 新規trajectory/geometry test、adapter API文書
- 文書更新: 本記録・task-list.mdの状態/証拠、設計の該当契約、対応表を同じ変更で同期する。

## 実装手順

- primary/tiledAux/independentDecorの明示APIと、元の描画順・blendを維持する描画面の分離を先に設計する。最終canvasの円抜きは禁止。mask実装本体は018へ渡す。
- フォント寸法revisionと最終planの確定APIを設ける。fallback計測、ロード完了、古い非同期結果、composePlan後の尺変更に対する再計算契約を作る。

1. 全画面envとJSON化可能なcut.placementTrajectory（名称案）を導入する。manual area経路は保持。
2. 小矩形area/clipを新自動方式の配置手段に使わず、glyph/item/groupの姿勢と占有形状を評価する。
3. enter/hold/exit→文字/破片変形→camera→ステージ回避の合成順と、附属装飾の変換を固定する。
4. 実時刻とモーション時刻を分離し、ghost/transition再帰呼出しにも同じ回避実時刻を渡す。
5. layout/char/piece/affine/drawProgramのadapter境界、非特異行列判定、キャッシュキー、計算上限を作る。
6. 未対応部分が残る間は内部の段階導入経路だけで検証し、製品の新方式を全面有効化しない。

## 禁止事項

- 2026-10-18の順次実装依頼に基づき、依存条件を満たしてから着手する。[実装レビュー運用](implementation-review-policy.md)に従い、実装担当と親レビューを分ける。
- 無関係なリファクタリング、ロック解除、手動配置の破棄、歌詞のline/partや時間の変更を混ぜない。
- 主歌詞の回避をマスク抜きで代用しない。補助的な大量反復歌詞は利用者指定により軌道再設計の対象外とし、AVOID-018の円形グラデーションマスクで扱う。演出全体の小矩形への縮小・未対応レイアウトの黙示除外は禁止。
- テスト期待値を通過のためだけに変更しない。旧ONの意図した変更には要件上の根拠を付ける。
- Gitコミット/push/PR/公開は依頼または明示許可がある範囲のみ。計画・タスク・証拠のコミット/プッシュは依頼済み。後続の実装依頼を受けた各段階では、利用者指定のworkブランチからGitHub Pagesへ公開し、反映確認後に人間へ確認ポイントを提示する。現在の計画更新を実装開始の許可とは解釈しない。

## 完了条件

- [ ] 全H-IDに対応する同条件の変更前後キャプチャと比較HTMLを生成し、Pagesで全画像の表示・ハッシュ一致・前後ラベル・項目リンクを確認した。新機能不在/条件差/仕様見本を明示し、画像比較と必要な実操作を含む依頼を用意した。
- [ ] workへコミット・プッシュした対象版がGitHub Pagesへ反映され、日英HTMLと確認fixtureの一致、公開版の起動/描画を確認した。
- [ ] 親がコードとテスト結果をレビューし、指摘を解消した。人間の動作確認が必要なら比較URL・操作・期待結果を提示し、必須項目のOKと動作判定を記録した。不要なら利用者の委任に基づく親の判断理由と完了判定を記録した。

- [x] tile等の主歌詞と反復補助を別役割で取り出せ、描画順・cut opacity・multiply/overlay・frontmostが基準fixtureと一致する。
- [x] ロード前後の異なる文字幅を検知し、正しい計測revisionで軌道を再計算できる。最終plan確定は冪等。

- [x] 新自動経路のlayout.planとrenderが常に元ステージW/Hを受け取り、小矩形clipを受けない。
- [x] 同じtのfast/full/順seek/逆seekで最終配置が一致し、renderがplan/projectを変えない。
- [x] cameraの移動・回転・scaleと親affineを含む変換が二重適用されない。
- [x] mainDrawを経由しない文字にも対応可能な公開内部契約と独立bounds testがある。
- [x] 旧OFF/手動area/旧lock fixtureの座標・効果・クリップが維持される。
- [x] 計算不能・特異変換・候補なしを診断でき、例外をcatchして成功扱いしない。

## テスト方法

- 比較成果物: [共通契約](visual-review-comparison.md)に従い、全H-IDの画像対応・撮影条件・HTML表示・公開一致を検証する。画像だけで数値/時間/保存の自動試験を代替しない。
- Unit: 行列合成/逆変換、寸法と軌道の独立、曲線全区間の境界判定。
- Integration: 代表1レイアウトでfull-stage、camera、ghost、transition、複数pass。
- Regression: lyric_area_effects、cut_mask、drawing_frames、effect_copy_fidelity。
- 実環境: 静的/移動の代表をスクリーン録画・frame比較で確認。
- 計画登録時は未実施だった（履歴）。2026-10-18の実装・実行結果は後述の証拠を正本とし、AVOID-001の旧ログを修正後成功へ流用しない。

## GitHub Pagesでの人間確認

[共通手順](pages-human-review.md)と[依頼テンプレート](templates/pages-review-request.md)に従う。以下は計画時に定義した確認ケース。現在のローカル成果物と実施証拠は後述。公開検証と人間の動作回答は親へ引き継ぎ、未実施を成功にしない。

各項目に下表の前後キャプチャを準備し、比較HTMLの同じH-IDアンカーへまとめる。操作の前後状態が複数ある場合は、各状態それぞれで実装変更前/変更後を撮る。担当エージェントが画像を生成・公開検証してから人間へ依頼する。

| 項目ID | 人間に依頼する操作 | 期待結果 | 比較キャプチャ（予定） |
|---|---|---|---|
| AVOID-004-H01 | 確認専用の対応済み代表レイアウトで、新経路と既存の全画面基準を比較する。 | 小さな表示矩形へ演出全体が縮まず、文字と附属プレートが同じ変換で動く。 | 同じ出力寸法での全体描画と文字/プレートの拡大。旧ONと既存全画面基準は別ラベルにする。 |
| AVOID-004-H02 | カメラ・残像・切替を含むサンプルを再生し、逆方向にもシークする。 | 二重変換や残像だけの古い回避位置がなく、同じ時刻の配置が一致する。 | camera/ghost/transitionの連続コマと順/逆seekの同時刻ペア。 |
| AVOID-004-H03 | フォント遅延サンプルを開き、読み込み完了後と再読込後を比較する。 | 文字幅の変化に軌道が追従する。手動area/OFFの対照ケースが変わらない。 | 制御した未読込→読込済み→再読込の各状態と、手動area/OFFの対照画像。 |

公開コミット / 変更前・変更後の実装識別子 / build ID / 比較HTML実URL / H-IDと画像の対応・撮影条件 / 操作用Pages実URL / 公開画像の一致・表示確認日時 / 自動検証証拠 / 依頼記録 / 人間の回答: 実装・公開後に記入する。親のコード/テスト結果レビュー、人間の動作確認の要否と理由も記録する。不要判定を人間のOK回答には置換しない。未確認を成功として補わない。

## 停止条件

- 共通hookのために無関係な全Renderer再設計が必要になった場合、別タスクへ分離する。
- 生成側と検証側が同じ誤ったbbox関数を共有する状態になった場合。
- 仕様矛盾・破壊的データ変換・予期しない公開互換性影響・既存変更との競合は、確認済み事実と選択肢を記録する。

## ロールバックと引き継ぎ

- 当該タスクの差分を単位として戻せる状態を保つ。保存されたユーザーデータを削除するロールバックにしない。
- 完了条件ごとに達成/未達/未確認、対応コマンド・件数・ログ・frame証拠を追記する。
- 開始/終了HEAD、git status、対象外既存変更、未実施検証、後続に渡すAPI/制約を残す。
- ローカル検証済み・実環境検証待ち・完了を区別する。最終判定は最新の[実装レビュー運用](implementation-review-policy.md)に従う。人間にコードレビューを依頼しない。

## 証拠・残事項

- 計画根拠: [AVOID-001](AVOID-001.md) と [設計書のE01〜E23](avoidance-design.md)。
- 計画登録時（履歴）は実装差分/検証ログなし。現在の実装と検証は2026-10-18の下記記録へ更新する。公開/人間回答の未確認は保持する。
- 個別の追加判断は着手時に記録し、共通設計と矛盾させない。

## 2026-10-18 開始証拠

- 実装担当: gpt-6.1-sol / medium。親がコード・試験をレビューし、公開・最終判定を担当する。005は開始しない。
- branch `work`, HEAD `9a3d43ef22b9cedf598c0448a4ea0619cd5615f6`。`git status --short` は空。既存編集なし。AGENTS.mdは検索で存在せず。
- 003完了の親レビュー・公開記録を確認。変更前を変更前に `git archive HEAD` で `/workspace/work/avoid004-before` へ固定した。
- 新経路は明示的な内部finalize APIだけで有効。製品既定・OFF・手動area・旧lockは従来経路を維持。
- ordered draw-event/ownership、glyph ink/affine、実時刻/モーション時刻、font revision/finalizationを基盤とし、後続adapterの非対応は診断する。

## 2026-10-18 実装・ローカル証拠（公開・人間判定は親待ち）

- 新基盤: `src/09a_placement.js`。通常生成は旧経路のまま。明示内部finalizeのみ、
  detached/deep-frozen final plan、JSON stage trajectory、原W/H再plan/render、font revision、
  純粋実時刻とmotion時刻、ordered role draw program/affine/glyph ink、明示diagnosticsを実装。
- 関連差分: `02_fonts` revision、`03_text` recorder境界、`06_layouts` tile反復役割、
  `09_render` fullStage/realTime/replay。日英HTMLを生成。[API契約](../dev/avoidance/STAGE-API.md)、
  [adapter対応](evidence/AVOID-004/adapter-boundaries.json)、設計/VERIFICATION/READMEを同期。
- 最終core試験: [stage-test.log](evidence/AVOID-004/stage-test.log) 118 checks。
  実font、独立raster含有（native2218 ink pixels/低alpha境界）、独立circle oracle、
  全区間sweep中間侵入、camera/ghost/transitionの順逆/fast/full pixel一致、
  fixed-before manual/OFF/旧ON/fullstage pixel・lock snapshot、Canvas cap/join/dash/miter、
  非既定text拒否、font/compose/style/event stale、clock/長い切替/mixed FX/defaultglow拒否。
- real/measurementのspacing差（実source空文字・1px測定0px）は
  [実測](evidence/AVOID-004/context-state-probe.json)で切り分け、ゼロ長だけ同値受理。
- 日英最終smoke: [guard-final](evidence/AVOID-004/site-smoke-local-guard-final.log) 成功。
  model回帰17checks、lyric parsing成功。旧4回帰はcut_mask/drawing_frames/effect_copy_fidelity成功、
  lyric_area_effectsは変更前後とも同一失敗。
- 既存area失敗: [前](evidence/AVOID-004/baseline-before/results.json) /
  [後](evidence/AVOID-004/regression-results.json)。line35 expected1/actual0。選択title cutが原因の
  手掛かりあり、後段UI/保存assert未到達。期待値変更なし。[017引継ぎ](AVOID-017.md)へ記録。
  既存project_file初期cut数 expected0/actual1失敗は013のまま（004では保存本体成功としない）。
- 最終比較build `local-20261018-08`、28cases / 全H01–H03、112 PNG（各sideのUIと未加工960×540）、
  fulltext cmap確認、原寸PNG別保持、static/moving browser screen recording2本、操作sample、manifest。
  旧ON/既存全画面/新経路、manual/OFF、fallback/loaded/reloadedを正しいラベルで分離。
- source SHA-256: `c166f437491cc643523a18212ea1087482776e78520048e7d4c27dcf280877b9`。
  JA `90eae91fc93900cd542a81373a20335f0ce343e3928dca1417fb1192f591a6b1`、
  EN `562172e86591ff5bea9ce58605c50b04f9e47ad566498fc4cc9d8c68b0dbcfe2`。
  manifest `47f4b4823744adb95be883acdb163226cd3eb34f28e402444ecaf3816e9c5efc`。
- 途中attempt01–07は上書きせず `/workspace/work/avoid004-attempt-bundles/` へ保持。試験の途中失敗ログも保持。
  002/003のbundle/validator/証拠は変更していない。
- 残る範囲: 対応はcenter/tile、cut/still/cut、none/marker、有限camera/clock/transitionのみ。
  per-cut FX/style/未知spatial postはplan全体で未対応。primary sizeを縮めず、候補不足は明示。
  多数adapter005–012とaux mask018、保存013/UI/既定切替は未実装。
- [親の公開後動作確認準備](reviews/AVOID-004-local-20261018-08.md)。人間はコードレビューをせず
  H01–H03の動作だけを確認する。親が公開検証後に送付する。005は開始していない。

## ローカル最終判定・親への所有引渡し

- 08の[local validator](evidence/AVOID-004/validate-local-20261018-08.log)成功。
  [negative](evidence/AVOID-004/negative-local-20261018-08.log)は無改変clone成功と9変異の意図した拒否を確認。
  raw native PNGの実再render、canonical input/source/測定、全asset、overlay実座標、1500/390px、
  playback font所属、連続seek/font/caseの最後要求一致を確認。
- [compositing-final](evidence/AVOID-004/compositing-test-final.log)3件は実foregroundを背景に
  cut opacity・normal/multiply/overlay・frontmostの旧全画面/新zero-offset pixelsが完全一致。
- 全browser検証を閉じて単独実行した[最終性能](evidence/AVOID-004/performance-final.json)成功。
  全100/1000cutが新経路admission済みで、同数regionsを計画した。実測値は下記。
  - 100cut/region: plan p95 63.6→81.2ms (1.277倍)、追加render p95 0.100ms。
  - 1000cut/region: plan p95 507.8→661.7ms (1.303倍)、追加render p95 0.200ms。
- planning上限2倍/追加render3ms内。additional measurement buffer実測1context/1pixel、
  per-glyph stage buffer0。旧attempt値は最終成功へ流用していない。
- [fresh build](evidence/AVOID-004/build-check-guard-final.json)で最終日英hashの再生成一致、
  [集約](evidence/AVOID-004/local-verification.json)、[最終worktree](evidence/AVOID-004/final-worktree.txt)。
  branch work/HEAD9a3d43eのまま、childはcommit/pushしていない。origin/work tracking refは
  ローカルに無く、remote一致の自己確認とは記録しない（公開は親担当）。
- core acceptanceはローカルで達成。公開反映/全公開assetと日英の一致、人間H01–H03回答、
  親の最終完了判定は未確認。実環境検証待ちのまま引き渡し、005は停止。
