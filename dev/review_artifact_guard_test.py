"""Isolated temporary Git histories: never stages or commits the product repo."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

GUARD = Path(__file__).resolve().parents[1] / 'tools/check_review_artifacts.py'
IGNORE = Path(__file__).resolve().parents[1] / '.gitignore'


class GuardTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='jizura-media-guard-')
        self.root = Path(self.temp.name)
        self.git('init', '-q')
        self.git('config', 'user.email', 'guard-test@example.invalid')
        self.git('config', 'user.name', 'Local guard test')
        self.write('.gitignore', IGNORE.read_bytes())
        self.write('review/old.png', b'existing fixed asset')
        self.write('README.md', b'base')
        self.git('add', '.')
        self.git('commit', '-qm', 'base fixtures')
        self.base = self.git('rev-parse', 'HEAD').strip()

    def tearDown(self):
        self.temp.cleanup()

    def git(self, *args):
        return subprocess.check_output(['git', *args], cwd=self.root, stderr=subprocess.STDOUT).decode()

    def write(self, path, data=b'media'):
        file = self.root / path
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_bytes(data)

    def check(self, code, *args):
        result = subprocess.run([sys.executable, str(GUARD), *args], cwd=self.root, capture_output=True)
        self.assertEqual(result.returncode, code, result.stdout.decode() + result.stderr.decode())
        return json.loads(result.stdout)

    def test_case_space_unicode_media_and_force_add(self):
        names = ['review/空 白.PNG', 'tasks/evidence/new.MP4', 'review/new.WeBm', 'review/new.jpg', 'review/line\nbreak.PNG']
        for name in names:
            self.write(name)
        self.git('add', '-f', '--', *names)
        report = self.check(1, 'staged')
        self.assertEqual({r['path'] for r in report['rejected']}, set(names))

    def test_dedicated_roots_ignore_and_force_add_any_format(self):
        names = ['artifacts/review/report.json', 'dist/review/extensionless']
        for name in names:
            self.write(name)
            self.git('check-ignore', name)
        self.git('add', '-f', '--', *names)
        self.assertEqual(len(self.check(1, 'staged')['rejected']), 2)

    def test_unchanged_existing_product_fixture_source_and_cep_zip(self):
        names = ['assets/product.PNG', 'dev/fixtures/video.WEBM', 'dev/fixtures/source.html',
                 'src/example.js', 'tasks/evidence/new/data.json', 'tasks/evidence/new/raw.csv',
                 'JIZURA_CEP.zip', 'JIZURA_CEP_en.zip']
        for name in names:
            self.write(name, b'<html>source fixture</html>' if name.endswith('.html') else b'needed')
        self.git('add', '-f', '--', *names)
        report = self.check(0, 'staged')
        self.assertEqual(report['rejected'], [])
        self.assertFalse(any(r['path'] == 'review/old.png' for r in report['warnings']))

    def test_changed_existing_media_rejected(self):
        self.write('review/old.png', b'new bytes')
        self.git('add', 'review/old.png')
        self.assertEqual(self.check(1, 'staged')['rejected'][0]['path'], 'review/old.png')

    def test_existing_blob_copied_or_renamed_not_exempt(self):
        self.write('tasks/evidence/copy.PNG', b'existing fixed asset')
        self.git('mv', 'review/old.png', 'review/renamed.png')
        self.git('add', 'tasks/evidence/copy.PNG')
        self.assertEqual(len(self.check(1, 'staged')['rejected']), 2)

    def test_index_blob_not_unstaged_worktree(self):
        name = 'review/page.html'
        self.write(name, b'<!-- JIZURA_REVIEW_ARTIFACT -->')
        self.git('add', name)
        self.write(name, b'source replacement not staged')
        self.assertEqual(len(self.check(1, 'staged')['rejected']), 1)

    def test_ambiguous_html_warns_not_rejects(self):
        self.write('tasks/evidence/source.html', b'<html>fixture, semantics unknown</html>')
        self.git('add', 'tasks/evidence/source.html')
        report = self.check(0, 'staged')
        self.assertEqual(len(report['warnings']), 1)

    def test_incoming_add_then_delete_is_rejected(self):
        self.write('review/temporary.MP4')
        self.git('add', '-f', 'review/temporary.MP4')
        self.git('commit', '-qm', 'intermediate artifact')
        self.git('rm', '-q', 'review/temporary.MP4')
        self.git('commit', '-qm', 'delete artifact')
        report = self.check(1, 'incoming', '--base', self.base)
        self.assertEqual(len(report['commitsChecked']), 2)
        self.assertEqual(len(report['rejected']), 1)

    def test_incoming_unrelated_root_commit_is_checked(self):
        self.git('checkout', '--orphan', 'unrelated')
        self.git('rm', '-rfq', '.')
        self.write('review/root.WEBM')
        self.git('add', '-f', 'review/root.WEBM')
        self.git('commit', '-qm', 'unrelated root artifact')
        self.git('checkout', '-q', '-b', 'integration', self.base)
        self.git('merge', '--allow-unrelated-histories', '--no-ff', '-qm', 'merge unrelated', 'unrelated')
        report = self.check(1, 'incoming', '--base', self.base)
        self.assertEqual(len(report['commitsChecked']), 2)
        self.assertTrue(any(r['path'] == 'review/root.WEBM' for r in report['rejected']))

    def test_pr_with_advanced_base_uses_common_ancestor(self):
        self.git('checkout', '-qb', 'feature')
        self.write('src/feature.js')
        self.git('add', 'src/feature.js')
        self.git('commit', '-qm', 'feature')
        feature = self.git('rev-parse', 'HEAD').strip()
        self.git('checkout', '-qb', 'advanced-base', self.base)
        self.write('base.txt')
        self.git('add', 'base.txt')
        self.git('commit', '-qm', 'base advances')
        advanced = self.git('rev-parse', 'HEAD').strip()
        report = self.check(0, 'incoming', '--base', advanced, '--head', feature, '--merge-base')
        self.assertEqual(report['base'], self.base)
        self.assertEqual(report['requestedBase'], advanced)
        self.assertEqual(len(report['commitsChecked']), 1)

    def test_pr_without_common_ancestor_errors(self):
        self.git('checkout', '--orphan', 'unrelated')
        self.git('rm', '-rfq', '.')
        self.write('other.txt')
        self.git('add', 'other.txt')
        self.git('commit', '-qm', 'unrelated')
        self.check(2, 'incoming', '--base', self.base, '--merge-base')

    def test_merge_side_add_delete_still_rejected(self):
        self.git('checkout', '-qb', 'side')
        self.write('review/side.PNG')
        self.git('add', 'review/side.PNG')
        self.git('commit', '-qm', 'side adds media')
        self.git('rm', '-q', 'review/side.PNG')
        self.git('commit', '-qm', 'side removes media')
        self.git('checkout', '-q', '-b', 'merge-main', self.base)
        self.write('main.txt')
        self.git('add', 'main.txt')
        self.git('commit', '-qm', 'main advances')
        self.git('merge', '--no-ff', '-qm', 'merge side', 'side')
        report = self.check(1, 'incoming', '--base', self.base)
        self.assertEqual(len(report['commitsChecked']), 4)
        self.assertTrue(any(r['path'] == 'review/side.PNG' for r in report['rejected']))

    def test_merge_resolution_new_media_rejected(self):
        self.git('checkout', '-qb', 'side')
        self.write('side.txt')
        self.git('add', 'side.txt')
        self.git('commit', '-qm', 'side')
        self.git('checkout', '-q', '-b', 'merge-main', self.base)
        self.write('main.txt')
        self.git('add', 'main.txt')
        self.git('commit', '-qm', 'main')
        self.git('merge', '--no-ff', '--no-commit', 'side')
        self.write('review/resolution.WEBM')
        self.git('add', 'review/resolution.WEBM')
        self.git('commit', '-qm', 'merge resolution adds artifact')
        report = self.check(1, 'incoming', '--base', self.base)
        self.assertTrue(any(r['path'] == 'review/resolution.WEBM' for r in report['rejected']))

    def test_incoming_safe_changes_and_equal_range_pass(self):
        self.write('src/safe.js', b'const safe = true;')
        self.git('add', 'src/safe.js')
        self.git('commit', '-qm', 'safe code')
        self.check(0, 'incoming', '--base', self.base)
        self.assertEqual(self.check(0, 'incoming', '--base', 'HEAD')['commitsChecked'], [])

    def test_unknown_zero_option_and_nonancestor_base_fail(self):
        for base in ['missing-ref', '0' * 40, '--help']:
            self.check(2, 'incoming', '--base=' + base)
        self.git('checkout', '-qb', 'side')
        self.write('side.txt')
        self.git('add', 'side.txt')
        self.git('commit', '-qm', 'side')
        side = self.git('rev-parse', 'HEAD').strip()
        self.check(2, 'incoming', '--base', side, '--head', self.base)

    def test_no_arbitrary_size_limit_and_totals(self):
        self.write('tasks/evidence/raw.json', b'x' * 1048576)
        self.git('add', 'tasks/evidence/raw.json')
        report = self.check(0, 'staged')
        self.assertEqual(report['changedBlobOccurrenceBytes'], 1048576)
        self.assertEqual(report['changedBlobOccurrences'], 1)

    def test_ignored_unstaged_artifacts_not_claimed_saved(self):
        self.write('artifacts/review/unsaved.PNG')
        self.assertEqual(self.check(0, 'staged')['changedBlobOccurrences'], 0)


if __name__ == '__main__':
    unittest.main()
