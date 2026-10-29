from pathlib import Path
import sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);d=root/'dev/avoidance/bulbs86/viewport-work-account86ba';s=(root/'dev/avoidance/bulbs86/viewport-controller86ax/replay86.js').read_text()
key='const add=(pass,semantic,bounds)=>';assert s.count(key)==1;s=s.replace(key,(d/'work-fragment.js').read_text()+'\n '+key)
key='bytes({groupEntries:[...groups],heldEntries:[...held.records],counters:{rootCount,glyphMatrices,rootBytes,glyphMatrixBytes,peak,reservedBytes},work,extra})';assert s.count(key)==1;s=s.replace(key,'budgetWorkBytes86ba(extra)')
s=s.replace('resource:{modelBytes,refsBytes,', 'resource:{memoEntries:memoCount86ba,memoManagementBytes:memoLedger86ba,modelBytes,refsBytes,')
out.mkdir(parents=True,exist_ok=True);(out/'replay86.js').write_text(s)
