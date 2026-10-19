# AVOID-005 Stack修正 親レビュー（コード・ローカル検証済み）

最終判定: 2026-10-19、利用者の「これでOKです。次の段階に進んでください。」を受領。必要だったStackの人間動作確認を完了。旧H02/H03は実描画・所有物・例外対照の検証と他15IDの不変証拠から親が追加確認不要と判定し、[タスク](../../AVOID-005.md)を完了にした。下記の公開時点の記録は保持する。

- 開始HEAD: `834fb5bc69867840080e4cf2c2d25db2082e8d71`、work、clean。fetchしたworkと一致。AGENTS.mdなし。
- 実装担当: `/root/fix_avoid_005_stack`、指定 `gpt-6.1-sol / medium`。親がコード・テスト・実描画を確認する。
- 利用者の指摘: 円外へ移したStackがばらばらになり、積み重なりが失われる。斜めの積み重なりも可。他の安全例はOK。
- 変更前の横長中央・上の画像とoffsetを確認。3行のoffsetの2階差分が0ではなく、円外安全でもStackの行列構造を維持していない。縦長中央の共通平行移動は既に構造を保つ。
- 環境: [status](initial-environment.json)の保存設定参照IDと実行観測を区別。observations_current=true、spec/observed=33/33、unrestricted/enforced。実機 `/etc/codex/network-policy.json` もunrestricted・proxy `http://proxy:8080`。通常curlは継承proxyと通常CA/TLS検証を使用しHTTP200 / ssl_verify_result=0、旧005manifestのSHA256 `e8c81c696acae92f9a5edc88d79b9430f12ee59e95b9238c6530f2823633ab83` と一致（[ログ](initial-https.log)）。保存設定だけから接続成功を推測していない。

## 指摘と対応

1. 初版の斜め候補は一定間隔と円外を満たしても、行間の縦成分が約100pxから69pxとなり、文字同士の新しい重なりを生む懸念がある。全区間包絡の対ごとのbbox重なり面積を元より増やさない条件を追加。水平変位を最大0.25W／元の行間距離の2倍に制限した候補で、等間隔の斜め配置を成立させた。親が前後の原寸PNGを確認し、三行の積み重なりが見えると判断。これは実際の字形の重なり面積が不変という証明ではなく、包絡による保守的な配置制約と目視の併用。
2. 比較の両側は005 APIを有効にする。004→005の旧比較と混同せず、修正前834fb5bを固定した。H03説明と対照件数の不一致を指摘し、OFF/manual/lock/legacy/fullstage/emphasisの6対照を用意。新H02はStackの動き・反復の追確認であり、旧H02の附属物確認を代替しない旨と旧比較リンクを追加。

## 採用コードと試験

- 製品差分は `src/09b_basic_placement.js` と生成日英HTMLだけ。Stackの共通移動が不成立の場合のみ共同配置へ進み、他の15IDは既存分岐を維持する。描画元の文字サイズ・反復数・色・書体・順序を変更せず、各行のoffsetを反復indexの一次式にする。収まらない場合は全行offset0と明示的insufficient-spaceを返し、途中だけ動かした解をsafeにしない。
- JA SHA256 `1b9410dcb158a0ce315ae500be9e704734bcca6494838538416ad4ebbb8c4ea3` / EN `5ba21ffcde7a42f430beb3640ce80837de4e6cd68aaedb4c26c120de09d211f1`。
- 担当Stack試験30条件、実際の斜め安全例2条件・修正前に分散していた安全例1条件を含む。他15ID×4設定=60条件の描画・trajectory・observationが完全一致。[stack-test.log](stack-test.log)。
- 基本native144条件:101 certified /43 insufficient /0 unsupported /0 errors。受入46項目と実alpha画素144条件成功。004回帰118項目成功。[basic-test.log](basic-test.log)、[basic-acceptance.log](basic-acceptance.log)、[stage-test.log](stage-test.log)。
- 親の独立58条件:修正後8 safe /50 insufficient、全条件で反復offsetの2階差分0。安全条件の全区間包絡を独立002oracleで検査しstage収容を確認。7時刻・ghostを含む実描画1100polygonも円外。包絡の対30組で重なり増加なし。他15IDの45frameとStackの6例外対照は修正前と画素一致。[結果](parent-independent.json)、[再実行スクリプト](parent-independent.cjs)。別の固定条件集合であり、担当30条件の件数と合算した対応率とは扱わない。
- 親が他のブラウザ試験終了後に性能を再測定。100cuts/100regionsの計画p95比1.740・追加描画1.5ms、1000/1000は1.920・0.4msで契約上限2倍/3msを満たす。cold初回の計画合計は355.9ms/2307.2msであり、warm条件の2倍基準と混同しない。[performance.log](performance.log)。
- 比較ツールの予備版capture/validateと破損12件の拒否試験成功。完成版の26条件・公開検証は下記へ追記する。通常proxyとCA/TLS検証を維持する。

## 固定比較のローカル受入

`local-20261019-03` は26組・52UI＋52原寸PNG・1動画。13 safe /7 insufficient /0 unsupported /6例外対照。121assets＋manifestを生成し、ローカルvalidatorで画像表示・全52原寸再描画・前後切替・重ね合わせ・原寸・スマホ幅・再生/シーク・日英起動を確認。完成版の破損12件拒否も成功。[capture.log](capture.log)、[local-validation.log](local-validation.log)、[final-negative.log](final-negative.log)。manifest SHA256 `3aa2ea6c5a06e4a45f03e3e3d7580642767f02b05ba97c61a2e9814ba32340a1`。

## 公開検証と動作確認の判定

artifact commit `025e436baca82dba97f5b6ceeca6553e6c93c827` をworkへpush。Pages run `39232475343` 成功後、121assets＋manifestのHTTP200とraw bytesのSHA256一致、全52原寸PNGの公開fixture再描画、日英起動と描画を確認した。公開前の404も履歴として保持し、デプロイ成功だけでは合格にしていない。[publication.json](publication.json)、[public-validation.log](public-validation.log)、[public-site-smoke.log](public-site-smoke.log)。

親もrequest interceptionなしの通常通信で安全例への移動・再生・シークを実行。外部要求0、pageerror0、保存状態・フォントrevision不変。デスクトップとスマホ幅の公開スクリーンショットを目視し、前後ラベル、円外での斜めの積み重なり、操作可能な表示を確認。[public-parent-ui/results.json](public-parent-ui/results.json)。

修正したStackは再度人間の動作確認が必要。理由は、利用者が指摘した積み重なりの印象と読みやすさを変更したため。他の安全例のOKは保持する。公開・コード・自動試験の未解決事項を人間へ判定させる依頼ではない。005は動作確認待ち、006は未着手。旧H02/H03の個別未回答は承認と推測しない。

予備比較01〜03は公開物に混ぜず `/workspace/work/jizura-handoff/stack-tool-smoke` に移動して保持した。記録コミットは製品と固定比較のbytesを変更しない。
