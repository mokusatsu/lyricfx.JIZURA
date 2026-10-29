# 電球 final work 計数の診断と配列metadata拒否

86fは保存済80ab旧modelだけのhost Node/V8診断。HQ結果とFD結果全値一致、生成/Canvas0。HQ callbackなし127.2ms、元work計数付き234.3ms（54回/5.7MB）。FDは978回/1,732,163,352B、21,133.9msのうちserialize inclusive21,113.8ms。wrapper/環境差があり、Qt最終10.25秒へ外挿・時間加算はしない。

86gは静的不変fragmentの計数再利用。旧raw全978checkpointの旧work byte完全一致＋管理上界/FD全値一致（1965checks）。ただしJSONは配列独自propertyを落とし、実86hは最初のFD callbackでBULBS86G_DATA拒否、exit1/complete=false/4raw保持。後続正常描画/性能は未到達。27pinsとraw両hashを親照合。

86iはfull生成0のfresh n60 static診断。native/候補のm100.lay/m.lay計8配列にreadonly/enumerable/nonconfigurableなW/H/Nを実測し、旧guard拒否を再現。compiler0/revision不変/bitmap不変/pristine。旧rawだけでは見えない実構造を区別する。

86jは一般配列guardを維持し、source m100.lay/m.layの既frozen配列に限り厳密なW/H/Nデータ契約と別途sidecar/一時管理上界を導入。86kのfresh static検証は旧work45273B=new work45273B、sidecar等17933Bを加えupper63206B、8配列値保持、compile0/bitmap不変。27pins/3rawを親照合。full経路は別gateで未資格、UIには接続しない。

raw/mediaはGit外。source86gと診断は独立保存し、初回86h失敗を後続結果で上書きしない。
