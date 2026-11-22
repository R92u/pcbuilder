import assert from 'node:assert/strict';
import test from 'node:test';
import {catalog,demoBuild,resolve} from '../dist/catalog.js';
import {caseLayout,gpuLayout,TRAY_X} from '../dist/layout.js';
import {fanHub,fanMounts,fanBranchRoute} from '../dist/fan-layout.js';
import {aioPlacement,coolantHoses,radiatorFanBranches} from '../dist/aio.js';
import {cablesFor,portsFor} from '../dist/wiring.js';
import {cableCurve} from '../dist/cable-geometry.js';

function clearsFan(point,center,axis,rotorRadius,leadRadius){
 const delta=point.toArray().map((v,i)=>v-center[i]);
 const axial=Math.abs(delta.splice(axis,1)[0]);
 return axial>.115+leadRadius||Math.hypot(...delta)>rotorRadius+leadRadius;
}

test('Both orientations of every retail fan carry their cable outside the rotor to a mounted splitter',()=>{
 for(const chassis of catalog.case){
  const build={...demoBuild,case:chassis.id},slots=fanMounts(build);
  for(const slot of slots)for(const direction of ['in','out']){
   const hub=fanHub(build,direction),route=fanBranchRoute(build,{slot:slot.id,direction});
   assert.ok(Math.abs(hub[0]-.105/2-(TRAY_X+.0175))<.008);
   const points=cableCurve(route,.04).getSpacedPoints(160);
   for(const other of slots)assert.ok(points.every(p=>clearsFan(p,other.position,other.normal.findIndex(Boolean),other.size*.40,.008)),chassis.id+'/'+slot.id+'/'+direction+' crosses '+other.id);
  }
 }
});

test('Right-angle USB harnesses enter along the board edge and clear the graphics card',()=>{
 for(const gpu of catalog.gpu){
  const build={...demoBuild,gpu:gpu.id,case:'ch560-white'},layout=gpuLayout(gpu);
  for(const cable of cablesFor(build).filter(c=>['usb3','usbC'].includes(c.id))){
   const [x,y,z]=cable.points.at(-1),entry=cable.points.at(-2);
   assert.equal(portsFor(build)[cable.id].axis,'z');
   assert.deepEqual(entry.slice(0,2),[x,y]);assert.ok(entry[2]>z+.12);
   const finBack=-.84+.175*layout.width/1.6;
   const points=cableCurve(cable.points).getSpacedPoints(150);
   assert.ok(points.every(p=>p.y>layout.top+.06||p.y<layout.bottom-.08||p.z>layout.end+.04||p.x+cable.radius<finBack),gpu.id+'/'+cable.id);
  }
 }
});

test('Radiator hoses and splitter branches avoid their fan rotors in each supported case',()=>{
 for(const chassis of catalog.case)for(const cooler of catalog.cooler.filter(c=>c.type==='aio')){
  const build={...demoBuild,case:chassis.id,cooler:cooler.id},parts=resolve(build);
  const frame=caseLayout(chassis,parts.gpu,cooler),a=aioPlacement(parts,frame);
  if(!a)continue;
  const hoses=coolantHoses(a,frame),branches=radiatorFanBranches(a);
  assert.equal(branches.length,a.fans.length-1);
  assert.ok(cableCurve(hoses[0],.22).getPointAt(.5).distanceTo(cableCurve(hoses[1],.22).getPointAt(.5))>.088);
  for(const [type,routes,fillet,radius] of [['hose',hoses,.22,.044],['branch',branches,.045,.012]]){
   for(const route of routes){
    if(type==='branch')assert.deepEqual(route.at(-1),a.fanSource);
    const points=cableCurve(route,fillet).getSpacedPoints(140);
    for(const fan of a.fans)assert.ok(points.every(p=>clearsFan(p,fan,a.wall==='top'?1:2,.48,radius)),[chassis.id,cooler.id,type].join('/'));
   }
  }
 }
});
