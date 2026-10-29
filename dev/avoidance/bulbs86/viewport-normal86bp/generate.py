from pathlib import Path
import sys
r=Path(sys.argv[1]).resolve();d=Path(__file__).resolve().parent
s=(r/'dev/avoidance/bulbs86/fast-scope86z/post86.js').read_text();assert s.count('(opt.scale??1)!==1')==1;s=s.replace('(opt.scale??1)!==1','(opt.scale??1)!==.75');assert s.count('===960&&')==1 and s.count('===540,')==1;s=s.replace('===960&&','===720&&').replace('===540,','===405,');(d/'post86.js').write_text(s)
s=(r/'dev/avoidance/bulbs86/fast-scope86z/fast86.js').read_text();(d/'fast86.js').write_text(s)
s=(r/'dev/avoidance/bulbs86/viewport-direct-controller86bj/controller86.js').read_text();a="if(rec.directViewport86bj)need(opt.noPost===true&&opt.fast===true,'BULBS86BJ_FRAME_OPTIONS');";assert s.count(a)==1;s=s.replace(a,'');(d/'controller86.js').write_text(s)
s=(r/'dev/avoidance/bulbs86/viewport-direct-controller86bj/adapter86.js').read_text();assert s.count('+3*65536;')==1;s=s.replace('+3*65536;','+3*65536+4096;');(d/'adapter86.js').write_text(s)
