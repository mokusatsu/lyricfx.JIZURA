from pathlib import Path
import subprocess,gzip,hashlib,json,re,datetime
R=Path('.');D=R/'tasks/evidence/AVOID-008/proofread4d72-main01';D.mkdir();G=lambda *a:subprocess.check_output(['git',*a]);tip=G('rev-parse','4d72d23').decode().strip();base=G('rev-parse','e13be88').decode().strip();sha=lambda b:hashlib.sha256(b).hexdigest()
protected=['src/09g_layoutsC_placement.js','src/09i_layoutsC_objects.js','src/09j_layoutsC_japanese.js','src/09a_placement.js','src/11z_layoutsC_transport.js','app/__pycache__/english.cpython-312.pyc'];before={p:sha((R/p).read_bytes()) for p in protected};assert before[protected[-1]]=='7390411f8a74499a4ef117d443f4c04f3814039cbb64343cb50c043cc580f898'
files=G('diff','--name-only',base,tip).decode().splitlines();imports=[p for p in files if p.startswith('dev/avoidance/layouts-c-editorial-proofread') or p.startswith('tasks/evidence/AVOID-008/editorial/')];assert all(not(R/p).exists() or (R/p).read_bytes()==G('show',tip+':'+p) for p in imports)
p=R/'src/09h_layoutsC_editorial.js';oldh=p.read_bytes();assert oldh==G('show',base+':'+str(p));newh=G('show',tip+':'+str(p))
# Frozen parent-reviewed diff is Proofread-only; core dictionary functions exact.
a=oldh.index(b'// Dictionary-only');b=oldh.index(b'function mapping(');assert newh[a:newh.index(b'function mapping(')]==oldh[a:b]
for name,raw in [('before-09h.js.gz',oldh),('after-09h.js.gz',newh)]: (D/name).write_bytes(gzip.compress(raw,mtime=0))
p.write_bytes(newh);p=R/'src/11p_layoutsC.js';oldp=p.read_bytes();s=oldp.decode();incoming=G('show',tip+':'+str(p)).decode();native=G('show',base+':'+str(p)).decode();pat=re.compile(r"(?m)^reg\('([^']+)',")
def blocks(s):
 ms=list(pat.finditer(s));return {'header':s[:ms[0].start()],**{m[1]:s[m.start():ms[i+1].start()] if i+1<len(ms) else s[m.start():] for i,m in enumerate(ms)}},ms
ob,ms=blocks(s);nb,_=blocks(native);ib,_=blocks(incoming);assert ob['proofread']==nb['proofread'];merged=ob['header']+''.join(ib[m[1]] if m[1]=='proofread' else ob[m[1]] for m in ms);mb,_=blocks(merged);assert all(mb[k]==ob[k] for k in ob if k!='proofread');newp=merged.encode();p.write_bytes(newp)
for name,raw in [('before-11p.js.gz',oldp),('after-11p.js.gz',newp)]: (D/name).write_bytes(gzip.compress(raw,mtime=0))
entries=[]
for p in imports:
 raw=G('show',tip+':'+p);dest=R/p;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(raw);entries.append({'path':p,'sha256':sha(raw),'bytes':len(raw)})
media=[]
for folder in ['proofread-preview02']:
 d=R/'tasks/evidence/AVOID-008/editorial'/folder;m=json.loads((d/'manifest.json').read_text())
 for f,pin in m['assets'].items():
  dest=d/f
  if not dest.exists():
   source=Path('/workspace/avoid008-editorial')/d/f;assert source.exists();raw=source.read_bytes();assert sha(raw)==pin['sha256'];dest.write_bytes(raw);media.append({'path':str(dest),'sha256':sha(raw),'bytes':len(raw),'sourceAuthority':'fixed 4d72d23 manifest; Git-excluded local media'})
  assert sha(dest.read_bytes())==pin['sha256']
after={p:sha((R/p).read_bytes()) for p in protected};assert after==before
out={'timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceGit':tip,'baseGit':base,'scope':'Proofread-only parent-authorized fixed 4d72d23 application; other33 source blocks/header/09g09a11z/pyc exact. Root parent docs untouched. Contents/object mutable excluded. Git show/diff only; no index operations.','protectedBefore':before,'protectedAfter':after,'09h':{'before':sha(oldh),'after':sha(newh),'dictionaryFunctionSectionExact':True,'note':'Proofread-only owner/target/leader-route/actual-note-main-stamp quality branches; other layout quality adds proofMarginProof:null without geometry changes'},'11p':{'before':sha(oldp),'after':sha(newp),'allOther33BlocksAndHeaderExact':True},'imports':entries,'fixedMedia':media};(D/'operation01-source.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'receipt':str(D/'operation01-source.json'),'sha256':sha((D/'operation01-source.json').read_bytes()),'dev':sum(p.startswith('dev/') for p in imports),'evidence':sum(p.startswith('tasks/') for p in imports),'media':len(media),'source11p':sha(newp),'module09h':sha(newh)}))
