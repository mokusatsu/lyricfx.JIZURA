/* Prepared control capture entry point. Importing this module never captures. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),H=require('./layouts-b-test-harness.cjs');
const rel=p=>path.relative(H.root,p),read=p=>JSON.parse(fs.readFileSync(path.join(H.root,p))),digest=p=>H.sha(fs.readFileSync(path.join(H.root,p)));
const paths={config:'dev/avoidance/layouts-b-h03-control-capture.local-20261022-01.json',tool:'dev/avoidance/layouts-b-h03-control-review.cjs',dir:'work/avoid007-h03/control-native-local-20261022-01',freeze:'tasks/evidence/AVOID-007/freeze02-identity.json',focusedReview:'tasks/evidence/AVOID-007/parent-h03-control-focused01-review.json',toolReview:'tasks/evidence/AVOID-007/parent-h03-control-tool-review.json'};
function verifyFrozen(){const f=read(paths.freeze);for(const [name,hash]of Object.entries({...f.sources,...f.products}))assert.equal(digest(name),hash,'current frozen source/product '+name);assert.equal(Object.keys(f.sources).length,79);return {sourceCount:f.sourceCount,sourceAggregateSHA256:f.sourceAggregateSHA256,products:f.products};}
function coreInputs(phase){
 const config=read(paths.config),main=path.join(config.mainBundleDir,'manifest.json'),m=JSON.parse(fs.readFileSync(main));
 assert.equal(config.profile,'native-single-retention-v1');assert.equal(config.buildID,'local-20261022-h03-control-01');assert.deepEqual(config.approvedCaseIDs,['h03-rain-panL','h03-bubbles-push']);assert.equal(H.sha(fs.readFileSync(main)),'186580a8269d1b51f481f84001277f154722fee700226876ed0b82f3c80cbc4f');
 return {config,files:[paths.config,paths.tool,paths.freeze,paths.focusedReview,paths.toolReview,'dev/avoidance/layouts-b-h03-control-capture01-run.cjs','dev/avoidance/layouts-b-review.cjs','dev/avoidance/layouts-b-pages-bridge.cjs',rel(config.fixturePath),rel(config.focusedReceiptPath),rel(config.metadataReceiptPath),'tasks/evidence/AVOID-007/parent-h03-control-metadata02-review.json',`tasks/evidence/AVOID-007/h03-control-native-${phase}01-environment-pre.json`,rel(main),rel(path.join(config.mainBundleDir,'config.json')),...Object.keys(m.assets).filter(p=>p.startsWith('sources/')||p.startsWith('fonts/')||p.startsWith('fixtures/')).map(p=>rel(path.join(config.mainBundleDir,p))),...config.media.map(m=>rel(m.path))]};
}
async function main(){
 const receipt=path.join(H.root,'tasks/evidence/AVOID-007/h03-control-native-capture01.json'),partial=receipt.replace('.json','-partial.json'),dir=path.join(H.root,paths.dir);assert.ok(!fs.existsSync(dir)&&!fs.existsSync(partial),'fresh control output/partial');
 const frozen=verifyFrozen(),{config,files}=coreInputs('capture'),C=require('./layouts-b-h03-control-review.cjs');assert.deepEqual(C.CLOCK,{absoluteStart:.5,absoluteEnd:4.5,fps:24,frames:96,duration:4});
 const startup=H.pin(receipt,__filename,files);let result;
 const save=v=>fs.writeFileSync(partial,JSON.stringify({startup,frozen,dir:paths.dir,...v}));save({incomplete:true,stage:'prelaunch inputs pinned; capture not yet complete'});
 try{console.log('CAPTURE START '+config.buildID);result=await C.capture(config,dir);H.verify(startup);verifyFrozen();const body={startup,frozen,dir:paths.dir,result,endInputsUnchanged:true,qualification:'native PNG→H264 capture includes validateFiles; separate browser/visual/public gates pending',pendingBrowser:true};fs.writeFileSync(receipt,JSON.stringify(body));save({...body,incomplete:false});console.log(JSON.stringify(result));}
 catch(e){let unchanged=false,verificationFailure;try{H.verify(startup);verifyFrozen();unchanged=true;}catch(v){verificationFailure=v.stack;}const body={startup,frozen,dir:paths.dir,incomplete:true,endInputsUnchanged:unchanged,failure:e.stack,...(verificationFailure?{verificationFailure}:{})};fs.writeFileSync(receipt,JSON.stringify(body));save(body);throw e;}
}
module.exports={paths,verifyFrozen,coreInputs,main};
if(require.main===module)main().catch(e=>{console.error(e.stack);process.exitCode=1;});
