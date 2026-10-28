/* Offline source-direct binding only. No runtime certificate or registration. */
(()=>{'use strict';const A=J.placement,D=A.billboardDescriptors81,G=A.billboardNativeGeometry81,C=A.bulbsScalarCompiler80,source=J.LAYOUTS.billboard.render,split=A.billboardRecipeText81,bindings=new WeakMap(),origins=new WeakMap(),need=(v,code)=>{if(!v)throw Object.assign(Error(code),{code})};
function key(env){const cut={...env.cut};for(const k of ['placementTrajectory','placementFinalization','placementLayoutsD','placementUnits','fullStagePlacement'])delete cut[k];return JSON.stringify(C.exact({W:env.W,H:env.H,lang:J.lang,cut}));}
function known(){need(A.billboardDescriptors81===D&&A.billboardNativeGeometry81===G&&A.billboardRecipeText81===split&&J.LAYOUTS.billboard.render===source,'BILLBOARD81E_SOURCE_IDENTITY');}
function family(env){known();const f=D.family(env),input=key(env);for(const recipe of f.recipes)origins.set(recipe,input);return f;}
function withRecipe(env,recipe,run){known();D.domain(env);need(typeof run==='function'&&!bindings.has(env),'BILLBOARD81E_BINDING_LIFETIME');need(origins.has(recipe),'BILLBOARD81E_RECIPE_ISSUER');const input=key(env);need(origins.get(recipe)===input,'BILLBOARD81E_INPUT_DRIFT');bindings.set(env,recipe);try{const result=run();need(!result||typeof result.then!=='function','BILLBOARD81E_SYNC_ONLY');known();need(key(env)===input,'BILLBOARD81E_INPUT_DRIFT');return result;}finally{bindings.delete(env);}}
Object.defineProperty(A,'billboardRecipe81For',{value:env=>{const r=bindings.get(env);return r&&r.id!=='native'?r:null}});
Object.defineProperty(A,'billboardSourceDirect81',{value:Object.freeze({family,withRecipe,sourceOnly:true,certificateIssuer:false})});
})();
