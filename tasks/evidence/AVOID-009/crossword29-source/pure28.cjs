'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const base=__dirname,root='/workspace/lyricfx.JIZURA',sandbox={window:{}};vm.runInNewContext(fs.readFileSync(root+'/src/01_util.js','utf8'),sandbox);const J=sandbox.window.J;
J.unionBB=(a,b)=>a||b;let calls;
J.mainDraw=(env,item)=>{calls.push({kind:'main',item:structuredClone(item)});return {x0:item.x-item.size/2,y0:item.y-item.size/2,x1:item.x+item.size/2,y1:item.y+item.size/2};};
const compile=name=>Function('return '+fs.readFileSync(path.join(base,name),'utf8'))()(J),native=compile('native-factory.js'),privateSource=compile('private-factory.js'),zero=compile('oracle-zero-factory.js'),cell=compile('oracle-cell60below-factory.js');
function envAt(lt){return{W:960,H:540,lt,ltb:lt,pass:'main',pOut:J.clamp((lt-3.6)/.4),pIn:J.clamp(lt/.35),sc:{bg:'#151923',fg:'#ffffff',sub:'#a6b2c2',accent:'#ffce4d'},st:{fonts:{body:['gothic_med'],mono:['mono']}},cut:{text:'風の先へ',lineText:'風の先へ',note:'',seed:1205,params:{font:'dela',dens:.18,fill:2,clue:true},dur:4,stagger:.04,hold:'still'},rect(...args){calls.push({kind:'rect',args});},line(...args){calls.push({kind:'line',args});},draw(item){calls.push({kind:'draw',item:structuredClone(item)});}};}
function run(render,lt,recipe){calls=[];const env=envAt(lt),before=JSON.stringify(env),result=recipe?privateSource.withRecipe(env,recipe,()=>render(env)):render(env);assert.equal(JSON.stringify(env),before);return{calls:structuredClone(calls),result};}
const rows=[];
for(const lt of[0,.3,.4,1.5,3.85,4.083333333333333]){
 const a=run(native,lt),off=run(privateSource.render,lt),z=run(privateSource.render,lt,{scale:1,below:false}),o=run(zero,lt),c=run(privateSource.render,lt,{scale:.6,below:true}),ref=run(cell,lt);
 assert.deepEqual(off,a);assert.deepEqual(z,a);assert.deepEqual(o,a);assert.deepEqual(c,ref);
 for(const r of[a,c]){assert.equal(r.calls.filter(c=>c.kind==='main').map(c=>c.item.text).join(''),'風の先へ');assert.equal(r.calls.filter(c=>c.kind==='draw'&&c.item.track===.08).length,4);}
 const nativeClues=a.calls.filter(c=>c.kind==='draw'&&c.item.track===.08),newClues=c.calls.filter(c=>c.kind==='draw'&&c.item.track===.08);assert.deepEqual(nativeClues.map(c=>[c.item.text,c.item.font,c.item.size,c.item.alpha]),newClues.map(c=>[c.item.text,c.item.font,c.item.size,c.item.alpha]));
 const nums=c.calls.filter(c=>c.kind==='draw'&&/^\d+$/.test(c.item.text));assert(nums.every(c=>c.item.size===68.26666666666667*.2&&c.item.size>=12));
 assert.deepEqual(a.calls.filter(c=>c.kind==='main').map(c=>c.item.mi),c.calls.filter(c=>c.kind==='main').map(c=>c.item.mi));
 const pencil=c.calls.filter(q=>q.kind==='draw'&&q.item.track!==.08&&!/^\d+$/.test(q.item.text)).map(q=>q.item.text);assert.deepEqual(pencil,a.calls.filter(q=>q.kind==='draw'&&q.item.track!==.08&&!/^\d+$/.test(q.item.text)).map(q=>q.item.text));
 rows.push({lt,lineText:'風の先へ',pencil,nativeCalls:a.calls.length,recipeCalls:c.calls.length,numberItems:nums.length,nativeClues:nativeClues.map(c=>c.item.text),fullText:'風の先へ'});
}
const env=envAt(1.5);assert.throws(()=>privateSource.withRecipe(env,{scale:.6,below:true},()=>{throw Error('TEST_THROW');}),/TEST_THROW/);calls=[];assert.doesNotThrow(()=>privateSource.withRecipe(env,{scale:1,below:false},()=>privateSource.render(env)));
assert.throws(()=>privateSource.withRecipe(env,{scale:.5,below:true},()=>{}),/PRIVATE_RECIPE/);
assert.throws(()=>privateSource.withRecipe(env,{scale:.6,below:true,numberSize:8},()=>{}),/PRIVATE_RECIPE/);
const names=['native-factory.js','private-factory.js','oracle-zero-factory.js','oracle-cell60below-factory.js','observer-factory.js','browser28.js','host28.cjs','storage28.cjs'];for(const n of names)new vm.Script(fs.readFileSync(path.join(base,n),'utf8'),{filename:n});
const result={status:'PURE_SOURCECALL_AND_SYNTAX_PASS',rows,privateFinallyRestored:true,Canvas:0,RGBA:0,actualPaint:0,actualClockEnumeration:0,qualification:false,limits:'mock source entry methods only; real renderer/native font/pixel/ghost behavior unexecuted'};fs.writeFileSync(path.join(base,'pure-result28.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
