"""Extract three actual control records from the pushed failure; no new rendering."""
import gzip,hashlib,json,os,pathlib,runpy,struct,subprocess,tempfile
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA');E=ROOT/'tasks/evidence/AVOID-009/resume-20261025'
R=runpy.run_path(str(E/'parent-read-raw69.py'));restore=R['restore'];need=R['need'];undefined=R['UNDEFINED']
def enc(v):
 if v is undefined:return {'$undefined':True}
 if isinstance(v,bool) or v is None or isinstance(v,str):return v
 if isinstance(v,(int,float)):return {'$f64':struct.pack('>d',v).hex()}
 if isinstance(v,list):return [enc(x) for x in v]
 return {k:enc(x) for k,x in v.items()}
with tempfile.TemporaryDirectory(dir='/dev/shm',prefix='parent-control69-') as tmp:
 env=os.environ.copy();env.update(GIT_DIR=tmp+'/repo.git',GIT_ALTERNATE_OBJECT_DIRECTORIES=str(ROOT/'.git/objects'),TMPDIR=tmp,GIT_CONFIG_COUNT='2',GIT_CONFIG_KEY_0='gc.auto',GIT_CONFIG_VALUE_0='0',GIT_CONFIG_KEY_1='maintenance.auto',GIT_CONFIG_VALUE_1='false')
 def g(*a):return subprocess.check_output(['git',*a],env=env,cwd=ROOT,stderr=subprocess.PIPE)
 g('init','--bare',tmp+'/repo.git');g('update-ref','refs/heads/base','4a76100c63b3a8b55c7c12ad9e98656ba37f9599');g('fetch','--no-tags','https://github.com/mokusatsu/lyricfx.JIZURA.git','refs/heads/'+R['REF']+':refs/heads/raw')
 def blob(name):return g('show','raw:'+R['PREFIX']+name)
 m=json.loads(blob('raw/manifest.json'));case=None;tables={};rows=[]
 for row in m['records']:
  b=blob('raw/'+row['file']);need(hashlib.sha256(b).hexdigest()==row['sha256']);r=json.loads(gzip.decompress(b))
  if r['case']!=case:case=r['case'];tables={k:[] for k in ['matrix','paint','catalog']}
  for k,delta in r['tableDeltas'].items():
   for entry in delta:need(entry['id']==len(tables[k]));tables[k].append(entry['value'])
  if row['phase']!='historical59A-fresh-control':continue
  v=restore(r['binding'],tables)
  if v['n'] not in [83,120,165]:continue
  raw=json.dumps({'sequence':r['sequence'],'value':enc(v)},ensure_ascii=False,separators=(',',':'),allow_nan=False).encode();name='actual01-control-n'+str(int(v['n']))+'.encoded.json.gz';gz=gzip.compress(raw,mtime=0);out=E/name;need(not out.exists());out.write_bytes(gz);rows.append({'path':str(out.relative_to(ROOT)),'originalRecord':row,'n':v['n'],'bytes':len(gz),'encodedJSONBytes':len(raw),'sha256':hashlib.sha256(gz).hexdigest(),'projection':'parent independently restored all original values; Float64/undefined preserved; no rendering or omission'})
 need(len(rows)==3);receipt={'archiveCommit':g('rev-parse','raw').decode().strip(),'files':rows,'publicChecks':0,'parentImages':0};(E/'parent-control-extraction69.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
