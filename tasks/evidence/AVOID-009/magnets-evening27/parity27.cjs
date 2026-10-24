'use strict';
const fs=require('fs'),vm=require('vm'),crypto=require('crypto'),assert=require('assert');
assert.equal(process.env.MAGNETS_CLOCK27_RELEASE,'PARENT_REVIEWED_SOURCE_MATH_RUNNER');
const D='/tmp/avoid009-evening-magnets27',R='/workspace/lyricfx.JIZURA',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const snippets=JSON.parse(fs.readFileSync(D+'/evidence/source-snippets27.json','utf8')),by={};
for(const s of snippets){assert.equal(sha(Buffer.from(s.text)),s.sha256);const lines=fs.readFileSync(R+'/'+s.path,'utf8').split('\n');assert(lines.slice(s.lineStart-1,s.lineEnd).join('\n').includes(s.text));by[s.key]=s.text;}
const payload=JSON.parse(fs.readFileSync(0,'utf8')),context=vm.createContext({});
vm.runInContext('const J={};\n'+snippets.filter(s=>s.kind==='definition').map(s=>s.text).join('\n'),context);
const push=by.pushDefinition.match(/get:\s*(\(env\)\s*=>\s*\(\{.*?\}\))/s);assert(push);
vm.runInContext('J.CAMERA={push:{get:'+push[1]+'}};',context);
const qexpr=by.quantizerStatement.slice('const tq = '.length,-1),nexpr=qexpr.slice(0,-' * stepDur'.length);
assert.equal(qexpr,'Math.floor(t / stepDur + 1e-6) * stepDur');
assert.equal(by.passClockStatement,'const tp = Math.max(0, tq - P.lag);');
assert(by.envClockFields.includes('ltb: lt + P.lag'));
assert.equal(by.cameraScaleStatement,'const cs = J.lerp(1, cam.s ?? 1, motion) * (cut.contentScale ?? 1);');
const code=`
J.plan=${JSON.stringify(payload.plan)};
J.clockSnapshot=t=>{
 const plan=J.plan,effectCut=J.cutAt(plan,t),fx=effectCut?.effectFx||plan.fx;
 const stepDur=J.stepDur(fx,plan.fps),n=${nexpr},tq=${qexpr};
 const chroma=fx.chroma*plan.style.ghost,u=plan.H/1080;
 ${by.passDefinitions}
 return {n,q:tq,h:stepDur,mainCutAtIndex:J.cutAt(plan,tq)?.index??null,effectiveMotion:fx.motion,
 passes:passes.map(P=>{
  ${by.passClockStatement}
  const cuts=J.lyricCutsAt(plan,tp).map(J.lyricRenderCut),cut=cuts[0]||plan.cuts[0];
  ${by.ownClockStatement}
  const ltb=lt+P.lag,active=cuts.length===1,env={fx,lt,cut};
  const cam=active?J.CAMERA.push.get(env):null;
  const cs=cam?J.lerp(1,cam.s??1,motion)*(cut.contentScale??1):null;
  return {pass:P.pass,lag:P.lag,tp,lt,ltb,selectorActive:active,renderCut:active?{index:cut.index,end:cut.end,dur:cut.dur,exit:cut.exit,outDur:cut.outDur}:null,cameraScale:cam?.s??null,contentScale:cs};
 })};
};`;
vm.runInContext(code,context);
const fromBits=hex=>{const b=Buffer.alloc(8);b.writeBigUInt64BE(BigInt('0x'+hex));return b.readDoubleBE();};
const snapshot=vm.runInContext('J.clockSnapshot',context),snap=t=>snapshot(t);
const quantizerNs=payload.probeBits.map(b=>snap(fromBits(b)).n);
const states=payload.stateFirstBits.map(b=>snap(fromBits(b)));
const rootSnapshots=payload.rootRealTimes.map(snap);
const zeros=[snap(0),snap(-0)],end=snap(payload.regionEnd);
assert.deepStrictEqual(zeros[0],zeros[1]);
process.stdout.write(JSON.stringify({kind:'localNodeVM-source-clock-parity27',quantizerNs,states,rootSnapshots,zeros,end,snippetCount:snippets.length,noBrowser:true,noRendererOrDrawingExecuted:true}));
