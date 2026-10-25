"""Target j231 numeric diagnosis only. No Canvas, encoder, image or full-review replay."""
import sys
sys.dont_write_bytecode=True
import pathlib,json,gzip,hashlib,runpy
B=pathlib.Path(__file__).parent;RAW=B.parent/'media32-media02-20261025c/raw';R=runpy.run_path('/workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py');tables={k:[] for k in ['matrix','paint','catalog']};manifest=json.loads((RAW/'manifest.json').read_bytes());details=json.loads((RAW/'details/manifest.json').read_bytes());target=[];recordsRead=0
for ref in details['records']:
 data=(RAW/'details'/ref['file']).read_bytes();assert len(data)==ref['bytes'] and hashlib.sha256(data).hexdigest()==ref['sha256'];record=json.loads(gzip.decompress(data))
 for k,delta in record['tableDeltas'].items():
  for x in delta:assert x['id']==len(tables[k]);tables[k].append(x['value'])
 for item in record['binding']['items']:
  if item['type']=='object':
   fields=dict(item['entries']);j=R['restore'](fields['j'],tables)
   if j!=231:continue
   value=R['restore'](item,tables)
  else:
   value=R['restore'](item,tables)
   if value.get('j')!=231:continue
  target.append(value)
  if len(target)==4:break
 recordsRead+=1
 if len(target)==4:break
assert len(target)==4 and [r['kind'] for r in target]==['media-frame']*3+['media-qualified']
point=lambda m,x,y:[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]]
summaries=[]
for f in target[:3]:
 frames=[]
 for p in f['passes']:
  c=p['clock'];out=1-c['pOut']**3;ga=out;cell=68.26666666666667*(1 if f['variant']=='native' else .58);gx=(960-9*cell-(960*.24 if f['variant']=='native' else 0))/2;gy=(540-5*cell-(0 if f['variant']=='native' else 16.384*5))/2;paper=[x for x in p['calls'] if x['kind']=='rect'][:2];paperFill=paper[1];paperBottomLocal=paperFill['args'][1]+paperFill['args'][3];paperMatrix=paperFill['matrix'];paperBottomWorld=point(paperMatrix,paperFill['args'][0],paperBottomLocal)[1];numbers=[x['args'][0]['text'] for x in p['calls'] if x.get('sub')=='number'];pencils=[]
  for x in p['calls']:
   if x.get('sub')!='pencil':continue
   it=x['args'][0];rr=round((it['y']-gy)/cell-.56);cc=round((it['x']-gx)/cell-.5);paints=[r for r in p['records'] if r['owner']==x['owner'] and r['kind'].endswith('Text')];supports=[s for s in p['support']['rows'] if s['owner']==x['owner']];extents=[]
   for r in paints:
    mt=r['metrics'];xx,yy=r['args'][1:3];corners=[[xx-mt['actualBoundingBoxLeft'],yy-mt['actualBoundingBoxAscent']],[xx+mt['actualBoundingBoxRight'],yy+mt['actualBoundingBoxDescent']]];world=[point(r['matrix'],*q) for q in corners];extents.append({'glyph':r['args'][0],'alpha':r['state']['alpha'],'fillStyle':r['state']['fillStyle'],'inkBottomLocal':yy+mt['actualBoundingBoxDescent'],'inkBottomWorld':max(q[1] for q in world),'inkBeyondPaperWorld':max(q[1] for q in world)-paperBottomWorld,'supportBounds':[s['bounds'] for s in supports]})
   pencils.append({'text':it['text'],'cell':[rr,cc],'font':it['font'],'size':it['size'],'sourceAlpha':it['alpha'],'paintCount':len(paints),'paintExtents':extents})
  bounds=p['support']['rows'];union={'x0':min(s['bounds']['x0'] for s in bounds),'y0':min(s['bounds']['y0'] for s in bounds),'x1':max(s['bounds']['x1'] for s in bounds),'y1':max(s['bounds']['y1'] for s in bounds)} if bounds else None
  frames.append({'pass':c['pass'],'clock':c,'out':out,'gaTimesR':ga*5,'rowVisibility':[max(0,min(1,ga*5-r)) for r in range(5)],'cell':cell,'paperFillCall':paperFill,'paperBottomLocal':paperBottomLocal,'paperBottomWorld':paperBottomWorld,'numberIDs':numbers,'pencils':pencils,'supportUnion':union,'allSupportWithinViewport':all(s['bounds']['x0']>=0 and s['bounds']['y0']>=0 and s['bounds']['x1']<=960 and s['bounds']['y1']<=540 for s in bounds),'supportError':p['support']['error'],'geometry':p['geometry'],'qualityPassed':p['quality']['passed']})
 summaries.append({'variant':f['variant'],'j':f['j'],'time':f['time'],'healthy':f['healthy'],'passes':frames,'rgbaSHA256':f['rgba']['sha256']})
result={'state':'TARGET231_SOURCE_EXIT_DIAGNOSIS_ONLY','raw':str(RAW),'manifestSHA256':hashlib.sha256((RAW/'manifest.json').read_bytes()).hexdigest(),'fullFramesRestored':3,'qualificationRowsRestored':1,'codecRecordsReadForTablesAndTarget':recordsRead,'summaries':summaries,'qualification':target[3],'Canvas':0,'encoder':0,'imagesViewed':0,'newDesign':False}
(B/'result231.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
for r in summaries:
 print(json.dumps({'variant':r['variant'],'passes':[{'pass':p['pass'],'lt':p['clock']['lt'],'pOut':p['clock']['pOut'],'out':p['out'],'rows':p['rowVisibility'],'paperBottomWorld':p['paperBottomWorld'],'numbers':p['numberIDs'],'pencils':p['pencils'],'supportUnion':p['supportUnion'],'viewport':p['allSupportWithinViewport']} for p in r['passes']]},ensure_ascii=False))
print(json.dumps({'qualification':target[3],'Canvas':0,'imagesViewed':0},ensure_ascii=False))
