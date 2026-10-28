# 電球 source80r：別 renderer と時刻境界

2026-10-28。実装担当 gpt-6.1-sol / medium、親が source と raw を照合。source80o の未登録試作から、準備 renderer と異なる stock renderer を受け入れる条件と、既存 finalizer の評価時間範囲を検証した。製品 adapter / finalizer / cache / UI の接続ではない。

model の準備は従来どおり canonical renderer / Canvas に結び付ける。別 renderer では stock prototype と frame / makeEnv / drawCut、および既存 transport / source guards を検査し、依存 snapshot の instance token だけを正規化する。各実フレームの renderer / Canvas / plan / clock / CTM / metrics は発行時に確認する。

負時刻では実時刻と量子化した n を保持し、全 selector と q-cull を確認した上で source row 0 を使う。sourceN と実 n を別に保持することで、描画時に負 n を row 0 と誤照合しない。duration 以降は全 selector が空であることを描画前に確認し、既存の評価範囲外は型付き拒否する。追加した range / selector 一時データ / sourceN は従来の8MiB serialized 予算に含む。

- 親の純粋試験：renderer / time 79、mock-owner 61 checks PASS。旧 owner の41 assertionsを保持。
- Qt actual01：literal exit 0、complete=true、errors=[]。45 pins、46 raw、decoded 5,805,187 bytes / gzip 304,306 bytes、両 hash を親が確認。
- 異なる stock renderer / 新 Canvas を含む18比較 frame、39 own パス、572 paint 記録で旧 source oracle と一致。負の範囲端、最小負数、-0 / +0、正時間境界、duration / nextafter / tail 端、逆 seek を含む。realTime の Float64 bits、全 RGBA SHA256、primitive / path / state / args / ownership / clock / root / result を比較した。
- renderer 3メソッドの置換、範囲外2方向、モデル退去、metrics revision 変更の7ケースは指定 code で描画前拒否、bitmap 不変、compile 0。revision 変更は実字体リソース変更と同一視しない。
- 明示的な再準備は compile +1、その後の新 Canvas 描画は compile 0 で oracle と再一致。これは通常 finalizer / cache からの復帰の証明ではない。
- Qt PID 31482 終了・回収、port 9333 未使用。画像 / 動画、公開 URL、Sites / Pages の確認なし。共有 Canvas の paint 例外後復旧は変更していない。

対象は baseJA「風の先へ」seed1205 と現行の限定 stage / FX / noPost / scale1 scope。全入力・EN・製品性能の受入ではない。次は09kの optional runtimeAdmission、09a prior と09g completed/decode の両 shortcut、および callback identity を cache 依存へ通す。未所有 alias は miss、退去済み証明は frame 前に拒否し、通常 finalize でのみ復帰する。大規模な共有 Canvas 例外復旧は別扱い。

正本は Git 外の `/workspace/jizura-logic-evidence-20261027/bulbs-admission80r-actual01` と `bulbs-admission80r-parent-review01.json`。Git には source-only dev unit とこの記録を保持し、raw / media は含めない。
