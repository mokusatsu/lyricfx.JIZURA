# AVOID-009 拡張Dの34レイアウト・カスタム描画の対応

- 状態: 未着手
- 段階: 特殊描画
- 技術依存: [AVOID-005](AVOID-005.md)
- 事業優先度: 未指定。記載順は技術上の推奨順。

## 開始前確認

- ブランチ・HEAD・git status: 着手時に記録する（このスレッドで実装は開始していない）。
- 共通解析基準: b7c23bf。スキル導入済みHEAD: 3c79480。着手時に差分を再確認する。
- 正本: [設計・根拠](avoidance-design.md)、[一覧](task-list.md)、[スキル](../.agents/skills/evidence-driven-task-management/SKILL.md)。
- 依存タスクの必須条件と証拠を確認する。完了を推測せず、未完条件を引き継ぐ。
- 対象ファイルに既存変更がある場合は競合を確認する。同時進行タスクは原則1件。

## 目的

3D面・affine・Canvas直接文字・カスタムプログラムを共通フックの取りこぼしなく扱う。

## 変更範囲

- src/11p_layoutsD.js、src/11w_custom_draw.js、src/11wa_custom_effects.js
- src/03_text.js等の特殊描画境界、カスタムcomponent契約・fixture
- 文書更新: 本記録・task-list.mdの状態/証拠、設計の該当契約、対応表を同じ変更で同期する。

## 実装手順

- 個々の描画をprimary/tiledAux/independentDecorに分類する。大量反復補助は経路変更せず018へ引き継ぐ。同じID内の主歌詞は対応対象のままとし、名称やmainDrawの有無だけで分類しない。

1. drawAff/drawAffPlain、文字texture/3D面、直接fillText/strokeTextを分類してstage boundsを取得する。
2. cube/cylinder/flag/blocks/dominoes/wall等は物体単位のadapterを用意する。
3. wordSearch/maskReveal/contourのCanvas直接文字、drawProgram replace/overlay、カスタムlayout/decorの文字を検査する。
4. カスタムの既存手動座標指定は勝手に変えず、対応capabilityと未対応の診断を定義する。

## 禁止事項

- 今回の計画登録を実装着手の許可と解釈しない。実装は後続の依頼で開始する。
- 無関係なリファクタリング、ロック解除、手動配置の破棄、歌詞のline/partや時間の変更を混ぜない。
- 主歌詞の回避をマスク抜きで代用しない。補助的な大量反復歌詞は利用者指定により軌道再設計の対象外とし、AVOID-018の円形グラデーションマスクで扱う。演出全体の小矩形への縮小・未対応レイアウトの黙示除外は禁止。
- テスト期待値を通過のためだけに変更しない。旧ONの意図した変更には要件上の根拠を付ける。
- Gitコミット/push/PR/公開は依頼または明示許可がある範囲のみ。今回許可されたGit操作は添付スキルの導入、および追加依頼による計画・タスク・証拠のコミットとプッシュ。後続実装の開始許可とは区別する。

## 完了条件

- [ ] 34stock IDに対してmainDraw外の文字も検査される。
- [ ] 3D/affineとcameraの合成が正しく、二重変換やクリップ欠けがない。
- [ ] drawProgram replace/overlayおよびcomponent由来の副歌詞が対応表に含まれる。
- [ ] カスタム非対応を自動成功扱いせず、保存・プレビュー・出力で同じ診断となる。
- [ ] 演出コピーに絶対回避座標が混入しない。

## テスト方法

- Unit: affine/透視面の包絡、特異行列、クリップ、カスタム文字node。
- Integration: stock34ID、custom/drawing replace/overlay、cam/ghost/treat。
- Regression: drawing_frames、drawing_fonts、custom_effects、effect_copy_fidelity。
- 実環境: cube/flag/cylinder/contour/wordSearchとカスタムfixtureの動画。
- 現時点の実行結果: 未実施（後続実装タスク）。既存の基準ログはAVOID-001へ参照し、修正後の証拠として流用しない。

## 停止条件

- カスタムDSLの公開schemaの破壊が必要になる場合は別の互換性判断へ切り分ける。
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
