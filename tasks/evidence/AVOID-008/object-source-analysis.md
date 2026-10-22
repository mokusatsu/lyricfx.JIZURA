# AVOID-008 object layouts: baseline source analysis

対象は `2bb3f86:src/11p_layoutsC.js` の21ID。以下 `C:L` はこのbaselineの行番号であり、作業中treeの行番号ではない。AGENTS.md / tasks/implementation-review-policy.mdを読んだ。公開URL、画像、動画、ブラウザは一切確認していない。本書はsourceからの実装候補と証明義務の分析であり、実装済み・視覚確認済み・全時間PASSの証拠ではない。product/tests/既存docs/task-listは変更しない。

## 共通の厳密条件と分類

- `U=min(W,H)`、portraitは `H>1.08W` (C:9–11)。W/Hを変更してレイアウトのportrait分岐やfitを変える回避は不可。AEの `ring` / `circle` / `center` 属性を中心配置免除の根拠にしない。vinylも普通のprimary回避対象。例外は依頼で別指定された中心専用7IDだけ。
- primaryはJ.mainDrawだけではない。実歌詞から作ったstampSheetのfirst、karutaのfirst、romaji、lineText/note由来deckCopy、stationSignのprev/nextは本物copy。装飾に落として無視しない。固定文言・価格・日付・駅コード・願いの等級もmetadata inkとして分類を残す。
- 所有物は文字を載せる板・紙・disc-label・cloth等と局所の飾り。移動はまずnative形状/比率/clockを維持した所有単位joint translation。独立背景候補は文字が載らないrack・wire・branch・隣の本・grid・全面shoji等。ただしsourceの描画順、clip、線の接続がownershipより強い制約になる。未分類イベントをdropしない。
- joint translation後のID固有候補を下表に示す。物体/文字の段階sizeを使う場合はnative比率、意味、可読性を保つ。mainは少なくとも `max(0.7*nativeSize,18,0.035U)` を満たす必要があり、explicit size/manual/OFF/lock/emphasis保持を優先する。実際の契約のより厳しい下限も適用する。metadata/copyも潰さない。全viewport一括縮小は禁止。
- source return bbは多くが「回転前/entry移動前/heroだけ」の概略箱。これを全時間boundとして再利用しない。draw ink、stroke、shadow、treatment、enter/hold/exit、全実copy、clip後の可視集合を採取する。各所有単位の凸包/矩形のcornerをnative行列で変換し、その連続時間和集合をboundする。

### clockとstatic holdの定義（全IDに適用）

C:21 `tin(d,len,ease)=ease(clamp((lt-d)/max(.01,len)))`; C:22 `tout=1-inCubic(pOut)`。C:56 `ltU=ltb`; C:57 `pOutU=outDur>0?clamp((ltb-(dur-outDur))/outDur):0`。C:61 `plateHold=!['still','jitter','breathe','glitchtick'].includes(cut.hold)`。つまりnoHold=plateHoldはjitter/breathe/glitchtickを**抑止しない**。C:63 `miAt(t)=max(0,t)/max(.005,stagger||.04)`。

baseline `src/06_layouts.js:11–53` のmainDrawでは `delay=(mi|0)*(stagger||0)`（miAtの指定秒と完全一致とは限らない）、`ltI=lt-delay`、`pIn=clamp(ltI/max(.01,inDur))`、`pOut=outDur>0?clamp((lt-(dur-outDur))/outDur):0`、hold量 `clamp((ltI-.85inDur)/.25)*(1-pOut)`。enterはpiecesならpIn=1でもapplyされる。treatment/plain、noHold、motionScaleも別途関与。`noHold:true`でもenter/exitを止めない。

下表のstatic式は **native primary幾何のみ** の必要十分条件を、通常の非退化params・可視時間内で示す。完全なstatic holdは各occurrenceでさらに `ltI>=inDur`、enter piecesの残留動きなし、`pOut=0`、適用holdの幾何が定数（stillまたはnoHold、または機械的な個別証明）、treatment/char/piece/cameraの幾何が定数、をANDする。fade/colorだけの変化は幾何staticと区別する。可視alpha=0の空集合をstatic hold成功に数えない。短cutで時間窓が空ならstatic区間なし。指数減衰が小さいことを厳密0とみなさない。周期sinは離散サンプル一致でもstaticにならない。

main passは通常lt=ltbだがghost lagでは異なる（rendererのenvOptionsは `ltb=lt+P.lag`）。sourceのltとltb/ltUを単一の代表時刻に潰さない。下表の後に全draw occurrenceとclock行をbaselineから列挙する。

## 実装用表 A: occurrence / ownership / exact native static condition

