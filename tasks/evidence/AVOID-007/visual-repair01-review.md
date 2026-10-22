# AVOID-007 visual repair01 独立画像照合

日時（JST）: 2026-10-22T19:09:38.524263+09:00
担当: gpt-6.1-sol / medium。親へ画像は返さず画像検査のみ実施。

**総合 PASS（指定5演出・3時刻の静止画に限定）**。30/30 PNGを全体contact sheetで実視し、after15/15枚は原寸crop（typeSpecimenは原寸全体）も実視した。数値safetyを画像合格の代用にしていない。

## 入力同一性

receipt `visual-draft01.json` raw SHA256 `ff78fe6f36dc6ffa3df52f5b5db5f1037f5931855055c27579fabc8f74c91896` 一致。全41 assets（30PNG、2 engine HTML、fixture、8 font）の実bytes/SHA256と、30PNGのRGBA hash/原寸を確認、一致。起動前gzip snapshot105 pinsも展開後のbytes/hashを全件確認、一致。起動順序はsnapshotコードから確認したがbrowser起動時刻の独立観測ではない。

identityのreceipt/JA/EN/4 source hashと全79 source pins aggregateも照合、一致。before engineはgit `e96cbb2f8379eb5895c36f1312f5083b0c583e75:index.html` に記録済み3箇所のDOM正規化のみを施したものとbytes完全一致。after engineも起動前JA snapshotの同正規化とbytes一致。

全5IDの両side conditionsはspecと一致、fontAudit全体とloadedが一致。before fullstage / after automatic current B。frame3/36/90は24fpsの0.125/1.5/3.75秒。equalizer/tunnel/typeSpecimenは1920×1080、elastic/kanjiFocusは3200×1080。

## 画像所見

下記全5行で、before/after **frame3 (0.125秒)、36 (1.5秒)、90 (3.75秒)** を実際に確認。

| ID | 旧問題 | 実視所見・新たな問題の有無 | 判定 |
|---|---|---|---|
| b25-equalizer | 解消 | 細棒8本は太棒の内側/直近にあり、反射も同じ棒の下に連続。上段「風の」下段「先へ」の棒・ピーク・反射が各行へ付随し、大離隔なし。主字と所有図形は円の右へ離れる。frame3の「へ」未表示はbeforeにもあり36/90には表示。90のピーク横線と「先」下部の接触傾向もbeforeに存在し、afterでも読める。修正由来の欠字は見ない。 | PASS |
| b25-tunnel | 解消 | 周囲の白/金反復とレールはbeforeと同じ周縁位置・入れ子構図。主字は中央void内の左列「風→の」、右列「先→へ」。3時刻とも反復は主字を横切らず4字を判読できる。左列内上→下、次に右列内上→下で指定語順。周囲反復による奥行きを保持。90で内側反復が暗くなるのもbeforeと同様。円は列間の空間に収まる。 | PASS |
| b25-elastic | 解消 | 全4字が単一の右下がり斜軸上に並び、両端の線/金色アンカーも同じ軸に付随。2行分離なし。左下への移動・縮小後も3時刻で欠けず読め、円より左下へ離れている。 | PASS |
| b25-kanjiFocus | 解消 | 巨大輪郭「風」の内側中央に小さな全文が重なり、金色の最初の字・点・下線も同clusterにある。全体が右へ移り、大離隔なし。輪郭と全文の階層/相対関係を保持し、3時刻とも全文を読める。巨大字下端も画面内で、全clusterが円の右に離れる。 | PASS |
| b25-typeSpecimen | 解消 | 36/90で全6faceとcaption13〜18を原寸確認。「NOTO SERIF CJK JP」改行「REGULAR 400」、「M PLUS ROUNDED 1C」改行「EXTRABOLD 800」で意味単位を維持。400/800の数字内分割なし。残るcaptionは一行で読める。6つの全文も判読可。3は13番だけだがbeforeと同じ登場段階で36/90には6faceが揃う。字画/罫線は円の上下へ離れる。 | PASS |

## 許容差・限界

回避のための移動/縮小/指定reflow、tunnelの指定左列→右列読順、captionの語/数字を壊さない改行、baselineにもある登場段階/ピーク接触/反復暗化を許容。同じ座標・大きさは要求していない。

ガイドのない原画像で、円の中心(.5W,.42H)、半径216pxの位置関係を参照し、主文字と所有図形がそこに乗って見えないことを確認した。最小px余白計測やサブピクセル非交差証明ではない。before全15枚は全体contact sheetによる実視であり、原寸を直接開いたとは主張しない。after15枚は全体表示に加えて原寸cropも実視した。比較用縮小/切り出しは/tmpのみで原本無変更。

静止画3時刻だけの評価で、その間の全アニメーション、連続的な読順認知、他の歌詞/seed/画面比/フォント、人物との実合成は未確認。B25全体/製品全体の完了や、人間の動作確認済みを意味しない。

## 実視した原画像 path / SHA256

共通ディレクトリ: `/workspace/lyricfx.JIZURA/work/avoid007-visual-draft/visual-fix01/`

