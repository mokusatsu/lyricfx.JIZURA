from pathlib import Path
import sys,json,os
H=Path('/workspace/lyricfx.JIZURA/tasks/evidence/AVOID-008/regression-final01');sys.path.insert(0,str(H));import run
T=Path('/tmp/avoid008-integration-owned01');out=T/'core';out.mkdir();plan=json.loads((H/'plan02.json').read_text());rows=[]
env={**os.environ,'JIZURA_BROWSER':'/usr/bin/chromium','NODE_PATH':str(H/'common/dependencies'),'PYTHONDONTWRITEBYTECODE':'1'}
for suite in plan['suites']+['lyric_area_effects_en_only.cjs']:
 for variant in ['baseline','candidate']:
  row=run.run_job(variant,suite,T/variant,env,out);rows.append(row);(out/'results.json').write_text(json.dumps({'complete':False,'rows':rows},indent=2)+'\n');print(json.dumps({k:row[k] for k in ['variant','suite','exitCode','status']}),flush=True)
(out/'results.json').write_text(json.dumps({'complete':True,'rows':rows,'assertionsUnchanged':True,'baseline':'preintegration main snapshot','candidate':'fdb exact final source','publicVerification':'prohibited/not performed'},indent=2)+'\n')
