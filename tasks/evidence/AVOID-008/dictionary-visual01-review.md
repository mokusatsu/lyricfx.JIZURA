# AVOID-008 dictionary visual01 独立ローカル視覚レビュー

判定: **素材対応PASS、限定視覚PASS**。1例のmincho/page・通常中央円の辞書構成について、見出し/本文/品詞/番号bullet/ハイライト/tab/周囲copyの表示と関係を確認し、新規の欠字・重複・読順反転・重要字の早期cropを検出しなかった。円の数値的安全、リアルタイムの動き、全字体/全variantは承認しない。親は画像未見、この担当が実見した。実装担当の数値成功を視覚判定の代わりにしていない。

## 対象・同一性

別worktree `/workspace/avoid008-editorial/tasks/evidence/AVOID-008/editorial/dictionary-preview01/`。manifest SHA256 `e35dbd8e57430fd8560d1cea4011d9a955772dcafe0c523404f4751752b14b31` は指定値と一致。13記載assetsのbytes/hash、12inputPinsのhash全件を独立確認。changedInputsは空。actualFixtureSpecはdictionary/page/mincho、960×540、text『風の先へ』、note『遠い空の向こうへ』、中心(.5,.42)、短辺r=.2。before/after sourcePlanをdeep equal確認し、W/H/fps24/duration4/seed704、actualCut=renderPlan.cuts[0]とtext/note一致をassertした。字体・実copy・元時計の共通入力を持ち、afterの組み替えを同じレイアウトと偽っていない。

beforeはimmutable matrix04-index.html.gz展開bytesの `db371e02b0365e6368b1e4cfe7973f4f438ee7cdc35f929d0a244530a86f0bc5`。今回のbeforeは初期7cd5a5b compiledではなく辞書変更前のmatrix04である。afterはmatrix05-index.html.gz展開bytesの `5b7ed4e11be1187b857e88f1ee707aaabd0c91b039537230678a84cd369396ac`。両方manifestと一致し、afterはdictionary07/results.jsonのJA compiled pinとも一致。source checkpoint2943460とresultsの全src pinsを照合すると09gだけ既知の未commit検証copy差（commit f84a8052…、results34f43d6c…）、他srcは一致。2943460単独や同commitのchecked-in index.htmlと実after compiledが完全一致とは主張しない。

dictionary07/HANDOFF.md/results.jsonを読み、再構成のsemantic owner、native point floor、source clockとhighlight line-count変更、測定範囲を理解した。独立補助照合としてafter corpusの各owner/occurrenceを記載順に結合し、rangeに隙間・重複がないこと、終端total一致、16論理metadata occurrenceすべてがbefore metadataと同順・同copyであることをassert。上3/下4のcontext338文字は22fragmentになり完全再構築する。mainはafter『風の先\nへ』から改行を除きbefore『風の先へ』に一致。ただしこの機械照合は画像内の全小字を全frameで一字ずつ読む代わりではない。

## 実見とキャプチャ対応

既存before/after MP4をffprobeで独立確認: H264/yuv420p、480×270、24fps、96decoded frames、4.000000秒、1video stream/audioなし。frame logは両側96連続index/時刻n/24。生成スクリプトを実読し、同renderのnative Canvas960×540を0.5へ縮小してffmpeg PNG pipeへ送る方式を確認。UI録画・画像再生録画ではない。

既存2MP4の全frame0–95をffmpeg抽出し、左before/右after・秒/frame番号付きの12frame対比sheet8枚（192画像）を全実見。細部は原寸PNG各side f6(.250秒)/f36(1.500秒)/f91(3.792秒)、計6枚を960×540で全実見した。原寸を縮小したものとMP4該当decoded frameは構図・copy・段階が対応、補間/圧縮差のRGB平均絶対差最大3.043/255。実encoder入力PNGそのものは保存されていないため、そのhashの独立再生成はしていない。captionはローカルHTMLのファイルを読み、条件/side/frame/原寸リンクを確認した。

リアルタイム再生は未実施。全frameの段階・時計対比であり、体感速度や滑らかさの判定ではない。sheetの小字だけで可読性をPASSにせず、原寸で補った。今回の素材は全て新規実見であり、過去の別caseや別bytesから実見をcarryしていない。

## 具体的な視覚所見

