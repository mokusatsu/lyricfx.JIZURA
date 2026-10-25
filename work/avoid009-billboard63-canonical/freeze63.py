"""Source-only fresh pin/seal receipt; requires parent accepted62/frozen-original metadata."""
from pathlib import Path
import argparse,json,hashlib,datetime,ast
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-billboard63-canonical';N=R/'work/avoid009-billboard62-native'
def sha(b):return hashlib.sha256(b).hexdigest()
def row(p,base=None):
 b=p.read_bytes();return {'path':str(p.relative_to(base)) if base else str(p),'bytes':len(b),'sha256':sha(b)}
def main():
 a=argparse.ArgumentParser();a.add_argument('--head',required=True);a.add_argument('--index-sha',required=True);a.add_argument('--index-bytes',type=int,required=True);a.add_argument('--frozen-manifest',required=True);a.add_argument('--accepted-review',required=True);a.add_argument('--accepted-review-sha',required=True);a.add_argument('--actual62-manifest',required=True);a.add_argument('--actual62-manifest-sha',required=True);x=a.parse_args()
 accepted=Path(x.accepted_review);actual=Path(x.actual62_manifest);frozen=Path(x.frozen_manifest);assert sha(accepted.read_bytes())==x.accepted_review_sha and sha(actual.read_bytes())==x.actual62_manifest_sha
 pre=json.loads((N/'evidence/pins62.json').read_text());idx=R/pre['index']['path'];assert sha(idx.read_bytes())==x.index_sha;assert idx.stat().st_size==x.index_bytes and idx.stat().st_ino==554090
 h=(R/'.git/HEAD').read_text().strip();assert h.startswith('ref: ');assert(R/'.git'/h[5:]).read_text().strip()==x.head;pre['HEADReference']=x.head;pre['index']={**pre['index'],'sha256':x.index_sha,'bytes':x.index_bytes};assert len(pre['protectedAbsent'])==64 and all(not(R/p).exists() for p in pre['protectedAbsent'])
 for q in pre['files']+pre['pycache']:assert sha((R/q['path']).read_bytes())==q['sha256'],q['path']
 assert len(pre['files'])==124 and len(pre['pycache'])==7 and len(pre['canonicalSourcePaths'])==108
 frozenRows=json.loads(frozen.read_text());assert {p['source'] for p in frozenRows}=={'index.html','en/index.html'}
 for p in frozenRows:assert p['bytes']==(R/p['source']).stat().st_size and p['sha256']==sha((R/p['source']).read_bytes());assert p['frozen'].startswith('/dev/shm/')
 before=R/'tasks/evidence/AVOID-009/bulbs-canonical53';assert json.loads((before/'post-pins53.json').read_text())['files']==pre['files']
 for p in D.glob('*.py'):ast.parse(p.read_text(),filename=str(p))
 (D/'evidence/pre-pins63.json').write_text(json.dumps(pre,indent=2)+'\n')
 inputs=[N/'evidence/seal62.json',N/'src/11p_layoutsD.js',*[N/'runner'/f for f in ['exercise62.js','fixtures62.cjs','storage62.cjs','storagecheck62.cjs']],R/'work/avoid009-bulbs59-focused/runner/kernel59.cjs',R/'work/avoid009-bulbs59-focused/runner/catalog59.cjs',R/'tasks/evidence/AVOID-009/bulbs-transport51/source51/runner/chunks51.cjs',R/'dev/browser.cjs',R/'dev/avoidance/layouts-b-fixture.js',R/'dev/avoidance/layouts-c-editorial-fonts/manifest.json',Path(pre['runtimeAbsoluteReference']),before/'post-pins53.json',before/'baseline-after53/baseline53-receipt.json',before/'baseline-after53/baseline-results.json',accepted,actual,frozen]
 tests=json.loads((before/'baseline-after53/baseline53-receipt.json').read_text())['testsUnchanged'];inputs += [R/t['path'] for t in tests]
 for q in tests:assert sha((R/q['path']).read_bytes())==q['sha256']
 # Never seal mutable canonical D/JA/EN as immutable postbuild inputs: they are pre-pins.
 inputs=list(dict.fromkeys(inputs));assert all(p not in [R/'src/11p_layoutsD.js',R/'index.html',R/'en/index.html'] for p in inputs)
 files=[row(p,D) for p in sorted(D.rglob('*')) if p.is_file() and p.name!='seal63.json'];s={'kind':'SOURCE63-canonical-exactD-source-parent-gate-required','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'HEADReference':pre['HEADReference'],'indexSHA256':pre['index']['sha256'],'protectedCount':64,'files':files,'inputs':[row(p) for p in inputs],'frozenManifestPath':str(frozen),'actual62ManifestSHA256':x.actual62_manifest_sha,'accepted62ReviewSHA256':x.accepted_review_sha,'sourceCountBeforeAfter':108,'otherJSPreserved':107,'languages':['ja','en'],'nativeTriplesPerLanguage':657,'wholePairsPerLanguage':64,'contextTriplesPerLanguage':16,'partialPerLanguage':2,'otherDPerLanguage':3,'noProductOverlays':True,'applicationExecutedByPreparer':False,'publicChecks':0,'imagesViewed':0}
 (D/'evidence/seal63.json').write_text(json.dumps(s,indent=2)+'\n');print(json.dumps({'seal':row(D/'evidence/seal63.json'),'files':len(files),'inputs':len(inputs),'applicationExecuted':False}))
if __name__=='__main__':main()
