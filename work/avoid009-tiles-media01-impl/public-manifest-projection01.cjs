'use strict';
// SOURCE-ONLY utility for parent integration after the source/raw acceptance gate.
// Pure projection: no filesystem, network, browser, process or encoder activity.
module.exports=function publicManifestProjection(m){
 const side=name=>{
  const s=m.sides[name],v=s.probe.streams[0];
  if(s.video!=='videos/'+name+'.mp4'||!/^[0-9a-f]{64}$/.test(s.videoSHA256))throw Error('Reviewed native video receipt required');
  return {video:s.video,sha256:s.videoSHA256,width:v.width,height:v.height,codec:v.codec_name,fps:v.avg_frame_rate,frames:Number(v.nb_read_frames),duration:Number(s.probe.format.duration),sampleAspectRatio:v.sample_aspect_ratio};
 };
 return {schema:1,build:m.build,sourceProduct:m.sourceProduct,sourceSealSHA256:m.sealSHA256,sourceGateSHA256:m.gateSHA256,
  fixture:{layout:'tiles',text:'風の先へ',seed:1205,width:960,height:540,sourceCutStart:0,sourceCutEnd:4,sourceCutDuration:4,fps:60,koma:0,observationHorizon:4.150001,baseline:'Original native rendering; identical enabled source input; no placement finalization'},
  capture:{frames:249,encodedDuration:4.15,clock:'j/60 for j=0..248',noHud:true,noPost:true,scale:1,circleBurnedIn:false,guide:{htmlOverlayOnly:true,cx:480,cy:226.8,r:108},proofFrameIndices:[6,24,60,120,216,231,244]},
  quality:{policy:'tiles-source-moving-entry-exit-only-v1',entryExitTileAndOwnedPointsCircleRelaxation:true,rackScoreAndHeldStrict:true,humanMotionApproval:false},
  sides:{before:side('before'),after:side('after')},publicFiles:['index.html','en.html','manifest.json','videos/before.mp4','videos/after.mp4'],humanMotionReview:m.humanMotionReview,visualReview:m.visualReview,formalPerformanceAccepted:false,publicChecks:0};
};
