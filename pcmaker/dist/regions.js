import {productLinksBy} from './store-links-by.js';
import {dateStamp} from './price-quality.js';
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
  try{const u=new URL(value.url);if(u.protocol!=='https:'||u.username||u.password||u.port||id==='by'&&!byStoreProduct(value.url))continue;}catch{continue;}
  items[key]={...value,currency:region.currency};
 }
 return {...data,region:region.id,currency:region.currency,items};
}
function isByProduct(link){
 try{
  const u=new URL(link);
  return u.protocol==='https:'&&['5element.by','www.5element.by'].includes(u.hostname)
   &&/^\/products\/[^/]+\/?$/.test(u.pathname)&&!u.searchParams.has('digiSearch')
   &&!u.username&&!u.password&&!u.port;
 }catch{return false;}
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
 const candidate=[data.dnsLinks?.[part.id],source?.storeUrl,data.items?.[part.id]?.url].find(link=>{try{const u=new URL(link);return u.protocol==='https:'&&u.hostname.replace(/^www\./,'')==='dns-shop.ru'&&u.pathname.startsWith('/product/');}catch{return false;}});
 return candidate?{url:candidate,label:'Товар в DNS ↗'}:{url:'https://www.dns-shop.ru/search/?q='+encodeURIComponent(part.sku||part.name),label:'Найти в DNS ↗'};
}
export const marketLink=part=>'https://market.yandex.ru/search?text='+encodeURIComponent(part.sku||part.name);
export const authenticityNotice='Проверь продавца, оригинальность и гарантию перед покупкой. Наличие товара на маркетплейсе не подтверждает его подлинность.';
