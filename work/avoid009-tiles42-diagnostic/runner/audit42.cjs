'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),dir=path.resolve(__dirname,'..'),root='/workspace/lyricfx.JIZURA',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function audit(){const sources=Object.fromEntries(['src/diagnostic42.js','runner/exercise42.js','runner/runner42.cjs'].map(p=>[p,fs.readFileSync(path.join(dir,p),'utf8')])),loads=[];
 for(const [p,s]of Object.entries(sources)){
  for(const m of s.matchAll(/\bdir\s*\+\s*['"]([^'"]+)['"]/g)){const target=path.join(dir,m[1]);assert(fs.existsSync(target)&&fs.statSync(target).isFile(),'MISSING_LITERAL_DIR_LOAD:'+p+':'+m[1]);loads.push({source:p,literal:m[1],exists:true});}
  for(const m of s.matchAll(/\broot\s*\+\s*['"]([^'"]+)['"]/g)){if(m[1]==='/')continue;const target=path.join(root,m[1]);assert(fs.existsSync(target)&&fs.statSync(target).isFile(),'MISSING_LITERAL_ROOT_LOAD:'+p+':'+m[1]);loads.push({source:p,literal:'ROOT'+m[1],exists:true});}
  // Match identifiers/paths, never blanket-replace numerical source literals.
  assert(!/(?:SOURCE|Diagnostic|diagnostic|tiles|Tiles|DIAGNOSTIC|pins|seal|exercise|runner)(?:38|39|40|41)(?!\d)/.test(s),'STALE_VERSION_PREFIX:'+p);
 }
 const kernel=sources['src/diagnostic42.js'],exercise=sources['runner/exercise42.js'],runner=sources['runner/runner42.cjs'];
 assert(/A\.tilesNativeDiagnostic42\s*=\s*async function/.test(kernel));assert(/A\.tilesDiagnostic42Environment\s*=\s*setup/.test(kernel));assert(/async function exerciseTiles42\(/.test(exercise));assert(/window\.tiles42Partial\s*=/.test(exercise));
 assert(/exerciseTiles42\(input\)/.test(runner));assert(/window\.tiles42Partial/.test(runner));assert(runner.includes("dir+'/runner/exercise42.js'"));assert(runner.includes("dir+'/src/diagnostic42.js'"));
 const called=[...exercise.matchAll(/A\.(tiles\w*?42\w*)\s*\(/g)].map(m=>m[1]),defined=['tilesNativeDiagnostic42','tilesDiagnostic42Environment'];for(const name of called)assert(defined.includes(name),'UNDEFINED_VERSIONED_KERNEL_API:'+name);assert(called.length>0,'EMPTY_VERSIONED_KERNEL_CALL_AUDIT');assert.deepEqual([...new Set(called)].sort(),[...defined].sort(),'BOTH_ACTUAL_KERNEL_CALLS_REQUIRED');
 assert(!exercise.includes('program.nativeDGeometry.tiles.find'));assert(exercise.includes('direct.placementDGeometry.tiles.find'));assert(kernel.includes('cut.stagger===.03950859557604417'));
 return {kind:'SOURCE42-static-load-API-audit',onlyStaticReads:true,applicationExecuted:false,loadedFiles:loads,versionedKernelAPIs:defined,observedVersionedKernelCalls:[...new Set(called)],actualCallSetNonemptyAndComplete:true,exerciseDefinitionAndCall:'exerciseTiles42',partialDefinitionAndRead:'window.tiles42Partial',nativeStaggerPreserved:true,noPriorRuntimePrefixes:true,sourceSHA256:Object.fromEntries(Object.entries(sources).map(([p,s])=>[p,sha(s)]))};}
module.exports=audit;if(require.main===module)console.log(JSON.stringify(audit(),null,2));
