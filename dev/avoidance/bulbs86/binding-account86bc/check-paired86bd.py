from pathlib import Path
import gzip,hashlib,json,sys
D=Path(sys.argv[1]);r=json.loads((D/'result.json').read_text());assert r['complete'] and not r['errors'] and r['postPinsUnchanged']
for p in r['pins']:
 b=Path(p['path']).read_bytes();assert len(b)==p['bytes'] and hashlib.sha256(b).hexdigest()==p['sha256']
values={}
for p in r['raw']:
 g=(D/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes'] and hashlib.sha256(g).hexdigest()==p['gzipSHA256'];assert len(b)==p['jsonBytes'] and hashlib.sha256(b).hexdigest()==p['sha256'];values[p['file']]=json.loads(b)
v=values['viewport-controller.json.gz'];assert v['phase']=='complete' and len(v['frames'])==2
b,m=v['frames'];assert b['time']==m['time']==1 and b['failure'] is None and m['failure'] is None and b['rows']==m['rows'] and b['after']==m['after']=='0bcc9d083a6e9185c7d3102f6ac30b5410fadccabbb11affddeecb5c97c5eaff'
assert sum(len(x['records'])for x in b['rows'])==126
assert v['ready']['hash']==v['afterBaselineCreate']['hash']==v['afterCreate']['hash'] and v['ready']['context']==v['afterBaselineCreate']['context']==v['afterCreate']['context']
for key,code in [('fake','BULBS80O_UNKNOWN_PLAN'),('expired','BULBS86AG_GENERATION'),('restored','BULBS86AG_UNKNOWN_JOB')]:
 f=v[key];assert f['failure']['code']==code and f['before']==f['after'] and not f['rows']
assert v['released']['reservation']['records']==v['stats']['reservation']['records']==1 and v['stats']['reservation']['activeFrameBytes']==0
assert v['stats']['owner']['peakSerializedWorkingBytes']<=8388608 and v['stats']['owner']['compiles']==1 and not v['stats']['owner']['viewportProposalJobs'] and not v['stats']['owner']['viewportProposalBytes']
def diff(a,b):return {k:diff(a.get(k,{}),x)if isinstance(x,dict)else x-a.get(k,0)for k,x in b.items()}
timed={}
for key in ['baselineTimed','memoTimed']:
 assert len(v[key])==5 and all(f['failure'] is None and f['after']==b['after'] and not f['rows'] for f in v[key]);timed[key]=[f['elapsedMs'] for f in v[key]]
results={}
for key in ['baselineCreated','created']:
 c=v[key];results[key]=dict(ms=c['createMs'],profile=diff(c['profileBefore'],c['profileAfter']))
print(json.dumps(dict(pairedPaint=126,rgbaEqual=True,privateBitmapUnchanged=True,unobservedFrameMs=timed,results=results,scope='binding fresh then frozen reuse single paired sequence; inclusive timings overlap; UI unaccepted')))
