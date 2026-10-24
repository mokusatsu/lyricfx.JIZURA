#!/usr/bin/env python3
"""Read-only static source assertions; no Node code import or codec execution."""
import pathlib,json,hashlib,re
H=pathlib.Path(__file__).parent
sha=lambda b:hashlib.sha256(b).hexdigest()
def need(ok,msg):
 if not ok:raise AssertionError(msg)
names=['common53.cjs','encode53.cjs','restore53.cjs','verify-directory53.cjs'];src={n:(H/n).read_text() for n in names}
expected={
 'encode53.cjs':{'--raw53','--base51','--out','--base-pins-sha256','--manifest53-sha256','--parent53-and-after6-reviewed'},
 'restore53.cjs':{'--package','--package-sha256','--base51','--out','--base-pins-sha256'},
 'verify-directory53.cjs':{'--original53','--restored53','--package','--package-sha256','--report'},
}
for n,s in src.items():
 need(s.endswith('\n') and not s.endswith('\n\n'),n+': EOF')
 need(not re.search(r'(?:sha|SHA)(?!256\b)[0-9]+\b',s),n+': hash identifier')
 for req in re.findall(r"require\('([^']+)'\)",s):need(req in {'fs','path','crypto','zlib','child_process','assert/strict','./common53.cjs'},n+': application/encoder import')
 need(not any(x in s for x in ['unlinkSync','rmSync','rmdirSync','renameSync','update-index','git commit','git push','http.request','http.get']),n+': mutation/access outside storage scope')
 if n in expected:need(set(re.findall(r'--[a-z][a-z0-9-]*',s))==expected[n],n+': CLI differs')
common=src['common53.cjs'];encode=src['encode53.cjs'];restore=src['restore53.cjs'];verify=src['verify-directory53.cjs']
need("level:9,mtime:0" in common and "sha(read(process.execPath))" in common,'pinned Node/gzip missing')
need("'rev-parse'" in common and "'cat-file','blob'" in common and 'b.equals(git' in common,'full Git blob verification missing')
need('base51-pair-with-exhaustive-ordered-delta' in encode and 'topLevelOrder:keys' in encode and "literal-complete-decoded-JSON" in encode,'delta/literal model incomplete')
need("base.originalFile(member).equals(original)" in encode,'storage reuse must be fullbytes')
need("Buffer.from(JSON.stringify(restored)).equals(original)" in encode,'exact JSON trial missing')
need("C.splitRecord(original,row)" in encode,'all original gzip/boundaries selfcheck missing')
need("function decode(base,p)" in restore and "require('./encode" not in restore,'independent decoder missing')
need('originalDirectoryPaths' in encode and 'originalDirectoryPaths' in restore and 'C.directories' in verify,'full directory model incomplete')
need("left.equals(right)" in verify and "canonical.equals(left)" in verify and "z.gzipSync(raw,C.GZIP)" in verify,'full byte/gzip/JSON verification missing')
need("metadata.kind==='literal-original-bytes'" in restore and "derivedReferenceExtractionReceipt" in encode,'literal metadata/provenance missing')
p=json.loads((H/'base51-pins.json').read_bytes());need(p['requiredRetained'] is True and p['standalone'] is False and p['baseMemberCount']==755 and p['baseRecordCount']==570,'base context differs')
docs=(H/'README.txt').read_text();need(set(re.findall(r'--[a-z][a-z0-9-]*',docs))==set.union(*expected.values()),'documented CLI differs')
print(json.dumps({'state':'SOURCE_STRUCTURE_ONLY_PASS_NO_CODEC_IMPORT_OR_EXECUTION','NodeParserChecks':'all4 separately passed node --check; parser only','files':[{'path':n,'bytes':len(src[n].encode()),'sha256':sha(src[n].encode())} for n in names],'CLIContracts':{n:sorted(v) for n,v in expected.items()},'applicationImportsAbsent':True,'originalDeletionSourceAbsent':True,'immutableBaseRequired':True,'literalFallbackPresent':True,'independentDecoderAndFinalVerifierPresent':True,'actualCodecRuns':0,'actualRestores':0,'actualDirectoryVerifications':0,'ratioOrStorageAcceptanceClaimed':False},indent=2))
