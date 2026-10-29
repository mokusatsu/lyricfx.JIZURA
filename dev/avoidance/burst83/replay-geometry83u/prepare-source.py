from pathlib import Path
import sys,hashlib,json,difflib
D=Path(__file__).resolve().parent;R=Path(sys.argv[1]);S=R/'dev/avoidance/burst83/no-paint83n/scalar-support83.js';M=R/'dev/avoidance/burst83/compiler83q/clock-compiler83.js';s=S.read_text();m=M.read_text();baseS=s;baseM=m
replacements=[("const lay=J.layoutText(it),record={ordinal,owner,seed,text:it.text,size:it.size,font:it.font,rows:[]}","const lay=J.layoutText(it),record={ordinal,owner,seed,text:it.text,size:it.size,font:it.font,transform:[it.x,it.y,it.rot||0],rows:[]}"),("row={i:g.i,ch:g.ch,line:g.li,font:ctx.font,ink,matrix:m,bounds}","row={i:g.i,ch:g.ch,line:g.li,font:ctx.font,ink,matrix:m,translate:[g.x,g.y],bounds}"),("const m=matrix(ctx),bounds=B.affineBox(local,m,{localPad:pad});add({owner,ordinal,kind:part.kind,bounds,strokeState});","const m=matrix(ctx);need(m.every((v,i)=>Object.is(v,shiftedRoot[i])),'BURST83U_SHAPE_ROOT');const bounds=B.affineBox(local,m,{localPad:pad});add({owner,ordinal,kind:part.kind,bounds,strokeState,geometry:{local,localPad:pad}});")]
for a,b in replacements:assert s.count(a)==1;s=s.replace(a,b)
s=s.replace("'burstScalarSupport83n'","'burstScalarSupport83u'")
m=m.replace('glyphs:sample.glyphs.map(g=>({text:', 'glyphs:sample.glyphs.map(g=>({ordinal:g.ordinal,text:')
s=s.replace('burst-no-paint-support83n','burst-no-paint-support83u')
m=m.replace('burst-current-input-model83q','burst-current-input-model83u')
m=m.replace('S=A.burstScalarSupport83n','S=A.burstScalarSupport83u').replace("'burstClockCompiler83q'","'burstClockCompiler83u'")
a="bounds:copyBounds(s.bounds)})),glyphs:";b="bounds:copyBounds(s.bounds),...(s.kind==='glyph'?{}:{geometry:{local:copyBounds(s.geometry.local),localPad:s.geometry.localPad}})})),glyphs:";assert m.count(a)==1;m=m.replace(a,b)
a="size:g.size,seed:g.seed,rows:";b="size:g.size,seed:g.seed,transform:g.transform.slice(),rows:";assert m.count(a)==1;m=m.replace(a,b)
a="ink:{...r.ink},matrix:r.matrix.slice()}";b="ink:{...r.ink},matrix:r.matrix.slice(),translate:r.translate.slice()}";assert m.count(a)==1;m=m.replace(a,b)
for name,old,new in [('scalar-support83u.js',baseS,s),('clock-compiler83u.js',baseM,m)]:
 (D/name).write_text(new);(D/(name+'.patch')).write_text(''.join(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='prior/'+name,tofile='83u/'+name,n=0)))
(D/'boundary.json').write_text(json.dumps({'baseSamplerSHA256':hashlib.sha256(S.read_bytes()).hexdigest(),'baseCompilerSHA256':hashlib.sha256(M.read_bytes()).hexdigest(),'change':'retain local shape boxes/padding with exact shape-root guard; retain native glyph prefix translations/rotation; no sampling arithmetic or paint added','sourceOnly':True,'certificateIssuer':False},indent=2)+'\n')
