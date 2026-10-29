from pathlib import Path
import sys
repo=Path(sys.argv[1]).resolve();dest=Path(sys.argv[2]).resolve();base=(repo/'src/11zz07_bulbs_owner80.js').read_text();fragment=(Path(__file__).parent/'job-fragment.js').read_text()
base=base.replace('let serial=0,','let cooperativeReservation=null;let serial=0,').replace('const registeredReservation=frameReservation();','const registeredReservation=frameReservation()+(cooperativeReservation?cooperativeReservation():0);').replace("function prepare({renderer,plan,ctx}){need(!pending&&!borrowed,", "function prepare({renderer,plan,ctx}){need(!pending&&!borrowed&&!cooperativeReservation,")
assert base.count('A.bulbsModelOwner80=Object.freeze({')==1
dest.write_text(base.replace('A.bulbsModelOwner80=Object.freeze({',fragment+'\nA.bulbsModelOwner80=Object.freeze({beginPreparation86c,'))
