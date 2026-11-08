import {priceQuality,dateStamp} from './price-quality.js';

const currencies={ru:'RUB',by:'BYN',usd:'USD'};
const empty=()=>({schemaVersion:1,items:{ru:{},by:{},usd:{}},checks:{ru:{},by:{},usd:{}}});
let current=empty();
export const getLivePrices=()=>current;
export function validLiveOffer(offer,region,now=Date.now()){
 if(!currencies[region]||offer?.currency!==currencies[region]||!offer.store||priceQuality(offer,now).status==='invalid')return false;
 if(!['in-stock','out-of-stock','unknown'].includes(offer.availability))return false;
 try{const u=new URL(offer.url);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&u.pathname!=='/'&&!/search/i.test(u.pathname);}catch{return false;}
}
export function sanitizeLivePrices(data,now=Date.now()){
 const result=empty();if(data?.schemaVersion!==1)return result;
 if(dateStamp(data.checkedAt?.slice(0,10))!==null)result.checkedAt=data.checkedAt;
 for(const region of Object.keys(currencies)){
  for(const [id,offer] of Object.entries(data.items?.[region]||{}))if(validLiveOffer(offer,region,now))result.items[region][id]={...offer};
  for(const [id,check] of Object.entries(data.checks?.[region]||{}))if(check&&['updated','blocked','unavailable','unverified','error'].includes(check.status)&&dateStamp(check.attemptedAt?.slice(0,10))!==null)result.checks[region][id]={...check};
 }return result;
}
export function setLivePrices(data,now=Date.now()){current=sanitizeLivePrices(data,now);return current;}
export async function loadLivePrices(fetcher=fetch){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
 try{const response=await fetcher('./live-prices.json',{cache:'no-cache',signal:controller.signal});if(!response.ok)throw Error('Price snapshot unavailable');const data=await response.json();if(data?.schemaVersion!==1||!data.items||typeof data.items!=='object'||Array.isArray(data.items))throw Error('Invalid price snapshot');return setLivePrices(data);}
 catch{return current;}finally{clearTimeout(timeout);}
}
export function updatedOffer(id,region,base,live=current,now=Date.now()){
 const update=live?.items?.[region]?.[id],useUpdate=validLiveOffer(update,region,now)&&(!base||priceQuality(base,now).status==='invalid'||update.date>=base.date);
 const offer=useUpdate?update:base;if(!offer)return undefined;
 const check=live?.checks?.[region]?.[id],priceCheck=check?.url===offer.url&&check.attemptedAt?.slice(0,10)>=offer.date?check:undefined;
 return {...offer,currency:offer.currency||currencies[region],...(priceCheck?{priceCheck}:{})};
}
export function updatedOffers(id,base={},live=current,now=Date.now()){
 return Object.fromEntries(Object.keys(currencies).map(region=>[region,updatedOffer(id,region,base[region],live,now)]).filter(([,offer])=>offer));
}
