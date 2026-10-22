# HELLO landscape preview01 独立視覚レビュー

2026-10-22。対象は `work/avoid008-c-preview/badge-hello-landscape-preview01/` の1 fixtureのみ。親から画像の印象を引き継がず、ローカル原本を独立確認した。AGENTS.md、implementation-review-policy.md、visual-review-comparison.mdに従い、公開先接続・公開HTTP/hash/動画/UI/起動確認、製品変更、試験実行、Git mutation、再captureは行っていない。

**判定: この限定fixtureでは視覚的blockerなし。** HELLO名札としての意味と階層、文字と白い記入欄・暗い丸角板の所属、上方から落ちて揺り戻す入場と右下へ回転しながら薄くなる退場は判別できる。これは一般の安全数値、全フォント、別variant、別寸法・入力・radiusの承認ではない。親による人間確認要否の判断を置き換えない。

## 原本・条件の照合

manifest SHA-256は `09ae90b63ffe26e1725682a4bffb817b65cff6e1dfe9aa1191d40b24b5ed4e2b`。101 assetすべてのbytes/hashが一致し、82 JavaScript source pinについてgzip展開内容・現worktree内容が双方一致した。前後compiled、A/C fixture、capture scriptの展開hashもmanifestと一致。before compiledはGitの `2bb3f864b5d40361961d8ad2aabeec24bfb5d1cb:index.html` とread-onlyで一致確認した。単にmanifestのbeforeラベルを信用していない。

capture scriptはbefore用の別pageとafter用の別pageを作り、同じspecとfixtureで描く。beforeは旧compiled、newPath=false、afterは現compiled、C finalizationあり。双方1920×1080、seed704、`nameTag`/`hello`、文字「風の先へ」、center=(.5,.42)、radius=.2（short sideの216px）、4秒、24fps、frame0〜95、native canvas描画、noHud/noPost。camera等を含む共通fixture設定もsourceを確認した。前後frame JSON各96行のframe/time=n/24が一致し、after observation motionTimeの最大誤差は4.44e-16秒。8 key PNGのhashは対応するframe JSONと一致する。beforeにC observationがないことはsource上の旧描画と整合する。

ローカルNotoSansCJK-Regular.ttcのhash `b76b0433203017ca80401b2ee0dd69350349871c4b19d504c34dbdd80541690a` がpinと一致。fixtureはFontFace.loadとdocument.fonts.readyをawait後、全登録faceをAvoid006Fixture/weight400へ置換する。ttc全10faceのcmapに対象の英字・空白・日本語があることも独立確認した。保存されたinitialにはfontLoaded実測フラグを収録していないため、そのフラグの新規実測はしていない。原寸で豆腐・置換字・欠字は見られない。元のgothic_black/gothic_med/kleeの異なる外観は未審査。

選択された実recipeはobjectScale=.7、badgeMeasure=.8、headerMeasure=.8、writingMeasure=true、exitAxis=native。segment from/toは同じ[-582.4697637941291,-13.538942670546243]、anchorConnectなし。sourceのq=outBack(e,1.6)、rot=p.tilt*q+(1-q)*-25+eo*18、native入場dy=378、退場dx=192/dy=540の分岐と整合する。manifest内の一般的なanchor説明・「intermediate translation changed」はこのfixtureの固有記述としては不正確で、実recipe/固定offset/sourceで判別した。安全proofの文言は視覚判定の根拠として採用しない。

## 実見範囲と観察

ffprobeを独立実行し、前後ともH264、1920×1080、24/1fps、4秒、96 decoded frameを確認。MP4全192frameをffmpegでdecodeし、同縮尺の12時刻×前後contactsheet 8枚ですべて実見した。加えて保存済みnative PNG f6/f36/f91/f93の前後全8枚を1920×1080 original detailで実見した。MP4の圧縮フレームとnative key PNGを区別している。

| 時刻/frame | 観察 |
|---|---|
| f0〜f2 / 0〜.083秒 | f0双方空。f1は透明な板/見出しが上方から入る。beforeの上端cropをafterで増やした様子はない。f2でHELLOとmy name isが読める。|
| f3〜f6 / .125〜.25秒 | 板が下降して回転角を戻し、少し下へ行きすぎる揺り戻しを双方で確認。白欄・HELLO・my name isが先に現れ、f6原寸は双方とも名前がまだ出ていない。紙と文字が別方向へ外れる破綻なし。|
| f7〜f12 / .292〜.5秒 | 名前が現れる。before「風の先へ」1行、after「風の／先へ」2行。全4字を確認し、行同士・headerとの重なりなし。板と一緒に戻ってholdへ収束。|
| f12〜f86 / .5〜3.583秒 | 全holdで名札として読める。f36原寸はHELLOが大見出し、my name isが小さい補助、名前が白欄の主内容。板は横長1.515から1.212へ正方形寄りになり、headerは高さ比.30→.24、白欄は.58→.70。縮小一様相似ではなく、二行の名前が白欄を強く占める。特に「先」の下余白はbeforeより非常に狭いが、原寸で文字下端は白欄内に残り、欠けを認めない。丸角外板も残る。|
| f87〜f91 / 3.625〜3.792秒 | 双方とも右下へ動き始め、時計回り回転が増す。f91原寸は全metadata/全名前が可読で紙内にある。afterが横滑り退場へ変わる様子はない。|
| f92〜f95 / 3.833〜3.958秒 | 双方で白欄と文字が薄くなりつつ下降・回転。f93原寸でbeforeの紙下部はstageに掛かるが名前は全字可読、afterは紙全体と全字がstage内。f95では双方の下部にstage cropがある。新たに早い段階でafterだけ字を切る欠陥は見られない。|

同じ画面上の移動量でもafterは板高が785.664→549.9648となるため、板の高さに対する落下量が増え、左に寄った小さい名札として見る印象になる。特に入場の移動は相対的に大きく、退場時の画面cropは遅くなる。これは元と芸術的に完全同一という判定ではない。ただし、この条件では上方drop/overshootと右下回転fadeという動きの意図は維持され、板から文字が取り残される/metadataだけ消失する等の順序逆転を認めない。

## 証拠と後片付け

機械照合、ffprobe、実見frame/key一覧、contactsheet hashは `badge-hello-visual01-metadata.json`。補助contactsheetは `scratch/avoid008-badge-hello-visual01/sheet-00-11.jpg` から `sheet-84-95.jpg` の8枚。原MP4・全8native key・source archiveは変更せず保持。自作decode PNG列192枚（47,049,809 bytes）は実見後削除し、他担当のscratchは触っていない。実行したffmpeg/ffprobeはすべて終了し、動作中のmedia processは残していない。

公開結果確認は利用者指示により中止・対象外。UI/公開版の見え方や、収録のないfont別・variant別の結果は未確認のままであり、成功へ置換していない。
