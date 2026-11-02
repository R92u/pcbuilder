import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {peripherals,peripheralById,peripheralCategories,defaultWorkplace,sanitizeWorkplace,peripheralQuote} from '../dist/peripherals.js';
const now=Date.parse('2026-11-02T12:00:00Z');
test('workplace recovers invalid and cross-category saved choices without accepting extra fields',()=>{
 for(const input of [null,undefined,42,'bad',[]])assert.deepEqual(sanitizeWorkplace(input),defaultWorkplace);
 assert.deepEqual(sanitizeWorkplace({monitor:'g502',keyboard:'shiva',mouse:'deleted-product',cpu:'r5-7600'}),{monitor:'a27i',keyboard:'shiva',mouse:'griffin'});
 const saved={monitor:'g34wqi',keyboard:'ryze',mouse:'king'};assert.deepEqual(sanitizeWorkplace(saved),saved);assert.notEqual(sanitizeWorkplace(saved),saved);
});
test('regional quote never converts RUB into BYN or reports missing offers as a free complete setup',()=>{
 const ru=peripheralQuote(defaultWorkplace,'ru',now);assert.equal(ru.total,11397+3455+1155);assert.equal(ru.complete,true);assert.equal(ru.purchasable,false);
 for(const region of ['by','unknown']){const q=peripheralQuote(defaultWorkplace,region,now);assert.equal(q.priced,0);assert.equal(q.complete,false);assert.equal(q.purchasable,false);assert.equal(q.total,0);assert.ok(q.items.every(i=>!i.offer));}
});
test('unavailable and old prices stay labelled and cannot become a purchasable current quote',()=>{
 const unavailable=peripheralQuote({...defaultWorkplace,monitor:'a24i'},'ru',now);assert.equal(unavailable.items[0].quality.status,'unavailable');assert.equal(unavailable.purchasable,false);
 const old=peripheralQuote(defaultWorkplace,'ru',Date.parse('2026-12-01'));assert.equal(old.items[0].quality.status,'stale');assert.equal(old.purchasable,false);
 const future=peripheralQuote(defaultWorkplace,'ru',Date.parse('2026-10-01'));assert.equal(future.complete,false);assert.equal(future.total,0);
});
test('every selectable product has a real article, dimension scale, full spec source and local attributed photo',()=>{
 const photos=JSON.parse(fs.readFileSync(new URL('../dist/peripheral-images.json',import.meta.url)));
 assert.equal(new Set(peripherals.map(p=>p.id)).size,peripherals.length);
 for(const key of Object.keys(peripheralCategories))assert.equal(peripherals.filter(p=>p.category===key).length,3);
 for(const p of peripherals){
  assert.ok(p.sku);assert.equal(p.dimensions.length,3);assert.ok(p.dimensions.every(v=>v>0&&v<1000));assert.ok(Object.keys(p.specs).length>=10);assert.ok(p.source.startsWith('https://'));assert.ok(p.offers.ru.price>0);
  const photo=photos[p.id];assert.equal(photo.image,'assets/peripherals/'+p.id+'.webp');assert.ok(photo.sourcePage.startsWith('https://'));assert.ok(photo.sourceImage.startsWith('https://'));assert.ok(fs.statSync(new URL('../dist/'+photo.image,import.meta.url)).size>500);
 }
 assert.ok(peripheralById.fizz.dimensions[0]<peripheralById.shiva.dimensions[0]);assert.ok(peripheralById.king.dimensions[0]<peripheralById.griffin.dimensions[0]);
});
