const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
function loadThermal(filename){
 const text=fs.readFileSync(filename,'utf8').replace(/\r\n/g,'\n'),start=text.indexOf('const buffers ='),end=text.indexOf('\nconst PANELS =',start);assert(start>0&&end>start);
 const J={},document={createElement(){const c={width:0,height:0},x={setTransform(){},clearRect(){this.data=new Uint8ClampedArray(c.width*c.height*4);},drawImage(source,a,b,w,h){assert.equal(w,source.width);assert.equal(h,source.height);this.data=source.data.slice();},getImageData(){return {data:this.data.slice()};},putImageData(image){this.data=image.data.slice();}};c.getContext=()=>x;return c;}};
 vm.runInNewContext(text.slice(start,end)+';J.renderTexture=renderTexture;',{J,document,clamp:n=>Math.max(0,Math.min(1,n)),songTime:()=>0},{filename});return J.renderTexture;
}
function results(filename){
 const fn=loadThermal(filename),cases=[];
 for(const [w,h] of [[257,127],[1,256],[257,1]]){
  const data=new Uint8ClampedArray(w*h*4);let seed=791;
  for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed>>>24;}
  // Neutral ramp crosses every interpolation boundary, including black and white.
  for(let i=0;i<Math.min(w*h,256);i++){data[i*4]=data[i*4+1]=data[i*4+2]=i;data[i*4+3]=i;}
  for(const amount of [0,.01,.25,.5,.75,1,1.5]){
   const c=fn({width:w,height:h,data},[w,h],{treat:'thermal'},.3,amount),out=c.getContext('2d').getImageData().data;
   cases.push({w,h,amount,sha256:crypto.createHash('sha256').update(out).digest('hex')});
  }
 }
 return cases;
}
module.exports={results};
if(require.main===module){const expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/thermal-pixels.json'),'utf8'));assert.deepEqual(results(path.join(__dirname,'../src/08g_media_scenes.js')),expected.cases);console.log(`Thermal texture: ${expected.cases.length} byte-exact vectors across luminance, alpha and amount`);}
