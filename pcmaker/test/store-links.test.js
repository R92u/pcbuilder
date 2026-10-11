import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {byId} from '../dist/catalog.js';
import {priceSnapshot,storeLink} from '../dist/regions.js';
import {productLinksBy} from '../dist/store-links-by.js';

test('verified BY product pages open directly even without a price',()=>{
 const noPrices=priceSnapshot({},'by');
 for(const [id,url] of Object.entries(productLinksBy)){
  assert.ok(byId[id],id);
  assert.equal(new URL(url).hostname,'5element.by');
  assert.match(new URL(url).pathname,/^\/products\/[^/]+$/);
  assert.deepEqual(storeLink(byId[id],null,noPrices),{url,label:'Товар в 5 элементе ↗'});
  assert.equal(noPrices.items[id],undefined,'Adding a link must not invent a price');
 }
 const offers=JSON.parse(fs.readFileSync(new URL('../dist/prices-by.json',import.meta.url)));
 for(const [id,offer] of Object.entries(offers.items)){
  assert.equal(storeLink(byId[id],null,priceSnapshot(offers,'by')).url,productLinksBy[id]||offer.url,id);
 }
});

test('missing BY product opens an explicitly labelled exact-model search, never a category',()=>{
 for(const part of [{id:'unknown',name:'Модель A & B / 16 ГБ + OC'},{id:'unknown',name:'Модель',sku:'ABC+123/16G & RGB'}]){
  for(const category of ['cpu','gpu','ram','motherboard','psu','cooler','case','storage']){
   const link=storeLink(part,category,{currency:'BYN'}),url=new URL(link.url);
   assert.equal(link.label,'Найти в 5 элементе ↗');assert.equal(url.origin,'https://5element.by');assert.equal(url.pathname,'/');
   assert.equal(url.searchParams.get('digiSearch'),'true');assert.equal(url.searchParams.get('term'),part.sku||part.name);assert.equal(url.searchParams.get('params'),'|sort=DEFAULT');
  }
 }
});

test('BY labels never call category, search, or other-store URLs product pages',()=>{
 const part={id:'unknown',name:'Example'};
 for(const url of ['https://5element.by/','https://5element.by/catalog/1675-videokarty','https://5element.by/products/','https://5element.by/products/test?digiSearch=true&term=Example','https://5element.by.evil.test/products/test','https://dns-shop.ru/product/test','http://5element.by/products/test']){
  assert.equal(storeLink(part,'gpu',{currency:'BYN',items:{unknown:{url}}}).label,'Найти в 5 элементе ↗',url);
 }
 const url='https://5element.by/products/exact-model';
 assert.deepEqual(storeLink(part,'gpu',{currency:'BYN'},{storeUrl:url}),{url,label:'Товар в 5 элементе ↗'});
});

test('RU links stay on DNS, including models with a BY match',()=>{
 const part=byId.ak400;
 assert.equal(new URL(storeLink(part,'cooler',{currency:'RUB'}).url).hostname,'www.dns-shop.ru');
 const url='https://www.dns-shop.ru/product/123/exact-model/';
 assert.deepEqual(storeLink(part,'cooler',{currency:'RUB',dnsLinks:{ak400:url}}),{url,label:'Товар в DNS ↗'});
});
