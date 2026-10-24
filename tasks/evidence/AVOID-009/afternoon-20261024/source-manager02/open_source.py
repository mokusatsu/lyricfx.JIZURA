#!/usr/bin/env python3
"""Fresh owner source checkout only; explicit invocation and hidden PTY credentials required."""
import argparse, base64, json, os, pathlib, subprocess, sys, termios, urllib.parse
OLD = pathlib.Path('/tmp/avoid009-motion2-sites-synced01')
BASE = pathlib.Path('/dev/shm/avoid009-afternoon-20261024')
DEST = BASE / 'source'
PROJECT = 'appgprj_6adbafe9f07c8191ab0b404c53caab16'
REMOTE = 'https://git.chatgpt-team.site/ca6227f0-be34-40d7-9800-d5b531e94bab/' + PROJECT + '.git'
PRIOR = '854df47ad7fbfb57995cb846e49c0cf6b4d7ddf6'

def require(condition):
    if not condition: raise RuntimeError('precondition')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['OPEN'])
    parser.parse_args()
    require(sys.stdin.isatty())
    fd = sys.stdin.fileno(); old_terminal = termios.tcgetattr(fd)
    hidden = termios.tcgetattr(fd); hidden[3] &= ~termios.ECHO
    termios.tcsetattr(fd, termios.TCSADRAIN, hidden)
    try:
        print('READY', flush=True)
        cred = json.loads(sys.stdin.readline())
        endpoint = cred.get('remote_url') or cred.get('repo_url')
        parsed = urllib.parse.urlsplit(endpoint or '')
        require(endpoint == REMOTE and parsed.scheme == 'https' and not parsed.username and not parsed.password and not parsed.query and not parsed.fragment)
        require(cred.get('auth_mode', 'http_extra_header') == 'http_extra_header')
        header = cred.get('http_extra_header')
        if not header:
            token = cred.get('token'); require(isinstance(token, str) and bool(token))
            username = cred.get('username')
            header = ('Authorization: Basic ' + base64.b64encode((username + ':' + token).encode()).decode()) if username else 'Authorization: Bearer ' + token
        require(isinstance(header, str) and header.lower().startswith('authorization:') and '\n' not in header and '\r' not in header)
        env = os.environ.copy()
        # Git diagnostics can include headers: disable traces without changing proxy/CA/TLS.
        for key in list(env):
            if key.startswith('GIT_TRACE') or key in ('GIT_CURL_VERBOSE', 'GIT_CONFIG_PARAMETERS'): env.pop(key)
        env['GIT_TERMINAL_PROMPT'] = '0'
        settings = [('gc.auto','0'), ('maintenance.auto','false'), ('credential.helper',''), ('http.' + endpoint + '.extraHeader',header)]
        count = int(env.get('GIT_CONFIG_COUNT','0'))
        for offset,(key,value) in enumerate(settings):
            env['GIT_CONFIG_KEY_' + str(count+offset)] = key
            env['GIT_CONFIG_VALUE_' + str(count+offset)] = value
        env['GIT_CONFIG_COUNT'] = str(count+len(settings))
        def run(*argv, cwd=OLD):
            return subprocess.run(['git',*argv], cwd=cwd, env=env, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout
        require(not OLD.is_symlink() and OLD.is_dir() and not BASE.is_symlink() and BASE.is_dir())
        require(not os.path.lexists(DEST))
        require(run('rev-parse','HEAD').decode().strip() == PRIOR)
        require(run('config','--get','remote.origin.url').decode().strip() == REMOTE)
        run('clone','--no-hardlinks','--no-checkout','--',str(OLD),str(DEST),cwd=BASE)
        run('remote','set-url','origin',endpoint,cwd=DEST)
        # FETCH_HEAD belongs to this fresh checkout. Never fetch/check out in OLD.
        run('fetch','--no-tags',endpoint,'refs/heads/main',cwd=DEST)
        latest = run('rev-parse','FETCH_HEAD',cwd=DEST).decode().strip()
        run('merge-base','--is-ancestor',PRIOR,latest,cwd=DEST)
        run('checkout','-B','main',latest,cwd=DEST)
        require(run('status','--porcelain',cwd=DEST).strip() == b'')
        require(run('symbolic-ref','--short','HEAD',cwd=DEST).decode().strip() == 'main')
        hosting = DEST / '.openai/hosting.json'
        require(not hosting.is_symlink())
        config = json.loads(hosting.read_text())
        require(config['project_id'] == PROJECT and config['static']['directory'] == 'dist')
        dist = DEST / 'dist'; require(dist.is_dir() and not dist.is_symlink())
        files = list(dist.rglob('*')); require(not any(p.is_symlink() for p in files))
        assets = [p for p in files if p.is_file()]
        require(run('rev-parse','HEAD').decode().strip() == PRIOR)
        print(json.dumps({'source':str(DEST),'commit':latest,'branch':'main','clean':True,'project_id':PROJECT,'distFiles':len(assets),'distBytes':sum(p.stat().st_size for p in assets),'oldCheckoutUnchanged':True,'publicChecks':0,'publish':False,'push':False}),flush=True)
    except BaseException:
        # Never display Git stdout/stderr or credential-derived exception details.
        print('Fresh source operation failed; sensitive details suppressed. Existing checkout preserved; inspect fresh destination locally before retry.',flush=True)
        raise SystemExit(1)
    finally:
        termios.tcsetattr(fd,termios.TCSADRAIN,old_terminal)

if __name__ == '__main__': main()
