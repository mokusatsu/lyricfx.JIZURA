from pathlib import Path
import json
base=Path('/dev/shm/avoid009-crossword26'); actual=json.loads((base/'topology.json').read_text())['topology']
# Independent unsigned integer implementation, no calls into the JS seam.
def h(a,b=0,c=0,d=0,e=0):
 v=0x9e3779b9^a
 for shift,mult,nextv,offset,mult2 in [(16,0x85ebca6b,b,0x632be5ab,0xc2b2ae35),(13,0xc2b2ae35,c,0x5bd1e995,0x27d4eb2f),(15,0x165667b1,d,0x1b873593,0x85ebca6b),(16,0x27d4eb2f,e,0x68e31da4,0x9e3779b1)]:
  v=((v^(v>>shift))*mult+(nextv+offset)*mult2)&0xffffffff
 v^=v>>15;v=(v*0x2c1b3c6d)&0xffffffff;v^=v>>12;v=(v*0x297a2d39)&0xffffffff;v^=v>>15
 return v
C,R,seed=9,5,1205
key=lambda r,c:r*64+c
c0=(C-4)//2-(1 if h(seed,4)%2 and C-4>2 else 0)
lyr={key(2,c0+j):{'ch':ch,'wi':0,'j':j} for j,ch in enumerate('風の先へ')}
black=[]
def add(x):
 if x not in black:black.append(x)
for r in range(R):
 for c in range(C):
  r2,c2=R-1-r,C-1-c
  if key(r,c) in lyr or key(r2,c2) in lyr:continue
  if h(seed,min(key(r,c),key(r2,c2)),3)/2**32<.18:add(key(r,c));add(key(r2,c2))
if c0>0:add(key(2,c0-1))
if c0+4<C:add(key(2,c0+4))
white=lambda r,c:0<=r<R and 0<=c<C and key(r,c) not in black
num={}
for r in range(R):
 for c in range(C):
  if white(r,c) and ((not white(r,c-1) and white(r,c+1))or(not white(r-1,c) and white(r+1,c))):num[key(r,c)]=len(num)+1
pool=list('風の先へ')+list('あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん')[::3]
pencil={};fills=0
for j in range(4):
 if fills>=2 or h(seed,0,j,5)/2**32>.45:continue
 c=c0+j;a=b=2
 while white(a-1,c):a-=1
 while white(b+1,c):b+=1
 if b-a<2:continue
 fills+=1
 for rr in range(a,b+1):
  if key(rr,c) not in lyr:pencil[key(rr,c)]=pool[h(seed,rr,c,6)%len(pool)]
for name,expected in [('c0',[c0]),('rowsW',[2]),('lyr',list(map(list,lyr.items()))),('black',black),('num',list(map(list,num.items()))),('pencil',list(map(list,pencil.items()))),('pool',pool),('fills',fills)]:
 assert actual[name]==expected,(name,actual[name],expected)
cell=min(960*(.88-.24)/9,540*.8/5,540*.14)
expected={'cell':cell,'gw':9*cell,'gh':5*cell,'fsC':max(13*1.15,cell*.24),'gx':(960-9*cell-960*.24)/2,'gy':(540-5*cell)/2}
assert all(actual[k]==v for k,v in expected.items()),expected
result={'oracle':'PASS','independent':'Python uint32 h + grid numbering + source scan ordering + pencil assignments + geometry arithmetic','counts':{'lyric':len(lyr),'black':len(black),'numbers':len(num),'pencil':len(pencil),'fills':fills},'geometry':expected,'nativePaintOracle':False,'Canvas':0,'avoidanceCertified':False}
(base/'oracle-result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
