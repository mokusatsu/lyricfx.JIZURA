"""One installed private owner; viewport may change only after full revocation."""
from pathlib import Path
import sys
R=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;B=R/'dev/avoidance/burst83'
def rep(s,a,b):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,b)
s=(B/'normal-options83bc/private-controller83.js').read_text();a="const viewport=owned(inputViewport);need(viewport&&Object.keys(viewport).sort().join(',')==='height,scale,width'&&Number.isFinite(viewport.scale)&&viewport.scale>0&&viewport.scale<=1&&viewport.width===Math.round(1920*viewport.scale)&&viewport.height===Math.round(1080*viewport.scale),'BURST83BB_VIEWPORT');";assert s.count(a)==1
validation=a.replace('inputViewport','input')+'return viewport;'
s=rep(s,'let installed83ag=null;function createOwner',"function viewport83bd(input){"+validation+"}\nlet installed83ag=null;function createOwner")
s=rep(s,a,'let viewport=viewport83bd(inputViewport);')
s=rep(s,'const api=Object.freeze({resources:',"const api=Object.freeze({configureViewport:serial(input=>{need(!failedInstall&&entries.size===0&&!active&&!activeFrame&&formalBinding83av.size()===0&&formalCertificates83av.size===0,'BURST83BD_VIEWPORT_BUSY');viewport=viewport83bd(input);return true}),resources:")
(U/'private-controller83.js').write_text(s)
s=(B/'ui-owned83bb/prepared-handoff83.js').read_text();s=rep(s,'return Object.freeze({adapter:',"return Object.freeze({configureViewport:serial(input=>{need(!stage&&!job&&!ready&&!currentInner,'BURST83BD_VIEWPORT_BUSY');return owner.configureViewport(input)}),adapter:")
(U/'prepared-handoff83.js').write_text(s)
