import fs from 'node:fs/promises';
import path from 'node:path';
import {byId} from '../dist/catalog.js';
import {peripherals,peripheralById} from '../dist/peripherals-brands.js';
import {foreignComponentOffers} from '../dist/foreign-prices.js';
import {emptyOverlay,applyResult,parseOffer,fetchHTML,hostOf,supportedHosts,robotsAllowed} from './price-refresh-core.mjs';
import {createRefreshPlan,planSummary,runRefreshPlan,updateHostCircuit} from './price-refresh-plan.mjs';
import {recordRefreshObservations} from '../dist/price-history.js';

const root=path.resolve(import.meta.dirname,'..'),targetFile=path.join(root,'dist/live-prices.json');
const args=Object.fromEntries(process.argv.slice(2).map(s=>s.replace(/^--/, '').split('=')));
const limit=Math.max(1,Math.min(500,Number(args.limit)||500)),now=new Date(),attemptedAt=now.toISOString();
const scope={region:args.region||'all',host:args.host?.replace(/^www\./,'')||'all',limit};
const dateParts=Object.fromEntries(new Intl.DateTimeFormat('en',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));
const date=`${dateParts.year}-${dateParts.month}-${dateParts.day}`;
let overlay;try{overlay=JSON.parse(await fs.readFile(targetFile,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;overlay=emptyOverlay();}
const entries=[];
function add(region,id,offer){entries.push({region,id,offer});}
// Current source first, then other previously reviewed exact product cards.
for(const [region,items] of Object.entries(overlay.items||{}))for(const [id,offer] of Object.entries(items))add(region,id,offer);
for(const [region,file] of [['ru','prices.json'],['by','prices-by.json']])for(const [id,offer] of Object.entries(JSON.parse(await fs.readFile(path.join(root,'dist',file),'utf8')).items))add(region,id,offer);
for(const [id,offer] of Object.entries(foreignComponentOffers))add('usd',id,offer);
for(const p of peripherals)for(const [region,offer] of Object.entries(p.offers||{}))add(region,p.id,offer);
for(const file of ['offers-pc-2026-11-08.json','offers-peripherals-2026-11-08.json']){
 const data=JSON.parse(await fs.readFile(path.join(root,'research',file),'utf8'));
 for(const offer of data.offers||[])add(offer.region,offer.id,offer);
}
const selected=createRefreshPlan({...byId,...peripheralById},entries,{region:args.region,host:args.host,limit,now:now.getTime()});
if(args.plan==='true'){
 console.log(JSON.stringify({planned:true,scope,...planSummary(selected)},null,2));
}else{
 const summary={checkedAt:attemptedAt,scope,attempted:selected.length,updated:0,failed:0,manualRetained:0,offerAttempts:0,fallbackUpdated:0,withBackup:planSummary(selected).withBackup,sources:{}};
 const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms)),hosts=new Map();
 async function attempt(target){
  const host=hostOf(target.offer.url);
  if(!hosts.has(host)){
   const robots=supportedHosts.has(host)?await fetchHTML(new URL('/robots.txt',target.offer.url).href,{maxBytes:300000}):null;
   hosts.set(host,{robots,circuit:null,circuitCause:null,failures:0});
  }
  const state=hosts.get(host),robots=state.robots;
  const source=summary.sources[host]??={attempted:0,updated:0,failed:0,reasons:{},causes:{}};
  let result;
  if(!supportedHosts.has(host))result={error:'unsupported-source',requestAttempts:0};
  else if(state.circuit)result={error:state.circuit,cause:state.circuitCause,requestAttempts:0};
  else if(robots.error&&robots.error!=='http-404')result={error:'robots-unavailable',cause:robots.error,httpStatus:robots.httpStatus,requestAttempts:robots.attempts};
  else if(robots.html&&/(?:<!doctype\s+html|<html\b|access denied|just a moment|подтвердите.*человек)/i.test(robots.html))result={error:'robots-unavailable',cause:'non-text-response',httpStatus:robots.httpStatus,requestAttempts:robots.attempts};
  else if(robots.html&&!robotsAllowed(robots.html,target.offer.url))result={error:'robots-disallowed',requestAttempts:0};
  else{
   await sleep(host==='regard.ru'?3000:1200);
   const fetched=await fetchHTML(target.offer.url);
   result=fetched.error?fetched:{...parseOffer(fetched.html,target,date),httpStatus:fetched.httpStatus,requestAttempts:fetched.attempts};
  }
  updateHostCircuit(state,result);
  summary.offerAttempts++;source.attempted++;
  if(result.offer)source.updated++;
  else{
   source.failed++;source.reasons[result.error]=(source.reasons[result.error]||0)+1;
   if(result.cause)source.causes[result.cause]=(source.causes[result.cause]||0)+1;
  }
  if(source.attempted%25===0)console.log(host+': '+source.attempted+' candidates checked, '+source.updated+' confirmed');
  return result;
 }
 console.log('Refreshing '+selected.length+' product/region groups; '+summary.withBackup+' have known alternative cards.');
 const results=await runRefreshPlan(selected,{attempt,now:now.getTime()});
 for(const item of results){
  // Apply once: a failed backup must never overwrite a successful primary check.
  applyResult(overlay,item.target,item.result,attemptedAt);
  overlay.checks[item.region][item.id].attempts=item.attempts;
  if(item.manualRetained)summary.manualRetained++;
  else if(item.result.offer){summary.updated++;if(item.fallbackUpdated)summary.fallbackUpdated++;}
  else summary.failed++;
 }
 for(const [host,source] of Object.entries(summary.sources))console.log(host+': '+source.updated+'/'+source.attempted+' offers confirmed');
 const temporary=targetFile+'.tmp';await fs.writeFile(temporary,JSON.stringify(overlay,null,2)+'\n');await fs.rename(temporary,targetFile);
 const historyFile=path.join(root,'dist/price-history.json');let previousHistory;
 try{previousHistory=JSON.parse(await fs.readFile(historyFile,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
 const history=recordRefreshObservations(previousHistory,results,{now:now.getTime(),observedAt:attemptedAt});
 await fs.writeFile(historyFile+'.tmp',JSON.stringify(history)+'\n');await fs.rename(historyFile+'.tmp',historyFile);
 await fs.writeFile(path.join(root,'research/price-refresh-last-run.json'),JSON.stringify(summary,null,2)+'\n');
 console.log(JSON.stringify(summary,null,2));
}
