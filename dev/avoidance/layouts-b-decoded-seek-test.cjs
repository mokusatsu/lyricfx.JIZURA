/* Exact production helper, fake media event order; no timeout/target relaxation. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),H=require('./layouts-b-test-harness.cjs'),T=require('./layouts-b-review.cjs');
const receipt=path.join(H.root,'tasks/evidence/AVOID-007/decoded-seek01.json'),startup=H.pin(receipt,__filename,['dev/avoidance/layouts-b-review.cjs']);
class Video{
 constructor(){this.listeners=new Map();this.callbacks=new Map();this.next=0;this.currentTime=0;this.cancelled=[];}
 addEventListener(name,fn,options){this.listeners.set(name,{fn,options});}
 removeEventListener(name,fn){if(this.listeners.get(name)?.fn===fn)this.listeners.delete(name);}
 requestVideoFrameCallback(fn){const id=++this.next;this.callbacks.set(id,fn);return id;}
 cancelVideoFrameCallback(id){this.cancelled.push(id);this.callbacks.delete(id);}
 event(name){const e=this.listeners.get(name);if(e?.options?.once)this.listeners.delete(name);e?.fn();}
 frame(mediaTime){const first=this.callbacks.entries().next().value;assert.ok(first);this.callbacks.delete(first[0]);first[1](0,{mediaTime,presentedFrames:17});}
}
function setup(){let timeout;const seek=vm.runInNewContext('('+T.seekDecodedFrame.toString()+')',{setTimeout(fn,ms){assert.equal(ms,10000);timeout=fn;return 1;},clearTimeout(){timeout=null;}}),v=new Video();return {v,p:seek(v,3.75),timeout:()=>timeout?.()};}
(async()=>{const rows=[];
 for(const order of ['callback-seeked','seeked-callback']){const {v,p}=setup();if(order==='callback-seeked'){v.frame(3.75);assert.equal(v.listeners.has('seeked'),true);v.event('seeked');}else{v.event('seeked');v.frame(3.75);}const proof=await p;assert.equal(proof.seekedAt,3.75);assert.equal(proof.decodedAfterSeek.mediaTime,3.75);assert.equal(v.listeners.size,0);assert.equal(v.callbacks.size,0);rows.push({order,proof});}
 {const {v,p}=setup();v.frame(.125);assert.equal(v.callbacks.size,1);v.event('seeked');v.frame(3.75);const proof=await p;assert.equal(proof.ignoredFrames.length,1);assert.equal(proof.ignoredFrames[0].mediaTime,.125);rows.push({order:'stale-wrong-frame-then-valid',proof});}
 {const {v,p,timeout}=setup(),reject=assert.rejects(p,/requested frame not decoded/);v.event('seeked');v.frame(.125);timeout();await reject;assert.equal(v.callbacks.size,0);assert.equal(v.cancelled.length,1);assert.equal(v.listeners.size,0);rows.push({order:'wrong-frame-only-timeout',cancelledCallbacks:v.cancelled.length});}
 {const {v,p}=setup(),reject=assert.rejects(p,/seek did not reach requested time/);v.frame(3.75);v.currentTime=2;v.event('seeked');await reject;assert.equal(v.listeners.size,0);rows.push({order:'matching-frame-wrong-seek-rejected'});}
 {const {v,p}=setup(),reject=assert.rejects(p,/media error 3/);v.error={code:3};v.event('error');await reject;assert.equal(v.callbacks.size,0);assert.equal(v.listeners.size,0);assert.equal(v.cancelled.length,1);rows.push({order:'media-error-cleans-callback'});}
 {const {v,p,timeout}=setup(),reject=assert.rejects(p,/requested frame not decoded/);v.frame(3.75);timeout();await reject;assert.equal(v.listeners.size,0);rows.push({order:'matching-frame-without-seek-timeout'});}
 H.verify(startup);fs.writeFileSync(receipt,JSON.stringify({startup,scope:'Exact production seek function with controlled media event order; browser reproduction separately required',rows}));console.log(JSON.stringify({tests:rows.length,status:'passed'}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
