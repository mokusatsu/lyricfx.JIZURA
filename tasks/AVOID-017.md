# AVOID-017 全体検証・文書更新・新方式の有効化判定

- 状態: 未着手
- 段階: 受入
- 技術依存: [AVOID-016](AVOID-016.md)
- 事業優先度: 未指定。記載順は技術上の推奨順。

## 開始前確認

- ブランチ・HEAD・git status: 着手時に記録する（このスレッドで実装は開始していない）。
- 共通解析基準: b7c23bf。スキル導入済みHEAD: 3c79480。着手時に差分を再確認する。
- 正本: [設計・根拠](avoidance-design.md)、[一覧](task-list.md)、[スキル](../.agents/skills/evidence-driven-task-management/SKILL.md)。
- 依存タスクの必須条件と証拠を確認する。完了を推測せず、未完条件を引き継ぐ。
- 対象ファイルに既存変更がある場合は競合を確認する。同時進行タスクは原則1件。

## 目的

段階実装を全レイアウト・保存・編集・出力の一つの機能として検証し、証拠でリリース可否を判定する。

## 変更範囲

- 当該段階のGitHub Pages確認サンプル・変更前後のキャプチャ画像・比較HTML・公開manifest、確認依頼/回答記録。共通手順は[Pages人間確認運用](pages-human-review.md)と[比較画像・HTML契約](visual-review-comparison.md)。

- dev/・mcp/・.github/workflows/verify.yml、docs/VERIFICATION.md、README.md/README.en.md
- app/english.py、build.pyによるindex.html/en/index.html再生成、task records
- 新方式の有効化箇所のみ（無関係な公開設定は対象外）
- 文書更新: 本記録・task-list.mdの状態/証拠、設計の該当契約、対応表を同じ変更で同期する。

## 実装手順

1. 全184IDのcoverage・例外・視覚証拠を集計し、legacy/fallbackへの黙示退避がないことを確認する。
2. 必須マトリクスを自動検証し、長時間・1000要素・group負荷を固定環境で測る。
3. 現行のREADMEの帯方式記述を更新し、円軌道中心のみ・強調例外・手動/lock・gap・AE制限を説明する。
4. 日英HTMLを生成して再生成差分を確認し、必要な新テストをCIへ追加する。
5. 先行段階の画像・H-ID対応と受入結果を集計し、同条件の代表ケースで段階前後/機能導入前からの累積比較を分けて生成する。184IDの対応一覧から各段階の版付き画像へ辿れるようにする。
6. 先行段階の受入判定（必要な人間動作確認を含む）と本段階の自動試験が揃ったら、既定の新方式を有効にした候補版をPagesへ公開する。その実URLで必要な人間の動作確認を行い、親の最終レビューと検証結果が揃うまでリリース完了としない。

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

- [ ] 全184IDの描画役割が分類済みで、主歌詞の軌道/中心・反復補助のマスク・対象外装飾ごとに根拠がある。補助反復のレイアウト再設計を完了条件へ加えない。
- [ ] フォント遅延/失敗、最終尺の変更、反復補助の全合成経路で検証済み条件と未対応条件が明示される。

- [ ] 184/184のstock対応が根拠付きで閉じ、カスタムのcapabilityも明示される。
- [ ] 主要aspect・時間境界・group・manual/lock・保存・UI・各出力の必須検証がすべて成功する。
- [ ] 旧OFFの回帰と意図した旧ONの変更を区別したbefore/after証拠がある。
- [ ] planning/render性能が合意予算内で、上限超過ケースでも無制限に処理を続けない。
- [ ] 日英の説明・UI・生成物とschemaが一致し、buildとCI相当コマンドが成功する。
- [ ] 親の技術レビューと公開版検証を満たし、必要な人間の動作確認または根拠付きの不要判定が記録される。未達を完了にしない。

## テスト方法

- 比較成果物: [共通契約](visual-review-comparison.md)に従い、全H-IDの画像対応・撮影条件・HTML表示・公開一致を検証する。画像だけで数値/時間/保存の自動試験を代替しない。
- Unit/Integration: 本設計の全必須matrix、全adapter registry enumeration。
- Regression: docs/VERIFICATION.mdの順序、関連dev群、新feature群。
- 実環境: PC Chrome/Edge、モバイル実機、実動画overlay、出力ファイルの再生。
- CI: ローカル試験・hosted run・Pages反映を区別し、対象版の公開確認成功後に人間へチェックリストを提示する。
- 現時点の実行結果: 未実施（後続実装タスク）。既存の基準ログはAVOID-001へ参照し、修正後の証拠として流用しない。

## GitHub Pagesでの人間確認

