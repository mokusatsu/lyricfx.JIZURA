module.exports=()=>{
 const out=[],add=(hid,id,s)=>out.push({id,hid:'AVOID-004-'+hid,label:id,fontState:'loaded',time:1.5,...s});
 add('H01','legacy-on-area',{control:'legacy',plate:true});add('H01','existing-fullstage-control',{control:'fullstage',plate:true});
 add('H01','center-static',{plate:true});add('H01','tile-owned-box',{layout:'tile'});add('H01','multiply-opacity',{plate:true,blend:'multiply',opacity:65});add('H01','overlay-frontmost',{plate:true,blend:'overlay',frontmost:true,opacity:80});
 for(const camera of ['dutch','panL'])for(const seek of ['direct','sequential','reverse'])add('H02',camera+'-'+seek,{camera,seek,ghost:true,transition:true,plate:true,time:3.1});
 for(const time of [.1,.6,1.5,2.9,3.05,3.2,4.5])add('H02','moving-frame-'+String(time).replace('.','-'),{camera:'dutch',ghost:true,transition:true,plate:true,time});
 for(const fontState of ['fallback','loaded','reloaded'])for(const control of ['staged','manual','off'])add('H03',fontState+'-'+control,{fontState,control,plate:true});
 return out;
};
