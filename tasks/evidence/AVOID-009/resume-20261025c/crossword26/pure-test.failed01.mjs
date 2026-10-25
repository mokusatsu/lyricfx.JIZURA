import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {topology,fixture,candidate} from './seam.mjs';
const before=JSON.stringify(fixture),t=topology(fixture),zero=candidate(t);
for(const k of ['cell','gw','gh','gx','gy'])assert.equal(zero[k],t[k]);
assert.equal(JSON.stringify(fixture),before);
assert.equal(t.lyr.map(([,v])=>v.ch).join(''),'風の先へ');
assert.equal(t.words.length,1);assert.equal(t.R,5);assert.equal(t.C,9);
assert.equal(t.lyr.length,4);assert(t.pencil.length>0);
for(const [key]of t.lyr)assert(!t.black.includes(key));
for(const [key]of t.pencil)assert(!t.black.includes(key)&&!t.lyr.some(([k])=>k===key));
for(const recipe of [{clue:'below'},{clue:'below',cellScale:.95},{clue:'below',cellScale:.9}]){
 const c=candidate(t,recipe);assert.equal(c.gw/c.cell,9);assert.equal(c.gh/c.cell,5);assert.equal(c.clues.length,4);
}
assert.throws(()=>topology({...fixture,W:959}),/INITIAL_FAMILY/);
assert.throws(()=>topology({...fixture,cut:{...fixture.cut,text:'未検証'}}),/INITIAL_FAMILY/);
assert.throws(()=>candidate(t,{cellScale:.5}),/RECIPE/);
writeFileSync(new URL('./topology.json',import.meta.url),JSON.stringify({topology:t,zero,candidates:[candidate(t,{clue:'below'}),candidate(t,{clue:'below',cellScale:.95}),candidate(t,{clue:'below',cellScale:.9})]},null,2)+'\n');
console.log(JSON.stringify({pure:'PASS',coverage:'fixed topology / zero coordinate arithmetic / candidate invariants / narrow rejects',Canvas:0,frames:0,avoidanceCertified:false}));
