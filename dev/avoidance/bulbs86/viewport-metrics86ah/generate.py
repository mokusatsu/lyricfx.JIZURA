from pathlib import Path
import sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);s=(root/'dev/avoidance/bulbs86/viewport-replay86af/replay86.js').read_text()
helper="""
const metricView86ah=new DataView(new ArrayBuffer(8)),next86ah=(x,up)=>{need(Number.isFinite(x),'BULBS86AH_METRICS');if(x===0)return up?Number.MIN_VALUE:-Number.MIN_VALUE;metricView86ah.setFloat64(0,x);metricView86ah.setBigUint64(0,metricView86ah.getBigUint64(0)+((x>0)===up?1n:-1n));return metricView86ah.getFloat64(0)};
"""
s=s.replace('function* replay(',helper+'function* replay(',1)
s=s.replace('96+viewportMetadataBytes+refsBytes+', '96+64+2048+viewportMetadataBytes+refsBytes+')
old='for(const s of template.supports){work.support=s;work.bounds=C.transformed(s.bounds,root,s.pad);'
new="if(entry.pass==='main'&&!entry.culled){ctx.lineWidth=Math.max(1.5,Math.min(plan.W,plan.H)*.003);ctx.lineJoin='miter';ctx.lineCap='butt';}for(const s of template.supports){work.support=s;if(s.semantic==='outline'){work.outlinePad=next86ah(ctx.lineWidth*(ctx.miterLimit/2),true);budget(null);need(Object.is(s.pad,work.outlinePad),'BULBS86AH_OUTLINE');}work.bounds=C.transformed(s.bounds,root,s.pad);"
assert s.count(old)==1;s=s.replace(old,new)
old="need(ctx.font===g.canonicalFont,'BULBS80Z_CANONICAL_FONT');ctx.save();"
new="""need(ctx.font===g.canonicalFont,'BULBS80Z_CANONICAL_FONT');const measured=ctx.measureText(g.ch);work.metrics=Object.fromEntries(['width','actualBoundingBoxLeft','actualBoundingBoxRight','actualBoundingBoxAscent','actualBoundingBoxDescent'].map(k=>[k,measured[k]]));need(Object.values(work.metrics).every(Number.isFinite),'BULBS86AH_METRICS');work.metricBounds={x0:next86ah(-work.metrics.actualBoundingBoxLeft-1,false),y0:next86ah(-work.metrics.actualBoundingBoxAscent-1,false),x1:next86ah(work.metrics.actualBoundingBoxRight+1,true),y1:next86ah(work.metrics.actualBoundingBoxDescent+1,true)};budget(null);need(Object.keys(work.metricBounds).every(k=>Object.is(g.localBounds[k],work.metricBounds[k])),'BULBS86AH_GLYPH_INK');ctx.save();"""
assert s.count(old)==1;s=s.replace(old,new).replace('measureTextCalls:0','measureTextCalls:glyphMatrices').replace('A.bulbsViewportReplay86af=','A.bulbsViewportReplay86ah=')
out.mkdir(parents=True,exist_ok=True);(out/'replay86.js').write_text(s)

owner=(root/'dev/avoidance/bulbs86/viewport-owner86ag/model-owner86.js').read_text().replace('A.bulbsViewportReplay86af','A.bulbsViewportReplay86ah')
(out/'model-owner86.js').write_text(owner)
