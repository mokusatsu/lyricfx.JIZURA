# AVOID-004 parent review

親のコード・ローカル検証レビュー: 承認。公開検証・人間H01〜H03回答は未確認（公開前記録）。

## 担当と対象

- 実装・修正: 子 `/root/implement_avoid_004`、指定 `gpt-6.1-sol` / reasoning `medium`。
- 親: 実コード・呼出先・自動試験・固定変更前・比較ツールを独立レビュー。公開検証と人間確認要否は親が判定する。
- 固定変更前: `9a3d43ef22b9cedf598c0448a4ea0619cd5615f6`。着手時 work はclean。
- 最終製品source: `src/09a_placement.js` SHA-256 `c166f437491cc643523a18212ea1087482776e78520048e7d4c27dcf280877b9`。
- JA: `90eae91fc93900cd542a81373a20335f0ce343e3928dca1417fb1192f591a6b1`、EN: `562172e86591ff5bea9ce58605c50b04f9e47ad566498fc4cc9d8c68b0dbcfe2`。

## コードの判断

新方式は内部finalize APIの明示呼出しだけで動作する。通常製品UIは新経路を呼ばない。center/tileの限定adapter、cut/still/cut、検証済みcamera/marker/wipeに絞り、未対応を診断する。184IDの対応完了、任意のFX/破片の幾何対応、通常UIの新方式有効化は意味しない。

全画面のplan/render寸法を維持し、主歌詞と所有板のみステージ平行移動する。tileの補助反復は明示した役割のまま元の描画順を保つ。未分類単位はprimary。最終canvasや主歌詞・背景への円抜き/補助マスクは実装していない。018が補助マスク、005以降が各軌道adapterを担当する。

実Canvasの文字変形順、stroke、AAを含む境界と、限定camera/ghost/shakeの区間全体を覆う保守的な包絡を確認した。元の描画順・blend・cut単位opacity・foreground順はper-event replayと既存Rendererで保持する。特異・非有限・未測定・容量超過は成功扱いしない。font revision、最終compose、非同期結果、旧lock系譜を検査し、描画中に計画を変更しない。

## 指摘と解消

| ID | 指摘 | 最終確認 |
|---|---|---|
| R04-01 | recorder初期化でblend/alphaが消える | 初期状態継承、main/ghost実画素一致 |
| R04-02 | 計測失敗後にarea/paramsだけ変わる | 旧cut全体を復元しunsupported診断 |
| R04-03 | transition/個別style/FXが包絡外 | wipe以外の空間変換・個別FX等を非対応化 |
| R04-04 | 返却bboxと元レイアウト装飾のずれ | 元の返却形式を保持、下線/板を実画素照合 |
| R04-05 | render純粋性・冪等性・旧lock寿命 | deep freeze、入力不変、冪等・lock試験 |
| R04-06 | notationの指定サイズが消える | notationは旧経路を完全保持 |
| R04-07 | JSON cloneがlock情報を失う | 不明なplan系譜はSOURCE_PLAN_REQUIRED |
| R04-08 | 全画面再planでfont/選択演出を再抽選 | seedを既存318に合わせ、限定adapterの意味パラメータ保持 |
| R04-09 | NaN/負半径/overflowでclear成功 | 入力・行列・polygonの明示拒否 |
| R04-10 | 単一itemだけの上限ではframe負荷を制限できない | 再帰で共有するframe event/glyph予算、1px context上限 |
| R04-11 | camera数値が証明範囲外 | 有限・motion範囲・方向/振幅のadmission診断 |
| R04-12 | 二点line、shape shadow/filter | line境界修正、未測定の空間効果拒否 |
| R04-13 | 長い測定文がcapture外へ切れる | 折返し・panel収容・font cmap検査 |
| R04-14 | overlayの画像原点がcaption高さでずれる | overlay時caption非表示、全画像矩形一致検査 |
| R04-15 | 旧ON/手動/OFF/全画面のラベルや素材条件が不正確 | 実経路ごとのラベルと制御foreground条件 |
| R04-16 | 回避circleガイドがない | native PNGを変えないCSSガイド、実時刻境界で切替 |
| R04-17 | style/fx/events/beats変更で古いasync計画を採用 | 全enumerable plan依存signature、初期shadow/filterも拒否 |
| R04-18 | sampleの古い診断表示・連続seek競合 | 各再生frameで診断更新、request直列化/token、操作時再生停止 |
| R04-20 | 下線のcap/join・dash/miter等の継承差、非既定文字state | eventごとのstroke state保持、同一line skip条件、非既定文字state拒否と実測zero表現の受理 |
| R04-21 | iframeからCanvasをDOM移動すると再生時のfont所属が変わる | 描画元をiframeに保持し表示へbitmap転送、再生中の画素一致検査 |
| R04-22 | 長い/別cutの切替・個別FX/style、量子化/ghost再帰、group exitが証明範囲外 | plan全体のbounded admissionを一度検査、時計2段とlag/隙間を含む探索範囲、group exitもcutに限定、rendererと同じglow既定値 |
| R04-19 | nominal alpha <1/255でもCanvas実alpha1が残る | 実rendererと同じ<=.002だけ除外、低alpha実画素回帰 |

