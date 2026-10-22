'use strict';
// Harness-only process tree. No browser, app or product assertions are loaded.
const {spawn}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const descendant=`const {spawn}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');const grand=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{detached:true,stdio:'ignore'});grand.unref();fs.writeFileSync(path.join(process.env.JIZURA_CORE_JOB_DIR,'synthetic-children.json'),JSON.stringify({child:process.pid,grandchild:grand.pid}));setInterval(()=>{},1000);`;
const child=spawn(process.execPath,['-e',descendant],{detached:true,stdio:'ignore'});child.unref();
if(process.env.JIZURA_SYNTHETIC_MODE==='normal')setTimeout(()=>process.exit(0),250);else setInterval(()=>{},1000);