| ID / source | 全primary・実copy・metadata / ownership・背景・aux | clock / variant / native static条件 |
|---|---|---|
| ema C:1331–1421 | hero wishはvert/horizontalの排他的2 mainDraw。奉納、No/timeはhero上metadata。hero pentagon・roof・grain・emblem・hole・shadow・cordが所有物。rack/pegsと背後4/7枚の偽greek plaquesは独立背景候補（実歌詞ではない）だがcord接続維持。 | ltでtd=max(0,lt-.08)、drop=−.5H(1-outBack(clamp(td/.45),1.3))、ha。ang=`swing*exp(-2.6td)*cos(6td)*clamp(td/.1)+.8sin(.9ltb)+inCubic(pOut)*swing`。背景もsin(1.1ltb+i)。hero native staticの有限区間なし（通常swing≠0に加え.8sinが必ず残る）。 |
| ransom C:1426–1513 | slotsOfで空白正規化した非space各glyphにmainDraw 1件。全scrap polygon/edge/shadowが各glyph所有物。背景なし。Latin word rowsとCJK perRowが別配置。 | 各i t0=.03+i*clamp(.4/n,.025,.07)、q=clamp((lt−t0)/.16)、scale=`lerp(1.5,1,outCubic(q))*(1-.25inCubic(pOut))`。rot=look[2]+tiltは固定。native static iff全可視iで `lt>=t0+.16 && pOut=0`。 |
| vinyl C:1615–1709 | label mainDrawとsleeve mainDrawの排他。disc helper arcTextはSIDE/rpm/No実metadata（2反復）。sleeve JZR-cat/SIDE/romaji-or-time。labelのdisc+tonearm+spindle+lyricは所有物。sleeve文字とsleeveは所有物、滑り出すdiscは連動付属物、静止sheen/groovesもdiscの視覚。 | label ang=`540*(1-outCubic(clamp(lt/T)))-300inCubic(pOut)`, T=max(.5,inDur+.35)、k settle .4、arm q=tin(.2,.7)*out。label native static iff `lt>=max(T,.4,p.arm?.9:0) && pOut=0`。sleeve ein settle .45、slide settle .95、discだけltb*120が永久回転。sleeve primary native static iff `lt>=.45 && pOut=0`（.95は付属discのslide完了）、全所有物の幾何（arc ink込み）はstaticでない。 |
| cassette C:1714–1776 | 1 mainDraw（label handwriting）。shell/label/band/screws/window/reelsとside/len/NR/No metadataは同一cassette所有物。clear shellも背景にしない。 | ein=outCubic(clamp(lt/.5)), eo=inCubic(pOut)、cy=.5H+(1-ein).6H+eo.15H、rot=tilt(1-eo)+12(1-ein)。reel spin=ltb*200*(1+3eo)。primary native static iff `lt>=.5 && pOut=0`、reels含む全物体はstatic不可。 |
| bookSpine C:1781–1882 | pileとshelf各heroに1 mainDraw。vol（pad2/漢数字）metadata。hero spine/body/bands/seal所有。周辺blank booksとfloor/shelf beamは背景候補（偽titleはrect）。 | pile i: t=.04+.09i, e settle t+.3、yy=y−(1−e).6H−eo(nb−i).02H。hero static iff `lt>=.04+.09hi+.3 && pOut=0`; 全本はmax_iへ。shelf e settle `.03+.05abs(i-hi)+.4`、hero lift=inOutCubic(clamp((lt-.35)/.4))*.6size*(1-eo)。hero static iff `lt>=.75 && pOut=0`; 全本は各settle最大もAND。shelf clipはfloor下を切る。 |
| polaroid C:1887–1948 | 各nonempty chunkに1 mainDraw。bottom captionはromaji/timeまたはNo-i（実romajiを含む）。frame/image/light leaks/tape/shadow/captionは各写真所有物。imageは歌詞を載せる面で背景除外不可。 | k=1..3、各i t=.02+.16i、e settle t+.4、rot=tilt*(k=1?.6:1)+14(1−e)、yy=y−(1−e).15H+eo.1H(i+1)。dev color/lyric alpha settle t+1、caption alpha settle t+.9。native primary幾何 static iff `lt>=max_i(t+.4) && pOut=0`; appearance staticはmax_i(t+1)も必要。 |
| stampSheet C:1962–2033 | hero mainDraw 1、motif=charの場合全nonhero stampに実歌詞first `env.draw`（primary replicaとして扱う）。各val/JIZURA POST/LYRIC/No metadata。hero stamp+perfs+inner plateとsheet/other stampsの所有関係を別記。char stampsを背景にしない。circle/wave motifsとblank selvageは背景候補。 | nonhero e=outBack(clamp((lt−.05−.03(c+r))/.3),1.5)*tout、hero he=outBack(clamp((lt−.12)/.35),1.3)、tear=tear?inCubic(pOut):0、hero scale=.9+.1he+.06tear、rot=14tear−6(1−he)、offset=(.4cell tear,−.8cell tear)。hero native static iff `lt>=.47 && pOut=0`; 全char replicasは各`.35+.03(c+r)` settleもAND。 |
| postcard C:2038–2127 | vert-CJKとhorizontal mainDraw排他。romajiなし。様suffixは実address readingの付属copy。zip digits、POST CARD/郵便はがき、stamp value、postmark time metadata。全card、stamp/perfs/postmark/linesが所有物。 | ein settle .55、cx=.5W−(1−ein).4W+eo.3W、cy=.5H+(1−ein).05H、rot=tilt−18(1−ein)+10eo。primary native static iff `lt>=.55 && pOut=0`。postmark q has outBack:全metadata幾何は `lt>=inDur+.38` もAND。zip/leader alpha clocks .25+.4/.2+.5。 |
| letterPaper C:2132–2216 | tate/yoko各1 mainDraw。deckCopyはnote→異なるlineText→romaji→nullの本物copy（tateはheightでtruncate）; sign No metadata。paper/rules/creases/shade/clipは所有物。 | port y slide settle .45、exit .05H*eo; port uf=1/fold=0。landscape uf=E.inOutCubic(clamp((ltb−.05)/.45))、fold=E.inOutCubic(clamp(pOutU/.7))、k=uf(1−fold)。native letter positionはlandscape固定だがclipが変わるため可視primary static iff `ltb>=.5 && pOutU=0 && pOut=0`、portは`lt>=.45 && pOut=0`。a2=clamp((k−.6)/.4)*outは本物copy可視化clock。 |
| calendar C:2224–2319 | himekuri/month各1 mainDraw。month/day/weekdays/ROKUYO、next-page数字、本の裏page metadata。himekuri hero tearing page+ink、stationary binding/back pagesは背景候補。month hero enlarged-cell+ink、grid/days/headerは独立calendar背景候補だが同一calendar関係を維持。 | himekuri entryはalphaだけ、tear=inCubic(pOut)、pivot depends day parity、rotate±28tear、translate .6ph*tear²。native primary static iff pOut=0。month zoom=E.inOutCubic(clamp((lt−.12)/.35))、bx/by/bw/bh interpolate source day cell→large panel、glyph anisotropic scale=(bw/PW,bh/PH)。static iff `lt>=.47 && pOut=0`。native anisotropic cell zoomを勝手に一様化しない。 |
| chochin C:2351–2424 | single mainDraw、row各unit mainDrawはLatin/CJKで排他2 callsites。lantern body/ribs/caps/cord/glowは所有物。wireは独立背景候補だが吊り点一致。 | flick=.8+.2noise1(3ltb,seed)、single sw=2.2sin(1.3ltb+ph)+6(1−ein)、row sw=3sin(1.6ltb+1.1i+ph)+10(1−e)*parity、row e outBack of `(lt−(.08+.07i))/.35`。single/rowともprimary native staticの有限区間なし。glowにはrow noise1(4ltb+i,3)も追加。 |
| routeMap C:2429–2525 | 全chunk mainDrawがport/land排他。各rom=romaOfText(c)は本物copy。code/badge letter metadata。station marker+code+label+romは局所unit候補、path/train/badgeは全体context。 | le=tin(0,.6)*(1−eo)、prog=clamp((lt−.3)/max(.4,.7dur)), cur=min(k−1,floor(prog*k))。train lerp station pathで進行、current marker形変化。label native位置は最初から定数だがta=clamp((1.05le−f)*6)>0の出現gate、mainDraw個別entryあり。全context static iff `lt>=max(.6,.3+max(.4,.7dur)) && pOut=0`。label幾何だけ固定とtrain/current stationのstaticを混同しない。 |
| stationSign C:2530–2592 | station name mainDraw 1。sub2=romaji or No、prev/next=lineText中の周辺実words（上限6）またはneighbor codes。badge letter/num metadata。board/band/arrow/posts/inkが所有物。postsは床までnative伸長。 | e settle .45、y0に−(1−e).2H+eo.05H。band be=tin(.15,.5)*out、fa=tin(.25,.4)*out。name native static iff `lt>=.45 && pOut=0`; band含む全物体の幾何staticはlt>=.65も必要。 |
| noren C:2597–2660 | nonempty unitごと縦mainDraw。single unit時はblank左右panelを追加。cloth/hem/weave/crest/local clipは各panel所有。rodは背景候補だが同じ吊り構造。mon crestは文字ではない。 | rodE=tin(0,.4)、各drop=outCubic(clamp((lt−(.04+.06i))/.45)) がclip heightを制御。sway=`1.1wind*sin(1.2ltb+.8i+ph)+part*sign(side||.001)*26*(.4+1.4abs(side))`, part=inOutCubic(pOut)。primary native staticの有限区間なし（wind=±1）。 |
| tanzaku C:2665–2736 | k lyric chunks mainDraw。k+extra(land)/k+1(port)のblank stripsは独立decor候補、同じbranchに吊るす。strip/string/hole/shadow/inkは所有物。branch/nodes/leavesは背景候補。 | branch reveal tin(0,.5)、leaves angle ±35+6sin(1.4ltb+i)。strip t1=.05+.07abs(i−(nS−1)/2)、e=clamp((lt−t1)/.5)、drop=.25H*(1−outBack(e,1.6))、sway=2.5sin(1.3ltb+.9i+ph)+eo*parity*20。primary native staticの有限区間なし。 |
| omikuji C:2743–2824 | land/port各縦mainDraw。rank、no、cats=実日本語category labels metadata。greekは偽文だがinkとして残す。paper/double border/crease/clipは一体所有。 | op=`inOutCubic(clamp((ltb−.03)/.55))*(1−inOutCubic(clamp((pOutU−.1)/.8)))`、vis=max(.12,op)。land right→left clip; port top→bottom。固定文字でもvisible集合は変化。完全native visible static iff `ltb>=.58 && pOutU<=.1 && pOut=0`。最後のpOut=0は共通hold条件（opのみならpOutU<=.1）。 |
| kakejiku C:2829–2903 | yoko/kake各縦mainDraw。sealはrect図形、hook/cord/mount/gold/paper/rollers/knobsは所有物。 | open=`inOutCubic(clamp((ltb−.08)/.7))*(1−inOutCubic(clamp(pOutU/.85)))`。yoko xr=x1−sw*open clip、kake yb=y0+sh*max(.03,open) clip、seal alpha start .6(yoko)/.7(kake)。native visible static iff `ltb>=.78 && pOutU=0 && pOut=0`。 |
| shoji C:2908–2969 | shadow/open各1 mainDraw。shadow: full W/H paper+radial illumination→lyric silhouette→paper=null frames/lattice。open: lyric→opaque moving panels。paper/gridはstage architectural背景候補でsource根拠はpw=W/nP,ph=H、全stage cover、文字とは別draw; ただし**foreground occluder**として除外せず可視性証明に残す。 | glow=.92+.08noise1(.8ltb)。shadow near=outCubic(clamp(lt/.9)), x=.5W+.03W(1−near), blur=size*lerp(.08,.012,near)、sx/sy=lerp(1.06,1,near)。primary native geometry static iff `lt>=.9 && pOut=0`。open op=inOutCubic(clamp((lt−.05)/.55))*(1−inOutCubic(pOut)); text位置固定でも可視集合はopで変わる。open visible static iff `lt>=.6 && pOut=0`、glow appearanceは持続。 |
| warningLabel C:3042–3096 | mainDraw 1。header/stripe/sideのWARN英日、No/time metadata。body/frame/header/hazard triangle/stripesは所有物。 | q=outBack(clamp(lt/.32),1.5)、rot=tilt+4(1−q)、scale=.85+.15q。flash=lt<.9 ? floor(lt/.12)%2?.25:1 :1。stripe off=1.2sb*ltb 持続。primary native geometry static iff `lt>=.32 && pOut=0`。header shape alpha he settle .41、全appearanceはflash settle .9; stripe全物体appearanceはstaticなし。 |
| priceTag C:3102–3176 | shelf/hang各1 mainDraw。price/was/税込/header/No metadata、barcode図形。tag+hole+cord+price ink所有。hang hookは固定anchorだがcord接続制約。 | shelf y0 includes `.3H*(1−outBack(clamp(lt/.45),1.3))+.1H*eo`、primary native static iff `lt>=.45 && pOut=0`; price font/alpha pa=tin(.3,.35)*outは.65 settle。hang swing=`swing*exp(-2.2lt)*cos(5.2lt)*(1-eo)+1.2sin(1.1ltb)+1.5eo*swing`、drop=−.4H*(1−outBack(e,1.4))。hang有限static区間なし、price scale pa=tin(.35,.35)*out。 |
| karuta C:3298–3407 | verse mainDraw 1/variant、first glyph `env.draw` はpair toriまたはsingle headerの実歌詞replica。読metadata。各card/frame/paper/art/header/inkは所有物、impactは独立aux候補だがslap時刻・card中心に連動。 | slap i t1=.12i, e=clamp((lt−t1)/.28), q=outCubic(e); dx=.7W*from*(1−q)、rot=35from(1−q)+tilt*(i?−.6:1)、y exit=.15H*eo。e>=1後bump=`.02exp(-14(lt−t1−.28))*sin(40(lt−t1−.28))`、scale=(1+bump,1−bump)。通常有限のstatic区間なし（指数減衰sinは常に残る）。impact support .26<lt−t1<.51。 |

## 実装用表 B: source-specific recipe順 / geometry proof / negative

各行の「移動」はstage全体ではなく上表の所有単位の移動。共通第一候補native joint translationが実行可能でなければ各行の固有候補へ進む。size変更時は上記下限とexplicit指定を確認し、所有文字・付属物の原比率を保つ。パラメータを増やす場合もvariantや乱数seedの変更で別演出に置換しない。以下は候補設計であり採用済みではない。

