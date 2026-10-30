from pathlib import Path
import sys
R=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;B=R/'dev/avoidance/burst83/normal-options83bc';D=R/'dev/avoidance/domino82/ui-frame82am'
def rep(s,a,b):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,b)
for kind in ['post','fast']:
 s=(B/(kind+'-scope83bc.js')).read_text().replace('burstNormalPostScope83bc','dominoNormalPostScope82an').replace('burstNormalFastScope83bc','dominoNormalFastScope82an').replace('burstComposeScope83ay','dominoUICompose82ak').replace('BURST83BC','DOMINO82AN').replace("layout')!=='burst'","layout')!=='dominoes'").replace("layout!=='burst'","layout!=='dominoes'").replace("layout==='burst'","layout==='dominoes'").replace('burst_prepared83av','domino_prepared82am')
 s=s.replace('||!!plan?.burstRuntime83ag','')
 if kind=='post':s=rep(s,'{allows,needs,assertBeforePost,neutralMissingGlow,sourceOnly:', '{allows,needs,assertBeforePost,sourceOnly:')
 (U/(kind+'-scope82an.js')).write_text(s)
s=(D/'controller82am.js').read_text();s=rep(s,'Root=A.dominoUIRoot82ak,Renderer=', 'NS=A.dominoNormalPostScope82an,NF=A.dominoNormalFastScope82an,Root=A.dominoUIRoot82ak,Renderer=')
s=rep(s,'need(opt.noPost===true&&opt.fast===true&&', "need(A.dominoNormalPostScope82an===NS&&A.dominoNormalFastScope82an===NF,'DOMINO82AN_SCOPE_SOURCE');need((opt.noPost===true||NS.allows(plan,opt,renderer,ctx))&&(opt.fast===true||NF.allows(plan,opt,renderer,ctx))&&")
s=rep(s,'Q.contextState(ctx);','Q.contextState(ctx);if(opt.noPost!==true)NS.assertBeforePost(plan,opt,renderer,ctx);')
(U/'controller82an.js').write_text(s)
