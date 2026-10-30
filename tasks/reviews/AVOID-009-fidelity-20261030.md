# AVOID-009 描画保持の限定レビュー（2026-10-30）

製品変更は sourceFormula の neon に限定し、親のソース・独立rawレビューを受入れ済み。最終commit SHAとPages版は未決。本記録によるcommit/push・公開結果確認は行っていない。

## 製品変更と限定実描画

`src/11p_layoutsB.js` と `src/11zz21_source_formula_base.js` のconstruct/live双方に環境内のneon専用markerを使い、sourceFormulaでは元の文字・枠・字幕のnative glow経路を復元。旧adapterの3本halo経路は保持する。既存item shadow包絡とframeのCanvas shadow余白に加え、字幕が継承するambient Canvas shadowを `3*shadowBlur + max(abs(offsetX),abs(offsetY))`、縮小contentScaleの逆数を含む保守余白としてitemの最終polygonsへ加える。body/ink、元のclip、declared sweepは維持する。

- actual27 no-sub（`風の先へ`）：真のnative文字・枠glowの存在、同clockの内容一致、20所有描画支持の円交差0を確認。元描画は円と重なる条件。字幕ありを意図した同runのfixtureは実際には字幕を出しておらず、presence失敗を保持する。これを字幕合格に数えない。
- actual28 sub（`かぜのさきへ`）：nativeの `KAZENOSAKIHE` 字幕、文字・枠・字幕glowを実在確認。内容・spacing・source clock一致、40所有描画支持すべて円外、元native支持40件は円と交差。未解決/欠落なし。source/product pins不変、raw完全性・正常終了/回収を確認。

証拠はrepo外 `/workspace/jizura-logic-evidence-20261027/` の `neon-final-source27/`、`neon-final-actual27/`、`neon-subtitle-source28/`、`neon-subtitle-actual28/`。両source manifestの対象SHA256は layoutsB=`88da4e2daf896a0eb9147da50085ca9e58b542fbb4417b8cae813ec274f625a0`、source_formula_base=`61c172bc4af9d2290a4fa7bd3e5f7808b91eb02aa3fec0a58677b30180aaf02a`。最終Git SHAとは区別する。

## 差異の区分と既存証拠の再利用

spacing getterを補正する試作変更は取り下げた。getter表記差を描画欠陥へ直結させず、実TextMetrics等の物理metrics一致として区分する。getterのstrict差異や未確認pixel同一性を消した扱いにはしない。

clip5（panels / dotMatrix / mosaicTiles / halftoneBig / stencil）とtypo12は、基準 `8625ea9a3d22e3582db817371580494e1cb31710` の既存actual22 rawを同条件で再照合した結果であり、現HEADの再描画ではない。clip5は未知/追加clipによる支持の切詰めを使わず支持を拡大し、panelsの元の直線四角形clipだけ保守AABBで扱う。元clip命令・引数の一致はclip CTM/pixel一致の認定ではない。typo12は全3passの257 paint対と253 actual boundsを照合し、ソースに基づくroleと有効stateの区分で12件を限定受入れ。証拠は同repo外の `registered164-clip-recheck01/report.json` と `registered164-typo12-sidecar-report.json`。過去raw/失敗を上書きしない。

noise/vinylは過去の同clock照合の範囲として保持し、今回のneon実描画や全時計合格へ加算しない。dominoの通常post経路はunsupportedのまま。pixel同一性、post-composite bloom、全時計・全入力・正式性能、およびAVOID-009全体は未認定。本記録へ動画・PNG・raw本体は追加しない。
