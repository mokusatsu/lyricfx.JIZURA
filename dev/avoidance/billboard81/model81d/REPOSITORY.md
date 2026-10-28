# Repository checkpoint

The eleven files named in `source-manifest.json` are unchanged copies of fixed source81d. The generator `prepare-source.py` records the original evidence workspace path; it is preserved for provenance and is not required for the tests below. This directory is not loaded by the product build.

```
node dev/avoidance/billboard81/model81d/descriptor-test.cjs
node dev/avoidance/billboard81/model81d/scalar-support-test.cjs
node dev/avoidance/billboard81/model81d/model-test.cjs
```

These are synthetic checks. Real Canvas containment, quality, ownership, certificate, ordinary frame and UI remain unqualified. The compiler is an offline exploration and must not run per frame or on a synchronous UI.
