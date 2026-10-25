/* AVOID-009 SOURCE68: finite sign recipes and conservative placement selection.
   This module never registers a safe adapter and never reads canvas pixels. */
(()=>{'use strict';
const A=J.placement,need=(v,code)=>{if(!v)throw Object.assign(Error(code),{code});},freeze=x=>{if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
const limits=freeze({recipes:4,positionsPerRecipe:8,statesPerRecipe:512,passesPerRecipe:1536,paintPerPass:2048,proofBytes:8388608,cacheEntries:2});
const recipes=freeze([{id:'native',native:true,writingText:'風の先へ',scale:1},...['one-row-compact','two-row-native','two-row-95'].map(id=>({id,native:false,writingText:id==='one-row-compact'?'風の先へ':'風の\n先へ',scale:id==='two-row-95'?.95:1,pad:[.22,.25],radiusScale:.8,neighborHardMinimum:3,neighborPreferredMinimum:4.86}))]);
// Dyadic comparisons are on the captured finite doubles, including translation.
// They do not infer a universal bound for font/AA/libm errors.
const view=new DataView(new ArrayBuffer(8));
function F(x){need(Number.isFinite(x),'BULBS68_FINITE');view.setFloat64(0,x);const b=view.getBigUint64(0),e=Number((b>>52n)&2047n),m=(b&((1n<<52n)-1n))+(e?1n<<52n:0n);return{n:b>>63n?-m:m,e:e?e-1075:-1074};}
const add=(a,b)=>{const e=Math.min(a.e,b.e);return{n:(a.n<<BigInt(a.e-e))+(b.n<<BigInt(b.e-e)),e};},neg=a=>({n:-a.n,e:a.e}),sub=(a,b)=>add(a,neg(b)),mul=(a,b)=>({n:a.n*b.n,e:a.e+b.e}),cmp=(a,b)=>{const d=sub(a,b);return d.n<0n?-1:d.n>0n?1:0;},z=F(0);
function validBox(b){need(b&&['x0','y0','x1','y1'].every(k=>Number.isFinite(b[k]))&&b.x0<=b.x1&&b.y0<=b.y1,'BULBS68_SUPPORT_BOX');return b;}
function validCircle(c){need(c&&[c.cx,c.cy,c.r,c.margin].every(Number.isFinite)&&c.r>0&&c.margin>=2,'BULBS68_CIRCLE');return c;}
function evaluation(supports,c,delta){validCircle(c);need(Array.isArray(delta)&&delta.length===2&&delta.every(Number.isFinite),'BULBS68_DELTA');const circleX=F(c.cx),circleY=F(c.cy),radius=add(F(c.r),F(c.margin)),failures=[];for(let i=0;i<supports.length;i++){const s=supports[i],b=validBox(s.bounds),x0=add(F(b.x0),F(delta[0])),x1=add(F(b.x1),F(delta[0])),y0=add(F(b.y0),F(delta[1])),y1=add(F(b.y1),F(delta[1])),nx=cmp(circleX,x0)<0?x0:cmp(circleX,x1)>0?x1:circleX,ny=cmp(circleY,y0)<0?y0:cmp(circleY,y1)>0?y1:circleY,dx=sub(nx,circleX),dy=sub(ny,circleY),circle=cmp(add(mul(dx,dx),mul(dy,dy)),mul(radius,radius))<=0,stage=cmp(x0,z)<0||cmp(y0,z)<0||cmp(x1,F(960))>0||cmp(y1,F(540))>0;if(circle||stage)failures.push({index:i,owner:s.owner,circle,stage,conservativeEnvelope:true});}return{passed:failures.length===0,checked:supports.length,failures,meaning:'captured support rectangles, not actual ink collision or placement impossibility'};}
const sideRank={bottom:0,right:1,left:2,top:3};
function positions(supports,c,{evaluate=true}={}){validCircle(c);need(supports.length>0,'BULBS68_EMPTY_SUPPORTS');const b={x0:Infinity,y0:Infinity,x1:-Infinity,y1:-Infinity};for(const s of supports){validBox(s.bounds);for(const k of Object.keys(b))b[k]=k.endsWith('0')?Math.min(b[k],s.bounds[k]):Math.max(b[k],s.bounds[k]);}
 const feasible={x0:-b.x0,x1:960-b.x1,y0:-b.y0,y1:540-b.y1};if(feasible.x0>feasible.x1||feasible.y0>feasible.y1)return[];
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dx=clamp(0,feasible.x0,feasible.x1),dy=clamp(0,feasible.y0,feasible.y1),R=c.r+c.margin,spare=4;
 const gy=Math.max(b.y0+dy-c.cy,0,c.cy-(b.y1+dy)),gx=Math.max(b.x0+dx-c.cx,0,c.cx-(b.x1+dx)),hx=Math.sqrt(Math.max(0,R*R-gy*gy)),hy=Math.sqrt(Math.max(0,R*R-gx*gx));
 const ranges=[['right','x',Math.max(feasible.x0,c.cx+hx-b.x0+spare),feasible.x1,dy],['left','x',feasible.x0,Math.min(feasible.x1,c.cx-hx-b.x1-spare),dy],['bottom','y',Math.max(feasible.y0,c.cy+hy-b.y0+spare),feasible.y1,dx],['top','y',feasible.y0,Math.min(feasible.y1,c.cy-hy-b.y1-spare),dx]],out=[],seen=new Set();
 for(const[side,axis,lo,hi,other]of ranges){if(lo>hi)continue;for(const v of[clamp(0,lo,hi),lo+(hi-lo)/2]){const delta=axis==='x'?[v,other]:[other,v],key=delta.join(',');if(seen.has(key))continue;seen.add(key);const e=evaluate?evaluation(supports,c,delta):null;out.push({side,delta,ordinal:out.length,heuristicSparePx:spare,evaluation:e,distance2:delta[0]**2+delta[1]**2,stageSlack:Math.min(b.x0+delta[0],b.y0+delta[1],960-b.x1-delta[0],540-b.y1-delta[1])});}}
 need(out.length<=limits.positionsPerRecipe,'BULBS68_POSITION_BUDGET');const pref=s=>c.cy/540<.45?(s==='top'?1:0):c.cy/540>.55?(s==='bottom'?1:0):0;
 return out.sort((a,b)=>pref(a.side)-pref(b.side)||a.distance2-b.distance2||b.stageSlack-a.stageSlack||sideRank[a.side]-sideRank[b.side]||a.ordinal-b.ordinal);
}
function choose(tables,c,{explicitSize=false}={}){
 need(tables.length<=4,'BULBS68_RECIPE_BUDGET');
 const outcomes=recipes.map(recipe=>({recipe:recipe.id,status:'not-evaluated'}));
 const won=(winner,index)=>{for(let i=index+1;i<outcomes.length;i++)outcomes[i].reason='earlier-recipe-winner';return{winner,outcomes};};
 for(let index=0;index<recipes.length;index++){
  const recipe=recipes[index],outcome=outcomes[index];
  if(explicitSize&&recipe.scale!==1){outcome.status='explicit-size-excluded';continue;}
  const table=tables.find(t=>t.recipe===recipe.id);if(!table){outcome.reason='source-table-not-acquired';continue;}
  if(!table.complete||!table.sourceVerified||table.qualityPassed!==true){outcome.status='unqualified-source-or-quality';continue;}
  if(!Array.isArray(table.supports)||!table.supports.length){outcome.status='unqualified-empty-supports';outcome.code='BULBS68_EMPTY_SUPPORTS';continue;}
  const zero=evaluation(table.supports,c,[0,0]);outcome.status='evaluated';outcome.zero={status:'evaluated',evaluation:zero};
  if(zero.passed){outcome.positionsStatus='not-evaluated';outcome.reason='zero-position-winner';return won({recipe,delta:[0,0],evaluation:zero},index);}
  // Generate without evaluation so an early winner cannot label later positions as failed.
  const rows=positions(table.supports,c,{evaluate:false});outcome.positions=rows.map(r=>({...r,status:'not-evaluated'}));
  for(let i=0;i<outcome.positions.length;i++){
   const row=outcome.positions[i];row.evaluation=evaluation(table.supports,c,row.delta);row.status='evaluated';
   if(row.evaluation.passed){for(let j=i+1;j<outcome.positions.length;j++)outcome.positions[j].reason='earlier-position-winner';return won({recipe,...row},index);}
  }
 }
 return{winner:null,outcomes,status:'insufficient-space-in-evaluated-finite-family',notGlobalImpossibility:true};
}
A.bulbsGeometry68=freeze({revision:'bulbs-finite-recipes68-v1',recipes,limits,evaluation,positions,choose});
})();
