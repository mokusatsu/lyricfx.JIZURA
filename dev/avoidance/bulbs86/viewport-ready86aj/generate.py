from pathlib import Path
import sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);d=root/'dev/avoidance/bulbs86/viewport-ready86aj';s=(root/'dev/avoidance/bulbs86/viewport-metrics86ah/model-owner86.js').read_text();key='function beginViewport86ag(';assert s.count(key)==1;s=s.replace(key,(d/'fragment.js').read_text()+'\n'+key).replace('Object.freeze({beginViewport86ag,','Object.freeze({viewportSummary86aj,beginViewport86ag,');out.mkdir(parents=True,exist_ok=True);(out/'model-owner86.js').write_text(s)
