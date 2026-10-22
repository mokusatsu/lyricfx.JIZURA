'use strict';
// Register only child processes actually spawned by this job's Node process.
const fs=require('node:fs'),cp=require('node:child_process');
const destination=process.env.JIZURA_CORE_SPAWN_REGISTRY,token=process.env.JIZURA_CORE_JOB_TOKEN;
if(!destination||!token)throw Error('Job-specific spawn registry/token required');
function identity(pid){try{const text=fs.readFileSync('/proc/'+pid+'/stat','utf8'),fields=text.slice(text.lastIndexOf(')')+2).trim().split(/\s+/);return{pid:Number(pid),startTicks:fields[19],ppid:Number(fields[1]),pgid:Number(fields[2]),session:Number(fields[3]),state:fields[0]};}catch{return null;}}
const parent=identity(process.pid),original=cp.ChildProcess.prototype.spawn;
cp.ChildProcess.prototype.spawn=function(...args){const result=original.apply(this,args),register=()=>{const child=identity(this.pid);if(child)fs.appendFileSync(destination,JSON.stringify({token,parent,child,source:'ChildProcess.prototype.spawn',spawnFile:args[0]?.file||null})+'\n');};register();this.once('spawn',register);return result;};
