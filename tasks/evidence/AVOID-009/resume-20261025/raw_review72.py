"""Parent-executed raw-only billboard72 review. RAM-only, not yet persisted.
No renderer, build, Git, network, or output-file mutation. Import decoder functions
under a non-main name; never invoke the legacy decoder's fetch-capable main().
"""
import sys
sys.dont_write_bytecode = True
import argparse, collections, difflib, gzip, hashlib, importlib.util, json, math, struct, traceback
from fractions import Fraction as F
from pathlib import Path

ROOT = Path('/workspace/lyricfx.JIZURA')
PREFIX = '/dev/shm/avoid009-bulbs69-billboard72-'
CODEC = 'source69-root-and-metadata59-gzip-v2'
OBS_N = {0, 1, 9, 21, 33, 36, 45, 90, 180, 228, 240, 249}
KEYS = ('x0', 'y0', 'x1', 'y1')
CONTEXT = {}
COUNTS = collections.Counter()


def need(value, label, detail=None):
    if not value:
        raise AssertionError({'check': label, 'context': dict(CONTEXT), 'detail': detail})


def equal(a, b):
    """Exact decoded equality, retaining Float64 signed zero."""
    if isinstance(a, bool) or isinstance(b, bool):
        return type(a) is type(b) and a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return struct.pack('>d', a) == struct.pack('>d', b)
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(equal(a[k], b[k]) for k in a)
    if isinstance(a, list) and isinstance(b, list):
        return len(a) == len(b) and all(equal(x, y) for x, y in zip(a, b))
    return type(a) is type(b) and a == b


def number(value):
    need(isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value), 'finite Number')
    return F(value)


def bounds(points):
    return [min(p[0] for p in points), min(p[1] for p in points),
            max(p[0] for p in points), max(p[1] for p in points)]


def rectangle(args):
    x, y, w, h = map(number, args)
    return [min(x, x+w), min(y, y+h), max(x, x+w), max(y, y+h)]


def affine_box(local, matrix):
    a, b, c, d, e, f = map(number, matrix)
    x0, y0, x1, y1 = local
    q = bounds([(a*x+c*y+e, b*x+d*y+f)
                for x, y in [(x0,y0),(x1,y0),(x1,y1),(x0,y1)]])
    return [q[0]-2, q[1]-2, q[2]+2, q[3]+2]


def rational_support(paint, catalog):
    """Tight exact-dyadic enclosure under the declared font/AA foundation.
    Saved source48 nextafter intervals must contain this; equality is NOT required.
    Butt two-point strokes use width/2, never miterLimit/2.
    """
    p, state = paint, paint['state']
    need(p['role'] == 'primary' and p['owner'].startswith('billboard.'), 'all paints primary')
    need(state['filter'] == 'none' and not state['shadowBlur'] and not state['shadowOffsetX']
         and not state['shadowOffsetY'] and not state['dash'], 'bounded stock paint state')
    kind, args, pad = p['kind'], p['args'], F(0)
    if kind == 'fillText':
        need(len(args) == 3 and state['textAlign'] == 'center' and state['textBaseline'] == 'middle', 'stock glyph state')
        x, y = map(number, args[1:]); m = p['metrics']
        local = [x-number(m['actualBoundingBoxLeft']), y-number(m['actualBoundingBoxAscent']),
                 x+number(m['actualBoundingBoxRight']), y+number(m['actualBoundingBoxDescent'])]
        pad = F(1)
    elif kind in ('fillRect', 'strokeRect'):
        local = rectangle(args)
        if kind == 'strokeRect':
            pad = number(state['lineWidth'])*number(state['miterLimit'])/2
    else:
        need(kind in ('fill', 'stroke'), 'literal path kind', kind)
        path = p['path']
        need(path and all(equal(c['matrix'], p['matrix']) for c in path), 'actual path/paint matrices')
        if len(path) == 1 and path[0]['key'] == 'arc':
            need(kind == 'fill', 'lens circle fill')
            x, y, radius = map(number, path[0]['args'][:3])
            need(path[0]['args'][3] == 0 and path[0]['args'][4] == math.pi*2 and radius >= 0, 'full source lens circle')
            local = [x-radius, y-radius, x+radius, y+radius]
        else:
            need(all(c['key'] in ('moveTo', 'lineTo', 'closePath') for c in path), 'literal poly/line commands')
            points = [list(map(number, c['args'][:2])) for c in path if c['key'] != 'closePath']
            local = bounds(points)
            if kind == 'stroke':
                need(len(path) == 2 and state['lineCap'] == 'butt', 'two-point butt source stroke')
                pad = number(state['lineWidth'])/2
    local = [local[0]-pad, local[1]-pad, local[2]+pad, local[3]+pad]
    result = affine_box(local, p['matrix'])
    is_material = p['owner'].endswith('.cone') or p['owner'] == 'billboard.board.illumination'
    if is_material:
        own = catalog['sourceOwnClip']; clips = p['clips']
        need(len(clips) == 1 and own is not None, 'one original material clip')
        clip = clips[0]
        need(equal(clip['matrix'], own['matrix']) and len(clip['path']) == 1
             and clip['path'][0]['key'] == 'rect'
             and equal(clip['path'][0]['matrix'], own['matrix'])
             and equal(clip['path'][0]['args'], own['rectangle']), 'literal source rect clip/matrix')
        cb = affine_box(rectangle(own['rectangle']), own['matrix'])
        result = [max(result[0], cb[0]), max(result[1], cb[1]),
                  min(result[2], cb[2]), min(result[3], cb[3])]
    else:
        need(not p['clips'], 'no lyric/tag/structure clip')
    return result


