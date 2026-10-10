import test from 'node:test';
import assert from 'node:assert/strict';
import {demoBuild} from '../dist/catalog.js';
import {cablesFor,canConnect,cleanConnections,wiringMissing,reconcileConnections} from '../dist/wiring.js';

test('PCIe GPU power cannot be inserted into EPS CPU power',()=>{
 assert.equal(canConnect('gpu1','eps'),false);assert.equal(canConnect('eps','gpu1'),false);assert.equal(canConnect('gpu1','gpu1'),true);assert.equal(canConnect('unknown','unknown'),false);
});
test('Manual assembly blocks without required cables but optional front USB is not required',()=>{
 const required=cablesFor(demoBuild).filter(c=>c.required).map(c=>c.id);
 assert.ok(wiringMissing(demoBuild,'manual',[]).length>0);assert.equal(wiringMissing(demoBuild,'manual',required).length,0);assert.equal(wiringMissing(demoBuild,'auto',[]).length,0);
});
test('RTX 3090 requires both GPU power cables and replacement invalidates old GPU cabling',()=>{
 const next={...demoBuild,gpu:'rtx3090'},existing=cablesFor(demoBuild).map(c=>c.id);
 assert.equal(cablesFor(next).filter(c=>c.id.startsWith('gpu')).length,2);
 const retained=reconcileConnections(demoBuild,next,existing);assert.ok(retained.includes('atx'));assert.ok(!retained.includes('gpu1'));
 assert.ok(wiringMissing(next,'manual',retained).some(c=>c.id==='gpu2'));
});
test('Removing PSU removes its cables; RAM and NVMe have no fictional separate wires',()=>{
 const next={...demoBuild,psu:null},list=cablesFor(next);assert.ok(!list.some(c=>['atx','eps','gpu1'].includes(c.id)));
 assert.ok(!list.some(c=>/ram|nvme|ssd/i.test(c.id)));assert.ok(list.some(c=>c.id==='cpuFan'));
 assert.deepEqual(cleanConnections(next,['atx','cpuFan','cpuFan','bad']),['cpuFan']);
});
test('B550 and the single-EPS PSU do not offer a nonexistent second CPU cable',()=>{
 assert.ok(!cablesFor({...demoBuild,motherboard:'b550'}).some(c=>c.id==='eps2'));
 assert.ok(!cablesFor({...demoBuild,psu:'a650bn'}).some(c=>c.id==='eps2'));
});
