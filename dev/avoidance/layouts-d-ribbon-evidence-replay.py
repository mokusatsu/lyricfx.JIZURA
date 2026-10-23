"""Replay frozen bounded ribbon evidence without a browser, images or network.

This verifies the portable packet and reruns the parent's exact independent
geometry/clock checker. It is evidence regression, not a new runtime matrix.
"""
import argparse,hashlib,json,pathlib,tarfile,tempfile

root=pathlib.Path(__file__).resolve().parents[2]
evidence=root/'tasks/evidence/AVOID-009/ribbon-final02'
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--packet',type=pathlib.Path,required=True)
args=parser.parse_args()
receipt=json.loads((evidence/'archive-storage02.json').read_text())
expected=receipt.get('sha256') or receipt.get('SHA256')
# The archive remains Git-blob-only and is never materialized in the repository.
assert expected=='b4771c6c85f9ecdd1e1d3a551aff1bd58d916f24680852527fb9331d1b954d24'
h=hashlib.sha256()
with args.packet.open('rb') as f:
 for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
assert h.hexdigest()==expected,'Portable packet SHA mismatch'
parent=json.loads((evidence/'parent-ribbon-review02.json').read_text())
source=(evidence/'parent-ribbon-review02.py').read_text()
with tempfile.TemporaryDirectory(prefix='avoid009-ribbon-replay-') as folder:
 rawdir=pathlib.Path(folder)
 with tarfile.open(args.packet,'r:gz') as archive:
  for name,digest in parent['rawSha256'].items():
   assert name in ('matrix02.json.gz','explicit01.json.gz','focused04.json.gz','matrix02.json.gz.nonimpact.gz')
   data=archive.extractfile('avoid009-ribbon-final02/evidence/'+name).read()
   assert hashlib.sha256(data).hexdigest()==digest,(name,'raw SHA mismatch')
   (rawdir/name).write_bytes(data)
 original="P=pathlib.Path('/tmp/avoid009-ribbon01/evidence/ribbon01')"
 assert source.count(original)==1
 source=source.replace(original,'P=pathlib.Path('+repr(str(rawdir))+')')
 source=source.replace("pathlib.Path('/tmp/parent-ribbon-review02.json')",'pathlib.Path('+repr(str(rawdir/'report.json'))+')')
 exec(compile(source,str(evidence/'parent-ribbon-review02.py'),'exec'),{'__name__':'__main__','__file__':str(evidence/'parent-ribbon-review02.py')})
 actual=json.loads((rawdir/'report.json').read_text())
 assert actual==parent,'Independent replay result differs from accepted parent report'
print('Frozen ribbon evidence replay PASS; historical partial provenance and failed invocations remain unchanged.')
