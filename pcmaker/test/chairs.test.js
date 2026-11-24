import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Box3,Vector3} from '../dist/vendor/three.module.js';
import {createChairModel,chairPlacement} from '../dist/chair-model.js';
import {peripheralById,peripheralCategories,defaultWorkplace,sanitizeWorkplace,peripheralQuote} from '../dist/peripherals.js';
import {connectionModes,sanitizeConnections} from '../dist/peripheral-connections.js';
import {filterProducts} from '../dist/shop-catalog.js';
import {storePickerMarkup} from '../dist/store-picker.js';
import {parseOffer} from '../scripts/price-refresh-core.mjs';
const p=peripheralById['zone51-core-x-weave-loft-gray'],now=Date.parse('2026-11-22T12:00:00Z');

test('Optional chair survives saved selections without changing old desk totals or accepting a wrong category',()=>{
 assert.equal(peripheralCategories.chair,'Игровые кресла');
 assert.deepEqual(sanitizeWorkplace(defaultWorkplace),defaultWorkplace);
 assert.deepEqual(sanitizeWorkplace({...defaultWorkplace,chair:'fizz'}),defaultWorkplace);
 const saved=JSON.parse(JSON.stringify({...defaultWorkplace,chair:p.id}));
 assert.deepEqual(sanitizeWorkplace(saved),saved);
 const desk=peripheralQuote(defaultWorkplace,'ru',now),chair=peripheralQuote(saved,'ru',now);
 assert.equal(chair.items.length,4);assert.equal(chair.total-desk.total,59990);
 assert.equal(peripheralQuote(saved,'by',now).items.find(i=>i.product.id===p.id).offer,undefined);
 assert.deepEqual(connectionModes(p),[]);
 assert.deepEqual(sanitizeConnections({chair:{product:p.id,mode:'usb'}},{chair:p},[],{}),{});
});
test('Chair is searchable by exact article, brand, gray colour and real price range',()=>{
 const filters={category:'chair',brand:'ZONE 51',color:'gray',query:p.sku,min:'59000',max:'60000',sort:'price-up'};
 const offers={[p.id]:p.offers.ru};
 assert.deepEqual(filterProducts([p],filters,{},offers),[p]);
 assert.equal(filterProducts([p],{...filters,max:'50000'},{},offers).length,0);
 assert.equal(filterProducts([p],filters,{},{}).length,0);
 const html=storePickerMarkup(p,'chair',{currency:'RUB'});
 assert.match(html,/ozon\.ru\/product\/kreslo-kompyuternoe-zone-51-core-x-weave-loft-gray-4909479223/);
 assert.ok(html.includes(encodeURIComponent(p.name)));
 assert.match(html,/Яндекс Маркет/);assert.match(html,/DNS/);
});
test('Chair has five twin casters, two armrests and finite floor-standing geometry at documented scale',()=>{
 const model=createChairModel(p,{withTexture:false}),size=new Box3().setFromObject(model).getSize(new Vector3());
 assert.ok(Math.abs(size.x-8.1)<1e-6&&Math.abs(size.y-13)<1e-6&&Math.abs(size.z-6.8)<1e-6);
 assert.equal(model.children.filter(o=>o.name.startsWith('caster-')).length,5);
 assert.ok(model.getObjectByName('armrest-left'));assert.ok(model.getObjectByName('armrest-right'));
 assert.ok(model.getObjectByName('headrest-pillow'));assert.ok(model.getObjectByName('lumbar-support'));
 let wheels=0,triangles=0;
 model.traverse(o=>{if(o.name==='wheel')wheels++;if(o.isMesh){assert.ok([...o.geometry.attributes.position.array,...o.geometry.attributes.normal.array].every(Number.isFinite));triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;}});
 assert.equal(wheels,10);assert.ok(triangles<50000);
 const placement=chairPlacement();model.position.set(...placement.position);model.position.y+=model.userData.floorOffset;model.rotation.y=placement.rotation;
 const bounds=new Box3().setFromObject(model);
 assert.ok(Math.abs(bounds.min.y)<1e-6,'wheels touch the floor');
 assert.ok(bounds.min.z>4.1,'chair clears the front of the tabletop');
});
test('Manufacturer price refresh accepts only exact reviewed model and rejects another colour, conflicting SKU or currency',()=>{
 const target={product:p,region:'ru',id:p.id,offer:p.offers.ru};
 const product={...JSON.parse(fs.readFileSync(new URL('../research/chair-zone51-2026-11-22.json',import.meta.url))).structuredProduct};
 const page=value=>'<script type="application/ld+json">'+JSON.stringify(value)+'</script>';
 assert.equal(parseOffer(page(product),target,'2026-11-22').offer.price,59990);
 for(const wrong of [{...product,name:product.name.replace('Loft Gray','Dark Gray')},{...product,sku:'OTHER-SKU'},{...product,offers:{...product.offers,priceCurrency:'BYN'}},{...product,offers:{'@type':'AggregateOffer',lowPrice:100,priceCurrency:'RUB'}}])assert.ok(parseOffer(page(wrong),target,'2026-11-22').error);
});
