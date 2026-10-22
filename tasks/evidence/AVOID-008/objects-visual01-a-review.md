# AVOID-008 objects preview02 独立視覚レビューA

担当はransom-defaultとpolaroid-defaultのみ。**実見した一体感・可読性・順序・入退場frame列は限定PASS、新規の必須修正FAILは見つからない。** リアルタイム再生の動感、本来のproduction書体、円との数値的安全は未判定。既存の01/FAIL記録や実装は変更していない。

## Receipt / source

manifest SHA256 `a22ba2f4049835d1712b3388223fb03e1dcad227a0da8adbd2e805f1ab847e2a` は指定と一致。全32assetsの実bytes/hash一致。担当4MP4は実ffprobeで960×540、H264/yuv420p、24/1fps、96frame、4.000秒。全384frameのPTSとmanifest frameHashesの時刻はi/24（f95=3.958333秒）。担当12keyPNG hashは対応frameHashに一致。

前後は風の先へ/seed704/circle(.5,.42)/radius .2/960×540、DPR1/scale1/noHud/noPost、同一params・同一8face fontAudit。afterのmanifest recipeはransom objectScale .75と平行移動、polaroid objectScale .8と平行移動。視覚上も背景とstage寸法は同じで、物体だけが小さく位置を変えている。

before-engine解凍SHA `17e35475df196fc87a931802a21683a1d4c7b0cafcbba88feb2e50c9ba708456` はstartup pinと、Git `7cd5a5b36eb637967bc78626d9b6eaea89e162ed:index.html` に一致。after-engine解凍SHA `2a138fcd1e670dd68cf9bd48841cfc82c4e140a79567c6a5b70ad0d42cd7cf3c` もstartup pin一致。after-engineにはproduct source commit `493b9b3fda7392d0e170b7134dbe0b0128ad9a9a` の `src/09i_layoutsC_objects.js` と `src/11p_layoutsC.js` の実bytes全文がそれぞれ含まれていることを独立確認した。493のchecked-in index.htmlはbeforeと同じSHAでafter-engineとは異なる。これはproduct source commitとその後の生成物の区別であり、Git compiled=afterと記録しない。

`preview02-baseline-source.json` の2bb→7cd対象10blocks同一という既存記録を読んだ。この10block抽出自体は本視覚レビューで再実装していない。全raw/sourceの正当性・幾何検証は親の別レビュー対象。

全asset pins・MP4 probe/PTS・engine照合は `scratch/avoid008-objects-visual01-a/receipt.json`。要約は `tasks/evidence/AVOID-008/objects-visual01-a-metadata.json`。

## 実見範囲

ローカルMP4全frameをdecodeし、各case 4枚、計8枚のbefore/after同時刻contact sheetsをoriginal指定で実見（384画）。縮小contactの細部だけではPASSにせず、bundle f6=.25、f42=1.75、f90=3.75秒の12原寸PNGと、decode f1=.041667、f16=.666667、f95=3.958333秒の12原寸画像、計24原寸画を追加実見した。decode連番は1始まり。リアルタイム再生/ブラウザ/UI起動はしていない。

## Ransom

f42原寸で、水色紙の明朝系「風」、黒紙/細い白縁と白「の」、白灰紙の太字「先」、水色紙と太い「へ」という紙・色・字体差が前後にある。各glyphは自分の紙の中に収まり、切抜き紙の波打つ輪郭、傾き、影が残る。左→右の「風の先へ」は一行を維持。afterは下方へ移り紙/文字が小さくなる。紙間の隙間がbeforeより広がり、重なり合うコラージュの密度は減るが、切抜き文字の集合として依然読める。新規glyph欠け/順番入替/紙の取り残しは見つからない。

f1原寸とf0–7の列で、風→の→先→への順に入る。f6原寸では最後の「へ」がまだ暗く、beforeは先の紙と一部重なるがafterは間隔が空く。f16では双方すべて読め、holdで安定。f87以降で紙や暗色glyphが薄くなる。f90/f95原寸では「の」だけ白く残り、他glyphが暗く残る見えがある。これはbeforeにも同時刻にあり、新規回帰やafterだけの附属物取り残しとは分類しない（元の一律fade完了をPASSしたという意味でもない）。afterの行は下端に近いが、実見したentry/hold/exitで新規stage cropを認めない。

## Polaroid

f42原寸で、白い厚い紙枠、下側の広いcaption欄、内側写真領域、写真右上の同心状accent、主字「風の／先へ」、caption「00:00.00」が前後とも同じ関係で収まる。afterは右へ移り小さくなるが、captionまで原寸で読める。紙枠・写真・主字・captionが一体に傾き、附属物だけ残る現象は見つからない。文字は写真内を維持し、枠との不自然な新規重なり/欠けはない。

f1原寸では前後とも紙の上端がstage外から入り、f6では写真が灰白の未現像に近い状態で、主字は薄い。f16原寸では写真が暗くなり字とaccentが現れ、f42で明瞭になる。白紙から現像される順序は残る。低コントラストのentryはbeforeにも存在し、afterだけの可読性欠損ではない。

f90以降の列とf95原寸で、紙全体が下へ落ちつつ暗くなる。before最終frameは紙の下端がstage外、afterは小さく上寄りから始まるためstage内に残る。主字は紙より明るく残るが写真・captionとの相対位置は固定。落下して薄くなる意味はframe列から読み取れるが、実時間の勢いは未見。本caseは前後ともparams.tape=falseで、テープは描かれない。テープ付きcaseの保持は未検査。

## 制限

8face C-corpus transportの視覚証拠であり、production brush/klee等の本来面・質感を証明しない。circle guideは画像にないため、円回避数値の安全判定を行わない。全frameは縮小対比、原寸細部は列挙24画の範囲。リアルタイム動感は未再生。book/emaの視覚判定は別担当。

公開結果確認は利用者指示により中止・対象外。公開URL/HTTP/hash/画像/動画/UI/起動/公開後確認は実行していない。使用ffmpeg/ffprobeはすべて終了、server/browser未起動。
