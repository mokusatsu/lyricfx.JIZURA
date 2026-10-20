/* AVOID-006 adaptive revision: selected source-backed comparison inputs.
 * This is not an exhaustive Cartesian matrix or executed screenshot evidence. */
const layouts=['lowerThird','corners','staircase','zigzag','gridCells','dropCap','justified','frameBox','bubble','subtitleBar','ticker','splitScreen','mirror','sideways','edgeFrame','perspective','hanko','genkou','panels','filmstrip','quote','ruler','searchBar','chat','notification','ticket'];
const names={"lowerThird":"下部テロップ","corners":"対角配置","staircase":"階段","zigzag":"ジグザグ","gridCells":"升目","dropCap":"大きな頭文字","justified":"版面","frameBox":"額縁","bubble":"吹き出し","subtitleBar":"字幕帯","ticker":"ティッカー","splitScreen":"二分割","mirror":"鏡像","sideways":"縦倒し","edgeFrame":"外周","perspective":"奥行き","hanko":"落款","genkou":"原稿用紙","panels":"コマ割り","filmstrip":"フィルム","quote":"引用","ruler":"寸法線","searchBar":"検索窓","chat":"チャット","notification":"通知","ticket":"チケット"};
const displayName=layout=>names[layout]+' ('+layout+')';
const aspects=[['landscape',960,540],['portrait',540,960],['square',720,720]],phases=[['enter',.2],['hold',1.5],['exit',3.8]];
/* Source-backed inspection targets from src/11p_layoutsA.js render functions.
 * Annotation ownership is checked by the production fixture/tests, not guessed
 * from mainDraw presence. These notes describe visible elements only. */
const targets={
 lowerThird:'下部の主歌詞、アクセント線、番号と上側の補足ラベル。',
 corners:'対角の二つの歌詞塊、結ぶ線と線沿いの小さな番号。',
 staircase:'階段状の文字列、段のガイドと段番号。',
 zigzag:'折り返す文字の順序、折れ線状の配置。',
 gridCells:'各升目の主歌詞とセル枠、セル内の小さな連番。',
 dropCap:'大きな頭文字と続く本文、下の番号と補足文字。',
 justified:'版面の主歌詞行と全体へ繰り返す埋め草の文字。',
 frameBox:'主歌詞を囲む枠と、枠の上下にある小さなキャプション。',
 bubble:'主歌詞と吹き出しの輪郭・尾、出現時の回転と拡大。',
 subtitleBar:'下部の主字幕と大きな淡い複製（どちらも回避対象）、レターボックスと背景面、上部タイムコード。',
 ticker:'主見出しと下部の流れる反復帯、LIVE等のタグと時刻。',
 splitScreen:'分割境界の両側へ描かれる主歌詞、反転した色、両側の小さな番号。',
 mirror:'主歌詞と水平線、その下で上下反転し帯ごとに揺れる反射。',
 sideways:'90度回した主歌詞、分割線、空き領域の横書き補足。',
 edgeFrame:'中央の主歌詞と、外周に沿って回転しながら反復する補助文字。',
 perspective:'手前の主歌詞、奥へ縮小・歪曲して重なる複製、消失点への線。',
 hanko:'主歌詞と後から押される印、印内の縦組み文字。',
 genkou:'右列から縦に読む主歌詞、原稿用紙の升目、下側の寸法と番号。',
 panels:'横長では右から左、縦長では上から下へ読む主歌詞と各コマの境界。',
 filmstrip:'傾いたフィルム内の歌詞、各フレームと送り穴・端のコード。',
 quote:'主歌詞、両側の引用符と下側の出典文字。',
 ruler:'主歌詞と幅・高さの寸法線、矢印、数値、文字数。',
 searchBar:'検索窓内の主歌詞、虫眼鏡とカーソル、下の検索候補とその板。',
 chat:'主歌詞を含む会話の吹き出しと尾、入力中の点、既読時刻。',
 notification:'主歌詞を含む通知の板、アプリ名・時刻・タイトル。',
 ticket:'主歌詞と傾いた券面、切り離される半券、連番と座席情報。'
};
/* The accepted18 native examples retain their exact06b8745 inputs. The revised
 * eight start at radius.2 with multiple characters; no corner diagnostic is an
 * acceptance anchor. A revised row may honestly report candidate exclusion. */
