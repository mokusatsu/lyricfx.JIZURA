'use strict';
const assert=require('node:assert/strict');
const START="reg('burst', {",END='/* ================================================================== 24 fisheye';
const before='    const cx = W / 2, cy = H / 2;';
const after='    const burst75 = burst75Binding.offsetFor(env);\n    const cx = burst75 ? W / 2 + burst75.dx : W / 2, cy = burst75 ? H / 2 + burst75.dy : H / 2;';
function prepare(source){
 const a=source.indexOf(START),b=source.indexOf(END,a);assert(a>=0&&b>a);const native=source.slice(a,b);assert.equal(native.split(before).length,2);
 const changed=native.replace(before,after),patched=source.slice(0,a)+changed+source.slice(b);assert.equal(patched.replace(changed,native),source);
 const original=native.trim();assert(original.endsWith('});'));const oracle=original.slice(0,-3).replace(START,'J.burst75Oracle = ({').replace(before,'    const cx = W / 2 + 17, cy = H / 2 + -23;')+'}).render;\n';
 const restored=oracle.replace('J.burst75Oracle = ({',START).replace('    const cx = W / 2 + 17, cy = H / 2 + -23;',before).replace(/\}\)\.render;\n$/,'});');assert.equal(restored,original);
 return {installer:'(function(burst75Binding){\n'+patched.replace(END,oracle+END)+'\n})',native,changed,oracle};
}
module.exports={prepare};
