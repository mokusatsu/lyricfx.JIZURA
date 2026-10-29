from pathlib import Path
import sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);d=root/'dev/avoidance/bulbs86/viewport-owner86ag';s=(root/'dev/avoidance/bulbs86/owner-accounting86o/model-owner86.js').read_text();fragment=(d/'fragment.js').read_text()
assert s.count('function accountStateBytes')==1;s=s.replace('function accountStateBytes',fragment+'\nfunction accountStateBytes',1)
s=s.replace('const registeredReservation=frameReservation()+(cooperativeReservation?cooperativeReservation():0);','const registeredReservation=frameReservation()+(cooperativeReservation?cooperativeReservation():0)+viewportWork86ag+viewportMeta86ag;')
s=s.replace('function evict(key){const e=resident.get(key);if(!e)return;','function evict(key){const e=resident.get(key);if(!e)return;if(viewportJob86ag?.entry===e)viewportClear86ag();')
s=s.replace('A.bulbsModelOwner80=Object.freeze({beginPreparation86c,','A.bulbsModelOwner80=Object.freeze({beginViewport86ag,stepViewport86ag,cancelViewport86ag,viewportState86ag,beginPreparation86c,')
s=s.replace('return{...counts,residentModels:resident.size', 'return{...counts,viewportProposalJobs:viewportJob86ag?1:0,viewportProposalBytes:viewportWork86ag+viewportMeta86ag,residentModels:resident.size')
out.mkdir(parents=True,exist_ok=True);(out/'model-owner86.js').write_text(s)
