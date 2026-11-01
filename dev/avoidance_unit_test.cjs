const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const context = vm.createContext({
  window: { addEventListener: () => {} },
  console,
  Math,
  Number,
  Object,
  Array,
  JSON,
  TextEncoder,
  TextDecoder,
  Uint8Array,
  DOMMatrix: class DOMMatrix { constructor() {} },
  document: { createElement: () => ({ getContext: () => ({}) }) },
});

const srcDir = path.join(__dirname, '..', 'src');
const targetFiles = [
  '01_util.js',
  '05b_registry.js',
];
for (const file of targetFiles) {
  vm.runInContext(fs.readFileSync(path.join(srcDir, file), 'utf8'), context);
}
for (const key of ['LAYOUT_ORDER', 'ENTER_ORDER', 'EXIT_ORDER', 'HOLD_ORDER', 'DECOR_ORDER', 'STYLE_ORDER']) {
  context.window.J[key] ||= [];
}
context.window.J.mediaEffectSettings = () => ({});
context.window.J.importCustomEffects = () => {};

const remainingFiles = [
  '08_planner.js',
  '08e_lyric_features.js',
  '08ca_lyric_avoidance.js',
  '11b_project_file.js'
];
for (const file of remainingFiles) {
  vm.runInContext(fs.readFileSync(path.join(srcDir, file), 'utf8'), context);
}

const J = context.window.J;

console.log('Testing Avoidance Mask and Timeline logic...');

// 1. J.normalizeAvoidanceMask
const def = J.normalizeAvoidanceMask(null);
assert.equal(def.maskAvoidance, false, 'Default maskAvoidance should be false');
assert.equal(def.maskRadiusOffset, 0, 'Default maskRadiusOffset should be 0');
assert.equal(def.maskFeather, 60, 'Default maskFeather should be 60');
assert.equal(def.maskCurve, 'smooth', 'Default maskCurve should be smooth');

const custom = J.normalizeAvoidanceMask({
  maskAvoidance: true,
  maskRadiusOffset: '42.6',
  maskFeather: '120.3',
  maskCurve: 'steep',
});
assert.equal(custom.maskAvoidance, true);
assert.equal(custom.maskRadiusOffset, 43, 'Should be rounded integer');
assert.equal(custom.maskFeather, 120, 'Should be rounded integer');
assert.equal(custom.maskCurve, 'steep');

// Clamp checks
const clamped = J.normalizeAvoidanceMask({
  maskRadiusOffset: 9999,
  maskFeather: -50,
  maskCurve: 'invalid_curve',
});
assert.equal(clamped.maskRadiusOffset, 500, 'Radius offset clamped to 500');
assert.equal(clamped.maskFeather, 0, 'Feather clamped to 0 min');
assert.equal(clamped.maskCurve, 'smooth', 'Fallback to smooth curve');

// 2. J.normalizeAvoidance
const normAvoid = J.normalizeAvoidance({
  enabled: true,
  cutCount: 2,
  manualCuts: true,
  maskAvoidance: true,
  maskRadiusOffset: -30,
  maskFeather: 80,
  maskCurve: 'linear',
  avoidEmphasis: true,
  cutOverrides: {
    0: { cx: 0.4, cy: 0.6, r: 0.3, maskAvoidance: false, maskRadiusOffset: 10, maskFeather: 40, maskCurve: 'soft' }
  }
});
assert.equal(normAvoid.maskAvoidance, true);
assert.equal(normAvoid.maskRadiusOffset, -30);
assert.equal(normAvoid.maskFeather, 80);
assert.equal(normAvoid.maskCurve, 'linear');
assert.equal(normAvoid.cutOverrides[0].maskAvoidance, false);
assert.equal(normAvoid.cutOverrides[0].maskRadiusOffset, 10);
assert.equal(normAvoid.cutOverrides[0].maskFeather, 40);
assert.equal(normAvoid.cutOverrides[0].maskCurve, 'soft');