[共通手順](pages-human-review.md)と[依頼テンプレート](templates/pages-review-request.md)に従う。以下は実装後に用意する確認ケースの予定であり、現在は未公開・未実施。依頼時には実際のUI名・サンプル名・ケースURLへ具体化する。

各項目に下表の前後キャプチャを準備し、比較HTMLの同じH-IDアンカーへまとめる。操作の前後状態が複数ある場合は、各状態それぞれで実装変更前/変更後を撮る。担当エージェントが画像を生成・公開検証してから人間へ依頼する。

| 項目ID | 人間に依頼する操作 | 期待結果 | 比較キャプチャ（予定） |
|---|---|---|---|
| AVOID-017-H01 | 既定の新方式を有効にした候補版を開き、各段階の代表サンプルと全184IDの対応一覧を見る。 | 公開版と受入対象版が一致し、主歌詞/中心専用/補助反復それぞれの契約が揃っている。 | 全184IDの一覧と代表ケース。段階前後に加え、機能導入前から最終候補への累積画像も別枠で示す。 |
| AVOID-017-H02 | 日英・PC/モバイルで、回避要素の追加→位置編集→保存→再読込→書き出しを通して操作する。 | 一連の利用で表示・保存・出力が整合し、文字・操作対象・ガイドが崩れない。 | 日英×PC/モバイルの操作連続画像と実出力。各版の追加→編集→保存→再読込→出力を対応づける。 |
| AVOID-017-H03 | 旧OFF、強調、手動/ロック、gap、長いシーン、AE制限の対照ケースを確認する。 | 互換性と意図した制限を確認できる。必須項目の未確認を残して完了にしない。 | 旧OFF/強調/手動/lock/gap/長いシーンの対照画像とAE制限表示。 |

公開コミット / 変更前・変更後の実装識別子 / build ID / 比較HTML実URL / H-IDと画像の対応・撮影条件 / 操作用Pages実URL / 公開画像の一致・表示確認日時 / 自動検証証拠 / 依頼記録 / 人間の回答: 実装・公開後に記入する。親のコード/テスト結果レビュー、人間の動作確認の要否と理由も記録する。不要判定を人間のOK回答には置換しない。未確認を成功として補わない。

## 停止条件

- 必須項目が未確認のまま出荷判定を要求された場合は、残項目を明記する。
- 未知の既存問題を直すために本機能と無関係な修正を混ぜない。
- 仕様矛盾・破壊的データ変換・予期しない公開互換性影響・既存変更との競合は、確認済み事実と選択肢を記録する。

## ロールバックと引き継ぎ

- 当該タスクの差分を単位として戻せる状態を保つ。保存されたユーザーデータを削除するロールバックにしない。
- 完了条件ごとに達成/未達/未確認、対応コマンド・件数・ログ・frame証拠を追記する。
- 開始/終了HEAD、git status、対象外既存変更、未実施検証、後続に渡すAPI/制約を残す。
- ローカル検証済み・実環境検証待ち・完了を区別する。最終判定は最新の[実装レビュー運用](implementation-review-policy.md)に従う。人間にコードレビューを依頼しない。

## 証拠・残事項

- 計画根拠: [AVOID-001](AVOID-001.md) と [設計書のE01〜E23](avoidance-design.md)。
- 実装差分: なし。検証ログ: なし。上のチェックボックスはすべて未達/未確認。
- 個別の追加判断は着手時に記録し、共通設計と矛盾させない。

## AVOID-004からの既存回帰引継ぎ（017は未着手のまま）

`dev/lyric_area_effects_test.cjs` は固定変更前 `9a3d43e` と004変更後の両方で
line35 `result.withoutMedia` expected1/actual0に失敗する。t=1の選択cutが
line0のeffectsOnlyでなくline=-1/layout=title/bg=noneであることをprobeで確認した。
元assertionは変更していない。このassert以降の背景toggle/UI/保存assertは未到達。
[変更前結果](evidence/AVOID-004/baseline-before/results.json)、
[変更前log](evidence/AVOID-004/baseline-before/lyric_area_effects_test.cjs.log)、
[probe](evidence/AVOID-004/baseline-before/area-probe.log)、
[変更後結果](evidence/AVOID-004/regression-results.json)、
[変更後log](evidence/AVOID-004/lyric_area_effects_test.cjs.log)を参照。
004の独立したfixed-before manual/OFF/legacy/fullstage pixel・lock座標/clip試験は
[118 checks](evidence/AVOID-004/stage-test.log)で成功しているが、この既存試験の
後段成功に置換しない。017ではシーン選択の意図とfixtureを調査して扱いを決める。
保存テスト初期cut数 expected0/actual1 の既知失敗は引き続き013が担当する。

