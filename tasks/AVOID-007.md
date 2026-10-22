# AVOID-007 拡張Bの25通常レイアウトの対応

- 状態: 実環境検証待ち
- 段階: 通常軌道
- 技術依存: [AVOID-005](AVOID-005.md)
- 事業優先度: 未指定。記載順は技術上の推奨順。

## 現在の引継ぎ状態（ローカル資格済み・未公開）

- 製品はfreeze02の79source/JAENを保持。main25比較は `local-20261022-02`、manifest `186580a8269d1b51f481f84001277f154722fee700226876ed0b82f3c80cbc4f`、full local browser04成功。以前の記述・失敗は後半の時点別履歴。
- H03の現公開候補は**rain単独** `local-20261022-h03-control-02`、manifest `9d16f11518628b28d64bb238ba6a764a5fc17bb262ca8a7446f572b809564b47`。tool `874b97823036eeb7da072e51cccab631b0be5d1bef50805be362c68ed2a14873`。files/192frame・8PNG・2MP4完全一致/独立rain観測付きPASSのcarry資格を親承認済み。
- [H03 full local browser02](evidence/AVOID-007/h03-control-native-browser02-summary.md)は単一run成功、raw receipt SHA `90fd70a5ee9a4ceec66a61d45dfb1c6110b44a42196c9222e4724ec1a48678df`。214HTTP/4JAENUI/2生成MP4/2原動画/2native parity/2live、3owned phase closed、全入力不変・drop0。親の独立browser結果照合は別記録。
- [旧8cut raw02視覚FAIL](evidence/AVOID-007/h03-visual02-review.md)、[旧2pair control01全体FAIL](evidence/AVOID-007/h03-control-visual01-review.md)、bubble BGcontrast FAIL、credits FG-insufficientを保持。rainだけの受入範囲を他へ広げない。
- 公開・公開rawhash/再生/UI/native資格・最終親受入は未実施。007は完了ではない。Git/Sites/Pagesは親担当、008未着手、012実装・017activation未実施。

## 開始前計画の記録（実装前の履歴）

- ブランチ・HEAD・git status: 当初は未開始としていた。実際の着手基準は e96cbb2（006受入後）であり、以降の実装・試験・失敗履歴は本記録後半と007 evidenceへ保持する。
- 共通解析基準: b7c23bf。スキル導入済みHEAD: 3c79480。着手時に差分を再確認する。
- 正本: [設計・根拠](avoidance-design.md)、[一覧](task-list.md)、[スキル](../.agents/skills/evidence-driven-task-management/SKILL.md)。
- 依存タスクの必須条件と証拠を確認する。完了を推測せず、未完条件を引き継ぐ。
- 対象ファイルに既存変更がある場合は競合を確認する。同時進行タスクは原則1件。

## 目的

雨・トンネル・複数語など時間依存の拡張軌道を、移動中も円外に構成する。

## 変更範囲

- 当該段階のGitHub Pages確認サンプル・変更前後のキャプチャ画像・比較HTML・公開manifest、確認依頼/回答記録。共通手順は[Pages人間確認運用](pages-human-review.md)と[比較画像・HTML契約](visual-review-comparison.md)。

- src/11p_layoutsB.jsのorbit/circleWords以外25ID
- 共通trajectory/camera境界、対応fixture・証拠
- 文書更新: 本記録・task-list.mdの状態/証拠、設計の該当契約、対応表を同じ変更で同期する。

## 実装手順

- 個々の描画をprimary/tiledAux/independentDecorに分類する。大量反復補助は経路変更せず018へ引き継ぐ。同じID内の主歌詞は対応対象のままとし、名称やmainDrawの有無だけで分類しない。

1. rain/tunnel/wordCloud/bubbles/credits等の全可視語を列挙できるadapterを実装する。
2. entry/hold/exit、奥行き・サイズ変化・残像を含むswept boundsを検証する。
3. 主歌詞・補助的な大量反復歌詞・独立装飾を明示分類する。反復補助は軌道再設計せず018へ渡し、主歌詞の反復表現を誤って除外しない。

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

