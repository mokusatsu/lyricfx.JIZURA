const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),build=process.argv[2],relative='review/AVOID-004/'+build,original=path.join(root,relative),{validate}=require('./stage-review.cjs');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{const scratch=fs.mkdtempSync('/workspace/work/avoid004-negative-'),clone=path.join(scratch,'clone');fs.cpSync(original,clone,{recursive:true});await validate(clone,relative,null);console.log('PASS positive immutable clone');
const mutations=[
 ['canonical matrix',m=>{const p=path.join(clone,'fixtures/cases.json'),v=JSON.parse(fs.readFileSync(p));v[0].time=.8;fs.writeFileSync(p,JSON.stringify(v));m.assets['fixtures/cases.json']=sha(fs.readFileSync(p));},/canonical matrix/],
 ['canonical conditions',m=>{m.cases[0].conditions.seed++;},/canonical conditions/],
 ['canonical source',m=>{const p=path.join(clone,'fixtures/stage-fixture.js');fs.appendFileSync(p,'\n// mutated');m.assets['fixtures/stage-fixture.js']=sha(fs.readFileSync(p));},/canonical fixture source/],
 ['measurement',m=>{const c=m.cases.find(c=>c.after.observation.staged);c.after.observation.lastOffsets[0].offset[0]+=1;},/canonical live placement measurement/],
 ['font measurement',m=>{m.cases[0].after.observation.fontWidth+=.1;},/canonical live font measurement/],
 ['image asset',m=>{const p=path.join(clone,m.cases[0].after.path);fs.appendFileSync(p,'corruption');},/asset images/],
 ['rendered original',m=>{const c=m.cases.find(c=>c.after.observation.staged),other=m.cases[0].after.original;fs.copyFileSync(path.join(clone,other.path),path.join(clone,c.after.original.path));const h=sha(fs.readFileSync(path.join(clone,c.after.original.path)));c.after.original.sha256=h;m.assets[c.after.original.path]=h;},/canonical actual rendered stage PNG/],
 ['overlay offset',m=>{const p=path.join(clone,'index.html');fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('position:absolute;inset:0;opacity','position:absolute;inset:5px 0 0;opacity'));m.assets['index.html']=sha(fs.readFileSync(p));},/overlay image geometry/],
 ['baseline source',m=>{m.before.commit='0000000000000000000000000000000000000000';},/9a3d43/]
];
for(const [name,mutate,reason]of mutations){fs.rmSync(clone,{recursive:true});fs.cpSync(original,clone,{recursive:true});const m=JSON.parse(fs.readFileSync(path.join(clone,'manifest.json')));mutate(m);fs.writeFileSync(path.join(clone,'manifest.json'),JSON.stringify(m));let error;try{await validate(clone,relative,null);}catch(e){error=String(e);}assert.match(error||'',reason,name+' must fail for expected reason');console.log('PASS rejected',name,String(reason));}console.log(JSON.stringify({passed:true,positiveClone:true,mutations:mutations.length,scratch}));})().catch(e=>{console.error(e);process.exitCode=1;});
