from pathlib import Path
import hashlib,json
root=Path('/workspace/lyricfx.JIZURA'); out=root/'work/avoid009-balloons-native01'
source=(root/'src/11p_layoutsD.js').read_text()
a=source.index("reg('balloons', {"); b=source.index('/* ================================================================== 11 magnets',a)
native=source[a:b]; modified=native

def sub(old,new):
 global modified
 assert modified.count(old)==1,old
 modified=modified.replace(old,new)
sub('    const port = isPort(env);', '''    // Native catalog only: original geometry, clocks and live draw callbacks remain native.
    const nativeD = cut.placementLayoutsD === true;
    const owned = (owner, fn) => nativeD ? env.withDrawRole('primary', 'balloons.' + owner, fn) : fn();
    const freeze = v => { if (v && typeof v === 'object' && !Object.isFrozen(v)) { Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
    const sourceRows = nativeD ? [] : null, sourceGlyphs = nativeD ? [] : null;
    const port = isPort(env);''')
sub('      let x = W / 2 - tot / 2;', '''      if (nativeD) sourceRows.push({ row: ri, text: row, chars: chars.slice(), advances: ads.slice(), totalAdvance: tot });
      let x = W / 2 - tot / 2;''')
sub("        glyphs.push({ ch, x:","        glyphs.push({ ch, x:") # identity sentinel, preserve original full formula
sub('      });\n    });\n    // strings', '''        if (nativeD) sourceGlyphs.push({ id: 'balloon.' + q, q, row: ri, slot: i, ch, restX: cxp, yRow, phase: ph, u0, bob, ...glyphs[q] });
      });
    });
    // strings''')
sub('    for (const g of glyphs) {\n      if (g.e <= 0) continue;\n      const bx', '''    const catalog = nativeD ? {
      kind: 'balloons-native-catalog', version: 1, nativeOnly: true,
      stage: [W, H], pass: env.pass, clock: { t: env.t, realTime: env.realTime, lt, ltb: env.ltb, pOut: env.pOut },
      params: { font: Pm.font, tie: Pm.tie, arc: Pm.arc, colOff: Pm.colOff, mono: Pm.mono },
      seed: s, port, text: t0, n, nR, nativeSize: size, out, motion: mot, colors: cols.slice(),
      rows: sourceRows, glyphs: sourceGlyphs, lw, fly,
      gloss: { s: 0.93, clipY: [-0.75, -0.22], source: 'native-live-charFn' },
      painterOrder: 'all-strings-and-knots,shared-anchor,each-rim-body-gloss-highlight',
      primaryOwners: glyphs.flatMap(g => ['string', 'knot', 'rim', 'body', 'gloss', 'highlight'].map(part => 'balloons.balloon.' + g.q + '.' + part)),
      sharedAnchor: Pm.tie === 'bunch' ? { owner: 'balloons.anchor', x: gx, y: gy - fly, radius: size * 0.05 } : null,
    } : null;
    if (nativeD) { if (catalog.sharedAnchor) catalog.primaryOwners.push('balloons.anchor'); env.placementDGeometry = catalog; }
    for (const g of glyphs) {
      if (nativeD) sourceGlyphs[g.q].emitted = g.e > 0;
      if (g.e <= 0) continue;
      const bx''')
sub('      env.line(pts, sc.sub, lw, 0.85 * out * g.e, false);', '''      if (nativeD) Object.assign(sourceGlyphs[g.q], { neck: [bx, by], endpoint: [ex, ey], stringPoints: pts.map(p => p.slice()) });
      owned('balloon.' + g.q + '.string', () => env.line(pts, sc.sub, lw, 0.85 * out * g.e, false));''')
sub('      env.poly([[bx - size * 0.05, by + size * 0.07], [bx + size * 0.05, by + size * 0.07], [bx, by - size * 0.02]], shade(sc, g.col, -0.35), out * g.e, false);', '''      const knot = [[bx - size * 0.05, by + size * 0.07], [bx + size * 0.05, by + size * 0.07], [bx, by - size * 0.02]];
      if (nativeD) sourceGlyphs[g.q].knotPoints = knot.map(p => p.slice());
      owned('balloon.' + g.q + '.knot', () => env.poly(knot, shade(sc, g.col, -0.35), out * g.e, false));''')
sub("    if (Pm.tie === 'bunch') env.circle(gx, gy - fly, size * 0.05, sc.sub, null, 0, out * tin(env, 0.2, 0.3), false);", "    if (Pm.tie === 'bunch') owned('anchor', () => env.circle(gx, gy - fly, size * 0.05, sc.sub, null, 0, out * tin(env, 0.2, 0.3), false));")
sub('      const dark = shade(sc, g.col, -0.38);', '''      const dark = shade(sc, g.col, -0.38);
      if (nativeD) Object.assign(sourceGlyphs[g.q], { growth: q, size: sz, dark });''')
sub('      env.draw({ text: g.ch, font: Pm.font, size: sz, x: g.x, y: g.y, rot: g.rot, color: dark, stroke: sz * 0.13, strokeColor: dark, strokeUnder: true, alpha: out, ghost: false });', "      owned('balloon.' + g.q + '.rim', () => env.draw({ text: g.ch, font: Pm.font, size: sz, x: g.x, y: g.y, rot: g.rot, color: dark, stroke: sz * 0.13, strokeColor: dark, strokeUnder: true, alpha: out, ghost: false }));")
sub('      bb = UB(bb, J.mainDraw(env, { text: g.ch, font: Pm.font, size: sz, x: g.x, y: g.y, rot: g.rot, color: g.col, stroke: sz * 0.065, strokeColor: g.col, strokeUnder: true, plain: true, mi: miAt(env, g.t1) }));', '''      bb = UB(bb, owned('balloon.' + g.q + '.body', () => {
        const item = { text: g.ch, font: Pm.font, size: sz, x: g.x, y: g.y, rot: g.rot, color: g.col, stroke: sz * 0.065, strokeColor: g.col, strokeUnder: true, plain: true, mi: miAt(env, g.t1) };
        if (nativeD) sourceGlyphs[g.q].mi = item.mi;
        return J.mainDraw(env, item);
      }));''')