- [ ] 25IDで少なくともenter/hold/exitおよび回避境界の検証証拠がある。
- [ ] 画面の別の場所へ突然跳ぶ補正や文字ごとの無秩序な再配置が契約外に発生しない。
- [ ] 読み順とphaseを保持し、背景・前景メディアを移動させない。
- [ ] カメラ変形後でも保護対象文字の円回避が成立する。

## テスト方法

- 比較成果物: [共通契約](visual-review-comparison.md)に従い、全H-IDの画像対応・撮影条件・HTML表示・公開一致を検証する。画像だけで数値/時間/保存の自動試験を代替しない。
- Unit: 時間依存bounds、複数語の経路交差、長い軌道の分割上限。
- Integration: 25ID、残留groupに投入するための同一cut形状契約。
- Regression: media_cut_compositing、lyric_compositing、group_reroll。
- 実環境: rain/tunnel/credits/bubbles/zoomRepeatの動的確認。
- 当初計画時点の実行結果: 未実施。現在は実装・局所/数値/性能/初回撮影まで実行済みだが、独立視覚で5IDの修正要求があり、最終受入・公開は未完。既存の基準ログはAVOID-001へ参照し、修正後の証拠として流用しない。

## GitHub Pagesでの人間確認

[共通手順](pages-human-review.md)と[依頼テンプレート](templates/pages-review-request.md)に従う。以下は実装後に用意する確認ケースの予定であり、現在は未公開・未実施。依頼時には実際のUI名・サンプル名・ケースURLへ具体化する。

各項目に下表の前後キャプチャを準備し、比較HTMLの同じH-IDアンカーへまとめる。操作の前後状態が複数ある場合は、各状態それぞれで実装変更前/変更後を撮る。担当エージェントが画像を生成・公開検証してから人間へ依頼する。

| 項目ID | 人間に依頼する操作 | 期待結果 | 比較キャプチャ（予定） |
|---|---|---|---|
| AVOID-007-H01 | 拡張B25IDの一覧で、時間変化する主歌詞の入り・保持・退出を確認する。 | 経路の途中で円を横切らず、読み順と動きが保たれる。 | B25IDのenter/hold/exit連続コマ。経路の全時刻検証ログも添える。 |
| AVOID-007-H02 | rain/tunnel/wordCloud/zoomRepeatの役割が分かるケースを開く。 | 002で確定した主歌詞/反復補助の分類どおりに動き、補助反復に回避軌道を追加していない。 | rain/tunnel/wordCloud/zoomRepeatの全体描画と役割表示。 |
| AVOID-007-H03 | カメラと長い残留を含む同一時刻へ順/逆にシークする。 | 主歌詞が不規則に飛ばず、背景・前景動画の位置は変わらない。 | camera・長い残留の順/逆seekを同時刻で撮影し、背景/前景を含めて比較する。 |

公開コミット / 変更前・変更後の実装識別子 / build ID / 比較HTML実URL / H-IDと画像の対応・撮影条件 / 操作用Pages実URL / 公開画像の一致・表示確認日時 / 自動検証証拠 / 依頼記録 / 人間の回答: 実装・公開後に記入する。親のコード/テスト結果レビュー、人間の動作確認の要否と理由も記録する。不要判定を人間のOK回答には置換しない。未確認を成功として補わない。

## 停止条件

- テクスチャ化した文字で必要なboundsが取得不能なら、未対応理由を明示して個別方式を決める。
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


## 2026-10-19追加要件の引継ぎ（未着手）

006の段階的再配置APIを再利用し、当該IDの演出意図に応じて候補順を検討・記録する。固定の移動→分割→縮小順は利用者要求ではない。可変半径.02〜.45、通常円.2、複数位置/aspect・文字量で全区間の安全性と成立限界を試験する。明示サイズ/手動/lock、主歌詞保持、所有板と読順、既存安全候補を保つ。成立しない場合の選択除外と診断を実装し、代替を元演出の成功に数えない。006完了前に着手しない。全体の横断検証は[AVOID-019](AVOID-019.md)へ引き継ぐ。

