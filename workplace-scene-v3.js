import * as THREE from 'three';
import {createMouseModel as mouse} from './mouse-model.js';
import {PCScene} from './scene.js?v=workplace-integration';
import {peripheralById,sanitizeWorkplace} from './peripherals.js?v=expanded-20261102';

import {keyboardLayout,peripheralAppearance} from './peripheral-shapes.js?v=expanded-20261102';

const plastic=color=>new THREE.MeshStandardMaterial({color,roughness:.62,metalness:.08});
const deskY=7.5;
function box(g,w,h,d,x,y,z,material){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function tube(g,points,r=.018){const c=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(c,40,r,6,false),plastic('#151a1d'));g.add(m);return m;}
function dispose(group){const geometries=new Set(),materials=new Set(),textures=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of [o.material].flat().filter(Boolean)){materials.add(m);if(m.map)textures.add(m.map);}});textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());group.removeFromParent();}
function label(g,text,w,h,x,y,z,rotation=[0,0,0],color='#b6bdc1'){
 const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font='500 70px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64,490);
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map,transparent:true,depthWrite:false,roughness:.7,polygonOffset:true,polygonOffsetFactor:-1}));m.position.set(x,y,z);m.rotation.set(...rotation);g.add(m);
}
function keyboard(p){
 const g=new THREE.Group(),[w,d,h]=p.dimensions.map(v=>v/100),style=peripheralAppearance(p),light=p.colors.includes('white')&&!p.colors.includes('black');
 box(g,w,h*.5,d,0,h*.25,0,plastic(style.body));
 box(g,w-.07,.025,p.id==='shiva'?d*.68:d-.05,0,h*.53,p.id==='shiva'?-d*.13:0,plastic(light?'#a6afae':'#171e22'));
 if(p.id==='shiva')box(g,w-.05,.07,d*.24,0,.08,d*.36,plastic('#22282c'));
 const layout=keyboardLayout(p);
 const geometry=new THREE.BoxGeometry(1,1,1),keys=new THREE.InstancedMesh(geometry,plastic('#ffffff'),layout.length),t=new THREE.Object3D();keys.castShadow=true;
 layout.forEach((k,i)=>{t.position.set(k.x,h*.78,k.z);t.scale.set(k.w,h*.38,k.d);t.updateMatrix();keys.setMatrixAt(i,t.matrix);
 const accent=p.id==='fizz'&&(k.legend==='Esc'||k.legend===''),ryze=p.id==='ryze'&&!k.modifier;
 keys.setColorAt(i,new THREE.Color(accent?'#e6c52e':ryze?'#d7d8d4':k.modifier?style.modifiers:style.keys));});g.add(keys);
 // One small atlas for the key legends, shared by all key surfaces.
 const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle=light?'#605c54':'#d9e4e5';ctx.textAlign='center';
 for(let i=0;i<layout.length;i++){const text=layout[i].legend??(layout[i].row===5?'F'+(layout[i].col+1):String(layout[i].col+1));ctx.font=(text.length>2?'10':'18')+'px Arial';ctx.fillText(text,(i%8)*64+32,Math.floor(i/8)*32+22,58);}
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;const legendMat=new THREE.MeshStandardMaterial({map,transparent:true,depthWrite:false,roughness:.8});
 layout.forEach((k,i)=>{const geo=new THREE.PlaneGeometry(Math.min(k.w,.23),.115),uv=geo.attributes.uv;for(let j=0;j<uv.count;j++)uv.setXY(j,(uv.getX(j)+i%8)/8,(uv.getY(j)+15-Math.floor(i/8))/16);const m=new THREE.Mesh(geo,legendMat);m.rotation.x=-Math.PI/2;m.position.set(k.x,h*.98,k.z);g.add(m);});
 const led=new THREE.MeshStandardMaterial({color:0xc8e2e8,emissive:0xc8e2e8,emissiveIntensity:.8,roughness:.4});
 if(p.rgb!==false)for(const sign of [-1,1])box(g,w-.1,.012,.012,0,h*.53,sign*(p.id==='shiva'?d*.32:d*.46),led);
 if(p.knob){const knob=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.065,20),plastic('#b7bcbd'));knob.position.set(w*.45,h,-d*.39);g.add(knob);}
 label(g,p.brand||'REDRAGON',.45,.055,0,h*.52,d*.49,[-Math.PI/2,0,0]);
 if(p.wired!==false)g.userData.cableStart=[0,.09,-d/2];
 return g;
}
function monitor(p){
 const g=new THREE.Group(),[w,d,h]=p.dimensions.map(v=>v/100),style=peripheralAppearance(p),screenH=Math.min((p.bodyHeight||1000)/100-.10,(w-.10)/p.ratio),bodyH=p.bodyHeight?p.bodyHeight/100:screenH+.10,bodyY=h-bodyH/2,body=plastic(style.body),bezel=plastic(style.bezel||style.body),metal=plastic(style.body),panelZ=-d*.08;
 const baseW=Math.min(w*.48,p.stand==='l'?2.45:3.15),baseD=d*.94;
 if(p.stand==='angular'){
  const shape=new THREE.Shape();shape.moveTo(-baseW/2,-baseD/2);shape.lineTo(baseW/2,-baseD/2);shape.lineTo(baseW*.38,baseD/2);shape.lineTo(-baseW*.38,baseD/2);shape.closePath();
  const base=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:false}),metal);base.rotation.x=-Math.PI/2;base.position.y=.025;g.add(base);
 }else if(p.stand==='l'){
  box(g,baseW,.055,.55,0,.04,baseD*.28,metal);box(g,.32,.055,baseD*.8,0,.04,-baseD*.05,metal);
 }else box(g,baseW,.065,baseD,0,.04,0,metal);
 box(g,p.stand==='l'?.16:.29,h*.55,.18,0,h*.29,-d*.17,metal);
 const screen=new THREE.Group();screen.position.set(0,bodyY,panelZ);g.add(screen);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d'),bg=ctx.createLinearGradient(0,0,512,256);bg.addColorStop(0,'#152e36');bg.addColorStop(.55,'#587b89');bg.addColorStop(1,'#d0dbd7');ctx.fillStyle=bg;ctx.fillRect(0,0,512,256);
 for(let i=0;i<8;i++){ctx.strokeStyle='#d6efff25';ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(350,310,80+i*28,160+i*18,-.7,0,Math.PI*2);ctx.stroke();}ctx.fillStyle='#ffffffde';ctx.font='300 30px Arial';ctx.fillText('PCmaker',26,205);ctx.font='12px Arial';ctx.fillText('ТВОЁ РАБОЧЕЕ МЕСТО',28,229);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const surface=new THREE.PlaneGeometry(w-.09,screenH-.10,p.curved?40:1,1);
 if(p.curved){const pos=surface.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i);pos.setZ(i,x*x/30);}surface.computeVertexNormals();}
 if(!p.curved)box(screen,w,bodyH,.025,0,0,.08,bezel);
 const display=new THREE.Mesh(surface,new THREE.MeshBasicMaterial({map:texture}));display.position.z=.105;screen.add(display);
 // Match the bent panel with a segmented rear shell and flush edge strips.
 const segments=p.curved?32:1;
 for(let i=0;i<segments;i++){const x=-w/2+w/segments*(i+.5),z=p.curved?x*x/30:0,angle=p.curved?-Math.atan(x/15):0;const b=box(screen,w/segments+.006,bodyH,.16,x,0,z-.01,body);b.rotation.y=angle;for(const sign of [-1,1]){const edge=box(screen,w/segments+.008,.05,.19,x,sign*bodyH/2,z,bezel);edge.rotation.y=angle;}}
 for(const sign of [-1,1])box(screen,.045,bodyH,.19,sign*w/2,0,p.curved?w*w/120:0,bezel);
 label(screen,p.brand||'xiaomi',.48,.065,0,-bodyH/2+.04,.11,[0,0,0],p.colors.includes('white')&&p.id!=='mpg321w'?'#68767b':'#b6bdc1');
 for(let i=0;i<(p.curved?4:2);i++){box(screen,.13,.065,.03,-.25+i*.18,-screenH*.25,-.105,plastic('#839092'));box(screen,.10,.037,.035,-.25+i*.18,-screenH*.25,-.124,plastic('#111719'));}
 g.userData.cableStart=[-.25,bodyY-screenH*.25,panelZ-.14];
 return g;
}

