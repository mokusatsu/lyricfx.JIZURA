# 電球 private owner 不変byte再利用 86o/86p/86q

ownerが作ったdeep-frozen inputとfixed key/fullKey/depKey/private contextだけのbyte数を再利用。外部plan identityを信頼しない。live caller入力/source/font/revision/generation/ctx検査、mutable guard/protocol/model/candidate/extra・resident一覧計数は維持。cache/temporary shallow-copy管理は加算し8MiB不変。生成byte一致、mock30、test-only旧exact353点auditを親再実行PASS。超過negative testのpeak約9MBは拒否要求を含む値で正常上限ではない。

86pは同96own/cancel/numeric wrapper/8KiB診断予約のprefix。32pins/4raw両hashとcompleteを親照合。86n→86pの各1回でouter2935→1672.9ms、account2462→2463回/1009.1→245.7ms、codec11951→16879回だが104.7→35.1MB、generator5210回/58,001,458Bは同じ。時間は入れ子/overhead/実行変動を含み、加算やfull外挿はしない。resident0までcancel、full model/frameなし。

86qはprofileなし・同86l fixture/728step/正式owner/finalizer/stock frame/revision拒否を1回。29pins/4raw両hash、complete/errorsとstock SHA f7ed141b46f293768a91926efc2a0ea3b1e512336edc6a7a3f71010ab64b4e3a、一致するsentinelを親照合。compile計1、同入力の正式J.finalize admitted→t1描画→revision後STALE_PLACEMENT_PLAN。noPost/fast/scale1の限定plan/frame。

86l→86qの各1回でprepare20707→14478.7ms、727 own step合計16697.9→10333.2ms。最終step1106.6ms、再finalize1753.1ms、frame18.1ms、heartbeat最大1823.3msはfinalize/frameにも跨る。変わっていない部分にも実測変動がある。通常UI不可であり20.7→14.5秒だけで実用受入にしない。

合算serialized peak7,970,076B/limit8,388,608B、残418,532Bだけ。別入力の超過はtyped拒否し上限を緩めない。Canvas backing/RSS別。raw/mediaはGit外、86q runner exit0・node131391/service131334不在/port111、86pも標準cleanup完了。

未完：14.5秒準備、1.1秒finalstep/1.75秒finalize、通常UI post・可変scale・layer、入力変更時のUI世代結合。source-onlyで既製品src/HTMLへ未適用、通常UIへ同期投入しない。
