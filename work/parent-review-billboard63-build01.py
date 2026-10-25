from pathlib import Path
import json,hashlib,subprocess,shutil
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-billboard63-canonical';B=Path('/dev/shm/avoid009-evening-20261024/billboard63.build01');E=R/'tasks/evidence/AVOID-009/billboard-canonical63';H=lambda b:hashlib.sha256(b).hexdigest();pre=json.loads((D/'evidence/pre-pins63.json').read_text());post=json.loads((B/'post-pins63.json').read_text());receipt=json.loads((B/'build63.json').read_text());assert receipt['buildComplete'];assert set(receipt['changed'])=={'src/11p_layoutsD.js','index.html','en/index.html'};assert len(post['files'])==124 and len(post['canonicalSourcePaths'])==108
old=(B/'rollback-11p_layoutsD.js').read_bytes();new=(R/'src/11p_layoutsD.js').read_bytes();assert H(old)==next(x['sha256'] for x in pre['files'] if x['path']=='src/11p_layoutsD.js');assert new==(R/'work/avoid009-billboard62-native/src/11p_layoutsD.js').read_bytes()
for row in json.loads((E/'frozen-before63.json').read_text()):
 before=Path(row['frozen']).read_bytes();actual=(R/row['source']).read_bytes();assert H(before)==row['sha256'];assert before.count(old)==1 and actual.count(new)==1;assert actual==before.replace(old,new,1) and actual.replace(new,old,1)==before
changed=[]
for x,y in zip(pre['files'],post['files']):
 assert x['path']==y['path'];b=(R/y['path']).read_bytes();assert len(b)==y['bytes'] and H(b)==y['sha256'];
 if x['sha256']!=y['sha256']:changed.append(x['path'])
assert set(changed)=={'src/11p_layoutsD.js','index.html','en/index.html'};assert sorted(str(x.relative_to(R)) for x in (R/'src').glob('*.js'))==pre['canonicalSourcePaths']
for x in pre['pycache']:assert H((R/x['path']).read_bytes())==x['sha256']
for x in pre['protectedAbsent']:assert not(R/x).exists()
assert H((R/'.git/index').read_bytes())==pre['index']['sha256']
for p in B.iterdir():
 assert p.is_file();out=E/'build63'/p.name;out.parent.mkdir(exist_ok=True);out.write_bytes(p.read_bytes());assert out.read_bytes()==p.read_bytes()
(E/'parent-build-review63.json').write_text(json.dumps({'state':'PARENT_EXACT_D_NORMAL_JAEN_BUILD_ACCEPTED','wholeOriginalHTMLInverseVerifiedIndependently':True,'exactAccepted62D':True,'other107JSUnchanged':True,'all124PostPinsVerified':True,'PYC7Preserved':True,'protected64Preserved':True,'indexUnchanged':True,'productUncommitted':True,'actualJAENValidationPending':True,'sixAFTERPending':True,'publicChecks':0,'parentImages':0},indent=2)+'\n');print('PARENT_EXACT_D_NORMAL_JAEN_BUILD_ACCEPTED')
