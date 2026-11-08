/* Freeze the editor underneath any modal, preserving its scroll position on close. */
(() => {
'use strict';
if(typeof MutationObserver==='undefined'||typeof document==='undefined'||!document.getElementById?.('app'))return;
let saved=null;
const selector='dialog[open]:not(.avoidance-inline-dialog)';
const sync=()=>{
  const open=!!document.querySelector(selector);
  if(open===!!saved)return;
  const body=document.body;
  if(open){
    saved={x:scrollX,y:scrollY,styles:{}};
    for(const key of ['position','top','left','width','overflow'])saved.styles[key]=body.style[key];
    Object.assign(body.style,{position:'fixed',top:-saved.y+'px',left:-saved.x+'px',width:'100%',overflow:'hidden'});
  }else{
    const previous=saved;saved=null;Object.assign(body.style,previous.styles);window.scrollTo(previous.x,previous.y);
  }
};
const containsModal=node=>node.nodeType===1 && (node.matches(selector)||node.querySelector(selector));
new MutationObserver(records=>{
  if(records.some(record=>record.type==='attributes' ? record.target.localName==='dialog'
    : [...record.addedNodes,...record.removedNodes].some(containsModal)))sync();
}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
})();
