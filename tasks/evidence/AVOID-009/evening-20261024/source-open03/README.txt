SOURCE PREPARATION ONLY. No import/execution/network/SourceGit/ROOT writes occurred.
Parent must fully read source before execution. AST parsing only.

Exact project appgprj_6adbafe9f07c8191ab0b404c53caab16, credential-free endpoint
https://git.chatgpt-team.site/ca6227f0-be34-40d7-9800-d5b531e94bab/appgprj_6adbafe9f07c8191ab0b404c53caab16.git
Official keeper8802 only: /dev/shm/avoid009-evening-20261024/source must be absent.
No old BASE/checkouts/state are reused. Clone depth1 singlebranchmain.

OPEN: python3 -B /tmp/avoid009-evening-source-open03/source_git03.py OPEN --expected-head b8843f2a937266a688059c4f5db1a120839f1b5a
Invoke through existing keeper RUN explicit argv/cwd/envUpdates. Wait READY,
then parent mints/transfers Source credentials as one hidden stdin JSON line.
Credential JSON remote_url/repo_url must exactly equal endpoint; optional project_id
must match. auth_mode=http_extra_header supports exact one Authorization header,
or token plus optional username. auth_mode=work_proxy performs ordinary Git with
no added token/header. No credential files, argv credentials, logs or raw Git errors.
Auth header childenv only; all proxy/CA/TLS settings inherited. gc.auto0 and
maintenance.autofalse applied to every Git subprocess. Traces disabled, errors
fully suppressed. Configured Git credential helper disabled to prevent persistence.

OPEN validates expected current SourceHEAD, main, exact remote, clean checkout,
project hosting config and dist directory. It writes only clone and exclusive
source-open-evening03.json receipt outside checkout under BASE. Receipt seals
all .openai and dist bytes. Parent must copy receipt durably and record exactSHA.
If SourceHEAD has advanced, OPEN refuses after cloning; no reset/cleanup/retry.
Parent inspects and provides fresh gate. Script makes no Source edits or commits.

PUSH (private backup ONLY): python3 -B /tmp/avoid009-evening-source-open03/source_git03.py PUSH --expected-head EXACT_PARENT_REVIEWED_COMMIT --open-receipt-sha256 EXACT_OPEN_RECEIPT_SHA
Again READY then fresh hidden credential JSON. Requires exact main/remote/clean
checkout and original .openai/dist sealed bytes. Fetches main, verifies ancestor,
requires nonempty diff consisting ONLY added private-evidence/ files. Existing
private evidence modifications/deletions rejected. Entire intervening commit
history paths must also stay in private-evidence/. It pushes exact SHA to main,
without force; server advancement is handled by Git non-fast-forward rejection.
No automatic retry, merge, Source mutation, Sites API, publication request,
publish_on_push scheduling request, public URL connection, public result check,
or status polling. 'publish:false' means script requested no publication API.

Parent owns Source private-evidence copying, file/content validation, add/commit
review, Sites native calls, exact hosting/audience preservation and all credential
minting. Five future public assets are OUTSIDE this helper PUSH scope and need a
separate source gate. Do not change .openai/hosting/audience or dist for backup.
The script does not access ROOT Git/evidence/cache. Preserve raw32 copies.

Inherited Git repository/index/object override variables are removed for Source
commands so workspace/private-index context cannot affect this checkout. Proxy,
CA and TLS variables remain inherited unchanged.
