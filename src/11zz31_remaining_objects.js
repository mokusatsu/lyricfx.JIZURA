/* Remaining objects: admit only an unchanged, wholly safe native word-search
 * viewport through simpleCircle.nativeViewportIdentity. No new glyph-size or
 * moving-object envelope is asserted by this provider. */
(() => {
'use strict';
const A=J.placement,S=A.simpleCircle,ids=new Set(['wordSearch']);
const blockers=Object.freeze({flipCards:'PRIVATE_CARD_PROJECTION_AND_ATTACHMENT_FORMULA',flag:'PRIVATE_CLOTH_ATTACHMENT_FORMULA_AND_UNFURL_OVERHANG',pile:'NATIVE_MOUND_CONTACT_AND_LAYER_PROOF_REQUIRED',blocks:'NATIVE_MOVING_ENTRY_AND_FLOOR_CONTRACT_REQUIRED',balloons:'NATIVE_STRING_ANCHOR_AND_FLY_CONTRACT_REQUIRED',crowdBubbles:'GENERATION_DEPENDENT_AUXILIARY_FIELD',wordSearch:'CONTINUOUS_LYRIC_SIZE_INK_ENVELOPE_REQUIRED',puzzle:'MOVING_CLIP_PIECE_SUPPORT_REQUIRED'});
function handles(plan,cut){
 const p=cut.params,n=[...cut.text.replace(/\s/g,'')].length;
 return ids.has(cut.layout)&&cut.enter==='cut'&&cut.exit==='cut'&&cut.hold==='still'&&(cut.treat||'none')==='none'&&!cut.placementTrajectory&&!cut.area?.angle&&['h','v','d'].includes(p.dir)&&Number.isInteger(p.pad)&&p.pad>=1&&p.pad<=3&&Number.isInteger(p.decoys)&&p.decoys>=0&&p.decoys<=3&&n>=2&&n<=14&&(S.preparedCut(plan,cut)||A.placementCutPreserved86cm(plan,cut)===false);
}
function prepare(plan,cut){
 // Shared preparation tries the complete native viewport first. If it does
 // not fit, keep the unsupported result and the original source renderer.
 return {diagnostic:{cut:cut.index,layout:cut.layout,status:'unsupported',reason:blockers.wordSearch,details:'Native viewport identity did not fit; variable lyric size needs a small continuous ink bound before source translation can be admitted.',allClockGeneration:false}};
}
A.remainingObjectsCircle=Object.freeze({ids,handles,prepare,blockers,identityOnly:true});
})();
