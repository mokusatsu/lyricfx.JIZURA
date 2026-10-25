from pathlib import Path
import os,subprocess,json,hashlib
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024');private=B/'evening-resume15-index-round-2';head='309a7c16b82e130ea92c966983576e4d6f770437';H=lambda b:hashlib.sha256(b).hexdigest();assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==head;ps=H(private.read_bytes());assert ps=='c381b7fe6a5e2bed54c2cf3f8b19f679e78c2d63a93c5303c5e208baf2295a8a';print(json.dumps({'privateIndexSHA256':ps,'head':head}),flush=True)
subprocess.run(['python','-B','work/avoid009-capacity-objects15/private_index_resume15.py','INSTALL','--round','2','--expected-head',head,'--private-index-sha256',ps],check=True)
p=B/'evening-resume15-index-round-2-receipt.json';b=p.read_bytes();e=R/'tasks/evidence/AVOID-009/evening-20261024/storage-capacity-objects15'/p.name
with e.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
assert e.read_bytes()==b;print(json.dumps({'durableReceiptSHA256':H(b),'receipt':json.loads(b)}),flush=True)
p=subprocess.run(['git','-c','gc.auto=0','-c','maintenance.auto=false','push','origin','work'],stdout=subprocess.PIPE,stderr=subprocess.PIPE);q={'head':head,'pushExitCode':p.returncode,'stdoutBytes':len(p.stdout),'stdoutSHA256':H(p.stdout),'stderrBytes':len(p.stderr),'stderrSHA256':H(p.stderr),'publicResultChecks':0};(R/'tasks/evidence/AVOID-009/evening-20261024/storage-capacity-objects15/push62-round2-operation.json').write_text(json.dumps(q,indent=2)+'\n');print('PUSH_DONE '+str(p.returncode),flush=True);assert p.returncode==0
