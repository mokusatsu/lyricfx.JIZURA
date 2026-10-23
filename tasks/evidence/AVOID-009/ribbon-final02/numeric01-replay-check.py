import gzip,json,pathlib
raw=json.loads(gzip.decompress(pathlib.Path(__file__).with_name('numeric01.json.gz').read_bytes()))
r=raw['result']
assert r[0]['safety']=='certified-bounded-adapter'
assert r[1]['diagnostics'][0]['code']=='UNSUPPORTED_PARAMETER_RANGE'
assert r[2]['diagnostics'][0]['code']=='RIBBON_NUMERICAL_DOMAIN'
print('Existing numeric01 raw expectations validated. Original browser invocation exit1 retained; no browser rerun.')
