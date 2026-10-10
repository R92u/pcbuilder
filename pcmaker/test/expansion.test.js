import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,demoBuild,byId} from '../dist/catalog.js';
import {compatibility,thermalTargets,advanceThermals} from '../dist/engine.js';
import {cablesFor,reconcileConnections} from '../dist/wiring.js';
import {componentSpecs} from '../dist/inspector.js';
const settings={load:'stress',ambient:22,front:60,rear:60,cpuFan:60};

test('Expanded catalog has 61 distinct sourced models and three cases',()=>{
 const entries=Object.values(catalog).flat();assert.equal(entries.length,61);assert.equal(new Set(entries.map(p=>p.id)).size,61);assert.equal(catalog.case.length,3);
 for(const [key,parts] of Object.entries(catalog))for(const p of parts){assert.ok(p.sources.some(u=>u.startsWith('https://')),p.id);assert.ok(componentSpecs(p,key).length>3,p.id);}
});
test('Intel supports either memory generation, but the motherboard determines which',()=>{
 for(const [motherboard,ram] of [['b760m-p-ddr4','ddr4-32'],['b760-p-wifi','ddr5-32']])assert.equal(compatibility({...demoBuild,cpu:'i5-12400f',motherboard,ram}).ready,true);
 const mismatch=compatibility({...demoBuild,cpu:'i5-12400f',motherboard:'b760m-p-ddr4',ram:'ddr5-32'});assert.ok(mismatch.errors.some(e=>e.code==='memory'));assert.ok(!mismatch.errors.some(e=>e.code==='cpu-memory'));
});
test('16 pin GPU uses one native plug and rejects an unverified adapter configuration',()=>{
 const b={...demoBuild,gpu:'rtx4070super'};assert.equal(compatibility(b).ready,true);assert.deepEqual(cablesFor(b).filter(c=>c.id.startsWith('gpu')).map(c=>c.id),['gpu16']);
 assert.ok(compatibility({...b,psu:'a650bn'}).errors.some(e=>e.code==='gpu-16pin'));assert.ok(!cablesFor({...b,psu:'a650bn'}).some(c=>c.id==='gpu16'));
});
test('Case front USB follows its actual ports and motherboard header availability',()=>{
 const b={...demoBuild,case:'4000d-airflow'};assert.ok(cablesFor(b).some(c=>c.id==='usbC'));assert.ok(!cablesFor(b).some(c=>c.id==='usb2'));
 const noHeader={...b,cpu:'i5-12400f',motherboard:'b760m-p-ddr4',ram:'ddr4-32'};assert.ok(!cablesFor(noHeader).some(c=>c.id==='usbC'));assert.ok(compatibility(noHeader).warnings.some(w=>w.includes('USB-C')));
 assert.ok(!cablesFor({...b,case:'pop-air'}).some(c=>c.id==='usbC'));
});
test('Stock fan counts affect airflow and case heat at identical speed settings',()=>{
 const one=thermalTargets({...demoBuild,case:'4000d-airflow'},settings),three=thermalTargets(demoBuild,settings);assert.ok(one.flow<three.flow);assert.ok(one.case>three.case);
});
test('Every inspected component has a finite gradually changing thermal estimate',()=>{
 const target=thermalTargets(demoBuild,settings),cold=Object.fromEntries(Object.keys(catalog).map(k=>[k,22])),next=advanceThermals(cold,target,.3);
 for(const key of Object.keys(catalog)){assert.ok(Number.isFinite(target[key]),key);assert.ok(next[key]>22&&next[key]<target[key],key);}
});
test('Raising a cooler fan over RAM also checks remaining case height',()=>{
 assert.ok(compatibility({...demoBuild,cooler:'nh-d15'}).errors.some(e=>e.code==='ram-height'));
 const fit=compatibility({...demoBuild,cooler:'nh-d15',case:'4000d-airflow'});assert.ok(!fit.errors.some(e=>e.code==='ram-height'));assert.ok(fit.warnings.some(w=>w.includes('поднять')));
});
test('Replacing a case resets its leads but preserves PSU to motherboard wiring',()=>{
 const next={...demoBuild,case:'pop-air'},result=reconcileConnections(demoBuild,next,['atx','eps','cpuFan','frontFan','panel','usb2']);assert.deepEqual(result,['atx','eps','cpuFan']);
});
test('Intel thermal peak is MTP; unverified AMD peak remains explicitly marked',()=>{
 for(const p of catalog.cpu.filter(p=>p.brand==='Intel')){assert.ok(Array.isArray(p.memory));assert.ok(p.peakPower>=p.tdp);}
 assert.equal(byId['r7-7800x3d'].powerAssumed,true);
});
