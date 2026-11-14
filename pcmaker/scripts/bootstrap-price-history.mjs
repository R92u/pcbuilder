// Reconstruct only published dated quotes. Commit/check timestamps are never price dates.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {byId} from '../dist/catalog.js';
import {peripherals,peripheralById} from '../dist/peripherals-brands.js';
import {foreignComponentOffers} from '../dist/foreign-prices.js';
import {mergePriceObservations,historyCurrencies} from '../dist/price-history.js';

const root=path.resolve(import.meta.dirname,'..'),repo=path.resolve(root,'..'),target=path.join(root,'dist/price-history.json'),entries=[];
const known={...byId,...peripheralById};
function add(region,id,offer,snapshotSource){
 if(!known[id]||!historyCurrencies[region]||!offer)return;
 entries.push({id,region,offer:{...offer,currency:offer.currency||historyCurrencies[region],availability:offer.availability||'unknown',verification:offer.verification||'archived-snapshot',snapshotSource}});
}
function snapshot(file,data,source){
 if(file.endsWith('/live-prices.json'))for(const [region,items] of Object.entries(data.items||{}))for(const [id,offer] of Object.entries(items))add(region,id,offer,source);
 else for(const [id,offer] of Object.entries(data.items||{}))add(file.endsWith('/prices-by.json')?'by':'ru',id,offer,source);
}
// Base/peripheral and reviewed batches preserve observations that predate the live overlay.
for(const file of ['dist/prices.json','dist/prices-by.json'])snapshot(file,JSON.parse(fs.readFileSync(path.join(root,file),'utf8')),file);
for(const p of peripherals)for(const [region,offer] of Object.entries(p.offers||{}))add(region,p.id,offer,'dist/peripherals-brands.js');
for(const [id,offer] of Object.entries(foreignComponentOffers))add('usd',id,offer,'dist/foreign-prices.js');
for(const file of ['offers-by-2026-10-28.json','offers-2026-11-04.json','budget-offers-2026-11-04.json','offers-pc-2026-11-08.json','offers-peripherals-2026-11-08.json','offers-ozon-2026-11-13.json']){
 const data=JSON.parse(fs.readFileSync(path.join(root,'research',file),'utf8')),source='research/'+file;
 for(const row of data.offers||[])add(row.region==='us'?'usd':row.region,row.id,row,source);
 for(const [id,offer] of Object.entries(data.items||{}))add(offer.currency==='BYN'?'by':offer.currency==='USD'?'usd':'ru',id,offer,source);
 for(const group of ['peripherals','foreignComponents','russianComponents']){
  const rows=data[group];
  for(const [key,row] of Object.entries(rows||{}))add(row.currency==='USD'?'usd':'ru',row.id||key,row,source);
 }
}
const files=['pcmaker/dist/prices.json','pcmaker/dist/prices-by.json','pcmaker/dist/live-prices.json'];
const revisions=execFileSync('git',['log','--reverse','--format=%H','--',...files],{cwd:repo,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
let snapshots=0;
for(const revision of revisions)for(const file of files){
 let raw;try{raw=execFileSync('git',['show',revision+':'+file],{cwd:repo,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:10000000});}catch{continue;}
 snapshot(file,JSON.parse(raw),`git:${revision.slice(0,12)}:${file}`);snapshots++;
}
snapshot('dist/live-prices.json',JSON.parse(fs.readFileSync(path.join(root,'dist/live-prices.json'),'utf8')),'dist/live-prices.json');
const previous=fs.existsSync(target)?JSON.parse(fs.readFileSync(target,'utf8')):undefined;
// Backfill must not replace already recorded intraday checks with archived copies.
const recorded=[];
for(const [region,items] of Object.entries(previous?.items||{}))for(const [id,rows] of Object.entries(items))for(const offer of rows)recorded.push({region,id,offer});
const history=mergePriceObservations(mergePriceObservations(undefined,entries),recorded),text=JSON.stringify(history)+'\n';
fs.writeFileSync(target,text);
const summary=Object.fromEntries(Object.entries(history.items).map(([region,items])=>[region,{products:Object.keys(items).length,observations:Object.values(items).reduce((sum,rows)=>sum+rows.length,0),dates:[...new Set(Object.values(items).flatMap(rows=>rows.map(o=>o.date)))].sort()}]));
console.log(JSON.stringify({snapshots,bytes:Buffer.byteLength(text),regions:summary},null,2));
