# AVOID-008 親レビュー（進行中）

2026-10-23 JST。実装担当はgpt-6.1-sol / reasoning medium。親はコード・結果のレビューとタスク記録を担当し、画像・動画の実見は文脈を遮断したsolへ委任する。公開結果確認はAGENTS.mdの利用者指示により実施しない。

## 共有transportのチェックポイント

[独立照合記録](parent-transport05-review.json)は`ACCEPTED_SHARED_TRANSPORT_ONLY`。immutable Git beforeとraw/gzip snapshot 13件を照合し、native136/136、OFF34/34、40variants・raw145イベント・可視3,117,352画素の境界内包含、既存Bの実描画fill比較を確認した。

親から返したfill境界の二重膨張、既存A分岐への不要なstroke変更、source guardの誤挿入、stock custom_draw wrapperとのidentity不一致は、そのチェックポイントで解消された。過去の失敗ログはnative01に保持する。この承認はC34の回避・全時間・再配置・視覚判定の承認ではない。

## Cの方針

[初期設計](strategy-design-initial.md)の各IDの物体・文字組み・時計に沿う候補順を確認。全体の小viewport化、汎用の折返し、主歌詞/所有板の補助扱いによる除外を認めない。独立背景や大量反復補助の分類は実sourceを根拠に個別に確定する。34ID対応表だけで実装完了に数えない。

## 最初の付箋試作のレビュー

- sourceの紙・折角・影・留め具・文字は共通の変換と移動を受ける。元のnote数/chunks/読順/入退場clockを保ち、native一体移動、native字の間隔変更、離散note/fontサイズという候補は演出固有の方針として妥当。
- `safe-hold`は既存compositionEligibilityに対応している。全区間safeと表現せず、native入退場の緩和と静止hold保証を分ける。
- `sticky01/acceptance01.json`の6条件について実hold rasterが非空でmargin衝突0であることを親も確認した。これは最初の試作結果であり最終受入ではない。3note長文の通常円未成立は現在の探索限界で、物理的不可能の証明にはしない。

実装担当へ返した未解決の追加確認:

1. source登録だけでなく、stock wrapper完了後のrenderer/makeEnv不変参照を検証すること。現在のprototypeとの一致だけではprototype自体の置換を見逃す。
2. cameraEnvelopeがplan.fx/styleを見る一方、実描画はcut.effectFx/style/fontsを使う差を扱うこと。
3. hold保証をmotionTime、region切替をrealTimeで判断し、quantize/ghost lag/境界±epsilon/短尺を試験すること。可視holdがない全緩和をsafeと数えない。
4. 空/空白chunks、4notes、重複文字、英語、明示サイズの保持、実測読みやすさ下限を検証すること。
5. 残る33IDはpending。付箋にも独立の視覚・MP4比較と親最終レビューが必要。

### 追加確認の数値チェックポイント

[親の独立照合](parent-sticky-checkpoint01.json)でtransport06のraw/gzip 6件、40variant一致・6negative拒否を確認。`11z_layoutsC_transport.js`がstock wrapperロード後の関数参照をclosureへ固定し、prototype差し替えも拒否する。CのcameraEnvelopeはeffective inputsを明示して呼ぶ。現common finalizerもeffectStyle/effectFxをunsupportedとして先に拒否するため、対応済みとの誤認はしない。

`sticky01/boundary01.json`の6clock/ghost、12camera/render-scale、3明示サイズ、prototype2negativeと実raster結果をレビュー。4source positiveと空白noteのunsupportedが実値として確認できた。source positiveのassert自体が未stagedを見逃す点は追加修正を依頼中。

親がproduct solverを使わず、ray crossingと点―線分距離によってprobe02/acceptance01/boundary01のsafe-hold20区間・170包絡polygonを再計算した。円のmargin、元stage内保持とも違反0。静止holdの数値チェックポイントだけを承認し、native入退場の全時間回避、視覚判定、C34全体の完了には拡張しない。

