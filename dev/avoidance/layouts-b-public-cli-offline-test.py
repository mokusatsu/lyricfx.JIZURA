#!/usr/bin/env python3
"""Qualify the real CLI with synthetic memory-only stdin; no browser/network."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import subprocess
import sys
import tempfile

REPO = Path(__file__).resolve().parents[2]
FILES = [
    'dev/avoidance/layouts-b-public-cli-offline-test.py',
    'dev/avoidance/layouts-b-public-test.cjs',
    'dev/avoidance/layouts-b-public-offline-test.cjs',
    'dev/avoidance/pages-output-audit.py',
]
# This deliberately extracts only the existing synthetic setup definitions. It
# depends on that test file's marker and setup(root, mode) interface, not Git or
# any committed old object. No tests are registered by the extracted prefix.
SETUP_JS = r"""
const fs = require('node:fs'), Module = require('node:module');
const filename = process.argv[1], source = fs.readFileSync(filename, 'utf8');
const marker = "test('canonical CLI";
if (source.split(marker).length !== 2) throw Error('fixture marker changed');
const code = source.split(marker)[0], m = new Module(filename, module);
m.filename = filename; m.paths = module.paths;
m._compile(code + ';module.exports={setup};', filename);
console.log(JSON.stringify(m.exports.setup(process.argv[2], process.argv[3])));
"""


def digest(data):
    return hashlib.sha256(data).hexdigest()


def pins():
    return {name: digest((REPO / name).read_bytes()) for name in FILES}


def qualify():
    initial = pins()
    node = shutil.which('node')
    assert node, 'Node required'
    version = subprocess.run([node, '--version'], check=True, capture_output=True,
                             text=True, timeout=10).stdout.strip()
    assert re.fullmatch(r'v\d+\.\d+\.\d+', version)
    rows = []
    for mode in ['success', 'failure']:
        # A fresh sentinel is generated only in memory, never argv/env/fixtures.
        credential = 'synthetic-offline-' + secrets.token_urlsafe(32)
        with tempfile.TemporaryDirectory(prefix='avoid007-runner-cli-') as tmp:
            setup = subprocess.run(
                [node, '-e', SETUP_JS,
                 str(REPO / 'dev/avoidance/layouts-b-public-offline-test.cjs'),
                 tmp, mode], capture_output=True, text=True, check=True, timeout=10)
            config = json.loads(setup.stdout.strip().splitlines()[-1])
            env = dict(os.environ, HTTPS_PROXY='http://synthetic-proxy.example.test:8080')
            args = [node, config['runner'], '--validator', config['validator'],
                    '--bundle', config['bundle'], '--base-url',
                    'https://example.test/review/AVOID-007/synthetic/',
                    '--report', config['report']]
            result = subprocess.run(
                args, input=json.dumps({'token': credential}) + '\n',
                capture_output=True, text=True, env=env, timeout=10)
            assert result.returncode == (0 if mode == 'success' else 1)
            output = [result.stdout, result.stderr]
            output += [Path(config['report'] + suffix).read_text()
                       for suffix in ['', '.partial.json', '.log']]
            for text in output:
                assert credential not in text
                assert 'Bearer ' not in text
                assert 'OAI-Sites-Authorization' not in text
            raw = Path(config['report']).read_bytes()
            report, summary = json.loads(raw), json.loads(result.stdout)
            assert summary['reportSHA256'] == digest(raw)
            assert report['status'] == mode
            rows.append({'mode': mode, 'exitCode': result.returncode,
                         'status': report['status'], 'stdinJSONOneLine': True,
                         'noCredentialInOutputs': True, 'reportHashVerified': True,
                         'reportSHA256': digest(raw)})
        credential = None
    assert pins() == initial, 'source inputs unchanged'
    return {'schema': 'avoid007-private-cli-offline-qualification-v1',
            'scope': 'synthetic fake validator only; no real credential/browser/network',
            'versions': {'node': version, 'python': sys.version.split()[0]},
            'sourcePins': initial, 'endInputsUnchanged': True, 'results': rows}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report', type=Path, required=True, help='fresh receipt path')
    args = parser.parse_args()
    # Reserve before work; rejected/stale paths must never be overwritten.
    fd = os.open(args.report, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'w') as receipt:
        result = qualify()
        receipt.write(json.dumps(result, indent=2) + '\n')
    print(json.dumps({'status': 'passed', 'cases': 2,
                      'receiptSHA256': digest(args.report.read_bytes())}))


if __name__ == '__main__':
    try:
        main()
    except Exception:
        # Never print subprocess output, exception text or credential-bearing data.
        print('Synthetic CLI qualification failed; details suppressed.', file=sys.stderr)
        sys.exit(1)
