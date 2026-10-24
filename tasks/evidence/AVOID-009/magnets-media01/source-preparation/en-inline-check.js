
const videos=[...document.querySelectorAll('video')],seek=document.getElementById('seek'),time=document.getElementById('time');
function show(t){seek.value=String(t);time.textContent=t.toFixed(2)+' s';}
function pause(){videos.forEach(v=>v.pause());}
function setTime(t){videos.forEach(v=>v.currentTime=t);show(t);}
document.getElementById('play').onclick=async()=>{pause();setTime(videos[0].currentTime);const results=await Promise.allSettled(videos.map(v=>v.play()));if(results.some(r=>r.status==='rejected'))pause();};
document.getElementById('pause').onclick=pause;
document.getElementById('reset').onclick=()=>{pause();setTime(0);};
seek.oninput=()=>{pause();setTime(Number(seek.value));};
videos[0].ontimeupdate=()=>{show(videos[0].currentTime);if(!videos[0].paused&&Math.abs(videos[1].currentTime-videos[0].currentTime)>1/30)videos[1].currentTime=videos[0].currentTime;};
videos.forEach(v=>v.onended=pause);
document.getElementById('guide').onchange=e=>document.body.classList.toggle('show-guide',e.target.checked);
