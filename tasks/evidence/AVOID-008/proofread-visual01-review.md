# AVOID-008 proofread-preview01 独立ローカル視覚レビュー

判定: **FAIL（実際の1例に限定）**。本文、対象文字、印・注記・遅延stampの所属は保たれるが、afterの引出し線が注記「太字」の字面を貫通する新しい異常overlapを確認した。数値quality/self-reportとは独立した視覚指摘であり、この紙面例を視覚承認できない。

担当: gpt-6.1-sol / medium。親から印象・期待判定は受け取っていない。AGENTS.md、implementation-review-policy.md、visual-review-comparison.mdを読んだ。公開結果確認は利用者指示により恒久中止・対象外。公開URL/HTTP/公開hash/公開画像・動画・UI・起動確認は一切実施していない。browser起動、新capture、製品実行、tests、原本編集、Git変更も実施していない。

## 固定対象・独立照合

素材: `/workspace/avoid008-editorial/tasks/evidence/AVOID-008/editorial/proofread-preview01/`。manifest SHA-256 `da60536169b37ba7b91229a38a478d2079efae766a3bc3dd87f87a7e83c58607`、source commit `d63406a`。manifest全assetのbyte数/hashが一致。before=`contents10/index.html.gz`、after=`proofread06/index.html.gz`の解凍compiled HTML hashも一致。proofread06内の`src/11p_layoutsC.js`、`src/09h_layoutsC_editorial.js`は指定commitと一致。capture runnerとfixture/fontの全13 input pinsも一致した。

index.htmlの相対video/PNG参照、前後ラベル、fixture表示とmanifest/actual-inputsをテキスト照合した。browser表示・操作は未実施。sourcePlanは前後で完全一致し、beforeのrenderPlanはsourcePlanと一致。入力は960x540 / 24fps / 4sec、seed704、本文「風の先へ」、mincho、marks=[box,circle]、stamp/tombo有効、circle centre=(.5,.42), radius=.2。afterのみfinalizePlacementPlan(layoutsC:true)を通すrunnerである。

実際のmarkは**box 1個のみ**。4文字以下はmarks.slice(0,1)となるsourceと現物が一致し、circleを見た・合格したとは扱わない。対象index3は「へ」。入力note「遠い空の向こうへ」はsource planに残るが、このlayoutが描く注記はPROOF_NOTES.box由来の「太字」。入力noteを現物で読めたとは扱わない。

固定font manifestはmincho→serif-regular、klee→sans-bold、mono→mono。注記は実Klee書体の検証ではない。fixtureがFontFace bytes/hash検証・load/ready/checkを待つsourceと固定bytesを照合した。runtimeを再実行したfont監査ではない。

## 実見方法

前後MP4をffmpegで独立decodeし、ffprobeで各96frames / 24fps / 4.000000sec / 480x270を確認。frame0..95を各480x270等倍セルの12枚の4x4 sheetで、**全192frameを実見**した。native960x540はbefore/after各frame6(.25sec),36(1.5sec),91(3.791667sec)の**全6枚を実見**した。sheet、decode PNG列、各PNGのSHA-256 receiptを`/workspace/lyricfx.JIZURA/scratch/avoid008-proofread-visual01/`に保持。元MP4/keys/原本は変更・削除していない。

## 実物の判断

| 見る箇所 | 判定 | 観察 |
|---|---|---|
| 本文全字・読順 | PASS | 前後とも「風→の→先→へ」の横一行。消失・置換・改行・文字面だけの歪みなし。afterは本文が小さく右上に移るが4字を識別できる。 |
| boxの対象・形 | PASS | 「へ」の囲みとして追える。先の右端近くに左罫線が寄る関係はbeforeにもあり、新たに別文字を主対象にした様子なし。frame10から描き始め、12付近で囲みが揃う。 |
| 引出し線と注記の所属 | PASS | beforeは右上の「太字」、afterは左下の「太字」へつながり、同じbox対象の注記として追える。 |
| 注記の独立可読性 | **FAIL** | afterの斜め引出し線が「太字」の上半分を横切り、太の横画/字の上部に重なる。frame16..87のholdで見え、native after36が明瞭。beforeでは線が注記左で終わり、この貫通はない。 |
| tombo/罫線 | PASS | 隅と中央の印がまとまりの周囲に残り、出現→hold→退色を前後で追える。stage端で新たな切断なし。 |
| 遅延stamp | PASS（採取frame内） | frame27まで不在、28で大きく薄く現れ、29..32付近で収束。二重枠・校了・00:00.00が同じ傾き/動きで付く。afterは本文/注記の下に離れ、overshoot中にも欠け・注記との衝突なし。 |
| 退出/残存 | PASS | frame87以後で印・注記・stampが薄れ、91は薄い痕跡、94..95は本文主体。beforeも同じ順序。cut本文が残る挙動を新しい欠落とは扱わない。 |
| 新crop・異常変形 | 部分PASS | 全stage上で新cropや文字面のみの伸縮は見られない。ただし上記overlapがあるため総合PASSにしない。 |

source clockはmark開始=.35*.8+.1=.38sec、stamp開始=.35+.55+.25=1.15sec、entry終端1.33sec、exit開始3.6sec。実物の出始め/overshoot/退出順序と対応。連続時刻の完全保証には拡張しない。本文の.7、stampの1.5等の数値自己申告だけで可読性・完全性を判定していない。

### 要修正 PROOFREAD-VIS-001

`after-36-native.png`の注記「太字」を見ると、boxから下左へ向かうleaderが文字の上を通る。同一native PNGの(620,130)-(900,220)領域を4倍へ拡大した`after36-note-detail.png`もscratchへ保存した。補助cropであり、元全体画像に代わる証拠ではない。注記は読めるものの、校正指示に斜線が重なり、取り消し線のように見える。注記の外側の接点へ線を接続し、字面との分離を再取得・再レビューする必要がある。製品修正はこの担当では実施していない。

## 未確認domain・限界

実際のlandscape/短4字/mincho/box/central r.2/seed704例に限定。circle/wave/dots、他font/実Klee、2/3字・長文・空白・複数行、縦長/正方形/他寸法、他region/radius/centre、他seed/rotation、他camera/effects、manual/lock/saved状態、UI操作、24fpsの間の時刻、公開結果には判定を広げない。HTMLのresponsive/keyboard挙動も未確認。数値proof/テスト受入可否やAVOID-008全domain完了は判定対象外。

機械可読記録は`proofread-visual01-metadata.json`、decode PNG全192枚のhashはscratchの`decode-receipt.json`を参照。
