const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');

function audioBuffer(spec){
 const values=[-Infinity,-2,-1,-.5,-.5/32768,-1/32768,-0,0,1/32767,.5/32767,.5,1,2,Infinity,NaN,1e-40,-1e-40];
 const data=Array.from({length:spec.channels},(_,c)=>Float32Array.from({length:spec.length},(_,i)=>values[(i+c*5)%values.length]));
 return {sampleRate:spec.sampleRate,numberOfChannels:spec.channels,length:spec.length,duration:spec.length/spec.sampleRate,getChannelData:c=>data[c]};
}
function loadWav(filename,bigEndian=false){
 const probe=class extends Uint16Array{constructor(values){super(values);new Uint8Array(this.buffer).set([0,1]);}};
 const context={J:{},Uint16Array:bigEndian?probe:Uint16Array};
 vm.runInNewContext(fs.readFileSync(filename,'utf8'),context,{filename});return context.J;
}
async function convert(J,spec){
 const bytes=J.audioWavBytes(audioBuffer(spec),spec.duration,spec.offset);
 return Buffer.from(bytes).toString('base64');
}
module.exports={audioBuffer,loadWav,convert};
if(require.main===module)(async()=>{
 const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/audio-wav.json'),'utf8'));
 const filename=path.join(__dirname,'../src/10_audio.js');
 for(const bigEndian of [false,true]){
  const J=loadWav(filename,bigEndian);
  for(const spec of fixture.cases)assert.deepEqual(await convert(J,spec),spec.expected,`${spec.name}, ${bigEndian?'DataView':'native'} writer`);
  const large={sampleRate:48000,numberOfChannels:6,length:2**31,duration:2**31/48000};
  assert.throws(()=>J.audioWavBytes(large,large.duration),/Audio is too large for WAV/);
 }
 console.log(`PCM WAV: ${fixture.cases.length} byte-exact vectors for native and DataView writers; RIFF overflow rejected`);
})().catch(error=>{console.error(error);process.exitCode=1;});
