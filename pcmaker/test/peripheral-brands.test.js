import test from 'node:test';
import assert from 'node:assert/strict';
import {peripherals,peripheralQuote,defaultWorkplace} from '../dist/peripherals.js';
import {filterProducts,manufacturer} from '../dist/shop-catalog.js';
import {additionalKeyboards} from '../dist/peripherals-keyboards14.js';
import {connectionModes} from '../dist/peripheral-connections.js';

test('new wired and tri-mode keyboards retain their actual connection choices',()=>{
 for(const p of additionalKeyboards)assert.deepEqual(connectionModes(p),p.wired?['usb']:['usb','receiver','bluetooth'],p.id);
});

test('each brand has ten mice and ten keyboards, independently filterable',()=>{
 for(const brand of ['Razer','Logitech','Redragon'])for(const category of ['keyboard','mouse']){
  const list=filterProducts(peripherals,{category,brand,sort:'brand',min:'',max:''},{},{});
  assert.equal(list.length,10,brand+' '+category);
  assert.ok(list.every(p=>manufacturer(p)===brand&&p.category===category));
 }
});
test('brand sort groups manufacturers and sorts names inside a group',()=>{
 const list=filterProducts(peripherals,{category:'mouse',sort:'brand',min:'',max:''},{},{});
 for(let i=1;i<list.length;i++){
  const a=list[i-1],b=list[i],cmp=manufacturer(a).localeCompare(manufacturer(b),'ru');
  assert.ok(cmp<0||(cmp===0&&a.name.localeCompare(b.name,'ru')<=0));
 }
});
test('unpriced Logitech selection remains incomplete in either region',()=>{
 for(const region of ['ru','by']){
  const q=peripheralQuote({...defaultWorkplace,keyboard:'logitech-g213-rgb-gaming-keyboard'},region,Date.parse('2026-11-03T12:00:00Z'));
  assert.equal(q.complete,false);assert.equal(q.purchasable,false);
  assert.equal(q.items.find(i=>i.product?.category==='keyboard')?.offer,undefined);
 }
});
