# AVOID-008 writing-preview02 独立視覚レビュー

2026-10-22 / `/root/avoid008_badge_visual03` / gpt-6.1-sol medium。旧school画像判断は流用せず、今回の2fixtureを自分で実見した。結論は **両fixtureともFAIL、視覚受入不可**。便箋は新しい紙/上部罫線のstage crop、はがきは見出しと消印の新overlapがある。数値のcertified-hold-adapter表示は画像上の不具合を覆さない。

## 固定対象とreceipt

対象は `/workspace/avoid008-objects/tasks/evidence/AVOID-008/objects/writing-preview02/` のみ。owner最終pinは親から受領し、実ファイルSHAを自分で確認した。

- manifest `bde1888a9d07e92d363cae01345924acc0764e2ce3490e65b58dcbaccd2e9883`
- 比較HTML `d26f9178348eedaa31873e85c0478846b45d2a3d0dc11d54cda52256815dd4cf`
- startup implementation `257f8da31e4400dbe4a444f9c06f6b10ea0cd63a`
- before engine `17e35475df196fc87a931802a21683a1d4c7b0cafcbba88feb2e50c9ba708456`。read-only `git show 7cd5a5b:index.html` のbytesと解凍before engineが完全一致。baseline正式SHA `7cd5a5b36eb637967bc78626d9b6eaea89e162ed`。旧badge baselineと混同しない。
- after engine `aec10429cb06a0011af151c4b8c217fd29ecb06f49294b30ffcc31471f25c75e`。同梱gzip解凍bytesと現地index.htmlとも一致。
- source09i `d285b86a5a664355814e808bcd7a90fae7de9f9f33d4e9f163ef80073f234d41`、source11p `b0654eeca05ab38bcd3bfc7079ebf018fc6e77de074056f47888bf1aa2e2a412` はowner最終pinと一致。
- script/fixture/font manifestもstartup pinと一致。9個全font実体のSHAがfont manifestと一致。全sideのfontAuditは9faces loaded、前後同じaudit/assignment。gothic_medは固定sans-regularへ対応するtransport字体。元の全production font保証ではない。
- 16 media assetsの実bytes/SHA全一致、各原寸keyはnative frameHashesとも一致。全4MP4を自分でffprobeし、指定寸法、24fps、96frames、4秒を確認した。

実specはpostcard 1260×540、r=.1（通常r=.2成功ではない）、letterPaper 540×960、r=.2、両方(cx=.5,cy=.42)、seed704、本文「風の先へ」、params.font=gothic_med。実生成paramsも前後一致。postcardはtilt=3.7951、val85、zip0756816、stamp wave。letterPaperはvariant yoko、rule accent、sign true。

capture scriptの同一spec→別page、共通fixture→前後ともnewPath:falseでnative plan生成→afterのみC finalizeする経路を確認。前後96 native frame logすべてt=i/24、after observation motionTime誤差最大4.45e-16秒未満。before observationsは空なのでbefore実測observationによる保証とはせず、共通render呼出しとframe logが根拠。字体load/ready待ちとSHA検査のfixture経路を確認した。

## 画像実見範囲

全MP4をffmpegでローカルPNG sequenceへ展開。前後同縮尺・全stageを12時刻ずつ置いたsheetを2fixture×8枚すべてview_imageで見た。各side f0–95、総384コマ。さらに同梱原寸key f6/.250秒、f42/1.750秒、f90/3.750秒を2fixture×前後計12枚、便箋f1前後とafter f2/3/4を原寸確認。はがきf42 afterの上部を4倍補助cropで拡大し、重なり箇所を照合した。元の全stage画像も保持し、cropで欠点を隠していない。

派生画像はmainの `scratch/avoid008-writing-visual01/` 以下だけ。sheet一覧・hash、個別source/media pin、frame coverageは `writing-visual01-metadata.json`。比較HTMLは本文と参照を読んだが、ブラウザでの操作受入は今回実施していない。

## 便箋: 表示安全 FAIL

**新しい紙上部/重要罫線のstage crop。** after f1=.0417秒は小型紙の上下端と上部二重罫線が全て見え、本文「風の／先へ」と「— No.01」も読める。f2=.0833秒にも上部罫線は見える。f3=.125秒に上方移動で紙上端が画面外へ出る（原寸after/004.pngで二重罫線はまだy24付近に残る）。f4=.1667秒には上部二重罫線が丸ごと画面外へ消失する（after/005.png）。同じ時刻のbeforeは紙上端と二重罫線が画面内にある。

