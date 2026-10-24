# AVOID-012 複数カット・残留シーン・制約優先順位の統合

- 状態: 未着手
- 段階: 統合
- 技術依存: [AVOID-006](AVOID-006.md), [AVOID-007](AVOID-007.md), [AVOID-008](AVOID-008.md), [AVOID-009](AVOID-009.md), [AVOID-010](AVOID-010.md), [AVOID-011](AVOID-011.md), [AVOID-018](AVOID-018.md), [AVOID-019](AVOID-019.md)
- 事業優先度: 未指定。記載順は技術上の推奨順。

## 開始前確認

- ブランチ・HEAD・git status: 着手時に記録する（このスレッドで実装は開始していない）。
- 共通解析基準: b7c23bf。スキル導入済みHEAD: 3c79480。着手時に差分を再確認する。
- 正本: [設計・根拠](avoidance-design.md)、[一覧](task-list.md)、[スキル](../.agents/skills/evidence-driven-task-management/SKILL.md)。
- 依存タスクの必須条件と証拠を確認する。完了を推測せず、未完条件を引き継ぐ。
- 対象ファイルに既存変更がある場合は競合を確認する。同時進行タスクは原則1件。

## 008からの未着手引継ぎ（2026-10-22）

[親の紙面有限検討02](evidence/AVOID-008/parent-paper-study02-review.json)は、magazine/newspaperの32案が新safe0だった容量・未証明部分の証拠。既存コピー/所有紙面/時刻を残すA/B再配分やgreek線分再配置は未実装・未証明。後続の不成立時選択除外はここで明示的に設計・実装する必要があり、現製品で既に除外した、あるいは全再配置が数学的に不可能と記録しない。012自体の実装はまだ開始していない。

## 目的

個別adapterが全シーンで整合し、後段のarea再配置や時刻処理で回避が崩れないようにする。

## 変更範囲

- 当該段階のGitHub Pages確認サンプル・変更前後のキャプチャ画像・比較HTML・公開manifest、確認依頼/回答記録。共通手順は[Pages人間確認運用](pages-human-review.md)と[比較画像・HTML契約](visual-review-comparison.md)。

- src/08e_lyric_features.js、src/08eb_lyric_scene.js、src/08h_cut_details.js
- src/08_planner.jsの時間処理、最終plan hook、group/time/lock fixture
- 文書更新: 本記録・task-list.mdの状態/証拠、設計の該当契約、対応表を同じ変更で同期する。

## 実装手順

- J.planラッパーだけでなくUI composePlanのmedia/foreground/durationOverride後に最終確定する。standalone J.plan、詳細preview、MCP、tap尺延長も同じAPIを使い、二重適用しない。

1. finishLyricPlan・details・group・notation・最終trajectoryの順序を整理する。
2. epochごとの同時可視集合を解き、renderStart/displayEnd/slotEnd/手動endを使い分ける。
3. シーン全体を小矩形へ詰める代わりに各cutの経路を生成し、歌詞間回避強度と前景/窓回避を統合する。
4. 手動/lockを固定障害物として扱い、強調の円回避例外・円軌道中心ルールを維持する。
5. effects seedとplacement seedを分け、後半領域の編集で前半の無関係な演出を再抽選しない。

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

- [ ] メディアで尺が延びる場合とdurationOverride短縮/再延長でend:null・epoch・前景制約が最終planと一致する。

- [ ] グループ中の通常主歌詞・中心専用主歌詞・反復補助が各可視epochでそれぞれの契約を満たし、切替後も古い円だけを参照しない。
- [ ] 実装の前後でline/part、cut数、歌詞時刻、リンク、event ownerが不変。
- [ ] 手動/lock/サイズ記法を維持し、競合が契約された診断となる。
- [ ] 同時に見えない回避領域を合併して余分な縮小・配置制限をしない。
- [ ] 順再生/逆seek/再読込/単一cutの再抽選で定義済み安定性を満たす。

## テスト方法

- 比較成果物: [共通契約](visual-review-comparison.md)に従い、全H-IDの画像対応・撮影条件・HTML表示・公開一致を検証する。画像だけで数値/時間/保存の自動試験を代替しない。
- Unit: epoch sweep、visible interval、constraint precedence、上限。
- Integration: { } / {- -}、複数行・複数part、emphasis/manual/lock混在、先行表示、残像、transition。
- Regression: lyric_scene、lyric_group_avoidance、group_reroll、cut_lock、relayout。
- 実環境: 円が上下左右に切り替わる演者背景上で残留シーンを確認。
- 現時点の実行結果: 未実施（後続実装タスク）。既存の基準ログはAVOID-001へ参照し、修正後の証拠として流用しない。

## GitHub Pagesでの人間確認

[共通手順](pages-human-review.md)と[依頼テンプレート](templates/pages-review-request.md)に従う。以下は実装後に用意する確認ケースの予定であり、現在は未公開・未実施。依頼時には実際のUI名・サンプル名・ケースURLへ具体化する。

各項目に下表の前後キャプチャを準備し、比較HTMLの同じH-IDアンカーへまとめる。操作の前後状態が複数ある場合は、各状態それぞれで実装変更前/変更後を撮る。担当エージェントが画像を生成・公開検証してから人間へ依頼する。

