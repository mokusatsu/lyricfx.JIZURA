# 学校名札 physical paper / native typography（独立視覚・親未受入）

旧anchor02の上側配置は、native dropが約672px→83pxへ短縮され「ほぼその場で回転して現れる」と独立レビューで判定された。旧数値・素材は保存し、今回の成功と混同しない。

今回の候補は名札の物理的な縦横比を固定して紙だけを `.65/.6/.55` へ離散調整する。主字のnative字号と改行を元の full-stage sourceから求め、主字を最低 `.7native`、明示サイズではnative exactに補償。実ラベルも最低 `.7native` の字体比を保つ。紙と文字の比率は変更されるが、全紙/影/ピン/線/丸/学級欄/主字を一体で動かす。全stageを小viewportに縮めて再生成する方式ではない。

- `school` の通常 portrait 1080x1920 / circle(.5,.42,.2) は紙`.6`、主字`.7`、metadata`.7`、元の学級欄・主字field・native改行で成立。
- main=123.790464px、最小metadata=25.486272px（実floor21.6px）。全3印刷fieldのpreclip実glyph包含を検査。pin等を未分類補助へ落とさず全9eventsを保護。
- 元のentry/exit screen center anchors、q/outBack(1.6)、z/inCubic、回転(-25→native tilt→tilt+18)、alpha時計を保つ。途中の移動量は変わる。
- offset約(0,+263.951693)。entry world distance935.951693px（元672px）、exit704.377204px（元966.055899px）。
- 紙height312.0768px（元520.128px）。entry距離/紙height=2.999107（元1.291990）、exit同=2.257064（元1.857343）。entry世界距離非短縮、exit紙height比が元以上となる候補だけを探索する。
- native full travelは先に探索したが不足。下側anchorはnative clear-prefix/suffix・camera reserveまで含む連続包絡で採用。entry/exitの円通過はholdの安全実績へ数えない。

`hello` の紙`.65`は全field-fit可だがnative full travel/非短縮entryの下側anchorは不足。`.6/.55`はnative1行・字号`.7`の主字がfield外でreject。`.64`境界も確認したがhelloはfield外でreject（probe18に保存）、最終候補へ追加しない。印刷欄の配分変更はまだこのcheckpointへ混ぜない。hello旧anchor02は動き変更の未受入候補のまま。

`physical01`は現sourceで96frame runtime・実record9eventsの端点/角度/移動量、6点helper-rebound全owned raster、entry/exit forged safe2件の拒否を確認した。`crop08-physical-school`はmain/metadata/全ownedの入場crop長期化・退場crop早期化を実alphaで比較し違反0（元紙firstExitCrop93→after95、主字/metadataは最後まで欠けなし）。native exit cropは一律禁止していない。`badge-preview03`が同条件24fps96f前後MP4と原寸keysを保持する。画像/動画を実装担当は実見していない。

条件はsingle Noto substitute font、school portrait1fixture。多字体、長文、他aspect、camera/fx、全regionと性能・最終回帰の受入を意味しない。C34完了ではない。公開結果確認は利用者指示で禁止・対象外。
