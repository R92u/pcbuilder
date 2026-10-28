import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalog,demoBuild,resolve,byId} from '../dist/catalog.js';
import {priceSnapshot,storeLink,byStoreProduct} from '../dist/regions.js';
import {budgetPrice,autoBuild} from '../dist/autobuild.js';
import {isVerified} from '../dist/verification.js';
import {priceQuality} from '../dist/price-quality.js';
import {compatibility,thermalTargets} from '../dist/engine.js';
import {aioMount,aioPlacement,radiatorConflict} from '../dist/aio.js';
import {caseLayout,coolerLayout} from '../dist/layout.js';
import {fanMounts,sanitizeFanLayout,defaultFanLayout} from '../dist/fan-layout.js';
import {cablesFor,wiringMissing,reconcileConnections} from '../dist/wiring.js';
const prices=JSON.parse(fs.readFileSync(new URL('../dist/prices-by.json',import.meta.url)));
const now=Date.UTC(2026,9,28,12);
test('BY prices use direct product links at supported stores and never convert RUB',()=>{
 const by=priceSnapshot(prices,'by');assert.ok(Object.keys(by.items).length>=100);
 for(const [id,p] of Object.entries(by.items)){assert.ok(byId[id]);assert.equal(p.currency,'BYN');assert.ok(byStoreProduct(p.url),p.url);assert.ok(p.price>0&&p.date&&p.store);}
 const mixed=priceSnapshot({items:{rub:{price:500,date:'2026-10-28',url:'https://dns-shop.ru/'},wrong:{price:10,date:'2026-10-28',currency:'BYN',url:'https://wrong.com/'},okay:{price:10,date:'2026-10-28',currency:'BYN',url:'https://5element.by/products/test'}}},'by');assert.deepEqual(Object.keys(mixed.items),['okay']);
 assert.equal(budgetPrice(byId['r5-7600'],'cpu',{},true,'BYN',now),null);
 assert.equal(storeLink(byId['aio-le240-v2'],'cooler',by).label,'Товар в Мастердом ↗');assert.equal(storeLink(byId['r5-7600'],'cpu',by).label,'Товар в TEC.BY ↗');
});

test('Fresh BY offers produce all eight verified compatible parts without estimates or currency conversion',()=>{
 const by=priceSnapshot(prices,'by'),result=autoBuild({currency:'BYN',budget:8000,purpose:'study',allowEstimates:false,prices:by.items,now});
 assert.equal(result.status,'ok');assert.equal(result.quote.rows.length,8);assert.equal(compatibility(result.build).ready,true);assert.ok(result.quote.planned<=8000);assert.equal(result.quote.reserve,0);assert.equal(result.quote.estimatedCount,0);
 for(const row of result.quote.rows){const offer=by.items[row.part.id];assert.equal(offer.currency,'BYN');assert.ok(isVerified(row.part));assert.equal(priceQuality(offer,now).status,'fresh');assert.equal(row.quote.price,offer.price);assert.equal(row.quote.url,offer.url);}
 const noStorage=Object.fromEntries(Object.entries(by.items).filter(([id])=>!catalog.storage.some(p=>p.id===id)));
 assert.equal(autoBuild({currency:'BYN',budget:8000,purpose:'study',allowEstimates:true,prices:noStorage,now}).status,'no-data');
});
test('240/360 AIO radiator mounts follow case manuals, block occupied fans and check front GPU clearance',()=>{
 const top={...demoBuild,cooler:'aio-le240-v2'},front={...demoBuild,cooler:'aio-le360-v2'},bad={...front,case:'pop-air'},long={...front,gpu:'rtx3090'};
 assert.equal(aioMount(resolve(top)).wall,'top');assert.equal(aioMount(resolve(front)).wall,'front');assert.equal(compatibility(top).ready,true);assert.equal(compatibility(front).ready,true);
 assert.ok(compatibility(bad).errors.some(e=>e.code==='radiator-size'));assert.ok(!compatibility(long).errors.some(e=>e.code==='radiator-gpu'),'RTX 3090 fits with the verified 370 mm CC560 clearance');
 for(const c of catalog.case)for(const cooler of catalog.cooler.filter(c=>c.type==='aio')){const b={...demoBuild,case:c.id,cooler:cooler.id},p=resolve(b),frame=caseLayout(p.case,p.gpu,p.cooler),a=aioPlacement(p,frame);if(!a)continue;
  for(const slot of fanMounts(b))assert.equal(radiatorConflict(slot,a),false,c.id+':'+slot.id);
  for(const pos of a.fans){assert.ok(pos[0]+.6<frame.side+.01);assert.ok(pos[1]+(a.wall==='top'?.12:.60)<4.62);assert.ok(pos[2]+(a.wall==='top'?.60:.12)<frame.front);}
  assert.deepEqual(sanitizeFanLayout(b,defaultFanLayout(b)),defaultFanLayout(b));
 }
});
test('Front radiator reduces verified CC560 GPU clearance to 343 mm, including the exact boundary',()=>{
 // No current retail GPU reaches this boundary; isolate a geometric fixture.
 const gpu={...byId.rtx4060,id:'test-radiator-boundary',length:343};catalog.gpu.push(gpu);
 try{
  const build={...demoBuild,gpu:gpu.id,cooler:'aio-le360-v2',case:'cc560'};
  assert.equal(compatibility(build).errors.some(e=>e.code==='radiator-gpu'),false);
  gpu.length=343.01;
  assert.equal(compatibility(build).errors.some(e=>e.code==='radiator-gpu'),true);
  assert.equal(compatibility({...build,cooler:'ak400'}).errors.some(e=>e.code==='gpu-size'),false);
 }finally{catalog.gpu.splice(catalog.gpu.indexOf(gpu),1);}
});

test('AIO pump and radiator PWM cables start at separate physical sources and both are required',()=>{
 const b={...demoBuild,cooler:'aio-le240-v2'},cables=cablesFor(b),pump=cables.find(c=>c.id==='pump'),fan=cables.find(c=>c.id==='cpuFan');assert.ok(pump&&fan);assert.notDeepEqual(pump.points[0],fan.points[0]);
 assert.ok(wiringMissing(b,'manual',cables.filter(c=>c.id!=='pump').map(c=>c.id)).some(c=>c.id==='pump'));
 assert.ok(!reconcileConnections(b,{...b,cooler:'aio-le360-v2'},['pump','cpuFan']).length);
});
test('AIO cooling changes with fan RPM and all new RAM leaves finite geometry',()=>{
 const b={...demoBuild,cooler:'aio-le240-v2'},s={load:'stress',ambient:22,front:60,rear:60,cpuFan:100};assert.ok(thermalTargets(b,s).cpu<thermalTargets(b,{...s,cpuFan:0}).cpu);
 for(const ram of catalog.ram){const l=coolerLayout(byId['nh-d15'],ram,'AM5');assert.ok(Number.isFinite(l.lift),ram.id);}
});
