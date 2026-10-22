# AVOID-008 writing-preview04 独立視覚レビュー

判定：**限定 FAIL**。便箋の本文4字・順序・罫線間配置・紙内配置・署名との分離はこの固定fixtureで改善を確認した。しかし、変更前の上部の近接二重線が変更後では単線に見える構成になっており、元の便箋の上部二重線まで視覚的に保持したとは判定しない。はがきは **native fallback保持について限定PASS、回避成功には算入しない**。

担当：gpt-6.1-sol / medium。親から画像・動画の印象提供なし。対象は `/workspace/avoid008-objects/tasks/evidence/AVOID-008/objects/writing-preview04/`。`writing-preview04-main-only` は対象外。main と素材側の AGENTS、main の implementation-review-policy、visual-review-comparison を読んだ。公開結果確認は利用者指示により恒久中止・対象外。

## 実見範囲と方法

4本のMP4をffmpegでそれぞれ96frameへdecodeした。ffprobe実測は各24fps・4秒、便箋540×960、はがき1260×540。各動画のframe **0〜95全て**、合計384frameを、frame番号・時刻を付けた連続16コマ列24枚として全て実見した。実時間動画再生は行っていない。frameの間引きなし。キーPNGは2fixture×before/after×frame6/42/90の**全12枚を別途original detailで実見**した。動画の圧縮画像とnative PNGを区別した。見たframe番号、全キー名、各コマ列のhash、decode画像のhashとprobe全文は `writing-visual04-metadata.json` に保持した。

派生物はmainの `scratch/avoid008-writing-visual04/` のみ。自作decode PNG列は削除せず保持した。元MP4、native keys、既存素材の変更・削除なし。browser起動、新capture、製品コード、tests、Git変更なし。

## 便箋：letter-fold-inscription-portrait

入力：540×960、本文「風の先へ」、gothic_med（固定Noto Sans CJK JP Regular）、seed704、yoko/accent/sign=true、円中心(0.5,0.42)・半径0.2×短辺。

- beforeは大きな紙中央に「風の先へ」が1行。afterは上方に移した小さい縦長紙に「風の」「先へ」の2行。読み順は左→右、上→下で4字全て保持。字の欠落、文字同士の重なり、本文が紙端からはみ出す状態は見えなかった。
- afterの濃い本文罫線は各文字行の上下にあり、本文の黒い字画を横切らない。署名「— No.01」は下段右寄りの別セルに収まり、本文・下側罫線から離れて読める。frame6/42/90のnative PNGでも確認した。
- 紙はbeforeの約3分の1の幅となる。frame42のafterはおよそx184〜355、y3〜234、frame90も上端から数pixelの紙余白を残す。紙四辺が見える。入場時の紙の上昇とフェード、退場時の下降・フェードを全コマで追った。紙上の本文・罫線・署名が別々に残る破綻は見えなかった。frame0は両側とも背景のみ。
- **上部二重線の視覚的保持はFAIL。** beforeのnative keyでは紙上部に近接した太線＋細線のペアが明確に見える。afterのnative keyでは上端の濃い横線1本と、本文上方の離れた細い罫線となり、元の近接二重線としては見えない。単に縮小サムネイルで潰れたという判定ではなく、別途見たnative key6/42/90でも同じ構成である。sourceを読むと元のbody-rule開始位置が文字に合わせて再生成され、残る上部装飾線との近接関係が変わっていることと対応する。
- 薄い折り目はafterの本文行を横切る（frame42など）。濃い本文罫線との交差ではない。低コントラストなのでこの素材では文字は読めるが、「紙上の全線が本文に非交差」とは記録しない。
- 円ガイドは素材に焼かれていない。円中心y403.2、半径108に対してhold紙の下端が約234であるため、画面上の大きな上下分離は実見と整合する。metadataのcertified-hold-adapterやsafeという自己申告だけで読みやすさを代替していない。

安全metadataではobjectScale=.35、letterWritingScale=.7、from≈(0,-328.8511)。観測96件はsafe89、source-entry-exit-relaxed7。これらは保存されたmetadataの読取りで、今回のレビューで安全証明を再実行した結果ではない。

## はがき：postcard-inscription-wide

入力：1260×540、同本文・同font/seed、tilt3.7951、val85、zip0756816、mark7.1618、stamp=wave。円半径0.1×短辺。