## 2026-10-22 開始記録

利用者の確認OKとタスクリスト順次実装指示を受領し、006最終判定完了後に開始。work/開始HEAD `bc8307313c9f92f60c3fd5c461f90e5e49744c52`。製品JA a3c4/EN3d1e、006受入済み。AGENTS.mdなし。既存dirty pycと全scratch/旧未公開bundle/旧profiling tools/node_modulesは保持して対象外。src/11p_layoutsB.jsと共通placement対象に既存tracked変更なし。

実装はgpt-6.1-sol/mediumのisolated子へ依頼し、親が設計・コード・結果をレビューする。画像照合は別のisolated solへ依頼し、親は画像を開かない。まず25IDの役割/幾何/動きと段階戦略を調査し、全画面の演出意図を保つ候補を実装する。008以降は007の完了条件を満たすまで着手しない。

比較は同一条件の原寸Canvasからnative MP4を直接生成し、25演出の代表例を前後で確認可能にする。HTML録画/PNGスライド再生/旧動画のtranscodeは使用しない。幅/円位置/半径/長文等の数値fixtureは代表MP4とは別に検証する。公開容量を監査し、Pages上限に収まらない比較素材は利用者の既許可に基づきSitesへの出力を検討する。旧公開URL/assetを容量確保目的で削除しない。Sitesを使用してもwork製品のPages公開一致・日英起動の必須検証は省略しない。

環境statusはspec/observed188一致、observations_current=true、unrestricted/enforced。proxy/CA/TLSを維持する。保存013のexpected0/actual1は未解決のまま。通常既定の切替は017、補助マスクは018。

## 2026-10-22 親設計レビューと実装開始

親は[設計レビュー資料](evidence/AVOID-007/design-review.md)と[25ID inventory](evidence/AVOID-007/inventory.json)を条件付き承認。実装開始HEAD e96cbb2、gpt-6.1-sol/medium。既承認aux5単位のみを維持、credits semantic rows/labels、kanjiFocus巨大字、depthStack全コピー、typeSpecimen全書体、slot/flap revealをprimaryとする。

段階は①全25 native計測/役割/sourcecoverage/OFF・原寸replay parityとcustom負試験、②ID別候補とstrict interval証明、③重複削減根拠付きmatrix/性能/可搬nativeMP4。各段階の実行receiptは実施/未実施を区別して親へ通知する。neonのblur倍率だけでalpha1支持範囲を証明しない。確実な有限stroke-layer glow等のON専用recipeを優先し、global recorderのraw shadowを曖昧に許容しない。dot/pattern/compound clipもexact replayと保守的ink計測を分離しsilent ignore不可。まず全25標準円.2の代表safe例と重要branch/customを検証し、.02だけや根拠ない全除外で対応済みにしない。実装/試験/公開は未実施であり本承認は完成判定ではない。

### 第1段階 native qualification (final08)

[実行summary](evidence/AVOID-007/native-stage/summary.json)と[全report](evidence/AVOID-007/native-stage/final08-report.json)を保存。起動前にscript/src/JAEN/fixture/font/dependency identityとgzip snapshotを保存し、試験後hash不変を検査。全25＋重要branchの原寸native/replay parity、e96cbb2非opt-in Canvas RGBA比較、12custom負試験とpattern2fill変異parityが成功。詳細件数はsummary参照。親の4指摘へ対応し、source current/path transform/pattern snapshotを局所反証で確認。

これは単一Noto fixtureのtransport資格であり、全semantic copies/ownedmetadata/shape mapping・実書体意図・全区間回避証明を完了したものではない。②で全primary native→recipe保持を独立mappingし、実フォントfixtureを最終capture前にレビューする。full avoidance/performance/matrix/MP4/公開は未実施。final07は起動前pinなしと明記して履歴保持し、正式な起動前pin証拠にはfinal08のみを使う。状態は実装中、親第1段階レビュー待ち。