def contains(outer, inner):
    return outer[0] <= inner[0] and outer[1] <= inner[1] and outer[2] >= inner[2] and outer[3] >= inner[3]


def independent_gate(saved, circle, width=960, height=540):
    cx, cy, radius = map(number, (circle['cx'], circle['cy'], circle['r']))
    radius += number(max(2, .005*min(width, height)))
    for row in saved:
        x0, y0, x1, y1 = map(number, (row['bounds'][k] for k in KEYS))
        if not (0 <= x0 <= x1 <= width and 0 <= y0 <= y1 <= height):
            return False
        dx, dy = max(x0-cx, F(0), cx-x1), max(y0-cy, F(0), cy-y1)
        if dx*dx+dy*dy <= radius*radius:
            return False
    return True


def inspect_supports(sample, saved):
    positive = [p for p in sample['paint'] if p['state']['alpha'] > 0]
    need(len(positive) == len(saved), 'all positive paint supports retained')
    for paint, support in zip(positive, saved):
        CONTEXT['owner'] = paint['owner']
        need(paint['owner'] == support['owner'], 'support owner/order')
        actual = [number(support['bounds'][k]) for k in KEYS]
        truth = rational_support(paint, sample['catalog'])
        need(contains(actual, truth), 'saved outward bounds contain exact Fraction envelope',
             {'saved': list(map(str, actual)), 'Fraction': list(map(str, truth))})
        need(support['sourceOwnClipOnly'] == bool(paint['clips']), 'clip support marker')
        COUNTS['supportEnclosures'] += 1
    CONTEXT.pop('owner', None)


def inspect_clock(catalog, own, n):
    lag = {'B': 1.6/24, 'A': .8/24, 'main': 0}[own['pass']]
    tp = max(0, n*(1/60)-lag)
    expected = {'lag': lag, 'tp': tp, 'lt': tp, 'ltb': tp+lag,
                'step': math.floor(tp/(1/24)+1e-6), 'active': True}
    need(all(equal(own[k], value) for k, value in expected.items()), 'independent selected pass clock')
    c, source = catalog['clock'], catalog['sourceInputs']
    need(all(equal(c[k], value) for k, value in {'t':tp,'lt':tp,'ltb':tp+lag,'step':expected['step']}.items()), 'catalog/own clocks')
    need(math.floor(c['realTime']/(1/60)+1e-6) == n, 'actual time belongs to saved state')
    clamp = lambda x: max(0, min(1, x))
    pin = clamp(tp/max(.01, source['inDur']))
    pout = clamp((tp-(source['dur']-source['outDur']))/source['outDur']) if source['outDur'] > 0 else 0
    need(equal(c['pIn'], pin) and equal(c['pOut'], pout), 'native entrance/exit clocks')
    need(len(catalog['lampStates']) == catalog['params']['lamps'], 'all source lamps')
    for i, lamp in enumerate(catalog['lampStates']):
        need(equal(lamp['t1'], .15+i*.12) and lamp['i'] == i
             and equal(lamp['lt'], tp) and equal(lamp['ltb'], tp+lag)
             and lamp['step'] == expected['step'], 'lamp source clock/ordinal')
        need(lamp['sourceConeThresholdMet'] == (lamp['on'] > .01)
             and lamp['sourceLensThresholdMet'] == (lamp['on'] > .5), 'source lamp thresholds')


