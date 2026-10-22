import subprocess,os,json
from pathlib import Path
D=Path('tasks/evidence/AVOID-008/combined033-main01');base={**os.environ,'JIZURA_BROWSER':'/usr/bin/chromium'}
jobs=[('editorial-boundary01',['node','dev/avoidance/layouts-c-editorial-boundary.cjs'],{'JIZURA_C_EDITORIAL_BOUNDARY':str(D/'editorial-boundary01.json')}),('editorial-font01',['node','dev/avoidance/layouts-c-editorial-font-test.cjs'],{'JIZURA_C_EDITORIAL_FONT_REPORT':str(D/'editorial-font01.json')}),('local-jaen-startup01',['node','mcp/site-smoke-test.mjs','--local'],{})]
for name,cmd,extra in jobs:
 with (D/(name+'.log')).open('x') as f:p=subprocess.run(cmd,env={**base,**extra},stdout=f,stderr=subprocess.STDOUT)
 print(json.dumps({'job':name,'exitCode':p.returncode}),flush=True)
 if p.returncode:raise SystemExit(p.returncode)
