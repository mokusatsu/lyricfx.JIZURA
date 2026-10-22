# AVOID-008 badge-preview02 独立ローカル視覚レビュー

判定: **構成・可読性・今回の新規cropは限定PASS。元の飛び込む動きの保持は承認しない。動きの変更の受入は親判断要。** 素材不一致FAILと視覚不具合FAILは、今回確認範囲では検出しなかった。総合受入やリアルタイムの拍感PASSではない。

対象は `work/avoid008-c-preview/badge-preview02/index.html` に対応するローカル素材だけ。portrait hello/school、1080×1920、circle中心(.5,.42)、r=.2、seed704、風の先へ、単Noto代替font。旧across案は比較・受入対象外。親の画像文脈を引き継がず実見した。実装/source/testsの変更は行っていない。

## 素材・条件の独立照合

- manifest SHA256 `9af8013e2ff371f9bf0305c3e0890060aa0f7beade040e8a01ecf7fdd9f5d9ab` 一致。112assetすべてSHA256/存在一致。
- 圧縮source全pinを展開してmanifest source.filesと照合。一致。after compiled `2c5078556eadfb91a74d02aecd8a3822e5cb51098e4c1c3bc36f7139a92c5f56`、before compiled `ad7257a257ff7bfc43c07fe06bc83490d3cdf8b7fcf716019eb9b3e70e67ce57`、fixture2本・capture script・実fontのpin一致。compiledにはsnapshot source全体が含まれ、11tのみ既知の画像placeholder埋込みに相当する置換で前後text一致。現在のworking sourceはafterの正本に用いなかった。
- beforeはnative01/index.html.before.gzおよびsource-freeze.jsonの独立baselineと同一。capture scriptはbefore別pageとafter別pageに同fixture/input/fontを適用。元baselineのnative描画とafterのrecipe描画を同じrenderer.frame(n/24)で得ており、PNG再生・UI captureではない。
- snapshot fixtureのplan/cut生成は4秒、start0/end4、nameTag、同seed/text/variant、camera push・motion等の共通設定。afterのみC finalize。manifestの実trajectoryはhello objectScale=.71、school=.72、badgeMeasure=1、anchorConnect=true、native aspect戦略と一致。完全な実行planのJSONは素材にはないため、full planを直接比較したとは主張しない。保存trajectory・capture script/fixture・clock・実画像の対応にmaterial矛盾なし。
- 独立ffprobeで4本ともH264、1080×1920、24fps、96 decoded frames、4秒、audioなし。全384frameをdecode完了。PTSは全frameでn/24に一致(表示丸め1e-6以内)。clocklogは96件ずつ連番・n/24、afterのreal/motion time差は浮動小数点丸め程度。原寸PNG16枚のhashは各clocklogの当該frame hashと一致。

## 実見範囲と観察方法

全384frameを間引かず8枚のcontact sheetで確認。原寸key16枚(f6/.250s、f36/1.500s、f91/3.792s、f93/3.875s)をoriginal detailで実見。加えて4動画それぞれf1/.042s、f7/.292s、f94/3.917s、f95/3.958sをnative pixelの個別cropで確認した。補助素材は `scratch/avoid008-badge-visual02/` の8sheet、16crop、独立probe JSON。cropはpixelを拡縮していない。画像の切出し境界とstage cropを混同せず、late cropは元stage下端1920まで含めた。

ローカルdecodeのtimestamp順の静止観察であり、4秒実時間の連続再生・音との拍感・知覚上の速度評価は未確認。公開URL/HTTP/hash/画像/動画/UI/起動/smokeの公開結果確認は利用者指示により中止・対象外。localhost起動・外部通信も行っていない。

## hello

f36は横長名札の元の縦横比と黒header/白い名前欄を保持。HELLO→my name is→風の先への読順、各文字の所属、余白を維持し、原寸で文字は明瞭。主字だけを小さな別札へ移す見え方や新しい横長strip化はない。ただし全体は元の約.71で、主字・小見出しとも絶対pixel寸法は縮小。原サイズ保持PASSではない。

f1は傾いた薄い名札が既に上方の保持位置近くに現れ、f4/.167sでほぼ同じ高さの白欄となる。beforeはf1からf4へ大きく下がって画面中央へ飛び込む。afterは回転・fade・小さな上下移動が残るので「純粋なfadeのみ」ではないが、長いdropの迫力は明瞭に減る。f6は両側とも主字未出現、f7は両側とも風の先へ全出現。新しい遅延・入場主字cropなし。

f87/3.625sからf95へafterは上方から大きく落ち、f91/f93も札全体と全字を保持。f94/f95原寸でもHELLO/my name is/主字はstage内で完全。beforeに現れる終盤の紙・外枠のstage端cropを新しい重要部品へ移す回帰は検出しない。fadeと右回転の位相は同じ順で、保持中の読む時間が新しく短くなるframeはない。落下距離・各frame間の変位は増えており同一motionではない。

## school

f36は元の名札比率、学年組→なまえ→主字の順序、罫線、黒丸、上方の安全ピン線と端点を保持。ピンはbeforeでも紙から少し離れた線として描かれ、afterで新たに遠くへ孤立したり主字から別ownerに見える分離はない。紙・文字・ピンは同じ傾きと移動を示す。原寸ではmetadataも読めるが、全体.72に伴い絶対寸法は縮小。

入場f1–f6はhelloと同様にdropが短く、回転しながらその場に姿を出す印象が強い。beforeの落下移動の意図をそのまま保持したとは判定できない。f6はmetadata/紙/ピンが揃い主字空欄、f7で主字全出現という順序は共通。全sheetで新規early cropなし。

退場f91/f93、追加f94/f95で主字「風の先へ」は完全。旧版f94の主字crop問題は今回素材では再現せず、学年組・なまえ・ピンの新規cropへ置換した形跡もない。f94は紙・ピン・全metadata・全主字がstage内、f95も同様に末字まで残る。beforeはf94で紙右端がstage外、f95では下方/右方cropが進むが、afterは縮小・上方holdからの落下によりそれらを避ける。読める主字の開始/終盤の表示時刻が新しく削られた所見なし。

## 動きに関する受入境界

| 項目 | 観察 | 判定 |
|---|---|---|
| 名札の形・header/class領域・所有接続 | native aspect、読順、部品のまとまりを確認 | 2条件限定PASS |
| 入場dropと飛び込み感 | native672px→hello約52px/school約83px。f1–f6で大きな落下が小さな揺れに変わる | 元の動き保持としては不成立。変更意図は親判断要 |
| fade・回転・主字出現順 | 傾いた札が起き、f7主字出現。純fadeではない | timestamp順の位相だけ限定PASS |
| 退場 | native dy960→約1580/1549px。f88–f95で長い移動、全glyph保持 | crop/読めるframe削減なし。過度な速度感の受入は親判断要 |
| 通常holdの主字/metadata/紙/ピン | いずれも欠け・owner分離を検出せず | 限定PASS |

親へ: 今回を「元の演出をそのまま保った位置調整」として承認するのは適切でない。構成保存とcrop修復は進んでいる一方、元の大きな飛び込みをほぼその場の回転出現へ変えるデザイン変更が残る。元の飛び込みの保持が必須ならその要件に対してFAILと扱える。保持位置変更に合わせた演出変更を許容するかは、親の受入判断として分離する。実時間の印象が必要なら未確認のまま残し、拍感承認は作らない。

数値円安全・全variant/aspect・元production fonts・性能・C34全体の受入には拡張しない。