### 第2段階の実装checkpoint（最終受入前）

親が第1段階を承認済み。全25IDのinterval/source adapterとID候補を実装し、多書体[font-functional04](evidence/AVOID-007/font-functional04.json)で25代表・300選定frame、独立ordered occurrence、実6書体署名と526cmap割当を確認した。elastic/stickerBomb/kanjiFocus/tapeの代表は明示3200×1080であり、1920不足を通常16:9成功へ読み替えない。OFFは元描画を保持し、ONの連続フォント成長5種は固定CSS＋native実効倍率へ再設計、hinting/AA差は意図した差として記録する。

[interval-focused02](evidence/AVOID-007/interval-focused02.json)は38条件・429native実効size/位置/clock等の比較と57source primary alpha1 rasterを確認。固定captionの実B座標/offset0追補、sticker cnt20の明示unsupported、matrix/実camera・ghost raster/回帰/正式性能/原寸MP4/独立視覚レビューは別ゲート。候補の不成立・custom unsupported・過去test失敗を保持し、最終成功や公開はまだ記録しない。詳細は[設計更新](evidence/AVOID-007/design-review.md)とinventoryを参照。

### 数値・実runtime checkpoint

`matrix01.json.gz`は350 one-factor条件で288certified/62不足、失敗0。25標準代表のpush/ghost0実画素は別集合。`attachment01.json`で実B/OFFの幕caption固定付属とcnt20拒否を追補。`runtime02.json.gz`は25IDのpan/push/dutch＋ghost・seek再訪を確認し、100 actual-primary alpha1 raster逸脱0、所有欄24preclip source/metadata＋12native-clipped reveal-poolで失敗/警告0。runtime01のpool native clipを誤って外した試験失敗を保持し、商品変更なしで検査分類を訂正した。

共有回帰は現在実行中。B性能local02は25cut/25region/73actualsegment、native167.7→探索424.3msのcold診断で正式性能成功ではない。正式100/1000・3warm/6sampleはbaseline artifact/bench code/局所結果の親レビュー後。原寸MP4・独立視覚・公開受入は未実施。

共有回帰8suiteはregression01でpass。追加指定3本ではmedia_cut_compositingがpass、lyric_compositing/group_rerollは未達で、e96の実JA HTML供給/read SHAを伴うcontrol02でも全rawlog同SHAの失敗を再現した（`regression-existing-failures.json`）。これらを007成功や保存成功に含めない。EN lyricはJAで停止し未到達。B-only cacheの局所同値/失効/負例/evictionを追加確認中で、共有09dは不変。

### 性能・lifecycle追補（正式再試行前）

formal01はplanning100件2.107倍/1000件3.602倍で不合格、renderは基準内。失敗と全actual件数/cache統計を保持。B-only共有proof poolで重複Map/child配列/brand所有を削除し、全reachable lookup/scalar/bookkeeping/headerを8MiB内に会計した。pool04・cache07でtransaction/fresh lookup・全25同値/失効/負例を再確認。candidate-only capacity02では1000cut/1000region/2998segmentの320contextsが8,301,510Bに収まり、warmは320hits・候補再記録0・eviction0（性能合否ではない）。正式paired02は親レビュー後のCPU独占実行待ち。

dot-font01ではB専用stencilが実Sans→Dot→Serif→Sansに更新され、4native/replay exact、同条件OFF4frameがe96とexact。OFFの旧stencil cacheは分離保持。原寸MP4・独立視覚・公開は未実施。

