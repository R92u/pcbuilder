import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {peripheralById, peripheralQuote} from '../dist/peripherals.js';
import {keyboardLayout} from '../dist/keyboard-layout.js';
import {createKeyboardModel} from '../dist/keyboard-model.js';
import {connectionModes, connectionError} from '../dist/peripheral-connections.js';

const ids=['lunacy-moonlight-white','lunacy-moonlight-iskra'];
const products=ids.map(id=>peripheralById[id]);

test('Lunacy editions retain the photographed 85-key TKL layout and clear round volume control',()=>{
 for(const p of products){
  assert.ok(p,'edition is registered');
  const keys=keyboardLayout(p),model=createKeyboardModel(p,{withTexture:false});
  assert.equal(keys.length,85,p.id);
  assert.equal(model.getObjectByName('keycaps').count,85,p.id);
  for(const legend of [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',...Array.from({length:12},(_,i)=>'F'+(i+1)),'Esc','Prt','Ins','Home','PgUp','Del','End','PgDn','Space']){
   assert.equal(keys.filter(k=>k.legend===legend).length,1,p.id+' '+legend);
  }
  assert.ok(!keys.some(k=>['Scr','Pause','Num','Ent'].includes(k.legend)),p.id+' no phantom keys');
  const key=legend=>keys.find(k=>k.legend===legend);
  assert.ok(key('↑').z<key('↓').z);
  assert.equal(key('←').z,key('↓').z);assert.equal(key('→').z,key('↓').z);
  assert.ok(key('←').x<key('↓').x&&key('↓').x<key('→').x);
  assert.ok(key('Space').w>key('A').w*5,p.id+' full spacebar');
  const knob=model.getObjectByName('volume-roller');
  assert.ok(knob,p.id+' volume control');
  knob.geometry.computeBoundingBox();
  const size=knob.geometry.boundingBox.getSize(new THREE.Vector3());
  assert.ok(Math.abs(size.x-size.z)<.002&&size.y<size.x,p.id+' horizontal round top');
  for(const k of keys)assert.ok(Math.abs(k.x-knob.position.x)>k.w/2+size.x/2||Math.abs(k.z-knob.position.z)>k.d/2+size.z/2,p.id+' knob clears '+k.legend);
 }
});

test('Photographic artwork stays within its atlas and the real keyboard footprint',()=>{
 for(const p of products){
  assert.ok(p.dimensions[2]<60,p.id+' keyboard height, not box height');
  const model=createKeyboardModel(p,{withTexture:false}),art=model.getObjectByName('key-printed-artwork');
  assert.ok(art,p.id+' sculpted printed tops');
  const pos=art.geometry.attributes.position,uv=art.geometry.attributes.uv,norm=art.geometry.attributes.normal;
  assert.equal(uv.count,pos.count);
  assert.ok([...pos.array,...uv.array,...norm.array].every(Number.isFinite),p.id+' finite artwork');
  assert.ok([...uv.array].every(n=>n>=0&&n<=1),p.id+' bounded UV');
  for(let i=0;i<pos.count;i++){
   assert.ok(Math.abs(pos.getX(i))<p.dimensions[0]/200,p.id+' print inside width');
   assert.ok(Math.abs(pos.getZ(i))<p.dimensions[1]/200,p.id+' print inside depth');
   assert.ok(pos.getY(i)>0&&pos.getY(i)<p.dimensions[2]/100,p.id+' print above deck');
   assert.ok(norm.getY(i)>.9,p.id+' artwork faces up');
  }
  // Source photos are top views: left-to-right increases U; front-to-back
  // increases V. Reversed sampling would mirror the legends and print.
  const keys=model.userData.keyLayout,key=l=>keys.find(k=>k.legend===l);
  assert.ok(key('A').photoX<key('L').photoX);
  assert.ok(key('F1').photoY<key('Space').photoY);
 }
});

test('RGB changes and shutdown never recolour or hide the printed key artwork',()=>{
 for(const p of products){
  const model=createKeyboardModel(p,{withTexture:false}),art=model.getObjectByName('key-printed-artwork'),caps=model.getObjectByName('keycaps'),wells=model.getObjectByName('key-light-wells');
  // Enable the already-built surface with a tiny in-memory texture, avoiding
  // browser image loading while exercising the same material and light code.
  art.visible=true;art.material.map=new THREE.DataTexture(new Uint8Array([200,50,60,255]),1,1);
  const texture=art.material.map,color=art.material.color.clone(),ink=[...caps.instanceColor.array],uv=[...art.geometry.attributes.uv.array];
  const update=settings=>model.userData.updateLighting(settings,1200);
  update({mode:'color',color:'#00ff00'});
  const actual=new THREE.Color();wells.getColorAt(0,actual);assert.equal(actual.getHexString(),'00ff00');
  model.userData.updateLighting({mode:'rainbow'},0);const first=[...wells.instanceColor.array];
  model.userData.updateLighting({mode:'rainbow'},2000);assert.notDeepEqual([...wells.instanceColor.array],first,p.id+' animated wells');
  update({mode:'off'});assert.equal(wells.visible,false);
  assert.equal(art.visible,true);assert.equal(caps.visible,true);
  assert.equal(art.material.map,texture);assert.ok(art.material.color.equals(color));
  assert.equal(art.material.opacity,1);assert.equal(art.material.emissive.getHex(),0);
  assert.deepEqual([...caps.instanceColor.array],ink);
  assert.deepEqual([...art.geometry.attributes.uv.array],uv);
  update({mode:'photo'});assert.equal(wells.visible,true);
  art.material.map.dispose();
 }
});

test('Lunacy connects by USB only and the cable originates at the rear USB-C socket',()=>{
 for(const p of products){
  assert.equal(p.wired,true);assert.deepEqual(connectionModes(p),['usb']);
  const target={id:'rear-usb',type:'usbA',part:'motherboard'};
  assert.equal(connectionError(p,'usb',target),'');
  for(const mode of ['receiver','bluetooth'])assert.ok(connectionError(p,mode,target,{},'keyboard',{motherboard:{bluetooth:true}}));
  assert.ok(connectionError(p,'usb',{...target,type:'hdmi'}));
  const model=createKeyboardModel(p,{withTexture:false}),port=model.getObjectByName('usb-c'),start=model.userData.cableStart;
  assert.ok(start.every(Number.isFinite));
  assert.ok(Math.abs(start[0]-port.position.x)<.01&&Math.abs(start[1]-port.position.y)<.01);
  assert.ok(start[2]<=port.position.z&&port.position.z-start[2]<.02,p.id+' rear cable origin');
 }
});

test('Selected Lunacy editions have distinct photos and dated official offers, including unavailable white stock',()=>{
 const images=JSON.parse(fs.readFileSync(new URL('../dist/peripheral-images.json',import.meta.url)));
 const observedAt=Date.UTC(2026,10,16,12),imagePaths=new Set();
 for(const p of products){
  const entry=peripheralQuote({keyboard:p.id},'ru',observedAt).items.find(i=>i.product.id===p.id),offer=entry.offer,image=images[p.id];
  assert.equal(new URL(offer.url).hostname,'shop.lunacy.ru');
  assert.equal(offer.url,p.source);assert.equal(offer.currency,'RUB');
  assert.ok(Number.isFinite(offer.price)&&offer.price>0);
  assert.match(offer.date,/^\d{4}-\d{2}-\d{2}$/);assert.equal(offer.kind,'store');
  assert.equal(image.sourcePage,p.source);assert.equal(image.credit,'Lunacy');
  assert.ok(fs.existsSync(new URL('../dist/'+image.image,import.meta.url)));imagePaths.add(image.image);
  assert.ok(!p.offers.by,p.id+' no invented BYN offer');
 }
 assert.equal(imagePaths.size,2,'edition-specific photos');
 const white=peripheralQuote({keyboard:ids[0]},'ru',observedAt).items.find(i=>i.product.id===ids[0]);
 assert.equal(white.offer.availability,'out-of-stock');assert.equal(white.quality.status,'unavailable');
 const iskra=peripheralQuote({keyboard:ids[1]},'ru',observedAt).items.find(i=>i.product.id===ids[1]);
 assert.equal(iskra.offer.availability,'in-stock');assert.equal(iskra.quality.status,'fresh');
});
