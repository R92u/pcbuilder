// Import only independently reviewed exact-product observations, retaining evidence
// in research/. Re-importing the same batch is idempotent.
import fs from 'node:fs';
import path from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import {byId} from '../dist/catalog.js';
import {peripheralById} from '../dist/peripherals-brands.js';
import {validLiveOffer} from '../dist/live-price-data.js';
import {byStoreProduct} from '../dist/regions.js';
const files=process.argv.slice(2);if(!files.length)throw Error('Usage: node scripts/import-reviewed-offers.mjs research/batch.json [...]');
const target=path.resolve(import.meta.dirname,'../dist/live-prices.json'),live=JSON.parse(fs.readFileSync(target,'utf8'));
let count=0,kept=0;
const rank=o=>(o.kind==='manufacturer'?0:1)+(o.availability==='in-stock'?3:o.availability==='unknown'?1:0);
for(const file of files){
 const batch=JSON.parse(fs.readFileSync(path.resolve(file),'utf8'));
 for(const row of batch.offers){
  const {id,region:rawRegion,evidence,...offer}=row,region=rawRegion==='us'?'usd':rawRegion;
  if(!evidence||(!byId[id]&&!peripheralById[id])||!validLiveOffer(offer,region)||region==='by'&&!byStoreProduct(offer.url))throw Error('Invalid reviewed offer '+id);
  const previous=live.items[region]?.[id],candidate={...offer,verification:'reviewed-source'};
  if(isDeepStrictEqual(previous,candidate)){kept++;continue;}
  if(previous&&(previous.date>offer.date||previous.date===offer.date&&(rank(previous)>rank(offer)||rank(previous)===rank(offer)&&previous.price<offer.price))){kept++;continue;}
  (live.items[region]??={})[id]=candidate;
  (live.checks[region]??={})[id]={attemptedAt:new Date().toISOString(),status:'updated',reason:null,url:offer.url};count++;
 }
}
if(count){live.checkedAt=new Date().toISOString();fs.writeFileSync(target,JSON.stringify(live,null,2)+'\n');}
console.log(`Imported ${count} reviewed observations; retained ${kept} newer or better documented offers.`);
