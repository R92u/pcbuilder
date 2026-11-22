import * as THREE from 'three';
import {resolve} from './catalog.js';
import {CPU_CENTER,caseLayout} from './layout.js';
import {aioPlacement,coolantHoses,radiatorFanBranches} from './aio.js';
import {cableCurve} from './cable-geometry.js';
export function makeAIO(p){
 const g=new THREE.Group(),parts=resolve(this.currentBuild),frame=caseLayout(parts.case,parts.gpu,p),a=aioPlacement(parts,frame),white=p.color==='white',paint=white?0xc4cacc:0x252e33;
 // Pump block is anchored to the CPU heatspreader; only the label is a texture.
 this.box(g,-.63-CPU_CENTER.x,.43,.45,(-.63+CPU_CENTER.x)/2,CPU_CENTER.y,CPU_CENTER.z,0xaa8261,.3);
 this.box(g,.52,.72,.77,-.37,CPU_CENTER.y,CPU_CENTER.z,paint,.3);
 this.box(g,.06,.59,.64,-.08,CPU_CENTER.y,CPU_CENTER.z,0x11191f,.15);
 for(const y of [-.26,.26])for(const z of [-.30,.30])this.screw(g,-.06,CPU_CENTER.y+y,CPU_CENTER.z+z,'x',.023);
 this.text(g,p.short,.46,.075,-.044,CPU_CENTER.y,CPU_CENTER.z,[0,Math.PI/2,0],'#7d9d98');
 if(p.pumpRGB)for(const y of [-.30,.30])this.lightStrip(g,.015,.018,.58,-.039,CPU_CENTER.y+y,CPU_CENTER.z);
 if(a)this.box(g,.065,.065,.07,...a.pumpSource,0x171c20);
 if(!a)return g;
 const rad=new THREE.Group();rad.position.set(...a.position);g.add(rad);
 if(a.wall==='front')rad.rotation.x=Math.PI/2;
 this.box(rad,1.2,.27,a.length,0,0,0,paint);
 this.box(rad,1.04,.275,a.length-.36,0,0,0,0x242b30);
 for(let i=0;i<65;i++)this.box(rad,1.025,.284,.010,0,0,-(a.length-.38)/2+i*(a.length-.38)/64,white?0x8b969b:0x465259);
 for(const x of [-.56,.56])this.box(rad,.055,.29,a.length,x,0,0,paint);
 for(const z of [-a.length/2+.09,a.length/2-.09])this.box(rad,1.15,.29,.17,0,0,z,paint);
 for(const pos of a.fans){
  const fan=this.fan(g,1.2,...pos,a.wall==='top'?[Math.PI/2,0,0]:[0,0,0],'cpu',p.fanRGB?{type:'rgb',zones:'blades'}:false);
  if(white)fan.traverse(mesh=>{if(mesh.material?.color?.getHex()===0x101618)mesh.material.color.set(paint);});
  for(const x of [-.54,.54])for(const z of [-.54,.54])if(a.wall==='top')this.screw(g,pos[0]+x,4.585,pos[2]+z,'y',.020);
 }
 for(const points of coolantHoses(a,frame)){
  g.add(new THREE.Mesh(new THREE.TubeGeometry(cableCurve(points,.22),64,.044,8,false),new THREE.MeshStandardMaterial({color:white?0xbac4c9:0x171d22,roughness:.86})));
  for(const pt of [points[0],points.at(-1)])this.box(g,.11,.13,.11,...pt,paint);
 }
 // Permanent radiator fan splitter: each fan has a visible lead to its hub.
 for(const points of radiatorFanBranches(a))g.add(new THREE.Mesh(new THREE.TubeGeometry(cableCurve(points,.045),40,.012,5,false),new THREE.MeshStandardMaterial({color:0x1e2429})));
 this.box(g,.10,.10,.12,...a.fanSource,0x1b2227);
 return g;
}
