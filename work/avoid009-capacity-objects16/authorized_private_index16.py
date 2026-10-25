#!/usr/bin/env python3
"""Pinned unchanged STRICT65 helper with explicit new scratch and actual ROOT receipt.
Parent source/staged review required before actions. Retain every round and receipt.
"""
import argparse, hashlib, json, os, pathlib, types
P=pathlib.Path
ROOT=P('/workspace/lyricfx.JIZURA')
OLD=ROOT/'work/avoid009-capacity-objects16/private_index_resume16.py'
MODEL=OLD.with_name('authorized-continuation65-snapshot.json')
BASE=P('/workspace/avoid009-private-commit16-20261025')
SOURCE_SHA='eb8de7f8d030db70e6bd33fb054738debccfd94375521a8f7a915426e44535b2'
MODEL_SHA='3dad72608f7a6d6ec5432c4cb1cc8815b375df21a267a1fb0646715290c7199c'
def check(path, digest):
 for part in [*reversed(path.parents),path]:
  if part.is_symlink():raise RuntimeError('symlink refused')
 data=path.read_bytes()
 if hashlib.sha256(data).hexdigest()!=digest:raise RuntimeError('pinned file changed')
 return data
if __name__=='__main__':
 ap=argparse.ArgumentParser(description=__doc__)
 ap.add_argument('action',choices=['PREPARE','RUN','INSTALL']);ap.add_argument('--round',type=int,required=True)
 for key in ['snapshot-sha256','root-index-sha256','prior-receipt-sha256','private-index-sha256','expected-head','argv-json']:ap.add_argument('--'+key)
 args=ap.parse_args()
 code=check(OLD,SOURCE_SHA);check(MODEL,MODEL_SHA)
 g=types.ModuleType('reviewed_strict65');g.__file__=str(OLD)
 exec(compile(code,str(OLD),'exec'),g.__dict__)
 g.BASE=BASE;g.SNAP=MODEL;g.ARGS=args
 if args.action=='PREPARE':
  if args.snapshot_sha256!=MODEL_SHA:raise RuntimeError('exact new snapshot seal required')
  if not os.path.lexists(BASE):
   if args.round!=1:raise RuntimeError('new namespace only at round1')
   BASE.mkdir(mode=0o700)
  g.prepare(args.round,args.snapshot_sha256,args.prior_receipt_sha256)
 elif args.action=='RUN':g.run(args.round,json.loads(args.argv_json))
 else:g.install(args.round)