export class WorkplaceScene extends PCScene{
 rearPort(g,type,x,y,...rest){super.rearPort(g,type,x,y,...rest);const anchor=new THREE.Object3D();anchor.position.set(x,y,-2.20);anchor.userData.externalPort=type;g.add(anchor);}
 initInteraction(){super.initInteraction();}
 fitCaseView(){
  if(this.localCamera){super.fitCaseView();return;}
  if(!this.workplaceReady)return;
  if(this.focusName!=='pc'){this.fitWorkplace();return;}
  this.root.worldToLocal(this.camera.position);this.root.worldToLocal(this.controls.target);
  super.fitCaseView();this.root.localToWorld(this.camera.position);this.root.localToWorld(this.controls.target);this.controls.update();
 }
 view(name){this.pcCamera(()=>super.view(name));}
 viewFanWall(wall){this.pcCamera(()=>super.viewFanWall(wall));}
 pcCamera(action){
  if(!this.workplaceReady)return;
  this.focusName='pc';this.controls.autoRotate=false;this.localCamera=true;
  try{action();}finally{this.localCamera=false;}
  this.root.localToWorld(this.camera.position);this.root.localToWorld(this.controls.target);this.controls.update();this.updateMarkers();this.updateFanMarkers();
 }
 setBuild(build){super.setBuild(build);if(this.peripheralRoot)this.connectPeripherals();}
 zoom(factor){const offset=this.camera.position.clone().sub(this.controls.target);offset.multiplyScalar(factor).clampLength(this.controls.minDistance,this.controls.maxDistance);this.camera.position.copy(this.controls.target).add(offset);this.controls.update();}

