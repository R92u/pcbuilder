import test from 'node:test';
import assert from 'node:assert/strict';
import {demoBuild} from '../dist/catalog.js';
import {filterProducts,shopProducts} from '../dist/shop.js';
import {isVerified} from '../dist/verification.js';
const defaults={category:'all',query:'',brand:'',memory:'',socket:'',min:'',max:'',compatible:false,priced:false,sort:'default'};
const offers={rtx4060:{price:35000},rtx3090:{price:89000}};
const filtered=(filters,prices=offers)=>filterProducts(shopProducts,{...defaults,...filters},demoBuild,prices);
test('Shop price sorting keeps unknown prices last in both directions',()=>{
 assert.deepEqual(filtered({category:'gpu',sort:'price-up'}).slice(0,2).map(p=>p.id),['rtx4060','rtx3090']);
 assert.deepEqual(filtered({category:'gpu',sort:'price-down'}).slice(0,2).map(p=>p.id),['rtx3090','rtx4060']);
});
test('Shop price range excludes unknown prices rather than treating them as zero',()=>{
 assert.deepEqual(filtered({min:'0',max:'40000'}).map(p=>p.id),['rtx4060']);
 assert.equal(filtered({min:'90000',max:'10000'}).length,0);
});
test('Shop compatibility filter excludes DDR4 for the AM5 demo build',()=>{
 const all=filtered({category:'ram'}),compatible=filtered({category:'ram',compatible:true});
 assert.ok(all.some(p=>p.memory==='DDR4'));assert.ok(compatible.length>0);
 assert.ok(compatible.every(p=>p.memory==='DDR5'));
});
test('Shop filters physical manufacturer and searches exact SKU',()=>{
 const sapphire=filtered({category:'gpu',brand:'SAPPHIRE'});
 assert.ok(sapphire.length>0);assert.ok(sapphire.every(p=>p.manufacturer==='SAPPHIRE'));
 const sku=shopProducts.find(p=>p.id==='ddr4-32-3600').sku;
 assert.deepEqual(filtered({query:sku}).map(p=>p.id),['ddr4-32-3600']);
});

test('DDR memory filter includes Intel CPUs supporting both generations',()=>{
 const base={category:'cpu',query:'12400F',brand:'',memory:'DDR4',socket:'',min:'',max:'',compatible:false,priced:false,sort:'default'};
 const found=filterProducts(shopProducts,base,demoBuild,{});assert.ok(found.some(p=>p.id==='i5-12400f'));
 assert.ok(filterProducts(shopProducts,{...base,memory:'DDR5'},demoBuild,{}).some(p=>p.id==='i5-12400f'));
});

test('Verification filter is opt-in and pending models remain available for manual selection',()=>{
 assert.ok(filtered({category:'gpu'}).some(p=>p.id==='rtx4060'));
 const checked=filtered({category:'gpu',verified:true});assert.ok(checked.length>0);assert.ok(checked.every(isVerified));assert.ok(!checked.some(p=>p.id==='rtx4060'));
});

test('Fresh-price filter excludes stale, future, unavailable and undated snapshots',t=>{
 t.mock.method(Date,'now',()=>Date.UTC(2026,9,28,12));
 const prices={rtx4060:{price:100,date:'2026-10-21'},rtx3090:{price:100,date:'2026-10-20'},rx7600:{price:100,date:'2026-10-29'},rx6600:{price:100,date:'2026-10-28',availability:'out-of-stock'},rtx3060:{price:100}};
 assert.deepEqual(filtered({category:'gpu',priced:true},prices).map(p=>p.id),['rtx4060']);
});
