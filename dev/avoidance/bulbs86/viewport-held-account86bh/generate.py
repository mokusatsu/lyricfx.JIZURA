from pathlib import Path
import sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);d=root/'dev/avoidance/bulbs86/viewport-held-account86bh';s=(root/'dev/avoidance/bulbs86/viewport-direct-model86be/scalar-generator86.js').read_text()
a="function accountHeld(cursor){if(!cursor)return;const id=cursor.record.recipe.id,old=heldSizes.get(id)||0,n=measuredBytes([id,cursor.record]);heldBytes+=n-old+measuredBytes([id,n])-(old?measuredBytes([id,old]):0);heldSizes.set(id,n);}"
assert s.count(a)==1;s=s.replace(a,(d/'held-fragment.js').read_text())
a='const retainedBytes=()=>framingBytes+';assert s.count(a)==1;s=s.replace(a,'const heldFixedManagement86bh=measuredBytes({ids:null,referenceSlots:4,numericSlots:1})+4*96;\n const retainedBytes=()=>heldFixedManagement86bh+heldFixedKeyBytes86bh+framingBytes+')
# The generator closure starts before its first budget use. Move fixed state before retainedBytes.
a=" const heldFixed86bh=new Set();let heldFixedKeyBytes86bh=0;const auditHeld86bh=false;";assert s.count(a)==1
start=s.index(a);end=s.index(' function heldReady86bh(',start);decl=s[start:end];s=s[:start]+s[end:];key=' const heldFixedManagement86bh=';assert s.count(key)==1;s=s.replace(key,decl+'\n'+key)
s=s.replace('measuredBytes({ids:null,referenceSlots:4,numericSlots:1})+4*96','measuredBytes({ids:null,referenceSlots:4,numericSlots:1,dynamicFields:heldDynamic86bh,recordKeys:heldKeys86bh,transientKeyReservation:4096})+4*96+4096')
a='heldBytes,localRetainedBytes,';assert s.count(a)==1;s=s.replace(a,'heldBytes,heldFixedManagement86bh,heldFixedKeyBytes86bh,localRetainedBytes,')
a='held.records.clear();heldSizes.clear();';assert s.count(a)==1;s=s.replace(a,a+'heldFixed86bh.clear();')
out.mkdir(parents=True,exist_ok=True);(out/'scalar-generator86.js').write_text(s)
