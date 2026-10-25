"""Initial source-only generation transcript. Do not rerun over reviewed source30: later source-only tailoring is recorded in HANDOFF30. No Canvas execution."""
import pathlib,json,shutil,difflib
B=pathlib.Path(__file__).parent;OLD=B.parent/'source29'
for n in ['native-factory.js','observer-factory.js']:(B/n).write_bytes((OLD/n).read_bytes())
p=(OLD/'private-factory.js').read_text()
p=p.replace("![1,.6].includes(recipe.scale)","![1,.6,.58,.55].includes(recipe.scale)")
p=p.replace("!['scale','below'].includes(k)","!['scale','below','profile'].includes(k)")
p=p.replace(" const accepted=Object.freeze({scale:recipe.scale,below:recipe.below});", " if(recipe.scale===1 ? recipe.below!==false||recipe.profile!==undefined : recipe.below!==true||!['A','B','C'].includes(recipe.profile))throw Error('CROSSWORD30_PROFILE');\n const accepted=Object.freeze({scale:recipe.scale,below:recipe.below,profile:recipe.profile});")
p=p.replace("    const gw = C * cell, gh = R * cell;", "    const profile=recipe?.profile, numberY=profile&&profile!=='A'?.18:.15, mainRatio=profile?(profile==='B'?.7:.65):.7, mainY=profile?(profile==='B'?.62:.64):.56;\n    const gw = C * cell, gh = R * cell;")
p=p.replace('size: recipe ? nativeCell * 0.2 : cell * 0.2','size: profile&&profile!==\'A\'?12:recipe?nativeCell*.2:cell*.2')
p=p.replace('y: y + cell * 0.15','y: y + cell * numberY')
p=p.replace('y = gy + (rowsW[wi] + 0.56) * cell','y = gy + (rowsW[wi] + mainY) * cell')
p=p.replace('size: cell * 0.7','size: cell * mainRatio')
(B/'private-factory.js').write_text(p)
(B/'private30.diff').write_text(''.join(difflib.unified_diff((OLD/'private-factory.js').read_text().splitlines(True),p.splitlines(True),fromfile='source29/private-factory.js',tofile='source30/private-factory.js')))
native=(OLD/'native-factory.js').read_text();cell='    const cell = Math.min(W * (0.88 - clueW) / C, H * (below ? 0.64 : 0.8) / R, u * 0.14);';fs='    const fsC = Math.max(smallSize(env) * 1.15, cell * 0.24);';gx='    const gx = (W - gw - (clueW ? W * clueW : 0)) / 2, gy = (H - gh - (below ? fsC * 5 : 0)) / 2;'
shapes=[]
for scale in [.6,.58,.55]:
 for profile in ['A','B','C']:
  shape={'id':str(round(scale*100))+profile,'scale':scale,'below':True,'profile':profile};shapes.append(shape)
  # Independent literal source starts from native, never from private render.
  q=native.replace(cell,cell.replace('const cell','const nativeCell')+'\n    const cell=nativeCell*'+repr(scale)+';')
  q=q.replace(fs,fs.replace('cell * 0.24','nativeCell * 0.24')).replace(gx,'    const gx=(W-gw)/2, gy=(H-gh-fsC*5)/2;')
  q=q.replace('size: cell * 0.2','size: '+('nativeCell*.2' if profile=='A' else '12'))
  q=q.replace('y: y + cell * 0.15','y: y + cell * '+('.15' if profile=='A' else '.18'))
  q=q.replace('y = gy + (rowsW[wi] + 0.56) * cell','y = gy + (rowsW[wi] + '+('.62' if profile=='B' else '.64')+') * cell')
  q=q.replace('size: cell * 0.7','size: cell * '+('.7' if profile=='B' else '.65'))
  i=q.index('    if (Pm.clue) {');q=q[:i]+q[i:].replace('below ?','true ?').replace('below &&','true &&')
  (B/('oracle-'+shape['id']+'-factory.js')).write_text(q)
(B/'policy30.json').write_text(json.dumps({'shapes':shapes,'sparseN':[0,18,24,90,231,249],'circles':[{'id':'default','cx':480,'cy':226.8,'effectiveRadius':110.7},{'id':'upper26','cx':480,'cy':140.4,'effectiveRadius':110.7}],'upperPolicy':'Y=.26 specific accepted proposal; not .2','stageInset':2,'maxAnchors':108,'maxFinalists':6,'maxFinalistsPerCircle':3,'phaseDefault':'representative','quality':'number/main/pencil cell containment; number vs main/pencil nonintersection; main>=18.9 number>=12; no positive gap floor','seekPolicy':'pure isolated/order/finally cleanup; no full-frame seek matrix'},indent=2)+'\n')
# Reuse the accepted source29 eligibility, stable guards and actual source drawing.
s=(OLD/'browser28.js').read_text();prefix=s[:s.index('const cases=')]
prefix=prefix.replace('createCrossword28','createCrossword30').replace("Function('return '+text)()","Function('return ('+text+'\\n)')()")
draw=s[s.index('function makeCanvas()'):s.index('const nativeCell=')]
draw=draw.replace("oracle=compile(mode.id==='cell60below'?sources.oracleCell:sources.oracleZero,facade)","oracle=compile(sources.oracles[mode.id],facade)")
draw=draw.replace(" const rgba=ctx.getImageData(0,0,960,540).data;"," const rgba=ctx.getImageData(0,0,960,540).data;ctx.canvas.width=1;")
(B/'browser30.js').write_text(prefix+"const policy=input.policy;\n"+draw+(B/'browser-tail30.js.txt').read_text())
