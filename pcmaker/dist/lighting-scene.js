import * as THREE from './vendor/three.module.js';
import {sanitizeLighting} from './lighting.js';

export const lightingSceneMethods={
 tagLight(mesh,profile,phase=0){
  mesh.material.userData.lighting={...profile,phase};
  if(mesh.material.map){mesh.material.emissiveMap=mesh.material.map;mesh.material.color.set(0xffffff);}
  return mesh;
 },
 collectLights(){
  const materials=new Set();this.root.traverse(o=>{if(o.material?.userData?.lighting)materials.add(o.material);});
  this.lightMaterials=[...materials];this.updateLighting(this.last||0);
 },
 setLighting(value){this.lighting=sanitizeLighting(value);this.updateLighting(this.last||0);},
 updateLighting(time){
  const {mode,color}=this.lighting||sanitizeLighting(),tint=new THREE.Color(color);
  for(const material of this.lightMaterials||[]){
   const zone=material.userData.lighting;
   if(mode==='off'){material.emissiveIntensity=0;material.color.set(material.map?0xaaaaaa:0x697276);continue;}
   if(zone.type==='fixed')tint.set(zone.color);
   else if(mode==='rainbow')tint.setHSL((time/9000+zone.phase)%1,.85,.58);
   else tint.set(color);
   material.emissive.copy(tint);material.emissiveIntensity=zone.intensity??1.15;
   if(material.map)material.color.set(0x252525);else material.color.copy(tint);
  }
 }
};
