# 86u correctness通過・性能根拠不足で不採用

親が34pins/4raw両hash、complete/errors、728steps、正式admitted planとstock RGBA一致・revision後sentinel不変を確認。compile計1。新private geometry5202B＋management3243B、constructor working予約131072B。test-only readonly resource snapshotの永続8KiBをadapter予約へ加え、全8MiB capを維持した。owner/compile peak7978268B、full caller-reserved replay peak5278673B、残予算410340B（owner側最大基準）。Canvas/RSSとは別。

単発86q→86uでprepare14478.7→20807.8ms、再finalize1753.1→2151.6msと悪化。変わらない727ownも10333.2→16319.1ms、finalstep1291.3ms、frame25ms。診断予約等の条件差・負荷変動もあり因果や速度改善率を断定しない。heartbeat2228.9msはfinalize/frameにも跨る。新案を実用高速化の根拠にせず、86sを製品へ適用しない。

正しさの限定証拠は保存し、次の通常UI調査は86q（86o owner＋86j generator）を基準に戻す。14.5秒準備/1.75秒finalize、post/可変scale/layers・UI入力世代結合は未完。元Renderer.postを省略した接続やcanonical画像縮小によるstock scale同等の仮定は行わない。

raw/mediaはGit外 E/bulbs-replay-account86u-actual01。runner literal exit0、node132843/service132783不在、標準service cleanup-15/port111。製品src/HTML変更0。
