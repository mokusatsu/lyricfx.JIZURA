'use strict';
// Compare the support inputs against the real native layout's emitted items.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'../..'),sandbox={window:{},console};vm.createContext(sandbox);
for(const file of ['src/01_util.js','src/06_layouts.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox,{filename:file});
const J=sandbox.window.J;J.placement={};vm.runInContext(fs.readFileSync(path.join(root,'src/11zz14a_center_circle.js'),'utf8'),sandbox);
const W=796.6038923312125,H=420.9944087991293,cut={layout:'scatter',text:'夜明けの色を',seed:3721898315,dur:.8857808857808859,params:{font:'dela',fontB:'zenkaku',extras:true}},st={fonts:{body:['body']}};
const model=J.placement.centerCircle.scatterSourceItems({W,H,cut,st}),main=[],extras=[];
J.mainDraw=(_env,item)=>{main.push(item);return null;};
const env={W,H,cut,st,sc:{sub:'sub',fg:'fg',accent:'accent'},ltb:cut.dur,withDrawRole(_r,_o,fn){return fn();},draw(item){extras.push(item);}};
J.LAYOUTS.scatter.render(env);
const fields=['text','font','size','x','y','rot','mi'];
const pick=(o,keys)=>Object.fromEntries(keys.map(k=>[k,o[k]]));
assert.deepEqual(JSON.parse(JSON.stringify(model.items.map(x=>pick(x,fields)))),JSON.parse(JSON.stringify(main.map(x=>pick(x,fields)))));
assert.equal(extras.length,9);
assert.deepEqual(JSON.parse(JSON.stringify(model.extras.map(x=>pick(x,fields.slice(0,-1))))),JSON.parse(JSON.stringify(extras.map(x=>pick(x,fields.slice(0,-1))))));
assert(model.extras.every((item,i)=>item.appear===J.r(cut.seed,i,81)*cut.dur*.5));
assert(extras.every(item=>item.ghost===false));
console.log('PASS: all scatter main items and nine native extras match source geometry');