def inspect_semantics(v):
    native, direct = v['native'], v['direct']; a, b = native['catalog'], direct['catalog']
    need(a['complete'] and b['complete'] and a['kind'] == b['kind'] == 'billboard-native-catalog', 'complete source catalogs')
    need(not a['independentDecorOwners'] and not b['independentDecorOwners'], 'no auxiliary ground exception')
    for key in ('clock', 'params', 'sourceInputs', 'lampStates', 'ownerCatalog'):
        need(equal(a[key], b[key]), 'source semantic equality:'+key)
    need(equal(a['root'], b['root']) and equal(a['environmentSize'], b['environmentSize'])
         and b['stage'] == [960,540], 'same actual full-stage source domain')
    need(''.join(a['text'].split()) == ''.join(b['text'].split()), 'complete normalized source text')
    words = lambda s: [p['args'][0] for p in s['paint'] if p['kind'].endswith('Text') and p['owner'] == 'billboard.lyric.main']
    need(words(native) == words(direct), 'all actual source glyph strings/order')
    skeleton = lambda sample: [(p['kind'],p['owner'],p['role'],p['state']['alpha'],p['state']['blend']) for p in sample['paint']]
    need(equal(skeleton(native),skeleton(direct)), 'all paint ownership/order/alpha/blend unchanged')
    need(equal([g['stops'] for g in native['gradients']],[g['stops'] for g in direct['gradients']]), 'all original gradient stops/alpha unchanged')
    need([(c['owner'], c['kind']) for c in a['sourceCalls']] == [(c['owner'], c['kind']) for c in b['sourceCalls']], 'source call ownership/order')
    for sample in (native, direct):
        g = sample['catalog']; calls = {c['owner']:c for c in g['sourceCalls']}
        need(all(c['role'] == 'primary' for c in g['sourceCalls']), 'all calls primary')
        need(all(p['role'] == 'primary' and p['owner'] in calls for p in sample['paint']), 'all paints owned by source calls')
        need(equal(g['groundY'], 540*.94), 'ground remains at original height')
        for i in (0,1):
            args = calls['billboard.structure.post.'+str(i)]['arguments']
            need(args[3] > 0 and equal(args[1], g['y0']+g['bh'])
                 and equal(args[3], g['groundY']-g['y0']-g['bh']), 'post connected to board and ground')
        need(equal(g['cwY'], g['y0']+g['bh']+g['bh']*.1)
             and g['cwY']+g['bh']*.025 < g['groundY'], 'positive connected catwalk clearance')
        need(equal(g['yb'], g['y0']+g['bh']+(g['groundY']-g['y0']-g['bh'])*.25)
             and equal(g['yb2'], g['groundY']-(g['groundY']-g['y0']-g['bh'])*.1), 'brace reconnection source formulas')
    need(equal(next(c['arguments'] for c in a['sourceCalls'] if c['owner']=='billboard.ground.line'),
               next(c['arguments'] for c in b['sourceCalls'] if c['owner']=='billboard.ground.line')), 'fixed primary ground arguments')
    ratio = b['mainSize']/a['mainSize']; quality = v['quality']
    need(equal(quality['ratio'], ratio) and ratio >= .7 and b['mainSize'] >= max(18,.035*540), 'independent readable fontsize/floor')
    need(abs(ratio-v['recipe']['fontRatio']) < 1e-12, 'explicit font stage')
    oldtags = [c['arguments'][0] for c in a['sourceCalls'] if c['owner'].startswith('billboard.tag.')]
    tags = [c['arguments'][0] for c in b['sourceCalls'] if c['owner'].startswith('billboard.tag.')]
    need(len(tags) == len(oldtags), 'all metadata retained')
    for old, new in zip(oldtags, tags):
        need(new['text'] == old['text'] and new['font'] == old['font']
             and new['size'] >= old['size']*.7 and new['size'] >= min(old['size'],max(12,.02*540)), 'metadata content/font/floor')
    need(quality['writingFieldPassed'] is True, 'producer writing field assertion recorded')
    inspect_clock(b, v['own'], int(v['n']))
    COUNTS['semanticTuples'] += 1


