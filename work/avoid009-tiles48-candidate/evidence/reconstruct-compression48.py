"""Read-only DATA reconstruction from accepted44 JSON; does not run Canvas/app.
Byte figures use Python JSON formatting and are estimates, never47/48 runtimebytes.
"""
from pathlib import Path
import json,lzma,struct,hashlib
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-tiles48-candidate';source=R/'tasks/evidence/AVOID-009/tiles-finite44/finite44b.raw.json.xz'
with lzma.open(source,'rt')as f:raw=json.load(f)
rows=raw['results'][0]['value']['results'];references=[];lookup={};oldrefs=[];ids=[];removed=[]
def signature(r):
 s=r['state'];state={k:s[k]for k in['alpha','blend','filter','shadowColor','shadowBlur','shadowOffsetX','shadowOffsetY']}
 if r['kind'].startswith('stroke'):state.update({k:s[k]for k in['strokeStyle','lineWidth','lineCap','lineJoin','miterLimit','dash','dashOffset']})
 else:state['fillStyle']=s['fillStyle']
 if r['kind'].endswith('Text'):state.update({k:s[k]for k in['font','textAlign','textBaseline']})
 return {'kind':r['kind'],'args':r['args'],'state':state,'path':[{k:c[k]for k in['key','args']}for c in r['path']],'metrics':r['metrics']}
def exact(v):
 if v is None:return'n'
 if isinstance(v,bool):return't'if v else'f'
 if isinstance(v,(int,float)):return'd'+struct.pack('>d',float(v)).hex()
 if isinstance(v,str):return's'+json.dumps(v,ensure_ascii=False,separators=(',',':'))
 if isinstance(v,list):return'a['+','.join(map(exact,v))+']'
 assert isinstance(v,dict)
 return'o{'+','.join(json.dumps(k,ensure_ascii=False)+':'+exact(v[k])for k in sorted(v))+'}'
def size(v):return len(json.dumps(v,ensure_ascii=False,separators=(',',':')).encode())
for row in rows:
 refs=[{'owner':r['owner'],'primitive':{'kind':r['primitive']['kind']}if r['primitive']else None,'signature':signature(r)}for r in row['native']['records']]
 oldrefs.append(refs);encoded=[]
 for ref in refs:
  key=exact(ref)
  if key not in lookup:lookup[key]=len(references);references.append(ref)
  index=lookup[key];assert exact(references[index])==key;encoded.append(index)
 assert [exact(references[i])for i in encoded]==[exact(r)for r in refs];ids.append(encoded)
 removed.append([{'bounds':s['moved']['bounds'],'phase':q['phase'],'fullConflict':q['fullCircleEnvelopeConflict'],'movingConflict':q['movingPolicyEnvelopeConflict'],'stage':q['stage']}for s,q in zip(row['supports'],row['classifications'])])
report={'kind':'OFFLINE44_DATA_COMPRESSION_RECONSTRUCTION_NOT_ACTUAL47_OR48_RUNTIME','source':str(source),'sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'rows':len(rows),'referenceUses':sum(map(len,oldrefs)),'fullValueTemplates':len(references),'roundtripFullValueChecks':sum(map(len,ids)),'fullValueKeyPreservesFloat64Bits':True,'signedZeroNotRecoverableFromOriginalJSON':True,'pythonUTF8_ESTIMATES_notJavaScriptActualBytes':{'expandedReferenceArrays':size(oldrefs),'internedTablePlusReferenceIDs':size({'references':references,'rowIDs':ids}),'nominalDestinationArraysDiscardedAfterAllChecks':size(removed),'exactKeyStrings':sum(len(k.encode())for k in lookup)},'notAProofOrAcceptance':True,'actual47ByteCountUnavailable':'47failedbeforeassigningstats; onlyfuture48measuredcountersauthoritative','noApplicationOrBrowserExecuted':True}
(D/'evidence/offline-compression48.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False))
