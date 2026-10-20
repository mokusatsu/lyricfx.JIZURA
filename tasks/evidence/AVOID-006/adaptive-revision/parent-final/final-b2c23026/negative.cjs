'use strict';
// Independent bounded recorder tests. Run only after the parent releases CPU.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),path=require('node:path');
const root=process.argv[2]||'/workspace/lyricfx.JIZURA',out=__dirname,hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function load(){
 const source=fs.readFileSync(root+'/src/09a_placement.js','utf8'),adaptive=fs.readFileSync(root+'/src/09d_adaptive_placement.js','utf8');
 const ctx={canvas:{width:1,height:1},reset(){Object.assign(this,{M:[1,0,0,1,0,0],filter:'none',shadowBlur:0,shadowOffsetX:0,shadowOffsetY:0,shadowColor:'transparent',globalCompositeOperation:'source-over',globalAlpha:1,miterLimit:10,lineCap:'butt',lineJoin:'miter',lineDashOffset:0,dash:[]})},getTransform(){const [a,b,c,d,e,f]=this.M;return {a,b,c,d,e,f}},setTransform(...m){this.M=m},getLineDash(){return this.dash},setLineDash(a){this.dash=a},save(){},restore(){},measureText(){return {actualBoundingBoxLeft:5,actualBoundingBoxRight:5,actualBoundingBoxAscent:5,actualBoundingBoxDescent:5}}};ctx.reset();
 const J={TAU:Math.PI*2,DEG:Math.PI/180,metrics:{revision:0},fontCSS:()=> '10px Test',layoutText:it=>Array.from(it.text,(ch,i)=>({ch,i,x:0,y:0,vx:0,vy:0,w:10,h:10})),drawItem(){}};
 const context={J,document:{createElement:()=>({getContext:()=>ctx})}};vm.createContext(context);
 const pre=source.slice(source.indexOf('const A ='),source.indexOf('A.clear ='));
 const owned=adaptive.slice(adaptive.indexOf('function ownedInkQuality('),adaptive.indexOf('\nfunction ',adaptive.indexOf('function ownedInkQuality(')+1));
 vm.runInContext(pre+'\n'+owned+'\nJ.owned=ownedInkQuality;',context);
 return {A:J.placement,J,ctx,hashes:{placement:hash(source),adaptive:hash(adaptive),extracted:hash(pre+owned)}};
}
const {A,J,ctx,hashes}=load(),rows=[],failures=[];
function run(name,ops,{budget,fontFailure=false,ownedBox=[0,0,1,1]}={}){
 const renderer={makeEnv:(c,p,cut,sc,env)=>({...env,ctx:c}),drawCut:e=>{e.placementRecorder.item({text:'X',font:'test',size:10,x:50,y:50,placementOwnedBox:ownedBox});ops(e)}};
 const env={ctx,plan:{},cut:{index:0,placementLayoutsA:true},sc:{},pass:'main',scale:1,...(budget?{placementBudget:budget}:{})};
 const prior=ctx.measureText;if(fontFailure)ctx.measureText=()=>({actualBoundingBoxLeft:NaN,actualBoundingBoxRight:5,actualBoundingBoxAscent:5,actualBoundingBoxDescent:5});J.metrics.revision++;
 const obtain=validationOnly=>{ctx.reset();try{return A.record(renderer,env,{validationOnly})}catch(e){return {measurementSupported:false,diagnostics:[{code:e.code,message:e.message}]}}};
 const full=obtain(false);if(budget){budget.events=0;budget.glyphs=0;}const budgetBefore=JSON.stringify(budget),preliminary=obtain(true);
 if(budget&&JSON.stringify(budget)!==budgetBefore)failures.push({name,message:'Validation mutated caller resource budget'});
 const result=p=>{if(!p.measurementSupported&&!p.validationSupported)return ['UNSUPPORTED_MEASUREMENT',p.diagnostics];try{J.owned(p);return ['accepted']}catch(e){return [e.code,e.message]}};
 const expected=result(full),actual=preliminary.validationSupported?result(preliminary):result(obtain(false));
 const row={name,full:expected,prepass:actual,validationSupported:preliminary.validationSupported,measurementSupported:preliminary.measurementSupported};rows.push(row);
 if(JSON.stringify(expected)!==JSON.stringify(actual))failures.push({name,message:'First failure parity mismatch',row});
 if(preliminary.validationOnly&&preliminary.measurementSupported)failures.push({name,message:'Validation returned geometry certificate'});
 if(preliminary.validationOnly){try{A.replay(env,{...preliminary,measurementSupported:true},[0,0]);failures.push({name,message:'Forged validation replay accepted'})}catch(e){if(e.code!=='UNSUPPORTED_DRAW_PROGRAM')failures.push({name,message:'Unexpected replay failure '+e.code})}}
 ctx.measureText=prior;
}
run('ordinary-owned-overflow',e=>e.rrect(10,10,100,50,5,'#fff',1,true,true,1));
run('successful-prepass-requires-full-certificate',e=>e.rrect(10,10,100,50,5,'#fff',1,true,true,1),{ownedBox:[0,0,100,100]});
run('unsupported-after-owned',e=>e.ctx.drawImage({}));
run('invalid-radius-after-owned',e=>e.rrect(10,10,100,50,NaN,'#fff',1,true,true,1));
run('invalid-circle-after-owned',e=>e.circle(NaN,10,5,'#fff','#000',1,1,true));
run('collapsed-rounded-shape-after-owned',e=>e.rrect(1e20,1e20,1e-10,1e-10,1e-11,'#fff',1,true,true,1e-20));
run('overflow-shape-after-owned',e=>e.circle(1e308,1e308,1e308,'#fff','#000',1,1,true));
run('event-ceiling-after-owned',e=>{for(let i=0;i<4096;i++)e.circle(10,10,5,'#fff','#000',1,1,true)});
run('glyph-ceiling-after-owned',e=>e.placementRecorder.item({text:'A'.repeat(16384),size:10,x:0,y:0}));
run('unsupported-font-before-owned',()=>{},{fontFailure:true});
run('shared-budget-isolated',e=>e.circle(10,10,5,'#fff','#000',1,1,true),{budget:{events:0,glyphs:0}});
const report={root,hashes,cases:rows.length,rows,failures};fs.writeFileSync(path.join(out,'negative.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(failures.length)process.exitCode=1;
