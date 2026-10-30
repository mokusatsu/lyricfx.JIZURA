# 共通source経路 — 作業中、製品採用/親レビュー未了

実装担当 gpt-6.1-sol / medium、開始HEAD cb694e6d。全184実装完了ではない。原untracked3件は保持。commit/push・公開アクセス・media生成/encodeは行っていない。

A26/B25/C34とDのcube/cylinder/accordion/origami/ribbon/pendulumについて、旧解析の連続sweep部分を新geometry-only入口へ分離。元sourceの宣言済み完成clockからmain/A/Bの部品を一度構築し、入力由来sweepを適用する。A.record/replay・所有検証・全時計生成を新実行経路で呼ばない。通常auto areaの元寸法/clipを使い、元式のcamera、filter/shadow、slice/block/zoomの範囲を適用。未宣言の1時刻poseを全期間保証として扱わない。

新しい広範なselectorは撤回した。nativeBlock/sourceFormulaをsimpleCircle.targetsへ一括登録せず、burst旧controller除外も戻した。既存center/vcols/numbered/headlineDeck/bulbsと旧演出controllerを優先する。未知実装例外はunsupportedへ変換せず再throwする。現在の新providerは開発中であり、数値safeを製品回避合格へ数えない。

## 最新統合（2026-10-30、親レビュー前）

以下の旧「selector撤回」「010未実装」は途中時点の履歴。現在は11zz99でnativeBlock/sourceFormulaと並列typo/horror/kinetic/contour/crossword/domino/routeを一意登録し、通常automatic入力へ接続している。center-only7とmanual/lock/emphasis優先を保持。dominoの新限定providerはnoPost明示時のみで、通常post時は元controller。contour/crosswordもnoPost要求を黙って無効化せず、通常postでは未対応と明示する。

元auto area全体が最高scoreの主領域へ既に収まる場合、元viewport/clock/source描画を変更しない正の候補（unchanged-native-viewport）を先に使う。これは移動clipで内容を切り欠く旧試作とは異なる。以下の通常上円の多くはこの候補であり、部分幅適応の一般成功とは数えない。別の候補は元式の支持・sweepと短い有限候補を使用し、全時刻生成/実行時A.record依存はない。

証拠はrepo外 `shared-integration-{source,actual}07/08/09/10`。07の184 layout-only通常入力を最初に一括実行し、eventPolicy clone誤り・通常decor/treatmentの不要制限をまとめて修正、08は影響75条件のみ再実行した。08の数値結果はsafe16/不足38/未対応20/対象外1で、全184現行対応数ではない。code-level未対応と容量不足を成功には数えない。各rawのsafetyAccepted:false/fullRecipePaintCoverage:falseは維持する。

09ではvcols splitの通常FX（magnet/flashBox/overexposeOut/push/none/romajiLine）を維持し、既知romajiLineのguard排除1箇所を修正。準備29.6ms/表示183.6ms、actual/native3pass・13支持円非交差・文字字号一致を確認。genkou/tyStatCount/tyBandHide/wave/numbered主のみ・補助も3passで観測支持非交差・文字字号一致。上記の限定frameのみの確認であり、post-composite bloomと全時間/全variantを独立paint合格に広げない。既存SOURCE72材料判定は、実際に使うfill/stroke側のみを見る担当修正を適用（未使用fill gradientの誤拒否を除去、active未計測は拒否を維持）。

knSlamStackの09 main末尾2stroke差は、paused UI fast:falseのneonOnがchild layerCvへ描き、native参照fast:true/root observerでは追跡されない比較差と元式から特定。製品文字欠落とは判定しない一方、rootだけの一致を独立描画合格にはしない。10の2秒は元表示単位外で観測0、評価不成立として保持する。child合成観測の限定修正を待っている。

unsupportedの場合、共通prepareが削除した旧trajectory等を元cutの全列挙プロパティで復元し、正規new-recipe provenanceから外す。10で6種の旧placement属性の同一参照/全key保持を数値確認（QA markerでの保持試験であり、旧accepted描画の再受入ではない）。不足はUI空表示・警告/出力typed拒否を維持。未対応は原配置を維持し常設警告、出力はpartial metadata/警告。AEは回避配置未反映の通知を保持。

