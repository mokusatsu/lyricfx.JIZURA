"""Independent checks of final dictionary result numbers and actual font cmaps."""
from pathlib import Path
from fontTools.ttLib import TTFont
import hashlib, json
root = Path(__file__).resolve().parents[5]
here = Path(__file__).resolve().parent
result = here/'dictionary01/results.json'
r = json.loads(result.read_text())
fontdir = root/'dev/avoidance/layouts-c-editorial-fonts'
m = json.loads((fontdir/'manifest.json').read_text())
actual = {f['id']:set(TTFont(fontdir/f['file']).getBestCmap()) for f in m['faces']}
assert len(actual)==8
for f in m['faces']:
    assert actual[f['id']]==set(f['codepoints'])
    assert hashlib.sha256((fontdir/f['file']).read_bytes()).hexdigest()==f['sourceSHA256']
fields=columns=occurrences=glyphs=0
for row in r['rows']:
    for f in row['printFields']:
        ink,field=f['recordedPreclipInk'],f['field']
        assert ink['x0']>=field['x0']-1e-7 and ink['y0']>=field['y0']-1e-7 and ink['x1']<=field['x1']+1e-7 and ink['y1']<=field['y1']+1e-7
        fields+=1
    for glyph in row['corpus']:
        assert ord(glyph['char']) in actual[glyph['face']]
        glyphs+=1
    proof=row.get('proof')
    if not proof: continue
    columns+=1
    main=proof['headword'];source=row['spec']['text'].strip()
    assert main['sourceText']==source and main['renderedText'].replace('\n','')==source
    def check_ranges(ranges,total):
        at=0
        for lo,hi in ranges:
            assert lo==at and hi>lo and hi<=total
            at=hi
        assert at==total
    check_ranges(main['fragmentRanges'],len(source))
    native=row['nativeCopy']['groups'];logical=proof['logicalOccurrences']
    assert len(native)==len(logical)
    for n,g in zip(native,logical):
        assert all(n[k]==g[k] for k in ['owner','occurrence','font','clock','text','total'])
        assert g['total']==len(g['text'])
        check_ranges(g['fragmentRanges'],g['total'])
        occurrences+=1
assert len(r['rows'])==22 and len(r['negatives'])==22 and len(r['wordGapNegatives'])==2
assert all(x['injected']>0 and all(a['status']=='rejected' for a in x['attempts'])for x in r['negatives'])
assert all(x['injected']>0 and x['safety']!='certified-hold-adapter'for x in r['wordGapNegatives'])
assert len(r['sourceClockParity'])==38 and all(x['native']==x['column']for x in r['sourceClockParity'])
assert r['passed'] and not r['changed']
out={'runnerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'resultSHA256':hashlib.sha256(result.read_bytes()).hexdigest(),'actualCmaps':8,'glyphAssignments':glyphs,'independentlyContainedPrintFields':fields,'exactLogicalColumns':columns,'metadataOccurrencesWithExactTextFontClockAndCoveringRanges':occurrences,'structuralNegatives':22,'wordGapNegatives':2,'sourceOpacityClockParity':38,'passed':True}
p=here/'dictionary-independent-review01.json';assert not p.exists();p.write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
