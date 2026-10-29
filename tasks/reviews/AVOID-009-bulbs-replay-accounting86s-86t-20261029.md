# 電球 replay private geometry accounting 86s/86t

公開N.replayの外部model identityをcache authorityにせず、小face/ringsだけdescriptor/有限値/寸法制約を検証してprivate clone/freezeする。face<=128、rings<=2x140。clone前131072B reservation、actual retained<=32768Bを要求。全体8MiB不変。mutable groups/held/entry/template/glyph/matrix/extraは毎回encodeし、private derived geometryの元出現分だけnull置換＋exact bytes差分で再現、clone/shallow-copy管理を加算。callback/diagnostic経路は旧計数のまま。helper public factoryや旧model oracleはowner/frame権限を持たない。

pure251 checks/120exact-byte audits。86t protected visible Qtの旧model oracle/current contextでは38pins/3rawの両hashとcompleteを親照合。7289 workで旧exact encodingをtest-only再計算し全一致＋管理上界。86r旧結果のgroups/heldInput/quality/glyphMatrices/workCounts全値一致、727root/4067glyph matrices、bitmap不変/pristine。geometry/layout/measureText/paint0はproducer counters、owner compile0も別確認。

private geometry5202B、management3243B、clone reservation131072B。診断peak2574924Bはgenuine resident/caller全予約を含まない。auditで旧serializeを重ねた時間は性能比較に使用しない。実plan/full/normalframe/失効とgenuine peakは次gate、通常UI未資格。raw/mediaはGit外。
