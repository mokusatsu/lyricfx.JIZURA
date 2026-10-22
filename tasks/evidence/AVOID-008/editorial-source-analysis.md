# AVOID-008 editorial 10ID: source-only implementation notes

解析基準: `2bb3f86:src/11p_layoutsC.js`（以下 C:L、行はこの版）。共通 pipeline は同版 `src/06_layouts.js:11-53`、env clocks は `src/09_render.js:330-348`。AGENTS.md と tasks/implementation-review-policy.md を読んだ。画像閲覧・公開アクセス・公開結果確認・レンダリング試験は行っていない。これは source 分析であり、実装完了、全時間受入、視覚 PASS の証拠ではない。product/tests/既存 docs は変更しない。

## 共通の clock と保証条件

- `T=env.lt`（ghost pass では lag 付き）、`D=cut.inDur`, `S=cut.dur-cut.outDur`, `P=outDur>0?clamp((T-S)/outDur):0`, `O=1-inCubic(P)`。`tin(d,l,E)=E(clamp((T-d)/max(.01,l)))` (C:21-22)。下表の時刻は main の cut-local time。ghost の支持域はその lag を別に戻す。`ltb/pOutU` helper は定義されるが対象10 renderでは使用しない。外部 camera/transport/enter/exit/treatment は別途合成する。
- mainDraw の item delay は `(mi|0)*(cut.stagger||0)`。entry progress は `clamp((T-delay)/max(.01,D))`、hold amount は `clamp((T-delay-.85D)/.25)*(1-P)`。通常の主歌詞が source-rest へ到達する必要条件は `T>=delay+max(.01,D)`、hold ramp の完了も必要なら `T>=delay+.85D+.25`。`en.pieces` は pIn=1 後も apply を呼ぶので、選択 enter の実関数に定常性保証がなければこの必要条件だけで static を断定しない。exit start 後は別 envelope。
- mainDraw の `noHold` が無い ID は cut.hold 次第で persistent motion。magazine/newspaper の `noHold=plateHold(env)` は **still/jitter/breathe/glitchtick は false、それ以外 true** (C:56)。従って plate付きでも jitter/breathe/glitchtick を静止扱いできない。`breathe` は size/track の正弦、glitchtick は step 分岐によるbands（05_anim:218-239）。hold 未分類は安全判定を拒否し、選択関数の連続/step envelopeを要する。
- fixed stage W/H と native topologyを保つ。全IDで候補の第1段は **mainとownedのnative一体平行移動**。以後の再組版は下表のsource recipeで行う。全viewport縮小やenv.W/H差替えでのport分岐変更は候補ではない。manual/OFF/lock/explicit size/emphasisを保持。段階sizeは nativeの.7以上、主文字は `max(18,.035U)` 等の実可読下限、元の字体/段差/物体比を保つ。explicit sizeでは縮小候補を出さない。
- 全描画の実ink・stroke/shadow・回転/scale・treatment supportを囲み、hold primary が margin 込み円外、nativeから新たなstage clippingを生まないことを要する。入退場の一時円通過は許容するが、新しい字切れを許す根拠ではない。返却bbは多くがmainのみ（newspaperもspin中は正しい全支持域ではない）であり、そのままowned envelopeに使えない。
- `bodyRows` (C:251-268) は srcをseed offsetで循環し実文字を描く。`fastRow` のfillText経路も回収必須。`vbody` (C:270-286) も実文字（Latin除外）を描く。対して `greek` (C:288-307) はsetLineDash/pathのみ、`halftone` (C:309-337) はdots/pathのみ。文字が薄い/小さいというだけで独立背景・補助へ除外しない。

## 出現対応と ownership

「copy」は主歌詞以外でも意味のある実文字。「metadata」も owned 全体に含める。下記に independent background と断定できるものは無い。文字のない装飾も同じpage/grid/posterの構成へ結び付くので、移動候補では既定で一体とする。

