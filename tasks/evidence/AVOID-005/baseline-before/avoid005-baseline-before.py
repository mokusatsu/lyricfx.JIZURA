import os,subprocess,json,time
from pathlib import Path
root=Path('/workspace/work/avoid005-before')
out=Path('/workspace/work/jizura-handoff/avoid005-baseline-before')
out.mkdir(parents=True,exist_ok=True)
import http.server,threading,functools
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(("127.0.0.1",8765),functools.partial(QuietHandler,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
results=[]
for name in ['lyric_emphasis_test.cjs','lyric_features_test.cjs','lyric_placement_stability_test.cjs']:
    start=time.time()
    r=subprocess.run(['node','--require','/workspace/work/jizura-handoff/avoid004-browser-preload.cjs',str(root/'dev'/name)],cwd=root,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=300)
    (out/(name+'.log')).write_bytes(r.stdout)
    results.append({'test':name,'exitCode':r.returncode,'seconds':time.time()-start})
    print(name,r.returncode,flush=True)
(out/'results.json').write_text(json.dumps({'baselineCommit':'3d8f52c7ce3f8efec25f5f0d7ad4c71bdb225173','runtimeOverride':'browser executable only; assertions unmodified','results':results},indent=2)+'\n')

server.shutdown()
raise SystemExit(any(x["exitCode"] for x in results))
