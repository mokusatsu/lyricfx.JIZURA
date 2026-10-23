from pathlib import Path
import gzip,json,hashlib,shutil,subprocess
out=Path('tasks/evidence/AVOID-008/performance/validated-repair-memo-diagnose01');logs=Path('/tmp/jizura-repair-diagnose01-mlor627u');sha=lambda b:hashlib.sha256(b).hexdigest()
for name in ['stdout.log','stderr.log','preexec.json','wait.json']:shutil.copyfile(logs/name,out/('process-'+name))
shutil.copyfile('/tmp/run-validated-repair-diagnose01.py',out/'bootstrap.py')
d=json.loads((out/'results.json').read_text());raw=gzip.decompress((out/'results.json.gz').read_bytes());assert json.loads(raw)==d
support=json.loads((out/'support-receipt.json').read_text());wait=json.loads((out/'process-wait.json').read_text());assert wait['exitCode']==0 and wait['kernelWaitStatus']==0 and wait['reapedByWaitpid'] and wait['afterProcStat'] is None
assert d['diagnosticCompleted'] and not d['formalExecuted'] and not d['passed'];assert not d['errors'] and not d['changedInputs']
for key in ['countsValid','candidateFullCoverage','actualPipelineValid','pinnedFontCorpusQualified','inputParity']:assert d[key]
archive=[]
for path,digest in d['pins'].items():
 p=out/('input-'+path.replace('/','__')+'.gz');b=gzip.decompress(p.read_bytes());assert sha(b)==digest;assert sha(Path(path).read_bytes())==digest;archive.append({'path':path,'sha256':digest,'bytes':len(b),'archive':str(p),'archiveSHA256':sha(p.read_bytes())})
assert len(archive)==120
baseline=gzip.decompress((out/d['baseline']['path']).read_bytes());assert sha(baseline)==d['baseline']['sha256'];assert baseline==subprocess.check_output(['git','-c','gc.auto=0','show',d['baseline']['commit']+':index.html'])
for p in support['packagePins']:assert sha(Path(p['path']).read_bytes())==p['sha256']
for p in support['productPins']:assert sha(Path(p['path']).read_bytes())==p['sha256']
assert len(support['packagePins'])==173 and len(support['productPins'])==86
assert not support['after']['jobs'] and not support['violations'] and not support['changedGateInputs'] and not support['changedProductPins'] and not support['changedPackagePins']
assert all(not r['foreign'] for r in d['concurrency']);assert d['concurrency'][-1]['phase']=='post'
sideSummary=[]
for s in d['sides']:
 assert s['counts']['actualCuts']==100 and s['counts']['regions']==100 and len(s['frames'])==80 and not s['renderErrors']
 assert len(s['parts'])==4 and [p['warmup'] for p in s['parts']]==[True,True,True,False]
 p=s['parts'][-1];c=s['cache']['completed'];q=s['fontQualification'];memo={k:v for k,v in c.items() if k.startswith('repairMemo')} if c else None
 if s['side']=='candidate':assert c['repairMemoFullReads']==1 and c['repairMemoFastReads']==2 and c['repairMemoCompiles']==1 and c['repairMemoFallbacks']==0 and c['repairMemoCapped']==0
 if s['side']=='candidate' and s['on']:
  assert s['counts']['staged']==100 and s['renderCalls']=={'record':80,'replay':80} and len(s['observations'])==80 and q['complete']
 sideSummary.append({'side':s['side'],'on':s['on'],'counts':s['counts'],'measuredPoint':{k:p[k] for k in ['sourceMs','normalizationMs','finalizeMs','totalMs','finalizationRecordCalls','actualPlanningRecordCalls']},'planningCalls':s['planningCalls'],'renderCalls':s['renderCalls'],'observations':len(s['observations']),'renderFrames':len(s['frames']),'fontQualification':q,'memo':memo})
summary={'diagnosticCompleted':True,'formalExecuted':False,'passed':False,'planningStatistic':'one post-warm point, not p95; no formal threshold evaluation','comparisons':d['comparisons'],'flags':{k:d[k] for k in ['countsValid','candidateFullCoverage','actualPipelineValid','pinnedFontCorpusQualified','inputParity']},'sides':sideSummary,'inputArchivesVerified':120,'productPinsVerified':86,'packagePinsVerified':173,'baselineGitBytesExact':True,'resultsPrettySHA256':sha((out/'results.json').read_bytes()),'resultsGzipSHA256':sha((out/'results.json.gz').read_bytes()),'supportReceiptSHA256':sha((out/'support-receipt.json').read_bytes()),'noRetry':True,'no1000CDPImagesPublic':True}
(out/'summary01.json').write_text(json.dumps(summary,indent=2)+'\n');(out/'archive-proof01.json').write_text(json.dumps(archive,indent=2)+'\n');(out/'cleanup-receipt01.json').write_text(json.dumps({'actualWaitpid':wait,'runnerPostAfterAwaitedBrowserServerClose':d['concurrency'][-1],'supportAfter':support['after'],'supportExitCode':support['runnerExitCode'],'diskEndBytes':support['diskAfterBytes'],'diskReserveBytes':support['reserveBytes'],'conclusion':'own PID reaped/gone; no live jobs; zombies separate; no cleanup signal needed'},indent=2)+'\n')
print(json.dumps({'verified':True,'rawSHA256':summary['resultsGzipSHA256'],'on':d['comparisons'][0],'off':d['comparisons'][1]}))