def expected_keys():
    return {(n, p) for n in range(250) for p, lag in [('B',1.6/24),('A',.8/24),('main',0)]
            if max(0, n*(1/60)-lag) < 4}


def add_union(groups, support, pass_id):
    key = (pass_id, support['owner']); b = support['bounds']
    if key not in groups:
        groups[key] = {'owner':support['owner'],'pass':pass_id,'members':0,'bounds':dict(b)}
    g = groups[key]; g['members'] += 1
    for k in ('x0','y0'): g['bounds'][k] = min(g['bounds'][k], b[k])
    for k in ('x1','y1'): g['bounds'][k] = max(g['bounds'][k], b[k])


def load_decoder(root):
    path = root/'tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py'
    spec = importlib.util.spec_from_file_location('billboard72_parent_decoder_NOT_MAIN', path)
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module


def walk(run, decoder):
    m = json.loads((run/'raw/manifest.json').read_text()); epoch = None; sequence = 0; tables = {}
    need(m['storageCodecRevision'] == CODEC, 'literal codec revision')
    total = 0
    for index, row in enumerate(m['records']):
        CONTEXT.update(run=run.name, record=index, phase=row['phase'])
        b = (run/'raw'/row['file']).read_bytes()
        need(len(b) == row['bytes'] and hashlib.sha256(b).hexdigest() == row['sha256'], 'literal gzip hash/length')
        raw = gzip.decompress(b); total += len(raw)
        need(len(raw) == row['JSONBytes'], 'inflated envelope length')
        q = json.loads(raw); need(q['storageCodecRevision'] == CODEC, 'envelope codec revision')
        if q['tableEpoch'] != epoch:
            epoch = q['tableEpoch']; sequence = 0; tables = {k:[] for k in ('matrix','paint','catalog')}
        need(q['sequence'] == sequence, 'epoch sequence'); sequence += 1
        for name, delta in q['tableDeltas'].items():
            for entry in delta:
                need(entry['id'] == len(tables[name]), 'exact table append id'); tables[name].append(entry['value'])
        value = decoder.restore(q['binding'], tables)
        need(value['phase'] == row['phase'], 'decoded phase')
        COUNTS['literalRecords'] += 1
        yield index, value
    need(total == m['serializedBytes'], 'complete serialized byte total')


