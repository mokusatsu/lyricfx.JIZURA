from pathlib import Path
import json,re,hashlib
T=Path('/tmp/avoid008-integration-owned01');D=T/'core';x=json.loads((D/'results.json').read_text());assert x['complete'];rows=[]
for suite in dict.fromkeys(r['suite'] for r in x['rows']):
 a,b=[r for r in x['rows'] if r['suite']==suite];logs=[(D/(v+'-'+Path(suite).stem)/'stdout-stderr.log').read_text() for v in ['baseline','candidate']]
 clean=lambda s:re.sub(r'/tmp/avoid008-integration-owned01/(baseline|candidate)', '<snapshot>',s)
 row={'suite':suite,'beforeExit':a['exitCode'],'afterExit':b['exitCode'],'rawLogsExact':logs[0]==logs[1],'snapshotPathNormalizedLogsExact':clean(logs[0])==clean(logs[1]),'cleanupBoth':all(z['cleanupComplete'] for z in [a,b])}
 if a['exitCode'] or b['exitCode']:
  row['failureLogs']=logs
 rows.append(row)
out={'rows':rows,'before':{'pass':sum(r['beforeExit']==0 for r in rows),'fail':sum(r['beforeExit']!=0 for r in rows)},'after':{'pass':sum(r['afterExit']==0 for r in rows),'fail':sum(r['afterExit']!=0 for r in rows)},'downstreamCoverage':'JA/independent EN lyric-area and JA compositing stop at original failures; later assertions not certified. project_file/save not executed: saved inherited cut expected0 actual1 before save body remains AVOID-013.'}
(T/'core-comparison.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out,indent=2))
