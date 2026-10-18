// Analysis-only platform adaptation. Existing test files and assertions are unchanged.
const {chromium}=require('playwright');
const launch=chromium.launch.bind(chromium);
chromium.launch=options=>launch({...options,executablePath:'/usr/bin/chromium'});
