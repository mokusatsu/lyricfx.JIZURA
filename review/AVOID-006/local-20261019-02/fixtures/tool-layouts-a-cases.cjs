/* AVOID-006 selected native comparison conditions. This is not an exhaustive
 * parameter/transform/annotation Cartesian matrix. Anchors use unscaled native
 * layouts, and must be admitted by the actual continuous certificate. */
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
 subtitleBar:'下部の主字幕と大きな淡い複製（どちらもprimary）、レターボックスと背景面、上部タイムコード。',
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
/* Observed native anchors from the product lead's layouts-a-anchors.json.
 * All26 passed lead's interval oracle and seven sampled actual phase checks.
 * Capture independently admits each row again; this definition is not evidence.
 * 18 use radius.2; eight use an explicitly diagnostic corner circle radius.02.
 * Circle/text/parameter changes are visible. All130 default spatial exploration
 * rows remain native defaults, with safe/insufficient strictly enforced. */
const anchors={"lowerThird":{"W":960,"H":540,"cx":0.5,"cy":0.5,"radius":0.2},"corners":{"W":1920,"H":1080,"cx":0.5,"cy":0.25,"radius":0.2},"staircase":{"W":960,"H":540,"cx":0.5,"cy":0.25,"radius":0.2},"zigzag":{"W":960,"H":540,"cx":0.5,"cy":0.25,"radius":0.2},"gridCells":{"W":960,"H":540,"cx":0.5,"cy":0.25,"radius":0.2},"dropCap":{"W":960,"H":540,"cx":0.5,"cy":0.25,"radius":0.2},"justified":{"W":1920,"H":1080,"cx":0,"cy":0,"radius":0.02},"frameBox":{"W":960,"H":540,"cx":0.5,"cy":0.25,"radius":0.2},"bubble":{"text":"光","W":960,"H":540,"cx":0.5,"cy":0.5,"radius":0.2,"params":{"shape":"round","burst":false,"tilt":0}},"subtitleBar":{"W":1920,"H":1080,"cx":0,"cy":0,"radius":0.02,"text":"光","params":{"bar":0.13}},"ticker":{"W":960,"H":540,"cx":0.5,"cy":0.75,"radius":0.2},"splitScreen":{"W":1920,"H":1080,"cx":0,"cy":0,"radius":0.02},"mirror":{"W":960,"H":540,"cx":0.5,"cy":0.25,"radius":0.2},"sideways":{"W":1920,"H":1080,"cx":0,"cy":0,"radius":0.02},"edgeFrame":{"W":960,"H":540,"cx":0.5,"cy":0.5,"radius":0.2},"perspective":{"text":"光","W":960,"H":540,"cx":0.5,"cy":0.5,"radius":0.2,"params":{"guides":false,"mode":"floor"}},"hanko":{"W":960,"H":540,"cx":0.5,"cy":0.25,"radius":0.2},"genkou":{"text":"光","W":960,"H":540,"cx":0.25,"cy":0.5,"radius":0.2},"panels":{"W":1920,"H":1080,"cx":0,"cy":0,"radius":0.02,"params":{"fx":"none"}},"filmstrip":{"W":1920,"H":1080,"cx":0,"cy":0,"radius":0.02},"quote":{"W":1920,"H":1080,"cx":0,"cy":0,"radius":0.02},"ruler":{"W":540,"H":960,"cx":0.5,"cy":0.25,"radius":0.2,"params":{"guides":false}},"searchBar":{"W":540,"H":960,"cx":0.5,"cy":0.5,"radius":0.2},"chat":{"W":960,"H":540,"cx":0.5,"cy":0.25,"radius":0.2},"notification":{"text":"光","W":960,"H":540,"cx":0.25,"cy":0.5,"radius":0.2,"params":{"pos":"center","stack":false}},"ticket":{"W":1920,"H":1080,"cx":0,"cy":0,"radius":0.02}};
function fullMatrix(){
 const out=[],add=(hid,id,s)=>out.push({id,hid:'AVOID-006-'+hid,seed:704,text:'風の先へ',W:960,H:540,cx:.5,cy:.5,radius:.2,time:1.5,availability:'implemented',expectation:'safe-or-explicit-insufficient',...s});
 const preserve='ネイティブの文字サイズ、読み順、枠との相対位置、seed、カット開始・終了時刻。';
 for(const layout of layouts){
  add('H01',layout+'-native-anchor',{layout,...anchors[layout],safeAnchor:true,expectation:'safe',phase:'hold',label:displayName(layout)+(anchors[layout].radius===.02?'・角の小円の診断用安全例（通常円の証明ではありません）':'・必須安全例')+'（円中心 '+anchors[layout].cx+','+anchors[layout].cy+'／半径 '+anchors[layout].radius+'／文字「'+(anchors[layout].text||'風の先へ')+'」'+(anchors[layout].params?'／設定 '+JSON.stringify(anchors[layout].params):'')+'）',look:targets[layout]+' この安全例の円条件は、中央半径0.2の標準探索条件と異なる場合があります。円中心・半径・文字・明示設定は上記ラベルと条件欄を確認してください。通常設定の探索条件は別の行に保持しています。',change:(anchors[layout].radius===.02?'角の小円に対する診断用の安全例です。標準半径0.2の回避性能を示しません。':'')+'明示した円条件で、主歌詞と所有する要素が構造を保ち円を避けることを確認します。',preserve});
  for(const [aspect,W,H]of aspects)for(const [position,cy]of aspect==='landscape'?[['上',.25],['中央',.5],['下',.75]]:[['中央',.5]])add('H01',`${layout}-${aspect}-${cy}-hold`,{layout,W,H,cy,aspect,position,phase:'hold',label:`${displayName(layout)}・${aspect}・円${position}・hold`,look:targets[layout],change:'探索条件です。安全なら主歌詞の回避、制約不足なら元サイズのままの診断を確認します。制約不足を安全例には数えません。',preserve});
 }
 for(const layout of ['panels','mirror','edgeFrame','ticker','chat'])for(const [phase,time]of phases.filter(([p])=>p!=='hold'))add('H01',`${layout}-native-anchor-${phase}`,{layout,...anchors[layout],time:layout==='chat'&&phase==='enter'?.55:time,phase,expectation:'safe',label:displayName(layout)+'・必須安全例の'+phase,look:targets[layout],change:'同じ円と同じネイティブ演出の出現／退出時刻です。主歌詞と枠の結合、反射や反復との関係を確認します。',preserve});
 for(const layout of ['mirror','perspective','splitScreen'])for(const [phase,time]of phases)add('H02',`${layout}-transform-${phase}`,{layout,...anchors[layout],time,phase,expectation:'safe',label:displayName(layout)+'・複製／変換・'+phase,look:targets[layout],change:'変換後の主歌詞・意味を持つ付属文字も含め、同一の移動単位で整合することを確認します。複製の反転・遠近・分割を保ちます。',preserve});
 add('H02','lowerThird-supplied-note',{layout:'lowerThird',...anchors.lowerThird,note:'意味のある注釈',params:{label:'copy'},requiredDrawnText:'意味のある注釈',expectation:'safe',phase:'hold',label:displayName('lowerThird')+'・実際に描く供給注釈',look:targets.lowerThird,change:'入力した注釈が実際に描画され、主歌詞と整合して移動することを確認します。',preserve});
 for(const layout of ['ticker','edgeFrame','justified','subtitleBar'])add('H03',`${layout}-auxiliary-hold`,{layout,...anchors[layout],expectation:'safe',phase:'hold',label:displayName(layout)+(layout==='subtitleBar'?'・大きな複製も主歌詞':'・主歌詞と維持する補助'),look:targets[layout],change:layout==='subtitleBar'?'下部字幕と大きな淡い複製は両方ともprimaryです。同じ移動単位で円外へ移動します。複製を補助扱いして除外しません。':'主歌詞の円外経路と、変更前の配置を維持する密な補助反復を比べてください。',preserve:layout==='subtitleBar'?'文字サイズと主字幕・大きな複製の関係を維持します。レターボックスと背景面は独立装飾です。':'補助反復は元の全ステージ配置を維持します。円形マスクはAVOID-018で扱い、ここでは実装していません。'});
 for(const [control,label]of [['legacy','従来ON（旧自動領域）'],['fullstage','従来の全画面描画'],['off','回避OFF'],['manual','手動領域'],['emphasis','強調の例外'],['lock','ロックした配置']])add('H03','control-'+control,{control,layout:'lowerThird',label,expectation:'unchanged',look:label+'の文字位置・文字サイズ・枠。',change:'前後で同じネイティブ描画を維持する対照です。新しい回避成功例には数えません。',preserve:label+'の指定と描画。'});
 add('H03','long-conflict',{layout:'panels',text:'文字サイズとコマ構造を維持すると選択した円外候補に収まらない歌詞',cx:.5,cy:.5,radius:.45,expectation:'insufficient',label:'大きな中央円・経路候補の制約不足',look:targets.panels,change:'文字を勝手に縮めず「制約不足」を明示します。候補群の限界であり、あらゆる配置が不可能という証明ではありません。',preserve});
 return out;
}
function cases(){return fullMatrix();}
module.exports=cases;Object.assign(module.exports,{fullMatrix,layouts,anchors,aspects,phases,targets,names,displayName});
