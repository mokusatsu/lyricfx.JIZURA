"""Focused numeric checker test with preserved source03 data; no render/encode/images."""
import sys
sys.dont_write_bytecode=True
import pathlib,json,gzip,runpy,copy,collections
HERE=pathlib.Path(__file__).parent;C=runpy.run_path(str(HERE/'checker27.py'));raw=pathlib.Path('/dev/shm/avoid009-burst26-fullclock-source03-actual01-20261025/raw');manifest=json.loads((raw/'manifest.json').read_bytes());tables={};epoch=-1;native={};pairs={};wanted={0,14,90,231,249};init=None
for row in manifest['records']:
 rec=json.loads(gzip.decompress((raw/row['file']).read_bytes()))
 if rec['tableEpoch']!=epoch:epoch=rec['tableEpoch'];tables={k:[] for k in ['matrix','paint','catalog']}
 for k,delta in rec['tableDeltas'].items():
  for entry in delta:tables[k].append(entry['value'])
 v=C['C']['restore'](rec['binding'],tables)
 if v['phase']=='init':init=v['init']
 if v['phase']=='native-frame' and int(v['frame']['n']) in wanted:native[int(v['frame']['n'])]=v['frame']
 if v['phase']=='winner-oracle-pair' and v['circle']['id']=='default' and int(v['direct']['n']) in wanted:pairs[int(v['direct']['n'])]=v
 if len(native)==len(pairs)==len(wanted):break
assert init and len(native)==len(pairs)==5
summary=collections.Counter();negative=0;row=next(r for r in init['recipes'] if r['recipe']['id']=='two-local-0.5')
def adapt(f):
 f=copy.deepcopy(f);f['time']=int(f['n'])/60;f['media']=True
 for p in f['passes']:p['clock']['realTime']=f['time']
 return f
for n in sorted(wanted):
 a,b,o=map(adapt,[native[n],pairs[n]['direct'],pairs[n]['oracle']])
 for f in [a,b,o]:C['source_framecheck'](f,init,summary)
 assert C['exact']({**b,'mode':None},{**o,'mode':None});C['glyph_source_check'](a,b,init['nativeSize'],row['dimensions']['size']);assert not C['C']['geometry'](b['supports'],C['CIRCLE'])
 if n and b['passes']:
  bad=copy.deepcopy(b);bad['passes'][0]['clock']['realTime']=bad['firstTime']
  try:C['source_framecheck'](bad,init,collections.Counter())
  except AssertionError:negative+=1
  else:raise AssertionError('wrong actual realTime accepted')
  bad=copy.deepcopy(b);bad['firstTime']=bad['time']
  try:C['source_framecheck'](bad,init,collections.Counter())
  except AssertionError:negative+=1
  else:raise AssertionError('lost source firstTime accepted')
 if b['glyphs']:
  bad=copy.deepcopy(b);bad['glyphs'][0]['item']['text']='へ先\nの風'
  try:C['glyph_source_check'](a,bad,init['nativeSize'],row['dimensions']['size'])
  except AssertionError:negative+=1
  else:raise AssertionError('reordered lyric accepted')
print(json.dumps({'status':'PASS_BURST27_CHECKER_PURE_SOURCE03_DATA','data':'Existing firstTime raw with only synthetic realTime/time adaptation; NOT exact-j rendering evidence','states':len(wanted),'frames':15,'negativeChecks':negative,'nativeSizeFromActualInit':init['nativeSize'],'localSizeFromActualInit':row['dimensions']['size'],'canvasFrames':0,'encoderRuns':0}))
