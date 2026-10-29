 // Private completed HQ records retain only finite numeric counters/bounds.
 // Seal their source-fixed structure before reusing the exact F64 encoding size.
 const heldFixed86bh=new Set();let heldFixedKeyBytes86bh=0;const auditHeld86bh=false;
 const heldDynamic86bh=['heldScalars','ghostFaceHeldScalars','ghostNoFaceHeldScalars','minScale','skippedLogicalSpaceSlots'];
 const heldKeys86bh=['recipe','kind','observedPaintCounts','heldScalars','passCounts','ghostFaceHeldScalars','ghostNoFaceHeldScalars','minScale','nativeSize','actualSize','lyricText','captionText','captionSize','r','face','rings','lineWidth','miterLimit','lyric','subtitle','expectedLyric','expectedSubtitle','skippedLogicalSpaceSlots'];
 function heldReady86bh(r){return Object.keys(r).length===heldKeys86bh.length&&heldKeys86bh.every(k=>Object.hasOwn(r,k))&&Number.isFinite(r.lineWidth)&&Number.isFinite(r.miterLimit)&&['lyric','subtitle'].every(k=>{const expected=r[k==='lyric'?'expectedLyric':'expectedSubtitle'],list=r[k];return Array.isArray(expected)&&expected.length>0&&Object.keys(list).length===expected.length&&expected.every(e=>{const g=list[e.i];return g&&g.i===e.i&&g.ch===e.ch&&g.line===e.line})})}
 function heldLock86bh(r){
  for(const k of ['lyric','subtitle']){for(const g of r[k])if(g){for(const name of Object.keys(g))if(name!=='bounds')Object.defineProperty(g,name,{writable:false});Object.seal(g)}Object.freeze(r[k])}
  Object.seal(r.passCounts);
  for(const k of Object.keys(r))if(!heldDynamic86bh.includes(k)&&!['passCounts','lyric','subtitle'].includes(k)){freeze(r[k]);Object.defineProperty(r,k,{writable:false})}
  for(const k of ['passCounts','lyric','subtitle'])Object.defineProperty(r,k,{writable:false});Object.seal(r);
 }
 function heldFinite86bh(r){need(heldDynamic86bh.every(k=>Number.isFinite(r[k]))&&['B','A','main'].every(k=>Number.isFinite(r.passCounts[k])),'BULBS86BH_COUNTER');for(const k of ['lyric','subtitle'])for(const g of r[k])if(g)need(g.bounds&&Object.keys(g.bounds).length===4&&['x0','y0','x1','y1'].every(p=>Object.hasOwn(g.bounds,p)&&Number.isFinite(g.bounds[p])),'BULBS86BH_BOUNDS')}
 function accountHeld(cursor){if(!cursor)return;const r=cursor.record,id=r.recipe.id,old=heldSizes.get(id)||0;if(heldFixed86bh.has(id)){heldFinite86bh(r);if(auditHeld86bh)need(measuredBytes([id,r])===old,'BULBS86BH_EXACT_ACCOUNTING');return}const n=measuredBytes([id,r]);heldBytes+=n-old+measuredBytes([id,n])-(old?measuredBytes([id,old]):0);heldSizes.set(id,n);if(heldReady86bh(r)){heldFinite86bh(r);heldLock86bh(r);heldFixed86bh.add(id);heldFixedKeyBytes86bh+=measuredBytes(id)+1;need(heldFixed86bh.size<=4,'BULBS86BH_FAMILY')}}