| ID / source | 主歌詞の出現対応 | main以外の分類・owned topology |
|---|---|---|
| magazine C:419-579 | drawAのplate/headline:fitBlockの改行のみ、verticalは非Latinのみstrip+縦組。mainDrawは1ブロック (520/532/550付近)。 | A/B紙、gutter、影、Bの図版・実bodyRows、plate引用deckCopy、Aのvbodyは全て見開きowned。plateの先頭大字は実歌詞の再出現。headline deckは note→異なるlineText→romaji→metaLine。folio+kickerはmetadata、folio横romajiも実reading。Bのblank裏紙も折りのowned。 |
| headlineDeck C:584-663 | fitBlock 1ブロック（改行、lead1.02、track-.01）。 | kickerの板+文字、underline/dot、rule/double、deck各行、末尾time/romajiを一体。deckCopyがある時は本物copy、無い時のmetaLineはmetadata。`slice(0,4)`/末尾22文字は元からの省略。 |
| contents C:668-779 | splitK: n<=4:1, <=9:2, <=14:3, else4。chunks各1 main、mi=3i。rowsとtateで同じchunk順。 | title「目次」/CONTENTS、章context「序/終」、page number、row番号、leader、active印、上下ruleが目次owned。curの変化をowned状態へ含む。 |
| footnote C:784-846 | plan chunks n<=3:1, <=8:2, else3をLatinでは空白、日本語では空で再結合しfitBlock。mainは1ブロック。 | superscriptはglyphPtsのchunk終端に結び付く。脚注は各chunkのflat文字+romaji/time、最終行は異なるlineText先頭24字もあり、本物copy/reading。rule、脚注marker、folio、optional NOTES headerを含む。 |
| proofread C:852-965 | fitBlock main1、glyphPts(it)は静止設計座標。 | glyph依存circle/wave/box/dots、leaderと「ママ/強調/太字/イキ」注釈、tombo、校了stamp+timeは一体。手書きnoteは実注釈、stampはplate+metadata。選択glyph/line runを保存し直す。 |
| numbered C:971-1060 | n<=3はcharUnits先頭3、それ以上splitK(k)。k<=3/n条件のcols、behind、rows各chunk main mi=3i。 | 番号01…は意味のある構造metadata（behindでも除外不可）、STEP/PART/No./SCENE、rule、番号clipは同じ組版owned。behindは主文字と番号の相対重なりが原義。 |
| poster C:1065-1162 | stack/blockはplan.lines splitKを各main(mi=3i)、行別sizeで全幅。tateは非Latinのみ、textから再splitK列、mi=3i。 | block板・dot・header/time/rules・credits3列owned。WORDSはdeckCopy/romaji/main fallbackの実copy（ellipsisあり）。DATE/No./WORDSラベルはmetadata。plate=blockとtateは排他的。 |
| swissGrid C:1167-1230 | chunks k=1/2/3。各placement plでmain mi=3i、variant aは2個目以降size<=first*.6。 | grid、列番号、各chunk上rule、空moduleで選んだshape、rot-90のJIZURA/No./timeは一体。free-moduleテストは主文字のrest boxesであり動的ink保証ではない。 |
| dictionary C:1235-1327 | fitBlock headword main1。 | page variantのcontext bodyRowsは実歌詞copy。guide headerの先頭字/romaji、entry reading、defs[0] note/lineText/romaji又はmetadata、defs[1]時刻/字数。品詞plate・mark・highlighter・tabの先頭字（歌詞再出現）、page guide/edge線全てentry/page owned。 |
| newspaper C:1516-1640 | tate/yokoのfitBlock main1、mi=miAt(spin?.45:.3)、noHold=plateHold。 | 紙+影、masthead板+題字、号/time、rev headline板、tate sub(deckCopy先頭14字)、rule、greek、photoを新聞一体。greekはdash図形で実歌詞ではない（C:288関数根拠）、ただし独立背景扱いにはしない。 |

## source clocks / static hold の必要時刻

