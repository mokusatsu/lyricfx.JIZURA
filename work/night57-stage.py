from pathlib import Path
import subprocess,json
R=Path('/workspace/lyricfx.JIZURA');H=R/'work/avoid009-capacity-pilethin07/private_index_resume07.py';files=json.loads((R/'work/night57-stage-files.json').read_text());assert len(files)==len(set(files)) and all((R/p).is_file() for p in files)
for argv in [['add','--',*files],['diff','--cached','--stat']]:subprocess.run(['python','-B',str(H),'RUN','--round','1','--expected-head','6f6786d09f37dc2a572630934019b834e05cee30','--argv-json',json.dumps(argv)],cwd=R,check=True)