08のbillboardは準備と別に表示まで6222.2msを要した。通常上円の同じnativeIdentity候補であっても初回表示短縮の全対象達成とはしない。他の09例は表示99〜184ms。全実行は3ページ通常close/所有子3exit0回収/signal0/port閉鎖/pins不変、生成前空き約9.25GB。元untracked3件を保持、ローカルcommit/push/公開操作は担当では行っていない。新規media生成なし。親コード/rawレビュー未了。

### 最終影響確認11

`shared-integration-actual11/result.json` はcomplete:true/functional passed:true、producer/observer errors0。最新製品差分で中央円tySplitTypeは`UNSUPPORTED_TYPO_SPLIT_CLIP_SWEEP`、元表示nonzeroかつ常設「円回避未対応・元の配置」(hidden:false/display:flex)。旧属性復元の数値境界も全一致した。

knSlamStackを元0.8秒へ戻し、native参照もpaused UIと同じfast:falseへ合わせた。QA-onlyの既存observer拡張で実root drawImage destination/CTMを捕捉し、既存support48+root filter/shadow/clipで3pass/16支持がすべて円非交差、root文字キー一致。ただしchild Canvasの文字内容・順序は未観測なので`childCanvasTextUnverified:true`、全字安全の`paintQualified:false`を意図的に維持する。製品の文字欠落と誤認せず、独立全字確認済みとも数えない。

billboard通常上円を同runで1回だけ再確認。準備0.6ms/表示83.3ms、J.plan5.3ms、replan戻り26.0ms、ensureFonts0.3ms、actual/native3pass・45支持clear・文字字号一致。08の表示6222.2msは上書きせず、単発遅延の原因未確定とする。11も3ページ通常close/所有3子exit0回収/signal0/port閉鎖/pins不変。生成前空き9.24GB。新しい全件再試験やmedia生成なし。現行構文/build成功、親レビュー未了。

## 一括実行と影響修正（以前の途中経過）

raw正本はrepo外 `/workspace/jizura-logic-evidence-20261027/structure-formula-{source,actual}01/02/04/06`、診断は`structure-formula-diagnostic-{source,actual}03`と`structure-formula-domain-{source,actual}05`。actual01は対象外wave/burstでもpreparedを要求したharness失敗を保持。空geometryはmainDrawがenv.drawを通らない共通境界、Invalid polygonは2点lineをpolygon専用boundsへ渡した不一致と特定して修正。以後は影響群のみ実行した。

95 unique条件の最新数値prepare結果: safe18 / 不足41 / 未対応35 / 新target外burst1。safe18はlowerThird/dropCap/perspective/hanko/genkou/quote/neon/zoomRepeat/columnsBig/curtain/magazine/footnote/stampSheet/letterPaper/calendar/chochin/priceTag/pill。これは1入力・1scaleの結果であり全variant、全描画支持包含や一般性能を保証しない。magazine/zoomRepeat/perspectiveはscale1/3でsafeでも小UIでは不足になる。

通常UI例: actual02 lowerThird 準備4.7ms/表示94.9ms、入力変更6.2/85.2、不足5.5/70.5。actual04 genkou35.3/231.9、変更12.3/125.0、不足7.5/87.0。actual06 staircase14.9/170.2、columnsBig9.3/79.2。safe時nonempty、不足時空、未対応時原表示と既存警告のstatusを記録。manual/lock/emphasis/unknown lineageのtarget除外を同じ一括実行で確認。描画順/独立decor位置の全対象一致は未確認。各rawはsafetyAccepted:false/fullRecipePaintCoverage:falseのまま保持。

全6実行ともQt3ページを通常close、owned子3を正常回収、signal0、port閉鎖、pins不変。最後の生成前空き約9.27GB。新しい旧知見反映後は最新指示によりQtを実行していない。最後の構文/build成功はactual06入力時点であり、その後の差分は未検証。

## 既存知見の反映

- billboard81a-c/native-helperと81dモデル: 元19部品、文字/タグ、lamp clock、coneの元board clip支持が存在。native helper式を現在の描画に共用し、`knownSceneGeometry.billboard`へ潜在支持を接続した。7入力候補・固定ground契約は旧記録に存在する。34秒のoffline compilerを新UIで呼ばない。残件は固定地面と可動盤/支柱/灯り/字幕を分けた候補transport。
- magnets21/29: 連続snap [.95,1.28]、lift [0,1]、depth offset、固定丸角盤/取手/decoy、実round stroke半幅が存在。`knownSceneGeometry.magnets`へ範囲と源泉を接続した。旧23k CSS-bin/93区間の受入は固定fixture限定。新しい短いscaled-ink近似をその全bin受入と同一視しない。残件は固定盤との物理的付着と可動単位の候補transport。
- tiles48/49: 固定4字/日英250状態の受入、rack/score/tile支持、右entry/左exitとmoving時circle例外が存在。`knownSceneGeometry.tiles`へ保持中支持/元clockと位相例外を接続した。残件は元移動位相の例外を保持するtransportであり、全期間circle-clearへ勝手に変更しない。

