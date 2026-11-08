import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {peripherals,peripheralById} from '../dist/peripherals.js';
import {keyboardLayout} from '../dist/keyboard-layout.js';
import {createKeyboardModel,keycapGeometry,keyboardProfile,keycapColor,sanitizeKeyboardLighting} from '../dist/keyboard-model.js';
const products=peripherals.filter(p=>p.category==='keyboard');

test('all keyboard meshes have finite, bounded geometry and a modest render budget',()=>{
 for(const p of products){
  const model=createKeyboardModel(p,{withTexture:false}),profile=keyboardProfile(p),bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
  assert.ok(size.x<=profile.w+.025,p.id+' width');assert.ok(size.z<=profile.d+.035,p.id+' depth');assert.ok(size.y<=profile.h*1.08,p.id+' height');assert.ok(bounds.min.y>=-.002,p.id+' desk');
  let triangles=0,meshes=0;
  model.traverse(o=>{if(!o.isMesh)return;meshes++;const geo=o.geometry;triangles+=(geo.index?.count||geo.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);for(const a of Object.values(geo.attributes))assert.ok([...a.array].every(Number.isFinite),p.id+' finite vertices');});
  assert.ok(triangles<60000,p.id+' triangles '+triangles);assert.ok(meshes<40,p.id+' draw calls '+meshes);
  assert.equal(model.getObjectByName('keycaps').count,p.keys);
  assert.ok(model.userData.cableStart.every(Number.isFinite));
 }
});

test('opaque new key legends stay unlit while RGB wells change, and thin models retain physical proportions',()=>{
 const p=peripheralById['akko-5075b-plus'],model=createKeyboardModel(p,{withTexture:false}),glyph=model.getObjectByName('key-legends'),wells=model.getObjectByName('key-light-wells'),c=new THREE.Color();
 model.userData.updateLighting({mode:'color',color:'#ff0000'});const ink=[...glyph.geometry.attributes.color.array];
 model.userData.updateLighting({mode:'color',color:'#00ff00'});assert.deepEqual([...glyph.geometry.attributes.color.array],ink);wells.getColorAt(0,c);assert.equal(c.getHexString(),'00ff00');
 for(const p of products){assert.ok(p.dimensions[2]<70,p.id+' realistic height');}
 for(const p of products.filter(p=>p.knob))for(const k of keyboardLayout(p))assert.ok(Math.abs(k.x-p.dimensions[0]/100*.449)>k.w/2+.10||Math.abs(k.z+p.dimensions[1]/100*.352)>k.d/2+.10,p.id+' knob clears '+k.legend);
});

test('keycaps form closed non-degenerate surfaces with top normals facing out',()=>{
 const g=keycapGeometry(),pos=g.attributes.position,index=g.index.array,edges=new Map(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
 for(let i=0;i<index.length;i+=3){a.fromBufferAttribute(pos,index[i]);b.fromBufferAttribute(pos,index[i+1]);c.fromBufferAttribute(pos,index[i+2]);const n=b.clone().sub(a).cross(c.clone().sub(a));assert.ok(n.length()>1e-8);if(a.y===1&&b.y===1&&c.y===1)assert.ok(n.y>0);
  for(const [u,v] of [[index[i],index[i+1]],[index[i+1],index[i+2]],[index[i+2],index[i]]]){const key=[u,v].sort((x,y)=>x-y).join('/');edges.set(key,(edges.get(key)||0)+1);}
 }
 assert.ok([...edges.values()].every(n=>n===2));
});

test('compact layouts retain bottom arrows, full-size numpads and clear knob space',()=>{
 for(const id of ['ryze','uranus-pro-82']){const p=peripheralById[id],keys=keyboardLayout(p),left=keys.find(k=>k.legend==='←'),up=keys.find(k=>k.legend==='↑'),down=keys.find(k=>k.legend==='↓'),right=keys.find(k=>k.legend==='→');assert.ok(up.z<down.z);assert.equal(left.z,down.z);assert.equal(right.z,down.z);assert.ok(left.x<down.x&&down.x<right.x);}
 for(const id of ['mitra','shiva','whisper']){const k=keyboardLayout(peripheralById[id]);assert.equal(k.find(k=>k.legend==='Ent').d>k.find(k=>k.legend==='Enter').d,true);}
 const p=peripheralById['uranus-pro-82'],{w,d}=keyboardProfile(p),x=w*.449,z=-d*.352;
 for(const k of keyboardLayout(p))assert.ok(Math.abs(k.x-x)>k.w/2+.10||Math.abs(k.z-z)>k.d/2+.10,'knob clears '+k.legend);
 assert.ok(keyboardProfile(peripheralById.anubis).h<keyboardProfile(peripheralById.fizz).h);
 assert.notEqual(keycapColor(peripheralById.fizz,{legend:'Space'}),keycapColor(peripheralById.fizz,{legend:'A'}));
});

test('keyboard RGB supports photo, custom colour, animated rainbow and a real off state',()=>{
 const model=createKeyboardModel(peripheralById.ryze,{withTexture:false}),update=model.userData.updateLighting,wells=model.getObjectByName('key-light-wells'),glyph=model.getObjectByName('key-legends'),c=new THREE.Color();
 update({mode:'color',color:'#ff0000'});wells.getColorAt(0,c);assert.equal(c.getHexString(),'ff0000');
 update({mode:'rainbow'},0);const first=[...glyph.geometry.attributes.color.array];update({mode:'rainbow'},2200);assert.notDeepEqual([...glyph.geometry.attributes.color.array],first);
 update({mode:'off'});assert.equal(wells.visible,false);assert.ok([...glyph.geometry.attributes.color.array].every(Number.isFinite));
 update({mode:'photo'});assert.equal(wells.visible,true);assert.notDeepEqual([...glyph.geometry.attributes.color.array],first);
 const unlit=createKeyboardModel({...peripheralById.ryze,rgb:false},{withTexture:false});unlit.userData.updateLighting({mode:'rainbow'},200);assert.equal(unlit.getObjectByName('key-light-wells').visible,false);
 assert.deepEqual(sanitizeKeyboardLighting({mode:'broken',color:'red'}),{mode:'photo',color:'#e4edff'});
});
