from pathlib import Path
import subprocess,json,gzip,hashlib,re,datetime
R=Path('.');D=R/'tasks/evidence/AVOID-008/writingC861-main01';D.mkdir();G=lambda *a:subprocess.check_output(['git',*a]);sha=lambda b:hashlib.sha256(b).hexdigest();tip=G('rev-parse','c861').decode().strip();base=G('rev-parse','257f8da').decode().strip();protected=['src/09h_layoutsC_editorial.js','src/09j_layoutsC_japanese.js','src/09g_layoutsC_placement.js','src/09a_placement.js','src/11z_layoutsC_transport.js','app/__pycache__/english.cpython-312.pyc'];before={p:sha(Path(p).read_bytes())for p in protected};assert before[protected[-1]]=='7390411f8a74499a4ef117d443f4c04f3814039cbb64343cb50c043cc580f898'
p=Path('src/09i_layoutsC_objects.js');oldi=p.read_bytes();assert oldi==G('show',base+':'+str(p));newi=G('show',tip+':'+str(p))
p=Path('src/11p_layoutsC.js');oldp=p.read_bytes();pat=re.compile(r"(?m)^reg\('([^']+)',")
def blocks(s):
 ms=list(pat.finditer(s));return {'header':s[:ms[0].start()],**{m[1]:s[m.start():ms[i+1].start()]if i+1<len(ms)else s[m.start():]for i,m in enumerate(ms)}},ms
ob,ms=blocks(oldp.decode());bb,_=blocks(G('show',base+':'+str(p)).decode());ib,_=blocks(G('show',tip+':'+str(p)).decode());ids=['postcard','letterPaper'];assert all(ob[k]==bb[k]for k in ids);merged=ob['header']+''.join(ib[m[1]]if m[1]in ids else ob[m[1]]for m in ms);mb,_=blocks(merged);assert all(mb[k]==ob[k]for k in ob if k not in ids);newp=merged.encode();Path('src/09i_layoutsC_objects.js').write_bytes(newi);p.write_bytes(newp)
for name,raw in [('before-09i.js.gz',oldi),('after-09i.js.gz',newi),('before-11p.js.gz',oldp),('after-11p.js.gz',newp)]: (D/name).write_bytes(gzip.compress(raw,mtime=0))
fs=G('ls-tree','-r','--name-only',tip).decode().splitlines();dev=G('diff','--name-only',base,tip,'--','dev/avoidance').decode().splitlines();prefix='tasks/evidence/AVOID-008/objects/';selected={'matrix14.json.gz','writing11.json.gz','default-circle04.json.gz','owned-scope02.json','owned-stage04.json','ruling02.json','ruling-header01.json','postmark03.json','writing-negative04.json','writing-copy-negative02.json','writing-scope-negative02.json','ruling-negative03.json','stage-negative03.json','printed-negative02.json'};imports=dev+[p for p in fs if p.startswith(prefix)and(p[len(prefix):]in selected or any(p.startswith(prefix+x+'/')for x in ['writing-preview05','writing-postcard-carry01'])or p in [prefix+x+'-sourcepins/startup.json'for x in ['matrix14','writing11','default-circle04']])];entries=[]
for p in imports:
 raw=G('show',tip+':'+p);dest=R/p;beforeHash=sha(dest.read_bytes())if dest.exists()else None
 if dest.exists()and dest.read_bytes()!=raw:assert p.startswith('dev/'),p
 dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(raw);entries.append({'path':p,'sha256':sha(raw),'bytes':len(raw),'previousSHA256':beforeHash})
media=[]
for dirname in ['writing-preview05','writing-postcard-carry01']:
 d=Path(prefix+dirname);m=json.loads((d/'manifest.json').read_text());
 # Referenced native MP4s are excluded from Git; copy exact local originals only.
 for src in (Path('/workspace/avoid008-objects')/d).rglob('*.mp4'):
  dest=d/src.relative_to(Path('/workspace/avoid008-objects')/d);raw=src.read_bytes();dest.parent.mkdir(parents=True,exist_ok=True);assert not dest.exists()or dest.read_bytes()==raw;dest.write_bytes(raw);media.append({'path':str(dest),'sha256':sha(raw),'bytes':len(raw),'authority':str(d/'manifest.json')})
after={p:sha(Path(p).read_bytes())for p in protected};assert after==before
out={'timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Parent-authorized fixedc861 writing postcard+letterPaper and09i only. Other32blocks/header/shared/current09h09j/pyc exact; Git read-only. No619MB historicalarchives or generated oldHTML imported as product.','sourceGit':tip,'baseGit':base,'protectedBefore':before,'protectedAfter':after,'09i':{'before':sha(oldi),'after':sha(newi)},'11p':{'before':sha(oldp),'after':sha(newp),'other32BlocksAndHeaderExact':True},'imports':entries,'fixedMedia':media};(D/'operation01-source.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'09i':sha(newi),'11p':sha(newp),'imports':len(imports),'bytes':sum(x['bytes']for x in entries),'media':len(media)}))
