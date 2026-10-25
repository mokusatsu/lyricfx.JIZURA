from pathlib import Path
import os,subprocess,json,hashlib
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024');private=B/'evening-resume14-index-round-1';head='303d878ea3be514f58bed80c713d0f7dae87dfc1';H=lambda b:hashlib.sha256(b).hexdigest();assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==head;ps=H(private.read_bytes());print(json.dumps({'privateIndexSHA256':ps,'head':head}),flush=True)
subprocess.run(['python','-B','work/avoid009-capacity-objects14/private_index_resume14.py','INSTALL','--round','1','--expected-head',head,'--private-index-sha256',ps],check=True)
p=B/'evening-resume14-index-round-1-receipt.json';b=p.read_bytes();e=R/'tasks/evidence/AVOID-009/evening-20261024/storage-capacity-objects14'/p.name
with e.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
assert e.read_bytes()==b;print(json.dumps({'durableReceiptSHA256':H(b),'receipt':json.loads(b)}),flush=True)
p=subprocess.run(['git','-c','gc.auto=0','-c','maintenance.auto=false','push','origin','work'],stdout=subprocess.PIPE,stderr=subprocess.PIPE);q={'head':head,'pushExitCode':p.returncode,'stdoutBytes':len(p.stdout),'stdoutSHA256':H(p.stdout),'stderrBytes':len(p.stderr),'stderrSHA256':H(p.stderr),'publicResultChecks':0};(R/'tasks/evidence/AVOID-009/evening-20261024/storage-capacity-objects14/push63-operation.json').write_text(json.dumps(q,indent=2)+'\n');print('PUSH_DONE '+str(p.returncode),flush=True);assert p.returncode==0
