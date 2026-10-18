import * as THREE from 'three';
import {cablesFor} from './wiring.js';
import {cableCurve,beginCableDrag,cableDragPoint,cablePreviewPoints} from './cable-geometry.js';

// Pointer Events work with a mouse, pen or touch. Orbiting is suspended only
// while a plug is held. A drag starts at the cable's physical source socket.
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
  canvas.addEventListener('pointerdown',ev=>{
   if(!this.fanEditing||ev.button!==0||!this.caseFans)return;
   const r=canvas.getBoundingClientRect();this.raycaster.setFromCamera(new THREE.Vector2((ev.clientX-r.left)/r.width*2-1,-(ev.clientY-r.top)/r.height*2+1),this.camera);
   for(const hit of this.raycaster.intersectObject(this.caseFans,true)){
    let node=hit.object;while(node&&!node.userData.fanId)node=node.parent;
    if(node){const marker=this.fanMarkers.find(m=>m.spec?.id===node.userData.fanId);if(marker){marker.button.onpointerdown(ev);ev.stopImmediatePropagation();}break;}
   }
  },true);
  canvas.addEventListener('contextmenu' ,ev=>ev.preventDefault());
  canvas.addEventListener('pointercancel',()=>{this.pickStart=null;});
  this.cancelHeldPlug=()=>{this.endCableDrag(null,true);this.endFanDrag(null,true);};
  window.addEventListener('blur',this.cancelHeldPlug);
  this.cancelOnEscape=ev=>{if(ev.key==='Escape')this.cancelHeldPlug();};
  window.addEventListener('keydown',this.cancelOnEscape);
 },
 clearLooseCable(){
  this.endCableDrag(null,true);
  if(this.looseCable){this.looseCable.removeFromParent();this.looseCable.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});this.looseCable=null;}
  this.plugHandle?.remove();this.plugHandle=null;this.sourceMarker?.remove();this.sourceMarker=null;this.looseSpec=null;
 },
 prepareLooseCable(mode,active){
  this.clearLooseCable();
  if(!this.showPorts||!this.selectedCable)return;
  const cable=cablesFor(this.currentBuild,this.fanLayout).find(c=>c.id===this.selectedCable);if(!cable)return;
  const source=document.createElement('div');source.className='cable-source';source.textContent='Источник · '+cable.from;source.setAttribute('aria-label','Источник кабеля: '+cable.from);this.markerLayer.append(source);this.sourceMarker=source;this.sourcePosition=new THREE.Vector3(...cable.points[0]);
  if(mode!=='manual'||active.includes(this.selectedCable))return;
  this.looseSpec=cable;this.looseEnd=this.sourcePosition.clone();
  this.looseCable=new THREE.Group();this.root.add(this.looseCable);
  this.plug=this.box(this.looseCable,.24,.16,.21,0,0,0,0x242a2c);
  this.plug.userData.ignoreInspect=true;
  this.looseTube=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshStandardMaterial({color:0x1a2226,roughness:.72,metalness:.1}));this.looseCable.add(this.looseTube);
  const handle=document.createElement('button');handle.type='button';handle.className='plug-handle';handle.dataset.plug=cable.id;
  handle.innerHTML='<span>▥</span><small></small>';handle.querySelector('small').textContent=cable.from+' · тяни от разъёма';handle.setAttribute('aria-label','Тянуть от разъёма: '+cable.from+' — '+cable.name);handle.title='Зажми здесь и тяни к подсвеченному разъёму '+cable.to;
  this.markerLayer.append(handle);this.plugHandle=handle;
  handle.addEventListener('pointerdown',ev=>{
   if(ev.button!==0)return;ev.preventDefault();ev.stopPropagation();
   const rect=this.container.getBoundingClientRect(),pointer=new THREE.Vector2((ev.clientX-rect.left)/rect.width*2-1,-(ev.clientY-rect.top)/rect.height*2+1);
   const origin=this.root.localToWorld(this.sourcePosition.clone());
   this.dragging={id:ev.pointerId,cableId:cable.id,...beginCableDrag(this.camera,origin,pointer)};
   handle.setPointerCapture(ev.pointerId);this.controls.enabled=false;handle.classList.add('held');
   this.drawLooseCable();
  });
  handle.addEventListener('pointermove',ev=>{
   if(!this.dragging||this.dragging.id!==ev.pointerId)return;ev.preventDefault();
   const rect=this.container.getBoundingClientRect();
   const target=this.dropPortAt(ev.clientX,ev.clientY);
   this.dragging.snapped=target===cable.id;
   const pointer=new THREE.Vector2((ev.clientX-rect.left)/rect.width*2-1,-(ev.clientY-rect.top)/rect.height*2+1),next=cableDragPoint(this.camera,pointer,this.dragging);
   if(this.dragging.snapped)this.looseEnd.set(...cable.points.at(-1));
   else if(next)this.looseEnd.copy(this.root.worldToLocal(next));
   this.drawLooseCable();
   for(const marker of this.markers)marker.button.classList.toggle('drop-ready',marker.button.dataset.port===target&&target===cable.id);
  });
  handle.addEventListener('pointerup',ev=>this.endCableDrag(ev,false));
  handle.addEventListener('pointercancel',ev=>this.endCableDrag(ev,true));
  handle.addEventListener('lostpointercapture',()=>{if(this.dragging)this.endCableDrag(null,true);});
  this.drawLooseCable();
 },
 drawLooseCable(){
  if(!this.looseSpec||!this.looseCable)return;
  const visible=!!this.dragging&&this.looseEnd.distanceTo(this.sourcePosition)>.015;
  this.looseCable.visible=visible;
  if(!visible){this.updatePlugHandle();return;}
  const curve=cableCurve(cablePreviewPoints(this.looseSpec,this.looseEnd,this.dragging.snapped),.09);
  this.looseTube.geometry.dispose();this.looseTube.geometry=new THREE.TubeGeometry(curve,96,Math.max(.018,this.looseSpec.radius*Math.sqrt(this.looseSpec.strands)),6,false);
  this.plug.position.copy(this.looseEnd);this.plug.lookAt(curve.getPoint(.94));this.updatePlugHandle();
 },
 updatePlugHandle(){
  if(this.sourceMarker){const source=this.root.localToWorld(this.sourcePosition.clone()).project(this.camera);this.sourceMarker.style.left=(source.x*.5+.5)*this.container.clientWidth+'px';this.sourceMarker.style.top=(-source.y*.5+.5)*this.container.clientHeight+'px';this.sourceMarker.hidden=!!this.plugHandle&&!this.dragging||source.z>1||source.z< -1||Math.abs(source.x)>1||Math.abs(source.y)>1;}
  if(!this.plugHandle||!this.looseEnd)return;
  const p=this.root.localToWorld(this.looseEnd.clone()).project(this.camera);
  this.plugHandle.style.left=(p.x*.5+.5)*this.container.clientWidth+'px';this.plugHandle.style.top=(-p.y*.5+.5)*this.container.clientHeight+'px';
  this.plugHandle.hidden=p.z>1||p.z< -1||Math.abs(p.x)>1||Math.abs(p.y)>1;
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
  if(this.looseSpec)this.looseEnd?.copy(this.sourcePosition);this.drawLooseCable();
  if(!cancelled)this.onCableDrop?.(cableId,target);
 }
};
