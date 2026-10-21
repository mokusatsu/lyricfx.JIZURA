/* Functional media acceptance: reject unreadable media, false rate and missing faststart. */
'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict'),tool=require('./film-review.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'film-review-test-')),mp4=path.join(dir,'valid.mp4');
cp.execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i','testsrc2=size=96x64:rate=24','-t','0.5','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',mp4]);
assert.equal(tool.checkMP4(mp4,{duration:.5,frames:12}).probe.streams[0].width,96);
assert.throws(()=>tool.checkMP4(mp4,{fps:30}),/24 !== 30/);
assert.throws(()=>tool.checkMP4(mp4,{frames:11}),/intended frames/);
const broken=path.join(dir,'broken.mp4');fs.writeFileSync(broken,fs.readFileSync(mp4).subarray(0,100));assert.throws(()=>tool.checkMP4(broken));
const late=path.join(dir,'late-moov.mp4');cp.execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-i',mp4,'-c','copy',late]);assert.throws(()=>tool.checkMP4(late),/faststart/);
assert.equal(tool.cases().length,3);console.log(JSON.stringify({passed:true,checks:5,artifacts:dir}));
