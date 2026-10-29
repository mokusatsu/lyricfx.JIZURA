from pathlib import Path
import sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);d=root/'dev/avoidance/bulbs86/binding-account86bc';s=(root/'src/11zz06_bulbs_binding80.js').read_text()
a='let serial=0,pending=null,busy=false;';assert s.count(a)==1;s=s.replace(a,a+'let frozenRetainedBytes86bc=null;const audit86bc=false;')
a="function bytes(){const n=codec.serializedBytes(retained());need(Number.isSafeInteger(n)&&n>=0&&n<=8388608,'BULBS80T_BINDING_BUDGET');return n}";assert s.count(a)==1;s=s.replace(a,(d/'bytes-fragment.js').read_text())
s=s.replace('function dropEntry(e){plans.delete', 'function dropEntry(e){frozenRetainedBytes86bc=null;plans.delete')
a="function issue({plan,ticket,trajectory}){need(!busy,'BULBS80T_REENTRANT');busy=true;";assert s.count(a)==1;s=s.replace(a,a+'frozenRetainedBytes86bc=null;')
out.mkdir(parents=True,exist_ok=True);(out/'plan-binding86.js').write_text(s)
