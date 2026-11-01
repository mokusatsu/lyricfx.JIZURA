/* Native B specimen and focus compositions, owned supports during hold. */
(()=>{'use strict';
const A=J.placement,ID=[1,0,0,1,0,0],ids=new Set(['typeSpecimen','kanjiFocus']),keys=['x0','x1','y0','y1'];
function bSpecimenFocusUnits({W,H,cut,plan,st,holdOnly=true,holdWindow}){
 if(!ids.has(cut.layout)||!holdOnly||!holdWindow||cut.layoutBRecipe||
    (cut.treat||'none')!=='none'||!['cut','flicker','invertBox'].includes(cut.enter)||
    !['cut','tyStrike'].includes(cut.exit)||!['still','knCounterRock'].includes(cut.hold)||
    (cut.groupExit??cut.exit)!==cut.exit||!(cut.motionScale==null||cut.motionScale>=0&&cut.motionScale<=1)||
    !(cut.decor||[]).every(d=>d.id==='memphis'||d.id==='starburst')||
    /[\p{Extended_Pictographic}\u200d\ufe0f]/u.test(cut.text))return null;
 const earliest=holdWindow.native.start-holdWindow.step-1.6/24;
 if(!Number.isFinite(earliest)||earliest<cut.start||!Number.isFinite(cut.outDur)||
    holdWindow.native.end>cut.start+cut.dur-cut.outDur)return null;
 const smallPlan={...plan,W,H,style:st};A.layoutsBFormulaDomain(smallPlan,cut,true);
 const renderer=Object.create(J.Renderer.prototype),time=Math.max(A.layoutsBSourceRestTime(cut)-cut.start,2),program=A.sourceFormulaBase.construct(renderer,smallPlan,cut,{W,H,time,pass:'main'}),events=program.events,
       mainEvents=events.filter(e=>e.kind==='item'&&e.args[0].placementMain),norm=t=>String(t??'').replace(/\s/g,'');
 if(mainEvents.length<1||mainEvents.length>16||cut.layout==='typeSpecimen'&&mainEvents.length!==1||
    events.some(e=>e.role!=='primary'||e.clips?.length)||norm(mainEvents.map(e=>e.args[0].text).join(''))!==norm(cut.text))return null;
 const source={...cut,layout:'center',area:null,params:{}},units=[],mains=[];
 for(let i=0;i<mainEvents.length;i++){
  const e=mainEvents[i],item=e.args[0];
  if(e.matrix.some((v,j)=>Math.abs(v-ID[j])>1e-9)||item.rot||item.skew||item.vertical||item.noHold)return null;
  const main=A.centerCircle.sourceUnits(item,source,smallPlan,{holdOnly:true});if(!main)return null;
  const ready=cut.start+(item.mi|0)*(cut.stagger||0)+(cut.enter==='cut'?0:Math.max(.01,cut.inDur));
  if(cut.enter==='invertBox'&&earliest<ready){const entry=A.centerCircle.sourceUnits(item,{...source,hold:'still',exit:'cut'},smallPlan,{holdOnly:false});if(!entry)return null;main.units.push(...entry.units.filter(u=>u.owner==='center.invertBox'));}
  units.push(...main.units.map(u=>({...u,owner:cut.layout+'.main.'+i+'.'+u.owner})));mains.push(main);
 }
 // Retain the 09e/09f source bounds for every primary object, including the
 // specimen copies/labels/rules or the independently scaling focus glyph.
 // The duplicated native-main bounds are conservative; animated main units
 // above still supply the hold and stagger support.
 const shapes=A.layoutsBSourceEnvelopes(program,smallPlan,program.sourceCut);
 for(let i=0;i<shapes.length;i++)units.push({owner:cut.layout+'.source.'+i,kind:'native-sweep',bounds:A.bounds([shapes[i]])});
 const bbRanges=Object.fromEntries(keys.map(k=>[k,[Math.min(...mains.map(m=>m.bbRangesAny[k][0])),Math.max(...mains.map(m=>m.bbRangesAny[k][1]))]]));
 if(cut.layout==='kanjiFocus'){
  // The underline follows the live union bbox, including partial entrances.
  const size=program.nativeGeometry?.base?.size;if(!(size>0))return null;
  const pad=Math.max(1,Math.min(W,H)*.0013)*5+2;
  units.push({owner:'kanjiFocus.live-underline',kind:'line',bounds:{x0:bbRanges.x0[0]-pad,x1:bbRanges.x1[1]+pad,y0:bbRanges.y1[0]+size*.7-pad,y1:bbRanges.y1[1]+size*.7+pad}});
 }
 for(const d of cut.decor||[]){const args={W,H,P:d,cut,st,bbRanges:[bbRanges],includeFallback:true},parts=d.id==='memphis'?A.memphisUnits?.(args):A.starburstUnits?.(args);if(!parts?.length)return null;units.push(...parts);}
 return {units,bbRanges,scope:'native-hold'};
}
A.bSpecimenFocusUnits=args=>{try{return bSpecimenFocusUnits(args);}catch(e){if(e.code&&(e.code.startsWith('UNSUPPORTED_')||e.code.startsWith('SOURCE_FORMULA_')||e.code.startsWith('EDITORIAL_')||e.code==='GEOMETRY_LIMIT'||e.code==='B_INTERVAL_ADAPTER_PENDING'||e.code==='SOURCE_COVERAGE'))return null;throw e;}};
})();
