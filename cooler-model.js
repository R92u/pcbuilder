import * as THREE from 'three';
import {CPU_CENTER,coolerLayout} from './layout.js';
import {resolve} from './catalog.js';

export function makeTowerCooler(p){
 const g=new THREE.Group(),layout=coolerLayout(p,resolve(this.currentBuild||{}).ram,resolve(this.currentBuild||{}).cpu?.socket),{finStart,finEnd,towers,fanZ,size,fanX}=layout;
 const black=/black|dark|digital|chromax|zero/i.test(p.name),metal=black?0x353b3d:0x929b9f;
 this.box(g,.13,.42,.45,-.63,CPU_CENTER.y,CPU_CENTER.z,0xa7b0af,.26);
 // Fins are perpendicular to the heatpipes, along the CPU-to-glass axis X.
 for(const z of towers){
  for(let i=0;i<39;i++)this.box(g,.010,Math.min(1.35,size*.94),layout.finDepth,finStart+i*(finEnd-finStart)/38,CPU_CENTER.y,z,metal,.36);
  this.box(g,.035,Math.min(1.38,size),.43,layout.top-.023,CPU_CENTER.y,z,black?0x20272c:0x697579);
  for(let i=0;i<(p.heatpipes||4);i++){
   const y=CPU_CENTER.y+(i-(p.heatpipes||4)/2+.5)*.14;
   const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.59,CPU_CENTER.y,CPU_CENTER.z),new THREE.Vector3(-.43,y,z),new THREE.Vector3(finStart,y,z),new THREE.Vector3(layout.top+.007,y,z)]);
   const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,18,.020,8,false),new THREE.MeshStandardMaterial({color:black?0x51595a:0xa6a79e,metalness:.8,roughness:.3}));g.add(tube);
  }
  this.text(g,p.short,.35,.075,layout.top+.003,CPU_CENTER.y,z,[0,Math.PI/2,Math.PI/2],'#989f9e');
  for(const y of [CPU_CENTER.y-size*.40,CPU_CENTER.y+size*.40])this.screw(g,layout.top,y,z,'x',.022);
 }
 const count=Math.min(p.fans||p.towers||1,2);
 for(let i=0;i<count;i++){
  const fanSize=layout.sizes[i]||size,front=count===1||i===count-1,xx=layout.top-fanSize/2-.01+(front?layout.lift:0),zz=fanZ[Math.min(i,fanZ.length-1)];
  const fan=this.fan(g,fanSize,xx,CPU_CENTER.y,zz,[0,0,0],'cpu',false);
  for(const y of [CPU_CENTER.y-size*.40,CPU_CENTER.y+size*.40]){
   this.rod(g,[xx-size*.43,y,zz-.10],[xx+size*.43,y,zz-.10],.009,0x8d999c);
  }
  if(p.brand==='Noctua'&&!/redux|chromax/i.test(p.name))fan.traverse(o=>{if(o.material&&!o.material.map)o.material.color.set(o.userData.animated?0x6e4533:0x85705b);});
 }
 return g;
}
