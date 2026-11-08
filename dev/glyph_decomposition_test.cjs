const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
function loadDecomposer(filename){
 const source=fs.readFileSync(filename,'utf8'),start=source.indexOf('function decompose('),end=source.indexOf('/* split a piece',start);
 assert(start>=0&&end>start,'glyph decomposition entry point');
 let alpha,size;
 class Canvas{
  getContext(){const canvas=this;return {
   fillText(){},
   getImageData(){const data=new Uint8ClampedArray(size*size*4);for(let i=0;i<alpha.length;i++)data[i*4+3]=alpha[i];return {data};},
   createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
   putImageData(image){canvas.pixels=image.data;},
  };}
 }
 const context={_pid:0,document:{createElement:()=>new Canvas()},J:{fontCSS:()=>''}};
 vm.runInNewContext(source.slice(start,end)+'\nthis.decomposeGlyph=decompose;',context,{filename});
 return (input,resolution=128)=>{
  size=Math.ceil(resolution*1.45);alpha=new Uint8Array(size*size);context._pid=0;
  for(const [x,y,w,h,value]of input.rects||[])for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)alpha[yy*size+xx]=value;
  for(const [x,y,value]of input.pixels||[])alpha[y*size+x]=value;
  return Array.from(context.decomposeGlyph('fixture','x',resolution).pieces,piece=>({id:piece.id,cx:piece.cx,cy:piece.cy,w:piece.w,h:piece.h,area:piece.area,res:piece.res,
   width:piece.cv.width,height:piece.cv.height,pixels:crypto.createHash('sha256').update(piece.cv.pixels).digest('hex')}));
 };
}
module.exports={loadDecomposer};
if(require.main===module){
 const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/glyph-components.json'),'utf8'));
 const decompose=loadDecomposer(path.join(__dirname,'../src/02_fonts.js'));
 for(const test of fixture.cases)assert.deepEqual(decompose(test,fixture.resolution),test.expected,test.name);
 console.log(`Glyph components: ${fixture.cases.length} connectivity, edge, alpha-fringe, hole and speck contracts passed`);
}
