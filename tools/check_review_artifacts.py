#!/usr/bin/env python3
"""Reject newly introduced generated review media, without policing old history.

No size threshold is imposed. Paths are read NUL-delimited; staged blobs, rather
than working-tree files, are inspected. Incoming mode examines every new commit,
not just the final tree, so add-then-delete commits cannot hide an artifact.
"""
import argparse
import json
import subprocess
import sys

DEDICATED_ROOTS = (b'artifacts/review/', b'dist/review/')
REVIEW_ROOTS = (b'review/', b'tasks/evidence/')
MEDIA_SUFFIXES = {
    b'.png', b'.apng', b'.jpg', b'.jpeg', b'.gif', b'.webp', b'.avif', b'.bmp',
    b'.tif', b'.tiff', b'.mp4', b'.webm', b'.mov', b'.m4v', b'.mkv', b'.avi',
}
HTML_SUFFIXES = {b'.html', b'.htm'}
REVIEW_HTML_MARKER = b'<!-- JIZURA_REVIEW_ARTIFACT -->'


def git(*args):
    result = subprocess.run(['git', *args], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode:
        raise RuntimeError(result.stderr.decode('utf-8', 'replace').strip())
    return result.stdout


def commit(ref):
    if not ref or ref.startswith('-') or set(ref) == {'0'}:
        raise ValueError('A known nonzero commit base/head is required; zero/new-branch bases need an explicit reviewed base.')
    return git('rev-parse', '--verify', ref + '^{commit}').decode().strip()


def changed_paths(before, after=None):
    if before is None:
        return [p for p in git('diff-tree', '--root', '--no-commit-id', '-r', '--no-renames', '--name-only', '--diff-filter=ACMT', '-z', after, '--').split(b'\0') if p]
    args = ['diff', '--no-renames', '--name-only', '--diff-filter=ACMT', '-z']
    if after is None:
        args += ['--cached', before, '--']
    else:
        args += [before, after, '--']
    return [p for p in git(*args).split(b'\0') if p]


def tree_entries(ref):
    raw = git('ls-files', '--stage', '-z') if ref is None else git('ls-tree', '-r', '-z', ref)
    entries = {}
    for record in raw.split(b'\0'):
        if not record:
            continue
        metadata, name = record.split(b'\t', 1)
        fields = metadata.split()
        # Both ls-files --stage and ls-tree put the object ID second/third.
        if ref is None:
            mode, oid, stage = fields
            if stage != b'0':
                raise ValueError('Unmerged index cannot be checked safely.')
        else:
            mode, kind, oid = fields
            if kind != b'blob':
                continue
        entries[name] = oid.decode('ascii')
    return entries


def inspect(paths, entries, where):
    findings, warnings, total = [], [], 0
    for path in paths:
        if path not in entries:
            raise ValueError('Changed path has no stage-0 blob: ' + repr(path))
        oid = entries[path]
        size = int(git('cat-file', '-s', oid))
        total += size
        name = path.decode('utf-8', 'surrogateescape')
        row = {'path': name, 'blob': oid, 'bytes': size, 'where': where}
        suffix = b'.' + path.rsplit(b'/', 1)[-1].rsplit(b'.', 1)[-1].lower() if b'.' in path.rsplit(b'/', 1)[-1] else b''
        if path.startswith(DEDICATED_ROOTS) or path in tuple(r[:-1] for r in DEDICATED_ROOTS):
            findings.append({**row, 'reason': 'Dedicated generated-review root must not enter Git.'})
        elif path.startswith(REVIEW_ROOTS):
            if suffix in MEDIA_SUFFIXES:
                findings.append({**row, 'reason': 'New/changed/moved review image or video.'})
            elif suffix in HTML_SUFFIXES:
                if REVIEW_HTML_MARKER in git('cat-file', 'blob', oid):
                    findings.append({**row, 'reason': 'HTML explicitly marked as generated review artifact.'})
                else:
                    warnings.append({**row, 'reason': 'Ambiguous HTML: not blocked; distinguish source/fixture from generated viewing page.'})
    return findings, warnings, total


def run(args):
    report = {'mode': args.mode, 'rejected': [], 'warnings': [], 'commitsChecked': [],
              'changedBlobOccurrences': 0, 'changedBlobOccurrenceBytes': 0,
              'sizePolicy': 'Informational totals only; no agreed size limit.'}
    if args.mode == 'staged':
        head = commit('HEAD')
        batches = [('index', changed_paths(head), tree_entries(None))]
    else:
        base, head = commit(args.base), commit(args.head)
        if args.merge_base:
            report['requestedBase'] = base
            base = git('merge-base', base, head).decode().strip()
            if not base:
                raise ValueError('No common ancestor for PR comparison.')
        if subprocess.run(['git', 'merge-base', '--is-ancestor', base, head], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode:
            raise ValueError('Base is not an ancestor of head; supply a reviewed comparison base, do not silently skip history.')
        report.update(base=base, head=head)
        commits = git('rev-list', '--reverse', base + '..' + head).decode().splitlines()
        batches = []
        for current in commits:
            parents = git('rev-list', '--parents', '-n', '1', current).decode().split()[1:]
            # Every incoming reachable commit is checked. First-parent diff also
            # covers merge-resolution additions absent from the first parent.
            before = parents[0] if parents else None
            batches.append((current, changed_paths(before, current), tree_entries(current)))
        report['commitsChecked'] = commits
    for where, paths, entries in batches:
        bad, warnings, total = inspect(paths, entries, where)
        report['rejected'] += bad
        report['warnings'] += warnings
        report['changedBlobOccurrences'] += len(paths)
        report['changedBlobOccurrenceBytes'] += total
    report['status'] = 'REJECTED' if report['rejected'] else 'PASS'
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='mode', required=True)
    sub.add_parser('staged', help='Inspect stage-0 index additions/modifications against HEAD.')
    incoming = sub.add_parser('incoming', help='Inspect each commit reachable from head but not base.')
    incoming.add_argument('--base', required=True)
    incoming.add_argument('--head', default='HEAD')
    incoming.add_argument('--merge-base', action='store_true', help='For PRs: compare from the common ancestor of base and head.')
    args = parser.parse_args()
    try:
        report = run(args)
    except (RuntimeError, ValueError) as error:
        print(json.dumps({'status': 'ERROR', 'error': str(error)}, ensure_ascii=True))
        return 2
    print(json.dumps(report, ensure_ascii=True, indent=2))
    return 1 if report['rejected'] else 0


if __name__ == '__main__':
    sys.exit(main())
