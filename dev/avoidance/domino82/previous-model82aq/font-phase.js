// Only a completed, unchanged request can omit repeated font load/cache clearing.
let dominoFontReady82aq=null;
function readDominoFonts82aq(){const faces=[...document.fonts],attributes=['family','style','weight','stretch','unicodeRange','status','featureSettings','variationSettings','ascentOverride','descentOverride','lineGapOverride'];return{revision:J.metrics.revision,loader:J.ensureFonts,faces,loaded:document.fonts.status==='loaded'&&faces.every(f=>f.status==='loaded'),data:JSON.stringify(faces.map(f=>attributes.map(k=>String(f[k]??''))))}}
