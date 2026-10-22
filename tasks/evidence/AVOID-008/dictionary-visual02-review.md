# AVOID-008 dictionary visual02 独立ローカル再視覚レビュー

判定: **両素材の対応PASS、JP/pageとLatin/entryの2fixture限定視覚PASS**。今回の実画像で新規欠字、語間消失による別語化、単語途中分割、重要字の早期crop、番号bulletや板と字の分離は検出しなかった。45ad887全体/全字体/全variant、円数値、安全余白、リアルタイムの動きの承認ではない。親は画像未見。この担当が全frame列と原寸を実見した。親の138件の数値containment成功を視覚成功へ置き換えていない。

## 素材・source・captureの同一性

対象は別worktreeの `tasks/evidence/AVOID-008/editorial/dictionary-preview02/` と `dictionary-wordgap-preview02/`。manifest SHA256はそれぞれ `726441ee41074fd998c183eaaeb3f2606896f4331ad99796ff8fbb169953c870`、`ac22c6dd20481803fdf8d5f44869b484f21327064299c300ebe8f333daa0a00b` で指定値と一致。JP13/Latin14assetsのbytes/hash全件を独立assert。各12inputPinsも一致を確認した。JPのcaptureスクリプトは現在の同名ファイルではなく、pin `4cde68aa4dfb36c1b40062be951098c7b69b3eabf4b8e6eed083dc256c8b3752` と一致するbundle内capture-runner.cjsの**post-run archive**で照合。Latin runner pin `f595670e…` は現在ファイルとarchiveが一致。post-run archiveを実行当時の外部監査証明とは扱わない。両changedInputsは空。

両beforeはimmutable matrix04 compiled `db371e02b0365e6368b1e4cfe7973f4f438ee7cdc35f929d0a244530a86f0bc5`。afterは `484617d1ce4566c8230e355d9f33eb196b6eee98f9669f15b859a7956290da9f`。元生成スクリプトが参照するdictionary09/index.html.gzとdictionary10/index.html.gzの展開bytes、dictionary10/results.jsonのJA pinを独立照合して一致。source commit45ad887とdictionary10のsrc pinsは09gだけ既知の未commit検証copy差（commit f84a8052…、pin34f43d6c…）、他記載src一致。生成compiledが45ad887内checked-in index.htmlと同じ、又は45ad887単独で全source一致とは主張しない。

各fixture内のbefore/after sourcePlanをdeep equal確認。960×540/fps24/duration4/seed704、actualCut=renderPlan.cuts[0]、text/noteと実spec一致を独立assert。JPはpage/mincho『風の先へ』/note『遠い空の向こうへ』、Latinはentry/mincho『Hold on to the light』/note空。両方中央(.5,.42)、短辺r=.2。caption/条件/side/frameリンクとrunnerをローカルファイルとして実読し、native描画と同じframeからhalf-resolution PNGを作りffmpegへ送る構成を確認。UI録画・PNG再生録画ではない。

4MP4を独立ffprobe: H264/yuv420p、480×270、24fps、96decoded frames、4.000000秒、video1stream/audioなし。各log96件のframe0–95/時刻n/24一致をassert。各native6PNGは960×540で、縮小とMP4 decoded対応frameの構図/copy/段階を実見し補間/圧縮差を補助測定した。encoder-input PNGそのものの独立再生成は未実施。

JP before MP4のSHA256 `9eb520d4d06982cd2300611adc8d11744ccf24ed79b9b81dcfe6070321f6fd1b` は旧dictionary-preview01/before.mp4と直接bytes完全一致。旧beforeの実見をcarryできるが、今回も新afterと全frame対比した。新afterの実見はcarryせず新規に実施。Latinはbefore/afterとも今回新規実見。旧294 JP限定視覚PASS、旧wordgap01 fixture assertion FAIL、旧証拠は編集・上書きしていない。

## 方法・semantic照合

ローカルdecodeのみで4MP4全frameを抽出し、各fixture12frameずつ8枚、計16枚の前後対比sheet（384画像）を全実見。原寸キーは各fixture×before/after×f6(.250秒)/f36(1.500秒)/f91(3.792秒)、計12枚を全実見。sheetだけで細字をPASSにせず原寸で補った。リアルタイム再生は未実施。

補助としてafter metadataのowner/occurrenceとUnicode rangeを順に結合し、隙間/重複なし、終端total一致、before metadataの同順・同copyへの完全再構築を独立assert。JPは16論理occurrenceが32描画fragment（うちcontext23fragment）へ再構成、Latinは9論理occurrence/10fragment。mainは改行だけを除去し**空白を残して**実cutと比較: JP『風の先へ』、Latin『Hold on to the light』に完全一致。Latin logicalHeadwordはsourceText同文、range[0,20]、順序付きsourceFragments[0,5]/[5,11]/[11,15]/[15,20]。これは全小字の全frame目読の代わりではない。

