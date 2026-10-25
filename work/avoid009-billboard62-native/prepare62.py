from pathlib import Path
import hashlib,json
root=Path('/workspace/lyricfx.JIZURA');d=root/'work/avoid009-billboard62-native';source=(root/'src/11p_layoutsD.js').read_text();a=source.index("reg('billboard', {");b=source.index('/* ================================================================== 16 crowdBubbles',a);old=source[a:b];s=old;changes=[]
def edit(before,after):
 global s
 assert s.count(before)==1,(before,s.count(before));s=s.replace(before,after);changes.append({'before':before,'after':after})
needle='    const port = isPort(env);'
helper='''    const nativeD=cut.placementLayoutsD===true,matrixNow=()=>{const m=ctx.getTransform();return[m.a,m.b,m.c,m.d,m.e,m.f];};
    const clone=v=>Array.isArray(v)?v.map(clone):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clone(x)])):typeof v==='function'?{nativeFunctionSource:String(v),notExecutableSerialization:true}:v;
    const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
    const textBudget=nativeD&&typeof cut.text==='string'&&cut.text.length<=4096&&[...cut.text].length<=512,paramScope=nativeD&&Number.isInteger(Pm.lamps)&&Pm.lamps>=3&&Pm.lamps<=4&&Number.isFinite(Pm.sweep)&&typeof Pm.font==='string',captureD=nativeD&&textBudget&&paramScope;
    const catalog=nativeD?{kind:'billboard-native-catalog',version:1,nativeOnly:true,complete:false,bounded:captureD,status:captureD?'collecting':textBudget?'partial-scope':'partial-budget',unsupported:captureD?null:textBudget?'catalog-scope:stockL3or4/finiteSweep/fontString':'catalog-budget:4096UTF16/512codepoints',limits:{textUTF16:4096,textCodepoints:512,calls:1024},role:'primary',stage:[env.plan?.W??W,env.plan?.H??H],environmentSize:[W,H],root:matrixNow(),pass:env.pass,clock:{t:env.t,realTime:env.realTime,lt,ltb:env.ltb,step:env.step,pIn:env.pIn,pOut:env.pOut,beat:clone(env.beat),beatPulse:env.beatPulse},seed:s,params:clone(Pm),sourceInputs:{text:textBudget?cut.text:null,lineText:textBudget?cut.lineText:null,line:cut.line,start:cut.start,end:cut.end,dur:cut.dur,inDur:cut.inDur,outDur:cut.outDur,stagger:cut.stagger,enter:cut.enter,hold:cut.hold,exit:cut.exit,treat:cut.treat,motionScale:cut.motionScale},effectiveFX:clone(env.fx),sourceCalls:[],primaryOwners:[],independentDecorOwners:[],lampStates:[],ownerCatalog:[],painterOrder:'posts,braces,deck,11uprights,rail,ground,frame,face; clippedcones,illumination; eacharm/body/lens; mainDraw; No,sourceTime',motionUnchanged:true}:null;
    if(nativeD)env.placementDGeometry=catalog;
    let currentCall=null,finished=false;
    const owned=(owner,kind,fn)=>{if(!nativeD)return fn();const id='billboard.'+owner;let call=null;if(captureD&&catalog.sourceCalls.length<1024){call={ordinal:catalog.sourceCalls.length,owner:id,role:'primary',kind,matrixBeforeCall:matrixNow(),globalAlphaBefore:ctx.globalAlpha};catalog.sourceCalls.push(call);if(!catalog.primaryOwners.includes(id))catalog.primaryOwners.push(id);}else if(captureD){catalog.bounded=false;catalog.status='partial-budget';catalog.unsupported='catalog-budget:1024calls';}const previous=currentCall;currentCall=call;try{return env.withDrawRole('primary',id,fn);}finally{if(call){call.matrixAfterCall=matrixNow();call.globalAlphaAfter=ctx.globalAlpha;}currentCall=previous;}};
    const args=v=>{if(currentCall)currentCall.arguments=clone(v);return v;};
    const item=v=>{if(currentCall)currentCall.arguments=[clone(v)];return v;};
    const gradientArgs=v=>{if(currentCall)currentCall.gradient={kind:'radial',arguments:clone(v),creationMatrix:matrixNow(),stops:[]};return v;};
    const stopArgs=v=>{if(currentCall)currentCall.gradient.stops.push(clone(v));return v;};
    const pathArgs=(kind,v)=>{if(currentCall){currentCall.path??=[];currentCall.path.push({kind,arguments:clone(v),matrix:matrixNow()});}return v;};
    try {
'''
edit(needle,helper+needle)
edit('    const tc = onCol(sc, faceC);',"    const tc = onCol(sc, faceC);\n    if(captureD)Object.assign(catalog,{port,text,out,bw,bh,bx,by,groundY,rise,y0,a0,steel,faceC,tc});")
edit('    for (const px of [bx + bw * 0.22, bx + bw * 0.78]) env.rect(px - pw / 2, y0 + bh, pw, groundY - y0 - bh, steel, a0, false);',"    let postIndex=0;for (const px of [bx + bw * 0.22, bx + bw * 0.78]) {const i=postIndex++;owned('structure.post.'+i,'rect',()=>env.rect(...args([px - pw / 2, y0 + bh, pw, groundY - y0 - bh, steel, a0, false])));}")
def wrap(call,owner,kind):
 edit(call,"owned("+owner+",'"+kind+"',()=>"+call[:-1]+');')
