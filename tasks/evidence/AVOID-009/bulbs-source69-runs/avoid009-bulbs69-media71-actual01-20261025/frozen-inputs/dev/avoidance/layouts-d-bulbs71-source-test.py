"""Static handoff copy/capacity test in private RAM, never actual ROOT."""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import importlib.util,tempfile,json
p=Path(__file__).with_name('layouts-d-bulbs71-execute.py');s=importlib.util.spec_from_file_location('media71',p);C=importlib.util.module_from_spec(s);s.loader.exec_module(C);M=C.M
with tempfile.TemporaryDirectory(prefix='media71-pure-',dir='/dev/shm') as tmp:
 base=Path(tmp);run=base/'run';images=run/'raw/images';images.mkdir(parents=True);root=base/'root';E=root/'source71';E.mkdir(parents=True);rows=[]
 for example in ['upper','right']:
  for side in ['before','after']:
   for j in [14,90,231]:
    name=example+'-'+side+'-'+str(j)+'.png';b=(example+side+str(j)).encode();(images/name).write_bytes(b);rows.append({'path':'images/'+name,'example':example,'j':j,'bytes':len(b),'sha256':M.sha(b)})
 (run/'raw/manifest.json').write_text(json.dumps({'staticFiles':rows}));oldroot=M.ROOT;olde=C.E;usage=C.shutil.disk_usage;M.ROOT=root;C.E=E
 try:
  C.shutil.disk_usage=lambda _:type('Usage',(),{'free':0})()
  try:C.static_export71(run,'pure','upper','90')
  except RuntimeError as e:assert 'deferred' in str(e)
  else:raise AssertionError('capacity must defer')
  assert not list(E.iterdir());C.shutil.disk_usage=usage;out=C.static_export71(run,'pure','upper','90');assert len(out)==2;assert all(M.sha(M.read(root/x['path']))==x['sha256'] for x in out);assert len(list(images.iterdir()))==12
 finally:M.ROOT=oldroot;C.E=olde;C.shutil.disk_usage=usage
print({'status':'PASS','checks':4,'capacityFailureIsHandoffOnly':True,'original12Retained':True,'ROOTWritten':False,'browserExecuted':False,'encoderExecuted':False,'GitExecuted':False})
