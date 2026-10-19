# AVOID-005 親レビュー（進行中）

- 実装担当: 指定 gpt-6.1-sol / medium の子 `/root/implement_avoid_005`。
- 開始HEAD: 3d8f52c7ce3f8efec25f5f0d7ad4c71bdb225173。004は全項目OK回答・親判定で完了。
- コード・ローカル検証・公開・人間確認は本記録時点で未承認。

## 設計レビュー

- R05-01: 円のbboxを4つの矩形に分けたcarrierだけでは設計§5.3を満たさない。円の実幾何で候補を検査し、角の空き領域を利用できることを要求。担当は4carrierのみの案を撤回し、所有単位ごとの全時間包絡と円/ポリゴン候補判定へ変更中。実コード検証前。
- R05-02: waveのtrail、scatterのextras、vcols/condensed/stackの反復を根拠なく補助へ除外しない。主歌詞の附属板/ルビ/注釈は同じ所有単位で移動。diag副帯だけは002でレビュー済みのtiledAux分類を利用可。実コード検証前。
- R05-03: 004の人間確認で先頭の従来対照と新機能の区別が分かりにくかった。005ページには日本語のcaseごとの見方・変化/不変を示す。公開004bundleは変更しない。

## 変更前の独立回帰確認

固定archive3d8f52cで元assertionを変更せず実行。Windows固定browserpathだけ既存のlaunchshimで/usr/bin/chromiumへ差替。node24、ローカル8765server、外部fontは元テストの制御に従う。

- lyric_emphasis: 日英成功。
- lyric_placement_stability: 日英成功。
- lyric_features: line24で失敗。defaulttitleによりt=.1は期待1/実2。t=4.5は4で一致。日英probeも同じ。後続assertion未到達、成功扱いしない。017へ引継ぎ。
- 証拠: [結果](baseline-before/results.json)、[probe](baseline-before/features-probe.json)、同フォルダの再現script/log。変更後比較は未実施。

## 試作レビュー追記

- R05-04: pillのnativeclipを取り除く試作を却下。所有単位とともにclip/gradientを再現する修正を要求。現時点ではsingleRectClipとgradientRectの0offset一致を親が独立確認（実pill全条件は未確認）。
- R05-05: 各unitを独立に円から離すだけでは重なり/読み順の逆転を生む。順序・間隔を軌道全体で維持する条件を要求。副次的にfinalizeのoptions切替時の派生placementUnits除去、追加計測canvasの実バッファ計測を要求。未解決。
- R05-06: clipの最後のrectだけを採用し、他のpath/Path2D/fillruleを黙って無視する試作を却下。未対応pathを明示拒否しgradientの再生成をrectにも適用する修正後、親独立probeでgradientRect/singleRectClipの0offset画素一致とtwoRect/rect+arc/Path2Dの拒否を確認。compiled SHA `6a3d18c8e9bbfe3eaeb3a7c5ae4a9d48d9ce76a57e1e89602e6dc1a3616e7b0e`。証拠はavoid005-recorder-probe.cjs/json。拒否caseの画素差は未replayによるものであり、描画一致成功とは記録しない。
- R05-07: full-duration bboxの定数平行移動だけではnative seed704/日本語4glyph/r=.20の試作は16中5のみ安全で、他11をinsufficientとした。これを全16対応成功とは認めない。波/回転軌道の移動幅と文字寸法を分離し、読み順を守る円周経路へ設計を継続する。
- R05-08: 『現在のbboxがclearなら元位置、衝突なら上へ投影』という分岐は円の接線境界で飛ぶ。選んだ経路の連続な接続、文字/附属板の最大寸法、画面内収容、全時刻の安全性、seek決定性を証明・検証してから採用する。設計中、未実装/未承認。

004の完了記録 `3d8f52c` はPages run39216201047成功。更新は記録のみで、004manifest/日英HTMLを通常HTTPS200/TLS検証0・元hash一致で再確認した。005の作業差分は未公開。

## 第2実装担当と追加画素検証

005は同一タスクのまま、初代担当の停止後に新しい子 `/root/implement_avoid_005_routes`（指定gpt-6.1-sol / medium）へ順次引継いだ。並列の製品編集はない。初代試作/不合格根拠はprototype-01/handoff.mdとcheckpoint.jsonに保持。

