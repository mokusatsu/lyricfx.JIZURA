'use strict';
// Read-only source-algebra calculation, not a Canvas/browser experiment.
const fs=require('node:fs'),zlib=require('node:zlib'),path=require('node:path');
const root=__dirname,read=state=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'d09-flag-raise-landscape-'+state+'-inputs.json.gz'))));
const records=[];
for(const state of ['before','after']){
 const p=read(state).renderPlan,c=p.cuts[0],Pm=c.params,recipe=c.placementTrajectory?.units[0].segments[0].composition,Wf=recipe?.width||p.W*.62,Hf=recipe?.height||Math.min(p.H*.52,Wf*.64),side=Pm.side||1,mot=p.fx.motion,scheme=c.palette||p.style.schemes[0];
 for(const t of [.25,1.5,3.8]){
  const amp=Hf*.1*Pm.wind*(.5+.7*mot)*(recipe?.waveScale??1),zf=x=>amp*Math.pow(x,.85)*Math.sin(2*Math.PI*1.05*x-3.2*Pm.wind*t)+amp*.35*x*Math.sin(2*Math.PI*1.3*x-3.2*Pm.wind*.7*t+1.3),sl=u=>(zf(u+.01)-zf(state==='after'?Math.max(0,u-.01):u-.01))/.02/Wf,a=sl(0),b=sl(1/30),raw=-(a+b)/2*side*.9,v=raw<-.4?-.4:raw>.2?.2:raw,pOut=Math.max(0,Math.min(1,(t-(c.dur-c.outDur))/c.outDur)),out=1-pOut**3;
  records.push({state,t,Wf,Hf,trim:Pm.trim,side,zfNegative:zf(-.01),slope0:a,slope1:b,v,shadeSkipped:Math.abs(v)<.02,selectDark:v<0,requestedShadeAlpha:Math.abs(v)*.8*out,sourceOut:out,materialStripWidth:Wf/30/Math.sqrt(1+b*b),undeformedStripWidth:Wf/30,scheme,scope:'Source-algebra only; invalid Canvas globalAlpha assignment behavior is a platform contract, not a new runtime observation.'});
 }
}
fs.writeFileSync(path.join(root,'calculation.json'),JSON.stringify(records,(_k,v)=>typeof v==='number'&&!Number.isFinite(v)?String(v):v,2)+'\n');
console.log(JSON.stringify(records.map(({state,t,materialStripWidth,slope0,v,requestedShadeAlpha,sourceOut})=>({state,t,materialStripWidth,slope0,v,requestedShadeAlpha,sourceOut})),(_k,v)=>typeof v==='number'&&!Number.isFinite(v)?String(v):v));
