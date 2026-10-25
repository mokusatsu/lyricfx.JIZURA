"""Only the new recovery input guards; no Git, build, browser or ROOT writes."""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import copy,importlib.util
p=Path(__file__).with_name('layouts-d-bulbs70-recover.py');s=importlib.util.spec_from_file_location('recover70',p);R=importlib.util.module_from_spec(s);s.loader.exec_module(R)
old=[{'path':'src/p'+str(i)+'.js','bytes':1,'sha256':'a'*64} for i in range(182)]+[{'path':R.EXCEPTION,'bytes':1,'sha256':'a'*64}];current=copy.deepcopy(old);current[-1]['sha256']='b'*64;assert R.historical_sources70(old,current)['matched']==182
for mode in ['changed-product','missing-file','missing-exception']:
 bad=copy.deepcopy(current)
 if mode=='changed-product':bad[0]['sha256']='c'*64
 elif mode=='missing-file':bad.pop()
 else:bad[-1]['path']='other-checker.py'
 try:R.historical_sources70(old,bad)
 except RuntimeError:pass
 else:raise AssertionError(mode)
assert R.archive_relative70('fixed/raw/0001.json.gz','fixed/')=='raw/0001.json.gz'
for name in ['elsewhere/a','fixed/../a','fixed//absolute']:
 try:R.archive_relative70(name,'fixed/')
 except RuntimeError:pass
 else:raise AssertionError(name)
print({'status':'PASS','checks':8,'scope':'new recovery source/path guard only','GitExecuted':False,'buildExecuted':False,'browserExecuted':False,'ROOTWritten':False})
