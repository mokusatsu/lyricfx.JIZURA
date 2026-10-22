# AVOID-008 contents-preview01 独立ローカル視覚レビュー

判定: **限定PASS**。固定された単一の landscape rows / bar / mincho / ctx=true、中央(.5,.42), r=.2、960×540・4秒の例では、目次としての行の所属・読順・継続するactive選択を保持している。AVOID-008全体、他variant/marker、全54例の視覚合格を意味しない。親によるコード・数値証拠レビューや人間確認要否の決定とは別の独立所見。

レビュー担当: gpt-6.1-sol / medium。AGENTS.md、implementation-review-policy.md、visual-review-comparison.mdを読んだ。公開URL/HTTP/hash/画像/動画/UI/起動等の公開結果確認は利用者指示による中止・対象外。ブラウザ起動、新capture、製品・tests・元資料変更、Git mutationは行っていない。

## 実見したもの

before.mp4 / after.mp4をffmpegで独立decodeし、各frame 0–95の全96枚（合計192枚）を、480×270を縮小せず4×3で配置した16枚の番号・時刻付きsheetで実見した。連続した順序の静止frameによる確認であり、実時間の動画再生・聴覚評価ではない。さらにbefore/afterのframe 6 (.25秒)、36 (1.5秒)、91 (3.7916667秒)の原寸960×540 PNGを6枚、個別に実見した。sheetと独立decode hash receiptはscratch/avoid008-contents-visual01、詳細はcontents-visual01-metadata.jsonに保持。

## 画像からの所見

- 「目次」とCONTENTSは上部、序章/000はその下、01「世界の」026、02「向こうに」032、03「響く歌声」038、終章/058は最下部という順序が前後とも判読できる。afterは右側の細いledgerへ移り、左側に広い空白を確保する。番号列・本文列・右揃えのページ列の関係は維持され、別行への取り違えは見られない。
- 原寸keyで本文の日本語に欠字・豆腐・新cropは見られず、番号やページが本文と重なる異常も見られない。上下罫線とcontext行も画面内に収まる。本文は白で十分読める。番号/ページはbeforeより小さくなり、480×270では細かい数字や低コントラストの序章/終章は読み取りにくい。原寸では読めるため、この例で読順を壊す程度とは判断しないが、小さな動画表示での可読性改善を証明しない。
- afterのleaderは実際に短い。特に02/03は原寸でも本文末とページの間に数点だけ残る。beforeの長い「点線でページへ導く」印象は弱まるが、点は本文末尾側の同一行にあり、揃ったページ列・番号・行間の助けで対応は追える。これは無変化/同等の版面とは記録しない。序章/終章には長い点線が残る。初期の短い点も実見範囲では本文やページを侵食する太い塊になっていない。
- barは行左に一つ現れ、当該番号・leader・ページの琥珀色と一致する。frame 29→30で01から02へ、58→59で02から03へ切り替わることを前後で実見した。markerが全時間01に凍結する、別行のページだけを強調する、複数行へ迷入する挙動は見られない。tri/dotはこの素材に存在せず、所属・形状・見え方とも未確認。
- 冒頭は見出し/context/番号/罫線等が段階的に現れ、主行が上から加わる。0秒では先頭本文だけが見え、初期の未出現文字を欠落とは判定しない。終盤frame 92–95で罫線・context等が薄れる/縮む。afterでもこれらの時間的な流れが残り、途中で版面が跳ぶ・異常に重なるフレームは全96枚の観測では見られない。明朝の大きな本文と目次の補助情報、順番に進むactive行という元の演出の意図は読み取れる。広い左空白と短いleaderという構図変化は残る。

## 証拠の対応を独立確認

manifest SHA256は指定のf1c109c91db3127cb8ced308ae387441c5780021c4d872d9980da7846fa7b0de。全14 assetのbytes SHA256、全inputPins（fixture3種、runner、8 font）を実ファイルから照合し一致。実MP4は両側96frame、480×270。ffprobeのframe PTSも0, .25, 1.25, 1.5, 2.458333, 3.791667, 3.958333秒を独立確認した。per-frame gzip JSONは両側ともframe 0–95・time=n/24・64桁encoderInputPNG hashを持つ。H264再decodeは非可逆なのでencoderInputPNGとdecode PNGのhash一致は主張しない。

before/after actual-inputsのsourcePlanは構造的に同一。W/H=960/540、fps=24、dur=4、seed=704、chunks=世界の/向こうに/響く歌声、page0=26/step=6、font=mincho、mark=bar、ctx=trueと一致。before renderPlanはsourcePlanそのもの、after actualCutはrenderPlan.cuts[0]と一致。after compositionはcontents-native-compact-ledger-0.31。note「遠い空の向こうへ」は入力にあるがこのsourceの表示とは主張しない。

比較runnerの静的読解によりimmutable swiss05のbefore/contents10のafter HTMLを使い、同じfixtureへ到達し、n/24をrenderer.frameへ渡し、PNGからMP4をencodeする経路を確認した。両compiled SHAもmanifestと一致。contents10のimmutable source snapshotを解凍した09h SHA=6a281b2a96fa4d635ef833e089c5db0c51209036995c32be31221cd2942f51a5、11p SHA=489a25cd931d258db618de3234a44edcce674eba8759728804b359045fdca950は依頼pinと一致し、両source本文は固定after compiled HTML中にそのまま存在する。e13be88は依頼の基準識別子として記録し、Git履歴の再検証は行わない。現在のworking sourceはこの固定snapshotと別bytesであり、本所見を現在版へ無条件に移さない。

11p snapshotのactive clockはmin(k−1,floor(clamp(lt/max(.3,dur*.92))*k))。k=3,dur=4では初めて第2行になるsampleはf30、第3行はf59で、実見の変化と一致。保存quality内のactive 0/1/2は対応の補助確認に用い、画像判定の代用にはしなかった。

font manifestのminchoはNoto Serif CJK JP Regular / Avoid008Editorial-serif-regular、実OTF SHA=d4bbf138f7cd85f73d2fafbf754510a120bb30a307116021e17e7704b96a731a。固定fixtureはfont byte digest確認・FontFace.load・document.fonts.ready/checkを待つ経路で、全8 font pinと実bytesが一致。今回新しい実行時font auditを取得していないため、ロード成功の独立再実行とは記録しない。可視の明朝字形と欠字なしは画像そのものから判断した。

index.htmlはローカル静的読解と参照ファイルの存在/hash確認を行った。before→afterのvideo controlsと各3 native PNGへの相対参照がある。HTMLの実ブラウザ表示・狭幅UI/操作/同期拡大・キーボード・公開結果は未確認であり、比較HTML契約全項目の適合PASSではない。

## 判定の限界

この素材は1例のみ。cols/tate/portrait、tri/dot、別font、他の円/半径/アスペクト、長文/Latin/手動/lock/ON-OFFの表示、全時刻の幾何安全性やUI操作は判定対象外。数値試験の自己申告を画像合格に置き換えていない。固定例について新crop・欠字・異常overlap・行の所属破綻・active clock退行を実見しなかったため限定PASSとする。AVOID-008全体の完了/人間確認不要はこのレビュー単独からは決められない。
