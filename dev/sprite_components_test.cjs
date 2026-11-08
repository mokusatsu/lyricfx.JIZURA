const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
function loadDetector(filename){const window={},document={readyState:'loading',addEventListener(){}};vm.runInNewContext(fs.readFileSync(filename,'utf8'),{window,document},{filename});return window.SpriteExtractor.detectCCL;}
function results(filename){
 const fn=loadDetector(filename),rows=[];
 for(let t=0;t<128;t++){
  const w=128,h=192,data=new Uint8Array(w*h);let seed=t+1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[y*w+x]=x%48<36&&y%88<74?(seed>>>24)%32+29:((seed>>>24)<(t%4)?255:0);}
  rows.push(fn(data,w,h,t%5*300));
 }
 for(const [w,h,alpha] of [[1,1,255],[70,100,29],[70,100,30],[29,100,255],[30,59,255],[30,60,255]])rows.push(fn(new Uint8Array(w*h).fill(alpha),w,h,0));
 return {cases:rows.length,rectangles:rows.reduce((n,r)=>n+r.length,0),sha256:crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex')};
}
module.exports={results};
if(require.main===module){const expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/sprite-components.json'),'utf8'));assert.deepEqual(results(path.join(__dirname,'../src/13_sprite_extractor.js')),expected.expected);console.log(`Sprite components: ${expected.expected.cases} original rectangles, labels and ordering preserved`);}
