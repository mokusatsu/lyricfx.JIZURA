from pathlib import Path
import subprocess,re,ast,json,hashlib
repo='/workspace/lyricfx.JIZURA';commit='bc39ce2b7893a514e6ddd7e053312dde469f8640';root=Path('/tmp/avoid009-pile01/physical10');names=subprocess.check_output(['git','ls-tree','-r','--name-only',commit,'src'],cwd=repo,text=True).splitlines();sources={n:subprocess.check_output(['git','show',commit+':'+n],cwd=repo).decode()for n in names if n.endswith('.js')};core=sources['src/06_layouts.js'];ordinary=ast.literal_eval(re.search(r'J.LAYOUT_ORDER = (\[[^\n]+\])',core)[1]);special=re.findall(r'^  ([A-Za-z0-9_]+): \{\n    name: [^\n]*special: true',core,re.M);provenance=[{'id':k,'path':'src/06_layouts.js','kind':'initial-LAYOUT_ORDER'}for k in ordinary]
for name,text in sorted(sources.items()):
 if name=='src/05b_registry.js':continue # Registration-helper documentation example is not a call.
 found=[]
 for m in re.finditer(r"(?:J\.register|\breg)\('layout',\s*'([^']+)'",text):found.append((m.start(),m[1]))
 if re.search(r"const reg = \(key, def\) =>",text):
  for m in re.finditer(r"\breg\('([^']+)'",text):found.append((m.start(),m[1]))
 for position,key in sorted(found):
  if key not in ordinary:ordinary.append(key);provenance.append({'id':key,'path':name,'line':text[:position].count('\n')+1,'kind':'literal-stock-registration'})
expected=provenance[:17];runtime=ordinary[:17]+special+ordinary[17:];actual=json.loads((root/'run01/raw.json').read_text())['rows'][0]['10']['layoutIDs'];assert len(ordinary)==184 and len(special)==10,(len(ordinary),len(special));assert runtime==actual,[(i,x,y)for i,(x,y)in enumerate(zip(runtime,actual))if x!=y]
value={'baselineCommit':commit,'extraction':'READONLY literal tracked source registration + initial LAYOUT_ORDER, no JS execution','canonicalOrdinaryStockIDs':ordinary,'canonicalSpecialStockIDs':special,'runtimeRegistryIDs':runtime,'ordinaryCount':len(ordinary),'specialCount':len(special),'runtimeCount':len(runtime),'provenance':provenance,'sourcePins':[{'path':n,'sha256':hashlib.sha256(t.encode()).hexdigest()}for n,t in sources.items()if n=='src/05b_registry.js'or n=='src/06_layouts.js'or any(q['path']==n for q in provenance)]}
(root/'registry-provenance.json').write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'ordinary':len(ordinary),'special':special,'runtime194ExactlyActualRun01':runtime==actual}))
