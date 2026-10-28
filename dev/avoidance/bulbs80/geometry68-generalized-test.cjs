/* Standalone factory/selection contract. No native renderer, proof or adapter. */
'use strict';const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),source=fs.readFileSync(__dirname+'/geometry68-generalized.js','utf8');
function load(IntlImpl=Intl){const J={placement:{}};vm.runInNewContext(source,{J,Intl:IntlImpl,DataView,ArrayBuffer,Number,Object,Array,Math,Map,Set});return J.placement.bulbsGeometry68;}
const G=load();let checks=0;const ok=v=>{assert(v);checks++};
for(const text of ['風の先へ','風風先先','春','HELLO','AAABBA','ガ','café','😀','、。']){const family=G.recipesFor(text);ok(Object.isFrozen(family)&&family.every(Object.isFrozen));ok(family.length===(text.length===0?0:[...text].length===1?2:4));for(const r of family){ok(r.writingText.replace(/\n/g,'')===text);ok([...r.writingText.replace(/\n/g,'')].length===[...text].length);}if([...text].length>1){ok(family[2].writingText.split('\n').every(row=>row.length>0));ok(family[2].writingText.split('\n')[0]===[...text].slice(0,Math.ceil([...text].length/2)).join(''));}}
ok(JSON.stringify(G.recipesFor('風の先へ'))===JSON.stringify(G.recipes));
for(const text of [null,undefined,0,[],new String('A'),'','A'.repeat(17),'A B','A\nB','A\tB','\u00a0','\u200b','a\u0301','か\u3099','👨‍👩‍👧','🇯🇵','👍🏻','가','\ud800']){assert.throws(()=>G.recipesFor(text),e=>/^BULBS68_(TEXT|GRAPHEME)/.test(e.code));checks++;}
assert.throws(()=>load({}).recipesFor('A'),e=>e.code==='BULBS68_GRAPHEME_SEGMENTER_UNAVAILABLE');checks++;
const circle={cx:480,cy:270,r:108,margin:2.7},table=recipe=>({recipe,supports:[{owner:'synthetic-sign',bounds:{x0:10,y0:10,x1:30,y1:30}}],complete:true,sourceVerified:true,qualityPassed:true});
const legacy=G.choose([table('native')],circle);ok(legacy.winner.recipe.native&&legacy.winner.recipe.writingText==='風の先へ');ok(legacy.outcomes.slice(1).every(r=>r.reason==='earlier-recipe-winner'));
const family=G.recipesFor('HELLO'),chosen=G.choose([table('two-row-native')],circle,{recipeFamily:family});ok(chosen.winner.recipe.writingText==='HEL\nLO'&&chosen.winner.recipe.scale===1);ok(chosen.outcomes[0].reason==='source-table-not-acquired');
const explicit=G.choose([table('two-row-95')],circle,{recipeFamily:family,explicitSize:true});ok(!explicit.winner&&explicit.outcomes.at(-1).status==='explicit-size-excluded');
const unqualified=G.choose([{...table('native'),qualityPassed:false}],circle,{recipeFamily:family});ok(!unqualified.winner&&unqualified.outcomes[0].status==='unqualified-source-or-quality');
console.log(JSON.stringify({passed:true,checks,scope:'standalone bounded factory and optional selection family; default fixture behavior retained; Canvas/adapter executions0'}));
