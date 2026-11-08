import fs from 'node:fs/promises';
import path from 'node:path';
import {byId} from '../dist/catalog.js';
import {peripherals,peripheralById} from '../dist/peripherals-brands.js';
import {foreignComponentOffers} from '../dist/foreign-prices.js';
import {emptyOverlay,applyResult,parseOffer,fetchHTML,allowedURL,hostOf,supportedHosts,robotsAllowed} from './price-refresh-core.mjs';

const root=path.resolve(import.meta.dirname,'..'),targetFile=path.join(root,'dist/live-prices.json');
const args=Object.fromEntries(process.argv.slice(2).map(s=>s.replace(/^--/,'').split('=')));
const limit=Math.max(1,Math.min(500,Number(args.limit)||500)),now=new Date(),attemptedAt=now.toISOString();
const dateParts=Object.fromEntries(new Intl.DateTimeFormat('en',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));
const date=`${dateParts.year}-${dateParts.month}-${dateParts.day}`;
let overlay;try{overlay=JSON.parse(await fs.readFile(targetFile,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;overlay=emptyOverlay();}
const targets=new Map();
function add(region,id,offer) {const product=byId[id]||peripheralById[id];if(!product||!['ru','by','usd'].includes(region)||!offer?.url)return;targets.set(region+':'+id,{region,id,product,offer});}
for(const [region,file] of [['ru','prices.json'],['by','prices-by.json']])for(const [id,offer] of Object.entries(JSON.parse(await fs.readFile(path.join(root,'dist',file),'utf8')).items))add(region,id,offer);
for(const [id,offer] of Object.entries(foreignComponentOffers))add('usd',id,offer);
for(const p of peripherals)for(const [region,offer] of Object.entries(p.offers||{}))add(region,p.id,offer);
for(const [region,items] of Object.entries(overlay.items||{}))for(const [id,offer] of Object.entries(items))add(region,id,offer);
let selected=[...targets.values()].filter(t=>(!args.region||args.region===t.region)&&(!args.host||allowedURL(t.offer.url)&&hostOf(t.offer.url)===args.host.replace(/^www\./,''))).slice(0,limit);
const grouped=new Map();for(const t of selected){const h=allowedURL(t.offer.url)?hostOf(t.offer.url):'invalid';if(!grouped.has(h))grouped.set(h,[]);grouped.get(h).push(t);}
const summary={checkedAt:attemptedAt,attempted:selected.length,updated:0,failed:0,sources:{}};
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const queue=[...grouped];
async function worker(){
 while(queue.length){const [host,rows]=queue.shift();let robots;
  if(supportedHosts.has(host))robots=await fetchHTML(new URL('/robots.txt',rows[0].offer.url).href,{maxBytes:300000});
  const sourceSummary=summary.sources[host]={attempted:rows.length,updated:0,failed:0,reasons:{}};let circuit=null,failures=0;
  for(const target of rows){
   let result;
   if(!allowedURL(target.offer.url))result={error:'unsafe-url'};
   else if(!supportedHosts.has(host))result={error:'unsupported-source'};
   else if(circuit)result={error:circuit};
   else if(robots.error&&robots.error!=='http-404'||robots.html&&/(?:<!doctype\s+html|<html\b|access denied|just a moment|подтвердите.*человек)/i.test(robots.html))result={error:'robots-unavailable'};
   else if(robots.html&&!robotsAllowed(robots.html,target.offer.url))result={error:'robots-disallowed'};
   else {await sleep(1100);const fetched=await fetchHTML(target.offer.url);result=fetched.error?fetched:parseOffer(fetched.html,target,date);}
   if(result.error==='http-429')circuit='source-rate-limited';
   else if(['http-401','http-403','access-blocked'].includes(result.error))circuit='source-blocked';
   else if(/network|timeout|http-5/.test(result.error||'')){if(++failures>=3)circuit='network-error';}else failures=0;
   applyResult(overlay,target,result,attemptedAt);
   if(result.offer){summary.updated++;sourceSummary.updated++;}
   else {summary.failed++;sourceSummary.failed++;sourceSummary.reasons[result.error]=(sourceSummary.reasons[result.error]||0)+1;}
  }
  console.log(host+': '+sourceSummary.updated+'/'+rows.length+' offers confirmed');
 }
}
await Promise.all(Array.from({length:3},worker));
// One atomic replacement prevents partially written snapshots on interruption.
const temporary=targetFile+'.tmp';await fs.writeFile(temporary,JSON.stringify(overlay,null,2)+'\n');await fs.rename(temporary,targetFile);
await fs.writeFile(path.join(root,'research/price-refresh-last-run.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
