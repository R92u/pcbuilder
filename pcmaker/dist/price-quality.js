// Offer age is independent of specification verification. Never convert currencies.
export const priceMaxAgeDays=7;
const day=86400000;
export function dateStamp(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const stamp=Date.parse(value+'T00:00:00Z');
 return Number.isFinite(stamp)&&new Date(stamp).toISOString().slice(0,10)===value?stamp:null;
}
export function priceQuality(offer,now=Date.now()){
 const today=new Date(now);if(!Number.isFinite(today.getTime()))return {status:'invalid',label:'Дата требует проверки'};
 const checked=dateStamp(offer?.date),age=checked===null?null:Math.floor((Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate())-checked)/day);
 if(!Number.isFinite(offer?.price)||offer.price<=0||age===null||age<0)return {status:'invalid',label:'Цена требует проверки',age};
 if(offer.availability==='out-of-stock')return {status:'unavailable',label:'Нет в наличии на дату проверки',age};
 return age>priceMaxAgeDays?{status:'stale',label:'Цена устарела — перепроверь',age}:{status:'fresh',label:'Проверена не более 7 дней назад',age};
}
export const usablePrice=offer=>Number.isFinite(offer?.price)&&offer.price>0;