以下 `F` はその行のsource独自アニメが全て定常になる最早の十分条件（mainDraw/外部camera等は除く）。static interval は少なくとも `T>=max(F,mainの必要条件)` かつ `T<=S` を満たす必要があり、空区間なら「static holdなし」。長さ固定の代表cutだけで一般化不可。outDur=0ならP=0のまま。

| ID | source独自 clock 全系統と F（variant条件） | 持続/不連続 |
|---|---|---|
| magazine | A alpha tin(0,.28); unfold uf=inOutCubic(clamp((T-.06)/.5)); fold=inOutCubic(P), q=uf*(1-2fold); fade=1-clamp((P-.72)/.28)。fa=tin(.12,.4)、plate pe=inOutCubic(clamp(T/.45))*fade、headline rule tin(.15,.6)。B body reveal=uf、vertical vbody reveal=fa。F=headline .75、vertical .56、plate .56。 | q=0, .002, .3, .8, .98 とnegative -.002のbranch/alphaを含む。source上hold中に継続する独自motionなし。main plateHold例外あり。 |
| headlineDeck | kicker tin(.05,.4); marks tin(.8D,.45)、dot outBack; rule tin(.1,.7); deck_i tin(.6D+.08i,.4)でalphaとy; byline tin(D+.15,.4)。F=max(.8,mark!=none?.8D+.45:0, .6D+.08(last)+.4, dcかつbyが範囲内?D+.55:0)。 | mainのholdは自由。outでdeck yも再変化（a=tin*O）。bylineの条件をfixed geometryで判定。 |
| contents | title tin(0,.4)、rule tin(.05,.6); tate ctx(.05/.1+.1k,.4)、leader_i(.15+.1i,.5); rows ctx同、row alpha(.1+.1i,.5)。F=tate max(.65,.65+.1(k-1),ctx?.5+.1k:0)、rows max(.65,.6+.1(k-1),ctx?.5+.1k:0)。 | cur=min(k-1,floor(clamp(T/max(.3,.92dur))*k))。active行は j*max(.3,.92dur)/k で移る（j=1..k-1）。F後も最後の切替までstate変化があるので全active印のunion、または区間分割必須。 |
| footnote | superscript e=outBack(clamp((T-(.7D+.12+.14i))/.25),2.2)*O; rule tin(.6D,.5); note_i tin(.7D+.2+.12i,.4)でalpha/x; folio/top tin(.2,.4)。F=max(.7D+.37+.14(k-1),.6D+.5,.7D+.6+.12(k-1),.6)。 | outBack overshootはsizeにも適用。notes文字は改行/clipなしで長いlineText/romajiが溢れる。 |
| proofread | out=1-outCubic(clamp(1.15P)); tombo tin(0,.5); t1=.8D+.1、mark e_i=clamp((T-t1-.35i)/.45)、ellipse e*1.6、box/wave e*1.5、dots e*1.6*run.length-j、leader clamp(e*1.4-.4)、note clamp((le-.6)/.4)。F marks=t1+.35(last)+.45。stamp ts=D+.55+marks.length*.25, x=(T-ts)/.18、scale=lerp(1.5,1,outBack(clamp(x),1.4)); F=max(tombo?.5:0,marksF,stamp?ts+.18:0)。 | gl.length<=4でmarksは先頭1個のみ。gl空ならstamp描画前にreturn。stamp rot=p.rot、note rot=-4。所有boundsに初期scale1.5とovershoot/extremaを必要。 |
| numbered | drawNum_i tin(.04+.1i,.55)、y+=((1-e)+inCubic(P))*size*1.1、clip内。cols rule(.1+.08i,.6), label(.1+.1i,.4)。rows rule(.06+.08i,.6)、label(.1,.4)。F cols=max(.59+.1(last),.7+.08(last),.5+.1(last)); rows=max(.59+.1(last),.66+.08(last),.5); behind=.59+.1(last)。 | clip座標もowned変換。主のholdは自由、番号はhold静止。variant=colsでもport又はk>3ならrowsへfallback。 |
| poster | block tin(0,.5,inOutExpo)*(1-inCubic(P)); header(.1,.4), rule(.05,.6); dot outBack(clamp((T-.05)/.45),1.3)*(1-inCubic(P)); credits_i(.2+.08i,.4)。F=max(.65,.76)=.76（dot .5、block .5）。 | tateではp.dotに関わらずfree>thresholdならdot表示、Latinではtate fallback stack。source独自persistentなし。main holdは自由。 |
| swissGrid | vertical grid c*.035+.55 (c<=cols)、horizontal .05+r*.035+.55 (r<=rows); numbers(.2,.4); chunk rule .12+.1i+.5; free shape outBack(clamp((T-.25)/.45),1.2)*(1-inCubic(P)); label(.3,.4)。F=max(.55+.035cols,.6+.035rows,.62+.1(last),free?.7:0,label?.7:0)。 | shapeの候補freeはfixed text size/placement次第。resize/reflow時に再選択し、選択変化を再構築単位のtopologyとして検証。 |
| dictionary | ca=tin(0,.5)*Oをbody alpha/revealに二重使用; page highlighter tin(.6D,.5)*(1-outCubic(clamp(1.15P))); header(.1,.4); furniture(.05,.35); POS tin(.7D,.35,outBack); defs_i tin(.8D+.1+.12i,.4)でx/alpha; tab tin(.15,.5)でplate/glyph x。F=max(.65,.7D+.35,.8D+.62,page?.6D+.5:0)。 | tab edge textはalpha省略（plateのtq閾値に依存）、原本でstage右端にplate+2溢れあり。元のclip仕様と実字可視時刻を保存する。 |
| newspaper | spin: e=clamp(T/.6),q=outCubic(e),rot=(1-q)*720,k=max(.001,q)；slide:dy=(1-outExpo(clamp(T/.45)))*.9H。exit dy+=inCubic(P)*.08H, a=1-inCubic(P)。body reveal=tin(.2,.9,linear||lin)。F=1.1（poseはspin .6/slide .45）。main delay=(miAt(.45/.3)|0)*stagger、miAt=max(0,t)/max(.005,stagger||.04)。 | 戻りpbは回転/scale非反映、安定pose以外で支持域に不可。源の最小k .001、rotation全720度、紙影とmast全体を外部poseに合成。main plateHold例外あり。 |

