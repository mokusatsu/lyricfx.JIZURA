'use strict';
const fs=require('fs'),vm=require('vm'),crypto=require('crypto'),assert=require('assert/strict'),root='/workspace/lyricfx.JIZURA',rows=[];
for(const path of ['index.html','en/index.html']){const scripts=[...fs.readFileSync(root+'/'+path,'utf8').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)];assert.equal(scripts.length,2);for(const [i,s]of scripts.entries())new vm.Script(s[1],{filename:path+'#script'+i});rows.push({path,scriptCount:scripts.length,scriptSHA256:scripts.map(s=>crypto.createHash('sha256').update(s[1]).digest('hex')),syntax:'PASS_NOT_EVALUATED'});}
fs.writeFileSync(root+'/work/avoid009-tiles36-prep/evidence/parse36.json',JSON.stringify({rows,productJSEvaluated:false,browserExecuted:false},null,2),{flag:'wx'});process.stdout.write(JSON.stringify(rows));
