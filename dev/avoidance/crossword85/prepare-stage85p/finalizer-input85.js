/* Source-only normalized adapter input. Neither projection nor key grants authority. */
(()=>{'use strict';const A=J.placement,C=A.bulbsScalarCompiler80,need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c})};
function denseCopy(x,seen=new Set()){if(x===null||x===undefined||typeof x==='string'||typeof x==='boolean')return x;if(typeof x==='number'){need(Number.isFinite(x),'CROSSWORD85P_INPUT_FINITE_DATA');return x;}need(typeof x==='object'&&!seen.has(x),'CROSSWORD85P_INPUT_PLAIN_DATA');need(Object.getOwnPropertySymbols(x).length===0,'CROSSWORD85P_INPUT_PLAIN_DATA');const proto=Object.getPrototypeOf(x);need(Array.isArray(x)||proto===Object.prototype||proto===null,'CROSSWORD85P_INPUT_PLAIN_DATA');seen.add(x);let out;if(Array.isArray(x)){const names=Object.getOwnPropertyNames(x);need(names.length===x.length+1&&names.includes('length')&&Array.from({length:x.length},(_,i)=>Object.hasOwn(x,i)).every(Boolean)&&names.every(k=>k==='length'||String(Number(k))===k&&Number(k)>=0&&Number(k)<x.length),'CROSSWORD85P_INPUT_DENSE_ARRAY');out=[];for(let i=0;i<x.length;i++){const d=Object.getOwnPropertyDescriptor(x,String(i));need(d&&Object.hasOwn(d,'value'),'CROSSWORD85P_INPUT_DATA_DESCRIPTOR');out.push(denseCopy(d.value,seen));}}else{out={};need(Object.getOwnPropertySymbols(x).length===0,'CROSSWORD85P_INPUT_PLAIN_DATA');for(const k of Object.getOwnPropertyNames(x)){const d=Object.getOwnPropertyDescriptor(x,k);need(d&&d.enumerable&&Object.hasOwn(d,'value'),'CROSSWORD85P_INPUT_DATA_DESCRIPTOR');Object.defineProperty(out,k,{value:denseCopy(d.value,seen),enumerable:true,writable:false,configurable:false});}}seen.delete(x);return Object.freeze(out);}
const outputs=Object.freeze(['placementTrajectory','placementGlyphs','placementLayoutsA','placementLayoutsB','placementLayoutsC','layoutDRecipe','layoutCRecipe','layoutBRecipe','layoutBEvaluationRange','placementAdaptiveTrial','layoutARecipe','layoutAHoldRange','placementSelectionOrigin']);
function project(plan,{phase='native',reservedBytes=0}={}){
 need(phase==='native'||phase==='working','CROSSWORD85P_INPUT_PHASE');need(Number.isSafeInteger(reservedBytes)&&reservedBytes>=0,'CROSSWORD85P_INPUT_RESERVED');
 // Copy/validate data before accessing any caller fields. Unknown fields survive.
 const copy=denseCopy(plan);need(Array.isArray(copy.cuts)&&copy.cuts.length===1,'CROSSWORD85P_INPUT_SINGLE_CUT');const cut=copy.cuts[0];
 need(cut.layout==='crossword'&&cut.area===null&&cut.contentScale===1&&cut.motionScale===1,'CROSSWORD85P_INPUT_NORMALIZED_NATIVE');
 need(!Object.hasOwn(copy,'placementFinalization')&&outputs.every(k=>!Object.hasOwn(cut,k)),'CROSSWORD85P_INPUT_OUTPUT_OR_FORGED_INPUT');
 if(phase==='working')need(cut.fullStagePlacement===true&&cut.placementUnits===true&&cut.placementLayoutsD===true,'CROSSWORD85P_INPUT_WORKING_STAGE');else need(['fullStagePlacement','placementUnits','placementLayoutsD'].every(k=>!Object.hasOwn(cut,k)),'CROSSWORD85P_INPUT_NATIVE_STAGE');
 const nativeCut={...cut};delete nativeCut.fullStagePlacement;delete nativeCut.placementUnits;delete nativeCut.placementLayoutsD;const native={...copy,cuts:[nativeCut]};
 const nativePlan=denseCopy(native),sourceKey=JSON.stringify(C.exact(nativePlan));
 // Conservative simultaneous serialized representations, including temporary key.
 const workingBytes=C.serializedBytes({plan,copy,native,nativePlan,sourceKey,phase,reservedBytes});
 need(reservedBytes+workingBytes<=8388608,'CROSSWORD85P_INPUT_WORKING_BUDGET');
 return Object.freeze({nativePlan,sourceKey,workingBytes,sourceOnly:true,authority:false});
}
Object.defineProperty(A,'crosswordFinalizerInput85p',{value:Object.freeze({project,sourceOnly:true,certificateIssuer:false})});})();