formal02は固定100/1000・3warm6samplesのCPU単独比較でpass：planning1.963倍/1.289倍、render追加0.2/0.5ms。actual入力/件数一致・全25、candidate1000の8,338,154B/320contexts/2560hits/eviction0、終端hash不変。rawsamples/起動前snapshot/variantを保存し親レビュー待ち。現sourceをfreezeし、最終多書体25/300更新・具体capture configを親確認してから原寸50MP4/独立視覚/公開へ進む。これらはまだ未実施。

### 原寸比較・ブラウザ検証 checkpoint（受入未完）

親がformal02、最終font-functional05（25代表/300frame/526cmap）、具体capture configを承認。製品source/JAEN/8fontsをfreezeし、`work/avoid007-native/local-20261022-01`へ25組50原寸MP4、200key PNG、4800frame記録を生成した。21例1920×1080/4例3200×1080、96frame/24fps/4秒。manifest SHA `c0c64e78bbbfc33761e378acd21fd7899cd59353e3a1ac1dcb02e6c9c2a77274`。capture内検査と別validate-filesは548assetsを確認してpass。公開・独立視覚受入は未実施。

full browser01はdecoded seekのイベント順競合で停止し、失敗ログを保持。partial診断01で正しいtarget callbackがseekedより先に届いて捨てられることを実測した。外部validatorだけでmatching decodedをpending保持し、seeked一致も必要とする修正を実施。10秒/1frame許容は不変。7反例と実50動画/150seek（callback先行32）を確認し親承認。元bundleの工具・MP4・PNGを変更せず、新外部validatorでfull browser02を実行中。

full browser02は連続再生のdrop3で未達、実原因は未特定。次の全50動画・同じ旧再生手順のquality診断では全96decoded/drop0となったが、02の失敗を解消済みとはしない。外部validatorへdecoded0後の計測開始、各videoのpause/src解放/load/handle dispose、case/side/stageと途中reportを追加。6helper反例＋実4sideと8tool suiteはpass。full browser03は親レビュー待ち。

H03の背景/前景動画＋長い残留は上記25組やruntime02に含まれない。[追加検証計画](evidence/AVOID-007/h03-integration-plan.md)を親が承認し、専用新helperを準備した。正規J.planの1シーンgroupと実decoded背景/前景動画を使う3ケースは未実行、補足動画化もまだ未承認。012全group統合の成功へ広げない。

### 独立visual01で発見した不合格と修正中の範囲

独立visual A/B/Cは旧immutable比較を照合し、equalizerの細い棒/反射が太barから剥離、tunnelの据置反復が移動主歌詞を横断する可読性退行を発見した。typeSpecimenのweight400分断、kanjiFocusの巨大字と全文の大離隔、elasticの単一軸から独立2軸への変更も修正対象。数値font05/capture01を最新視覚受入として扱わず、inventoryに履歴scopeと不合格を追記した。hanging板端接触は原寸字画被覆なし、neonの宣言済み差とcurtainのnative幕による可視時刻差は所見として保持する。

親承認の最小修正を実装中：equalizer薄棒/反射をchart-owned primaryとしてnative信号key/包絡/topologyへ、focusはnative相対joint cluster、elasticはnative向き/角と単一軸、tunnelはnative auxを移動せずquiet域内へmainを置く。tunnel recipeのみ固定CSS＋native effective倍率にし、位置/advance/clock/physicalstrokeを保持してAA差を明示する追加条件を採用。typeSpecimenの09f修正は別isolated担当から親レビューを経て統合。まだ局所修正版ゲート中であり、全25・正式再計測・新比較・公開は未実施。

H03 native-before構造診断では3歌詞lineが8cut（chunk/recap）へ展開され、group0が7.5秒まで保持されることを確認。初回の3cut仮定は不適切で、失敗を保持した。全8cut/source/slot/end/paramsを保持し、親承認で比較windowを絶対[3,7)、focused順逆seekを.5/2.5/4.5/6.5へ事前変更する。新製品freeze後に同一input動画2本を起動前pinして最終focusedへ進む。

## Visual01後の局所修正チェックポイント（2026-10-22）

