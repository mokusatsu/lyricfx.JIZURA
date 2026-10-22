"""Local-only C corpus extension of the existing pinned transport fixture.
Not a claim that source roles such as brush are their production web fonts.
No downloads: every original must already be present and match B's source hash.
"""
from pathlib import Path
import hashlib,json,re,shutil
from fontTools import subset
from fontTools.ttLib import TTFont
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'dev/avoidance/layouts-c-objects-fonts-v2'
BASE=ROOT/'dev/avoidance/fixtures/b-fonts'
OLD=json.loads((BASE/'manifest.json').read_text())
OUT.mkdir(parents=True,exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
corpus_files=[ROOT/'src/11p_layoutsC.js',ROOT/'dev/avoidance/layouts-c-objects-test.cjs']
corpus=''.join(p.read_text() for p in corpus_files)+'風の先へ世界の向こうに響く歌声を届けるBeyond the blue skyつづく'
requested=set(OLD['requestedCodepoints'])|{ord(c) for c in corpus if not c.isspace()}|set(range(32,127))
faces=[]
for old in OLD['faces']:
    face=dict(old)
    if old['id'] in ['dot','rounded']:
        source=Path('/workspace/lyricfx.JIZURA/scratch/avoid007-font-sources')/('DotGothic16-Regular.ttf' if old['id']=='dot' else 'MPLUSRounded1c-ExtraBold.ttf')
    else:source=Path(old['provenance']['localPath'])
    raw=source.read_bytes()
    assert sha(raw)==old['originalSourceSHA256'],f'Pinned original font changed: {source}'
    idx=old['collectionIndex'];font=TTFont(source,fontNumber=idx if idx is not None else -1,recalcTimestamp=False)
    wanted=requested&set(font.getBestCmap())
    options=subset.Options();options.recalc_timestamp=False;options.layout_features=['*'];options.name_IDs=['*'];options.name_legacy=True;options.notdef_outline=True
    tool=subset.Subsetter(options=options);tool.populate(unicodes=wanted);tool.subset(font)
    filename=old['file'];font.save(OUT/filename);data=(OUT/filename).read_bytes();cmap=sorted(font.getBestCmap())
    face.update(family='Avoid008-objects-'+old['id'],sourceSHA256=sha(data),codepoints=cmap,cmapSHA256=sha(json.dumps(cmap,separators=(',',':')).encode()),requestedMissing=sorted(requested-set(cmap)),transportBaseSHA256=old['sourceSHA256'],baseCodepoints=old['codepoints'],localOriginal=str(source))
    faces.append(face)
# Explicit transport-only fraction fallback: production mono routes to IBM Plex
# Mono then IBM Plex Sans JP / JP sans; those originals are not cached here.
# Do not claim DejaVu is that production fallback. Preserve the actual U+2153.
source=Path('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf')
font=TTFont(source,recalcTimestamp=False)
options=subset.Options();options.recalc_timestamp=False;options.name_IDs=['*'];options.notdef_outline=True
sub=subset.Subsetter(options=options);sub.populate(unicodes=[0x2153]);sub.subset(font)
for rec in font['name'].names:
    if rec.nameID in [1,3,4,6]:rec.string=('Avoid008 Objects Fractions' if rec.nameID!=6 else 'Avoid008ObjectsFractions').encode(rec.getEncoding(),errors='replace')
font.save(OUT/'fractions.ttf');cmap=sorted(font.getBestCmap());data=(OUT/'fractions.ttf').read_bytes()
faces.append({'id':'fractions','file':'fractions.ttf','url':'/fonts/fractions.ttf','family':'Avoid008-objects-fractions','weight':400,'label':'Pinned transport fraction fallback','codepoints':cmap,'sourceSHA256':sha(data),'originalSourceSHA256':sha(source.read_bytes()),'localOriginal':str(source),'collectionIndex':None,'productionFontClaim':False,'scope':'Explicit transport-only fallback for U+2153, not the production IBM Plex/JP sans fallback'})
for file in BASE.glob('*.txt'):shutil.copyfile(file,OUT/file.name)
shutil.copyfile('/usr/share/doc/fonts-dejavu-core/copyright',OUT/'LICENSE-DejaVu.txt')
manifest={**OLD,'scope':'local-only extended C corpus, eight original transport faces plus one explicit fraction fallback; source font keys retain B role mapping. Brush/klee/etc are fixture substitutions, not production native faces.','faces':faces,'fallbackFamily':'Avoid008-objects-symbols','fallbackFamilies':['Avoid008-objects-symbols','Avoid008-objects-fractions'],'requestedCodepoints':sorted(requested),'corpusInputs':[{'file':str(p.relative_to(ROOT)),'sha256':sha(p.read_bytes())} for p in corpus_files],'buildScriptSHA256':sha(Path(__file__).read_bytes())}
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'faces':len(faces),'requested':len(requested),'bytes':sum((OUT/f['file']).stat().st_size for f in faces),'source':'local cached originals; no network'}))
