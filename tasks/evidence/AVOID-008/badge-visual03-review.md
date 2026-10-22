# AVOID-008 badge-preview03 独立視覚レビュー

2026-10-22 / reviewer `/root/avoid008_badge_visual03` / gpt-6.1-sol medium。実装担当から画像判断を引き継がず、ローカル媒体を自分で照合した。先にAGENTS.md、implementation-review-policy.md、visual-review-comparison.mdを読んだ。製品コード、Git、公開先には触れていない。

対象は `work/avoid008-c-preview/badge-preview03/` の1 fixture `badge-portrait-school-physical` のみ。manifest SHA256は `561c6bff7285abc2fc3467c86adb0d01ae0d1e815bf0ef8d7306547e8d03c627`。全100 assetsの実bytes/SHA256が一致した。receiptと個別hashは `badge-visual03-metadata.json`。

## 条件と源泉の照合

- before解凍HTML SHAは `ad7257a257ff7bfc43c07fe06bc83490d3cdf8b7fcf716019eb9b3e70e67ce57`。native01/index.html.before.gzの解凍bytesと自分で完全一致を確認、source-freeze.jsonのpinとも一致した。baseline `2bb3f864b5d40361961d8ad2aabeec24bfb5d1cb` への関係は既存badge-visual01-review.md等の直接Git照合受領記録で追跡した。今回の「Gitも触らない」制約下ではcommit自体との直接再照合はしていない。この部分を新しい独立Git照合済みとは扱わない。
- after解凍HTML、同梱A/C fixture、capture scriptの解凍SHAがmanifest各pinと一致。font実体 `/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc` SHA `b76b0433203017ca80401b2ee0dd69350349871c4b19d504c34dbdd80541690a` も一致。
- capture scriptは前後別pageへ同じspec/fixture/fontURLを渡しafterのみnewPathを有効化、native rendererへn/24を直接渡す経路。1080×1920、school、seed704、歌詞「風の先へ」、circle(cx=.5,cy=.42,r=.2 short side)、単一Noto代替書体が共通。
- 実MP4を自分でffprobe: 前後とも1080×1920/24fps/96frame/4秒。native frame log各96件のframe番号とt=i/24が一致。after realTime/motionTime誤差最大4.45e-16秒未満、beforeはobservationが無いため同時計の根拠は共通capture呼出経路とframe log（before observation実測を主張しない）。原寸key PNGのhashは各native logとも対応する撮影時刻のものとしてpinされる。

## 実画像receipt

MP4をffmpegで全frame PNGへ展開し、前後同じ180×320縮尺の対を12時刻ずつ配置した8枚のsheetを全てview_imageで実見した。対象frameは0–95双方、計192コマ。sheetは `scratch/avoid008-badge-visual03/pair-00-11.jpg` から `pair-84-95.jpg`。原画像を隠すcropはせず、全stageを同縮尺で使用。さらに同梱の1080×1920原寸key f6/36/91/93を前後全8枚、MP4抽出末尾f95を前後原寸で見た。独自派生画像は指定scratch以下だけ。

## 表示安全・可読性

**このfixtureの観測範囲で合格。** f36=1.500秒の原寸で「1 ねん 4 くみ」「なまえ」「風の先へ」が判読できる。紙の幅と高さが一緒に縮み、細長い板への変形は見えない。右上の円、上部ピン/線、学年・クラス欄、区切線、名前欄の関係も残っている。

afterは紙.6に対して文字>=.7を保つため、f36の本文が紙に対して大きく、beforeより左右・下余白が狭い。とくに右端「へ」はbeforeより紙端に近いが、原寸で白余白が残り、文字が切れる/紙外へ出る/欄や円と重なる状態はない。「なまえ」と本文の上下間隔も保つ。これは小さくなった紙全体を同率縮小しただけの外観とは異なるが、このfixtureでは名札の見出し・本文の階層を失っていない。縮尺sheetでは補助文字が小さくなるため、縮小画像だけで可読性を合格にしていない。

f6=.250秒は両側とも本文未出現の白い記入欄、f7=.292秒には双方本文が現れる。afterだけ本文が欠ける遅れはない。f12–86のhold中は紙・欄・文字がstage内に見え、新たなcrop/重なりはない。円ガイド自体は映像に無いため数値的な全時刻circle安全性を画像だけで証明しない（位置は円下に見える）。

## 動きの意図・具体的な違和感

**上から落ちて揺り戻し、落ち着き、最後に右下へ回転しつつ落ちる演出の系統は、このfixtureで受入可能。元と同一の移動ではない。**

- f0空背景、f1–6は上方から大きく下へ移動。f6–8で傾きと下方行き過ぎが見え、f9–12で少し戻って落ち着く。afterで登場が短い小移動に消えることはない。紙が小さいぶん移動量の大きさはむしろ強く見える。manifestの中心距離672→935.95px（1.393倍）、紙高さ比1.292→2.999とも整合するが、合格理由は実画像で落下・overshoot・戻りが認識できること。
- f12–86は小さい名札が画面下寄りに保持される。beforeの大判名札より空白の存在感が増え、本文は小さな板に大きく書いた印象へ変わる（代表f36）。これは具体的な外観差として残す。学校名札という視覚的意味と紙の縦横比は残るため、この1fixtureでは阻害的な違和感とは判定しない。
- f87–90は退場開始が小さく、f91=3.792秒で下向き移動・右下傾きが明瞭になり、f92–95で加速、双方同じ時刻に薄くなる。afterも右下落下と回転が視認できる。原寸f91/93では本文・欄が完全に残る。afterだけ早く消える/早く文字が切れる兆候はない。
- f95=3.958秒では両側とも紙下部がstage下端にかかり、beforeは右端もcrop、afterの文字全体はなお読める範囲で紙端の一部が下へ出る。afterに新たな早いcropを見ない。fadeによる弱まりは双方にあり、afterだけ退場を前倒ししたとは見えない。
- afterの絶対退場距離704.38pxはbefore966.06pxより短いが、紙高さ比では2.257対1.857。画面での名札は小さく、退場の迫力は大判beforeより控えめだが、f91–95に右下回転落下が残り、停止したまま薄れるだけには見えない。数値比だけで同じ意図と断定していない。

## 判定の範囲と終了

表示安全と動きの系統は **school portrait physical 1fixture限定で視覚受入可能**。全variant、hello、landscape、他seed/歌詞/長文、元のklee/gothic_medを含む実書体、全連続時刻への保証はしない。24fps画像判断は解析的安全証明の代替ではない。比較HTML本文/参照を読んだがブラウザ操作受入までは今回のレビュー対象として実行していない。baseline commitの直接再照合は上記制約による限定として残す。

ffmpeg/ffprobe媒体処理は同期終了済み。サーバー/ブラウザー等を起動せず、残した処理なし。画像は親へ返さず、レビューとmetadataを保存した。公開結果確認は利用者の恒久停止指示により中止・対象外。公開確認を成功とは記録しない。
