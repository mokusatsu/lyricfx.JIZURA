# AVOID-008 Swiss visual01 独立ローカル視覚レビュー

判定: **素材対応PASS、1fixtureの限定視覚PASS**。幅広いSwiss紙面が左の縦長の帯構図へ大きく変わるが、6×6格子・欄番号・回転folio・見出しとrule・circle accentの関係を保持し、今回の画像で新規欠字/crop/不自然な重なりを検出しなかった。元画面と同じ構図という判定ではない。親は画像未見、本担当が実見した。circle安全数値/全字体/全variant/全ID受入は未承認。

## 固定素材・入力・source

対象 `/workspace/avoid008-editorial/tasks/evidence/AVOID-008/editorial/swiss-preview01/`。manifest SHA256 `9acec46fe34d3934019e1af77333f7e84bd269b49fa0d48af805709216bfc6e1` は指定値と一致。14assets全件bytes/hash、12inputPins全件hashを独立assert。capture-runner.cjsもpin一致、changedInputs空。HTML caption/runner/actual inputs/frame logsを実読した。

実fixtureはswissGrid/variant a/shape circle/mincho、960×540、text『風の先へ』、input.note『遠い空の向こうへ』、中央(.5,.42)/短辺r=.2。sourcePlanはbefore/after deep equal。actualCut=renderPlan.cuts[0]、text/note/spec、stage/fps24/duration4/seed704をassert。実paramsは両側font mincho/chunks=['風の先へ']/variant a/shape circle/label true、cut start0/end4/inDur.35/outDur.4。main corpusはbefore『風の先へ』からafter『風の\n先へ』へ変わり、改行だけ除去すると同copy。metadata corpusの01–06と『JIZURA ／ No.01 ／ 00:00.00』は前後同順・同copy。input.noteは実画像/実corpusに描かれておらず、表示済みとしない。

beforeはimmutable numbered06/index.html.gz展開bytes `93b46f84a7fcd392cdb45cbeb14b054960ce44bfa42f11e8ba7ba3a3e2b229a8`、afterはswiss05/index.html.gz展開bytes `4b8d72dfd0810b6b3522f83e48af383e871e826a2c5804272796603c017ad047`。双方manifestと一致。swiss05/resultsの100input gz snapshotを全件展開・独立hash照合してpinと一致。JAは上記after、ENは `681bf3fe18e656de0ccf8c59c736f6a63e90dc346bedae837b64c7ad1e6266e7`。EN実表示の視覚受入ではない。

read-only Gitでc9e22a8の記載srcとswiss05 pinsを比較。09gのみ既知の未commit検証copy差（Git f84a8052…、pin34f43d6c…）、他記載srcは一致。生成compiledとGit内checked-in index.html/commit単独の全sourceの完全一致は主張しない。HANDOFFは自分で読み、recipe範囲を理解したが、selfの数値成功を視覚成功の代わりにしない。

## captureと実見

同native Canvas frameから960×540 keyと480×270縮小PNGを作りffmpeg PNG pipeへ送るrunnerを確認。全frameのsource/render plan不変assertも実読した。新captureや製品起動は行わない。2MP4を独立ffprobeしてH264/yuv420p、480×270、24fps、96decoded frames、4.000000秒、1video stream/audio無しを確認。両frame logは96連続index/時刻n/24。native6PNGの寸法960×540をassert、縮小とdecoded該当frameの構図/copy/段階を目視対応し補助差分をreceiptへ記録。encoder-input hashの独立再生成は未実施。

既存2MP4の全frame0–95をdecodeし、番号/秒を付けた12frame前後対比sheet8枚（192画像）を全実見。原寸は両side f6(.250秒)/f36(1.500秒)/f91(3.792秒)、計6枚を960×540で全実見。細部PASSをsheetだけに置かない。リアルタイム再生未実施、別fixtureの実見carryなし。

## 視覚所見