| ID | 候補順・調整parameters | 全時間boundに必要な幾何・native cropと新規cropの区別 / negative |
|---|---|---|
| ema | hero+cord+pivotをjoint移動 → rack上の吊り点hxとrackY/cordLを再配置（cordをheroから分離しない） → hero hw/hhを比率.7のまま段階size、emblem/roof/text/cord holeも同率。背景rack/後plaquesは必要ならstageに維持。 | pivot=(hx,rackY+drop)、pendant offset=(0,cordL+.5hh)、emaPts角頂点、shadow offset、metadataを含めて全ang範囲。exp*cosの範囲は±abs(swing)*exp(-2.6td)*clamp(td/.1)、sinは±.8、exit項は時区間eo範囲。背景sway±1.2も残す。hero entryは−.5Hから来るnative cropあり。移動後の早期ha>0 primaryが上端で新たに切れない条件を別に検査。cord/hookだけ固定して文字だけ移動不可。 |
| ransom | 全scraps joint → 行blockを左右/上下に原順配置して空き領域へ（Latinはword境界を保存） → base段階size、row pitch/column pitchを元の1.35/1.18比率近傍で調整（scrap overlap/letter collisionを起こさない）。 | look scale .84..1.16、rot look+tilt、紙torn jitter±.045sz、shadow(.05sz,.07sz)、q scale最大1.5、exit .75、glyph advを本物measure。各pieceが個別t0、mainDraw delay/enter/holdを持つためfinal gridだけでは不十分。別glyph順・Latin word分断・可読下限割れをnegative。 |
| vinyl | labelはdisc+arm+lyric joint → disc R同率size（LR/R=.5）→ label内fit調整。sleeveはsleeve+disc joint → sx/syおよびdisc突出方向offset=.56Sの予算を明示して空き側へ → S同率size（盤R=.47S）/sleeve内行fit。variant変更は候補にしない。 | label回転inkは半径support、arm pivot(+1.02R,−.92R)、L=1.05R、q角、stroke/needleもunion。sleeve native entry off=.25S(1−ein)とslide∈[0,1]、disc arcのltb*120を全角bound。primaryはsleeve上、盤とtonearmを背景扱いして未知supportを消さない。AE ring理由の中心固定免除禁止。 |
| cassette | 全cassette joint → cw/ch=1.58でsize → tx0/twとlabel handwriting fitを可読下限内で調整。shell clear/band variantを維持。 | 四角cornerをrot=tilt(1−eo)+12(1−ein)で変換。cy入場.6H/退出.15H、shell stroke・shadow・metadata/reelsを含む。native下端外からentryするが早く見える字の下端crop新設不可。reel6spokesは全角disk envelopeでbound、停止に置換不可。 |
| bookSpine | pile/shelf全book context joint → hero bookを周辺bookと整合する安全slotへ（shelf left/rightの空き、pileは積順保持） → hero/neighbor group同率size、pile bw/hsまたはshelf size/wsを再算定（本の縦横比・文字leading保持）。 | pile total/hsとi別fall/exit、hero xo、vol rot−90を含む。shelf rise h*e、lift、exit1.05h、clip at shelfY−1をworld変換と整合。beam native width .94W、floor .84Wは背景候補、無条件全context stagefitを強制すると自然なbeam幅を消す。source iのbx stage外skipも重要。heroだけ並びから浮かせる/clip固定のままpaperだけ移動はnegative。 |
| polaroid | 全写真列joint → posのzigzag/row・portrait stackの軸を保持して余白側へoffset（i順・captionとtape所属保持） → fw/fh=1.2/iw=.88fwの段階size → 各写真内3行以内fit。 | t_iごとのy entry−.15H、exit+.1H(i+1)、rot=tilts+14(1−e)、tape top−.05fw、shadowを変換。portrait fh*.72間隔は重なりnativeだが文字面/最終captionの新規隠れは不可。画像developが遅れてもalpha=.25+.75devで歌詞は初期から可視：dev完了までstage検証を延期不可。 |
| stampSheet | sheet+hero+all char replicas joint → hc/hrを整数有効セル内で選んでheroの空き側を確保（実際のnonhero位置/copy集合も追随） → cell同率sizeしcols/rowsとhero spc/spr比は保持 → fitBlockとfont調整。tear/motif/valは保持。 | sheet selvage[-m,−1.8m,sw+2m,sh+2.8m]、hero pivot(center+(.4cell tear,−.8cell tear))、rot14tear−6(1−he)、scale .9+.1he+.06tear、outBack overshoot、shadow grows with tear。nonhero outBackのq>native cellが一時拡大する。motif=charのfirstをmetadataに落とした検証は不可。hc/hr変更は文字replica発生セルも変えるためhero bboxだけで判定不可。 |
| postcard | card joint → cx/cyのnative入り軌道を保って別余白へ → cw/chのportrait1.48/landscape1/1.48比率size → address fitの縦/横branch内のtext regionのみ調整。 | rotation全pOut/ein区間＋stamp postmarkのlocal rotation mark、postmark q 1.4→outBack overshoot、波線R*(1.15+2)まで。native左外entry/右exitを保ちつつ、早く可視になった歌詞の左右crop比較。様suffixをmain blockのmmだけでboundしない。zip/POST CARD領域との重なりnegative。 |
| letterPaper | paper+clip+rules+copy joint → tateは縦column blockを罫線pitchに沿って空いた紙面内へ、yokoはr0を罫線単位で移動 → pw/ph同率sizeしてthird、pitch、deckCopy/sign領域再計算。variant変更なし。 | vis rectangleの全k∈[0,1]、portrait y0 slide、fold exit、shadow、crease/outer thirds。native折り目maskで隠れた歌詞はmaskとして保持、clipだけstage固定にしない。tate base/nlとsecondary copy判定をsize変更後に再計算（margin判定で副copy消失する場合は意味喪失として候補棄却）。landscape静止primary coordinatesだけ見てnative maskを無視不可。 |
| calendar | himekuri pad joint（binding/pivot/back pageも整合）→ pw/ph同率size/hero region fit。monthはcalendar joint → hero target X1/Y1をgrid/today cell関係を保って空き側へ → PW/PH同率size、source cell→panel補間を再構成。 | himekuri pivot左右parity、±28tear、tear²下方.6phを区間bound、bindingはstationary。month bx/by/bw/bhとglyph anisotropic max(.01,k)/max(.01,bh/PH)、size/max rules of date; today cell初期位置からtargetまでconvex sweep。targetだけの包絡は不可。month/year/weekdays等背景inkを未分類drop不可。 |
| chochin | single lantern+吊り点/cord joint、rowはrow全lanterns+wire joint → wireY/row間隔またはsingle topを余白へ（元の吊り関係維持） → lw/lh比1.4(row)/native single min式の同率size、unit内fit。 | single pivot top; row pivot(x,ty)、outBack scale e、sw全周期±2.2/±3 plus entry、body lw/2 sinusoidal contour、glow lw*1.4横及びlh+.8lw縦。wireはx=-10..W+10のnative stage cropが意図される：全wireをstage内に押し込むstagefitは不適切。glowを文字inkと同じ可読bboxに足すかdecorに分けるか明示。sway/flickを停止するrecipe不可。 |
| routeMap | whole path+stations joint → straight/bend固定のままstation label sideとmaxW余白を調整（route shape/順序/停車関係維持） → path/label group段階size、romaji/codeのrelative placement保持。 | polyline累積長at(f)、train capsules/outline、current-station marker change、badge outBack、label meas幅clampを再計算。文字だけstationから離れるtranslateは禁止。stage .04..96W pathがnativeで広く、fullstage縮小で処理しない。prog/cur境界の全k、ta thresholdを分割し漏れなく採取。port codeはline左に幅bs*2.8、romajiはsize*.55下まで。 |
| stationSign | board+posts+ink joint → board y0/cx再配置しpostsを同じ床へ再接続（post長は位置に追従） → bw/bh原比率size、name fit/sidebadge budget再算定。 | y0 entry−.2H/exit+.05H、board shadow、band width0..bwとarrow。posts sourceはheight=H−y0−bh+10で終点H+10、意図的なnative stage外support。これを新規primary edge cropとして失敗させない。一方name/romaji/prev/nextは文字としてstage内を要求。neighbor wordsの長さ/RTL?実測と6文字sliceを保持。 |
| noren | rod+all panels+clips joint → rodYとpanel slot中心を空き側へ（rod接続保持） → nw/nh同率size、gaps/pw/hem/text/monを比例調整。 | pivot各(px+.5pw,rodY)、hh=nh*dropによるclipとnative cloth nh、sway∈±1.1＋exit26*(.4+1.4abs(side))、crest may extend acrossgap at even k。stageclipだけでなくpanel間遮蔽/文字重なりの可視性を検査。drop途中はnative裾clip、移動で早く見えるglyphを新しいstageclipへ押し込まない。風を0/nh減少だけで文字を裾に隠すのはnegative。 |
| tanzaku | 全hanging strips+branch joint → lyrics中間slot群をbranch上で横へ寄せる（元chunk順、blank stripsは両脇） → sw/size/string/sh原比率段階size、branch接続維持。 | branch[-20,W+20]はnative crop、leaves sinusoidal角±6、strip pivot(x,top)、局所−drop、cord string、paper sh、sway±2.5+20eo、shadow。top=by(x)の変更で branch傾き/leaf interferenceも再計算。長いstrip縦mmがnative sh formula内かglyph bbox実測で確認。blank stripsは別decorでも主文字を覆うsupportから除外不可。 |
| omikuji | paper+clip+rank/grid/verse joint → landscape poem列のpx1/pwを保持し左右余白分配、portrait poem pt/pb内へ罫線整合offset → sw/sh同率sizeとheader/rank/cats予算再算定。 | clip cx0=x0+sw*(1−max(.12,op)) land / height sh*max(.12,op) port、double-border stroke、crease条件をbound。native partial unfoldingは意図mask。副rank/catsが文字と同居するためverseだけ大きく移動して覆うrecipe不可。Greekも描画ink（意味ない偽文）としてsupportを保持。 |
| kakejiku | mount+paper+rollers+cord+clip joint → yoko roll両端/paper領域またはkake吊り点(cx,y0)を余白へ → sw/sh同率size、glyphとsealを原relativeでfit。 | open全区間、yoko xrと2 roller、kake yb=max(.03,open)*sh、top hook y0−.06H、knob ±.62sw、seal mm-driven clamp。clipを移動忘れない。native closeで文字が隠れるのは許容でも、新たなstage edgeによる文字欠けは別判定。vertical→horizontalへのvariant変更は演出変更。 |
| shoji | shadow: 全stage paper/latticeを背景foregroundとして維持しlyric silhouetteを移動 → fitBlock領域/sizeを可読下限内調整。open: lyric移動は**開口可視性条件付き** → 開口center/panel anchorの対称joint再設計（stage archはstage寸法維持） → lyric sizeとgapWを整合調整。単なるwhole viewport scaleは禁止。 | shadowはnearに応じたsx=sy1.06→1、x offset.03W、allowFilter=trueのblur最大.08size→.012sizeをboundする。allowFilter:false prepassのみでPASS不可。blur support仕様未確定ならunsupportedと記録。shadow latticeは文字の後描画で視認上の遮蔽を生む。openの中央gapは `[W/2−gapW*op/2,W/2+gapW*op/2]`（左右panelの内端）、gapW=min(W*(port?.76:.9),mm.w+1.4size)。candidate visible inkのx射影が各時刻開口に収まること、またはbaselineと同等以上のnative revealを保持すること。translated lyricがfull-open gap外なら即棄却。stage-sizedpaper/gridを無条件ownedObjectにして回避空間判定を不能にしない一方、前景可視性を消して背景扱いPASSするのも不可。 |
| warningLabel | body+whole variants joint → header/side等native可読regionを空き側へ → lw0/lh0原比率size/fit。同じvariantとflash/stripe速度を保持。 | q outBack overshootによるrotとscale、body stroke、triangleのstroke半幅、metadata。stripe helperのclipを物体と同じ行列へ。flash時間境界.12nと.9、ltb stripe shiftは色/柄持続で主文字native位置とは分離。stripe variantの狭いahをplate全体文字予算に広げてtriangleを覆うのはnegative。 |
| priceTag | shelf label joint → shelf x0/y0と名前/価格領域を同じlabel内で分配 → bw/bh原比率size/fit。hangはtag+cord+pivot joint → hx/hy/cordの吊り位置調整 → tw/th=1.45同率size、価格/was/名前のrelative維持。 | shelf outBack overshoot、hang pivot(hx,hy+drop)、tag polygon局所top=cord+.05tw、ch=.22tw、pendulum角±abs(swing)*exp(-2.2lt)*(1−eo)±1.2+1.5eo*swing。shadow(.008U,.012U)、strike-through width grows pa、price font scales paもbound。hang finite settleを仮定不可。hookだけ固定/cord切断、priceが歌詞に重なるrecipe不可。 |
| karuta | pair全2cards/impact joint → pair axis/relative centersを維持して余白側へ（portrait上下、landscape左右） → ch/cw=.72原比率size/gap比例 → verse fit。singleもfirst-circle+verseを一体。 | dx full .7W*from、rot35→tilt、exit+.15H、bump ±.02expでanisotropic1±bumpをsourceどおりbound。impact .26..51supportはcard localではなくnative centerで描く（cardAtがimpactをtransform前に呼ぶ）点に注意。first glyph両variantsはprimary replica。native外側slap entryは存在するがcandidateの早期visible字に新規edge crop不可。phaseを.28でstatic切り替えする証明は指数sin残留により不成立。 |

