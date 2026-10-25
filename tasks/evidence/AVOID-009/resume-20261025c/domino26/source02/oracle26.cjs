'use strict';
// The independent source closure changes ONLY its yF expression. No lease/runtime call.
const {START,END}=require('/workspace/lyricfx.JIZURA/work/avoid009-domino73-isolated/overlay73.cjs');
function oracle26(source){
 const a=source.indexOf("reg('dominoes', {",source.indexOf(START)),b=source.indexOf(END,a);
 if(a<0||b<a)throw Error('DOMINO26_ORACLE_BOUNDARY');
 const original=source.slice(a,b).trim(),from='const yF = H / 2 + (r - (rows - 1) / 2) * (h + w * 0.35) + h / 2;',to='const yF = (H / 2 + (r - (rows - 1) / 2) * (h + w * 0.35) + h / 2) + window.domino26OracleDY(r);';
 if(original.split(from).length!==2||!original.endsWith('});'))throw Error('DOMINO26_ORACLE_EXACT');
 const edited=original.replace(from,to);if(edited.replace(to,from)!==original)throw Error('DOMINO26_ORACLE_INVERSE');
 return edited.slice(0,-3).replace("reg('dominoes', {",'J.domino26Oracle = ({')+'}).render;\n';
}
module.exports={oracle26};
