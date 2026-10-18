# 反復補助と主歌詞の静的レビュー

追加指定を反映するため、実行時registryから取得したrenderSourceと元ソースを確認した。分類は描画コードの観測と対応案であり、実装・個別の視覚試験は未実施。mainDrawを直接呼ばないことや`.repeat`/tileという文字列だけで分類しない。

[全184IDの責任分担表](layout-inventory.csv) ／ [収集したrenderSource](runtime-probe.json)。下表の20ID以外にも補助描画があり得る。全体の役割確定はAVOID-002と各adapterタスクの必須条件である。

| ID | 静的観測 | 描画単位・対応の注意 | 元ソースの登録行 |
|---|---|---|---|
| tile | 補助反復あり | 敷き詰め行。主歌詞とknock箱/outlineはprimary。 | src/06_layouts.js:261 |
| marquee | 補助反復あり | ysの反復行とrowStyle帯。最後の主行はprimary。 | src/06_layouts.js:233 |
| gloss | 補助反復あり | bgTextの3行。主行・意味のある注釈はprimary。 | src/06_layouts.js:469 |
| diag | 補助反復あり | P.secondの繰返し副帯。斜め主帯/主歌詞と所有を区別。 | src/06_layouts.js:522 |
| hrRedacted | 補助反復あり | filler rowsのbody.repeat(6)。黒塗りバーの所有、FILE/stampの独立装飾を区別。 | src/11p_horror1.js:552 |
| ticker | 補助反復あり | scrolling copyのunit.repeat。headlineはprimary。tag/時計との所属を固定する。 | src/11p_layoutsA.js:943 |
| edgeFrame | 補助反復あり | 四辺のfastRow反復。中央主行はprimary。corner/inner枠は別分類。 | src/11p_layoutsA.js:1171 |
| crossBands | 補助反復あり | 交差する2帯のunit.repeat。中央主歌詞のプレートはprimary。 | src/11p_layoutsB.js:621 |
| tyBandHide | 補助反復あり | 主行の後に重なる反復帯。主行はprimary。元の前後順を変えてはいけない。 | src/11p_typo1.js:246 |
| rain | 補助大量描画・方針要分類 | 背景glyph gridを確認。主文字の落下先頭字・そのtrailと区別し、gridのマスク候補を002で固定。 | src/11p_layoutsB.js:90 |
| tunnel | 補助大量描画・方針要分類 | 複数矩形の周囲に補助文字を配置。中央主行を別描画。円軌道とは別。 | src/11p_layoutsB.js:326 |
| wordCloud | 補助大量描画・方針要分類 | buildCloudのlayをenv.draw、中央主行をmainDraw。散布型の補助を今回の除外へ含める範囲を002で固定。 | src/11p_layoutsB.js:393 |
| zoomRepeat | 補助大量描画・方針要分類 | 拡大コピーをenv.draw、主行/outlineをmainDraw。背景コピーを今回の除外へ含める範囲を002で固定。 | src/11p_layoutsB.js:1174 |
| dotMatrix | 反復検索の誤検出 | repeatはLED模様。点群で主歌詞を表現するためprimaryの軌道対象。 | src/11p_layoutsB.js:1404 |
| vinyl | 反復検索の誤検出 | arc.repeatはSIDE/RPM等のラベル。主歌詞はレコード/ジャケット上。名前で中心専用へ変更しない。 | src/11p_layoutsC.js:1643 |
| tiles | 反復検索の誤検出 | tileは主文字を載せる板。大量の背景歌詞を敷くtileとは異なる。 | src/11p_layoutsD.js:1198 |
| ledScroll | 混在・主歌詞反復は除外しない | 主パネルの繰返しは主行のスクロール。info帯は注釈、LED patternは文字タイリングではない。 | src/11p_layoutsD.js:1386 |
| dominoes | 反復検索の誤検出 | tileは主文字を載せたドミノの局所座標。板と文字を一緒に扱う。 | src/11p_layoutsD.js:2055 |
| mosaicTiles | 反復検索の誤検出 | 点/タイルの集合が主文字を形作る。主歌詞のclipと模様を保持し軌道対象。 | src/11p_layoutsD.js:2669 |
| maskReveal | 反復検索の誤検出 | 歌詞パターンは主文字の塗りtexture内部。主文字ごとprimaryで変換し、別背景として穴を開けない。 | src/11p_layoutsD.js:2753 |

反復を含む円軌道7候補は別契約であり、一括でマスク対象へ変更しない。強調・手動・lockは共通優先順位を適用する。円の初期位置やマスク幅の数値は利用者指定値ではなく設計案。

現在のRendererはcut opacity等のため主歌詞・装飾・ghostを平坦化する（src/09_render.js:199以降）。補助反復だけを消すには、それ以前から役割を識別し、後続FXの変換後まで追跡する必要がある。特にtyBandHideは主歌詞より後に帯を描くため、「補助は全て背景へ移す」分離では現行の意匠を保てない。