## 全区間判定で残る共通の証明義務

1. circleの一時通過免除は**native入退場区間だけ**に限定する。holdの持続sway/spinはentryとみなさない。円だけを緩和し、stage crop条件は独立して保持する。full owned objectではなく実際の文字/copyについてbaselineの可視集合を対応づける。
2. stage cropの比較は、同一source occurrence・同一時刻・同一main/ghost passで行う。native画面外入場、native local clipで未表示のglyphまでstage内に強制する必要はないが、candidateが原版より早く読めるglyphを見せた結果、そのglyphを新たにstage端で切ることは許容しない。alphaが小さい、入場中、または返却bbがnullでないことをstage安全性の代わりにしない。
3. native intentional crop: stationSignのposts終点H+10、chochin wireの−10..W+10、tanzaku branchの−20..W+20、shoji全面panelsはprimary文字の新規欠けとは区別する。これらを独立背景候補とする場合もownership reportに残し、前景mask/遮蔽・吊り接続の関係は保持する。
4. outBackは入力clamp[0,1]でも出力が1を超える。全区間のparameter extremaまたは導関数根を含める。sin/cos/expの連続範囲、karuta bumpの異方拡縮、calendar monthのnative異方zoomを離散時刻のunionで証明済みにしない。sin phase全域の[-1,1] boundは保守的だがsound。必要なら区間subdivisionで狭める。
5. mainDraw native動作に加えenter/exit/hold/treatの全文字support、romaji/replica、ghost lag、camera/delivery clock、最終render scale/device pixel guardが必要。source snippetと代表時刻のみでは全区間証明にならない。clipやfilterをrecording実装が扱えないなら明示unsupportedにし、未分類drawを暗黙に捨てない。

## Appendix: baseline exact occurrence and clock source index

各引用はbaselineの同じファイル。mainDrawとenv.drawを全callsite列挙する。実行回数は上表のloop/branchによる。draw expressionが次行へ続く場合は次行も残す。clock欄にはenv.lt/ltb/pOut/ltU/pOutUおよび関連helper呼出行をすべて列挙する。共有helperのdisc/arcText、lantern、shojiPanelはそれぞれC:1615–1641、C:2324–2349、C:2908–2921も参照。

### ema C:1331–1421

```js
1403: env.draw({ text: '奉納', font: serifF(env), size: es * 1.1, track: 0.3, x: hw * 0.3, y: ey, color: ink, alpha: ha * 0.8, ghost: false });
1411: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: 0, y: ay + (ah - mm.h) / 2, vertical: true, align: 'left', lead: 1.3, track: 0.04, rot: 1.5, color: ink, noHold: true, plain: true, mi: miAt(env, 0.35) });
1415: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: 0, y: ay + ah / 2, lead: 1.2, track: 0.02, rot: -1.5, color: ink, noHold: true, plain: true, mi: miAt(env, 0.35) });
1417: env.draw({ text: 'No.' + lineNo(env) + '  ' + J.fmtTime(env.cut.start), font: monoF(env), size: ls * 0.8, track: 0.15, align: 'right', x: hw * 0.44, y: hh * 0.42, color: ink, alpha: ha * 0.6, ghost: false });
```

Native clock references:

```js
1341: const out = tout(env), ls = smallSize(env);
1350: const re = tin(env, 0, 0.45, E.outCubic) * out;
1360: const e = E.outBack(J.clamp((env.lt - t1) / 0.4), 1.2);
1362: const sw = b[1] + Math.sin(env.ltb * 1.1 + i) * 1.2;
1376: const td = Math.max(0, env.lt - 0.08);
1378: const ang = p.swing * Math.exp(-td * 2.6) * Math.cos(td * 6) * J.clamp(td / 0.1) + Math.sin(env.ltb * 0.9) * 0.8 + E.inCubic(env.pOut) * p.swing;
1379: const ha = J.clamp(env.lt / 0.12) * (1 - J.clamp((env.pOut - 0.5) / 0.5));
1411: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: 0, y: ay + (ah - mm.h) / 2, vertical: true, align: 'left', lead: 1.3, track: 0.04, rot: 1.5, color: ink, noHold: true, plain: true, mi: miAt(env, 0.35) });
1415: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: 0, y: ay + ah / 2, lead: 1.2, track: 0.02, rot: -1.5, color: ink, noHold: true, plain: true, mi: miAt(env, 0.35) });
```

### ransom C:1426–1511

```js
1505: const r = J.mainDraw(env, { text: ch, font, size: sz, x: 0, y: sz * 0.02, color: mode === 'line' ? sc.fg : tc, plain: true, noHold: plateHold(env), mi: miAt(env, t0) });
```

Native clock references:

```js
1442: const out = 1 - E.outCubic(J.clamp(env.pOut * 1.1));
1486: const q = J.clamp((env.lt - t0) / 0.16);
1488: const k = J.lerp(1.5, 1, E.outCubic(q)) * (1 - E.inCubic(env.pOut) * 0.25);
1505: const r = J.mainDraw(env, { text: ch, font, size: sz, x: 0, y: sz * 0.02, color: mode === 'line' ? sc.fg : tc, plain: true, noHold: plateHold(env), mi: miAt(env, t0) });
```

### vinyl C:1643–1709

```js
1677: const bb0 = J.mainDraw(env, { text: fb.text, font: p.font, size: Math.min(fb.size, lab * 0.55), x: 0, y: 0, lead: 1.1, color: onCol(sc, labC), noHold: true, plain: true });
1699: env.draw({ text: 'JZR-' + p.cat, font: monoF(env), size: ls * 0.9, track: 0.2, align: 'right', x: x0 + S - m, y: y0 + m + ls * 0.3, color: tc, alpha: fa, ghost: false });
1700: env.draw({ text: 'SIDE ' + p.side, font: monoF(env), size: ls * 0.9, track: 0.2, align: 'left', x: x0 + m, y: y0 + m + ls * 0.3, color: tc, alpha: fa, ghost: false });
1705: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: x0 + m, y: y0 + S - m - ls * 1.6 - mm.h / 2, align: 'left', lead: 1.05, track: 0.01, color: tc, noHold: plateHold(env), mi: miAt(env, 0.22) });
1706: env.draw({ text: (romajiOf(env) || J.fmtTime(env.cut.start)).slice(0, 26), font: monoF(env), size: ls * 0.8, track: 0.15, align: 'left', x: x0 + m, y: y0 + S - m, color: tc, alpha: fa * 0.8, ghost: false });
```

Native clock references:

```js
1652: const out = tout(env), ls = smallSize(env);
1659: const a = tin(env, 0, 0.3, E.outCubic) * (1 - J.clamp((env.pOut - 0.6) / 0.4));
1661: const ang = 540 * (1 - E.outCubic(J.clamp(env.lt / T))) - 300 * E.inCubic(env.pOut);
1662: const k = J.lerp(0.9, 1, E.outCubic(J.clamp(env.lt / 0.4)));
1667: const q = tin(env, 0.2, 0.7, E.inOutCubic) * out;
1684: const ein = E.outExpo(J.clamp(env.lt / 0.45));
1685: const slide = E.inOutCubic(J.clamp((env.lt - 0.25) / 0.7)) * (1 - E.inOutCubic(env.pOut));
1686: const a = J.clamp(ein * 2) * (1 - J.clamp((env.pOut - 0.5) / 0.5));
1690: disc(env, dcx + (port ? 0 : off), dcy + (port ? off : 0), R, env.ltb * 120, labC, a, arc.repeat(2), p.cat);
1698: const fa = tin(env, 0.15, 0.4, E.outCubic) * out;
1705: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: x0 + m, y: y0 + S - m - ls * 1.6 - mm.h / 2, align: 'left', lead: 1.05, track: 0.01, color: tc, noHold: plateHold(env), mi: miAt(env, 0.22) });
```

