"""Static startup dependency audit against the exact frozen load order."""
from pathlib import Path
import json,re,sys
D=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;R=Path(__file__).resolve().parents[4];p=(D/'probe.cjs').read_text();start=p.index('for(const name of [');end=p.index(']){const file=',start);names=re.findall("'([^']+)'",p[start:end]);files=[R/'dev/avoidance/bulbs80/product80y/fixture.js' if n=='fixture' else D/(n+'.js') for n in names];texts=[(D/'candidate-ja.html').read_text()]+[x.read_text()for x in files];joined='\n'.join(texts);manifest=json.loads((U/'dependencies.json').read_text());checks=[]
for group,paths in manifest['groups'].items():
 for path in paths:
  key=path.split('.')[-1];assert key in joined,path;checks.append({'path':path,'sourceGroup':group,'namePresent':True})
# Ordering for lexical captures in the private factory and handoff.
for before,after in [('affine-support82','scalar-support83'),('new-clock-compiler83','private-controller83'),('new-scalar-support83','private-controller83'),('new-geometry83','private-controller83'),('renderer-time83','private-controller83'),('plan-binding83','private-controller83'),('private-controller83','prepared-handoff83'),('prepare-stage83','prepared-handoff83')]:assert names.index(before)<names.index(after),(before,after)
# Every actual top-level placement namespace lookup in refs() is covered by the map.
owner=(D/'private-controller83.js').read_text();refs=owner[owner.index('function refs(){'):owner.index('function snapshot(){')];actual=sorted(set(re.findall(r'\bA\.([A-Za-z0-9_]+)',refs)));mapped={x.split('.')[2]for paths in manifest['groups'].values()for x in paths if x.startswith('J.placement.')};assert set(actual)<=mapped,(set(actual)-mapped)
print(json.dumps({'staticChecked':True,'loadOrder':names,'placementLookupsInOwner':actual,'requirements':checks,'nativeRequirements':manifest['native'],'scope':'static names/order plus complete owner placement-ref coverage; actual property/function readiness requires the saved in-page preflight'},indent=2))
