const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const root='/workspace/lyricfx.JIZURA',work='/workspace/work/avoidance-analysis';
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium'});
try {
const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',r=>r.request().url()==='http://analysis.local/'?r.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(root,'index.html'))}):r.abort());
await page.goto('http://analysis.local/');
const result=await page.evaluate(()=>{
 const rows=[],renderer=new J.Renderer(),canvas=document.createElement('canvas');canvas.width=640;canvas.height=360;
 const base=()=>{const p=J.defaultProject();p.lyrics='[00:00]夜明けの色を覚えてる';p.title='';p.artist='';p.durationOverride=5;p.seed=1;p.fx={...p.fx,chroma:0,glitch:0,decor:0,texture:0,hud:'off',onTwos:false,koma:0};return p;};
 for(const aspect of ['16:9','9:16','1:1','21:9'])for(const layout of ['center','wave','marquee','ring','orbit','spiral'])for(const mode of ['off','avoid']){
  const p=base();p.aspect=aspect;p.lyricEffects={autoPlacement:mode==='avoid',avoidCenter:mode==='avoid'};p.overrides={0:{single:true,layout,enter:'cut',exit:'cut',hold:'still',cam:'none',treat:'none',bg:'none',decor:[]}};
  const plan=J.plan(p),cut=plan.cuts.find(c=>c.line===0&&c.part===0),env=renderer.makeEnv(canvas.getContext('2d'),plan,cut,plan.style.schemes[0],{pass:'main',t:1,lt:1,ltb:1,step:24,scale:1,allowFilter:false});
  rows.push({aspect,layout,mode,stage:[plan.W,plan.H],area:cut.area,areaMode:cut.areaMode,renderSize:[env.W,env.H],renderAreaRatio:env.W*env.H/(plan.W*plan.H),params:cut.params});
 }
 const groupP=base();groupP.lyrics='[00:00]{-夜明けの色を/覚えてる/ほどけた声が/遠くで鳴った-}';groupP.lyricEffects={autoPlacement:true,avoidCenter:true};
 const group=J.plan(groupP).cuts.filter(c=>c.line>=0&&Number.isInteger(c.part)).map(c=>({line:c.line,part:c.part,start:c.start,end:c.end,slotEnd:c.slotEnd,displayEnd:c.displayEnd,renderStart:c.renderStart,area:c.area,areaMode:c.areaMode,arrangement:c.arrangement}));
 const inventory=J.order('layout').map(id=>({id,name:J.LAYOUTS[id].name,custom:!!J.LAYOUTS[id].custom,ae:J.LAYOUTS[id].ae||null,renderSource:J.LAYOUTS[id].render.toString()}));
 const previewP=base();previewP.lyricEffects={autoPlacement:true,avoidCenter:true};previewP.overrides={0:{single:true,layout:'ring',enter:'cut',exit:'cut',hold:'still',cam:'none',treat:'none',bg:'none',decor:[]}};J.ui.project=previewP;J.uiApi.syncUI();J.uiApi.replan();J.uiApi.seek(1);
 return {rows,group,inventory,centerAvoid:J.CENTER_AVOID,registryCounts:Object.fromEntries(J.GROUP_KEYS.map(k=>[k,J.order(k).length]))};
});
fs.writeFileSync(path.join(work,'runtime-probe.json'),JSON.stringify({...result,errors},null,2));
await page.locator('#view').screenshot({path:path.join(work,'existing-ring-avoid.png')});
console.log(JSON.stringify({rows:result.rows.length,registryCounts:result.registryCounts,centerAvoid:result.centerAvoid,examples:result.rows.filter(x=>x.aspect==='16:9'&&['center','ring','wave'].includes(x.layout)).map(({params,...x})=>x),groupCuts:result.group.length,errors},null,2));
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
