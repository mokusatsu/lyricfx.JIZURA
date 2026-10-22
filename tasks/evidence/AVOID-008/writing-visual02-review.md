# AVOID-008 writing-preview03 独立再レビュー

2026-10-22 / `/root/avoid008_badge_visual03` / gpt-6.1-sol medium。結論: **便箋は旧crop解消、別の罫線/本文overlapによりFAIL。はがきは不成立診断を保ってnativeを表示しており回避成功には数えない。** 旧02FAILは保持する。

## 固定と独立照合

対象 `/workspace/avoid008-objects/tasks/evidence/AVOID-008/objects/writing-preview03/` のみ。manifest SHA `c83c33c3d932ea4ebbb20941c604e6c30b9d9962516237a2631f3a58e3a48e14` が依頼pinに一致。比較HTML SHA `240252fcc212a523676ae1304e3dd5dcb434e1fcac87c7b3a32b3cdf61e526da`。全16media assetの実bytes/SHA一致。before/after engine gzipを展開し、beforeはread-only git show `7cd5a5b:index.html` のbytesと完全一致、正式baselineは `7cd5a5b36eb637967bc78626d9b6eaea89e162ed`。before SHA `17e35475df196fc87a931802a21683a1d4c7b0cafcbba88feb2e50c9ba708456`、after SHA `9da74909617ae7b1399ca4a1e71150b489d66746058c5635333951b73909115e` がstartupに一致、afterは現地index.htmlとも同一。

capture script、B fixture、source09i、font manifestの実SHAがstartup pinに一致。09iは `03bde879e2fda7aee3ba290f06f7293fa8d699b61ea06453186bd46a0746b3e5`。11p実SHAはmetadataへ保存した。9font実体すべてmanifest pin一致、前後fontAudit同一・全9faces loaded。gothic_med→sans-regular等の固定transport字体であり全production字体保証ではない。

実spec: postcard 1260×540、r=.1、letterPaper 540×960、default(cx=.5,cy=.42),r=.2。ともにseed704/「風の先へ」/font gothic_med。実paramsも前後一致（postcard zip0756816,val85,wave; letter yoko,accent,sign true）。scriptは前後別pageで同じfixtureからnative planを作り、afterだけC finalize、両側とも96枚をnative Canvasのt=i/24で新規renderする経路。fixtureのfont hash/load/ready待ちも確認。元媒体の再captureは実行していない。

4MP4を自分でffprobeし指定寸法、24fps、96frames、4秒確認。各frameHashesのindex/timeがi/24で一致し、after観測clock誤差最大4.45e-16秒未満。before observationsは空なので実測observationによる同時計の主張はしない。原寸key全12枚のhashはnative logと一致。

## 実画像receipt

4MP4をローカルffmpegでdecodeし、前後同縮尺・全stageを12時刻ずつ置いた16contact sheetsをすべてview_imageで実見。両fixture各side f0–95、総384コマ。さらに同梱原寸key f6/.250秒、f42/1.750秒、f90/3.750秒を前後×2fixtureの12枚実見。便箋f42 afterは4倍補助cropで罫線/文字を再照合した。画像判断は旧02から流用せず03を見たもの。派生物は `scratch/avoid008-writing-visual02/` 以下だけ。全sheetとmetadataを保持する。

## 便箋: cropは解消、罫線/本文関係はFAIL

after compositionは紙objectScale=.35、letterWritingScale=.7、offset ≈[0,-328.851]。旧02でf3から紙上端が消えたのに対し、03はf1–95で紙の全端と上部二重罫線が見える。原寸f6/42/90でも上端の余白と二重罫線が残り、旧stage cropは解消。f42の上端余白は小さいが、紙を画面外に捨てていない。

しかし、**濃い横罫線が本文glyphを横切る新overlap** がある。原寸f6/42/90 afterで「風の」の上部を濃い横線が横断し、「先へ」の下部も別の濃い横線が横断する。beforeは本文1行が濃い罫線の間に収まる。4倍補助 `letter42-after-4x.png` でも上行の「風」の内部/「の」の上部、下行の「先」の下部/「へ」の右下へ濃い線が交差する。元からの非常に薄い折り線も別途あるが、今回の濃い罫線交差とは区別できる。

