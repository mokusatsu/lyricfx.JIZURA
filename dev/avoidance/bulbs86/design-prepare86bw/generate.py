from pathlib import Path
import sys
r=Path(sys.argv[1]).resolve();d=Path(__file__).resolve().parent;b=r/'dev/avoidance/bulbs86'
def put(n,s): (d/n).write_text(s)
def read(n): return (b/n).read_text()
def swap(s,a,v):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,v)
# Deliberately restricted actual UI design size and preview size. Other sizes refuse.
def design(s): return s.replace('960','1920').replace('540','1080').replace('.75','.375').replace('bulbsViewportRoot86ae','bulbsDesignViewportRoot86bv')
s=design(read('composed-input86bu/scalar-generator86.js'));s=s.replace('scale:.375,width:720,height:405','scale:ctx.canvas.width/plan.W,width:ctx.canvas.width,height:ctx.canvas.height');put('scalar-generator86.js',s)
put('model-owner86.js',design(read('composed-input86bu/model-owner86.js')))
put('replay86.js',design(read('cooperative-record86br/replay86.js')))
s=design(read('cooperative-record86br/controller86.js'))
a=s.index('/* Source-only viewport finite heuristic.');z=s.index('// Controller-private cooperative proof.',a)
s=s[:a]+"const VG=A.bulbsDesignViewportGeometry86bv;\n"+s[z:];s=s.replace('cx:r.center.x*1920,cy:r.center.y*1080,r:r.radius*1080','cx:r.center.x*frozenPlan.W,cy:r.center.y*frozenPlan.H,r:r.radius*frozenPlan.H');put('controller86.js',s)
put('post86.js',design(read('design-viewport86bv/post86.js')))
s=design(read('cooperative-record86br/adapter86.js'));s=s.replace("REV='bulbs-owned-cooperative86br-v1'","REV='bulbs-design-cooperative86bw-v1'");s=s.replace('cx:r.center.x*1920,cy:r.center.y*1080,r:r.radius*1080','cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*plan.H');put('adapter86.js',s)
palette="(cut.palette||plan.style.schemes[cut.scheme%plan.style.schemes.length]||plan.style.schemes[0])"
s=read('design-viewport86bv/root86.js');s=s.replace('const pass=own.pass,lt=own.lt,lag=own.lag;', 'const palette='+palette+',pass=own.pass,lt=own.lt,lag=own.lag;');s=s.replace('cut.palette','palette') if False else s
s=s.replace('ctx,plan,cut,cut.palette,','ctx,plan,cut,palette,').replace("cut.palette.ghostA","palette.ghostA").replace("cut.palette.ghostB","palette.ghostB").replace("cut.palette.fg","palette.fg")
put('root86.js',s)
s=(d/'scalar-generator86.js').read_text().replace('J.lum(cut.palette.bg)','J.lum('+palette+'.bg)');put('scalar-generator86.js',s)
s=read('design-viewport86bv/geometry86.js');s=swap(s,'Object.is(region.end,plan.duration)',"(region.end===null||Object.is(region.end,plan.duration))");put('geometry86.js',s)
s=(d/'geometry86.js').read_text().replace('[plan.W,plan.H].every(x=>Number.isFinite(x)&&x>0&&x<=8192)','plan.W===1920&&plan.H===1080');put('geometry86.js',s)
