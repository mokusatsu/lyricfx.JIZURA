/* Verification transport only. No Response/fetch/router/source mutation. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),cp=require('node:child_process');
const pins={review:'c9d732c2cebb640a347256a18f838ec93d9e034972e405f48d7010f1b77cae5d',browser:'cb0d19bc47ca37853308b00cc3d382f6303fd82e1baacb08a0205d31aa8b1f44',callback:'54c9d70f601dafa30e6d9de1e170bd8e3faed61c268a739a591df4690071805c',manifest:'2d9a87544a5a8b4818591b0daeb0b1ccd659c241d52d1383111422aca579e01d'};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),target='https://mokusatsu.github.io/lyricfx.JIZURA/review/AVOID-006/local-20261020-04/index.html';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function loadPolicy(root){
 const reviewPath=path.join(root,'dev/avoidance/layouts-a-review.cjs'),browserPath=path.join(root,'dev/browser.cjs'),dir=path.join(root,'review/AVOID-006/local-20261020-04'),manifest=fs.readFileSync(path.join(dir,'manifest.json'));
 assert.equal(sha(fs.readFileSync(reviewPath)),pins.review);assert.equal(sha(fs.readFileSync(browserPath)),pins.browser);assert.equal(sha(manifest),pins.manifest);const m=JSON.parse(manifest),index=fs.readFileSync(path.join(dir,'index.html'));assert.equal(sha(index),m.assets['index.html'],'fixed index raw hash');
 const raw=new Map([...Object.entries(m.assets),['manifest.json',pins.manifest]].map(([p,h])=>[new URL(p,target).href,h]));assert.equal(Object.keys(m.assets).length,938);assert.equal(raw.size,939,'exact raw939 URL set');for(const url of raw.keys())assert.equal(new URL(url).origin,new URL(target).origin);
 // Standard-library HTML parser: same decoded href attributes read by getAttribute.
 const hrefs=JSON.parse(cp.execFileSync('python',['-c',`from html.parser import HTMLParser
import json,sys
class Links(HTMLParser):
 def __init__(self): super().__init__(convert_charrefs=True); self.hrefs=[]
 def handle_starttag(self,tag,attrs):
  if tag=='a':
   xs=[v for k,v in attrs if k=='href']; assert len(xs)<=1,'ambiguous duplicate href'
   if xs: self.hrefs.append(xs[0])
p=Links(); p.feed(sys.stdin.read()); print(json.dumps(p.hrefs))`,],{input:index,maxBuffer:4*1024*1024}));
 const origin=new URL(target).origin,live=new Set(),excluded=[];for(const href of hrefs){assert.equal(typeof href,'string');if(href.startsWith('#'))continue;const url=new URL(href,target);if(url.origin!==origin||url.protocol!=='https:'){excluded.push({href,url:url.href});continue;}live.add(url.href);}
 const additional=[...live].filter(url=>!raw.has(url)).sort(),rawURLs=[...raw.keys()].sort(),liveURLs=[...live].sort(),allowed=new Set([...rawURLs,...additional]);
 return {target,raw,allowed,hrefs,rawURLs,liveURLs,additionalURLs:additional,excluded,indexSHA256:m.assets['index.html'],rawURLListSHA256:sha(JSON.stringify(rawURLs)),additionalURLListSHA256:sha(JSON.stringify(additional)),liveURLListSHA256:sha(JSON.stringify(liveURLs))};
}
function wrapEvaluate(evaluate,{policy,record,delay=wait}){
 let sequence=0;return async function(pageFunction,arg){
  const exactFunction=typeof pageFunction==='function'&&sha(Function.prototype.toString.call(pageFunction))===pins.callback;
  if(!exactFunction||typeof arg!=='string'||!policy.allowed.has(arg))return evaluate(pageFunction,arg);
  const operationID=++sequence,category=policy.raw.has(arg)?'raw-manifest-asset':'fixed-index-link';
  for(let attempt=1;attempt<=3;attempt++){
   let result;try{result=await evaluate(pageFunction,arg);}catch(error){record({event:'failure',operationID,url:arg,method:'GET',category,attempt,status:null,error:{name:error.name,message:error.message},retry:false});throw error;}
   const retry=result.status===503&&attempt<3,event={event:result.status===200?'success':'failure',operationID,url:arg,method:'GET',category,attempt,status:result.status,retry};
   if(result.status===200){const bytes=Buffer.from(result.base64,'base64');event.bytes=bytes.length;event.sha256=sha(bytes);if(policy.raw.has(arg)){event.expectedSHA256=policy.raw.get(arg);event.hashMatchesExpected=event.sha256===event.expectedSHA256;}}
   if(retry)event.backoffMs=attempt*1000;record(event);
   if(!retry)return result; // Exact original evaluate result object, including final503.
   await delay(attempt*1000);
  }
 };
}
module.exports={pins,sha,target,loadPolicy,wrapEvaluate};
