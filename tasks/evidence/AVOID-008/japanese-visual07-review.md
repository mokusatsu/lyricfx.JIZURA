# AVOID-008 Japanese visual07 — 独立ローカル実見

判定: 指定5件すべて限定PASS。material mismatchなし、実見した範囲に新規の部品分離・stage欠け・文字の早すぎる退場は認めなかった。これは各receiptの正確なfixtureに対する判定であり、円回避の数値安全、他variant、他入力、原brush/mincho/gothic多字体を承認するものではない。親の数値結果を視覚判定の根拠にしていない。

## 対象の同定と先行した実bytes確認

正本handoff: `/workspace/avoid008-japanese/tasks/evidence/AVOID-008/japanese/visual-handoff07.json`。5bundleの絶対path、receipt SHA256、全5assetsのsize/hashを実ファイルから照合し全一致。before/afterのMP4・PNGは変更していない。

- 旧3件はd87053c、新2件は233586cからscratchへ読み取り復元。共有09gはhandoff pinと一致する現行ローカルbytesをコピーして使用し、それぞれ隔離したscratchでbuild.pyを実行した。source3本、fixture/capture scriptのcheckpoint bytesがreceiptと一致。JA/EN生成HTMLがそれぞれreceipt hashと一致した。Gitに保存されたcompiled HTMLや現在の変化後の作業ツリーをafterとして扱っていない。
- immutable native baseline gzipと展開HTMLのhashを照合。beforeのrender identityはbaseline、afterのrender identityは正しい復元生成JA HTMLに含まれることを確認。JAのinline script/style hashもmetadataに記録した。fixture scriptでoneNoto alias weight400、before/after別page、before area=null/no adapter、独立J.plan、同入力比較、i/24 capture、f36 PNGの手順を読んだ。これはローカルbytes/記録の監査でありcaptureを再実行した主張ではない。
- 各receiptのspec、sourceStart/sourceEnd、cut inputs全文一致、NodeでJSON.stringifyした入力のSHA256、native params、actual area/no trajectory、clockを独立照合。540×960、text「風の先へ」、start/end=0/4、in/out=.35/.4、cut/cut、still、pushが一致。font元TTCの実bytes hashも一致。
- ffprobeで各10MP4が540×960、H.264/yuv420p、24fps、4.000000sec、96framesであること、全timestampがi/24（出力丸め1e-6以内）であることを確認。ffmpegで全フレームをRGBへdecode成功。

全フレーム実見は各caseの前後f00〜f95を省略なし、同一frame左右対の4枚のcontact sheet（00–23、24–47、48–71、72–95）で行った。sheetの各画面は135×240に縮小し、原寸f36 PNG前後10枚と、下記入退場/遮蔽の原寸動画frame対11枚、および短冊の原寸接続/下端cropを別途実見した。実見したファイル一覧はmetadataに記録。補助画像はscratch内のみ。

## case別判定

| Case | 限定判定 | 主要実見 |
|---|---|---|
| tanzaku-preview02 | PASS | 主紙1枚・空短冊1枚、branch/leaves/string/穴/紙/影と縦読順を保持。0.7縮小・下移動後も接続維持。|
| warning-preview02 (header) | PASS | triangle/!/DANGER/危険/主字/下端No.01—00:00.00/紙縁が1物体として0.9縮小・移動。|
| price-shelf-preview01 | PASS | お買い得・No.01、商品名、¥980、税込、barcodeと板の位置関係を0.7縮小後も保持。|
| shoji-open-preview01 | PASS | 全高panel/lattice/gap/開閉を保持、主字のみlocal y=.5→.75。字形・字号と途中の遮蔽を保持。|
| station-nopost-preview01 | PASS | 元から支柱なし。SN22 badge、主字、No.01、←SN21/SN23→、帯矢印が板ごと.95縮小・下移動。|

### tanzaku-preview02

f00–02(0–.083s)は前後とも主紙未出現、f03(.125s)で2枚が出現。元のnativeでは初期dropにより上側stage cropがあるが、afterは下移動後でstage内にある。新しいstage cropではない。f06(.250s)原寸では枝の順次描画がまだ空短冊の付近まで達していないため紐上端が一時的に枝から離れて見えるが、beforeにも同じ現象がある。f08(.333s)以降に主字が出現し、f14(.583s)付近でdropの収束を確認。保持中f24–86では枝から2本の紐、穴、主紙/空紙へのつながりと左右のswayを維持。f36(1.500s)原寸と接続cropで紐/穴/枝の相対位置、縦の「風→の→先→へ」、紙下端がすべて画面内であることを確認した。

