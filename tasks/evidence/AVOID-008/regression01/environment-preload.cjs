require('./snapshot/dev/avoidance/layouts-b-browser-preload.cjs');
const {chromium}=require('playwright');
const launch=chromium.launch.bind(chromium);
chromium.launch=async opts=>{const b=await launch(opts);const newPage=b.newPage.bind(b);b.newPage=async options=>{const p=await newPage(options);const route=p.route.bind(p);p.route=(pattern,handler,...rest)=>route(pattern,(r,...args)=>{const u=new URL(r.request().url());return ['localhost','127.0.0.1','test'].includes(u.hostname)?handler(r,...args):r.abort();},...rest);return p;};return b;};
