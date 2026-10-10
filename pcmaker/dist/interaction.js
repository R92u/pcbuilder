import * as THREE from 'three';
import {cablesFor} from './wiring.js';
import {cableCurve} from './cable-geometry.js';
import {caseLayout} from './layout.js';
import {resolve} from './catalog.js';

// Pointer Events work with a mouse, pen or touch. Orbiting is suspended only
// while a plug is held; its free end moves outside the open service side.
export const interactionMethods={
 initInteraction(){
  const canvas=this.renderer.domElement;
  this.raycaster=new THREE.Raycaster();
  canvas.addEventListener('pointerdown',ev=>{this.pickStart=ev.button===2?{x:ev.clientX,y:ev.clientY,id:ev.pointerId}:null;});
  canvas.addEventListener('pointerup',ev=>{
   const start=this.pickStart;this.pickStart=null;if(ev.button!==2)return;
   if(!start||start.id!==ev.pointerId||Math.hypot(start.x-ev.clientX,start.y-ev.clientY)>5||this.dragging)return;
   const rect=canvas.getBoundingClientRect();
   this.raycaster.setFromCamera(new THREE.Vector2((ev.clientX-rect.left)/rect.width*2-1,-(ev.clientY-rect.top)/rect.height*2+1),this.camera);
   for(const hit of this.raycaster.intersectObject(this.root,true)){
    let node=hit.object,key=null,visible=true;
    while(node){if(!node.visible||node.userData.ignoreInspect)visible=false;if(node.userData.componentKey)key=node.userData.componentKey;node=node.parent;}
    if(visible&&key){this.onInspect?.(key);break;}
   }
  });
  canvas.addEventListener('contextmenu',ev=>ev.preventDefault());
  canvas.addEventListener('pointercancel',()=>{this.pickStart=null;});
  this.cancelHeldPlug=()=>this.endCableDrag(null,true);
  window.addEventListener('blur',this.cancelHeldPlug);
 },
 clearLooseCable(){
  this.endCableDrag(null,true);
  if(this.looseCable){this.looseCable.removeFromParent();this.looseCable.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});this.looseCable=null;}
  this.plugHandle?.remove();this.plugHandle=null;this.sourceMarker?.remove();this.sourceMarker=null;this.looseSpec=null;
 },
 prepareLooseCable(mode,active){
  this.clearLooseCable();
  if(!this.showPorts||!this.selectedCable)return;
  const cable=cablesFor(this.currentBuild).find(c=>c.id===this.selectedCable);if(!cable)return;
  const source=document.createElement('div');source.className='cable-source';source.textContent='Источник · '+cable.from;source.setAttribute('aria-label','Источник кабеля: '+cable.from);this.markerLayer.append(source);this.sourceMarker=source;this.sourcePosition=new THREE.Vector3(...cable.points[0]);
  if(mode!=='manual'||active.includes(this.selectedCable))return;
  this.looseSpec=cable;this.looseEnd=new THREE.Vector3(...cable.looseRest);
  this.looseCable=new THREE.Group();this.root.add(this.looseCable);
  this.plug=this.box(this.looseCable,.24,.16,.21,0,0,0,0x242a2c);
  this.plug.userData.ignoreInspect=true;
  this.looseTube=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshStandardMaterial({color:0x1a2226,roughness:.72,metalness:.1}));this.looseCable.add(this.looseTube);
  const handle=document.createElement('button');handle.type='button';handle.className='plug-handle';handle.dataset.plug=cable.id;
  handle.innerHTML='<span>▥</span><small>Тяни штекер</small>';handle.setAttribute('aria-label','Перетащить штекер: '+cable.name);handle.title='Перетащи к сиреневому разъёму';
  this.markerLayer.append(handle);this.plugHandle=handle;
  handle.addEventListener('pointerdown',ev=>{
   if(ev.button!==0)return;ev.preventDefault();ev.stopPropagation();
   const p=resolve(this.currentBuild),frame=caseLayout(p.case,p.gpu);
   this.dragging={id:ev.pointerId,cableId:cable.id,exteriorX:frame.side+.16,plane:new THREE.Plane(new THREE.Vector3(1,0,0),-frame.side-.16)};
   handle.setPointerCapture(ev.pointerId);this.controls.enabled=false;handle.classList.add('held');
  });
  handle.addEventListener('pointermove',ev=>{
   if(!this.dragging||this.dragging.id!==ev.pointerId)return;ev.preventDefault();
   const rect=this.container.getBoundingClientRect();
   this.raycaster.setFromCamera(new THREE.Vector2((ev.clientX-rect.left)/rect.width*2-1,-(ev.clientY-rect.top)/rect.height*2+1),this.camera);
   const next=this.raycaster.ray.intersectPlane(this.dragging.plane,new THREE.Vector3());if(next){this.looseEnd.copy(next);this.drawLooseCable();}
   const target=this.dropPortAt(ev.clientX,ev.clientY);
   for(const marker of this.markers)marker.button.classList.toggle('drop-ready',marker.button.dataset.port===target&&target===cable.id);
  });
  handle.addEventListener('pointerup',ev=>this.endCableDrag(ev,false));
  handle.addEventListener('pointercancel',ev=>this.endCableDrag(ev,true));
  handle.addEventListener('lostpointercapture',()=>{if(this.dragging)this.endCableDrag(null,true);});
  this.drawLooseCable();
 },
 drawLooseCable(){
  if(!this.looseSpec||!this.looseCable)return;
  const prefix=this.looseSpec.loosePrefix.map(p=>new THREE.Vector3(...p));
  const end=this.looseEnd.clone(),last=prefix.at(-1);
  if(this.dragging)prefix.push(new THREE.Vector3(this.dragging.exteriorX,last.y,last.z),new THREE.Vector3(this.dragging.exteriorX,end.y,end.z));
  else prefix.push(last.clone().lerp(end,.5).add(new THREE.Vector3(0,-.04,0)));
  prefix.push(end);
  const curve=cableCurve(prefix,.09);
  this.looseTube.geometry.dispose();this.looseTube.geometry=new THREE.TubeGeometry(curve,96,Math.max(.018,this.looseSpec.radius*Math.sqrt(this.looseSpec.strands)),6,false);
  this.plug.position.copy(this.looseEnd);this.plug.lookAt(curve.getPoint(.94));this.updatePlugHandle();
 },
 updatePlugHandle(){
  if(this.sourceMarker){const source=this.sourcePosition.clone().project(this.camera);this.sourceMarker.style.left=(source.x*.5+.5)*this.container.clientWidth+'px';this.sourceMarker.style.top=(-source.y*.5+.5)*this.container.clientHeight+'px';this.sourceMarker.hidden=source.z>1||Math.abs(source.x)>1||Math.abs(source.y)>1;}
  if(!this.plugHandle||!this.looseEnd)return;
  const p=this.looseEnd.clone().project(this.camera);
  this.plugHandle.style.left=(p.x*.5+.5)*this.container.clientWidth+'px';this.plugHandle.style.top=(-p.y*.5+.5)*this.container.clientHeight+'px';
  this.plugHandle.hidden=p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1;
 },
 dropPortAt(x,y){
  let nearest=null,distance=34;
  for(const {button} of this.markers||[]){if(button.hidden)continue;const r=button.getBoundingClientRect(),d=Math.hypot(x-r.left-r.width/2,y-r.top-r.height/2);if(d<distance){distance=d;nearest=button.dataset.port;}}
  return nearest;
 },
 endCableDrag(ev,cancelled){
  if(!this.dragging||(ev&&ev.pointerId!==this.dragging.id))return;
  const {id,cableId}=this.dragging;this.dragging=null;this.controls.enabled=true;
  if(this.plugHandle?.hasPointerCapture(id))this.plugHandle.releasePointerCapture(id);
  this.plugHandle?.classList.remove('held');for(const m of this.markers||[])m.button.classList.remove('drop-ready');
  const target=ev&&!cancelled?this.dropPortAt(ev.clientX,ev.clientY):null;
  if(this.looseSpec)this.looseEnd?.set(...this.looseSpec.looseRest);this.drawLooseCable();
  if(!cancelled)this.onCableDrop?.(cableId,target);
 }
};
