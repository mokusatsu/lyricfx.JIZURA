'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=process.argv[2];assert(root,'Usage: node warm-test.cjs REPO');
const s=fs.readFileSync(path.join(root,'src/12_ui.js'),'utf8');
const body=s.slice(s.indexOf('function warm() {'),s.indexOf('let replanTimer'));
const match=body.match(/const cuts = S\.plan\.cuts\.filter\((c =>[^;]+)\);/);assert(match,'stock warm selector');
const select=Function('c','return ('+match[1]+')(c)');let checks=1;
for(const [enter,exit,wanted]of [['cut','cut',false],['assemble','cut',true],['cut','explode',true],['cut','fall',true],['cut','drift',true],['cut','fade',false]]){assert.equal(select({enter,exit}),wanted);checks++}
assert(body.includes('noGhost: true'));checks++;
console.log(JSON.stringify({checks,scope:'source selector only; fixed bulbs cut/cut never enters warm; noGhost request remains unsupported'}));