旧01 bundleと全失敗ログはimmutable履歴として保持。equalizerはthin spectrum/その反射をchart-owned primaryへ戻し、native global signalを保持。elasticは元の単一軸/角度を維持し、wave開始時刻とk/st相関区間unionで支持を精密化（3200/.75成立、1920不足）。focusは巨大字・全文・owned線を元相対配置の一体クラスタで縮小（3200/.85成立、1920不足）。tunnelは補助のnative位置/時計/実効字体とphysical strokeを保持したrecipe限定固定CSS、sourceのalpha<.02全ring skipに基づくquiet支持、同寸wrap→同寸2列→各離散縮小の順。typeSpecimen captionはatomic単語/style-weightと必要幅を保持する親承認09f修正を統合。

[visual-fix07](evidence/AVOID-007/visual-fix07.json) はtunnel1920/.75の局所成立を記録する。これは最終全25/視覚/性能受入ではない。[tunnel-quiet03](evidence/AVOID-007/tunnel-quiet03.json) は1920/5400×global scale1/.85、outline40実時刻のalpha1静域非交差と実ctx physical stroke同値を検証。候補順修正後のfresh局所結果・5ID30PNGと独立視覚再確認は続行中。新sourceへのcapacity/formal・全25最終gate・新25pair撮影・H03は未実施。

## 現行候補の状態（2026-10-22、実装中）

上の「続行中／未実施」は局所修正時点の履歴。独立visual-repair01は5ID30枚を指定3時刻の静止画範囲でPASS（連続動画は未確認）。currentのfont-functional06、matrix02、runtime03、source-native10、caption02/elastic-boundary01/attachment02/visual-contract01の各scopeを記録済み。runtime03は19条件certified/6不足、alpha1は76certifiedの円侵入0と全100の支持逸脱0であり、不足24の円侵入は未検査。source transportは240 native/replay・100 OFF exact。詳細と独立親レビューは [次ゲート記録](evidence/AVOID-007/visual-repair-next-gates.md) を参照。

現行proofの増大でcapacity03は失敗。resident JSON keyの重複保存を実際に除去し、32bit fingerprintはtyped値/child identityの完全一致bucket比較だけに使用、全reachable会計と8MiB上限を維持。pool08/collision03/cache09とcapacity04（360contexts、7,824,044B、warm360hit/0candidate/0evict）は親レビュー済み。

formal03は計画100/1000が規定内、描画追加1000が+4.0msで**不合格**。これを保持し、実profile01のtypeSpecimen包含検査の反復辺走査に対してinside両sign検出時の早期falseだけを追加した。元predicateとの37,215点boolean同値とsource一挿入差分を親確認済み。profile02は同1000入力の非正式診断であり正式合格とは扱わない。親承認のformal04を固定基準・CPU単独で実行中。新比較動画/H03 focused/公開はまだ未実施、受入・完了へ変更しない。

formal04は実行終了し、100=1.701倍/+0.5ms、1000=1.288倍/−1.0msで規定内、入力・実件数・環境195/資源同一を確認。親独立レビュー待ち。旧formal03失敗はそのまま保持し、成功原因をGC解消と断定しない。新freeze02 identity/configを準備したが、新25pair撮影・H03・公開の承認/実行は別ゲート。

新02 native50本とfile資格は完了し、全input終端不変。after未変更20IDの全1920frameと修正5IDのdraft15key PNG/RGBAはexact一致。beforeは2399/2400で、wordCloud frame91に1差を検出しcomparatorは結果保存後に不一致を拒否。baseline/engine/fixture/fonts全89入力は旧新版byte一致で原因未確定。旧01/新02を保持し、親承認のbounded調査とwordCloud追加の独立連続視覚レビューへ進む。fullbrowser/H03/公開は未完。

main02のphase隔離fullbrowser04はraw HTTP/JAEN UI/50動画のstrict decoded seek・0drop連続再生/50組の現native-key再描画を完了し、全input不変でPASS。歴史的wordCloud before91の1frame hash差は残り、bounded新規描画は旧hashに一致したが原因未確定、原本を置換しない。

