"""Offline source29 sparse raw numerical quality diagnostic. No renderer or network."""
import sys
sys.dont_write_bytecode=True
import collections,gzip,hashlib,json,pathlib,runpy
HERE=pathlib.Path(__file__).parent
RAW=HERE.parent/'run28-sparse02-20261025c/raw'
DECODER=pathlib.Path('/workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py')
R=runpy.run_path(str(DECODER));tables={k:[] for k in ['matrix','paint','catalog']}
sha=lambda b:hashlib.sha256(b).hexdigest()
manifest_bytes=(RAW/'manifest.json').read_bytes();manifest=json.loads(manifest_bytes);rows=[];inputs=[];total=0
for m in manifest['records']:
 data=(RAW/m['file']).read_bytes();assert len(data)==m['bytes'] and sha(data)==m['sha256'];raw=gzip.decompress(data);assert len(raw)==m['JSONBytes'];total+=len(raw);record=json.loads(raw)
 for k,delta in record['tableDeltas'].items():
  for d in delta:assert d['id']==len(tables[k]);tables[k].append(d['value'])
 v=R['restore'](record['binding'],tables);q=v['quality'];numbers=q['numberChecks'];atoms=q['atoms'];bad=[];contacts=[]
 for c in numbers:
  owned=[a for a in atoms if a['owner']==c['owner']];box=c['cellBox'];padding=[min(a['local']['x0']-box['x0'],a['local']['y0']-box['y0'],box['x1']-a['local']['x1'],box['y1']-a['local']['y1']) for a in owned];assert padding==c['padding'];assert c['contained']==all(p>=0 for p in padding)
  if not c['contained']:bad.append({'owner':c['owner'],'number':c['text'],'cell':c['cell'],'padding':padding})
  for a in owned:
   for b in atoms:
    if b['owner']==a['owner'] or not ('.main.' in b['owner'] or '.pencil.' in b['owner']):continue
    x=a['local'];y=b['local'];ox=min(x['x1'],y['x1'])-max(x['x0'],y['x0']);oy=min(x['y1'],y['y1'])-max(x['y0'],y['y0'])
    if ox>=0 and oy>=0:contacts.append({'number':c['text'],'numberGlyph':a['text'],'cell':c['cell'],'otherOwner':b['owner'],'otherText':b['text'],'overlapX':ox,'overlapY':oy,'numberBounds':x,'otherBounds':y,'numberCell':box})
 assert len(contacts)==sum(x['intersects'] for c in numbers for x in c['contacts'])
 passed=q['cell']*.7>=18.9 and all(c['sizePassed'] and c['contained'] and not any(x['intersects'] for x in c['contacts']) for c in numbers);assert passed==q['passed']
 row={'file':m['file'],'mode':v['caseId'],'n':v['n'],'pass':v['own']['pass'],'lt':v['actual']['clock']['lt'],'held':q['heldOwnClock'],'passed':q['passed'],'numbers':len(numbers),'numberSizeFailures':sum(not c['sizePassed'] for c in numbers),'paddingFailures':bad,'minPadding':min((p for c in numbers for p in c['padding']),default=None),'contacts':contacts};rows.append(row);inputs.append({'file':m['file'],'bytes':len(data),'sha256':sha(data)})
assert len(rows)==60 and total==4268913 and sum(not r['passed'] for r in rows)==16
summary=[]
for mode in ['off','zero','move','cell60below']:
 rr=[r for r in rows if r['mode']==mode];summary.append({'mode':mode,'rows':len(rr),'failedRows':sum(not r['passed'] for r in rr),'heldFailedRows':sum(not r['passed'] and r['held'] for r in rr),'nonheldFailedRows':sum(not r['passed'] and not r['held'] for r in rr),'paddingFailures':sum(len(r['paddingFailures']) for r in rr),'numberSizeFailures':sum(r['numberSizeFailures'] for r in rr),'contactAtomPairs':sum(len(r['contacts']) for r in rr),'minPadding':min(r['minPadding'] for r in rr if r['minPadding'] is not None)})
cell=68.26666666666667;scales=[.6,.58,.55];cameraMax=1+.03*.65
widths=[{'scale':s,'cell':cell*s,'gridWidth':9*cell*s,'paperAndBorderWidth':(9+.14)*cell*s,'cameraSupremum':cameraMax,'cameraPaperAndBorderWidth':(9+.14)*cell*s*cameraMax,'plus2pxEachSide':(9+.14)*cell*s*cameraMax+4,'nativeMainSize':cell*s*.7,'compactMainSize':cell*s*.65,'pencilSize':cell*s*.46,'sideBandGeometricWidth':480-110.7,'strictInset2SideBand':480-110.7-2} for s in scales]
result={'state':'OFFLINE_NUMERICAL_DIAGNOSTIC_ONLY','rawPersistence':'RAM_ONLY_NOT_DURABLY_SAVED','sourceVersion':29,'manifestSHA256':sha(manifest_bytes),'decoderSHA256':sha(DECODER.read_bytes()),'restoredRows':len(rows),'JSONBytes':total,'summary':summary,'rows':rows,'widthArithmetic':widths,'inputRaw':inputs,'qualityApproved':False,'geometryApproved':False,'Canvas':0,'browser':0,'imagesViewed':0,'GitCommands':0,'publicChecks':0}
(HERE/'quality-result30.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'summary':summary,'widthArithmetic':widths,'qualityApproved':False,'Canvas':0},ensure_ascii=False))
