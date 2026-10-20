#!/usr/bin/env python3
"""Audit real Jekyll output against an explicit source snapshot and projection.

No builds, staging, network operations or repository writes are performed.
Projection format: {"inventory": [{"url": ..., "bytes": ..., "sha256": ...}]}.
Pass --repo for the original checkout when --source is an isolated snapshot.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import posixpath
import subprocess


EXCLUDED = {'.agents', '.github', '.git', '.gitignore', '.nojekyll',
            '_config.yml', 'work', 'scratch', 'src', 'dev', 'app', 'tasks',
            'tools', 'build.py', 'build_ae.py', 'build_cep.py', 'preview_server.py'}
MUTABLE = {'index.html', 'en/index.html', 'id/index.html', 'ko/index.html',
           'zh-hans/index.html', 'zh-hant/index.html'}
DOWNLOADS = {'JIZURA_AE.jsx', 'JIZURA_AE_en.jsx', 'JIZURA_CEP.zip',
             'JIZURA_CEP_en.zip', 'muscle_lofi_optimized.jizuraichi'}
# Jekyll's default dotfile omission; this development ignore file has no runtime role.
NONFUNCTIONAL_OMISSIONS = {'mcp/.gitignore'}
# Parent-reviewed AVOID-006 documentation update; no other public byte exception.
APPROVED_PUBLIC_UPDATES = {
    'docs/VERIFICATION.md': {'bytes': 23624,
        'sha256': '4317946f6ff4e2da12b059e9458b34a297e19f1f2a40331ac27246197bdeeeef'},
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def url_path(url):
    require(isinstance(url, str) and url and not url.startswith('/') and
            '\\' not in url and posixpath.normpath(url) == url and
            '..' not in url.split('/'), 'Unsafe projection URL: ' + str(url))
    return url


def fingerprint(path):
    require(path.is_file() and path.resolve() == path.absolute(),
            'Missing file or symlink: ' + str(path))
    size = path.stat().st_size
    sha = hashlib.sha256()
    blob = hashlib.sha1(('blob ' + str(size) + '\0').encode())
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            sha.update(chunk)
            blob.update(chunk)
    return {'bytes': size, 'sha256': sha.hexdigest(), 'gitBlob': blob.hexdigest()}


def old_public_blobs(repo, ref):
    raw = subprocess.check_output(['git', '-C', str(repo), 'ls-tree', '-rz', ref])
    result = {}
    for record in raw.split(b'\0'):
        if not record:
            continue
        meta, name = record.split(b'\t', 1)
        mode, kind, oid = meta.decode().split()
        url = name.decode('utf-8')
        if url.split('/')[0] in EXCLUDED or url in NONFUNCTIONAL_OMISSIONS:
            continue
        require(mode in ('100644', '100755') and kind == 'blob',
                'Unsupported public Git entry: ' + url)
        result[url] = oid
    return result


def audit(source, output, projection, legacy, candidate_bundle):
    require((source / '_config.yml').is_file(), 'Source snapshot lacks _config.yml')
    require(not (source / '.nojekyll').exists(), 'Source still disables Jekyll')
    expected = {}
    for row in projection['inventory']:
        url = url_path(row['url'])
        require(url not in expected, 'Duplicate projected URL: ' + url)
        expected[url] = {'bytes': row['bytes'], 'sha256': row['sha256']}
    actual_urls = set()
    for root, dirs, files in os.walk(output, followlinks=False):
        for name in dirs:
            require(not (Path(root) / name).is_symlink(), 'Output directory symlink')
        for name in files:
            actual_urls.add((Path(root) / name).relative_to(output).as_posix())
    require(actual_urls == set(expected), json.dumps({
        'missing': sorted(set(expected) - actual_urls),
        'extra': sorted(actual_urls - set(expected))}))
    require(set(legacy) <= set(expected), 'Old public URLs missing: ' +
            str(sorted(set(legacy) - set(expected))))
    require(MUTABLE | DOWNLOADS <= set(expected), 'Application/download URL missing')
    candidate_bundle = url_path(candidate_bundle).rstrip('/') + '/'
    require(candidate_bundle.startswith('review/'), 'Candidate must be under review/')
    require(candidate_bundle + 'manifest.json' in expected, 'Candidate manifest missing')
    actual = {}
    approved_updates = []
    for url, row in expected.items():
        src = fingerprint(source / url)
        out = fingerprint(output / url)
        require({k: src[k] for k in row} == row, 'Stale source projection: ' + url)
        require(src == out, 'Jekyll changed encoded source bytes: ' + url)
        require(out['bytes'] < 100 * 1024 * 1024, 'Blob >=100 MiB: ' + url)
        if url in legacy and url not in MUTABLE:
            if url in APPROVED_PUBLIC_UPDATES:
                approved = APPROVED_PUBLIC_UPDATES[url]
                require({k: out[k] for k in approved} == approved,
                        'Unapproved public bytes changed: ' + url)
                approved_updates.append({'url': url, 'baselineGitBlob': legacy[url], **approved})
            else:
                require(out['gitBlob'] == legacy[url], 'Old public bytes changed: ' + url)
        actual[url] = out
    total = sum(row['bytes'] for row in actual.values())
    require(total <= 1_000_000_000, 'Pages output exceeds 1 GB: ' + str(total))
    historical = []
    manifest_count = asset_count = 0
    referenced = set()
    for url in sorted(actual):
        if not (url.startswith('review/') and url.endswith('/manifest.json')):
            continue
        manifest_count += 1
        require(url in legacy or url.startswith(candidate_bundle),
                'Unselected unpublished review bundle: ' + url)
        manifest = json.loads((source / url).read_text(encoding='utf-8'))
        require(isinstance(manifest.get('assets'), dict), 'Unsupported assets: ' + url)
        for relative, sha in manifest['assets'].items():
            require(not relative.startswith('/') and '\\' not in relative,
                    'Unsafe manifest asset: ' + relative)
            target = url_path(posixpath.normpath(posixpath.join(posixpath.dirname(url), relative)))
            require(target in actual, 'Manifest/shared asset missing: ' + target)
            referenced.add(target)
            if target in MUTABLE and url in legacy:
                historical.append({'manifest': url, 'url': target, 'historicalSHA256': sha,
                                   'currentSHA256': actual[target]['sha256']})
            else:
                require(actual[target]['sha256'] == sha, 'Manifest encoded SHA mismatch: ' + target)
            asset_count += 1
    for url in actual:
        if url.startswith('review/') and url not in legacy and not url.startswith(candidate_bundle):
            require(url in referenced, 'Unselected unpublished review asset: ' + url)
    return {'passed': True, 'actualJekyllOutput': True, 'allProjectedURLs': len(actual),
            'legacyPublicURLs': len(legacy), 'manifestCount': manifest_count,
            'manifestAssets': asset_count, 'siteBytes': total,
            'nonfunctionalOmissions': sorted(NONFUNCTIONAL_OMISSIONS),
            'approvedPublicUpdates': approved_updates,
            'historicalMutableRootClaims': historical,
            'inventory': [{'url': url, **actual[url]} for url in sorted(actual)]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--projection', type=Path, required=True)
    parser.add_argument('--repo', type=Path, default=Path('.'))
    parser.add_argument('--baseline-ref', default='HEAD')
    parser.add_argument('--candidate-bundle', required=True,
                        help='Selected new bundle path, e.g. review/AVOID-006/local-20261020-04')
    parser.add_argument('--report', type=Path, required=True)
    args = parser.parse_args()
    try:
        baseline = subprocess.check_output(['git', '-C', str(args.repo), 'rev-parse',
                                            '--verify', args.baseline_ref + '^{commit}'],
                                           text=True).strip()
        result = audit(args.source.absolute(), args.output.absolute(),
                       json.loads(args.projection.read_text()),
                       old_public_blobs(args.repo, baseline), args.candidate_bundle)
        result.update({'baselineCommit': baseline, 'candidateBundle': args.candidate_bundle,
                       'source': str(args.source.absolute()), 'output': str(args.output.absolute()),
                       'projectionSHA256': fingerprint(args.projection.absolute())['sha256'],
                       'configSHA256': fingerprint(args.source.absolute() / '_config.yml')['sha256']})
    except (ValueError, OSError, KeyError, TypeError, subprocess.CalledProcessError) as error:
        args.report.write_text(json.dumps({'passed': False, 'error': str(error)}, indent=2) + '\n')
        parser.exit(1, 'Pages output audit FAILED: ' + str(error) + '\n')
    args.report.write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps({k: v for k, v in result.items()
                      if k not in ('inventory', 'historicalMutableRootClaims')}))


if __name__ == '__main__':
    main()
