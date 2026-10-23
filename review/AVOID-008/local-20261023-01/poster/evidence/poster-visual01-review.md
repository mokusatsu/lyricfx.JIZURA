# AVOID-008 poster visual01 independent local review

**判定: 限定PASS**。immutable mediaで示された一条件の可読性とposterらしさについて、画像の実見から判定した。solverのsafe自己申告を画像PASSの根拠にしていない。Git commitは親からの固定pin待ちであり、最終Git一致を主張しない。

対象は `/workspace/avoid008-editorial/tasks/evidence/AVOID-008/editorial/poster-preview01/`。manifest SHA256 `696272d2965718df78c7b9b4ef02630e0e1a574b3035ad78a60c6c07191f29d1`。poster/stack/dot/mincho、主文「風の先へ」、note「遠い空の向こうへ」、JP compiled、960×540、center(.5,.42)、radius .2だけに範囲を固定する。mutable現treeを当然にsnapshotと同一扱いしていない。

独立bytehash検査: manifestの元14 assetsすべて一致。poster04/results.json の100 raw pinsについてgzip snapshotを独立展開して全一致。before proofread09 compiled `d28ceee1702b2ef66020f023432bbfa0ae613029a4347ec85bac965820457054` とafter poster04 compiled `be8f37463052ae10b17e242a74b26378356dc3b729c62a327a7031d25c577d7f` が媒体manifestと一致。manifest inputPins 12件(撮影runner/fixture3件/font8件)は読取時の指定path bytesと一致、font8件はposter04 immutable gzip bytesとも一致。engineも100 raw pins内のsnapshotを検査した。actual sourcePlan/renderPlan/actualCutを含むJSON自体のbytehashは14 assets検査に含め、各subobjectの独立SHA256もmetadataに保存。元per-frame encoder PNG hash列0..95を両側とも読み、native key6/36/91の原PNG bytesが該当encoderInputPNGと全一致した。lossy MP4のdecodePNG hashと元encoderInputPNGの同一性は主張しない。

ffmpegで各MP4を独立decode、ffprobeで各960×540/24fps/96frames/4秒を確認。before:0..95、after:0..95の**全192コマ**を、各480×270のtileを12枚ずつ並べた1440×1160画像16枚で、行順・各セルすべて実見した。省略・重複選抜による全コマ代用ではない。さらにbefore/afterそれぞれframe6(.25s)、36(1.5s)、91(3.791667s)の**全6 native keysを960×540原寸で実見**した。decoded192枚のSHA256と全framekey/timeはmetadataに列挙。リアルタイム動画再生は実施していないため、全decoded列の確認とリアルタイムの動きの鑑賞は区別する。

元画像の白い明朝主文、暗地、黄円、間隔のあるmono見出し、細罫線とcreditというposterの部品はafterにも保たれる。主文は「風の」「先へ」の二行となり、行順・四字の順序・全文を原寸で読める。筆画の欠けや重複、違う四字への置換は見えない。native36/91ではLYRIC 01、00:00.00、DATE/00:00.00、No./01 / 04、WORDS/遠い空の向こうへを判読できる。fontの外観は明朝主文・monoラベル・本文creditという区別を保つ。実際のtransport字体をこの画像から承認するものではない。

**大きな構図変更と弱点**: 元は画面幅近い横一段の大字で、afterは右約300px幅の縦長手札に組み直す。左約6割が広い余白となり、主文は.7相当に縮小する。これは微修正ではない。creditは横三列から縦三段へ変わる。まとまった一紙面の階層と見出しの強さは残るが、元の横方向の迫力は弱まる。黄dotは元の「へ」背後からafterの「の」背後へ移り、白と黄色の局所contrastが低い。原寸では「の」を読めるものの、縮小表示で最も弱い箇所である。metadataは元々小さく、50% contact sheetだけでは全文精査できないため、creditの全文判読判断はnative keysで補った。

画像上の罫線はheader下/主文下/credit間に収まり、文字を切るような異常交差は見えない。黄dotと主文の重なりは意図的な元posterの語彙を保つ。手札一式は同じ右側のまとまりに保たれ、192コマ中で新しいstage端crop、所有紙面からの脱落、四字の逆転は見えなかった。frame0..2は両側とも主文が先にあり、dot、見出し、罫線、creditが段階的に入場する。frame6は両側ともcredit途中表示で、全文欠落と誤認しない。frame12以降にcreditが揃い、frame91以降の終盤ではdot/罫線/metadataが縮小・退場する対応を両側で観察した。主要四字は最後のframe95まで見える。新しい入口/出口cropは見えない。

AGENTS.mdおよびimplementation-review-policyを読んだ。checkpoint01/HANDOFF.mdは古いfamily状態とposter不足を記録しており、poster04の実見承認の代わりにしていない。レビュー時点でposter04内のHANDOFFは未発見。未確認を成功扱いせず、親の固定commit/pinと最終HANDOFFは追記待ちとする。

承認を拡大しない範囲: realtime motion/滑らかさ、任意時刻の数学的全時間保証、他variant/tate/block、長文、他領域/半径/縦横比、EN、transportフォント、実アプリ操作、公開結果。公開URLへの接続・browser/captureの新規実行・公開結果確認は一切行っていない。公開結果確認は利用者指示により中止・対象外。

生成decode/contact sheets/checksは `/workspace/lyricfx.JIZURA/scratch/avoid008-poster-visual01/` の自身生成物だけ。元MP4/PNG/log削除、製品編集、Git/index操作はしていない。


## 固定候補への接続補足

親から固定commit識別 `4d0a25d` を受領、当担当Git未検査。Git object照合は親の担当であり、当担当の最終Git一致の主張ではない。初稿で待ちとしたposter04/HANDOFF.mdとsourceStartEnd.jsonを追加で読み、前段の不足はこの補足で更新する。再decode/再実見は行わず、初稿の画像観察・構図変更・低contrast等の弱点・限定PASS・未確認範囲はそのまま維持する。

sourceStartEndのstart/end両辞書はresults.jsonの元100pinsと完全一致し、start=end、unchanged=true。100件のimmutable gzip snapshotの展開bytesもend値と全一致。媒体manifestはレビュー済みSHAのまま、元14assetsも全一致。after compiledはsourceStartEnd内JAと一致する。media inputPinsのうちraw100にあるfixture3件/font8件の11件も全一致。後発capture runnerはraw100にはなく、独立したmanifest asset/input pinで照合済みとして区別する。

固定候補の主要pins: 09h `26564f109a0c9d5819bc921687e88c124007a4f36b70e9f5adb7526c59fe904c`、11p `b5fb7105e28ab4702d459a8f5f8e2af6186471f550f82d9c32dc17cac30e6c5c`、JA `be8f37463052ae10b17e242a74b26378356dc3b729c62a327a7031d25c577d7f`、EN `977f4d599a056bb80e9a9d4d820c80741fcfb625e26164de19f6e20ba36dcdd0`。HANDOFFの有限handbill/.31幅/.7主文字/同一metadata/font/clock/ownerという説明と媒体条件は対応する。HANDOFF内の独立実見への言及は当担当の画像判断の追加根拠には使っていない。EN pinの照合をEN画像・runtime承認へ拡大しない。
