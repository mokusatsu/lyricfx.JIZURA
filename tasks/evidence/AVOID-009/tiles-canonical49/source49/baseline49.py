"""Parent-only AFTER baseline, six unchanged assertions; no project-save/performance claim."""
from pathlib import Path
import sys,os,json,hashlib,subprocess
sys.dont_write_bytecode=True
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-tiles49-integration'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def main():
 assert os.environ.get('TILES49_BASELINE_RELEASE')=='PARENT_REVIEWED_CANONICAL_AFTER' and os.environ.get('PYTHONDONTWRITEBYTECODE')=='1'
 pre=json.loads((D/'evidence/pre-pins49.json').read_text());post=json.loads((Path(os.environ['TILES49_BUILD_OUT'])/'post-pins49.json').read_text());seal=json.loads((D/'evidence/seal49.json').read_text());paired=R/'tasks/evidence/AVOID-009/core-baseline-evening-20261024/paired-invocation.json';before=json.loads(paired.read_text());assert before['afterProduct']=='66c95cd5' and next(r for r in before['rows'] if r['side']=='after')['exitCode']==0
 for p in before['sameUnchangedTests']:assert sha(R/p['path'])==p['sha256']
 for p in seal['files']:assert sha(D/p['path'])==p['sha256']
 for p in seal['inputs']:assert sha(p['path'])==p['sha256']
 runtime=json.loads(Path(post['runtimeAbsoluteReference']).read_text());assert sha(post['runtimeAbsoluteReference'])==post['runtimeReferenceSHA256'];node=Path(post['localNode']['path']);assert sha(node)==post['localNode']['sha256']
 for p in runtime['runtimeExternalPins']:assert sha(p['path'])==p['sha256']
 def check():
  for p in post['files']+post['pycache']:assert sha(R/p['path'])==p['sha256']
  assert sha(R/post['index']['path'])==post['index']['sha256'];assert all(not(R/p).exists() for p in post['absent57'])
 check();out=Path(os.environ['TILES49_BASELINE_OUT']);assert str(out).startswith('/dev/shm/') and not out.exists();out.mkdir(parents=True);env=dict(os.environ,PATH=str(node.parent)+os.pathsep+os.environ['PATH'],JIZURA_BROWSER=runtime['browser']['path'],PYTHONDONTWRITEBYTECODE='1');result=subprocess.run([sys.executable,'-B',str(R/'dev/avoidance/baseline.py'),'--out',str(out)],cwd=R,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT);(out/'invocation.stdout.txt').write_bytes(result.stdout)
 try:check();post_error=None
 except BaseException as e:post_error=str(e)
 receipt={'kind':'SOURCE49-six-unchanged-AFTER-baseline','exitCode':result.returncode,'postPinsError':post_error,'beforeReference':str(paired),'beforeReferenceSHA256':sha(paired),'beforeReferenceReusedNotRerun':True,'testsUnchanged':before['sameUnchangedTests'],'actualBrowser':runtime['browser'],'savingBodyTested':False,'formalPerformance':False,'publicChecks':0};(out/'baseline49-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt));assert result.returncode==0 and post_error is None
if __name__=='__main__':main()
