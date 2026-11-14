import {dateStamp} from './price-quality.js';

export const historyCurrencies=Object.freeze({ru:'RUB',by:'BYN',usd:'USD'});
export const historyRetentionDays=120;
const day=86400000;
const calendar=new Intl.DateTimeFormat('en',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'});
const metadata=['verification','sourceTitle','kind','note','seller','sellerType','priceType','condition','sellerProofUrl','sellerVerifiedAt','snapshotSource'];
const empty=()=>({schemaVersion:1,items:{ru:{},by:{},usd:{}}});
const validId=id=>typeof id==='string'&&/^[a-z0-9][a-z0-9._-]{0,150}$/i.test(id)&&!['constructor','prototype','__proto__'].includes(id);
export function historyToday(now=Date.now()){
 const value=new Date(now);if(!Number.isFinite(value.getTime()))return null;
 const parts=Object.fromEntries(calendar.formatToParts(value).map(p=>[p.type,p.value]));
 return `${parts.year}-${parts.month}-${parts.day}`;
}
function safeURL(value){
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port||u.pathname==='/'||/(?:search|cart|checkout|account|login)(?:\/|$)/i.test(u.pathname)||['q','search','digiSearch'].some(k=>u.searchParams.has(k)))return null;u.hash='';return u.href;}catch{return null;}
}
export function priceSourceKey(offer){
 const url=safeURL(offer?.url);if(!url)return '';
 const u=new URL(url);u.hostname=u.hostname.replace(/^www\./,'');
 for(const key of [...u.searchParams.keys()])if(/^(?:utm_|at$|from_sku$|oos_search$)/i.test(key))u.searchParams.delete(key);
 u.searchParams.sort();
 return [String(offer.store||'').trim().toLowerCase(),u.href.replace(/\/(?=\?|$)/,''),String(offer.seller||'').trim().toLowerCase(),offer.kind==='manufacturer'?'manufacturer':'retail',offer.priceType||'regular',offer.condition||'new'].join('|');
}
function observation(offer,region,today){
 const stamp=dateStamp(offer?.date),end=dateStamp(today),url=safeURL(offer?.url);
 if(offer?.estimated||['estimate','estimated','planning'].includes(offer?.kind)||['estimate','estimated','planning','unverified'].includes(offer?.verification))return null;
 if(!historyCurrencies[region]||offer?.currency!==historyCurrencies[region]||!Number.isFinite(offer.price)||offer.price<=0||offer.price>10000000||stamp===null||end===null||stamp>end||stamp<end-(historyRetentionDays-1)*day||!url||typeof offer.store!=='string'||!offer.store.trim())return null;
 if(offer.condition&&offer.condition!=='new'||offer.priceType&&offer.priceType!=='regular')return null;
 if(!['in-stock','out-of-stock','unknown'].includes(offer.availability))return null;
 const result={date:offer.date,price:offer.price,currency:offer.currency,store:offer.store.trim(),url,availability:offer.availability};
 for(const key of metadata)if(typeof offer[key]==='string'&&offer[key].trim())result[key]=offer[key].trim();
 // Only a real timestamp for this observation may order checks within a day.
 if(typeof offer.observedAt==='string'&&Number.isFinite(Date.parse(offer.observedAt))&&historyToday(offer.observedAt)===offer.date)result.observedAt=new Date(offer.observedAt).toISOString();
 return result;
}
function normalizeRows(rows,region,today){
 const unique=new Map();let position=0;
 for(const row of rows){
  const offer=observation(row,region,today);if(!offer)continue;
  const key=offer.date+'|'+priceSourceKey(offer),previous=unique.get(key);
  if(previous?.offer.observedAt&&offer.observedAt&&offer.observedAt<previous.offer.observedAt)continue;
  // Replaying an identical snapshot must not make its source the newest one.
  if(previous&&JSON.stringify(previous.offer)===JSON.stringify(offer))continue;
  unique.set(key,{offer,position:position++});
 }
 return [...unique.values()].sort((a,b)=>a.offer.date.localeCompare(b.offer.date)||a.position-b.position).map(row=>row.offer);
}
export function normalizePriceHistory(data,{now=Date.now()}={}){
 const result=empty(),today=historyToday(now);if(data?.schemaVersion!==1||!today)return result;
 for(const region of Object.keys(historyCurrencies))for(const id of Object.keys(data.items?.[region]||{}).sort()){
  if(!validId(id)||!Array.isArray(data.items[region][id]))continue;
  const rows=normalizeRows(data.items[region][id],region,today);if(rows.length)result.items[region][id]=rows;
 }
 return result;
}
export function mergePriceObservations(history,entries,{now=Date.now()}={}){
 const next=normalizePriceHistory(history,{now});
 for(const {region,id,offer} of entries){
  if(!historyCurrencies[region]||!validId(id))continue;
  (next.items[region][id]??=[]).push(offer);
 }
 return normalizePriceHistory(next,{now});
}
export const appendPriceObservation=(history,entry,options)=>mergePriceObservations(history,[entry],options);
// A failed check or retained manual quote is not a new observation.
export function recordRefreshObservations(history,results,{now=Date.now(),observedAt}={}){
 const entries=results.filter(item=>item.result?.offer).map(item=>({id:item.id,region:item.region,offer:{...item.result.offer,...(observedAt?{observedAt}:{})}}));
 return mergePriceObservations(history,entries,{now});
}
function windowFor({region='ru',days=30,now=Date.now()}={}){
 const endDate=historyToday(now),length=[7,30,90].includes(Number(days))?Number(days):30;
 const startDate=endDate?new Date(dateStamp(endDate)-(length-1)*day).toISOString().slice(0,10):null;
 return {region,currency:historyCurrencies[region]||null,days:length,startDate,endDate,now};
}
function dailyRows(history,id,region){
 const daily=new Map(),rows=validId(id)&&Object.hasOwn(history.items[region]||{},id)?history.items[region][id]:[];
 for(const row of rows)daily.set(row.date,row);
 return [...daily.values()];
}
export function componentPriceSeries(history,id,options={}){
 const {now,...range}=windowFor(options),data=normalizePriceHistory(history,{now}),all=dailyRows(data,id,range.region);
 const rows=all.filter(p=>p.date>=range.startDate&&p.date<=range.endDate);
 const points=rows.map((offer,index)=>{
  const previous=rows[index-1],sourceKey=priceSourceKey(offer),sourceChanged=!!previous&&sourceKey!==priceSourceKey(previous);
  return {...offer,sourceKey,sourceChanged,comparableToPrevious:!!previous&&!sourceChanged};
 });
 return {id,...range,points,availableCount:points.length,allTimeCount:all.length};
}
export function buildPriceSeries(history,ids,options={}){
 const {now,...range}=windowFor(options),data=normalizePriceHistory(history,{now}),members=[...new Set((Array.isArray(ids)?ids:[]).filter(validId))];
 const rows=new Map(members.map(id=>[id,new Map(dailyRows(data,id,range.region).map(row=>[row.date,row]))]));
 const allDates=[...new Set([...rows.values()].flatMap(map=>[...map.keys()]))].sort(),dates=allDates.filter(date=>date>=range.startDate&&date<=range.endDate);
 const points=dates.map(date=>{
  const quotes=Object.fromEntries(members.filter(id=>rows.get(id).has(date)).map(id=>[id,rows.get(id).get(date)])),known=Object.keys(quotes).length;
  const missingIds=members.filter(id=>!quotes[id]),unavailableIds=members.filter(id=>quotes[id]?.availability==='out-of-stock'),unknownAvailabilityIds=members.filter(id=>quotes[id]?.availability==='unknown');
  const complete=members.length>0&&known===members.length;
  return {date,total:Math.round(Object.values(quotes).reduce((sum,quote)=>sum+quote.price,0)*100)/100,currency:range.currency,known,totalCount:members.length,complete,missingIds,unavailableIds,unknownAvailabilityIds,purchasable:complete&&!unavailableIds.length&&!unknownAvailabilityIds.length,sources:Object.fromEntries(Object.entries(quotes).map(([id,quote])=>[id,priceSourceKey(quote)]))};
 });
 for(let index=0;index<points.length;index++){
  const point=points[index],previous=points[index-1];
  point.sourceChangedIds=previous?members.filter(id=>previous.sources[id]&&point.sources[id]&&previous.sources[id]!==point.sources[id]):[];
  point.comparableToPrevious=!!previous&&previous.complete&&point.complete&&!point.sourceChangedIds.length;
 }
 return {...range,ids:members,points,availableCount:points.length,allTimeCount:allDates.length};
}