// 3. J.planAvoidance & J.circleAvoidanceForCut
const mockProject = {
  lyrics: 'テスト歌詞A\nテスト歌詞B',
  style: 'pop',
  lyricEffects: { autoPlacement: true, avoidCenter: true },
  avoidance: normAvoid,
  timing: { bpm: 120, offset: 0, lineTimes: { 0: 0, 1: 2 } },
};
const plan = {
  W: 1920,
  H: 1080,
  duration: 4,
  lines: [{ index: 0, start: 0 }, { index: 1, start: 2 }],
  cuts: [
    { index: 0, line: 0, part: 0, start: 0, end: 2, text: 'テスト歌詞A', layout: 'center' },
    { index: 1, line: 1, part: 0, start: 2, end: 4, text: 'テスト歌詞B', layout: 'center' },
  ],
};
plan.avoidance = J.planAvoidance(mockProject, plan);
plan.lyricAvoidance = J.circleAvoidanceConfig(mockProject, plan);
assert.ok(plan.avoidance && plan.avoidance.cuts.length === 2, 'Avoidance cuts created');
assert.equal(plan.avoidance.cuts[0].maskAvoidance, false, 'Cut 0 custom maskAvoidance overridden');
assert.equal(plan.avoidance.cuts[0].maskRadiusOffset, 10);
assert.equal(plan.avoidance.cuts[0].maskFeather, 40);
assert.equal(plan.avoidance.cuts[0].maskCurve, 'soft');
assert.equal(plan.avoidance.cuts[1].maskAvoidance, true, 'Cut 1 inherited project default');
assert.equal(plan.avoidance.cuts[1].maskRadiusOffset, -30);
assert.equal(plan.avoidance.cuts[1].maskFeather, 80);
assert.equal(plan.avoidance.cuts[1].maskCurve, 'linear');

// circleAvoidanceForCut resolution
const circle0 = J.circleAvoidanceForCut(plan, plan.cuts[0], 0.5);
console.log('circle0:', circle0);
assert.equal(circle0.maskAvoidance, false);
assert.equal(circle0.maskRadiusOffset, 10);

const circle1 = J.circleAvoidanceForCut(plan, plan.cuts[1], 2.5);
assert.equal(circle1.maskAvoidance, true);
assert.equal(circle1.maskRadiusOffset, -30);
assert.equal(circle1.maskFeather, 80);
assert.equal(circle1.maskCurve, 'linear');

// 4. J.avoidanceMaskRadii
const radii0 = J.avoidanceMaskRadii(circle1, 1920, 1080);
assert.equal(radii0.rInner, Math.max(0, circle1.r - 30));
assert.equal(radii0.feather, 80);
assert.equal(radii0.rOuter, radii0.rInner + 80);

// 5. J.avoidanceMaskActive helper
assert.equal(J.avoidanceMaskActive(circle0), false);
assert.equal(J.avoidanceMaskActive(circle1), true);

// 6. Settings preset serialization / application via J.projectSettings / J.applyProjectSettings
const serialized = J.projectSettings(mockProject);
assert.ok(serialized.avoidance, 'Serialized contains avoidance');
assert.equal(serialized.avoidance.avoidEmphasis, true);
assert.equal(serialized.avoidance.maskAvoidance, true);
assert.equal(serialized.avoidance.maskRadiusOffset, -30);
assert.equal(serialized.avoidance.maskFeather, 80);
assert.equal(serialized.avoidance.maskCurve, 'linear');

const applied = J.applyProjectSettings(J.defaultProject(), mockProject);
assert.equal(applied.avoidance.avoidEmphasis, true);
assert.equal(applied.avoidance.maskAvoidance, true);
assert.equal(applied.avoidance.maskRadiusOffset, -30);
assert.equal(applied.avoidance.maskFeather, 80);
assert.equal(applied.avoidance.maskCurve, 'linear');

// 7. Test radial gradient knockout stop calculation for all 4 curves
const mockCtx = {
  saved: [],
  transforms: [],
  compositeOps: [],
  fills: [],
  arcs: [],
  save() { this.saved.push(true); },
  restore() { this.saved.pop(); },
  setTransform(...args) { this.transforms.push(args); },
  beginPath() {},
  arc(...args) { this.arcs.push(args); },
  fill() {},
  createRadialGradient(x0, y0, r0, x1, y1, r1) {
    const stops = [];
    return {
      stops,
      addColorStop(offset, color) { stops.push({ offset, color }); }
    };
  }
};

for (const curve of ['smooth', 'linear', 'steep', 'soft']) {
  mockCtx.compositeOps = [];
  mockCtx.fills = [];
  mockCtx.arcs = [];
  const testCircle = { cx: 960, cy: 540, r: 270, maskRadiusOffset: 20, maskFeather: 60, maskCurve: curve };
  J.applyAvoidanceCircleMask(mockCtx, { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }, testCircle, 1920, 1080);
  assert.equal(mockCtx.globalCompositeOperation, 'destination-out', 'Uses destination-out');
  assert.ok(mockCtx.fillStyle && mockCtx.fillStyle.stops, `Gradient created for curve ${curve}`);
  const stops = mockCtx.fillStyle.stops;
  assert.equal(stops.length, 13, '13 gradient stops (0..12)');
  assert.equal(stops[0].offset, 0);
  assert.ok(stops[0].color.includes('1.0000') || stops[0].color.includes('1)'), 'Inner stop is fully opaque destination-out (punch out)');
  assert.equal(stops[12].offset, 1);
  assert.ok(stops[12].color.includes('0.0000') || stops[12].color.includes('0)'), 'Outer stop is transparent destination-out (no punch out)');
}

console.log('All Avoidance Mask unit tests passed successfully!');