- R05-09: circle/arc/rrectのAA計測が縮小時に不足。親の実Canvas alpha>=1画素中心と記録polygonの独立照合72条件・312506画素で28条件（scale .1/.2/.5）、225画素が包絡外。compiled6a3d18c8。局所1pxを変換するだけではdevice1pxを保証しない。再現はavoid005-shape-raster.cjs/json。実装担当へinverse-affine AA等の補正と再検証を要求。未解決。
- R05-10: diagの元から画面外へ伸びる2.4W帯を、全形状が画面内に収まらないだけで配置不能にしない。nativeの画面境界と新規小矩形clipを区別し、主歌詞の可読性/可視範囲を保ちながら帯と文字の実polygonで円との干渉を検証する。画面外へ全歌詞を隠して成功にしない。
- 実時刻は円resolver用、元の描画t/ltは量子化/ghostlagを含むmotionclockとして維持するよう再確認した。

- R05-09修正後: 実装担当が親作成の独立probeをそのまま再実行し、72条件・312506画素・包絡外0。compiled `5ae9770ff4c7916f1ad9850d2d29747f8ba5a840d421ec429976728169cb3f3f`、`shape-raster-after-inverse-aa.json`。inverse-affineのdevice1px分をlocal x/yへ戻す変更を親が差分確認。最終候補での再検証は後続レビューに含む。

- R05-11: options変更時の再finalizeで元のauto areaが失われ、未対応paramsの拒否時には以前の認証trajectoryが残る。親独立probeでsource入力と既finalized入力を同条件比較し7遷移中6不一致。circle disc→eclipseはUNSUPPORTED_ADAPTERなのに旧trajectory残存。compiled `1f072bd41ae7e9db8858a4b3853a6fa5e9d03304ea493408756906fcad49a200`。証拠 `avoid005-refinalization-before.cjs/json`。元の合成済みsourceを保持した再計算と直接assertionを担当へ要求。未解決。

- R05-04追加検証: 親独立probeでnative pillの実clip/gradient/smalls、scale .1/.2/.5/1/2×4時刻（登場/保持/退場）を非zero移動・shear affine下で元rendererと照合。20/20完全画素一致、全case測定対応。compiled `1aaebc22590da70c7bb1fee034c8005ba2dec2c07b9c39b83aa31fba7d2ff01d`。証拠 `avoid005-shifted-replay.cjs/json`。経路安全性/最終候補の承認とは分けて記録する。

- R05-08経路演算子の独立照合: 10,000の寸法/円位置/半径/方向組合せ中、証明条件を満たす3,894経路で35,046座標（接線両側±1e-7を含む）を独立の矩形距離と画面境界へ照合。侵入/境界外/throw/接線ジャンプ0。compiled `7175cbfdee0d757724c6278e561308b4d73e155564391a322169dcb765400985`。証拠 `avoid005-route-geometry.cjs/json`。解析的条件の数値的裏付けであり、native各IDの全時刻/所有寸法/読み順の証明とは別。

- R05-11修正確認: 最初の合成済みcutsをfinalized lineageのWeakMapに保持し、options変更はその元から再計算。通常J.plan入力は現在の編集内容を使う。親が同じprobeを再実行し7/7遷移一致、未対応eclipseに旧trajectoryなし、除外/無効化で元area/params復元。compiled `7175cbfdee0d757724c6278e561308b4d73e155564391a322169dcb765400985`、`avoid005-refinalization-after.json`。

- R05-12: 親の実描画確認で、waveはcertified-continuous-routeなのに「風の先へ」の「の」「へ」が画面外。owner `wave.unit.0.5` の末尾をdot splitして5×2=10と読むバグで、glyph index1を10と誤認。円との非衝突だけでは文字を隠す誤判定を検出できなかった。整数のphase metadataと主歌詞全字の画面内assertionを要求。compiled `1568106e54b5691e8594b714a07a3ddd4c648727c64963bb0d2a5f285061caa6`、development-grid-before-phase-fixのPNG/JSON/cjs（開発診断用であり固定変更前比較の代用品ではない）。同時にlabelsのfixture paletteがinkと背景色の近似で読めない点を指摘し、前後同条件で可読な配色へ修正を要求。実装担当の修正報告あり、親再検証前。

- R05-12修正確認: phase/trail整数metadataを明示し、主glyphのstage矩形assertionを追加。親の120条件（中央/上/下×native・zero・±tiny・±通常travel×5時刻）で、nativeが描く主文字数との一致・移動後インクの画面内・各frame安全性を照合し失敗0。compiled `84ba5f84752bc2b707594262a3a481fe1b14a47775e80c14cc78e0ad18da564a`、`avoid005-wave-main-after-phase-fix.cjs/json`。初期t=.01は元のstaggerにより2字であり、親probe初案の常時4字という誤った仮定をnative描画実測との比較へ修正。元の登場タイミングを早めていない。最初のハーネス失敗を製品不具合件数には算入しない。