### cassette C:1714–1776

```js
1751: env.draw({ text: p.side, font: 'gothic_black', size: sb * 0.78, x: lx + lw2 * 0.03 + sb / 2, y: ly + lh2 * 0.08 + sb / 2, color: labF, alpha: a, ghost: false });
1752: env.draw({ text: p.len + '  ·  NR  ·  No.' + lineNo(env), font: monoF(env), size: ls * 0.75, track: 0.2, align: 'right', x: lx + lw2 * 0.97, y: ly + lh2 * 0.9, color: labT, alpha: a * 0.8, ghost: false });
1772: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: tx0 + size * 0.1, y: rl - mm.h / 2 - size * 0.08, align: 'left', lead: 1.05, rot: -1.2, color: labT, noHold: plateHold(env), mi: miAt(env, 0.28) });
```

Native clock references:

```js
1723: const out = tout(env), ls = smallSize(env);
1725: const ein = E.outCubic(J.clamp(env.lt / 0.5)), eo = E.inCubic(env.pOut);
1761: const spin = env.ltb * 200 * (1 + eo * 3);
1772: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: tx0 + size * 0.1, y: rl - mm.h / 2 - size * 0.08, align: 'left', lead: 1.05, rot: -1.2, color: labT, noHold: plateHold(env), mi: miAt(env, 0.28) });
```

### bookSpine C:1781–1882

```js
1830: env.draw({ text: pad2(p.vol), font: monoF(env), size: h * 0.24, x: W / 2 + w / 2 + xo - w * 0.035, y: yy + h / 2, rot: -90, color: htc, alpha: a, ghost: false });
1831: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: W / 2 + xo - w * 0.02, y: yy + h / 2, track: 0.04, color: htc, noHold: plateHold(env), mi: miAt(env, 0.1 + hi * 0.09 + 0.2) });
1870: env.draw({ text: kanjiNum(p.vol), font: serifF(env), size: size * 0.46, x: bx + w / 2, y: yy + h * 0.11 + size * 0.4, color: heroC, alpha: a, ghost: false });
1872: bb = J.mainDraw(env, { text: vt, font: p.font, size, x: bx + w / 2, y: yy + h * 0.11 + size * 1.2, vertical: true, align: 'left', lead: 1.24, track: 0.02, color: htc, noHold: plateHold(env), mi: miAt(env, 0.3) });
```

Native clock references:

```js
1794: const out = tout(env), ls = smallSize(env);
1799: const eo = E.inCubic(env.pOut);
1813: env.line([[W * 0.08, floor], [W * 0.92, floor]], sc.sub, Math.max(2, u * 0.003), tin(env, 0, 0.4) * out, false);
1819: const e = E.outCubic(J.clamp((env.lt - t) / 0.3));
1831: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: W / 2 + xo - w * 0.02, y: yy + h / 2, track: 0.04, color: htc, noHold: plateHold(env), mi: miAt(env, 0.1 + hi * 0.09 + 0.2) });
1850: const shA = tin(env, 0, 0.4) * out;
1856: const e = E.outExpo(J.clamp((env.lt - t) / 0.4));
1859: const lift = i === hi ? E.inOutCubic(J.clamp((env.lt - 0.35) / 0.4)) * size * 0.6 * (1 - eo) : 0;
1872: bb = J.mainDraw(env, { text: vt, font: p.font, size, x: bx + w / 2, y: yy + h * 0.11 + size * 1.2, vertical: true, align: 'left', lead: 1.24, track: 0.02, color: htc, noHold: plateHold(env), mi: miAt(env, 0.3) });
```

### polaroid C:1887–1948

```js
1938: const r = J.mainDraw(env, { text: fb.text, font: p.font, size: Math.min(fb.size, iw * 0.34), x: 0, y: iy + iw / 2, lead: 1.1, color: tc, alpha: 0.25 + 0.75 * dev, noHold: plateHold(env), mi: miAt(env, t + 0.15) });
1942: if (capA > 0.01) env.draw({ text: cap.slice(0, 20), font: p.pen, size: Math.min(fw * 0.07, (fw * 0.84) / Math.max(6, cap.length * 0.62)), x: 0, y: iy + iw + (fh / 2 - iy - iw) * 0.5, rot: -2, color: C.text, alpha: capA * 0.85, ghost: false });
```

Native clock references:

```js
1903: const eo = E.inCubic(env.pOut);
1920: const e = E.outCubic(J.clamp((env.lt - t) / 0.4));
1931: const dev = E.inOutCubic(J.clamp((env.lt - t - 0.1) / 0.9));
1938: const r = J.mainDraw(env, { text: fb.text, font: p.font, size: Math.min(fb.size, iw * 0.34), x: 0, y: iy + iw / 2, lead: 1.1, color: tc, alpha: 0.25 + 0.75 * dev, noHold: plateHold(env), mi: miAt(env, t + 0.15) });
1940: const capA = J.clamp((env.lt - t - 0.5) / 0.4) * a;
```

### stampSheet C:1962–2033

```js
1985: env.draw({ text: 'JIZURA POST  ·  ' + p.val + ' × ' + (cols * rows - 3) + '  ·  No.' + lineNo(env), font: monoF(env), size: Math.min(ls * 0.8, m * 0.7), track: 0.2, align: 'left', x: sx, y: sy - m * 0.9, color: C.text, alpha: sa * 0.7, ghost: false });
2007: else env.draw({ text: first, font: p.font, size: q * 0.45, x: cxm, y: cym + q * 0.08, color: tt, alpha: 0.5, ghost: false });
2008: env.draw({ text: String(p.val), font: monoF(env), size: q * 0.16, align: 'left', x: ox + q * 0.08, y: oy + q * 0.13, color: tt, alpha: 0.9, ghost: false });
2026: env.draw({ text: String(p.val), font: monoF(env), size: hs * 0.1, align: 'left', x: -hw / 2 + ip * 1.8, y: -hh / 2 + ip * 2.4, color: htc, alpha: ha, ghost: false });
2027: env.draw({ text: 'LYRIC  ' + lineNo(env), font: monoF(env), size: hs * 0.045, track: 0.3, align: 'right', x: hw / 2 - ip * 1.8, y: hh / 2 - ip * 1.9, color: htc, alpha: ha * 0.8, ghost: false });
2029: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size: Math.min(fb.size, hs * 0.34), x: 0, y: hs * 0.03, lead: 1.08, color: htc, noHold: plateHold(env), mi: miAt(env, 0.15) });
```

Native clock references:

```js
1972: const out = tout(env), ls = smallSize(env);
1979: const sa = tin(env, 0, 0.35, E.outCubic) * (1 - J.clamp((env.pOut - 0.5) / 0.5));
1996: const e = E.outBack(J.clamp((env.lt - 0.05 - (c + r) * 0.03) / 0.3), 1.5) * out;
2015: const he = E.outBack(J.clamp((env.lt - 0.12) / 0.35), 1.3);
2016: const tear = p.tear ? E.inCubic(env.pOut) : 0;
2017: const ha = J.clamp(he * 2) * (p.tear ? 1 - J.clamp((env.pOut - 0.6) / 0.4) : out);
2029: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size: Math.min(fb.size, hs * 0.34), x: 0, y: hs * 0.03, lead: 1.08, color: htc, noHold: plateHold(env), mi: miAt(env, 0.15) });
```

### postcard C:2038–2127

```js
2073: env.draw({ text: String(p.val), font: monoF(env), size: stw * 0.2, align: 'left', x: stx + stw * 0.1, y: sty + sth * 0.14, color: stt, alpha: a, ghost: false });
2083: env.draw({ text: p.zip[i], font: p.font, size: bs * 0.8, x: bx + bs / 2, y: zy + bs * 0.66, color: C.text, alpha: za * 0.9, ghost: false });
2085: env.draw({ text: vertCard ? '郵便はがき' : 'POST CARD', font: vertCard ? serifF(env) : monoF(env), size: ls * (vertCard ? 1.2 : 0.9), track: 0.5, x: vertCard ? 0 : x0 + cw * 0.46, y: vertCard ? y0 + m + sth + ls * 0.9 : y0 + m * 0.75, color: C.text, alpha: a * 0.75, ghost: false });
2098: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: lx, y: ty, vertical: true, align: 'left', lead: 1.3, track: 0.06, color: C.text, noHold: plateHold(env), mi: miAt(env, 0.3) });
2100: env.draw({ text: '様', font: p.font, size: size * 0.7, x: lx - (fb.lines - 1) * size * 0.65, y: ty + lastLen * size * 1.06 + size * 0.75, color: C.text, alpha: la, ghost: false });
2108: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: x0 + m * 1.2, y: top + lh * (nL > 1 ? 2.5 : 2.0) - size * 0.3, align: 'left', lead: lh / size, track: 0.02, color: C.text, noHold: plateHold(env), mi: miAt(env, 0.3) });
2118: env.draw({ text: J.fmtTime(env.cut.start), font: monoF(env), size: R * 0.26, x: 0, y: 0, color: C.text, alpha: pa, ghost: false });
```

Native clock references:

```js
2047: const out = tout(env), ls = smallSize(env);
2052: const ein = E.outCubic(J.clamp(env.lt / 0.55)), eo = E.inCubic(env.pOut);
2078: const za = tin(env, 0.25, 0.4, E.outCubic) * out;
2089: const la = tin(env, 0.2, 0.5, E.outCubic) * out;
2098: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: lx, y: ty, vertical: true, align: 'left', lead: 1.3, track: 0.06, color: C.text, noHold: plateHold(env), mi: miAt(env, 0.3) });
2108: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: x0 + m * 1.2, y: top + lh * (nL > 1 ? 2.5 : 2.0) - size * 0.3, align: 'left', lead: lh / size, track: 0.02, color: C.text, noHold: plateHold(env), mi: miAt(env, 0.3) });
2111: const pt = (env.lt - env.cut.inDur - 0.2) / 0.18;
```

