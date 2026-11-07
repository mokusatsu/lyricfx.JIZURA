/* Project defaults, normalization and settings-only transfer. */
(() => {
'use strict';

J.PROJECT_EXTENSION = '.lyricfx';

J.defaultProject = () => ({
  version: 1,
  title: '夜明けの色', artist: 'JIZURA',
  projectName: '',                // set when the project is saved; the next save's default file name
  durationOverride: null,         // null = automatic; otherwise total video length in seconds
  lyrics: J.SAMPLE_LYRICS,
  themes: [],
  themeBalance: 'lively',         // テーマ設定: 'lively' (にぎやかさ重視, standard) | 'unified' (統一感重視)
  style: 'noir', mood: null,
  extra: false,                   // random picks may use the parts added after the first version (追加分)
  wa: true,                       // …and the 和風 motifs (提灯・障子・家紋…) — applied after 'extra'
  lang: 'auto',                   // 歌詞の言語: 'auto' | 'ja' | 'zh-Hant' | 'zh-Hans' | 'ko' — picks the faces each font key is drawn with
  keyBg: 'off',                   // 合成用の背景: 'off' | 'green' (グリーンバック) | 'black' (ブラックバック)
  seed: 20260922,
  aspect: '16:9', res: 1080, fps: 24,
  shortExport: {start:0,end:null,mode:'zoom',blur:35,res:1080},
  fx: { motion: 0.7, glitch: 0.55, chroma: 0.7, decor: 0.5, density: 0.55, texture: 0.6, flash: true, onTwos: true, koma: 12, hud: 'auto', bgSwitch: 0.35 },
  enabled: Object.fromEntries(J.GROUP_KEYS.map(g => [g, Object.fromEntries(J.order(g).map(k => [k, true]))])),
  timing: { bpm: 0, offset: 0.4, snap: true, tail: 0.9, lineTimes: {}, cutTimes: {}, lineScale: 1 },
  overrides: {},
  lyricCutOptions: {},
  effectFavorites: [], favoriteSequence: 0, customEffects: [],
  lyricEffects: { autoPlacement: true, avoidForeground: true, avoidanceStrength: 1, lyricAvoidanceStrength: 1, randomBlend: false, randomOpacity: false, opacityMin: 0, opacityMax: 100 },
  timelineLinks: [],
  layerVisibility: {avoidance:true,foreground:true,lyrics:true,media:true},
  avoidance: { timelineMode: true, cutCount: 0, manualCuts: true, avoidEmphasis: false, maskAvoidance: false, maskRadiusOffset: 0, maskFeather: 60, maskCurve: 'smooth', lyricInsertMode: 'line', groupLyricsAsOneCut: true, timing: { lineTimes: {} }, cutOverrides: {} },
  media: { items: [], randomOrder: false, loop: false, cutCount: 0, seed: 1, timing: { lineTimes: {} }, overrides: {}, cutOverrides: {}, blend: 'normal', opacity: 100 },
  foreground: { items: [], randomOrder: false, loop: false, cutCount: 0, seed: 1, timing: { lineTimes: {} }, overrides: {}, cutOverrides: {}, blend: 'normal', opacity: 100 },
  colors: { enabled: false },
  colorTheme: { genre: 'auto', color: null },
  fonts: {},
});

// 無表示カット (retired): the lyric showing when a blank began now ends there (カットの終了時間).
function migrateLyricBlankCuts(project) {
  const blanks = (Array.isArray(project.lyricBlankCuts) ? project.lyricBlankCuts : []).filter(b => b && Number.isFinite(+b.start)).sort((a, b) => a.start - b.start);
  delete project.lyricBlankCuts;
  if (!blanks.length) return;
  const plan = J.plan(project), done = new Set();
  for (const blank of blanks) for (const cut of plan.cuts) {
    const key = `${cut.line}:${cut.part}`;
    if (cut.line < 0 || !Number.isInteger(cut.part) || done.has(key) || !(cut.start < +blank.start && cut.end > +blank.start)) continue;
    project.lyricCutOptions[key] = { ...project.lyricCutOptions[key], untilNext: false, endTime: +(+blank.start).toFixed(3) };
    done.add(key);
  }
}
J.normalizeProject = p => {
  const d = J.defaultProject();
  const o = Object.assign(d, p || {});
  if (o.videoSize) { const [w, h] = J.outputSize(o); o.videoSize = { w, h }; }
  o.shortExport=J.shortExportSettings(o.shortExport);
  o.fx = Object.assign(J.defaultProject().fx, (p && p.fx) || {});
  o.timing = Object.assign(J.defaultProject().timing, (p && p.timing) || {});
  o.timing.cutTimes = o.timing.cutTimes || {};
  o.customEffects=J.validateCustomEffects(o.customEffects||[]);J.activateCustomEffects(o);
  const en = J.defaultProject().enabled;
  for (const g of Object.keys(en)) en[g] = Object.assign(en[g], ((p && p.enabled) || {})[g] || {});
  o.enabled = en;
  o.overrides = (p && p.overrides) || {};
  o.lyricCutOptions = (p && p.lyricCutOptions) || {};
  o.lyricEffects = J.lyricEffectSettings(o);
  o.themes = J.themeIds(o);
  o.themeBalance = o.themeBalance === 'unified' ? 'unified' : 'lively';
  delete o.jevPrompt;
  migrateLyricBlankCuts(o);
  o.effectFavorites = J.normalizeEffectFavorites(o.effectFavorites);
  o.customEffects=J.combineCustomEffects(o.customEffects,...o.effectFavorites.map(f=>f.payload.components||[]));J.activateCustomEffects(o);
  o.favoriteSequence = Math.max(o.effectFavorites.length,Math.floor(+o.favoriteSequence)||0);
  o.timelineLinks = Array.isArray(p && p.timelineLinks) ? p.timelineLinks : [];
  o.layerVisibility = Object.assign({avoidance:true,foreground:true,lyrics:true,media:true}, (p && p.layerVisibility) || {});
  o.avoidance = J.normalizeAvoidance(p ? p.avoidance : J.defaultProject().avoidance);
  o.media = J.normalizeMedia(p && p.media);
  o.foreground = J.normalizeMedia(p && p.foreground);
  for (const layer of ['media', 'foreground']) o[layer].effects = J.mediaEffectSettings(o, layer);
  // Convert the former per-source occlusion switches once, preserving their active intervals.
  const legacy = [];
  for (const layer of ['media','foreground']) for (const [key, options] of Object.entries(o[layer].cutOverrides || {})) {
    const ref=options.personCutout;
    if (ref && (ref.behindLyrics || ref.behindForeground)) legacy.push({layer,index:+key,lyrics:!!ref.behindLyrics,foreground:!!ref.behindForeground});
  }
  if (legacy.length) {
    const lp=J.plan(o), ap=J.planAvoidance(o,lp), media={media:J.planMedia(o,lp),foreground:J.planMedia(o,lp,null,'foreground')};
    const entries=ap.cuts.map(c=>({start:c.start,end:c.end,oldIndex:c.index,ov:{...(o.avoidance.cutOverrides[c.index]||{})}}));
    for (const old of legacy) {
      const c=media[old.layer].cuts[old.index];
      if (!c) continue;
      entries.push({start:c.start,end:c.end,ov:{kind:'person',source:{layer:old.layer,index:old.index,itemId:c.itemId},placement:false,occlusion:old.lyrics?'all':'none',behindForeground:old.foreground}});
      const ref=o[old.layer].cutOverrides[old.index].personCutout; delete ref.behindLyrics;delete ref.behindForeground;
    }
    entries.sort((a,b)=>a.start-b.start);
    o.avoidance.manualCuts=true;o.avoidance.cutCount=entries.length;o.avoidance.cutOverrides={};o.avoidance.timing.lineTimes={};
    const remap=new Map();
    entries.forEach((e,i)=>{if(e.oldIndex!=null)remap.set(e.oldIndex,i);o.avoidance.timing.lineTimes[i]=e.start;o.avoidance.cutOverrides[i]={...e.ov,untilNext:false,endTime:e.end};});
    for(const link of o.timelineLinks)for(const side of ['a','b'])if(/^a:\d+$/.test(link[side])){const old=+link[side].slice(2);if(remap.has(old))link[side]='a:'+remap.get(old);}
  }
  // Materialize the old circle-wide switch and inherited defaults once per cut.
  if(!o.avoidance.timelineMode) {
    const a=o.avoidance,settings=J.lyricEffectSettings(o),on=!!(settings.autoPlacement && settings.avoidCenter);
    const oldPlan=J.plan(o),custom=o.lyricEffects?.avoidCircle || o.avoidCircle;
    for(let i=0;i<a.cutCount;i++){
      const ov=a.cutOverrides[i] ||= {};if(ov.kind==='person')continue;
      ov.enabled=on && ov.enabled!==false;
      ov.avoidEmphasis=ov.avoidEmphasis ?? a.avoidEmphasis;
      ov.occlusion=ov.occlusion || ((ov.maskAvoidance ?? a.maskAvoidance)?'aux':'none');
      for(const key of ['maskRadiusOffset','maskFeather','maskCurve'])if(ov[key]===undefined)ov[key]=a[key];
      if(custom && [custom.cx,custom.cy,custom.r].some(Number.isFinite)){
        if(Number.isFinite(custom.cx))ov.cx=J.clamp(custom.cx/oldPlan.W,0,1);
        if(Number.isFinite(custom.cy))ov.cy=J.clamp(custom.cy/oldPlan.H,0,1);
        if(Number.isFinite(custom.r))ov.r=J.clamp(custom.r/Math.min(oldPlan.W,oldPlan.H),.03,.85);
        if(Number.isFinite(custom.pad))ov.pad=J.clamp(custom.pad/Math.min(oldPlan.W,oldPlan.H),0,.2);
        if(Number.isFinite(custom.feather))ov.feather=J.clamp(custom.feather/Math.min(oldPlan.W,oldPlan.H),0,.3);
      }
    }
    a.timelineMode=true;
  }
  delete o.mediaEffects;
  o.colors = Object.assign({ enabled: false }, (p && p.colors) || {});
  o.colorTheme = J.normalizeColorTheme(p && p.colorTheme);
  o.fonts = (p && p.fonts) || {};
  o.userFonts = (p && p.userFonts) || [];
  for (const uf of o.userFonts) if (!J.FONTS[uf.key]) J.addUserFont(uf.key, uf.label, uf.family, uf.weight || 400);
  o.compositeFonts = Array.isArray(p && p.compositeFonts) ? p.compositeFonts : [];
  J.setCompositeFonts(o.compositeFonts);
  J.migrateLyricCompositing(o);
  return o;
};

// Explicit settings allowlist keeps song content and future asset fields out of presets.
const settingKeys = ['themes','themeBalance','style','mood','extra','wa','horror','typo','kinetic','keyBg',
  'seed','aspect','res','fps','videoSize','videoSizeMode','quality','exportBitrate','exportQP','includeAudio','exportEncoder','shortExport','fx','enabled',
  'lyricEffects','colors','colorTheme','fonts','userFonts','compositeFonts','effectFavorites','favoriteSequence','customEffects'];
const clone = value => JSON.parse(JSON.stringify(value));
J.projectSettings = project => {
  const result = {};
  for (const key of settingKeys) if (project[key] !== undefined) result[key] = clone(project[key]);
  for (const layer of ['media','foreground']) result[layer] = { effects: clone(J.mediaEffectSettings(project,layer)), opacity: project[layer]?.opacity ?? 100, blend: project[layer]?.blend ?? 'normal' };
  result.avoidance = { avoidEmphasis: !!project.avoidance?.avoidEmphasis, ...J.normalizeAvoidanceMask(project.avoidance) };
  return result;
};
J.settingsProject = project => {
  const settings = J.projectSettings(project), result = Object.assign(J.defaultProject(),settings);
  result.lyrics = ''; result.title = ''; result.artist = '';
  for (const layer of ['media','foreground']) result[layer] = Object.assign(J.normalizeMedia(null),settings[layer]);
  result.avoidance = Object.assign(J.normalizeAvoidance(null), settings.avoidance);
  return result;
};
J.applyProjectSettings = (current, source) => {
  const settings = J.projectSettings(source), result = clone(current);
  // Density is also an automatic cut splitter. Retain existing line divisions while
  // accepting the preset density for new lines and future explicit density edits.
  result.overrides ||= {};
  J.parseLyrics(current.lyrics).lines.forEach((line,index) => {
    const ov = result.overrides[index] ||= {};
    ov.divisionDensity ??= current.fx?.density ?? J.defaultProject().fx.density;
  });
  for (const key of settingKeys) if (settings[key] !== undefined) result[key] = settings[key];
  for (const layer of ['media','foreground']) Object.assign(result[layer],settings[layer]);
  if (settings.avoidance) Object.assign(result.avoidance ||= J.normalizeAvoidance(null), settings.avoidance);
  // Retained cuts still need their custom component definitions.
  result.customEffects=clone(current.customEffects||[]);J.importCustomEffects(result,settings.customEffects||[]);
  // Existing cuts may still refer to fonts absent from the preset.
  for (const key of ['userFonts','compositeFonts']) {
    const imported = result[key] || [];
    result[key] = [...(current[key] || []).filter(f => !imported.some(g => g.key === f.key)),...imported];
  }
  return result;
};
})();
