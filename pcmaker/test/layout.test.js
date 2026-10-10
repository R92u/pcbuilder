import test from 'node:test';
import assert from 'node:assert/strict';
import {CatmullRomCurve3,Vector3} from '../dist/vendor/three.module.js';
import {catalog,byId,demoBuild} from '../dist/catalog.js';
import {caseLayout,coolerLayout,gpuLayout,psuFront,boardBottom} from '../dist/layout.js';
import {portsFor,cablesFor} from '../dist/wiring.js';
import {compatibility} from '../dist/engine.js';
import {componentSpecs} from '../dist/inspector.js';
import {productImages} from '../dist/product-images.js';
const curve=points=>new CatmullRomCurve3(points.map(p=>new Vector3(...p)),false,'centripetal');

test('Every model has an attributed photograph; expansion includes two white cases',()=>{
 for(const p of Object.values(catalog).flat())assert.ok(productImages[p.id]?.image&&productImages[p.id]?.sourcePage,p.id);
 assert.equal(catalog.case.filter(p=>p.color==='white').length,2);
});
test('Installed intake fans clear each other, floor and roof in all six cases',()=>{
 for(const p of catalog.case){const l=caseLayout(p);for(const y of l.fanYs){assert.ok(y-l.fanSize/2>.34,p.id);assert.ok(y+l.fanSize/2<4.58,p.id);}for(let i=1;i<l.fanYs.length;i++)assert.ok(l.fanYs[i]-l.fanYs[i-1]>=l.fanSize-.001,p.id);}
});
test('Supported GPUs clear the intake; tower fans do not intersect fin blocks',()=>{
 for(const c of catalog.case)for(const g of catalog.gpu)if(g.length<=c.gpuLimit)assert.ok(gpuLayout(g).end<caseLayout(c).fanZ-.13,`${c.id}/${g.id}`);
 for(const p of catalog.cooler){const l=coolerLayout(p,byId['ddr5-32'],'AM5');assert.ok(Number.isFinite(l.size)&&l.finEnd>l.finStart,p.id);for(const z of l.fanZ.slice(0,p.fans||1))for(const tower of l.towers)assert.ok(Math.abs(z-tower)>l.finDepth/2+.12,p.id);}
});
test('GPU cable curves pass through the shroud opening and below tower coolers',()=>{
 for(const g of catalog.gpu){const b={...demoBuild,gpu:g.id,case:'h7-flow'},cables=cablesFor(b).filter(c=>c.id.startsWith('gpu'));
  for(const cable of cables){const points=curve(cable.points).getPoints(350);assert.ok(Math.max(...points.map(p=>p.y))<2.73,g.id);
   const crossing=points.reduce((best,p)=>Math.abs(p.y-1.14)<Math.abs(best.y-1.14)?p:best);const half=(cable.strands-1)*cable.radius*2.15/2+cable.radius;
   assert.ok(crossing.x-half>.315&&crossing.x+half<.925&&crossing.z>.20&&crossing.z<.90,g.id);
   assert.deepEqual(cable.points.at(-1),portsFor(b)[cable.id].position);assert.equal(portsFor(b)[cable.id].axis,'y');
  }
 }
});
test('PSU source positions and bottom headers follow the selected hardware',()=>{
 for(const p of catalog.psu){const b={...demoBuild,psu:p.id};for(const c of cablesFor(b).filter(c=>c.from==='Блок питания'))assert.equal(c.points[0][2],psuFront(p)+.055,p.id);}
 for(const p of catalog.motherboard){const b={...demoBuild,motherboard:p.id};for(const id of ['audio','usb2','panel'])assert.ok(portsFor(b)[id].position[1]>boardBottom(p));}
});
test('New power configurations handle slot-powered cards and three separate PCIe plugs',()=>{
 assert.deepEqual(cablesFor({...demoBuild,gpu:'rtx3050-6-ventus2x-e-oc'}).filter(c=>c.id.startsWith('gpu')),[]);
 const b={...demoBuild,gpu:'rx7900xtx-pulse'};assert.deepEqual(cablesFor(b).filter(c=>c.id.startsWith('gpu')).map(c=>c.id),['gpu1','gpu2','gpu3']);
 assert.ok(componentSpecs(byId['rtx3050-6-ventus2x-e-oc'],'gpu').some(row=>row[1]==='Без дополнительного кабеля'));
 assert.ok(compatibility({...demoBuild,gpu:'rtx5090-ventus3x-oc',psu:'a750g',case:'h7-flow'}).errors.some(e=>e.code==='gpu-cable-power'));
});
test('Unknown case PSU limit is a warning; socket-dependent RAM clearance is respected',()=>{
 const b={...demoBuild,case:'h7-flow',cooler:'nh-u14s'};assert.ok(!compatibility(b).errors.some(e=>['psu-size','ram-height'].includes(e.code)));assert.ok(compatibility(b).warnings.some(w=>w.includes('предел длины БП')));
});
