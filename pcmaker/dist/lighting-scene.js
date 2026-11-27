import * as THREE from './vendor/three.module.js';
import {sanitizeLighting} from './lighting.js';

const white=new THREE.Color(0xffffff);
const bladeTint=new THREE.Color();

function bladeColors(mesh,rainbow,phase){
 if(!rainbow&&!mesh.userData.rainbowBlades&&mesh.instanceColor)return;
 for(let i=0;i<mesh.count;i++){
  const tint=rainbow?bladeTint.setHSL((phase+i/mesh.count)%1,.76,.63,THREE.SRGBColorSpace):white;
  mesh.setColorAt(i,tint);
 }
 mesh.userData.rainbowBlades=rainbow;
 mesh.instanceColor.needsUpdate=true;
}

export const lightingSceneMethods={
 tagLight(mesh,profile,phase=0){
  mesh.material.userData.lighting={...profile,phase};
  if(mesh.material.map){mesh.material.emissiveMap=mesh.material.map;mesh.material.color.set(0xffffff);}
  if(mesh.isInstancedMesh&&profile.factoryRainbow){
   const material=mesh.material;
   material.metalness=0;material.roughness=.42;
   material.transparent=true;material.opacity=.90;
   bladeColors(mesh,false,0);
   mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
   // Three multiplies only the diffuse term by the instance color by default.
   material.onBeforeCompile=shader=>{
    const include='#include <emissivemap_fragment>';
    shader.fragmentShader=shader.fragmentShader.replace(include,include+'\n#ifdef USE_COLOR\ntotalEmissiveRadiance *= vColor.rgb;\n#endif');
   };
  }
  return mesh;
 },
 collectLights(){
  const materials=new Set();this.bladeMeshes=new Map();
  this.root.traverse(o=>{
   if(!o.material?.userData?.lighting)return;
   materials.add(o.material);
   if(o.isInstancedMesh&&o.material.userData.lighting.factoryRainbow)this.bladeMeshes.set(o.material,o);
  });
  this.lightMaterials=[...materials];this.updateLighting(this.last||0);
 },
 setLighting(value){this.caseOnlyRainbow=value?.caseOnly===true;this.lighting=sanitizeLighting(value);this.updateLighting(this.last||0);},
 updateLighting(time){
  const {mode,color}=this.lighting||sanitizeLighting(),tint=new THREE.Color(color);
  for(const material of this.lightMaterials||[]){
   const zone=material.userData.lighting,blades=this.bladeMeshes?.get(material);
   const rainbow=mode==='rainbow'&&zone.type!=='fixed'&&(!this.caseOnlyRainbow||zone.factoryRainbow);
   const phase=(time/9000+zone.phase)%1;
   if(blades)bladeColors(blades,rainbow,phase);
   if(mode==='off'){material.emissiveIntensity=0;material.color.set(material.map?0xaaaaaa:0x697276);continue;}
   if(zone.type==='fixed')tint.set(zone.color);
   else if(rainbow&&blades)tint.copy(white);
   else if(rainbow)tint.setHSL(phase,.85,.58);
   else tint.set(color);
   material.emissive.copy(tint);material.emissiveIntensity=zone.intensity??1.15;
   if(material.map)material.color.set(0x252525);else material.color.copy(tint);
  }
 }
};
