'use strict';
// Direct diagnostic API ownership only. No browser, Canvas or geometry claim.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),file=process.env.JIZURA_D_PARAMS_SOURCE||path.join(root,'src/09k_layoutsD_placement.js');
const context={J:{placement:{}}};vm.runInNewContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const A=context.J.placement,json=v=>JSON.stringify(v),clone=v=>JSON.parse(json(v));
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
function objects(value,result=new Set()){
 if(value&&typeof value==='object'&&!result.has(value)){result.add(value);Object.values(value).forEach(v=>objects(v,result));}return result;
}
function disjoint(a,b,label){const refs=objects(a);for(const object of objects(b))assert(!refs.has(object),label);}
const program={version:1,mode:'overlay',nodes:[{type:'text',text:'$text',x:.2,y:.8},{type:'ellipse',x:.4,y:.5}]};
function fixture(kind){
 const defaults={nested:{x:.2,list:[{value:'default'}]},array:[{points:[.1,.2]}],replace:{fromDefault:true},amount:.25,label:'default',enabled:true};
 const override={own:{deep:[{value:'override'}]},replace:{fromOverride:true},amount:.75,label:'override',enabled:false};
 const group=['cut-fx','owned-fx','global-fx'].includes(kind)?'fx':kind;
 const definition={version:1,id:'custom_params_'+group,group,params:defaults,program:clone(program)};
 const cut={line:2,part:3},plan={customEffects:[definition]};
 if(kind==='decor')cut.decor=[{id:definition.id,...override}];
 else if(group==='fx'){
  const event={type:definition.id,t:1,dur:2,offset:.5,params:override};
  if(kind==='cut-fx')cut.effectEvents=[event];
  else plan.events=[{...event,...(kind==='owned-fx'?{cutOwner:'2:3'}:{})}];
 }else{cut[group]=definition.id;cut[group==='layout'?'params':group+'P']=override;}
 const report=()=>kind==='global-fx'?A.customGlobalEventCapabilities(plan)[0].capability:A.customDrawingCapability(cut,plan);
 return {cut,plan,defaults,override,report};
}
const cases=[];
for(const kind of ['layout','bg','trans','decor','cut-fx','owned-fx','global-fx']){
 const f=fixture(kind),before=json({cut:f.cut,plan:f.plan}),report=f.report(),params=report.programs[0].params;
 assert.equal(json({cut:f.cut,plan:f.plan}),before,kind+': read must preserve input');
 assert.equal(report.safety,'unsupported');assert.equal(report.measurementSupported,false);
 assert.equal(report.coordinatePolicy,'preserve-manual-program-and-component-coordinates');
 assert.deepEqual(clone(params.replace),{fromOverride:true});assert.equal(params.amount,.75);assert.equal(params.enabled,false);assert.equal(params.label,'override');
 assert.equal(params.nested.x,.2);assert.equal(params.array[0].points[1],.2);assert.equal(params.own.deep[0].value,'override');
 const fresh=f.report();disjoint(report,{cut:f.cut,plan:f.plan},kind+': input/report nested ownership');disjoint(report,fresh,kind+': fresh report ownership');
 const originalReport=json(report);assert.equal(json(fresh),originalReport);
 assert.equal(json(kind==='global-fx'?A.customGlobalEventCapabilities(clone(f.plan))[0].capability:A.customDrawingCapability(clone(f.cut),clone(f.plan))),originalReport,kind+': portable roundtrip');
 params.nested.x=.9;params.nested.list[0].value='report';params.array[0].points.push(.9);params.own.deep[0].value='report';params.replace.fromOverride=false;
 assert.equal(json({cut:f.cut,plan:f.plan}),before,kind+': report mutations must preserve input');assert.equal(json(fresh),originalReport,kind+': report mutations must preserve fresh report');
 f.defaults.nested.list[0].value='input';f.defaults.array[0].points.push(.8);f.override.own.deep[0].value='input';
 assert.equal(json(fresh),originalReport,kind+': input mutations must preserve existing report');
 const frozen=fixture(kind),frozenBefore=json({cut:frozen.cut,plan:frozen.plan});freeze(frozen.cut);freeze(frozen.plan);
 const frozenReport=frozen.report();assert.equal(json(frozenReport),originalReport);disjoint(frozenReport,{cut:frozen.cut,plan:frozen.plan},kind+': frozen input ownership');
 frozenReport.programs[0].params.nested.x=.7;assert.equal(json({cut:frozen.cut,plan:frozen.plan}),frozenBefore);
 cases.push(kind);
}
// Missing/undefined parameter bags remain legitimate spread inputs. Explicit
// undefined values continue to override defaults and remain own properties.
for(const absent of [false,true]){
 const f=fixture('layout');if(absent){delete f.plan.customEffects[0].params;delete f.cut.params;}else{f.plan.customEffects[0].params=undefined;f.cut.params=undefined;}
 assert.equal(json(f.report().programs[0].params),'{}');cases.push(absent?'absent-bags':'undefined-bags');
}
{
 const f=fixture('layout');f.cut.params={amount:undefined,nested:undefined,zero:-0};
 const params=f.report().programs[0].params;
 assert(Object.hasOwn(params,'amount'));assert.equal(params.amount,undefined);assert(Object.hasOwn(params,'nested'));assert.equal(params.nested,undefined);assert(Object.is(params.zero,-0));
 cases.push('undefined-overrides');
}
{
 const cut={drawing:clone(program)},plan={customEffects:[]},report=A.customDrawingCapability(cut,plan);
 assert.equal(json(report.programs[0].params),'{}');disjoint(report,{cut,plan},'whole-cut drawing ownership');cases.push('whole-cut-drawing');
}
console.log(JSON.stringify({scope:'Direct custom capability JSON parameter ownership; Node VM only',cases:cases.length,passed:cases}));