## 比較資料の独立実装担当

- コアの修正継続中、005の比較ページ/撮影/公開validator準備だけを指定gpt-6.1-sol / mediumの子 `/root/implement_avoid_005_review_tools` へ依頼。004完了HEAD3d8f52cから `/workspace/work/avoid005-review-tools` に切り離したworktreeで、新規basic-review.cjs/basic-sample.html/basic-cases.cjs等のみ担当。主作業ツリーの製品コード/basic-fixture.js/basic-test.cjsはroutes担当だけが編集する。005内の独立した編集であり、006は未着手。最終captureはコア受入成立後、親レビュー/公開検証は親が行う。

- R05-13: 曲線形状を正確に包む新計測で、sharp corner/miterとarc square capの端が不足。親独立alpha>=1画像照合をradius0/lw20/miter rrect、lw20/square cap arcへ拡大し、120条件・694984画素で27条件に包絡外を検出。内訳 {'rrectZeroMiter': [16, 1523], 'arcSquare': [11, 353]}（条件数/画素数）。compiled `06802689836beca725e0f2e55d91cfc7f742df807b0ee86a7157c65919451719`、`avoid005-shape-edge-before.cjs/json`。記録側が対応済みとするCanvas状態なので保守的補正または明示拒否が必要。既存72条件の0漏れだけではこれらを保証できない。担当へ修正を要求。

- R05-13追加: 修正後にdash/square capのcircleとrrectを追加して168条件・1248366画素を親照合。旧miter/arcの漏れは解消。rounded rectangleの曲線dash端だけ16条件/3938画素の漏れが残る。compiled `21000762a97c5f73c950a206f1849ed7d4b77f0f0c68ec4364f996c0775c9118`、`avoid005-shape-dash-before.cjs/json`。同じsquare cap境界として担当へ補正を要求。

- R05-13修正確認: 親が全168条件・1248366画素を再照合し、対応済み168条件すべてで包絡外0。compiled `536d103ae6f1cbfd4e886b6c6663df237ee1d0ef4d497e174b48de22e956ee67`、`avoid005-shape-edge-after.cjs/json`。radius0/miter矩形の半線幅、arc/circle square capの角、dash付きrounded rectangleの√2半線幅を保守的に含める変更を確認。

- R05-14: contentScaleによりscale1のAA余白まで縮み、追加9pxでは最小renderScale .1の10pxを覆えない。親がwave/huge×contentScale .1/.2/.5/.8/1×renderScale .1/.2/1×中央/上/下×push/dutch（各5時刻）を検査し180条件中48でENVELOPE_VIOLATION。compiled `536d103ae6f1cbfd4e886b6c6663df237ee1d0ef4d497e174b48de22e956ee67`。`avoid005-content-scale-before.cjs/json`。任意の正contentScaleを受け入れる契約の範囲内のため、AAを縮めず全体の保守的境界を実装するよう担当へ要求。最終captureは未実施。

- R05-15: 担当の拡張実画素試験でcondensed/gloss/typeの一部alpha画素が測定polygon外に残った。全体の円外判定だけで十分とせず、実描画との境界一致を修正・再確認する。`expanded-acceptance-before.log`。同ログのvcols既定横長は元からinsufficientであり、ラスタ試験の安全例選択を既存144件で認証済みの縦長中央へ訂正する（当該横長の不足結果は保持）。
- R05-16: 全16IDを含む100/100・1000/1000の性能試験がplanning約9.53/12.55倍、描画追加p95約6.7/10.3msで契約予算を超えた。並行試験の影響を含む初回結果として`performance-before.log`を保存し、profileで反復solver計算を確認。担当に同じ円・同じ包絡の再計算削減等を依頼。最終性能判定は修正後に同条件・非並行で実行する。
- R05-17: 比較ツールの試作は『安全期待』でも不足結果を拒否しない実装、未描画のmarquee/tile注釈まで表示すると読める説明、巨大文字の実際に安全な縦長例の欠落を親が指摘。必須安全例と探索条件を明示して区別し、全16IDの安全例を強制、明示不足例も強制する。nativeに注釈描画がないレイアウトでは主歌詞・附属板・補助反復だけを説明し、glossは実際の描画呼出しでも注釈を照合するよう比較担当へ修正を返した。

