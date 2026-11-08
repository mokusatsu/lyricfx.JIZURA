const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launchBrowser}=require('./test_helpers.cjs');
const source=fs.readFileSync(path.join(__dirname,'../src/11v_modal_scroll.js'),'utf8');
(async()=>{
 const browser=await launchBrowser();
 try{
  const page=await browser.newPage({viewport:{width:900,height:700}});
  await page.setContent('<style>body{min-height:3000px}</style><main id="app"><span id="clock"></span></main>');
  await page.evaluate(code=>{
   const query=document.querySelector.bind(document);window.modalQueries=0;
   document.querySelector=selector=>{if(selector.startsWith('dialog[open]'))window.modalQueries++;return query(selector);};
   (new Function(code))();
  },source);
  const result=await page.evaluate(async()=>{
   const settle=()=>new Promise(resolve=>setTimeout(resolve,0)),body=document.body;
   for(let i=0;i<1000;i++)document.getElementById('clock').textContent=String(i);
   await settle();const ordinaryQueries=window.modalQueries;
   window.scrollTo(0,320);const before={scroll:scrollY,style:body.getAttribute('style')};
   const outer=document.createElement('dialog'),inner=document.createElement('dialog');body.append(outer,inner);outer.showModal();await settle();
   const opened=body.style.position==='fixed' && body.style.top===-before.scroll+'px';
   inner.showModal();outer.close();await settle();const nested=body.style.position==='fixed';
   inner.remove();await settle();const restored=body.style.position==='' && scrollY===before.scroll;
   const wrapper=document.createElement('section'),dialog=document.createElement('dialog');dialog.open=true;wrapper.append(dialog);body.append(wrapper);await settle();
   const inserted=body.style.position==='fixed';wrapper.remove();await settle();const removed=body.style.position==='';
   const inline=document.createElement('dialog');inline.className='avoidance-inline-dialog';body.append(inline);inline.showModal();await settle();const ignored=body.style.position==='';inline.close();inline.remove();
   return {ordinaryQueries,opened,nested,restored,inserted,removed,ignored};
  });
  assert.deepEqual(result,{ordinaryQueries:0,opened:true,nested:true,restored:true,inserted:true,removed:true,ignored:true});
  console.log('Modal scroll: ordinary updates, nested dialogs, inserted/removed subtrees and scroll restoration passed');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
