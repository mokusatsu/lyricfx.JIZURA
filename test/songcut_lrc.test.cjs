const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const J = {
  LAYOUT_ORDER: [],
  ENTER_ORDER: [],
  EXIT_ORDER: [],
  HOLD_ORDER: [],
  DECOR_ORDER: [],
  clamp: (v, min, max) => Math.max(min, Math.min(max, v))
};

const code = fs.readFileSync(path.resolve(__dirname, '../src/08_planner.js'), 'utf8');

const context = {
  J,
  console,
  Math,
  String,
  Number,
  parseInt,
  parseFloat,
  isFinite,
  Intl,
  crypto
};
vm.createContext(context);
vm.runInContext(code, context);

console.log('[*] Testing J.parseSongcutLRC...');

// 1. Standard Songcut LRC line with start tag, end tag, and escaped characters
const lrcSample1 = `[00:01.23]<00:01.23>Hello World\\nNext Line<00:03.45>
[00:05.50]<00:05.50>Price: $100 & Math: 1 < 2 > 0 and \\\\ escaped<00:08.00>`;

const res1 = J.parseSongcutLRC(lrcSample1);
assert.strictEqual(res1.ok, true, 'Parsing res1 should succeed');
assert.strictEqual(res1.entries.length, 2, 'Should have 2 entries');
assert.strictEqual(res1.entries[0].startTime, 1.23, 'Entry 0 start time should be 1.23');
assert.strictEqual(res1.entries[1].startTime, 5.50, 'Entry 1 start time should be 5.50');

// Verify end tag <00:03.45> is stripped from body
assert.strictEqual(res1.entries[0].body.includes('<00:03.45>'), false, 'End tag should be stripped from body');
// Verify internal < 2 > in lyric text is preserved
assert.strictEqual(res1.entries[1].body.includes('< 2 >'), true, 'Internal bracket-like text should be preserved');
// Verify newlines and backslashes are properly restored/escaped
assert.strictEqual(res1.entries[0].body.includes('\n'), true, 'Escaped newline should be converted to literal newline');

// 2. End tag with time EARLIER than start time: per specification, must NOT be rejected!
const lrcSample2 = `[00:10.00]<00:10.00>Backward end time<00:02.00>`;
const res2 = J.parseSongcutLRC(lrcSample2);
assert.strictEqual(res2.ok, true, 'Earlier end tag must not reject line');
assert.strictEqual(res2.entries[0].startTime, 10.00);
assert.strictEqual(res2.entries[0].body.includes('Backward end time'), true);
assert.strictEqual(res2.entries[0].body.includes('<00:02.00>'), false);

// 3. Special markup characters (*, ~, |, !, {}) should be protected from JIZURA formatting
const lrcSample3 = `[00:01.00]<00:01.00>*Not Emphasized* and ~Not Soft~ and |Not Note|! and {Not Group}<00:03.00>`;
const res3 = J.parseSongcutLRC(lrcSample3);
assert.strictEqual(res3.ok, true);
// In the raw compiled lyric text, markup characters should be escaped with backslash
assert.strictEqual(res3.entries[0].body.includes('\\*Not Emphasized\\*'), true, 'Asterisks should be escaped');
assert.strictEqual(res3.entries[0].body.includes('\\|Not Note\\|'), true, 'Pipe should be escaped');

// 4. All-or-nothing validation on invalid format: 1 broken line halts entire parse
const lrcInvalid = `[00:01.00]<00:01.00>Line 1<00:02.00>
Invalid line without timestamp tag
[00:05.00]<00:05.00>Line 3<00:06.00>`;
const resInvalid = J.parseSongcutLRC(lrcInvalid);
assert.strictEqual(resInvalid.ok, false, 'Invalid line should reject entire LRC');
assert.strictEqual(typeof resInvalid.error, 'string', 'Should return human-readable error');
console.log('  Expected error message on invalid line:', resInvalid.error);

// 5. Normal LRC format (no Songcut tags)
const lrcNormal = `[00:01.00] Normal LRC line 1
[00:04.50] Normal LRC line 2`;
const resNormal = J.parseSongcutLRC(lrcNormal);
assert.strictEqual(resNormal.ok, true, 'Normal LRC lines should be accepted');
assert.strictEqual(resNormal.entries.length, 2);
assert.strictEqual(resNormal.entries[0].startTime, 1.00);
assert.strictEqual(resNormal.entries[1].startTime, 4.50);

console.log('[SUCCESS] All Songcut LRC parser tests passed!');
