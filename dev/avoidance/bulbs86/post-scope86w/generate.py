from pathlib import Path
import sys
repo=Path(sys.argv[1]);dest=Path(sys.argv[2]);s=(repo/'src/11zz09_bulbs_controller80.js').read_text();s=s.replace('const A=J.placement,O=', 'const A=J.placement,PS=A.bulbsPostScope86w,postAllows=PS?.allows,O=',1);a='need(opt.noPost===true&&opt.fast===true';b="need((opt.noPost===true||(typeof postAllows==='function'&&A.bulbsPostScope86w===PS&&PS?.allows===postAllows&&postAllows(plan,opt,renderer,ctx)))&&opt.fast===true";assert s.count(a)==1;s=s.replace(a,b);dest.write_text(s)