f92–95(3.833–3.958s)は紙が逆方向へ傾き、空紙が主紙に重なり透ける。f93原寸でbeforeにも同じ透過重なりがある。新規の文字欠落や別タイミングの退場ではない。影は暗背景上で微弱だが紙に沿ったまま。branch/leaves自体を円回避対象から除外する設計の妥当性は親のsource判断に残す。ここで承認したのは観察した接続と動きであり、円衝突ではない。

### warning-preview02 — header限定

f00は空、f01(.042s)で紙、f02(.083s)でtriangleと英日header、f03(.125s)で主字が出る同じ順序。f06(.250s)原寸でtriangle、!、DANGER、危険、主字、下端metadataがすべて紙の傾きに追従し、outBack入場の収束中にも分離しない。全保持frameのtriangle点滅は前後同じ位相で、metadataは小さいがf36原寸で存在/配置を確認した。下移動した紙の下縁にも余白があり新規stage cropなし。

f90–95(3.750–3.958s)では紙縁・header・主字が同時に透過退場。f95原寸の半透明header帯もbeforeと共通。主字だけ先に消える、新しい縁欠けは認めない。別warning variantは未実見。

### price-shelf-preview01 — shelf限定

f01(.042s)で板/header/barcodeが現れ、f04(.167s)に主字、f08–10(.333–.417s)で価格と税込が現れる。原寸f09で価格の登場途中の小ささ/透過もbeforeと対応。f36では「お買い得 · No.01」、商品名「風の先へ」、¥980（通貨単位を含む）、税込、barcodeが元の左上/右下/左下配置を保持する。独立した商品数量単位や旧価格はこのshelf sourceには元からないため、それらの新規消失とは判定しない。

保持中に名前/価格の欠けなし。f92–95の板下降と透過も同じclockで、f95原寸で価格/税の減衰はnativeにもあり、afterだけ早く消えるものではない。afterの上寄せは入場・保持・退場を通して板/ラベルがstage内。新規cropなし。

### shoji-open-preview01 — open限定

f00は前後とも全面が閉じた2panel。格子の行位置と全高960pxの枠は変わらない。f04–08(.167–.333s)で中央gapが開く過程、f06原寸で左右の文字端がpanelに遮蔽される位置、f09(.375s)で4字全部が見えることを前後で確認した。保持中f09–90(.375–3.750s)は全字が読め、afterの文字は下へ約240px動くが下端に余白を保つ。f36原寸で字形・字の大きさ・2行の「風の/先へ」が等しい。

f91–95(3.792–3.958s)に閉じる順序とgap幅は対応する。f93原寸では文字の中央断片だけが狭いgapから見え、beforeと同じ前景遮蔽。これは元からのpanelによる隠れで新規stage cropではない。全高panelを小さくしたり下へ移す変化は認めない。f95のほぼ閉じた細いgapも両側共通。

### station-nopost-preview01 — posts=false限定

f00は空、f01で白板、f03(.125s)で主字、f06(.250s)頃から帯、f07以降でbadge/補助文字が出る。同じ順で保持状態へ到達。f09(.375s)原寸で帯の描画途中、SN22 badge、No.01、前後駅コードはすべて板と同じ変換。f36原寸で主字が全4字、SN/22、中央No.01、←SN21、SN23→、右向き帯矢印の存在を確認。romaji slotはこのfixtureではnativeもafterもNo.01であり、実在のローマ字駅名が保持されたという承認ではない。

f84–90でも全metadataを板内に保持。f91–95はnative同様に帯が短くなり板が下降/透過する。f95原寸で主字が残り、metadataの薄まりもbeforeに対応する。after板下端にも余白があり、新しいstage cropや文字だけ先にstage外へ出る現象なし。支柱は前後ともない。

## 範囲外と終了

未実見: リアルタイム24fps再生・聴覚、f間の補間時刻、t=4.000以後、別aspect/seed/文字/variant、全字体・実brush/mincho/gothic・fallback cmap、多字体の文字幅、editor UI/実操作、円回避の全時刻数値安全、他のpreview。single-Noto-Regular transport aliasだけの判定。receiptに保存されていない完全なruntime planを再生成した主張はしない。material mismatchと製品不具合は別項目で記録し、どちらもこの範囲で未検出。

AGENTS.mdとtasks/implementation-review-policy.mdを読了。利用者指示により公開結果確認は中止・対象外。公開URL/HTTP/hash/画像/動画/UI/起動確認を行っていない。レビュー中はサーバー/ブラウザを起動せず、したがって外部originへの通信もない。ffprobe/ffmpegはローカルファイルdecode後にすべて正常終了。実装/source/testsは変更していない。親によるコードレビュー・人間レビュー要否の判断は別途必要。
