import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,demoBuild,byId,sanitizeBuild} from '../dist/catalog.js';
import {fanMounts,fanBasis,fanLead,fanBranchRoute,fanHub,fanWalls,defaultFanLayout,sanitizeFanLayout,placementError,mountsOverlap,encodeFans,decodeFans} from '../dist/fan-layout.js';
import {caseLayout,gpuLayout,coolerLayout,CPU_CENTER} from '../dist/layout.js';
import {thermalTargets,compatibility} from '../dist/engine.js';
import {cablesFor,wiringMissing,cleanConnections} from '../dist/wiring.js';
import {cableCurve} from '../dist/cable-geometry.js';
import {TubeGeometry} from '../dist/vendor/three.module.js';
import {fanMountRails,fanGeometryKey,CASE_FAN_DEPTH} from '../dist/fan-layout.js';
const cases=catalog.case,buildFor=p=>({...demoBuild,case:p.id});

test('Every case fan screw is supported by a rail attached to the chassis, in both directions',()=>{
 for(const p of catalog.case){
  const build=buildFor(p),frame=caseLayout(p,byId[build.gpu],byId[build.cooler]),slots=fanMounts(build),rails=fanMountRails(frame,slots);
  for(const slot of slots)for(const direction of ['in','out']){
   const axis=slot.normal.findIndex(Boolean),{u,v}=fanBasis(slot,direction);
   for(const x of [-1,1])for(const y of [-1,1]){
    const screw=slot.position.map((n,i)=>n+slot.normal[i]*CASE_FAN_DEPTH/2+(u[i]*x+v[i]*y)*slot.size*.447);
    const supports=rails.filter(r=>r.wall===slot.wall&&screw.every((n,i)=>Math.abs(n-r.position[i])<=r.size[i]/2+1e-8));
    assert.ok(supports.length,`${p.id}/${slot.id}/${direction} screw ${x},${y} floats`);
    for(const r of supports){
     const outer=r.position[axis]+slot.normal[axis]*r.size[axis]/2;
     const wall={front:frame.front,rear:frame.rear-.04,top:4.63,bottom:.36,left:frame.back,right:frame.side}[slot.wall];
     assert.ok((outer-wall)*slot.normal[axis]>=-1e-8,`${p.id}/${slot.id} rail detached from chassis`);
    }
   }
  }
 }
});
test('Retail shells keep their photographed proportions through part changes',()=>{
 for(const chassis of catalog.case){
  const dimensions=chassis.dimensions;
  const [length,,height]=Array.isArray(dimensions)?dimensions:[dimensions.length,dimensions.width,dimensions.height];
  const frame=caseLayout(chassis);
  assert.ok(Math.abs((frame.depth+.21)/4.66-length/height)<.001,chassis.id);
  assert.deepEqual(caseLayout(chassis,byId[demoBuild.gpu],byId[demoBuild.cooler]),frame);
 }
 const before={...demoBuild,case:'cc560'},after={...before,cooler:'aio-le360-v2'};
 const layout=[{id:'fan1',slot:'front-1',direction:'in'}];
 assert.notEqual(fanGeometryKey(before,layout),fanGeometryKey(after,layout));
 assert.equal(fanGeometryKey(before,layout),fanGeometryKey({...before,ram:'ddr5-32'},layout));
});

test('Retired cases migrate to CC560 without changing the other components',()=>{
 assert.ok(catalog.case.length>0&&catalog.case.every(p=>!p.concept));
 for(const id of ['pcmaker-panorama','pcmaker-dual','pcmaker-compact']){
  assert.equal(byId[id],undefined);
  assert.deepEqual(sanitizeBuild({...demoBuild,case:id}),{...demoBuild,case:'cc560'});
 }
});

