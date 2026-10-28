from pathlib import Path
import difflib,json,hashlib
D=Path(__file__).resolve().parent;B=D.parent/'81b';base=(B/'11p_layoutsD-text-lamps81.js').read_text();a=base.index("reg('billboard',");b=base.index('/* ================================================================== 16 ',a);block=base[a:b];s=block;changes=[]
def change(old,new,count=1):
 global s
 assert s.count(old)==count,(old,s.count(old));s=s.replace(old,new);changes.append((old,new,count))
cases=[
 ('post','rect','[px - pw / 2, y0 + bh, pw, groundY - y0 - bh, steel, a0, false]','{px,pw,y0,bh,groundY,steel,a0}'),
 ('brace0','line','[[[x1, yb], [x2, yb2]], steel, lw, a0, false]','{x1,x2,yb,yb2,steel,lw,a0}'),
 ('brace1','line','[[[x2, yb], [x1, yb2]], steel, lw, a0, false]','{x1,x2,yb,yb2,steel,lw,a0}'),
 ('deck','rect','[bx + bw * 0.04, cwY, bw * 0.92, bh * 0.025, steel, a0, false]','{bx,bw,cwY,bh,steel,a0}'),
 ('upright','rect','[bx + bw * (0.04 + 0.92 * i / 10) - lw / 2, cwY - bh * 0.07, lw, bh * 0.07, steel, a0 * 0.8, false]','{bx,bw,i,lw,cwY,bh,steel,a0}'),
 ('rail','line','[[[bx + bw * 0.04, cwY - bh * 0.07], [bx + bw * 0.96, cwY - bh * 0.07]], steel, lw, a0 * 0.8, false]','{bx,bw,cwY,bh,steel,lw,a0}'),
 ('ground','line','[[[W * 0.03, groundY], [W * 0.97, groundY]], sc.sub, lw, 0.5 * a0, false]','{groundY,lw,a0}'),
 ('frame','rect','[bx - bw * 0.015, y0 - bw * 0.015, bw * 1.03, bh + bw * 0.03, steel, a0, false]','{bx,bw,y0,bh,steel,a0}'),
 ('face','rect','[bx, y0, bw, bh, J.mix(faceC, darkOf(sc), 0.28), a0, gIn(env)]','{bx,y0,bw,bh,faceC,a0}'),
 ('arm','line','[[[lx, cwY], [lx, ly + bh * 0.02]], steel, lw * 1.5, a0, false]','{lx,ly,cwY,bh,steel,lw,a0}'),
 ('body','poly','[[[lx - bh * 0.05, ly + bh * 0.03], [lx + bh * 0.05, ly + bh * 0.03], [lx + bh * 0.035, ly - bh * 0.03], [lx - bh * 0.035, ly - bh * 0.03]], steel, a0, false]','{lx,ly,bh,steel,a0}'),
 ('lens','circle','[lx, ly - bh * 0.03, bh * 0.025, lightOf(sc), null, 0, a0, false]','{lx,ly,bh,a0}'),
]
for kind,method,expr,values in cases:change('env.'+method+'(...args('+expr+'))',"env."+method+"(...args(billboardPart81(env,'"+kind+"',"+values+")))")
change('const pw = bw * 0.035;','const pw = billboardPostWidth81(bw);')
change('const lw = Math.max(1.2, u * 0.0025);','const lw = billboardLineWidth81(u);')
change('const x1 = bx + bw * 0.22, x2 = bx + bw * 0.78, yb = y0 + bh + (groundY - y0 - bh) * 0.25, yb2 = groundY - (groundY - y0 - bh) * 0.1;','const {x1,x2,yb,yb2}=billboardBraceMetrics81({bx,bw,y0,bh,groundY});')
change('const cwY = y0 + bh + bh * 0.1;','const cwY = billboardDeckY81(y0,bh);')
change('const lx = bx + bw * (i + 0.5) / L, ly = y0 + bh + bh * 0.06;','const {lx,ly}=billboardLampPosition81({bx,bw,y0,bh,L},i);',2)
change('const ang = (-90 + Math.sin(env.ltb * 0.8 + i * 1.7) * Pm.sweep) * J.DEG;\n        const tx = lx + Math.cos(ang) * bh * 1.25, ty = ly + Math.sin(ang) * bh * 1.25;','const {ang,tx,ty}=billboardConeAim81(env,{lx,ly,bh},i,Pm.sweep);')
change('gradientArgs([lx, ly, 0, lx, ly, bh * 1.2])',"gradientArgs(billboardPart81(env,'coneGradient',{lx,ly,bh}))")
change('const spread = bw / L * 0.75;','const spread = billboardConeSpread81(bw,L);')
change('ctx.rect(bx, y0, bw, bh);',"ctx.rect(...billboardPart81(env,'clip',{bx,y0,bw,bh}));")
change('const lit = lampOn.reduce((a, b) => a + b, 0) / L;','const lit = billboardLit81(lampOn,L);')
change('ctx.globalAlpha = 0.55 * lit * a0;', 'ctx.globalAlpha = billboardIlluminationAlpha81(lit,a0);')
change('args([bx,y0,bw,bh])',"args(billboardPart81(env,'illumination',{bx,y0,bw,bh}))")
# All original path methods/argument captures stay at their original callsites.
for name,expr in [('coneMove0','[lx - bw * 0.02, ly]'),('coneLine0','[tx - spread, ty]'),('coneLine1','[tx + spread, ty]'),('coneMove1','[lx + bw * 0.02, ly]')]:
 change(expr,
  "billboardPart81(env,'"+name+"',{lx,ly,bw,tx,ty,spread})")