# Every original env argument is evaluated once, in original left-to-right order.
calls=[
("env.line([[x1, yb], [x2, yb2]], steel, lw, a0, false);","'structure.brace.0'",'line'),
("env.line([[x2, yb], [x1, yb2]], steel, lw, a0, false);","'structure.brace.1'",'line'),
("env.rect(bx + bw * 0.04, cwY, bw * 0.92, bh * 0.025, steel, a0, false);","'catwalk.deck'",'rect'),
("env.rect(bx + bw * (0.04 + 0.92 * i / 10) - lw / 2, cwY - bh * 0.07, lw, bh * 0.07, steel, a0 * 0.8, false);","'catwalk.upright.'+i",'rect'),
("env.line([[bx + bw * 0.04, cwY - bh * 0.07], [bx + bw * 0.96, cwY - bh * 0.07]], steel, lw, a0 * 0.8, false);","'catwalk.rail'",'line'),
("env.line([[W * 0.03, groundY], [W * 0.97, groundY]], sc.sub, lw, 0.5 * a0, false);","'ground.line'",'line'),
("env.rect(bx - bw * 0.015, y0 - bw * 0.015, bw * 1.03, bh + bw * 0.03, steel, a0, false);","'board.frame'",'rect'),
("env.rect(bx, y0, bw, bh, J.mix(faceC, darkOf(sc), 0.28), a0, gIn(env));","'board.face'",'rect'),
("env.line([[lx, cwY], [lx, ly + bh * 0.02]], steel, lw * 1.5, a0, false);","'lamp.'+i+'.arm'",'line'),
("env.poly([[lx - bh * 0.05, ly + bh * 0.03], [lx + bh * 0.05, ly + bh * 0.03], [lx + bh * 0.035, ly - bh * 0.03], [lx - bh * 0.035, ly - bh * 0.03]], steel, a0, false);","'lamp.'+i+'.body'",'poly'),
("env.circle(lx, ly - bh * 0.03, bh * 0.025, lightOf(sc), null, 0, a0, false);","'lamp.'+i+'.lens'",'circle')]
for call,owner,kind in calls:
 method=call[:call.index('(')];arguments=call[call.index('(')+1:-2]
 edit(call,"owned("+owner+",'"+kind+"',()=>"+method+'(...args(['+arguments+'])));')
edit('      lampOn.push(on);','      lampOn.push(on);\n      if(captureD)catalog.lampStates.push({i,t1,on,lt,ltb:env.ltb,step:env.step,sourceConeThresholdMet:on>0.01,sourceLensThresholdMet:on>0.5});')
edit("    if (env.pass === 'main') {", "    if(captureD)Object.assign(catalog,{pw,lw,x1,x2,yb,yb2,cwY,L,lampOn:lampOn.slice(),sourceOwnClip:env.pass==='main'?{rectangle:[bx,y0,bw,bh],matrix:matrixNow(),scope:'main cones+illumination only; original source clip, not new mask'}:null});\n    if (env.pass === 'main') {")
edit('        const lx = bx + bw * (i + 0.5) / L, ly = y0 + bh + bh * 0.06;',"        owned('lamp.'+i+'.cone','source-clipped-radial-path',()=>{\n        const lx = bx + bw * (i + 0.5) / L, ly = y0 + bh + bh * 0.06;")
edit('ctx.createRadialGradient(lx, ly, 0, lx, ly, bh * 1.2)', 'ctx.createRadialGradient(...gradientArgs([lx, ly, 0, lx, ly, bh * 1.2]))')
for v in ['0, J.rgba(faceC, 0.95 * lampOn[i])','0.6, J.rgba(faceC, 0.6 * lampOn[i])','1, J.rgba(faceC, 0)']:
 edit('g.addColorStop('+v+')','g.addColorStop(...stopArgs(['+v+']))')