## fixed-stage候補の順と source recipe

各IDとも native joint translation を先に実測し、次段はnative topologyのまま段階size/余白/組版parameterを再構築する。以下は候補生成の方向であり、全円半径/全入力での成功を意味しない。不足時は insufficient-space/unsupported を返し、他ID代替や文字除外で通さない。

| ID | translation後の候補順 / 必要recipe parameters | 保証bounds / negativeケース |
|---|---|---|
| magazine | ①見開き一体の寸法段階(pw,ph,margin比固定) ②同variantでA text fit幅/height・B quote/body列を再計算。recipe:port/vert/sideB, pw/ph,A/gutter, mx/my, ls, size,linebreak, B図版/quote/body全geometry, seed。 | 両page最大展開+影+全copy、foldの反転紙とgutter。Aだけ移動、B背景除外、先頭大字除外は禁止。長いdeck、Latin vertical fallback、portrait上下、plateのmax4行、短dur<.75、P折返しがnegative。 |
| headlineDeck | ①同top/bottom/splitでsize/column/余白再計算 ②split(横のみ)等原義が保持できるsource variant候補。recipe:mx/aw/hw/dw,fb,size,ls/ds,deckH,top/hy/ry/dy/by,kicker板,mark。 | kicker幅、dot lastW・outBack、double-rule、deck/末尾readingのink。bottomのtot/最大clampで下端超過、4行deck/長romaji、split->portは禁止。mainだけfitしてaux残置不可。 |
| contents | ①rows/tateの同構成でcolW or bw/rowH/ls/sizeを段階化 ②許容orientationのsource rows/tate。recipe:chunks/context、cols/colX/hTop/hBot 又はbw/bx,numW/pgW/tw,rowH/blockH/y0、全pages/mark/cur。 | 全chunkのmi delay、context/章/page/header/rules/active全位置。n=2/4/5/9/10/14/15/20、ctx両値、k=1と多chunk、最大active切替直前後。Latinはplanでrows、tate手動paramsの意味も保護。 |
| footnote | ①main・superscript・note行を一体としてsizeとnotes領域を再計算 ②同alignでmain fit行数/注釈幅のsource-aware再組版。recipe:chunks/t0,fb,it/glyphPts,ls/ms,notesH/areaBot/ny/rw,nfs/note lines,top。 | 実note ink幅（romajiは日本語字数より大幅に長い）、superscript outBack最大、top/folio、全rule。現source notes未折返しなので簡単な全体scaleだけで可読下限を割る場合はfail。空白のglyphCount/charPtsの境界不一致もnegative。 |
| proofread | ①trim+main+pen+stampを一体size段階 ②同mark semanticsでmargin noteとstamp anchorの余白配分。recipe:fb,it/cx/cy,m,size/pad,x0..y1,gl/selected glyph/run,ns/pw,noteSide/nx/ny,stampS/sx/sy/rot,tombo。 | glyph形状・circle wobble/overshoot、box/stroke、leader、rot note、stampの1.5→1 scale過程/rotを包括。n<=4 marks減少、punct/Latin、portrait top notesの負y、clamped right margin、stamp無/有、短durでF未到達。 |
| numbered | ①同variant・同chunk数のsize/row/column寸法段階 ②k<=3横ならcols、rows/behindへのsource候補（番号/主の関係は保つ）。recipe:chunks,k,numFont,nsz/nW,csize,clipBox,top/xl/cw 又は rowH/y0/bw/sh/nx。 | 番号strokeとmask後ink、全部rule/labels、main全mi。k=4 cols fallback、small nのcharUnits(小かな/句読点合体)、behind巨数字、num outline/accent/dim、stage際clipの早期欠字。 |
| poster | ①全header/main/creditsとblock/dotの段階size・余白配分 ②同variantでlines再split/line別size再fit（tateは列数/一字体size保持）。recipe:mx/my/aw,y0/y1/credH/topH,lines/sz[]又はcols/per/gap、blockheight、dotfree/r、credits cw/maxC。 | native blockはstage全幅で文字contrastを所有（独立背景化は根拠無し）。plateを除いて文字だけ動かすのは不可。line別強弱とtate column原義を保護。n=1/3/4/16、Latin、dot閾値、WORDS ellipsis、短縦画面credH。 |
| swissGrid | ①grid/文字/shape/labels一体の寸法段階 ②同variantのmodule余白/段階size（aの.6比とhierarchy固定）。recipe:cols/rows,gx0..gy1,cw/rh,pl[],sizes[],boxes[],free,module shape,R,label transform。 | grid全域とrot labelを含む。gridだけ残しmain移動不可。k=1/2/3、a/b、freeが無い/選択が変わる、circle/square/bar、small side chunksが下限割れ。free testはrest boxのみで動的衝突を保証しない。 |
| dictionary | ①entry/page+tab含め一体の段階size/余白 ②同variantでheadword fit/defs幅、body文脈rowsをsource計算。recipe:mx/aw,hx/hy,fb/size,m,fs/lh/top/defTop/defBot,dfs,maxC,POS位置,tab tw/th/ty/tq。 | bodyRowsのfastRowを囲む、guide/reading/defs、POS fallback y、tab先頭字と固定edge線を一体。page=falseでもtabあり。p.tabY両端、長POS/romaji、entry/page、defs長さ/省略、tab元の+2clip、n=1/16。 |
| newspaper | ①紙全体のnative poseを保つ寸法段階 ②同yoko/tateの紙内margin/headline fit/tiersを再構成。recipe:pw/ph/cx/cy,m,mast geometry,bodyX,headline fb,size,rev plate,sub,tier/photo、spin/slide/exit transform。 | 主だけでなく紙/影/mast/全図版・copyのaffine envelope、rev contrast、miAt整数delay保持。spin両値・rev両値・tate/yoko・port/land、stage端near .45/.6、n=1/16、長sub、S<1.1。紙全体をstage矩形へ小さくするviewport手段は不可。 |