- `b25-equalizer-before-3.png` — `d0d9e6614b97723e647a5413fb3dc3ce991b2951f893a63104eca5faa94ca6db`
- `b25-equalizer-before-36.png` — `5e65635928040a6950a3fa1ed92a46efc7cd42301ee5f35f0d6ef0bce9ee2f64`
- `b25-equalizer-before-90.png` — `7cfcb40382acfcefaeae1030c0d8560cbd38b6ddbdca40a4fa049e8e8cb3e609`
- `b25-equalizer-after-3.png` — `d9ba7aa9e7718c539ba9827d7a2ce9c5c098ad1aedf84d3c9fe2ae61ce1a51e8`
- `b25-equalizer-after-36.png` — `6f1b2ce275cc75be7d5028b1429b807b520c8971d4505603e35b7ef3e31c9973`
- `b25-equalizer-after-90.png` — `4b3c44b34686460a005bf686891274f746e7c1b18df935513b1b05aab8869238`
- `b25-tunnel-before-3.png` — `693a5091188f340a568a93d95b7327da287a99c6bb8ecd16ba8e871d223e8a0f`
- `b25-tunnel-before-36.png` — `397d4b3163f5f313953b288f6eb3c0516ef73aba8dc89fe15b8e2e8a318884f9`
- `b25-tunnel-before-90.png` — `42e079e7095bd5365caf667292f6ddf3b9d8f32c6e9fe53221a2800bd87fb5cd`
- `b25-tunnel-after-3.png` — `32bcd71303e019f11ae24059783889b5df9253862b7b27cc574ccc6ba4f121b7`
- `b25-tunnel-after-36.png` — `d6c983efcbf6bf7fa8e6dc3fd646b5ca216d4577566c4da55441d309561a981b`
- `b25-tunnel-after-90.png` — `51cc6cdd81f7024b7b9b7417c911fe9efe36a48d5ca999d1dbcb55419221c350`
- `b25-elastic-before-3.png` — `56f4954760702fbbe5dcd557387e2104c6deda7bf824546f0b32062f5244d4f3`
- `b25-elastic-before-36.png` — `a237f4544f0e0e3a89725bee644f564e44c29d2beac366b891fac5aa9d62cfa2`
- `b25-elastic-before-90.png` — `296250808d798aa20a2814d2f23b1ab27e6ea7b861b9f5b9b19c70a886f6a8bf`
- `b25-elastic-after-3.png` — `cb61afce7ff4e001c6e2ec0bcbd91fa4d71a8f5a92463ada9096aba98c4a635f`
- `b25-elastic-after-36.png` — `46c008ed36b1c3da3fb6e67b8b56ea638ee1eb47f6022e7f194a599d68fe2b6c`
- `b25-elastic-after-90.png` — `e46a32a7a292be3c16abb9c933b00f0fe342c2d2332e976425576780d1531938`
- `b25-kanjiFocus-before-3.png` — `31c9ef6ef01466292a3898e2bd57d6f750fbbccce920032211bdd2008cb41e98`
- `b25-kanjiFocus-before-36.png` — `284d17541ae74445103f722861a2ffacc108b86287366cb8cd58fd7ee36b9b21`
- `b25-kanjiFocus-before-90.png` — `54710ce64a22971cbd7d9914273f2393daf51ae30699249ef925cdf0a22c6799`
- `b25-kanjiFocus-after-3.png` — `c994b299df9e14d1b9b3649e18b403e40200b6a6d5e504cd23f0a160461be63a`
- `b25-kanjiFocus-after-36.png` — `47811c2f54a740e9c0993e5430d1ea269f95347a0540126655bf1afd0824ddb4`
- `b25-kanjiFocus-after-90.png` — `f8a9dbe62329d3a8eaa747595377ae05c2c7bedaf0e77899b8355aaf2005df38`
- `b25-typeSpecimen-before-3.png` — `4ea8883841d217a0fa9fc3ab1602ad1206557975fb3b1e9b568c022dfaf48acb`
- `b25-typeSpecimen-before-36.png` — `8c0a2fe988f63bb2c027524d262513c62932ebdee7c5523609737e79c149a072`
- `b25-typeSpecimen-before-90.png` — `b7145ff4407c7acb5d6206c395cc9a089d64addb41bb32bdefa9215e93081db6`
- `b25-typeSpecimen-after-3.png` — `3a71b7c549844151abf0435c8aa6f87bc7966dddf99f8160763ff2e9931db6eb`
- `b25-typeSpecimen-after-36.png` — `729bdcfe9db53f0763aca45be190114b0d4df6d3287e021161f8c686b65ed833`
- `b25-typeSpecimen-after-90.png` — `78dd34cdcbfac881d2e69837da7df48eebc6c9e2033091e2e3fb5f6b40e552bc`

表示用contact sheet/cropのpath、source path、crop box/hash、実視フラグは `visual-repair01-metadata.json` に記録。/tmp派生物は一時ファイルで、再現の正本は原本PNG。製品/工具/既存証拠の編集、Git commitは行っていない。