| 項目ID | 人間に依頼する操作 | 期待結果 | 比較キャプチャ（予定） |
|---|---|---|---|
| AVOID-012-H01 | 複数カットが残るシーンで、途中に回避中心が切り替わるサンプルを再生する。 | 残留中の各対象カットも現在の円を参照し、シーン全体が小矩形へ押し込まれない。 | 残留カットを含む全体像を、中心切替t−ε/t/t+εで比較する。 |
| AVOID-012-H02 | 先行表示・残像・transitionを含む境界へ順/逆にシークする。 | 同じ時刻で主歌詞の軌道/中心と反復補助マスクが一致する。 | 先行表示/ghost/transitionを順/逆seekで同時刻撮影。主歌詞と補助マスクを同じ画面に含める。 |
| AVOID-012-H03 | 手動/ロック/サイズ指定/強調の混在、尺の短縮・再延長を試す。 | 制約優先順位が保たれ、歌詞行やcut数・時刻・リンクが回避の都合で変わらない。 | 制約混在と尺の短縮/再延長の画面・cut/時刻結果表。データ不変の自動検証を併記する。 |

公開コミット / 変更前・変更後の実装識別子 / build ID / 比較HTML実URL / H-IDと画像の対応・撮影条件 / 操作用Pages実URL / 公開画像の一致・表示確認日時 / 自動検証証拠 / 依頼記録 / 人間の回答: 実装・公開後に記入する。親のコード/テスト結果レビュー、人間の動作確認の要否と理由も記録する。不要判定を人間のOK回答には置換しない。未確認を成功として補わない。

## 停止条件

- 全groupを再分割しないと成立しない場合は、既存identity/タイムライン互換性を守る別方式を先に評価する。
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

## 2026-10-22 既存再抽選回帰の未解決引継ぎ（未着手のまま）

007で既存 `dev/group_reroll_test.cjs` を実行し、plain/avoid のunified条件で他行effectsが各3件変化して失敗した。現版と変更前e96cbb2の実JA HTML（a3c4d0e…4ba7）で全rawlog SHA `b37a8e15f7229edec540daaa1ec2cc16029a5a5a815867b129a41e03d4d22c6b` が一致。livelyのotherFx=0/areaMoved=0、全条件placement移動0。012の再抽選安定性・group回帰の開始時に再現し、契約と原因を確認する。期待値を変更して成功にしない。本追記は既知事項の引継ぎであり012の実装開始ではない。証拠: [007親独立照合](evidence/AVOID-007/parent-existing-regression-review.json)、[実control/未到達locale](evidence/AVOID-007/regression-existing-failures.json)。017の総合回帰へも残す。


## 007からの未解決H03統合再現引継ぎ（012実装は未着手）

[独立H03 raw02視覚FAIL](evidence/AVOID-007/h03-visual02-review.md)と[cut別source/座標分析](evidence/AVOID-007/h03-visual02-scope-proposal.md)を012の具体的診断入力として保持する。原本 `work/avoid007-h03/native-local-20261022-02`、manifest `8f84ccb6b4f5c40156a86b91127dc541027bff89835a97426c25b2264073d32c`、同native8cut group/seed704/3200×1080/circle(.5,.42,.2)/撮影[3,7)。rain f3ではcut2 recapがBG時計へ、credits f3/15ではcut0主文と別cut2 recapが交差、bubbles f90ではcut5 recap『越』とowned bubbleがFGに覆われる。全3視覚FAILを成功へ読み替えない。

007の各cutの主文字/owned形状の円回避証明は、同時残留する別ownerや動画の可読性を保証しない。実event/source照合ではcreditsの当該衝突は同cut内のowned行の剥離ではなく、別cutの相対配置変更である。fixtureは明示full-stage原演出条件、avoidForeground=falseであり、元J.plan areaのscene配置も外している。このため012でactive epochごとのcross-owner全primary-copy、FG/背景内容と既存scene制約、優先順位を統合する範囲へ引き継ぐ。単なるaux分類や主文字mask/動画移動で解消しない。時刻/phase/media positionが同じという007証拠を、これらの衝突解決証拠に流用しない。

別の真正native retention controlの[metadata02](evidence/AVOID-007/h03-control-metadata02-summary.md)は0/4.5/8・single:trueの別projectであり、既8cut再現の修正ではない。全3metadata-qualifiedに留まり、focused/visual未実施。012の実装/全group成功は未着手・未証明のまま。


### Distinct control01 visual outcome: keep the integration boundary precise

[H03 control01 independent review](evidence/AVOID-007/h03-control-visual01-review.md) examined all384frames/16keys/24crops of the separate single-owner control. Rain has an observed-scope PASS with white-frame contact noted. Bubbles has a new **background pale-bar local contrast** FAIL for the lower stroke of『先』, while source/owned bubble/phase/read order/media positions remain present. This background-content contrast finding belongs to017's final visual quality gate;012 group/FG packing does not automatically solve arbitrary BG contrast. Credits' separate control-focused primary/FG support conflict remains an012 integration diagnostic, and old eight-cut raw02 cross-owner/FG FAILs remain unchanged. No012 implementation has begun.

## AVOID-009 山exit13の残留境界引継ぎ

2026-10-24の[親raw照合](evidence/AVOID-009/revisions-20261024/pile-exit13/parent-pile-exit13.json)では、通常Renderer.frame実時刻4秒にmainのカット選択は終了する一方、Bのsource lt3.933333/A3.966667が元選択規則で残る。最後の回避区間[0,4)はrealTimeでinactive。これは旧/新双方の挙動であり、009の退出修正でsafeに認定せずDIAGNOSTIC_NOT_SAFE_ACCEPTANCEとして実polygonを保持。012で残留カットと回避区間/優先順位の契約を統合すること。直接drawCut lt>=durも強制呼出しでpaintし得るが域内安全保証に含めない。既存描画を削除して合格化していない。
