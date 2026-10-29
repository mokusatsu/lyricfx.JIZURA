from pathlib import Path
import sys,json,hashlib,difflib,subprocess,tempfile,shutil
D=Path(__file__).resolve().parent;R=Path(sys.argv[1]);S=R/'src/11p_layoutsD.js'
with tempfile.TemporaryDirectory(prefix='burst83ad-base-') as td:
 t=Path(td);shutil.copy2(R/'dev/avoidance/burst83/native-input83c/prepare-source.py',t/'prepare-source.py');subprocess.run([sys.executable,str(t/'prepare-source.py'),str(S)],check=True);base=(t/'11p_layoutsD-input83.js').read_text()
fragment="""// Uninstalled source lease scope only; this capability is not a safe certificate.
const burstSourceLeases83ad=new WeakMap();let burstSourceInstalled83ad=false,burstSourceActive83ad=false;
Object.defineProperty(J.placement,'installBurstSource83ad',{configurable:true,value:()=>{
 if(burstSourceInstalled83ad)throw Object.assign(Error('BURST83AD_SOURCE_INSTALLED'),{code:'BURST83AD_SOURCE_INSTALLED'});burstSourceInstalled83ad=true;delete J.placement.installBurstSource83ad;
 return Object.freeze({withLease(env,run,paint){if(burstSourceActive83ad)throw Object.assign(Error('BURST83AD_SOURCE_ACTIVE'),{code:'BURST83AD_SOURCE_ACTIVE'});if(!env||env.cut?.layout!=='burst'||env.placementEnvelope||env.cut.placementUnits||typeof run!=='function'||typeof paint!=='function')throw Object.assign(Error('BURST83AD_SOURCE_SCOPE'),{code:'BURST83AD_SOURCE_SCOPE'});const record={run,taken:false};burstSourceActive83ad=true;burstSourceLeases83ad.set(env,record);try{const out=paint();if(out&&typeof out.then==='function')throw Object.assign(Error('BURST83AD_SOURCE_ASYNC'),{code:'BURST83AD_SOURCE_ASYNC'});if(!record.taken)throw Object.assign(Error('BURST83AD_SOURCE_NOT_CONSUMED'),{code:'BURST83AD_SOURCE_NOT_CONSUMED'});return out}finally{burstSourceLeases83ad.delete(env);burstSourceActive83ad=false}}});
}});
"""
s=base;anchor="/* ------------------------------------------------------------------ helpers */";assert s.count(anchor)==1;s=s.replace(anchor,fragment+'\n'+anchor)
i=s.index("reg('burst', {");a=s.index('    const { W, H, sc, ctx } = env',i);b=s.index('\n  },\n});',a);body=s[a:b];start=body.index('    const port = isPort(env);');end=body.index('    const out = tout(env);',start)
prefix="""    const fresh83ad=J.placement.burstSourceInput83c(env),half83ad=J.placement.burstHalfLayout83e.layout(env,fresh83ad);
    const {text,o,rxM,ryM,size,m,rx,ry,cx,cy,port}=half83ad.layout;
"""
half=body[:start]+prefix+body[end:]
prelude="""    const lease83ad=burstSourceLeases83ad.get(env);
    if(lease83ad){if(lease83ad.taken)throw Object.assign(Error('BURST83AD_SOURCE_REUSED'),{code:'BURST83AD_SOURCE_REUSED'});lease83ad.taken=true;return lease83ad.run(()=>{
"""+half+"\n    });}\n"
s=s[:a]+prelude+body+s[b:];assert s.replace(fragment+'\n','',1).replace(prelude,'',1)==base
(D/'11p_layoutsD-frame83.js').write_text(s);(D/'source-from83c.patch').write_text(''.join(difflib.unified_diff(base.splitlines(True),s.splitlines(True),fromfile='83c/11p_layoutsD.js',tofile='83ad/11p_layoutsD.js',n=0)))
(D/'boundary.json').write_text(json.dumps({'stockSourceSHA256':hashlib.sha256(S.read_bytes()).hexdigest(),'native83cSHA256':hashlib.sha256(base.encode()).hexdigest(),'candidateSHA256':hashlib.sha256(s.encode()).hexdigest(),'removeDeclaredFragmentRestores83c':True,'nativeBodyUnchanged':True,'scope':'uninstalled scoped source lease only; no controller/certificate/adapter/UI authority'},indent=2)+'\n')
