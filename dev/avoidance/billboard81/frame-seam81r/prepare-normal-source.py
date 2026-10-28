from pathlib import Path
import sys,difflib,json,hashlib
out=Path(__file__).resolve().parent
origin=Path(sys.argv[1]);before=origin.read_text();s=before
anchor='// Source-only declared recipe seam. The unbound route returns the original helper.\n'
assert s.count(anchor)==1
s=s.replace(anchor,anchor+'''// No resolver is installed by this seam. A future private controller must
// issue and consume normal leases; kind checks here alone certify nothing.
function billboardDrawRecipe81(env){const normal=J.placement.billboardNormalLease81For?.(env)||null,legacy=J.placement.billboardRecipe81For?.(env)||null;if(normal&&legacy)throw Object.assign(Error('BILLBOARD81R_LEASE_CONFLICT'),{code:'BILLBOARD81R_LEASE_CONFLICT'});if(normal&&normal.kind!=='billboard-private-current-frame81r')throw Object.assign(Error('BILLBOARD81R_LEASE_KIND'),{code:'BILLBOARD81R_LEASE_KIND'});if(normal&&(env.cut?.placementLayoutsD!==true||J.placement.billboardNormalLease81Valid?.(env,normal)!==true))throw Object.assign(Error('BILLBOARD81R_LEASE_IDENTITY'),{code:'BILLBOARD81R_LEASE_IDENTITY'});return normal?normal.recipe:legacy;}
''')
start=s.index('function billboardDrawInitial81');end=s.index("/* ================================================================== 16 crowdBubbles",start)
part=s[start:end]
assert part.count('const recipe=J.placement.billboardRecipe81For?.(env)||null')==2
part=part.replace('const recipe=J.placement.billboardRecipe81For?.(env)||null','const recipe=billboardDrawRecipe81(env)')
assert part.count('recipe=J.placement.billboardRecipe81For?.(env)||null')==1
part=part.replace('recipe=J.placement.billboardRecipe81For?.(env)||null','recipe=billboardDrawRecipe81(env)')
part=part.replace('const nativeD=cut.placementLayoutsD===true,matrixNow=',"const normalLease81=J.placement.billboardNormalLease81For?.(env)||null,nativeD=cut.placementLayoutsD===true,matrixNow=")
part=part.replace('captureD=nativeD&&textBudget&&paramScope','captureD=nativeD&&!normalLease81&&textBudget&&paramScope')
part=part.replace('const catalog=nativeD?','const catalog=nativeD&&!normalLease81?')
part=part.replace('if(nativeD)env.placementDGeometry=catalog;','if(catalog)env.placementDGeometry=catalog;')
part=part.replace('if(!nativeD)return fn();', 'if(!nativeD&&!normalLease81)return fn();')
part=part.replace('finally {if(nativeD){catalog.complete=', 'finally {if(catalog){catalog.complete=')
s=s[:start]+part+s[end:]
(out/'11p_layoutsD-normal81.js').write_text(s)
(out/'normal-source.diff').write_text(''.join(difflib.unified_diff(before.splitlines(True),s.splitlines(True),fromfile='a/11p_layoutsD.js',tofile='b/11p_layoutsD.js',n=0)))
(out/'boundary.json').write_text(json.dumps({'before':{'path':str(origin),'sha256':hashlib.sha256(origin.read_bytes()).hexdigest()},'after':{'sha256':hashlib.sha256(s.encode()).hexdigest()},'scope':'uninstalled normal resolver seam only; no issuer/controller/certificate/adapter/UI; native path unchanged when resolver absent'},indent=2)+'\n')
