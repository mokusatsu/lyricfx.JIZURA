"""Local-only C editorial subsets of the exact real faces already pinned by B.
No download path: missing/mismatched original files are a hard failure.
"""
import hashlib,json,pathlib,re
from fontTools import subset
from fontTools.ttLib import TTFont
ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=ROOT/'dev/avoidance/layouts-c-editorial-fonts'
BASE=ROOT/'dev/avoidance/fixtures/b-fonts'
meta=json.loads((BASE/'manifest.json').read_text())
sha=lambda b:hashlib.sha256(b).hexdigest()
assert not OUT.exists(),'Immutable font fixture output must be new'
OUT.mkdir()
corpus=''.join(p.read_text() for p in [ROOT/'src/11p_layoutsC.js',*sorted((ROOT/'dev/avoidance').glob('layouts-c-editorial-*.cjs')),*sorted((ROOT/'dev/avoidance').glob('layouts-c-editorial-*.js'))])
requested=set(range(32,127))|set(range(0x3041,0x3097))|set(range(0x30a0,0x3100))|{ord(c) for c in corpus if ord(c)>=128 and not c.isspace()}
paths={'sans-regular':('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',0),'sans-bold':('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc',0),'serif-regular':('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc',0),'serif-bold':('/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc',0),'mono':('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',5),'dot':('/workspace/lyricfx.JIZURA/scratch/avoid007-font-sources/DotGothic16-Regular.ttf',-1),'rounded':('/workspace/lyricfx.JIZURA/scratch/avoid007-font-sources/MPLUSRounded1c-ExtraBold.ttf',-1),'symbols':('/usr/share/fonts/truetype/noto/NotoSansSymbols2-Regular.ttf',-1)}
faces=[]
for old in meta['faces']:
 name=old['id'];path,index=paths[name];path=pathlib.Path(path);raw=path.read_bytes();assert sha(raw)==old['originalSourceSHA256'],(name,'Original source pin mismatch')
 f=TTFont(path,fontNumber=index,recalcTimestamp=False);options=subset.Options();options.recalc_timestamp=False;options.layout_features=['*'];options.name_IDs=['*'];options.name_legacy=True;options.notdef_outline=True;ss=subset.Subsetter(options=options);ss.populate(unicodes=requested&set(f.getBestCmap()));ss.subset(f)
 filename=name+('.otf' if 'CFF ' in f else '.ttf');f.save(OUT/filename);points=sorted(f.getBestCmap());faces.append({**old,'family':'Avoid008Editorial-'+name,'file':filename,'url':'/dev/avoidance/layouts-c-editorial-fonts/'+filename,'sourceSHA256':sha((OUT/filename).read_bytes()),'codepoints':points,'cmapSHA256':sha(json.dumps(points,separators=(',',':')).encode()),'requestedMissing':sorted(requested-set(points)),'sourceLocalPath':str(path),'collectionIndex':index})
for name in ['dotgothic16-OFL.txt','mplusrounded1c-OFL.txt','fonts-noto-cjk-copyright.txt','fonts-noto-symbols-copyright.txt']:(OUT/name).write_bytes((BASE/name).read_bytes())
manifest={**meta,'scope':'C editorial source/test superset from the exact B original real face bytes; actual emitted-corpus coverage is a separate audit','faces':faces,'fallbackFamily':'Avoid008Editorial-symbols','requestedCodepoints':sorted(requested),'buildScriptSHA256':sha(pathlib.Path(__file__).read_bytes()),'baseManifestSHA256':sha((BASE/'manifest.json').read_bytes())};(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'faces':len(faces),'requested':len(requested),'bytes':sum((OUT/f['file']).stat().st_size for f in faces),'baseUnchanged':sha((BASE/'manifest.json').read_bytes())==manifest['baseManifestSHA256']}))
