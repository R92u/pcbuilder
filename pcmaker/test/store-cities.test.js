import test from 'node:test';
import assert from 'node:assert/strict';
import {storeCities,cityStoreLink} from '../dist/store-cities.js';
import {buildCityCart} from '../dist/shopping-cart.js';
import {storePickerMarkup} from '../dist/store-picker.js';

test('city storefronts search for the exact SKU, including punctuation',()=>{
 const part={id:'example',name:'Example',sku:'ABC+12/3 & 4'};
 for(const [id,name] of storeCities){
  const link=cityStoreLink(id,part),url=new URL(link.url);
  assert.equal(url.hostname,id+'.xcom-shop.ru');
  assert.equal(url.searchParams.get('s'),part.sku);
  assert.equal(link.name,'XCOM-SHOP · '+name);
 }
 assert.equal(cityStoreLink('example.org',part),null);
 assert.equal(cityStoreLink('spb',{...part,concept:true}),null);
 assert.equal(new URL(cityStoreLink('spb',{name:'Ryzen 5 5600'}).url).searchParams.get('s'),'Ryzen 5 5600');
 assert.match(storePickerMarkup(part,'cpu',{currency:'RUB',storeCity:'spb'}),/spb\.xcom-shop\.ru/);
 assert.doesNotMatch(storePickerMarkup(part,'cpu',{currency:'BYN',storeCity:'spb'}),/xcom-shop/);
});

test('the Voronezh basket is exclusive to its Russian storefront',()=>{
 const parts={cpu:{id:'r7-7700x'},case:{id:'cc560'}};
 for(const city of storeCities.keys()){
  if(city!=='voronezh')assert.equal(buildCityCart(parts,'ru',city),null);
 }
 assert.equal(buildCityCart(parts,'by','voronezh'),null);
 const cart=buildCityCart(parts,'ru','voronezh');
 assert.equal(cart.count,1);
 assert.equal(cart.missing[0].category,'case');
 assert.equal(new URL(cart.url).hostname,'e-techno.net');
});
