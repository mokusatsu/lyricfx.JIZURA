# AVOID-009 blocks native fidelity03（内部段階）

親限定受入、動作確認不要。元の見た目・運動を変えず、ブロック面・文字・支持ブロック・玩具・床をprimaryの実描画単位として取り出す内部準備。円回避adapterはまだなく、対応済みID数は増えない。

実装・修正はgpt-6.1-sol / medium子、親がsource全文とrawをレビュー。最初の試験はfont3TTF配信漏れで未到達、次はfractional camera rootの丸めで記録再生32画素差。元の失敗rawを保持して、ブロックだけ既存の正確なroot保持へ追加する最小修正を受入れた。

7条件147描画の588画素組、1283sourceblocks、2230primaryevents/24757頂点、4735元描画命令を親独立照合。元の落下・bounce/squash・seed/hop・退出を再計算し最大差6.94e-18。旧32画素期待を緩めず成功、pile/accordion/flagの3対照も一致。[親raw照合](../evidence/AVOID-009/blocks-native01/parent-native03-review.json)。

main09a/11pと日英buildは隔離試験版に一致。その他97source、山exit13、全面カード、既存pycache/22absent skip archivesを保持。[統合照合](../evidence/AVOID-009/blocks-native01/parent-integration03-review.json)。source入力/過去失敗を含む3.12MB thinを保存し全36tar membersと115canonical/466runtimeの参照を親確認。

見た目と元運動の不変が画素・命令で確認できた内部段階なので人間の動作確認は不要と親が判断。新しい比較の公開も行わない。後続の円回避配置・各区間証明・視覚/正式性能は未実装・未合格。保存bodyも未到達。公開結果確認と親画像閲覧は0。
