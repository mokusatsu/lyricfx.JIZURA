"use strict";
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const base = __dirname;
const sourcePath = process.argv[2] || '/workspace/lyricfx.JIZURA/src/11p_layoutsD.js';
const source = fs.readFileSync(sourcePath, 'utf8');
const start = source.indexOf("reg('burst', {");
const end = source.indexOf('/* ================================================================== 24 fisheye', start);
if (start < 0 || end < 0) throw Error('BURST74_SOURCE_BOUNDARY');
const native = source.slice(start,end);
const before = '    const cx = W / 2, cy = H / 2;';
const after = '    const burst74 = burst74Binding.offsetFor(env);\n    const cx = burst74 ? W / 2 + burst74.dx : W / 2, cy = burst74 ? H / 2 + burst74.dy : H / 2;';
if (native.split(before).length !== 2) throw Error('BURST74_CENTER_COUNT');
const patched = native.replace(before, after);
const whole = source.slice(0,start)+patched+source.slice(end);
const prefix = '(function(burst74Binding) {\n';
const suffix = '\n})\n';
const overlay = prefix+whole+suffix;
const inverse = overlay.slice(prefix.length,-suffix.length).replace(after,before);
if (inverse !== source) throw Error('BURST74_INVERSE');
const sha = x => crypto.createHash('sha256').update(x).digest('hex');
for (const [name,data] of Object.entries({'layoutsD.overlay.js':overlay,'burst.native.js':native,'burst.overlay.js':patched})) {
  fs.writeFileSync(path.join(base,name),data,{flag:'wx'});
}
const audit = {kind:'burst74-isolated-source-audit',sourcePath,sourceBytes:Buffer.byteLength(source),sourceSHA256:sha(source),overlayBytes:Buffer.byteLength(overlay),overlaySHA256:sha(overlay),inverseSHA256:sha(inverse),inverseExact:true,changes:['lexical harness binding wrapper','burst center declaration only'],noAdapterRegistration:true};
fs.writeFileSync(path.join(base,'source-audit.json'),JSON.stringify(audit,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(audit));