const revised=['justified','subtitleBar','splitScreen','sideways','panels','filmstrip','quote','ticket'];
const accepted=layouts.filter(id=>!revised.includes(id));
const anchors={"lowerThird":{"W":960,"H":540,"cx":0.5,"cy":0.5,"radius":0.2},"corners":{"W":1920,"H":1080,"cx":0.5,"cy":0.25,"radius":0.2},"staircase":{"W":960,"H":540,"cx":0.5,"cy":0.25,"radius":0.2},"zigzag":{"W":960,"H":540,"cx":0.5,"cy":0.25,"radius":0.2},"gridCells":{"W":960,"H":540,"cx":0.5,"cy":0.25,"radius":0.2},"dropCap":{"W":960,"H":540,"cx":0.5,"cy":0.25,"radius":0.2},"justified":{"W":1920,"H":1080,"cx":0,"cy":0,"radius":0.02},"frameBox":{"W":960,"H":540,"cx":0.5,"cy":0.25,"radius":0.2},"bubble":{"text":"光","W":960,"H":540,"cx":0.5,"cy":0.5,"radius":0.2,"params":{"shape":"round","burst":false,"tilt":0}},"subtitleBar":{"W":1920,"H":1080,"cx":0,"cy":0,"radius":0.02,"text":"光","params":{"bar":0.13}},"ticker":{"W":960,"H":540,"cx":0.5,"cy":0.75,"radius":0.2},"splitScreen":{"W":1920,"H":1080,"cx":0,"cy":0,"radius":0.02},"mirror":{"W":960,"H":540,"cx":0.5,"cy":0.25,"radius":0.2},"sideways":{"W":1920,"H":1080,"cx":0,"cy":0,"radius":0.02},"edgeFrame":{"W":960,"H":540,"cx":0.5,"cy":0.5,"radius":0.2},"perspective":{"text":"光","W":960,"H":540,"cx":0.5,"cy":0.5,"radius":0.2,"params":{"guides":false,"mode":"floor"}},"hanko":{"W":960,"H":540,"cx":0.5,"cy":0.25,"radius":0.2},"genkou":{"text":"光","W":960,"H":540,"cx":0.25,"cy":0.5,"radius":0.2},"panels":{"W":1920,"H":1080,"cx":0,"cy":0,"radius":0.02,"params":{"fx":"none"}},"filmstrip":{"W":1920,"H":1080,"cx":0,"cy":0,"radius":0.02},"quote":{"W":1920,"H":1080,"cx":0,"cy":0,"radius":0.02},"ruler":{"W":540,"H":960,"cx":0.5,"cy":0.25,"radius":0.2,"params":{"guides":false}},"searchBar":{"W":540,"H":960,"cx":0.5,"cy":0.5,"radius":0.2},"chat":{"W":960,"H":540,"cx":0.5,"cy":0.25,"radius":0.2},"notification":{"text":"光","W":960,"H":540,"cx":0.25,"cy":0.5,"radius":0.2,"params":{"pos":"center","stack":false}},"ticket":{"W":1920,"H":1080,"cx":0,"cy":0,"radius":0.02}};
for(const id of revised)anchors[id]={W:1920,H:1080,cx:.5,cy:.42,radius:.2,text:'風の先へ',...(id==='panels'?{params:{fx:'none'}}:{})};
function cases(){
 const out=[],add=(hid,id,s)=>out.push({id,hid:'AVOID-006-'+hid,seed:704,text:'風の先へ',W:960,H:540,cx:.5,cy:.5,radius:.2,time:1.5,availability:'implemented',expectation:'adaptive-result',...s});
 const preserve='歌詞・line/part・読み順・seed・カット時刻・所有枠との関係。変更後の実サイズと構成は診断欄に記録します。';
 for(const layout of layouts){const unchanged=accepted.includes(layout);add('H01',layout+'-native-anchor',{layout,...anchors[layout],safeAnchor:true,revisedAnchor:!unchanged,acceptedControl:unchanged,expectation:unchanged?'unchanged-safe':'adaptive-safe',phase:'hold',label:displayName(layout)+(unchanged?'・受入済みの不変対照':'・1920×1080／円中心(0.5,0.42)・半径0.2／複文字'+(layout==='panels'?'／fx:none':'')),look:targets[layout],change:unchanged?'受入済みの同じ入力です。変更前のstaged経路が実際に安全で、変更後も同じPNGと文字サイズを保つことを確認します。':'実際に選ばれた構成・試行順・棄却理由を確認します。成立しない場合は候補除外と表示し、安全例には数えません。',preserve:unchanged?'元の描画・文字サイズ・配置・時刻をそのまま維持します。':preserve});}
 for(const layout of revised){
  add('H01',layout+'-standard-size-limit',{layout,exploratory:true,phase:'hold',label:displayName(layout)+'・960×540／中央円0.2・成立限界',look:targets[layout],change:'主要例より小さい寸法・中央位置での成立限界です。候補除外も正直に表示し、主要成功例の代用にはしません。',preserve});
  for(const radius of [.02,.1,.3,.45])add('H01',`${layout}-radius-${radius}`,{layout,radius,exploratory:true,phase:'hold',label:displayName(layout)+'・半径 '+radius,look:targets[layout],change:'半径を変えた固定検証条件です。実際の選択戦略または候補除外を確認します。小円を通常半径の安全例の代わりにはしません。',preserve});
  for(const [aspect,W,H]of aspects.filter(([id])=>id!=='landscape'))add('H01',`${layout}-${aspect}-center`,{layout,W,H,aspect,exploratory:true,phase:'hold',label:displayName(layout)+'・'+aspect+'／中央円',look:targets[layout],change:'同じ複文字を主要アスペクトで比較します。',preserve});
  for(const [position,cy]of [['上',.25],['下',.75]])add('H01',`${layout}-position-${cy}`,{layout,cy,position,exploratory:true,phase:'hold',label:displayName(layout)+'・円'+position,look:targets[layout],change:'円位置に応じて実際に選ばれた候補と保持した構造を比べます。',preserve});
  for(const [amount,text]of [['short','未来'],['long','風の先へ歩いて行こう']])add('H01',`${layout}-text-${amount}`,{layout,text,exploratory:true,phase:'hold',label:displayName(layout)+'・文字量 '+text,look:targets[layout],change:'文字量で成立する段階が変わる場合、その実測結果と理由を確認します。',preserve});
  for(const [phase,time]of phases.filter(([id])=>id!=='hold'))add('H02',`${layout}-phase-${phase}`,{layout,...anchors[layout],time,phase,label:displayName(layout)+'・'+phase,look:targets[layout],change:'選択構成の出現／退出時刻を確認します。時刻で候補を選び直したり、主歌詞・枠・注釈を取り残したりしないことを見ます。',preserve});
  const regions=[{id:'small',start:0,end:2,center:{x:.5,y:.42},radius:.12},{id:'large',start:2,end:null,center:{x:.5,y:.42},radius:.3}];
  if(['filmstrip','ticket'].includes(layout))add('H02',layout+'-region-first-hold',{layout,...anchors[layout],regions,time:1.5,phase:'hold',label:displayName(layout)+'・1920×1080／円中心(0.5,0.42)・半径区間0.12の保持中',look:targets[layout],change:'同一入力の半径0.12区間で実際に選ばれた配置と、入退場だけ円を通れる動きの組合せを確認します。保持中は厳守します。',preserve});
  for(const time of [1.99,2,2.01])add('H02',`${layout}-region-boundary-${time}`,{layout,...anchors[layout],regions,time,phase:'region-boundary',boundary:2,epsilon:.01,label:displayName(layout)+'・半径切替 t='+time,look:targets[layout],change:'半径0.12→0.3の区間境界です。各区間で選択が固定され、同じ時刻へseekした結果が再現することを確認します。',preserve});
 }
 for(const [layout,cx,cy,phase,time,group]of [['quote',.1,.5,'exit',3.99,'quote-left'],['ticket',.5,.9,'enter',.01,'ticket-bottom']])for(const [capturePhase,captureTime]of [[phase,time],['hold',1.5]])add('H02',`${group}-passage-${capturePhase}`,{layout,W:1920,H:1080,cx,cy,radius:.2,time:captureTime,phase:capturePhase,passageGroup:group,requiredPassage:capturePhase!=='hold',expectation:'hold-safe',label:displayName(layout)+'・位置を変えた入退場通過の確認／1920×1080・円('+cx+','+cy+')半径0.2／'+(capturePhase==='hold'?'保持中':capturePhase==='exit'?'退場':'入場'),look:layout==='quote'?'移動する引用符が退場時に円を通るところと、本文・出典が円に入らないところ。':'券面と半券が入場時に円を通り、保持中は円から離れているところ。',change:'主要8例とは円の位置が異なる、通過を実画素で確かめる専用条件です。同じ入力の保持中と対にして確認します。',preserve:'動く入退場要素以外と、保持中の回避を厳守します。歌詞・読み順・seed・寸法・時刻は前後同じです。'});
 for(const layout of ['ticker','edgeFrame','justified','subtitleBar']){const unchanged=accepted.includes(layout);add('H03',layout+'-ownership',{layout,...(unchanged||layout==='subtitleBar'?anchors[layout]:{}),acceptedControl:unchanged,expectation:unchanged?'unchanged-safe':'adaptive-safe',phase:'hold',label:displayName(layout)+'・主歌詞／補助／独立装飾',look:targets[layout],change:layout==='subtitleBar'?'下部字幕と大きな淡い複製は両方とも回避対象です。構成変更後も除外されていないことを確認します。':'主歌詞の回避と、配置を保持する補助反復を分けて確認します。',preserve:layout==='subtitleBar'?'主字幕と大きな複製の意味・読み順。レターボックスと背景面は独立装飾です。':'密な補助反復は全ステージの配置を維持します。補助の円形マスクは018で対応予定です。'});}
 for(const [control,layout,label]of [['manual','panels','手動配置'],['lock','ticket','配置ロック'],['explicit-size','justified','明示文字サイズ'],['off','subtitleBar','回避OFF'],['manual','splitScreen','分割演出の手動配置'],['lock','filmstrip','フィルムのロック'],['explicit-size','quote','引用の明示文字サイズ'],['off','sideways','縦倒しの回避OFF']])add('H03',layout+'-control-'+control,{layout,control,...(control==='explicit-size'?{lyricSize:72}:{}),label:displayName(layout)+'・'+label,expectation:'unchanged',look:targets[layout],change:'例外指定を保つ前後一致の対照です。新構成への書換えや無断の追加縮小を行わないことを確認します。',preserve:label+'と元の歌詞・描画・サイズ・配置。'});
 for(const layout of ['panels','ticket'])add('H03',layout+'-explicit-scale',{layout,control:'explicit-scale',explicitScale:.72,expectation:'explicit-scale-preserved',label:displayName(layout)+'・明示contentScale0.72',look:targets[layout],change:'実project入力の明示倍率を保持します。同サイズの組版は認め、追加の限定縮小は認めません。',preserve:'明示倍率0.72・歌詞・読み順・時刻。構成の実測とサイズを前後で確認します。'});
 return out;
}
module.exports=cases;Object.assign(module.exports,{fullMatrix:cases,layouts,revised,accepted,anchors,aspects,phases,targets,names,displayName});