### 付箋preview01の新規問題

[capture構造照合](parent-sticky-preview01.json)で21assets、4本×96 native frames、12key PNG、immutable before Git bytesとafter transport06 snapshotを確認した。これはメディアの構造・条件の確認であり視覚PASSではない。

文脈を遮断したgpt-6.1-sol / mediumによる実見から、afterの退場peelで新規stage cropの報告を受けた。landscape f93は右端の紙/折角、portrait f91は紙底辺、f93は『先へ』の行が画面外となり、before同frameでは内包する。native入退場の円通過緩和は、読める文字が不自然に切れる現象の無条件承認を意味しない。preview01を保持し、実装担当へ修正を返した。正確な開始frame/重大さは独立レビュー記録へ追記予定。

区間内固定位置・native clock/pathを維持し、hold円回避とentry/exit stage包絡を別に評価して配置方向を選ぶ方法を優先する。元exitの削除や汎用の時間依存offsetを先に採用しない。C全体のstage退場禁止という新たな一律要件ではなく、今回確認した新規の不自然な欠けを解消する判断である。

### 付箋修正02のコード・数値レビュー

source note pivotからrest polygonを逆回転し、entry一様scaleの端点、exit peelの連続parameter z∈[0,1]を32区間のsin/cos/積区間演算で包絡する実コードをレビュー。区間全域の保守boundであり、32枚の時刻サンプルを証明としていない。元のexit時計・scale/回転/落下を維持し、円はhold包絡、stageは全phase包絡で別にsolveする。renderでも全phaseのstageEnvelopeCoveredとstageContainedを確認する。

[checkpoint01](checkpoint01/snapshot.json)に当該source/生成HTML/testのraw gzip15件とSHAを固定した。親がstage01の10包絡polygonの全頂点へ固定offsetを適用して画面内保持を再計算し、padded actual raster22frameのstage外alpha画素0と結果を照合。日英buildのbyte冪等も実行した。修正02比較はmanifest SHA `eeef356179ca535454c663a9203a9dc00302270cee6a669535a98a7a0caa470d`、21assetsのraw一致を確認。比較MP4/PNGはlocal work内、checkpointへ保存したmanifestだけでは独立bundleと主張しない。

名札の試作はnative badge→writing-field measure→物体/字体段階sizeを持つが、stage proofはnullで視覚も未完。途中commitに保存しても最終adapter受入数へ含めない。Cの通常利用への既定有効化は017まで行わない。

[独立視覚02](sticky-visual02-review.md)はafter全192frame・6native key、両条件f90〜93原寸で旧cropの解消を確認してPASS。beforeは旧01と全対象bytes一致を検証した本人の既実見をcarryし、再実見と偽っていない。元のclock/peel、紙・折角・文字の一体感と可読性を保持するこの2fixtureは親も受け入れる。C全体の全variant/multiface等の最終受入ではない。内部checkpointのこの2fixtureに追加人間確認は不要と判断する。理由は、source clockの同一性・所有物の連続幾何包絡・実rasterと独立全frame照合で、既知の退行と意匠維持を具体的に確認できたため。人間がC34へOKした記録にはしない。比較公開もこの内部checkpointでは不要。

## 後続の保留事項

C34全体の回帰、日英起動、multiface/annotation/aspect/variable radius、性能、同条件の比較素材、必要な人間確認、commit/pushは未完。既知の保存013未到達失敗、012/017の合成/再抽選問題等をこの段階の成功へ置き換えない。

### 途中checkpointのGitと既存回帰

7cd5a5bをworkへcommit/pushした。push操作は成功戻り値を確認し、公開結果への追加アクセスは実施していない。

