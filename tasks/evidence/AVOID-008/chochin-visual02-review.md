# AVOID-008 chochin-preview02 独立視覚再照合

**PASS（同じsingle探索fixtureの視覚範囲）。** 01でmoderate FAILとしたhalo上端の斜め直線切断は、02の原寸PNG・同区間frame・全frame照合で解消を確認した。主文字/造形/紐/光/揺れと時計に新規退行を認めない。01のFAIL判定・素材・証拠はそのまま保持し、今回のPASSは02だけに適用する。

## 同一性と実見範囲

ローカルbundle `/workspace/avoid008-japanese/tasks/evidence/AVOID-008/japanese/chochin-preview02/`。自身で算出したreceipt SHA256は `ed614f087557058082c2288c663121c46bc319e471c05aace3604deefa0770b4`。掲載全5assets（index.html、before/after PNG、before/after MP4）の実bytes数・SHA256一致。before.pngとbefore.mp4は01の各ファイルと実bytes完全一致を確認したので、01で自身が実見したbefore全96frames/nativePNGをcarryする。今回beforeを新たに再実見したとは記録しない。

ffprobe count_framesで両MP4を再測定し、両方960×540、24/1fps、4.000秒、96frames。after MP4を原寸PNGに全frame decodeし、f0〜f95を4contact sheetsで全て実見、今回新規実見96frames。サムネイルは各320×180の全stage。リアルタイム動画再生ではなく全frame連続静止照合である。

after nativePNGを原寸実見し、decoded f1,f6,f48,f95も原寸表示で補完した。旧01のFAILを検出したnativePNG同領域（stage x440〜959,y60〜229）を02から原寸cropし、01の元cropを再表示して比較。01の観測を弱めず、同じ境界の有無で再判定した。

今回証拠は `scratch/avoid008-chochin-visual02/` の96decoded PNG、4contact sheetsと `after-native-glow-upper-crop.png`。decode連番は1始まり、`049.png` = f48。色強調や補間で境界を消したものではない。

条件はchochin single、960×540、『風の先へ』、seed704、circle (.5,.42),r .2。native103sharedfreezeとは別source版として扱い、01と同じ限定fixtureだけを照合した。

## 項目別結果

| 項目 | 判定 | 観測根拠 |
|---|---|---|
| **01 halo切断の解消** | **PASS** | 01ではnativePNGとf48でstage y約110〜120の斜め直線が光の上側を切った。02の同native領域とf48原寸では、その線がなく、cap上側の光が暗い背景へ柔らかく連続する。全96framesでも動くhaloに新しい平坦な切断面を認めない。 |
| 本体・リブ・上下cap | PASS | 元の膨らんだ胴輪郭、曲線リブ、暗い上下capを維持。比例縮小した形状に新規の片側潰れ/分裂なし。 |
| 縦字・可読性 | PASS | 上から『風』『の』『先』『へ』の1列4字を保持。hold中に全文字を判読でき、リブやcapとの不自然な重なり/紙外への分離なし。 |
| 天井紐の接続 | PASS（見える範囲） | stage上端から上cap中央への長紐が続く。原寸f1/f6/f48で上capの位置に届き、揺れとともに接続が保たれる。短い局所紐を別部品として厳密識別する検証はしていない。 |
| 光と本体の一体感 | PASS | 柔らかな黄色haloが胴に沿い、entry/hold/fadeで胴と同時に現れ/暗まる。旧直線境界の解消後、胴から離れた光の板に見える現象なし。 |
| entry/hold sway時計 | PASS（24fps範囲） | f0空、f1暗い胴、f2〜4は明るくなる胴、f5から全文字。元beforeの順序・時期を保持。holdではcap/リブ/文字が胴と同じ緩い左右の傾きで動く。 |
| exit時計 | PASS（24fps範囲） | f90付近まで明るく、f91〜95が順次暗まる。f95原寸も暗い胴/字/紐を残し、01before既実見と同じ。空になったとは主張しない。 |
| 新規crop/分離/重なり | PASS | 全96framesで本体/cap/文字の新規stage crop・字の独立移動・文字欠落を認めない。天井紐がstage上端に接するのは吊り方の表現として扱う。before entryの元上端cropは01既存観測であり、今回afterの退行ではない。 |

## 制限と境界

提示single/1stage/1seed/4文字だけの視覚PASS。円guideはなく、数値circleや他ID、row wire、他variant、字体本来の受入はしない。gradient center/radius/stopsの数値一致、root-affine endpointの実装、unit別strictの数値/コード試験はこの視覚担当では未確認。source実装・baseline生成経路監査、厳密alpha/サブフレーム時期も担当外。

公開URL接続/公開結果確認は一切行っていない。製品、01FAIL、他証拠は編集せず、今回のreview/metadataと専用scratchだけを新規作成。decode/probe/crop処理は終了し、常駐media処理なし、CPU解放済み。
