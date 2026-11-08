const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const context=vm.createContext({J:{E:{}},warmJob:0}),root=path.resolve(__dirname,'..');
vm.runInContext(fs.readFileSync(path.join(root,'src/05_anim.js'),'utf8'),context);
const cut=(start,enter,exit,outDur=.8)=>({start,end:start+2,dur:2,inDur:1,outDur,enter,exit});
const cuts=[cut(0,'cut','cut'),cut(1,'assemble','cut'),cut(3,'cut','explode'),cut(5,'cut','fall'),cut(7,'cut','drift'),cut(9,'assemble','explode'),cut(11,'cut','explode',0),cut(13,'custom_assemble','cut')];
context.J.ENTER.custom_assemble={...context.J.ENTER.assemble};
const expected=[1.3,2.6,4.6,6.6,8.6,9.3,10.6];
let queue=[],calls=[];
context.window={requestIdleCallback:callback=>queue.push(callback)};
context.document={createElement:()=>({getContext:()=>({})})};context.$=()=>({width:800,height:450});
context.S={plan:{cuts,W:1920},exporting:null,renderer:{frame:(ctx,plan,time,options)=>calls.push({plan,time,options})}};
const source=fs.readFileSync(path.join(root,'src/12_ui.js'),'utf8'),start=source.indexOf('function warm()'),end=source.indexOf('let replanTimer',start);
assert(start>=0&&end>start);vm.runInContext(source.slice(start,end),context);
function drain(){while(queue.length)queue.shift()({timeRemaining:()=>9});}
context.warm();drain();assert.deepEqual(calls.map(call=>call.time),expected);
for(const {plan,options}of calls){assert.equal(plan,context.S.plan);assert.equal(options.scale,800/1920);assert(options.fast&&options.noHud&&options.noGhost);}
calls=[];context.warm();context.warm();drain();assert.deepEqual(calls.map(call=>call.time),expected,'a superseded idle job is ignored');
calls=[];context.warm();context.S.exporting={};drain();assert.equal(calls.length,0);context.S.exporting=null;
const changed=cut(1,'assemble','cut'),sample=context.J.glyphWarmupTask(changed);changed.start=2;changed.end=4;changed.outDur=0;
assert.deepEqual(Array.from(sample()),[2.3]);changed.enter='cut';assert.deepEqual(Array.from(sample()),[],'scheduled samples read current cut fields');
assert.equal(context.J.glyphWarmupTask(cuts.at(-1)),null,'derived recipes retain their existing eligibility');
console.log('Glyph warmup: sample order, idle grouping, replacement/export cancellation and live cut fields passed');
