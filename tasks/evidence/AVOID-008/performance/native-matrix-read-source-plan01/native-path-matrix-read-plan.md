# Native path command matrix reuse — source-only plan

Basis: fixed3b0c995a2c912cf3edf6583f372c215c310e11f0 / diagnostic d256228,09a SHA e22e968e8c6b4619216c2e432805d4af469338366fd78e8a4fd2f0b9771a3ae4. Only this report was written; no code, Git mutation, test, browser, performance run, image or public operation. No additional security investigation.

## Decision

A C-only, private command-matrix cache is a plausible normal-path optimization. The command wrapper currently performs getTransform plus DOMMatrix field reads, a six-number array allocation and comparison for every native command, including closePath. Consecutive path commands normally do not change the transform. Reuse only that command-branch read; keep every paint/clip/push/event/nativeState matrix operation unchanged. This is more directly proportional to command count than first-hull slice elision, but source alone establishes no time saving or improvement of the current render FAIL.

## Minimal mechanics

At each record start initialize commandMatrix=null and dirty=true. On a C native command, obtain matrix(c) only if dirty/uninitialized, otherwise use the private six-number value. Preserve finite argument validation and its order. For the first command after beginPath, assign bPathMatrix from a fresh slice of the private value; never make the event/path matrix alias the cache array. Keep the original per-command comparison to bPathMatrix and all its errors. Do not compose matrices numerically in JS: after a change read actual Canvas getTransform once, preserving browser rounding.

Mark dirty at proxy translate/rotate/scale/transform/setTransform/resetTransform and restore; save can conservatively mark dirty too as requested, without changing its actual canvas/native-stack behavior. Mark before forwarding, so an exceptional call cannot leave a falsely clean cache. BeginPath resets bPathMatrix as today and may conservatively mark dirty, yielding one actual read per fresh path/run. Do not reuse nativeRoot or an event matrix as mutable cache storage.

Also handle proxy reset explicitly: today it falls through to a bound native method and resets the transform without touching nativeOps. A dirty-only wrapper may preserve that existing behavior while preventing command cache staleness; it must not repair/change the nativeOps contract in this patch. Treat canvas/context-reset operations as ineligible or invalidating, not as ordinary style updates.

## Normal source routes checked

A.record passes proxy into renderer.makeEnv (09a179), including ctx:proxy. Native layout commands and normal renderer helpers using that env.ctx therefore reach the intercepted transform methods. C modules do not normally obtain a second raw measurement context to change its matrix inside their drawing command sequences.

There ARE ordinary raw context users in the source, so C-source-known alone is not a universal no-mutation guarantee:

- Public A.measurementContext returns the same underlying context (09a34). C planning/audit record helpers in09g/h/i/j call reset before starting A.record; dictionary print-field audit resets after its record. These are outside the synchronous native draw command run, and should not invalidate an intra-record command cache by themselves.
- A.itemGeometry uses that raw context (09a47), but its stock body changes text state/metrics, not the transform; measurementContext can resize it back to1x1 if dimensions changed. Editorial cssPaint (09h162) changes only fillStyle. These reads are not direct ordinary matrix mutation in the normal1x1 recording domain.
- Other frame/media code changes separate canvas contexts. No source evidence was found that these ordinary branches retain the recorder's private c and change its transform between its native commands.
- Proxy reset and access to proxy.canvas remain real routes by which a renderer can reset the actual context. The proposed transform/save/restore dirty list alone is therefore incomplete for generic renderers.

## Domain and fallback

Enable only placementLayoutsC===true with the existing exact registered-source/stock-transport checks, stock measurement Canvas transform methods and stock renderer/helper domain; non-C remains byte-behavior legacy. Do not establish a new whole-application helper restriction just for this optimization. Initially invalidate on recorder item/helper entry or any unclassified callback/operation that may reenter measurement work; ordinary long sequences of raw path commands still benefit. If a layout/helper actually resets or resizes the raw shared canvas during a path, keep that layout/record legacy unless a small explicit invalidation seam covers it. Do not silently assume that public context is inaccessible.

An invalidation on reentrant A.record activity (if allowed in the selected normal domain) must invalidate the outer cache as well, or exclude that domain. A per-record local dirty flag alone cannot observe a nested record resetting the same shared context. No such ordinary nested drawing sequence was identified in the inspected C rendering path, but existing source/transport checks alone do not syntactically forbid it.

Thus the proposed cache is feasible for the stock synchronous C drawing domain, with a small explicit reset/invalidation surface. It is not justified as a blanket optimization for arbitrary registered replacements or public raw-context callers. Any uncertainty can fall back to the current matrix(c) per command without changing output or pipeline.

## Acceptance, if subsequently authorized

Require exact original native programs, geometry, aliases, error outcomes and traces apart from the intentionally reduced stock getTransform reads. Cover normal long paths, transform between commands, nested save/restore, set/resetTransform, beginPath boundaries and proxy reset. Preserve first-path fresh ownership, all event snapshots, existing validation and all80 record/replay/observations. Do not remove paint/clip matrix checks to magnify the result. No tests were run for this report; actual workload benefit needs a separate parent gate.
