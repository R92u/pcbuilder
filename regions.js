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
  try{const u=new URL(value.url);if(u.protocol!=='https:'||id==='by'&&!['5element.by','www.5element.by'].includes(u.hostname))continue;}catch{continue;}
  items[key]={...value,currency:region.currency};
 }
 return {...data,region:region.id,currency:region.currency,items};
}
export const byCategories={cooler:'1683-sistemy-ohlazhdeniya-pk',gpu:'1675-videokarty',psu:'1673-bloki-pitaniya',ram:'1677-operativnaya-pamyat',case:'1669-korpusa-pk',motherboard:'1679-materinskie-platy',storage:'309-zhestkie-diski-ssd'};
export function storeLink(part,category,data={},source={}){
 if(data.currency==='BYN'){
  const offer=data.items?.[part.id];return offer?.url?{url:offer.url,label:'Товар в 5element ↗'}:{url:byCategories[category]?'https://5element.by/catalog/'+byCategories[category]:'https://5element.by/',label:'Каталог 5element ↗'};
 }
 const candidate=[data.dnsLinks?.[part.id],source?.storeUrl,data.items?.[part.id]?.url].find(link=>{try{const u=new URL(link);return u.protocol==='https:'&&u.hostname.replace(/^www\./,'')==='dns-shop.ru'&&u.pathname.startsWith('/product/');}catch{return false;}});
 return candidate?{url:candidate,label:'Товар в DNS ↗'}:{url:'https://www.dns-shop.ru/search/?q='+encodeURIComponent(part.sku||part.name),label:'Найти в DNS ↗'};
}
export const marketLink=part=>'https://market.yandex.ru/search?text='+encodeURIComponent(part.sku||part.name);
export const authenticityNotice='Проверь продавца, оригинальность и гарантию перед покупкой. Наличие товара на маркетплейсе не подтверждает его подлинность.';
