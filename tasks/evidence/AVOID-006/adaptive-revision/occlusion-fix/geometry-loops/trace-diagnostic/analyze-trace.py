from pathlib import Path
import json,collections,bisect,hashlib
out=Path(__file__).parent;raw=Path('/tmp/avoid006-b2c230-trace-raw')

def fields(value):
 if not value or not value.get('available'):return None
 result={}
 for line in value['text'].splitlines():
  bits=line.split()
  if len(bits)==2:
   try:result[bits[0]]=int(bits[1])
   except ValueError:pass
 return result

def duration_events(events):
 result=[];stacks=collections.defaultdict(list)
 for e in events:
  phase=e.get('ph');key=(e.get('pid'),e.get('tid'))
  if phase=='X' and e.get('dur',0)>0:result.append((e['ts'],e['ts']+e['dur'],e))
  elif phase=='B':stacks[key].append(e)
  elif phase=='E' and stacks[key]:
   a=stacks[key].pop()
   if e['ts']>a['ts']:result.append((a['ts'],e['ts'],a))
 return result

def union_ms(intervals,start,end):
 items=sorted((max(a,start),min(b,end)) for a,b in intervals if b>start and a<end);total=0;last=None
 for a,b in items:
  if last is None:last=[a,b]
  elif a>last[1]:total+=last[1]-last[0];last=[a,b]
  else:last[1]=max(last[1],b)
 if last:total+=last[1]-last[0]
 return total/1000

def cpu_samples(profile):
 nodes={n['id']:n for n in profile['nodes']};clock=profile['startTime'];points=[];rows=[]
 native={'drawImage','fillRect','fillText','getTransform','measureText','save','restore','reset','setTransform','fill','stroke','clip','scale','translate','rotate'}
 for sequence,(node,delta) in enumerate(zip(profile['samples'],profile['timeDeltas'])):
  clock+=delta;points.append((clock,sequence,node))
 # CDP returned some negative deltas. Restore chronological sample order before
 # forming disjoint attribution intervals; never double-count overlapping time.
 previous=profile['startTime']
 for clock,sequence,node in sorted(points):
  f=nodes[node]['callFrame'];name=f['functionName'];url=f.get('url','')
  if name=='(garbage collector)':kind='gc'
  elif url:kind='javascript'
  elif name in native:kind='nativeCanvas'
  elif name in ['(program)','(idle)','(root)','']:kind='unattributedNativeOrUnscheduled'
  else:kind='builtinOrEngine'
  if clock>previous:rows.append((previous,clock,kind,name,clock-previous))
  previous=max(previous,clock)
 return rows

