// Clone controls and mutations use the same serving/validation path.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { validate } = require('./review.cjs');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
(async () => {
  const source = path.resolve(process.argv[2]);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'avoidance-negative-'));
  let count = 0;
  const clone = name => {
    const dir = path.join(tmp, name);
    fs.cpSync(source, dir, { recursive: true });
    return dir;
  };
  try {
    await validate(clone('positive'));
    const mutations = [
      ['missing image', (d,m) => fs.unlinkSync(path.join(d,m.cases[0].before.path)), /ENOENT/],
      ['wrong PNG hash', (d,m) => { m.cases[0].after.sha256='0'.repeat(64); }, /PNG hash/],
      ['condition mismatch', (d,m) => { m.cases[0].after.conditionsSHA256='bad'; }, /conditions after/],
      ['missing H-ID', (d,m) => { m.hids.pop(); }, /manifest H-ID list/],
      ['missing case', (d,m) => { m.cases.pop(); }, /incomplete capture matrix/],
      ['source mismatch', (d,m) => { m.cases[0].after.sourceSHA256='bad'; }, /source identity/],
      ['broken HTML link', (d,m) => {
        fs.appendFileSync(path.join(d,'index.html'),'<a href="absent.png">broken</a>');
        m.assets['index.html']=sha(fs.readFileSync(path.join(d,'index.html')));
      }, /link absent.png/]
    ];
    for (const [name, mutate, expected] of mutations) {
      const dir=clone(String(count));
      const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json')));
      mutate(dir,manifest);
      fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest));
      await assert.rejects(validate(dir), expected, name);
      console.log(name, 'rejected for expected reason');
      count++;
    }
    console.log(JSON.stringify({positiveControls:1,negativeChecks:count}));
  } finally {
    fs.rmSync(tmp,{recursive:true,force:true});
  }
})().catch(error => { console.error(error); process.exitCode=1; });
