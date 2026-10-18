# AVOID-012 複数カット・残留シーン・制約優先順位の統合

- 状態: 未着手
- 段階: 統合
- 技術依存: [AVOID-006](AVOID-006.md), [AVOID-007](AVOID-007.md), [AVOID-008](AVOID-008.md), [AVOID-009](AVOID-009.md), [AVOID-010](AVOID-010.md), [AVOID-011](AVOID-011.md), [AVOID-018](AVOID-018.md)
- 事業優先度: 未指定。記載順は技術上の推奨順。

## 開始前確認

- ブランチ・HEAD・git status: 着手時に記録する（このスレッドで実装は開始していない）。
- 共通解析基準: b7c23bf。スキル導入済みHEAD: 3c79480。着手時に差分を再確認する。
- 正本: [設計・根拠](avoidance-design.md)、[一覧](task-list.md)、[スキル](../.agents/skills/evidence-driven-task-management/SKILL.md)。
- 依存タスクの必須条件と証拠を確認する。完了を推測せず、未完条件を引き継ぐ。
- 対象ファイルに既存変更がある場合は競合を確認する。同時進行タスクは原則1件。

## 目的

個別adapterが全シーンで整合し、後段のarea再配置や時刻処理で回避が崩れないようにする。

## 変更範囲

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

- 今回の計画登録を実装着手の許可と解釈しない。実装は後続の依頼で開始する。
- 無関係なリファクタリング、ロック解除、手動配置の破棄、歌詞のline/partや時間の変更を混ぜない。
- 主歌詞の回避をマスク抜きで代用しない。補助的な大量反復歌詞は利用者指定により軌道再設計の対象外とし、AVOID-018の円形グラデーションマスクで扱う。演出全体の小矩形への縮小・未対応レイアウトの黙示除外は禁止。
- テスト期待値を通過のためだけに変更しない。旧ONの意図した変更には要件上の根拠を付ける。
- Gitコミット/push/PR/公開は依頼または明示許可がある範囲のみ。今回許可されたGit操作は添付スキルの導入、および追加依頼による計画・タスク・証拠のコミットとプッシュ。後続実装の開始許可とは区別する。

## 完了条件

- [ ] メディアで尺が延びる場合とdurationOverride短縮/再延長でend:null・epoch・前景制約が最終planと一致する。

- [ ] グループ中の通常主歌詞・中心専用主歌詞・反復補助が各可視epochでそれぞれの契約を満たし、切替後も古い円だけを参照しない。
- [ ] 実装の前後でline/part、cut数、歌詞時刻、リンク、event ownerが不変。
- [ ] 手動/lock/サイズ記法を維持し、競合が契約された診断となる。
- [ ] 同時に見えない回避領域を合併して余分な縮小・配置制限をしない。
- [ ] 順再生/逆seek/再読込/単一cutの再抽選で定義済み安定性を満たす。

## テスト方法

- Unit: epoch sweep、visible interval、constraint precedence、上限。
- Integration: { } / {- -}、複数行・複数part、emphasis/manual/lock混在、先行表示、残像、transition。
- Regression: lyric_scene、lyric_group_avoidance、group_reroll、cut_lock、relayout。
- 実環境: 円が上下左右に切り替わる演者背景上で残留シーンを確認。
- 現時点の実行結果: 未実施（後続実装タスク）。既存の基準ログはAVOID-001へ参照し、修正後の証拠として流用しない。

## 停止条件

- 全groupを再分割しないと成立しない場合は、既存identity/タイムライン互換性を守る別方式を先に評価する。
- 仕様矛盾・破壊的データ変換・予期しない公開互換性影響・既存変更との競合は、確認済み事実と選択肢を記録する。

## ロールバックと引き継ぎ

- 当該タスクの差分を単位として戻せる状態を保つ。保存されたユーザーデータを削除するロールバックにしない。
- 完了条件ごとに達成/未達/未確認、対応コマンド・件数・ログ・frame証拠を追記する。
- 開始/終了HEAD、git status、対象外既存変更、未実施検証、後続に渡すAPI/制約を残す。
- ローカル検証済み・実環境検証待ち・完了を区別する。最終完了判定は人間が行う。

## 証拠・残事項

- 計画根拠: [AVOID-001](AVOID-001.md) と [設計書のE01〜E23](avoidance-design.md)。
- 実装差分: なし。検証ログ: なし。上のチェックボックスはすべて未達/未確認。
- 個別の追加判断は着手時に記録し、共通設計と矛盾させない。
