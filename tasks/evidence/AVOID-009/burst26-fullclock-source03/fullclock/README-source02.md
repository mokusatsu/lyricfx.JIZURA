# source02 — Canvas NOT RUN

Independent copy of ../fullclock; old source and results retained. Only browser26.js, runner26.cjs and checker26.py behavior changed.

Support requires a string for the active fill or stroke channel only. Raw unused nonstring styles remain unchanged; active unknown gradient/pattern stays rejected. Support exceptions become supportError plus the completed supportPrefix; all original paint records, glyphs, passes and RGBA digest remain in the returned frame. Host sample stores support-error-frame through the existing codec and manifest before asserting. No evaluator receives that failed frame. Checker requires complete support computation for acceptance and independently checks the active style.

New support-error-test26.cjs exercises unused style acceptance, active unknown style refusal, prefix preservation and store-before-assert ordering with pure data. Existing source/geometry/clock tests remain unchanged. Source02 has no Canvas results, adapter, new geometry policy, Git action, save or network operation. Parent source review, durable source checkpoint and newly frozen strict root/runtime/font/source execution gate remain required before any Canvas RUN. Existing execute/runner release strings and accepted gate requirements are unchanged.
