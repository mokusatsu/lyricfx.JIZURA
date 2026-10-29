from pathlib import Path
import sys,tempfile,subprocess,shutil
D=Path(__file__).resolve().parent
R=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else next(p for p in D.parents if (p/'src/11p_layoutsD.js').exists())
with tempfile.TemporaryDirectory(prefix='burst83c-') as td:
 t=Path(td)
 for name in ['prepare-source.py','input-test.cjs']:shutil.copy2(D/name,t/name)
 subprocess.run([sys.executable,str(t/'prepare-source.py'),str(R/'src/11p_layoutsD.js')],check=True)
 for name in ['source-input-fragment.js','source-from-native.diff','boundary.json']:
  assert (t/name).read_bytes()==(D/name).read_bytes(),name
 args=['node',str(t/'input-test.cjs'),str(R/'src/11p_layoutsD.js'),str(R/'src/01_util.js'),str(R/'dev/avoidance/burst83/native83a/native-geometry83.js'),str(R/'dev/avoidance/burst83/native-parts83b/native-parts83.js')]
 subprocess.run(args,check=True)
 subprocess.run(args+[str(R/'src/02_fonts.js'),str(R/'src/03_text.js')],check=True)
