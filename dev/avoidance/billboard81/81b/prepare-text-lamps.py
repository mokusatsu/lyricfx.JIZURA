from pathlib import Path
import difflib,hashlib,json
D=Path(__file__).resolve().parent;OLD=D.parent/'81a';base=(OLD/'11p_layoutsD-initial81.js').read_text();s=base
helpers="""function billboardMainSize81(env,{text,bw,bh}){const Pm=env.cut.params;
    return Math.min(J.fitSize(text, Pm.font, bw * 0.84, bh * 0.66, { track: 0.04, lead: 1.1 }), bh * 0.6);
}
function billboardMainItem81(env,{text,y0,bh,tc},size){const {W}=env,Pm=env.cut.params;
    return { text, font: Pm.font, size, x: W / 2, y: y0 + bh / 2 + (Pm.tag ? bh * 0.03 : 0), track: 0.04, lead: 1.1, color: tc, noHold: plateHold(env), mi: miAt(env, 0.3) };
}
function billboardLampOn81(env,L){const cut=env.cut,s=cut.seed,lt=env.lt,lampOn=[];
    for (let i = 0; i < L; i++) {
      const t1 = 0.15 + i * 0.12;
      let on = lt > t1 + 0.25 ? 1 : lt > t1 ? (J.r(s, i, env.step, 7) < 0.55 ? 1 : 0.1) : 0;
      on *= 1 - E.inCubic(J.clamp(env.pOut * 1.6 - i * 0.12));
      lampOn.push(on);
    }
    return lampOn;
}
function billboardTagSize81(env,bh){return Math.max(smallSize(env) * 0.8, bh * 0.05)}
function billboardTagNumber81(env,{bx,bw,y0,tc,a0},fs){return { text: 'No.' + lineNo(env), font: monoF(env), size: fs, align: 'left', track: 0.2, x: bx + bw * 0.025, y: y0 + fs * 1.1, color: tc, alpha: 0.7 * a0, ghost: false }}
function billboardTagTime81(env,{bx,bw,y0,tc,a0},fs){const cut=env.cut;return { text: J.fmtTime(cut.start), font: monoF(env), size: fs, align: 'right', track: 0.2, x: bx + bw * 0.975, y: y0 + fs * 1.1, color: tc, alpha: 0.7 * a0, ghost: false }}
"""
old_export="Object.defineProperty(J.placement,'billboardNativeGeometry81',{enumerable:true,value:Object.freeze({initial:billboardInitial81,sourceOnly:true,certificateIssuer:false})});"
new_export="Object.defineProperty(J.placement,'billboardNativeGeometry81',{enumerable:true,value:Object.freeze({initial:billboardInitial81,mainSize:billboardMainSize81,mainItem:billboardMainItem81,lampOn:billboardLampOn81,tagSize:billboardTagSize81,tagNumber:billboardTagNumber81,tagTime:billboardTagTime81,sourceOnly:true,certificateIssuer:false})});"
changes=[(old_export,helpers+new_export),
("const size = Math.min(J.fitSize(text, Pm.font, bw * 0.84, bh * 0.66, { track: 0.04, lead: 1.1 }), bh * 0.6);","const size = billboardMainSize81(env,{text,bw,bh});"),
("item({ text, font: Pm.font, size, x: W / 2, y: y0 + bh / 2 + (Pm.tag ? bh * 0.03 : 0), track: 0.04, lead: 1.1, color: tc, noHold: plateHold(env), mi: miAt(env, 0.3) })","item(billboardMainItem81(env,{text,y0,bh,tc},size))"),
("const fs = Math.max(smallSize(env) * 0.8, bh * 0.05);","const fs = billboardTagSize81(env,bh);"),
("item({ text: 'No.' + lineNo(env), font: monoF(env), size: fs, align: 'left', track: 0.2, x: bx + bw * 0.025, y: y0 + fs * 1.1, color: tc, alpha: 0.7 * a0, ghost: false })","item(billboardTagNumber81(env,{bx,bw,y0,tc,a0},fs))"),
("item({ text: J.fmtTime(cut.start), font: monoF(env), size: fs, align: 'right', track: 0.2, x: bx + bw * 0.975, y: y0 + fs * 1.1, color: tc, alpha: 0.7 * a0, ghost: false })","item(billboardTagTime81(env,{bx,bw,y0,tc,a0},fs))")]
# Restrict replacements to native renderer part, not new helper bodies.
for a,b in changes:
 assert s.count(a)==1,(a,s.count(a));s=s.replace(a,b)
a=s.index('    const lampOn = [];',s.index("reg('billboard',"));b=s.index('    if(captureD)Object.assign(catalog,{pw',a);lamp_block=s[a:b]
new_lamp="""    const lampOn = billboardLampOn81(env,L);
    if(captureD)for(let i=0;i<L;i++){const on=lampOn[i],t1=0.15+i*0.12;catalog.lampStates.push({i,t1,on,lt,ltb:env.ltb,step:env.step,sourceConeThresholdMet:on>0.01,sourceLensThresholdMet:on>0.5});}
"""
s=s[:a]+new_lamp+s[b:];changes.append((lamp_block,new_lamp))
inverse=s
for a,b in reversed(changes):assert inverse.count(b)==1;inverse=inverse.replace(b,a)
assert inverse==base
(D/'11p_layoutsD-text-lamps81.js').write_text(s);(D/'text-lamps81.diff').write_text(''.join(difflib.unified_diff(base.splitlines(True),s.splitlines(True),n=0,fromfile='a/src/11p_layoutsD.js',tofile='b/src/11p_layoutsD.js')))
(D/'text-lamps-helpers81.js.txt').write_text(helpers)
(D/'text-lamps-boundary.json').write_text(json.dumps({'baseSourceSHA256':hashlib.sha256(base.encode()).hexdigest(),'candidateSHA256':hashlib.sha256(s.encode()).hexdigest(),'inverseWhole81aExact':True,'drawSites':'helper mainItem/tag calls remain inside original owned callbacks; mainSize/tagSize at original points','lampRNG':'original loop/RNG/clock order; same values; catalog state recording follows numeric loop without intervening paint','normalCatalog':'no new diagnostic catalog on native nonplacement path','productApplied':False,'CanvasExecuted':False},indent=2)+'\n')
