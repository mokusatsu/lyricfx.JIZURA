from pathlib import Path
import sys
repo=Path(sys.argv[1]);dest=Path(sys.argv[2]);D=Path(__file__).parent;dest.mkdir(parents=True,exist_ok=True)
post=(repo/'dev/avoidance/bulbs86/post-scope86w/post86.js').read_text();a='if(opt.fast!==true||(opt.scale??1)!==1)return false;';b='if((opt.fast!==true&&opt.fast!==false&&opt.fast!==undefined)||(opt.scale??1)!==1)return false;';assert post.count(a)==1;(dest/'post86.js').write_text(post.replace(a,b))
s=(repo/'dev/avoidance/bulbs86/post-scope86w/controller86.js').read_text().replace('const A=J.placement,PS=', 'const A=J.placement,FS=A.bulbsFastScope86z,fastAllows=FS?.allows,PS=',1);a='&&opt.fast===true&&(opt.scale??1)===1';b="&&(opt.fast===true||(typeof fastAllows==='function'&&A.bulbsFastScope86z===FS&&FS.allows===fastAllows&&fastAllows(plan,opt,renderer,ctx)))&&(opt.scale??1)===1";assert s.count(a)==1;(dest/'controller86.js').write_text(s.replace(a,b))

a=(repo/'dev/avoidance/bulbs86/prepared-adapter86d/adapter86.js').read_text();assert a.count('+3*65536;')==1;(dest/'adapter86.js').write_text(a.replace('+3*65536;','+3*65536+4096;'))
