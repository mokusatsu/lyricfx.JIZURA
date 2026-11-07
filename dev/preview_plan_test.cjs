const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = vm.createContext({ J: { E:{},clamp:(n,a=0,b=1)=>Math.max(a,Math.min(b,n)) } });
vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/09_render.js'),'utf8'),context);
const J = context.J;
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
const plan = freeze({ W:1920,H:1080,duration:8,cuts:[{line:0,area:{x:0,y:0,w:1,h:1}},{line:1}],
  media:{cuts:[{index:0,zoom:130,hold:'drift',trans:'wipe'}]}, foreground:{cuts:[{index:0,zoom:90}]},
  avoidance:{cuts:[{index:0,cx:.5,cy:.5,r:.2}]},lyricAvoidance:{enabled:false} });
const before = JSON.stringify(plan), draft={x:.1,y:.2,w:.3,h:.4};
assert.equal(J.previewRenderPlan(plan,null),plan);
for (const kind of ['lyric','media','foreground','avoidance']) {
  const edit={kind,index:0,draft,angle:25,enabled:true,lockAspect:true};
  const preview=J.previewRenderPlan(plan,edit);
  assert.equal(preview.previewSource,plan);
  assert.equal(Object.keys(preview).includes('previewSource'),false);
  if (kind==='lyric') { assert.equal(preview.cuts[0].area.angle,25); assert.equal(preview.cuts[1],plan.cuts[1]); }
  if (kind==='media'||kind==='foreground') { assert.equal(preview[kind].cuts[0].zoom,100); assert.equal(preview[kind].cuts[0].placement.cx,.25); }
  if (kind==='avoidance') { assert.equal(preview.avoidance.cuts[0].cx,.25); assert.equal(preview.lyricAvoidance.enabled,true); }
  assert.equal(JSON.stringify(plan),before,'preview leaves the committed plan unchanged');
}
const added=J.previewRenderPlan(plan,{kind:'avoidance',newCut:true,start:2,untilNext:true,draft,enabled:true});
assert.equal(added.avoidance.cuts.length,2);
assert.equal(added.avoidance.cuts[1].end,8);
assert.equal(plan.avoidance.cuts.length,1);
const ui=fs.readFileSync(path.join(__dirname,'../src/12_ui.js'),'utf8');
const draw=ui.slice(ui.indexOf('function drawPreviewFrame('),ui.indexOf('\nfunction draw()',ui.indexOf('function drawPreviewFrame(')));
const state={plan,areaEdit:{kind:'media',index:0,draft},t:1};
const render=new Function('J','S',draw+';return drawPreviewFrame;')(J,state);
assert.throws(()=>render({canvas:{width:640}},{renderer:{frame(){assert.equal(JSON.stringify(plan),before);throw Error('render failure');}}}),/render failure/);
assert.equal(JSON.stringify(plan),before);
// A draft plan must keep using the committed plan's captured video transition.
const media=fs.readFileSync(path.join(__dirname,'../src/08d_media.js'),'utf8');
const start=media.indexOf('J.drawMedia ='),end=media.indexOf('\n};',start)+3;
const canvas=()=>({width:8,height:8,getContext:()=>({setTransform(){},clearRect(){},fillRect(){}})});
context.document={createElement:canvas};
context.transitionFrame=layer=>layer==='media'?J.mediaTransitionFrame:J.foregroundTransitionFrame;
J.mediaSourceAvailable=()=>true;J.isMediaCopy=()=>false;J.mediaAssets=new Map([['previous',{}]]);
J.smooth=(a,b,t)=>t;
const sources=[];J.drawMediaCut=(ctx,cut,time,options)=>sources.push(options.source);
const previous={index:0,itemId:'previous',type:'video',start:0,end:1},next={index:1,itemId:'next',type:'image',start:1,end:2,trans:'fade',transDur:.5};
const committed={media:{cuts:[previous,next]},cuts:[],W:8,H:8},captured=canvas();
J.mediaTransitionFrame={plan:committed,index:0,canvas:captured};
vm.runInContext(media.slice(start,end),context);
const draftPlan=J.previewRenderPlan(committed,{kind:'lyric',index:0,draft});
J.drawMedia({canvas:{width:8,height:8},save(){},setTransform(){},drawImage(){},restore(){}},draftPlan,1.1,{},'media',false,next);
assert.equal(sources[0],captured,'video transition keeps its source across a draft plan');
console.log('Preview plan: frozen source, edited branches, new circle, render failure and video transition cache passed');
