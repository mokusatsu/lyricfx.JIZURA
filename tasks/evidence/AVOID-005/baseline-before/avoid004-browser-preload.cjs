const {chromium}=require('playwright');
const launch=chromium.launch.bind(chromium);
chromium.launch=options=>launch({...options,executablePath:process.env.JIZURA_BROWSER});