 reset(){if(this.workplaceReady)this.focus('all');}
 constructor(container,build,options={}){
  super(container);this.controls.maxDistance=110;this.controls.minDistance=2;this.controls.enablePan=true;this.camera.far=220;this.camera.updateProjectionMatrix();if(build){this.setBuild(build);this.setFanLayout(options.fans);}this.collectLights();this.setLighting(options.lighting);
  this.root.rotation.y=-Math.PI/2;this.root.position.set(6,deskY+.05,-.6);this.hideGlass=true;this.glass.visible=false;
  for(const light of this.scene.children.filter(o=>o.isLight&&!o.isHemisphereLight)){light.position.add(this.root.position);if(light.target){light.target.position.copy(this.root.position);this.scene.add(light.target);}}
  this.scene.children.filter(o=>o.isGridHelper).forEach(o=>o.removeFromParent());
  this.desk=new THREE.Group();this.scene.add(this.desk);box(this.desk,18,.24,8,0,deskY-.12,0,plastic('#414a4d'));
  for(const x of [-8,8])for(const z of [-3,3])box(this.desk,.25,deskY-.24,.25,x,(deskY-.24)/2,z,plastic('#1d252a'));
  box(this.desk,8.5,.025,3.5,-1.6,deskY+.013,1.5,plastic('#171f24'));
  this.peripheralRoot=new THREE.Group();this.scene.add(this.peripheralRoot);this.workplaceReady=true;this.focus('all');
  this.renderer.domElement.addEventListener('pointerdown',e=>{this.workplaceDown={x:e.clientX,y:e.clientY,button:e.button};});
  this.renderer.domElement.addEventListener('pointerup',e=>{const s=this.workplaceDown;this.workplaceDown=null;if(!s||s.button!==0||this.fanEditing||this.dragging||Math.hypot(e.clientX-s.x,e.clientY-s.y)>5)return;const r=container.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),this.camera);for(const hit of ray.intersectObject(this.peripheralRoot,true)){let node=hit.object;while(node&&!node.userData.productId)node=node.parent;if(node){this.onProduct?.(node.userData.productId);break;}}});
 }
 setPeripherals(value){
  for(const child of [...this.peripheralRoot.children])dispose(child);
  const selected=sanitizeWorkplace(value);for(const [key,id] of Object.entries(selected)){const p=peripheralById[id],group=key==='monitor'?monitor(p):key==='keyboard'?keyboard(p):mouse(p);group.userData.productId=id;group.position.set(key==='mouse'?1.8:-1.9,deskY+.035,key==='monitor'?-1.45:2.0);this.peripheralRoot.add(group);}
  this.connectPeripherals();
 }
 connectPeripherals(){
  for(const child of [...this.peripheralRoot.children])if(!child.userData.productId)dispose(child);
  this.scene.updateMatrixWorld(true);
  const ports=(part,type)=>{const result=[];part?.traverse(o=>{if(o.userData.externalPort===type)result.push(o);});return result;},usb=ports(this.parts.motherboard,'usb'),video=ports(this.parts.gpu,'video');
  for(const group of [...this.peripheralRoot.children]){
   const p=peripheralById[group.userData.productId],port=p.category==='monitor'?video[0]:usb[p.category==='keyboard'?0:1];if(!port)continue;
   const end=port.getWorldPosition(new THREE.Vector3()),wire=new THREE.Group();this.peripheralRoot.add(wire);
   if(p.wired===false&&p.category!=='monitor'){box(wire,.14,.055,.07,end.x+.05,end.y,end.z,plastic('#151b20'));continue;}
   const start=group.localToWorld(new THREE.Vector3(...group.userData.cableStart)),z=-3.45+(p.category==='keyboard'?.05:p.category==='mouse'?.10:0),outside=end.x+.28;
   const route=p.category==='monitor'?[[start.x,start.y,start.z],[start.x,start.y,start.z-.3],[start.x,deskY+.08,z]]:[[start.x,start.y,start.z],[start.x,deskY+.08,start.z-.3],[p.category==='keyboard'?-4:2.8,deskY+.08,.45],[p.category==='keyboard'?-4:2.8,deskY+.08,z]];
   tube(wire,[...route,[outside,deskY+.08,z],[outside,deskY+.12,end.z-.25],[outside,end.y-.15,end.z],[end.x+.1,end.y,end.z],end.toArray()],.017);
   box(wire,.12,.065,.12,end.x+.035,end.y,end.z,plastic('#151b20'));
  }
 }
 fitWorkplace(){if(!this.focusName||this.focusName==='all')this.focus('all');}
 focus(name){if(name==='pc'){this.view('assembly');return;}this.controls.autoRotate=false;this.focusName=name;const views={all:{target:[0,6.1,0],offset:[13,11,25],size:21},monitor:{target:[-1.9,10,-1.45],offset:[1,1.5,12],size:10},keyboard:{target:[-1.9,7.6,2],offset:[0,5,4],size:6},mouse:{target:[1.8,7.7,2],offset:[2,2,3],size:3}};const view=views[name]||views.all,target=new THREE.Vector3(...view.target),offset=new THREE.Vector3(...view.offset);const minDistance=view.size/(2*Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2))*Math.min(this.camera.aspect,1.45));offset.setLength(Math.max(offset.length(),minDistance));this.controls.target.copy(target);this.camera.position.copy(target).add(offset);this.controls.update();}
 dispose(){if(this.peripheralRoot)dispose(this.peripheralRoot);if(this.desk)dispose(this.desk);super.dispose();}
}
