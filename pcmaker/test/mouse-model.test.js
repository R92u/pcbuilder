import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3,Box3} from '../dist/vendor/three.module.js';
import {peripherals} from '../dist/peripherals.js';
import {createMouseModel,mouseProfile} from '../dist/mouse-model.js';

test('Every mouse has a closed, outward-facing shell without degenerate triangles',()=>{
 for(const p of peripherals.filter(p=>p.category==='mouse')){
  const model=createMouseModel(p,{withTexture:false}),shell=model.getObjectByName('continuous-shell'),g=shell.geometry,vertices=g.attributes.position,indices=g.index.array,edges=new Map();
  assert.ok([...vertices.array,...g.attributes.normal.array].every(Number.isFinite),p.id);
  let volume=0;
  for(let i=0;i<indices.length;i+=3){
   const tri=[...indices.slice(i,i+3)],a=new Vector3().fromBufferAttribute(vertices,tri[0]),b=new Vector3().fromBufferAttribute(vertices,tri[1]),c=new Vector3().fromBufferAttribute(vertices,tri[2]);
   assert.ok(b.clone().sub(a).cross(c.clone().sub(a)).length()>1e-10,p.id+' nonzero triangle area');
   volume+=a.dot(b.clone().cross(c))/6;
   for(let j=0;j<3;j++){const edge=[tri[j],tri[(j+1)%3]].sort((x,y)=>x-y).join(':');edges.set(edge,(edges.get(edge)||0)+1);}
  }
  assert.ok(volume>0,p.id+' normals point outward');
  assert.ok([...edges.values()].every(n=>n===2),p.id+' no holes or duplicated internal faces');
  const bounds=new Box3().setFromObject(shell),size=bounds.getSize(new Vector3());
  assert.ok(size.x<=p.dimensions[0]/100&&size.x>p.dimensions[0]/140,p.id+' width');
  assert.ok(Math.abs(size.z-p.dimensions[1]/100)<1e-6,p.id+' length');
  assert.ok(bounds.min.y>=0&&bounds.max.y<=p.dimensions[2]/100*1.03,p.id+' height');
  const buttons=model.children.filter(o=>o.name==='side-button');assert.equal(buttons.length,p.sideButtons||(p.id==='g502'?3:2));
  let triangles=0;model.traverse(o=>{if(o.geometry)triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);});
  assert.ok(triangles<12000,p.id+' stays within the mesh budget');
  assert.equal(!!model.userData.cableStart,!!p.wired,p.id+' cable attachment');
 }
});

test('Perforation and ergonomic outlines remain specific to their models',()=>{
 const profiles=Object.fromEntries(peripherals.filter(p=>p.category==='mouse').map(p=>[p.id,mouseProfile(p)]));
 assert.equal(profiles['storm-pro'].perforated,true);assert.equal(profiles.mg8.perforated,true);
 assert.equal(profiles['k1ng-4k-pro-white'].perforated,false);
 assert.equal(profiles.g502.ergonomic,true);assert.equal(profiles.aatrox.ergonomic,true);
 assert.equal(profiles.king.ergonomic,false);assert.equal(profiles['k1ng-4k-pro-white'].light,true);
});
