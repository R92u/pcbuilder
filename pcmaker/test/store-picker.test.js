import test from 'node:test';
import assert from 'node:assert/strict';
import {storePickerMarkup} from '../dist/store-picker.js';
import {productLinksOzon} from '../dist/store-links-ozon.js';
import {productLinksBy} from '../dist/store-links-by.js';

const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const links=html=>[...html.matchAll(/<a class="store-picker-link" href="([^"]+)"[^>]*><span class="store-picker-name">([^<]+)<\/span><span class="store-picker-note">([^<]+)<\/span><\/a>/g)].map(([,url,name,note])=>({url:decode(url),name:decode(name),note:decode(note)}));
const part={id:'unknown',name:'Модель A & B',sku:'ABC+123/16G & RGB'};

test('RU picker offers Ozon, Yandex Market and DNS with exact-model searches',()=>{
 const html=storePickerMarkup(part,'gpu',{currency:'RUB'}),result=links(html);
 assert.deepEqual(result.map(link=>link.name),['Ozon','Яндекс Маркет','DNS']);
 assert.deepEqual(result.map(link=>new URL(link.url).hostname),['www.ozon.ru','market.yandex.ru','www.dns-shop.ru']);
 for(const link of result){const u=new URL(link.url);assert.equal(u.searchParams.get(link.name==='DNS'?'q':'text'),part.sku);assert.match(link.note,/Поиск модели/);}
 assert.equal((html.match(/target="_blank" rel="noopener noreferrer"/g)||[]).length,3);
 assert.match(html,/<details class="store-picker"><summary/);
});

test('Known exact product cards survive an unrelated current price source',()=>{
 const [id,ozon]=Object.entries(productLinksOzon)[0];
 const dns='https://www.dns-shop.ru/product/6d7a8c58afebed20/processor-amd-ryzen-5-5600-oem/';
 const data={currency:'RUB',dnsLinks:{[id]:dns},items:{[id]:{url:'https://www.kns.ru/product/backup/',price:5000}}};
 const before=structuredClone(data),result=links(storePickerMarkup({...part,id},'gpu',data));
 assert.equal(result[0].url,ozon);assert.match(result[0].note,/Карточка товара/);
 assert.equal(result[2].url,dns);assert.match(result[2].note,/Карточка товара/);
 assert.deepEqual(data,before,'Store selection must not relabel or mutate price evidence');
});

test('Untrusted DNS destinations become a labelled search and all model text is escaped',()=>{
 for(const url of [
  'http://www.dns-shop.ru/product/6d7a8c58afebed20/example/',
  'https://www.dns-shop.ru.evil.test/product/6d7a8c58afebed20/example/',
  'https://user:secret@www.dns-shop.ru/product/6d7a8c58afebed20/example/',
  'https://www.dns-shop.ru:443/product/6d7a8c58afebed20/example/',
  'https://www.dns-shop.ru/search/?q=example',
  'https://www.dns-shop.ru/product/6d7a8c58afebed20/example/?q=other',
  'https://www.dns-shop.ru/product/',
  'https://www.dns-shop.ru/product/6d7a8c58afebed20/example/opinions/'
 ])assert.match(links(storePickerMarkup(part,'gpu',{dnsLinks:{unknown:url}}, {storeUrl:url}))[2].note,/Поиск модели/,url);
 const hostile={id:'unknown',name:'<img src=x onerror="alert(1)"> & \'model\'',sku:'</a><script>alert(1)</script>'};
 const html=storePickerMarkup(hostile,'gpu');
 assert.doesNotMatch(html,/<img|<script|onerror="/);
 assert.match(html,/&lt;img/);
 for(const link of links(html))assert.equal(new URL(link.url).searchParams.get(link.name==='DNS'?'q':'text'),hostile.sku);
});

test('Belarus keeps its local destination first, followed by the three Russian shops',()=>{
 const id=Object.keys(productLinksBy)[0],result=links(storePickerMarkup({...part,id},'gpu',{currency:'BYN'}));
 assert.deepEqual(result.map(link=>link.name),['5 элемент','Ozon','Яндекс Маркет','DNS']);
 assert.equal(result[0].url,productLinksBy[id]);assert.match(result[0].note,/Карточка товара/);
 const search=links(storePickerMarkup(part,'gpu',{currency:'BYN'}))[0];
 assert.equal(new URL(search.url).hostname,'5element.by');assert.equal(new URL(search.url).searchParams.get('term'),part.sku);assert.match(search.note,/Поиск модели/);
});
