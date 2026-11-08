const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');

function pixels(w,h,seed){
 const data=new Uint8ClampedArray(w*h*4);
 for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed>>>24;}
 // Include dark edge runs and an enclosed dark subject, with all alpha values.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(x<2||y<2||x>=w-2||y>=h-2||x===w>>1&&y>h/3&&y<h*2/3){const i=(y*w+x)*4;data[i]=x%25;data[i+1]=y%25;data[i+2]=(x+y)%25;data[i+3]=(x+y*17)%256;}
 return data;
}
function loadChroma(filename){
 const source=fs.readFileSync(filename,'utf8').replace(/\r\n/g,'\n'),start=source.indexOf('J.chromaSource ='),end=source.indexOf('\nJ.drawMediaCut =',start);
 assert(start>0&&end>start,'Chroma source boundaries');
 const J={clamp:(n,lo,hi)=>Math.max(lo,Math.min(hi,n))},document={createElement(){
  const c={width:0,height:0},x={drawImage(src,a,b,w,h){assert.equal(w,src.width);assert.equal(h,src.height);this.data=src.data.slice();},getImageData(){return {data:this.data.slice()};},putImageData(image){this.data=image.data.slice();}};
  c.getContext=()=>x;return c;
 }};
 vm.runInNewContext(source.slice(start,end),{J,document,chromaCanvases:new WeakMap()},{filename});return J.chromaSource;
}
function results(filename){
 const fn=loadChroma(filename),cases=[];
 for(const [w,h,seed] of [[257,127,891],[1,129,12],[131,1,77],[2,2,5]]){
  const source={width:w,height:h,data:pixels(w,h,seed)};
  for(const color of ['#00ff00','#0044ff','#cc3311','#ffffff','#000000','#252524','#3f2020','#402020','#ff00ff','#abcdef','']){
   const out=fn(source,{chromaColor:color},w,h),data=out.getContext('2d').getImageData().data;
   cases.push({w,h,seed,color,sha256:crypto.createHash('sha256').update(data).digest('hex')});
  }
 }
 return cases;
}
module.exports={results};
if(require.main===module){
 const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/chroma-pixels.json'),'utf8'));
 assert.deepEqual(results(path.join(__dirname,'../src/08d_media.js')),fixture.cases);
 console.log(`Chroma: ${fixture.cases.length} byte-exact vectors across hue, saturation, neutral keys, alpha and edge trimming`);
}
