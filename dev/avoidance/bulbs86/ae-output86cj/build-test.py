"""New output boundary probe; depends explicitly on the previous frozen offline host."""
from pathlib import Path
import sys,subprocess,shutil,json,hashlib
R=Path(sys.argv[1]).resolve();D=Path(sys.argv[2]).resolve();U=Path(__file__).resolve().parent
subprocess.run([sys.executable,str(U.parent/'product-ui86ci/build-test.py'),str(R),str(D)],check=True)
for src,n in [(U/'browser-test.js','browser-test.js'),(R/'cep/cep.js','cep.js'),(R/'mcp/browser-api.js','mcp-api.js')]:shutil.copy2(src,D/n)
p=(D/'probe.cjs').read_text().replace("['/candidate-ja.html',fs.readFileSync(D+'/candidate-ja.html')]","['/candidate-ja.html',fs.readFileSync(D+'/candidate-ja.html')],['/candidate-en.html',fs.readFileSync(D+'/candidate-en.html')]")
a=p.index("const actual=store('product-ui'");z=p.index('verify();assert.equal(result.errors.length,0)',a)
p=p[:a]+"const arg={cepSource:fs.readFileSync(D+'/cep.js','utf8'),mcpSource:fs.readFileSync(D+'/mcp-api.js','utf8')};const actual=store('ae-output-ja',await call(page,'aeOutput86cj',arg));valid(actual);result.summary={ja:actual};await page.goto(origin+'/candidate-en.html');await page.waitForFunction(()=>window.J?.ui?.plan);for(const file of[R+'/dev/avoidance/bulbs80/product80y/fixture.js',D+'/browser.js',D+'/product-browser.js',D+'/browser-test.js'])await page.addScriptTag({content:fs.readFileSync(file,'utf8')});const enInit=store('en-init',await call(page,'initProduct80y',{fonts}));valid(enInit);const en=store('ae-output-en',await call(page,'aeOutput86cj',arg));valid(en);result.summary.en=en;"+p[z:]
p=p.replace("stage:'Bulbs dedicated canonical preview one frame and stale sentinel; no ordinary UI qualification'","stage:'Real JA/EN product render output rejection and mocked CEP; no output media or real AE writes'")
(D/'probe.cjs').write_text(p)
pins=json.loads((D/'pins.json').read_text());paths={Path(p['path']) for p in pins}|{p for p in U.iterdir()if p.is_file()}|{D/'cep.js',D/'mcp-api.js',R/'cep/cep.js',R/'mcp/browser-api.js'}
(D/'pins.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(paths)],indent=2)+'\n')
