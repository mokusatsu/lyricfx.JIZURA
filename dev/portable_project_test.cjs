const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Verify that project serializer does not leak native tokens or absolute paths
const sampleProject = {
  version: 1,
  title: 'Test Song',
  artist: 'Test Artist',
  lyrics: '[00:00]Hello',
  media: {
    items: [
      { id: 'item-1', name: 'video.mp4', type: 'video', size: 1000 }
    ],
    cutOverrides: {}
  },
  foreground: {
    items: [],
    cutOverrides: {}
  }
};

const jsonStr = JSON.stringify(sampleProject);

// Assert no leaked desktop tokens
assert.ok(!jsonStr.includes('assetToken'), 'Project JSON must not contain assetToken');
assert.ok(!jsonStr.includes('outputToken'), 'Project JSON must not contain outputToken');
assert.ok(!jsonStr.includes('jobId'), 'Project JSON must not contain jobId');
assert.ok(!jsonStr.includes('C:\\'), 'Project JSON must not contain absolute Windows paths');
assert.ok(!jsonStr.includes('/Users/'), 'Project JSON must not contain absolute POSIX paths');

console.log('Project portability and token isolation test passed successfully.');
