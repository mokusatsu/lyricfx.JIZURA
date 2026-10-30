from pathlib import Path
import sys
R=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;B=R/'dev/avoidance/burst83'
def rep(s,a,b):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,b)
s=(R/'src/11zz06e_bulbs_post86.js').read_text().replace('bulbsPostScope86w','burstNormalPostScope83bc').replace('bulbsComposeScope86bu','burstComposeScope83ay').replace('BULBS86W','BURST83BC').replace('BULBS86BU','BURST83BC').replace("layout!=='bulbs'","layout!=='burst'")
s=rep(s,"const cut=read(cuts,'0');for(const k", "const cut=read(cuts,'0');if(read(cut,'layout')!=='burst'||read(cut,'effectFx')||read(cut,'effectStyle')||(read(cut,'bg')!=null&&read(cut,'bg')!=='none')||read(cut,'mask')||read(cut,'group')||read(cut,'drawing')||read(cut,'effectsOnly'))return false;for(const k")
marker=" Object.defineProperty(A,'burstNormalPostScope83bc'"
i=s.index(marker);s=s[:i]+""" function needs(plan){return plan?.cuts?.some(c=>c.layout==='burst'&&c.placementTrajectory?.sourceAdapter==='burst_prepared83av')||!!plan?.burstRuntime83ag;}
 function assertBeforePost(plan,opt,renderer,ctx){need(opt.noPost!==true&&allows(plan,{...opt,noPost:false},renderer,ctx),'BURST83BC_POST_SCOPE');need(ctx.globalCompositeOperation==='source-over'&&ctx.globalAlpha===1&&ctx.filter==='none'&&!ctx.shadowBlur&&!ctx.shadowOffsetX&&!ctx.shadowOffsetY&&['rgba(0, 0, 0, 0)','transparent'].includes(ctx.shadowColor),'BURST83BC_POST_STATE');return true;}
"""+s[i:]
s=rep(s,'{allows,neutralMissingGlow,sourceOnly:true,UIConnected:false}', '{allows,needs,assertBeforePost,neutralMissingGlow,sourceOnly:true,UIConnected:false}')
(U/'post-scope83bc.js').write_text(s)
s=(R/'src/11zz06f_bulbs_fast86.js').read_text().replace('bulbsFastScope86z','burstNormalFastScope83bc').replace('bulbsPostScope86w','burstNormalPostScope83bc').replace('BULBS86Z','BURST83BC').replace("layout')!=='bulbs'","layout')!=='burst'")
s=rep(s,"if(bg!=null&&bg!=='none'&&bg!=='hrFailingLamp')return false;", "if(bg!=null&&bg!=='none')return false;")
(U/'fast-scope83bc.js').write_text(s)
s=(B/'ui-owned83bb/private-controller83.js').read_text();s=rep(s,'P=A.bulbsProof69,need=', 'P=A.bulbsProof69,NS=A.burstNormalPostScope83bc,NF=A.burstNormalFastScope83bc,need=')
s=rep(s,'function refs(){return[', 'function refs(){return[NS,NS.allows,NS.assertBeforePost,NF,NF.allows,')
s=rep(s,"need(opt.noPost===true&&opt.fast===true&&", "need((opt.noPost===true||NS.allows(plan,opt,renderer,ctx))&&(opt.fast===true||NF.allows(plan,opt,renderer,ctx))&&")
s=rep(s,"const reservation=reservedBytes+C.serializedBytes(", "need(NS.allows(copy,{noPost:false,fast:false,scale:viewport.scale},renderer,ctx)&&NF.allows(copy,{noPost:false,fast:false,scale:viewport.scale},renderer,ctx),'BURST83BC_PREPARE_OPTIONS');const reservation=reservedBytes+C.serializedBytes(")
(U/'private-controller83.js').write_text(s)