文字は全glyphが読め、本文「風の／先へ」の上→下読順と意味も残る。署名「— No.01」は原寸で読め、紙の内側に残る。本文や署名が紙から剥がれて動く/主字が紙外に出る/新glyphcropは見ない。だが罫線に沿って書く便箋としての関係が崩れており、紙がfitし文字が読めるだけでPASSにできない。代表f42に限らず、出現中ほぼ同じ関係で保持される。

動きはf1–10の上方スライド、hold、f87–95の僅かな下降とfadeが認識でき、afterだけ早く文字/No.01が消える兆候は見ない。大判紙が小さな上部メモへ変わり、余白の印象と字の紙占有率は大幅に変わる。本文2行化自体は読順を壊さないが罫線交差が阻害的。

このfixtureはportrait/yokoで、nativeはuf=1/fold=0、紙が上へ滑る条件。landscapeの三つ折り露出clipは動作していない。初出f1でも前後の本文glyphは全て見え、nativeからのfold隠れとの混同はない。全fold variantの露出安全性は未確認。

## はがき: native像の保持と回避不成立を分離

manifest after safetyは `insufficient-space`、segment composition=null、from=[0,0]。objectScale .35案は `C_OBJECT_PRINT_RELATION` により「Real copy intersects full-clock postmark circles/bars/cancellation waves」としてrejected。旧02のPOST CARD干渉像を採用した成功映像ではない。

全frame実画像でbefore/afterの紙寸法、登場の横移動/傾き戻し、本文と注記の出現時刻、hold、末尾fade/移動が同じnativeの外観を持つ。原寸f42/90もPOST CARDは上部中央、zip075-6816の全boxは右上、切手85と消印円/波線は左上で、旧02afterのPOST CARDと消印の新overlapはない。主字・注記がownerから剥がれることもない。元から消印が切手に重なる関係と、登場/末尾のnative cropは両側で維持される。

native frame SHAは96中94一致、f2/f5は不一致。見た画像では位置/形/文字関係の差を識別しないが、全96frameのbyte/pixel完全一致とは主張しない。元PNG全frameの実体はkey以外bundleにないので、残る差異原因を断定しない。

**native表示の保持は視覚的に確認できるが、安全回避の成立ではない。** 円ガイドの位置にはnative紙が重なり、r=.1でも不成立。r=.2成功へ数えない。

HTMLの冒頭は「旧02は紙の欠けと見出し干渉で未受入」「この03は修正版で再撮影」「不足の場合は元の演出を保持」「視覚レビューは未実施」と正直に限定し、明示的な全件成功表現はない。ただしケース見出し/after captionは単なる`after`で、**postcardが今回insufficient-spaceでnative保持であることをケース別には明記していない**。manifestを開かずに動画だけ見る人には成否が分かりにくいcaption不足として記録する。ケース別に「回避不成立・native保持、成功映像ではない」と出すことが望ましい。HTMLをこちらで修正していない。

## 制限・一時媒体cleanup・終了

24fps画像は全連続時刻の安全証明ではない。2fixture/固定transport字体/短文のみ。元production字体、他seed、長文、landscape fold等は未保証。便箋の数値certified表示を画像PASSへ置換しない。旧02FAILはそのまま。

親の許可に従い、自作の再生成可能なnumeric decode PNG列だけ旧scratchから削除した。badge-visual03は192files/42,907,421bytes、writing-visual01は384files/33,112,873bytes、計576files/76,020,294bytes。各旧metadataへ追記済。元MP4・原寸key PNG・source・receipt/report・contact sheets・補助cropは全て保持。第三者scratchは触っていない。今回writing-visual02の自作decode列も実見と全process終了後に384files/36,519,937bytesを削除し、metadataへ追記。今回の総削除は960files/112,540,231bytes。

全ffmpeg/ffprobeは終了済み。サーバー/ブラウザー未起動。製品/tests/Git mutationなし。公開結果確認は恒久停止指示により中止・対象外、成功扱いなし。画像は親へ返さずreport/metadataのみ保存。
