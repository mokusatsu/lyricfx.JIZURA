# AVOID-004 全画面の軌道と描画・境界計測の共通基盤

- 状態: 未着手
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

- 今回の計画登録を実装着手の許可と解釈しない。実装は後続の依頼で開始する。
- 無関係なリファクタリング、ロック解除、手動配置の破棄、歌詞のline/partや時間の変更を混ぜない。
- 主歌詞の回避をマスク抜きで代用しない。補助的な大量反復歌詞は利用者指定により軌道再設計の対象外とし、AVOID-018の円形グラデーションマスクで扱う。演出全体の小矩形への縮小・未対応レイアウトの黙示除外は禁止。
- テスト期待値を通過のためだけに変更しない。旧ONの意図した変更には要件上の根拠を付ける。
- Gitコミット/push/PR/公開は依頼または明示許可がある範囲のみ。今回許可されたGit操作は添付スキルの導入、および追加依頼による計画・タスク・証拠のコミットとプッシュ。後続実装の開始許可とは区別する。

## 完了条件

- [ ] tile等の主歌詞と反復補助を別役割で取り出せ、描画順・cut opacity・multiply/overlay・frontmostが基準fixtureと一致する。
- [ ] ロード前後の異なる文字幅を検知し、正しい計測revisionで軌道を再計算できる。最終plan確定は冪等。

- [ ] 新自動経路のlayout.planとrenderが常に元ステージW/Hを受け取り、小矩形clipを受けない。
- [ ] 同じtのfast/full/順seek/逆seekで最終配置が一致し、renderがplan/projectを変えない。
- [ ] cameraの移動・回転・scaleと親affineを含む変換が二重適用されない。
- [ ] mainDrawを経由しない文字にも対応可能な公開内部契約と独立bounds testがある。
- [ ] 旧OFF/手動area/旧lock fixtureの座標・効果・クリップが維持される。
- [ ] 計算不能・特異変換・候補なしを診断でき、例外をcatchして成功扱いしない。

## テスト方法

- Unit: 行列合成/逆変換、寸法と軌道の独立、曲線全区間の境界判定。
- Integration: 代表1レイアウトでfull-stage、camera、ghost、transition、複数pass。
- Regression: lyric_area_effects、cut_mask、drawing_frames、effect_copy_fidelity。
- 実環境: 静的/移動の代表をスクリーン録画・frame比較で確認。
- 現時点の実行結果: 未実施（後続実装タスク）。既存の基準ログはAVOID-001へ参照し、修正後の証拠として流用しない。

## 停止条件

- 共通hookのために無関係な全Renderer再設計が必要になった場合、別タスクへ分離する。
- 生成側と検証側が同じ誤ったbbox関数を共有する状態になった場合。
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
