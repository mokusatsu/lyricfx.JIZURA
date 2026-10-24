# 電球サイン：隔離記録・再生51

実装 gpt-6.1-sol / medium。親がソース全体と生の記録を独立照合。元描画・移動描画900組、zero/moved転送450組、元の全画面と直接移動90組、270 typed negative、他D45組を受入。全21476記録eventと24916再生paint、RGBA、root、BB、実効FXを元sourceと比較し、28866 resample点を独立計算。streamed753断片の全bytesとUnicode/8MiB超の純データ保存再構成も一致。

全画面90組は元描画と直接移動で、Renderer内transportを実行したものではない。450組は指定envの同期record→replayであり、通常Rendererの全時計網羅ではない（tuple step60Hz、通常koma0のstep24Hz）。元の時計は変更していない。cache/serialized/post-record drift、連続全時間支持、円回避配置、数値安全証明、正式性能は未達/未実施。本体未組込み。

元表示を変更しない隔離内部段階のため人間の動作確認は不要と親が判定。人間のOKの代用ではない。全raw370,756,229Bを12,237,408Bのlossless TAR/XZへ保存し、元gzip753断片を指定Node24で全件厳密再生成・照合済み（archive SHA d00ffa52…）、009全体/保存本体未完、010以降未着手。公開結果確認/親画像閲覧0。

証拠: tasks/evidence/AVOID-009/bulbs-transport51/parent-review51.json、source51/evidence/seal51.json、supplied-clock-scope51.json。