helper="""function billboardPostWidth81(bw){return bw * 0.035}
function billboardLineWidth81(u){return Math.max(1.2, u * 0.0025)}
function billboardBraceMetrics81({bx,bw,y0,bh,groundY}){const x1 = bx + bw * 0.22, x2 = bx + bw * 0.78, yb = y0 + bh + (groundY - y0 - bh) * 0.25, yb2 = groundY - (groundY - y0 - bh) * 0.1;return{x1,x2,yb,yb2}}
function billboardDeckY81(y0,bh){return y0 + bh + bh * 0.1}
function billboardLampPosition81({bx,bw,y0,bh,L},i){const lx = bx + bw * (i + 0.5) / L, ly = y0 + bh + bh * 0.06;return{lx,ly}}
function billboardConeAim81(env,{lx,ly,bh},i,sweep){const ang = (-90 + Math.sin(env.ltb * 0.8 + i * 1.7) * sweep) * J.DEG;const tx = lx + Math.cos(ang) * bh * 1.25, ty = ly + Math.sin(ang) * bh * 1.25;return{ang,tx,ty}}
function billboardConeSpread81(bw,L){return bw / L * 0.75}
function billboardLit81(lampOn,L){return lampOn.reduce((a, b) => a + b, 0) / L}
function billboardIlluminationAlpha81(lit,a0){return 0.55 * lit * a0}
function billboardPart81(env,kind,v){const {W,sc}=env,{px,pw,y0,bh,groundY,steel,a0,x1,x2,yb,yb2,lw,bx,bw,cwY,i,lx,ly,faceC,tx,ty,spread}=v;switch(kind){
"""
for kind,method,expr,values in cases:helper+="case '"+kind+"':return "+expr+";\n"
for kind,expr in [('coneGradient','[lx, ly, 0, lx, ly, bh * 1.2]'),('clip','[bx,y0,bw,bh]'),('illumination','[bx,y0,bw,bh]'),('coneMove0','[lx - bw * 0.02, ly]'),('coneLine0','[tx - spread, ty]'),('coneLine1','[tx + spread, ty]'),('coneMove1','[lx + bw * 0.02, ly]')]:helper+="case '"+kind+"':return "+expr+";\n"
helper+="default:throw Object.assign(Error('BILLBOARD81_PART_NAME'),{code:'BILLBOARD81_PART_NAME'});}}\n"
old_export="Object.defineProperty(J.placement,'billboardNativeGeometry81',{enumerable:true,value:Object.freeze({initial:billboardInitial81,mainSize:billboardMainSize81,mainItem:billboardMainItem81,lampOn:billboardLampOn81,tagSize:billboardTagSize81,tagNumber:billboardTagNumber81,tagTime:billboardTagTime81,sourceOnly:true,certificateIssuer:false})});"
new_export=old_export.replace('sourceOnly:true',"postWidth:billboardPostWidth81,lineWidth:billboardLineWidth81,braces:billboardBraceMetrics81,deckY:billboardDeckY81,lampPosition:billboardLampPosition81,coneAim:billboardConeAim81,coneSpread:billboardConeSpread81,lit:billboardLit81,illuminationAlpha:billboardIlluminationAlpha81,part:billboardPart81,sourceOnly:true")
assert base.count(old_export)==1
out=(base[:a]+s+base[b:]).replace(old_export,helper+new_export)
inverse=s
for x,y,n in reversed(changes):assert inverse.count(y)==n;inverse=inverse.replace(y,x)
assert inverse==block
assert out.replace(helper+new_export,old_export).replace(s,block,1)==base
(D/'11p_layoutsD-parts81.js').write_text(out);(D/'parts81.diff').write_text(''.join(difflib.unified_diff(base.splitlines(True),out.splitlines(True),n=0,fromfile='a/src/11p_layoutsD.js',tofile='b/src/11p_layoutsD.js')))
(D/'parts-helpers81.js.txt').write_text(helper);(D/'part-cases.json').write_text(json.dumps(cases,indent=2)+'\n')
(D/'parts-boundary.json').write_text(json.dumps({'baseSHA256':hashlib.sha256(base.encode()).hexdigest(),'candidateSHA256':hashlib.sha256(out.encode()).hexdigest(),'inverseWhole81bExact':True,'parts':len(cases)+7,'sourceCalls':'same methods/ordering/arguments and owned callbacks; clipping/gradient state not generalized','lineWidth':'raw source width only; future support must use actual Canvas setter/readback/state','productApplied':False,'CanvasExecuted':False},indent=2)+'\n')
