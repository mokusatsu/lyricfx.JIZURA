"""Only the harness cleanup self-test; never launches browser/product suites."""
from pathlib import Path
import os,json,subprocess,signal,time,hashlib,datetime
from process_cleanup import execute_process,identity,key
D=Path(__file__).resolve().parent

def main():
 out=D/'cleanup-selftest01';assert not out.exists(),'Preserve earlier receipts';out.mkdir();sentinel=subprocess.Popen(['node','-e','setInterval(()=>{},1000)'],env={k:v for k,v in os.environ.items()if not k.startswith('JIZURA_CORE_')},stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True);sentinelID=identity(sentinel.pid);sentinelFD=os.pidfd_open(sentinel.pid);assert key(identity(sentinel.pid))==key(sentinelID);rows=[]
 try:
  for mode in ['timeout','exception','normal']:
   folder=out/mode;folder.mkdir();env={**os.environ,'JIZURA_SYNTHETIC_MODE':mode}
   def after(proc):
    deadline=time.monotonic()+2
    while not(folder/'synthetic-children.json').exists():
     if time.monotonic()>deadline:raise RuntimeError('Synthetic detached children not ready')
     time.sleep(.02)
    if mode=='exception':raise RuntimeError('SYNTHETIC_AFTER_LAUNCH_EXCEPTION')
   result=execute_process(['node','-r',str(D/'spawn-registry.cjs'),str(D/'synthetic-detached.cjs')],cwd=D,env=env,folder=folder,timeout=.6 if mode=='timeout'else 3,after_launch=after);children=json.loads((folder/'synthetic-children.json').read_text());cleanup=result['cleanup'];assert cleanup['complete'],cleanup;assert not cleanup['remainingOwnedIdentities'];owned={x['identity']['pid']:x for x in cleanup['owned']};assert children['child']in owned and children['grandchild']in owned;assert owned[children['child']]['identity']['pgid']!=cleanup['root']['pgid'];assert owned[children['grandchild']]['identity']['pgid']!=cleanup['root']['pgid'];assert sentinel.pid not in owned;assert any(x['proof'].startswith('Node spawn registry')for x in owned.values());assert sentinel.poll()is None and key(identity(sentinel.pid))==key(sentinelID);assert not identity(children['child'])and not identity(children['grandchild'])
   if mode=='timeout':assert result['exitCode']==124
   if mode=='exception':assert 'SYNTHETIC_AFTER_LAUNCH_EXCEPTION'in result['runnerError']
   if mode=='normal':assert result['exitCode']==0
   row={'mode':mode,'exitCode':result['exitCode'],'runnerError':result['runnerError'],'cleanupComplete':True,'ownedCount':len(owned),'detachedChildAndGrandchildReaped':True,'unrelatedSentinelStillAlive':True,'sentinelIdentity':sentinelID,'cleanupReceipt':str((folder/'cleanup.json').relative_to(D))};rows.append(row);(out/'partial.json').write_text(json.dumps(rows,indent=2)+'\n')
  r={'status':'HARNESS_ONLY_PASS','timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Three synthetic normal/exception/timeout process-tree tests, detached child+grandchild and unrelated live sentinel. No browser/product/core22 tests executed. Signals and adopted-child reaping use identity-checked pidfd.','rows':rows,'coreJobsExecuted':0,'passed':True};(out/'result.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
 finally:
  # This sentinel was created by this self-test, is outside every job, and is
  # removed only after survival was asserted. Its pidfd cannot target a reused PID.
  signal.pidfd_send_signal(sentinelFD,signal.SIGTERM,None,0);sentinel.wait(timeout=2);os.close(sentinelFD)
if __name__=='__main__':main()
