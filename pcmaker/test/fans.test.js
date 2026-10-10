import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,demoBuild,byId} from '../dist/catalog.js';
import {fanMounts,fanBasis,fanLead,fanBranchRoute,fanHub,fanWalls,defaultFanLayout,sanitizeFanLayout,placementError,mountsOverlap,encodeFans,decodeFans} from '../dist/fan-layout.js';
import {caseLayout,gpuLayout,coolerLayout,CPU_CENTER} from '../dist/layout.js';
import {thermalTargets,compatibility} from '../dist/engine.js';
import {cablesFor,wiringMissing,cleanConnections} from '../dist/wiring.js';
import {cableCurve} from '../dist/cable-geometry.js';
import {TubeGeometry} from '../dist/vendor/three.module.js';
const concepts=catalog.case.filter(p=>p.concept),buildFor=p=>({...demoBuild,case:p.id});

test('Three distinct educational envelopes expose three mounts on each wall',()=>{
 assert.equal(concepts.length,3);assert.equal(new Set(concepts.map(p=>JSON.stringify(caseLayout(p)))).size,3);
 for(const p of concepts){const slots=fanMounts(buildFor(p));assert.equal(slots.length,18);for(const wall of Object.keys(fanWalls))assert.equal(slots.filter(s=>s.wall===wall).length,3);}
 const retail=fanMounts(demoBuild);assert.ok(retail.every(s=>['front','rear'].includes(s.wall)));
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
 const build=buildFor(concepts[0]),layout=[{id:'fan1',slot:'top-1',direction:'out'},{id:'fan2',slot:'top-1',direction:'in'},{id:'fan1',slot:'front-2',direction:'in'},{id:'fan3',slot:'ceiling',direction:'in'},{id:'fan4',slot:'front-1',direction:'bad'},null];
 assert.deepEqual(sanitizeFanLayout(build,layout),layout.slice(0,1));assert.deepEqual(sanitizeFanLayout(build,[]),[]);
 assert.deepEqual(sanitizeFanLayout(demoBuild,[{id:'fan1',slot:'left-1',direction:'in'}]),[]);
 for(const p of concepts){const initial=defaultFanLayout(buildFor(p));assert.deepEqual(sanitizeFanLayout(buildFor(p),decodeFans(encodeFans(initial))),initial);}
});
test('Flipping a fan reverses its physical normal and leaves its lead attached to its housing',()=>{
 for(const p of concepts)for(const slot of fanMounts(buildFor(p))){const intake=fanBasis(slot,'in'),outlet=fanBasis(slot,'out');
  for(let i=0;i<3;i++)assert.equal(intake.n[i],-outlet.n[i]);
  for(const direction of ['in','out']){const lead=fanLead(slot,direction);assert.ok(lead.every(Number.isFinite));assert.ok(Math.hypot(...lead.map((v,i)=>v-slot.position[i]))<slot.size);}
 }
});
test('Fan leads follow all 36 placements/directions, reach the correct hub and stay inside panels',()=>{
 for(const p of concepts){const build=buildFor(p),frame=caseLayout(p,byId[build.gpu]);
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
test('New mounts clear the motherboard, GPU, PSU and cooler envelopes',()=>{
 const intersects=(s,min,max)=>s.position.every((v,i)=>v+(s.normal[i]?.12:s.size/2)>min[i]&&v-(s.normal[i]?.12:s.size/2)<max[i]);
 for(const p of concepts)for(const gpu of catalog.gpu)for(const cooler of catalog.cooler){
  const build={...buildFor(p),gpu:gpu.id,cooler:cooler.id};if(!compatibility(build).ready)continue;
  const g=gpuLayout(gpu),c=coolerLayout(cooler,byId[build.ram],'AM5');
  const boxes=[{name:'board',min:[-1,1.28,-1.88],max:[-.6,4.32,.78]},{name:'GPU',min:[-.85,g.bottom,g.rear],max:[g.edgeX,g.top+.03,g.end]},{name:'PSU',min:[-.64,.38,-2.12],max:[.84,1.06,-.32]},{name:'cooler',min:[-.3,CPU_CENTER.y-c.size/2,-1.4],max:[c.top+c.lift,CPU_CENTER.y+c.size/2,.40]}];
  for(const slot of fanMounts(build))for(const box of boxes)assert.ok(!intersects(slot,box.min,box.max),`${p.id}/${slot.id}/${gpu.id}/${cooler.id} intersects ${box.name}`);
 }
});
test('Manual PWM wiring tracks active groups, including all-out and no-fan configurations',()=>{
 const build=buildFor(concepts[0]),onlyOut=[{id:'fan1',slot:'top-1',direction:'out'}];
 assert.ok(!cablesFor(build,onlyOut).some(c=>c.id==='frontFan'));assert.ok(cablesFor(build,onlyOut).some(c=>c.id==='rearFan'));
 assert.deepEqual(cleanConnections(build,['frontFan','rearFan'],onlyOut),['rearFan']);
 assert.ok(wiringMissing(build,'manual',[],onlyOut).some(c=>c.id==='rearFan'));
 assert.ok(!cablesFor(build,[]).some(c=>['frontFan','rearFan'].includes(c.id)));
});
test('Cooling responds to added fans, RPM and direction balance without nonfinite temperatures',()=>{
 const build=buildFor(concepts[1]),layout=defaultFanLayout(build),base={load:'stress',ambient:22,front:60,rear:60,cpuFan:60};
 const balanced=thermalTargets(build,{...base,fanLayout:layout}),allIn=thermalTargets(build,{...base,fanLayout:layout.map(f=>({...f,direction:'in'}))}),none=thermalTargets(build,{...base,fanLayout:[]}),stopped=thermalTargets(build,{...base,front:0,rear:0,fanLayout:layout});
 assert.ok(balanced.case<allIn.case);assert.ok(allIn.case<none.case);assert.equal(none.flow,0);assert.equal(stopped.flow,0);assert.ok(Number.isFinite(none.cpu));
});
