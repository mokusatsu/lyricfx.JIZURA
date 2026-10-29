'use strict';
// Local CDP metadata only. No evaluate/screenshot/media, native draw or fonts.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const response=await fetch('http://127.0.0.1:9333/json/list');assert(response.ok);const targets=await response.json();const pages=targets.filter(x=>x.type==='page');assert.equal(pages.length,3);const out=path.resolve(process.argv[2]);fs.mkdirSync(out);fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({complete:true,pages:3,scope:'local plain-page lifecycle; no media/render/frame acceptance'})+'\n');})().catch(e=>{process.stderr.write(e.name+': '+e.message+'\n');process.exitCode=1;});
