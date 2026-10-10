import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {resolve} from './catalog.js';
import {modelMethods} from './model.js';
import {ports,cablesFor} from './wiring.js';

const C={metal:0x222a2f,edge:0x485257,black:0x101618,silver:0x879398,pcb:0x17211c,purple:0xbfa5ff};
const mat=(color,roughness=.5,metalness=.25)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
export class PCScene {
 constructor(container){
  this.container=container;this.parts={};this.fans=[];this.flowParticles=[];this.transitions=[];this.hideGlass=true;this.hideCooler=false;this.airflow=false;this.running=false;this.settings={front:60,rear:60,cpuFan:60};this.last=0;
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));this.renderer.setClearColor(0,0);this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.08;
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
  this.makeCase();this.makeFlows();
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();this.reset();
  this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.onContextLost?.();});
  this.frame=this.frame.bind(this);this.raf=requestAnimationFrame(this.frame);
 }
 box(g,w,h,d,x,y,z,color=C.metal,rough=.5){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color,rough,.4));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);return mesh;}
 cylinder(g,r,h,x,y,z,color=C.edge){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),mat(color,.38,.4));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;}
 text(g,text,w,h,x,y,z,rotation=[0,0,0],color='#e5e2f0',bg=null){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.max(96,Math.round(1024*h/w));const c=canvas.getContext('2d');
  if(bg){c.fillStyle=bg;c.fillRect(0,0,canvas.width,canvas.height);}c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.font=`600 ${Math.min(canvas.height*.54,canvas.width/(text.length*.59))}px Arial`;c.fillText(text,canvas.width/2,canvas.height/2);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));mesh.position.set(x,y,z);mesh.rotation.set(...rotation);g.add(mesh);return mesh;
 }
 lightStrip(g,w,h,d,x,y,z,color=C.purple){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.5,roughness:.35}));mesh.position.set(x,y,z);g.add(mesh);return mesh;}
 fan(parent,size,x,y,z,rotation,kind,rgb=true){
  const fan=new THREE.Group();fan.position.set(x,y,z);fan.rotation.set(...rotation);parent.add(fan);
  for(const sign of [-1,1]){this.box(fan,size,size*.065,.11,0,sign*size*.465,0,C.black);this.box(fan,size*.065,size,.11,sign*size*.465,0,0,C.black);}
  // Open ring rather than an opaque front: rotor is genuinely three-dimensional.
  const ring=new THREE.Mesh(new THREE.TorusGeometry(size*.405,size*.038,10,48),new THREE.MeshStandardMaterial({color:rgb?C.purple:0x4c4e57,emissive:rgb?0x7e57cc:0,emissiveIntensity:rgb?.9:0,metalness:.35,roughness:.4}));ring.position.z=.081;fan.add(ring);
  const inner=new THREE.Mesh(new THREE.CircleGeometry(size*.37,40),new THREE.MeshStandardMaterial({color:0x0a0b0e,roughness:.8,side:THREE.DoubleSide}));inner.position.z=.066;fan.add(inner);
  const rotor=new THREE.Group();rotor.userData.animated=true;rotor.position.z=.11;fan.add(rotor);
  const bladeShape=new THREE.Shape();bladeShape.moveTo(.10,-.02);bladeShape.quadraticCurveTo(.24,-.19,.39,-.14);bladeShape.quadraticCurveTo(.45,-.05,.32,.07);bladeShape.lineTo(.1,.06);bladeShape.closePath();
  for(let i=0;i<9;i++){const b=new THREE.Mesh(new THREE.ExtrudeGeometry(bladeShape,{depth:.009,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.008,bevelThickness:.006,curveSegments:6}),new THREE.MeshStandardMaterial({color:rgb?0x727b80:0x303a3e,metalness:.35,roughness:.6,side:THREE.DoubleSide}));b.scale.setScalar(size);b.rotation.z=i/9*Math.PI*2;rotor.add(b);}
  const hub=new THREE.Mesh(new THREE.CircleGeometry(size*.115,24),mat(0x272832,.4,.35));hub.position.z=.005;rotor.add(hub);
  const rearHub=new THREE.Mesh(new THREE.CircleGeometry(size*.13,24),mat(0x4d595f));rearHub.position.z=-.08;rearHub.rotation.y=Math.PI;fan.add(rearHub);for(const angle of [0,Math.PI/2]){const support=this.box(fan,size*.76,size*.045,.035,0,0,-.095,0x485358);support.rotation.z=angle;}
  for(const sx of [-1,1])for(const sy of [-1,1]){const screw=new THREE.Mesh(new THREE.CircleGeometry(size*.026,8),mat(0x888491));screw.position.set(sx*size*.425,sy*size*.425,.063);fan.add(screw);}
  this.fans.push({rotor,kind,parent});return fan;
 }
 setBuild(build){
  this.currentBuild=build;const p=resolve(build);for(const key of ['motherboard','cpu','ram','gpu','cooler','storage','psu']){
   if(this.parts[key]?.userData.id===p[key]?.id)continue;
   if(this.parts[key]){const old=this.parts[key];this.root.remove(old);this.fans=this.fans.filter(f=>f.parent!==old);this.transitions=this.transitions.filter(t=>t.group!==old);old.traverse(o=>{o.geometry?.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){m.map?.dispose();m.dispose();}}});delete this.parts[key];}
   if(!p[key])continue;
   const factories={motherboard:'makeMotherboard',cpu:'makeCPU',ram:'makeRAM',gpu:'makeGPU',cooler:'makeCooler',storage:'makeStorage',psu:'makePSU'};
   const group=this[factories[key]](p[key]);group.userData.id=p[key].id;this.root.add(group);this.parts[key]=group;group.position.x=.65;this.transitions.push({group,start:performance.now()});
  }
  if(this.parts.cooler)this.parts.cooler.visible=!this.hideCooler;
 }
 setWiring(mode,connected,selected=null,showPorts=false){
  this.selectedCable=selected;this.showPorts=showPorts;
  const available=cablesFor(this.currentBuild||{}),active=mode==='auto'?available.map(c=>c.id):connected;
  const key=JSON.stringify([this.currentBuild,active]);
  if(this.wireKey!==key){
   this.wireKey=key;
   if(this.wires){this.wires.removeFromParent();this.wires.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
   this.wires=new THREE.Group();this.root.add(this.wires);
   for(const cable of available.filter(c=>active.includes(c.id))){
    for(let i=0;i<cable.strands;i++){
     const offset=(i-(cable.strands-1)/2)*cable.radius*2.15;
     const points=cable.points.map((p,n)=>new THREE.Vector3(p[0],p[1]+offset,p[2]+(n>0&&n<cable.points.length-1?offset*.30:0)));
     const curve=new THREE.CatmullRomCurve3(points,false,'centripetal');
     const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,44,cable.radius,6,false),mat(i%4===0?0x363e43:0x171d20,.76,.1));mesh.castShadow=true;this.wires.add(mesh);
    }
    const [x,y,z]=ports[cable.id].position;
    this.box(this.wires,.09,cable.id==='atx'?.46:.17,cable.id==='atx'?.13:.11,x+.075,y,z,0x242c30);
    if(['atx','eps','eps2','gpu1','gpu2'].includes(cable.id))for(const t of [.44,.65]){
     const curve=new THREE.CatmullRomCurve3(cable.points.map(p=>new THREE.Vector3(...p))),point=curve.getPoint(t);
     this.box(this.wires,.05,cable.strands*cable.radius*2.3,.055,...point.toArray(),0x424e53);
    }
   }
   // Short leads join the three front fans to the illustrative splitter.
   if(active.includes('frontFan'))for(const y of [1.7,3.96]){
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.4,y,1.96),new THREE.Vector3(-.75,y,1.72),new THREE.Vector3(-.75,2.84,1.72),new THREE.Vector3(-.4,2.84,1.96)]);
    this.wires.add(new THREE.Mesh(new THREE.TubeGeometry(curve,26,.014,6,false),mat(0x151d20,.8,.1)));
   }
  }
  if(!this.markerLayer){this.markerLayer=document.createElement('div');this.markerLayer.className='port-markers';this.container.append(this.markerLayer);}
  this.markerLayer.replaceChildren();this.markers=[];
  available.forEach((c,i)=>{const button=document.createElement('button');button.type='button';button.className='port-marker'+(c.id===selected?' target':'')+(active.includes(c.id)?' connected':'');button.dataset.port=c.id;button.setAttribute('aria-label','Разъём '+c.to);button.title=c.to;button.textContent=String(i+1);const label=document.createElement('span');label.textContent=c.to;button.append(label);this.markerLayer.append(button);this.markers.push({button,position:new THREE.Vector3(...ports[c.id].position)});});
  this.markerLayer.classList.toggle('visible',showPorts);
 }
 updateMarkers(){
  if(!this.showPorts||!this.markers)return;
  const width=this.container.clientWidth,height=this.container.clientHeight;
  for(const {button,position} of this.markers){const projected=position.clone().project(this.camera);button.style.left=(projected.x*.5+.5)*width+'px';button.style.top=(-projected.y*.5+.5)*height+'px';button.hidden=projected.z>1||Math.abs(projected.x)>1||Math.abs(projected.y)>1;}
 }
 view(name){
  const views={assembly:[8.3,5.4,7.4],rear:[3.4,4.1,-9.4],top:[4.8,10,5.8],cables:[-8.3,4.6,5.4]};
  this.camera.position.set(...(views[name]||views.assembly));this.controls.target.set(0,2.35,0);this.controls.update();this.rearPanel.visible=name!=='cables';if(this.markerLayer)this.markerLayer.hidden=['rear','cables'].includes(name);
 }
 makeFlows(){
  this.flowGroup=new THREE.Group();this.flowGroup.visible=false;this.root.add(this.flowGroup);
  const paths=[];for(let band=0;band<3;band++)for(let lane=0;lane<4;lane++){
   const y=1.65+band*1.12, x=-.38+lane*.24;
   const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(x,y,2.75),new THREE.Vector3(x,y,1.70),new THREE.Vector3(x+.30,y+.05,.9),new THREE.Vector3(x+.52,y+.24,-.35),new THREE.Vector3(x*.7+.20,3.94,-1.65),new THREE.Vector3(x*.7+.20,4.02,-2.80)]);
   paths.push(curve);
   const lineGeo=new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));const line=new THREE.Line(lineGeo,new THREE.LineBasicMaterial({color:0x91b9ed,transparent:true,opacity:.17,depthTest:false}));line.renderOrder=3;this.flowGroup.add(line);
   for(let n=0;n<5;n++){const mesh=new THREE.Mesh(new THREE.SphereGeometry(.027,6,5),new THREE.MeshBasicMaterial({color:0x99d8ef,transparent:true,opacity:.8,depthTest:false}));mesh.renderOrder=4;this.flowGroup.add(mesh);this.flowParticles.push({mesh,curve,t:n/5,band});}
  }
 }
 setOptions(options){Object.assign(this,options);this.glass.visible=!this.hideGlass;if(this.parts.cooler)this.parts.cooler.visible=!this.hideCooler;this.flowGroup.visible=this.airflow;this.markerLayer?.classList.toggle('visible',!!this.showPorts);}
 reset(){this.view('assembly');}
 zoom(factor){const offset=this.camera.position.clone().sub(this.controls.target);offset.multiplyScalar(factor);offset.setLength(THREE.MathUtils.clamp(offset.length(),4.2,19));this.camera.position.copy(this.controls.target).add(offset);this.controls.update();}
 resize(){const {width,height}=this.container.getBoundingClientRect();if(!width||!height)return;this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.renderer.setSize(width,height,false);}
 frame(time){
  const dt=Math.min((time-this.last)/1000||0,.05);this.last=time;this.controls.update();
  for(const f of this.fans){const fraction=f.kind==='front'?this.settings.front/100:f.kind==='rear'?this.settings.rear/100:f.kind==='cpu'?this.settings.cpuFan/100:(this.settings.gpuFan??60)/100;f.rotor.rotation.z-=dt*(this.running?fraction*12:0);}
  this.transitions=this.transitions.filter(t=>{const p=Math.min((time-t.start)/650,1);t.group.position.x=.65*(1-p)**3;return p<1;});
  if(this.airflow){const speed=this.running?(this.settings.front*.45+this.settings.rear*.55)/100:0;for(const f of this.flowParticles){f.t=(f.t+dt*.2*speed)%1;f.mesh.position.copy(f.curve.getPoint(f.t));f.mesh.material.color.set(f.t<.43?0x8edaf2:0xf1ad8c);f.mesh.visible=speed>0;}}
  this.updateMarkers();this.renderer.render(this.scene,this.camera);this.raf=requestAnimationFrame(this.frame);
 }
 dispose(){cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();this.controls.dispose();this.environment?.dispose();this.renderer.dispose();}
}

Object.assign(PCScene.prototype,modelMethods);
