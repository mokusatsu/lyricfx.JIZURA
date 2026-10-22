window.strictDecodedFrame=function seekDecodedFrame(video,target){
  return new Promise((resolve,reject)=>{
    let seekedAt=null,decoded=null,callback=null,settled=false;
    const ignoredFrames=[],timer=setTimeout(()=>finish('requested frame not decoded'),10000);
    function cleanup(){
      clearTimeout(timer);
      video.removeEventListener('seeked',seek);
      video.removeEventListener('error',error);
      if(callback!==null)video.cancelVideoFrameCallback(callback);
    }
    function finish(message){
      if(settled)return;
      if(message){
        settled=true;
        cleanup();
        return reject(Error(message));
      }
      if(seekedAt!==null&&decoded){
        settled=true;
        cleanup();
        resolve({
          seekedAt,decodedAfterSeek:decoded,ignoredFrames
        });
      }
    }
    function seek(){
      seekedAt=video.currentTime;
      if(Math.abs(seekedAt-target)>1/24+1e-6)return finish('seek did not reach requested time');
      finish();
    }
    function error(){
      finish('media error '+video.error?.code);
    }
    function frame(now,meta){
      callback=null;
      const f={
        mediaTime:meta.mediaTime,presentedFrames:meta.presentedFrames
      };
      // Chromium may deliver the requested decoded frame before its seeked
      // event. Keep that matching frame pending; finish still requires both
      // the decoded target and the independently checked seeked target.
      if(Number.isFinite(f.mediaTime)&&Math.abs(f.mediaTime-target)<=1/24+1e-6){
        decoded=f;
        finish();
      }
      else{
        ignoredFrames.push(f);
        callback=video.requestVideoFrameCallback(frame);
      }
    }
    video.addEventListener('seeked',seek,{
      once:true
    });
    video.addEventListener('error',error,{
      once:true
    });
    try{
      callback=video.requestVideoFrameCallback(frame);
      video.currentTime=target;
    }
    catch{
      finish('seek setup failed');
    }
  });
};window.installH03DecoderDiagnostic=function diagnostic(){
 const traces=[],videos=[...document.querySelectorAll('video')],state=v=>{const c=getComputedStyle(v),r=v.getBoundingClientRect(),x=Math.max(0,Math.min(innerWidth-1,r.x+r.width/2)),y=Math.max(0,Math.min(innerHeight-1,r.y+r.height/2));return {index:videos.indexOf(v),currentTime:v.currentTime,readyState:v.readyState,paused:v.paused,seeking:v.seeking,error:v.error?{code:v.error.code,message:v.error.message}:null,src:v.currentSrc,source:[v.videoWidth,v.videoHeight,v.duration],seekCount:v.h03SeekCount,rect:{x:r.x,y:r.y,width:r.width,height:r.height},computed:{display:c.display,visibility:c.visibility,opacity:c.opacity,zIndex:c.zIndex},elementsAtCenter:document.elementsFromPoint(x,y).slice(0,6).map(e=>({tag:e.tagName,id:e.id,className:e.className})),quality:v.getVideoPlaybackQuality().toJSON?.()||{totalVideoFrames:v.getVideoPlaybackQuality().totalVideoFrames,droppedVideoFrames:v.getVideoPlaybackQuality().droppedVideoFrames}};},push=(kind,v,extra={})=>traces.push({now:performance.now(),kind,...state(v),...extra});
 for(const v of videos){for(const name of ['seeking','seeked','loadeddata','timeupdate','error','resize'])v.addEventListener(name,()=>push(name,v));const request=v.requestVideoFrameCallback,cancel=v.cancelVideoFrameCallback;v.requestVideoFrameCallback=function(fn){const id=request.call(v,(now,meta)=>{push('video-frame-callback',v,{callbackNow:now,metadata:{...meta}});fn(now,meta);});push('request-frame-callback',v,{callbackID:id});return id;};v.cancelVideoFrameCallback=function(id){push('cancel-frame-callback',v,{callbackID:id});return cancel.call(v,id);};}
 return {traces,state,videos};
};