import * as THREE from 'three';
import {resolve} from './catalog.js';
import {caseLayout} from './layout.js';
import {fanMounts,sanitizeFanLayout,fanBasis,fanHub,placementError,fanBranchRoute} from './fan-layout.js';
import {cableCurve} from './cable-geometry.js';
import {batchSolids} from './model.js';

function dispose(group){group?.removeFromParent();group?.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
export const fanSceneMethods={
 setFanLayout(layout){
  this.endFanDrag(null,true);
  this.fanLayout=sanitizeFanLayout(this.currentBuild||{},layout);
  const key=JSON.stringify([this.currentBuild?.case,this.currentBuild?.gpu,this.fanLayout]);
  if(key!==this.caseFanKey){
   this.caseFanKey=key;dispose(this.caseFans);this.fans=this.fans.filter(f=>!f.mountId);
   this.caseFans=new THREE.Group();this.root.add(this.caseFans);this.caseFanMeshes=new Map();
   const mounts=fanMounts(this.currentBuild||{}),p=resolve(this.currentBuild||{});
   for(const spec of this.fanLayout){
    const slot=mounts.find(s=>s.id===spec.slot),{u,v,n}=fanBasis(slot,spec.direction);
    const group=this.fan(this.caseFans,slot.size,...slot.position,[0,0,0],'case',p.case?.frontRGB??true);
    group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...u),new THREE.Vector3(...v),new THREE.Vector3(...n)));
    batchSolids(group);group.userData.fanId=spec.id;group.userData.componentKey='case';group.userData.animated=true;
    Object.assign(this.fans.at(-1),{mountId:slot.id,direction:spec.direction});this.caseFanMeshes.set(spec.id,group);
   }
   for(const direction of ['in','out'])if(this.fanLayout.some(f=>f.direction===direction)){
    const hub=fanHub(this.currentBuild,direction);this.box(this.caseFans,.105,.19,.065,...hub,0x161e21);
   }
   if(p.case?.concept&&this.fanLayout.some(f=>f.slot.startsWith('right-'))){
    const frame=caseLayout(p.case,p.gpu);for(const y of [2.65-frame.fanSize*.48,2.65+frame.fanSize*.48])this.box(this.caseFans,.05,.035,frame.depth-.08,frame.side-.015,y,frame.centerZ,p.case.color==='white'?0xb4bdc4:0x424953);
   }
   this.makeCaseFlows(p.case||{});this.wireKey=null;
  }
  this.updateSideGuards();this.renderFanMarkers();
 },
 updateSideGuards(){for(const guard of this.sideFanGuards||[])guard.visible=!this.hideGlass||this.fanLayout?.some(f=>f.slot.startsWith('right-'));},
 setFanEditor(enabled,wall='front',selected=null){
  this.endFanDrag(null,true);this.fanEditing=enabled;this.fanWall=wall;this.selectedFan=selected;
  this.controls.maxPolarAngle=enabled?Math.PI-.22:Math.PI*.61;
  if(enabled){this.controls.autoRotate=false;this.endCableDrag(null,true);}
  this.renderFanMarkers();
 },
 viewFanWall(wall){
  const f=caseLayout(resolve(this.currentBuild).case,resolve(this.currentBuild).gpu),views={front:[4.5,4.4,11.7],rear:[5,4.5,-11],top:[4.5,12,3],bottom:[5,-5,4],left:[-11,4.8,5],right:[12,4.8,1]};
  this.camera.position.set(...views[wall]);this.controls.target.set((f.side+f.back)/2,2.35,f.centerZ);this.controls.update();this.rearPanel.visible=true;
 },
 renderFanMarkers(){
  if(!this.fanMarkerLayer){this.fanMarkerLayer=document.createElement('div');this.fanMarkerLayer.className='fan-markers';this.container.append(this.fanMarkerLayer);}
  this.fanMarkerLayer.hidden=!this.fanEditing;this.fanMarkerLayer.replaceChildren();this.fanMarkers=[];
  if(!this.fanEditing)return;
  const mounts=fanMounts(this.currentBuild);
  for(const slot of mounts){
   const spec=this.fanLayout.find(f=>f.slot===slot.id);
   if(!spec&&slot.wall!==this.fanWall)continue;
   const button=document.createElement('button');button.type='button';button.dataset.fanMount=slot.id;
   if(spec)button.dataset.fanHandle=spec.id;
   const blocked=placementError(this.currentBuild,this.fanLayout,this.selectedFan,slot.id);
   button.className='fan-marker'+(spec?' installed':' empty')+(spec?.id===this.selectedFan?' selected':'')+(!spec&&blocked?' blocked':'');
   button.textContent=spec?spec.id.replace('fan',''):'+';button.title=slot.label+(spec?' · '+(spec.direction==='in'?'вдув':'выдув'):blocked?' · '+blocked:' · свободно');
   button.setAttribute('aria-label',spec?'Перетащить вентилятор '+spec.id.replace('fan','')+' · '+slot.label:'Крепление '+slot.label);
   button.onclick=()=>{if(this.fanDragClickSuppressed)return;if(spec)this.onFanSelect?.(spec.id);else this.onFanDrop?.(this.selectedFan,slot.id);};
   if(spec)this.bindFanDrag(button,spec);
   this.fanMarkerLayer.append(button);this.fanMarkers.push({button,slot,spec});
  }
  this.updateFanMarkers();
 },
 updateFanMarkers(){
  if(!this.fanEditing)return;
  const w=this.container.clientWidth,h=this.container.clientHeight;
  for(const {button,slot} of this.fanMarkers||[]){const p=new THREE.Vector3(...slot.position).project(this.camera);button.style.left=(p.x*.5+.5)*w+'px';button.style.top=(-p.y*.5+.5)*h+'px';button.hidden=p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1;}
 },
 bindFanDrag(button,spec){
  button.onpointerdown=ev=>{
   if(ev.button!==0)return;ev.preventDefault();ev.stopPropagation();
   const group=this.caseFanMeshes.get(spec.id),normal=this.camera.getWorldDirection(new THREE.Vector3());
   this.fanDrag={id:ev.pointerId,fanId:spec.id,button,group,origin:group.position.clone(),plane:new THREE.Plane().setFromNormalAndCoplanarPoint(normal,group.position),start:[ev.clientX,ev.clientY],moved:false};
   button.setPointerCapture(ev.pointerId);this.controls.enabled=false;
   button.classList.add('held');
   for(const marker of this.fanMarkers){const error=placementError(this.currentBuild,this.fanLayout,spec.id,marker.slot.id);marker.button.classList.toggle('eligible',!error);marker.button.classList.toggle('blocked',!!error);}
  };
  button.onpointermove=ev=>{
   const d=this.fanDrag;if(!d||d.id!==ev.pointerId)return;
   if(Math.hypot(ev.clientX-d.start[0],ev.clientY-d.start[1])>4)d.moved=true;
   const r=this.container.getBoundingClientRect();this.raycaster.setFromCamera(new THREE.Vector2((ev.clientX-r.left)/r.width*2-1,-(ev.clientY-r.top)/r.height*2+1),this.camera);
   const point=this.raycaster.ray.intersectPlane(d.plane,new THREE.Vector3());if(point)d.group.position.copy(point);
   const target=this.fanDropAt(ev.clientX,ev.clientY);for(const m of this.fanMarkers)m.button.classList.toggle('drop-ready',m.slot.id===target&&!placementError(this.currentBuild,this.fanLayout,d.fanId,target));
  };
  button.onpointerup=ev=>this.endFanDrag(ev,false);button.onpointercancel=ev=>this.endFanDrag(ev,true);
  button.onlostpointercapture=()=>{if(this.fanDrag)this.endFanDrag(null,true);};
 },
 fanDropAt(x,y){
  let target=null,distance=38;
  for(const {button,slot} of this.fanMarkers||[]){if(button.hidden)continue;const r=button.getBoundingClientRect(),d=Math.hypot(x-r.left-r.width/2,y-r.top-r.height/2);if(d<distance){target=slot.id;distance=d;}}
  return target;
 },
 endFanDrag(ev,cancelled){
  const d=this.fanDrag;if(!d||(ev&&d.id!==ev.pointerId))return;
  const target=ev&&!cancelled?this.fanDropAt(ev.clientX,ev.clientY):null;
  this.fanDrag=null;d.group.position.copy(d.origin);this.controls.enabled=true;
  if(d.button.hasPointerCapture(d.id))d.button.releasePointerCapture(d.id);
  for(const m of this.fanMarkers||[])m.button.classList.remove('held','eligible','drop-ready');
  this.fanDragClickSuppressed=true;setTimeout(()=>this.fanDragClickSuppressed=false,0);
  if(!cancelled){if(d.moved)this.onFanDrop?.(d.fanId,target);else this.onFanSelect?.(d.fanId);}
 },
 addFanBranches(active,selected){
  for(const fan of this.fanLayout||[]){
   const id=fan.direction==='in'?'frontFan':'rearFan';if(!active.includes(id)&&selected!==id)continue;
   const route=fanBranchRoute(this.currentBuild,fan);
   const curve=cableCurve(route,.04),mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,80,.008,5,false),new THREE.MeshStandardMaterial({color:0x262b31,roughness:.85}));this.wires.add(mesh);
  }
 },
 makeFanFlows(){
  this.flowGroup=new THREE.Group();this.root.add(this.flowGroup);this.flowGroup.visible=this.airflow;this.flowParticles=[];
  const mounts=fanMounts(this.currentBuild||{}),lines={in:[],out:[]};
  for(const spec of sanitizeFanLayout(this.currentBuild||{},this.fanLayout)){
   const slot=mounts.find(s=>s.id===spec.slot),normal=new THREE.Vector3(...slot.normal),center=new THREE.Vector3(...slot.position),{u}=fanBasis(slot);
   for(const lane of [-.22,0,.22]){
    const offset=new THREE.Vector3(...u).multiplyScalar(lane),outside=center.clone().addScaledVector(normal,.70).add(offset),inside=center.clone().addScaledVector(normal,-.72).add(offset);
    const curve=new THREE.LineCurve3(spec.direction==='in'?outside:inside,spec.direction==='in'?inside:outside);
    lines[spec.direction].push(curve.v1,curve.v2);
    for(let i=0;i<4;i++)this.flowParticles.push({curve,t:i/4,direction:spec.direction});
   }
  }
  for(const direction of ['in','out'])if(lines[direction].length){const line=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lines[direction]),new THREE.LineBasicMaterial({color:direction==='in'?0x8edaf2:0xf1ad8c,transparent:true,opacity:.28,depthTest:false}));line.renderOrder=3;this.flowGroup.add(line);}
  // All particles share one geometry/material, even with 18 mounted fans.
  this.flowMesh=new THREE.InstancedMesh(new THREE.SphereGeometry(.028,6,4),new THREE.MeshBasicMaterial({depthTest:false}),this.flowParticles.length);this.flowMesh.renderOrder=4;this.flowMesh.frustumCulled=false;this.flowGroup.add(this.flowMesh);this.flowDummy=new THREE.Object3D();
  this.flowParticles.forEach((f,i)=>this.flowMesh.setColorAt(i,new THREE.Color(f.direction==='in'?0x8edaf2:0xf1ad8c)));this.updateFanFlows(0);
 },
 updateFanFlows(dt){
  if(!this.flowMesh)return;
  this.flowMesh.visible=this.running;
  this.flowParticles.forEach((f,i)=>{const speed=this.running?(f.direction==='in'?this.settings.front:this.settings.rear)/100:0;f.t=(f.t+dt*.45*speed)%1;this.flowDummy.position.copy(f.curve.getPoint(f.t));this.flowDummy.scale.setScalar(speed>0?1:0);this.flowDummy.updateMatrix();this.flowMesh.setMatrixAt(i,this.flowDummy.matrix);});
  this.flowMesh.instanceMatrix.needsUpdate=true;
 }
};
