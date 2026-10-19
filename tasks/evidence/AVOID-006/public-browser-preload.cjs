// Verification runtime only: keep the environment's public proxy and normal TLS.
const {chromium}=require('/workspace/lyricfx.JIZURA/mcp/node_modules/playwright');
const {publicBrowserOptions}=require('/workspace/lyricfx.JIZURA/dev/avoidance/review.cjs');
const launch=chromium.launch.bind(chromium);
chromium.launch=options=>launch({...options,...publicBrowserOptions('https://mokusatsu.github.io/lyricfx.JIZURA/')});
