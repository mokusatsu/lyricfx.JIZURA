const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/02_fonts.js'),'utf8'),start=source.indexOf('const MAX_TINT_BYTES'),end=source.indexOf('J.glyphs = new GlyphCache()',start);
assert(start>=0&&end>start);
const document={createElement(){const canvas={width:0,height:0};canvas.getContext=()=>({drawImage(input){canvas.source=input;},set fillStyle(value){canvas.color=value;},fillRect(){}});return canvas;}};
const GlyphCache=new Function('document',source.slice(start,end)+'return GlyphCache;')(document),cache=new GlyphCache();
const sourceCanvas={width:1024,height:1024},piece={id:1,cv:sourceCanvas};
assert.equal(cache.sprite(piece,'#fff'),sourceCanvas);
const first=cache.sprite(piece,'#100000');assert.equal(cache.sprite(piece,'#100000'),first);
for(let i=1;i<=20;i++){
 cache.sprite(piece,'#'+(0x100000+i).toString(16));
 const bytes=[...cache.tint.values()].flatMap(m=>[...m.values()]).reduce((sum,c)=>sum+c.width*c.height*4,0);
 assert.equal(cache.tintBytes,bytes);assert(bytes<=64*1024*1024);
}
assert.equal(cache.tint.get(piece.id).has('#100000'),false,'oldest tint evicted');
assert.equal(first.width,1024,'eviction preserves canvases held by earlier draws');assert.equal(first.color,'#100000');
const regenerated=cache.sprite(piece,'#100000');assert.notEqual(regenerated,first);assert.equal(regenerated.source,sourceCanvas);assert.equal(regenerated.color,first.color);
const another=cache.sprite({id:2,cv:{width:16,height:32}},'#100000');assert.notEqual(another,regenerated);assert.equal(another.width,16);
const before=cache.tintBytes,big={id:3,cv:{width:8192,height:8192}};
assert.notEqual(cache.sprite(big,'#123456'),cache.sprite(big,'#123456'),'oversized tints remain drawable without being cached');assert.equal(cache.tintBytes,before);
for(const method of ['clear','evict']){cache[method]();assert.equal(cache.tint.size,0);assert.equal(cache.tintOrder.size,0);assert.equal(cache.tintBytes,0);cache.sprite(piece,'#123456');}
console.log('Glyph tint cache: byte bound, FIFO eviction, retained canvas, regeneration, oversized image and reset passed');
