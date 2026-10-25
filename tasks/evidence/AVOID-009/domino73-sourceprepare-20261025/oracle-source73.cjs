// Independent native closure, direct coordinate arguments only. Never uses overlay lease.
'use strict';
const {START,END}=require('/workspace/lyricfx.JIZURA/work/avoid009-domino73-isolated/overlay73.cjs');
function oracleAlias73(source){
 const start=source.indexOf("reg('dominoes', {",source.indexOf(START)),end=source.indexOf(END,start);let original=source.slice(start,end).trim();if(!original.endsWith('});'))throw Error('DOMINO73_ORACLE_BOUNDARY');
 let body=original.slice(0,-3).replace("reg('dominoes', {",'J.domino73Oracle = ({');
 const edits=[
 ['const yF = H / 2 + (r - (rows - 1) / 2) * (h + w * 0.35) + h / 2;','const yF = (H / 2 + (r - (rows - 1) / 2) * (h + w * 0.35) + h / 2) - 23;'],
 ['[[W / 2 - (cnt * (w + g)) / 2 - w * 0.4, yF], [W / 2 + (cnt * (w + g)) / 2 + w * 0.4, yF]]','[[(W / 2 - (cnt * (w + g)) / 2 - w * 0.4) + 17, yF], [(W / 2 + (cnt * (w + g)) / 2 + w * 0.4) + 17, yF]]'],
 ['const xc = W / 2 + (j - (cnt - 1) / 2) * (w + g);','const xc = (W / 2 + (j - (cnt - 1) / 2) * (w + g)) + 17;']];
 for(const [from,to]of edits){if(body.split(from).length!==2)throw Error('DOMINO73_ORACLE_EXACT');body=body.replace(from,to);}
 const alias=body+'}).render;\n';let inverse=body;for(const[from,to]of [...edits].reverse())inverse=inverse.replace(to,from);inverse=inverse.replace('J.domino73Oracle = ({',"reg('dominoes', {")+'});';if(inverse!==original)throw Error('DOMINO73_ORACLE_INVERSE');return alias;
}
module.exports={oracleAlias73};
