import subprocess,os,json,hashlib,collections
excluded={'.agents','.github','.git','.gitignore','.nojekyll','work','scratch','src','dev','app','tasks','tools','build.py','build_ae.py','build_cep.py','preview_server.py'}
tracked=[os.fsdecode(p) for p in subprocess.check_output(['git','ls-files','-z']).split(b'\0') if p];new=[os.fsdecode(p) for p in subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z','review/AVOID-006/local-20261020-03']).split(b'\0') if p]
files=sorted(p for p in tracked+new if p.split('/')[0] not in excluded and os.path.basename(p)!='.gitignore');inventory=[];risks=[];total=0
for p in files:
 data=open(p,'rb').read();total+=len(data);inventory.append(dict(url=p,bytes=len(data),sha256=hashlib.sha256(data).hexdigest()))
 if p.endswith(('.html','.js','.css','.md','.json','.txt','.xml','.yml','.yaml')):
  if data.startswith((b'---\n',b'---\r\n')):risks.append([p,'frontMatter'])
  if b'{{' in data or b'{%' in data:risks.append([p,'LiquidMarkers'])
result=dict(scope='static projection, NOT an executed Jekyll build',files=len(files),rawProjectedBytes=total,postSharedEstimateBytes=total-116079694,postSharedAndPngEstimateBytes=round(total-116079694-68817943),headroomBelow970MB=970000000-round(total-116079694-68817943),allExistingReviewAssetsRetained=True,sampleProjectRetained='muscle_lofi_optimized.jizuraichi',frontMatterOrLiquidRisks=risks,inventory=inventory)
open('work/avoid006-pages-size-prototype/projection.json','w').write(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='inventory'}));print('topRoots',dict(collections.Counter(p.split('/')[0] for p in files)))
