import {connectionModes} from './peripheral-connections.js';
import {PeripheralCables} from './peripheral-cables.js';
import * as THREE from 'three';
import {createMouseModel as mouse} from './mouse-model.js';
import {PCScene} from './scene.js?v=workplace-integration';
import {peripheralById,sanitizeWorkplace} from './peripherals.js?v=expanded-20261102';

import {peripheralAppearance} from './peripheral-shapes.js?v=expanded-20261102';
import {createKeyboardModel as keyboard,sanitizeKeyboardLighting} from './keyboard-model.js';

const plastic=color=>new THREE.MeshStandardMaterial({color,roughness:.62,metalness:.08});
const deskY=7.5;
function box(g,w,h,d,x,y,z,material){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function dispose(group){const geometries=new Set(),materials=new Set(),textures=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of [o.material].flat().filter(Boolean)){materials.add(m);if(m.map)textures.add(m.map);}});textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());group.removeFromParent();}
function label(g,text,w,h,x,y,z,rotation=[0,0,0],color='#b6bdc1'){
 const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font='500 70px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64,490);
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map,transparent:true,depthWrite:false,roughness:.7,polygonOffset:true,polygonOffsetFactor:-1}));m.position.set(x,y,z);m.rotation.set(...rotation);g.add(m);
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
 const display=new THREE.Mesh(surface,new THREE.MeshBasicMaterial({map:texture}));display.userData.monitorDisplay=true;display.position.z=.105;screen.add(display);
 // Match the bent panel with a segmented rear shell and flush edge strips.
 const segments=p.curved?32:1;
 for(let i=0;i<segments;i++){const x=-w/2+w/segments*(i+.5),z=p.curved?x*x/30:0,angle=p.curved?-Math.atan(x/15):0;const b=box(screen,w/segments+.006,bodyH,.16,x,0,z-.01,body);b.rotation.y=angle;for(const sign of [-1,1]){const edge=box(screen,w/segments+.008,.05,.19,x,sign*bodyH/2,z,bezel);edge.rotation.y=angle;}}
 for(const sign of [-1,1])box(screen,.045,bodyH,.19,sign*w/2,0,p.curved?w*w/120:0,bezel);
 label(screen,p.brand||'xiaomi',.48,.065,0,-bodyH/2+.04,.11,[0,0,0],p.colors.includes('white')&&p.id!=='mpg321w'?'#68767b':'#b6bdc1');
 g.userData.cableStarts={};let index=0;
 for(const mode of connectionModes(p)){
  const token={hdmi:'HDMI',dp:'(?:DisplayPort|DP)',vga:'VGA',dvi:'DVI'}[mode],count=Number((p.specs['Порты']||'').match(new RegExp('(\\d+)\\s*[×x]\\s*'+token,'i'))?.[1]||1);
  for(let n=0;n<count;n++){const x=-.25+index++*.18;box(screen,.13,.065,.03,x,-screenH*.25,-.105,plastic('#839092'));box(screen,.10,.037,.035,x,-screenH*.25,-.124,plastic('#111719'));if(!n)g.userData.cableStarts[mode]=[x,bodyY-screenH*.25,panelZ-.14];}
 }
 g.userData.cableStart=Object.values(g.userData.cableStarts)[0];
 return g;
}

export class WorkplaceScene extends PCScene{
 frame(time){super.frame(time);this.externalCables?.update();if(this.keyboardModel&&this.keyboardLighting?.mode==='rainbow')this.keyboardModel.userData.updateLighting(this.keyboardLighting,time);}
 setKeyboardLighting(value){this.keyboardLighting=sanitizeKeyboardLighting(value);this.keyboardModel?.userData.updateLighting(this.keyboardLighting,this.last||0);}


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
  this.setKeyboardLighting();try{this.setKeyboardLighting(JSON.parse(localStorage.getItem('pcmaker-keyboard-lighting')));}catch{}
  this.keyboardLightingListener=e=>this.setKeyboardLighting(e.detail);document.addEventListener('pcmaker:keyboard-lighting',this.keyboardLightingListener);
  this.peripheralRoot=new THREE.Group();this.scene.add(this.peripheralRoot);this.externalCables=new PeripheralCables(this);this.workplaceReady=true;this.focus('all');
  this.renderer.domElement.addEventListener('pointerdown',e=>{this.workplaceDown={x:e.clientX,y:e.clientY,button:e.button};});
  this.renderer.domElement.addEventListener('pointerup',e=>{const s=this.workplaceDown;this.workplaceDown=null;if(!s||s.button!==0||this.fanEditing||this.dragging||Math.hypot(e.clientX-s.x,e.clientY-s.y)>5)return;const r=container.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),this.camera);for(const hit of ray.intersectObject(this.peripheralRoot,true)){let node=hit.object;while(node&&!node.userData.productId)node=node.parent;if(node){this.onProduct?.(node.userData.productId);break;}}});
 }
 setPeripherals(value){
  for(const child of [...this.peripheralRoot.children])dispose(child);
  this.keyboardModel=null;const selected=sanitizeWorkplace(value);for(const [key,id] of Object.entries(selected)){const p=peripheralById[id],group=key==='monitor'?monitor(p):key==='keyboard'?keyboard(p):mouse(p);if(key==='mouse'&&!group.userData.cableStart&&connectionModes(p).includes('usb')){const pos=[0,.10,-p.dimensions[1]/200];box(group,.09,.04,.025,...pos,plastic('#080d10'));group.userData.cableStart=pos;}group.userData.productId=id;group.position.set(key==='mouse'?1.8:-1.9,deskY+.035,key==='monitor'?-1.45:2.0);this.peripheralRoot.add(group);if(key==='keyboard'){this.keyboardModel=group;group.userData.updateLighting(this.keyboardLighting||sanitizeKeyboardLighting(),this.last||0);document.dispatchEvent(new CustomEvent('pcmaker:keyboard-selected',{detail:id}));}}
  this.connectPeripherals();
 }
 connectPeripherals(){this.externalCables?.refresh();}
 fitWorkplace(){if(!this.focusName||this.focusName==='all')this.focus('all');}
 focus(name){if(name==='pc'){this.view('assembly');return;}this.controls.autoRotate=false;this.focusName=name;const views={connections:{target:[1,8.5,-.6],offset:[19,10,14],size:21},'desk-cables':{target:[0,7.5,0],offset:[0,21,4],size:21},all:{target:[0,6.1,0],offset:[13,11,25],size:21},monitor:{target:[-1.9,10,-1.45],offset:[1,1.5,12],size:10},keyboard:{target:[-1.9,7.6,2],offset:[0,5,4],size:6},mouse:{target:[1.8,7.7,2],offset:[2,2,3],size:3}};const view=views[name]||views.all,target=new THREE.Vector3(...view.target),offset=new THREE.Vector3(...view.offset);const minDistance=view.size/(2*Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2))*Math.min(this.camera.aspect,1.45));offset.setLength(Math.max(offset.length(),minDistance));this.controls.target.copy(target);this.camera.position.copy(target).add(offset);this.controls.update();}
 dispose(){this.externalCables?.dispose();document.removeEventListener('pcmaker:keyboard-lighting',this.keyboardLightingListener);if(this.peripheralRoot)dispose(this.peripheralRoot);if(this.desk)dispose(this.desk);super.dispose();}
}