sub('      env.draw({ text: g.ch, font: Pm.font, size: sz, x: g.x - sz * 0.02, y: g.y - sz * 0.03, rot: g.rot, color: lightOf(sc), alpha: 0.3 * out * Math.min(1, g.e * 2), ghost: false, charFn: () => ({ clipY: [-0.75, -0.22], s: 0.93 }) });', "      owned('balloon.' + g.q + '.gloss', () => env.draw({ text: g.ch, font: Pm.font, size: sz, x: g.x - sz * 0.02, y: g.y - sz * 0.03, rot: g.rot, color: lightOf(sc), alpha: 0.3 * out * Math.min(1, g.e * 2), ghost: false, charFn: () => ({ clipY: [-0.75, -0.22], s: 0.93 }) }));")
sub('      env.circle(g.x - sz * 0.22, g.y - sz * 0.26, sz * 0.045, lightOf(sc), null, 0, 0.7 * out * g.e, false);', "      owned('balloon.' + g.q + '.highlight', () => env.circle(g.x - sz * 0.22, g.y - sz * 0.26, sz * 0.045, lightOf(sc), null, 0, 0.7 * out * g.e, false));")
sub('    return bb;', '    if (nativeD) freeze(catalog);\n    return bb;')
# Capture numeric/string paint arguments from the actual source call sites.
# Each source color/alpha helper remains evaluated exactly once at its original site.
def post(old,new):
 global modified
 assert modified.count(old)==1,old
 modified=modified.replace(old,new)
post("      owned('balloon.' + g.q + '.string', () => env.line(pts, sc.sub, lw, 0.85 * out * g.e, false));", "      if (nativeD) sourceGlyphs[g.q].stringStyle = { color: sc.sub, width: lw, alpha: 0.85 * out * g.e, ghost: false };\n      owned('balloon.' + g.q + '.string', () => env.line(pts, sc.sub, lw, 0.85 * out * g.e, false));")
post("      owned('balloon.' + g.q + '.knot', () => env.poly(knot, shade(sc, g.col, -0.35), out * g.e, false));", "      const knotColor = shade(sc, g.col, -0.35);\n      if (nativeD) sourceGlyphs[g.q].knotStyle = { color: knotColor, alpha: out * g.e, ghost: false };\n      owned('balloon.' + g.q + '.knot', () => env.poly(knot, knotColor, out * g.e, false));")
post("    if (Pm.tie === 'bunch') owned('anchor', () => env.circle(gx, gy - fly, size * 0.05, sc.sub, null, 0, out * tin(env, 0.2, 0.3), false));", "    if (Pm.tie === 'bunch') owned('anchor', () => {\n      const alpha = out * tin(env, 0.2, 0.3);\n      if (nativeD) Object.assign(catalog.sharedAnchor, { color: sc.sub, alpha, ghost: false });\n      return env.circle(gx, gy - fly, size * 0.05, sc.sub, null, 0, alpha, false);\n    });")
for part,lead,tail in [('rim',"      owned('balloon.' + g.q + '.rim', () => env.draw(","));"),('gloss',"      owned('balloon.' + g.q + '.gloss', () => env.draw(","));")]:
 line=next(line for line in modified.splitlines() if line.startswith(lead))
 expr=line[len(lead):-len(tail)]
 metadata="{ ...glossItem, charFn: undefined }" if part=='gloss' else "{ ...rimItem }"
 # Do not place the live charFn or an undefined placeholder in catalog JSON.
 snapshot="const { charFn, ...glossData } = glossItem; sourceGlyphs[g.q].glossItem = glossData;" if part=='gloss' else "sourceGlyphs[g.q].rimItem = { ...rimItem };"
 new="      const "+part+"Item = "+expr+";\n      if (nativeD) { "+snapshot+" }\n      owned('balloon.' + g.q + '."+part+"', () => env.draw("+part+"Item));"
 post(line,new)
post('        if (nativeD) sourceGlyphs[g.q].mi = item.mi;', '        if (nativeD) { sourceGlyphs[g.q].mi = item.mi; sourceGlyphs[g.q].bodyItem = { ...item }; }')
post("      owned('balloon.' + g.q + '.highlight', () => env.circle(g.x - sz * 0.22, g.y - sz * 0.26, sz * 0.045, lightOf(sc), null, 0, 0.7 * out * g.e, false));", "      const highlightColor = lightOf(sc);\n      if (nativeD) sourceGlyphs[g.q].highlight = { x: g.x - sz * 0.22, y: g.y - sz * 0.26, radius: sz * 0.045, color: highlightColor, alpha: 0.7 * out * g.e, ghost: false };\n      owned('balloon.' + g.q + '.highlight', () => env.circle(g.x - sz * 0.22, g.y - sz * 0.26, sz * 0.045, highlightColor, null, 0, 0.7 * out * g.e, false));")
(out/'src/11p_layoutsD.js').write_text(source[:a]+modified+source[b:])
(out/'evidence/native-balloons.before.js').write_text(native)
(out/'evidence/native-balloons.after.js').write_text(modified)
print(json.dumps({'beforeBytes':len(native.encode()),'beforeSHA256':hashlib.sha256(native.encode()).hexdigest(),'afterBytes':len(modified.encode()),'afterSHA256':hashlib.sha256(modified.encode()).hexdigest()}))
