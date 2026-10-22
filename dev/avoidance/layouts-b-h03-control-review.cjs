/* Distinct H03 single-retention control native bundle. Capturing/publishing is a separate approval. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const T = require('./layouts-b-review.cjs');
const B = require('./layouts-b-pages-bridge.cjs');
const PROFILE = 'native-single-retention-v1';
const CLOCK = Object.freeze({absoluteStart: .5, absoluteEnd: 4.5, fps: 24, frames: 96, duration: 4});
const SIDES = ['before', 'after'];
const LINES = ['風の先へ', '光を越えて', '夢の続き'];
const SPECS = [['h03-rain-panL', 'rain', 'panL'], ['h03-bubbles-push', 'bubbles', 'push'], ['h03-credits-dutch', 'credits', 'dutch']];
const EXPECTED = [[0,0,'風の先へ',0,3.6,0,4],[1,0,'光を越えて',4.5,8,0,5],[2,0,'夢の続き',8,null,0,4]];
const SEEK = [.5,2.5,4,4.25,4,2.5,.5,4.25];
const STATUS = 'raw HTTP, UI, MP4 decoded seek/playback and native parity verified';
const BEFORE_SHA = 'a3c4d0e3c76994033910d61711180787576a0bec938d397da8425c37b8124ba7';
const CONTROL_METADATA_SHA='24358908cd3acc111ec684c7cb5aad5a982ee84ef7b6570a9ea5a4c7ae11887a';
const CONTROL_WINDOW_PROOF={kind:'distinct metadata02 control: four seconds one actual owner, native slotEnd inside window, two or more post-slot seeks, retained native lifetime beyond window; all actual cuts retained',range:[.5,4.5],seekTimes:[.5,2.5,4,4.25],seekActive:[.5,2.5,4,4.25].map(time=>({time,active:[0]})),postSlotSeekTimes:[4,4.25],postWindowRetention:5,cells:[{start:.5,end:3.6,active:[0],atStart:[0]},{start:3.6,end:4.5,active:[0],atStart:[0]}],intersectingIDs:[0],qualified:true,activeCut:{index:0,start:0,slotEnd:3.6,end:9.5,displayEnd:9.5}};
const json = value => JSON.stringify(value, null, 2) + '\n';
const bytes = file => fs.readFileSync(file);
const clone = value => structuredClone(value);
function identifier(value) { assert.equal(typeof value, 'string'); assert.match(value, /^[a-zA-Z0-9_-]+$/); return value; }
function hash(value) { assert.equal(typeof value, 'string'); assert.match(value, /^[a-f0-9]{64}$/); return value; }
function real(file, directory = false) {
  const absolute = path.resolve(file);
  assert.equal(fs.realpathSync(absolute), absolute, 'canonical real path; no symlink');
  assert.equal(fs.statSync(absolute).isDirectory(), directory);
  if (!directory) assert.ok(fs.statSync(absolute).isFile());
  return absolute;
}
function read(root, relative) { T.relative(relative); return bytes(real(path.join(root, relative))); }
function digestFile(file) { return T.sha(bytes(real(file))); }
function conditions(spec) {
  return {layout: spec[1], camera: spec[2], W: 3200, H: 1080, seed: 704,
    cx: .5, cy: .42, radius: .2, text: LINES.join('\n')};
}
function subset(ids) {
  assert.ok(Array.isArray(ids)); assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.ok(SPECS.some(s => s[0] === id));
  return ids.slice().sort();
}
function projectGuard(project,identity){
  assert.equal(project.seed,704);
  assert.equal(project.lyrics,'{\n[00:00.000]風の先へ\n[00:04.500]光を越えて\n[00:08.000]夢の続き\n}');
  assert.deepEqual(Object.keys(project.overrides).sort(),['0','1','2']);
  for(const override of Object.values(project.overrides)){assert.equal(override.single,true);if(identity)assert.deepEqual(override,{layout:identity.layout,cam:identity.cam,single:true,enter:'cut',exit:'cut',hold:'still',treat:'none',decor:[],bg:'none'});}
}
function nativeSourceGuard(initial){
  projectGuard(initial.project,initial.actualEffects[0]);
  assert.equal(initial.rawAllCuts.length,5);assert.equal(initial.rawAllEffects.length,5);assert.equal(initial.excludedNativeEffects.length,2);
  assert.deepEqual(initial.rawAllCuts.map(c=>c.index),[0,1,2,3,4]);assert.deepEqual(initial.rawAllEffects.map(c=>c.index),[0,1,2,3,4]);
  for(let n=0;n<3;n++){
    const c=initial.rawAllCuts[n],r=initial.rawLifetime[n];
    for(const [key,value]of Object.entries(r))assert.deepEqual(c[key],value,'raw native cut source clock');
    assert.deepEqual(c.params,initial.sourceParams[n].params);
    assert.equal(c.insertedAtPlayhead,false);
  }
  for(let n=0;n<2;n++){
    const c=initial.rawAllEffects[n+3],cut=initial.rawAllCuts[n+3];
    const expected={index:n+3,line:-2,part:'outro_'+(n+1),text:'',layout:'outro',cam:'push',enter:n?'cut':'blur',exit:n?'blur':'cut',hold:n?'still':'jitter',treat:'none',start:[9.5,10.75][n],end:[10.75,12][n]};
    for(const [key,value]of Object.entries(expected)){assert.deepEqual(c[key],value);assert.deepEqual(cut[key],value);}
    assert.equal(c.group??null,null);assert.equal(cut.group??null,null);
    assert.deepEqual(initial.excludedNativeEffects[n],c);
  }
  assert.deepEqual(initial.rawAllEffects.slice(0,3).map(({line,part,text,start,end,group,...e})=>e),initial.actualEffects);
}
function foregroundInputs(frame){
  const b=frame.layers.foreground.bounds;
  assert.ok(b.every(Number.isFinite)&&b[0]>=0&&b[1]>=0&&b[2]>=b[0]&&b[3]>=b[1]&&b[2]<3200&&b[3]<1080);
  for(const p of frame.observations.flatMap(o=>o.polygons||[]))assert.ok(Array.isArray(p)&&p.length>=3&&p.every(q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)));
}
function foregroundSupport(frame){
 const bounds=frame.layers.foreground.bounds,rect=[[bounds[0],bounds[1]],[bounds[2]+1,bounds[1]],[bounds[2]+1,bounds[3]+1],[bounds[0],bounds[3]+1]],polys=frame.observations.flatMap(o=>o.polygons||[]);
 const overlaps=(a,b)=>{for(const poly of [a,b])for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],axis=[q[1]-p[1],p[0]-q[0]];if(!axis.some(x=>x!==0))continue;const pa=a.map(v=>v[0]*axis[0]+v[1]*axis[1]),pb=b.map(v=>v[0]*axis[0]+v[1]*axis[1]);if(Math.max(...pa)<Math.min(...pb)||Math.max(...pb)<Math.min(...pa))return false;}return true;};
 const conflicting=polys.map((p,i)=>({index:i,overlap:overlaps(p,rect)})).filter(x=>x.overlap).map(x=>x.index);
 return {time:frame.time,measured:polys.length>0,basis:'actual foreground nonzero-alpha pixel AABB, expanded to pixel-cell exterior; conservative full-rectangle SAT against all actual primary support polygons including owned shapes',foregroundBounds:bounds,primarySupportCount:polys.length,conflicts:conflicting.length,conflictingPolygonIndices:conflicting};
}
function lifeGuard(initial, {focused = false} = {}) {
  assert.equal(initial.profile,PROFILE);assert.deepEqual(initial.controlWindowProof,CONTROL_WINDOW_PROOF);
  nativeSourceGuard(initial);
  assert.equal(initial.geometryLifetimeUnchanged, true);
  assert.deepEqual(initial.retainedCutIndices, [0, 1, 2]);
  assert.equal(initial.rawLifetime.length, 3, 'actual three single full-line cuts');
  assert.deepEqual(initial.rawLifetime.map(c => c.index), initial.retainedCutIndices);
  assert.deepEqual(initial.sourceParams.map(c => c.index), initial.retainedCutIndices);
  assert.equal(initial.sourceOccurrences.length, 3); assert.equal(initial.actualEffects.length, 3);
  for (const [index, c] of initial.rawLifetime.entries()) {
    const [line, part, text, start, slot, from, to] = EXPECTED[index];
    assert.equal(c.line, line); assert.equal(c.part, part); assert.equal(c.text, text);
    assert.ok(Math.abs(c.start - start) < 1e-9); assert.equal(c.renderStart, c.start);
    assert.ok(slot === null ? c.slotEnd == null : Math.abs(c.slotEnd - slot) < 1e-9);
    assert.equal(c.groupExit, 'cut'); assert.equal(c.groupOutDur, 0);
    assert.deepEqual(initial.sourceOccurrences[index], {index,line,part,text,source:LINES[line],ranges:[...text].map((ch,j)=>({ch,start:j,end:j+1}))});
    assert.equal(c.group, 0); assert.equal(c.end, 9.5); assert.equal(c.displayEnd, 9.5);
    assert.ok(Number.isFinite(c.start) && c.start >= 0 && c.start < 9.5);
    assert.equal(c.dur, 9.5 - c.start);
    assert.equal(typeof c.text, 'string'); assert.ok(c.text.length);
  }
  assert.ok(initial.rawLifetime.some(c => c.slotEnd < c.end));
  assert.equal(initial.cuts.length, 3);
  assert.deepEqual(initial.cuts.map(c=>c.index),initial.retainedCutIndices);
  assert.deepEqual(initial.actualEffects.map(c=>c.index),initial.retainedCutIndices);
  for (const c of initial.cuts) {
    const original = initial.sourceParams.find(p => p.index === c.index);
    assert.ok(original && original.params && Object.keys(original.params).length);
    assert.deepEqual(c.params, original.params, 'native params; no repeated layout planning');
    const raw = initial.rawLifetime.find(l => l.index === c.index);
    if (focused) {
      assert.equal(c.sourceParamsUnchanged, true); assert.equal(c.sourceStart, raw.start);
      for (const key of ['line','text','end','dur','slotEnd','displayEnd']) assert.deepEqual(c[key], raw[key]);
    } else for (const [k, v] of Object.entries(raw)) assert.deepEqual(c[k], v, 'original source lifetime field ' + k);
  }
  return initial;
}
function initialGuard(initial, c, side) {
  lifeGuard(initial);
  assert.deepEqual(initial.stage, [3200, 1080]); assert.deepEqual(initial.planStage, [3200, 1080]);
  assert.equal(initial.planDuration, 12);
  for (const effect of initial.actualEffects) assert.deepEqual(effect, {index: effect.index, layout: c.layout, cam: c.camera, enter: 'cut', exit: 'cut', hold: 'still', treat: 'none'});
  assert.deepEqual(initial.conditions, c);
  projectGuard(initial.project,initial.actualEffects[0]);
  assert.equal(initial.project.lyrics, '{\n[00:00.000]' + LINES[0] + '\n[00:04.500]' + LINES[1] + '\n[00:08.000]' + LINES[2] + '\n}');
  assert.deepEqual(initial.regions.map(r => ({center: r.center, radius: r.radius, start: r.start, end: r.end ?? 12})),
    [{center: {x: .5, y: .42}, radius: .2, start: 0, end: 12}]);
  assert.equal(initial.newAPI, side === 'after');
  assert.ok(initial.fontCoverage.length && initial.fontCoverage.every(f => f.missing.length === 0));
  assert.ok(initial.fontAudit?.faces?.length === 8 && initial.fontAudit.faces.every(f => f.status === 'loaded'));
  if (side === 'after') for (const cut of initial.cuts) {
    assert.equal(cut.safety, 'certified-bounded-adapter');
    assert.ok(cut.units.length > 0);
    for (const unit of cut.units) {
      assert.ok(unit.segments.length > 0);
      assert.ok(unit.segments.every(s => s.status === 'safe'));
    }
  } else for (const cut of initial.cuts) assert.equal(cut.area, null, 'full-stage original; no legacy shrink');
  return initial;
}
function frameGuard(f, initial, side, time) {
  assert.equal(f.time, time); hash(f.rgbaSHA256);
  const active = initial.rawLifetime.filter(c => (c.renderStart ?? c.start) <= time && time < (c.displayEnd ?? c.end)).map(c => c.index);
  assert.deepEqual(f.activeCuts, active, 'actual native retained-cut clock');
  assert.deepEqual(active,[0],'control window has exactly actual retained owner0');
  assert.ok(time>=CLOCK.absoluteStart&&time<CLOCK.absoluteEnd,'half-open control window');
  assert.equal(f.decoded.length, 2);
  for (const v of f.decoded) {
    assert.ok(v.readyState >= 2 && !v.seeking && v.prepareDidNotReseek);
    assert.deepEqual([v.width, v.height], [640, 360]);
    assert.equal(v.target, time, 'original media offset/time mapping');
    assert.ok(Math.abs(v.currentTime - v.target) <= 1/24 + 1e-6);
    assert.ok(Math.abs(v.proof.seekedAt - v.target) <= 1/24 + 1e-6);
    assert.ok(Math.abs(v.proof.decodedAfterSeek.mediaTime - v.target) <= 1/24 + 1e-6);
    assert.ok(Number.isFinite(v.proof.decodedAfterSeek.presentedFrames));
    assert.ok(['fresh-decoded-seek','reused-current-decoded-frame'].includes(v.kind));
    const w=v.witness;assert.ok(w&&Number.isInteger(w.epoch)&&w.epoch>=0&&Number.isInteger(w.seekCount)&&w.seekCount>=0);
    assert.equal(w.target,time);assert.equal(w.currentTime,v.currentTime);assert.equal(w.seekCount,v.seekCount);assert.equal(w.paused,true);assert.equal(w.seeking,false);assert.ok(w.readyState>=2);
    assert.equal(w.src,w.currentSrc);const sourceURL=new URL(w.src);assert.ok(['http:','https:'].includes(sourceURL.protocol)&&!sourceURL.username&&!sourceURL.password&&!sourceURL.search&&!sourceURL.hash);
  }
  for (const layer of ['media', 'foreground']) {
    hash(f.layers[layer].rgbaSHA256); assert.ok(f.layers[layer].pixels > 0);
    assert.ok(f.layers[layer].cut && f.layers[layer].bounds.length === 4);
  }
  assert.ok(f.emitted.length > 0);
  for (const item of f.emitted) {
    assert.ok(active.includes(item.cut)); assert.ok(item.glyphs.length > 0);
    if (side === 'after') {
      if (item.role !== 'primary') {
        assert.equal(item.role,'tiledAux');
        assert.equal(item.owner,'rain.background-grid');
        assert.equal(initial.actualEffects[item.cut].layout,'rain');
        continue;
      }
      if (item.source) {
        const source = item.source, cut = initial.rawLifetime.find(c => c.index === item.cut);
        const chars = Array.from(cut.text).filter(c => !/[\s\u200b]/.test(c));
        assert.ok(Number.isInteger(source.start) && Number.isInteger(source.end) && source.start >= 0 && source.end <= chars.length && source.end > source.start);
        assert.equal(source.text, chars.slice(source.start, source.end).join(''));
        assert.deepEqual(source.originalCodepointOffsets, Array.from({length:source.end-source.start},(_,n)=>source.start+n));
        assert.equal(source.text, String(item.text).replace(/[\s\u200b]/g, ''));
      } else {
        assert.ok(item.metadata?.id, 'after primary text has explicit source or metadata mapping');
        assert.equal(item.metadata.text,item.text);
        assert.equal(item.metadata.font,item.font);
      }
    }
  }
  if (side === 'after') {
    T.safeObservations(f.observations);
    foregroundInputs(f);const foreground=foregroundSupport(f);assert.deepEqual(f.foregroundClearance,foreground);assert.equal(foreground.measured,true);assert.equal(foreground.conflicts,0);
    assert.deepEqual([...new Set(f.observations.filter(o => o.pass === 'main').map(o => o.cut))].sort((a,b)=>a-b), active, 'every active primary cut has safety observation');
  }
  return f;
}
function placementSeedPresence(initial) {
  return Object.fromEntries(['media','foreground'].map(layer=>{
    assert.ok(initial[layer]&&Array.isArray(initial[layer].cuts),'explicit native media cuts');
    return [layer,initial[layer].cuts.map((cut,index)=>({index,
      state:!Object.hasOwn(cut,'placementSeed')?'absent':cut.placementSeed===undefined?'own-undefined':'own-value'}))];
  }));
}
function mediaForPairComparison(media) {
  // Copy every own descriptor and prototype; omit only the known optional field.
  // In particular, retain all other undefined fields and all finite/null seeds.
  const cuts=media.cuts.map(cut=>{
    const descriptors=Object.getOwnPropertyDescriptors(cut);
    if(Object.hasOwn(cut,'placementSeed')&&cut.placementSeed===undefined)delete descriptors.placementSeed;
    return Object.create(Object.getPrototypeOf(cut),descriptors);
  });
  const arrayDescriptors=Object.getOwnPropertyDescriptors(media.cuts);
  for(let i=0;i<cuts.length;i++)if(Object.hasOwn(arrayDescriptors,String(i)))arrayDescriptors[i].value=cuts[i];
  const preservedCuts=[];Object.setPrototypeOf(preservedCuts,Object.getPrototypeOf(media.cuts));
  Object.defineProperties(preservedCuts,arrayDescriptors);
  const descriptors=Object.getOwnPropertyDescriptors(media);
  descriptors.cuts={...descriptors.cuts,value:preservedCuts};
  return Object.create(Object.getPrototypeOf(media),descriptors);
}
function pairDifferences(presence) {
  const differences=[];
  for(const layer of ['media','foreground']){
    const a=presence.before[layer],b=presence.after[layer];assert.equal(a.length,b.length);
    for(let i=0;i<a.length;i++){
      assert.equal(a[i].index,i);assert.equal(b[i].index,i);
      for(const row of [a[i],b[i]])assert.ok(['absent','own-undefined','own-value'].includes(row.state));
      if(a[i].state===b[i].state)continue;
      assert.deepEqual([a[i].state,b[i].state].sort(),['absent','own-undefined']);
      differences.push({path:layer+'.cuts['+i+'].placementSeed',before:a[i].state,after:b[i].state});
    }
  }
  return differences;
}
function pairGuard(a, b) {
  for (const key of ['rawLifetime', 'sourceParams', 'sourceOccurrences', 'actualEffects', 'retainedCutIndices', 'media', 'foreground','profile','controlWindowProof','rawAllCuts','rawAllEffects','excludedNativeEffects']) {
    assert.notEqual(a[key], undefined, 'explicit proof field ' + key); assert.notEqual(b[key], undefined);
  }
  const presence={before:placementSeedPresence(a),after:placementSeedPresence(b)};
  for (const key of ['rawLifetime', 'sourceParams', 'sourceOccurrences', 'actualEffects', 'retainedCutIndices', 'media', 'foreground','profile','controlWindowProof','rawAllCuts','rawAllEffects','excludedNativeEffects']) {
    const media=key==='media'||key==='foreground';
    assert.deepEqual(media?mediaForPairComparison(a[key]):a[key],media?mediaForPairComparison(b[key]):b[key],'same native input '+key);
  }
  return {schema:'avoid007-h03-native-pair-equivalence-v1',completeRawSchemaIdentity:false,
    equivalence:'only-media-cut-own-undefined-placementSeed-vs-absent',presence,differences:pairDifferences(presence)};
}
function pairWitnessGuard(a,b,witness) {
  pairGuard(a,b);
  assert.equal(witness.schema,'avoid007-h03-native-pair-equivalence-v1');
  assert.equal(witness.completeRawSchemaIdentity,false);
  assert.equal(witness.equivalence,'only-media-cut-own-undefined-placementSeed-vs-absent');
  assert.deepEqual(Object.keys(witness.presence).sort(),['after','before']);
  for(const [side,initial]of [['before',a],['after',b]]){
    const parsed=placementSeedPresence(initial),raw=witness.presence[side];
    assert.deepEqual(Object.keys(raw).sort(),['foreground','media']);
    for(const layer of ['media','foreground']){
      assert.equal(raw[layer].length,parsed[layer].length);
      for(let i=0;i<raw[layer].length;i++){
        assert.equal(raw[layer][i].index,i);
        // JSON observation files lose undefined. The indexed witness seals that
        // exact raw presence fact at native acquisition, without inventing it.
        const expected=raw[layer][i].state==='own-undefined'?'absent':raw[layer][i].state;
        assert.equal(parsed[layer][i].state,expected);
      }
    }
  }
  assert.deepEqual(witness.differences,pairDifferences(witness.presence));
}
const SERIALIZED_OMISSIONS=[['rawLifetime',2,'slotEnd'],['rawAllEffects',3,'group'],['rawAllEffects',4,'group'],['excludedNativeEffects',0,'group'],['excludedNativeEffects',1,'group']];
function serializedInitialGuard(original,fresh) {
  lifeGuard(original);lifeGuard(fresh);assert.equal(EXPECTED[2][4],null);
  const descriptors=Object.getOwnPropertyDescriptors(fresh);
  for(const field of new Set(SERIALIZED_OMISSIONS.map(row=>row[0]))){
    const arrayDescriptors=Object.getOwnPropertyDescriptors(fresh[field]);
    for(const [name,index,key]of SERIALIZED_OMISSIONS.filter(row=>row[0]===field)){
      assert.equal(Object.hasOwn(original[name][index],key),false,'known JSON omission must be absent');
      assert.equal(Object.hasOwn(fresh[name][index],key),true,'native objectliteral must own undefined');
      assert.equal(fresh[name][index][key],undefined,'no value or null equivalence');
      const rowDescriptors=Object.getOwnPropertyDescriptors(fresh[name][index]);delete rowDescriptors[key];
      arrayDescriptors[index].value=Object.create(Object.getPrototypeOf(fresh[name][index]),rowDescriptors);
    }
    const rows=[];Object.setPrototypeOf(rows,Object.getPrototypeOf(fresh[field]));Object.defineProperties(rows,arrayDescriptors);
    descriptors[field].value=rows;
  }
  const comparable=Object.create(Object.getPrototypeOf(fresh),descriptors),media=pairGuard(original,comparable);
  return {schema:'avoid007-h03-control-serialized-initial-equivalence-v1',profile:PROFILE,completeRawSchemaIdentity:false,
    omissions:SERIALIZED_OMISSIONS.map(([field,index,key])=>({path:field+'['+index+'].'+key,serialized:'absent',fresh:'own-undefined',meaning:'native-unset'})),mediaDifferences:media.differences};
}
function serializationBoundaryGuard(boundary) {
  assert.equal(boundary?.schema,'avoid007-h03-control-serialized-initial-equivalence-v1');assert.equal(boundary.profile,PROFILE);
  assert.equal(boundary.completeRawSchemaIdentity,false);
  assert.deepEqual(boundary.omissions,SERIALIZED_OMISSIONS.map(([field,index,key])=>({path:field+'['+index+'].'+key,serialized:'absent',fresh:'own-undefined',meaning:'native-unset'})));
  assert.ok(Array.isArray(boundary.mediaDifferences));
}
function revisitGuard(frames) {
  const times = new Set(frames.map(f => f.time));
  assert.deepEqual([...times].sort((a,b) => a-b), [.5,2.5,4,4.25]);
  assert.ok(frames.some((f,i) => i > 0 && f.time < frames[i-1].time), 'reverse seek required');
  for (const time of times) {
    const repeated = frames.filter(f => f.time === time); assert.ok(repeated.length >= 2);
    assert.ok(repeated.every(f => f.rgbaSHA256 === repeated[0].rgbaSHA256));
  }
  for (const layer of ['media', 'foreground']) assert.equal(new Set(frames.map(f => f.layers[layer].rgbaSHA256)).size, 4, 'decoded media changes with source time');
}
function focusedRows(receipt, mainHash) {
  assert.equal(receipt.profile,PROFILE);assert.deepEqual(receipt.controlWindowProof,CONTROL_WINDOW_PROOF);
  assert.equal(receipt.mainBundle?.manifestSHA256, mainHash);
  assert.equal(receipt.endInputsUnchanged, true, 'completed focused receipt required');
  assert.deepEqual(receipt.warnings, []);
  assert.equal(receipt.rows.length, 3);
  assert.equal(receipt.negative?.length,6,'all case/side media perturbation negatives required');
  for(const spec of SPECS)for(const side of SIDES){
    const found=receipt.negative.filter(r=>r.spec?.layout===spec[1]&&r.spec?.camera===spec[2]&&r.side===side);
    assert.equal(found.length,1,'unique media perturbation negative');
    assert.equal(found[0].positionDetected,true);assert.equal(found[0].timeDetected,true);
  }
  const result = SPECS.map(spec => {
    const found = receipt.rows.filter(row => row.spec.layout === spec[1] && row.spec.camera === spec[2]);
    assert.equal(found.length, 1, 'all three focused outcomes exactly once');
    const row = found[0], status = row.engines.after.status;
    assert.equal(row.engines.before.status,'native-fullstage');
    assert.ok(['safe', 'insufficient', 'unsupported'].includes(status));
    const cuts=row.engines.after.initial.cuts;
    const allSafe=cuts.length===3&&cuts.every(c=>c.safety==='certified-bounded-adapter'&&c.units?.length>0&&c.units.every(u=>u.segments?.length>0&&u.segments.every(segment=>segment.status==='safe')));
    const circleStatus=allSafe?'safe':cuts.some(c=>c.safety==='unsupported')?'unsupported':'insufficient';
    assert.equal(row.engines.after.circleStatus,circleStatus);
    assert.deepEqual(row.engines.before.foregroundClearance,[],'before has no B support measurement');
    const foreground=row.engines.after.foregroundClearance;assert.equal(foreground.length,row.engines.after.frames.length);
    for(let n=0;n<foreground.length;n++){foregroundInputs(row.engines.after.frames[n]);assert.deepEqual(foreground[n],foregroundSupport(row.engines.after.frames[n]));}
    const actualStatus=circleStatus==='safe'&&foreground.every(f=>f.measured&&f.conflicts===0)?'safe':circleStatus==='unsupported'?'unsupported':'insufficient';
    assert.equal(status,actualStatus,'focused outcome derived from actual cut certificates');
    for (const side of SIDES) {
      const i = row.engines[side].initial;
      lifeGuard(i, {focused:true});
      assert.deepEqual(i.stage,[3200,1080]);
      assert.ok(i.fontCoverage.length && i.fontCoverage.every(f => f.missing.length === 0));
      if(side==='after'&&status==='safe')for(const cut of i.cuts){
        assert.equal(cut.safety,'certified-bounded-adapter');assert.ok(cut.units?.length>0);
        for(const unit of cut.units){assert.ok(unit.segments.length>0);assert.ok(unit.segments.every(s=>s.status==='safe'));}
      }
      assert.ok(i.fontAudit?.faces?.length === 8 && i.fontAudit.faces.every(f => f.status === 'loaded'));
      for (const e of i.actualEffects) assert.deepEqual(e, {index:e.index,layout:spec[1],cam:spec[2],enter:'cut',exit:'cut',hold:'still',treat:'none'});
      assert.equal(i.newAPI, side === 'after');
      const frames = row.engines[side].frames;
      revisitGuard(frames);
      for (const [n,f]of frames.entries())frameGuard(side==='after'?{...f,foregroundClearance:foreground[n]}:f,i,side==='after'&&status!=='safe'?'before':side,f.time);
    }
    pairGuard(row.engines.before.initial, row.engines.after.initial);
    for (let n = 0; n < row.engines.before.frames.length; n++) {
      const a = row.engines.before.frames[n], b = row.engines.after.frames[n]; assert.equal(a.time, b.time);
      for (const layer of ['media', 'foreground']) assert.deepEqual(a.layers[layer], b.layers[layer], 'focused media unchanged');
    }
    return {id: spec[0], hids: ['AVOID-007-H03'], conditions: conditions(spec), status};
  });
  return result;
}
function focusedInputGuard(receipt, mainBytes, main, fixtureSHA, reviewSHA, mediaSHA) {
  const pins=receipt.startup?.pins;
  assert.ok(Array.isArray(pins)&&pins.length>0,'focused prelaunch raw input pins required');
  assert.equal(new Set(pins.map(p=>p.file)).size,pins.length);
  for(const p of pins){T.relative(p.file);hash(p.sha256);assert.ok(Number.isSafeInteger(p.bytes)&&p.bytes>=0);}
  const hashes=new Set(pins.map(p=>p.sha256));
  const expected=[T.sha(mainBytes),CONTROL_METADATA_SHA,fixtureSHA,reviewSHA,...mediaSHA,
    ...Object.entries(main.assets).filter(([name])=>name.startsWith('sources/')||name.startsWith('fonts/')||name.startsWith('fixtures/')).map(([,h])=>h)];
  for(const h of expected)assert.ok(hashes.has(hash(h)),'focused receipt pins exact main/fixture/helper/media input');
}
function inputProbe(file) {
  const p = JSON.parse(cp.execFileSync('ffprobe', ['-v','error','-count_frames','-show_streams','-show_format','-of','json', file], {maxBuffer: 2e6}));
  assert.equal(p.streams.length, 1); const s = p.streams[0];
  assert.equal(s.codec_name, 'h264'); assert.deepEqual([s.width, s.height], [640, 360]);
  assert.equal(+s.nb_read_frames, 288); assert.equal(s.avg_frame_rate, '24/1');
  assert.ok(Math.abs(+s.duration - 12) < 1e-6); return {width: 640, height: 360, fps: 24, frames: 288, duration: 12};
}
function prepare(config) {
  assert.equal(config.profile,PROFILE);identifier(config.buildID); subset(config.approvedCaseIDs);
  const mainDir = real(config.mainBundleDir, true), root = real(config.root, true);
  const files = new Map(), pins = [];
  function pin(file, name) {
    file = real(file); const b = bytes(file), p = {file, name, sha256: T.sha(b), bytes: b.length}; pins.push(p); return b;
  }
  function copy(name, file) { T.relative(name); assert.ok(!files.has(name)); files.set(name, pin(file, name)); }
  const fixture = real(config.fixturePath || path.join(root, 'dev/avoidance/layouts-b-h03-control-fixture.js'));
  const receiptPath = real(config.focusedReceiptPath);
  pin(__filename,'tools/layouts-b-h03-control-review.cjs');
  pin(require.resolve('./layouts-b-review.cjs'),'tools/layouts-b-review.cjs');
  pin(require.resolve('./layouts-b-pages-bridge.cjs'),'tools/layouts-b-pages-bridge.cjs');
  pin(fixture,'fixtures/h03.js'); pin(receiptPath,'evidence/focused.json');
  assert.equal(config.media.length,2);
  for(const row of config.media)pin(row.path,'media/'+(row.layer==='media'?'background':'foreground')+'.mp4');
  const mainBytes = read(mainDir, 'manifest.json'), main = JSON.parse(mainBytes);
  for (const name of Object.keys(main.assets)) pin(path.join(mainDir, name), 'main/' + name);
  pin(path.join(mainDir, 'manifest.json'), 'main/manifest.json');
  T.validateFiles(mainDir); // All immutable main bytes/probes; not browser/capture.
  assert.notEqual(main.buildID, config.buildID);
  assert.equal(main.assets['sources/before/index.html'], BEFORE_SHA);
  assert.equal(digestFile(path.join(root, 'index.html')), main.assets['sources/after/index.html']);
  assert.equal(digestFile(path.join(root, 'en/index.html')), main.assets['sources/after/en/index.html']);
  const receiptBytes = bytes(receiptPath), focused = JSON.parse(receiptBytes);
  const cases = focusedRows(focused, T.sha(mainBytes));
  focusedInputGuard(focused,mainBytes,main,digestFile(fixture),digestFile(require.resolve('./layouts-b-review.cjs')),config.media.map(m=>m.sha256));
  const selected = new Set(config.approvedCaseIDs);
  for (const c of cases) if (selected.has(c.id)) assert.equal(c.status, 'safe', 'parent-approved safe subset only');
  assert.equal(config.media.length, 2);
  const media = ['media', 'foreground'].map(layer => {
    const records = config.media.filter(m => m.layer === layer); assert.equal(records.length, 1);
    const row = records[0], file = real(row.path); assert.equal(digestFile(file), hash(row.sha256));
    assert.equal(focused.media.filter(m => m.layer === layer && m.sha256 === row.sha256).length, 1, 'reuse focused input video raw bytes');
    return {layer, file, sha256: row.sha256, probe: inputProbe(file), path: 'media/' + (layer === 'media' ? 'background' : 'foreground') + '.mp4'};
  });
  const fontManifest = config.fontManifest || 'evidence/b-fonts-manifest.json';
  assert.ok(main.assets[fontManifest]); const fontBytes = read(mainDir, fontManifest), descriptor = JSON.parse(fontBytes);
  assert.deepEqual(descriptor.assignments, main.fixtureOptions.fonts.assignments);
  assert.deepEqual(descriptor.faces.map(f => [f.id, f.url, f.sourceSHA256]), main.fixtureOptions.fonts.faces.map(f => [f.id, f.url, f.sourceSHA256]));
  for (const name of Object.keys(main.assets).filter(n => n.startsWith('sources/') || n.startsWith('fonts/'))) copy(name, path.join(mainDir, name));
  copy('evidence/main-manifest.json', path.join(mainDir, 'manifest.json'));
  const metadata=real(config.metadataReceiptPath||path.join(root,'tasks/evidence/AVOID-007/h03-control-metadata02.json'));
  assert.equal(digestFile(metadata),CONTROL_METADATA_SHA);copy('evidence/control-metadata.json',metadata);
  copy('evidence/focused.json', receiptPath); copy('evidence/font-manifest.json', path.join(mainDir, fontManifest));
  copy('fixtures/fixture.js', path.join(mainDir, 'fixtures/fixture.js')); copy('fixtures/h03.js', fixture);
  for (const m of media) copy(m.path, m.file);
  copy('tools/layouts-b-h03-control-review.cjs', __filename);
  copy('tools/layouts-b-review.cjs', require.resolve('./layouts-b-review.cjs'));
  copy('tools/layouts-b-pages-bridge.cjs', require.resolve('./layouts-b-pages-bridge.cjs'));
  copy('browser.cjs', path.join(root, 'dev/browser.cjs'));
  for (const name of ['package.json', 'package-lock.json']) copy(name, path.join(root, 'dev', name));
  copy('runtime/playwright-package.json', require.resolve('playwright/package.json'));
  const sourceFiles = [];
  function walk(dir) { for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const file = path.join(dir, entry.name); if (entry.isDirectory()) walk(file); else if (entry.name.endsWith('.js')) sourceFiles.push(file);
  }}
  walk(path.join(root, 'src'));
  for (const file of [path.join(root, 'index.html'), path.join(root, 'en/index.html'), ...sourceFiles]) {
    const name = path.relative(root, file).split(path.sep).join('/');
    assert.equal(digestFile(file), main.assets['sources/after/' + name], 'new main source matches current frozen root'); pin(file, 'root/' + name);
  }
  unchanged(pins);
  return {main, mainBytes, cases, media, files, pins, fixtureOptions: clone(main.fixtureOptions)};
}
function unchanged(pins) { for (const p of pins) assert.equal(digestFile(p.file), p.sha256, 'all source/input bytes unchanged: ' + p.name); }

// Browser adapter uses the fixture API without altering plans/params/clocks.
async function runtimeInit(options) {
  if(options.profile!=="native-single-retention-v1")throw Error('Control profile mismatch');
  const fonts = structuredClone(options.fixtureOptions.fonts), base = options.baseURL;
  for (const face of fonts.faces) face.url = new URL(face.url, base).href;
  window.h03 = await runLayoutsBH03(J, {...options.conditions, fonts,
    mediaURLs: options.media.map(m => new URL(m.path, base).href), newPath: options.side === 'after'});
  const currentEffects=()=>h03.plan.cuts.map(c=>({index:c.index,layout:c.layout,cam:c.cam,enter:c.enter,exit:c.exit,hold:c.hold,treat:c.treat}));
  const expectedEffects=JSON.stringify(h03.actualEffects);
  if(JSON.stringify(currentEffects())!==expectedEffects)throw Error('H03 fixture altered native effect identities');
  const lifetimeKeys = Object.keys(h03.rawLifetime[0]);
  const currentCuts = () => h03.plan.cuts.map(c => ({...Object.fromEntries(lifetimeKeys.map(k => [k, c[k]])),
    area: c.area, params: c.params, safety: c.placementTrajectory?.safety || 'unsupported', units: c.placementTrajectory?.units || []}));
  const initial = {profile:h03.profile,controlWindowProof:h03.controlWindowProof,rawAllCuts:h03.rawAllCuts,rawAllEffects:h03.rawAllEffects,excludedNativeEffects:h03.excludedNativeEffects,conditions: options.conditions, stage: [h03.canvas.width, h03.canvas.height],
    planStage: [h03.plan.W,h03.plan.H], planDuration:h03.plan.duration,
    rawLifetime: h03.rawLifetime, sourceParams: h03.sourceParams, sourceOccurrences:h03.sourceOccurrences, actualEffects:h03.actualEffects, retainedCutIndices: h03.retainedCutIndices,
    geometryLifetimeUnchanged: h03.geometryLifetimeUnchanged, project: {seed: h03.project.seed, lyrics: h03.project.lyrics,overrides:h03.project.overrides},
    regions: h03.plan.lyricAvoidanceIndex.regions, cuts: currentCuts(), media: h03.plan.media, foreground: h03.plan.foreground,
    newAPI: !!J.placement?.layoutsB25, fontCoverage: h03.fontCoverage, fontAudit: h03.fonts};
  const pinned = JSON.stringify({cuts: currentCuts().map(({safety, units, ...c}) => c), retained: h03.retainedCutIndices, media: h03.plan.media, foreground: h03.plan.foreground});
  window.H03_FRAME = async time => {
    if(!Number.isFinite(time)||time<.5||time>=4.5)throw Error('Control time outside half-open capture window');
    const frame = await h03.frame(time);
    if(JSON.stringify(currentEffects())!==expectedEffects)throw Error('H03 fixture mutated native effects');
    const current = JSON.stringify({cuts: currentCuts().map(({safety, units, ...c}) => c), retained: h03.retainedCutIndices, media: h03.plan.media, foreground: h03.plan.foreground});
    if (current !== pinned) throw Error('H03 fixture mutated native clocks/params/media');
    return {...frame,foregroundClearance:options.side==='after'?window.H03_FOREGROUND(frame):null, after: options.side === 'after', png: h03.canvas.toDataURL('image/png')};
  };
  h03.canvas.style.cssText = 'display:block;max-width:100%;height:auto'; document.body.append(h03.canvas);
  return initial;
}
async function openFixture(browser, base, m, c, side, authorize) {
  const page = await browser.newPage({viewport: {width: 1100, height: 850}, deviceScaleFactor: 1});
  try {
    await T.isolate(page, base, authorize); await page.goto(new URL('fixtures/' + side + '-engine.html', base).href);
    for (const file of ['fixtures/fixture.js', 'fixtures/h03.js', 'seek.js', 'runtime.js']) await page.addScriptTag({url: new URL(file, base).href});
    const initial = await page.evaluate(options => window.H03_INIT(options), {profile:PROFILE,baseURL: base, conditions: c.conditions, side,
      fixtureOptions: m.fixtureOptions, media: m.inputMedia});
    initialGuard(initial, c.conditions, side); return {page, initial};
  } catch (error) { await page.close(); throw error; }
}
async function frame(page, time, initial, side) {
  const f = await page.evaluate(t => window.H03_FRAME(t), time); frameGuard(f, initial, side, time); return f;
}
function frameProof(f) { const {png, after, ...proof} = f; return proof; }
function mediaView(m,en=false) {
  return {...m, capture: {limitations: [en?'All three source cuts and their later clocks are retained; overlaps between later cuts are outside this window.':'元の全文3カットと後続時刻を保持します。後続カット同士の重なりは今回の範囲外です。']},
    cases: m.cases.filter(c => c.media).map(c => ({...c, ...Object.fromEntries(SIDES.map(side => [side, {...c.media[side], ...c.records[side]}]))}))};
}
function pageHTML(m, en = false) {
  const intro = en ? 'Single-retention control: 0.5–4.5 seconds follows one lyric from hold into its natural retained period. A safe result is a numerical circle-avoidance and foreground-support judgment; it does not mean the appearance passed. Videos show only selected examples that passed a separate visual review. Constraint insufficiency includes both diagnostics; unsupported or insufficient cases have no acquired MP4.' :
    '同じ歌詞の保持から自然な残留への0.5〜4.5秒を比較します。成立は円回避・前景支持の数値判定で、見え方の合格を意味しません。動画は別の視覚確認を通過した採用例のみです。制約不足には円回避と前景重なりの診断を含み、未成立・未対応の例の動画は取得しません。';
  const rows = m.cases.map(c => '<li' + (c.media ? '' : ' id="' + B.esc(c.id) + '"') + '>' + B.esc(c.id) + ': ' + B.esc(en?(c.status==='insufficient'?'constraint insufficiency':c.status):({safe:'成立',insufficient:'制約不足',unsupported:'未対応'})[c.status]) + ' / ' +
    (c.media ? (en ? 'MP4 acquired' : 'MP4取得済み') : (en ? 'No MP4 acquired: '+(c.status==='safe'?'not selected for this comparison':c.status==='insufficient'?'constraint insufficiency':'unsupported') : 'MP4未取得：'+(c.status==='safe'?'この比較では未採用':c.status==='insufficient'?'制約不足のため':'未対応のため'))) + '</li>').join('');
  return T.pageHTML(mediaView(m,en), en).replace('<body>', '<body><p>' + intro + '</p>')
    .replace('</body>', '<h2>' + (en ? 'All focused outcomes' : '全3件の診断結果') + '</h2><ul>' + rows + '</ul></body>');
}
function liveControls() {
  (async () => {
    const m = await (await fetch('manifest.json')).json(), cases = m.cases.filter(c => c.media);
    const baseURL = new URL('.', location.href).href, select = document.querySelector('#case'), side = document.querySelector('#side');
    for (const c of cases) select.add(new Option(c.id, c.id));
    if (cases.some(c => c.id === new URL(location.href).searchParams.get('case'))) select.value = new URL(location.href).searchParams.get('case');
    const iframe = document.querySelector('iframe'), output = document.querySelector('output');
    let chain = Promise.resolve();
    async function seek(time) {
      const f = await iframe.contentWindow.H03_FRAME(time); const {png, ...proof} = f;
      window.h03LastFrame = proof; output.textContent = Number(time).toFixed(3);
      document.querySelector('#absolute').value = time;
    }
    async function init() {
      output.textContent = '';
      await new Promise((resolve, reject) => { iframe.onload = resolve; iframe.onerror = reject; iframe.src = new URL('fixtures/' + side.value + '-engine.html', baseURL).href; });
      const w = iframe.contentWindow;
      for (const file of ['fixtures/fixture.js', 'fixtures/h03.js', 'seek.js', 'runtime.js']) await new Promise((resolve, reject) => {
        const s = w.document.createElement('script'); s.src = new URL(file, baseURL).href; s.onload = resolve; s.onerror = reject; w.document.head.append(s);
      });
      const c = cases.find(c => c.id === select.value);
      window.h03LastInitial = await w.H03_INIT({profile:m.profile,baseURL, conditions: c.conditions, side: side.value, fixtureOptions: m.fixtureOptions, media: m.inputMedia});
      document.body.dataset.fixtureSide = side.value; await seek(2.0);
    }
    const queue = fn => { chain = chain.then(fn).catch(() => { output.textContent = 'Fixture failed'; document.body.dataset.fixtureError = 'true'; }); };
    select.onchange = side.onchange = () => queue(init);
    document.querySelector('#absolute').onchange = e => queue(() => seek(Number(e.target.value)));
    document.querySelector('#frame').oninput = e => queue(() => seek(.5 + Number(e.target.value)/24));
    for (const button of document.querySelectorAll('[data-seek]')) button.onclick = () => queue(() => seek(Number(button.dataset.seek)));
    if (cases.length) queue(init); else output.textContent = 'No approved MP4 cases';
  })();
}
function liveHTML() {
  return '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>H03 live / 操作</title><body><a href="index.html">比較 / Comparison</a><label>Case <select id="case"></select></label><label>Side <select id="side"><option>before</option><option selected>after</option></select></label><label>Scene time / シーン時刻 (0.5 ≤ t &lt; 4.5s) <input id="absolute" type="number" min="0.5" max="4.458333333333333" step="0.0416666666666667" value="2.0"></label><label>Clip frame / 比較コマ <input id="frame" type="range" min="0" max="95" value="36"></label>' +
    [.5,2.5,4,4.25].map(t => '<button data-seek="' + t + '">' + t + 's</button>').join('') + '<output role="status"></output><iframe title="H03 native Canvas" style="width:100%;height:75vh;border:0"></iframe><script src="live.js"></script></body>\n';
}
async function capture(config, dir, {browser: provided} = {}) {
  assert.ok(!fs.existsSync(dir), 'fresh immutable directory');
  const prepared = prepare(config), {main, mainBytes, cases, files, pins} = prepared;
  const m = {profile:PROFILE,controlWindowProof:clone(CONTROL_WINDOW_PROOF),controlMetadata:{path:'evidence/control-metadata.json',sha256:CONTROL_METADATA_SHA},schema: 'avoid007-h03-native-v1', taskID: 'AVOID-007', buildID: config.buildID, baseline: T.BASE,
    mainBundle: {manifestSHA256: T.sha(mainBytes)}, sources: {
      before: {html: 'sources/before/index.html', sha256: main.assets['sources/before/index.html']},
      after: {html: 'sources/after/index.html', sha256: main.assets['sources/after/index.html']},
      products: {jaSHA256: main.assets['sources/after/index.html'], enSHA256: main.assets['sources/after/en/index.html'], en: 'sources/after/en/index.html'}},
    fontManifest: {path: 'evidence/font-manifest.json', sha256: T.sha(files.get('evidence/font-manifest.json'))},
    focusedReceipt: {path: 'evidence/focused.json', sha256: T.sha(files.get('evidence/focused.json'))},
    fonts: main.fixtureOptions.fonts.faces.map(f => ({path: f.url, sha256: f.sourceSHA256})), fixtureOptions: prepared.fixtureOptions,
    capture: {...CLOCK}, nativeCapture: {keyFrames: T.KEYS, method: 'native Canvas PNG -> direct ffmpeg stdin; H264 threads1; no screen recording/transcode', frameOptions: {noHud: true, noPost: true}},
    inputMedia: prepared.media.map(({file, ...m}) => m), cases, assets: {}};
  fs.mkdirSync(dir, {recursive: true});
  function add(name, b) { T.relative(name); assert.ok(!m.assets[name]); fs.mkdirSync(path.dirname(path.join(dir, name)), {recursive: true}); fs.writeFileSync(path.join(dir, name), b, {flag: 'wx'}); m.assets[name] = T.sha(b); }
  for (const [name, b] of files) add(name, b);
  for (const side of SIDES) add('fixtures/' + side + '-engine.html', T.normalize(files.get('sources/' + side + '/index.html')));
  add('seek.js', Buffer.from('window.seekDecodedFrame=' + T.seekDecodedFrame.toString() + ';\n'));
  add('runtime.js', Buffer.from('window.H03_FOREGROUND='+foregroundSupport.toString()+';\nwindow.H03_INIT=' + runtimeInit.toString() + ';\n'));
  add('config.json', Buffer.from(json({profile:PROFILE,buildID: config.buildID, approvedCaseIDs: subset(config.approvedCaseIDs), mainManifestSHA256: T.sha(mainBytes), conditions: cases.map(c => c.conditions)})));
  add('startup.json', Buffer.from(json({inputs: pins.map(({file, ...p}) => p), assets: clone(m.assets)})));
  unchanged(pins);
  const selected = new Set(config.approvedCaseIDs), local = selected.size ? await T.serve(dir) : null;
  let browser = provided;
  try {
    if (selected.size) browser ||= await require('../browser.cjs').launch();
    for (const c of cases.filter(c => selected.has(c.id))) {
      c.media = {}; c.records = {}; const pair = {}, proofs = {};
      for (const side of SIDES) {
        const {page, initial} = await openFixture(browser, local.baseURL, m, c, side);
        try {
          pair[side] = initial;
          if (side === 'after') {
            const witness=pairGuard(pair.before,initial),name=`observations/${c.id}-pair-equivalence.json`;
            add(name,Buffer.from(json(witness)));c.pairEquivalence={path:name,sha256:m.assets[name]};
          }
          const initialPath = `observations/${c.id}-${side}-initial.json`, framePath = `observations/${c.id}-${side}-frames.json`, video = `videos/${c.id}-${side}.mp4`;
          add(initialPath, Buffer.from(json(initial))); fs.mkdirSync(path.dirname(path.join(dir, video)), {recursive: true});
          const observed = [];
          const encoded = await T.encodeFrames(path.join(dir, video), 3200, 1080, async n => {
            const f = await frame(page, CLOCK.absoluteStart + n/24, initial, side);
            if (side === 'after') for (const layer of ['media', 'foreground']) assert.deepEqual(f.layers[layer], proofs.before[n].layers[layer], 'native B does not move/retime media');
            observed.push(frameProof(f)); return f;
          }, (n, png) => add(`images/${c.id}-${side}-${n}.png`, png));
          proofs[side] = observed;
          const records = encoded.frames.map((r, n) => ({...r, absoluteTime: CLOCK.absoluteStart + n/24, proof: observed[n]}));
          add(framePath, Buffer.from(json(records))); m.assets[video] = digestFile(path.join(dir, video));
          c.media[side] = {video, keyImages: T.KEYS.map(n => `images/${c.id}-${side}-${n}.png`)};
          c.records[side] = {initial: initialPath, frames: framePath, probe: encoded.probe, encoderArgs: encoded.encoderArgs,
            codecQuality: T.codecQuality(path.join(dir, video), T.KEYS.map(n => ({frame: n, file: path.join(dir, `images/${c.id}-${side}-${n}.png`)})))};
        } finally { await page.close(); }
      }
    }
    for (const en of [false, true]) add(en ? 'en.html' : 'index.html', Buffer.from(pageHTML(m, en)));
    add('controls.js', Buffer.from('(' + T.controls.toString() + ')();'));
    add('live.html', Buffer.from(liveHTML())); add('live.js', Buffer.from('(' + liveControls.toString() + ')();'));
    unchanged(pins); m.endCheck = {allInputsUnchanged: true};
    m.status = selected.size ? 'native media acquired; browser/public verification separate' : 'diagnostic-only-no-approved-media';
    fs.writeFileSync(path.join(dir, 'manifest.json'), json(m), {flag: 'wx'});
    validateFiles(dir); return {manifestSHA256: digestFile(path.join(dir, 'manifest.json')), acquired: selected.size, status: m.status};
  } finally { try { if (browser && !provided) await browser.close(); } finally { if (local) await new Promise(r => local.server.close(r)); unchanged(pins); } }
}
function allFiles(dir) {
  const result = [];
  function walk(at) { for (const entry of fs.readdirSync(at, {withFileTypes: true})) {
    const file = path.join(at, entry.name); assert.ok(!entry.isSymbolicLink());
    if (entry.isDirectory()) walk(file); else { real(file); result.push(path.relative(dir, file).split(path.sep).join('/')); }
  }} walk(dir); return result.sort();
}
function validateFiles(dir) {
  dir = real(dir, true); const raw = read(dir, 'manifest.json'), m = JSON.parse(raw);
  assert.equal(m.profile,PROFILE);assert.deepEqual(m.controlWindowProof,CONTROL_WINDOW_PROOF);
  assert.equal(m.schema, 'avoid007-h03-native-v1'); assert.equal(m.taskID, 'AVOID-007');
  assert.equal(m.baseline, T.BASE); identifier(m.buildID); assert.deepEqual(m.capture, CLOCK);
  assert.equal(m.endCheck?.allInputsUnchanged, true);
  assert.deepEqual(allFiles(dir), ['manifest.json', ...Object.keys(m.assets)].sort(), 'exact local asset closure');
  for (const [name, h] of Object.entries(m.assets)) assert.equal(T.sha(read(dir, name)), hash(h), 'raw asset hash ' + name);
  const required = name => { assert.ok(m.assets[name], 'required indexed asset ' + name); return read(dir, name); };
  const mainBytes = required('evidence/main-manifest.json'), main = JSON.parse(mainBytes);
  assert.equal(T.sha(mainBytes), m.mainBundle.manifestSHA256);
  assert.equal(main.assets['sources/before/index.html'], BEFORE_SHA);
  assert.equal(m.sources.before.sha256, BEFORE_SHA);
  for (const side of SIDES) {
    assert.equal(m.sources[side].sha256, m.assets[m.sources[side].html]);
    assert.equal(m.sources[side].sha256, main.assets['sources/' + side + '/index.html']);
    assert.ok(T.normalize(required(m.sources[side].html)).equals(required('fixtures/' + side + '-engine.html')));
  }
  assert.equal(m.sources.products.jaSHA256, m.sources.after.sha256);
  assert.equal(m.sources.products.enSHA256, main.assets['sources/after/en/index.html']);
  assert.equal(m.sources.products.enSHA256, m.assets[m.sources.products.en]);
  const focused=JSON.parse(required(m.focusedReceipt.path));
  const outcomes = focusedRows(focused, m.mainBundle.manifestSHA256);
  focusedInputGuard(focused,mainBytes,main,m.assets['fixtures/h03.js'],m.assets['tools/layouts-b-review.cjs'],m.inputMedia.map(row=>row.sha256));
  assert.deepEqual(m.cases.map(({media, records, pairEquivalence, ...c}) => c), outcomes);
  assert.equal(m.focusedReceipt.sha256, m.assets[m.focusedReceipt.path]);
  assert.equal(m.fontManifest.sha256, m.assets[m.fontManifest.path]);
  assert.deepEqual(m.fixtureOptions.fonts, main.fixtureOptions.fonts);
  assert.equal(m.fonts.length, 8);
  for (const f of m.fonts) assert.equal(m.assets[f.path], f.sha256);
  const acquired = m.cases.filter(c => c.media);
  const config = JSON.parse(required('config.json'));
  assert.equal(config.profile,PROFILE);assert.equal(config.buildID,m.buildID);
  assert.deepEqual(m.controlMetadata,{path:'evidence/control-metadata.json',sha256:CONTROL_METADATA_SHA});assert.equal(m.assets[m.controlMetadata.path],CONTROL_METADATA_SHA);
  assert.equal(config.mainManifestSHA256,m.mainBundle.manifestSHA256);
  assert.deepEqual(config.conditions,m.cases.map(c=>c.conditions));
  assert.deepEqual(subset(config.approvedCaseIDs),acquired.map(c=>c.id).sort());
  for(const c of m.cases)if(!c.media){assert.equal(c.records,undefined);assert.equal(c.pairEquivalence,undefined);}
  assert.deepEqual(m.nativeCapture.keyFrames,T.KEYS);assert.deepEqual(m.nativeCapture.frameOptions,{noHud:true,noPost:true});
  const startup=JSON.parse(required('startup.json'));
  for(const [name,h]of Object.entries(startup.assets))assert.equal(m.assets[name],h,'copied startup bytes');
  for(const p of startup.inputs){
    hash(p.sha256);assert.ok(Number.isSafeInteger(p.bytes)&&p.bytes>=0);
    const expected=p.name==='main/manifest.json'?m.mainBundle.manifestSHA256:p.name.startsWith('main/')?main.assets[p.name.slice(5)]:p.name.startsWith('root/')?main.assets['sources/after/'+p.name.slice(5)]:m.assets[p.name];
    assert.equal(p.sha256,expected,'startup input identity '+p.name);
  }
  linkageGuard(mainBytes,raw);
  if (!acquired.length) assert.equal(m.status, 'diagnostic-only-no-approved-media');
  for (const input of m.inputMedia) { assert.equal(m.assets[input.path], input.sha256); assert.deepEqual(inputProbe(path.join(dir, input.path)), input.probe); }
  assert.equal(m.inputMedia.length, 2);
  assert.deepEqual(m.inputMedia.map(row=>row.layer).sort(),['foreground','media']);
  assert.equal(new Set(m.inputMedia.map(row=>row.path)).size,2);
  for(const input of m.inputMedia){
    assert.equal(input.path,'media/'+(input.layer==='media'?'background':'foreground')+'.mp4');
    assert.equal(focused.media.filter(row=>row.layer===input.layer&&row.sha256===input.sha256).length,1,'original focused input bytes');
  }
  for (const name of ['tools/layouts-b-h03-control-review.cjs', 'tools/layouts-b-review.cjs', 'tools/layouts-b-pages-bridge.cjs', 'browser.cjs', 'fixtures/fixture.js', 'fixtures/h03.js', 'config.json', 'startup.json', 'package.json', 'package-lock.json', 'runtime/playwright-package.json']) required(name);
  for (const c of acquired) {
    const pair = {}, sideFrames = {};
    for (const side of SIDES) {
      const record = c.records[side], initial = JSON.parse(required(record.initial)); pair[side] = initial;
      initialGuard(initial, c.conditions, side);
      const frames = JSON.parse(required(record.frames)); assert.equal(frames.length, 96); sideFrames[side] = frames;
      for (const [n, f] of frames.entries()) {
        assert.deepEqual([f.width,f.height],[3200,1080]);assert.ok(Number.isSafeInteger(f.bytes)&&f.bytes>24);
        assert.equal(f.frame, n); assert.equal(f.time, n/24); assert.equal(f.absoluteTime, CLOCK.absoluteStart + n/24);
        frameGuard(f.proof, initial, side, f.absoluteTime); assert.equal(f.rgbaSHA256, f.proof.rgbaSHA256); hash(f.sha256);
        if (side === 'after') T.safeObservations(f.safetyAudit);
        if (T.KEYS.includes(n)) {
          const image = `images/${c.id}-${side}-${n}.png`, p = T.pngRecord(required(image), f.rgbaSHA256, 3200, 1080);
          for (const k of ['sha256', 'rgbaSHA256', 'width', 'height', 'bytes']) assert.deepEqual(p[k], f[k]);
          assert.ok(c.media[side].keyImages.includes(image));
        }
      }
      assert.deepEqual(T.probe(path.join(dir, c.media[side].video), 3200, 1080), record.probe);
      assert.deepEqual(record.encoderArgs, T.encodeArgs('<output.mp4>'));
      assert.deepEqual(T.codecQuality(path.join(dir, c.media[side].video), T.KEYS.map(n => ({frame: n, file: path.join(dir, `images/${c.id}-${side}-${n}.png`)}))), record.codecQuality);
    }
    assert.equal(c.pairEquivalence.path,`observations/${c.id}-pair-equivalence.json`);
    assert.equal(c.pairEquivalence.sha256,m.assets[c.pairEquivalence.path]);
    pairWitnessGuard(pair.before,pair.after,JSON.parse(required(c.pairEquivalence.path)));
    for (let n = 0; n < 96; n++) for (const layer of ['media', 'foreground']) assert.deepEqual(sideFrames.before[n].proof.layers[layer], sideFrames.after[n].proof.layers[layer]);
  }
  for (const en of [false, true]) assert.equal(required(en ? 'en.html' : 'index.html').toString(), pageHTML(m, en));
  assert.equal(required('controls.js').toString(), '(' + T.controls.toString() + ')();');
  assert.equal(required('seek.js').toString(), 'window.seekDecodedFrame=' + T.seekDecodedFrame.toString() + ';\n');
  assert.equal(required('runtime.js').toString(), 'window.H03_FOREGROUND='+foregroundSupport.toString()+';\nwindow.H03_INIT=' + runtimeInit.toString() + ';\n');
  assert.equal(required('live.js').toString(), '(' + liveControls.toString() + ')();'); assert.equal(required('live.html').toString(), liveHTML());
  return {manifest: m, manifestSHA256: T.sha(raw), acquired: acquired.length, status: acquired.length ? 'files verified; browser/public checks separate' : 'diagnostic-only-no-approved-media'};
}
function linkageGuard(mainBytes,raw){
  const main=JSON.parse(mainBytes),m=JSON.parse(raw);
  assert.equal(m.profile,PROFILE);assert.deepEqual(m.controlWindowProof,CONTROL_WINDOW_PROOF);
  assert.deepEqual(m.controlMetadata,{path:'evidence/control-metadata.json',sha256:CONTROL_METADATA_SHA});assert.equal(m.assets[m.controlMetadata.path],CONTROL_METADATA_SHA);
  assert.equal(m.schema,'avoid007-h03-native-v1');assert.equal(m.taskID,'AVOID-007');assert.equal(m.baseline,T.BASE);
  assert.equal(m.mainBundle.manifestSHA256,T.sha(mainBytes));assert.deepEqual(m.capture,CLOCK);identifier(m.buildID);assert.notEqual(m.buildID,main.buildID);
  assert.equal(m.sources.before.sha256,BEFORE_SHA);
  for(const side of SIDES){const name='sources/'+side+'/index.html';assert.equal(m.sources[side].html,name);assert.equal(m.assets[name],m.sources[side].sha256);assert.equal(m.assets[name],main.assets[name]);}
  assert.equal(m.sources.products.en,'sources/after/en/index.html');
  assert.equal(m.sources.products.jaSHA256,m.sources.after.sha256);assert.equal(m.sources.products.enSHA256,main.assets[m.sources.products.en]);assert.equal(m.assets[m.sources.products.en],m.sources.products.enSHA256);
  assert.deepEqual(m.cases.map(c=>c.id).sort(),SPECS.map(s=>s[0]).sort());
  for(const c of m.cases){const spec=SPECS.find(s=>s[0]===c.id);assert.deepEqual(c.conditions,conditions(spec));assert.deepEqual(c.hids,['AVOID-007-H03']);assert.ok(['safe','insufficient','unsupported'].includes(c.status));}
  assert.deepEqual(m.fixtureOptions.fonts,main.fixtureOptions.fonts);assert.equal(m.fonts.length,8);
  assert.deepEqual(m.fonts,main.fixtureOptions.fonts.faces.map(f=>({path:f.url,sha256:f.sourceSHA256})));
  for(const name of Object.keys(main.assets).filter(n=>n.startsWith('sources/')||n.startsWith('fonts/')))assert.equal(m.assets[name],main.assets[name]);
  for(const ref of [m.fontManifest,m.focusedReceipt])assert.equal(m.assets[ref.path],hash(ref.sha256));
  const acquired=m.cases.filter(c=>c.media);
  if(acquired.length)B.verifyH03Linkage(mainBytes,raw,acquired.map(c=>c.id));else assert.equal(m.status,'diagnostic-only-no-approved-media');
  return acquired;
}
// Qualified main playback body: only its timeout changes for 12-second inputs.
const inputPlaybackSource=T.playNativeVideo.toString();
assert.equal(inputPlaybackSource.split("'timeout'),12000)").length,2,'one qualified timeout');
const playInputVideo=(0,eval)('('+inputPlaybackSource.replace("'timeout'),12000)","'timeout'),30000)")+')');
async function pauseInputVideo(v,seek){
  const decoded=await seek(v,.5),startTime=v.currentTime,deadline=performance.now()+10000;
  try{
    await v.play();
    while(v.paused||v.readyState<2||v.currentTime-startTime<1/24){
      if(v.error||v.ended||performance.now()>=deadline)throw Error('Input pause playback did not advance');
      await new Promise(resolve=>setTimeout(resolve,25));
    }
    if(v.ended)throw Error('Input pause cannot be tested at end');
    const playedTime=v.currentTime,playing=!v.paused;
    v.pause();const pausedTime=v.currentTime,began=performance.now();
    await new Promise(resolve=>setTimeout(resolve,125));
    return {seek:decoded,startTime,playedTime,playing,pausedTime,afterWaitTime:v.currentTime,
      waitMs:performance.now()-began,paused:v.paused,ended:v.ended};
  }finally{v.pause();}
}
function inputPlaybackGuard(row){
  const p=row.playback;
  assert.equal(p.failure,undefined);assert.equal(p.ended,true);
  assert.ok(p.decoded>=284);assert.ok(Math.abs(p.currentTime-12)<1/24);
  assert.equal(p.dropped,0);assert.equal(p.corrupt,0);
  assert.ok(Math.abs(p.startFrame.seekedAt)<=1/24+1e-6);
  assert.ok(Math.abs(p.startFrame.decodedAfterSeek.mediaTime)<=1/24+1e-6);
  assert.equal(row.duration,12);assert.equal(row.frames,288);assert.equal(row.fps,24);
  const pause=row.pause;
  assert.equal(pause?.paused,true);assert.equal(pause.ended,false);assert.equal(pause.playing,true);
  assert.ok(Math.abs(pause.seek.seekedAt-.5)<=1/24+1e-6);
  assert.ok(Math.abs(pause.seek.decodedAfterSeek.mediaTime-.5)<=1/24+1e-6);
  assert.ok(Math.abs(pause.startTime-.5)<=1/24+1e-6);
  assert.ok(pause.playedTime-pause.startTime>=1/24);
  assert.ok(pause.pausedTime>=pause.playedTime&&pause.pausedTime<12-1/24);
  assert.ok(pause.waitMs>=100&&Number.isFinite(pause.waitMs));
  assert.ok(Math.abs(pause.afterWaitTime-pause.pausedTime)<=1e-6);
  assert.equal(row.seeks.length,3);
  for(const [n,target]of [.5,6.5,11.5].entries()){
    assert.ok(Math.abs(row.seeks[n].seekedAt-target)<=1/24+1e-6);
    assert.ok(Math.abs(row.seeks[n].decodedAfterSeek.mediaTime-target)<=1/24+1e-6);
  }
}
async function waitPairPlayback(videos){
  if(videos.length!==2)throw Error('Expected before/after video pair');
  const start=videos.map(v=>v.currentTime),deadline=performance.now()+10000;
  while(true){
    if(videos.some(v=>v.error))throw Error('Review pair playback failed');
    const rows=videos.map((v,n)=>({start:start[n],currentTime:v.currentTime,readyState:v.readyState,paused:v.paused,ended:v.ended}));
    if(rows.every(r=>!r.paused&&!r.ended&&r.readyState>=2&&r.currentTime-r.start>=1/24))return rows;
    if(performance.now()>=deadline)throw Error('Review pair did not progress');
    await new Promise(resolve=>setTimeout(resolve,25));
  }
}
function pairPlaybackGuard(row){
  assert.equal(row.started.length,2);assert.equal(row.paused.length,2);
  for(const r of row.started){assert.equal(r.paused,false);assert.equal(r.ended,false);assert.ok(r.readyState>=2);assert.ok(r.currentTime-r.start>=1/24);}
  assert.ok(row.paused.every(p=>p===true));
}
function playbackGuard(p) {
  assert.equal(p.failure, undefined, 'no playback failure marker');
  assert.equal(p.ended, true); assert.ok(p.decoded >= 92); assert.ok(Math.abs(p.currentTime - 4) < 1/24);
  assert.equal(p.dropped, 0); assert.equal(p.corrupt, 0);
  assert.ok(Math.abs(p.startFrame.seekedAt) <= 1/24 + 1e-6);
  assert.ok(Math.abs(p.startFrame.decodedAfterSeek.mediaTime) <= 1/24 + 1e-6);
}
function completionGuard(report, acquired, assets, inputMedia) {
  assert.ok(acquired.length>0,'diagnostic-only is not complete browser evidence');
  assert.equal(report.phases.length, 3);
  assert.deepEqual(report.phases.map(p => p.phase), ['raw-ui', 'playback', 'native-live']);
  assert.ok(report.phases.every(p => p.status === 'closed' && p.lifecycle === 'owned'));
  for (let i = 1; i < 3; i++) assert.ok(report.phases[i-1].closedAt <= report.phases[i].startedAt);
  for (const name of assets) {
    assert.equal(report.raw.filter(r => r.path === name && r.status === 200).length, 1);
    if (name.endsWith('.mp4')) assert.equal(report.raw.filter(r => r.path === name && r.range?.status === 206).length, 1);
  }
  assert.equal(inputMedia?.length,2);assert.equal(report.inputPlayback?.length,2);
  assert.deepEqual(inputMedia.map(r=>r.layer).sort(),['foreground','media']);
  assert.equal(new Set(inputMedia.map(r=>r.path)).size,2);
  for(const input of inputMedia){
    assert.ok(['media','foreground'].includes(input.layer));
    assert.ok(assets.includes(input.path),'known public input asset');
    const rows=report.inputPlayback.filter(r=>r.path===input.path&&r.layer===input.layer);
    assert.equal(rows.length,1);inputPlaybackGuard(rows[0]);
  }
  assert.equal(report.ui.length, 4);
  for(const row of report.ui){
    assert.equal(row.pairPlayback?.length,acquired.length);
    for(const c of acquired){const proof=row.pairPlayback.filter(p=>p.case===c.id);assert.equal(proof.length,1);pairPlaybackGuard(proof[0]);}
  }
  for (const lang of ['index.html', 'en.html']) for (const width of [1100, 390]) {
    assert.equal(report.ui.filter(r => r.lang === lang && r.width === width && r.controls && r.cases === acquired.length).length, 1);
  }
  for (const key of ['playback', 'nativeParity', 'live']) {
    assert.equal(report[key].length, acquired.length * 2);
    for (const c of acquired) for (const side of SIDES) assert.equal(report[key].filter(r => r.case === c.id && r.side === side).length, 1);
  }
  for (const row of report.playback) {
    assert.equal(row.seeks.length,3);for(const [i,t]of [1.5,.125,3.75].entries()){assert.ok(Math.abs(row.seeks[i].seekedAt-t)<=1/24+1e-6);assert.ok(Math.abs(row.seeks[i].decodedAfterSeek.mediaTime-t)<=1/24+1e-6);}
    playbackGuard(row.playback);
  }
  for (const row of report.nativeParity) { assert.deepEqual(row.frames, T.KEYS); assert.deepEqual(row.reverseFrames, T.KEYS.slice().reverse());serializationBoundaryGuard(row.serializationBoundary); }
  for (const row of report.live) { assert.equal(row.width, 390); assert.deepEqual(row.canvas, [3200,1080]); assert.deepEqual(row.times, SEEK); }
}
async function validateBrowser(dir, {baseURL, authorize, onProgress} = {}) {
  const checked = validateFiles(dir), m = checked.manifest, acquired = m.cases.filter(c => c.media);
  assert.ok(acquired.length > 0, 'diagnostic-only bundle is not complete native browser evidence');
  const pins = T.browserInputPins(dir, m);
  pins.push({name: 'active-h03-tool', file: __filename, sha256: digestFile(__filename)});
  const bridgeFile=require.resolve('./layouts-b-pages-bridge.cjs');
  pins.push({name:'active-h03-bridge',file:bridgeFile,sha256:digestFile(bridgeFile)});
  const local = baseURL ? null : await T.serve(dir); baseURL ||= local.baseURL;
  assert.ok(baseURL.endsWith('/'));
  const u = new URL(baseURL); assert.ok(!u.username && !u.password && !u.search && !u.hash);
  const report = {manifestSHA256: checked.manifestSHA256, origin: u.origin,
    scope: 'H03 acquired safe subset; all three focused outcomes remain in manifest',
    raw: [], ui: [], playback: [], inputPlayback: [], nativeParity: [], live: [], phases: [], phaseIsolation: 'owned-three-browser-lifecycles',
    playbackPageMode: 'fresh-same-origin-minimal-page-per-video', startupInputs: pins.map(({file, ...p}) => p)};
  let phase = 'raw-ui', context = {stage: 'raw-http'};
  const progress = () => onProgress?.({...report, context: {...context, phase}, status: 'incomplete'});
  const owners = T.browserPhases({baseURL, records: report.phases, onProgress: progress});
  try {
    let browser = await owners.start(phase);
    const rawPage = await browser.newPage();
    try {
      await T.isolate(rawPage, baseURL, authorize); await rawPage.goto(new URL('index.html', baseURL).href);
      for (const [name, expected] of [['manifest.json', checked.manifestSHA256], ...Object.entries(m.assets)]) {
        context = {stage: 'raw-http', asset: name}; progress();
        const r = await rawPage.evaluate(async url => {
          const response = await fetch(url, {redirect:'error'}), b = await response.arrayBuffer();
          return {status:response.status,type:response.headers.get('content-type'),range:response.headers.get('content-range'),length:b.byteLength,
            sha256:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b))).map(n=>n.toString(16).padStart(2,'0')).join('')};
        }, new URL(name, baseURL).href);
        report.raw.push({path:name,...r}); progress();
        assert.equal(r.status, 200); assert.equal(r.sha256, expected); assert.equal(r.length, read(dir,name).length);
        for (const [extension,type] of [['.mp4',/^video\/mp4/],['.html',/^text\/html/],['.png',/^image\/png/]]) if(name.endsWith(extension))assert.match(r.type,type);
        if (name.endsWith('.mp4')) {
          const range = await rawPage.evaluate(async url => { const r = await fetch(url,{redirect:'error',headers:{Range:'bytes=0-31'}}); return {status:r.status,range:r.headers.get('content-range'),bytes:(await r.arrayBuffer()).byteLength}; },new URL(name,baseURL).href);
          report.raw.push({path:name,range}); progress(); assert.equal(range.status,206); assert.equal(range.bytes,32); assert.equal(range.range,'bytes 0-31/'+read(dir,name).length);
        }
      }
    } finally { await rawPage.close(); }
    for (const lang of ['index.html','en.html']) for (const width of [1100,390]) {
      context = {stage:'review-ui',lang,width}; progress();
      const page = await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1});
      try {
        await T.isolate(page,baseURL,authorize); await page.goto(new URL(lang,baseURL).href);
        assert.equal(await page.locator('[data-case]').count(),acquired.length);
        assert.equal(await page.locator('#AVOID-007-H03').count(),1);
        const guide=page.locator('[data-guide]'); assert.equal(await guide.isChecked(),false); await guide.focus(); await guide.press('Space'); assert.equal(await guide.isChecked(),true);
        let guideMeasurements=0;const pairPlayback=[];
        for (const c of acquired) {
          const section=page.locator('#'+c.id); await section.scrollIntoViewIfNeeded();
          await section.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
          assert.equal(await section.locator('img').evaluateAll(imgs=>imgs.length===8&&imgs.every(i=>i.naturalWidth===3200&&i.naturalHeight===1080)),true);
          await section.locator('[data-play]').click();
          const started=await section.locator('video').evaluateAll(waitPairPlayback);
          assert.equal(await section.locator('output').textContent(),'');
          await section.locator('[data-pause]').click();
          const pairProof={case:c.id,started,paused:await section.locator('video').evaluateAll(v=>v.map(i=>i.paused))};
          pairPlaybackGuard(pairProof);pairPlayback.push(pairProof);
          assert.equal(await section.locator('output').textContent(),'');
          await section.locator('video').evaluateAll(videos=>Promise.all(videos.map(v=>new Promise((resolve,reject)=>{if(v.videoWidth)return resolve();const timer=setTimeout(()=>reject(Error('metadata timeout')),10000);v.addEventListener('loadedmetadata',()=>{clearTimeout(timer);resolve();},{once:true});v.preload='metadata';v.load();}))));
          guideMeasurements+=await T.checkGuideGeometry(section,c.conditions);
          for (const mode of ['before','after','overlay','pair']) {await section.locator('[data-mode]').selectOption(mode);guideMeasurements+=await T.checkGuideGeometry(section,c.conditions);}
          await section.locator('[data-zoom]').evaluate(i=>{i.value='200';i.dispatchEvent(new Event('input',{bubbles:true}));});
          assert.equal(await section.locator('.image-media').first().evaluate(i=>i.style.width),'200%'); guideMeasurements+=await T.checkGuideGeometry(section,c.conditions);
          await section.locator('[data-zoom]').evaluate(i=>{i.value='100';i.dispatchEvent(new Event('input',{bubbles:true}));});
        }
        await guide.focus();await guide.press('Space');assert.equal(await guide.isChecked(),false);
        assert.equal(await page.locator('.circle-guide').evaluateAll(items=>items.every(i=>getComputedStyle(i).visibility==='hidden')),true);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
        report.ui.push({lang,width,cases:acquired.length,controls:true,guideKeyboardOnOff:true,guideMeasurements,pairPlayback});progress();
      } finally {await page.close();}
    }
    await owners.close(); phase='playback';context={stage:'playback'};browser=await owners.start(phase);
    for (const c of acquired) for (const side of SIDES) {
      context={stage:'video-load',case:c.id,side};progress();const page=await browser.newPage();let video;
      try {
        await T.isolate(page,baseURL,authorize);const blank=new URL('__h03_playback_blank__.html',baseURL).href;
        await page.route(blank,r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>H03 playback</title>'}));await page.goto(blank);
        await page.setContent('<video controls playsinline preload="auto" style="width:640px;max-width:100%" src="'+B.esc(new URL(c.media[side].video,baseURL).href)+'"></video>');
        video=await page.locator('video').elementHandle();
        await video.evaluate(v=>new Promise((resolve,reject)=>{if(v.readyState>=2)return resolve();v.onloadeddata=resolve;v.onerror=()=>reject(Error('video load'));v.load();}));
        const seeks=[];context={stage:'decoded-seek',case:c.id,side};progress();
        for (const target of [1.5,.125,3.75]) seeks.push(await page.evaluate(({v,target,source})=>(0,eval)('('+source+')')(v,target),{v:video,target,source:T.seekDecodedFrame.toString()}));
        context={stage:'continuous-playback',case:c.id,side};progress();
        const playback=await page.evaluate(async({v,seek,play})=>{try{return await (0,eval)('('+play+')')(v,(0,eval)('('+seek+')'));}catch(error){if(error.playback)return error.playback;throw error;}},{v:video,seek:T.seekDecodedFrame.toString(),play:T.playNativeVideo.toString()});
        report.playback.push({case:c.id,side,seeks,playback});progress();playbackGuard(playback);
      } finally {try{if(video)await T.releaseVideo(video);}finally{await page.close();}}
    }
    for(const input of m.inputMedia){
      context={stage:'video-load',asset:input.path};progress();
      const page=await browser.newPage();let video;
      try{
        await T.isolate(page,baseURL,authorize);
        const blank=new URL('__h03_input_playback_blank__.html',baseURL).href;
        await page.route(blank,r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>H03 input playback</title>'}));await page.goto(blank);
        await page.setContent('<video controls playsinline preload="auto" src="'+B.esc(new URL(input.path,baseURL).href)+'"></video>');
        video=await page.locator('video').elementHandle();
        await video.evaluate(v=>new Promise((resolve,reject)=>{if(v.readyState>=2)return resolve();v.onloadeddata=resolve;v.onerror=()=>reject(Error('input video load'));v.load();}));
        const seeks=[];context={stage:'decoded-seek',asset:input.path};progress();
        for(const target of [.5,6.5,11.5])seeks.push(await page.evaluate(({v,target,source})=>(0,eval)('('+source+')')(v,target),{v:video,target,source:T.seekDecodedFrame.toString()}));
        const pause=await page.evaluate(({v,seek,operation})=>(0,eval)('('+operation+')')(v,(0,eval)('('+seek+')')),
          {v:video,seek:T.seekDecodedFrame.toString(),operation:pauseInputVideo.toString()});
        context={stage:'continuous-playback',asset:input.path};progress();
        const playback=await page.evaluate(async({v,seek,play})=>{try{return await (0,eval)('('+play+')')(v,(0,eval)('('+seek+')'));}catch(error){if(error.playback)return error.playback;throw error;}},{v:video,seek:T.seekDecodedFrame.toString(),play:playInputVideo.toString()});
        const row={path:input.path,layer:input.layer,duration:12,frames:288,fps:24,seeks,pause,playback};
        report.inputPlayback.push(row);progress();
        inputPlaybackGuard(row);
      }finally{try{if(video)await T.releaseVideo(video);}finally{await page.close();}}
    }
    await owners.close();phase='native-live';context={stage:'native-parity'};browser=await owners.start(phase);
    for (const c of acquired) for (const side of SIDES) {
      context={stage:'native-parity',case:c.id,side};progress();
      const {page,initial}=await openFixture(browser,baseURL,m,c,side,authorize);
      try {
        const original=JSON.parse(read(dir,c.records[side].initial));
        const serializationBoundary=serializedInitialGuard(original,initial);
        const witness=JSON.parse(read(dir,c.pairEquivalence.path));
        assert.deepEqual(placementSeedPresence(initial),witness.presence[side],'native field presence matches sealed capture fact');
        const records=JSON.parse(read(dir,c.records[side].frames));
        for(const n of [...T.KEYS,...T.KEYS.slice().reverse()]){
          const f=await frame(page,CLOCK.absoluteStart+n/24,initial,side),png=Buffer.from(f.png.split(',')[1],'base64');
          assert.equal(f.rgbaSHA256,records[n].rgbaSHA256);assert.equal(T.sha(png),records[n].sha256);T.pngRecord(png,f.rgbaSHA256,3200,1080);
          for(const layer of ['media','foreground'])assert.deepEqual(f.layers[layer],records[n].proof.layers[layer]);
        }
        report.nativeParity.push({case:c.id,side,frames:T.KEYS,reverseFrames:T.KEYS.slice().reverse(),serializationBoundary});progress();
      }finally{await page.close();}
    }
    for(const c of acquired)for(const side of SIDES){
      context={stage:'live-fixture',case:c.id,side};progress();const page=await browser.newPage({viewport:{width:390,height:850}});
      try{
        await T.isolate(page,baseURL,authorize);await page.goto(new URL('live.html?case='+c.id,baseURL).href);
        await page.waitForFunction(()=>document.body.dataset.fixtureSide==='after'&&document.querySelector('output').textContent==='2.000');
        if(side==='before'){await page.locator('#side').selectOption(side);await page.waitForFunction(()=>document.body.dataset.fixtureSide==='before'&&document.querySelector('output').textContent==='2.000');}
        const initial=await page.evaluate(()=>window.h03LastInitial);initialGuard(initial,c.conditions,side);
        const frames=[];
        for(const time of SEEK){await page.locator('[data-seek="'+time+'"]').click();await page.waitForFunction(t=>document.querySelector('output').textContent===Number(t).toFixed(3),time);const f=await page.evaluate(()=>window.h03LastFrame);frameGuard(f,initial,side,time);frames.push(f);}
        revisitGuard(frames);assert.equal(await page.locator('body').getAttribute('data-fixture-error'),null);
        const canvas=page.frameLocator('iframe').locator('canvas').last();assert.deepEqual(await canvas.evaluate(c=>[c.width,c.height]),[3200,1080]);
        report.live.push({case:c.id,side,width:390,canvas:[3200,1080],times:SEEK,frames});progress();
      }finally{await page.close();}
    }
    await owners.close();completionGuard(report,acquired,['manifest.json',...Object.keys(m.assets)],m.inputMedia);
    T.assertBrowserInputs(pins);report.inputIntegrity='unchanged';report.status=STATUS;return report;
  } catch(error) {report.failure={...context,message:error.message};progress();throw error;}
  finally {try{await owners.close();}finally{try{T.assertBrowserInputs(pins);}finally{if(local)await new Promise(r=>local.server.close(r));}}}
}
module.exports={PROFILE,CONTROL_METADATA_SHA,CONTROL_WINDOW_PROOF,CLOCK,SIDES,LINES,SPECS,EXPECTED,SEEK,STATUS,BEFORE_SHA,conditions,subset,projectGuard,nativeSourceGuard,foregroundInputs,foregroundSupport,lifeGuard,initialGuard,frameGuard,placementSeedPresence,pairGuard,pairWitnessGuard,serializedInitialGuard,serializationBoundaryGuard,SERIALIZED_OMISSIONS,revisitGuard,focusedRows,focusedInputGuard,inputProbe,prepare,runtimeInit,openFixture,frame,pageHTML,liveHTML,liveControls,capture,validateFiles,linkageGuard,playInputVideo,pauseInputVideo,inputPlaybackGuard,waitPairPlayback,pairPlaybackGuard,playbackGuard,completionGuard,validateBrowser};
if(require.main===module)(async()=>{
  const [command,a,b]=process.argv.slice(2);
  if(command==='capture')return capture(JSON.parse(bytes(a)),b);
  if(command==='validate-files'){const r=validateFiles(a);return {manifestSHA256:r.manifestSHA256,acquired:r.acquired,status:r.status};}
  if(command==='validate-browser')return validateBrowser(a,{baseURL:b});
  throw Error('Usage: layouts-b-h03-control-review.cjs capture config.json fresh-dir | validate-files dir | validate-browser dir [baseURL/]');
})().then(r=>process.stdout.write(json(r))).catch(()=>{console.error('H03 operation failed; details suppressed.');process.exitCode=1;});