### letterPaper C:2132–2216

```js
2179: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: W / 2, y: top + size * 0.35, vertical: true, align: 'left', lead: 1.55, track: 0.08, color: C.text, noHold: plateHold(env) });
2184: env.draw({ text: [...strip(ctxT)].slice(0, Math.floor((bot - top) / (cs * 1.1))).join(''), font: p.font, size: cs, vertical: true, align: 'left', track: 0.08, x: base + (nl + 1.5) * pitch, y: top + cs * 0.4, color: C.text, alpha: a2 * 0.5, ghost: false });
2186: if (p.sign && a2 > 0.01 && base - 1.5 * pitch > x0 + mS) env.draw({ text: 'No.' + lineNo(env), font: p.font, size: ls, vertical: true, align: 'left', x: base - 1.5 * pitch, y: bot - ls * 5, color: C.text, alpha: a2 * 0.7, ghost: false });
2198: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: left, y: top + (r0 + nl / 2) * pitch - size * 0.12, align: 'left', lead: 1.7, track: 0.04, color: C.text, noHold: plateHold(env) });
2201: if (ctxT && a2 > 0.01 && r0 > 0) env.draw({ text: ctxT, font: p.font, size: size * 0.6, align: 'left', x: left, y: top + (r0 - 0.5) * pitch - size * 0.1, color: C.text, alpha: a2 * 0.45, ghost: false });
2202: if (p.sign && a2 > 0.01) env.draw({ text: '— No.' + lineNo(env), font: p.font, size: ls, align: 'right', x: right, y: top + (nRow - 0.5) * pitch - ls * 0.2, color: C.text, alpha: a2 * 0.7, ghost: false });
```

Native clock references:

```js
2141: const C = card(sc), out = tout(env), ls = smallSize(env);
2147: const x0 = W / 2 - pw / 2, y0 = H / 2 - ph / 2 + (port ? (1 - E.outCubic(J.clamp(env.lt / 0.45))) * H * 0.25 + E.inCubic(env.pOut) * H * 0.05 : 0);
2150: const fadeOut = 1 - J.clamp((env.pOut - 0.55) / 0.45);
2152: const uf = port ? 1 : E.inOutCubic(J.clamp((ltU(env) - 0.05) / 0.45));
2153: const fold = port ? 0 : E.inOutCubic(J.clamp(pOutU(env) / 0.7));
2155: const a0 = tin(env, 0, 0.2, E.outCubic) * fadeOut;
2179: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: W / 2, y: top + size * 0.35, vertical: true, align: 'left', lead: 1.55, track: 0.08, color: C.text, noHold: plateHold(env) });
2198: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: left, y: top + (r0 + nl / 2) * pitch - size * 0.12, align: 'left', lead: 1.7, track: 0.04, color: C.text, noHold: plateHold(env) });
```

### calendar C:2224–2319

```js
2252: env.draw({ text: String(day % p.days + 1), font: p.font, size: ph * 0.3, x: W / 2, y: y0 + ph * 0.55, color: dayCol((wd + 1) % 7), alpha: a * 0.18, ghost: false });
2261: env.draw({ text: String(p.month + 1), font: p.font, size: ph * 0.1, align: 'left', x: x0 + m, y: y0 + bindH + ph * 0.09, color: C.text, alpha: fa, ghost: false });
2262: env.draw({ text: MON_E[p.month], font: monoF(env), size: ls * 0.9, track: 0.3, align: 'left', x: x0 + m + ph * 0.1 * 0.9, y: y0 + bindH + ph * 0.1, color: C.text, alpha: fa * 0.8, ghost: false });
2264: env.draw({ text: ROKUYO[(day + p.month) % 6], font: serifF(env), size: ls * 1.05, x: x0 + pw - m - ls * 1.6, y: y0 + bindH + ph * 0.06 + ls * 0.8, color: red, alpha: fa, ghost: false });
2268: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: W / 2, y: y0 + bindH + ph * 0.47, lead: 1.08, track: 0.02, color: dcol === C.text ? C.text : dcol, noHold: plateHold(env) });
2270: env.draw({ text: WD_J[wd] + '曜日', font: serifF(env), size: ls * 1.5, align: 'left', x: x0 + m, y: y0 + ph * 0.88, color: dcol, alpha: fa, ghost: false });
2271: env.draw({ text: day + '  ' + WD_E[wd], font: monoF(env), size: ls * 1.1, track: 0.2, align: 'right', x: x0 + pw - m, y: y0 + ph * 0.88, color: dcol, alpha: fa, ghost: false });
2285: env.draw({ text: String(p.month + 1), font: p.font, size: ls * 2.6, align: 'left', x: gx, y: gy - hdrH - ls * 1.7, color: sc.fg, alpha: ga, ghost: false });
2286: env.draw({ text: MON_E[p.month], font: monoF(env), size: ls, track: 0.4, align: 'left', x: gx + ls * 2.6, y: gy - hdrH - ls * 1.3, color: sc.sub, alpha: ga, ghost: false });
2288: for (let c = 0; c < 7; c++) env.draw({ text: WD_E[c], font: monoF(env), size: ls * 0.8, track: 0.2, x: gx + (c + 0.5) * cell, y: gy - hdrH * 0.45, color: c === 0 ? sc.accent : c === 6 ? (J.contrast(sc.accent2, sc.bg) > 1.6 ? sc.accent2 : sc.sub) : sc.sub, alpha: ga, ghost: false });
2299: env.draw({ text: String(d), font: monoF(env), size: Math.min(rh * 0.28, cell * 0.24), align: 'left', x: x + cell * 0.08, y: y + rh * 0.22, color: c === 0 ? sc.accent : sc.fg, alpha: a * 0.8, ghost: false });
2311: env.draw({ text: String(day), font: monoF(env), size: Math.max(rh * 0.28, PH * 0.12 * k), align: 'left', x: bx + bw * 0.04, y: by + bh * 0.13, color: tc, alpha: pa, ghost: false });
2312: env.draw({ text: WD_E[wd], font: monoF(env), size: Math.max(6, PH * 0.06 * k), track: 0.3, align: 'right', x: bx + bw * 0.96, y: by + bh * 0.12, color: tc, alpha: pa * zoom, ghost: false });
2315: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size: Math.min(fb.size, u * 0.2), x: PW / 2, y: PH * 0.57, lead: 1.08, track: 0.02, color: tc, noHold: plateHold(env), mi: miAt(env, 0.2) });
```

Native clock references:

```js
2232: const out = tout(env), ls = smallSize(env);
2243: const a = tin(env, 0, 0.3, E.outCubic);
2251: const tear = E.inCubic(env.pOut);
2256: const pa = a * (1 - J.clamp((env.pOut - 0.7) / 0.3));
2259: const fa = tin(env, 0.1, 0.4, E.outCubic) * pa;
2268: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: W / 2, y: y0 + bindH + ph * 0.47, lead: 1.08, track: 0.02, color: dcol === C.text ? C.text : dcol, noHold: plateHold(env) });
2284: const ga = tin(env, 0, 0.3, E.outCubic) * out;
2289: const zoom = E.inOutCubic(J.clamp((env.lt - 0.12) / 0.35));
2291: for (let r = 0; r <= rows; r++) { const e = tin(env, r * 0.03, 0.4, E.inOutCubic) * out; env.line([[gx, gy + r * rh], [gx + gw * e, gy + r * rh]], gridC, 1, 0.45 * dim, false); }
2297: const a = J.clamp((env.lt - 0.02 - idx * 0.006) / 0.15) * out * dim;
2306: const pa = J.clamp(env.lt / 0.12) * out;
2315: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size: Math.min(fb.size, u * 0.2), x: PW / 2, y: PH * 0.57, lead: 1.08, track: 0.02, color: tc, noHold: plateHold(env), mi: miAt(env, 0.2) });
```

### chochin C:2351–2424

```js
2385: const r = J.mainDraw(env, { text: vt, font: p.font, size, x: W / 2, y: L.y0 + L.bh / 2 - per * size * 0.5, vertical: true, align: 'left', lead: 1.15, color: tc, noHold: plateHold(env), mi: miAt(env, 0.2) });
2416: const rr = J.mainDraw(env, lat ? { text: t, font: p.font, size, x, y: L.y0 + L.bh / 2, color: tc, noHold: plateHold(env), mi: miAt(env, t1 + 0.12) }
2417: : { text: strip(t), font: p.font, size, x, y: L.y0 + L.bh / 2 - n * size * 0.5, vertical: true, align: 'left', color: tc, noHold: plateHold(env), mi: miAt(env, t1 + 0.12) });
```

Native clock references:

```js
2362: const out = tout(env);
2368: const flick = 0.8 + 0.2 * J.noise1(env.ltb * 3, env.cut.seed);
2369: const ein = E.outCubic(J.clamp(env.lt / 0.5)), a = J.clamp(ein * 2) * (1 - J.clamp((env.pOut - 0.4) / 0.6));
2377: const sw = Math.sin(env.ltb * 1.3 + p.ph) * 2.2 + (1 - ein) * 6;
2385: const r = J.mainDraw(env, { text: vt, font: p.font, size, x: W / 2, y: L.y0 + L.bh / 2 - per * size * 0.5, vertical: true, align: 'left', lead: 1.15, color: tc, noHold: plateHold(env), mi: miAt(env, 0.2) });
2401: const we = tin(env, 0, 0.5, E.inOutCubic) * out;
2408: const e = E.outBack(J.clamp((env.lt - t1) / 0.35), 1.4);
2410: const sw = Math.sin(env.ltb * 1.6 + i * 1.1 + p.ph) * 3 + (1 - e) * 10 * (i % 2 ? 1 : -1);
2413: const L = lantern(env, x, ty, lw, lh, bodyC, a, true, flick * (0.85 + 0.15 * J.noise1(env.ltb * 4 + i, 3)));
2416: const rr = J.mainDraw(env, lat ? { text: t, font: p.font, size, x, y: L.y0 + L.bh / 2, color: tc, noHold: plateHold(env), mi: miAt(env, t1 + 0.12) }
2417: : { text: strip(t), font: p.font, size, x, y: L.y0 + L.bh / 2 - n * size * 0.5, vertical: true, align: 'left', color: tc, noHold: plateHold(env), mi: miAt(env, t1 + 0.12) });
```