report=json.loads((out/'diagnostic-report.json').read_text());resources=json.loads((out/'resource-samples.json').read_text());cpu0=fields(resources['start']['files']['cpu.stat']);cpu1=fields(resources['end']['files']['cpu.stat']);mem0=fields(resources['start']['files']['memory.events']);mem1=fields(resources['end']['files']['memory.events']);stat0=fields(resources['start']['files']['memory.stat']);stat1=fields(resources['end']['files']['memory.stat'])
delta=lambda a,b:None if a is None or b is None else {k:b[k]-a.get(k,0) for k in b}
result={'diagnosticOnly':True,'formalAcceptance':False,'productSHA256':report['productSHA256'],'resourceDelta':{'cpu':delta(cpu0,cpu1),'memoryEvents':delta(mem0,mem1),'memoryStat':delta(stat0,stat1),'start':resources['start'],'end':resources['end']},'sides':{},'limitations':['Trace and CPU profiler add overhead. Diagnostic timings are not formal acceptance.','CPU-profile interval attribution is sampled wall time, not a direct thread CPU clock; long sample gaps are reported separately. Negative CDP deltas require chronological sorting before disjoint interval attribution.','Program/idle samples cannot distinguish native execution from OS descheduling.','100ms cgroup intervals may bracket a short frame; overlap alone does not prove causation.','Main/background GC interval unions overlap one another and must not be added.']}
resource_rows=resources['samples'];resource_times=[r['wallMS'] for r in resource_rows]
for side,data in report['sides'].items():
 trace=json.loads((raw/('trace-'+side+'.json')).read_text());events=trace.get('traceEvents',[]);marks={}
 for e in events:
  if e.get('name','').startswith('occ:'):marks.setdefault(e['name'],e)
 durations=duration_events(events);profile=json.loads((raw/('cpu-'+side+'.cpuprofile')).read_text());samples=cpu_samples(profile);sample_ends=[r[1] for r in samples];frames=[]
 for span in data['traceSpans']:
  if span['kind']!='render':continue
  marker=marks.get(span['startMark'])
  if not marker:raise ValueError('Missing trace marker '+span['startMark'])
  offset=marker['ts']-span['startMarkTime']*1000;start=offset+span['start']*1000;end=offset+span['end']*1000;pid=marker['pid'];tid=marker['tid'];wallstart=data['timeOrigin']+span['start'];wallend=data['timeOrigin']+span['end']
  gc=[(a,b,e) for a,b,e in durations if a<end and b>start and e.get('pid')==pid and ('GC' in e.get('name','') or 'Scavenge' in e.get('name','') or 'MarkSweep' in e.get('name',''))]
  ownGC=[(a,b) for a,b,e in gc if e.get('tid')==tid];backgroundGC=[(a,b) for a,b,e in gc if e.get('tid')!=tid];attributed=collections.Counter();functions=collections.Counter();longgaps=0;count=0
  for a,b,kind,name,gap in samples[max(0,bisect.bisect_left(sample_ends,start)-1):]:
   if a>=end:break
   length=max(0,min(b,end)-max(a,start))
   if not length:continue
   attributed[kind]+=length/1000;functions[name]+=length/1000;count+=1
   if gap>2000:longgaps+=min(length,gap-2000)/1000
  lo=max(0,bisect.bisect_left(resource_times,wallstart)-1);hi=min(len(resource_rows)-1,bisect.bisect_right(resource_times,wallend));r0=resource_rows[lo];r1=resource_rows[hi];cgdelta=delta(fields(r0['cpu']),fields(r1['cpu']));mdelta=delta(fields(r0['memoryEvents']),fields(r1['memoryEvents']))
  gcNames=collections.Counter(e.get('name') for a,b,e in gc)
  frames.append({'n':span['n'],'index':span['index'],'measuredIndex':span['index']-16,'warmup':span['warmup'],'layout':span['layout'],'wallMS':span['end']-span['start'],'epochStartMS':wallstart,'epochEndMS':wallend,'traceStartUS':start,'traceEndUS':end,'mainGCUnionMS':union_ms(ownGC,start,end),'backgroundGCUnionMS':union_ms(backgroundGC,start,end),'gcEventNames':dict(gcNames),'cpuSampleWallAttributionMS':dict(attributed),'sampleCount':count,'sampleGapExcessAbove2ms':longgaps,'topSampledFunctions':functions.most_common(6),'resourceBracketStartMS':r0['wallMS'],'resourceBracketEndMS':r1['wallMS'],'resourceBracketCPU':cgdelta,'resourceBracketMemoryEvents':mdelta,'startMemoryCurrent':r0['memoryCurrent'],'endMemoryCurrent':r1['memoryCurrent']})
 sideResult={'frames':frames,'traceEventCount':len(events),'markCount':len(marks),'traceSHA256':hashlib.sha256((raw/('trace-'+side+'.json')).read_bytes()).hexdigest(),'negativeCPUDeltas':sum(v<0 for v in profile['timeDeltas']),'cpuSHA256':hashlib.sha256((raw/('cpu-'+side+'.cpuprofile')).read_bytes()).hexdigest(),'measured1000First16':[r for r in frames if r['n']==1000 and not r['warmup']][:16],'slowMeasuredFrames':[r for r in frames if not r['warmup'] and r['wallMS']>=10]}
 result['sides'][side]=sideResult
(out/'trace-analysis.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'saved':str(out/'trace-analysis.json'),'resourceDeltaCPU':result['resourceDelta']['cpu'],'resourceDeltaMemoryEvents':result['resourceDelta']['memoryEvents'],'frames':{k:len(v['frames']) for k,v in result['sides'].items()}}))
