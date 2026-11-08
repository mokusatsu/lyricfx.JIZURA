const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),test=require('node:test');
const source=fs.readFileSync(path.join(__dirname,'../src/12_ui.js'),'utf8').replace(/\r\n/g,'\n');
const start=source.indexOf('async function openProjectFile('),end=source.indexOf('\n}\n',start)+2;
assert(start>=0&&end>start);
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const turn=()=>new Promise(resolve=>setImmediate(resolve));
function fixture({audio=true,media=true,readError=false,preparedAsset=false}={}){
 const audioGate=deferred(),mediaGate=deferred(),events=[],stored=[],released=[];
 const previous={title:'Current edit'},state={project:previous,commits:0,clean:0},project={title:'Incoming project',media:{items:[]},foreground:{items:[]},userFonts:[]},files=[];
 if(media){for(const id of preparedAsset?['prepared','media']:['media']){project.media.items.push({id,name:id+'.svg'});files.push({kind:'media',id,name:id+'.svg',file:new Blob([id])});}}
 if(audio){project.audioAsset={id:'audio',name:'audio.wav'};files.push({kind:'audio',id:'audio',name:'audio.wav',file:new Blob(['audio'])});}
 const J={
  mediaLabel:(ja,en)=>en,unpackProject:async()=>({project,files}),
  snapshotMediaFile:async file=>{events.push('audio read');if(readError)throw Error('audio read failed');return file;},
  analyzeAudio:async()=>{events.push('audio decode');return audioGate.promise;},
  attachMedia:async(item,file,assets)=>{events.push('media '+item.id);if(item.id!=='prepared')await mediaGate.promise;const asset={id:item.id,file};assets.set(item.id,asset);return asset;},
  storeMedia:async id=>stored.push(id),restoreFontFiles:async()=>{},personMaskReferences:()=>new Map(),
 };
 const open=new Function('J','replaceProject','markProjectClean','releaseProjectAssets',source.slice(start,end)+';return openProjectFile;')(
  J,(project,audio,audioFile,assets)=>{Object.assign(state,{project,audio,audioFile,assets,commits:state.commits+1});},
  ()=>state.clean++,assets=>{for(const asset of assets.values())released.push(asset.id);assets.clear();});
 return {open,project,previous,state,events,stored,released,audioGate,mediaGate};
}
test('audio and media start independently; publication waits for both',async()=>{
 const f=fixture(),work=f.open(new Blob());await turn();
 assert(f.events.includes('audio decode'));assert(f.events.includes('media media'));assert.equal(f.state.commits,0);
 f.audioGate.resolve({buffer:'decoded'});await turn();assert.equal(f.state.project,f.previous);assert.deepEqual(f.stored,[]);
 f.mediaGate.resolve();await work;assert.equal(f.state.project,f.project);assert.equal(f.state.commits,1);assert.equal(f.state.clean,1);
 assert.deepEqual(f.state.audio,{buffer:'decoded'});assert.equal(f.state.audioFile.size,5);assert.deepEqual(f.stored,['media','audio']);
});
for(const readError of [false,true])test(`${readError?'reading':'decoding'} audio failure keeps the current edit and releases prepared media`,async()=>{
 const f=fixture({readError}),work=f.open(new Blob()).catch(error=>error);await turn();
 if(!readError)f.audioGate.reject(Error('audio decode failed'));await turn();assert.equal(f.state.project,f.previous);
 f.mediaGate.resolve();const error=await work;assert.match(error.message,/audio .* failed/);
 assert.equal(f.state.project,f.previous);assert.equal(f.state.commits,0);assert.deepEqual(f.stored,[]);assert.deepEqual(f.released,['media']);
});
for(const rejectAudio of [false,true])test(`media failure ignores late audio ${rejectAudio?'failure':'success'}`,async()=>{
 const f=fixture({preparedAsset:true}),work=f.open(new Blob()).catch(error=>error);await turn();
 f.mediaGate.reject(Error('media failed'));assert.match((await work).message,/media failed/);assert.deepEqual(f.released,['prepared']);
 if(rejectAudio)f.audioGate.reject(Error('late audio failed'));else f.audioGate.resolve({buffer:'late'});
 await turn();assert.equal(f.state.project,f.previous);assert.equal(f.state.commits,0);assert.deepEqual(f.stored,[]);
});
test('audio-only and media-only projects keep their original publication behavior',async()=>{
 const a=fixture({media:false}),audioWork=a.open(new Blob());await turn();a.audioGate.resolve({buffer:'audio'});await audioWork;
 assert.equal(a.state.assets.size,0);assert.deepEqual(a.stored,['audio']);
 const m=fixture({audio:false}),mediaWork=m.open(new Blob());await turn();m.mediaGate.resolve();await mediaWork;
 assert.equal(m.state.audio,null);assert.equal(m.state.audioFile,null);assert.deepEqual(m.stored,['media']);assert(!m.events.includes('audio decode'));
});
