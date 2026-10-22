"""Summarize actual emitted glyph coverage independently of declared role labels."""
from pathlib import Path
import json,hashlib,collections,sys
root=Path(__file__).resolve().parents[2]
p=root/(sys.argv[1] if len(sys.argv)>1 else 'tasks/evidence/AVOID-008/japanese/font-probe05.json')
manifest=root/'dev/avoidance/layouts-c-japanese-fonts/manifest.json'
base=root/'dev/avoidance/fixtures/b-fonts/manifest.json'
report=json.loads(p.read_text());m=json.loads(manifest.read_text());old=json.loads(base.read_text());oldc={f['id']:set(f['codepoints'])for f in old['faces']}
coverage=report['coverage'];main=sorted({g['actualFace']for g in coverage if g['role']=='main'})
assert len(main)>=6 and len(report['fontAudit']['faces'])==8
assert report['sourceStart']==report['sourceEnd']
assert all(g['assignedCovered'] and g['actualFace']==g['assignedFace']for g in coverage)
assert all(r['inputUnchanged'] and not r['error'] and r['safety']!='unsupported' for r in report['rows'])
out={'receipt':str(p.relative_to(root)),'receiptSHA256':hashlib.sha256(p.read_bytes()).hexdigest(),'scope':report['scope'],'actualDistinctMainFaces':main,'loadedFaces':report['fontAudit']['faces'],'assignments':m['assignments'],'substitutionExamples':{'brush':m['assignments']['brush'],'klee':m['assignments']['klee']},'requestedSubsetCodepoints':len(m['requestedCodepoints']),'summedSubsetCmap':sum(len(f['codepoints'])for f in m['faces']),'fixtureBytes':sum((manifest.parent/f['file']).stat().st_size for f in m['faces']),'emittedEntries':len(coverage),'emittedUniqueCodepoints':len({g['codepoint']for g in coverage}),'emittedRoleEntries':dict(collections.Counter(g['role']for g in coverage)),'actualFaceEntries':dict(collections.Counter(g['actualFace']for g in coverage)),'explicitFallbackIDs':report['explicitFallbackIDs'],'actualFallbackEntries':[g for g in coverage if g['fallbackFace']],'unresolvedEntries':[g for g in coverage if not g['actualFace']],'sourceRows':dict(collections.Counter(r['safety']for r in report['rows'])),'BSubsetMissingNowActuallyCovered':[{'role':g['role'],'key':g['key'],'char':g['char'],'codepoint':g['codepoint'],'actualFace':g['actualFace']}for g in coverage if g['codepoint']not in oldc[g['assignedFace']]],'metadataCorpus':''.join(sorted({g['char']for g in coverage if g['role']=='metadata'})),'fontBuildManifestSHA256':hashlib.sha256(manifest.read_bytes()).hexdigest(),'BManifestSHA256':hashlib.sha256(base.read_bytes()).hexdigest(),'sourceStartEndEqual':True}
output=root/(sys.argv[2] if len(sys.argv)>2 else 'tasks/evidence/AVOID-008/japanese/font-summary05.json')
assert not output.exists()
output.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:out[k]for k in ['actualDistinctMainFaces','summedSubsetCmap','emittedEntries','emittedUniqueCodepoints','sourceRows']},ensure_ascii=False))
