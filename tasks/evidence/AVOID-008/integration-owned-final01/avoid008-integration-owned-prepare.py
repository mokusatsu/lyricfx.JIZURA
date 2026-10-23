from pathlib import Path
import hashlib,json,shutil,subprocess,os
R=Path('/workspace/lyricfx.JIZURA');S=Path('/workspace/avoid008-final-c34');T=Path('/tmp/avoid008-integration-owned01');T.mkdir(exist_ok=False)
H=R/'tasks/evidence/AVOID-008/regression-final01';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
products=sorted(str(p.relative_to(R)) for p in (R/'src').glob('*.js'))+['index.html','en/index.html']
before={p:sha(R/p) for p in products};changed=[p for p in products if sha(R/p)!=sha(S/p)];assert len(changed)==10
for variant,source in [('baseline',R),('candidate',S)]:
 C=T/variant
 for rel in products:
  d=C/rel;d.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source/rel,d)
 shutil.copytree(H/'snapshots/baseline/dev',C/'dev')
 (C/'assets').symlink_to(H/'common/assets',target_is_directory=True)
record={'before':before,'donor':{p:sha(S/p) for p in products},'changed':changed,'mainHead':subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip(),'pycBefore':sha(R/'app/__pycache__/english.cpython-312.pyc'),'statusBefore':subprocess.check_output(['git','status','--porcelain=v1','-uall'],cwd=R,text=True)}
(T/'pins-before.json').write_text(json.dumps(record,indent=2)+'\n')
for p in changed:shutil.copyfile(S/p,R/p)
build=subprocess.run(['python3','build.py'],cwd=R,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'},capture_output=True,text=True)
(T/'build.log').write_text(build.stdout+build.stderr);assert build.returncode==0
assert all(sha(R/p)==sha(S/p) for p in products)
assert sha(R/'app/__pycache__/english.cpython-312.pyc')==record['pycBefore']
# JA source blocks and EN localization, exact real build, are stronger than a byte-only compiled copy.
assert all((R/'index.html').read_text().count((R/p).read_text())==1 for p in products if p.startswith('src/') and '__EFFECT_PREVIEW_IMAGE__' not in (R/p).read_text())
(T/'build-reverse.json').write_text(json.dumps({'buildExit':0,'all86DonorExact':True,'sourceCount':84,'changed':changed,'pycUnchanged':True,'after':{p:sha(R/p) for p in products}},indent=2)+'\n')
print(T)