### routeMap C:2429–2525

```js
2500: env.draw({ text: code, font: monoF(env), size: bs * 0.8, x: S.x - lw * 1.4 - bs * 1.4, y: S.y, color: sc.fg, alpha: ta * out, ghost: false });
2501: bb = J.unionBB(bb, J.mainDraw(env, { text: c, font: p.font, size, x: lx, y: S.y - (rom ? ls * 0.4 : 0), align: 'left', track: 0.02, color: sc.fg, mi: miAt(env, 0.1 + i * 0.12) }));
2502: if (rom) env.draw({ text: rom, font: monoF(env), size: ls * 0.8, track: 0.15, align: 'left', x: lx, y: S.y + size * 0.55, color: sc.sub, alpha: ta * out, ghost: false });
2509: env.draw({ text: code, font: monoF(env), size: bs * 0.8, x: S.x, y: by + bs * 0.9, color: sc.fg, alpha: ta * out, ghost: false });
2511: bb = J.unionBB(bb, J.mainDraw(env, { text: c, font: p.font, size, x: lx, y: ny, track: 0.02, color: sc.fg, mi: miAt(env, 0.1 + i * 0.12) }));
2512: if (rom) env.draw({ text: rom, font: monoF(env), size: ls * 0.75, track: 0.15, x: lx, y: d < 0 ? ny + size * 0.5 + ls * 0.7 : ny + size * 0.5 + ls * 0.9, color: sc.sub, alpha: ta * out, ghost: false });
2521: env.draw({ text: p.letter, font: 'gothic_black', size: R * 1.1 * ba, x: cx2, y: cy2, color: sc.fg, ghost: false });
```

Native clock references:

```js
2442: const out = tout(env), ls = smallSize(env);
2473: const le = tin(env, 0, 0.6, E.inOutCubic) * (1 - E.inCubic(env.pOut));
2475: const prog = J.clamp((env.lt - 0.3) / Math.max(0.4, env.cut.dur * 0.7));
2501: bb = J.unionBB(bb, J.mainDraw(env, { text: c, font: p.font, size, x: lx, y: S.y - (rom ? ls * 0.4 : 0), align: 'left', track: 0.02, color: sc.fg, mi: miAt(env, 0.1 + i * 0.12) }));
2511: bb = J.unionBB(bb, J.mainDraw(env, { text: c, font: p.font, size, x: lx, y: ny, track: 0.02, color: sc.fg, mi: miAt(env, 0.1 + i * 0.12) }));
2516: const ba = tin(env, 0.05, 0.4, E.outBack) * out;
```

### stationSign C:2530–2592

```js
2572: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: cx, y: ny, track: 0.12, lead: 1.05, color: txC, noHold: plateHold(env), mi: miAt(env, 0.15) });
2576: env.draw({ text: sub2, font: bodyF(env), size: ls * (port ? 1.1 : 1.2), track: 0.1, x: cx, y: bandY - bandH * 0.25 - ls * 1.3, color: txC, alpha: fa, ghost: false });
2581: env.draw({ text: p.letter, font: monoF(env), size: bs * 0.24, x: bx2 + bs / 2, y: by2 + bs * 0.17, color: onCol(sc, bandC), alpha: fa, ghost: false });
2582: env.draw({ text: pad2(p.num), font: 'gothic_black', size: bs * 0.5, x: bx2 + bs / 2, y: by2 + bs * 0.72, color: txC, alpha: fa, ghost: false });
2587: env.draw({ text: pv, font: pf, size: ls * 1.25, align: 'left', x: x0 + bw * 0.04, y: py, color: txC, alpha: fa * (prev ? 1 : 0.7), ghost: false });
2588: env.draw({ text: nx, font: nf, size: ls * 1.25, align: 'right', x: x0 + bw * 0.96, y: py, color: txC, alpha: fa * (next ? 1 : 0.7), ghost: false });
```

Native clock references:

```js
2536: const out = tout(env), ls = smallSize(env);
2540: const e = E.outCubic(J.clamp(env.lt / 0.45)), eo = E.inCubic(env.pOut);
2559: const be = tin(env, 0.15, 0.5, E.inOutCubic) * out;
2572: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: cx, y: ny, track: 0.12, lead: 1.05, color: txC, noHold: plateHold(env), mi: miAt(env, 0.15) });
2573: const fa = tin(env, 0.25, 0.4, E.outCubic) * out;
```

### noren C:2597–2660

```js
2653: const r = J.mainDraw(env, { text: t, font: p.font, size, x: 0, y: hem + (nh - hem) * 0.5 - g2 * size * 0.52 + (p.mon ? pw * 0.12 : 0), vertical: true, align: 'left', track: 0.04, color: tc, noHold: plateHold(env), mi: miAt(env, t1 + 0.15) });
```

Native clock references:

```js
2616: const rodE = tin(env, 0, 0.4, E.outCubic);
2617: const fadeO = 1 - J.clamp((env.pOut - 0.55) / 0.45);
2620: const part = E.inOutCubic(env.pOut);
2627: const drop = E.outCubic(J.clamp((env.lt - t1) / 0.45));
2631: const sway = Math.sin(env.ltb * 1.2 + i * 0.8 + p.ph) * 1.1 * p.wind + part * Math.sign(side || 0.001) * 26 * (0.4 + Math.abs(side) * 1.4);
2653: const r = J.mainDraw(env, { text: t, font: p.font, size, x: 0, y: hem + (nh - hem) * 0.5 - g2 * size * 0.52 + (p.mon ? pw * 0.12 : 0), vertical: true, align: 'left', track: 0.04, color: tc, noHold: plateHold(env), mi: miAt(env, t1 + 0.15) });
```

### tanzaku C:2665–2736

```js
2728: const r = J.mainDraw(env, { text: t, font: p.font, size, x: 0, y: string + size * 0.9, vertical: true, align: 'left', track: 0.06, color: onCol(sc, col), noHold: plateHold(env), mi: miAt(env, t1 + 0.25) });
```

Native clock references:

```js
2675: const out = tout(env);
2682: const be = tin(env, 0, 0.5, E.inOutCubic) * out;
2691: const ang = (i % 2 ? 1 : -1) * 35 + Math.sin(env.ltb * 1.4 + i) * 6, L = u * 0.07, wdt = u * 0.018;
2715: const e = J.clamp((env.lt - t1) / 0.5);
2718: const sway = Math.sin(env.ltb * 1.3 + i * 0.9 + p.ph) * 2.5 + E.inCubic(env.pOut) * (i % 2 ? 1 : -1) * 20;
2719: const a = J.clamp(e * 3) * (1 - J.clamp((env.pOut - 0.4) / 0.6));
2728: const r = J.mainDraw(env, { text: t, font: p.font, size, x: 0, y: string + size * 0.9, vertical: true, align: 'left', track: 0.06, color: onCol(sc, col), noHold: plateHold(env), mi: miAt(env, t1 + 0.25) });
```

### omikuji C:2743–2824

```js
2776: env.draw({ text: no, font: serifF(env), size: Math.min(colW * 0.6, ih * 0.8 / no.length), vertical: true, align: 'left', x: hx, y: iy0 + ih * 0.06, color: C.text, alpha: a, ghost: false });
2780: env.draw({ text: rt, font: serifF(env), size: Math.min(rw * 0.7, ih * 0.8 / rt.length), vertical: true, x: rx + rw / 2, y: iy0 + ih / 2, track: 0.2, color: onCol(sc, red), alpha: a, ghost: false });
2786: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: px1 - pw / 2, y: iy0 + (ih - mm.h) / 2, vertical: true, align: 'left', lead: 1.35, track: 0.06, color: C.text, noHold: plateHold(env), mi: miAt(env, 0.22) });
2791: env.draw({ text: c, font: serifF(env), size: ls * 1.05, vertical: true, align: 'left', x: cx + catW * 0.12, y: cy + ls * 0.8, color: red, alpha: a, ghost: false });
2798: env.draw({ text: no, font: serifF(env), size: hh * 0.5, track: 0.3, x: W / 2, y: iy0 + hh * 0.45, color: C.text, alpha: a, ghost: false });
2801: env.draw({ text: p.rank, font: serifF(env), size: rh * 0.62, track: 0.3, x: W / 2, y: iy0 + hh + rh / 2, color: onCol(sc, red), alpha: a, ghost: false });
2807: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: W / 2, y: pt + (pb - pt - mm.h) / 2, vertical: true, align: 'left', lead: 1.35, track: 0.06, color: C.text, noHold: plateHold(env), mi: miAt(env, 0.25) });
2811: env.draw({ text: c, font: serifF(env), size: ls, vertical: true, align: 'left', x: cx + cw2 * 0.22, y: pb + m, color: red, alpha: a, ghost: false });
```

Native clock references:

```js
2749: const out = tout(env), ls = smallSize(env);
2756: const op = E.inOutCubic(J.clamp((ltU(env) - 0.03) / 0.55)) * (1 - E.inOutCubic(J.clamp((pOutU(env) - 0.1) / 0.8)));
2757: const a = tin(env, 0, 0.2, E.outCubic) * (1 - J.clamp((env.pOut - 0.75) / 0.25));
2786: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: px1 - pw / 2, y: iy0 + (ih - mm.h) / 2, vertical: true, align: 'left', lead: 1.35, track: 0.06, color: C.text, noHold: plateHold(env), mi: miAt(env, 0.22) });
2807: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: W / 2, y: pt + (pb - pt - mm.h) / 2, vertical: true, align: 'left', lead: 1.35, track: 0.06, color: C.text, noHold: plateHold(env), mi: miAt(env, 0.25) });
```

### kakejiku C:2829–2903

