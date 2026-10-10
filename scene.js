import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {resolve} from './catalog.js';

const C={metal:0x22232b,edge:0x484650,black:0x111218,silver:0x77777f,pcb:0x17282a,purple:0xbfa5ff};
const mat=(color,roughness=.5,metalness=.25)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
export class PCScene {
 constructor(container){
  this.container=container;this.parts={};this.fans=[];this.flowParticles=[];this.transitions=[];this.hideGlass=true;this.hideCooler=false;this.airflow=false;this.running=false;this.settings={front:60,rear:60,cpuFan:60};this.last=0;
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));this.renderer.setClearColor(0,0);this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.35;
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFShadowMap;
  container.replaceChildren(this.renderer.domElement);this.scene=new THREE.Scene();
  this.camera=new THREE.PerspectiveCamera(36,1,.1,70);this.camera.position.set(8.4,5.7,8.2);
  this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.target.set(0,2.3,0);this.controls.enableDamping=true;this.controls.dampingFactor=.08;this.controls.minDistance=6;this.controls.maxDistance=19;this.controls.maxPolarAngle=Math.PI*.51;this.controls.minPolarAngle=.32;this.controls.enablePan=false;this.controls.autoRotateSpeed=.55;
  this.scene.add(new THREE.HemisphereLight(0xe3d9ff,0x272036,3));
  const key=new THREE.DirectionalLight(0xf0eaff,4.8);key.position.set(4,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-5,right:5,top:7,bottom:-5});key.shadow.bias=-.0005;this.scene.add(key);
  const fill=new THREE.DirectionalLight(0xb39ae7,2.1);fill.position.set(-4,4,-3);this.scene.add(fill);
  const rim=new THREE.DirectionalLight(0xafd3ff,1.8);rim.position.set(2,3,-5);this.scene.add(rim);
  const interior=new THREE.PointLight(0xab8af5,3.5,7,1.5);interior.position.set(.9,3,1);this.scene.add(interior);
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
  const rotor=new THREE.Group();rotor.position.z=.11;fan.add(rotor);
  const bladeShape=new THREE.Shape();bladeShape.moveTo(.10,-.02);bladeShape.quadraticCurveTo(.24,-.19,.39,-.14);bladeShape.quadraticCurveTo(.45,-.05,.32,.07);bladeShape.lineTo(.1,.06);bladeShape.closePath();
  for(let i=0;i<9;i++){const b=new THREE.Mesh(new THREE.ShapeGeometry(bladeShape,5),new THREE.MeshStandardMaterial({color:0x777484,metalness:.35,roughness:.6,side:THREE.DoubleSide}));b.scale.setScalar(size);b.rotation.z=i/9*Math.PI*2;rotor.add(b);}
  const hub=new THREE.Mesh(new THREE.CircleGeometry(size*.115,24),mat(0x272832,.4,.35));hub.position.z=.005;rotor.add(hub);
  const rearHub=new THREE.Mesh(new THREE.CircleGeometry(size*.13,24),mat(0x6b6376));rearHub.position.z=-.08;rearHub.rotation.y=Math.PI;fan.add(rearHub);for(const angle of [0,Math.PI/2]){const support=this.box(fan,size*.76,size*.045,.035,0,0,-.095,0x6b6178);support.rotation.z=angle;}
  for(const sx of [-1,1])for(const sy of [-1,1]){const screw=new THREE.Mesh(new THREE.CircleGeometry(size*.026,8),mat(0x888491));screw.position.set(sx*size*.425,sy*size*.425,.063);fan.add(screw);}
  this.fans.push({rotor,kind,parent});return fan;
 }
 makeCase(){
  const g=new THREE.Group();this.root.add(g);this.caseGroup=g;
  // Case shell: open right side, motherboard tray opposite, front at +Z.
  this.box(g,2.2,.12,4.3,0,.31,0);this.box(g,2.2,.13,4.3,0,4.63,0);
  this.box(g,.07,4.2,4.3,-1.075,2.48,0,0x1e2028);
  this.box(g,2.2,.11,4.3,0,1.13,0,0x1d1e24);
  this.box(g,2.2,.8,.055,0,.73,2.12,C.black);
  this.box(g,2.2,.10,4.25,0,1.07,0,C.edge);
  for(const x of [-1.03,1.03])for(const z of [-2.1,2.1])this.box(g,.13,4.28,.13,x,2.48,z,0x34333d);
  for(const z of [-2.08,2.08])this.box(g,2.12,.13,.13,0,4.61,z,C.edge);
  for(const z of [-1.78,1.78])for(const x of [-.83,.83])this.box(g,.32,.22,.48,x,.15,z,0x111116);
  // Rear vent strips, expansion slot covers and I/O shield.
  this.box(g,2.1,.6,.065,0,1.44,-2.11,0x20212a);
  this.box(g,.45,2.5,.065,-.78,3,-2.11,0x32313a);
  for(let i=0;i<7;i++)this.box(g,.7,.047,.07,.08,1.5+i*.095,-2.15,0x53515d);
  for(let i=0;i<9;i++)this.box(g,.68,.025,.03,-.57,2.55+i*.11,-2.16,0x777480);
  // Front ventilated frame with three visible fans.
  for(const y of [1.7,2.83,3.96])this.fan(g,1.04,0,y,1.93,[0,0,0],'front');
  for(const x of [-.76,.76])this.box(g,.04,3.35,.05,x,2.83,2.105,0x56515e);
  for(let i=0;i<24;i++){this.box(g,.018,3.4,.014,-.78+i*.068,2.83,2.13,0x39333f);}
  this.fan(g,1.03,.28,3.95,-1.99,[0,Math.PI,0],'rear');
  // The top vent grid and power / USB controls.
  for(let i=0;i<18;i++)this.box(g,1.6,.009,.032,0,4.702,-1.3+i*.16,0x0c0c11);
  const power=this.cylinder(g,.065,.016,.55,4.71,1.79,0xa490c9);
  for(const x of [.05,.25])this.box(g,.09,.012,.16,x,4.71,1.79,0x09090d);
  this.text(g,'PCmaker',.79,.16,1.075,.79,.15,[0,Math.PI/2,0],'#b1a1c8');
  this.lightStrip(g,.019,.03,3.6,1.109,1.075,0,0x9670d0);
  // Tempered side glass can be shown, but the default gives an unobstructed view.
  this.glass=new THREE.Mesh(new THREE.PlaneGeometry(4.06,4.12),new THREE.MeshPhysicalMaterial({color:0xaaa1b8,metalness:0,roughness:.1,transparent:true,opacity:.15,side:THREE.DoubleSide,depthWrite:false}));this.glass.rotation.y=Math.PI/2;this.glass.position.set(1.12,2.5,0);this.glass.visible=false;g.add(this.glass);
  for(const y of [.48,4.5])for(const z of [-1.98,1.98]){const s=new THREE.Mesh(new THREE.SphereGeometry(.038,10,8),mat(0x98919f));s.position.set(1.135,y,z);g.add(s);}
 }
 makeMotherboard(p){
  const g=new THREE.Group();this.box(g,.055,2.93,2.42,-.94,2.75,-.62,0x223234);
  // PCB routes, contacts and rows of small capacitors.
  for(let i=0;i<23;i++){this.box(g,.01,.012,.8+(i%3)*.22,-.901,1.48+i*.113,-.62+(i%4)*.12,0x475346);}
  this.box(g,.12,.6,.68,-.85,3.44,-.55,0x353741);this.box(g,.014,.45,.52,-.78,3.44,-.55,0xb2a9a0);
  for(const z of [-1.56,.73]){this.box(g,.23,1.45,.32,-.80,3.43,z,C.metal);for(let j=0;j<12;j++)this.box(g,.012,.017,.30,-.676,2.8+j*.104,z,0x54515a);}
  this.box(g,.17,.38,.73,-.78,1.85,.23,0x3a3644);
  for(let i=0;i<4;i++)this.box(g,.15,1.24,.049,-.83,3.45,.03+i*.15,0x13151b);
  for(let i=0;i<3;i++)this.box(g,.12,.09,1.25,-.83,2.15-i*.30,-.64,0x76717d);
  for(let i=0;i<8;i++){const cap=this.cylinder(g,.042,.14,-.76,2.5+i*.16,-1.1,0x93909b);cap.rotation.z=Math.PI/2;}
  this.text(g,p.short,1.28,.14,-.64,2.48,-.54,[0,Math.PI/2,0],'#b5b4c1');
  return g;
 }
 makeCPU(p){const g=new THREE.Group();this.box(g,.045,.49,.49,-.747,3.44,-.55,0x245247);this.box(g,.04,.405,.405,-.716,3.44,-.55,0xb4b1b4,.28);this.text(g,'AMD',.21,.07,-.692,3.56,-.55,[0,Math.PI/2,0],'#34313a');this.text(g,p.short,.36,.14,-.691,3.44,-.55,[0,Math.PI/2,0],'#312e37');return g;}
 makeRAM(p){const g=new THREE.Group();for(let i=0;i<p.modules;i++){const z=.16+i*.30;this.box(g,.29,1.25,.075,-.70,3.44,z,0x26242e);this.box(g,.025,1.12,.082,-.54,3.44,z,0x625b72);for(let j=0;j<6;j++)this.box(g,.01,.085,.01,-.52,2.99+j*.17,z+.04,0xbbb0c6);this.lightStrip(g,.038,1.17,.076,-.526,3.44,z);this.text(g,'FURY '+p.memory,.86,.10,-.506,3.43,z,[0,Math.PI/2,Math.PI/2],'#ffffff');}return g;}
 makeGPU(p){const g=new THREE.Group();const len=p.length/100;const center=-1.78+len/2;this.box(g,1.44,.33,len,.035,2.04,center,0x272830);this.box(g,1.43,.045,len,.035,2.23,center,0x62616a);this.box(g,.065,.32,len,.79,2.055,center,0x383642);for(let i=0;i<18;i++)this.box(g,1.2,.008,.035,.025,2.258,-1.72+i*(len-.1)/18,0x42414b);this.text(g,p.short.toUpperCase(),Math.min(len-.15,2.75),.17,.831,2.07,center,[0,Math.PI/2,0],'#eeeeff');this.lightStrip(g,.028,.03,len-.18,.83,1.93,center,0xb9a2f5);for(let i=0;i<p.fans;i++){const z=-1.78+(i+.5)*len/p.fans;this.fan(g,Math.min(.96,len/p.fans-.06),.03,1.826,z,[Math.PI/2,0,0],'gpu',false);}for(let i=0;i<p.connectors;i++)this.box(g,.15,.09,.19,.40,2.315,.13+i*.24,0x101117);
  // Braided power cable: simple curved individual strands.
  for(let i=0;i<5;i++){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(.40+i*.025,2.34,.2),new THREE.Vector3(.78+i*.025,2.5,.4),new THREE.Vector3(.83+i*.025,1.75,.7),new THREE.Vector3(.67+i*.025,1.13,.9)]);const m=new THREE.Mesh(new THREE.TubeGeometry(curve,20,.014,5,false),mat(0x2b2535));g.add(m);}
  return g;
 }
 makeCooler(p){const g=new THREE.Group();for(let tower=0;tower<p.towers;tower++){const z=-.65+tower*.55;this.box(g,.90,1.18,.45,-.24,3.45,z,0x555561);for(let i=0;i<32;i++)this.box(g,1.03,.013,.47,-.19,2.87+i*.036,z,0x8b8993,.32);this.box(g,1.05,.055,.49,-.19,4.065,z,C.black);for(let i=0;i<3;i++){const pipe=this.cylinder(g,.029,1.15,-.29+i*.20,3.47,z,0xa98c71);}}
  this.fan(g,1.14,-.15,3.45,p.towers>1?.53:-.13,[0,0,0],'cpu',false);this.text(g,'DEEPCOOL',.66,.12,-.18,4.097,-.60,[-Math.PI/2,0,Math.PI/2],'#b4c2c5');return g;}
 makeStorage(p){const g=new THREE.Group();this.box(g,.055,.23,.79,-.79,2.63,-.90,0x263530);this.text(g,p.short,.70,.15,-.752,2.63,-.90,[0,Math.PI/2,0],'#eee9df','#25202a');return g;}
 makePSU(p){const g=new THREE.Group();this.box(g,1.45,.66,1.45,.17,.73,-1.08,0x17181f);this.text(g,p.short,1.23,.27,.909,.73,-1.08,[0,Math.PI/2,0],'#b5a9c9','#1a1922');return g;}
 setBuild(build){
  const p=resolve(build);for(const key of ['motherboard','cpu','ram','gpu','cooler','storage','psu']){
   if(this.parts[key]?.userData.id===p[key]?.id)continue;
   if(this.parts[key]){const old=this.parts[key];this.root.remove(old);this.fans=this.fans.filter(f=>f.parent!==old);this.transitions=this.transitions.filter(t=>t.group!==old);old.traverse(o=>{o.geometry?.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){m.map?.dispose();m.dispose();}}});delete this.parts[key];}
   if(!p[key])continue;
   const factories={motherboard:'makeMotherboard',cpu:'makeCPU',ram:'makeRAM',gpu:'makeGPU',cooler:'makeCooler',storage:'makeStorage',psu:'makePSU'};
   const group=this[factories[key]](p[key]);group.userData.id=p[key].id;this.root.add(group);this.parts[key]=group;group.position.x=.65;this.transitions.push({group,start:performance.now()});
  }
  if(this.parts.cooler)this.parts.cooler.visible=!this.hideCooler;
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
 setOptions(options){Object.assign(this,options);this.glass.visible=!this.hideGlass;if(this.parts.cooler)this.parts.cooler.visible=!this.hideCooler;this.flowGroup.visible=this.airflow;}
 reset(){this.camera.position.set(8.4,5.7,8.2);this.controls.target.set(0,2.3,0);this.controls.update();}
 zoom(factor){const offset=this.camera.position.clone().sub(this.controls.target);offset.multiplyScalar(factor);offset.setLength(THREE.MathUtils.clamp(offset.length(),6,19));this.camera.position.copy(this.controls.target).add(offset);this.controls.update();}
 resize(){const {width,height}=this.container.getBoundingClientRect();if(!width||!height)return;this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.renderer.setSize(width,height,false);}
 frame(time){
  const dt=Math.min((time-this.last)/1000||0,.05);this.last=time;this.controls.update();
  for(const f of this.fans){const fraction=f.kind==='front'?this.settings.front/100:f.kind==='rear'?this.settings.rear/100:f.kind==='cpu'?this.settings.cpuFan/100:(this.settings.gpuFan??60)/100;f.rotor.rotation.z-=dt*(this.running?fraction*12:0);}
  this.transitions=this.transitions.filter(t=>{const p=Math.min((time-t.start)/650,1);t.group.position.x=.65*(1-p)**3;return p<1;});
  if(this.airflow){const speed=this.running?(this.settings.front*.45+this.settings.rear*.55)/100:0;for(const f of this.flowParticles){f.t=(f.t+dt*.2*speed)%1;f.mesh.position.copy(f.curve.getPoint(f.t));f.mesh.material.color.set(f.t<.43?0x8edaf2:0xf1ad8c);f.mesh.visible=speed>0;}}
  this.renderer.render(this.scene,this.camera);this.raf=requestAnimationFrame(this.frame);
 }
 dispose(){cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();this.controls.dispose();this.renderer.dispose();}
}