## 実装受入に残る確認

source recipeはfull W/Hのまま再構築し、候補ごとに出現対応（連結主歌詞・元の改行/空白/句読点・重複copy）、全owned支持域、可読下限、manual/OFF/lock/explicit size/emphasis、nativeとの差分clipを機械化する必要がある。Latin/日本語/混在、注釈/異なるlineText/romaji無し、字体、最小/閾値/上限の長さ、portrait境界 H=1.08W 前後、各variant、長短dur、全active切替、outDur=0/正、各hold/enter/exit、円半径/中心/辺/角のnegativeを対象にする。planのfitsは選択時weight制限であり手動/保存paramsで超過が来ない保証には使わない。支持域が不足する場合は代表18字の成功をID全対応と扱わない。

## 実装用: source-owned単位 / 読順 / 編集measure

mainDraw block数とplacement owner数は別である。下記10IDはいずれも **構成を1 owner** として保持するのがnative joint translationの既定。複数mainを独立移動すると罫線・番号・pageとの対応を壊す。再組版時は全block/ownedを同じrecipe revisionから再生成する。

| ID | native main blocks / 読順・結合 | 候補を評価する編集measure（geometry以外の保全） |
|---|---|---|
| magazine | 1。fbの横行=上→下、vertical=縦列右→左。 | page A/B比、gutter、variant、主fbとB copy/quote、主font/track/lead、folioとkicker。主文字と紙の包含/contrast。 |
| headlineDeck | 1。横改行上→下。 | headline/deck/kickerの階層、top/bottom/split順序、deck行数・可視copy、markと最終行対応。 |
| contents | k（通常1..4）。rows上→下、tate右→左、`chunks.join(Latin?' ':'')`が語順。 | chunk配列/番号/page対応、title→序→chunks→終の並び、leader接続/cur active対象。再split時には番号数とページstepの整合を再計算し、無断のchunk数変化を避ける。 |
| footnote | 1。chunksを再結合→fitBlock。 | chunk終端glyph→superscript→note同番号の連鎖、本文と注釈領域、notes未折返し幅。chunk境界は原保持。 |
| proofread | 1。横改行上→下。 | selected glyph/runの文字identity・li・順序、annotationの意味とleader接続、tomboとtrim、stamp/注釈の可読性。font sizeのみ差替えて既存glyphPtsを流用しない。 |
| numbered | k（通常1..4）。cols左→右、rows上→下、behind上→下（斜めstep）。 | `01+i`とchunk対応、numFont/outline/contrast、label、各clip、behindの重なり、mainとnumの段階size関係。 |
| poster | stack/blockはlines.length（1..4通常）、tateはceil(n/per)を目標にsplitKされた列数。横上→下、縦右→左。 | 行別size比/全幅、tate単一size、header/rules/main/credits順、WORDS可視copy、block対文字contrast、dot余白。size下限を各行・各列へ適用。 |
| swissGrid | k（通常1..3）。chunks配列順＝module配置の論理読順（variant bは下/右へ進む）。 | variant aのfirst優位（later<=.6first）、plのmodule列/行/span関係、rule接続、free shapeの重なり無し。 |
| dictionary | 1。headword横改行上→下。 | headword→reading/POS→defsの関係、guide/tabの先頭字同一、page context、定義順/番号と省略後の可視copy。 |
| newspaper | 1。yoko横行上→下、tate縦列右→左。 | page/mast/main/sub/tiers写真の新聞配置、rev contrast、主到着とpaper poseの相対clock、issue/time。tate→yoko等の変更は独立のsource variant候補として再構築・測定する。 |
