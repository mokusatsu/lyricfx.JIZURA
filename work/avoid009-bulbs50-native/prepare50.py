"""Source-only deterministic metadata edit recipe; never invokes application code."""
from pathlib import Path
import json,hashlib
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-bulbs50-native';original=(R/'src/11p_layoutsD.js').read_text();a=original.index("reg('bulbs', {");z=original.index('/* ================================================================== 14 ledScroll',a);block=original[a:z];edits=[]
def edit(before,after):
 global block
 assert block.count(before)==1,before;block=block.replace(before,after);edits.append({'before':before,'after':after})
edit('    const port = isPort(env);', '''    const nativeD = cut.placementLayoutsD === true;
    const matrixNow = () => {const v=ctx.getTransform();return [v.a,v.b,v.c,v.d,v.e,v.f];};
    const clone = v => Array.isArray(v)?v.map(clone):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clone(x)])):v;
    const freeze = v => {if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
    const captureD = nativeD && typeof cut.text==='string' && cut.text.length<=4096 && [...cut.text].length<=512;
    const catalog = nativeD?{kind:'bulbs-native-catalog',version:1,nativeOnly:true,complete:false,bounded:captureD,status:captureD?'collecting':'partial-budget',unsupported:captureD?null:'catalog-budget:max4096UTF16/512codepoints/1024calls',limits:{textUTF16:4096,textCodepoints:512,calls:1024},owner:'bulbs.sign',role:'primary',stage:[env.plan?.W??W,env.plan?.H??H],environmentSize:[W,H],root:matrixNow(),pass:env.pass,clock:{t:env.t,realTime:env.realTime,lt,ltb:env.ltb,step:env.step,pIn:env.pIn,pOut:env.pOut,beat:clone(env.beat),beatPulse:env.beatPulse},seed:s,params:clone(Pm),effectiveFX:clone(env.fx),sourceInputs:{text:captureD?cut.text:null,lineText:captureD?cut.lineText:null,line:cut.line,inDur:cut.inDur,outDur:cut.outDur,dur:cut.dur,start:cut.start,end:cut.end,stagger:cut.stagger,enter:cut.enter,hold:cut.hold,exit:cut.exit,treat:cut.treat,motionScale:cut.motionScale},sourceCalls:[],primaryOwners:[],independentDecorOwners:[],rings:[],motionUnchanged:true,painterOrder:'shadow,face,outline; each ring each light halo,bulb,glint; full mainDraw; subtitle'}:null;
    if(nativeD)env.placementDGeometry=catalog;
    let finished=false;
    const owned=(owner,kind,fn)=>{if(!nativeD)return fn();const id='bulbs.sign.'+owner;let call=null;if(captureD&&catalog.sourceCalls.length<1024){call={ordinal:catalog.sourceCalls.length,owner:id,role:'primary',kind,matrixBeforeCall:matrixNow()};catalog.sourceCalls.push(call);if(!catalog.primaryOwners.includes(id))catalog.primaryOwners.push(id);}else if(captureD){catalog.bounded=false;catalog.status='partial-budget';catalog.unsupported='catalog-budget:1024calls';}try{return env.withDrawRole('primary',id,fn);}finally{if(call)call.matrixAfterCall=matrixNow();}};
    try {
    const port = isPort(env);''')
edit('    if (q <= 0.01 || out <= 0) return null;', '''    if(captureD)Object.assign(catalog,{port,text,m100:clone(m100),subT,size,m:clone(m),ss,padX,padY,bw,bh,ax,cx,cy,x0,y0,arrow,maxW,maxH,out,q,dark,board,bulbC,textC,shape:clone(shape),sp:clone(sp),culled:q<=0.01||out<=0,cullReason:q<=0.01?'q<=.01':out<=0?'out<=0':null});
    if (q <= 0.01 || out <= 0) {finished=true;return null;}''')
for before,owner,kind in [
("env.poly(sp.map(([x, y]) => [x + u * 0.012, y + u * 0.016]), darkOf(sc), 0.3 * out, false)",'shadow','poly'),
("env.poly(sp, board, out, gIn(env))",'face','poly'),
("outline(env, sp, J.mix(board, bulbC, 0.35), Math.max(1.5, u * 0.003), out)",'outline','outline')]:edit('    '+before+';',"    owned('"+owner+"','"+kind+"',()=>"+before+');')
edit('    rings.forEach((k, ri) => {', '''    if(captureD)Object.assign(catalog,{r,ringInsets:rings.slice(),beatFlash,step,ghostFace:gIn(env),outlineWidth:Math.max(1.5,u*.003),shadowOffset:[u*.012,u*.016]});
    rings.forEach((k, ri) => {''')
edit('      const pts = resample(inset(k), r * 3.3, 140);', '''      const insetPoints = inset(k);
      const pts = resample(insetPoints, r * 3.3, 140);''')
edit('      const N = pts.length;', '''      const N = pts.length;
      let ring=null;if(captureD){const segments=insetPoints.map((a,i)=>{const b=insetPoints[(i+1)%insetPoints.length];return Math.hypot(b[0]-a[0],b[1]-a[1]);});ring={ri,k,insetPoints:clone(insetPoints),points:clone(pts),N,spacing:r*3.3,maxN:140,segmentsRecomputedMetadata:segments,totalLengthRecomputedMetadata:segments.reduce((a,b)=>a+b,0),derivation:'inset evaluated once; original resample result; segment lengths separately recomputed metadata only',lights:[]};catalog.rings.push(ring);}''')
edit('          const j = (i * Pm.dir + N * 4) % N;', '''          const j = (i * Pm.dir + N * 4) % N;
          if(ring)ring.pendingJ=j;''')
edit("        if (lit > 0.5) env.circle(p[0], p[1], r * 2.1, col, null, 0, 0.16 * lit * out, false);",'''        const owner='ring.'+ri+'.state.'+N+'.'+i;
        if(ring){ring.lights.push({i,N,fraction:i/N,p:clone(p),on0,j:on0?ring.pendingJ:null,lit,col,halo:lit>.5,glint:lit>.5,out,r});delete ring.pendingJ;}
        if (lit > 0.5) owned(owner+'.halo','circle',()=>env.circle(p[0], p[1], r * 2.1, col, null, 0, 0.16 * lit * out, false));''')
edit("        env.circle(p[0], p[1], r, lit > 0 ? J.mix(J.mix(board, col, 0.3), col, lit) : J.mix(board, col, 0.22), null, 0, out, false);", "        owned(owner+'.bulb','circle',()=>env.circle(p[0], p[1], r, lit > 0 ? J.mix(J.mix(board, col, 0.3), col, lit) : J.mix(board, col, 0.22), null, 0, out, false));")
edit("        if (lit > 0.5) env.circle(p[0] - r * 0.25, p[1] - r * 0.3, r * 0.35, '#FFFFFF', null, 0, 0.7 * lit * out, false);", "        if (lit > 0.5) owned(owner+'.glint','circle',()=>env.circle(p[0] - r * 0.25, p[1] - r * 0.3, r * 0.35, '#FFFFFF', null, 0, 0.7 * lit * out, false));")
edit('    const bb = J.mainDraw(env, Object.assign({ text, font: Pm.font, size: size * Math.min(1, q), x: cx, y: ty, color: textC, noHold: plateHold(env) }, o));', '''    if(captureD)catalog.lyric={owner:'bulbs.sign.lyric',text,font:Pm.font,size:size*Math.min(1,q),x:cx,y:ty,track:o.track,lead:o.lead};
    const bb = owned('lyric','mainDraw',()=>J.mainDraw(env, Object.assign({ text, font: Pm.font, size: size * Math.min(1, q), x: cx, y: ty, color: textC, noHold: plateHold(env) }, o)));''')
edit("      env.draw({ text: t, font: bodyF(env), size: sz, x: cx, y: cy + m.h / 2 + padY * 0.1, track: 0.18, color: bulbC, alpha: tin(env, 0.3, 0.3) * out, ghost: false });", "      if(captureD)catalog.subtitle={owner:'bulbs.sign.subtitle',original:subT,text:t,UTF16Length:subT.length,truncated:subT.length>28,fs,size:sz,x:cx,y:cy+m.h/2+padY*.1};\n      owned('subtitle','draw',()=>env.draw({ text: t, font: bodyF(env), size: sz, x: cx, y: cy + m.h / 2 + padY * 0.1, track: 0.18, color: bulbC, alpha: tin(env, 0.3, 0.3) * out, ghost: false }));")
edit('    return bb;\n  },', '''    if(captureD)catalog.bb=clone(bb);
    finished=true;return bb;
    } finally {if(nativeD){catalog.complete=finished&&catalog.bounded;catalog.status=catalog.complete?'complete':finished?'partial-budget':'native-threw';freeze(catalog);}}
  },''')
modified=original[:a]+block+original[z:];(D/'src/11p_layoutsD.js').write_text(modified);(D/'evidence/edits50.json').write_text(json.dumps(edits,ensure_ascii=False,indent=2)+'\n');back=block
for x in reversed(edits):assert back.count(x['after'])==1;back=back.replace(x['after'],x['before'])
assert original==modified[:a]+back+modified[a+len(block):]
print(json.dumps({'kind':'SOURCE50-source-only-recipe','changes':len(edits),'originalSHA256':hashlib.sha256(original.encode()).hexdigest(),'candidateSHA256':hashlib.sha256(modified.encode()).hexdigest(),'inverseExact':True,'applicationExecuted':False}))