R04-19は実装担当の追加自己レビューから親が必要修正と判定した。原寸PNG・条件・製品hashが変わるたびに新build IDとし、失敗/途中版を成功版で上書きしていない。

## テスト評価

- 最終stage 118 checks成功。実レイアウト・time/ghost/transition・same-time fast/full/順逆seekの画素一致、旧manual/OFF/legacy/fullstageの固定変更前一致、旧lock snapshot、font fallback/load/reload、stale signature、低alpha境界を含む。
- 親独立幾何: ランダム回転多角形12,000件を002の別oracleと照合、逆行列12,000件、区間証明後の独立時刻点96,822件、不正/overflow7件。最終source hashで成功。
- 親独立Canvas: 実フォント、5縮尺×6条件=30件。全alpha>=1画素中心が測定polygon内。通常・親affine・文字別負scale/回転・stroke・alpha .003/.002を含む。縮尺.05のglyph計測試験は全render対応範囲拡大を意味しない（staged renderは.1〜4）。
- 性能: 全100/1000cutが新経路でadmittedされたことをassertした測定。planning P95倍率1.254/1.307、追加render約0/+0.2ms。基準<=2倍/<=3ms内。この値は中間候補の結果であり、state保存を加えた最終候補の単独再測定を後記へ追加する。admission失敗したattempt02は成功証拠ではない。
- cut_mask、drawing_frames、effect_copy_fidelity成功。003モデル17件も回帰成功。
- **既存失敗を除外して成功扱いしない**: lyric_area_effectsは固定変更前/変更後ともline35のwithoutMedia期待1/実0で失敗。選ばれたtitle cutのbg=noneが根拠で、それ以降のassertionは未到達。直接manual/OFF/lock試験と区別し、017へ引継ぐ。
- project_fileの初期cut期待0/実1の既存失敗は013へ引継ぎ継続。保存本体成功の証拠はない。

## 人間の動作確認

必要と判断する。004は確認用経路で初めて実際の文字/附属板を移動し、camera・残像・区間切替を含む演出の見え方を提示する段階であり、可読性や動きの意図を利用者に確認してもらう。コード不具合や試験失敗の判定を人間へ移さない。

公開一致・実起動・親の公開操作確認を済ませてから、H01〜H03の比較URL、実操作、期待結果、OK/NG/未確認の回答を依頼する。回答前は完了にせず、005へ進まない。公開検証待ちを人間確認不要で省略しない。

## 最終候補の追加確認

- 比較08 local validator: 28 cases / 112 PNG / 127 assets / 全before-after実再描画・font幅・offset・native PNG一致。manifest `47f4b4823744adb95be883acdb163226cd3eb34f28e402444ecaf3816e9c5efc`。正常cloneと破損9件が期待どおりの理由で通過/拒否。
- 最終source c166に対するcompositing 3件: real foreground上のnormal/multiply/overlay、cut opacity、ghostを含め、offset0の旧全画面基準と完全画素一致。
- 最終sourceの単独性能測定: 100cut/100regionはplanning P95 63.6→81.2ms（1.2767倍）、1000cut/1000regionは507.8→661.7ms（1.3031倍）。追加render P95 +0.1/+0.2ms。全cut admissionをassert。追加context1個・1pixel。`performance-final.json`を最終採用。
- 親の独立検証: `parent-geometry.json` / `parent-raster.json` と各再現script。最終source c166 / JA90eaeに束縛済み。最終比較08のcenter-static、moving-frame-3-2を目視し、円・文字/板・説明文・footerの収容を確認。
- 製品・開発ツール・文書のdiff whitespace check成功。生の試験stdoutログは内容を変更せず保持する。
- 公開成功・人間OKはこの時点で補わない。これ以降の公開結果はpublication.jsonと下記追記へ記録する。
