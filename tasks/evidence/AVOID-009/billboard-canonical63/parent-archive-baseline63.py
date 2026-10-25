from pathlib import Path
import json,hashlib,os
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024/billboard63.baseline01');E=R/'tasks/evidence/AVOID-009/billboard-canonical63';H=lambda b:hashlib.sha256(b).hexdigest();receipt=json.loads((B/'baseline63-receipt.json').read_text());assert receipt['exitCode']==0 and receipt['postPinsError'] is None and receipt['beforeReferenceReusedNotRerun'] and not receipt['savingBodyTested'];result=json.loads((B/'baseline-results.json').read_text());assert len(result['results'])==6 and all(x['exitCode']==0 for x in result['results']);rows=[]
for p in sorted(B.rglob('*')):
 assert p.is_file() and not p.is_symlink();b=p.read_bytes();o=E/'baseline-after63'/p.relative_to(B);o.parent.mkdir(parents=True,exist_ok=True)
 with o.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 assert o.read_bytes()==b;rows.append({'path':str(o.relative_to(E)),'bytes':len(b),'sha256':H(b)})
p=json.loads((E/'build63/post-pins63.json').read_text())
for x in p['files']+p['pycache']:assert H((R/x['path']).read_bytes())==x['sha256']
for x in p['protectedAbsent']:assert not(R/x).exists()
assert H((R/p['index']['path']).read_bytes())==p['index']['sha256']
v={'state':'ALL_LITERAL_AFTER6_FILES_BYTE_EXACT_PARENT_POSTPINS_VERIFIED','afterReceiptSHA256':H((B/'baseline63-receipt.json').read_bytes()),'sixResults':result['results'],'files':rows,'before53ReusedNotRerun':True,'before124IdentityVerified':True,'all124PostPinsPlus7PYCPreserved':True,'indexAnd64AbsencesPreserved':True,'parentActualLogsRead':False,'formalPerformanceAccepted':False,'saveBodyTested':False,'publicChecks':0,'parentImages':0};(E/'storage-baseline63.json').write_text(json.dumps(v,indent=2)+'\n');print(json.dumps(v))
