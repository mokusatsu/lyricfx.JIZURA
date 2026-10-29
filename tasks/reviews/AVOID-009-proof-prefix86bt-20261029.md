# 電球：分割proof前半と途中取消（86bt）

実装担当 gpt-6.1-sol / medium。親が70固定入力・8 rawと旧86bsの失敗記録を含むcheckerを再実行。真正model準備後、candidateと239 ownの240 stepを一度CDPで測定し、3,231.5 ms・最大30.8 ms。2,903 sampleでは容量計数・厳密key生成が観測された。以前の3.68秒のstepは再現せず、独立process CPU時間を得られないため原因を環境待ちと断定しない。

proof途中の実取消は、非空private bitmap不変、model・record・binding・active frameが0。peak 7,981,163 B / 8 MiB。先行86bsは自分のprocessのchildren pathのENOENTでProfiler開始前に停止し、別process列挙は行っていない。full proof・正式plan・新規描画・通常UI性能の合格ではない。追加profileを主作業とせず実compose・時間域・世代付き公開の接続へ進む。
