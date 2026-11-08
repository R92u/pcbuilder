import test from 'node:test';
import assert from 'node:assert/strict';
import {sanitizeLivePrices,updatedOffer,updatedOffers,setLivePrices,loadLivePrices,getLivePrices} from '../dist/live-price-data.js';
import {regionalSnapshot} from '../dist/regions.js';
import {offerStatusLine} from '../dist/price-quality.js';
import {offerMarkup} from '../dist/data-quality-ui.js';
const now=Date.parse('2026-11-08T12:00:00Z');
const old={price:10000,currency:'RUB',date:'2026-10-10',store:'Store',url:'https://www.kns.ru/product/exact/',availability:'unknown'};
const fresh={...old,price:9000,date:'2026-11-08',availability:'in-stock'};
const snapshot=(offer=fresh)=>({schemaVersion:1,checkedAt:'2026-11-08T10:00:00Z',items:{ru:{'r5-7600':offer}},checks:{}});

test('A verified newer quote changes price/date together; an older overlay cannot replace it',()=>{
 const live=sanitizeLivePrices(snapshot(),now);
 assert.equal(updatedOffer('r5-7600','ru',old,live,now).price,9000);
 assert.equal(updatedOffer('r5-7600','ru',fresh,sanitizeLivePrices(snapshot(old),now),now).date,fresh.date);
 assert.equal(live.checkedAt,'2026-11-08T10:00:00Z');
});
test('A failed refresh never refreshes the historical quote date or amount',()=>{
 const live=sanitizeLivePrices({...snapshot(old),checks:{ru:{'r5-7600':{status:'blocked',attemptedAt:'2026-11-08T10:00:00Z',url:old.url}}}},now);
 const result=updatedOffer('r5-7600','ru',old,live,now);
 assert.equal(result.price,old.price);assert.equal(result.date,old.date);
 assert.match(offerMarkup(result),/Сохранён предыдущий снимок/);assert.match(offerMarkup(result),/10\.10\.2026/);
 const other={...old,url:'https://www.regard.ru/product/exact'};
 assert.equal(updatedOffer('r5-7600','ru',other,{...live,items:{}},now).priceCheck,undefined);
});
test('Malformed, cross-currency, zero and future offers cannot enter the runtime',()=>{
 for(const value of [{...fresh,price:0},{...fresh,date:'2026-11-09'},{...fresh,currency:'BYN'},{...fresh,availability:'yes'},{...fresh,url:'https://user:secret@example.com/item'}])assert.deepEqual(sanitizeLivePrices(snapshot(value),now).items.ru,{});
 assert.deepEqual(sanitizeLivePrices({items:snapshot().items},now).items.ru,{});
});
test('Currency isolation, peripheral isolation and local-before-USD fallback survive overlay merge',()=>{
 const usd={...fresh,currency:'USD',price:150,url:'https://www.newegg.com/product/exact'};
 const live=sanitizeLivePrices({schemaVersion:1,items:{ru:{fizz:fresh,'r5-7600':fresh},usd:{'nh-u12a':usd}}},now);
 const ru=regionalSnapshot({items:{'r5-7600':old}},'ru',live);
 assert.equal(ru.items['r5-7600'].price,9000);assert.equal(ru.items.fizz,undefined);assert.equal(ru.items['nh-u12a'].currency,'USD');
 assert.equal(regionalSnapshot({},'by',live).items['nh-u12a'],undefined);
 const offers=updatedOffers('r5-7600',{by:{...old,currency:'BYN',price:100}},live,now);
 assert.equal(offers.ru.currency,'RUB');assert.equal(offers.by.price,100);
});
test('Unavailable offers remain historical with an explicit date; unknown availability is never in stock',()=>{
 assert.equal(offerStatusLine({...fresh,availability:'out-of-stock'}),'Проверено 08.11.2026 · Нет в наличии');
 assert.match(offerStatusLine(old),/Наличие не подтверждено/);
 assert.match(offerMarkup({...fresh,availability:'unknown'}),/Наличие не подтверждено/);
});
test('Network failures and malformed successful responses keep the previously loaded snapshot',async()=>{
 setLivePrices(snapshot(),now);
 await loadLivePrices(async()=>{throw Error('offline');});
 assert.equal(getLivePrices().items.ru['r5-7600'].price,9000);
 await loadLivePrices(async()=>({ok:true,json:async()=>({error:'upstream failed'})}));
 assert.equal(getLivePrices().items.ru['r5-7600'].price,9000);
 setLivePrices({schemaVersion:1,items:{}},now);
});
