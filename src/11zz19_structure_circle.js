/* The saved 184-ID structural inventory. Families describe grouping, not blanket safety. */
(() => {
'use strict';
const A=J.placement,S=A.simpleCircle,groups={
 T:'center marquee huge gloss type diag circle pill tile lowerThird corners frameBox subtitleBar sideways perspective hanko quote ruler searchBar edgeFrame ticker tunnel wordCloud neon zoomRepeat curtain crossBands headlineDeck footnote proofread poster dictionary ledScroll burst tyCropGiant tyBandHide tyRuby tyVRuler tyStatCount tyMargin hrFlashlight hrDoorGap hrWallScrawl hrRedacted hrStaticTv hrSpiritPhoto',
 R:'vcols condensed staircase justified dropCap credits columnsBig halfVertical magazine contents numbered swissGrid routeMap tyBaseline tyScaleSteps tyJustify knSlamStack knSwapCenter knFlowSnap knRhythmCuts knReflow knQuarterTurn knZoomDive',
 G:'mixed scatter zigzag gridCells genkou rain bounceLine elastic equalizer ransom crossword wordSearch fisheye tyIndexTable tyFullTrack tySquare tyLineFocus knPadGrid hrWrongOne hrRisingDark',
 P:'ring wave arcTop spiral orbit circleWords knPathRide knGearWords',
 O:'labels bubble ticket hanging stickerBomb keycaps bubbles tape ema newspaper vinyl cassette bookSpine polaroid postcard letterPaper calendar chochin stationSign noren tanzaku omikuji kakejiku shoji clapper warningLabel priceTag nameTag stickyNotes karuta stampSheet cube cylinder flipCards accordion flag ribbon pendulum pile blocks balloons magnets tiles bulbs billboard dominoes wall origami zipper knSeesaw knTumble hrCctv hrOuija hrMissing',
 M:'stack splitScreen mirror panels filmstrip chat notification depthStack typeSpecimen kanjiFocus crowdBubbles shadowPlay kaleido contour tyKeySplit tyCross tyRotBlock tyErode knTypeSlam hrWrongShadow knCollide',
 C:'slotMachine flipBoard splitHalves dotMatrix puzzle sliceStack glitchGrid mosaicTiles maskReveal halftoneBig stencil tySplitType'
},family=Object.freeze(Object.fromEntries(Object.entries(groups).flatMap(([key,ids])=>ids.split(' ').map(id=>[id,key]))));
A.structureFamilies=Object.freeze({groups:Object.freeze(groups),family});
})();
