"""Deferred source materialization. Never writes the repository or existing bundles."""
import hashlib,json,os,shutil,sys
base=os.path.abspath(os.path.dirname(__file__));repo=os.path.dirname(os.path.dirname(base));dest=os.path.join(base,'isolated-source')
assert not os.path.exists(dest),'Use a new empty isolated source destination'
m=json.load(open(os.path.join(base,'projection.json')));os.mkdir(dest)
for r in m['inventory']:
 rel=r['url'];assert not os.path.isabs(rel) and '..' not in rel.split('/')
 source=os.path.join(repo,rel);assert os.path.realpath(source)==os.path.abspath(source),'No source symlinks'
 data=open(source,'rb').read();assert len(data)==r['bytes'] and hashlib.sha256(data).hexdigest()==r['sha256'],('Source changed after projection; refresh the isolated projection first',rel)
 target=os.path.join(dest,rel);os.makedirs(os.path.dirname(target),exist_ok=True);open(target,'wb').write(data)
shutil.copyfile(os.path.join(base,'_config.prototype.yml'),os.path.join(dest,'_config.yml'))
print(json.dumps({'staged':True,'files':len(m['inventory']),'destination':dest,'bytes':m['rawProjectedBytes']}))
