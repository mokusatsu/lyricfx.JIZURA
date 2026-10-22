# AVOID-008 objects preview02 — 独立ローカル視覚レビュー B

判定: **担当2casesは限定付きPASS**。book-shelf-default と ema-portrait で、主字・実metadata・意味を担う物体と接続を損なう新規の視覚問題は見つからなかった。bookの独立した床/棚線の右端cropを限定事項として残す。ransom/polaroidは実見対象外。既存clapperのFAILや他の既存記録は変更していない。

## 素材同一性と前後条件

対象は `/workspace/avoid008-objects/tasks/evidence/AVOID-008/objects/preview02/`。manifest SHA256 `a22ba2f4049835d1712b3388223fb03e1dcad227a0da8adbd2e805f1ab847e2a` は指定と一致。全32 assetsを実読しbytes/SHA256一致。担当12原寸キーPNGは各native frame log SHA256とも一致した。

担当4本のMP4を独立ffprobe/decodeし、book 960×540、ema 540×960、H264/yuv420p、24fps、96 decoded frames、4.000000秒を実確認。前後のparams、fontAudit、stageは各fixtureで完全一致。文字「風の先へ」、seed704、circle(.5,.42),r=.2、DPR1/scale1、noHud/noPost、fast=falseも共通。native frame logは全4sideで0〜95とt=i/24。after観測motion timeとの差は最大4.45e-16秒未満。

before-engine.html.gz展開bytesはGit `7cd5a5b:index.html` と完全一致し、SHA256 `17e35475df196fc87a931802a21683a1d4c7b0cafcbba88feb2e50c9ba708456`。after展開SHA256 `2a138fcd1e670dd68cf9bd48841cfc82c4e140a79567c6a5b70ad0d42cd7cf3c` はstartupと一致。after生成HTMLはsource commit `493b9b3:index.html` とは一致しない。493b9b3はproduct source commitで生成HTMLが含まれない扱いであり、Git compiled同一性を承認していない。そのうえで `493b9b3:src/09i_layoutsC_objects.js` と `src/11p_layoutsC.js` のtrimmed source全体がafter captured compiledにexactに含まれることを独立確認した。

preview02-baseline-source.jsonを読み、さらにGit 2bb3f86→7cd5a5bのsrc/11p_layoutsC.jsを独立読取し、全10登録source chunks（ema/ransom/vinyl/cassette/bookSpine/polaroid/stampSheet/postcard/letterPaper/calendar）が同一であることも照合した。capture scriptのhashはstartupと一致し、前後別page、native Canvasをt=i/24で生成している経路を確認。8facesは双方loadedの同一auditだが、本来のbrush/klee等の字体証明ではない。

## 実見範囲

担当4動画全384framesをMP4からdecodeし、12枚の前後対応contact sheetsで0〜95を間引かず実見。全4sideの原寸PNG keys f6(.25s)/f42(1.75s)/f90(3.75s)、計12枚を `view_image detail=original` で追加実見した。退出終盤を補うためbook-after f95、ema-before/after f95をdecode原寸で確認。作業・独立ffprobe・decode・contact sheetsは `scratch/avoid008-objects-visual01-b/`。

リアルタイム再生は未実施。拍子/減衰は24fpsの対応フレーム列で判断し、実時間再生の印象を確認済みとは記録しない。thumbnailだけで細字のPASSを出さず、上記原寸で補足した。circle guideは画像/動画に焼き込まれておらず、HTMLのoverlay表示も実見していないため、数値円安全性は視覚判定外。

## book-shelf-default

8冊の本が棚に並ぶ原義を保つ。主本だけが孤立して浮く所見はない。主本の持上り/戻りに対応して、周囲の本の高さ差と共有の足元が前後で同じ順序を示し、全体が右へ移った後も隣本との接触・前後関係を維持している。主本・隣本・床線のjoint offsetの見え方に不整合はない。

f6原寸は歌詞出現前で、白い主本の黒い巻数札「九」、下の輪、上下の二重罫線が確認できる。f42/f90原寸では縦の「風」「の」「先」「へ」を一字ずつ読め、上下の装飾や「九」と重ならない。本の背幅をはみ出す画線/欠字は見えない。左右の各本のラベル模様・丸・罫線も本体と一緒に動く。after右端の本は画面内に残り、物体の欠損は見えない。

f90以後の戻り/消え方は前後対応しており、f95原寸では本の高さが下がり、歌詞も下へ消える元の退出表現として読める。文字だけの取り残しや主本だけの異なる時計は見えなかった。

限定事項 **OBJECTS-V01-B-01**: 床/棚の水平線の右終端がafterではviewport外に抜ける。f42原寸beforeは概ねx25〜935に両端が見え、afterは概ねx151から画面右端960まで続いて切れる。主本・全隣本・共通の足元の接続・metadataは残る。これは上棒全長を失った旧clapperの問題とは部位と影響が異なり、親の「独立床線の片端cropだけなら必須FAILとしない」という今回の適用判断に従い非blocking限定とした。床線両端まで無cropの成功とは記録しない。

## ema-portrait

屋根形の木札、周縁、穴、三角の紐、左上の黒い丸い絵柄、右上「奉納」、下部「No.01 00:00.00」、後ろのラックと小札が残り、吊るした絵馬として読める。afterでは主札が小さくなり位置が下がるが、ラック/小札も一緒に下へ移り、主札だけが別の場所に浮く所見はない。主札が後ろの小札を覆う重なりも同じ構図の範囲で、主字とmetadataを隠さない。

f6原寸は落下/初期揺れの途中で主歌詞前、f42/f90は「風の先へ」を一行で読める。奉納と番号/時刻も原寸で判読でき、細い横線模様のために字が欠ける所見はない。穴と紐・札の屋根の位置関係、絵柄/metadataと板の位置関係が揺れ中に分離せず追随する。紐の描画が屋根付近へ入る元の形も前後で維持し、穴と紐の完全な物理モデルを新規保証するものではない。

全frame列で落下から大きい揺れ、減衰、保持中の小さな継続揺れ、退出の回転/fadeへ移る順序が前後で揃う。f95原寸ではafter主札の全体が画面内で、beforeで右端が画面外へ出るところもafterは残る。ラックが退出時に短くなる変化、後札のfadeも前後対応している。接続を新しく切る・文字だけが別周期で動く・後札が主字の前へ不自然に出る所見はなかった。4秒より先の完全退出は素材範囲外。

## 制限と終了状態

この2fixtureの視覚判断に限定する。fontの本来brush/kleeらしさ、circle数値安全、未収録時刻や別seed/別文字、実時間の拍感は承認しない。全shapeの数学的なjoint offset一致は親のコード/数値レビューと併用する。

公開結果確認はAGENTS.mdの利用者恒久指示により中止・対象外。公開URL/HTTP/hash/画像/動画/UI/起動は確認していない。decode/ffprobeは終了済み。サーバー・browser・再生プロセスは起動せず、実装・既存証拠を変更していない。