def source_reuse(runs):
    modules = {n:(p/'frozen-inputs/overlay/src/11zc_billboard_native72.js').read_text() for n,p in runs.items()}
    need(modules['local02'] == modules['local03'], '02->03 product source unchanged')
    old = 'function render({renderer,env,trajectory}){const issued='
    new = "function render({renderer,env,trajectory}){if(trajectory.safety==='insufficient-space'){env.placementObservation?.({cut:env.cut.index,realTime:env.realTime,pass:env.pass,sourceAdapter:REV,safety:'excluded',reason:'insufficient-space',excluded:true,preflightPaint:[],supports:[]});return null;}const issued="
    expected = modules['local03'].replace(old,new).replace("needs:plan=>plan.cuts.some(c=>c.placementTrajectory?.sourceAdapter===REV)", "needs:plan=>plan.cuts.some(c=>c.placementTrajectory?.sourceAdapter===REV&&c.placementTrajectory.safety!=='insufficient-space')")
    need(expected == modules['local04'], '03->04 only insufficient render/needs change')
    expected = modules['local04'].replace("function prepare({renderer,ctx,plan,t,opt}){\n B.pristine(ctx);", "function prepare({renderer,ctx,plan,t,opt}){\n need(renderer.frame===frameSource&&A.layoutsDTransportKnown(renderer),'BILLBOARD72_SOURCE_DEPENDENCY');B.pristine(ctx);")
    need(expected == modules['local05'], '04->05 only actual renderer identity guard')
    base_paths = sorted(p.relative_to(runs['local02']/'frozen-inputs/base') for p in (runs['local02']/'frozen-inputs/base').rglob('*') if p.is_file())
    for relative in base_paths:
        b = (runs['local02']/'frozen-inputs/base'/relative).read_bytes()
        need(all((p/'frozen-inputs/base'/relative).read_bytes() == b for p in runs.values()), 'unchanged baseline input:'+str(relative))
    delta = (runs['local02']/'frozen-inputs/overlay-delta/source72.delta.patch').read_bytes()
    for name, run in runs.items():
        need((run/'frozen-inputs/overlay-delta/source72.delta.patch').read_bytes() == delta, 'unchanged source delta')
        need((run/'build/candidate/src/11zc_billboard_native72.js').read_text() == modules[name], 'built module is frozen module')
        manifest = json.loads((run/'frozen-inputs/overlay-delta/delta72-manifest.json').read_text())
        for row in manifest['files']:
            b = (run/'build/candidate'/row['path']).read_bytes()
            need(len(b) == row['bytes'] and hashlib.sha256(b).hexdigest() == row['sha256'], 'built exact source delta output')
    return {'moduleSHA256':{n:hashlib.sha256(s.encode()).hexdigest() for n,s in modules.items()},
            'baselineFilesByteEqual':len(base_paths),'deltaSHA256':hashlib.sha256(delta).hexdigest(),
            'onlyChanges':['02->03 harness provenance fix, product identical','03->04 insufficient exclusion','04->05 actual renderer guard']}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--repo', type=Path, default=ROOT)
    ap.add_argument('--prefix', default=PREFIX)
    args = ap.parse_args(); decoder = load_decoder(args.repo)
    runs = {name:Path(args.prefix+name) for name in ('local02','local03','local04','local05')}
    manifests = {n:json.loads((p/'raw/manifest.json').read_text()) for n,p in runs.items()}
    native_manifest_sha = hashlib.sha256((runs['local02']/'raw/manifest.json').read_bytes()).hexdigest()
    source = source_reuse(runs); nominal = {}; safe_certificate = None; phase_counts = {}; finalized_counts = collections.Counter(); atomic = {}; attempts = []
    expected = expected_keys(); need(len(expected) == 727, 'independent expected active key count')
    for name, run in runs.items():
        pending = []; groups = {}; recipe_keys = collections.defaultdict(set); recipe_paints = collections.Counter(); recipe_nominal = {}; attempts = []; phase_counts[name] = collections.Counter(); last_state = None
        for index, v in walk(run, decoder):
            phase = v['phase']; phase_counts[name][phase] += 1
            if phase in ('native-zero','native-nonidentity-context'):
                for key in ('pixelSHA256','root','bb','traceCore','paintCore','gradients','clips','rng'):
                    need(equal(v['before'][key],v['off'][key]) and equal(v['before'][key],v['on'][key]), 'native zero exact:'+key)
                COUNTS['nativeExactTuples'] += 1
            elif phase == 'native-reference':
                need(v['reference']['sha256'] == native_manifest_sha and v['reference']['native'] == 58 and not v['reference']['priorWholeRunPassed'], 'truthful native reuse')
            elif phase == 'tuple':
                CONTEXT.update(n=int(v['n']), recipe=v['recipe']['id']); inspect_semantics(v); inspect_supports(v['direct'], v['supports'])
                rid, key = v['recipe']['id'], (int(v['n']),v['own']['pass'])
                need(key not in recipe_keys[rid], 'unique candidate clock key'); recipe_keys[rid].add(key)
                recipe_paints[rid] += len(v['direct']['paint'])
                g = groups.setdefault(rid,{})
                for s in v['supports']: add_union(g,s,v['own']['pass'])
                if key[0] in OBS_N: recipe_nominal[(rid,key)] = v
                pending.append({'record':index,'recipe':rid,'key':key,'supports':v['supports'],'clear':v['clear']})
            elif phase == 'attempt': attempts.append(v['attempt'])
            elif phase == 'finalized':
                cut = v['plan']['cuts'][0]; tr = cut.get('placementTrajectory'); diags = v['plan'].get('placementFinalization',{}).get('diagnostics',[])
                if not isinstance(tr,dict):
                    need(not pending and not attempts and any(d.get('code') == 'BILLBOARD72_FIXED_FAMILY' and d.get('safety') == 'unsupported' for d in diags), 'typed unsupported without trajectory is normal, never safe')
                    last_state = 'unsupported'; finalized_counts['unsupportedNoTrajectory'] += 1
                else:
                    cert = tr['certificate']; circle = cert['region']['circle']
                    need(equal(cert['attempts'], attempts), 'all candidate attempts retained')
                    for q in pending:
                        CONTEXT.update(record=q['record'],n=q['key'][0],recipe=q['recipe'])
                        need(independent_gate(q['supports'],circle) == q['clear'], 'independent Fraction stage/circle equals saved decision')
                        COUNTS['tupleStageCircleDecisions'] += 1
                    if tr['safety'] == 'certified-bounded-adapter':
                        rid = cert['recipe']['id']; need(cert['clockCounts'] == {'states':250,'selectedPasses':727}, '250 total clock states')
                        if pending:
                            need(recipe_keys[rid] == expected, 'all727 selected pass keys and five empty states accounted')
                            actual = {(x['pass'],x['owner']):x for x in cert['supportUnions']}
                            need(equal(actual,groups[rid]), 'winner owner unions full values/membership counts')
                            need(all(q['clear'] for q in pending if q['recipe'] == rid), 'winner all primary supports clear')
                            need(recipe_paints[rid] == 13579, 'winner complete paint count')
                            nominal = {key:value for (recipe,key),value in recipe_nominal.items() if recipe == rid}
                            safe_certificate = cert; COUNTS['winnerPasses'] = len(recipe_keys[rid]); COUNTS['winnerPaints'] = recipe_paints[rid]; COUNTS['winnerOwnerUnions'] = len(actual)
                        else:
                            need(name == 'local05' and safe_certificate is not None, 'only focused local05 reuses tuple raw')
                            for key in ('recipe','region','clockCounts','attempts','supportUnions'):
                                need(equal(cert[key],safe_certificate[key]), 'focused recomputed certificate exact:'+key)
                        last_state = 'safe'; finalized_counts['safe'] += 1
                    else:
                        need(tr['safety'] == 'insufficient-space' and cert['recipe'] is None and cert['supportUnions'] is None, 'honest insufficient certificate')
                        need(pending and not any(a['status'] == 'safe' for a in attempts), 'all insufficient candidate attempts rejected')
                        need(all(s['status']=='insufficient-space' and s['decision']=='excluded-during-avoidance' for u in tr['units'] for s in u['segments']), 'insufficient exclusion decision')
                        last_state = 'insufficient'; finalized_counts['insufficient'] += 1
                pending = []; groups = {}; recipe_keys = collections.defaultdict(set); recipe_paints = collections.Counter(); recipe_nominal = {}; attempts = []
            elif phase == 'product-frame':
                need(name == 'local03', 'actual frame cohort'); n = int(v['n']); active = {p for nn,p in expected if nn == n}
                need({o['pass'] for o in v['observations']} == active and len(v['observations']) == len(active), 'actual selected pass observations')
                need(len(v['sha']) == 64 and all(c in '0123456789abcdef' for c in v['sha']), 'actual frame RGBA digest recorded')
                for o in v['observations']:
                    q = nominal[(n,o['pass'])]; d = q['direct']
                    need(o['safety']=='safe' and equal(o['root'],d['root']) and equal(o['catalog'],d['catalog'])
                         and equal(o['preflightPaint'],d['paint']) and equal(o['supports'],q['supports']) and equal(o['quality'],q['quality']), 'actual observation/full nominal tuple correspondence')
                    need(equal(o['realTime'],v['time']) and equal(o['realTime'],d['catalog']['clock']['realTime']), 'actual observation query time')
                    COUNTS['actualObservationPairs'] += 1
                COUNTS['actualFrames'] += 1
            elif phase == 'negative-before-bitmap':
                codes = {'helper':'BILLBOARD72_SOURCE_DEPENDENCY','fontrevision':'STALE_PLACEMENT_PLAN','scale':'BILLBOARD72_FRAME_OPTIONS','filter':'TILES48_CONTEXT_EFFECT','nonidentity-root':'BILLBOARD72_PRISTINE_ROOT'}
                need(len(v['out']) == 5 and {x['name'] for x in v['out']} == set(codes), 'five atomic cases')
                for x in v['out']:
                    need(x['error']['code'] == codes[x['name']] and x['bitmapUnchanged'] and x['paintBeforeReject'] is False, 'atomic specific rejection and bitmap unchanged')
                    atomic[x['name']] = x['error']['code']
            elif phase == 'actual-renderer-instance-before-bitmap':
                need(name=='local05' and v['error']['code']=='BILLBOARD72_SOURCE_DEPENDENCY' and v['bitmapUnchanged'] and v['preBitmapSourceOrder'] and v['validFinalizedPlan'], 'actual instance atomic rejection')
                atomic['actual-renderer-instance'] = v['error']['code']
            elif phase == 'insufficient-ground-render-excluded':
                need(name=='local04' and last_state=='insufficient' and v['bitmapEqualsNativeBackground'] and len(v['observations'])==3, 'ground exclusion background exact')
                need({o['pass'] for o in v['observations']} == {'B','A','main'} and all(o['excluded'] and o['safety']=='excluded' and not o['preflightPaint'] and not o['supports'] for o in v['observations']), 'all primary excluded, no new mask')
                COUNTS['groundExcludedFrames'] += 1
            elif phase == 'typed-unsupported':
                need(last_state=='unsupported' and not v['result']['accepted'] and any(d['code']=='BILLBOARD72_FIXED_FAMILY' for d in v['result']['diagnostics']), 'typed unsupported summary never accepted')
            elif phase == 'ground-insufficient': need(last_state=='insufficient' and not v['result']['accepted'], 'ground summary honest')
            elif phase == 'default-result': need(last_state=='safe' and v['final']['accepted'], 'default accepted summary')
            elif phase == 'focused-safe-proof-reuse':
                need(name=='local05' and v['reference']['manifestSHA256']==hashlib.sha256((runs['local03']/'raw/manifest.json').read_bytes()).hexdigest() and v['reference']['productFinalizationRecomputed'] and not v['reference']['allTuplesResaved'], 'focused reuse scope truth')
            elif phase == 'otherD-controls':
                need(equal(v['before'],v['after']) and {x['layout'] for x in v['before']} == {'tiles','bulbs','magnets'}, 'otherD exact controls')
                COUNTS['otherDControls'] = 3
        need(not pending and not attempts, 'no unfinalized tuple block')
    need(COUNTS['literalRecords']==1054 and COUNTS['nativeExactTuples']==58 and COUNTS['winnerPasses']==727
         and COUNTS['actualFrames']==12 and len(atomic)==6 and COUNTS['groundExcludedFrames']==1, 'required cohorts complete')
    need(finalized_counts == {'safe':2,'insufficient':2,'unsupportedNoTrajectory':1}, 'finalization outcomes retain typed unsupported')
    result = {'kind':'parent-executed-billboard72-raw-review','complete':True,'counts':dict(COUNTS),'finalized':dict(finalized_counts),
              'phases':{n:dict(c) for n,c in phase_counts.items()},'atomic':atomic,'sourceReuse':source,
              'clockStates':250,'activeClockStates':len({n for n,p in expected}),'emptyClockStates':sorted(set(range(250))-{n for n,p in expected}),
              'supportPredicate':'saved outward lower<=tight exact Fraction lower; saved upper>=tight exact Fraction upper; no tight equality assertion',
              'foundation':'conditional actual TextMetrics +1fontpx; primitive path/butt-width/2 and actual CTM; +2devicepx; original cone/illumination rect clip only',
              'actualFrameLimit':'Full preflight observation/tuple correspondence plus recorded actual RGBA hashes; not a new independent candidate RGBA oracle.',
              'formalPerformanceAccepted':False,'all009Complete':False,'rendererExecutions':0,'networkActions':0,'GitActions':0,'ROOTWrites':0,
              'utilityPersistence':'RAM_ONLY_NOT_PERSISTED','humanMotionReview':'not performed','imagesViewed':0}
    print(json.dumps(result,ensure_ascii=False,indent=2))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(json.dumps({'complete':False,'error':str(error),'context':CONTEXT,'counts':dict(COUNTS),'traceback':traceback.format_exc(),'rendererExecutions':0,'networkActions':0,'ROOTWrites':0},ensure_ascii=False,indent=2))
        raise SystemExit(1)
