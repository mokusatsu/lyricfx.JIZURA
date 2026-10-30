# Bulbs cold capacity-count experiment 86cr — not adopted

Source-only trial by gpt-6.1-sol / medium, product baseline
`b7f633e11bd010230a41ca19ef2be93594f31c0d`. No product source or bundle changes.
The unsuccessful native-first 86cq is not included in this trial. All four
original recipes, 250 owner clocks, candidate order, full support geometry,
quality checks, destination replay and formal admission remain intact.

## Small change and invariance scope

Only the current owner's `native` descriptor and current recipe's `d` descriptor
have their exact encoded byte lengths reused during compiler capacity scans.
Two object references and two byte lengths live inside one compile call. There
is no descriptor copy, cross-frame/model cache, search branch or new fallback.
`d===native` uses the existing native count. The current reference is cleared at
the next recipe; both references are cleared before the owner checkpoint/yield
and in the existing final cleanup. Mutable local templates, glyph inventory and
held cursors still use the ordinary live recursive codec every time.

The source path is `bulbsNativeAt80`/`bulbsRecipeAt80` in src/11p_layoutsD.js:
recipeAt returns native itself or a new geometry descriptor. Subsequent compiler
support/glyph readers do not write those descriptors. Held begin copies the
face/ring points into its own quality record; glyph/end update that record, not
the descriptor. Recipe layout and subtitle preparation objects are already
privately frozen. No asynchronous yield occurs while cached geometry references
are live. Existing source/owner/font/time guards remain unchanged. These are
source-specific internal invariants, not a generic immutable-object cache API.

A fixed 307 encoded-byte upper allowance includes two management reference slots
(96 each, matching existing accounting convention) and metadata fields. In both
real pairs, every one of 5962 budget calls has *exactly* the original transient
byte count and original retained count plus307. This demonstrates unchanged
capacity calculation for these actual inputs in addition to source inspection;
it is not a heap bound or proof for arbitrary mutated foreign objects.

## Measurements and decision

| Condition / mode | UI wall ms | Max step ms | Codec recursive calls | Top-level requests | Encoded requested B | Accounting ms | Serialized peak B |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Success old02 | 8654.6 | 180.6 | 9191549 | 32194 | 207486623 | 655.7 | 3825235 |
| Success new02 | 9944.9 | 88.9 | 4614427 | 33444 | 220314993 | 584.1 | 3825542 |
| Insufficient old03 | 5122.5 | 68.8 | 9191549 | 32194 | 207486623 | 637.9 | 3825235 |
| Insufficient new03 | 5846.3 | 147.7 | 4614427 | 33444 | 220314993 | 644.1 | 3825542 |

Both conditions retain exactly one compile, four recipes ×250 owners, 5456 glyph
matrices,19884 ring points and1071750 serialized model bytes. Candidate counts
are2 for success and0 for insufficient, unchanged. New has10749 reused subtree
counts, avoiding traversal of110863080 encoded bytes. Requested bytes count the
logical sizes returned by top-level requests, including the1250 initial geometry
measurements; it is not bytes allocated or actual memory traffic. Recursive-call
count includes cache-hit calls, not just fully traversed nodes.

Success full semantic model hash (all fields except timing/budget), native
projection, exact selected delta/groups/held/250 proof references, and normal
preview t=.5 RGBA hash all match. Insufficient full quality diagnostics and
`BULBS86BJ_INSUFFICIENT_SPACE` match; canvas is empty. All four cancellations
release model/record/binding authority and leave an empty canvas.

**Not adopted:** approximately49.8% fewer codec recursive calls did not shorten
whole preparation in either measured pair. Single-pair wall increased14.9% and
14.1%. This is effect unproven, not a stable slowdown estimate. No further cache
layer or change was stacked onto this result. Initial cold latency remains
unresolved.

The saved phase profile gives success scalar3163.4→3480.5 ms and unchanged-work
proof2306.8→3188.7 ms; all measured steps5847.5→7153.5 ms. Insufficient scalar
3240.2→3567.0 ms; all steps3605.8→4169.3 ms. Total wall also includes scheduling,
font wait and other coordinator work. These observations do not identify whether
runtime/GC/load or local cache overhead dominates the difference; no additional
experiment or environment attribution is claimed.

Each condition is one old→new observation, with the ordinary UI font wait inside
the cold interval. Both pages first load/settle a center project and existing
fonts. Model size/timing observation runs inside prepare. Both versions also
increment local codec counters and append the same budget samples (5962 integer
pairs) inside prepare; the new version additionally counts cache hits/avoided
bytes. These measurement allocations are outside product accounting and can
influence timing/GC; their cost was not separately measured. Model/frame hashes
are computed after ready, outside wall. Owner max step is the measured
coordinator synchronous step, not every possible browser stall. Peaks refer to
serialized accounting, not JS heap/RSS (not measured).

Inputs use the same ordinary project as86cq: actual480×270 viewport,960×540
video,60fps,JA lyrics/seed/font and limited source effects. Success circle center
(.5,.1),r=.1; insufficient(.5,.2),r=.2. Implementation has no literal fixture
input special case. This measurement is not full-input UI qualification.

## Read-only verification and evidence

```sh
node dev/avoidance/bulbs86/budget-once86cr/test.cjs
python -B dev/avoidance/bulbs86/budget-once86cr/check.py /workspace/jizura-logic-evidence-20261027
```

Pure18 checks actual old/new codec equality, mutable work siblings, aliases,
string/Float64/sparse/nonfinite behavior; it does not simulate Canvas or establish
arbitrary-object immutability. Checker verifies four runs ×182 source pins and
two compressed/raw hashes, exact budget-call equality, work counts/results,
success model/proof/hash equality, capacity and normal resource cleanup. Both
checker and pure passed locally; independent parent review is pending.

Evidence base `/workspace/jizura-logic-evidence-20261027`:

- `bulbs-budget-once-source86cr-{old,new}{02,03}`: executed sources/pins.
- `bulbs-budget-once-{old,new}-actual86cr{02,03}`: raw/result, unchanged.
- Same actual name plus `-runtime/host.json`: lifecycle, three normal closes,
  owned children reaped exit0, no signals, debug port closed in all four runs.
- `bulbs-budget-once86cr-sourceprep01`: execution source snapshot and preflight
  (free9.713GB, Qt live0/zombie1132,4MiB expected output).
- `bulbs-budget-once86cr-sourceprep02-final`: final source/review pins and checker
  output. Preserve both snapshot versions and all executed source/run/runtime.

`bulbs-budget-once-source86cr-old01` was generated before budget-sample observer
was added and was **never executed**; it is not comparison evidence. No Qt run01,
media or public check occurred. Current files pinned by the executed trials are
unchanged. generate.py can be copied to a temporary directory and run with the
repo root to recreate compiler86cr.js without overwriting historical sources.
Do not apply this source-only compiler to product based on these measurements.
