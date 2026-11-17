import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogEntry} from '../dist/catalog-entry.js';
import {byId,demoBuild} from '../dist/catalog.js';
import {compatibility,thermalTargets} from '../dist/engine.js';
import {cablesFor} from '../dist/wiring.js';
import {gpuLayout,gpuSlots} from '../dist/layout.js';
import {productImages} from '../dist/product-images.js';
import {estimatePrice,estimateDateFor,gpuRanks} from '../dist/budget-data.js';
import {connectorType} from '../dist/peripheral-connections.js';

test('Entry-level editions have distinct photos, estimates and memory variants',()=>{
 assert.equal(catalogEntry.cpu.length,8);assert.equal(catalogEntry.gpu.length,8);
 for(const [category,parts] of Object.entries(catalogEntry))for(const p of parts){assert.ok(byId[p.id]);assert.ok(productImages[p.id]?.image);assert.ok(estimatePrice(p,category)>0);assert.equal(estimateDateFor(p),'2026-11-17');}
 assert.equal(byId['gt710-2gd3h-lp'].vramType,'DDR3');assert.equal(byId['gt710-asus-evo'].vramType,'GDDR5');
 assert.equal(byId.g6900.threads,2);assert.equal(byId.g7400.threads,4);
});
test('Entry CPUs reject wrong sockets and memory while matching current platforms',()=>{
 for(const p of catalogEntry.cpu){const intel=p.brand==='Intel',b={...demoBuild,cpu:p.id,motherboard:intel?'h610m-e-ddr4':'a520m-a-pro',ram:'ddr4-32'};
 assert.equal(compatibility(b).errors.length,0,p.id);
 assert.ok(compatibility({...b,motherboard:'b650'}).errors.some(e=>e.code==='socket'));
 assert.ok(compatibility({...b,ram:'ddr5-32'}).errors.some(e=>e.code==='memory'));
 }
});
test('Small GPUs keep narrow rails and no phantom PSU cables or DisplayPort',()=>{
 for(const p of catalogEntry.gpu){const l=gpuLayout(p);assert.ok(Math.abs(l.edgeX-(-.8+p.width/100))<1e-8);assert.ok(gpuSlots(p)<=2);assert.equal(cablesFor({...demoBuild,gpu:p.id}).filter(c=>c.id.startsWith('gpu')).length,0);assert.ok(gpuRanks[p.id]<gpuRanks.rx6600);}
 assert.equal(gpuSlots(byId['gt710-2gd3h-lp']),1);
 assert.equal(connectorType(byId['gt710-2gd3h-lp'].ports[2]),'vga');
});
test('Passive GT1030 heats more than active GT1030 at equal power and airflow',()=>{
 const settings={ambient:22,load:'stress',front:60,rear:60,cpuFan:60};
 const passive=thermalTargets({...demoBuild,gpu:'gt1030-msi-passive'},settings),active=thermalTargets({...demoBuild,gpu:'gt1030-aero-oc'},settings);
 assert.equal(passive.gpuPower,active.gpuPower);assert.ok(passive.gpu>active.gpu+5);assert.ok(Number.isFinite(passive.gpu));
});
