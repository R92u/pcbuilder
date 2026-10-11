import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {resolve} from './catalog.js';
import {modelMethods} from './model.js';
import {portsFor,cablesFor} from './wiring.js';
import {hardwareFinish} from './surfaces.js';
import {caseLayout,gpuSlots,coolerLayout,CPU_CENTER} from './layout.js';
import {cableCurve,strandPoints} from './cable-geometry.js';
import {fanSceneMethods} from './fan-scene.js';
import {lightingSceneMethods} from './lighting-scene.js';
import {interactionMethods} from './interaction.js';

const C={metal:0x222a2f,edge:0x485257,black:0x101618,silver:0x879398,pcb:0x17211c,purple:0xbfa5ff};
const mat=(color,roughness=.5,metalness=.25)=>hardwareFinish(new THREE.MeshStandardMaterial({color,roughness,metalness}));
export class PCScene {
 constructor(container){
  this.container=container;this.parts={};this.fans=[];this.flowParticles=[];this.transitions=[];this.hideGlass=false;this.hideRearPanel=false;this.hideCooler=false;this.airflow=false;this.running=false;this.settings={front:60,rear:60,cpuFan:60};this.last=0;
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));this.renderer.setClearColor(0,0);this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.08;
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFShadowMap;
  container.replaceChildren(this.renderer.domElement);this.scene=new THREE.Scene();
  // Neutral studio reflections give metal and matte plastic distinct surfaces.
  const room=new THREE.Scene();room.background=new THREE.Color(0x30383e);
  const softboxes=[[[0,5,0],[0,0,0],5,3,3.0],[[4,1,3],[0,1,0],2,5,2.0],[[-4,2,-2],[0,2,0],2,4,1.5]];
  for(const [position,target,w,h,intensity] of softboxes){const light=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(0xdfe8ed).multiplyScalar(intensity),side:THREE.DoubleSide}));light.position.set(...position);light.lookAt(...target);room.add(light);}
  const pmrem=new THREE.PMREMGenerator(this.renderer);this.environment=pmrem.fromScene(room,.08);this.scene.environment=this.environment.texture;this.scene.environmentIntensity=.65;pmrem.dispose();room.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
  this.camera=new THREE.PerspectiveCamera(36,1,.1,70);this.camera.position.set(8.4,5.7,8.2);
  this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.target.set(0,2.3,0);this.controls.enableDamping=true;this.controls.dampingFactor=.08;this.controls.minDistance=4.2;this.controls.maxDistance=19;this.controls.maxPolarAngle=Math.PI*.61;this.controls.minPolarAngle=.32;this.controls.enablePan=false;this.controls.autoRotateSpeed=.55;
  this.scene.add(new THREE.HemisphereLight(0xf2f6f8,0x1b2225,2.4));
  const key=new THREE.DirectionalLight(0xf9fcff,3.6);key.position.set(4,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-5,right:5,top:7,bottom:-5});key.shadow.bias=-.0005;this.scene.add(key);
  const fill=new THREE.DirectionalLight(0xa6b8c8,1.4);fill.position.set(-4,4,-3);this.scene.add(fill);
  const rim=new THREE.DirectionalLight(0xbad2df,2.0);rim.position.set(2,3,-5);this.scene.add(rim);
  const interior=new THREE.PointLight(0xac8ef0,.65,7,1.5);interior.position.set(.9,3,1);this.scene.add(interior);
  this.root=new THREE.Group();this.scene.add(this.root);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.3}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.position.y=.04;this.scene.add(floor);
  const grid=new THREE.GridHelper(16,32,0x5b496f,0x4a395c);grid.material.transparent=true;grid.material.opacity=.17;grid.position.y=.02;this.scene.add(grid);
  // Theme changes affect studio decoration, never the user's hardware RGB.
  const applyStudioTheme=()=>{
   const neutral=document.documentElement.dataset.design==='terminal';
   interior.color.set(neutral?0xe0e0e0:0xac8ef0);
   grid.material.vertexColors=!neutral;
   grid.material.color.set(neutral?0x777777:0xffffff);
   grid.material.needsUpdate=true;
  };
  applyStudioTheme();window.addEventListener('pcmaker:design-change',applyStudioTheme);
  this.makeCase();this.makeFlows();this.initInteraction();
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();this.reset();
  this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.onContextLost?.();});
  this.frame=this.frame.bind(this);this.raf=requestAnimationFrame(this.frame);
 }
 box(g,w,h,d,x,y,z,color=C.metal,rough=.5){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color,rough,.4));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);return mesh;}
 cylinder(g,r,h,x,y,z,color=C.edge){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),mat(color,.38,.4));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;}
 text(g,text,w,h,x,y,z,rotation=[0,0,0],color='#87908f',bg=null,lit=false){
  // Flush, light-reactive silkscreen / laser etching, never a luminous billboard.
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=Math.max(32,Math.min(512,Math.round(512*h/w)));const c=canvas.getContext('2d');
  if(bg){c.fillStyle=bg;c.fillRect(0,0,512,canvas.height);}
  const tint=new THREE.Color(color);if(!lit&&tint.getHSL({}).l>.53)tint.multiplyScalar(.63);
  c.textAlign='center';c.textBaseline='middle';c.fillStyle='#'+tint.getHexString();c.font=`600 ${Math.min(canvas.height*.55,512/(String(text).length*.61))}px Arial`;c.fillText(text,256,canvas.height/2);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=2;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:texture,transparent:true,roughness:.64,metalness:.2,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,side:THREE.DoubleSide}));mesh.position.set(x,y,z);mesh.rotation.set(...rotation);g.add(mesh);return mesh;
 }
 label(g,p,w,h,x,y,z,rotation=[0,Math.PI/2,0],light=false){
  // A single 512 px factory label contains model, specifications and barcode.
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const c=canvas.getContext('2d');
  c.fillStyle=light?'#a5aaa5':'#202728';c.fillRect(0,0,512,256);c.strokeStyle=light?'#7b817e':'#3b4443';c.strokeRect(5,5,502,246);
  c.fillStyle=light?'#353e3b':'#a1aaa7';c.font='600 26px Arial';c.fillText((p.manufacturer||p.brand||p.name.split(' ')[0]).toUpperCase(),24,45);
  c.font=`600 ${Math.min(33,455/(p.short.length*.57))}px Arial`;c.fillText(p.short,24,99);
  c.font='18px monospace';c.fillText((p.sku||p.socket||p.memory||p.interface||p.form||'').slice(0,36),24,135);
  c.font='15px monospace';c.fillText('PCmaker / model label',24,229);
  for(let i=0;i<85;i++)if((i*7+i%3)%5>1)c.fillRect(25+i*3,165,1+i%2,33);
  c.font='18px Arial';c.fillText('CE',391,192);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=2;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:texture,roughness:.73,metalness:light?.35:.08,polygonOffset:true,polygonOffsetFactor:-1}));mesh.position.set(x,y,z);mesh.rotation.set(...rotation);g.add(mesh);return mesh;
 }
 lightStrip(g,w,h,d,x,y,z,color=C.purple){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.5,roughness:.35}));mesh.position.set(x,y,z);g.add(mesh);this.tagLight(mesh,{type:'rgb'});return mesh;}
 fan(parent,size,x,y,z,rotation,kind,lighting=null){
  const rgb=!!lighting;
  const fan=new THREE.Group();fan.position.set(x,y,z);fan.rotation.set(...rotation);parent.add(fan);
  const depth=kind==='gpu'?.17:.23;
  // A continuous square housing, rotor between its faces, and motor braces on
  // the exhaust side (-Z). The intake is +Z for case and CPU fans.
  for(const sign of [-1,1]){this.box(fan,size,size*.075,depth,0,sign*size*.4625,0,C.black);this.box(fan,size*.075,size,depth,sign*size*.4625,0,0,C.black);}
  const ductShape=new THREE.Shape();ductShape.absarc(0,0,size*.455,0,Math.PI*2,false);const opening=new THREE.Path();opening.absarc(0,0,size*.408,0,Math.PI*2,true);ductShape.holes.push(opening);
  const duct=new THREE.Mesh(new THREE.ExtrudeGeometry(ductShape,{depth,bevelEnabled:false,curveSegments:24}),mat(C.black,.7,.1));duct.position.z=-depth/2;fan.add(duct);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(size*.425,size*.015,6,40),new THREE.MeshStandardMaterial({color:rgb?C.purple:0x454e52,emissive:rgb?0x7e57cc:0,emissiveIntensity:rgb?.9:0,metalness:.25,roughness:.5}));ring.position.z=depth/2+.003;fan.add(ring);
  if(lighting?.zones==='ring'){this.tagLight(ring,lighting);const backRing=ring.clone();backRing.position.z=-depth/2-.003;fan.add(backRing);}
  else {ring.material.emissiveIntensity=0;ring.material.color.set(0x454e52);}
  const rotor=new THREE.Group();rotor.userData.animated=true;rotor.position.z=.025;fan.add(rotor);
  const bladeShape=new THREE.Shape();bladeShape.moveTo(.09,-.025);bladeShape.quadraticCurveTo(.24,-.14,.38,-.08);bladeShape.quadraticCurveTo(.415,-.02,.365,.042);bladeShape.quadraticCurveTo(.23,.025,.10,.065);bladeShape.closePath();
  const bladeGeometry=new THREE.ExtrudeGeometry(bladeShape,{depth:.018,bevelEnabled:false,curveSegments:6});
  const blades=new THREE.InstancedMesh(bladeGeometry,mat(rgb?0x657178:0x303a3e,.65,.15),7),transform=new THREE.Object3D();
  for(let i=0;i<7;i++){transform.scale.setScalar(size);transform.rotation.z=i/7*Math.PI*2;transform.rotation.x=.16;transform.updateMatrix();blades.setMatrixAt(i,transform.matrix);}rotor.add(blades);if(lighting?.zones==='blades')this.tagLight(blades,{...lighting,intensity:.65});
  const hub=this.cylinder(rotor,size*.115,.085,0,0,.015,0x252d32);hub.rotation.x=Math.PI/2;if(lighting?.zones==='blades')this.tagLight(hub,{...lighting,intensity:.5});
  const rearHub=this.cylinder(fan,size*.13,.10,0,0,-depth/2+.05,0x414c52);rearHub.rotation.x=Math.PI/2;
  for(const angle of [Math.PI/4,-Math.PI/4]){const support=this.box(fan,size*1.22,size*.040,.035,0,0,-depth/2+.018,0x343f45);support.rotation.z=angle;}
  const sticker=new THREE.Mesh(new THREE.CircleGeometry(size*.108,24),mat(0x6c7679,.85,.05));sticker.position.z=-depth/2-.004;sticker.rotation.y=Math.PI;fan.add(sticker);
  for(const sx of [-1,1])for(const sy of [-1,1])for(const face of [-1,1]){const screw=new THREE.Mesh(new THREE.CircleGeometry(size*.026,8),mat(0x788387));screw.position.set(sx*size*.447,sy*size*.447,face*(depth/2+.004));if(face<0)screw.rotation.y=Math.PI;fan.add(screw);}
  // Moulded airflow arrow on the top edge, visibly pointing through the struts.
  this.box(fan,.015,.008,.11,0,size/2+.005,0,0x8c999e);
  for(const sign of [-1,1]){const arrow=this.box(fan,.055,.008,.012,sign*.018,size/2+.005,-.043,0x8c999e);arrow.rotation.y=sign*Math.PI/4;}
  if(kind!=='gpu')this.box(fan,.075,.070,.060,(kind==='front'?-1:1)*size*.46,size*(kind==='cpu'?.40:.35),-depth/2+.015,0x11191c);
  this.fans.push({rotor,kind,parent});return fan;
 }
 setBuild(build){
  const changedCase=this.currentBuild?.case!==build.case;this.currentBuild={...build};const p=resolve(build);
  const caseSignature=(p.case?.id||'cc560')+':'+(p.gpu?.length||'empty')+':'+(p.cooler?.type==='aio'?p.cooler.id:'air');
  if(p.case&&this.caseGroup.userData.signature!==caseSignature){this.caseGroup.removeFromParent();this.fans=this.fans.filter(f=>f.parent!==this.caseGroup);this.caseGroup.traverse(o=>{o.geometry?.dispose();o.material?.map?.dispose();o.material?.dispose();});this.makeCase(p.case);this.caseGroup.userData.signature=caseSignature;this.glass.visible=!this.hideGlass;this.makeCaseFlows(p.case);}
  for(const key of ['motherboard','cpu','ram','gpu','cooler','storage','psu']){
   const signature=p[key]?.id+(key==='cooler'?':'+p.ram?.id+':'+p.cpu?.socket+':'+caseSignature:'');if(this.parts[key]?.userData.signature===signature)continue;
   if(this.parts[key]){const old=this.parts[key];this.root.remove(old);this.fans=this.fans.filter(f=>f.parent!==old&&!old.getObjectById(f.parent.id));this.transitions=this.transitions.filter(t=>t.group!==old);old.traverse(o=>{o.geometry?.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){m.map?.dispose();m.dispose();}}});delete this.parts[key];}
   if(!p[key])continue;
   const factories={motherboard:'makeMotherboard',cpu:'makeCPU',ram:'makeRAM',gpu:'makeGPU',cooler:'makeCooler',storage:'makeStorage',psu:'makePSU'};
   const group=this[factories[key]](p[key]);group.userData.id=p[key].id;group.userData.signature=signature;group.userData.componentKey=key;this.root.add(group);this.parts[key]=group;// Install directly at shared anchors, including during the first rendered frame.
  }
  this.setFanLayout(this.fanLayout);
  for(const [i,cover] of (this.slotCovers||[]).entries())cover.visible=!p.gpu||i>=gpuSlots(p.gpu);
  if(this.parts.cooler)this.parts.cooler.visible=!this.hideCooler;
  this.collectLights();this.rearPanel.visible=!this.hideRearPanel;
  if(changedCase)this.fitCaseView();
 }
 setWiring(mode,connected,selected=null,showPorts=false){
  this.clearLooseCable();this.selectedCable=selected;this.showPorts=showPorts;
  const targets=portsFor(this.currentBuild||{}),available=cablesFor(this.currentBuild||{},this.fanLayout),active=mode==='auto'?available.map(c=>c.id):connected;
  const key=JSON.stringify([this.currentBuild,this.fanLayout,active,selected,showPorts]);
  if(this.wireKey!==key){
   this.wireKey=key;
   if(this.wires){this.wires.removeFromParent();this.wires.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
   this.wires=new THREE.Group();this.root.add(this.wires);
   for(const cable of available.filter(c=>active.includes(c.id))){
    for(let i=0;i<cable.strands;i++){
     const curve=cableCurve(strandPoints(cable,i));
     const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(72,cable.points.length*14),cable.radius,5,false),mat(showPorts&&cable.id===selected?0x9788b1:i%4===0?0x363e43:0x171d20,.76,.1));mesh.castShadow=true;this.wires.add(mesh);
    }
    const [x,y,z]=targets[cable.id].position;
    const axis=targets[cable.id].axis,vertical=axis==='y'||axis==='-y',direction=axis==='-y'?-1:1;
    const plug=this.box(this.wires,.09,cable.id==='atx'?.46:.17,cable.id==='atx'?.13:.11,x+(vertical?0:.075),y+(vertical?.075*direction:0),z,0x242c30);if(vertical)plug.rotation.z=direction*Math.PI/2;
    if(['atx','eps','eps2'].includes(cable.id)||cable.id.startsWith('gpu'))for(const t of [.44,.65]){
     const curve=cableCurve(cable.points),point=curve.getPoint(t);
     const comb=this.box(this.wires,.05,cable.strands*cable.radius*2.3,.055,...point.toArray(),0x424e53);if(cable.spreadAxis==='x')comb.rotation.z=Math.PI/2;
    }
   }
   if(active.includes('cpuFan')||selected==='cpuFan'){
    const p=resolve(this.currentBuild),c=cablesFor(this.currentBuild,this.fanLayout).find(c=>c.id==='cpuFan');
    if(c&&p.cooler?.type!=='aio'&&(p.cooler?.fans||1)>1){
     const l=coolerLayout(p.cooler,p.ram,p.cpu?.socket),size=l.sizes[0]||l.size,start=[l.top-size*.04-.01,CPU_CENTER.y+size*.40,l.fanZ[0]-.10];
     const curve=cableCurve([start,[start[0]+.06,4.42,start[2]],[start[0]+.06,4.42,c.points[0][2]],c.points[0]]);
     this.wires.add(new THREE.Mesh(new THREE.TubeGeometry(curve,56,.012,6,false),mat(0x151d20,.8,.1)));
    }
   }
   this.addFanBranches(active,selected);
  }
  if(!this.markerLayer){this.markerLayer=document.createElement('div');this.markerLayer.className='port-markers';this.container.append(this.markerLayer);}
  this.markerLayer.replaceChildren();this.markers=[];
  available.forEach((c,i)=>{const button=document.createElement('button');button.type='button';button.className='port-marker'+(c.id===selected?' target':'')+(active.includes(c.id)?' connected':'');button.dataset.port=c.id;button.setAttribute('aria-label','Разъём '+c.to);button.title=c.to;button.textContent=String(i+1);const label=document.createElement('span');label.textContent=c.to;button.append(label);this.markerLayer.append(button);this.markers.push({button,position:new THREE.Vector3(...targets[c.id].position)});});
  this.markerLayer.classList.toggle('visible',showPorts);this.prepareLooseCable(mode,active);this.updateMarkers();
 }
 updateMarkers(){
  if(!this.showPorts||!this.markers)return;this.updatePlugHandle();
  const width=this.container.clientWidth,height=this.container.clientHeight;
  for(const {button,position} of this.markers){const projected=position.clone().project(this.camera);button.style.left=(projected.x*.5+.5)*width+'px';button.style.top=(-projected.y*.5+.5)*height+'px';button.hidden=projected.z>1||Math.abs(projected.x)>1||Math.abs(projected.y)>1;}
 }
 view(name){
  const views={assembly:[10.4,5.0,3.8],rear:[3.4,4.1,-9.4],top:[4.8,10,5.8],cables:[-8.3,4.6,5.4]};
  this.camera.position.set(...(views[name]||views.assembly));this.controls.target.set(0,2.35,0);this.fitCaseView();this.controls.update();this.endCableDrag(null,true);this.rearPanel.visible=!this.hideRearPanel;if(this.markerLayer)this.markerLayer.hidden=['rear','cables'].includes(name);
 }
 fitCaseView(){
  const p=resolve(this.currentBuild||{}),f=caseLayout(p.case||{},p.gpu,p.cooler),center=new THREE.Vector3((f.side+f.back)/2,2.38,f.centerZ),offset=this.camera.position.clone().sub(this.controls.target),back=offset.clone().normalize();
  const right=new THREE.Vector3().crossVectors(this.camera.up,back).normalize(),up=new THREE.Vector3().crossVectors(back,right),tanV=Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2)),tanH=tanV*this.camera.aspect;
  let distance=0;
  for(const x of [f.back-.12,f.side+.12])for(const y of [0,4.8])for(const z of [f.rear-.16,f.front+.25]){
   const relative=new THREE.Vector3(x,y,z).sub(center),depth=relative.dot(back);
   distance=Math.max(distance,depth+Math.abs(relative.dot(right))/tanH,depth+Math.abs(relative.dot(up))/tanV);
  }
  this.controls.target.copy(center);this.camera.position.copy(center).addScaledVector(back,Math.max(offset.length(),distance*1.07));this.controls.update();
 }
 makeCaseFlows(p){if(this.flowGroup){this.flowGroup.removeFromParent();this.flowGroup.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}this.flowParticles=[];this.makeFlows(p.frontFanCount??3);this.flowGroup.visible=this.airflow;}
 makeFlows(){this.makeFanFlows();}
 setOptions(options){Object.assign(this,options);this.updateSideGuards();this.glass.visible=!this.hideGlass;this.rearPanel.visible=!this.hideRearPanel;if(this.parts.cooler)this.parts.cooler.visible=!this.hideCooler;this.flowGroup.visible=this.airflow;this.markerLayer?.classList.toggle('visible',!!this.showPorts);}
 reset(){this.view('assembly');}
 zoom(factor){const offset=this.camera.position.clone().sub(this.controls.target);offset.multiplyScalar(factor);offset.setLength(THREE.MathUtils.clamp(offset.length(),4.2,19));this.camera.position.copy(this.controls.target).add(offset);this.controls.update();}
 resize(){const {width,height}=this.container.getBoundingClientRect();if(!width||!height)return;this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.renderer.setSize(width,height,false);this.fitCaseView();}
 frame(time){
  if(time-this.last<1000/45){this.raf=requestAnimationFrame(this.frame);return;}
  const dt=Math.min((time-this.last)/1000||0,.05);this.last=time;this.controls.update();
  for(const f of this.fans){const fraction=f.mountId?(f.direction==='in'?this.settings.front:this.settings.rear)/100:f.kind==='front'?this.settings.front/100:f.kind==='rear'?this.settings.rear/100:f.kind==='cpu'?this.settings.cpuFan/100:(this.settings.gpuFan??60)/100;f.rotor.rotation.z-=dt*(this.running?fraction*12:0);}
  this.transitions=this.transitions.filter(t=>{const p=Math.min((time-t.start)/650,1);t.group.position.x=.65*(1-p)**3;return p<1;});
  if(this.airflow)this.updateFanFlows(dt);
  this.updateFanMarkers();if(this.lighting?.mode==='rainbow')this.updateLighting(time);
  this.updateMarkers();this.renderer.render(this.scene,this.camera);this.raf=requestAnimationFrame(this.frame);
 }
 dispose(){cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();this.controls.dispose();this.environment?.dispose();this.clearLooseCable();this.endFanDrag(null,true);window.removeEventListener('blur',this.cancelHeldPlug);this.renderer.dispose();}
}

Object.assign(PCScene.prototype,modelMethods,interactionMethods,fanSceneMethods,lightingSceneMethods);
