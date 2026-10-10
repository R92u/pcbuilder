import test from 'node:test';
import assert from 'node:assert/strict';
import {TubeGeometry,Vector3} from '../dist/vendor/three.module.js';
import {cableCurve,strandPoints} from '../dist/cable-geometry.js';
import {catalog,byId,demoBuild} from '../dist/catalog.js';
import {caseLayout,coolerLayout,gpuLayout,psuFront,boardBottom,TRAY_X,TRAY_HOLES,REAR_OPENINGS,gpuSlots} from '../dist/layout.js';
import {portsFor,cablesFor} from '../dist/wiring.js';
import {compatibility} from '../dist/engine.js';
import {componentSpecs} from '../dist/inspector.js';
import {productImages} from '../dist/product-images.js';
const curve=cableCurve;

test('Every retail model has an attributed photo; concepts are separate',()=>{
 for(const p of Object.values(catalog).flat().filter(p=>!p.concept))assert.ok(productImages[p.id]?.image&&productImages[p.id]?.sourcePage,p.id);
 assert.equal(catalog.case.filter(p=>!p.concept&&p.color==='white').length,2);
});
test('Installed intake fans clear each other, floor and roof in all six cases',()=>{
 for(const p of catalog.case){const l=caseLayout(p);for(const y of l.fanYs){assert.ok(y-l.fanSize/2>.34,p.id);assert.ok(y+l.fanSize/2<4.58,p.id);}for(let i=1;i<l.fanYs.length;i++)assert.ok(l.fanYs[i]-l.fanYs[i-1]>=l.fanSize-.001,p.id);}
});
test('Supported GPUs clear the intake; tower fans do not intersect fin blocks',()=>{
 for(const c of catalog.case)for(const g of catalog.gpu)if(g.length<=c.gpuLimit)assert.ok(gpuLayout(g).end<caseLayout(c,g).fanZ-.13,`${c.id}/${g.id}`);
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


test('All rendered wire strands stay inside the back panel and cross real tray apertures',()=>{
 const builds=catalog.case.flatMap(c=>[byId['rtx4060'],byId['rx7900xtx-pulse']].map(g=>({...demoBuild,case:c.id,gpu:g.id})));
 for(const key of ['psu','motherboard','cooler','gpu'])for(const p of catalog[key])builds.push({...demoBuild,case:'h7-flow',[key]:p.id});
 for(const build of builds){
  const c=byId[build.case],gpu=byId[build.gpu],frame=caseLayout(c,gpu),holes=[...TRAY_HOLES,{y:4.44,z:frame.ioZ,h:.18,w:.20}];
  for(const cable of cablesFor(build))for(let i=0;i<cable.strands;i++){
   const geometry=new TubeGeometry(curve(strandPoints(cable,i)),Math.max(72,cable.points.length*14),cable.radius,5,false),v=geometry.attributes.position;
   for(let n=0;n<v.count;n++){
    const x=v.getX(n),y=v.getY(n),z=v.getZ(n),message=c.id+'/'+cable.id+' at '+[x,y,z].map(v=>v.toFixed(3));
    assert.ok(x>frame.back+.035/2+.004,message+' pierces side panel');
    assert.ok(y>.36&&y<4.68,message+' floor/roof');
    if(Math.abs(x-TRAY_X)<.025&&y>=1.30&&y<=4.55&&z>=frame.rear+.10&&z<=frame.front-.27){
     assert.ok(holes.some(h=>Math.abs(y-h.y)<h.h/2&&Math.abs(z-h.z)<h.w/2),message+' solid tray');
    }
   }
   geometry.dispose();
  }
 }
});
test('Rear slot stack has continuous coverage for every GPU bracket thickness',()=>{
 const h=REAR_OPENINGS.slots,top=h.y+h.h/2,bottom=h.y-h.h/2;
 assert.equal(top,2.47);assert.ok(Math.abs(bottom-1.21)<1e-9);
 for(const gpu of catalog.gpu){const count=gpuSlots(gpu),bracketBottom=2.47-count*.18;assert.ok(count>=1&&count<=7);if(count<7)assert.ok(Math.abs((2.38-count*.18+.09)-bracketBottom)<1e-9,gpu.id);}
});
test('Loose cable starts at its own component and uses a per-source rest position',()=>{
 const cables=cablesFor({...demoBuild,case:'ch560-white'});
 for(const cable of cables){assert.deepEqual(cable.loosePrefix[0],cable.points[0]);assert.ok(cable.looseRest.every(Number.isFinite));}
 const positions=['atx','cpuFan','frontFan','rearFan','usb3','panel'].map(id=>cables.find(c=>c.id===id).looseRest.join(','));
 assert.equal(new Set(positions).size,positions.length);
 for(const psu of catalog.psu.filter(p=>!p.modular&&p.id!=='a850'))for(const c of cablesFor({...demoBuild,psu:psu.id}).filter(c=>c.from==='Блок питания'))assert.deepEqual(c.points[0].slice(0,2),[.31,.72]);
});

test('Right-angle bottom headers and plugs clear thick GPU coolers on mATX boards',()=>{
 for(const board of catalog.motherboard.filter(p=>p.form==='Micro-ATX'))for(const gpu of catalog.gpu){
  const ports=portsFor({...demoBuild,motherboard:board.id,gpu:gpu.id});
  for(const id of ['audio','panel','usb2']){
   assert.equal(ports[id].axis,'-y');
   const l=gpuLayout(gpu),scale=l.width/1.60,finBack=-.665*scale-.84*(1-scale);
   const plugBelow=ports[id].position[1]-.075+.045<l.bottom,plugBehind=ports[id].position[0]+.17/2<finBack;
   assert.ok(plugBelow||plugBehind,board.id+'/'+gpu.id+' plug');
   assert.ok(ports[id].position[1]+.105<l.bottom||ports[id].position[0]+.255/2<finBack,board.id+'/'+gpu.id+' housing');
  }
 }
});
