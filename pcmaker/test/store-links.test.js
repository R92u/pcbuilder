import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {byId} from '../dist/catalog.js';
import {priceSnapshot,storeLink,byStoreProduct,belarusStores,ozonStoreProduct} from '../dist/regions.js';
import {productLinksBy} from '../dist/store-links-by.js';
import {productLinksOzon} from '../dist/store-links-ozon.js';

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

test('BY labels never call category, search, or unsupported-store URLs product pages',()=>{
 const part={id:'unknown',name:'Example'};
 for(const url of ['https://5element.by/','https://5element.by/catalog/1675-videokarty','https://5element.by/products/','https://5element.by/products/test?digiSearch=true&term=Example','https://5element.by.evil.test/products/test','https://dns-shop.ru/product/test','http://5element.by/products/test']){
  assert.equal(storeLink(part,'gpu',{currency:'BYN',items:{unknown:{url}}}).label,'Найти в 5 элементе ↗',url);
 }
 const url='https://5element.by/products/exact-model';
 assert.deepEqual(storeLink(part,'gpu',{currency:'BYN'},{storeUrl:url}),{url,label:'Товар в 5 элементе ↗'});
});

test('Supported alternative BY stores retain direct product links and explicit store names',()=>{
 const part={id:'not-in-five-element',name:'Exact model'};
 for(const [host,store] of Object.entries(belarusStores).filter(([host])=>host!=='5element.by')){
  const url='https://'+host+'/catalog/exact-model.html';
  assert.deepEqual(byStoreProduct(url),{url,store});
  assert.deepEqual(storeLink(part,'gpu',{currency:'BYN',items:{[part.id]:{url}}}),{url,label:'Товар в '+store+' ↗'});
  for(const invalid of ['http://'+host+'/product/test','https://'+host+'.evil.test/product/test','https://user:password@'+host+'/product/test','https://'+host+':8080/product/test','https://'+host+'/','https://'+host+'/search/model','https://'+host+'/product/test?q=model'])assert.equal(byStoreProduct(invalid),null,invalid);
 }
});

test('RU links open approved Ozon product pages, including models with a BY match',()=>{
 const part=byId.ak400;
 const url='https://www.ozon.ru/product/deepcool-ak400-123456789/';
 assert.deepEqual(storeLink(part,'cooler',{currency:'RUB',ozonLinks:{ak400:url}}),{url,label:'Товар на Ozon ↗'});
 assert.deepEqual(storeLink(part,'cooler',{currency:'RUB',items:{ak400:{url}}}),{url,label:'Товар на Ozon ↗'});
 const alternative='https://ozon.ru/product/987654321/';
 assert.deepEqual(storeLink(part,'cooler',{currency:'RUB',ozonLinks:{ak400:url},items:{ak400:{url:alternative}}}),{url,label:'Товар на Ozon ↗'});
 assert.deepEqual(ozonStoreProduct(alternative),{url:alternative,store:'Ozon'});
});

test('Missing Ozon card uses an explicitly labelled exact-model or SKU search without changing price evidence',()=>{
 for(const part of [{id:'unknown',name:'Модель A & B / 16 ГБ + OC'},{id:'unknown',name:'Модель',sku:'ABC+123/16G & RGB'}]){
  const data={currency:'RUB',items:{unknown:{price:1234,url:'https://www.regard.ru/product/123/exact-model',store:'Регард',date:'2026-11-13'}},dnsLinks:{unknown:'https://www.dns-shop.ru/product/123/example/'}};
  const before=structuredClone(data);
  const link=storeLink(part,'gpu',data,{storeUrl:'https://www.dns-shop.ru/product/123/example/'}),url=new URL(link.url);
  assert.equal(link.label,'Найти на Ozon ↗');
  assert.equal(url.origin,'https://www.ozon.ru');assert.equal(url.pathname,'/search/');
  assert.equal(url.searchParams.get('text'),part.sku||part.name);
  assert.deepEqual(data,before,'A destination link must not invent or relabel price evidence');
 }
});

test('Reviewed Ozon destination survives a price fallback to a different store',()=>{
 for(const [id,url] of Object.entries(productLinksOzon)){
  assert.deepEqual(ozonStoreProduct(url),{url,store:'Ozon'},id);
  const data={currency:'RUB',items:{[id]:{url:'https://www.kns.ru/product/backup/',store:'KNS',price:1000}}};
  assert.deepEqual(storeLink({id,name:'Exact model'},null,data),{url,label:'Товар на Ozon ↗'},id);
  assert.equal(data.items[id].store,'KNS');
 }
});

test('Ozon product links reject credentials, ports, search URLs and non-product destinations',()=>{
 const part={id:'unknown',name:'Exact model'};
 for(const url of [
  'http://www.ozon.ru/product/model-123/',
  'https://www.ozon.ru.evil.test/product/model-123/',
  'https://seller.ozon.ru/product/model-123/',
  'https://user:password@www.ozon.ru/product/model-123/',
  'https://www.ozon.ru:8080/product/model-123/',
  'https://www.ozon.ru:443/product/model-123/',
  'https://www.ozon.ru/',
  'https://www.ozon.ru/search/?text=model',
  'https://www.ozon.ru/category/model-123/',
  'https://www.ozon.ru/product/',
  'https://www.ozon.ru/product/model/',
  'https://www.ozon.ru/product/model-123/characteristics/',
  'https://www.ozon.ru/product/model-123/?text=another',
  'https://www.ozon.ru/product/model-123/?redirect=https://evil.test',
  'https://www.ozon.ru/product/model-123/#search',
  'https://www.ozon.ru/product/model%2fsearch-123/',
  ' https://www.ozon.ru/product/model-123/',
  'https://www.ozon.ru/product/model-123/\n',
  null,undefined
 ]){
  assert.equal(ozonStoreProduct(url),null,String(url));
  assert.equal(storeLink(part,'gpu',{currency:'RUB',ozonLinks:{unknown:url},items:{unknown:{url}}}).label,'Найти на Ozon ↗',String(url));
 }
 const valid='https://www.ozon.ru/product/exact-model-123/';
 assert.deepEqual(storeLink(part,'gpu',{currency:'RUB',ozonLinks:{unknown:'https://evil.test'},items:{unknown:{url:valid}}}),{url:valid,label:'Товар на Ozon ↗'});
});

test('Ozon destinations never replace the Belarus direct-product and explicit search rules',()=>{
 const known=byId.ak400,url='https://www.ozon.ru/product/model-123/';
 assert.deepEqual(storeLink(known,'cooler',{currency:'BYN',ozonLinks:{[known.id]:url}}),{url:productLinksBy[known.id],label:'Товар в 5 элементе ↗'});
 const link=storeLink({id:'unknown',name:'Exact model'},'gpu',{currency:'BYN',ozonLinks:{unknown:url},items:{unknown:{url}}});
 assert.equal(link.label,'Найти в 5 элементе ↗');assert.equal(new URL(link.url).hostname,'5element.by');
});
