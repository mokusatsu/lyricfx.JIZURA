# AVOID-008 proofread-preview02 独立ローカル視覚レビュー

判定: **限定PASS（固定媒体のlandscape・短4字・mincho・box 1例）**。全192 decoded frameおよび6原寸key PNGを実見した範囲では、旧PROOFREAD-VIS-001の「太字」を貫通するleaderは解消している。新しい5点elbowは本文の上と左の余白を通り、注記左で止まる。主歌詞・注記・stampの字面横断、新crop、対象文字の変更は見られない。校正注記として対象boxから「太字」まで追える。全domain・全時刻・リアルタイム再生・現working treeへのPASSではない。

担当: ユーザー指定の独立画像照合担当（gpt-6.1-sol / medium）。AGENTS.md、implementation-review-policy.md、visual-review-comparison.md、proofread09/HANDOFF.md/sourceStartEnd.json、旧preview01 manifest、旧visual01-reviewを読んだ。公開URL接続・公開結果確認は利用者指示により中止・対象外。browser、新capture、製品実行、テスト、製品コード編集、Git/index操作はしていない。実装者のquality/数値自己申告は視覚合格の証拠として使っていない。

## 固定対象と実bytes照合

媒体: `/workspace/avoid008-editorial/tasks/evidence/AVOID-008/editorial/proofread-preview02/`。manifest SHA-256は指定どおり `0fa1a1016d687ed4fa8f5a421cfb3bce3021cca93e6539fecdc50044fd67a4a9`。全14 assetsのbyte数/hash、全13 input pinsの実bytes/hashが一致した。比較HTMLは相対参照・before/afterラベル・fixtureをテキスト照合したが、browser表示/操作は未確認。

before compiledはcontents10/index.html.gz解凍SHA `7c72a80f4b9889427fb38cac2d11d4df37c1388e234dcd98c6118908f4313f3b`、afterはproofread09/index.html.gz解凍SHA `d28ceee1702b2ef66020f023432bbfa0ae613029a4347ec85bac965820457054`。proofread09の全100 gz snapshotをsourceStartEndの100 pinsと照合し、不一致・欠落なし、start=end。うち09hは `a81810bde40efe7b9b7053fd4337c64b0fe9cbf812967896ee1c97e326847a36`、11pは `a45d678a52bb2c4cd412d7479d2ca1fe1dbbf91e75c2a075794c5a379623f365` で依頼値と一致。依頼の固定commit識別子は4d72d23だが、Git操作禁止のためcommit objectとの独立照合は当担当ではしていない。親のコードレビューによるcommit照合と分ける。

現working treeの09h/11pはsnapshotと異なる（実hashはmetadata/receiptに保持）。このため現在の製品ファイルを媒体生成sourceとして扱わず、上記immutable snapshotと固定媒体のみを判定した。

capture-runnerはbefore=Contents10、after=proofread09のcompiled bytesを供給し、同一fixtureからafterのみfinalizePlacementPlan(layoutsC:true)を通す構成である。before/afterのsourcePlanは完全一致し、さらに旧preview01前後のsourcePlanとも一致。before renderPlan=sourcePlan、after actualCut=renderPlan.cuts[0]を実JSONで確認した。実条件は960×540 / 24fps / 4秒 / seed704、本文「風の先へ」、mincho、pen=klee、marks=[box,circle]、stamp/tombo=true、中央(.5,.42), r=.2、push camera。actual renderPlanのcompositionはproofBottomMargin.typeScale=.7 / proofMargin=.35である。

実際に描くmarkは**box 1個、target=[3]「へ」**。sourceの4字以下marks.slice(0,1)とactual owner/corpus、画像の囲み対象が一致する。circleを見た・承認したとは扱わない。元入力note「遠い空の向こうへ」はsourcePlanに残るが、描画注記はPROOF_NOTES.boxの「太字」。stampは「校了」「00:00.00」。これらの全copyを固定JSON/sourceと現物で照合した。

font manifestはmincho→serif-regular、klee→sans-bold、mono→mono。8 face bytesとfixture/runner pinを照合し、fixtureがFontFace bytes SHA確認→load→fonts.ready/checkを待つ実装であることを読んだ。注記を実Klee書体での視覚検証とは呼ばない。撮影engine記録はNode24.19.0 / Chromium154.0.8037.57、capture 2026-10-22T19:17:03.133Z–19:17:12.329Z。当担当によるengine再実行やruntime font監査ではない。

## 実見範囲と方法