```js
2860: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: px0 + pw / 2 + mm.w * 0.1, y: py0 + (ph2 - mm.h) / 2, vertical: true, align: 'left', lead: 1.4, track: 0.06, color: C.text, noHold: plateHold(env), mi: miAt(env, 0.25) });
2886: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: cx, y: ty, vertical: true, align: 'left', lead: 1.35, track: 0.08, color: C.text, noHold: plateHold(env), mi: miAt(env, 0.2) });
```

Native clock references:

```js
2835: const out = tout(env);
2842: const open = E.inOutCubic(J.clamp((ltU(env) - 0.08) / 0.7)) * (1 - E.inOutCubic(J.clamp(pOutU(env) / 0.85)));
2843: const a = tin(env, 0, 0.2, E.outCubic) * (1 - J.clamp((env.pOut - 0.8) / 0.2));
2860: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: px0 + pw / 2 + mm.w * 0.1, y: py0 + (ph2 - mm.h) / 2, vertical: true, align: 'left', lead: 1.4, track: 0.06, color: C.text, noHold: plateHold(env), mi: miAt(env, 0.25) });
2861: if (p.seal) env.rect(px0 + pw / 2 - mm.w * 0.5 - size * 0.7, py0 + (ph2 + mm.h) / 2 - size * 0.55, size * 0.45, size * 0.45, seal, a * J.clamp((env.lt - 0.6) * 4), false);
2886: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: cx, y: ty, vertical: true, align: 'left', lead: 1.35, track: 0.08, color: C.text, noHold: plateHold(env), mi: miAt(env, 0.2) });
2891: const sa = a * J.clamp((env.lt - 0.7) * 4);
```

### shoji C:2922–2969

```js
2950: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: W / 2 + (1 - near) * W * 0.03, y: H / 2, lead: 1.15, track: 0.04, color: shade, blur: env.allowFilter ? J.lerp(size * 0.08, size * 0.012, near) : 0, sx: J.lerp(1.06, 1, near), sy: J.lerp(1.06, 1, near) });
2958: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: W / 2, y: H / 2, lead: 1.15, track: 0.04, color: sc.fg, mi: miAt(env, 0.12) });
```

Native clock references:

```js
2934: const glow = 0.92 + 0.08 * J.noise1(env.ltb * 0.8, env.cut.seed);
2938: const a = tin(env, 0, 0.3, E.outCubic) * (1 - J.clamp((env.pOut - 0.5) / 0.5));
2948: const near = E.outCubic(J.clamp(env.lt / 0.9));
2958: bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: W / 2, y: H / 2, lead: 1.15, track: 0.04, color: sc.fg, mi: miAt(env, 0.12) });
2960: const op = E.inOutCubic(J.clamp((env.lt - 0.05) / 0.55)) * (1 - E.inOutCubic(env.pOut));
```

### warningLabel C:3042–3096

```js
3071: env.draw({ text: ht, font: 'gothic_black', size: hs, track: 0.12, align: 'left', x: x0 + hh * 1.45, y: y0 + hh * 0.52, color: onCol(sc, warnC), alpha: a * he, ghost: false });
3079: env.draw({ text: wj + '　' + we, font: 'gothic_black', size: lh0 * 0.06, track: 0.2, x: x0 + lw0 / 2, y: y0 + sb + lh0 * 0.33, color: inkC, alpha: a, ghost: false });
3086: env.draw({ text: we, font: 'gothic_black', size: sw2 * 0.14, track: 0.1, x: x0 + sw2 / 2, y: y0 + lh0 * 0.78, color: onCol(sc, warnC), alpha: a, ghost: false });
3091: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: ax0 + aw / 2, y: ay0 + ah / 2 - (p.variant === 'stripe' ? 0 : ah * 0.04), lead: 1.08, track: 0.02, color: inkC, noHold: plateHold(env), mi: miAt(env, 0.12) });
3092: if (p.variant !== 'stripe') env.draw({ text: 'No.' + lineNo(env) + '  —  ' + J.fmtTime(env.cut.start), font: monoF(env), size: ls * 0.8, track: 0.2, align: 'right', x: ax0 + aw - ls, y: ay0 + ah - ls * 0.9, color: inkC, alpha: a * 0.6 * out, ghost: false });
```

Native clock references:

```js
3048: const out = tout(env), ls = smallSize(env);
3051: const q = E.outBack(J.clamp(env.lt / 0.32), 1.5), eo = E.inCubic(env.pOut);
3058: const flash = env.lt < 0.9 ? (Math.floor(env.lt / 0.12) % 2 ? 0.25 : 1) : 1;
3066: const he = tin(env, 0.06, 0.35, E.outCubic);
3075: const off = env.ltb * sb * 1.2;
3091: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: ax0 + aw / 2, y: ay0 + ah / 2 - (p.variant === 'stripe' ? 0 : ah * 0.04), lead: 1.08, track: 0.02, color: inkC, noHold: plateHold(env), mi: miAt(env, 0.12) });
```

### priceTag C:3102–3177

```js
3128: env.draw({ text: 'お買い得  ·  No.' + lineNo(env), font: bodyF(env), size: hdr * 0.5, track: 0.2, align: 'left', x: x0 + bw * 0.03, y: y0 + hdr / 2, color: onCol(sc, red), alpha: a, ghost: false });
3133: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: x0 + bw * 0.04, y: (nTop + nBot) / 2, align: 'left', lead: 1.05, color: tc, noHold: plateHold(env), mi: miAt(env, 0.2) });
3137: env.draw({ text: yen(p.price), font: 'gothic_black', size: ps * J.clamp(pa), align: 'right', x: px, y: py, color: red, alpha: J.clamp(pa), ghost: false });
3138: env.draw({ text: '税込', font: bodyF(env), size: ls * 0.9, align: 'right', x: px, y: py + ps * 0.62, color: tc, alpha: J.clamp(pa) * 0.8, ghost: false });
3165: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: 0, y: top + th * 0.36, lead: 1.08, color: tc, noHold: true, plain: true, mi: miAt(env, 0.2) });
3170: env.draw({ text: was, font: monoF(env), size: ws, x: 0, y: top + th * 0.71, color: tc, alpha: J.clamp(pa) * 0.6, ghost: false });
3173: env.draw({ text: now, font: 'gothic_black', size: tw * 0.17 * J.clamp(pa), x: 0, y: top + th * 0.86, color: red, alpha: J.clamp(pa), ghost: false });
```

Native clock references:

```js
3111: const out = tout(env), ls = smallSize(env);
3114: const e = J.clamp(env.lt / 0.45), eo = E.inCubic(env.pOut);
3133: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: x0 + bw * 0.04, y: (nTop + nBot) / 2, align: 'left', lead: 1.05, color: tc, noHold: plateHold(env), mi: miAt(env, 0.2) });
3134: const pa = tin(env, 0.3, 0.35, E.outBack) * out;
3148: const t = Math.max(0, env.lt);
3149: const swing = p.swing * Math.exp(-t * 2.2) * Math.cos(t * 5.2) * (1 - eo) + Math.sin(env.ltb * 1.1) * 1.2 + eo * p.swing * 1.5;
3165: const bb = J.mainDraw(env, { text: fb.text, font: p.font, size, x: 0, y: top + th * 0.36, lead: 1.08, color: tc, noHold: true, plain: true, mi: miAt(env, 0.2) });
3167: const pa = tin(env, 0.35, 0.35, E.outBack) * out;
```

### karuta C:3298–3384

```js
3350: env.draw({ text: first, font: p.font, size: R * 1.3, x: ccx, y: ccy, color: red, alpha: a, ghost: false });
3364: return J.mainDraw(env, { text: fb.text, font: p.font, size, x: 0, y, vertical: true, align: 'left', lead: 1.3, track: 0.05, color: C.text, noHold: plateHold(env), mi: miAt(env, S.t1 + 0.2) });
3371: const r = cardAt(0, ax, ay, (a, S) => { env.draw({ text: '読', font: serifF(env), size: cw * 0.1, x: cw * 0.34, y: -ch / 2 + cw * 0.16, color: red, alpha: a, ghost: false }); return verse(a, S, false); });
3379: env.draw({ text: first, font: p.font, size: R * 1.3, x: ccx, y: ccy, color: red, alpha: a, ghost: false });
```

Native clock references:

```js
3304: const out = tout(env), ls = smallSize(env);
3313: const eo = E.inCubic(env.pOut);
3316: const e = J.clamp((env.lt - t1) / 0.28);
3318: const bump = e >= 1 ? Math.exp(-(env.lt - t1 - 0.28) * 14) * Math.sin((env.lt - t1 - 0.28) * 40) * 0.02 : 0;
3323: const k = (env.lt - t1 - 0.26) / 0.25;
3364: return J.mainDraw(env, { text: fb.text, font: p.font, size, x: 0, y, vertical: true, align: 'left', lead: 1.3, track: 0.05, color: C.text, noHold: plateHold(env), mi: miAt(env, S.t1 + 0.2) });
```

### Shared source caveats

- stampSheet `first=strip(t0)[0]` (C:1991)はUTF-16 code unit先頭。karuta `first=[...t0][0]` (C:3307)はcode point先頭。同じfirst glyph処理と仮定して観測イベントを統合しない。
- arcTextはdiscのmetadata描画。mainDrawではないため通常のprimary追跡だけでは拾えない。disc+label回転行列と全text arc supportを保存する。
- helper smallSizeは`clamp(U*.024,14,34)`。所有物の同率sizeを導入する際にこの固定stage依存metadata sizeを勝手に再計算したことにしない。全部をtransformする方法と、native smallSizeを維持してレイアウトを再fitする方法は幾何が異なる。
- static式のlt>=閾値はnative幾何に対する条件であり、cut開始絶対時刻ではない。ghost lag、mainDraw delay、native ltUをそれぞれ正しいclockで評価する。

## 機械的な文書点検

21対象IDのsource registrationと本書Appendixの21見出しを突合した。Appendixは各reg閉じ行までを対象に、全`J.mainDraw`/`env.draw` callsiteとnative clock参照行をbaselineから生成した。これはsource列挙の完全性点検であり、rendererのruntimeイベント網羅、filter support、全時間安全性、実装candidateの正しさを検証したものではない。公開結果確認は利用者指示により中止・対象外。
