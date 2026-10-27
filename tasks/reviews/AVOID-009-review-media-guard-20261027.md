# AVOID-009 — generated review media Git guard (2026-10-27)

## Scope and status

Implementation: `gpt-6.1-sol`, medium, following parent-approved narrow design.
Start: `work` / `2ef46713ee260cf9d3d62260d8a1a4cf9ce78371`; preceding local
verification edits were retained, with no overlapping product changes.
**Locally tested; parent review pending; CI not executed.** This is a separate
verification-support change, not a new visual candidate or AVOID-009 completion.

The user does not require intermediate human-review videos/frames in Git.
Existing history/assets are preserved: no deletion, rewriting, commit or push in
the product repository. No Sites/public operation, media retrieval or viewing.
The prior Canvas diagnostic and its blocked status remain unchanged.

## Local changes

- `.gitignore`: ignore new dedicated `/artifacts/review/` and `/dist/review/`
  output trees, regardless of extension. Generators should target these trees
  or an authorized repository-external location. Existing generator paths are
  not rewritten in this local guard task.
- `tools/check_review_artifacts.py`: staged or incoming-commit inspection.
  Staged checks inspect the index blob, not the working-tree file. Paths use
  Git's NUL-delimited format (spaces, newlines and Unicode remain intact).
- `dev/review_artifact_guard_test.py`: isolated temporary Git repositories only.
- `.github/workflows/review-artifacts.yml`: lightweight guard + unit tests for
  main/work pushes, PRs and dispatch. Existing heavy `verify.yml` is unchanged.

### Policy

1. New/changed/moved files at dedicated review roots are rejected in any format,
   including forced adds. Existing same-path unchanged assets are not scanned.
2. In `review/` and `tasks/evidence/`, newly introduced/changed/moved raster image
   or video extensions are rejected case-insensitively. Exact list is in the
   script. A known blob moved/copied to a new media path is not exempt.
3. HTML there is rejected only if explicitly marked
   `<!-- JIZURA_REVIEW_ARTIFACT -->`; otherwise it is an ambiguity warning, not
   a blanket block. Existing source/fixture HTML is not silently classified as a
   viewing page. This deliberately does not detect all unmarked review HTML.
4. Product `assets/`, source/fixture paths, current root CEP ZIPs, raw JSON/CSV
   and code remain outside this narrow media prohibition. No new exception
   ledger was needed. This does not grant permission to publish private files.
5. Byte totals are informational, counting changed blob occurrences (a blob in
   several commits can be counted several times). **No size threshold** or
   arbitrary total limit has been introduced. Large raw/archive preservation is
   not a claim that all large future files should be stored in Git.

### Commands and CI comparison

```sh
python3 tools/check_review_artifacts.py staged
python3 tools/check_review_artifacts.py incoming --base <known-ancestor> --head HEAD
# PR only: current base branch tip need not be feature head's ancestor.
python3 tools/check_review_artifacts.py incoming --base <PR-base-tip> --head <PR-head> --merge-base
python3 -m unittest discover -s dev -p review_artifact_guard_test.py -v
```

Exit 0 means no disallowed change (warnings may remain), 1 means rejected media,
2 means inspection could not safely run. Incoming mode checks **every commit**
reachable from head but not base, against each first parent, including root and
merge-resolution changes. It detects intermediate add-then-delete media, not
only the final tree diff. PR mode resolves a common ancestor first. Unknown,
missing, all-zero or inappropriate nonancestor bases fail explicitly; a new
branch push with all-zero `before` needs an explicit reviewed base/dispatch.
No base guessing or silent success. CI uses push `before`, PR base/head SHA, or
a required dispatch base, with full fetched history. Local staged checks are
manual; no hook installation or auto-commit is performed.

## Evidence and limitations

Logs: `work/resume-20261027-media-guard/`.

- `tests-attempt01.log`: original 12 tests PASS.
- `tests-attempt02.log`: added unrelated-root fixture failed in fixture checkout
  preparation, not a guard acceptance result.
- `tests-attempt03.log`: fixture orphan-index removal failed (two tests), retained.
- `tests-attempt04.log`: **17 tests PASS**, after correcting removal of only the
  test-created files in private temporary repositories.
- `product-index-check.json`: current actual product index has zero staged
  changes; staged guard PASS is not evidence that untracked edits were staged
  or saved.

Tests cover uppercase/mixed media extensions, spaces/newlines/Unicode, force-add,
unchanged legacy assets, products/fixture HTML/CEP ZIPs/raw data, modified old
media, known-blob copy/rename, staged-vs-working-tree HTML, ambiguity warning,
linear and side-branch add/delete, merge-resolution new media, unrelated-root
merge, advanced PR base/common ancestor, no common ancestor/unknown/zero base,
and absence of an arbitrary size limit.

CI provider execution, actual push events, branch protection and saved-repository
verification are not run/configured. The workflow can detect violations when
run but cannot itself undo already-pushed blobs or guarantee branch protection.
No existing history removal is claimed. Human visual review is not relevant to
this internal support change; parent makes the final review-needed decision.

### Parent review and final local boundary

The local work coordinator reviewed both sources and independently reran all
17 tests: PASS. Actual repository staged check had zero entries: PASS, not a
claim to inspect unstaged edits. Parent also confirmed `src/`, Japanese/English
HTML and the existing heavy `verify.yml` have no diff, and `git diff --check`
passes. New workflow was parsed with PyYAML `BaseLoader`; main/work/PR triggers,
`contents: read`, `fetch-depth: 0` and unit-test step were structurally asserted.
This is local syntax/config review only; GitHub Actions was not executed.

This guard does **not** fully classify unmarked HTML, nor inspect compressed
archive contents outside the dedicated roots. It provides no capacity ceiling.
New-branch all-zero push bases and nonancestor force-push comparisons stop with
an explicit error rather than guessing a base; an explicit reviewed base is
required to proceed. No artifact/source history is altered to pass the guard.
Final root-parent acceptance remains pending.
