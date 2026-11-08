const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawn,execFileSync}=require('node:child_process');
const {NativeJobs}=require('../native-jobs.cjs');
const {tempDirectory}=require('../../dev/test_helpers.cjs');
const root=path.resolve(__dirname,'../..'),folder=tempDirectory('export-session-');
assert(folder.startsWith(path.join(root,'.codex-temp','tests')+path.sep));
const jobs=new NativeJobs({appDataDir:path.join(folder,'data')});
const rgba=new Uint8Array(64*48*4);rgba.fill(128);
function source(name,tagged,bframes=0){
 const file=path.join(folder,name);
 const args=['-v','error','-y','-f','lavfi','-i','testsrc2=size=64x48:rate=10:duration=0.6'];
 if(tagged)args.push('-vf','setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709');
 const codec=name.endsWith('.webm')?['-c:v','libaom-av1','-cpu-used','8','-threads','1','-crf','35']:['-c:v','libx264','-threads','1','-bf',String(bframes)];
 execFileSync('ffmpeg',[...args,...codec,'-pix_fmt','yuv420p',file],{windowsHide:true});
 return jobs.registerAssetFile(file,name.endsWith('.webm')?'video/webm':'video/mp4',name).assetToken;
}
function settings(name,assetToken){return {jobId:crypto.randomUUID(),outputToken:jobs.registerOutput(path.join(folder,name)),
 width:64,height:48,fps:24,frameCount:3,encoder:'cpu',pipeline:'continuous-ipc',
 sources:[{id:'source',assetToken,start:.2,end:.4}]};}
(async()=>{
 try{
  const tagged=source('tagged.webm',true),untagged=source('untagged.webm',false);
  const job=await jobs.startExportJob({},settings('native.mp4',tagged));
  assert.notEqual(job.pipeline,'legacy');
  const packet=await jobs.readExportFrame(job.jobId,'source',.35,-1),length=new DataView(packet).getUint32(0,true);
  const meta=JSON.parse(Buffer.from(packet,4,length).toString());
  assert.equal(meta.format,'I420');assert.equal(meta.pts,.3);
  assert.equal(packet.byteLength-4-length,64*48*3/2);
  await assert.rejects(jobs.readExportFrame(job.jobId,'../source',.35,-1),/Invalid/);
  await assert.rejects(jobs.writeFrame(job.jobId,1,rgba.buffer),/Out-of-order/);
  for(let index=0;index<3;index++)await jobs.writeFrame(job.jobId,index,rgba.buffer);
  const saved=await jobs.finishExport(job.jobId);
  assert.equal(saved.saved,true);assert.equal(saved.metrics.decoders.length,1);
  assert(!jobs.jobs.has(job.jobId),'completed export releases job buffers');
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=nb_frames','-of','json',saved.path],{windowsHide:true}));
  assert.equal(probe.streams[0].nb_frames,'3');

  const untaggedJob=await jobs.startExportJob({},settings('untagged-output.mp4',untagged));
  assert.notEqual(untaggedJob.pipeline,'legacy');
  await jobs.readExportFrame(untaggedJob.jobId,'source',.35,-1);
  for(let index=0;index<3;index++)await jobs.writeFrame(untaggedJob.jobId,index,rgba.buffer);
  assert.equal((await jobs.finishExport(untaggedJob.jobId)).metrics.decoders.length,1);

  const reordered=await jobs.startExportJob({},settings('reordered-output.mp4',source('reordered.mp4',true,2)));
  assert.notEqual(reordered.pipeline,'legacy');
  const reorderedPacket=await jobs.readExportFrame(reordered.jobId,'source',.35,-1),reorderedLength=new DataView(reorderedPacket).getUint32(0,true);
  assert.equal(JSON.parse(Buffer.from(reorderedPacket,4,reorderedLength).toString()).pts,.3);
  jobs.cancelJob(reordered.jobId);

  const partial=await jobs.startExportJob({},settings('incomplete.mp4',tagged));
  await jobs.writeFrame(partial.jobId,0,rgba.buffer);
  await assert.rejects(jobs.finishExport(partial.jobId),/Expected 3 frames/);
  jobs.cancelJob(partial.jobId);assert(!fs.existsSync(path.join(folder,'incomplete.mp4')));

  // Cancel before READY, while a related FFmpeg is already running.
  const script=path.join(folder,'preparing.py');
  fs.writeFileSync(script,"import sys,json,subprocess,time\njson.loads(sys.stdin.buffer.readline())\np=subprocess.Popen(['ffmpeg','-v','error','-re','-f','lavfi','-i','testsrc2=size=64x48:rate=10','-t','60','-c:v','libx264','-f','null','NUL'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))\nprint(json.dumps({'pid':p.pid}),flush=True)\ntime.sleep(60)\n");
  const original=jobs.spawnWorker.bind(jobs);let childPid;
  const started=new Promise(resolve=>{jobs.spawnWorker=()=>{
   const child=spawn(jobs.pythonPath,[script],{stdio:['pipe','pipe','pipe'],windowsHide:true});let text='';
   child.stdout.on('data',chunk=>{text+=chunk;if(text.includes('\n')){childPid=JSON.parse(text.split('\n')[0]).pid;resolve();}});return child;
  };});
  const request=settings('cancelled.mp4',tagged),pending=jobs.startExportJob({},request).then(()=>null,error=>error);
  await started;assert.equal(jobs.cancelJob(request.jobId).ok,true);assert(await pending instanceof Error);
  await new Promise(resolve=>setTimeout(resolve,100));
  assert.throws(()=>process.kill(childPid,0),/ESRCH|no such process/i,'related FFmpeg was terminated');
  assert(!fs.existsSync(path.join(folder,'cancelled.mp4')));assert(!jobs.clientToInternalJob.has(request.jobId));
  jobs.spawnWorker=original;
  console.log('Export session integration: source PTS/buffer, sequence, strict finish, untagged/reordered sources and pre-READY process-tree cancellation passed');
 }finally{jobs.cleanupAll();fs.rmSync(folder,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
