/* Pure evaluation regression only: no driver invocation, DOM or Canvas. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const base=__dirname,previous=path.join(base,'../source28');
const extract=dir=>{const text=fs.readFileSync(path.join(dir,'host28.cjs'),'utf8'),m=text.match(/const create=(.*?);window\.crossword28Local=/);assert(m,'host actual create expression');return m[1];};
const harness=fs.readFileSync(path.join(base,'browser28.js'),'utf8');assert.equal(harness,fs.readFileSync(path.join(previous,'browser28.js'),'utf8'));
const oldExpression=extract(previous),newExpression=extract(base),evaluate=expression=>Function('harness','return '+expression)(harness);
const oldValue=evaluate(oldExpression),newValue=evaluate(newExpression);assert.equal(oldValue,undefined);assert.equal(typeof newValue,'function');assert.equal(newValue.name,'createCrossword28');
const factoryNames=['native-factory.js','private-factory.js','oracle-zero-factory.js','oracle-cell60below-factory.js','observer-factory.js'];
const factoryChecks=factoryNames.map(name=>{const text=fs.readFileSync(path.join(base,name),'utf8');assert.equal(text,fs.readFileSync(path.join(previous,name),'utf8'));const legacy=Function('return '+text)(),grouped=Function('return ('+text+'\n)')();assert.equal(typeof legacy,'function');assert.equal(typeof grouped,'function');return{name,legacyType:typeof legacy,groupedType:typeof grouped};});
const syntax=[];for(const name of fs.readdirSync(base).filter(n=>/\.(?:js|cjs)$/.test(n))){new vm.Script(fs.readFileSync(path.join(base,name),'utf8'),{filename:name});syntax.push(name);}
const result={state:'PASS_PURE_EVAL29_ASI_REPRODUCTION_AND_FIX',oldExpression,oldReturnedType:typeof oldValue,oldReturnedUndefined:oldValue===undefined,newExpression,newReturnedType:typeof newValue,newFunctionName:newValue.name,harnessBytesIdentical:true,factoryChecks,syntax,driverInvocations:0,Canvas:0,browser:0,RGBA:0,productChanges:0,qualification:false};
fs.writeFileSync(path.join(base,'eval-result29.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
