"""Small raw-only source/paint equality review; no rendering or media reads."""
from pathlib import Path
import gzip,hashlib,json,sys
D=Path(sys.argv[1]);E=D.parent
r=json.loads((D/'result.json').read_text());assert r['complete'] and not r['errors'] and r['postPinsUnchanged']
for p in r['pins']:
 b=Path(p['path']).read_bytes();assert len(b)==p['bytes'] and hashlib.sha256(b).hexdigest()==p['sha256']
def raw(directory,p):
 g=(directory/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes'] and hashlib.sha256(g).hexdigest()==p['gzipSHA256'];assert len(b)==p['jsonBytes'] and hashlib.sha256(b).hexdigest()==p['sha256'];return json.loads(b)
values={p['file']:raw(D,p) for p in r['raw']};v=values['viewport-controller.json.gz'];assert v['phase']=='complete' and len(v['frames'])==3
count=0;own=0
for f,n in zip(v['frames'],[12,60,231]):
 assert f['time']==n/60 and f['mode']=='normal' and f['failure'] is None
 oldD=E/('bulbs-viewport-root-shift86aq-actual01' if n==60 else 'bulbs-viewport-all-shift86as-actual01');result=json.loads((oldD/'result.json').read_text());assert result['complete'] and not result['errors'];name='shift-pilot.json.gz' if n==60 else f'frame-{n:03}.json.gz';old=raw(oldD,next(p for p in result['raw'] if p['file']==name));assert f['after']==old['shiftHash'] and len(f['rows'])==len(old['rows'])==3
 for row,ref in zip(f['rows'],old['rows']):
  assert row['pass']==ref['pass'] and row['root']==ref['root'] and row['records']==ref['records']
  assert row['catalog']['kind']=='bulbs-owned-normal-draw80' and row['catalog']['sourceDrawFinished'] and not row['catalog']['detailedPaintCollected']
  assert all(row['clock'][k]==ref['catalog']['clock'][k] for k in row['clock'])
  count+=len(row['records']);own+=1
for key,code in [('fake','BULBS80O_UNKNOWN_PLAN'),('expired','BULBS86AG_GENERATION'),('restored','BULBS86AG_UNKNOWN_JOB')]:
 f=v[key];assert f['failure']['code']==code and f['before']==f['after'] and not f['rows']
assert v['ready']['hash']==v['afterCreate']['hash'] and v['ready']['context']==v['afterCreate']['context']
for key in ['expired','restored']:
 assert v[key]['owner']['viewportProposalJobs']==0 and v[key]['owner']['viewportProposalBytes']==0
assert v['stats']['owner']['compiles']==1 and v['stats']['owner']['peakSerializedWorkingBytes']<=8388608 and v['stats']['reservation']['activeFrameBytes']==0
print(json.dumps(dict(actualFrames=3,own=own,exactOriginalPaintRecords=count,rgbaHashesEqual=3,staleAndFakeAtomic=3,createMs=v['created']['createMs'],scope='source-only private viewport ticket; formal plan/UI and practical timing not accepted')))
