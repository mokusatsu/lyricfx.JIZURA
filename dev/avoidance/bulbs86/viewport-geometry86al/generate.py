from pathlib import Path
import sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);src=(root/'src/11p_layoutsEe_bulbs_geometry68.js').read_text();body=src[src.index('const view=new DataView'):src.index('function choose(')]
body=body.replace('function evaluation(supports,c,delta){validCircle(c);','function evaluation(supports,c,delta,viewport){validViewport(viewport);validSupports(supports);validCircle(c);')
body=body.replace('F(960)','F(viewport.width)').replace('F(540)','F(viewport.height)')
body=body.replace('function positions(supports,c,{evaluate=true}={}){validCircle(c);','function positions(supports,c,{evaluate=true,viewport}={}){validViewport(viewport);validSupports(supports);validCircle(c);')
body=body.replace('960-b.x1','viewport.width-b.x1').replace('540-b.y1','viewport.height-b.y1').replace('evaluation(supports,c,delta)','evaluation(supports,c,delta,viewport)').replace('c.cy/540','c.cy/viewport.height')
body=body.replace('radius=add(F(c.r),F(c.margin)),failures=[];', 'radius=add(F(c.r),F(c.margin)),failures=[];let failureCount=0;')
body=body.replace("if(circle||stage)failures.push({index:i,owner:s.owner,circle,stage,conservativeEnvelope:true});", "if(circle||stage){failureCount++;if(failures.length<16)failures.push({index:i,owner:s.owner,circle,stage,conservativeEnvelope:true});}")
body=body.replace('passed:failures.length===0,checked:supports.length,failures,','passed:failureCount===0,checked:supports.length,failureCount,failures,omittedWitnessCount:failureCount-failures.length,')
body=body.replace('BULBS68_','BULBS86AL_')
header="""/* Source-only viewport finite heuristic. Original canonical Geometry68 unchanged.
   Supplied supports are not authority; owner provenance and live budget required. */
(()=>{'use strict';const A=J.placement,need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c})},limits=Object.freeze({positionsPerRecipe:8,supports:128,witnesses:16});
function dataFields(x,names,code){need(x&&typeof x==='object'&&Reflect.ownKeys(x).length===names.length&&names.every(k=>{const d=Object.getOwnPropertyDescriptor(x,k);return d&&'value'in d&&d.enumerable}),code)}
function validViewport(v){dataFields(v,['scale','width','height'],'BULBS86AL_VIEWPORT');need(Number.isFinite(v.scale)&&v.scale>0&&v.scale<=1&&Number.isInteger(v.width)&&v.width>0&&v.width===Math.round(960*v.scale)&&Number.isInteger(v.height)&&v.height>0&&v.height===Math.round(540*v.scale),'BULBS86AL_VIEWPORT')}
function validSupports(s){need(Array.isArray(s)&&s.length>0&&s.length<=128,'BULBS86AL_SUPPORT_LIMIT')}
"""
helper="""
function nextUp(x){need(Number.isFinite(x),'BULBS86AL_CONVERSION');if(x===0)return Number.MIN_VALUE;view.setFloat64(0,x);view.setBigUint64(0,view.getBigUint64(0)+(x>0?1n:-1n));return view.getFloat64(0)}
function up(a){let x=Number(a.n)*2**a.e;need(Number.isFinite(x),'BULBS86AL_CONVERSION');for(let i=0;i<8;i++){if(cmp(F(x),a)>=0)return x;x=nextUp(x)}throw Object.assign(Error('BULBS86AL_CONVERSION'),{code:'BULBS86AL_CONVERSION'})}
function circleFor(plan,viewport,baseScale){validViewport(viewport);need(plan.W===960&&plan.H===540&&Number.isFinite(plan.duration)&&plan.duration>0&&Number.isFinite(baseScale)&&baseScale>0&&baseScale<=1,'BULBS86AL_PLAN');const index=plan.lyricAvoidanceIndex;dataFields(index,['version','enabled','regions'],'BULBS86AL_REGION');need(index.version===1&&index.enabled===true&&Array.isArray(index.regions)&&index.regions.length===1,'BULBS86AL_REGION');const region=index.regions[0];dataFields(region,['id','start','end','center','radius'],'BULBS86AL_REGION');dataFields(region.center,['x','y'],'BULBS86AL_REGION');need(typeof region.id==='string'&&region.id.length>0&&region.id.length<=128&&Object.is(region.start,0)&&Object.is(region.end,plan.duration)&&[region.center.x,region.center.y,region.radius].every(Number.isFinite)&&region.center.x>=0&&region.center.x<=1&&region.center.y>=0&&region.center.y<=1&&region.radius>0&&region.radius<=1,'BULBS86AL_REGION');const canonical={cx:region.center.x*960,cy:region.center.y*540,r:region.radius*540,margin:2.7},cx=canonical.cx*baseScale,cy=canonical.cy*baseScale,abs=x=>x.n<0n?neg(x):x,centerError=add(abs(sub(mul(F(canonical.cx),F(baseScale)),F(cx))),abs(sub(mul(F(canonical.cy),F(baseScale)),F(cy)))),r=up(add(mul(F(canonical.r),F(baseScale)),centerError)),margin=Math.max(2,up(mul(F(canonical.margin),F(baseScale))));const circle={cx,cy,r,margin};validCircle(circle);return Object.freeze({circle:Object.freeze(circle),canonical:Object.freeze(canonical),baseScale,sourceOnly:true,safetyCertified:false,meaning:'logical canonical circle at native base scale; radius contains center-rounding error; margin preserves device floor2, separate from support raster guard2'})}
A.bulbsViewportGeometry86al=Object.freeze({circleFor,evaluation,positions,limits,sourceOnly:true,safetyCertified:false});})();
"""
assert '960-b.x1'not in body and '540-b.y1'not in body
out.mkdir(parents=True,exist_ok=True);(out/'geometry86.js').write_text(header+body+helper)
