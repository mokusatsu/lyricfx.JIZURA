// Shared launch policy. Tests keep their own assertions and routing.
const {chromium}=require('playwright');
exports.launch = (options={}) => chromium.launch({headless:true,...options,...(process.env.JIZURA_BROWSER?{executablePath:process.env.JIZURA_BROWSER}:{})});
