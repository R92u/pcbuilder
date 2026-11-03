import {priceQuality} from './price-quality.js';

export const foreignPriceNotice='Цена зарубежного магазина в USD. Доставка, налоги и пошлины не включены; возможность доставки уточни у продавца.';
export const currencyOf=(offer,fallback='RUB')=>offer?.currency||fallback;
export function formatMoney(value,currency='RUB'){
 const number=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(value);
 return currency==='USD'?'$'+number:number+' '+({RUB:'₽',BYN:'BYN'}[currency]||currency);
}
export function priceTotals(offers,fallback='RUB'){
 const cents={};
 for(const offer of offers){
  if(!Number.isFinite(offer?.price)||offer.price<=0)continue;
  const currency=currencyOf(offer,fallback);
  if(!['RUB','BYN','USD'].includes(currency))continue;
  cents[currency]=(cents[currency]||0)+Math.round(offer.price*100);
 }
 return Object.fromEntries(Object.entries(cents).map(([currency,value])=>[currency,value/100]));
}
export function formatTotals(totals){
 return ['RUB','BYN','USD'].filter(c=>totals?.[c]>0).map(c=>formatMoney(totals[c],c)).join(' + ')||'Нет цены';
}
export function validForeignOffer(offer,now=Date.now()){
 if(offer?.currency!=='USD'||!offer.store||priceQuality(offer,now).status==='invalid')return false;
 try{const u=new URL(offer.url);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&u.pathname!=='/';}catch{return false;}
}
export function selectRegionalOffer(offers,region='ru',now=Date.now()){
 const currency=region==='by'?'BYN':'RUB',local=offers?.[region];
 if(local&&currencyOf(local,currency)===currency&&priceQuality(local,now).status!=='invalid')return {...local,currency};
 return region==='ru'&&validForeignOffer(offers?.usd,now)?offers.usd:undefined;
}
