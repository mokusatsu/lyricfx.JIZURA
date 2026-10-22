"""Build self-contained B25 font subsets; public HTTPS sources use pinned commit URLs."""
import hashlib, json, pathlib, re, urllib.request
from datetime import datetime, timezone
from fontTools import subset
from fontTools.ttLib import TTFont
ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=ROOT/'dev/avoidance/fixtures/b-fonts'; SOURCE=ROOT/'scratch/avoid007-font-sources'
OUT.mkdir(parents=True,exist_ok=True);SOURCE.mkdir(parents=True,exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'JIZURA-AVOID007-font-fixture/1'}),timeout=60) as r:return r.read()
def remote(directory,name):
    # Every network resource is resolved by the checked-in immutable pin recipe.
    meta=json.loads((OUT/'upstream-sources.json').read_text())['sources'][directory]
    path=SOURCE/name
    if not path.exists():path.write_bytes(fetch(meta['url']))
    assert sha(path.read_bytes())==meta['sourceSHA256'],'Pinned upstream font mismatch'
    licencePath=OUT/(directory+'-OFL.txt')
    if not licencePath.exists():
        licence=fetch(meta['licenceURL'])
        if directory=='mplusrounded1c':
            f=TTFont(path,lazy=True)
            copyright=next(n.toUnicode() for n in f['name'].names if n.nameID==0)
            embedded=next(n.toUnicode() for n in f['name'].names if n.nameID==13)
            licence=(copyright+'\n'+embedded+'\n\nSIL OPEN FONT LICENSE'+licence.decode().split('SIL OPEN FONT LICENSE',1)[1]).encode()
        licencePath.write_bytes(licence)
    assert sha(licencePath.read_bytes())==meta['licenceSHA256'],'Pinned upstream licence mismatch'
    return path,meta
corpus=''.join(p.read_text() for p in [ROOT/'src/11p_layoutsB.js',*sorted((ROOT/'dev/avoidance').glob('layouts-b-*.js')),*sorted((ROOT/'dev/avoidance').glob('layouts-b-*.cjs'))])
# Broad superset to avoid accidental system fallback; actual emitted glyphs are audited separately.
requested=set(range(32,127))|set(range(0x3041,0x3097))|set(range(0x30a0,0x3100))|{ord(c) for c in corpus if ord(c)>=128 and not c.isspace()}
requested|={ord(c) for c in '風の先へ進もう風風いつか夢に届く遠い光を追いかけて空を越えて行こう。ゃっ「」（）ＡABC123♡!!▸／・×→―…'}
specs=[('sans-regular','Noto Sans CJK JP Regular',400,'NotoSansCJK-Regular.ttc',0),('sans-bold','Noto Sans CJK JP Bold',700,'NotoSansCJK-Bold.ttc',0),('serif-regular','Noto Serif CJK JP Regular',400,'NotoSerifCJK-Regular.ttc',0),('serif-bold','Noto Serif CJK JP Bold',700,'NotoSerifCJK-Bold.ttc',0),('mono','Noto Sans Mono CJK JP Regular',400,'NotoSansCJK-Regular.ttc',5)]
faces=[]
def build(id,label,weight,path,index=None,provenance=None):
    raw=path.read_bytes();f=TTFont(path,fontNumber=index if index is not None else -1,recalcTimestamp=False)
    family=next(n.toUnicode() for n in f['name'].names if n.nameID==1)
    cmap=set(f.getBestCmap());wanted=requested&cmap
    options=subset.Options();options.recalc_timestamp=False;options.layout_features=['*'];options.name_IDs=['*'];options.name_legacy=True;options.notdef_outline=True
    sub=subset.Subsetter(options=options);sub.populate(unicodes=wanted);sub.subset(f)
    suffix='.otf' if 'CFF ' in f else '.ttf';name=id+suffix;f.save(OUT/name);data=(OUT/name).read_bytes();actual=sorted(f.getBestCmap())
    faces.append({'id':id,'label':label,'family':'Avoid007-'+id,'weight':weight,'style':'normal','url':'fonts/'+name,'file':name,'sourceSHA256':sha(data),'originalSourceSHA256':sha(raw),'originalFamily':family,'collectionIndex':index,'cmapSHA256':sha(json.dumps(actual,separators=(',',':')).encode()),'codepoints':actual,'requestedMissing':sorted(requested-set(actual)),'provenance':provenance or {'localPath':str(path),'packageCopyright':'fonts-noto-symbols-copyright.txt' if 'Symbols' in str(path) else 'fonts-noto-cjk-copyright.txt'}})
for id,label,weight,name,index in specs:build(id,label,weight,pathlib.Path('/usr/share/fonts/opentype/noto')/name,index)
for id,label,weight,directory,name in [('dot','DotGothic16 Regular',400,'dotgothic16','DotGothic16-Regular.ttf'),('rounded','M PLUS Rounded 1c ExtraBold',800,'mplusrounded1c','MPLUSRounded1c-ExtraBold.ttf')]:
    path,meta=remote(directory,name);build(id,label,weight,path,provenance=meta)
build('symbols','Noto Sans Symbols2 Regular',400,pathlib.Path('/usr/share/fonts/truetype/noto/NotoSansSymbols2-Regular.ttf'))
(OUT/'fonts-noto-cjk-copyright.txt').write_bytes(pathlib.Path('/usr/share/doc/fonts-noto-cjk/copyright').read_bytes())
(OUT/'fonts-noto-symbols-copyright.txt').write_bytes(pathlib.Path('/usr/share/doc/fonts-noto-core/copyright').read_bytes())
keys=re.findall(r'^  (\w+):\s*\{ label:',(ROOT/'src/02_fonts.js').read_text(),re.M)
assignments={k:'sans-bold' for k in keys}
for k in ['gothic_light','gothic_med','sansui']:assignments[k]='sans-regular'
for k in ['mincho','mincho_light','brush']:assignments[k]='serif-regular'
for k in ['mincho_black','mincho_bold','tokumin','shippori']:assignments[k]='serif-bold'
for k in ['round','kiwi']:assignments[k]='rounded'
assignments['dot']='dot';assignments['mono']='mono'
manifest={'version':1,'scope':'pinned six distinct JP faces plus mono and explicit symbol fallback; broad cmap subset, actual emitted glyph coverage/loaded/metrics audit pending','faces':faces,'assignments':assignments,'fallbackFamily':'Avoid007-symbols','specimenParams':{'main':'gothic_bold','fonts':['gothic_med','mincho_bold','mincho','round','dot'],'grid':'g3'},'requestedCodepoints':sorted(requested),'buildScriptSHA256':sha(pathlib.Path(__file__).read_bytes())}
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'faces':len(faces),'bytes':sum((OUT/f['file']).stat().st_size for f in faces),'requested':len(requested),'files':[f['file'] for f in faces]}))