[regression01親照合](regression01/parent-review.json)では既存suite5本がGit原本と同bytes、baseline compiledが2bb、afterが7cdと一致することとsnapshot12,993件を親が独立照合。runner/preload/loaderも読了し、変更はChromium実行位置・immutable compiled読替え・optional外部通信abort・依存解決の環境適応だけでassertionは不変。drawing_frames/palette_stability/cut_detail_audit/effect_copy_fidelityの両版PASSを受入。lyric_area_effectsは両版同じline35 FAILで、004で既に観測し017へ引継いだ問題の再現。後続assertion/ENの未到達を成功扱いしない。local smokeはJA/ENとも7cdの実HTMLをserveしhash/起動/描画PASS。初回ESM解決FAILは保持。これは既定経路の回帰checkpointであり、C34の対応完了や今後編集後の検証ではない。

## 共有registry・CSS字体・付箋の同一ソースcheckpoint

[freeze02](shared-sticky-freeze02/manifest.json)を親が[独立照合](parent-shared-sticky-freeze02.json)した。103source/compiled/script/fixture/fontと5report/5logのraw/gzip113件、結果に記載の120source pinsを全て照合。変更09g/11pの実sourceが、試験したJA/ENのHTMLへそのまま含まれることも確認した。過去のregistry02/font01/carry03等のpinsは後続編集と不一致になっており、現行版の証拠とは混同しない。過去FAILは保持する。

registryは登録4拒否、返却schema11拒否、callback throw時の原本復元、OFF/manual/lock/emphasis/no-regionのcallback未実行とpixel同一性5件を確認。空region・cut外holdによる空虚なsafe認定を拒否する。synthetic adapterの返却は意図的にinsufficientであり、幾何の認証には使っていない。

CSS fontの`parseFloat`はweight500をサイズ500と誤認するため、実px tokenだけを取り出すhelperへ修正。weight/style/familyは同一性比較に残す。実weight500/700のファイルをロードし、C magazineのnativeText計48drawが実9pxとして抽出されることを確認した。これはparser/source drawの確認であり、magazine回避の受入ではない。

付箋はnative noteごとのentryEnd/exitStartを元時計から計算し、先に静止したnoteが後続noteの入場緩和を借りない。exitなしは各noteが静止判定を維持する。境界/ghost6条件、camera/render-scale12条件、明示size3条件、実note phase12sampleを確認。preview02のnative Canvas192frame全bytesを再現できたため、既存の独立視覚PASSを同画像としてcarryする。この内部基盤と付箋2fixtureに追加の人間確認・比較公開は不要と親が判断する。全variant/字体/C34の完了を意味せず、名札のsource-specific退場方向/文字領域recipeは同bytesに含まれる未受入試作として保存する。

## 和風試作checkpoint03のレビューと返却

[親記録](parent-japanese-checkpoint03.json)はcommit f4c512dの実moduleと関連sourceを読み、immutable probe09のsafe-hold6条件をproduct solverを使わず円中心の内外/点と線分の距離で再計算した。margin込み円距離と全stage包絡頂点の保持は違反0。probe後にsourceProofの説明文が修正され、共有registryも別worktreeの未commitコピーなので、これをexact-source実行証明にはしない。

提灯のradial lightingは字影を持たない背景照明と実sourceから判定し、円の大きさによらない固定分類を認める。本体/rib/cap/短紐/主文字はprimaryのまま。長紐・stage wireを背景扱いする場合も、接続とrevealを保つ必要がある。単純translationで天井端が浮く問題、we>0でwire延長が瞬間出現する問題、各unitの静止期間を後続入場で一律緩和する問題を実装担当へ返した。提灯01の独立実見では、物体/文字/時計は保持する一方、移動して見えるようになったhaloの直線切断を検出したため視覚FAILとして保持し、同gradientのsupport範囲の修正を依頼した。

掛け軸は[独立視覚](kake-visual01-review.md)で1fixture限定PASS。元のunrollによる途中clipとstage端の新規cropを区別した。objectScale .9を使っているためHTMLの「translationのみ」と読める説明の訂正も返却。正式字体/多variant/他IDへの受入はしない。親は画像・動画を実見していない。公開結果確認も実施していない。
