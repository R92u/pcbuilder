import * as THREE from './vendor/three.module.js';
import topology from './mg8-topology.js';

// The two surfaces are joined along each cut edge, giving the magnesium ribs thickness.
export function mg8Shell(profile, surface) {
 const [samples, triangles, rims] = topology;
 const positions = [], indices = [], unique = new Map();
 const outer = [], inner = [], directed = new Set();
 for (const [u,v] of samples) {
  const key = Math.abs(v) === 1 ? String(v) : [u === 2 ? 0 : u,v].join(',');
  if (!unique.has(key)) {
   const p = surface(profile,v,(u-.5)*Math.PI);
   unique.set(key,positions.length/3);
   positions.push(p.x,p.y,p.z,p.x*.975,profile.h*.34+(p.y-profile.h*.34)*.95,p.z*.985);
  }
  outer.push(unique.get(key)); inner.push(unique.get(key)+1);
 }
 for (const tri of triangles) {
  const [a,b,c] = tri.map(i=>outer[i]);
  if (a===b || a===c || b===c) continue;
  indices.push(a,b,c,c+1,b+1,a+1);
  for (const [x,y] of [[a,b],[b,c],[c,a]]) directed.add(x+','+y);
 }
 for (const rim of rims) for (let i=0;i<rim.length;i++) {
  let a=outer[rim[i]], b=outer[rim[(i+1)%rim.length]];
  if (!directed.has(a+','+b)) [a,b]=[b,a];
  indices.push(b,a,a+1,b,a+1,b+1);
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setIndex(indices);geometry.computeVertexNormals();
 return geometry;
}

export function addMG8Interior(group,f,surface) {
 const material=(color,roughness=.7,metalness=.08)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const board=material('#151515'), packageMat=material('#0c0c0c'), contact=material('#222222',.48,.38);
 function part(name,geometry,mat,x,y,z){
  const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;mesh.position.set(x*f.w,y*f.h,z*f.d);group.add(mesh);return mesh;
 }
 const box=(name,mat,x,y,z,w,h,d)=>part(name,new THREE.BoxGeometry(w*f.w,h*f.h,d*f.d),mat,x,y,z);
 box('mg8-pcb',board,0,.205,0,.61,.034,.63);
 box('sensor-package',packageMat,0,.27,.02,.22,.09,.13);
 for(const side of [-1,1]){
  box('click-switch',packageMat,side*.20,.32,-.22,.12,.18,.12);
  box('switch-plunger',contact,side*.20,.43,-.22,.048,.035,.046);
  for(let i=0;i<5;i++){
   const z=.04+i*.041;
   box('smd-package',packageMat,side*.22,.24,z,.062,.03,.018);
   for(const end of [-1,1])box('solder-pad',contact,side*.22+end*.034,.238,z,.012,.02,.018);
  }
 }
 box('battery-sleeve',material('#101010'),0,.36,.18,.31,.16,.20);
 for (const x of [-.27,.27])for(const z of [-.16,.22]){
  part('screw-boss',new THREE.CylinderGeometry(.020,.023,.06,12),packageMat,x,.30,z);
  part('fastener',new THREE.CylinderGeometry(.011,.011,.006,10),contact,x,.30+.033/f.h,z);
 }
 // Recessed panel splits follow the curved lid and stop at the scroll-wheel opening.
 const seam=material('#090909');
 function line(points){const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,.0015,4,false);part('click-panel-seam',geo,seam,0,0,0);}
 for(const [v0,v1] of [[-.992,-.775],[-.385,-.06]])line(Array.from({length:12},(_,i)=>surface(f,v0+(v1-v0)*i/11,Math.PI/2)));
 line(Array.from({length:25},(_,i)=>surface(f,-.06,Math.PI*(.10+.80*i/24))));
}