- **頁とcontext**: f6の頁140と右上『風 ─ 風の先へ』、上罫線を両側で確認。before上3行/下4行のcontextはafter左上7fragment行/右側15fragment行へ移る。f36原寸で左上→見出し/品詞/定義→右欄というまとまりを読み取れ、同じ行中の文字が交互に別領域へ飛ぶ状態はない。右欄末尾『の』を含む断片は孤立した最終行になるが、前行からの続きとして同じx位置で下へ連続する。小字は元から暗い11pxで、afterも同程度。コントラストは高くないため長いcontext全体の快適な精読まで保証しない。
- **見出し**: before『風の先へ』一行からafter『風の先』『へ』二行へ変更。原寸f6/36/91で全4字を読める。文字高は元のおよそ70%で明確に小さくなるが、依然context/定義より十分大きく、明朝の形と主見出しの階層を維持する。最終1字『へ』の単独行は改行の見え方として記録し、消失や順序交換とは扱わない。f0–95を通じ主要glyphが先にcropされる場面は検出しない。
- **entry mark/品詞/定義**: 黄色▼は見出し左上に接続。『形動』はafterで二行見出しの下方右へ移り、f36の囲みplate内に両字が収まる。見出しからやや離れるが、同じ定義ブロック上端にあり、別語の品詞に見える接続崩れは検出しない。白丸番号1/2と各本文はafterも直結し、順に『遠い空の向こうへ』『00:00.00 ─ 00:04.00 4字』。原寸f36/91で読める。今回はnoteが定義本文として実描画されており、前のfootnote素材の非表示input.noteとは区別する。
- **tab/板との関係**: 右の縦railと白いtab/『風』をf6/36/91で確認。beforeのtabは右stage端にかかるが、afterはrailとともに画面内へ入り、白板内のglyphが保持される。板だけ離れる/字だけ残る異常は検出しない。f4–7でtabが横移動しながら現れる段階も前後で同じ順序に見える。ページは暗背景の書式で、大きい紙板の上へ独立文字が載る演出ではない。
- **highlight**: f6は線状の初期状態、f8–12付近でbeforeは一行を左から伸び、afterは先に上行『風の先』へ伸びる。f13–16でafterは次行『へ』の下にも広がり、f36で両行の字に接続した矩形として見える。元global he時計と新lineCountのformulaを適用するため、全時刻のper-glyph coverageやpixel同一ではない。二行の読む順を逆転する動きや本文上の無関係な矩形は検出しない。f88–95の戻りではafterの『へ』側highlightが先に消え、上行が残って縮むが、文字自体は両行とも保たれる。意味の対象からhighlightが剥がれたとは判定しない。
- **entry/hold/exit**: f0は見出しあり、f2–7でmark/guide/context/tab、f6–9でPOSが現れ、f10以降で第一定義、f13以降で第二定義が増す。前後でこの順序は同じ。holdのf18–84は構成が維持され、末尾f94–95のcontext等の薄れも同時期。新しいduplicate字、急な読順入替、plateと字の別離、重要字の早期欠落は検出しない。4秒を超える完全なexitまでは素材がない。

## 範囲外・保持事項

円ガイドがないため画像だけで円安全や余白の数値を承認しない。HANDOFF/resultsのsafe/raster値は独立した数値経路として扱い、本視覚PASSの根拠へ置き換えない。mincho/page/このcopy/この横長比率の1例だけであり、全字体/entry variant/長文/他比率/production全familyの承認ではない。原寸細部はf6/36/91に限定、他frameの最小字の1字ずつの完全検査は未実施。リアルタイム再生と4秒外は未判定。

親の別経路コードレビューでは294に、context幅測定への実ctx letterSpacing.fs*.04の未算入によるfield包含保証不足と、Latin softbreakの語間消失可能性が報告された。本JP/mincho素材の実見で欠損を検出しなかった限定PASSは、これらのコード問題の否定や294全体の受入ではない。修正版の画像bytesが変わる場合は別素材として扱う。本担当は修正実装・再描画を行っていない。

AGENTS.mdに従い公開URL/公開HTTP/hash/画像/動画/UI/起動結果は一切確認していない。製品/source/testsと既存証拠は編集しない。補助scratchは `scratch/avoid008-dictionary-visual01/`。この担当はローカルサーバー/ブラウザを起動せず、ffmpeg/ffprobeは終了、常駐mediaプロセスなし。
