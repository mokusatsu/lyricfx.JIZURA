const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {EventEmitter}=require('node:events'),{tempDirectory}=require('../../dev/test_helpers.cjs');
(async()=>{
 const directory=tempDirectory('project-save-'),target=path.join(directory,'existing.lyricfx'),previous=Buffer.from('original project');
 const handlers=new Map(),app=new EventEmitter();app.whenReady=async()=>{};
 let window;
 class Window extends EventEmitter {
  constructor(){super();window=this;this.webContents=new EventEmitter();this.webContents.setWindowOpenHandler=()=>{};this.webContents.isDestroyed=()=>!!this.destroyed;}
  loadFile(){}
  isDestroyed(){return !!this.destroyed;}
  static fromWebContents(sender){return window?.webContents===sender?window:null;}
 }
 const session={protocol:{handle(){}},clearStorageData:async()=>{}};
 const electron={app,BrowserWindow:Window,dialog:{showSaveDialog:async()=>({canceled:false,filePath:target})},
  ipcMain:{handle:(name,callback)=>handlers.set(name,callback),on(){}},protocol:{registerSchemesAsPrivileged(){}},
  session:{defaultSession:session,fromPartition:()=>session},Menu:{buildFromTemplate(){},setApplicationMenu(){}},shell:{},net:{}};
 const desktop=path.resolve(__dirname,'..');
 const context={console,Buffer,__dirname:desktop,process:{argv:['electron','main.cjs','--new-project'],pid:process.pid,platform:process.platform},
  require:name=>name==='electron'?electron:name==='./native-jobs.cjs'?{NativeJobs:class{}}:name==='node:os'?{tmpdir:()=>directory}:require(name)};
 try{
  vm.runInNewContext(fs.readFileSync(path.join(desktop,'main.cjs'),'utf8'),context,{filename:'main.cjs'});
  await new Promise(resolve=>setImmediate(resolve));assert(window,'main window initialized');
  const call=(operation,data={})=>handlers.get('desktop:saveProject'+operation)({sender:window.webContents},data);
  const parts=()=>fs.readdirSync(directory).filter(name=>name.endsWith('.part'));
  const start=async()=>{fs.writeFileSync(target,previous);const result=await call('Start',{defaultName:'existing.lyricfx'});assert(result.saveToken);return result.saveToken;};
  let token=await start();await call('Chunk',{saveToken:token,buffer:Buffer.from('saved')});
  const saved=await call('Finish',{saveToken:token,expectedSize:5});assert.equal(saved.canceled,false);assert.equal(fs.readFileSync(target,'utf8'),'saved');assert.equal(parts().length,0);
  token=await start();await call('Chunk',{saveToken:token,buffer:Buffer.from('short')});
  assert.match((await call('Finish',{saveToken:token,expectedSize:6})).error,/size mismatch/);assert(fs.readFileSync(target).equals(previous));assert.equal(parts().length,0);
  token=await start();await call('Chunk',{saveToken:token,buffer:Buffer.from('partial')});await call('Cancel',{saveToken:token});await call('Cancel',{saveToken:token});
  assert(fs.readFileSync(target).equals(previous));assert.equal(parts().length,0);
  const first=await start(),second=await start();await call('Chunk',{saveToken:first,buffer:Buffer.from('one')});await call('Chunk',{saveToken:second,buffer:Buffer.from('two')});assert.equal(parts().length,2);
  let choose;electron.dialog.showSaveDialog=()=>new Promise(resolve=>choose=resolve);const late=call('Start',{defaultName:'existing.lyricfx'});
  window.destroyed=true;window.emit('closed');assert(fs.readFileSync(target).equals(previous));assert.equal(parts().length,0,'window close releases every unfinished project save');
  choose({canceled:false,filePath:target});assert.equal((await late).canceled,true,'a late dialog result cannot start a save after the sender closes');assert.equal(parts().length,0);
  electron.dialog.showSaveDialog=electron.dialog.showOpenDialog=async()=>{throw Error('Closed windows must not open dialogs');};
  assert.equal((await call('Start')).canceled,true);
  assert.equal((await handlers.get('desktop:pickExportTarget')({sender:window.webContents},{filename:'output.mp4'})).cancelled,true);
  assert.equal((await handlers.get('desktop:pickMedia')({sender:window.webContents},{layer:'media'})).length,0);
  console.log('Project save: atomic replacement, short data, cancel, window-close cleanup and late dialog passed');
 }finally{
  assert(directory.startsWith(path.resolve(__dirname,'../../.codex-temp/tests')+path.sep));fs.rmSync(directory,{recursive:true,force:true});
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