**格子と狭紙面:** f36原寸のafterは縦線7本/横線7本による6cols×6rowsの格子を保持し、線が抜けたcellは検出しない。beforeは横に広い格子、afterは紙面Xが約.32の縦長帯となり、画面左側へ集約され右の空白が大きい。元Yの6等分律動が残り、文字/folio/円は同じ狭い紙面の構成要素に見える。これは見た目の大きい変更であり、横広いポスター感は減るが、gridを基準にした組版の意図は読み取れる。縦線は密になるが番号/主文字を覆って消す濃さではない。

**見出し・heading rule:** before一行の『風の先へ』がafterは上『風の』、下『先へ』の二行。原寸f6/36/91で全4字を読め、上下行の読順は明確。字は元の約.7サイズで依然metadataより大きく、主見出しとしての階層を保つ。紙面幅と同じ比率まで字を横潰しした見え方ではなく、明朝の縦横比・strokeの形を維持する。glyph非等方stretchの数学的証明とは区別する。

f36の太いheading ruleはafterも一行目の上に左揃えで付く。beforeと同じY位置という意味ではなく、二行の新しいfieldに対するruleとして位置・長さが変わる。ruleが見出し中央を横切る/別ownerへ離れる異常はない。gridの細い横線が文字背後を通るのはbeforeにもある構造。

**欄番号/folio:** f36原寸で01–06が格子上部の各colへ同順に並び、afterも6番号すべて読める。文字は細い小字のままで、番号同士の重なりはない。左縁の回転folioは『JIZURA / No.01 / 00:00.00』として紙面に沿い、stage端で新規に切れない。f6はまだ出現途中でfolioが無い/薄い状態、f36/f91で存在するという前後の段階が対応する。

**circle accent:** beforeは幅広gridの右下、afterは狭いgridの下方free moduleへ移る。f36では黄色circleの直径が元より約1割小さくなるが、楕円に潰れず円として見える。二行目『先へ』とcircleの間に空きがあり、新たに文字へ重なる/主文字を隠す状態はない。下のcircleがgridと無関係な背景へ置き去りになる状態もなく、下部のアクセントとして読める。画像に安全円ガイドは無く、このcircle accentをavoidance circleと混同しない。

**時計・entry/hold/exit:** 全frame列でf0–3はmainが先行、f4–6でgrid/heading rule/番号が左上から伸び、f7(.292秒)でcircleが小さく現れる。f8–14でcircleが拡大し、f18–84では完成格子/metadata/見出し/円の関係が安定。前後とも出現順は同じ。元の円の弾む拡大と格子の順次revealがafterでも残り、狭紙面だけ別の早い時刻に完成/退場する明瞭な差は検出しない。

f91はgridの一部が既に縮み始めた状態であり、完成14線の欠落と誤判定しない。f92–95で格子/heading ruleが短くなりcircleも縮むが、前後同時期に進行し、主4字は両側ともf95まで残る。afterの重要glyph早期crop、文字と紙面の一体感を壊す別方向移動は検出しない。f36を全線数の判定、f6/f91を出現/exit対応の判定へ用いた。

## 限界・終了状態

確定media対応FAILなし、確定描画FAILなし。circle安全/余白数値、実時間の滑らかさ、variant b、別accent shape、他字体/比率/長文/意味あるword space、全ID、4秒外の完結は未承認。原寸小字はf6/36/91の検査で、非キー全frameの小字一字ずつの原寸検査はしていない。

公開URL/HTTP/hash/画像/動画/UI/起動等の公開結果確認はAGENTS.mdにより恒久禁止・未実施。製品/tests/source/Git mutation/再captureなし。サーバー/ブラウザを起動せず、ffmpeg/ffprobe終了、常駐media無し。disk節約のため、実見後に本担当のdecode PNG列192ファイル/7,140,965bytesだけを削除。元MP4/原寸keys/既存証拠は変更せず、8sheet/receipt/補助scriptはmain `scratch/avoid008-swiss-visual01/` に保持した。
