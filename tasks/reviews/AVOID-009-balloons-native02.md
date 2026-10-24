# balloons native02 — 内部fidelity段階の親限定受入

実装担当balloons_native_impl01、gpt-6.1-sol / medium。親はsource/diff/math/runnerを全文確認し116固定入力と466既存runtimeを実hash照合して実行。parent native01 run57194は8条件222calls/124assert失敗、原OFF/directの画素/paint/BB/getter/入力状態は不変。motionScale1の42画素失敗はfractionalroot、motionScale.5には52画素失敗と30catalog失敗があり、元effective motion.325をrecord→makeEnvが再度.5倍し.1625へ変える既存問題を確認。両原因の重なる失敗もあり、94画素すべてをrootだけの原因とはしない。

旧01全source/seal/rawを保持し、02ではstrict stock balloons D・main/A/B・source/transport既知に限って、元live camera rootと元の有効FXを記録へ保持する。generic makeEnvや他DのmotionScale挙動は変更しない。広い既存問題は019へ引継ぎ、全体を修正済みとは扱わない。

親run89887は同じ8条件・同じ222callsと他D3controlsでexit0/失敗0。親の[独立scriptと結果](../evidence/AVOID-009/balloons-native01/parent-native02-review.json)は888画素組、5088元paint、1014glyph状態/829出現、2116primaryevent/31858頂点、252livegloss callbacksを照合。seedhash、位相、bob/rot/growth、元行/slot、11string座標、knot/rim/body/gloss/highlight、native rootを再計算し最大残差1.14e-13。別の元HTMLとのOFF一致、原BB/呼出回数、不変な入力freeze/aliasもreview済runnerの実assertで確認。

Catalogは元の全rim/body/gloss/highlight/string/knot/sharedanchorをprimaryの新しい数値オブジェクトとして所有し、元配列やプロジェクトをfreezeしない。実描画・in-memory replayは元gloss callbackを保持し、診断JSONだけからcallbackを復元する設計にはしない。元の順序・字号・運動は変更しない。

main2sourceと日英buildは試験済みRAM afterに一致し、他99source/旧PYC/22absentを保持。[親統合照合](../evidence/AVOID-009/balloons-native01/parent-integration-native02.json)。Product ec594e6f、work push45884 exit0。内部計測/忠実な記録だけで新配置・見た目変更はなく、888画素組等の根拠によりこの段階の追加人間確認は不要と親判断。回避adapter加算0、限定source対応11Dの数は増えない。

次は連続CSS-font-binのinkと糸/所有コピーの支持を機械判定する診断設計から進める。純native共通translationを先に検討し、不足時の次戦略は別のsource gateで検討。Circle/stage/expiry proof、adapter、正式性能、必要なnative60fps比較と動作確認は未実施。この段階の公開操作・公開結果確認・親画像閲覧はいずれも0。

元入力の追跡は[canonical map](../evidence/AVOID-009/balloons-native01/canonical-input-map02.json)へ。Git参照と実hash済み外部8fonts/browserloader/466runtimeを区別し、self-contained runtimeとは主張しない。失敗01/成功02はhardlinkで元workpathも保存、大きな重複capsuleなし。
