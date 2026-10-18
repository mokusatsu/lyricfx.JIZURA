from pathlib import Path
import json,re,csv,collections
root=Path('/workspace/lyricfx.JIZURA');work=Path('/workspace/work/avoidance-analysis');data=json.loads((work/'runtime-probe.json').read_text());rows=[]
orb={'ring','orbit','spiral','arcTop','circleWords','knPathRide','knGearWords'}
sources={p:p.read_text() for p in (root/'src').glob('*.js') if p.name=='06_layouts.js' or re.match(r'11p_(layouts|kinetic|typo|horror)',p.name)}
for d in data['inventory']:
 k=d['id'];hits=[]
 for p,s in sources.items():
  pattern=re.compile(r'^\s*'+re.escape(k)+r'\s*:\s*\{',re.M) if p.name=='06_layouts.js' else re.compile(r'(?:reg|J\.register)\(\s*(?:[\'\"]layout[\'\"]\s*,\s*)?[\'\"]'+re.escape(k)+r'[\'\"]\s*,')
  for m in pattern.finditer(s):hits.append((p.relative_to(root).as_posix(),s[:m.start()].count('\n')+1))
 assert len(hits)==1,(k,hits)
 f,line=hits[0];task='AVOID-008' if k in orb else 'AVOID-005' if f=='src/06_layouts.js' else 'AVOID-006' if re.search(r'11p_(layouts[AC]|typo)',f) else 'AVOID-007'
 s=d['renderSource'];rows.append({'id':k,'name':d['name'],'source':f,'line':line,'task':task,'policy_proposal':'center-anchor' if k in orb else 'flow-or-object-adapter','direct_mainDraw':'mainDraw' in s,'env_draw':'env.draw' in s,'direct_canvas_text':'fillText' in s or 'strokeText' in s,'status':'未実装・個別視覚検証未実施'})
with (work/'layout-inventory.csv').open('w') as f:
 w=csv.DictWriter(f,fieldnames=rows[0].keys());w.writeheader();w.writerows(rows)
print(dict(collections.Counter(r['task'] for r in rows)))