- R05-14補足: 同じ親probeを担当が再実行したため、失敗時の完全JSONは退避前に更新された。before.jsonは親tool出力の180件/48失敗・代表条件を保存した要約であり、生の全行とは扱わない。6931f2fcでの再実行180件/0失敗はafter.jsonに分離。これ以後の文字境界補正・性能最適化でsourceが変わるため最終候補の再確認が必要。

- 性能最適化の幾何独立照合: 新しいcompiled edge判定を、候補順を同じまま002独立oracleへ差し替えた参照実行と比較。回転した凸polygon・位置・半径を変えた2500件で全結果一致、安全1834件は画面内収容も独立確認。失敗0。09b sourceSHA `8b9c5e3164000c68f32222b7f384596a50853c798f85ea7def3067afef8ed157`、`avoid005-solver-oracle.cjs/json`。このprobeのseed選択関数は固定決定的stubであり、native seed分布の証拠は別の実ブラウザ100seed試験に限定する。

- R05-18: 比較ページのiframeでエディタが起動し、裏のGoogle stylesheet完了後にmetrics revisionが変わる競合を検出。担当が5件のCSS応答を遅延させ、revision1→4・Refinalize after font/compose changesを再現。src12_uiの既存engine-onlyガード（#appなし）を利用し、両側の確認用HTMLだけ同一規則でeditor rootを改名する構成へ修正。元productHTML・実行する派生HTML・変換規則は別hashで保存し、元の日英アプリは別途起動検証する。無差別なnetwork拒否で問題を隠さず、通常通信・要求interceptなしで外部要求0、J.ui不在、両側revision1→1、fontready、local/session/IndexedDB不変を確認。`font-isolation/`に再現・独立後確認・検証ログ・当該ツールsnapshotを保存。旧004bundleは不変。
- R05-19調査依頼: 自動領域合成は抑制のcontentScale .7を1へ戻し、領域の大きさで抑制を表す。新経路でareaだけ除去すると「~小さく~」のサイズ意図を失う可能性があるため、source値1との一致だけで互換成功にしない。実装担当へ実際の通常/抑制・明示scaleの描画照合と由来を保持する処理の検討を依頼。


## 親による最終候補のコード・試験受入（2026-10-19、公開前）

- R05-01〜19の実装指摘を解消。実装担当は指定 `gpt-6.1-sol / medium`、親はコード差分・呼出し元・独立試験・原始ログを確認した。全16の所有対象は `adapter-contract.md` に列挙し、主歌詞の反復を根拠なく補助扱いしていない。円外4矩形だけの制約、pill clipの削除、samplingだけの安全証明は採用しない。
- 最終JA HTML SHA-256 `c7dbd4d94309d840b885c8a916f7d98544888d2b5663db054654d5f0671d4f41`、EN `c55180c81354e6265a785c936590cb54857b5ac86434933d10d09d52528a6897`。直前c2449974からの製品差分はAA余白の説明を10→20stage pxへ訂正するコメントだけであり、実行処理は同じ。性能は直前同義候補の単独測定を採用し、同一ソースの通常試験・親の独立検査は再実行した。
- R05-19はWeakMapに実際の自動領域正規化の由来を保持し、basic opt-inでauto areaを除去するときだけintrinsic .7を復元。明示contentScaleの編集は由来を消す。実際の抑制文字の寸法315.91×196.41は通常449.58×278.87より小さく、autoPlacement=falseのintrinsic .7と一致。明示1/.85・manual/lock/emphasis/OFFは維持。保存形式への属性追加なし。
- 親の最終独立検査は `parent-final/`。shape168条件・alpha>=1の1,248,366画素すべて包絡内。pill gradient/clipのaffine移動20条件はnative移動と完全画素一致。wave/hugeのcontentScale×renderScale×位置×camera180条件（各5時刻）はエラー0、certified138条件にunsafe観測なし。
- 全16×push/dutchの32条件で、区間0.8/1.6/2.4の直前・境界・直後、空白区間、同じ円の再出現、ghostを検査。安全304frame/7,757polygonを002独立oracleで照合、640ghost観測すべてrealTimeが一致、失敗0。局所区間が不足のframeを安全数には含めない。
- 最適化solverは2,500件を独立002oracleで同じ候補選択と照合し結果一致。安全1,834件はstage収容も確認。native100seed方向分布は別のacceptance試験を採用し、stubseedの独立幾何試験と混同しない。
- キャッシュはfont revisionと描画に必要なcut/style/fx/dimensions/time/languageをkeyとし、所有したfreeze値だけを再利用する。制約callback付きsolverはキャッシュしない。8条件のcache hit/clear差分を確認。64MiB/8MiBはserialized予算であり実ヒープ量の保証ではない。単独性能は100/1000でplanning p95倍率1.718/1.831、描画追加p95 +0.8/+1.3ms。契約のwarmup条件・2倍/3ms以内。cold初回320.3/1790.3ms（基準99.3/487.2ms）は別に残し、warm値で初回遅延まで合格と主張しない。
- 元の3回帰は同じassertionのまま前後実行しemphasis/placement_stability日英成功。featuresのseek stackは前後ともline24の期待1/実2で停止、後続検査未到達。`baseline-before/`と`baseline-after/`。既存保存testも未成功のまま013、既存area effectsとfeaturesは017へ引継ぎ。005の実記法追加試験はこの既存失敗を修正した証拠ではない。
- 比較実装も親がレビュー。449は定義した条件数であり全件実行数ではない。123組を撮影予定（27必須安全、89探索、6不変、1必須不足）。全16IDに実際の安全anchorを要求し、不足/unsupportedを安全扱いしない。glossの注釈は実draw呼出しも要求する。固定004原本と実行用engine-only派生HTMLは別hash、規則を明示し日英本体の起動は別検証する。004公開bundleは変更しない。
- coreは公開比較の生成へ進める状態と判断。公開前後hash・全asset・実起動・比較操作はまだ別の必須gate。見え方・可読性・動きの意図が変わるため、この005では人間動作確認が必要。公開検証成功後に具体的なURLとH01〜H03を提示し、回答まで006へ進まない。人間にコード不具合の判断は委ねない。

