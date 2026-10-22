import subprocess,os,json
from pathlib import Path
D=Path('tasks/evidence/AVOID-008/combined033-main01')
jobs=[('physical-motion01','layouts-c-badge-physical-test.cjs','JIZURA_C_BADGE_PHYSICAL_REPORT'),('nameTag-crop01','layouts-c-badge-crop-test.cjs','JIZURA_C_BADGE_CROP_REPORT'),('cache-off01','layouts-c-measure-cache-test.cjs','JIZURA_C_CACHE_REPORT'),('sticky-guard01','layouts-c-strict-guard-test.cjs','JIZURA_C_STRICT_REPORT')]
for name,script,key in jobs:
 env={**os.environ,'JIZURA_BROWSER':'/usr/bin/chromium',key:str(D/(name+'.json'))};assert not(D/(name+'.json')).exists()
 with (D/(name+'.log')).open('x') as f:p=subprocess.run(['node','dev/avoidance/'+script],env=env,stdout=f,stderr=subprocess.STDOUT)
 print(json.dumps({'job':name,'exitCode':p.returncode}),flush=True)
 if p.returncode:raise SystemExit(p.returncode)