test('Default layouts and every single mount fit, with conflicts rejected between neighbours',()=>{
 for(const p of catalog.case){const build=buildFor(p),layout=defaultFanLayout(build),slots=fanMounts(build),frame=caseLayout(p,byId[build.gpu]);
  assert.deepEqual(sanitizeFanLayout(build,layout),layout,p.id);
  for(const s of slots){assert.ok(!placementError(build,[],null,s.id));assert.ok(placementError(build,[{id:'fan1',slot:s.id,direction:'in'}],'fan2',s.id));
   const halves=s.normal.map(n=>n?.115:s.size/2);s.position.forEach((value,i)=>{const range=[[frame.back,frame.side],[.36,4.60],[frame.rear-.03,frame.front]][i];assert.ok(value-halves[i]>=range[0]-.01&&value+halves[i]<=range[1]+.01,`${p.id} ${s.id} axis ${i}`);});
  }
  for(const a of slots)for(const b of slots)if(a.id!==b.id&&mountsOverlap(a,b))assert.ok(placementError(build,[{id:'fan1',slot:a.id,direction:'in'}],'fan2',b.id));
 }
});
test('Malformed shared layouts, duplicate fans, occupied slots and unsupported mounts are sanitized',()=>{
 const build=buildFor(cases[0]),layout=[{id:'fan1',slot:'rear-1',direction:'out'},{id:'fan2',slot:'rear-1',direction:'in'},{id:'fan1',slot:'front-2',direction:'in'},{id:'fan3',slot:'ceiling',direction:'in'},{id:'fan4',slot:'front-1',direction:'bad'},null];
 assert.deepEqual(sanitizeFanLayout(build,layout),layout.slice(0,1));assert.deepEqual(sanitizeFanLayout(build,[]),[]);
 assert.deepEqual(sanitizeFanLayout(demoBuild,[{id:'fan1',slot:'left-1',direction:'in'}]),[]);
 for(const p of cases){const initial=defaultFanLayout(buildFor(p));assert.deepEqual(sanitizeFanLayout(buildFor(p),decodeFans(encodeFans(initial))),initial);}
});
test('Flipping a fan reverses its physical normal and leaves its lead attached to its housing',()=>{
 for(const p of cases)for(const slot of fanMounts(buildFor(p))){const intake=fanBasis(slot,'in'),outlet=fanBasis(slot,'out');
  for(let i=0;i<3;i++)assert.equal(intake.n[i],-outlet.n[i]);
  for(const direction of ['in','out']){const lead=fanLead(slot,direction);assert.ok(lead.every(Number.isFinite));assert.ok(Math.hypot(...lead.map((v,i)=>v-slot.position[i]))<slot.size);}
 }
});
test('Fan leads follow all retail placements/directions, reach the correct hub and stay inside panels',()=>{
 for(const p of cases){const build=buildFor(p),frame=caseLayout(p,byId[build.gpu]);
  for(const slot of fanMounts(build))for(const direction of ['in','out']){
   const fan={id:'fan1',slot:slot.id,direction},route=fanBranchRoute(build,fan);
   assert.deepEqual(route[0],fanLead(slot,direction));assert.deepEqual(route.at(-1),fanHub(build,direction));
   const geo=new TubeGeometry(cableCurve(route,.04),120,.008,5,false),a=geo.attributes.position;
   for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i),message=`${p.id}/${slot.id}/${direction} ${x},${y},${z}`;
    assert.ok(x>frame.back+.02&&x<frame.side+.02&&y>.37&&y<4.64&&z>frame.rear-.02&&z<frame.front-.02,message);
    if(Math.abs(x+1.03)<.025&&y>.42&&y<4.55)assert.ok(z>frame.front-.27,message+' tray crossing');
   }geo.dispose();
  }
 }
});
test('Manual PWM wiring tracks active groups, including all-out and no-fan configurations',()=>{
 const build=buildFor(cases[0]),onlyOut=[{id:'fan1',slot:'rear-1',direction:'out'}];
 assert.ok(!cablesFor(build,onlyOut).some(c=>c.id==='frontFan'));assert.ok(cablesFor(build,onlyOut).some(c=>c.id==='rearFan'));
 assert.deepEqual(cleanConnections(build,['frontFan','rearFan'],onlyOut),['rearFan']);
 assert.ok(wiringMissing(build,'manual',[],onlyOut).some(c=>c.id==='rearFan'));
 assert.ok(!cablesFor(build,[]).some(c=>['frontFan','rearFan'].includes(c.id)));
});
test('Cooling responds to added fans, RPM and direction balance without nonfinite temperatures',()=>{
 const build=buildFor(cases[1]),layout=defaultFanLayout(build),base={load:'stress',ambient:22,front:60,rear:60,cpuFan:60};
 const balanced=thermalTargets(build,{...base,fanLayout:layout}),allIn=thermalTargets(build,{...base,fanLayout:layout.map(f=>({...f,direction:'in'}))}),none=thermalTargets(build,{...base,fanLayout:[]}),stopped=thermalTargets(build,{...base,front:0,rear:0,fanLayout:layout});
 assert.ok(balanced.case<allIn.case);assert.ok(allIn.case<none.case);assert.equal(none.flow,0);assert.equal(stopped.flow,0);assert.ok(Number.isFinite(none.cpu));
});
