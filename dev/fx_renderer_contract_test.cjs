const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const engine=path.resolve(process.argv[2]||path.join(__dirname,'../src')),warnings=[],context=vm.createContext({J:{E:{}},console:{warn:(...args)=>warnings.push(args)}});
for(const file of ['05b_registry.js','09_render.js'])vm.runInContext(fs.readFileSync(path.join(engine,file),'utf8'),context,{filename:file});
const J=context.J,properties=['globalAlpha','globalCompositeOperation','filter','imageSmoothingEnabled'];
function surface(){
 const canvas={width:4,height:4},stack=[],ctx={canvas,globalAlpha:.37,globalCompositeOperation:'multiply',filter:'blur(2px)',imageSmoothingEnabled:false,copies:0,
  save(){stack.push(Object.fromEntries(properties.map(k=>[k,this[k]])));},restore(){Object.assign(this,stack.pop());},setTransform(){},fillRect(){if(this.failure)throw this.failure;},drawImage(){this.copies++;}};
 canvas.getContext=()=>ctx;return {canvas,ctx};
}
const state=ctx=>Object.fromEntries(properties.map(k=>[k,ctx[k]]));
function run(type,configure=()=>{}){
 warnings.length=0;const output=surface(),scratch=surface(),renderer=Object.create(J.Renderer.prototype),observed=[];
 renderer.scratch=scratch.canvas;configure(output.ctx);
 J.drawCustomEvent=ctx=>observed.push(state(ctx));
 const plan={cuts:[],events:[{type,t:0,dur:1,amp:1}],fps:24,style:{glow:0,texture:{}},fx:{texture:0}},initial=state(output.ctx);
 let error;try{renderer.post(output.ctx,plan,.5,.5,12,{bg:'#000',fg:'#fff'},1,{fast:false,transparent:true},false);}catch(e){error=e;}
 return {error,observed,initial,after:state(output.ctx),copies:scratch.ctx.copies,warnings:[...warnings]};
}
let result=run('invert');assert.equal(result.error,undefined);assert.equal(result.observed[0].globalAlpha,.37);assert.equal(result.observed[0].globalCompositeOperation,'source-over');assert.equal(result.observed[0].filter,'blur(2px)');assert.equal(result.observed[0].imageSmoothingEnabled,false);assert.deepEqual(result.after,result.initial,'post restores the incoming Canvas state');
const failure=new Error('drawing failed');result=run('invert',ctx=>{ctx.failure=failure;});assert.equal(result.error,failure,'builtin drawing failures propagate');assert.equal(result.warnings.length,0);
J.FXE.probe={draw(ctx){ctx.globalAlpha=.1;ctx.filter='none';ctx.globalCompositeOperation='screen';}};
result=run('probe');assert.equal(result.error,undefined);assert.equal(result.observed[0].globalAlpha,1);assert.equal(result.observed[0].globalCompositeOperation,'source-over');assert.equal(result.observed[0].filter,'none');assert.equal(result.observed[0].imageSmoothingEnabled,true);assert.deepEqual(result.after,result.initial);
J.FXE.probe={draw(){throw failure;}};result=run('probe');assert.equal(result.error,undefined,'registered drawing failures stay isolated');assert.equal(result.warnings.length,1);assert.equal(result.warnings[0][2],failure);assert.equal(result.observed.length,1);assert.deepEqual(result.after,result.initial);
J.FXE.probe={scratch:true,draw(){}};result=run('probe');assert.equal(result.copies,1,'a scratch effect receives one source copy');assert.equal(result.error,undefined);
result=run('unknown');assert.equal(result.error,undefined);assert.equal(result.observed.length,1,'custom event handling still runs without a registered draw');
console.log('FX renderer: builtin state/errors, registered isolation/errors, scratch copy and unknown events passed');
