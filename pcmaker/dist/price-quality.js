// Offer age is independent of specification verification. Never convert currencies.
export const priceMaxAgeDays=7;
const day=86400000;
// Journal and offer check dates use the project's Moscow calendar, also UTC+3 in Minsk.
const priceCalendar=new Intl.DateTimeFormat('en',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'});
export function dateStamp(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const stamp=Date.parse(value+'T00:00:00Z');
 return Number.isFinite(stamp)&&new Date(stamp).toISOString().slice(0,10)===value?stamp:null;
}
export function priceQuality(offer,now=Date.now()){
 const today=new Date(now);if(!Number.isFinite(today.getTime()))return {status:'invalid',label:'Дата требует проверки'};
 const parts=Object.fromEntries(priceCalendar.formatToParts(today).map(p=>[p.type,p.value]));
 const checked=dateStamp(offer?.date),age=checked===null?null:Math.floor((Date.UTC(Number(parts.year),Number(parts.month)-1,Number(parts.day))-checked)/day);
 if(!Number.isFinite(offer?.price)||offer.price<=0||age===null||age<0)return {status:'invalid',label:'Цена требует проверки',age};
 if(offer.availability==='out-of-stock')return {status:'unavailable',label:'Нет в наличии на дату проверки',age};
 return age>priceMaxAgeDays?{status:'stale',label:'Цена устарела — перепроверь',age}:{status:'fresh',label:'Проверена не более 7 дней назад',age};
}
export const usablePrice=offer=>Number.isFinite(offer?.price)&&offer.price>0;
export function formatPriceDate(value){return dateStamp(value)===null?'дата неизвестна':value.split('-').reverse().join('.');}
export function offerStatusLine(offer){
 const availability=offer?.availability==='in-stock'?'В наличии':offer?.availability==='out-of-stock'?'Нет в наличии':'Наличие не подтверждено';
 return `Проверено ${formatPriceDate(offer?.date)} · ${availability}`;
}
