"""Parent-only six unchanged AFTER tests; reuse exact accepted53 AFTER as before."""
from pathlib import Path
import sys,os,json,hashlib,subprocess
sys.dont_write_bytecode=True
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-billboard63-canonical'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def load(p):return json.loads(Path(p).read_text())
def main():
 assert os.environ.get('BILLBOARD63_BASELINE_RELEASE')=='PARENT_REVIEWED_CANONICAL_AFTER'and os.environ.get('PYTHONDONTWRITEBYTECODE')=='1'
 pre=load(D/'evidence/pre-pins63.json');post=load(Path(os.environ['BILLBOARD63_BUILD_OUT'])/'post-pins63.json');seal=load(D/'evidence/seal63.json');beforeDir=R/'tasks/evidence/AVOID-009/bulbs-canonical53';before=load(beforeDir/'baseline-after53/baseline53-receipt.json');beforePins=load(beforeDir/'post-pins53.json');assert before['exitCode']==0 and before['postPinsError']is None and all(r['exitCode']==0 for r in load(beforeDir/'baseline-after53/baseline-results.json')['results']);assert pre['productReference']=='e891de1a778f26c79fb978678bb8a9a7b76b1c93';assert pre['files']==beforePins['files'],'Before-reference source/HTML/font identities must be exact accepted53 postbuild'
 for p in before['testsUnchanged']:assert sha(R/p['path'])==p['sha256']
 for p in seal['files']:assert sha(D/p['path'])==p['sha256']
 for p in seal['inputs']:assert sha(p['path'])==p['sha256']
 runtime=load(post['runtimeAbsoluteReference']);assert sha(post['runtimeAbsoluteReference'])==post['runtimeReferenceSHA256'];node=Path(post['localNode']['path']);assert sha(node)==post['localNode']['sha256']==beforePins['localNode']['sha256'];assert runtime['browser']==before['actualBrowser']
 for p in runtime['runtimeExternalPins']:assert sha(p['path'])==p['sha256']
 def check():
  for p in post['files']+post['pycache']:assert sha(R/p['path'])==p['sha256']
  assert sha(R/post['index']['path'])==post['index']['sha256'];assert all(not(R/p).exists()for p in post['protectedAbsent'])
 check();out=Path(os.environ['BILLBOARD63_BASELINE_OUT']);assert str(out).startswith('/dev/shm/')and not out.exists();out.mkdir(parents=True);env=dict(os.environ,PATH=str(node.parent)+os.pathsep+os.environ['PATH'],JIZURA_BROWSER=runtime['browser']['path'],PYTHONDONTWRITEBYTECODE='1');result=subprocess.run([sys.executable,'-B',str(R/'dev/avoidance/baseline.py'),'--out',str(out)],cwd=R,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT);(out/'invocation.stdout.txt').write_bytes(result.stdout)
 try:check();post_error=None
 except BaseException as e:post_error=str(e)
 receipt={'kind':'SOURCE63-six-unchanged-AFTER-baseline','exitCode':result.returncode,'postPinsError':post_error,'beforeReference':str(beforeDir/'baseline-after53/baseline53-receipt.json'),'beforeReferenceSHA256':sha(beforeDir/'baseline-after53/baseline53-receipt.json'),'beforeReferenceReusedNotRerun':True,'beforeSourceHTMLFontIdentityExact53Postbuild':True,'testsUnchanged':before['testsUnchanged'],'actualBrowser':runtime['browser'],'savingBodyTested':False,'formalPerformance':False,'publicChecks':0};(out/'baseline63-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt));assert result.returncode==0 and post_error is None
if __name__=='__main__':main()
