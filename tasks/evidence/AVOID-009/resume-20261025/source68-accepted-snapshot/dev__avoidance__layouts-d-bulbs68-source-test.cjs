/* Pure synthetic finite-family checks. No browser, application or native font claim. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const context={J:{placement:{}}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../../src/11p_layoutsEe_bulbs_geometry68.js'),'utf8'),context);
const G=context.J.placement.bulbsGeometry68,box=(x0,y0,x1,y1)=>({owner:'bulbs.sign.synthetic',bounds:{x0,y0,x1,y1}}),c={cx:480,cy:226.8,r:108,margin:2.7};let checks=0;
const check=(value)=>{assert(value);checks++;};
// Contact at radius+margin is rejected using exact captured-double arithmetic.
const simple={cx:10,cy:10,r:5,margin:2};check(!G.evaluation([box(17,9,20,11)],simple,[0,0]).passed);check(G.evaluation([box(18,9,20,11)],simple,[0,0]).passed);
check(!G.evaluation([box(-1,20,1,22)],simple,[0,0]).passed);
// A lower horizontal field can beat a later two-row recipe; never pin old right293.
const line=[box(80,220,880,280)],rows=G.positions(line,c);check(rows.length<=8&&rows.some(r=>r.side==='bottom'&&r.evaluation.passed));check(rows.every(r=>r.heuristicSparePx===4));
const table=(recipe,supports,qualityPassed=true)=>({recipe,supports,qualityPassed,sourceVerified:true,complete:true});
const selected=G.choose([table('one-row-compact',line),table('two-row-95',[box(400,120,560,370)])],c);check(selected.winner?.recipe.id==='one-row-compact');check(selected.winner.delta[0]!==293.1329669691148);
const explicit=G.choose([table('two-row-95',[box(5,5,25,25)])],c,{explicitSize:true});check(!explicit.winner&&explicit.outcomes.some(r=>r.status==='explicit-size-excluded'));
const bad=G.choose([table('one-row-compact',line,false)],c);check(!bad.winner&&bad.outcomes.some(r=>r.status==='unqualified-source-or-quality'));
const huge=G.choose([table('native',[box(-10,-10,970,550)])],c);check(!huge.winner&&huge.notGlobalImpossibility);
const zero=G.choose([table('native',[box(10,10,20,20)])],c);check(zero.winner?.recipe.id==='native'&&zero.winner.delta.every(x=>x===0));
check(Object.isFrozen(G)&&Object.isFrozen(G.recipes)&&G.recipes.length===4&&G.limits.positionsPerRecipe===8);
const again=G.positions(line,c);check(JSON.stringify(rows)===JSON.stringify(again));
assert.throws(()=>G.positions([],c),e=>e.code==='BULBS68_EMPTY_SUPPORTS');checks++;
assert.throws(()=>G.positions([box(NaN,0,1,1)],c),e=>e.code==='BULBS68_SUPPORT_BOX');checks++;
const nonNativeZero=G.choose([table('one-row-compact',[box(10,10,20,20)]),table('two-row-native',line)],c);
check(nonNativeZero.winner?.recipe.id==='one-row-compact'&&nonNativeZero.winner.delta.every(x=>x===0));
check(nonNativeZero.outcomes.find(o=>o.recipe==='two-row-native').status==='not-evaluated'&&nonNativeZero.outcomes.find(o=>o.recipe==='two-row-native').reason==='earlier-recipe-winner');
check(selected.outcomes.find(o=>o.recipe==='one-row-compact').positions.some(p=>p.status==='not-evaluated'&&p.reason==='earlier-position-winner'));
const empty=G.choose([table('native',[])],c);check(!empty.winner&&empty.outcomes[0].code==='BULBS68_EMPTY_SUPPORTS');
// Exercise the actual binding helper on source-clock edge cases without a canvas.
// This is a source contract test, not a font/native rendering qualification.
const source=fs.readFileSync(path.join(__dirname,'../../src/11p_layoutsD.js'),'utf8'),helper=source.slice(source.indexOf('const bulbsRecipe68Key='),source.indexOf("reg('bulbs', {"));
const outBack=(x,s)=>1+(s+1)*(x-1)**3+s*(x-1)**2,inCubic=x=>x*x*x;
const mini={J:{placement:{},lang:'ja',clamp:x=>Math.max(0,Math.min(1,x)),layoutText:it=>[...it.text.replace(/\n/g,'')].map((ch,i)=>({ch,i})),fitSize:()=>999},E:{outBack,inCubic},tout:e=>1-inCubic(e.pOut),bodyF:()=> 'body'};
vm.createContext(mini);vm.runInContext(helper,mini);const bind=mini.J.placement.withBulbsRecipe68;
function sample(lt,pOut=0){const q=outBack(Math.max(0,Math.min(1,lt/.35)),1.4)*(1-.1*inCubic(pOut)),out=1-inCubic(pOut),culled=q<=.01||out<=0,env={W:960,H:540,plan:{lang:'ja'},t:lt,realTime:lt,lt,ltb:lt,step:0,pIn:Math.min(1,lt/.35),pOut,pass:'main',cut:{placementLayoutsD:true,text:'風の先へ',seed:1205,params:{font:'dela',shape:'board',sub:true,chase:'chase',dir:1},enter:'cut',exit:'cut',hold:'still',treat:'none',cam:'push',contentScale:1,motionScale:1}},reference={kind:'bulbs-native-catalog',nativeOnly:true,complete:true,sourceInputs:{text:env.cut.text},seed:1205,params:{...env.cut.params},clock:Object.fromEntries(['t','realTime','lt','ltb','step','pIn','pOut'].map(k=>[k,env[k]])),pass:'main',text:'風の先へ',size:129.6,ss:20.736,bw:700,padX:97.2,q,out,culled,cullReason:q<=.01?'q<=.01':out<=0?'out<=0':null,sourceCalls:[],rings:[]};if(!culled)Object.assign(reference,{r:9.72,rings:[{N:100}],subtitle:{text:'No.01',fs:20.736*Math.min(1,q),size:20.736*Math.min(1,q)}});return{env,reference};}
const recipe={id:'two-row-95',scale:.95,writingText:'風の\n先へ',pad:[.22,.25],radiusScale:.8};
for(const [lt,pOut]of[[0,0],[.01,0],[.35,0],[4,1]]){const {env,reference}=sample(lt,pOut);let called=false;bind(env,recipe,reference,()=>{called=true;});check(called&&Reflect.ownKeys(env).every(k=>typeof k!=='symbol'));}
const early=sample(.01);check(early.reference.subtitle.size<20.736);
assert.throws(()=>bind(early.env,recipe,{...early.reference,subtitle:{...early.reference.subtitle,size:20.736}},()=>{}),e=>e.code==='BULBS68_CAPTION_SCOPE');checks++;
const culled=sample(0);assert.throws(()=>bind(culled.env,recipe,{...culled.reference,cullReason:'wrong'},()=>{}),e=>e.code==='BULBS68_CULLED_REFERENCE');checks++;
assert.throws(()=>bind({...early.env,plan:{lang:'en'}},recipe,early.reference,()=>{}),e=>e.code==='BULBS68_RECIPE_SCOPE');checks++;
// The actual helper's clone preserves Float64 signed zero and present undefined fields.
const signed=sample(0);signed.env.t=-0;signed.reference.clock.t=-0;signed.reference.clock.extra=undefined;
bind(signed.env,recipe,signed.reference,()=>{const key=Reflect.ownKeys(signed.env).find(k=>typeof k==='symbol'),ref=signed.env[key].reference;check(Object.is(ref.clock.t,-0)&&Object.hasOwn(ref.clock,'extra')&&ref.clock.extra===undefined);});
const interrupted=sample(.35),sentinel=Error('expected callback exception');
assert.throws(()=>bind(interrupted.env,recipe,interrupted.reference,()=>{throw sentinel;}),e=>e===sentinel);checks++;
check(Reflect.ownKeys(interrupted.env).every(k=>typeof k!=='symbol'));
let recovered=false;bind(interrupted.env,recipe,interrupted.reference,()=>{recovered=true;});check(recovered);
console.log(JSON.stringify({checks,status:'PASS',scope:'synthetic geometry only; no native rendering or adapter acceptance',browserExecutions:0}));
