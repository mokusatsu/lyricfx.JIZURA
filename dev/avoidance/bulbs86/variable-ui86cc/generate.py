from pathlib import Path
import sys
r=Path(sys.argv[1]).resolve();d=Path(__file__).resolve().parent;old=d.parent/'variable-ui86cb'
def swap(s,a,v):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,v)
for p in old.glob('*.js'):
 s=p.read_text()
 if p.name=='scalar-generator86.js':s=swap(s,'frameData=FD.build({', 'frameData=yield* FD.buildGenerator86cc({')
 (d/p.name).write_text(s)
s=(r/'dev/avoidance/bulbs80/frame80/frame-data80.js').read_text()
s=swap(s,'function build({','function* buildGenerator86cc({')
cp=lambda phase:"yield Object.freeze({kind:'bulbs-own-checkpoint80ab',phase:'"+phase+"'});"
s=swap(s,'let expectedIndex=0;',cp('frame-validate')+'let expectedIndex=0;')
s=swap(s,'};report(null);','};'+cp('frame-account-setup')+'report(null);'+cp('frame-preimages'))
s=swap(s,'report(p)}','report(p);if((n+1)%16===0)'+cp('frame-preimages')+'}')
s=swap(s,' for(let i=0;i<schedule.length;i++){', ' '+cp('frame-index')+'for(let i=0;i<schedule.length;i++){')
s=swap(s,'report({index:i,entry:e})}', 'report({index:i,entry:e});if((i+1)%16===0)'+cp('frame-index')+'}')
s=swap(s,'A.bulbsFrameData80=Object.freeze({build,select});',"function build(args){const iterator=buildGenerator86cc(args);for(;;){const next=iterator.next();if(next.done)return next.value}}\nA.bulbsFrameData80=Object.freeze({build,buildGenerator86cc,select});")
(d/'frame-data86.js').write_text(s)
