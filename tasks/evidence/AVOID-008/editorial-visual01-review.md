# AVOID-008 editorial visual01 独立ローカルレビュー

判定: **全体は素材対応FAIL**。一致する目次/脚注の表示範囲には限定PASSを付けるが、雑誌の混在copyの原寸細部、実注釈copy、円安全、active遷移、リアルタイムの動きは承認しない。親エージェントは画像未見。このレビュー担当が画像を実見した。

## 素材・同一性

対象は別worktree `/workspace/avoid008-editorial/tasks/evidence/AVOID-008/editorial/preview01/` と `native-stills01/`。公開URLへの接続、公開HTTP/hash/画像/動画/UI/起動確認は行っていない。AGENTS.mdの恒久禁止を適用し、既存証拠や実装は変更していない。

- preview manifest SHA256 `dc082b1f634adbdf83aeca80bb640023f20248cf95ae43587e1bb44fb7daa91b`、native manifest `73a025ee24cad24792517aeb8897736b9dd862d91a085029c9a7a8f48e2b4bfc` は指定値と一致。preview記載31assetsとnative18PNG全件のbytes/hash、native inputPins全件が一致。native記録のchangedInputsは空である。
- baseline compiledはimmutable `7cd5a5b:index.html` とcheckpointのbefore gzip展開の両方で `17e35475df196fc87a931802a21683a1d4c7b0cafcbba88feb2e50c9ba708456`。afterはcheckpoint matrix04 gzip展開で `db371e02b0365e6368b1e4cfe7973f4f438ee7cdc35f929d0a244530a86f0bc5`。preview/native manifestのcompiledと一致。
- afterのsourceを `4c3d36d` 全体と完全一致とは主張できない。preview.source.filesのうち `src/09g_layoutsC_placement.js` はmanifest `34f43d6c1e99f31ac89de6f4cffa57b24fba58978d8eae95d90970601de307b9`、同commitでは `f84a8052c413e184c202f17a143f2ee18c2bab4cb17ee5523eaf00798ebc3429`。他記載JSは一致。checked-in Git index.htmlとafter生成compiledの同一性も主張しない。
- ffprobeを独立再実行し、6MP4すべてH264/yuv420p、24fps、96 decoded frames、4.000000秒、audioなしを確認。雑誌は320×320、目次/脚注は480×270。元Canvasは640×640/960×540。スクリプト実読でfull-stage native描画→0.5 Canvas縮小→PNG pipeをffmpegへ送る構成を確認。UI録画やPNGの再生録画ではない。
- frame logsは各side96連続frame、時刻n/24。保存PNGと該当log hash一致はassets/同logの照合により識別。PNGとMP4 decoded同frameは圧縮差あり（最大RGB平均絶対差1.896/255）。原寸再描画と縮小PNGは目次/脚注で位置・copy対応を実見し、縮小補間後の最大RGB平均絶対差1.083/255。雑誌は下記FAIL。

## 実見方法と範囲

ffmpegで既存6MP4のframe0–95を全抽出。各case12frameずつ、左before/右after、連続frameと秒を付けた8枚、計24枚の対比sheetを全実見した（合計576画像）。sheetは240×240又は240×135/sideで、大局的な動きと欠落検出用。細文字のPASS根拠をsheetだけに置かない。補完原寸PNGは各case×before/after×frame6/36/91、18枚を原寸640×640又は960×540で全実見した。scratch成果物と機械検査は `scratch/avoid008-editorial-visual01/` に保存。

リアルタイム再生は未実施。frame列の時計と段階の比較であり、体感の速度、滑らかさ、残像の承認ではない。新規レンダー、ブラウザ起動、UI操作を行っていない。ffmpeg/ffprobeは完了し、この担当のmedia常駐プロセスなし。

## FAILと各caseの視覚結果

### F1: 雑誌原寸補完が別copy（証拠対応FAIL、重大）

