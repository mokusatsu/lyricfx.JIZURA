from pathlib import Path
import gzip,json,hashlib,subprocess,sys,base64
sys.dont_write_bytecode=True
from app.english import localize_js
out=Path('tasks/evidence/AVOID-008/performance/immutable-edge01');start=json.loads((out/'start.json').read_text());changed=['src/09g_layoutsC_placement.js','src/09h_layoutsC_editorial.js','src/09i_layoutsC_objects.js','src/09j_layoutsC_japanese.js'];proof={'base':start['head'],'sourceCount':84,'changedSources':changed,'reverses':[],'protectedSources':[],'compiled':[],'archives':[]}
def sha(b):return hashlib.sha256(b).hexdigest()
for row in start['sources']:
 p=row['path'];b=Path(p).read_bytes()
 if p not in changed:assert sha(b)==row['sha256'],p;proof['protectedSources'].append(row)
for p in changed:
 s=Path(p).read_text();t=s
 if p==changed[0]:
  a=t.index('// Only decoded completed-plan');e=t.index('function cacheDependencies(){',a);t=t[:a]+t[e:];t=t.replace('const result=payloadDecode(entry.payload);edgeRegisterFinal(result);','const result=payloadDecode(entry.payload);');t=t.replace('const contains=(p,poly)=>{const cached=edgeContains(p,poly,1e-5);if(cached!==null)return cached;','const contains=(p,poly)=>{')
 else:
  t=t.replace('const immutablePolygonContains=A.layoutsCImmutablePolygonContains;\n','')
  for arg,eps in [('q','1e-4'),('poly','1e-5'),('poly','1e-6')]:t=t.replace('const cached=immutablePolygonContains(p,'+arg+','+eps+');if(cached!==null)return cached;','')
 old=gzip.decompress((out/('old-'+Path(p).name+'.gz')).read_bytes());assert t.encode()==old,p
 proof['reverses'].append({'path':p,'oldBytes':len(old),'oldSha256':sha(old),'candidateBytes':len(s.encode()),'candidateSha256':sha(s.encode()),'exactReverse':True});dest=out/('candidate-'+Path(p).name+'.gz');dest.write_bytes(gzip.compress(s.encode(),mtime=0))
# Verify each transformed complete module in each generated standalone HTML.
for p in ['index.html','en/index.html']:
 html=Path(p).read_text();modules=[]
 for row in start['sources']:
  src=Path(row['path']).read_text();s=localize_js(src,row['path']) if p.startswith('en/') else src;s=s.replace('__EFFECT_PREVIEW_IMAGE__','data:image/png;base64,'+base64.b64encode(Path('assets/effect-preview.png').read_bytes()).decode())
  count=html.count(s);assert count==1,(p,row['path'],count);modules.append({'path':row['path'],'transformedBytes':len(s.encode()),'transformedSha256':sha(s.encode()),'embeds':count})
 b=Path(p).read_bytes();proof['compiled'].append({'path':p,'bytes':len(b),'sha256':sha(b),'all84ExactOnce':True,'modules':modules})
for p in sorted(out.glob('*.gz')):
 b=p.read_bytes();raw=gzip.decompress(b);proof['archives'].append({'path':str(p),'gzipBytes':len(b),'gzipSha256':sha(b),'rawBytes':len(raw),'rawSha256':sha(raw)})
proof['pureDriver']={'path':'dev/avoidance/layouts-c-immutable-edge-pure.cjs','sha256':sha(Path('dev/avoidance/layouts-c-immutable-edge-pure.cjs').read_bytes())}
proof['startUnrelatedUntrackedRetained']='tasks/evidence/AVOID-008/performance/record-readonly-analysis01/'
(out/'proof.json').write_text(json.dumps(proof,indent=2)+'\n');print(json.dumps({'protected':len(proof['protectedSources']),'reverses':len(proof['reverses']),'compiled':[(p['path'],p['sha256']) for p in proof['compiled']]}))
