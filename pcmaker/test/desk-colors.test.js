import test from 'node:test';
import assert from 'node:assert/strict';
import {peripherals,sanitizeWorkplace,peripheralQuote} from '../dist/peripherals.js';
import {SETUP_PALETTES,pickColorSetup} from '../dist/color-setups.js';
import {createChairModel} from '../dist/chair-model.js';
import {demoBuild} from '../dist/catalog.js';
import {Box3,Vector3} from '../dist/vendor/three.module.js';
import {deskMatLayout,DESK_Y,surfaceHeight,supportedPoints,WIRE_RADIUS} from '../dist/peripheral-connections.js';
import {createDeskMat} from '../dist/desk-mat-model.js';

test('catalog finishes, supported desk surfaces and prices survive setup selection',()=>{
 for(const {id} of SETUP_PALETTES){
  const plan=pickColorSetup(id,demoBuild);
  assert.equal(plan.items.find(p=>p.category==='case').match,'exact');
  assert.notEqual(plan.items.find(p=>p.category==='mat').match,'neutral');
  assert.deepEqual(sanitizeWorkplace(plan.selection),plan.selection);
 }
 for(const p of peripherals.filter(p=>p.category==='mat')){
  const layout=deskMatLayout(p),bounds=new Box3().setFromObject(createDeskMat(p,layout));
  const size=bounds.getSize(new Vector3());
  for(const [i,n] of [size.x,size.z,size.y].entries())assert.ok(Math.abs(n-p.dimensions[i]/100)<1e-5);
  assert.equal(surfaceHeight(1.8,2,layout),DESK_Y+layout.height);
  assert.equal(surfaceHeight(-1.9,2,layout),layout.w<6?DESK_Y:DESK_Y+layout.height);
  const points=supportedPoints([[-8,0,2],[layout.x,0,2],[8,0,2]],layout);
  for(const [x,y,z] of points)assert.ok(Math.abs(y-surfaceHeight(x,z,layout)-WIRE_RADIUS)<1e-6);
  assert.equal(peripheralQuote({mat:p.id},'ru',Date.parse('2026-11-25')).totals.USD,p.offers.usd.price);
 }
});
test('all chair variants have front and rear upholstery and detailed reclining hardware within the mesh budget',()=>{
 for(const chair of peripherals.filter(p=>p.category==='chair')){
  const model=createChairModel(chair,{withTexture:false});
  for(const name of ['quilted-back-insert','rear-tailored-panel','double-needle-stitching','hinge-cap','panel-welt','slide-buckle'])assert.ok(model.getObjectByName(name),chair.id+' '+name);
  let triangles=0;model.traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;});
  assert.ok(triangles<50000,chair.id+' '+triangles);
 }
});
