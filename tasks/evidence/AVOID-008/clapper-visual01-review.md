# AVOID-008 clapper-preview01 独立ローカル視覚レビュー

判定: **FAIL — portrait 入場時の上棒に新規の画面上端crop**。保持中のカチンコ構成・主歌詞・metadataの可読性は確認できたが、全演出の無欠損成功とはしない。実装・既存証拠には変更を加えていない。

## 素材同一性と条件

- 対象: `work/avoid008-c-preview/clapper-preview01/index.html`。manifest SHA256 `8cb72a49987f4ddc7c4055481f308ed6726ae5bea209b9cf47a3260d48609cd7` は親指定と一致。全112 assetsの実bytes/hash一致、81個の展開JS sourceのmanifest hash一致。16原寸キーPNGも各native frame logのSHA256と一致。
- beforeの凍結HTML展開bytesは `2bb3f864b5d40361961d8ad2aabeec24bfb5d1cb:index.html` と完全一致、SHA256 `ad7257a257ff7bfc43c07fe06bc83490d3cdf8b7fcf716019eb9b3e70e67ce57`。capture scriptで各sideの別page、before凍結HTML、afterだけnewPathを適用することを確認。
- 同一fixture内のseed704、歌詞「風の先へ」、stage、font transport、frame時刻は前後共通。landscape 960×540 / circle(.5,.42), r=.2。portrait 1080×1920 / circle(.5,.5), r=.2。portraitの採用default cy=.42の不足を解消した証拠にはしない。
- ffprobeを4本とも独立再実行。H264 / yuv420p / 24fps / 96 decoded frames / 4.000000s。native logsは各96 framesで `time=n/24`。realTime/motionTimeの誤差は最大4.45e-16秒未満で、時計変更の所見なし。

## 実見範囲

4本全384フレームを、MP4からdecodeした前後対応の12枚の連続contact sheetで間引かず実見。全4sideの原寸キーf6/f36/f91/f93（16枚）を `view_image detail=original` で追加実見。landscape-after f9〜12、portrait-after f10〜11もdecode原寸で確認。portrait-after f2〜9の画面上200pxを原寸のまま並べてcropの開始・終了を補足した。作業・decode・独立ffprobe結果は `scratch/avoid008-clapper-visual01/` に保存。

リアルタイム動画再生は未実施。24fpsでの連続フレーム対応により時系列を判断しており、実時間の拍感の完全承認とはしない。thumbnailだけで文字細部のPASSを出していない。

## FAIL: CLAPPER-V01-01

portrait-after **f4〜f9（0.167〜0.375秒、6連続frames）** の開いた上棒が画面上端で切れる。原寸 `images/clapper-portrait-after-6.png` の右上への上棒は画面外へ抜け、棒の右端と相当部分の長さが見えない。対となる `clapper-portrait-before-6.png` は棒全体が画面内で、上端に約199pxの余裕がある。after f4〜9の原寸上端stripでも連続cropを確認。全96framesを機械補助で調べた上端の明るい画素交差もafterはf4〜9、beforeは無し。

ヒンジと下棒、板は残り、閉じるタイミングそのものは失われていない。f9=.375秒ではまだ開き、f10=.417秒は閉じた状態となり、snap前後の微小な揺れと整定は見える。しかし開きの大きい期間に棒先端・全長が追えず、開閉の形を弱める新しい退行。円通過を許容する入場区間の緩和だけで重要部品cropを承認しない。continuous opened-stick supportを含むstage配置の修正後、別immutable bundleで再レビューが必要。

landscape-afterもf5〜8で上棒top cropが残る（原寸after f6で明瞭）。landscape-beforeにも同様の入場時cropがあり、新規portrait退行と区別する。landscape全期間no-cropとは記録しない。

## 確認できた見え方

両fixtureとも板・二本の斜めstripe棒・丸い左ヒンジ・罫線セル・影が一つのカチンコとして読める。部品が板から分離したまま動く所見はない。上棒が開き、約.42秒に閉じて微小な揺れを経て保持する対応は前後で揃う。f91以後は板と文字が一緒に下がりfadeする。残像のような文字だけの取り残しはない。

f36原寸では、主歌詞「風の先へ」がPROD.の下の大きな欄に一行で収まり、SCENE/TAKE/ROLLと01/1/A6、DATE/DIR./CAM.と00:00.00/JIZURA/Aを各欄で読める。歌詞の画線・最後の「へ」・metadataの欠字、罫線との不自然な重なりは見えない。f6の値は元と同じくfade中で薄く、保持f36で明確になる。f91/f93でも文字と板の関係を維持し、全体fadeに伴う減光として読める。

landscape-afterは値が同じ列のラベル下へ左寄せで揃い、DATE/DIR./CAM.まで縦に追える。板はbeforeより小さくなり、歌詞は大きさを保ったため欄をより大きく占めるが、f36で上下左右に余白が残り、字と板が別物に見えるほどの分離はない。portrait-afterは主歌詞・数値・下段値が判読でき、下段値は元の中央寄り配置を維持している。読順は主歌詞→上段三列→下段三列で自然。物体固有の再構成か、font値の厳密保持かは親のコード・数値レビューと組み合わせる。

## 制限

circle guideが無いため、数値的な円安全性を目視成功とはしない。portrait cy=.5のこのfixtureをdefault .42成功と混同しない。単一Noto代替transportであり、元の複数書体固有の字体は対象外。stripe矩形のsource clipと、主歌詞maskでの回避は別であり、後者を使用したという所見・承認はしていない。リアルタイム再生未実施に加え、4秒の末尾f95より先の完全退場はこの動画から判定しない。

公開結果確認はAGENTS.mdの利用者恒久指示により中止・対象外。公開URL/HTTP/hash/画像/動画/UI/起動の検証は実行していない。メディア処理は終了済みで、再生サーバー・browserは起動していない。
