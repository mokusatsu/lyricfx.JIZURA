"""Audit generated load order and the extended manifest without creating an owner."""
from pathlib import Path
import sys,json,re
D=Path(sys.argv[1]).resolve();R=Path(__file__).resolve().parents[4];p=(D/'probe.cjs').read_text();start=p.index('for(const name of [');end=p.index(']){const file=',start);names=re.findall("'([^']+)'",p[start:end]);joined=(D/'candidate-ja.html').read_text()+'\n'+'\n'.join((R/'dev/avoidance/bulbs80/product80y/fixture.js'if n=='fixture'else D/(n+'.js')).read_text()for n in names);m=json.loads((D/'dependencies.json').read_text())
for paths in m['groups'].values():
 for path in paths:assert path.split('.')[-1]in joined,path
for a,b in [('new-clock-compiler83','private-controller83'),('new-scalar-support83','private-controller83'),('new-geometry83','private-controller83'),('renderer-time83','private-controller83'),('plan-binding83','private-controller83'),('post-scope83bc','private-controller83'),('fast-scope83bc','private-controller83'),('private-controller83','prepared-handoff83'),('prepare-stage83','prepared-handoff83'),('stock-post-reference83bc','normal-browser83bc')]:assert names.index(a)<names.index(b),(a,b)
controller=(D/'private-controller83.js').read_text();refs=controller[controller.index('function refs(){'):controller.index('function snapshot(){')];actual=set(re.findall(r'\bA\.([A-Za-z0-9_]+)',refs));actual|={'burstNormalPostScope83bc','burstNormalFastScope83bc'};mapped={p.split('.')[2]for paths in m['groups'].values()for p in paths if p.startswith('J.placement.')};assert actual<=mapped,actual-mapped
scope=(D/'post-scope83bc.js').read_text();assert "sourceAdapter==='burst_prepared83av'"in scope;assert 'function assertBeforePost' in scope
print(json.dumps({'staticChecked':True,'requirements':sum(map(len,m['groups'].values())),'loadOrder':names,'scope':'static names and ordering; actual function presence is separately saved in dependency-preflight raw'},indent=2))
