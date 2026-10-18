# AVOID-016 書き出し・MCP・AE capabilityの統合

- 状態: 未着手
- 段階: 入出力
- 技術依存: [AVOID-015](AVOID-015.md)
- 事業優先度: 未指定。記載順は技術上の推奨順。

## 開始前確認

- ブランチ・HEAD・git status: 着手時に記録する（このスレッドで実装は開始していない）。
- 共通解析基準: b7c23bf。スキル導入済みHEAD: 3c79480。着手時に差分を再確認する。
- 正本: [設計・根拠](avoidance-design.md)、[一覧](task-list.md)、[スキル](../.agents/skills/evidence-driven-task-management/SKILL.md)。
- 依存タスクの必須条件と証拠を確認する。完了を推測せず、未完条件を引き継ぐ。
- 対象ファイルに既存変更がある場合は競合を確認する。同時進行タスクは原則1件。

## 目的

プレビューと各出力の回避条件を一致させ、外部APIや未対応形式による黙示的な劣化を防ぐ。

## 変更範囲

- src/11_export.js、src/11y_short_export.js、mcp/browser-api.js、mcp/server.mjs
- AE capability判定に必要な境界、MCP/export tests・仕様文書
- 文書更新: 本記録・task-list.mdの状態/証拠、設計の該当契約、対応表を同じ変更で同期する。

## 実装手順

- 使用フォントの読み込み確定後に最終planを作成する。fallbackからの切替で古い寸法の軌道をsnapshot化しない。反復補助のalpha、主歌詞/動画の不変、source/cut maskとの順序をPNG透明/MP4背景合成で比較する。

1. MP4/PNGの実時刻・quantization・range startを同じresolverへ渡す。
2. short exportは元ステージのframe後の変換とし、円を二重適用しない。
3. MCP patch/import/state/undoで共有validatorを使い、制御要素を3層のcutと混同しない。
4. AE JSONのcapability判定と未対応エラーを実装し、旧OFF/旧出力を保つ。全面AE移植を混ぜない。
5. 書き出し開始時のplan snapshotを固定し、編集中のdraft・ガイドが結果へ入らないようにする。

## 禁止事項

- 今回の計画登録を実装着手の許可と解釈しない。実装は後続の依頼で開始する。
- 無関係なリファクタリング、ロック解除、手動配置の破棄、歌詞のline/partや時間の変更を混ぜない。
- 主歌詞の回避をマスク抜きで代用しない。補助的な大量反復歌詞は利用者指定により軌道再設計の対象外とし、AVOID-018の円形グラデーションマスクで扱う。演出全体の小矩形への縮小・未対応レイアウトの黙示除外は禁止。
- テスト期待値を通過のためだけに変更しない。旧ONの意図した変更には要件上の根拠を付ける。
- Gitコミット/push/PR/公開は依頼または明示許可がある範囲のみ。今回許可されたGit操作は添付スキルの導入、および追加依頼による計画・タスク・証拠のコミットとプッシュ。後続実装の開始許可とは区別する。

## 完了条件

- [ ] 同一fixture/t/寸法のpreviewとPNG/MP4エンコード前frameで軌道座標が一致する。
- [ ] MP4復号後の画と透過PNGが契約された許容差内、ガイド非混入。
- [ ] 範囲書き出しの途中開始・region切替・short変換でも正しい中心を使う。
- [ ] MCPから不正区間を投入すると原子的に拒否され、state/export/undoが同一データを参照する。
- [ ] 新方式を解釈できないAE出力は明確に失敗し、誤った動画を正常結果として渡さない。

## テスト方法

- Unit: output time、range offset、capability、MCP validator。
- Integration: MP4/PNG-transparent/short、MCP edit/export/undo、旧AE JSON。
- Regression: export_stream、short_export、export_quantizer、MCP integration、ae_test（対応範囲のみ）。
- 実環境: 実ファイルを再読込して画を確認。AEの完全再現は対象外と記録。
- 現時点の実行結果: 未実施（後続実装タスク）。既存の基準ログはAVOID-001へ参照し、修正後の証拠として流用しない。

## 停止条件

- AEの完全同一再現や公開MCP schemaの破壊が要求される場合は追加仕様として分離する。
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
