import * as THREE from 'three';
let grain;
export function hardwareFinish(material){
 if(!grain){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
  const c=canvas.getContext('2d'),pixels=c.createImageData(256,256);let seed=7621;
  for(let i=0;i<pixels.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const value=206+(seed%38);pixels.data.set([value,value,value,255],i);}
  c.putImageData(pixels,0,0);grain=new THREE.CanvasTexture(canvas);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(3,3);
 }
 material.roughnessMap=grain;material.bumpMap=grain;material.bumpScale=.002;return material;
}
