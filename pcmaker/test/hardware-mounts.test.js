import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import test from 'node:test';
import {catalog,demoBuild} from '../dist/catalog.js';
import {boardBottom,caseLayout,CPU_CENTER,M2_MOUNT} from '../dist/layout.js';
import {aioPlacement} from '../dist/aio.js';

const threeURL=new URL('../dist/vendor/three.module.js',import.meta.url).href;
registerHooks({resolve(name,context,next){return next(name==='three'?threeURL:name,context);}});
const {PCScene}=await import('../dist/scene.js');
const {Box3,Group,Vector3}=await import(threeURL);
// Rendering materials use canvas for decals; transforms, geometry and batching are real.
const canvasContext=new Proxy({createLinearGradient:()=>({addColorStop(){}}),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{
 get(state,key){return state[key]??(()=>{});}
});
globalThis.document={createElement:()=>({getContext:()=>canvasContext})};

function fixture(build=demoBuild){
 const scene=Object.create(PCScene.prototype);
 Object.assign(scene,{root:new Group(),fans:[],currentBuild:build});
 return scene;
}
const close=(a,b)=>Math.abs(a-b)<1e-5;
test('refreshing prices preserves a cable flight; replacing its hardware stops it',()=>{
 const build={cpu:demoBuild.cpu},scene=fixture(build),cpu=new Group();
 cpu.userData.signature=build.cpu;scene.root.add(cpu);
 Object.assign(scene,{renderer:{shadowMap:{}},parts:{cpu},transitions:[],rearPanel:{},setFanLayout(){},collectLights(){},guides:{setBuild(){}},
  cableFlight:{active:true,cancel(){this.active=false;}}});
 scene.setBuild({...build});
 assert.equal(scene.cableFlight.active,true);
 scene.setBuild({cpu:null});
 assert.equal(scene.cableFlight.active,false);
});
function boxBounds(scene){
 const calls=[];
 scene.box=function(parent,w,h,d,x,y,z,color,...args){
  calls.push({parent,color,lo:[x-w/2,y-h/2,z-d/2],hi:[x+w/2,y+h/2,z+d/2]});
  return PCScene.prototype.box.call(this,parent,w,h,d,x,y,z,color,...args);
 };
 return calls;
}

test('Physical geometry is finite for every catalog component',()=>{
 const methods={case:'makeCase',motherboard:'makeMotherboard',gpu:'makeGPU',ram:'makeRAM',psu:'makePSU',cooler:'makeCooler',cpu:'makeCPU',storage:'makeStorage'};
 for(const [category,method] of Object.entries(methods))for(const part of catalog[category]){
  const scene=fixture({...demoBuild,[category]:part.id});
  const group=scene[method](part)||scene.caseGroup,bounds=new Box3().setFromObject(group);
  assert.ok(!bounds.isEmpty()&&[...bounds.min.toArray(),...bounds.max.toArray()].every(Number.isFinite),part.id);
  group.traverse(node=>{node.geometry?.dispose();node.material?.map?.dispose();node.material?.dispose();});
 }
});

test('View 270 front and side glazing meet above the wrapped plinth',()=>{
 for(const chassis of catalog.case.filter(c=>c.family==='view-270')){
  const scene=fixture({...demoBuild,case:chassis.id});
  scene.makeCase(chassis);
  const panes=[];
  scene.caseGroup.traverse(node=>{
   if(node.isMesh&&node.material.isMeshPhysicalMaterial&&node.material.transparent)panes.push(node);
  });
  assert.equal(panes.length,2,chassis.id);
  const side=new Box3().setFromObject(scene.glass);
  const front=new Box3().setFromObject(panes.find(node=>node!==scene.glass));
  assert.ok(Math.abs(side.max.z-front.max.z)<.012,chassis.id+' open front seam');
  assert.ok(Math.abs(side.max.x-front.max.x)<.025,chassis.id+' detached front window');
  assert.ok(side.min.y>1.20&&front.min.y>1.20,chassis.id+' pane overlaps plinth');
 }
});

test('Micro-ATX and ATX screw pillars land on the actual PCB and the M.2 tail has support',()=>{
 for(const form of new Set(catalog.motherboard.map(m=>m.form))){
  const board=catalog.motherboard.find(m=>m.form===form),scene=fixture({...demoBuild,motherboard:board.id});
  const rods=[],boxes=boxBounds(scene);
  scene.rod=function(group,a,b,r,color){rods.push({a,b,color});return PCScene.prototype.rod.call(this,group,a,b,r,color);};
  scene.makeMotherboard(board);
  const pcb=boxes.find(b=>b.color===0x151b19);
  for(const y of [boardBottom(board)+.14,2.6,4.12])for(const z of [-1.72,.55]){
   assert.ok(rods.some(({a,b})=>a[0]<pcb.lo[0]&&close(b[0],pcb.lo[0])&&close(b[1],y)&&close(b[2],z)),board.id);
  }
  const m=M2_MOUNT;
  const ssd=fixture(),ssdBoxes=boxBounds(ssd);ssd.makeStorage(catalog.storage[0]);
  const card=ssdBoxes.find(b=>b.color===0x1d3026);
  assert.ok(rods.some(({b})=>close(b[0],card.lo[0])&&close(b[1],m.y)&&close(b[2],card.hi[2])));
  const socket=boxes.find(b=>b.color===0x242c29);
  assert.ok(socket.lo[0]<=pcb.hi[0]&&socket.hi[0]>=card.hi[0]&&socket.lo[2]<card.lo[2]&&socket.hi[2]>card.lo[2]);
 }
});

test('GPU tongues and I/O metalwork reach both mounting interfaces including compact cards',()=>{
 for(const card of [catalog.gpu.find(p=>p.modelStyle==='compact-budget'),catalog.gpu.find(p=>p.modelStyle!=='compact-budget')]){
  const scene=fixture({...demoBuild,gpu:card.id}),boxes=boxBounds(scene);
  scene.makeGPU(card);
  const bracket=boxes.find(b=>b.color===0x606a6b),tongue=boxes.find(b=>b.color===0x28362a),edge=boxes.find(b=>b.color===0x192923);
  assert.ok(tongue.lo[0]<-.764&&tongue.hi[0]>-.72&&tongue.lo[1]<=2.375&&tongue.hi[1]>=2.375);
  assert.ok(edge.lo[2]<=bracket.hi[2]&&edge.hi[2]>=-1.80);
  for(const shell of boxes.filter(b=>b.color===0x646c6c)){
   assert.ok(shell.lo[2]<=bracket.hi[2]&&shell.hi[2]>=edge.lo[2]&&shell.hi[1]>=edge.lo[1]);
   assert.ok(shell.lo[0]>=edge.lo[0]-1e-5&&shell.hi[0]<=edge.hi[0]+1e-5);
  }
 }
});

test('AIO cold plate touches the CPU lid; radiator and fan frames meet the front wall or roof',()=>{
 const cpuScene=fixture(),cpuBoxes=boxBounds(cpuScene);cpuScene.makeCPU(catalog.cpu[0]);
 const lid=cpuBoxes.find(b=>b.color===0xb9bebe);
 for(const cooler of catalog.cooler.filter(p=>p.type==='aio'))for(const chassis of catalog.case){
  const parts={case:chassis,cooler},frame=caseLayout(chassis,undefined,cooler),a=aioPlacement(parts,frame);
  if(!a)continue;
  const scene=fixture({case:chassis.id,cooler:cooler.id}),boxes=boxBounds(scene);
  scene.makeCooler(cooler);
  const coldPlate=boxes.find(b=>b.color===0xaa8261);
  assert.ok(Math.abs(coldPlate.lo[0]-lid.hi[0])<=.0021&&close(coldPlate.hi[0],-.63)&&coldPlate.lo[1]<CPU_CENTER.y);
  const axis=a.wall==='top'?1:2,wall=a.wall==='top'?4.62:frame.front;
  const radiatorBox=boxes.find(b=>close(b.hi[1]-b.lo[1],.29)&&close(b.hi[2]-b.lo[2],a.length));
  assert.ok(radiatorBox);
  const caseScene=fixture({case:chassis.id,cooler:cooler.id}),rails=boxBounds(caseScene);
  caseScene.makeCase(chassis);
  for(const sign of [-1,1]){
   const x=a.position[0]+sign*.56;
   assert.ok(rails.some(b=>b.lo[0]<x&&b.hi[0]>x&&close(b.lo[axis],wall)),chassis.id+' radiator support');
  }
  const radiatorFace=a.position[axis]+radiatorBox.hi[1];
  assert.ok(close(radiatorFace,wall),chassis.id+'/'+cooler.id);
  for(const fan of scene.fans){
   const frameBox=boxes.find(b=>b.parent===fan.rotor.parent&&close(b.hi[2]-b.lo[2],.23));
   assert.ok(frameBox&&close(fan.rotor.parent.position.toArray()[axis]+frameBox.hi[2],a.position[axis]+radiatorBox.lo[1]));
   const normal=new Vector3(0,0,1).applyQuaternion(fan.rotor.parent.quaternion);
   assert.ok(close(normal.toArray()[axis],a.wall==='top'?-1:1));
  }
 }
});
test('Air coolers seat on the lid and every fan touches the adjacent tower',()=>{
 for(const cooler of catalog.cooler.filter(p=>p.type!=='aio')){
  const scene=fixture({...demoBuild,cooler:cooler.id}),boxes=boxBounds(scene);scene.makeCooler(cooler);
  const base=boxes.find(b=>close(b.hi[1]-b.lo[1],.42)&&close(b.hi[2]-b.lo[2],.45));
  const caps=boxes.filter(b=>close(b.hi[0]-b.lo[0],.035)&&close(b.hi[2]-b.lo[2],.43));
  assert.ok(base&&Math.abs(base.lo[0]-CPU_CENTER.x)<.002,cooler.id);
  for(const {rotor} of scene.fans){
   const frame=rotor.parent,side=boxes.find(b=>b.parent===frame&&close(b.hi[2]-b.lo[2],.23));
   const z=frame.position.z;
   assert.ok(caps.some(b=>close(b.hi[2],z+side.lo[2])||close(b.lo[2],z+side.hi[2])),cooler.id);
   const normal=new Vector3(0,0,1).applyQuaternion(frame.quaternion);
   assert.ok(close(normal.z,1),cooler.id);
  }
 }
});

test('All PSU enclosures touch the floor pads and DIMMs enter actual slot housings',()=>{
 const chassis=fixture(),caseBoxes=boxBounds(chassis);chassis.makeCase(catalog.case[0]);
 const pads=caseBoxes.filter(b=>b.color===0x202628);assert.equal(pads.length,2);
 for(const part of catalog.psu){
  const scene=fixture({...demoBuild,psu:part.id}),boxes=boxBounds(scene);scene.makePSU(part);
  const housing=boxes.find(b=>b.color===0x151c20);
  assert.ok(pads.every(b=>close(b.hi[1],housing.lo[1])&&b.lo[0]>housing.lo[0]&&b.hi[0]<housing.hi[0]&&b.lo[2]>=housing.lo[2]&&b.hi[2]<=housing.hi[2]),part.id);
 }
 const boards=[2,4].map(n=>catalog.motherboard.find(p=>p.slots===n)).filter(Boolean);
 for(const board of boards){
  const scene=fixture({...demoBuild,motherboard:board.id}),boxes=boxBounds(scene);scene.makeMotherboard(board);
  const slots=boxes.filter(b=>b.color===0x0a0d0e);
  for(const part of catalog.ram.filter(p=>p.modules<=board.slots)){
   const ramScene=fixture(),ramBoxes=boxBounds(ramScene);ramScene.makeRAM(part);
   const cards=ramBoxes.filter(b=>[0x1c2323,0x17231c].includes(b.color));
   assert.equal(cards.length,part.modules);
   for(const card of cards)assert.ok(slots.some(b=>card.lo[2]>=b.lo[2]&&card.hi[2]<=b.hi[2]&&card.lo[0]>=b.lo[0]&&card.lo[0]<b.hi[0]),board.id+'/'+part.id);
  }
 }
});