上記は新入口に未接続だった既存知見であり「過去未調査」ではない。新入口へのgeometry接続と製品候補の採用は区別する。旧accepted pathは新selectorで上書きしない。

## 具体的な残件

未対応35条件はcoupled文字FX18、motion/treatment9、構造/clip等8。Bの非direct群とDの文字FXは、元のglyph poseと汎用main FXの合成範囲が未接続。motion残件はresolve/cursorSweepの置換glyph/カーソル支持、cutShift/rotateAlt/knWordScaleとjelly/barrelRoll/roll/handheld。構造残件はsplitScreenの主clipと独立fieldの結合、contentsのactive typography状態、proofreadのsource shader、clapper/nameTagのbody model、vinylの元disc内ink条件、trackingNoise、shoji shadow専用output transport。

task010の42 ID（typo18/horror12/kinetic12）は新source入口未実装。元sourceは存在するが、以前のtask記録では010実装/受入済みとはされていない。必要な共通境界は、typoの分片clip/反復・字間/行/数値、horrorの固定field/隠蔽・scanner/light/apertureと元歌詞の関係、kineticのswap/reflow/衝突/回転の各連続ブロックと時系列対応である。既存sourceの式と過去解析を優先して接続し、1時刻constructだけで対応済みに数えない。

## 基本受入12〜14（親レビュー前）

12でknSlamStack通常0.8秒のchild paintを実crop/destination/CTMへ結び付け、main4fill＋4stroke順序/字号一致、main/A/B3pass、root+image16支持clear、observer errors0。13でcenter/vcols/numbered補助/billboard/magnetsの入場・保持・退場計15条件と円変更・2cut切替2時刻の個別paintが全pass。PNG/MP4実関数は同prepared planへ接続しencode直前QA停止。13の総paintQualified:falseは、resize後の正しい不足空を通常一致比較へ入れた分類誤りで保持した。14はその影響箇所だけ確認し、480×270→318×179のdirty前後true/最新歌詞plan/不足警告/pixelblank、元幅へ戻した最新歌詞safe/nonzero/3pass17支持clear。AE metadataはnot-appliedを確認。製品は11以後未変更。

184 IDのselector/旧経路/出力条件、各版の数値と独立paint/未検証をrepo外 `shared-integration-handoff-20261030/selector-evidence.csv` と `handoff.md` に整理した。登録156は動作受入156を意味しない。旧版raw/現行接続/現行代表受入を分離。全run資源回収正常、新media/encode/公開操作なし。追加の一括試験はここで区切り、親レビューへ渡す。


## 追加8登録と集約QA16・18、字体確認19（2026-10-30）

既存156登録へ `remainingObjects` のwordSearch 1ID、`remainingEffects` のledScroll / sliceStack / glitchGrid / mosaicTiles / maskReveal / halftoneBig / stencil 7IDを追加した。156+8はselector登録数であり、全入力・全variant・全時計の適用成功数ではない。effects 7件は元sourceの形状/clip支持と有限候補による移動経路を持つが、条件によって不足または未対応を返す。wordSearchは元viewport全体が既に安全な `unchanged-native-viewport` だけを認め、失敗時は `CONTINUOUS_LYRIC_SIZE_INK_ENVELOPE_REQUIRED`。字体binの大量計測・wordSearch移動recipeは採用していない。flipCards / flag / pile / blocks / balloons / crowdBubbles / puzzle と、shadowPlay / kaleido / wall / zipper / fisheye は今回の新providerで移動対応済みとは数えない。

追加providerの条件不成立をhandles=falseだけで対象外にすると警告と出力partial metadataが欠ける不具合を親レビューで発見し、登録adapterの所有判定とidentity前のpreflightを分離した。旧placementTrajectory所有は旧controllerを保持する。wordSearchのflickerは `SOURCE_FORMULA_WORDSEARCH_TRANSPORT_OR_DOMAIN`、effectsのoutlineOffsetは `REMAINING_COUPLED_TREATMENT` と明示し、元描画と常設未対応警告を保持する。不足は空表示・不足警告・出力拒否を維持する。manual areaは今回の新適用範囲へ拡張しない。

