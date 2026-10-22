# AVOID-008 kake-preview04 独立視覚照合

**PASS（掛け軸kakeの探索prototype・提示1fixtureの視覚範囲のみ）。** 紙と文字、表装、紐、軸、印の関係と元の開閉を保持し、新規の分離・重なり・文字欠落・stage cropは観測しなかった。他variantや他ID、正式書体の受入には拡張しない。

## 素材同一性・実見範囲

ローカルbundle: `/workspace/avoid008-japanese/tasks/evidence/AVOID-008/japanese/kake-preview04/`。receipt SHA256 `ce5b36ea0e6182a1f30a83a6cf9aa228cda6482d0e42742b87d642813b63b80c` は指定一致。receipt掲載の全5assets（index.html、before/after MP4、before/after PNG）の実bytes数とSHA256も一致。hash一致だけで視覚PASSとはしていない。

2MP4をffmpegで全frame原寸PNGにdecode。ffprobe count_frames実測は両側とも960×540、24/1fps、4.000秒、96frames。0始まりf0〜f95全てを同時刻before/after上下配置の4枚contact sheetsで実見、計192frames。各サムネイル240×135の全stage連続静止照合であり、リアルタイム再生は実施していない。native before.png・after.pngの2枚を原寸実見した。

補完として両側f12,f36,f70,f88,f90,f91,f93,f95をdecoded原寸単frameで実見（計16）。f12は開く途中の文字clip、f36/f70は完開の字面・印・物体比率・端、f88〜f95は閉じる順序・残像を確認した。証拠は `scratch/avoid008-kake-visual01/` の192 decoded PNGと4contact sheets。decode連番は1始まりで `013.png` = f12。

条件: 960×540、『風の先へ』、seed704、circle (.5,.42),r .2。paramsのfont名brushに対し実描画はsingle-Noto transport fontであるため、書体本来の筆致・複数字体の検証とはしない。afterは右へ移動し全体が一様に小さく見える。receiptにもobjectScale .9/nativeFontSizePreserved falseが含まれるため、「純粋な同size移動しかない」とは記録しない。寸法数値の採否は担当外だが、視覚上の不均一な引伸ばしや物体比率崩れは認めない。

## 観測

| 観点 | 判定 | 観測根拠 |
|---|---|---|
| 掛け軸としての造形 | PASS | 灰色の表装、白い紙、金色の紙縁、暗い上下軸、下軸端の金色つまみ、上軸から吊り点へ結ぶ左右の紐、白い吊り点を両側で保持。afterでも文字は紙中央、印は最終字の左下にあり、紐/吊り点/上軸の接続関係も同じ。布の織り目は元画像にも見えず、質感の追加判定はしていない。 |
| 縦の読順・全文字 | PASS | 完開では上から『風』『の』『先』『へ』の1列。全文字判読可能。印は『へ』左下で字を覆わない。原寸native2PNGとf36/f70で確認。 |
| 元の開く動き・時計 | PASS（24fps範囲） | f0空、f1〜5は紐とほぼ閉じた軸、f6〜8で表装が上から下へ展開、f9から文字上部が見え、f10『風』、f11〜12で下の字を順次露出。f13では『へ』まで見え、f17前後でほぼ完開。両側とも同frameで下軸とclip境界が進む。 |
| 元の閉じる動き・時計 | PASS（24fps範囲） | f88付近から下軸が上がり、f90で『へ』が隠れ『風の先』、f91は『風』下部がclipされ、f92はほぼ文字なし、f93は閉じた下軸が上軸近くへ戻る。f95も薄い軸/紐が残る。before/after共通であり、f94以降空とは主張しない。 |
| 紙・文字・軸の一体感 | PASS | 開閉中も字が紙から独立して流れる、別の時計で止まる、軸を越えて紙外へはみ出す現象なし。文字は固定した紙上で、下軸に対応する元のunroll clipにより順次現れ/隠れる。 |
| 新規crop・重なり・分裂・欠落 | PASS | afterのhook/cord/上下軸/紙/全文字は完開時にstage内。原寸f12の『へ』部分欠損、f90の『へ』消失、f91の『風』部分欠損は両側共通で、stage端ではなく動く下軸によるnative clip。新規退行に数えない。beforeは完開時下軸がstage下端に非常に近いが、今回原寸で明確な途中切断を確定しておらず、元stage cropがあるとも断言しない。afterは端に余白を保つ。 |

afterは紙・字面・印・軸などが全体として小さくなるが、縦横比と相対配置を保つ。黒字と白紙の対比は明瞭で、この4文字の可読性を失う縮小には見えない。元の展開/収納の意味が維持されている。

## 制限と作業境界

circle guideは画像にないため、視覚circle PASSは主張せず、円内外の数値判定は未確認・geometry担当へ委ねる。1fixture、1stage、1seed、4文字のみ。brushの本来書体、他variant、他10IDは未確認・対象外。厳密なalpha値/サブフレーム時刻は未計測。source実装レビューやbaseline独立生成経路のコード監査はしていない。

AGENTS.mdの公開確認禁止を遵守し、公開URLアクセス・公開結果確認は一切実施していない。product/tests/既存docsと旧sticky01 FAIL証拠は変更していない。decode/probe/画像生成は終了し、常駐media処理は残していない。
