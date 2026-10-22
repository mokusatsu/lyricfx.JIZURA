# AVOID-008 暖簾 noren-preview01 独立視覚レビュー

判定: **画像 FAIL（NOREN-V01-01）**。素材の識別・比較条件照合はこのローカルbundleの範囲で PASS。素材不成立による FAIL ではない。実装者の self PASS や receipt 内の safe 判定は視覚承認として採用していない。

レビュー担当は親から分離された sol 子エージェント。親へ画像を返していない。製品/source/tests/Gitの変更、再描画capture、公開接続・HTTP・hash・起動等の公開確認は行っていない。公開結果確認は利用者指示により恒久対象外。

## 対象と素材照合

- bundle: `/workspace/avoid008-japanese/tasks/evidence/AVOID-008/japanese/noren-preview01/`
- receipt SHA-256: `47ea4c07b457710801c34472a1de7587de1566d4d43aa37a6113e29d2bf043b9`（依頼値と一致）。index.html、before/after PNG/MP4全5assetのhashとbyte数を自分で照合し一致。
- receipt sourceHashes 全7件を実ファイルと照合し一致。before/after inputsは全体で等しい。sourceStart/Endも同じ値。
- native01 `index.html.before.gz` の実gzipと展開HTMLをhash照合し一致。before sourceIdentityのrender全文はそのimmutable HTMLに含まれ、after render全文は現行 `src/11p_layoutsC.js` とJA/EN生成HTML双方に含まれることを確認した。JA/EN実画面を別captureした証明ではない。
- capture実コードと fixture全文を読み、別ページのbeforeをimmutable HTMLで計画、area=null・trajectoryなしでnative描画、afterのみfinalizePlacementPlan(layoutsC:true)とする対応を確認。
- fixture全textは `風の先へ`、lineText同一、note空。unitsは風/の/先/へ、4枚すべて歌詞panel。default params、cloth=ink、mon=false、wind=-1、ph=.0914166304282844。今回blank-only panelは存在しない（単一字時の左右blank modeは対象外）。540×960、seed704、contentScale1、cut/still/cut、push camera .022、4秒、inDur.35/outDur.4、circle(.5,.42)r.2。
- fontキーはgothic_blackだが実fixtureは全font familyをAvoid006Fixture・weight400へ置換する。実体はlocal NotoSansCJK-Regular.ttc、SHA `b76b0433203017ca80401b2ee0dd69350349871c4b19d504c34dbdd80541690a`。FontFace.load/documents.fonts.readyを待つ実コードを確認。receiptに独立した実行時fontLoaded値・ブラウザ/OS/font版記録はない。single-Noto transport previewの範囲だけであり製品fontや全fontの承認にはしない。
- ffprobeで前後とも540×960、24/1 fps、96frames、4.000秒を確認。実captureはi=0..95、time=i/24、PNGはi36(t1.5)。元rendererのstepDur/tq量子化、ltb、pOut clockとnative暖簾のdrop/sway/part/fade式を照合。見た目の出現順とexit開始は前後同じ。frame0..95/24の外は未確認。
- after receiptのrecipeはobjectScale .5、mainFontSize56.688984（native75.585312の.75）、joint dy372.93145。数値安全性の再承認はしていない。

## 実見方法

前後MP4をlocal ffmpegで全96枚ずつdecodeし、8枚の対比contactsheet（各12時刻、前後24画像）をすべて実見した。抜粋のみのレビューではない。原寸before.png/after.png(t1.5)も双方実見。さらにdecode原寸f4/6/7/9とf90..95を双方実見。after f4/f5/f36の風下端を4倍cropで補助確認した。MP4はH.264/yuv420pによる非可逆証拠であり、t1.5以外の無圧縮PNGがあると偽っていない。

派生物は `scratch/avoid008-noren-visual01/`。frame画像名は1始まりなので `005.png` がf4。全ffmpeg/ffprobe処理は終了、ブラウザ/HTTP serverは起動していない。

## 画像指摘

**NOREN-V01-01: 新規のentry文字crop。after f4 / t=.1666667。** 最初に出る「風」の左下払い先端と右下の鉤先端が、伸長中の布の下端で切れる。before同f4は文字全体と裾下余白が見える。after f5(t=.2083333)には布が下へ伸び、欠けていた先端が戻る。字を読み違えるほど大きな欠損ではないが、「主字全出現」と「新cropなし」を満たさない。根拠は前後の原寸decode f4、after f5、補助 `wind-entry-crop.png`。afterのサイズ変更により布のdrop revealに対する字の余白が減り、一瞬裾に接する違和感が生じる。

## その他の観察（限定合格・既存挙動を区別）

| frame / time | 前後の観察 |
|---|---|
| f0 / 0 | 双方blank。途中まで描いた失敗画とは解釈しない。 |
| f1 / .041667 | 棒が先に伸びる。afterは棒を含め下方へ移る。 |
| f2..8 / .083333..333333 | 左から布が時間差で降りる。風f4、のf6、先f7の順は同じ。after風の初回のみ上記crop。先f7は裾に近いが字全体を確認。 |
| f9 / .375 | へまで4字が出揃う。afterは字間・panel横余白が狭い。へが布外へはみ出す状態は見ない。 |
| f16 / .666667 ～ f86 / 3.583333 | 全4panelと主字を維持。原寸f36では小さくなっても風の先へを読める。風/先の横端は布境界に近いが、隣の前景布で隠れたり文字どうしが重なったりする状態は見ない。裾は微細に傾き、棒・上部帯とpanelの接続は保たれる。 |
| f87..90 / 3.625..3.75 | exitへ移る。afterだけの早期退場、画面端crop、突然の位置跳びは見ない。 |
| f91 / 3.791667 | 双方native exitの内向き回転でpanelが前後に重なり「の」の右側が隠れる。afterは文字が布幅に対して大きいため、先と残るのがさらに密集して見える。 |
| f92 / 3.833333 | 双方「の」が大きく前景布に隠れ、主に風・先・へが読める。afterの密集は強いが、隠れ始めが新たに早い別frameとは判定しない。 |
| f93..95 / 3.875..3.958333 | 前後とも布が交差して透けながらfade。文字の重なり/薄い残りはnativeにもある。afterは同じclockで小さい範囲に凝縮。全消失のt4は素材外。 |

全panelを棒ごと下げ、物理布を半分にしたため、原寸f36ではbeforeの大きな縦長暖簾が、afterでは画面下部の小さく密な暖簾へ変わる。吊下物としては認識でき、字は75%の大きさを残すが、布の余白と暖簾の存在感は減る。意図した差と判別可能。棒、上部帯、布のグラデーション、4枚の裾は保持され、切り離された部品は見ない。crestはmon=falseのため評価不能。

このレビューは指定1bundleの視覚判断だけ。連続全時刻の数学的安全、全variant、全font、単一字blank panel、mon=true、別の文字数/文字列/円条件を承認しない。上記entry cropを解消した新bundleが必要。
