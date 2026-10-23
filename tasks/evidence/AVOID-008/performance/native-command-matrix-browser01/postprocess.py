from pathlib import Path
import json,gzip,hashlib,shutil
out=Path('tasks/evidence/AVOID-008/performance/native-command-matrix-browser01');logs=Path('/tmp/jizura-native-matrix-browser01-9ujqnlwk');sha=lambda b:hashlib.sha256(b).hexdigest()
for name in ['stdout.log','stderr.log','preexec.json','wait.json']:shutil.copyfile(logs/name,out/('process-'+name))
shutil.copyfile('/tmp/run-native-command-matrix-browser01.py',out/'bootstrap.py')
d=json.loads(gzip.decompress((out/'results.json.gz').read_bytes()));w=json.loads((out/'process-wait.json').read_text());assert w['exitCode']==0 and w['kernelWaitStatus']==0 and w['reapedByWaitpid'] and w['afterProcStat'] is None
assert not d['errors'] and not d['changedInputs'] and not d['changedPackageInputs'] and not d['baselineArchiveChanged'] and not d['concurrency']['after']['jobs']
c=d['comparison'];assert c['deepEqual'] and c['orderedJSONExact'] and c['canonicalJSONExact'];assert c['reference']['counts']==c['candidate']['counts']=={'normalRows':40,'targets':2,'fastReads':84,'nativeFrames':72}
r=d['results'];assert len(r['rows'])==40 and len(r['targets'])==2;allrows=r['rows']+r['targets'];frames=[f for row in allrows for f in row.get('coldFrames',[])+row.get('warmFrames',[])+row['fast'].get('frames',[])];assert len(frames)==72 and all(f['error'] is None for f in frames)
assert all(read['planningRecordCalls']==0 and read['cache']['repairMemoFullReads']==1 and read['cache']['repairMemoFastReads']==read['read']-1 for row in allrows for read in row['fast']['reads'])
kinds={}
for frame in frames:
 for program in frame['programs']:
  for k,v in program['kinds'].items():kinds[k]=kinds.get(k,0)+v
assert [row['targetProgramKind']['kind'] for row in r['targets']]==['nativePath','line'];assert [row['targetProgramKind']['actual'] for row in r['targets']]==[144,45]
proof=[]
for row in d['inputArchives']:
 b=Path(row['archive']).read_bytes();assert sha(b)==row['archiveSHA256'];decoded=gzip.decompress(b);assert sha(decoded)==row['sha256'];assert sha(Path(row['path']).read_bytes())==row['sha256'];proof.append(row)
for row in d['packagePins']:assert sha(Path(row['path']).read_bytes())==row['sha256']
for row in d['sourceGate']['productPins']:assert sha(Path(row['path']).read_bytes())==row['sha256']
b=d['baselineArchive'];a=Path(b['path']).read_bytes();assert sha(a)==b['sha256'] and sha(gzip.decompress(a))==b['decodedSHA256'];assert len(d['packagePins'])==173 and len(d['sourceGate']['productPins'])==86
summary={'passed':True,'scope':'ONE paired normal functional run; not performance; corner targets not normal-radius success','perSide':c['candidate']['counts'],'totalNativeFrames':144,'deepEqual':True,'orderedJSONExact':True,'canonicalJSONExact':True,'referenceFullSHA256':c['baselineFullResultSHA256'],'candidateFullSHA256':c['candidateFullResultSHA256'],'canonicalSHA256':c['canonicalSHA256'],'referenceAndCandidateRowHashes':{'reference':c['reference'],'candidate':c['candidate']},'actualCandidateProgramEventsByKind':kinds,'actualCandidateReturnedPrograms':sum(len(f['programs']) for f in frames),'actualCandidateObservations':sum(len(f['observations']) for f in frames),'nativeErrors':0,'fastPlanningRecordCalls':0,'archivesVerified':len(proof),'packagePinsVerified':173,'productPinsVerified':86,'baselineArchiveReusedAndUnchanged':True,'rawSHA256':sha((out/'results.json.gz').read_bytes()),'oldBodyNotDuplicated':'success; full result/row/target hashes retained','notExecuted':d['notExecuted']}
(out/'summary01.json').write_text(json.dumps(summary,indent=2)+'\n');(out/'archive-proof01.json').write_text(json.dumps(proof,indent=2)+'\n');(out/'cleanup-receipt01.json').write_text(json.dumps({'actualWaitpid':w,'awaitedBrowserServerClose':d['ownedCleanup'],'afterLiveJobs':d['concurrency']['after']['jobs'],'separateZombies':len(d['concurrency']['after']['zombies']),'classification':'own PID reaped via waitpid status0 and afterproc absent; zombies separate, not signalled'},indent=2)+'\n')
print(json.dumps({'passed':True,'archives':len(proof),'rawSHA256':summary['rawSHA256'],'returnedProgramsPerSide':summary['actualCandidateReturnedPrograms'],'observationsPerSide':summary['actualCandidateObservations'],'kinds':kinds}))
