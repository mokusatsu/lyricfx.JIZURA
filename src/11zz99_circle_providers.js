/* One registration point for the independently implemented source families. */
(() => {
'use strict';
const A=J.placement;
// Keep owned unsupported conditions in the diagnostic/output path, while
// leaving cuts already owned by the legacy trajectory controller alone.
const explicitConditions=provider=>provider&&({...provider,
 handles:(plan,cut)=>provider.ids.has(cut.layout)&&!cut.placementTrajectory&&(A.simpleCircle.preparedCut(plan,cut)||A.placementCutPreserved86cm(plan,cut)===false),
 preflight:(plan,cut)=>provider.handles(plan,cut)?null:provider.preflight?.(cut)||'SOURCE_FORMULA_WORDSEARCH_TRANSPORT_OR_DOMAIN'
});
A.simpleCircle.registerProvider('nativeBlock',A.nativeBlockCircle);
A.simpleCircle.registerProvider('sourceFormula',{ids:new Set([...A.sourceFormulaCircle.ids].filter(id=>!['headlineDeck','numbered','huge','wave'].includes(id))),handles:A.sourceFormulaCircle.handles,prepare:A.sourceFormulaCircle.prepare});
for(const [key,provider]of [['typo',A.typoCircle],['horror',A.horrorCircle],['kinetic',A.kineticCircle],['contour',A.contourCircle],['crossword',A.crosswordCircle],['domino',A.dominoCircle&&{...A.dominoCircle,legacyNoPost:true}],['route',A.routeCircle],['remainingObjects',explicitConditions(A.remainingObjectsCircle)],['remainingEffects',explicitConditions(A.remainingEffectsCircle)]])if(provider)A.simpleCircle.registerProvider(key,provider);
})();
