# Storage source gate

Status: source prepared; helper NOT executed; no archive deleted or restored.

Parent reviews `archive_guard.py` before any execution. Fixed source commit is
854df47ad7fbfb57995cb846e49c0cf6b4d7ddf6 in the existing local full Git source.
Only `.openai/hosting.json` and `dist` are read through `git archive`. Regeneration
uses RAM and the original tarfile `w:xz` ordering/metadata/compression defaults.
All 96 file names, byte counts, and SHA256 values must equal the canonical
manifest, then the compressed RAM bytes must equal 33833708 bytes and SHA256
8f7f9f1a92ad737521afbe6ebba0ce62ed19598cd9c5941f2bd454d2fc631bf4.

`verify --receipt .../verify.json` also compares the live derived upload byte for
byte. After parent acceptance, `release --receipt .../release.json` independently
repeats the complete verification, then unlinks only the fixed blocks upload.
The three old uploads are read and hashed before/after either operation; their
paths cannot be deleted by this utility. No source, raw, MP4, PNG, capsule, or
other archive is removed. No network or Git mutation is used.

`restore --receipt .../restore.json` recreates exactly the original upload path
from the same exact local commit, checks the canonical manifest and final bytes,
and uses exclusive `xb` creation. It never overwrites an existing upload. Small
receipts are exclusively created within this storage directory. No second full
archive is written to disk. Failure is an exception, never a success receipt.

No execution is authorized by this document itself. Parent owns that source gate.
