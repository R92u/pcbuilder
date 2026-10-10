import test from 'node:test';
import assert from 'node:assert/strict';
import {demoBuild} from '../dist/catalog.js';
import {filterProducts,shopProducts} from '../dist/shop.js';
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
