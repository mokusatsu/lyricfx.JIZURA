const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
function loadComposition(filename){
 const context=vm.createContext({window:{}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/01_util.js'),'utf8'),context);
 vm.runInContext(fs.readFileSync(filename,'utf8'),context);return context.window.J;
}
function vectors(J){
 const rng=J.rng(20261108),cases=[];
 for(let i=0;i<512;i++){
  const cut={seed:rng.int(0,0x7fffffff),...(i%3===0?{placementSeed:rng.int(0,65535),placementBase:rng.int(0,0x7fffffff)}:{})};
  const options={w:i%11===0?1.2:rng.range(.015,.9),h:i%13===0?1.1:rng.range(.02,.8),fixedSize:i%5===0};
  if(i%4===0)options.minSize={w:options.w*.72,h:options.h*.6};
  if(i%3!==0)options.zone={x:rng.range(0,.4),y:rng.range(0,.4),w:rng.range(.2,.6),h:rng.range(.2,.6)};
  if(i%2)options.fgCenter={x:rng(),y:rng()};
  options.obstacles=Array.from({length:i%4},()=>({x:rng.range(-.1,.8),y:rng.range(-.1,.8),w:rng.range(.1,.4),h:rng.range(.1,.4)}));
  if(i%17===0)options.obstacles=[{x:-1,y:-1,w:3,h:3}];
  cases.push([cut,options]);
 }
 return cases;
}
function results(J){return vectors(J).map(([cut,options])=>J.composeLyricArea(cut,options));}
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
module.exports={loadComposition,results,hash};
if(require.main===module){
 const expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/lyric-composition.json'),'utf8'));
 const output=results(loadComposition(path.join(__dirname,'../src/08c_composition.js')));
 assert.equal(output.length,expected.cases);assert.equal(hash(output),expected.sha256);
 console.log(`Lyric composition: ${output.length} original placement results preserved across zones, anchors, obstacles, size limits and seeds`);
}
