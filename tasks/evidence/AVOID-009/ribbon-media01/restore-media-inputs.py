"""Restore exact capture inputs into a new /tmp directory; do not recapture automatically."""
import argparse,pathlib,json,hashlib,gzip,tarfile,subprocess,shutil
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--repo',type=pathlib.Path,required=True);p.add_argument('--font-packet',type=pathlib.Path,required=True);p.add_argument('--destination',type=pathlib.Path,required=True);a=p.parse_args();here=pathlib.Path(__file__).parent;m=json.loads((here/'source-restore-map.json').read_text());g=json.loads((here/'parent-ribbon-media-git-map01.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest();assert not a.destination.exists();a.destination.mkdir(parents=True);snapshot=a.destination/'source-snapshot';snapshot.mkdir()
def put(path,b,digest):
 assert sha(b)==digest,str(path);path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(b)
for pin in g['gitPinnedSources']:
 rel=pathlib.PurePosixPath(pin['file']);assert not rel.is_absolute() and '..' not in rel.parts
 b=subprocess.check_output(['git','-C',str(a.repo),'cat-file','blob',pin['restoreFrom']]);put(snapshot/pin['file'],b,pin['sha256'])
before=subprocess.check_output(['git','-C',str(a.repo),'cat-file','blob',g['beforeHTML']['restoreFrom']]);put(a.destination/'before-23a62ee.html',before,g['beforeHTML']['sha256'])
font=m['fontRestore'];assert sha(a.font_packet.read_bytes())==font['archiveSHA256']
with tarfile.open(a.font_packet,'r:gz') as t:b=gzip.decompress(t.extractfile(font['member']).read())
put(a.destination/font['restorePath'],b,font['sha256'])
for name in ['capture.cjs','accepted-source-freeze.json','cases.json']:shutil.copyfile(here/'invocation'/name,a.destination/name)
freeze=(a.destination/'accepted-source-freeze.json').read_bytes()
for pin in json.loads(freeze)['sourcePins']:assert sha((snapshot/pin['file']).read_bytes())==pin['sha256']
print('Exact99 capture input pins restored; no browser/encoder run.')
print('For an authorized new local capture (Playwright, Chromium and ffmpeg required):')
print('JIZURA_BROWSER=/usr/bin/chromium node',a.destination/'capture.cjs',snapshot,sha(freeze),a.destination/'NEW-output')
