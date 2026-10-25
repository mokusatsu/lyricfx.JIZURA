"""Two-case native60fps media, same-session raw review and durable archive.
No ROOT HTML writes. Parent source seal/release required for rendering/encoding.
"""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import argparse,importlib.util,json,os,select,shutil,subprocess,time,traceback
HERE=Path(__file__).resolve().parent;s=importlib.util.spec_from_file_location('media71_io',HERE/'layouts_d_bulbs69_runtime.py');M=importlib.util.module_from_spec(s);s.loader.exec_module(M);R=M.ROOT/'tasks/evidence/AVOID-009/resume-20261025';E=R/'source71'
ACCEPT=R/'parent-bulbs69-canonical70-acceptance01.json';OLDSEAL=R/'parent-reviewed-seal70-actual03.json';CHECKER=E/'parent-media-review71.py'
def product_pin71(p):return p.startswith(('src/','app/','dev/avoidance/layouts-c-editorial-fonts/','tasks/evidence/AVOID-009/bulbs-focused59/source59/runner/')) or p in ['build.py','assets/effect-preview.png','vendor/mp4-muxer.min.js','dev/browser.cjs','dev/package.json','dev/package-lock.json','dev/avoidance/layouts-b-fixture.js','dev/avoidance/layouts-d-bulbs69-oracle.js','dev/avoidance/layouts-d-bulbs69-oracle-primitives.js','tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py','tasks/evidence/AVOID-009/bulbs-diagnostic56/parent-review-bulbs56.py']
def static_export71(run,run_id,example='all',frame='all'):
 manifest=json.loads(M.read(run/'raw/manifest.json'));allfiles=manifest['staticFiles'];M.need(len(allfiles)==12,'exactly12 chosen statics');M.need(example in ['all','upper','right'] and frame in ['all','14','90','231'],'fixed static selection only');files=[p for p in allfiles if (example=='all' or p['example']==example) and (frame=='all' or p['j']==int(frame))];M.need(shutil.disk_usage(E).free>sum(p['bytes'] for p in files)+65536,'static export deferred: insufficient ROOT capacity');target=E/('static-'+run_id+'-'+example+'-'+frame);M.need(not target.exists(),'fresh static export path required');target.mkdir();rows=[]
 for p in files:
  source=run/'raw'/p['path'];M.need(source.parent==run/'raw/images' and source.suffix=='.png','only selected source PNGs');b=M.read(source);M.need(len(b)==p['bytes'] and M.sha(b)==p['sha256'],'static source bytes changed');dest=target/source.name
  with dest.open('xb') as f:f.write(b)
  M.need(M.read(dest)==b,'static export bytes differ');rows.append({'path':str(dest.relative_to(M.ROOT)),'bytes':len(b),'sha256':p['sha256']})
 return rows
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--prepare-seal');ap.add_argument('--reviewed-seal');ap.add_argument('--run-id');ap.add_argument('--expected-head',required=True);ap.add_argument('--expected-index',required=True)
 for flag in ['node','browser-launcher','browser-engine','ffmpeg','ffprobe']:ap.add_argument('--'+flag,required=True)
 a=ap.parse_args();runtime=[Path(a.node),Path(a.browser_launcher),Path(a.browser_engine),Path(a.ffmpeg),Path(a.ffprobe)];guard=M.RootGuard(a.expected_head,a.expected_index);accepted=json.loads(M.read(ACCEPT));old=json.loads(M.read(OLDSEAL));review_ref=M.ROOT/accepted['parentReview']['path'];base=M.input_paths();paths=sorted(set(base+list(HERE.glob('*bulbs71*'))+[ACCEPT,OLDSEAL,review_ref,CHECKER]));M.input_paths=lambda:paths
 def seal_now():
  M.need(accepted['state']=='PARENT_SOURCE69_LIMITED_ADAPTER_AND_CANONICAL70_ACCEPTED_MEDIA_NOT_RUN' and accepted['accepted'] is True and not accepted['mediaExecuted'],'parent canonical/normal gate missing');M.need(accepted['HTML']==guard.html and M.sha(M.read(review_ref))==accepted['parentReview']['sha256'],'accepted product HTML/review changed');matched=[]
  for pin in old['files']:
   if product_pin71(pin['path']):b=M.read(M.ROOT/pin['path']);M.need(len(b)==pin['bytes'] and M.sha(b)==pin['sha256'],'accepted product source changed: '+pin['path']);matched.append(pin)
  for folder,suffixes in [('src',['.js']),('app',['.py','.js','.html','.css'])]:M.need({str(p.relative_to(M.ROOT)) for p in (M.ROOT/folder).iterdir() if p.is_file() and p.suffix in suffixes}=={p['path'] for p in matched if p['path'].startswith(folder+'/')},'product source file set changed')
  rp=[{'path':str(p),'bytes':p.stat().st_size,'sha256':M.sha(p.read_bytes())} for p in runtime];M.need(rp[:3]==old['runtime'] and M.node_dependency(a.node)==old['resolvedNodeDependency'],'accepted browser/Node dependency changed')
  return {'kind':'SOURCE71_TWO_MEDIA_REVIEW_SEAL','root':guard.summary(),'acceptanceSHA256':M.sha(M.read(ACCEPT)),'acceptedArchives':accepted['sources'],'matchedProductPins':matched,'files':[{'path':str(p.relative_to(M.ROOT)),'bytes':len(M.read(p)),'sha256':M.sha(M.read(p))} for p in paths],'runtime':rp,'resolvedNodeDependency':M.node_dependency(a.node),'publicChecks':0}
 if a.prepare_seal:M.need(not a.reviewed_seal and not a.run_id,'prepare only');M.write_json(a.prepare_seal,seal_now());guard.check();print(json.dumps({'seal':a.prepare_seal,'browserExecuted':False,'encoderExecuted':False}));return
 M.need(a.reviewed_seal and a.run_id and a.run_id.isascii() and len(a.run_id)<80 and all(c.isalnum() or c in '-_' for c in a.run_id),'fresh safe run id/seal required');M.need(os.environ.get('BULBS71_EXECUTE_RELEASE')=='PARENT_REVIEWED_TWO_MEDIA_BUILD_RUN_PERSIST','parent media release missing');review=json.loads(M.read(a.reviewed_seal));M.need(review==seal_now(),'media seal changed');run=Path('/dev/shm')/('avoid009-bulbs69-media71-'+a.run_id);M.need(not run.exists(),'fresh RAM run required');run.mkdir();(run/'tmp').mkdir();(run/'reviewed-seal.json').write_bytes(M.read(a.reviewed_seal));M.write_json(run/'run-start.json',{'ROOT':guard.summary(),'acceptedArchives':accepted['sources'],'publicChecks':0});guard.env['TMPDIR']=str(run/'tmp');rows=None;error=None;producer_ok=False;parent_pass=False;code=None
 env=os.environ.copy();env.update(TMPDIR=str(run/'tmp'),PYTHONDONTWRITEBYTECODE='1',JIZURA_BROWSER=str(runtime[2]),BULBS71_MEDIA_RELEASE='PARENT_REVIEWED_MEDIA71_SOURCE')
 def child(command,stdout,stderr,relay_source_ready=False):
  with stdout.open('xb') as out,stderr.open('xb') as err:
   p=subprocess.Popen(command,cwd=M.ROOT,env=env,stdout=out,stderr=err);last=0;relayed=False
   try:
    while p.poll() is None:
     if relay_source_ready and not relayed and b'SOURCE71_HELPER_CREDENTIAL_READY_ECHO_OFF\n' in stdout.read_bytes():print('SOURCE71_HELPER_CREDENTIAL_READY_ECHO_OFF '+str(p.pid),flush=True);relayed=True
     if time.monotonic()-last>30:
      status={'pid':p.pid};file=run/'raw/manifest.json'
      if file.exists():
       try:m=json.loads(file.read_bytes());status.update(completed=m.get('completed'),records=len(m.get('records',[])),serializedBytes=m.get('serializedBytes'))
       except ValueError:pass
      print('SOURCE71_RUNNING '+json.dumps(status),flush=True);last=time.monotonic()
     time.sleep(1)
    return p.returncode
   finally:
    if p.poll() is None:p.terminate();p.wait(timeout=30)
 try:
  rows=M.freeze_inputs(run,runtime);M.need([{k:p[k] for k in ['path','bytes','sha256']} for p in rows]==review['files'],'frozen files differ');build=M.ram_build(run,guard,'4a76100c63b3a8b55c7c12ad9e98656ba37f9599');M.need(M.sha(M.read(build/'candidate-ja.html'))==accepted['HTML']['index.html'] and M.sha(M.read(build/'candidate-en/index.html'))==accepted['HTML']['en/index.html'],'normal build differs from canonical accepted HTML');command=[a.node,str(HERE/'layouts-d-bulbs71-media.cjs'),'--build-dir',str(build),'--output-dir',str(run/'raw'),'--browser-path',a.browser_launcher,'--ffmpeg',a.ffmpeg,'--ffprobe',a.ffprobe];M.write_json(run/'producer-command.json',{'argv':command,'publicChecks':0});code=child(command,run/'producer.stdout.txt',run/'producer.stderr.txt');summary=M.producer_summary(run,code);M.write_json(run/'producer-summary.json',summary);print('SOURCE71_PRODUCER_SUMMARY '+json.dumps(summary),flush=True);M.write_json(E/('producer71-summary-'+a.run_id+'.json'),summary);M.need(summary['producerPassed'],'media producer did not pass');M.check_inputs(rows);guard.check();producer_ok=True
 except BaseException as e:error={'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()};M.write_json(run/'orchestrator-failure.json',error)
 try:
  (run/'raw').mkdir(exist_ok=True);guard.check()
  if rows is not None:M.check_inputs(rows)
  rc=child([sys.executable,'-B',str(CHECKER),str(run/'raw'),str(run/'parent-local-review.json')],run/'parent-local-review.stdout.txt',run/'parent-local-review.stderr.txt');report=json.loads(M.read(run/'parent-local-review.json'));print('SOURCE71_PARENT_LOCAL_REVIEW_JSON '+json.dumps(report),flush=True);M.need(rc==0,'media parent numeric review failed');parent_pass=True
 except BaseException as e:failure={'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()};M.write_json(run/'parent-local-review-execution.json',failure);error=error or failure
 result={'producerPassed':producer_ok,'parentNumericPassed':parent_pass,'error':error,'humanMotionReview':'pending','freshVisualReview':'pending','publicChecks':0,'parentImages':0};M.write_json(run/'raw/media71-result.json',result);print('SOURCE71_RESULT '+json.dumps(result),flush=True);receipt=None;attempt=0;stdin_open=True
 while receipt is None:
  attempt+=1
  try:receipt=M.archive_raw69(run,guard,'archive/avoid009-bulbs69-media71-'+a.run_id+'-attempt'+str(attempt),attempt,E/('media71-push-'+a.run_id+'-'+str(attempt)+'.json'))
  except BaseException as e:
   M.write_json(run/('persistence-failure-'+str(attempt)+'.json'),{'message':str(e),'rawPersisted':False});print('SOURCE71_KEEPER_NOT_DURABLE '+str(e),flush=True)
   while True:
    try:
     if stdin_open:
      ready,_,_=select.select([sys.stdin],[],[],30)
      if ready:
       answer=sys.stdin.readline()
       if answer=='':stdin_open=False
       elif answer.strip()=='retry':break
       elif answer.strip()=='stop-unsaved':M.write_json(E/('media71-UNSAVED-'+a.run_id+'.json'),result);raise SystemExit(2)
     else:time.sleep(30)
     print('SOURCE71_KEEPER_RETAINS_RAM',flush=True)
    except KeyboardInterrupt:print('SOURCE71_KEEPER_RETAINS_RAM',flush=True)
 print(json.dumps({'result':result,'archive':receipt}),flush=True)
 if not (producer_ok and parent_pass and error is None):raise SystemExit(1)
 # Keep original RAM media visible through numeric review, fresh static review
 # and the fixed existing-Source save helper. Capacity failures never rerender.
 handoff=run/('avoid009-bulbs69-media71-handoff-'+a.run_id);(handoff/'raw').mkdir(parents=True);manifest=json.loads(M.read(run/'raw/manifest.json'));M.write_json(handoff/'raw/media-reference.json',{'mediaArchive':receipt,'publicFiles':manifest['publicFiles'],'staticFiles':manifest['staticFiles']});exported=[];action=0;save_count=0;handoff_attempt=0
 print('SOURCE71_READY_HANDOFF '+json.dumps({'RAM':str(run),'archive':receipt['commit'],'staticBytes':sum(p['bytes'] for p in manifest['staticFiles']),'publicFiles':9,'commands':['export-statics [all|upper|right] [all|14|90|231]','export-statics clear','source-save <reviewed-helper-sha256>','finish'],'publicChecks':0}),flush=True)
 while True:
  try:
   if stdin_open:
    ready,_,_=select.select([sys.stdin],[],[],30)
    if not ready:print('SOURCE71_READY_HANDOFF_RETAINS_RAM',flush=True);continue
    line=sys.stdin.readline()
    if line=='':stdin_open=False;continue
   else:time.sleep(30);print('SOURCE71_READY_HANDOFF_RETAINS_RAM',flush=True);continue
   words=line.strip().split();action+=1;guard.check();M.check_inputs(rows)
   for item in manifest['publicFiles']:
    data=M.read(run/'raw/public'/item['path']);M.need(len(data)==item['bytes'] and M.sha(data)==item['sha256'],'public artifact changed during handoff')
   if words[:1]==['export-statics']:
    if words==['export-statics','clear']:
     for p in exported:M.need(M.sha(M.read(M.ROOT/p['path']))==p['sha256'],'modified static working copy; refuse clear')
     parents=set()
     for p in exported:dest=M.ROOT/p['path'];dest.unlink();parents.add(dest.parent)
     for parent in parents:
      if not any(parent.iterdir()):parent.rmdir()
     M.write_json(handoff/'raw'/('static-clear-'+str(action)+'.json'),{'files':exported,'originalPNGsRetainedInRAMAndMediaArchive':True});exported=[];print('SOURCE71_STATIC_WORKING_COPIES_CLEARED',flush=True)
    else:
     M.need(1<=len(words)<=3,'static command syntax');selected=static_export71(run,a.run_id,words[1] if len(words)>1 else 'all',words[2] if len(words)>2 else 'all');exported+=selected;M.write_json(handoff/'raw'/('static-export-'+str(action)+'.json'),{'files':selected,'parentImages':0});print('SOURCE71_STATIC_EXPORT '+json.dumps(selected),flush=True)
   elif words[:1]==['source-save']:
    M.need(len(words)==2 and len(words[1])==64 and all(c in '0123456789abcdef' for c in words[1]),'reviewed fixed helper SHA required');helper=HERE/'layouts-d-bulbs71-source-save.py';data=M.read(helper);M.need(M.sha(data)==words[1],'fixed Source helper SHA differs');target=handoff/'raw'/('source-save-'+str(action));target.mkdir();snapshot=target/'reviewed-source-save.py';snapshot.write_bytes(data);rc=child([sys.executable,'-B',str(snapshot),str(run/'raw/public'),str(target)],target/'stdout.txt',target/'stderr.txt',relay_source_ready=True);M.write_json(target/'execution.json',{'returnCode':rc,'reviewedHelperSHA256':words[1],'mediaArchive':receipt['commit'],'publicChecks':0});guard.check();M.check_inputs(rows);M.need(rc==0,'Source save helper failed; RAM retained');save_count+=1;print('SOURCE71_SOURCE_SAVE_DONE '+json.dumps({'attempt':action,'result':(target/'result.json').read_text() if (target/'result.json').exists() else None}),flush=True)
   elif words==['finish']:
    handoff_attempt+=1;M.write_json(handoff/'raw'/('finish-'+str(handoff_attempt)+'.json'),{'sourceSaves':save_count,'staticExportsRetained':exported,'mediaArchive':receipt['commit'],'publicChecks':0});saved=M.archive_raw69(handoff,guard,'archive/avoid009-bulbs69-media71-handoff-'+a.run_id+'-attempt'+str(handoff_attempt),handoff_attempt,E/('media71-handoff-push-'+a.run_id+'-'+str(handoff_attempt)+'.json'));print('SOURCE71_HANDOFF_FINISHED '+json.dumps(saved),flush=True);return
   else:print('SOURCE71_HANDOFF_COMMAND_REFUSED',flush=True)
  except KeyboardInterrupt:print('SOURCE71_READY_HANDOFF_RETAINS_RAM',flush=True)
  except Exception as e:
   M.write_json(handoff/'raw'/('action-error-'+str(action)+'.json'),{'type':type(e).__name__,'message':str(e),'mediaRemainsAcceptedAndDurable':True});print('SOURCE71_HANDOFF_ACTION_FAILED_RAM_RETAINED '+str(e),flush=True)
if __name__=='__main__':main()