`magazine-headline-4` のpreview MP4全frame/旧PNGの本文は『雨上がり / Hello / 123』。native-stillsのframe6/36/91両sideは『風の / 先へ』である。例えばf36=1.500秒は見出しの字・行数、本文反復copy、左メタデータ『12CHARS』対『4字』まで変わる。前後差の回帰ではなく補完と元動画の素材不一致。preview scriptがmatrix04のspecで描画しながらmanifest.conditions.textを『風の先へ』へ上書きし、native scriptがこのconditionsを再描画していることを実読確認した。最大RGB平均絶対差9.492/255も対応失敗と整合する。

preview前後同士は混在copy、640²、短辺r=.1、中心(.9,.1)、seed/字体/時計が同条件。角例であり通常円の成功に数えない。frame0–18付近で紙面が開き、左見出しと右写真枠・黄色要素・2段本文が出現、hold中は紙と字が一体のままafter全体が約32stage px下がる。frame88–95の閉じる順序もbefore/afterで同じ段階に見える。見出し、写真枠、本文、ページ番号の大きな新規欠落やstage外cropは全frame sheetでは検出しない。紙面内の黄色要素が本文の先頭付近へ重なる傾向は双方にある。混在文字の原寸対応素材がないため、細文字可読性、文字と紙の厳密な関係、細かなcrop/重なりは**未判定**。別copyの原寸で補ってPASSにしない。

### F2: 脚注に指定実copyが表示されない（証拠要件FAIL、重大）

`footnote-native-1` はinput.note='遠い空の向こうへ'だが、f36=1.500秒/f91=3.792秒の原寸両sideで実描画は『※1 風の 00:00.00』『※2 先へ 00:02.00』。指定実注釈は存在しない。beforeから同じ欠落なのでafterが消した回帰とは判定しないが、『指定input.noteのcopyを検査済み』は不成立。source固有の脚注は実描画されている。この判定は説明・証拠の対応に限り、元sourceが使わないinput.noteを表示する新機能を要求するものではない。

一致範囲の限定PASS: 主文『風の先へ』はafterで『風の』『先へ』の2行に再構成され全字可読。※1/※2は各行の右上へ離れ、before f36の※1が『先』上部へ接する状態より対応が読み取りやすい。下部注記は2行・記号・時刻が対応し、罫線とともに右寄りへ移る。f6では両sideとも注記前、f10前後から記号、f12–18付近から罫線/注記の出現という順序が保たれ、holdと終端f95まで新規字欠落、stage crop、異常な独立移動は検出しない。脚注は紙/板のない暗背景なので紙との一体感は該当しない。実noteの長さや読順は未判定。

### 目次: 一致範囲の限定PASS

`contents-tate-1` は960×540、通常円(.5,.42)、短辺r=.2、同copy/seed/字体/24fps時計。afterでは目次一式が右へ移り、本文列『風・の・先・へ』、終/序、縦点線、番号046/026/000、見出し『目・次』と区切り罫線が対応を維持する。原寸f6/36/91で『目次』は右端に近いが全字収まり、f36の『目』も切れていない。before同様の縦読順を維持し、番号と列の紐付け、黄色線と026のactive表現を読める。新規重なり/字欠落は検出しない。f0–12付近の線・周辺要素の出現、hold、末尾の周辺要素の薄れは同じ時計の段階を保つ。

ただし全96frameでactiveは『風の先へ/026』のまま。別項目へのactive変更とその際の再配置・読順は素材がないため未判定。目次にも『遠い空の向こうへ』は見えないが、この素材はその注釈を描く証拠には使わない。

## 共通の未判定と限界

円ガイドが画像にないため円内侵入/余白の視覚的な円安全は未判定。manifest/trajectoryのsafe値を見た目のPASSへ代入しない。8 actual-face C-corpus fixtureに限定し、productionの全font family・全copy・全variant・全画面比率を証明しない。通常円の雑誌成功、目次active変更、指定実注釈、4秒外のentry/exit完結、実時間の動きの心地よさは未判定。全体FAILを解消するには正しいactual inputsをassertした別build素材で再レビューが必要。既存preview01/native-stills01/旧失敗は保持した。
