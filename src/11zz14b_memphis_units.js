/* Independent source-only proposal for decorB.memphis. No renderer mutation.
 * API: memphisSupports({W,H,P,bbRanges,includeFallback=true,random})
 * bbRanges: array of post-getBB envelopes, each {x0:[lo,hi],x1:...,y0:...,y1:...}.
 * A scalar is an exact coordinate. Include every live text bbox AND every held
 * exit/cache bbox. These are ranges of bbox EDGES, never one union-bbox treated
 * as an exact resting box. To provide raw pre-getBB ranges use normalizeBBRange.
 * Invalid/hidden native input uses held cache or centerBB; fallback is included
 * by default. Caller must include reachable held caches, including on seeking.
 * Return individual primitive support rectangles for ALL lt,ltb,pOut clocks.
 * Uncertain clearOf/visibility predicates never remove a primitive.
 */
(() => {
'use strict';
const DEG = Math.PI / 180;
const TYPES = ['squig', 'zig', 'tri', 'dots', 'half', 'hatch'];
const add = (a,b) => a.map((v,i)=>v+b[i]);
const mul = (a,k) => a.map(v=>v*k);
const sub = (a,b) => add(a,mul(b,-1));
const val = (a,x) => a[0]+x.reduce((s,v,i)=>s+a[i+1]*v,0);
const clamp = (x,a,b) => Math.min(b,Math.max(a,x));
const range = x => Array.isArray(x) ? x : [x,x];

// getBB clamps edges, but restores the original pair if clamping collapses it.
// If collapse is possible, keep both alternatives; never silently drop it.
function normalizeBBRange(raw,W,H) {
  const r=Object.fromEntries(['x0','x1','y0','y1'].map(k=>[k,range(raw[k])]));
  const axis=(a,b,size)=>{
    const ca=r[a].map(v=>Math.max(v,-size*.1));
    const cb=r[b].map(v=>Math.min(v,size*1.1));
    return cb[0]>ca[1] ? [[ca,cb]] : [[ca,cb],[r[a],r[b]]];
  };
  const out=[];
  for(const x of axis('x0','x1',W)) for(const y of axis('y0','y1',H))
    out.push({x0:x[0],x1:x[1],y0:y[0],y1:y[1]});
  return out;
}

// Linear extrema over a box clipped to one perimeter branch. Enumerating active
// constraints in <=4 dimensions preserves correlation between bbox edges, pad,
// perimeter and seeded t. Independent interval arithmetic loses that correlation.
function extrema(bounds,conditions,expressions) {
  // Skip a branch only if one inequality is impossible throughout the box.
  // A numerically indeterminate vertex search is not evidence of emptiness.
  if(conditions.some(a=>{let lower=a[0],scale=1+Math.abs(a[0]);for(let j=0;j<bounds.length;j++){const k=a[j+1];lower+=k*(k<0?bounds[j][1]:bounds[j][0]);scale+=Math.abs(k)*Math.max(Math.abs(bounds[j][0]),Math.abs(bounds[j][1]));}return lower>64*Number.EPSILON*scale;}))return null;
  const fixed=bounds.map(r=>r[0]);
  const dims=bounds.map((r,i)=>r[0]===r[1]?-1:i).filter(i=>i>=0),n=dims.length;
  const reduce=a=>[val(a,fixed),...dims.map(i=>a[i+1])];
  // Variables below are deltas from the lower bbox-edge values.
  const cs=conditions.map(reduce);
  for(let j=0;j<n;j++) {
    const lo=Array(n+1).fill(0),hi=Array(n+1).fill(0);
    lo[j+1]=-1; hi[j+1]=1; hi[0]=-(bounds[dims[j]][1]-fixed[dims[j]]);
    cs.push(lo,hi);
  }
  const es=expressions.map(reduce),out=es.map(()=>[Infinity,-Infinity]);
  function accept(x) {
    if(cs.some(a=>val(a,x)>1e-7)) return;
    es.forEach((a,i)=>{ const v=val(a,x);out[i][0]=Math.min(out[i][0],v);out[i][1]=Math.max(out[i][1],v); });
  }
  if(!n) accept([]);
  else {
    const chosen=[];
    function combinations(start) {
      if(chosen.length<n) {
        for(let k=start;k<=cs.length-(n-chosen.length);k++){chosen.push(k);combinations(k+1);chosen.pop();}
        return;
      }
      const m=chosen.map(k=>[...cs[k].slice(1),-cs[k][0]]);
      for(let j=0;j<n;j++) {
        let p=j;for(let k=j+1;k<n;k++)if(Math.abs(m[k][j])>Math.abs(m[p][j]))p=k;
        if(Math.abs(m[p][j])<1e-12)return;
        [m[j],m[p]]=[m[p],m[j]];
        const d=m[j][j];for(let k=j;k<=n;k++)m[j][k]/=d;
        for(let k=0;k<n;k++)if(k!==j){const f=m[k][j];for(let c=j;c<=n;c++)m[k][c]-=f*m[j][c];}
      }
      accept(m.map(row=>row[n]));
    }
    combinations(0);
  }
  if(!Number.isFinite(out[0][0]))return expressions.map(a=>{
    // The branch may be feasible even when its vertices are numerically
    // indeterminate. Bounding the whole input box keeps every possible point;
    // it can reject a placement, but cannot admit one by dropping the branch.
    let lo=a[0],hi=a[0],magnitude=1+Math.abs(a[0]);
    for(let j=0;j<bounds.length;j++){
      const v0=a[j+1]*bounds[j][0],v1=a[j+1]*bounds[j][1];
      lo+=Math.min(v0,v1);hi+=Math.max(v0,v1);
      magnitude+=Math.max(Math.abs(v0),Math.abs(v1));
    }
    const guard=64*Number.EPSILON*magnitude;
    return [lo-guard,hi+guard];
  });
  return out;
}

// Rotating a point over a closed angle interval: include endpoints and all
// stationary angles. This analytically covers the full sin(ltb*1.3+i)*6 sweep.
function rotatedPoint(x,y,a,b) {
  const angles=[a,b],phase=Math.atan2(y,x);
  for(let k=Math.floor((a+phase)/ (Math.PI/2))-1;k<=Math.ceil((b+phase)/(Math.PI/2))+1;k++) {
    const t=k*Math.PI/2-phase;if(t>=a&&t<=b)angles.push(t);
  }
  const xs=angles.map(t=>x*Math.cos(t)-y*Math.sin(t));
  const ys=angles.map(t=>x*Math.sin(t)+y*Math.cos(t));
  return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
}
function primitives(type,S,u) {
  // outBack(q,2) maximum at q=5/9: 1+32/243; minimum 0.
  const back=1+32/243,lw=3.4*u,items=[];
  const line=(pts,pad,scale=false)=>items.push({pts:scale?[[0,0],...pts.map(p=>p.map(v=>v*back))]:pts,pad});
  if(type==='squig'||type==='zig') {
    const n=type==='squig'?24:6;
    const p=Array.from({length:n+1},(_,k)=> type==='squig'?
      [(k/n-.5)*S*2.6,Math.sin(k/n*Math.PI*3)*S*.28]:
      [(k/n-.5)*S*2.4,(k%2?-1:1)*S*.3]);
    for(let k=0;k<n;k++)line([p[k],p[k+1]],lw/2);
  } else if(type==='tri') {
    const p=Array.from({length:4},(_,k)=>{const a=(-90+k*120)*DEG;return[Math.cos(a)*S*.8,Math.sin(a)*S*.8];});
    for(let k=0;k<3;k++)line([p[k],p[k+1]],lw*.8/2,true);
  } else if(type==='dots') {
    for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)line([[a*S*.5,b*S*.5]],2.6*u*back);
  } else if(type==='half') {
    line(Array.from({length:21},(_,k)=>{const a=(180+k*9)*DEG;return[Math.cos(a)*S*.7,Math.sin(a)*S*.7];}),0,true);
  } else {
    // de in [0,1], each endpoint moves affinely from [k*.45*S,0].
    for(let k=-1;k<=1;k++)line([[k*S*.45,0],[k*S*.45-S*.3,S*.5],[k*S*.45+S*.3,-S*.5]],lw*.9/2);
  }
  return items;
}

function memphisSupports({W,H,P,bbRanges,includeFallback=true,random=J.r}) {
  if(!(W>0&&H>0&&Number.isFinite(W+H))||!P||!Array.isArray(bbRanges))throw Error('finite W/H, P and explicit bbRanges required');
  const ranges=bbRanges.slice();
  if(includeFallback)ranges.push({x0:W*.35,x1:W*.65,y0:H*.4,y1:H*.6});
  const u=Math.min(W,H)/1080,S=clamp(Math.min(W,H)*.036,24*u,44*u),K=Math.min(8,5+(P.n|0)),supports=[];
  // Affine coordinates [constant, x0, x1, y0, y1].
  const w=[68*u,-1,1,-.44,.44],h=[68*u,0,0,-1.44,1.44];
  const X=[-34*u,1,0,.22,-.22],Y=[-34*u,0,0,1.22,-.22];
  for(let i=0;i<K;i++) {
    const alpha=(i+.2+random(P.seed,i,1)*.6)/K,t=mul(add(w,h),2*alpha);
    const starts=[[0,0,0,0,0],w,add(w,h),add(mul(w,2),h)],ends=[w,add(w,h),add(mul(w,2),h),mul(add(w,h),2)];
    const positions=[[add(X,t),Y],[add(X,w),add(Y,sub(t,w))],
      [add(X,sub(add(mul(w,2),h),t)),add(Y,h)],[X,add(Y,sub(mul(add(w,h),2),t))]];
    const type=TYPES[(i+(P.v|0))%6]||'hatch',theta=random(P.seed,i,3)*Math.PI*2;
    const local=primitives(type,S,u).map(p=>{
      const rs=p.pts.map(([x,y])=>rotatedPoint(x,y,theta-6*DEG,theta+6*DEG));
      const pad=p.pad+1e-6*Math.max(1,u);
      return [Math.min(...rs.map(r=>r[0]))-pad,Math.min(...rs.map(r=>r[1]))-pad,
        Math.max(...rs.map(r=>r[2]))+pad,Math.max(...rs.map(r=>r[3]))+pad];
    });
    ranges.forEach((r,rangeIndex)=>{
      const bounds=['x0','x1','y0','y1'].map(k=>range(r[k]));
      if(bounds.some(v=>v.length!==2||!v.every(Number.isFinite)||v[1]<v[0]))throw Error('invalid bbox range');
      for(let branch=0;branch<4;branch++) {
        const pos=extrema(bounds,[sub(starts[branch],t),sub(t,ends[branch]),[0,1,-1,0,0],[0,0,0,1,-1]],positions[branch]);
        if(!pos)continue;
        const center=pos.map((v,j)=>v.map(c=>clamp(c,S*1.6,(j?H:W)-S*1.6)));
        local.forEach((b,primitive)=>supports.push({i,type,primitive,rangeIndex,branch,
          x0:center[0][0]+b[0],y0:center[1][0]+b[1],x1:center[0][1]+b[2],y1:center[1][1]+b[3]}));
      }
    });
  }
  return supports;
}

function memphisUnits(options) {
  return memphisSupports(options).map(({i,type,primitive,rangeIndex,branch,x0,y0,x1,y1})=>({
    owner:'decorB:memphis:'+i,kind:type,primitive,rangeIndex,branch,bounds:{x0,y0,x1,y1}
  }));
}
// Product input consists of raw native glyph bbox ranges. Normalize once here,
// matching source getBB before solving the seeded perimeter branches.
J.placement.memphisUnits=options=>memphisUnits({...options,
  bbRanges:options.bbRanges.flatMap(r=>normalizeBBRange(r,options.W,options.H)),
  random:J.r,
});
})();
