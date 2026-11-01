import json,os,sys,base64,hashlib,threading,time
from pathlib import Path
from importlib.metadata import version
from PyQt6.QtCore import QSysInfo,QT_VERSION_STR
from PyQt6.QtWebEngineCore import qWebEngineVersion,qWebEngineChromiumVersion
import webview
R=Path('/workspace/jizura-regen-20261027');O=Path('/workspace/jizura-browser-runtime-20261027/logs')
report={'complete':False,'Qt':QT_VERSION_STR,'QtWebEngine':qWebEngineVersion(),'Chromium':qWebEngineChromiumVersion(),'pywebview':version('pywebview'),'productType':QSysInfo.productType(),'preStartFlags':{k:v for k,v in os.environ.items() if 'SANDBOX' in k or 'QTWEBENGINE' in k},'fontResults':[],'errors':[],'processes':[]}
assert QSysInfo.productType()=='debian'
assert not any('SANDBOX' in k for k in os.environ)
assert '--no-sandbox' not in os.environ.get('QTWEBENGINE_CHROMIUM_FLAGS','')
windows=[webview.create_window('Jizura Qt frame '+str(i),html='<html><meta charset="utf-8"><canvas width="960" height="540"></canvas></html>',width=960,height=540,hidden=False) for i in range(3)]
def record_processes():
 rows={}
 for p in Path('/proc').iterdir():
  if not p.name.isdigit():continue
  try:
   status=dict(line.split(':',1) for line in (p/'status').read_text().splitlines() if ':' in line);rows[int(p.name)]=(int(status['PPid'].strip()),p,status)
  except (OSError,KeyError,ValueError):pass
 mine={os.getpid()}
 while True:
  more={pid for pid,(parent,_,_) in rows.items() if parent in mine}
  if more<=mine:break
  mine|=more
 for pid in sorted(mine):
  if pid not in rows:continue
  _,p,s=rows[pid]
  try:
   cmd=(p/'cmdline').read_bytes().decode().split('\0');report['processes'].append({'pid':pid,'argv':[x for x in cmd if x],'status':{k:s.get(k,'').strip() for k in ['Name','PPid','NoNewPrivs','Seccomp','Seccomp_filters','Uid']}})
  except OSError:pass
 report['observedNoSandboxFlag']=any('--no-sandbox' in x for p in report['processes'] for x in p['argv'])
def probe():
 try:
  w=windows[0];faces=json.loads((R/'dev/avoidance/layouts-c-editorial-fonts/manifest.json').read_text())['faces']
  for f in faces:
   data=(R/'dev/avoidance/layouts-c-editorial-fonts'/f['file']).read_bytes();arg={'face':f,'base64':base64.b64encode(data).decode()}
   js='''(async(input)=>{const f=input.face,bytes=Uint8Array.from(atob(input.base64),x=>x.charCodeAt(0)),font=await new FontFace(f.family,bytes,{weight:String(f.weight),style:f.style}).load();document.fonts.add(font);await document.fonts.ready;const c=document.querySelector('canvas').getContext('2d');c.font=`${f.weight} 48px "${f.family}"`;const m=c.measureText('風の先へ');return{id:f.id,status:font.status,check:document.fonts.check(c.font,'風の先へ'),width:m.width,left:m.actualBoundingBoxLeft,right:m.actualBoundingBoxRight,ascent:m.actualBoundingBoxAscent,descent:m.actualBoundingBoxDescent}})'''+ '('+json.dumps(arg)+')'
   result=w.evaluate_js(js);result.update(sha256=hashlib.sha256(data).hexdigest(),expectedSHA256=f['sourceSHA256']);report['fontResults'].append(result)
  report['canvas']=w.evaluate_js('''(()=>{const c=document.querySelector('canvas'),x=c.getContext('2d');x.fillStyle='black';x.fillRect(0,0,960,540);x.fillStyle='white';x.font='700 48px "Avoid008Editorial-sans-bold"';x.fillText('風の先へ',50,100);const p=new Path2D();p.rect(1,1,5,5);x.stroke(p);const g=x.createRadialGradient(10,10,0,10,10,5);g.addColorStop(0,'red');g.addColorStop(1,'blue');x.fillStyle=g;x.fillRect(5,5,10,10);x.save();x.translate(2,3);const t=x.getTransform();x.restore();return{width:c.width,height:c.height,rgbaBytes:x.getImageData(0,0,960,540).data.length,png:c.toDataURL(),matrix:[t.a,t.b,t.c,t.d,t.e,t.f],api:{Path2D:typeof Path2D,FontFace:typeof FontFace,DOMMatrix:typeof DOMMatrix,OffscreenCanvas:typeof OffscreenCanvas,filter:'filter'in x,letterSpacing:'letterSpacing'in x},userAgent:navigator.userAgent}})()''')
  png=base64.b64decode(report['canvas'].pop('png').split(',')[1]);report['canvas'].update(pngBytes=len(png),pngSHA256=hashlib.sha256(png).hexdigest())
  record_processes();report['postStartFlags']={k:v for k,v in os.environ.items() if 'SANDBOX' in k or 'QTWEBENGINE' in k};report['complete']=len(report['fontResults'])==8 and all(x['status']=='loaded' and x['check'] and x['sha256']==x['expectedSHA256'] for x in report['fontResults']) and report['canvas']['rgbaBytes']==2073600 and not report['observedNoSandboxFlag']
 except BaseException as e:
  import traceback
  report['errors'].append(traceback.format_exc())
 finally:
  (O/'qt-full-probe.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'complete':report['complete'],'errors':report['errors'],'CDP':'http://127.0.0.1:9333'}),flush=True)
  if '--probe-only' in sys.argv:
   for w in windows:w.destroy()
def media_ready():
 record_processes()
 report['mode']='FRESH_MEDIA_PAGES_NO_PROBE_FONTS'
 report['complete']=not report['observedNoSandboxFlag']
 report['fontResults']=[]
 report['postStartFlags']={k:v for k,v in os.environ.items() if 'SANDBOX' in k or 'QTWEBENGINE' in k}
 out=Path(os.environ.get('JIZURA_QT_STARTUP_REPORT',str(O/'qt-media-startup.json')))
 out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'ready':report['complete'],'mode':report['mode'],'pid':os.getpid()}),flush=True)
webview.start(media_ready if '--media' in sys.argv else probe,gui='qt',debug=False)