HANDOFF-CORRECTION.mdを実読し、実letterSpacing/ink/AA余白を含むfield測定への修正と、raw cut内部spaceの意味的再構築を理解した。実fields/proof/rangesは別の測定根拠として扱い、138件全fieldの数学的containmentを本視覚レビューが再証明したとはしない。

## JP mincho/page所見

f6/36/91原寸で上contextは左上、下contextは右欄、見出しは『風の先』『へ』2行。旧afterよりcontextが再wrapされ、見出し/品詞/定義ブロックが下へ移る。原寸f36では上context末尾から見出しまで隙間があり、右欄もtab rail内側に収まって見え、行の字が隣のownerへ食い込む状態は検出しない。上下/左右の読む流れはguide→左上context→見出し/定義→右contextとして保持される。反復copyの各行は同じxを保って下へ続き、新規の大きい字間詰まりや欠字は見えない。元から薄い11pxのcontextであり快適な長文精読まで保証しない。

見出しは元のおよそ.7サイズの明朝で、f0–95に全4字が残る。主見出しとしてcontext/定義より大きい階層を保つ。『へ』単独行は新改行として明示し、欠字とは扱わない。f36の品詞『形動』は見出し二行の右下、囲みplate内に全字あり、定義直上に接続。丸番号1は『遠い空の向こうへ』、2は『00:00.00 ─ 00:04.00 4字』に結びつき、f36/91で全copyを読める。二つの番号やcopyの順序反転・重複はない。

右tabの『風』は白い板に載りrailとの接続を保つ。beforeではstage右端で切れるtabがafterは画面内へ入る。f4–7の出現過程とf92–95の戻りでも字だけ早期に消える異常は検出しない。f8–16付近のhighlightは新しい二行を上行から次行へ進み、f36では各行に接続した矩形となる。f88–95で下行側が先に縮み、上行へ戻るが文字は両行とも残る。新lineCountに元global action formulaを適用するのでper-glyph coverageやpixel同一は要求・主張しない。

## Latin mincho/entry所見

f6/36/91原寸でbeforeは『Hold on to』『the light』2行、afterは **『Hold』『on to』『the』『light』4行**。全5単語の綴りを保持し、『on to』には目で見える空白がある。行間がHold/on/the/lightの境界を明示し、単語内の途中改行や『tothe』結合は検出しない。語間を消した旧不具合の出力『Hold o / n tothe / light』を今回の表示と混同しない。afterの全語は原寸でも主見出しのサイズで読め、f0–95で欠字/crop/重複は見えない。

f36/91で定義1『歌詞 第一行。』、定義2『00:00.00 ─ 00:04.00 16』に続く『chars』が次行へ折り返される。丸番号とその二行本文は同じブロックにまとまり、『chars』の欠落・別定義への混入はない。上guideはbefore同様『H ─ Hold on to the』という短いsource guideで、main末尾lightを消したものではない。頁140とguideの読み順は保つ。

品詞『形動』は主見出しの右下へ移り、白tab/Hの直下に近いが、tabの白板とは別の囲み内で全字が読める。f36では板と品詞枠が接近するものの重なって文字を隠す状態は検出しない。tab/Hとrailは一体。f4–7のslide-inとf92–95のslide-outでも字と板は同時に動く。entry variantでは矩形highlightはbefore/afterとも見えず、pageのhighlight出現をこのfixtureへ要求しない。黄色▼は保持される。

## 共通時計・限界

全frame列でf0はmainあり、f2以降で▼、f4–7でguide/tab、f7–9で品詞、f10–13で定義1、f13–18で定義2が加わる同じ順序を観察。f18–84hold中のowner構成は安定、f94–95で周囲copy等が薄れる。重要字が元より早くcropされる・板から剥がれる確定例はない。確定視覚FAILなし。

この2fixtureの素材/画像範囲だけの判定。円ガイドなしゆえ円数値/余白は未判定、リアルタイム未再生、全字体/variant/長文/二重space例/他比率/4秒外は未承認。非キーframeの最小字を一字ずつ原寸で全検査したとはしない。45ad887や10ID全体の完了判定とは区別する。

AGENTS.mdの恒久禁止に従い公開URL/HTTP/hash/画像/動画/UI/起動確認は行わない。製品/source/tests/元assetsは編集せず、ローカルサーバー/ブラウザを起動しなかった。decode用ffmpeg/ffprobeは終了し、常駐mediaなし。scratchは `scratch/avoid008-dictionary-visual02/`。