- before/afterとも白い傾いた紙、左上の波図柄切手「85」、中央上部「POST CARD」、右上の枠付き「075-6816」、本文「風の先へ」、切手に重なる二重円の消印と右へ延びる3本の波線を実物で確認。消印内の時刻は切手との重なりで部分的に遮られる元の見え方を保持し、完全可読とは判定しない。
- frame6ではまだ本文・zip・消印は出ておらず、切手85・POST CARD・紙と薄い点線がある。frame7から本文とzipが現れ、frame14から消印が現れる。同じ出現順を両側の連続コマで確認。holdのframe42と90では全本文、郵便番号、POST CARD、切手85が確認できる。
- native key42/90で点線罫線が本文の下寄りを横切る。これはbefore/after共通のnative表現であり、改善された文字と罫線の非交差成功とは数えない。
- native入場の初期と退場最後に紙がstage端で切れる。afterにも同じcropが残る。frame95では右端側の紙が画面外へ退場している。holdの紙四辺は見える。新たなcrop回避成功の例ではない。
- 保存metadataのafter.safetyは **insufficient-space**。translationと縮小候補は成立せず、最後の縮小書込み候補は `C_OBJECT_PRINT_RELATION`（実copyと消印等の干渉）でrejected。composition=null、from=[0,0]。各frame観測はconflict96件。したがってnative保持を回避成功として扱わない。
- 元PNGのbefore/after hashは96中94frame一致、例外はframe2/5。両frameについて保存nativeDirectProbeはimmutable beforeと一致を報告しているが、probeそのものの再実行は今回行っていない。全96frameの見え方とnative key3対は保持している。MP4圧縮後のバイト一致を主張しない。

## 独立照合と証拠の限界

manifest SHA256は `a87a91fd05bb9a35a016626882f3ddae859d2b0eab77720738820c61956d3342` と一致。全16asset（MP4×4、PNG×12）のファイルhash/bytesをmanifestと照合し全一致。保持されていた元frameDirectoryの全384PNGを独立hash計算しframeHashesと全一致。自作MP4 decode PNG hashは圧縮後なので元native hashと混同していない。

固定before/after HTML.gzを展開したhashはそれぞれ `17e35475df196fc87a931802a21683a1d4c7b0cafcbba88feb2e50c9ba708456` / `ef9988955e0015354c53821e5ae81ca10dd6a4deadf174bf214e32d3c7c6a7bc`。preview生成script・fixture・fontManifestの実ファイルhashもstartup記録と一致。scriptを読み、入力spec、seed、同一固定font割当、96回の各時刻Canvas render、6/42/90 key取得、MP4化、planSHA生成箇所を照合した。実行はしていない。

9face全てについて各sideのloaded記録とfont実ファイルhashを照合し一致。gothic_medはsans-regular、POST CARD等のmonoも固定faceに割当。これはtransport font条件の証拠であり本番全fontの証明ではない。

09iの現作業木hashは `b4b396c694b3f498d0734bd68f98e1f0c3a97221205266f717ecc0d0c6e32c91` で対象版とは違っていた。そこで既存writing09-sourcepins（ほかmatrix12/default-circle03も同hash）から指定版を独立に探し、展開09i hash `8d58a556b4836ddd568c7c613840dca424a8eb8cb58740594c1ead98d1041b2b` 一致と固定after HTML内のソース全文完全包含を確認した。11p hash `979fdeb665a0a632672086c0063bc87e6bc537b2e2d817fee849e3e95b853379` と09g hashも一致し、固定after HTML内へ完全包含。現作業木全体を対象版と誤認していない。

**renderPlan全文はこのpreviewに保存されていない。** planSHA256、params、segments、frame観測とscript内の計算方法は確認できるが、planSHAを独立再算出して入力から生成planまで完全対応したとは言えない。これは未確認domainとして残す。

未確認：実時間再生での滑らかさ、24fps採取点間の全時刻、別本文・全font・他seed/比率/縦横/variant、実UI・保存/読込・Undo、未保存renderPlan全文。公開結果確認は恒久対象外。これらをPASSで上書きしない。今回の限定FAILは上部二重線の実見差分によるものであり、親による後続判断・製品全体の受入を代行しない。
