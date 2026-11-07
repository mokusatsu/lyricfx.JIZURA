const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const context = vm.createContext({ J: { E: {}, clamp: (n,a=0,b=1) => Math.max(a,Math.min(b,n)) } });
for (const file of ['05_anim.js','06_layouts.js','07_decor.js']) vm.runInContext(read('src/' + file), context);
const J = context.J;
const enabled = Object.fromEntries(['layout','enter','exit','hold'].map(group =>
  [group,Object.fromEntries(J[group === 'layout' ? 'LAYOUT_ORDER' : group.toUpperCase() + '_ORDER'].map(key => [key,true]))]));
const style = { bias: { layout:{},enter:{},exit:{} } }, rng = { wpick: candidates => candidates };

function selections(code, unified = false) {
  const start = code.indexOf('function novelty('), end = code.indexOf('function decorParams(');
  return new Function('J','UNITY',
    'const wkey=(obj,k,d=1)=>obj&&obj[k]!=null?obj[k]:d;\n' + code.slice(start,end) +
    ';return {pickLayout,pickEnter,pickExit,pickHold};')(J,unified);
}
const current = selections(read('src/08_planner.js'));
const weight = (candidates,key) => candidates.find(([id]) => id === key)?.[1];
assert.equal(weight(current.pickEnter(rng,style,enabled,'center',.44,[],false,8),'cut'), .9);
assert.equal(weight(current.pickEnter(rng,style,enabled,'center',.45,[],false,8),'cut'), .5);
assert.equal(weight(current.pickExit(rng,style,enabled,'center',.59,false,[]),'cut'), 4);
assert.equal(weight(current.pickExit(rng,style,enabled,'center',.6,false,[]),'cut'), 2.2);
assert.equal(weight(current.pickExit(rng,style,enabled,'center',.6,true,[]),'cut'), 1.2);
assert.equal(J.layoutAllowsSharing('type',.499), false);
assert.equal(J.layoutAllowsSharing('type',.5), true);
assert.equal(J.layoutAllowsSharing('center',.1), true);

let comparisons = 0;
if (process.env.JIZURA_SELECTION_REFERENCE) {
  const old = fs.readFileSync(path.join(process.env.JIZURA_SELECTION_REFERENCE,'src/08_planner.js'),'utf8');
  for (const unified of [false,true]) {
    const actual = selections(read('src/08_planner.js'),unified), expected = selections(old,unified);
    for (const n of [1,8,18,19,40]) for (const duration of [.1,.44,.45,.49,.5,.59,.6,1.5]) {
      for (const emph of [false,true]) for (const recap of [false,true]) for (const portrait of [false,true]) {
        const history=[{layout:'type',enter:'assemble',exit:'cut',hold:'jitter'},{layout:'center',enter:'cut',exit:'drift',hold:'still'}];
        const args=[rng,style,enabled,n,duration,history,emph,recap,portrait,'note'];
        assert.deepEqual(actual.pickLayout(...args),expected.pickLayout(...args));comparisons++;
        for (const layout of J.LAYOUT_ORDER) {
          const args=[rng,style,enabled,layout,duration,history,emph,n];
          assert.deepEqual(actual.pickEnter(...args),expected.pickEnter(...args));comparisons++;
          const exitArgs=[rng,style,enabled,layout,duration,recap,history];
          assert.deepEqual(actual.pickExit(...exitArgs),expected.pickExit(...exitArgs));comparisons++;
        }
        const holdArgs=[rng,enabled,{motion:.7,glitch:.55},history];
        assert.deepEqual(actual.pickHold(...holdArgs),expected.pickHold(...holdArgs));comparisons++;
      }
    }
  }
}
console.log(`Planner selection: boundary cases passed; ${comparisons} reference comparisons matched`);
