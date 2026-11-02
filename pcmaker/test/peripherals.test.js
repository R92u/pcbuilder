import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {peripherals,peripheralById,peripheralCategories,defaultWorkplace,sanitizeWorkplace,peripheralQuote} from '../dist/peripherals.js';
import {keyboardLayout,peripheralAppearance} from '../dist/peripheral-shapes.js';
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
 for(const key of Object.keys(peripheralCategories)){
  const category=peripherals.filter(p=>p.category===key);assert.equal(category.length,10);
  for(const color of ['black','white'])assert.ok(category.filter(p=>p.colors.includes(color)).length>=2);
  assert.ok(new Set(category.map(p=>p.dimensions[0])).size>=5);
 }
 for(const p of peripherals){
  assert.ok(p.sku);assert.equal(p.dimensions.length,3);assert.ok(p.dimensions.every(v=>v>0&&v<1000));assert.ok(Object.keys(p.specs).length>=10);assert.ok(p.source.startsWith('https://'));assert.ok(p.offers.ru.price>0);
  const photo=photos[p.id];assert.equal(photo.image,'assets/peripherals/'+p.id+'.webp');assert.ok(photo.sourcePage.startsWith('https://'));assert.ok(photo.sourceImage.startsWith('https://'));assert.ok(fs.statSync(new URL('../dist/'+photo.image,import.meta.url)).size>500);
 }
 assert.ok(peripheralById.fizz.dimensions[0]<peripheralById.shiva.dimensions[0]);assert.ok(peripheralById.king.dimensions[0]<peripheralById.griffin.dimensions[0]);
});
test('expanded keyboard formats stay inside their physical case and do not overlap keys',()=>{
 for(const p of peripherals.filter(p=>p.category==='keyboard')){
  const layout=keyboardLayout(p);assert.equal(layout.length,p.keys,p.id);
  for(const k of layout){
   assert.ok(k.w>0&&k.d>0,p.id);
   assert.ok(Math.abs(k.x)+k.w/2<=p.dimensions[0]/200,p.id+' width');
   assert.ok(Math.abs(k.z)+k.d/2<=p.dimensions[1]/200,p.id+' depth');
  }
  for(let i=0;i<layout.length;i++)for(let j=i+1;j<layout.length;j++){
   const a=layout[i],b=layout[j];assert.ok(Math.abs(a.x-b.x)>=(a.w+b.w)/2||Math.abs(a.z-b.z)>=(a.d+b.d)/2,p.id+' overlapping '+a.legend+'/'+b.legend);
  }
 }
});
test('colour variants retain separate articles, quotes and saved selections',()=>{
 const white=peripheralById['anubis-white'],black=peripheralById.anubis;
 assert.notEqual(white.sku,black.sku);assert.notEqual(white.offers.ru.url,black.offers.ru.url);
 assert.notEqual(peripheralAppearance(white).body,peripheralAppearance(black).body);
 const saved={monitor:'lg34',keyboard:'anubis-white',mouse:'k1ng-4k-pro-white'};
 assert.deepEqual(sanitizeWorkplace(saved),saved);assert.equal(peripheralQuote(saved,'ru',now).total,23752+5161+5572);
 assert.equal(peripheralQuote(saved,'by',now).complete,false);
 assert.equal(white.wired,false);assert.equal(peripheralById.mitra.wired,true);
});
