SOURCE PREPARATION ONLY. Parent must read complete wrapper and review each
actual literal argv separately. No import/run, receipt creation, subprocess,
Git operation, keeper mutation, cleanup or network occurred. Python AST only.

Use inside reviewed keeper RUN; preserve its intended cwd/envUpdates:
python3 -B /workspace/lyricfx.JIZURA/work/avoid009-night-command-receipts01/command_receipt.py --receipt-id UNIQUE_TASK_RUN_ID --argv-json '["python3","-B","/absolute/reviewed/task.py","literal-argument"]'
ID is1-96 ASCII alphanumeric/underscore/hyphen, first alphanumeric. No expansion,
shell strings or glob evaluation. Wrapper is not a security sandbox; parent owns
scope and actual executable/arguments review. Pass only approved literal argv
and task paths; credentials remain hidden child stdin, never argv.

Future execution writes only small metadata under fixed ROOTpath:
tasks/evidence/AVOID-009/night-20261024/command-receipts/ID-START.json
and ID-DONE.json. Parent may select new ID; wrapper never retries an existingID.
Each record is written/fsynced to exclusiveID.pending then atomically published
by a no-replace hardlink, directoryfsync. Only its own published staging link
is removed; START/DONE are never modified/deleted. Interrupted unpublished
.pending survives and reservesID. Concurrent sameID cannot start twice.
START is durably published BEFORE spawning. DONE is published for every observed
child return, including nonzero and negative signal status, and launch OSError.
No stdout/stderr/stdin capture: child inherits all stdio directly. No cwd/env
change, proxy/CA/TLS/credential settings, timeout, retry, Git action, publication
or result checks are initiated by wrapper itself. Requested child remains parent
reviewed work. No output values or literal argv are persisted: exact canonical
JSON argv SHA256, argc, currentcwd, wrapperPID and timestamps identify the run
without risking secret values. Hash encoding: UTF8 json.dumps(argv,
ensure_ascii=False,separators=(',',':')). Review actual argv separately.

Normal CLI returns child's exitcode; child signal produces128+signal. Launch
OSError returns127 and records ONLY error class, no message/arguments. Wrapper
request/receipt publication failure returns125 with fixed nonsensitive message.
It never reports receipt persistence success after a write failure. Zero child
exit is only command success, not parent/raw/product acceptance.

Hard kill/power loss/wrapper interruption/diskfull can prevent DONE even if child
finished. START without DONE means UNKNOWN, never completion/pass/failure and
never an automatic retry. Parent inspects existing raw/process/receipts first.
No post-compaction wait should infer a process is still running merely because
its DONE is absent. Existing8802manager/currentround/source44b outputs unaffected.
