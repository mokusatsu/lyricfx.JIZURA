from pathlib import Path
import sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);d=root/'dev/avoidance/bulbs86/viewport-insufficient86an';s=(root/'dev/avoidance/bulbs86/fast-scope86z/adapter86.js').read_text();key='function finalize({plan,cut,revision,stepDur,reachTail,explicitSize}){';assert s.count(key)==1;s=s.replace(key,(d/'adapter-bridge.js').read_text()+'\n'+key);out.mkdir(parents=True,exist_ok=True);(out/'adapter-test86.js').write_text(s)
