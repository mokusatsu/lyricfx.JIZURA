# AVOID-008 numbered visual01 独立ローカル視覚レビュー

判定: **素材対応PASS、2fixtureの限定視覚PASS**。colsの2列と番号/歌詞の接続、behindの大番号と前面歌詞の重なりを確認し、検査範囲で新規欠字・番号欠落・重要字の早期crop・読順反転を検出しなかった。安全数値/全ID受入は判定しない。親は画像未見、この担当が実見した。

## 同一性とbaselineの意味

対象は別worktreeの `editorial/numbered-cols-preview02/` と `numbered-behind-preview01/`。manifest SHA256は `1e55785d01d8e4f2c7b91a5f8d78a34bfe94a3e1267277b48453b34bb5efd2ab`、`46e995bbed2bef9c73f5fb7052f4d190f7cb8185db46a7cd8c223bf1940713a3` で指定値と一致。全28assetsのbytes/hash、各12inputPinsを独立assert。保存capture-runnerもpin一致。changedInputsは両側空。

各fixtureでbefore/after sourcePlanがdeep equal、actualCut=renderPlan.cuts[0]、text/note/specが一致。stage960×540/fps24/duration4/seed704、cut start0/end4/inDur.35/outDur.4。実paramsは両側mincho/main+mincho/numFont、chunks=['風の','先へ']、num='outline'、label='SCENE'。variantだけ各cols/behind。実全文『風の先へ』、入力note『遠い空の向こうへ』を確認したが、noteはどちらの画像/corpusにも表示されず、実描画と主張しない。cols corpusはmain『風の』『先へ』とSCENE/01/SCENE/02、behindは同mainと01/02で、前後の順序とcopyが完全一致。

beforeはimmutable dictionary10/index.html.gz展開bytes `484617d1ce4566c8230e355d9f33eb196b6eee98f9669f15b859a7956290da9f`。afterはnumbered06/index.html.gz展開bytes `93b46f84a7fcd392cdb45cbeb14b054960ce44bfa42f11e8ba7ba3a3e2b229a8`。両manifestと一致。numbered06/results.jsonの100input gz snapshotを全展開してpinと独立hash照合し全一致、JAは上記after、ENは `1893e733c35563c484b56cc0ae686aad8e025d722700c8cc61f04a1fde7b4eb4`。これはENの実表示承認ではない。

固定Git54b10d8の記載全srcをnumbered06 pinと照合し、09gだけ既知の未commit検証copy差（Git f84a8052…、pin34f43d6c…）、他記載src一致。生成compiledがGit内checked-in index.htmlや54b10d8単独のsource全部と完全一致とは主張しない。

Baseline2bb3f86との関係もread-only Gitから確認した。before compiledは2bbのbytesそのものではなくdictionary10である。2bbのnumbered登録ブロックとdictionary10 snapshotを差分実読すると、旧editorialMotionの観測注記、numberMeasure/所有zoneなどのgated hooksが加わっておりsource文字列全体は同一でない。今回before cutはplacementLayoutsC無し/layoutCRecipe無しで、editorialMeasure=1、元のcols/behind寸法式・mask・番号のrise式・main mi=i*3が使われる。2bbからの元演出の系譜は確認したが、2bb compiledを別途起動してpixel同一性を再測定したとはしない。

## キャプチャ・実見範囲

manifest/actual plans/frame logs/runner/HTML captionを自分で読んだ。numbered06/HANDOFFのself結果だけを信頼せず、同renderからnative keyと0.5 Canvasを取り、96encoder-input PNGをffmpegへ送る処理、全frameのsource/render plan不変assertを確認した。UI録画や画像再生録画ではない。

4MP4を独立ffprobe: H264/yuv420p、480×270、24fps、96decoded frames、4.000000秒、video1stream/audioなし。4log各96件のindex0–95/時刻n/24一致をassert。native keyは各side f6(.250秒)/f36(1.500秒)/f91(3.792秒)、960×540。native縮小とdecoded同frameを補助比較し、構図/copy/出現段階を目視対応した。lossy encode/補間差はある。encoder入力PNG hashの独立再生成は行っていない。

