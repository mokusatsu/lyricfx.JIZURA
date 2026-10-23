from pathlib import Path
from array import array
import gzip,json,hashlib,sys
p=Path(sys.argv[1]);packed=p.read_bytes();raw=gzip.decompress(packed);data=json.loads(raw);assert data['codec']=='C008-exact-graph-v1';nodes=data['nodes'];state=bytearray(len(nodes));depths=array('I',[0])*len(nodes);chars=array('Q',[0])*len(nodes);sections=[[],[],[]]
def units(s):return len(s.encode('utf-16-le','surrogatepass'))//2
def op(section,parentDepth,parentChars,key,targetDepth=0,targetChars=0,marker=None):
 slot=5+parentDepth+targetDepth;char=parentChars+targetChars+(units(key) if isinstance(key,str) else 0)+(len(marker) if marker else 0);sections[section].append((slot,char))
def visit(token,depth,pathchars,parentDepth=None,parentChars=None,key=None):
 kind=token[0]
 if kind=='u' or kind=='d' and token[1]=='-0':
  if parentDepth is not None:op(1,parentDepth,parentChars,key,marker='u' if kind=='u' else '-0')
  return
 if kind!='r':return
 i=token[1];assert state[i]!=1,'cycle in saved graph'
 if state[i]==2:
  assert parentDepth is not None;op(2,parentDepth,parentChars,key,depths[i],chars[i]);return
 state[i]=1;depths[i]=depth;chars[i]=pathchars;nodeKind,items=nodes[i]
 if nodeKind=='z':op(0,depth,pathchars,None)
 for index,item in enumerate(items):
  childKey,child=(index,item) if nodeKind=='a' else item
  visit(child,depth+1,pathchars+(units(childKey) if isinstance(childKey,str) else 0),depth,pathchars,childKey)
 state[i]=2
visit(data['root'],0,0);ops=slots=stringChars=0;firstCap=None
for section,entries in zip(['nullPrototypes','scalars','aliases'],sections):
 for slot,char in entries:
  ops+=1;slots+=slot;stringChars+=char
  if firstCap is None and (ops>8192 or slots>131072 or stringChars>1048576):firstCap={'section':section,'ops':ops,'slots':slots,'stringChars':stringChars}
report={'scope':'Read-only exact count from an existing historical1000 exact-graph payload; not current9b fixture/geometry confirmation','path':str(p),'gzipSHA256':hashlib.sha256(packed).hexdigest(),'gzipBytes':len(packed),'rawSHA256':hashlib.sha256(raw).hexdigest(),'rawBytes':len(raw),'codec':data['codec'],'nodes':len(nodes),'visitedNodes':sum(x==2 for x in state),'sectionOperations':{name:len(entries) for name,entries in zip(['nullPrototypes','scalars','aliases'],sections)},'totalOps':ops,'totalSlots':slots,'totalStringChars':stringChars,'caps':{'ops':8192,'slots':131072,'stringChars':1048576},'firstCapInOriginalCompileOrder':firstCap,'historicalPayloadMemoFits':firstCap is None,'current1000MemoFit':'unverified; historical fixture e01/source hashes differ from current765/9b. Preserve caps/fallback in later formal raw.','method':'Follow old graph DFS/first-occurrence alias paths, counting UTF16 string keys; compile null-prototype then scalar then alias ops with the unchanged add/chargePath formulas. No compact wire, JSON source graph clone, browser or performance workload generated.'}
assert p.read_bytes()==packed
Path(sys.argv[2]).write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:report[k] for k in ['totalOps','totalSlots','totalStringChars','firstCapInOriginalCompileOrder','historicalPayloadMemoFits','current1000MemoFit']}))
