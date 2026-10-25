'use strict';
const assert=require('node:assert/strict');
const START="reg('burst', {",END='/* ================================================================== 24 fisheye';
const T='    const text = brk(cut.text, port ? 4 : 6);';
const S='    const size = Math.min(J.fitSize(text, Pm.font, rxM * 1.08, ryM * 1.0, o), u * 0.24);';
const R='    const rx = Math.min(rxM, m.w / 2 / 0.54 + size * 0.15), ry = Math.min(ryM, Math.max(m.h / 2 / 0.54 + size * 0.15, rx * 0.55));';
const C='    const cx = W / 2, cy = H / 2;';
function prepare(source){
 const a=source.indexOf(START),b=source.indexOf(END,a);assert(a>=0&&b>a);const native=source.slice(a,b);for(const s of[T,S,R,C])assert.equal(native.split(s).length,2);
 const replacements=[
  [T,'    const burst26 = burst26Binding.recipeFor(env);\n    const nativeText26 = brk(cut.text, port ? 4 : 6);\n    const text = burst26?.shape ? burst26.shape.text : nativeText26;'],
  [S,'    const nativeSize26 = Math.min(J.fitSize(nativeText26, Pm.font, rxM * 1.08, ryM * 1.0, o), u * 0.24);\n    const size = burst26?.shape ? nativeSize26 * burst26.shape.fontRatio : nativeSize26;'],
  [R,'    const pad26 = burst26?.shape ? burst26.shape.padEm : 0.15;\n    const rx = Math.min(rxM, m.w / 2 / 0.54 + size * pad26), ry = Math.min(ryM, Math.max(m.h / 2 / 0.54 + size * pad26, rx * 0.55));'],
  [C,'    const cx = burst26 ? W / 2 + burst26.dx : W / 2, cy = burst26 ? H / 2 + burst26.dy : H / 2;']];
 let changed=native;for(const[x,y]of replacements)changed=changed.replace(x,y);let inverse=changed;for(const[x,y]of replacements)inverse=inverse.replace(y,x);assert.equal(inverse,native);
 // Independent oracle uses no private binding and separate declarations based on original source.
 let oracle=native.trim().slice(0,-3).replace(START,'J.burst26Oracle = ({');
 oracle=oracle.replace('  render(env) {','  render(env, reference26) {')
  .replace(T,'    const sourceText26 = brk(cut.text, port ? 4 : 6);\n    const text = reference26.shape === null ? sourceText26 : reference26.shape.text;')
  .replace(S,'    const sourceFontSize26 = Math.min(J.fitSize(sourceText26, Pm.font, rxM * 1.08, ryM * 1.0, o), u * 0.24);\n    const size = reference26.shape === null ? sourceFontSize26 : sourceFontSize26 * reference26.shape.fontRatio;')
  .replace(R,'    const inset26 = reference26.shape === null ? 0.15 : reference26.shape.padEm;\n    const rx = Math.min(rxM, m.w / 2 / 0.54 + size * inset26);\n    const ry = Math.min(ryM, Math.max(m.h / 2 / 0.54 + size * inset26, rx * 0.55));')
  .replace(C,'    const cx = reference26.dx === 0 ? W / 2 : W / 2 + reference26.dx;\n    const cy = reference26.dy === 0 ? H / 2 : H / 2 + reference26.dy;')+'}).render;\n';
 const original=native.trim().slice(0,-3).replace(START,'J.burst26Original = ({')+'}).render;\n';
 const patched=source.slice(0,a)+changed+source.slice(b);assert.equal(patched.replace(changed,native),source);
 return{installer:'(function(burst26Binding){\n'+patched.replace(END,original+oracle+END)+'\n})',native,changed,original,oracle};
}
module.exports={prepare};