ffmpeg7.1.5で前後MP4を独立decode。ffprobeでも各96frames / 24fps / 4.000000秒 / H.264 / 480×270を確認した。before/after各frame0..95を、**480×270等倍セルの4×4 contact sheet各6枚、計12枚で全192コマ実見**した。時刻範囲は0〜95/24=3.958333秒。native960×540は前後各frame6(.25秒)、36(1.5秒)、91(3.791667秒)の**全6枚を原寸実見**。旧preview01 after36-nativeも追加実見し、旧線が「太字」の上を横断することと新線の迂回を直接比較した。

MP4のリアルタイム動画再生は実施していない。動きの順序は全decoded frame列を追って判断しており、知覚上の速度・滑らかさ・音声同期や24fpsの間の時刻は未確認。6枚のPNGだけで動画全域PASSにしていない。MP4はlossyのためdecoded PNG hashとencoder-input PNG hashは同一物のhashではない。

独自生成物は `/workspace/lyricfx.JIZURA/scratch/avoid008-proofread-visual02/` のみ。全192 decoded PNG、12 sheets、decode-receipt.json、確認scriptを保持。元MP4・PNG・logは変更/削除していない。

## 観察と限定判定

| 項目 | 判定 | 現物での観察 |
|---|---|---|
| 主歌詞全字・読順 | PASS | 「風→の→先→へ」の一行が前後で保たれる。afterは小さく右上に移るが4字を識別でき、置換・欠落・不自然な文字面変形は見えない。 |
| 元target/box | PASS | 新旧とも「へ」の囲み。左罫が「先」の右端近くに寄る関係はbeforeにもあり、新leaderが別glyphを対象にした様子なし。 |
| 注記「太字」・leader | PASS | afterは対象box上右から上へ出て本文上を左へ、左余白を下り、注記の左で止まる。旧after36の注記貫通は新after36にはない。注記が現れるframe15からhold、fadeまで字面への横断を認めない。 |
| 主歌詞/stampとleader | PASS | 外回り経路は主歌詞の字面を横切らず、下に離れたstampにも触れない。stamp overshootが見えるframe28..32でも新crop/注記衝突は見られない。 |
| stamp全copy | PASS（採取列内） | 二重枠、校了、00:00.00が同じ傾きで現れる。元copyを識別できるnative36を確認。退色時に読みにくくなるのは前後共通のfadeとして追える。 |
| 出現・退出clock | PASS（24fps列内の順序） | markはframe10から、boxはframe12付近で揃い、leader/注記はframe13..16で展開。stampは27まで不在、28で大きく薄く出現、29..32で収束。87以後に印/注記/stampが退色し、94..95は本文主体。前後で順序が一致する。 |
| stage境界/crop | PASS（全採取frame） | 右上に寄ったafterにもstage内の余白があり、本文/印/注記/stampに新たなstage端切断は見えない。cameraに伴う緩い位置/scale変化でも同様。 |
| 校正としての対応 | 限定PASS・構図留意 | box→外回り線→「太字」を追える。取り消し線に見えた旧貫通は解消。ただし以下の構図上の留意点がある。 |

元sourceでmark開始=.35×.8+.1=.38秒、stamp開始=.35+.55+.25=1.15秒。holdWindow記録は1.3301〜3.6秒、exit開始3.6秒。全decoded列の出始め・収束・退色順序と対応する。連続時刻の厳密な同値証明やmaximum1.5の全瞬間の視覚確認には拡張しない。

## 気になる構図（blocking FAILとは分ける）

新leaderの長い上辺＋左縦辺は、短い注記線よりも「本文全体を包む大きな括弧」に見える。after36原寸では左縦線が灰色tomboの左下寄り短罫と交差して見え、校正線とトンボが近接する。したがって「tomboとも全非交差」とは判定しない。字面の可読性やbox対象の追跡は損なわれておらず、今回の旧注記貫通修正に対するblocking FAILにはしないが、校正らしさ・紙面美観の判断で留意すべきである。右上集中と大きい左下余白も依然強い構図であり、配置嗜好まで包括承認しない。

## 未確認範囲

circle/wave/dots、他font・実Klee、2/3字・長文・空白・複数行、portrait/square・他寸法、他seed/rotation/region/radius/centre、他camera/effects、manual/lock/saved/UI、HTMLのresponsive/keyboard、24fps間の時刻、リアルタイム再生、公開結果、現working treeは未確認。AVOID-008全domain完了、数値proofの受入、性能・状態保存・自動試験成功の判定ではない。今回の限定PASSを他mark/配置に拡張しない。

機械可読記録: `proofread-visual02-metadata.json`。全媒体・input hash、compiled/source対応、全decode PNG/sheetのhashはscratchの`decode-receipt.json`。
