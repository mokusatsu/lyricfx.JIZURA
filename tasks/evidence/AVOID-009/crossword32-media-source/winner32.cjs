/* Closed terminal/parent selection contract. No browser, codec or automatic selection. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function readPin(ref){assert(ref&&typeof ref.path==='string');const b=fs.readFileSync(ref.path);assert.equal(b.length,ref.bytes);assert.equal(sha(b),ref.sha256);return JSON.parse(b);}
function validateSelection32(g,{manifest,host,checker,parent},policy){
 assert.equal(g.kind,'CROSSWORD32_FIXED_WINNER_MEDIA_GATE');assert.equal(g.accepted,true);assert.equal(g.archiveMode,'sites-source-pending');assert.match(g.source31Checkpoint,/^[0-9a-f]{40}$/);assert(g.source31Checkpoint.startsWith('7c08b89'));
 assert.equal(manifest.complete,true);assert.equal(host.complete,true);assert.equal(host.phase,'full');assert.equal(host.pilot.phase,'full');assert.equal(host.pilot.complete,true);assert.equal(checker.state,'PASS_SOURCE30_PILOT_EVIDENCE_ONLY');assert.equal(checker.phase,'full');assert.equal(parent.kind,'CROSSWORD31_FULL_PARENT_ACCEPTANCE');assert.equal(parent.accepted,true);
 for(const [k,ref]of[['producerManifestSHA256','manifest'],['hostReceiptSHA256','host'],['checkerReportSHA256','checker']])assert.equal(parent[k],g.fullEvidence[ref].sha256);
 assert.equal(parent.source31Checkpoint,g.source31Checkpoint);assert.deepEqual(parent.winner,g.selection);assert(g.selection&&host.pilot.winners.length>0,'NO_TERMINAL_WINNER_NO_MEDIA');const winner=host.pilot.winners.find(w=>w.id===g.selection.id);assert(winner,'EXACT_TERMINAL_WINNER_REQUIRED');assert.deepEqual(winner,g.selection);assert(winner.passed===true&&winner.witness===null&&winner.statesVisited===250&&winner.passesChecked===727);assert(checker.conditionalFullClockWinners.includes(winner.id));assert(policy.shapes.some(s=>JSON.stringify(s)===JSON.stringify(winner.shape)));assert(policy.circles.some(c=>JSON.stringify(c)===JSON.stringify(winner.circle)));assert.equal(winner.delta.length,2);assert(winner.delta.every(Number.isFinite));return winner;
}
function loadSelection32(g,policy){const e=g.fullEvidence;return validateSelection32(g,{manifest:readPin(e.manifest),host:readPin(e.host),checker:readPin(e.checker),parent:readPin(e.parent)},policy);}
module.exports={validateSelection32,loadSelection32};
