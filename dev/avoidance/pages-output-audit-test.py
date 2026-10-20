#!/usr/bin/env python3
"""Small failure-injection tests for the publication gate; no real build required."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location('pages_audit', Path(__file__).with_name('pages-output-audit.py'))
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)


class AuditTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.source = Path(self.temp.name) / 'source'
        self.output = Path(self.temp.name) / 'output'
        self.source.mkdir()
        self.output.mkdir()
        (self.source / '_config.yml').write_text('exclude: []\n')
        self.bundle = 'review/AVOID-006/new'
        self.old = 'review/AVOID-005/old/sample.html'
        for url in AUDIT.MUTABLE | AUDIT.DOWNLOADS | {self.old}:
            self.put(url, b'fixture')
        shared = 'review/shared/image.png'
        self.put(shared, b'encoded PNG fixture')
        digest = AUDIT.fingerprint(self.source / shared)['sha256']
        self.put(self.bundle + '/manifest.json', json.dumps({
            'assets': {'../../shared/image.png': digest}}).encode())
        self.legacy = {self.old: AUDIT.fingerprint(self.source / self.old)['gitBlob']}

    def put(self, url, data):
        for base in (self.source, self.output):
            path = base / url
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)

    def run_audit(self):
        rows = []
        for path in self.source.rglob('*'):
            if path.is_file() and path.name != '_config.yml':
                digest = AUDIT.fingerprint(path)
                rows.append({'url': path.relative_to(self.source).as_posix(),
                             'bytes': digest['bytes'], 'sha256': digest['sha256']})
        return AUDIT.audit(self.source, self.output, {'inventory': rows},
                           self.legacy, self.bundle)

    def test_pass_with_shared_asset(self):
        self.assertTrue(self.run_audit()['passed'])

    def test_missing_old_asset_fails_even_if_removed_from_projection(self):
        for base in (self.source, self.output):
            (base / self.old).unlink()
        with self.assertRaisesRegex(ValueError, 'Old public URLs missing'):
            self.run_audit()

    def test_old_bytes_change_fails_even_with_matching_projection(self):
        self.put(self.old, b'changed')
        with self.assertRaisesRegex(ValueError, 'Old public bytes changed'):
            self.run_audit()

    def test_jekyll_transform_fails(self):
        (self.output / self.old).write_bytes(b'transformed')
        with self.assertRaisesRegex(ValueError, 'Jekyll changed'):
            self.run_audit()

    def test_missing_shared_asset_fails_even_if_removed_from_projection(self):
        for base in (self.source, self.output):
            (base / 'review/shared/image.png').unlink()
        with self.assertRaisesRegex(ValueError, 'Manifest/shared asset missing'):
            self.run_audit()

    def test_encoded_manifest_hash_change_fails(self):
        self.put('review/shared/image.png', b'wrong encoded bytes')
        with self.assertRaisesRegex(ValueError, 'Manifest encoded SHA mismatch'):
            self.run_audit()

    def test_unselected_unpublished_bundle_fails(self):
        self.put('review/AVOID-006/unselected/manifest.json', b'{"assets":{}}')
        with self.assertRaisesRegex(ValueError, 'Unselected unpublished review bundle'):
            self.run_audit()

    def test_extra_output_fails(self):
        (self.output / 'extra.txt').write_text('extra')
        with self.assertRaisesRegex(ValueError, 'extra.txt'):
            self.run_audit()

    def prepare_approved_doc(self):
        url = 'docs/VERIFICATION.md'
        self.put(url, b'old documentation')
        self.legacy[url] = AUDIT.fingerprint(self.source / url)['gitBlob']
        self.put(url, b'parent-reviewed documentation')
        row = AUDIT.fingerprint(self.source / url)
        return {url: {k: row[k] for k in ('bytes', 'sha256')}}

    def test_exact_approved_doc_update_passes_and_is_reported(self):
        approved = self.prepare_approved_doc()
        with patch.dict(AUDIT.APPROVED_PUBLIC_UPDATES, approved):
            result = self.run_audit()
        self.assertEqual([r['url'] for r in result['approvedPublicUpdates']], ['docs/VERIFICATION.md'])

    def test_changed_doc_after_approval_fails(self):
        approved = self.prepare_approved_doc()
        self.put('docs/VERIFICATION.md', b'different documentation')
        with patch.dict(AUDIT.APPROVED_PUBLIC_UPDATES, approved):
            with self.assertRaisesRegex(ValueError, 'Unapproved public bytes changed'):
                self.run_audit()

    def test_doc_approval_does_not_allow_old_review_changes(self):
        approved = self.prepare_approved_doc()
        self.put(self.old, b'changed old review bytes')
        with patch.dict(AUDIT.APPROVED_PUBLIC_UPDATES, approved):
            with self.assertRaisesRegex(ValueError, 'Old public bytes changed'):
                self.run_audit()

    def test_doc_approval_does_not_allow_other_doc_updates(self):
        approved = self.prepare_approved_doc()
        url = 'docs/OTHER.md'
        self.put(url, b'old other doc')
        self.legacy[url] = AUDIT.fingerprint(self.source / url)['gitBlob']
        self.put(url, b'new other doc')
        with patch.dict(AUDIT.APPROVED_PUBLIC_UPDATES, approved):
            with self.assertRaisesRegex(ValueError, 'Old public bytes changed'):
                self.run_audit()

    def test_nojekyll_fails(self):
        (self.source / '.nojekyll').touch()
        with self.assertRaisesRegex(ValueError, 'disables Jekyll'):
            self.run_audit()

    def test_single_blob_limit_fails(self):
        original = AUDIT.fingerprint
        def oversized(path):
            return {**original(path), 'bytes': 100 * 1024 * 1024}
        with patch.object(AUDIT, 'fingerprint', oversized):
            with self.assertRaisesRegex(ValueError, 'Blob >=100 MiB'):
                self.run_audit()

    def test_total_output_limit_fails(self):
        original = AUDIT.fingerprint
        def oversized_total(path):
            return {**original(path), 'bytes': 95 * 1024 * 1024}
        with patch.object(AUDIT, 'fingerprint', oversized_total):
            with self.assertRaisesRegex(ValueError, 'Pages output exceeds 1 GB'):
                self.run_audit()

    def test_historical_mutable_root_claim_is_reported(self):
        url = 'review/AVOID-005/old/manifest.json'
        self.put(url, json.dumps({'assets': {'../../../index.html': 'historical-sha'}}).encode())
        self.legacy[url] = AUDIT.fingerprint(self.source / url)['gitBlob']
        claims = self.run_audit()['historicalMutableRootClaims']
        self.assertEqual(claims[0]['historicalSHA256'], 'historical-sha')

    def test_new_bundle_root_claim_must_match_current(self):
        self.put(self.bundle + '/manifest.json', json.dumps({
            'assets': {'../../../index.html': 'stale-new-sha'}}).encode())
        with self.assertRaisesRegex(ValueError, 'Manifest encoded SHA mismatch'):
            self.run_audit()


if __name__ == '__main__':
    unittest.main()