連結装飾について、汎用sourceFormulaのindependentDecorは原位置固定のため、chochin / tanzaku / ema / bookSpine / stampSheetの非ゼロoffsetを `SOURCE_FORMULA_COUPLED_DECOR_TRANSLATION` で拒否した。ゼロ移動と元viewport identityは保持する。実QAではchochin / tanzaku / ema / stampSheetで新guardの拒否を確認し、bookSpineはそれより前のFIELD_CLIP拒否だった。bookSpineの新guard到達を実測合格とは数えない。5件とも元viewport identityの代表実paintは限定照合済み。

証拠正本はrepo外 `/workspace/jizura-logic-evidence-20261027/shared-batch-actual16/` と `shared-batch-actual18/`。actual16はmatrixのproducer処理後にpaint12保存で `RECORD8MiB` に達し、`complete:false` / probe exit1のまま保持した。41 typed状態（safe19 / unsupported15 / insufficient-space7）は `independent-classification.json` に残るが、run全体の受入ではない。paint00〜03のledScrollはobserver材料未対応で独立合格ではなく、paint12〜27とobserver error詳細には未保存分がある。保存済paint04〜11のsliceStack / glitchGrid各4描画、計8描画だけを完全raw・hash/byte整合付きで限定再利用し、再描画していない。

actual18はQA観測器だけを修正して完走し、`complete:true` / errors0 / functional passed:true / paintQualified:true / allVariantsQualified:false。独立照合は `aggregate-independent-report.json`。actual18の28描画とactual16保存済8描画の計36代表描画を限定受入とし、7演出それぞれのformula候補を0.22 / 0.8 / 1.3秒の3時刻、元viewport identityを各1時刻で確認した。rawのarea/行列/offsetを追加照合した結果、非ゼロtranslationの3時刻合格はledScroll / glitchGrid / mosaicTiles / halftoneBig / stencilの5演出。sliceStack / maskRevealのformula候補は3時刻ともゼロoffsetで、actual/nativeのareaと行列は同一だった。actual16のidentity/sourceというラベルだけから移動有無を判定しない。wordSearchはidentity 3時刻、連結装飾5件はidentity各0.8秒を確認した。

独立照合ではmain passの元文字/形状/状態/材料の一致と、実TextMetrics・source path境界から再構成した支持の円非交差を確認した。actual18の独立支持判定1524件、pattern材料64出現、raw100記録/JSON 107712005Bを照合。複雑clipはclip前の全支持が円を避ける場合に限って交差計算から省略した。これは指定時刻の代表paintの確認であり、全入力・全時計・全variantの受入ではない。producerの `safetyAccepted:false` / `fullRecipePaintCoverage:false` は維持し、post-composite bloomは独立未観測、最終PNG/MP4 encodeも未実行。actual15の不正radius/manual fixture失敗、actual17のgradient hookと既存radial observer guardの不整合失敗も保存し、合格へ置き換えていない。旧accepted12〜14の不変範囲は再実行せず再利用した。

Qt資源はactual15〜18各runで3ページを通常close、所有子を回収、signals0 / debug port閉鎖 / cleanupComplete:true。actual16は生成前空き9153142784B・想定64MiBで開始し、記録上限失敗後も回収完了。actual18の製品pinsは前後不変。QAは製品sourceを変更せず、新media生成・公開確認・commit/pushは0。

字体の変更は09a_placement / 11_export / 12_uiに限定。planFontsCurrentはdocument.fonts.statusだけで判断せず、要求familyと歌詞/drawingのglyph subsetの実readiness・revision一致を確認する。`font-readiness-actual19/result.json` は実FontFaceSetの5条件でcomplete:true: 読込済み要求glyphはtrue、setがloadedでもfamily欠損はfalse、必要glyph subsetがunloadedならfalseかつ検査でloadを開始しない、subset読込後はtrue、await中revision変更はfalse。既存描画証拠を再利用し、字体readinessの5条件を全演出の描画再受入とは扱わない。

残件は、wordSearchの連続字形支持を少数計測で包む移動方式、上記未登録構造群の専用式/付着/clip transport、effects各variant・FX・全時計の支持確認、連結装飾の非ゼロ移動transport、post-bloomと実encodeの検証、一般性能と人間の動作確認要否の最終親判断。今回の限定QAから全184対応・009完了・正式性能達成を宣言しない。
