const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
function input(spec){
 const data=Array.from({length:spec.channels},(_,channel)=>{
  const out=new Float32Array(spec.length);let state=(channel+1)*1234567;
  for(let i=0;i<out.length;i++){state=(Math.imul(state,1664525)+1013904223)>>>0;out[i]=spec.silence?0:(state>>>8)/8388608-1;}
  if(out.length&&!spec.silence){out[0]=-0;out[Math.min(613,out.length-1)]=-1e-40;out[out.length-1]=1e-40*(channel+1);}
  if(spec.nonFinite&&out.length>2400){out[1200]=spec.nonFinite==='nan'?NaN:Infinity;out[2399]=spec.nonFinite==='nan'?.25:-Infinity;}
  return out;
 });
 return {sampleRate:spec.sampleRate,length:spec.length,numberOfChannels:spec.channels,duration:spec.length/spec.sampleRate,getChannelData:channel=>data[channel]};
}
function loadAnalysis(filename){
 let buffer;
 class AudioContext{async decodeAudioData(){return buffer;}close(){}}
 const context={J:{},window:{AudioContext},Float32Array,ArrayBuffer,setTimeout:callback=>callback()};
 vm.runInNewContext(fs.readFileSync(filename,'utf8'),context,{filename});
 const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
 return async spec=>{
  buffer=input(spec);const stages=[];
  const audio=await context.J.analyzeAudio({name:'fixture.wav',arrayBuffer:async()=>new ArrayBuffer(4)},event=>stages.push(event.phase));
  assert.equal(audio.buffer,buffer);assert.deepEqual(stages,['read','decode','analyze']);
  return {sampleRate:audio.sampleRate,length:audio.buffer.length,channels:audio.buffer.numberOfChannels,duration:audio.duration,bpm:Number.isNaN(audio.bpm)?'NaN':audio.bpm,
   energy:hash(audio.energy),peaks:hash(audio.peaks),beats:hash(JSON.stringify(Array.from(audio.beats)))};
 };
}
module.exports={loadAnalysis,input};
if(require.main===module)(async()=>{
 const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/audio-analysis.json'),'utf8'));
 const analyze=loadAnalysis(path.join(__dirname,'../src/10_audio.js'));
 for(const test of fixture.cases)assert.deepEqual(await analyze(test),test.expected,test.name);
 console.log(`Audio analysis: ${fixture.cases.length} channel, hop, block, short waveform, tail and Float32 contracts passed`);
})().catch(error=>{console.error(error);process.exitCode=1;});