H03はfocused06でrain/panL・bubbles/push・credits/dutchの3caseすべてsafe、各実8cut/全units safe・順逆8frames・negative6・warnings0を取得。実frame proofは84fresh/12明示再利用（negative操作込み120fresh/12再利用）。同時刻再訪はH03専用identity witnessで既得のseeked/rVFC両proofを厳密なelement/source/time/状態/世代一致時だけ再利用し、一般decoder/閾値/製品は変更しない。fixture選択誤り・同時刻seek timeout・runner重複pushの過去失敗は全保持し、修正理由と反証はH03計画/実receiptへ記録。親独立レビュー後の補足動画取得・連続視覚・公開・最終受入は未完。

H03 raw native02は3pair/6原寸MP4・全file資格を完了し、phase隔離localbrowser02で6生成動画/2実入力動画/6native parity/6liveを元のstrict基準で全通過。全245input不変、manifest8f84ccb6…3d32c。独立画像実見と公開は未完。raw JSON最大114MB/113MBのため、親が別fresh lossless gzip公開packageを準備中であり、raw02成功を未検証packageの成功に読み替えない。原本の動画・PNG・JSON・fixture/sourceは保持する。


### H03 raw02 visual blocker

`h03-visual02-review.md` independently rejects all3 raw02 cases for new primary/primary or primary/media intersections. Numeric circle/decoded-clock/local-browser results do not override that FAIL.007 remains in progress and publication is blocked. The [scope proposal](evidence/AVOID-007/h03-visual02-scope-proposal.md) identifies actual cut occurrences and compares helper eligibility/control versus012 group integration; no product/fixture or clock change is approved by that proposal.


### Separate native-control metadata01 outcome

The approved separate single:true/0,8,10 native-plan diagnostic completed all3 paired engines with281 prelaunch pins and unchanged end inputs. All3 are `native-retention-ineligible`: the actual first lyric is retained from slotEnd3.6 to11.5, but native J.plan also creates a visible interlude at3.6..8, so actual [4,8) owners are [0,1]. No interlude was removed or reclassified. No focused/capture/clearance qualification was run. See `h03-control-metadata01-summary.md` and raw receipt for the native4cut/source/clock proof; original raw02 visual FAIL remains blocked.


### Separate native-control metadata02: hold plus true retention

Parent clarified that the H03 contract does not require all4captured seconds to be after slotEnd; that was metadata01's additional proof form, and its ineligible result/guard remain unchanged. Metadata02 uses a distinct predeclared authored project (single:true, complete three lines at0/4.5/8) and proves actual membership[0] over[.5,3.6) and[3.6,4.5). All3 metadata-qualified: actual first slotEnd3.6, native end/displayEnd9.5, post-slot seeks4/4.25; all5native cuts (three full lines/two outros) and params stay present, no interlude generated.284prelaunch pins/end unchanged, paired e96/current exact, environment199pre/post. See `h03-control-metadata02-summary.md` and raw receipt. No finalization/decoded/render/foreground/visual/capture gate has been run on this control.

Original raw02 all3 visual FAIL remains an explicit012 cross-owner/media integration diagnostic, with actual cut identities in `h03-visual02-scope-proposal.md`. It is not replaced by the new control.007 remains incomplete,012 unimplemented,017 activation gate unreleased. Product/source/main02/old fixtures/tools and original raw media remain unchanged.


### Distinct control focused01 (not visual acceptance)

`h03-control-focused01-summary.md`/raw receipt record two measured-qualified cases (rain/panL,bubbles/push) and credits/dutch insufficient due actual primary support versus foreground-alpha bbox conflict. All3 native lyric cuts remain certified/present, including future lyrics; all3 source/native clocks and params match metadata02 and e96.48seek/revisit composite frames,6media position/time negatives pass;284prelaunch pins/end unchanged. No control MP4 capture or independent BG-content visual acceptance has occurred. Fixture/runner are frozen. Draft build `local-20261022-h03-control-01` proposes only the two safe cases for later parent approval; it does not omit credits' insufficient diagnosis from the focused receipt or replace old raw02 visual FAIL.007 remains incomplete;012 integration unimplemented/017 activation unreleased.