## AVOID-005からの既存回帰引継ぎ（017は未着手のまま）

- 固定変更前 `3d8f52c` の `dev/lyric_features_test.cjs` はline24の「seek backward and forward must reconstruct the stack」で失敗。正規のdefaultProjectに初期titleがあり、t=.1でFirst(line0)とtitle(line-1)の2cut、期待値は1。t=4.5の4cutは一致。日英の独立probeで同じ構成を確認。
- 005実装前の失敗として[変更前ログ/結果](evidence/AVOID-005/baseline-before/results.json)と[実データprobe](evidence/AVOID-005/baseline-before/features-probe.json)を保持。005変更後の同条件比較は005側で追記する。期待値やtitleを変更して既存試験成功にしない。後続assertionは未到達。

## 2026-10-22 007で切り分けた既存回帰の未解決引継ぎ

`dev/lyric_compositing_test.cjs` はJAのbackground transition比較で実RGB30,105,214/期待60,103,137となり失敗し、その後のMP4・UI・EN検査は未到達。`dev/group_reroll_test.cjs` はplain/avoid unifiedの他行effects各3件変化で失敗（012へも引継ぎ）。007現版とe96cbb2の実JA source供給/read hashを記録したcontrol02でも、それぞれrawlog全bytesのSHAが一致した。既存の失敗であり007の成功に含めない。017の主要group/全合成/既存dev回帰の必須ゲートで原因・仕様を解決し、必要な未到達項目も実行する。単に期待値を合わせたり、ENも通過したと扱わない。証拠: [実controlと失敗署名](evidence/AVOID-007/regression-existing-failures.json)、[親snapshot/raw/hash照合](evidence/AVOID-007/parent-existing-regression-review.json)。本追記は未着手タスクへの既知事項引継ぎのみ。


## 007 H03統合退行に関する有効化gate（未解除）

[H03 raw02独立視覚FAIL](evidence/AVOID-007/h03-visual02-review.md)はrain recap/BG時計、credits cut0主文/cut2 recap、bubbles cut5『越』/FGの新交差を全3で確認した。円回避・同時刻seek・decoded media・位置不変の数値成功は、この可読性FAILを上書きしない。[012への具体的引継ぎ](AVOID-012.md)と[scope分析](evidence/AVOID-007/h03-visual02-scope-proposal.md)を最終有効化判定で必ず参照する。旧raw02は未受入・未公開のまま保持する。

別native controlの[metadata02](evidence/AVOID-007/h03-control-metadata02-summary.md)は全3で実slot3.6→native end9.5、window[.5,4.5)にholdと.9sの真正残留を確認しただけであり、foreground/視覚/公開資格は未取得。007完了・012統合・017既定切替はいずれも、このmetadata成功から推定しない。017のactivation gateは解除していない。


### Background-content visual quality remains an independent gate

[Control01 visual review](evidence/AVOID-007/h03-control-visual01-review.md) gives rain observed-scope PASS but bubbles FAIL: after『先』lower white stroke lands on the BG pale-yellow bar, reducing local contrast at f15/f36 despite recognizable source/bubble/read order/phase and numeric circle+FG clearance. Old control01 overallFAIL remains.017 must assess actual background-content readability separately from012 group/FG geometry; no assumption that future group packing repairs arbitrary BG contrast is valid. No media content/bar/clock is deleted or moved to hide this failure.

A rain-only fresh control02 candidate is being prepared, not captured or accepted at this point. Bubbles remains numerically safe but visually unaccepted, credits remains FG-insufficient, and the whole original raw02 three-case visualFAIL remains linked. Final activation gate is still unreleased.

## AVOID-009振り子の段階API除外エラーからの有効化引継ぎ

[009 failure-policy照合](evidence/AVOID-009/pendulum-gate05/failure-policy-readonly01.md)では、現行UIはJ.planを使い、staged finalize/compositionEligibilityを呼ぶ事前除外selectorは未接続である。振り子adapterは実不足segmentに対し、unsafe nativeへ戻したり主歌詞を黙示消去せずPENDULUM_COMPOSITION_EXCLUDEDを明示throwする限定API契約を009親が受入。017で既定有効化する前に、全領域のcompositionEligibilityと未対応/不足を検査し、preview・seek・exportを未捕捉例外で中断させない事前選択/わかりやすい診断が必須。自動のみ許される代替と手動/notation/lock/強調の制御を保持し、不足/未対応を安全成功へ置き換えない。他adapterも含め非eligibleをunsafe native描画へ流さない。有効化コードやUI対応は未実装であり、本追記で017着手/完了とはしない。
