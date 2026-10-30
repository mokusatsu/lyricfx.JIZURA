from pathlib import Path
import sys
R=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;K=R/'dev/avoidance/domino82/ui-projection82ak'
s=(K/'browser-test.js').read_text().replace('window.dominoUIProjection82ak=','window.prepareDominoSourcePaint82al=')
a=s.index('generation++;let stale;');z=s.index('\n}catch(e)',a)
s=s[:a]+"state={owner,handle,plan,viewport,generation:()=>generation,invalidate:()=>generation++,offset:0};record.phase='prepared-for-source-paint';return record;"+s[z:]
s=s.replace('if(owner)owner.drop();','if(owner&&state?.owner!==owner)owner.drop();')
extra=(U/'paint-fragment.js').read_text();(U/'browser82al.js').write_text("(()=>{'use strict';let state=null;\n"+s+'\n'+extra+'\n})();\n')
