/* No actual browser/Canvas/Git/network. Exercises real stock clock/support sources. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ROOT='/workspace/lyricfx.JIZURA',HERE=__dirname;
const window={J:{}},context=vm.createContext({window,document:{createElement(){return{getContext(){return{};}};}}});
vm.runInContext(fs.readFileSync(ROOT+'/src/01_util.js','utf8'),context);window.J.placement={};
for(const p of['src/11p_layoutsEe_bulbs_geometry68.js','src/11p_layoutsEc_tiles_proof48.js'])vm.runInContext(fs.readFileSync(ROOT+'/'+p,'utf8'),context);
const planner=fs.readFileSync(ROOT+'/src/08_planner.js','utf8'),features=fs.readFileSync(ROOT+'/src/08e_lyric_features.js','utf8');
vm.runInContext(planner.slice(planner.indexOf('J.komaOf ='),planner.indexOf('/* ---------------- lyric parsing')),context);
vm.runInContext(features.slice(features.indexOf('J.lyricCutsAt ='),features.lastIndexOf('})();')),context);
const c={index:0,start:0,end:4,dur:4,displayEnd:4,renderStart:0},plan={fps:60,fx:{koma:0},duration:4.150001,cuts:[c]},clock=window.J.placement.tilesProof48.clock(plan,c);
assert.equal(clock.actualCounts.states,250);assert.equal(clock.actualCounts.selectedPasses,727);assert.equal(clock.preimages.length,250);
const {oracle26}=require('./oracle26.cjs'),source=fs.readFileSync(ROOT+'/src/11p_layoutsD.js','utf8'),alias=oracle26(source);assert(alias.includes('window.domino26OracleDY(r)'));assert(!alias.includes('domino73'));assert.equal(alias.split('window.domino26OracleDY(r)').length,2);
const B=require('./bounded73.cjs'),{createCodec69}=require(ROOT+'/dev/avoidance/layouts-d-bulbs69-runner.cjs'),codec=createCodec69(),record={kind:'fill',matrix:[1,0,0,1,0,0],args:[],path:[{key:'arc',args:[1,2,3,0,Math.PI*2],matrix:[1,0,0,1,0,0]}],state:{alpha:1}},value={records:[record],paintPrimitives:[{kind:'circle',args:[1,2,3],paintStart:0}],primitiveCalls:[{kind:'circle',matrix:[1,0,0,1,0,0]}]};assert.deepEqual(codec.restore(codec.pack(value)),value);assert.equal(codec.tables.paint.table.length,1);
const G=window.J.placement.bulbsGeometry68;for(const cy of[.42*540,.2*540]){const p=B.candidates([{x0:110,x1:850,y0:166,y1:382}],{cx:480,cy,r:108,margin:2.7},G);assert(p.candidates.length<=5);assert(p.candidates.every(r=>r.rowDeltas.every(d=>Object.is(d[0],0))));}
fs.writeFileSync(HERE+'/pure-clock26.json',JSON.stringify(clock));
console.log(JSON.stringify({state:'PASS_DOMINO26_SOURCE_PURE_ONLY',states:clock.actualCounts.states,passes:clock.actualCounts.selectedPasses,preimages:clock.preimages.length,oracleYExpressionOnly:true,codecParallelMetadataRoundtrip:true,browser:false,Canvas:false,Git:false,network:false,adapterRegistered:false}));
context.CanvasRenderingContext2D=function(){};
vm.runInContext(fs.readFileSync(ROOT+'/src/11p_layoutsEf_bulbs_proof69.js','utf8'),context);
vm.runInContext(fs.readFileSync(HERE+'/support26.js','utf8'),context);
const M=[1.011,0,0,1.011,.25,-.5],state={alpha:.7,filter:'none',shadowBlur:0,shadowOffsetX:0,shadowOffsetY:0,shadowColor:'rgba(0, 0, 0, 0)',dash:[],fillStyle:'#ffffff',strokeStyle:'#000000',lineWidth:2,lineCap:'butt',lineJoin:'miter',miterLimit:10,textBaseline:'middle',textAlign:'center'};
const path=(key,args)=>({key,args,matrix:M.slice()}),base={args:[],owner:'dominoes.row.0',role:'primary',pass:'main',matrix:M,state},samples=[
 {record:{...base,kind:'fillText',args:['風',0,-25],path:[],metrics:{width:40,actualBoundingBoxLeft:19,actualBoundingBoxRight:20,actualBoundingBoxAscent:21,actualBoundingBoxDescent:20}},primitive:null},
 {record:{...base,kind:'fill',path:[path('arc',[1,2,3,0,Math.PI*2])],metrics:null},primitive:{kind:'circle',args:[1,2,3]}},
 {record:{...base,kind:'stroke',path:[path('moveTo',[-20,0]),path('lineTo',[20,0])],metrics:null},primitive:{kind:'line',args:[[[-20,0],[20,0]]]}},
 {record:{...base,kind:'fill',path:[path('moveTo',[-18,-40]),path('arcTo',[20,-40,20,0,2]),path('arcTo',[20,0,-20,0,2]),path('arcTo',[-20,0,-20,-40,2]),path('arcTo',[-20,-40,20,-40,2]),path('closePath',[])],metrics:null},primitive:{kind:'rrect',args:[-20,-40,40,40,2]}}
];
for(const[sample,i]of samples.map((x,i)=>[x,i]))sample.support=window.domino26Support.support(sample.record,sample.primitive,i);
assert.throws(()=>window.domino26Support.support({...samples[2].record,path:[...samples[2].record.path,path('lineTo',[25,0])]},samples[2].primitive,0),/UNSUPPORTED_STROKE_PATH/);
fs.writeFileSync(HERE+'/pure-support26.json',JSON.stringify(samples));console.log(JSON.stringify({state:'PASS_DOMINO26_CONDITIONAL_SUPPORT_SOURCE_PURE',supports:4,unknownThreePointStrokeRejected:true,actualCanvas:false}));