- R05-20（比較ツール）: 全123組と4動画の後、約723KBの比較説明をPython argvへ渡すfontCoverageがOS引数長制限E2BIGで停止。bundle/manifest未完成のため未公開。失敗01をscratchへ保持、記録をcapture-attempt01.json/logへ保存。全文をstdinで渡す修正を指定担当へ返し、検査範囲を削らず新build02で再撮影する。

- R05-20修正: argvを全文JSONのstdinに変更し、coverage集合・missing glyphのassertionは維持。担当が1,920,000byteの入力成功とU+10FFFF追加時の拒否を確認。親が差分を確認してnewbuild02を生成開始。製品HTML/fixtureは不変。
- 親の視覚確認: 失敗01で撮影済みの同一c7候補の16必須anchorとH02を原寸PNGから同倍率で一覧化して確認。円内からの移動、hugeの文字欠落回避とrow-major配列、waveの位相とtrail、板/注釈の追従、named補助4群の維持、強調対照不変を確認。mixedの上下に分かれる文字配置など演出の読みやすさの最終判断は人間に依頼する。labels中央例は元から円外なので前後同じ場合がある。これを新機能不在とは扱わず、同じ円外条件を満たすケースとして示す。final02の該当nativePNGとhash一致を確認してこの視覚確認を結び付ける予定。

- final02生成成功: manifest `e8c81c696acae92f9a5edc88d79b9430f12ee59e95b9238c6530f2823633ab83`。123組・492PNG・4動画・512assets＋manifest。安全82/不足35/unsupported0/対照6、必須安全27・期待未達0。全16IDの必須anchor17件（huge上下を含む）を強制確認。先に目視したnative42枚はfinal02と全hash一致（visual-inspection-source-match.json）。
- 正常bundle cloneと破損11件の否定検査が成功。sandbox内でのgit subprocess EPERMはsupported network-enabled実行コンテキストで同じコマンドを再実行し解消、検査を変更していない。親のlocal操作20件（16anchor link＋4種の再生/逆順seek）は通常通信・request interceptionなしで成功。外部要求0・pageerror0・fontrevision/保存領域不変。desktop/mobile表示を目視確認。親probeのID selectorの小数点escape不備はtest側だけ訂正した。

- ローカル最終validator成功: 全123組246描画のrawPNG hash、512asset完全inventory、3表示mode・原寸/画像切替・H-ID/実リンク、日英本体起動を確認。公開候補artifact commit `8358337901941fccb5023741d48bba2d883ffd42` をworkへpush。生ログ2本の元の末尾空白は証拠を保持するため変更せず、その2ファイルのみgit whitespace検査から除外、他は検査成功。

- 公開最終受入: 512assets＋manifestすべてHTTP/rawSHA一致、123組246native再描画一致、日英smoke成功。親の公開20操作はrequest遮断なし、外部要求/JS例外0、保存/フォント不変、mobile/desktop目視済み。公開時点とrun/headをpublication.jsonへ同期。これにより必須の公開検証は完了。残件は演出の見え方の人間H01〜H03のみであり、005完了や006開始には置換しない。
