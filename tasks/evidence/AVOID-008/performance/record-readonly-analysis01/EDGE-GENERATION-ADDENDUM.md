# latest-generation registry 追補（read-only）

前案の累積counterは撤回。成功したcompleted-plan payloadDecode/repair後の選択登録ごとに、私有 registry を新WeakMapへ交換し **最新1世代だけ** accelerateする。通常freezeは元09aのまま。過去plan/cold plan/Proxy wrapはmap miss→元述語。各世代上限は65,536edges/8,192polygons/131,072選択slots。duplicate qはedge/polyの二重課金なし。私有mapとrecordsは公開しない。現在実行中のpredicateはimmutable edgesをlocal変数で保持し、p getterが新decodeを起こして世代交代してもその呼出だけ同じedgesで全edgeを完了する。次callから新mapを使う。現行render record/replay/観測は一切省かない。

## 保存100のoffline実count

exact固定446の旧cacheDecode（837bytes、SHA7a3d07883600c8728e282c80a28c2093d90c25794be45f5d8abfc41bd6a0ed50）で、既存profile02のON/OFF reconstructed-v1-payloadを各一度だけ復元し数えた。新browser/計測ではない。旧fd6 sourceRevision6の既存値であり、現在compactwireの全文byte一致という主張ではない。raw/gzip SHAと詳細はedge-counts01.json。

| 100入力 | unique q | unique edges | duplicate occurrences | 選択slots | 提案cap内 |
|---|---:|---:|---:|---:|---|
| ON | 4,022 | 32,932 | 8,443（全occurrences12,465） | 114,274 | 全て内側 |
| OFF | 0 | 0 | 0 | 202 | 全て内側 |

ONは100trajectory/100units/298segments/225bodies。選択slotsは各field/index読出を1とし、absent optional fieldsを含め、length/descriptor/prototype照合を含めない。duplicate q の座標は再走査しない。この **同じ計数定義** ならslot capの余裕16,798、edge余裕32,604、poly余裕4,170。実装でlength等までslot定義へ加えるなら再定義・実countが必要で、都合よくこの数字を流用しない。1000は未実行・未集計で、適用率/上限合格を推測しない。予算超過は途中までのbounded登録を使用して残りは元述語でもよいが、適用/未適用数を正直に記録する。

## publish / 異常 / mutation

登録はgeneric payloadDecode内部へ無条件に追加せず、readFinalCacheのsuccessful completed-plan branchだけで行う（decodeしたroot自体は変更しない）。新mapをprivateに構築し、guard再確認後にpublish。成功OFF decodeは空mapの新世代として旧ON世代を退役させる。非plan genericdecodeは登録/publishしない。plan-readのguard不適合/失敗時は空registryへ退避し元述語のみとする案が最も保守的。seam不適合のmapを後でrestoreした際に再利用しない。旧世代mapはglobal保持しないためglobal metadata capを固定できるが、進行中再入callのlocal record/edgesとJS GC/エンジンoverheadまで含む全heap保証はしない。

登録時snapshotにはq/pointsの実ref・prototype・length・coordsを保持。freeze前にprototype/slot/coords/refを改変後freezeしても、初containsのcaptured descriptor/identity/Object.is比較でfallback。凍結前と同じ数値だが違うpointへ差替えた場合もfallback。登録済み本物array以外をisFrozenで認証しない。Proxyそのものは登録できず、wrapperもweakmap miss→旧getter/throwを維持。

## captured native 境界と oracle

WeakMap get/set/hasを `method.call(...)` で起動しない。captured native Reflect.applyをdirect-callし、native method/WeakMap instanceを引数に渡す。Function.prototype.call/apply、Reflect/global binding/applyのdescriptor identityも狭いeligibilityに含め、modified wrapperへprivate map/recordsを渡さない。captureddescriptor helperをdirect-callして own-data identityを確認するので、検査で改変getterを呼ばない。登録前後と使用前に確認し、改変中の登録でleak→restore後unsafe reuseを許さない。私有edges/registry/登録関数を外へ返さない。外側readerはbool|null専用、immutable own-dataで公開し他3moduleは初期化時capture。clear時もrecords/mapを返さない。

oracleは旧4述語と full return/throw identity・getter/ToPrimitive呼出列を比較する。p[1]→p[0]各edge1回、後半edgeだけthrow、両sign成立後も読出継続、p getterが別decode/再入、pProxy、object→valueOf/toString、NaN/Infinity/-0/Symbolを含む。q側は未登録frozen/Proxywrap/slotref差替え/coords変更/prototype変更/非frozen/edgecap超過/世代交代を分ける。WeakMap/get/set/has、Function.call/apply、Reflect.apply、capturedObject helpersを改変→restoreし、custom callback呼出0・private data漏洩0・元fallbackを検証。wire/key/codec output/freeze reachabilityは変更不要、source差分は09gと4containsのうち残3moduleに限定可能。速度改善幅は依然未測定。
