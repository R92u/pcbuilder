import * as THREE from 'three';
import {cableSources} from './wiring.js';
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
 createCableSources(available,active){
  this.sourceMarkers=[];this.hoverCableIds=[];
  for(const source of cableSources(available)){
   const button=document.createElement('button');button.type='button';button.className='socket-source';
   const ids=source.cables.map(c=>c.id);button.dataset.source=ids.join(',');
   const name=source.from+' · '+source.cables.map(c=>c.name).join(' / ');
   button.setAttribute('aria-label','Тянуть кабель: '+name);button.title=name;
   const label=document.createElement('span');label.textContent=name+' — потяни к подсвеченному гнезду';button.append(label);
   button.classList.toggle('connected',ids.every(id=>active.includes(id)));
   const marker={...source,ids,button,position:new THREE.Vector3(...source.position)};this.sourceMarkers.push(marker);this.markerLayer.append(button);
   const hover=()=>{if(!this.dragging){this.hoverCableIds=ids;this.updateMarkers();}};
   const leave=()=>{if(!this.dragging){this.hoverCableIds=[];this.updateMarkers();}};
   button.addEventListener('pointerenter',hover);button.addEventListener('focus',hover);
   button.addEventListener('pointerleave',leave);button.addEventListener('blur',leave);
   button.addEventListener('click',ev=>{if(ev.detail===0)this.onCablePick?.(ids[0]);});
   button.addEventListener('pointerdown',ev=>{
    if(ev.button!==0||this.dragging||this.fanEditing)return;
    // Pick the nearest actual socket when two small source hit areas overlap.
    let nearest=marker,distance=Infinity;
    for(const item of this.sourceMarkers){if(item.button.hidden)continue;const r=item.button.getBoundingClientRect(),d=Math.hypot(ev.clientX-r.left-r.width/2,ev.clientY-r.top-r.height/2);if(d<distance){nearest=item;distance=d;}}
    this.startCableDrag(ev,nearest,button);
   });
   button.addEventListener('pointermove',ev=>this.moveCableDrag(ev));
   button.addEventListener('pointerup',ev=>this.endCableDrag(ev,false));
   button.addEventListener('pointercancel',ev=>this.endCableDrag(ev,true));
   button.addEventListener('lostpointercapture',()=>{if(this.dragging)this.endCableDrag(null,true);});
  }
 },
 startCableDrag(ev,source,handle){
  ev.preventDefault();ev.stopPropagation();this.clearLooseCable();
  const cable=source.cables.find(c=>c.id===this.selectedCable)||source.cables[0];
  this.sourcePosition=source.position.clone();this.looseSpec=cable;this.looseEnd=this.sourcePosition.clone();
  this.looseCable=new THREE.Group();this.root.add(this.looseCable);
  this.plug=this.box(this.looseCable,.24,.16,.21,0,0,0,0x242a2c);this.plug.userData.ignoreInspect=true;
  this.looseTube=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshStandardMaterial({color:0x1a2226,roughness:.72,metalness:.1}));this.looseCable.add(this.looseTube);
  this.plugHandle=document.createElement('div');this.plugHandle.className='plug-handle held drag-preview';this.plugHandle.textContent='▥';this.plugHandle.setAttribute('aria-hidden','true');this.markerLayer.append(this.plugHandle);
  this.sourceMarker=document.createElement('div');this.sourceMarker.className='cable-source';this.sourceMarker.textContent='Источник · '+source.from;this.markerLayer.append(this.sourceMarker);
  const rect=this.container.getBoundingClientRect(),pointer=new THREE.Vector2((ev.clientX-rect.left)/rect.width*2-1,-(ev.clientY-rect.top)/rect.height*2+1);
  const origin=this.root.localToWorld(this.sourcePosition.clone());
  this.dragging={id:ev.pointerId,cableId:cable.id,source,handle,start:[ev.clientX,ev.clientY],moved:false,...beginCableDrag(this.camera,origin,pointer)};
  handle.setPointerCapture(ev.pointerId);handle.classList.add('held');this.controls.enabled=false;
  this.syncDraggedWires();this.drawLooseCable();this.updateMarkers();
 },
 syncDraggedWires(){
  for(const group of this.wires?.children||[])if(group.userData.cableId)group.visible=group.userData.cableId!==this.dragging?.cableId;
 },
 moveCableDrag(ev){
  const drag=this.dragging;if(!drag||drag.id!==ev.pointerId)return;ev.preventDefault();
  if(Math.hypot(ev.clientX-drag.start[0],ev.clientY-drag.start[1])>4)drag.moved=true;
  const rect=this.container.getBoundingClientRect(),target=this.dropPortAt(ev.clientX,ev.clientY);
  drag.snapped=drag.source.ids.includes(target);
  if(drag.snapped){this.looseSpec=drag.source.cables.find(c=>c.id===target);drag.cableId=target;this.looseEnd.set(...this.looseSpec.points.at(-1));}
  else{const pointer=new THREE.Vector2((ev.clientX-rect.left)/rect.width*2-1,-(ev.clientY-rect.top)/rect.height*2+1),next=cableDragPoint(this.camera,pointer,drag);if(next)this.looseEnd.copy(this.root.worldToLocal(next));}
  this.syncDraggedWires();this.drawLooseCable();
  for(const marker of this.markers)marker.button.classList.toggle('drop-ready',marker.button.dataset.port===target&&drag.snapped);
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
  const drag=this.dragging;if(!drag||(ev&&ev.pointerId!==drag.id))return;
  const target=ev&&!cancelled?this.dropPortAt(ev.clientX,ev.clientY):null;
  const cableId=drag.source.ids.includes(target)?target:drag.cableId;
  this.dragging=null;this.hoverCableIds=[];this.controls.enabled=true;
  if(drag.handle.hasPointerCapture(drag.id))drag.handle.releasePointerCapture(drag.id);
  drag.handle.classList.remove('held');for(const m of this.markers||[])m.button.classList.remove('drop-ready');
  this.syncDraggedWires();this.clearLooseCable();this.updateMarkers();
  if(!cancelled&&drag.moved)this.onCableDrop?.(cableId,target);
 }
};
