"""Portable prerequisites for the existing save test; assertions stay in that test."""
import os,subprocess,http.server,threading,json,time
from pathlib import Path
root=Path(__file__).resolve().parents[2];out=root/'tasks/evidence/AVOID-002';env=os.environ.copy()
font=env.get('JIZURA_TEST_FONT')
if not font or not Path(font).is_file():raise SystemExit('Set JIZURA_TEST_FONT to a real readable TTF; no success claimed without font')
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(root),**kw)
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',8765),Handler);threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 start=time.time();r=subprocess.run(['node',str(root/'dev/project_file_test.cjs')],cwd=root,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=240);(out/'project_file_test.cjs.log').write_bytes(r.stdout);(out/'saved-project-results.json').write_text(json.dumps({'exitCode':r.returncode,'seconds':time.time()-start,'server':'127.0.0.1:8765, repository root','font':font,'browser':env.get('JIZURA_BROWSER')},indent=2)+'\n');raise SystemExit(r.returncode)
finally:server.shutdown();server.server_close()
