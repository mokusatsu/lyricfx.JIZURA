"""Source receipts only, no fixture/application/selfcheck execution."""
from pathlib import Path
import argparse,json,hashlib,datetime,ast
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-billboard64-transport'
def sha(b):return hashlib.sha256(b).hexdigest()
def row(p,base=None):
 b=p.read_bytes();return {'path':str(p.relative_to(base)) if base else str(p),'bytes':len(b),'sha256':sha(b)}
def main():
 p=argparse.ArgumentParser()
 for a in ['head','product','index-sha','index-bytes','snapshot','protected-count','canonical-review','review-sha','post63-pins','post63-sha']:p.add_argument('--'+a,required=True)
 a=p.parse_args();old=json.loads((R/'work/avoid009-billboard62-native/evidence/pins62.json').read_text());snapshot=Path(a.snapshot);snap=json.loads(snapshot.read_text());assert len(snap['skip'])==int(a.protected_count) and set(old['protectedAbsent'])<=set(snap['skip']) and all(not(R/s).exists() for s in snap['skip'])
 h=(R/'.git/HEAD').read_text().strip();assert h.startswith('ref: ');assert(R/'.git'/h[5:]).read_text().strip()==a.head;idx=R/'.git/index';assert sha(idx.read_bytes())==a.index_sha and idx.stat().st_size==int(a.index_bytes) and idx.stat().st_ino==554090
 review=Path(a.canonical_review);assert sha(review.read_bytes())==a.review_sha;postPath=Path(a.post63_pins);assert sha(postPath.read_bytes())==a.post63_sha;post=json.loads(postPath.read_text())
 files=[row(R/f['path'],R) for f in post['files']];assert files==post['files'] and len(files)==124;changed={x['path'] for x,y in zip(files,old['files']) if x!=y};assert changed=={'src/11p_layoutsD.js','index.html','en/index.html'};assert (R/'src/11p_layoutsD.js').read_bytes()==(R/'work/avoid009-billboard62-native/src/11p_layoutsD.js').read_bytes()
 sources=sorted(str(p.relative_to(R)) for p in(R/'src').glob('*.js'));assert len(sources)==108 and sources==old['canonicalSourcePaths'];pycs=[row(R/q['path'],R) for q in old['pycache']];assert pycs==old['pycache'] and len(pycs)==7
 for f in D.glob('*.py'):ast.parse(f.read_text())
 rt=Path(old['runtimeAbsoluteReference']);assert sha(rt.read_bytes())==old['runtimeReferenceSHA256'];assert row(Path(old['localNode']['path']))==old['localNode']
 pins={**old,'kind':'SOURCE64-transport-only-fresh-canonical63-pins','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'HEADReference':a.head,'productReference':a.product,'productUncommitted63':True,'HEADIsAncestryNotCanonical63ProductCommit':True,'canonical63PostPins':row(postPath),'files':files,'pycache':pycs,'index':row(idx,R),'indexInode':554090,'protectedAbsent':snap['skip'],'skipSnapshotReference':row(snapshot),'applicationExecutedByPreparer':False};(D/'evidence/pins64.json').write_text(json.dumps(pins,indent=2)+'\n')
 inputs=[R/'src/09a_placement.js',R/'src/11p_layoutsD.js',R/'src/11zb_bulbs_native_transport51.js',R/'work/avoid009-billboard62-native/evidence/seal62.json',*[R/'work/avoid009-billboard62-native/runner'/f for f in ['fixtures62.cjs','storage62.cjs','storagecheck62.cjs']],R/'work/avoid009-bulbs59-focused/runner/kernel59.cjs',R/'work/avoid009-bulbs59-focused/runner/catalog59.cjs',R/'tasks/evidence/AVOID-009/bulbs-transport51/source51/runner/chunks51.cjs',R/'dev/browser.cjs',R/'dev/avoidance/layouts-b-fixture.js',R/'dev/avoidance/layouts-c-editorial-fonts/manifest.json',rt,snapshot,review,postPath]
 sealed=[row(p,D) for p in sorted(D.rglob('*')) if p.is_file() and p.name!='seal64.json'];seal={'kind':'SOURCE64-FROZEN-BILLBOARD-SYNCHRONOUS-ZERO-ONLY','at':pins['at'],'HEADReference':a.head,'indexSHA256':a.index_sha,'protectedCount':len(snap['skip']),'files':sealed,'inputs':[row(p) for p in inputs],'fixtures':2,'nativeTriples':201,'contextTriples':4,'partialControls':2,'wholeFramePairs':16,'otherD':3,'zeroPairs':205,'typedNegatives':14,'measurementSupported':False,'initiallyUnclippedContextAssumed':True,'safetyCertificate':False,'canonicalWrites':0,'appSelfcheckExecutionsByPreparer':0};(D/'evidence/seal64.json').write_text(json.dumps(seal,indent=2)+'\n');print(json.dumps({'seal':row(D/'evidence/seal64.json'),'files':len(sealed),'inputs':len(inputs),'applicationExecuted':False}))
if __name__=='__main__':main()
