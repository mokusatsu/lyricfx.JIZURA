/* Source/pin reuse checks only: no browser, build, network or Git mutation. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),runner=fs.readFileSync(__dirname+'/layouts-d-bulbs69-runner.cjs','utf8'),{referenceReuse69}=require('./layouts-d-bulbs69-runner.cjs'),dir=root+'/tasks/evidence/AVOID-009/resume-20261025/',acceptance=JSON.parse(fs.readFileSync(dir+'parent-actual03-result.json')),seal=JSON.parse(fs.readFileSync(dir+'parent-reviewed-seal69-actual03.json'));
const old=cp.execFileSync('git',['show','872b8b093ed5bef0ff7c8dcaac846f33f48cc1d5:dev/avoidance/layouts-d-bulbs69-runner.cjs'],{cwd:root,env:{...process.env,GIT_OPTIONAL_LOCKS:'0'},encoding:'utf8'}),span=s=>s.slice(s.indexOf('const CODEC69='),s.includes('\nfunction referenceReuse69')?s.indexOf('\nfunction referenceReuse69'):s.indexOf('\nmodule.exports='));
assert.equal(span(runner),span(old),'accepted codec factory and CODEC constant must be byte-identical');
const verified=referenceReuse69(acceptance,seal);assert(verified.matchedProductPins.length>100);assert.equal(verified.oldTablesDirectlyCompared,false);assert.equal(verified.allPaintsResaved,false);
assert.throws(()=>referenceReuse69({...acceptance,defaultSubsetAcceptance:{...acceptance.defaultSubsetAcceptance,accepted:false}},seal),/ACTUAL03_LIMITED_ACCEPTANCE_REQUIRED/);
const first=seal.files.find(p=>p.path.startsWith('src/'));assert.throws(()=>referenceReuse69(acceptance,seal,p=>p===root+'/'+first.path?Buffer.concat([fs.readFileSync(p),Buffer.from('x')]):fs.readFileSync(p)),/REUSE_INPUT_LENGTH/);
assert.throws(()=>referenceReuse69(acceptance,{...seal,files:seal.files.filter(p=>p.path!==first.path)}),/REUSE_PRODUCT_FILE_SET_CHANGED/);
const changed=structuredClone(seal);changed.runtime[0].sha256='0'.repeat(64);assert.throws(()=>referenceReuse69(acceptance,changed),/REUSE_RUNTIME_CHANGED/);
const pyc=structuredClone(seal);pyc.root.PYC[Object.keys(pyc.root.PYC)[0]]='0'.repeat(64);assert.throws(()=>referenceReuse69(acceptance,pyc),/REUSE_PROTECTED_INPUT_CHANGED/);
console.log(JSON.stringify({status:'PASS',checks:7,matchedProductPins:verified.matchedProductPins.length,codecFactoryExact872b:true,scope:'same-workspace limited source/pin reuse, not browser qualification',browserExecutions:0,GitModified:false,networkRequests:0}));
