from pathlib import Path
import subprocess,gzip,hashlib,json,re,datetime
R=Path('.');D=R/'tasks/evidence/AVOID-008/objects859-main01';D.mkdir();G=lambda *a:subprocess.check_output(['git',*a]);tip=G('rev-parse','85928e6').decode().strip();base=G('rev-parse','03384d7').decode().strip();sha=lambda b:hashlib.sha256(b).hexdigest()
ids=['ema','ransom','vinyl','cassette','bookSpine','polaroid','stampSheet','postcard','letterPaper','calendar'];protected=['src/09g_layoutsC_placement.js','src/09a_placement.js','src/09h_layoutsC_editorial.js','src/11z_layoutsC_transport.js','app/__pycache__/english.cpython-312.pyc'];before={p:sha((R/p).read_bytes()) for p in protected};assert before[protected[-1]]=='7390411f8a74499a4ef117d443f4c04f3814039cbb64343cb50c043cc580f898'
p='src/09i_layoutsC_objects.js';newi=G('show',tip+':'+p);assert sha(newi)=='5a96d21b632b3e0a962ea8e30b48c2abd1dd9d27a940d63d20493a67561e5dc9';assert not(R/p).exists();(R/p).write_bytes(newi)
p=R/'src/11p_layoutsC.js';oldp=p.read_bytes();s=oldp.decode();incoming=G('show',tip+':'+str(p)).decode();oldsource=G('show',base+':'+str(p)).decode();pat=re.compile(r"(?m)^reg\('([^']+)',")
def blocks(s):
 ms=list(pat.finditer(s));return {'header':s[:ms[0].start()],**{m[1]:s[m.start():ms[i+1].start()] if i+1<len(ms) else s[m.start():] for i,m in enumerate(ms)}},ms
ob,ms=blocks(s);nb,_=blocks(oldsource);ib,_=blocks(incoming);assert all(ob[k]==nb[k] for k in ids);merged=ob['header']+''.join(ib[m[1]] if m[1] in ids else ob[m[1]] for m in ms);mb,_=blocks(merged);assert all(mb[k]==ob[k] for k in ob if k not in ids);newp=merged.encode();p.write_bytes(newp)
for name,raw in [('before-11p.js.gz',oldp),('after-11p.js.gz',newp),('new-09i.js.gz',newi)]: (D/name).write_bytes(gzip.compress(raw,mtime=0))
allfiles=G('ls-tree','-r','--name-only',tip).decode().splitlines();imports=[p for p in allfiles if p.startswith('dev/avoidance/layouts-c-objects-') or p.startswith('tasks/evidence/AVOID-008/objects/integrated01/') or p.startswith('tasks/evidence/AVOID-008/objects/preview02/') or p in ['tasks/evidence/AVOID-008/objects/matrix04-sourcepins/index.html.gz','tasks/evidence/AVOID-008/objects/matrix05-sourcepins/index.html.gz']];entries=[]
for p in imports:
 raw=G('show',tip+':'+p);dest=R/p;assert not dest.exists() or dest.read_bytes()==raw,p;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(raw);entries.append({'path':p,'sha256':sha(raw),'bytes':len(raw)})
media=[];d=R/'tasks/evidence/AVOID-008/objects/preview02';manifest=json.loads((d/'manifest.json').read_text())
for c in manifest['records']:
 for pin in c['assets']:
  p=pin['file'];dest=d/p
  if not dest.exists():
   source=Path('/workspace/avoid008-integrated')/dest;raw=source.read_bytes();assert sha(raw)==pin['sha256'];dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(raw);media.append({'path':str(dest),'sha256':sha(raw),'bytes':len(raw),'authority':'fixed859 preview02 manifest'})
  assert sha(dest.read_bytes())==pin['sha256']
after={p:sha((R/p).read_bytes()) for p in protected};assert after==before
out={'timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceGit':tip,'baseGit':base,'scope':'Fixed859/257 object10 import into accepted numbered+Swiss main. No old09g validation copy, new writing, Contents mutable, Japanese or generated old HTML imported; Git read-only.','ids':ids,'protectedBefore':before,'protectedAfter':after,'09i':sha(newi),'11p':{'before':sha(oldp),'after':sha(newp),'other24BlocksAndHeaderExact':True,'discHelperIncludedWithRansomRegion':True},'imports':entries,'fixedMedia':media};(D/'operation01-source.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'receipt':str(D/'operation01-source.json'),'sha256':sha((D/'operation01-source.json').read_bytes()),'imports':len(imports),'bytes':sum(e['bytes'] for e in entries),'fixedMedia':len(media),'09i':sha(newi),'11p':sha(newp)}))