for method,v in [('moveTo','lx - bw * 0.02, ly'),('lineTo','tx - spread, ty'),('lineTo','tx + spread, ty'),('lineTo','lx + bw * 0.02, ly')]:
 edit('ctx.'+method+'('+v+')','ctx.'+method+"(...pathArgs('"+method+"',["+v+']))')
edit('ctx.closePath(); ctx.fill();',"ctx.closePath();if(currentCall){currentCall.alphaAtFill=ctx.globalAlpha;currentCall.fillMatrix=matrixNow();currentCall.clipScope='sourceOwnClip';currentCall.path.push({kind:'closePath',arguments:[],matrix:matrixNow()});} ctx.fill();\n        });")
edit('      ctx.globalAlpha = 0.55 * lit * a0; ctx.fillStyle = faceC; ctx.fillRect(bx, y0, bw, bh);',"      owned('board.illumination','source-clipped-fillRect',()=>{ctx.globalAlpha = 0.55 * lit * a0; ctx.fillStyle = faceC;if(currentCall){currentCall.alphaAtFill=ctx.globalAlpha;currentCall.clipScope='sourceOwnClip';}ctx.fillRect(...args([bx,y0,bw,bh]));});")
main="J.mainDraw(env, { text, font: Pm.font, size, x: W / 2, y: y0 + bh / 2 + (Pm.tag ? bh * 0.03 : 0), track: 0.04, lead: 1.1, color: tc, noHold: plateHold(env), mi: miAt(env, 0.3) })"
edit(main,"owned('lyric.main','mainDraw',()=>J.mainDraw(env,item({ text, font: Pm.font, size, x: W / 2, y: y0 + bh / 2 + (Pm.tag ? bh * 0.03 : 0), track: 0.04, lead: 1.1, color: tc, noHold: plateHold(env), mi: miAt(env, 0.3) })))")
for owner,call in [('tag.number',"env.draw({ text: 'No.' + lineNo(env), font: monoF(env), size: fs, align: 'left', track: 0.2, x: bx + bw * 0.025, y: y0 + fs * 1.1, color: tc, alpha: 0.7 * a0, ghost: false });"),('tag.time',"env.draw({ text: J.fmtTime(cut.start), font: monoF(env), size: fs, align: 'right', track: 0.2, x: bx + bw * 0.975, y: y0 + fs * 1.1, color: tc, alpha: 0.7 * a0, ghost: false });")]:
 edit(call,"owned('"+owner+"','item',()=>env.draw(item("+call[len('env.draw('):-2]+')));')
edit('    return bb || box(bx, y0, bx + bw, y0 + bh);',"    if(captureD){catalog.mainReturnedBB=clone(bb);catalog.mainSize=size;const owners=['structure.post.0','structure.post.1','structure.brace.0','structure.brace.1','catwalk.deck',...Array.from({length:11},(_,i)=>'catwalk.upright.'+i),'catwalk.rail','ground.line','board.frame','board.face',...Array.from({length:L},(_,i)=>'lamp.'+i+'.cone'),'board.illumination',...Array.from({length:L},(_,i)=>['lamp.'+i+'.arm','lamp.'+i+'.body','lamp.'+i+'.lens']).flat(),'lyric.main','tag.number','tag.time'];catalog.ownerCatalog=owners.map(owner=>({owner:'billboard.'+owner,role:'primary',sourceConditional:owner==='board.illumination'||owner.includes('.cone')||owner.includes('.lens')||owner.startsWith('tag.')}));}\n    finished=true;return bb || box(bx, y0, bx + bw, y0 + bh);\n    } finally {if(nativeD){catalog.complete=finished&&catalog.bounded;catalog.status=catalog.complete?'complete':finished?catalog.status:'native-threw';freeze(catalog);}}")
(d/'src/11p_layoutsD.js').write_text(source[:a]+s+source[b:]);(d/'evidence/source-diff62.json').write_text(json.dumps({'kind':'SOURCE62-only-billboard-native-metadata-diff','originalBlockSHA256':hashlib.sha256(old.encode()).hexdigest(),'canonicalDSHA256':hashlib.sha256(source.encode()).hexdigest(),'changes':changes,'noPaintingPhysicsClockSizeChanges':True},ensure_ascii=False,indent=2)+'\n');print('SOURCE62 isolated D source generated; no app')