原寸key f6/f42/f90でもafterは白い紙がstage最上端から始まり、上端と二重罫線が消えたまま。beforeには上端余白と二重罫線が完全に見える。holdだけでも新cropが残り、文字が読めることだけで受入できない。紙幅高さの比はおおむね同じ系統だが、上部が切れた外観で小さいメモが画面上に刺さったように見える（代表f42）。

本文はbeforeの1行「風の先へ」からafterの2行「風の／先へ」へ変わるが読順と意味は残る。主字とNo.01は原寸で判読でき、紙から浮く/欄外へ逸脱する/本文同士が重なる状態は観測しない。横罫線と折り位置の細い線も紙と一体で動く。No.01は小さいが全字を読める。

**native fold隠れとの区別:** このfixtureはportrait/yoko。実ソースのportrait分岐はuf=1、fold=0で、登場は紙を上へ滑らせる。landscapeの三つ折り開きによる露出clipの比較ではない。f1初出の本文は双方とも全glyphが見え、新glyphcropは観測しなかった。元から薄い折り線が本文付近にあることと、新stage cropによる上部消失を分けて判定した。「各fold露出時の新glyphcropなし」を全variantへ一般化しない。

f87–95まで前後のfade時刻は概ね揃い、afterだけ早く本文やNo.01が消える兆候は見ない。動きは上方スライド/末尾のわずかな下移動という系統を残すが、上部が切れるため表示意図まで合格にはできない。source上の根本原因や包絡の誤りはここでは断定しない。

## はがき: 全注記の関係 FAIL

**POST CARDと消印の新しいoverlap。** before f42の原寸では、POST CARDは上部中央、切手85と消印円/波線は左上、zip075-6816 boxは右上で、POST CARDと消印は離れている。after f42ではPOST CARDが2行相当の「POST」「CARD」となり、左側のPOSTが消印円・波線に交差する。P付近は消印円、O/S/T付近は波線の線と混ざり、ラベルの字形として追いづらい。f90でも同じ重なり。4倍補助crop `postcard42-after-header-4x.png` でも字と線の交差を確認した。

f6は双方とも本文/zip/消印の出現前。双方f7で本文とzipが現れ、f14前後から消印が現れる。afterはf14–95で新しい見出し/消印干渉が残る。元から消印が切手にかかる関係はbeforeにもあり、これは新欠点として数えない。新しい問題はPOST CARDへ波線・円が伸び込むこと。

afterの紙はobjectScale .35、本文writingScale .7。原寸f42/f90の本文「風の先へ」、zip全7桁と各box、切手85/波の柄は識別できる。消印の小さな数字はbeforeにも切手の重なりがあり、afterで更に小さくなるため全細字の明瞭な可読性は合格保証しない。主字は紙の下側に大きく書かれ、前より罫線が非常に薄くなるが、紙外へはみ出した主字/脱落したglyphは見ない。本文の読順と意味は残る。しかし全注記を読める関係で保持する条件を新overlapが満たさない。

f1–6は左側から入って傾きを戻す動きが両方にあり、f6–12の揺り戻しが見える。afterは大きさが大幅に小さくなり、beforeの大判はがきの存在感は減る。f88–95で右向き移動・傾きとfadeが前後に残る。afterだけ早く消える/新たにstageで紙や字が切れる兆候は今回見ない。動きの系統は残るが、装飾とラベルの意味関係が崩れるためfixture総合はFAIL。

## 範囲と終了

数値試験の判定や全時刻circle安全性の再証明はこの画像レビューの範囲外。r=.1はがきをr=.2成功に数えず、便箋default r=.2のFAILも保持する。別aspect、長文、他seed、他variant、production字体、landscape fold露出は未確認。今回2fixtureの不合格を旧版へ差し替えたり、holdだけ/数値だけの合格へ置換しない。

全ffmpeg/ffprobe処理は同期終了済み。サーバー/ブラウザーを起動していない。製品コード・tests・Git mutationなし。画像は親へ渡さず、このレポートとmetadataのみ保存した。公開先結果確認は利用者指示により恒久中止・対象外であり、成功扱いしていない。
