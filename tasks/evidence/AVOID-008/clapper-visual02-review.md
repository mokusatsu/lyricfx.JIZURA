# AVOID-008 clapper-preview02 独立ローカル再視覚レビュー

判定: **02の2fixtureは限定付きPASS。portrait01の上棒cropはこの同条件fixtureで修正確認**。01のFAIL記録・objects-B報告・製品実装・既存証拠は変更していない。

## 素材と条件

対象 `work/avoid008-c-preview/clapper-preview02/index.html`。manifest SHA256 `1a7ffbd8fc1e1a950fcdb537e8eb2ce4e3761c9b4172df54cbd36bd5af890d73` は指定と一致。全112 assetsの実bytes/hash一致、81展開JS sourcepinsとmanifest hash一致。native logと16キーPNG hashも一致。

before凍結HTMLはGit `2bb3f864b5d40361961d8ad2aabeec24bfb5d1cb:index.html` と完全一致、before/after captured compiledともmanifest hash一致。capture script hashと前後別page、同じspecを渡してafterだけnewPathとする経路を確認した。前後とも歌詞「風の先へ」、seed704、cx=.5、r=.2、同一Noto代替font、同stage/時刻。native frame logs各96件でt=i/24、realTime/motionTimeとの差は最大4.45e-16秒未満。

4MP4を独立ffprobe/decodeしてH264/yuv420p/24fps/96 decoded frames/4.000000秒を確認。**landscapeは1920×1080/cy=.42で、01の960×540から解像度が変わっている。01の成功や不足をこのfixtureへcarryせず、新規前後として実見した。** portraitは1080×1920/cy=.5で01と同条件。portrait-before動画・frame log・4原寸キーは01とbytes同一だった。

## 実見範囲

02全4sideの全384decoded framesを12枚の前後対応contact sheetsで0〜95まで間引かず再実見。landscape前後とportrait-afterの原寸PNG f6/f36/f91/f93、計12枚を新規実見。portrait-beforeの同4原寸キーのみ、bytes同一確認後に01の原寸実見をcarryした。

開く棒/snap付近はportrait-after f4/f5/f7/f8/f9/f10の個別原寸pixel crops（x280..880,y0..850）、landscape-after f7/f9の個別原寸pixel crops（x1150..1870,y0..900）も実見。f6は原寸full-stage PNGで補う。これらのinspection cropは下側を切り取る場合があるが、stageでのcropと区別する。最初の補助montage2枚は画像transportで縮小されたため、細部は別の個別原寸cropで補った。landscape前後f2はfull native decodeで下端入場も確認した。scratchは `scratch/avoid008-clapper-visual02/`。

## 修正確認: CLAPPER-V02-01

旧portrait01はf4〜9(.167〜.375秒)に上棒の右先端と全長の相当部分を失っていた。02では同じportrait入力のこの全区間で、先端、stripeを伴う棒全長、左ヒンジ、下棒を追える。原寸f6に切れはなく、個別原寸crop f4/f5/f7/f8/f9も棒先端と上側輪郭が画面内。最も上へ寄るf7でも上に余白が見え、decode白画素補助計測のyMinは94px。上端/左右端の明るい画素交差もafter全96framesで無し。ただしpixel threshold検査だけで合格にせず、上記実見を主根拠とした。

CLAPPER-V01-01は02での修正確認とし、01自体のFAILを上書きしない。portrait cy=.5だけの結論で、採用default cy=.42の視覚承認へ拡大しない。

## 02 landscape: CLAPPER-V02-02

新1920×1080のbefore/afterを両方実見した。before-f6は上棒が上端を越える元演出だが、after-f6は棒の先端・全長が画面内にある。after-f7原寸cropでも先端・ヒンジ・下棒が繋がった構成で残り、最も上へ寄る付近の白画素yMinは55px。全frame列で新規top/side crop、部品が別の場所へ動く分離を見つけなかった。

限定 **CLAPPER-V02-03**: landscape-afterのf1〜2は板が下から入場し、下端で一部が切れる。f2前後full原寸でbeforeにも同じ下端入場があることを確認。歌詞出現前の区間であり、今回修正対象の『開いた上棒全長の新規欠損』とは区別した。全面全時刻no-cropの成功とはしない。

## カチンコの動き・読み・板との比率

両fixtureで板、上下stripe棒、左丸ヒンジ、罫線grid、影が一つのカチンコとして読める。f9(.375秒)までは棒が開き、f10(.417秒)で閉じ、f11〜12付近に微小なshakeを伴って整定する対応が前後で揃う。snap前に棒先端が切れて動きの全長が失われる01の問題は見えない。ヒンジが棒と別周期でずれる・stripeが主歌詞を隠す・板だけが別の場所へ動く所見はない。

原寸f36では「PROD.」の下に主字「風の先へ」、次にSCENE/TAKE/ROLLと01/1/A6、その下にDATE/DIR./CAM.と00:00.00/JIZURA/Aを読める。値は同列のラベル下へ左揃えで収まり、下段のDATEやJIZURAも隣セルや線に食い込まない。f6は元の値fade中で薄く、f36に明瞭になる対応も維持している。

板の縮小に対して主字・metadataは相対的に大きくなった。とくにportraitは主字が欄を大きく占め、下罫線との余白は元より狭い。しかし原寸f36で画線と罫線が離れ、最後の「へ」も右端から離れて全字を読める。PROD.と主字、主字と次段ラベルに不自然な重なりは見えない。読み順は主字→上段三列→下段三列で、文字だけが板から浮いて見えるほどの分離はない。大きい字を保った構成としてカチンコの意味が残ると判断した。厳密なnative font比・metadata floor値・専用measureの正当性は親の数値/コードレビューと組み合わせる。

f91/f93も主字と全metadataが板の中で一緒に下がり、fadeに伴って暗くなる。欠字や文字だけの取り残しは見えず、全frame列で入場/保持/退場の順序は前後対応。f95より先の完全退場は素材範囲外。

## 制限と終了

単Noto transportのため元本来の複数字体は未判定。circle guideは実見しておらず、円の数値安全は目視PASSに含めない。リアルタイム再生は未実施で、拍感とshakeの実時間印象を確認済みとはしない。01 landscape960×540の不足を02の1920×1080の成功で解消した扱いにしない。

公開確認はAGENTS.mdの利用者恒久指示により中止・対象外。公開URL/HTTP/hash/画像/動画/UI/起動は検証していない。decode/ffprobeは終了し、サーバー・browser・再生プロセスは起動していない。