### Native retention control capture01 — files only

Fresh `work/avoid007-h03/control-native-local-20261022-01` manifest9788b3b3ac0efac2d403460baf94a09fecd5737537600f0b5fa2ea6917550934 has rain+bubbles2pairs/4MP4/384nativeframes and passed tool-integrated validateFiles.224assets/225exactclosure,289wrapper pins/end unchanged; current79source/JAEN freeze02 exact; env200fresh pre/postcurrent/enforced. Credits remains FG-insufficient without acquired media; old raw02 visual FAIL is unchanged. `h03-control-native-capture01-summary.md` records full receipt/size provenance. Browser/visual/public gates pending; no completion/activation claim.


### Control01 independent visual FAIL / rain-only control02 preparation

`h03-control-visual01-review.md` independently examined all384decoded frames/16nativekeys/24crops. Rain is observed-scope PASS with white-frame contact noted; bubbles is FAIL due new local contrast loss where『先』lower stroke meets the BG pale-yellow bar (not missing source or detached bubble). Thus the two-pair control01 is overallFAIL and stays immutable. Bubble BG-content contrast is an017 visual-quality residual, not a claimed automatic012 group/FG fix. Credits FG-insufficient and old raw02 cross-owner/media FAILs remain012 inputs.

Parent requested a new distinct rain-only publication candidate, build `local-20261022-h03-control-02`, config/capture02/browser02 wrappers and exact-comparison helper only. No source/fixture/focused/circle/font/media/time change, no capture/browser run yet. Intended freshdir `work/avoid007-h03/control-native-local-20261022-02`; newtool UI review must explicitly distinguish numeric feasibility from visual acceptance. If captured later, old/new rain2MP4 raw bytes +192nativePNG/RGBA record hashes +8nativekeys must match exactly before carrying the prior independent rain visual finding forward. Mismatch means no carry-forward and requires parent review/limited new visual evidence.007 incomplete/008 unstarted/017 activation unreleased.


### Rain-only native control02 files/comparison completed

`h03-control-native-capture02-summary.md` records approved rain-only fresh acquisition and exact carry comparison. Manifest9d16f11518628b28d64bb238ba6a764a5fc17bb262ca8a7446f572b809564b47,209assets/210closure,2MP4/192frames/8keys; capture289pins and comparison112snapshot+374raw input pins/end unchanged. Old/new rain192PNG/RGBA records,8keyPNG bytes,2MP4 bytes and conditions/source/font/fixture/media/clock all match exactly. Prior independent rain visual finding can be considered for carry-forward by parent; this is not a new visual review or public acceptance. Browser remains unperformed. Old2paircontrol01overallFAIL, bubbles BGcontrastFAIL, credits FGinsufficient and raw02old8cutFAIL stay unchanged. Env201fresh pre/postcurrent/enforced; product79source/JAEN remain freeze02 exact.


### Rain-only control02 full local browser02 PASS

`h03-control-native-browser02-summary.md`/raw receipt record a single full strict run:214rawHTTP/4JAENUI/2generatedMP4/2original12smedia/2nativeparity/2live,3owned phases closed;292wrapper pins+210asset inputs+216validator inputs unchanged. Each generated playback92decoded/0drop, each12s input284decoded/0drop; strict seek/play/pause/end and native reverse keys pass. Fresh env201pre/postcurrent/enforced, frozen source/fixture/tool/bundle unchanged, CPU released. Rain observed-scope visual carry was independently approved separately; public verification/final acceptance pending. OldallFAIL diagnoses remain unchanged;007 incomplete/008 unstarted/017 activation unreleased.
