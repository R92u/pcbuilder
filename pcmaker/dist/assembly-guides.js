import {createComponentOutline} from './component-outline.js';
import * as THREE from 'three';
import {CPU_CENTER,GPU_TOP,caseLayout} from './layout.js';

const layouts={
 motherboard:[[-.925,2.86,-.62],[.06,2.70,2.42]],
 cpu:[[CPU_CENTER.x,CPU_CENTER.y,CPU_CENTER.z],[.09,.51,.49]],
 ram:[[-.61,3.43,.18],[.38,1.29,.06]],
 gpu:[[-.16,GPU_TOP-.22,-.48],[1.26,.44,2.70]],
 storage:[[-.79,2.62,-.9],[.05,.22,.80]],
 cooler:[[-.14,3.44,-.55],[1.05,.94,.90]],
 psu:[[.1,.72,-1.4],[1.46,.68,1.42]],
 case:[[0,2.38,0],[1,1,1]]
};
export function createAssemblyGuides(root,container){
 const meshes={},point=new THREE.Vector3(),motion=matchMedia('(prefers-reduced-motion: reduce)');
 for(const [key,[position,size]] of Object.entries(layouts)){
  const material=new THREE.LineBasicMaterial({color:0xe2e4e6,transparent:true,depthWrite:false,toneMapped:false});
  const lines=[];
  const box=(dimensions,offset=[0,0,0])=>{
   const geometry=new THREE.BoxGeometry(...dimensions),edges=new THREE.EdgesGeometry(geometry).translate(...offset);
   lines.push(...edges.attributes.position.array);edges.dispose();geometry.dispose();
  };
  box(size);
  if(key==='ram')box(size,[0,0,.30]);
  if(key==='motherboard'){
   box([.08,.94,.21],[.07,.60,-.91]);
   for(const y of [-.50,-.80])box([.07,.055,.99],[.06,y,-.18]);
   for(const z of [-1.05,1.06])for(const y of [-1.17,1.17])box([.035,.06,.06],[.05,y,z]);
  }
  if(key==='cpu')box([.012,.39,.38],[.05,0,0]);
  if(key==='gpu'){
   for(const z of [-.68,.68])for(let i=0;i<24;i++){
    for(const j of [i,i+1]){const a=j*Math.PI/12;lines.push(Math.cos(a)*.42,-size[1]/2,z+Math.sin(a)*.42);}
   }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));
  const mesh=new THREE.LineSegments(geometry,material);mesh.position.set(...position);mesh.userData.ignoreInspect=true;root.add(mesh);meshes[key]=mesh;
 }
 const label=document.createElement('span');label.className='slot-callout';label.hidden=true;container.append(label);
 const always=new Set(['motherboard','cpu','gpu','ram']);
 let selected=null,build={},componentGroups={},outline;
 function updateOutline(){
  const object=componentGroups[selected];
  if(object&&!outline)outline=createComponentOutline();
  outline?.select(object||null);
 }
 return {
  setBuild(value,parts,groups){
   build=value;componentGroups=groups;updateOutline();
   const frame=caseLayout(parts.case,parts.gpu,parts.cooler);
   meshes.case.position.set((frame.side+frame.back)/2,2.38,frame.centerZ);
   meshes.case.scale.set(frame.side-frame.back,4.65,frame.depth);
  },
  select(key,text){selected=key;updateOutline();label.textContent=text||'';label.hidden=!key;},
  frame(time,camera){
   for(const [key,mesh] of Object.entries(meshes)){
    const active=key===selected;mesh.visible=!build[key]&&(active||always.has(key));
    if(mesh.visible){mesh.material.opacity=active?.98:.35+(motion.matches?0:.09*Math.sin(time*.002));mesh.material.depthTest=!active;mesh.renderOrder=active?4:0;}
   }
   if(!selected||!layouts[selected])return;
   point.copy(meshes[selected].position);root.localToWorld(point);point.project(camera);
   const x=(point.x*.5+.5)*container.clientWidth,y=(.5-point.y*.5)*container.clientHeight;
   label.hidden=Math.abs(point.x)>.98||Math.abs(point.y)>.98||Math.abs(point.z)>1;
   label.classList.toggle('flip',x>container.clientWidth*.56);
   label.style.left=x+'px';label.style.top=y+'px';
  },
  drawOutline(renderer,scene,camera){outline?.render(renderer,scene,camera);},
  dispose(){outline?.dispose();for(const m of Object.values(meshes)){m.removeFromParent();m.geometry.dispose();m.material.dispose();}label.remove();}
 };
}
export function contactShadow(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=96;
 const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(48,48,8,48,48,47);
 gradient.addColorStop(0,'rgba(0,6,10,.85)');gradient.addColorStop(.55,'rgba(0,6,10,.57)');gradient.addColorStop(1,'transparent');
 ctx.fillStyle=gradient;ctx.fillRect(0,0,96,96);
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(4.4,6.5),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthWrite:false}));
 mesh.position.y=.045;mesh.rotation.x=-Math.PI/2;mesh.userData.ignoreInspect=true;return mesh;
}
