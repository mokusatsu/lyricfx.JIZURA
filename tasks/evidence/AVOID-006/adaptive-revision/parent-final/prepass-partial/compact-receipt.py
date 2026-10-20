"""Hash existing audit evidence only; no browser, renderer, or product execution."""
from pathlib import Path
import hashlib,json

base=Path(__file__).resolve().parent
def digest_bytes(b):return hashlib.sha256(b).hexdigest()
def canonical(value):return json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()
def digest(value):return digest_bytes(canonical(value))
def normalized_tr(tr):return {k:v for k,v in tr.items() if k!='revision'} if tr else tr
raw=(base/'report.json').read_bytes()
report=json.loads(raw)
snapshot=json.loads((base/'snapshot.json').read_text())
adjudication=json.loads((base/'adjudication.json').read_text())
compression=json.loads((base/'receipt.json').read_text())['rawCompression']
rows=[]
for i,r in enumerate(report['runs']):
 frames=[{'time':f['time'],'observationsSHA256':digest(f['obs']),'pngDataURLSHA256':f['pngSHA256']} for f in r.get('frames',[])]
 project={'tr':r.get('tr'),'selection':r.get('selection'),'frames':r.get('frames')}
 normal_project={**project,'tr':normalized_tr(r.get('tr'))}
 rows.append({'run':i,'variant':r['variant'],'inputID':r['spec']['id'],'input':r['spec'],'mode':r['mode'],'pageLanguage':r['language'],'effectiveLanguage':r['spec'].get('auditLanguage',r['language']),'htmlSHA256':snapshot[r['variant']]['index.html'],'metricsRevision':r.get('metricsRevision'),'trajectoryRevision':r.get('tr',{}).get('revision'),'trajectoryRawSHA256':digest(r.get('tr')),'trajectoryRevisionNormalizedSHA256':digest(normalized_tr(r.get('tr'))),'eligibilitySHA256':digest(r.get('selection')),'observationsSHA256':digest([{'time':f['time'],'obs':f['obs']} for f in r.get('frames',[])]),'pngHashListSHA256':digest([{'time':f['time'],'pngDataURLSHA256':f['pngSHA256']} for f in r.get('frames',[])]),'projectionRawSHA256':digest(project),'projectionRevisionNormalizedSHA256':digest(normal_project),'frames':frames,'error':r.get('error')})

def match(row,variant,mode):
 return next(r for r in rows if r['variant']==variant and r['inputID']==row['inputID'] and r['mode']==mode and r['pageLanguage']==row['pageLanguage'])
comparisons=[]
for a in rows:
 if a['variant']!='after' or a['inputID'] not in ['justified','subtitleBar','splitScreen','sideways','panels','filmstrip','quote','ticket']:continue
 b=match(a,'before',a['mode'])
 for af,bf in zip(a['frames'],b['frames']):
  comparisons.append({'inputID':a['inputID'],'mode':a['mode'],'time':af['time'],'beforeRun':b['run'],'afterRun':a['run'],'trajectoryRawEqual':a['trajectoryRawSHA256']==b['trajectoryRawSHA256'],'trajectoryRevisionNormalizedEqual':a['trajectoryRevisionNormalizedSHA256']==b['trajectoryRevisionNormalizedSHA256'],'eligibilityEqual':a['eligibilitySHA256']==b['eligibilitySHA256'],'observationsEqual':af['observationsSHA256']==bf['observationsSHA256'],'pngDataURLEqual':af['pngDataURLSHA256']==bf['pngDataURLSHA256']})
cache=[]
for a in rows:
 if a['mode']=='cold':continue
 b=match(a,a['variant'],'cold')
 cache.append({'run':a['run'],'coldRun':b['run'],'rawProjectionEqual':a['projectionRawSHA256']==b['projectionRawSHA256'],'revisionNormalizedProjectionEqual':a['projectionRevisionNormalizedSHA256']==b['projectionRevisionNormalizedSHA256']})
evidence_names=['snapshot.json','probe.cjs','probe.log','negative.cjs','negative.json','negative.log','full-path.cjs','full-path.json','full-path.log','adjudication.json','png-binary-receipt.json','receipt.json','compact-receipt.py']
receipt={'claim':'Functional equivalence only at partial frozen snapshot; no performance or final acceptance. Original raw probe exit1 preserved; ten mismatches are only trajectory revision metadata.','canonicalHashMethod':'SHA256 of UTF-8 Python JSON: ensure_ascii=false, sort_keys=true, separators comma/colon, finite numbers. Raw and normalized hashes use this same deterministic encoding. Only tr.revision is removed for revision normalization; eligibility, observations and PNG hashes are unchanged.','pngHashMethod':'Per-frame pngDataURLSHA256 was computed by the browser probe as SHA256 of Canvas.toDataURL() string, a one-to-one encoding of actual PNG bytes. Eight saved hold-frame PNG pairs additionally have binary-byte SHA256 in png-binary-receipt.json.','sourceHashes':snapshot,'rawEvidence':{'path':str(base/'report.json'),'bytes':len(raw),'sha256':digest_bytes(raw),'compression':compression,'gzipPath':str(base/'report.json.gz'),'retention':'Raw and gzip remain scratch only; do not add to git.'},'reproduce':'Use compact-receipt.py against scratch report.json to regenerate hashes. probe.cjs --snapshot then probe.cjs reproduces browser audit at matching source hashes; negative.cjs and full-path.cjs reproduce dedicated checks. Browser needs JIZURA_BROWSER=/usr/bin/chromium and local network/socket permissions. Original probe is intentionally retained, including raw revision mismatch behavior.','evidenceSHA256':{n:digest_bytes((base/n).read_bytes()) for n in evidence_names},'runs':rows,'old53NewFrameComparisons':comparisons,'cacheComparisons':cache,'revisionMismatchEvidence':adjudication,'binaryPNGComparison':json.loads((base/'png-binary-receipt.json').read_text()),'summary':{'runs':len(rows),'specifications':report['summary']['specs'],'old53NewFrameComparisons':len(comparisons),'old53NewAllEqual':all(all(v for k,v in c.items() if k.endswith('Equal')) for c in comparisons),'rawProjectionCacheMismatches':sum(not c['rawProjectionEqual'] for c in cache),'normalizedProjectionCacheMismatches':sum(not c['revisionNormalizedProjectionEqual'] for c in cache),'rawProbeFailures':report['failures'],'sourceChangedDuringProbe':report['sourceMismatchAfter'],'negativeCases':len(json.loads((base/'negative.json').read_text())['rows']),'negativeFailures':json.loads((base/'negative.json').read_text())['failures'],'fullPathCases':len(json.loads((base/'full-path.json').read_text())['rows']),'fullPathFailures':json.loads((base/'full-path.json').read_text())['failures']}}
target=base/'compact-receipt.json'
target.write_text(json.dumps(receipt,ensure_ascii=False,indent=2))
print(json.dumps({'file':str(target),'bytes':target.stat().st_size,'sha256':digest_bytes(target.read_bytes()),'summary':receipt['summary']}))
