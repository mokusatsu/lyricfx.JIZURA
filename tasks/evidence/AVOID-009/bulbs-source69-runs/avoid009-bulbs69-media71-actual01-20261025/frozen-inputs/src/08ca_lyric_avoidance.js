/* Circular avoidance control data. Rendering remains on the existing path in 003. */
(() => {
'use strict';
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const fail = field => { const error = new Error('Invalid lyricAvoidance: ' + field); error.code = 'INVALID_LYRIC_AVOIDANCE'; throw error; };
const number = (value, field, min, max = Infinity) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) fail(field);
  return value;
};
// One magnitude-scaled machine epsilon absorbs decimal subtraction/addition
// roundoff only in minimum-length validation. Lookup/overlap comparisons stay exact.
const tooShort = (start, end) => end - start < 0.04 - Number.EPSILON * Math.max(0.04, Math.abs(start), Math.abs(end));
const defaultRegion = () => ({id:'avoid-default', start:0, end:null, center:{x:0.5,y:0.42}, radius:0.2});
// Provenance is opaque metadata, never an executable position provider or media store.
// Accept only a small JSON object; no Blob, Date, typed arrays, non-finite or cyclic values.
function provenance(source) {
  if (!object(source)) fail('source object');
  const seen = new Set();
  function copy(value, depth) {
    if (depth > 16) fail('source depth');
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value !== 'object' || value === null || seen.has(value)) fail('source JSON');
    if (!Array.isArray(value) && Object.prototype.toString.call(value) !== '[object Object]') fail('source JSON object');
    seen.add(value);
    const result = Array.isArray(value) ? Array.from(value, v => copy(v, depth + 1)) : Object.fromEntries(Object.entries(value).map(([k,v]) => [k,copy(v, depth + 1)]));
    seen.delete(value);
    return result;
  }
  const result = copy(source, 0);
  if (new TextEncoder().encode(JSON.stringify(result)).length > 4096) fail('source exceeds 4096 bytes');
  return result;
}
J.defaultLyricAvoidance = () => ({version:1, regions:[defaultRegion()]});
// This is the single validator/normalizer for import, editing and planning.
// Only an absent project field requests legacy migration; null is malformed.
J.normalizeLyricAvoidance = value => {
  if (!object(value) || value.version !== 1 || !Array.isArray(value.regions)) fail('version/regions');
  if (value.regions.length > 1000) fail('region limit 1000');
  const ids = new Set();
  const regions = value.regions.map(region => {
    if (!object(region) || typeof region.id !== 'string' || !region.id.trim() || ids.has(region.id)) fail('unique nonempty id');
    ids.add(region.id);
    const start = number(region.start, 'start', 0);
    const end = region.end === null ? null : number(region.end, 'end', 0);
    if (end !== null && (end <= start || tooShort(start, end))) fail('interval minimum 0.04 seconds');
    if (!object(region.center)) fail('center');
    const result = {id:region.id,start,end,center:{x:number(region.center.x,'center.x',0,1),y:number(region.center.y,'center.y',0,1)},radius:number(region.radius,'radius',0.02,0.45)};
    if (own(region, 'source')) result.source = provenance(region.source);
    return result;
  }).sort((a,b) => a.start - b.start);
  for (let i=1; i<regions.length; i++) {
    const a = regions[i-1], b = regions[i];
    if (b.start <= a.start || tooShort(a.start, b.start) || (a.end !== null && a.end > b.start)) fail('overlap/minimum interval');
  }
  return {version:1,regions};
};
J.projectLyricAvoidance = project => own(project, 'lyricAvoidance') ? J.normalizeLyricAvoidance(project.lyricAvoidance) : J.defaultLyricAvoidance();
J.buildLyricAvoidanceIndex = project => {
  const model = J.projectLyricAvoidance(project), settings = J.lyricEffectSettings(project);
  // Keep null ends and future starts intact: final compose duration is supplied at lookup.
  return {version:1, enabled:settings.autoPlacement && settings.avoidCenter, regions:model.regions};
};
// Internal fixed-position boundary. A future schema can supply a different evaluator
// here without changing resolver callers. No function is stored in project JSON.
const positionAt = (region, _stageTime) => ({cx:region.center.x,cy:region.center.y,r:region.radius});
J.resolveAvoidanceAt = (projectOrPlan, stageTime) => {
  if (!Number.isFinite(stageTime) || stageTime < 0) return null;
  const isPlan = own(projectOrPlan,'lyricAvoidanceIndex');
  const index = isPlan ? projectOrPlan.lyricAvoidanceIndex : J.buildLyricAvoidanceIndex(projectOrPlan);
  if (!index.enabled) return null;
  const duration = isPlan ? projectOrPlan.duration : projectOrPlan.durationOverride;
  // A raw project with automatic duration must be planned first; never guess song length.
  if (!Number.isFinite(duration) || duration < 0) throw new Error('Avoidance requires a finite composed duration');
  if (stageTime >= duration) return null;
  let lo=0, hi=index.regions.length;
  while (lo < hi) { const mid=(lo+hi)>>>1; if (index.regions[mid].start <= stageTime) lo=mid+1; else hi=mid; }
  if (!lo) return null;
  const region=index.regions[lo-1], next=index.regions[lo];
  const end=region.end === null ? (next ? next.start : duration) : region.end;
  if (stageTime >= end) return null;
  const result={id:region.id,...positionAt(region,stageTime)};
  if (own(region,'source')) result.source=provenance(region.source);
  return result;
};
J.avoidanceCirclePixels = (resolved, W, H) => {
  number(W,'stage width',Number.MIN_VALUE); number(H,'stage height',Number.MIN_VALUE);
  return resolved === null ? null : {id:resolved.id,cx:resolved.cx*W,cy:resolved.cy*H,r:resolved.r*Math.min(W,H)};
};
})();
