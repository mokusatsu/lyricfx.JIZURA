# AVOID-008 sticky-preview01 独立画像・動画照合

**総合: FAIL。** 付箋としての造形とentry/exitの連動は保持されるが、移動後のexit終盤に新規stage cropがある。特にportraitでは、まだ明るく読める文字の下端が画面端で切れるため、単なる同位置・同size差としては受容できない。採否の最終判断は親レビューへ返す。

## 対象と同一性

- ローカルbundle: `work/avoid008-c-preview/sticky-preview01/`。
- manifest SHA256: `bebf8a759cc664ab787efca941865e33539725eb9848eb41776be41d33a30d08`（指定一致）。index.htmlを含む全21assetsの実bytes数とSHA256がmanifest記載と一致。hash一致を視覚PASSの代用にはしていない。
- 960×540、1080×1920。『風の先へ』、seed704、同一NotoCJK fixture font、circle (.5,.5), r .2はmanifest条件。after候補はnoteScale .95, pitch 1。実画像は両側とも4文字・`風の` / `先へ`の2行。
- AGENTS.mdとimplementation-review-policy.mdを読了。公開URLアクセス・公開結果確認は一切行っていない。利用者指示による対象外。実装sourceレビューや他C33受入は実施していない。

## 実見した範囲

4本のnative animation-only MP4をffmpegで原寸PNGに全frame decode。各96 frames、24fps、4秒、計384frames。ffprobe count_framesでも各96を確認。0始まりf0〜f95（0〜3.9583秒）を全て、before/afterが同時刻で上下に並ぶ8枚のcontact sheetで実見した。landscapeは各240×135、portraitは各135×240の縮小全stageサムネイル。portrait sheetは表示側で810×2080から798×2048へ微縮小された。リアルタイム再生ではなく、全frameの連続静止照合である。

さらに全12 native key PNG（両条件×before/after×f6,36,91）を原寸表示で実見し、字面、影、折角、stage端を確認。decoded原寸単frameも追加確認した: landscape before f93 / after f92,f93、portrait before f93 / after f90,f92,f93。境界crop開始の確認には、after各条件f88〜f93の原寸edge cropを実見した。画像生成・decodeは終了し、常駐再生やmedia CPU処理は残していない。

証拠は `scratch/avoid008-sticky-visual01/` の8 contact sheets、384 decoded frames、2 edge-crop集。decode連番は1始まりなので、例 `portrait-after/094.png` = f93。

## 観測結果

| 項目 | 判定 | 根拠・重大さ |
|---|---|---|
| 紙・折角・影・上部留め帯・字面の一体感 | PASS（境界crop以外） | 水色紙、暗めの上部帯、右下折角、右下に落ちる影、文字が一体で傾く。afterで紙だけ止まる、文字だけ別移動する、分裂する現象はない。独立したピン/留め具はbeforeにも明瞭には見えず、after欠落とは判定しない。 |
| entryの順番・タイミング・squash | PASS（24fpsの観測範囲） | 両条件両側でf0は空、f1は暗い大きめの紙、f2は明るくなる紙で文字なし、f3から全文字が現れ、f4〜f6で落ち着く。同じ紙/文字の縮み・収束の流れ。紙が文字より先に出る現象はbefore既存。 |
| hold中の文字/配置 | PASS | f6〜f88でafterはlandscape右寄り、portrait下寄りだが、紙・全文字はstage内。4文字と2行構成を保持し、強い暗色字が明るい紙上で明瞭。余計な重なり・分裂・欠落なし。 |
| exitの回転・fall・fadeの連動と時期 | PASS（cropを除く） | f89付近から両側とも下向き移動と傾きが増え、f90,f91,f92,f93と反時計回りに傾く。f93で紙が視覚的に暗くなり、f94,f95は両側とも空。afterでも紙・帯・文字は同時に傾いて落ちる。 |
| portrait exit stage crop | **FAIL / major** | f90（3.750秒）は紙底辺がstage内。f91（3.7917秒）のnative keyで紙の底辺左寄りがstage下端で切れ始める。f92（3.8333秒）では『先』下部の払い/足が下端で切れ、折角も画面外。紙はhold時に近い明るさで、消失直前の透明な残像とは見えない。f93（3.875秒）では『風の』はまだ明瞭なのに、2行目『先へ』の大部分が画面外で、上端だけが残る。before f91〜f93は紙・全文字がstage内。 |
| landscape exit stage crop | **FAIL / moderate** | f91は紙右端・折角がほぼ画面端ながら内側。f92（3.8333秒）から右側の紙輪郭と折角がstage右端で切れ、f93で切断量が増える。全文字は読めるが、紙の右辺と角が途中で途切れる。before f92,f93は完全な付箋を見せる。 |

## 自然な退場と新規退行の区別

fall+peelそのものはbeforeにもあり、afterで新しい分離や逆順はない。afterの配置移動により、同じexit中にstage端へ達する。したがって「hold中から切れている」「entryで欠落した」「exit動作自体が消えた」とは主張しない。境界に達する前のholdとexit前半は良好である。

一方、beforeはf93まで全付箋・全文字を見せた後、f94で消える。after portraitはf92時点でまだ明るい『先』が平坦な画面下端で途中切断され、f93では上の行が読める間に下の行がほぼ失われる。この2frameの段階的な文章欠損は新規であり、単に紙全体が薄くなる自然な退場と同等とは判定しない。portraitの新規可読性欠損を受入阻害とする。landscapeは字面を失わず出口方向の途中遮蔽に留まるため、重大さはportraitより低いが、beforeの完形付箋を維持してはいない。

正確なrenderer alpha数値は測っておらず、上記明暗は実画像の観測。circle guideは画像にないため、円境界の内外や数値geometryのPASS/FAILは**未確認・担当外**。このfixtureは付箋1枚のみなので、複数付箋の順番は未試験。別の文字列・seed・半径・stage、他C33も未確認。
