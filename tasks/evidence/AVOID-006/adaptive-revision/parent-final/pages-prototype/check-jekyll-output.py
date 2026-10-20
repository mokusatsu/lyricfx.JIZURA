"""Post-build audit. Missing, changed, or extra output files all fail."""
import os,json,hashlib
base=os.path.abspath(os.path.dirname(__file__));dest=os.path.join(base,'isolated-output');p=json.load(open(base+'/projection.json'));req=json.load(open(base+'/required-url-inventory.json'));expected={r['url']:r for r in p['inventory']};actual={}
for root,dirs,files in os.walk(dest):
 for name in files:
  f=os.path.join(root,name);assert os.path.realpath(f)==os.path.abspath(f),'No output symlinks';rel=os.path.relpath(f,dest);b=open(f,'rb').read();actual[rel]={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
assert set(actual)==set(expected),{'missing':sorted(set(expected)-set(actual)),'extra':sorted(set(actual)-set(expected))}
for rel,r in expected.items():assert actual[rel]=={'bytes':r['bytes'],'sha256':r['sha256']},('Jekyll changed source bytes',rel)
for rel,sha in req['mandatoryURLSHA256'].items():assert actual[rel]['sha256']==sha,('Required URL changed',rel)
result={'passed':True,'actualJekyllOutput':True,'allProjectedURLs':len(actual),'requiredURLs':len(req['mandatoryURLSHA256']),'siteBytes':sum(r['bytes'] for r in actual.values())};open(base+'/jekyll-output-result.json','w').write(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
