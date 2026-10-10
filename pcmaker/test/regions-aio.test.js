import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalog,demoBuild,resolve,byId} from '../dist/catalog.js';
import {priceSnapshot,storeLink} from '../dist/regions.js';
import {budgetPrice,autoBuild} from '../dist/autobuild.js';
import {compatibility,thermalTargets} from '../dist/engine.js';
import {aioMount,aioPlacement,radiatorConflict} from '../dist/aio.js';
import {caseLayout,coolerLayout} from '../dist/layout.js';
import {fanMounts,sanitizeFanLayout,defaultFanLayout} from '../dist/fan-layout.js';
import {cablesFor,wiringMissing,reconcileConnections} from '../dist/wiring.js';
const prices=JSON.parse(fs.readFileSync(new URL('../dist/prices-by.json',import.meta.url)));
test('BY prices are positive direct 5element offers; RUB never enters BY and is never converted',()=>{
 const by=priceSnapshot(prices,'by');assert.ok(Object.keys(by.items).length>=100);
 for(const [id,p] of Object.entries(by.items)){assert.ok(byId[id]);assert.equal(p.currency,'BYN');assert.equal(new URL(p.url).hostname,'5element.by');assert.ok(p.price>0&&p.date&&p.store);}
 const mixed=priceSnapshot({items:{rub:{price:500,url:'https://dns-shop.ru/'},wrong:{price:10,currency:'BYN',url:'https://wrong.com/'},okay:{price:10,currency:'BYN',url:'https://5element.by/products/test'}}},'by');assert.deepEqual(Object.keys(mixed.items),['okay']);
 assert.equal(budgetPrice(byId['r5-7600'],'cpu',{},true,'BYN'),null);assert.equal(autoBuild({currency:'BYN',budget:5000,prices:by.items}).status,'no-data');
 assert.equal(new URL(storeLink(byId['aio-le240-v2'],'cooler',by).url).hostname,'5element.by');assert.equal(storeLink(byId['r5-7600'],'cpu',by).label,'Каталог 5element ↗');
});
test('240/360 AIO radiator mounts follow case manuals, block occupied fans and check front GPU clearance',()=>{
 const top={...demoBuild,cooler:'aio-le240-v2'},front={...demoBuild,cooler:'aio-le360-v2'},bad={...front,case:'pop-air'},long={...front,gpu:'rtx3090'};
 assert.equal(aioMount(resolve(top)).wall,'top');assert.equal(aioMount(resolve(front)).wall,'front');assert.equal(compatibility(top).ready,true);assert.equal(compatibility(front).ready,true);
 assert.ok(compatibility(bad).errors.some(e=>e.code==='radiator-size'));assert.ok(compatibility(long).errors.some(e=>e.code==='radiator-gpu'));
 for(const c of catalog.case)for(const cooler of catalog.cooler.filter(c=>c.type==='aio')){const b={...demoBuild,case:c.id,cooler:cooler.id},p=resolve(b),frame=caseLayout(p.case,p.gpu,p.cooler),a=aioPlacement(p,frame);if(!a)continue;
  for(const slot of fanMounts(b))assert.equal(radiatorConflict(slot,a),false,c.id+':'+slot.id);
  for(const pos of a.fans){assert.ok(pos[0]+.6<frame.side+.01);assert.ok(pos[1]+(a.wall==='top'?.12:.60)<4.62);assert.ok(pos[2]+(a.wall==='top'?.60:.12)<frame.front);}
  assert.deepEqual(sanitizeFanLayout(b,defaultFanLayout(b)),defaultFanLayout(b));
 }
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
