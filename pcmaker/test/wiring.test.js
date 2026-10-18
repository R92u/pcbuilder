import test from 'node:test';
import assert from 'node:assert/strict';
import {demoBuild} from '../dist/catalog.js';
import {cablesFor,cableSources,connectionAfterDrop,canConnect,cleanConnections,wiringMissing,reconcileConnections} from '../dist/wiring.js';

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

test('Every available cable has a direct 3D source; modular PSU sockets remain distinct',()=>{
 const cables=cablesFor(demoBuild),sources=cableSources(cables);
 assert.deepEqual(sources.flatMap(s=>s.cables.map(c=>c.id)).sort(),cables.map(c=>c.id).sort());
 for(const source of sources)for(const c of source.cables)assert.deepEqual(source.position,c.points[0]);
 const atx=sources.find(s=>s.cables.some(c=>c.id==='atx')),eps=sources.find(s=>s.cables.some(c=>c.id==='eps'));
 assert.notDeepEqual(atx.position,eps.position);assert.equal(atx.cables.length,1);
});

test('A shared non-modular PSU exit exposes all of its correct destinations without overlapping markers',()=>{
 const build={...demoBuild,psu:'a650bn'},cables=cablesFor(build),sources=cableSources(cables);
 const power=cables.filter(c=>c.from==='Блок питания'),source=sources.find(s=>s.cables.some(c=>c.id==='atx'));
 assert.deepEqual(source.cables.map(c=>c.id).sort(),power.map(c=>c.id).sort());
 for(const cable of source.cables)assert.ok(connectionAfterDrop(build,undefined,'manual',[],cable.id,cable.id));
 assert.equal(connectionAfterDrop(build,undefined,'manual',[],'atx','cpuFan'),null);
});

test('A direct drop connects without a panel selection, preserves other wires and does not toggle existing connections off',()=>{
 const connections=['eps','cpuFan'],before=[...connections];
 const result=connectionAfterDrop(demoBuild,undefined,'manual',connections,'atx','atx');
 assert.equal(result.mode,'manual');assert.deepEqual(result.connections,['eps','cpuFan','atx']);assert.deepEqual(connections,before);
 assert.deepEqual(connectionAfterDrop(demoBuild,undefined,'manual',result.connections,'atx','atx'),result);
 for(const port of [null,'gpu1','missing'])assert.equal(connectionAfterDrop(demoBuild,undefined,'manual',connections,'atx',port),null);
 assert.equal(connectionAfterDrop({...demoBuild,psu:null},undefined,'manual',connections,'atx','atx'),null);
});

test('Dragging from automatic wiring changes only the mode after a valid drop and keeps the other connections',()=>{
 const original=[];
 for(const port of [null,'gpu1'])assert.equal(connectionAfterDrop(demoBuild,undefined,'auto',original,'atx',port),null);
 const result=connectionAfterDrop(demoBuild,undefined,'auto',original,'atx','atx');
 assert.equal(result.mode,'manual');assert.deepEqual(result.connections.sort(),cablesFor(demoBuild).map(c=>c.id).sort());assert.deepEqual(original,[]);
});
