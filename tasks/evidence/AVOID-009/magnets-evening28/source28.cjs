'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
assert.equal(process.env.MAGNETS_OBSTACLE28_RELEASE,'PARENT_REVIEWED_SOURCE_MATH_RUNNER');
const D='/tmp/avoid009-evening-magnets28',R='/workspace/lyricfx.JIZURA',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const snippets=JSON.parse(fs.readFileSync(D+'/evidence/source-snippets28.json','utf8')),by={};
for(const s of snippets){assert.equal(sha(Buffer.from(s.text)),s.sha256);assert.equal(fs.readFileSync(R+'/'+s.path,'utf8').split('\n').slice(s.lineStart-1,s.lineEnd).join('\n'),s.text);by[s.key]=s.text;}
const input=JSON.parse(fs.readFileSync(0,'utf8')),context=vm.createContext({window:{}});
vm.runInContext(by.utility+'\nconst E=J.E;\n'+by.layoutHelpers+'\n'+by.darkOf+'\n'+by.objCols+'\n'+by.decoyCharacters,context);
// Recreate the already measured fixture face assignment, not default/web fonts.
const face=input.fontAudit.faces.find(f=>f.id===input.fontAudit.assignments.gothic_black);
assert.equal(face.status,'loaded');assert.equal(face.weight,700);assert.equal(face.family,'Avoid008Editorial-sans-bold');
const fallback=input.fontAudit.faces.find(f=>f.id==='symbols');assert.equal(fallback.family,'Avoid008Editorial-symbols');
const fontFace={family:'"'+face.family+'"',weight:face.weight,fb:'"'+fallback.family+'"',user:true};
vm.runInContext('J.FONTS={gothic_black:'+JSON.stringify(fontFace)+'};\n'+by.fontCSS,context);
vm.runInContext('J.input='+JSON.stringify(input)+`;J.sourceObstacleState=(lt)=>{
 const g=J.input.catalog,cut=J.input.cut,W=J.input.plan.W,H=J.input.plan.H,u=Math.min(W,H),Pm=cut.params,s=cut.seed,sc=cut.palette;
 const base=g.base,nR=g.nR,cols=objCols(sc),nativeD=true;
 ${by.boardConstants}
 ${by.boardColor}
 ${by.handleConstants}
 ${by.handleColor}
 let owner=null,handle=null;const items=[],env={pass:'main',lt,cut,draw:it=>items.push({owner:'magnets.'+owner,item:it}),rrect:(...args)=>{handle={owner:'magnets.'+owner,args};}},o={lt};
 ${by.pOutStatement}
 ${by.outDefinition}
 ${by.baDefinition}
 const catalog={decoys:[],independentDecorOwners:[]};
 const owned=(role,id,fn)=>{owner=id;fn();};
 ${by.handlePaint}
 ${by.decoyBlock}
 for(const record of items){
  const it=record.item;assertPositive(it.size);record.css=J.fontCSS(it.font,it.size);
  const bin=Number(it.size.toFixed(2).replace('.',''));assertPositive(bin);
  const matching=J.input.metrics.find(m=>m.font===it.font&&m.ch===it.text);if(!matching)throw Error('UNMEASURED_FACE_CHARACTER');
  // Exact equality of requested CSS is stronger than an approximate size bound.
  const queries=[];for(let b=bin-1;b<=bin+1;b++){
   if(b<matching.min||b>matching.max)throw Error('UNMEASURED_BIN');
   queries.push({bin:b,requestedCSS:J.fontCSS(it.font,b/100)});
  }
  if(!queries.some(q=>q.requestedCSS===record.css))throw Error('ACTUAL_CSS_NOT_MEASURED');
  record.actualCSSBin=bin;record.queriedBins=queries;
  const theta=it.rot*J.DEG;record.cos=Math.cos(theta);record.sin=Math.sin(theta);
 }
 return {lt,pOut:env.pOut,out,ba,handle,band:catalog.band,decoys:catalog.decoys,items};
};function assertPositive(x){if(!(Number.isFinite(x)&&x>0))throw Error('FINITE_POSITIVE_REQUIRED');}`,context);
const run=vm.runInContext('J.sourceObstacleState',context),plain=x=>JSON.parse(JSON.stringify(x));
const baseline=plain(run(1.5));assert.deepEqual(baseline.decoys,input.catalog.decoys);assert.deepEqual(baseline.band,input.catalog.band);
const h=input.catalog.scene.handle;assert.deepEqual(baseline.handle,{owner:h.owner,args:[h.x,h.y,h.w,h.h,h.r,h.color,h.alpha,h.ghost]});
assert.deepEqual(plain(vm.runInContext('objCols(J.input.cut.palette)',context)),input.catalog.colors);
const rows=input.states.map(s=>({n:s.n,mainClock:s.passes[2].lt,selectorActive:s.passes[2].selectorActive,source:s.passes[2].selectorActive?plain(run(s.passes[2].lt)):null}));
// Old direct/native calls are a geometry model audit, not renderer co-time evidence.
const directChecks=[],directGeometryRows=[];
const fontCSSChecks=[];const css=vm.runInContext('J.fontCSS',context);
for(const m of input.metrics.filter(m=>m.font==='gothic_black'))for(const selected of m.selected){assert.equal(css(m.font,selected.bin/100),selected.requestedCSS);fontCSSChecks.push({font:m.font,ch:m.ch,bin:selected.bin,requestedCSS:selected.requestedCSS,raw21SelectedRequestMatches:true});}
for(const [i,a]of input.nativeCalls.entries())if(a.pass==='main'&&a.ownSelectorActive){
 const state=plain(run(a.lt));assert.deepEqual(state.decoys,a.catalog.decoys);
 const recorded=a.events.filter(e=>e.event.kind==='item'&&/^magnets\.decoy\./.test(e.event.owner));
 for(const e of recorded){const match=state.items.find(v=>v.owner===e.event.owner);assert(match);const actual=e.event.args[0];for(const k of ['text','font','size','x','y','rot','stroke','alpha','ghost'])assert.deepEqual(match.item[k],actual[k]);}
 directGeometryRows.push({n:i,mainClock:a.lt,selectorActive:true,source:state});
 directChecks.push({program:i,lt:a.lt,matchedSourceDecoyCatalog:true,recordedPaintItems:recorded.length,syntheticClockNotAssertedCoTime:true});
}
process.stdout.write(JSON.stringify({kind:'pure-source-main-obstacle28',rows,baseline,directChecks,directGeometryRows,fontCSSChecks,noBrowser:true,noPaintOrRendererExecuted:true}));
