from pathlib import Path
import sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);d=root/'dev/avoidance/bulbs86/viewport-handoff86aw';s=(root/'dev/avoidance/bulbs86/viewport-aggregate86ao/model-owner86.js').read_text()
key='function installFrameAccess80(';assert s.count(key)==1;s=s.replace(key,(d/'fragment.js').read_text()+'\n'+key)
key='return Object.freeze({dependencySnapshot(renderer,canonical=renderer)';assert s.count(key)==1;s=s.replace(key,'return Object.freeze({withViewportCandidate86aw,dependencySnapshot(renderer,canonical=renderer)')
out.mkdir(parents=True,exist_ok=True);(out/'model-owner86.js').write_text(s)
