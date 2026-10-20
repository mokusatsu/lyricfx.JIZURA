import hashlib, importlib.util, json, os, pathlib, shutil, subprocess
repo = pathlib.Path.cwd()
candidate = os.environ['PAGES006_CANDIDATE']
run = pathlib.Path(os.environ['PAGES006_RUN'])
assert 'REPLACE_' not in candidate and 'REPLACE_' not in str(run)
assert run.is_absolute() and not run.exists(), 'Use a new isolated destination'
spec = importlib.util.spec_from_file_location('audit', repo/'dev/avoidance/pages-output-audit.py')
audit = importlib.util.module_from_spec(spec); spec.loader.exec_module(audit)
audit.url_path(candidate)
baseline = subprocess.check_output(['git','rev-parse','--verify',os.environ['PAGES006_BASELINE']+'^{commit}'], text=True).strip()
baseline_blobs = {}
for record in subprocess.check_output(['git','ls-tree','-rz',baseline]).split(b'\0'):
    if record:
        meta, name = record.split(b'\t', 1)
        baseline_blobs[name.decode('utf-8')] = meta.decode().split()[2]
raw = subprocess.check_output(['git','ls-files','--stage','-z'])
entries = []
for record in raw.split(b'\0'):
    if not record: continue
    meta, name = record.split(b'\t', 1)
    mode, oid, stage = meta.decode().split(); url = name.decode('utf-8')
    assert stage == '0' and mode in ('100644','100755'), ('Conflict/symlink/submodule', url)
    assert 'node_modules' not in url.split('/'), ('Do not stage dependencies', url)
    if url.startswith(('work/', 'scratch/')):
        assert baseline_blobs.get(url) == oid and url.split('/')[0] in audit.EXCLUDED, ('New/changed staged scratch/work file', url)
    if '__pycache__' in url.split('/') or url.endswith(('.pyc','.pyo')):
        assert baseline_blobs.get(url) == oid, ('New/changed staged bytecode', url)
        assert url.split('/')[0] in audit.EXCLUDED, ('Bytecode must stay outside publication', url)
    assert not any(url.startswith('review/AVOID-006/local-20261020-'+n+'/') for n in ('01','02','03')), ('Unpublished prototype staged', url)
    assert url != '.nojekyll', 'Final index must remove root .nojekyll'
    entries.append((url,oid))
assert '_config.yml' in dict(entries), 'Stage the reviewed root config first'
assert candidate+'/manifest.json' in dict(entries), 'Final bundle not in index'
run.mkdir(); source = run/'source'; source.mkdir(); (run/'output').mkdir()
(run/'index-stage.z').write_bytes(raw)
(run/'index-stage.sha256').write_text(hashlib.sha256(raw).hexdigest()+'\n')
rows = []
for url, oid in entries:
    if url != '_config.yml' and (url.split('/')[0] in audit.EXCLUDED or url in audit.NONFUNCTIONAL_OMISSIONS):
        continue
    audit.url_path(url)
    target = source/url; target.parent.mkdir(parents=True, exist_ok=True)
    with target.open('wb') as dest:
        process = subprocess.Popen(['git','cat-file','blob',oid], stdout=subprocess.PIPE)
        shutil.copyfileobj(process.stdout, dest, 1024*1024)
        process.stdout.close(); assert process.wait() == 0, url
    digest = audit.fingerprint(target)
    assert digest['gitBlob'] == oid and digest['bytes'] < 100*1024*1024, url
    if url != '_config.yml': rows.append({'url':url,'bytes':digest['bytes'],'sha256':digest['sha256']})
assert (source/'_config.yml').read_bytes() == (repo/'_config.yml').read_bytes(), 'Index config differs from reviewed worktree'
legacy = audit.old_public_blobs(repo, baseline)
assert set(legacy) <= {row['url'] for row in rows}, 'Old public asset missing from final index'
projection = {'scope':'final index snapshot; Jekyll not yet executed', 'baselineCommit':baseline, 'inventory':sorted(rows,key=lambda r:r['url'])}
(run/'projection.json').write_text(json.dumps(projection,indent=2)+'\n')
print(json.dumps({'source':str(source),'urls':len(rows),'projectedBytes':sum(r['bytes'] for r in rows)}))
