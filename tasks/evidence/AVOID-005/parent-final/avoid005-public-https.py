import datetime,hashlib,json,os,subprocess
from pathlib import Path
root=Path('/workspace/lyricfx.JIZURA');scratch=Path('/workspace/work/jizura-handoff')
bundle=root/'review/AVOID-005/local-20261019-02';m=json.loads((bundle/'manifest.json').read_text());base='https://mokusatsu.github.io/lyricfx.JIZURA/'
rows=[]
for name,url,expected in [('manifest',base+'review/AVOID-005/local-20261019-02/manifest.json',hashlib.sha256((bundle/'manifest.json').read_bytes()).hexdigest()),('ja',base,m['assets']['../../../index.html']),('en',base+'en/',m['assets']['../../../en/index.html'])]:
    out=scratch/('avoid005-public-'+name+'.bytes');r=subprocess.run(['curl','--fail','--show-error','--silent','--location','--output',str(out),'--write-out','http=%{http_code} tls_verify=%{ssl_verify_result}\n',url],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    h=hashlib.sha256(out.read_bytes()).hexdigest() if out.exists() else None
    rows.append({'name':name,'url':url,'curlExit':r.returncode,'result':r.stdout,'stderr':r.stderr,'sha256':h,'expectedSHA256':expected,'passed':r.returncode==0 and r.stdout=='http=200 tls_verify=0\n' and h==expected})
report={'checkedUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'passed':all(r['passed'] for r in rows),'inheritedProxyPresent':bool(os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy')),'tlsVerificationDisabled':False,'proxyOrCAOverrideApplied':False,'rows':rows}
(root/'tasks/evidence/AVOID-005/public-https.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2));raise SystemExit(0 if report['passed'] else 1)
