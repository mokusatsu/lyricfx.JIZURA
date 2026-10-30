"""Apply reviewed previous-model reuse over the preserved 82ao product seams."""
from pathlib import Path
import sys,subprocess,json
R=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;D=R/'dev/avoidance/domino82';P=D/'product-ui82ao';Q=D/'previous-model82aq'
subprocess.run([sys.executable,str(P/'generate.py'),str(R)],check=True)
s=(R/'src/11zz13_domino_core82.js').read_text()
mapping=[('ui-projection82ak/model82ak.js','model82aq.js'),('product-ui82ao/owner82ao.js','owner82aq.js'),('product-ui82ao/controller82ao.js','controller82aq.js'),('product-ui82ao/runtime82ao.js','runtime82aq.js'),('product-ui82ao/session82ao.js','session82aq.js')]
for old,new in mapping:
 a=(D/old).read_text();b=(Q/new).read_text();assert s.count(a)==1,old;s=s.replace(a,b)
old="||planBinding?.needs(plan)||Object.hasOwn(opt,'dominoFrameTicket')";new="||(plan.cuts||[]).some(c=>c.layout==='dominoes'&&c.placementTrajectory?.sourceAdapter===ADAPTER_ID)||Object.hasOwn(opt,'dominoFrameTicket')";assert s.count(old)==1;s=s.replace(old,new)
(R/'src/11zz13_domino_core82.js').write_text(s)
s=(R/'src/12_ui.js').read_text();a=s.index('const dominoSession82ao=');z=s.index("$('dominoCancel')",a);part=s[a:z];start=part.index(' waitFonts(');end=part.index('\n schedule:',start);part=part[:start]+(Q/'font-wait-method.js').read_text().rstrip()+part[end:];s=s[:a]+(Q/'font-phase.js').read_text()+part+s[z:];(R/'src/12_ui.js').write_text(s)
(U/'module-map.json').write_text(json.dumps(mapping,indent=2)+'\n')
