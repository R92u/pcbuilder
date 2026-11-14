// Import only independently reviewed exact-product observations, retaining evidence
// in research/. Re-importing the same batch is idempotent.
import fs from 'node:fs';
import path from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import {pathToFileURL} from 'node:url';
import {byId} from '../dist/catalog.js';
import {peripheralById} from '../dist/peripherals-brands.js';
import {validLiveOffer} from '../dist/live-price-data.js';
import {byStoreProduct} from '../dist/regions.js';
import {isApprovedOzonOffer} from '../dist/ozon-policy.js';
import {priceQuality} from '../dist/price-quality.js';
import {mergePriceObservations} from '../dist/price-history.js';
const rank=o=>(o.kind==='manufacturer'?0:1)+(o.availability==='in-stock'?3:o.availability==='unknown'?1:0);
export function keepPreviousReviewedOffer(previous,offer,now=Date.now()){
 if(!previous)return false;
 if(previous.date!==offer.date)return previous.date>offer.date;
 const preferred=o=>isApprovedOzonOffer(o)&&priceQuality(o,now).status==='fresh'&&o.availability!=='out-of-stock';
 if(preferred(previous)!==preferred(offer))return preferred(previous);
 return rank(previous)>rank(offer)||rank(previous)===rank(offer)&&previous.price<offer.price;
}
export function importReviewedOffers(files){
 if(!files.length)throw Error('Usage: node scripts/import-reviewed-offers.mjs research/batch.json [...]');
 const target=path.resolve(import.meta.dirname,'../dist/live-prices.json'),live=JSON.parse(fs.readFileSync(target,'utf8'));
 const historyFile=path.resolve(import.meta.dirname,'../dist/price-history.json'),history=fs.existsSync(historyFile)?JSON.parse(fs.readFileSync(historyFile,'utf8')):undefined,observations=[];
 let count=0,kept=0;
for(const file of files){
 const batch=JSON.parse(fs.readFileSync(path.resolve(file),'utf8'));
 for(const row of batch.offers){
  const {id,region:rawRegion,evidence,...offer}=row,region=rawRegion==='us'?'usd':rawRegion;
  if(!evidence||(!byId[id]&&!peripheralById[id])||!validLiveOffer(offer,region)||region==='by'&&!byStoreProduct(offer.url))throw Error('Invalid reviewed offer '+id);
  const previous=live.items[region]?.[id],candidate={...offer,verification:'reviewed-source'};
  observations.push({id,region,offer:candidate});
  if(isDeepStrictEqual(previous,candidate)){kept++;continue;}
  if(keepPreviousReviewedOffer(previous,offer)){kept++;continue;}
  (live.items[region]??={})[id]=candidate;
  (live.checks[region]??={})[id]={attemptedAt:new Date().toISOString(),status:'updated',reason:null,url:offer.url};count++;
 }
}
if(count){live.checkedAt=new Date().toISOString();fs.writeFileSync(target,JSON.stringify(live,null,2)+'\n');}
if(observations.length){const updated=mergePriceObservations(history,observations);fs.writeFileSync(historyFile+'.tmp',JSON.stringify(updated)+'\n');fs.renameSync(historyFile+'.tmp',historyFile);}
console.log(`Imported ${count} reviewed observations; retained ${kept} newer or better documented offers.`);
 return {count,kept};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)importReviewedOffers(process.argv.slice(2));
