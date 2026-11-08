const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function histories(){
 let seed=20261108;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296),out=[];
 for(let n=0;n<24;n++)out.push(Array.from({length:n},()=>Object.fromEntries(['layout','enter','hold'].filter(()=>random()>.1).map(key=>[key,['alpha','beta','gamma'][Math.floor(random()*3)]]))));
 return out;
}
function weights(source,original=false){
 const name=original?'novelty':'noveltyWeights',begin=source.indexOf('function '+name+'('),end=source.indexOf('function pickLayout(',begin);
 assert(begin>=0&&end>begin,'history weighting function exists');const output=[];
 for(const unity of [false,true]){
  const fn=new Function('UNITY',source.slice(begin,end)+'return '+name+';')(unity);
  for(const history of histories())for(const key of ['layout','enter','hold'])for(const value of ['alpha','beta','gamma','none',undefined]){
   const valueWeight=original?fn(history,key,value):fn(history,key).get(value)??1;
   const bytes=Buffer.alloc(8);bytes.writeDoubleLE(valueWeight);output.push(bytes.toString('hex'));
  }
 }
 return output;
}
const hash=values=>crypto.createHash('sha256').update(values.join('\n')).digest('hex');
module.exports={weights,hash};
if(require.main===module){
 const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/planner-history.json'),'utf8'));
 const output=weights(fs.readFileSync(path.join(__dirname,'../src/08_planner.js'),'utf8'));
 assert.equal(output.length,fixture.cases);assert.equal(hash(output),fixture.sha256);
 console.log(`Planner history: ${output.length} original Float64 weights preserved for both selection modes`);
}
