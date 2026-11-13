import {productLinksBy} from './store-links-by.js';
import {productLinksOzon} from './store-links-ozon.js';
import {isApprovedOzonOffer,isOzonOffer,ozonProductURL} from './ozon-policy.js';
import {foreignComponentOffers} from './foreign-prices.js';
import {validForeignOffer} from './money.js';
import {dateStamp} from './price-quality.js';
import {byId} from './catalog.js';
import {getLivePrices,updatedOffer} from './live-price-data.js';
export const belarusStores={'5element.by':'5 элемент','tec.by':'TEC.BY','tecno.by':'TECNO','onlife.by':'OnLife','time-shop.by':'Time-Shop','nexton.by':'Nexton','masterdom.by':'Мастердом','cybermarket.by':'Cybermarket','unifox.by':'Unifox','ultraprice.by':'Ultraprice'};
export function byStoreProduct(link){
 try{const u=new URL(link),host=u.hostname.replace(/^www\./,'');
  if(u.protocol!=='https:'||u.username||u.password||u.port||!belarusStores[host]||u.pathname==='/'||/search/i.test(u.pathname)||['q','search','digiSearch'].some(k=>u.searchParams.has(k)))return null;
  if(host==='5element.by'&&!/^\/products\/[^/]+\/?$/.test(u.pathname))return null;
  return {url:u.href,store:belarusStores[host]};
 }catch{return null;}
}
export const regions={
 ru:{id:'ru',name:'Россия',city:'Москва',cityGenitive:'Москвы',currency:'RUB',symbol:'₽',file:'prices.json',minBudget:1000,maxBudget:2000000,defaultBudget:100000,presets:[80000,120000,200000]},
 by:{id:'by',name:'Беларусь',city:'Минск',cityGenitive:'Минска',currency:'BYN',symbol:'BYN',file:'prices-by.json',minBudget:100,maxBudget:100000,defaultBudget:4000,presets:[3000,5000,8000]}
};
export const regionFor=id=>regions[id]||regions.ru;
export const regionFromCurrency=currency=>currency==='BYN'?regions.by:regions.ru;
export function priceSnapshot(data,id){
 const region=regionFor(id),items={};
 for(const [key,value] of Object.entries(data?.items||{})){
  if((value.currency||data.currency||'RUB')!==region.currency||!Number.isFinite(value.price)||value.price<=0)continue;
  if(dateStamp(value.date)===null)continue;
  if(id!=='by'&&isOzonOffer(value)&&!isApprovedOzonOffer({...value,currency:value.currency||data.currency||'RUB'}))continue;
  try{const u=new URL(value.url);if(u.protocol!=='https:'||u.username||u.password||u.port||id==='by'&&!byStoreProduct(value.url))continue;}catch{continue;}
  items[key]={...value,currency:region.currency};
 }
 return {...data,region:region.id,currency:region.currency,items};
}
export function regionalSnapshot(data,id,live=getLivePrices()){
 const snapshot=priceSnapshot(data,id),local={...snapshot.items};
 for(const key of new Set([...Object.keys(local),...Object.keys(live.items?.[id]||{})])){
  if(!byId[key])continue;
  const offer=updatedOffer(key,id,local[key],live);
  if(offer&&(id!=='by'||byStoreProduct(offer.url)))snapshot.items[key]=offer;
 }
 if(snapshot.region==='ru')for(const key of new Set([...Object.keys(foreignComponentOffers),...Object.keys(live.items?.usd||{})])){
  const offer=updatedOffer(key,'usd',foreignComponentOffers[key],live);
  if(byId[key]&&!snapshot.items[key]&&validForeignOffer(offer))snapshot.items[key]=offer;
 }
 return snapshot;
}
function isByProduct(link){
 try{
  const u=new URL(link);
  return u.protocol==='https:'&&['5element.by','www.5element.by'].includes(u.hostname)
   &&/^\/products\/[^/]+\/?$/.test(u.pathname)&&!u.searchParams.has('digiSearch')
   &&!u.username&&!u.password&&!u.port;
 }catch{return false;}
}
export function ozonStoreProduct(link){
 const url=ozonProductURL(link);return url?{url,store:'Ozon'}:null;
}
export function storeLink(part,category,data={},source={}){
 if(data.currency==='BYN'){
  const candidate=[productLinksBy[part.id],data.items?.[part.id]?.url,source?.storeUrl].find(isByProduct);
  if(candidate)return {url:candidate,label:'Товар в 5 элементе ↗'};
  const alternative=byStoreProduct(data.items?.[part.id]?.url);
  return alternative?{url:alternative.url,label:'Товар в '+alternative.store+' ↗'}:{
   url:'https://5element.by/?digiSearch=true&term='+encodeURIComponent(part.sku||part.name)+'&params=%7Csort%3DDEFAULT',
   label:'Найти в 5 элементе ↗'
  };
 }
 const candidate=[productLinksOzon[part.id],data.ozonLinks?.[part.id],data.items?.[part.id]?.url].map(ozonStoreProduct).find(Boolean);
 return candidate?{url:candidate.url,label:'Товар на Ozon ↗'}:{url:'https://www.ozon.ru/search/?text='+encodeURIComponent(part.sku||part.name),label:'Найти на Ozon ↗'};
}
export const marketLink=part=>'https://market.yandex.ru/search?text='+encodeURIComponent(part.sku||part.name);
export const ozonOfferNotice='На Ozon выбирай продавца Ozon или официальный магазин бренда. Сравнивай обычную цену без Ozon Карты.';
export const authenticityNotice='Проверь продавца, оригинальность и гарантию перед покупкой. Наличие товара на маркетплейсе не подтверждает его подлинность.';