ローカルffmpegで全4動画をdecodeし、frame/秒付き12frame前後対比sheetを各8枚、計16枚（384画像）全実見。全原寸key12PNGも実見した。前の別fixtureから実見をcarryしない。リアルタイム再生は未実施で、滑らかさ/体感速度の承認ではない。

## cols: 2列と番号/歌詞の接続

f36原寸でbeforeもafterも左01/『風の』、右02/『先へ』の2列。読順は左から右、SCENE label→outline番号→下罫線→歌詞の縦の関係を維持。afterは中央gutterを広げ、左列が少し左、右列が右へ移る。中央の区切り線も右列の左へ移る。列を上下へ積み替えたり、番号だけ別列へ送る状態はない。

afterの番号はbeforeより明瞭に小さく、罫線も短くなる一方、歌詞は原寸でほぼ元の大きさを維持する。番号の主張が弱まり歌詞が相対的に強くなる演出差はあるが、各『01』『02』はf36とf91で全体を読め、歌詞の主役性/対応を壊す変質とは判定しない。新規のSCENE/番号/歌詞間の重なりやstage端cropは検出しない。

f0–3は『風の』のみ先行、f2–5で01がmask内を上昇、f4(.167秒)で『先へ』と02初期strokeが加わる。f6(.250秒)の02下部がmask境界で切れた外形は両sideにあり、元のrise演出の途中状態である。afterだけ番号の完成を失った例ではない。f8–12で番号の全体と伸びる罫線が現れ、f18–84holdでは安定。f91(3.792秒)はまだ番号全体が読め、f92–95で両番号が下がりmaskへ隠れる。afterが元より早い時刻に番号/歌詞を退場させる明瞭な回帰は検出しない。歌詞4字は末尾f95まで残る。

## behind: 大番号と前面歌詞

f36原寸でbeforeの大きな薄いoutline01/02の前に、白い『風の』『先へ』が載る。afterはこの2段の斜め配置と相対的な重なりを維持したまま全体がおよそ246stage px左へ移る。01は上左の『風の』、02は下右の『先へ』に対応し、番号の入れ替えや歌詞の重複はない。薄い大番号は元から歌詞のstrokeと交差するが、白前面と暗め輪郭の階層は保たれ、歌詞は可読である。

after左端の01は近いが、原寸f6/36/91で外周strokeはstage内に収まり、新規の左cropは検出しない。02の下stroke/横strokeもhold f36と後半f91で保持。番号だけが歌詞から剥がれたり、大番号を小さい独立ラベルへ変えてしまう差はない。

f2–6で大番号はそれぞれ元maskを通って下から上昇し、01が先、02が後という順序を前後で維持。f6の02はまだ下に伸びる出現途中、f18–84は定位置、f91では番号は下がり始めるが両方が読める。f92–95でmaskに隠れる進行も同時期。歌詞は番号の動きに引きずられず前面で保持され、元の二重レイヤーの意図が残る。新規の歌詞早期cropは検出しない。

## 限界と判定区分

確定media対応FAILなし、確定描画FAILなし。ただし意味あるLatin等のword spaceはこのJP短文の2fixtureに含まれず、space保持の一般成功を主張しない。実params/corpus内のlabel等の順序一致と、画像での番号関係だけを確認した。rows/3列/長文/別字体/全variant、circle数値/余白、4秒外の完全exit、リアルタイムの心地よさは未判定。安全/opacity/parity等の数値結果は別経路として扱い視覚成功へ代用しない。

AGENTS.mdの公開結果確認恒久禁止に従い、公開URL/HTTP/hash/画像/動画/UI/起動等の確認なし。製品/source/dev/modules/tests/Git mutationなし。ローカルサーバー/ブラウザを起動せず、decode用ffmpeg/ffprobeは全終了、常駐mediaなし。派生物はmain `scratch/avoid008-numbered-visual01/`、正本出力はこのレビューとmetadataのみ。
