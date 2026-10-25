# 電球69 actual01失敗と限定storage修正

actual01は`RAW_SERIALIZED_BUDGET`で失敗。baseline/candidate各250 native frameを完走したがhistorical control166件の後で停止し、新しい配置proofには到達していない。668 recordsの実保存JSON268,324,105B、失敗incoming全文2,640,651Bも保存。原source/rawはarchive branch `archive/avoid009-bulbs69-actual01-20261025-attempt1` / `da9fd1978d4f9adabeef2f033c284c5e07844b98` に839files/49,329,270B。失敗を成功へ書き換えない。

修正はrunnerのlossless storageだけ。product source/候補順/幾何/品質/時計は変更なし。

- paint descriptorからpath matrixを外部bindingへ分離。全path matrixが実paint matrixとObject.is一致する場合だけPAINT_ROOT、異なる場合PER_COMMANDの実matrix IDsを保持する。
- catalog/paintの専用factorを維持し、それらを含まないplain metadata subtreeだけ既存K.encode JSON→gzip/base64へ保存する。解凍後のJSON byte長/SHA、16MiB上限を検査してK.decode。全原値deepEqualを保存前に行う。
- codec版は`source69-root-and-metadata59-gzip-v2`。各recordにtableEpochを追加するが、table resetは既存pageFor/case境界のみ。100000 entries/各64MiB key/256MiB encodedJSON output/16MiB incomingは据置。encodedJSON output bytesにはbase64を含めて計上し、expanded意味データ量やJS heapの上限と偽らない。

4実時刻n83/120/165/166を同instanceで測定。旧codec JSONbytesは1,851,302 / 1,660,328 / 1,660,572 / 1,660,761、新版は611,576 / 187,515 / 187,802 / 188,108。新版最終tableはmatrix160/27,040keyB、paint248/262,633keyB、catalog589/255,640keyB。全値roundtrip、runner実factoryと承認probeのJSON/gzip bytes・全table値一致、PER_COMMAND/empty path/undefined/-0の小確認がPASS。

全面metadata DAG案は別時刻ごとcatalog+7,745 entriesとなり再実行候補へ採用しなかった。`codec-probe02-source-original.cjs` / `codec-probe02-provenance.json` / `codec-probe02-four-actual.json` を履歴として保持し、新版結果で上書きしない。gzip案は`codec-probe03-four-actual-gzip.json`、runner exact結果は`codec-runner04-exact-roundtrip.json`。全て`tasks/evidence/AVOID-009/resume-20261025/`。

再run前の小測定は改善を示すが、enter/exit・新proof全量が上限内とは未検証。上限超過は再び失敗のまま全prefix保存する。次sealのROOT pinsは親の最新値（c136ff29 / e24df213…、または次checkpoint）を明示指定し、旧4a/cbcb defaultsで実行しない。

## 同processの親raw checker

最新利用者指示により、Gitpush後の到達性確認目的の再取得/download/readbackは禁止。push操作戻り値・commit・pathだけを記録する。描画の正しさの検証は省略しない。

そのため`parent-local-review69.py`をexact input_paths/seal/frozen snapshotに含め、Node終了後・archive前に次の2 positional引数で実行する。

```
python -B tasks/evidence/AVOID-009/resume-20261025/parent-local-review69.py <run/raw> <run/parent-local-review.json>
```

producer失敗でもprefix checkerを実行する。親checkerのreturn非0・出力欠落/不正JSONはparentReview failedとして別記し、producer成功や描画合格に補完しない。review JSON/stdout/stderr/execution metadataも明示archive scopeへ含める。checkerが失敗しても原producer prefixごとGit保存へ進む。ROOT/原producer manifestを変更せず、同runのRAMを使う。親のsource review/seal後にactual02へ進む。
