from pathlib import Path
import json,hashlib,shutil,gzip,tarfile,subprocess
R=Path('/workspace/lyricfx.JIZURA');T=Path('/tmp/avoid008-integration-owned01');D=R/'tasks/evidence/AVOID-008/integration-owned-final01';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();x=json.loads((T/'pins-before.json').read_text());current={p:sha(R/p) for p in x['donor']};assert current==x['donor'];assert sha(R/'app/__pycache__/english.cpython-312.pyc')==x['pycBefore']
for name in ['pins-before.json','build.log','build-reverse.json','core-comparison.json','core-input-pins.json','immutable-product-reference.json','carry-execution.json','swiss-before-execution.json','local-ja-en-execution.json','local-ja-en-corrected-execution.json','local-loader.mjs']:
 shutil.copyfile(T/name,D/name)
for p in Path('/tmp').glob('avoid008-integration-owned-*.py'):shutil.copyfile(p,D/p.name)
with tarfile.open(D/'execution-raw.tar.gz','w:gz',compresslevel=6) as tar:
 for name in ['core','carry-swiss','carry-swiss-before','carry-proofread','carry-letter','carry-poster','local-ja-en','local-ja-en-corrected']:
  tar.add(T/name,arcname=name)
common={'sourceCommit':'fdb7916329232885089119ba5023cca9aafc3d02','all86ProductSHA256':current,'pycUnchanged':True,'pycSHA256':x['pycBefore'],'publicVerification':'prohibited/not performed','imagesViewed':0,'performanceRerun':0};(D/'final-source-pins.json').write_text(json.dumps(common,indent=2)+'\n')
for name in ['swiss','proofread','letter','poster']:
 carry=json.loads((D/(name+'-carry.json')).read_text());assert carry['passed'];assert (carry.get('changed',carry.get('changedInputs',[])))==[]
 refs=[name+'-carry.json']+(['swiss-before-carry.json'] if name=='swiss' else [])
 for ref in refs:
  c=json.loads((D/ref).read_text());assert c['passed'];assert all(c['pins'][p]==h for p,h in current.items())
 row={'case':name,'finalSourceCommit':common['sourceCommit'],'finalProductPins':{'path':str((D/'final-source-pins.json').relative_to(R)),'sha256':sha(D/'final-source-pins.json')},'freshLocalCorrespondence':[{'path':str((D/ref).relative_to(R)),'sha256':sha(D/ref)} for ref in refs],'nativeFramesPerSide':96,'sides':['before/OFF','after/adapted'],'currentAndImmutableEngineFrameClockExact':True,'originalMedia':'Existing immutable MP4 and native PNG bytes retained, no re-encode or image inspection. Swiss adapted96 relies on native historical engine correspondence; before96 also links original encoder96/nativekeys3. Other3 link original encoder96/nativekeys where applicable.','scope':'Only this fixed historical fixture, exact fonts/stage/seed/params/frame clocks. Final source binding does not claim new whole-version visual approval.','humanConfirmation':'PENDING; original question unchanged/unanswered.'}
 (D/(name+'-binding.json')).write_text(json.dumps(row,indent=2)+'\n')
print(D)
