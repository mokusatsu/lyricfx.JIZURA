/* Adapt existing Windows-only launch location; keep suite assertions unchanged. */
const {chromium}=require('playwright');
const launch=chromium.launch.bind(chromium);
chromium.launch=options=>launch({...options,executablePath:process.env.JIZURA_BROWSER||'/usr/bin/chromium'});
// Optional immutable e96 control: substitute only the two compiled product reads.
if(process.env.JIZURA_REGRESSION_ROOT){
 const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),root=path.resolve(__dirname,'../..'),read=fs.readFileSync;
 fs.readFileSync=function(file,...args){const name=typeof file==='string'?path.resolve(file):null;let redirected=false;if(name===path.join(root,'index.html')||name===path.join(root,'en/index.html')){file=path.join(process.env.JIZURA_REGRESSION_ROOT,path.relative(root,name));redirected=true;}const value=read.call(this,file,...args);if(redirected&&process.env.JIZURA_REGRESSION_READ_LOG)fs.appendFileSync(process.env.JIZURA_REGRESSION_READ_LOG,JSON.stringify({source:'suite-compiled-read',suite:process.argv[1],requested:name,actual:file,bytes:Buffer.byteLength(value),sha256:crypto.createHash('sha256').update(value).digest('hex')})+'\n');return value;};
}
