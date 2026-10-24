'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),dir=path.resolve(__dirname,'..'),root='/workspace/lyricfx.JIZURA',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function audit(){const sources=Object.fromEntries(['src/diagnostic41.js','runner/exercise41.js','runner/runner41.cjs'].map(p=>[p,fs.readFileSync(path.join(dir,p),'utf8')])),loads=[];
 for(const [p,s]of Object.entries(sources)){
  for(const m of s.matchAll(/\bdir\s*\+\s*['"]([^'"]+)['"]/g)){const target=path.join(dir,m[1]);assert(fs.existsSync(target)&&fs.statSync(target).isFile(),'MISSING_LITERAL_DIR_LOAD:'+p+':'+m[1]);loads.push({source:p,literal:m[1],exists:true});}
  for(const m of s.matchAll(/\broot\s*\+\s*['"]([^'"]+)['"]/g)){if(m[1]==='/')continue;const target=path.join(root,m[1]);assert(fs.existsSync(target)&&fs.statSync(target).isFile(),'MISSING_LITERAL_ROOT_LOAD:'+p+':'+m[1]);loads.push({source:p,literal:'ROOT'+m[1],exists:true});}
  // Match identifiers/paths, never blanket-replace numerical source literals.
  assert(!/(?:SOURCE|Diagnostic|diagnostic|tiles|Tiles|DIAGNOSTIC|pins|seal|exercise|runner)(?:38|39|40)(?!\d)/.test(s),'STALE_VERSION_PREFIX:'+p);
 }
 const kernel=sources['src/diagnostic41.js'],exercise=sources['runner/exercise41.js'],runner=sources['runner/runner41.cjs'];
 assert(/A\.tilesNativeDiagnostic41\s*=\s*async function/.test(kernel));assert(/A\.tilesDiagnostic41Environment\s*=\s*setup/.test(kernel));assert(/async function exerciseTiles41\(/.test(exercise));assert(/window\.tiles41Partial\s*=/.test(exercise));
 assert(/exerciseTiles41\(input\)/.test(runner));assert(/window\.tiles41Partial/.test(runner));assert(runner.includes("dir+'/runner/exercise41.js'"));assert(runner.includes("dir+'/src/diagnostic41.js'"));
 const called=[...exercise.matchAll(/A\.(tiles\w*?41\w*)\s*\(/g)].map(m=>m[1]),defined=['tilesNativeDiagnostic41','tilesDiagnostic41Environment'];for(const name of called)assert(defined.includes(name),'UNDEFINED_VERSIONED_KERNEL_API:'+name);
 assert(!exercise.includes('program.nativeDGeometry.tiles.find'));assert(exercise.includes('direct.placementDGeometry.tiles.find'));assert(kernel.includes('cut.stagger===.03950859557604417'));
 return {kind:'SOURCE41-static-load-API-audit',onlyStaticReads:true,applicationExecuted:false,loadedFiles:loads,versionedKernelAPIs:defined,exerciseDefinitionAndCall:'exerciseTiles41',partialDefinitionAndRead:'window.tiles41Partial',nativeStaggerPreserved:true,noPriorRuntimePrefixes:true,sourceSHA256:Object.fromEntries(Object.entries(sources).map(([p,s])=>[p,sha(s)]))};}
module.exports=audit;if(require.main===module)console.log(JSON.stringify(audit(),null,2));
