from pathlib import Path
import sys,os,json
R=Path('/workspace/lyricfx.JIZURA');H=R/'tasks/evidence/AVOID-008/regression-final01';sys.path.insert(0,str(H));from process_cleanup import execute_process
D=R/'tasks/evidence/AVOID-008/integration-owned-final01';D.mkdir(exist_ok=True);T=Path('/tmp/avoid008-integration-owned01');env={**os.environ,'JIZURA_BROWSER':'/usr/bin/chromium','NODE_PATH':str(H/'common/dependencies'),'PYTHONDONTWRITEBYTECODE':'1'};rows=[]
for name,helper,key in [('swiss','swiss','JIZURA_C_SWISS_MAIN_CARRY'),('proofread','proofread','JIZURA_C_PROOFREAD_CARRY'),('letter','integration-owned-letter','OBJECTS_MAIN_CARRY'),('poster','poster','JIZURA_C_POSTER_CARRY')]:
 J=T/('carry-'+name);J.mkdir();script='dev/avoidance/layouts-c-'+helper+('-carry.cjs' if name=='letter' else '-main-carry.cjs');out=str(D.relative_to(R))+'/'+name+'-carry.json'
 result=execute_process(['node',script],cwd=R,env={**env,key:out},folder=J,timeout=300);rows.append({'case':name,'helper':script,'result':result});(T/'carry-execution.json').write_text(json.dumps(rows,indent=2)+'\n');print(json.dumps({'case':name,'exit':result['exitCode'],'error':result['runnerError']}),flush=True)
J=T/'local-ja-en';J.mkdir();result=execute_process(['node','--loader',str(R/'tasks/evidence/AVOID-008/regression01/smoke-loader.mjs'),'mcp/site-smoke-test.mjs','--local'],cwd=R,env=env,folder=J,timeout=180);(T/'local-ja-en-execution.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'localJaEnExit':result['exitCode']}),flush=True)
