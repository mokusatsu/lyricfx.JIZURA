from pathlib import Path
import sys,json,hashlib,shutil
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();U=Path(__file__).resolve().parent;E=Path('/workspace/jizura-logic-evidence-20261027');S=E/'burst-controller-gate-source83ah';F=E/'burst-formal-binding-gate-source83aw';D.mkdir(exist_ok=False)
for root in [S,F]:
 for p in root.iterdir():
  if p.name.endswith('.js') or p.name in ['qt-service-visible.py','spec.json']:shutil.copy2(p,D/p.name)
shutil.copy2(U/'private-controller83.js',D/'private-controller83.js')
shutil.copy2(S/'candidate-ja.html',D/'candidate-ja.html')
spec=json.loads((S/'spec.json').read_text());spec['cx']=.7;(D/'spec.json').write_text(json.dumps(spec,indent=2)+'\n')
b=(F/'handoff-browser.js').read_text();b=b.replace("scope:'genuine restricted formal burst plan only; exact old hashes compared by host; no new full250 paint test or UI performance acceptance'","input:{plan:C.exact(h.plan),spec:h.spec},scope:'fresh changed-circle finite selection, full original whole-owner geometry proof; three formal normal-source frames, no original-circle redraw or UI qualification'")
# Plan is restored after invalidation; the exact input/selected delta survives in ready.proof.
(D/'handoff-browser.js').write_text(b)
p=(F/'probe.cjs').read_text().replace("R='/workspace/jizura-followup-20261029'", "R="+repr(str(R)))
p=p.replace("fs.readFileSync('/workspace/jizura-logic-evidence-20261027/burst-controller-gate-source83ah/spec.json')","fs.readFileSync(D+'/spec.json')").replace("fs.readFileSync('/workspace/jizura-logic-evidence-20261027/burst-controller-gate-source83ah/candidate-ja.html')","fs.readFileSync(D+'/candidate-ja.html')")
a=p.index("const S='/workspace/jizura-logic-evidence-20261027/burst-controller-gate-source83ah';");z=p.index('server=http.createServer',a);p=p[:a]+"const S=D;\n"+p[z:]
p=p.replace("assert.deepEqual(bound.planCore,take('destination-init.json.gz').planCore,'CURRENT_INPUT');", "assert.equal(spec.cx,.7);result.changedInput={cx:spec.cx,cy:spec.cy,radius:spec.radius};")
p=p.replace("for(const f of got.rows)assert.equal(f.hash,take('state-'+String(f.n).padStart(3,'0')+'.json.gz').hash,'FORMAL_RGBA_'+f.n);", "const decoded=decode(got.ready);assert.equal(decoded.proof.checkedOwn,727);assert.equal(decoded.proof.checkedSupports,9047);assert.notEqual(decoded.proof.selection.side,'right');assert(!decoded.proof.selection.zeroClear);assert.equal(got.rows.length,3);")
(D/'probe.cjs').write_text(p)
paths=[x for x in D.iterdir()if x.is_file()]+[x for x in U.iterdir()if x.is_file()]+list((R/'dev/avoidance/qt-resource-runtime').glob('*.py'))+[R/'dev/avoidance/bulbs80/product80y/fixture.js',R/'dev/avoidance/layouts-c-editorial-fonts/manifest.json']
(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(set(paths))],indent=2)+'\n');print(D)
