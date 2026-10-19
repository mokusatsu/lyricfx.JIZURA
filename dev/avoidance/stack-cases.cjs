/* Bounded Stack revision comparison. Both sides use the identical existing API. */
function cases(){const out=[],add=(id,s)=>out.push({id,hid:'AVOID-005-H01',layout:'stack',seed:704,text:'風の先へ',W:960,H:540,cx:.5,cy:.25,radius:.2,time:1.5,availability:'implemented',expectation:'safe-or-explicit-insufficient',label:id,look:'反復行が元の順序と一定の間隔で積み重なること。斜めの整列も許容します。',change:'行をばらばらに配置する代わりに、一つの積み重なりとして円を避けます。',preserve:'文字サイズ・傾き・色・線・反復数・順序・歌詞・開始終了時刻。',...s});
 for(const [aspect,W,H]of [['横',960,540],['正方形',720,720],['縦',540,960]])for(const cy of [.25,.5,.75])add('stack-'+W+'-'+cy,{W,H,cy,label:`Stack・${aspect}・円${cy===.25?'上':cy===.5?'中央':'下'}`,...(W===960&&cy===.25?{safeAnchor:true,expectation:'safe'}:{})});
 for(const [phase,time]of [['enter',.1],['exit',3.85]])for(const cy of [.25,.75])add('stack-'+phase+'-'+cy,{time,cy,hid:'AVOID-005-H02',expectation:'safe',label:`Stack・円${cy===.25?'上':'下'}・${phase}`});
 for(const dir of [-1,1])for(const style of ['fade','outline'])add('stack-'+dir+'-'+style,{W:540,H:960,cy:.5,hid:'AVOID-005-H02',params:{copies:3,dir,style,gap:.82,xs:dir*.04},expectation:'safe',label:`Stack・3反復・方向${dir}・${style}`});
 for(const copies of [4,5])add('stack-copies-'+copies,{W:540,H:960,cy:.5,hid:'AVOID-005-H02',params:{copies,dir:1,style:'outline',gap:1.02,xs:.04},label:`Stack・${copies}反復・輪郭・探索条件`});
 for(const control of ['off','manual','lock','legacy','fullstage','emphasis'])add('stack-'+control,{control,hid:'AVOID-005-H03',expectation:'unchanged',label:'Stack・対照 '+control,change:'既存指定が前後で一致する対照です。'});
 add('stack-impossible',{W:540,H:960,scale:4,text:'大きい文字をそのまま維持する',radius:.45,hid:'AVOID-005-H03',expectation:'insufficient',label:'Stack・固定大サイズの制約不足',change:'この共同配置候補群に収まらない場合は制約不足を明示します。'});
 return out;}
module.exports=cases;module.exports.layouts=['stack'];
