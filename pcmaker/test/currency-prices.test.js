import test from 'node:test';
import assert from 'node:assert/strict';
import {priceTotals,formatTotals,selectRegionalOffer,validForeignOffer} from '../dist/money.js';
import {priceQuality} from '../dist/price-quality.js';
import {summarizePrices} from '../dist/engine.js';
import {budgetPrice} from '../dist/autobuild.js';
import {byId} from '../dist/catalog.js';
import {filterProducts} from '../dist/shop-catalog-brands.js';
import {peripheralQuote,peripheralById,defaultWorkplace} from '../dist/peripherals-brands.js';
import {foreignComponentOffers,peripheralOfferUpdates} from '../dist/foreign-prices.js';
import {regionalSnapshot as priceSnapshot} from '../dist/regions.js';
const now=Date.parse('2026-11-04T12:00:00Z');
const usd={price:89.99,currency:'USD',date:'2026-11-04',store:'US store',url:'https://example.com/product/keyboard',availability:'in-stock'};
test('Amounts stay in separate currencies and accumulate integer cents',()=>{
 const totals=priceTotals([{price:50000,currency:'RUB'},usd,{price:.1,currency:'USD'},{price:.2,currency:'USD'},{price:20,currency:'BYN'}]);
 assert.deepEqual(totals,{RUB:50000,USD:90.29,BYN:20});
 assert.equal(formatTotals({RUB:50000,USD:120}),'50 000 ₽ + $120');
 const sum=summarizePrices({cpu:'r5-7600',cooler:'ak400'},{'r5-7600':{...usd,currency:'RUB',price:50000},ak400:usd},now);
 assert.equal(sum.total,50000);assert.deepEqual(sum.totals,{RUB:50000,USD:89.99});assert.equal(sum.foreign,1);assert.equal(sum.complete,true);
});
test('Local offers take priority, foreign fallback applies only to Russia',()=>{
 const ru={...usd,currency:'RUB',price:7990};
 assert.deepEqual(selectRegionalOffer({ru,usd},'ru',now),ru);
 assert.deepEqual(selectRegionalOffer({usd},'ru',now),usd);
 assert.equal(selectRegionalOffer({ru,usd},'by',now),undefined);
 for(const bad of [{...usd,currency:'EUR'},{...usd,url:'https://user:secret@example.com/p'},{...usd,date:'2026-11-05'},{...usd,price:0}])assert.equal(validForeignOffer(bad,now),false);
});
test('USD-only parts never enter a ruble auto-build, even with estimates enabled',()=>{
 for(const allow of [true,false])assert.equal(budgetPrice(byId['r5-7600'],'cpu',{'r5-7600':usd},allow,'RUB',now),null);
});
test('Price filters and sorting do not compare rubles with dollars',()=>{
 const products=['rubLow','rubHigh','usdLow','usdHigh','missing'].map(id=>({id,name:id,category:'mouse',kind:'peripheral'}));
 const offers={rubLow:{price:1000},rubHigh:{price:2000},usdLow:{...usd,price:20},usdHigh:{...usd,price:80}};
 const f={category:'all',min:'',max:'',regionCurrency:'RUB',sort:'price-up'};
 const ids=extra=>filterProducts(products,{...f,...extra},{},offers).map(p=>p.id);
 assert.deepEqual(ids({}),['rubLow','rubHigh','usdLow','usdHigh','missing']);
 assert.deepEqual(ids({sort:'price-down'}),['rubHigh','rubLow','usdHigh','usdLow','missing']);
 assert.deepEqual(ids({max:'1500'}),['rubLow']);
 assert.deepEqual(ids({currency:'USD',min:'10',max:'50'}),['usdLow']);
});
test('Imported Logitech offers match black variants rather than pink discounts',()=>{
 for(const id of ['logitech-pro-2-lightspeed','logitech-pro-x-tkl-wireless-keyboard']){
  const p=peripheralById[id],offer=peripheralOfferUpdates[id].usd;
  assert.equal(p.sku,offer.sku);assert.ok(offer.url.endsWith(p.sku));
 }
 const quote=peripheralQuote({...defaultWorkplace,keyboard:'logitech-g413-se-gaming-keyboard'},'ru',now);
 assert.equal(quote.totals.USD,89.99);assert.ok(quote.totals.RUB>0);assert.equal(quote.complete,true);
});
test('New snapshots are usable after midnight in Moscow, before UTC midnight',()=>{
 assert.equal(priceQuality(usd,Date.parse('2026-11-03T20:59:59Z')).status,'invalid');
 assert.equal(priceQuality(usd,Date.parse('2026-11-03T21:00:00Z')).status,'fresh');
});
test('Foreign component fallback retains source and cannot replace regional prices',()=>{
 const [id,offer]=Object.entries(foreignComponentOffers)[0];
 assert.ok(byId[id]);assert.ok(validForeignOffer(offer,now));
 const local={...offer,currency:'RUB',price:12345};
 assert.equal(priceSnapshot({items:{[id]:local}},'ru').items[id].currency,'RUB');
 assert.equal(priceSnapshot({},'by').items[id],undefined);
});
