import {makeAIO} from './aio-model.js';
import * as THREE from 'three';
import {hardwareFinish} from './surfaces.js';
import {portsFor} from './wiring.js';
import {GPU_TOP,PSU_REAR,psuFront,boardBottom} from './layout.js';
import {makeChassis} from './case-model.js';
import {makeTowerCooler} from './cooler-model.js';
import {makeDetailedGPU} from './gpu-model.js';

const black=0x131619,steel=0x353b40,silver=0x899296,pcb=0x151b19;
const material=(color,metalness=.3,roughness=.5)=>hardwareFinish(new THREE.MeshStandardMaterial({color,metalness,roughness}));

// Small repeated solids use instances so close-up detail stays practical on a school PC.
export function batchSolids(group){
 group.updateMatrixWorld(true);const groups=new Map(),inverse=group.matrixWorld.clone().invert();
 group.traverse(mesh=>{
  if(!mesh.isMesh||mesh.isInstancedMesh||mesh.material.map||!['BoxGeometry','CylinderGeometry'].includes(mesh.geometry.type))return;
  for(let p=mesh;p&&p!==group;p=p.parent)if(p.userData.animated)return;
  const m=mesh.material,p=mesh.geometry.parameters,type=mesh.geometry.type;
  if(type==='CylinderGeometry'&&p.radiusTop!==p.radiusBottom)return;
  const key=[type,m.color.getHex(),m.metalness,m.roughness,m.emissive.getHex(),m.emissiveIntensity].join(':');
  if(!groups.has(key))groups.set(key,{material:m,items:[],type});
  const transform=inverse.clone().multiply(mesh.matrixWorld);
  transform.multiply(new THREE.Matrix4().makeScale(...(type==='BoxGeometry'?[p.width,p.height,p.depth]:[p.radiusTop,p.height,p.radiusTop])));
  groups.get(key).items.push({mesh,transform});
 });
 for(const {material:source,items,type} of groups.values()){
  if(items.length<3)continue;
  const geo=type==='BoxGeometry'?new THREE.BoxGeometry(1,1,1):new THREE.CylinderGeometry(1,1,1,16);
  const instance=new THREE.InstancedMesh(geo,source.clone(),items.length);
  items.forEach(({mesh,transform},i)=>{instance.setMatrixAt(i,transform);mesh.removeFromParent();mesh.geometry.dispose();mesh.material.dispose();});
  instance.castShadow=true;instance.receiveShadow=true;instance.computeBoundingSphere();group.add(instance);
 }
}

function boardTexture(name){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const c=canvas.getContext('2d');c.scale(512/1536,512/1800);
 c.fillStyle='#151b19';c.fillRect(0,0,1536,1800);
 let seed=913;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 // Deterministic etched traces, solder-mask weave, silkscreen and test pads.
 for(let i=0;i<2200;i++){c.fillStyle=rand()>.5?'#1b211f':'#121714';c.fillRect(rand()*1536,rand()*1800,1,rand()*18+2);}
 for(let i=0;i<230;i++){
  const x=Math.round(rand()*150)*10,y=Math.round(rand()*160)*10,d=rand()>.5?1:-1,len=40+rand()*200;
  c.strokeStyle=i%5===0?'#52604a':'#303c31';c.lineWidth=i%3===0?2:1;c.beginPath();c.moveTo(x,y);c.lineTo(x+len,y);c.lineTo(x+len+24*d,y+24);c.lineTo(x+len+24*d,y+70+rand()*130);c.stroke();
  c.fillStyle='#8b9272';c.beginPath();c.arc(x,y,2.7,0,Math.PI*2);c.fill();
 }
 c.strokeStyle='#818780';c.lineWidth=2;
 for(let i=0;i<90;i++){const x=35+rand()*1460,y=35+rand()*1730;c.strokeRect(x,y,14+rand()*24,7+rand()*17);c.fillStyle='#b2b6a9';c.font='10px monospace';c.fillText((i%2?'R':'C')+(100+i),x,y-4);}
 c.fillStyle='#b9bdb6';c.font='bold 30px Arial';c.fillText(name,90,1010);c.font='17px monospace';
 for(const [label,x,y] of [['PCI_E1',110,1260],['M2_1 · PCIe',175,840],['HD AUDIO',70,1755],['JUSB1',780,1755],['JFP1',1280,1755],['DDR / DUAL CHANNEL',1210,300],['ATX_PWR1',1390,780],['CORE BOOST',360,380],['CPU_PWR1',270,75],['SYS_FAN',1320,1130]])c.fillText(label,x,y);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=2;return tex;
}

// Cut-outs in a small alpha texture keep the front filters light to render.
function frontFilter(kind,white=false){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const c=canvas.getContext('2d');
 c.fillStyle=white?'#c2c8ca':'#41484c';c.fillRect(0,0,512,512);
 if(kind==='pop'){
  for(let row=0;row<14;row++)for(let col=0;col<8;col++){
   const x=col*64+(row%2?32:0),y=row*38;
   c.fillStyle=(white?['#a6afb4','#c6cccf','#d4d9dc']:['#343b3e','#42494c','#50565a'])[(row+col)%3];c.beginPath();c.moveTo(x-32,y);c.lineTo(x+32,y);c.lineTo(x,y+38);c.closePath();c.fill();
  }
 }
 c.globalCompositeOperation='destination-out';
 if(kind==='triangle'){
  for(let row=0;row<32;row++)for(let col=0;col<14;col++){
   const x=col*36+4,y=row*16+2,flip=(row+col)%2;c.beginPath();c.moveTo(x,flip?y+12:y);c.lineTo(x+28,flip?y+12:y);c.lineTo(x+14,flip?y:y+12);c.closePath();c.fill();
  }
 }else for(let row=0;row<100;row++)for(let col=0;col<70;col++){c.beginPath();c.arc(col*7.5+(row%2?3.75:0),row*5.2,1.8,0,Math.PI*2);c.fill();}
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=2;return map;
}

export const modelMethods={
 makeConceptFront(g,p){
  const color=p.color==='white'?0xbec6cf:0x313940;
  for(const x of [-1.02,1.02])this.box(g,.12,4.24,.15,x,2.48,2.18,color);
  for(const y of [.43,4.52])this.box(g,2.10,.12,.16,0,y,2.18,color);
  if(p.concept==='compact'){
   for(let i=0;i<17;i++){const bar=this.box(g,1.89,.026,.04,0,.66+i*.217,2.23,0x657071);bar.rotation.z=.06;}
   for(const x of [-.98,.98])this.lightStrip(g,.02,3.65,.02,x,2.58,2.27,0xf0a66b);
  }else{
   if(p.concept!=='panorama'){const panel=new THREE.Mesh(new THREE.PlaneGeometry(1.92,3.94),new THREE.MeshStandardMaterial({map:frontFilter('mesh',p.color==='white'),transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false}));panel.position.set(0,2.48,2.24);g.add(panel);}
   if(p.concept==='panorama')this.lightStrip(g,1.92,.025,.015,0,.58,2.27);
   if(p.concept==='dual')for(const x of [-.85,.85])this.box(g,.055,3.75,.09,x,2.49,2.29,color);
  }
  this.text(g,'PCmaker / '+p.short,.96,.07,0,.47,2.27);
 },
 makeCaseFront(g,p){
  if(p.id==='cc560'){
   this.box(g,1.35,4.19,.09,0,2.49,2.24,0x24292d);
   for(const side of [-1,1]){
    const bevel=this.box(g,.16,4.19,.075,side*.74,2.49,2.205,0x343b40);bevel.rotation.y=side*.42;
    this.box(g,.12,4.19,.14,side*1.02,2.49,2.18,0x242a2e);
    for(let i=0;i<56;i++)this.box(g,.17,.012,.014,side*.90,.44+i*.073,2.19,0x505a5f);
    for(let i=0;i<4;i++)this.box(g,.008,4.1,.016,side*(.835+i*.04),2.49,2.198,0x3c474c);
   }
   this.text(g,'DEEPCOOL',.37,.06,0,.67,2.292,[0,0,0],'#899390');
  }else{
   const pop=p.frontStyle==='pop'||p.id==='pop-air',mesh=p.frontStyle==='mesh',bottom=pop?1.36:.52,top=4.49,height=top-bottom;
   for(const side of [-1,1])this.box(g,pop?.10:.17,4.20,.16,side*(pop?1.02:.99),2.49,2.20,0x252b2e);
   this.box(g,2.05,pop?.09:.17,.16,0,4.55,2.20,0x282f33);
   this.box(g,2.05,pop?1.00:.16,.16,0,pop?.86:.44,2.20,0x242a2e);
   const filter=new THREE.Mesh(new THREE.PlaneGeometry(pop?1.94:1.77,height),new THREE.MeshStandardMaterial({map:frontFilter(pop?'pop':mesh?'mesh':'triangle',p.color==='white'),metalness:.55,roughness:.57,alphaTest:.4,side:THREE.DoubleSide}));
   filter.position.set(0,(bottom+top)/2,2.293);g.add(filter);
   if(pop){
    this.box(g,1.97,.015,.015,0,1.365,2.292,0x06090a);
    this.box(g,.23,.075,.045,.89,.41,2.294,0x111719);
    this.text(g,'fractal',.31,.065,.65,.60,2.286,[0,0,0],'#abb3b2');
    // Separate lower drive bay door and two mounting shelves behind it.
    for(const y of [.65,1.00])this.box(g,1.70,.025,.28,0,y,2.00,0x353d41);
   }else{
    this.text(g,(p.brand||'CORSAIR').toUpperCase(),.31,.055,0,.63,2.30,[0,0,0],'#a7b0b3');
    if(!mesh)this.box(g,.04,.15,.01,-.98,4.31,2.288,0xb4b658);
   }

  }
 },
 rod(g,a,b,r,color=steel){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,delta.length(),12),material(color,.65,.35));mesh.position.copy(start.add(end).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());g.add(mesh);return mesh;},
 screw(g,x,y,z,axis='x',radius=.033){
  const head=this.cylinder(g,radius,.018,x,y,z,0x798287);if(axis==='x')head.rotation.z=Math.PI/2;if(axis==='z')head.rotation.x=Math.PI/2;
  if(axis==='x'){this.box(g,.005,.008,radius*1.2,x+.012,y,z,0x181b1d);this.box(g,.005,radius*1.2,.008,x+.013,y,z,0x181b1d);}
  else if(axis==='y'){this.box(g,radius*1.2,.005,.008,x,y+.012,z,0x181b1d);this.box(g,.008,.005,radius*1.2,x,y+.013,z,0x181b1d);}
  else{this.box(g,radius*1.2,.008,.005,x,y,z-.013,0x181b1d);this.box(g,.008,radius*1.2,.005,x,y,z-.012,0x181b1d);}
 },
 headerSocket(g,id,rows,cols,spacing=.049){
  const port=portsFor(this.currentBuild||{})[id],socket=new THREE.Group();g.add(socket);g=socket;socket.position.set(...port.position);if(port.axis==='y'||port.axis==='-y')socket.rotation.z=port.axis==='y'?Math.PI/2:-Math.PI/2;const [x,y,z]=[0,0,0],w=cols*spacing+.045,h=rows*spacing+.035;
  // Soldered header pedestal reaches the PCB; the housing cannot float above it.
  if(!port.axis){const back=-.909-port.position[0],front=-.105;this.box(g,front-back,w,h+.055,(back+front)/2,y,z-.025,black);}
  this.box(g,.13,w,h,x-.04,y,z,black);
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
   if(['usb3','usb2','audio','panel'].includes(id)&&row===rows-1&&col===cols-1)continue;
   const py=y+(col-(cols-1)/2)*spacing,pz=z+(row-(rows-1)/2)*spacing;
   this.box(g,.008,.035,.035,x+.031,py,pz,0x020404);
   this.box(g,.012,.010,.010,x+.038,py,pz,0x8d8660);
  }
  this.box(g,.035,.07,.025,x+.035,y,z+h/2,steel);
 },
 rearPort(g,type,x,y,width=.20,height=.12,color=0x19252d,label=''){
  const z=-2.145;
  if(type==='round'){
   const ring=new THREE.Mesh(new THREE.TorusGeometry(width/2,.014,8,20),material(color,.65,.32));ring.position.set(x,y,z-.022);g.add(ring);
   const hole=new THREE.Mesh(new THREE.CircleGeometry(width/2-.014,20),material(0x030506));hole.position.set(x,y,z-.023);hole.rotation.y=Math.PI;g.add(hole);
  }else{
   this.box(g,width+.03,height+.03,.045,x,y,z,0x878e8e);this.box(g,width,height,.05,x,y,z-.015,0x030505);
   if(type==='usb'){this.box(g,width*.76,height*.27,.012,x,y-.02,z-.045,color);for(let n=0;n<4;n++)this.box(g,.012,.014,.01,x-width*.30+n*width*.2,y+.008,z-.048,0xb3a777);}
   if(type==='lan'){this.box(g,width*.42,height*.18,.008,x,y-height*.36,z-.045,0x303735);for(let n=0;n<8;n++)this.box(g,.009,.03,.009,x-width*.32+n*width*.09,y+.012,z-.045,0xbaae79);this.box(g,.025,.015,.01,x-width*.40,y+height*.37,z-.05,0x8cb55a);}
   if(type==='video'){this.box(g,width*.77,height*.24,.009,x,y,z-.045,0x262e31);for(let n=0;n<10;n++)this.box(g,.007,.015,.008,x-width*.33+n*width*.073,y-.012,z-.047,0xb8aa78);}
  }
  if(label)this.text(g,label,.34,.055,x,y-height/2-.05,z-.06,[0,Math.PI,0],'#a2adae');
 },
 makeCase(p){const g=makeChassis.call(this,p);batchSolids(g);},
 makeMotherboard(p){
  const g=new THREE.Group(),bottom=boardBottom(p),height=4.215-bottom,cy=(4.215+bottom)/2,small=p.form==='Micro-ATX';this.box(g,.055,height,2.42,-.94,cy,-.62,pcb);
  const surface=new THREE.Mesh(new THREE.PlaneGeometry(2.42,height),new THREE.MeshStandardMaterial({map:boardTexture((p.brand||'MSI')+' / '+p.short),roughness:.63,metalness:.20}));surface.rotation.y=Math.PI/2;surface.position.set(-.909,cy,-.62);g.add(surface);
  this.box(g,.12,.60,.68,-.845,3.44,-.55,0x242b2c);this.box(g,.02,.50,.58,-.774,3.44,-.55,0x7d8586);
  this.box(g,.01,.425,.475,-.76,3.44,-.55,0x1b2421);this.rod(g,[-.724,3.14,-.88],[-.724,3.69,-.88],.016,0xaab0b1);
  for(const z of [-1.40,-.05])for(const y of [3.10,3.78])this.screw(g,-.73,y,z);
  // VRM MOSFETs, chokes and solid capacitors surrounding the socket.
  for(let i=0;i<10;i++){const y=2.76+i*.135;this.box(g,.10,.084,.13,-.824,y,-1.16,0x363e3f);this.box(g,.022,.065,.085,-.902,y,-.98,0x111416);this.text(g,'R22',.07,.04,-.763,y,-1.16,[0,Math.PI/2,Math.PI/2],'#9ca3a0');}
  for(let i=0;i<15;i++){const cap=this.cylinder(g,.033,.10,-.829,2.72+i*.095,-1.31,0x929a96);cap.rotation.z=Math.PI/2;this.box(g,.006,.004,.044,-.773,2.72+i*.095,-1.31,0x343a36);}
  // Sculpted VRM heatsink fins and I/O cover.
  this.box(g,.23,1.52,.32,-.78,3.38,-1.59,0x2d3438);for(let i=0;i<21;i++)this.box(g,.025,.022,.35,-.655,2.70+i*.066,-1.59,0x646f73);
  this.text(g,p.short,.90,.085,-.634,3.43,-1.59,[0,Math.PI/2,Math.PI/2],'#b1b8b8');
  for(let i=0;i<10;i++)this.box(g,.15,.038,.66,-.80,4.0+i*.013,-.61,0x4c585d);
  for(let i=0;i<(p.slots||4);i++){const z=(p.slots===2?.18:0.03)+i*(p.slots===2?.30:.15);this.box(g,.15,1.34,.073,-.826,3.43,z,0x0a0d0e);this.box(g,.008,1.23,.022,-.744,3.43,z,0x736e42);for(const y of [2.76,4.10])this.box(g,.13,.08,.084,-.82,y,z,0x434d4d);}
  for(let i=0;i<(small?2:3);i++){const y=GPU_TOP-.055-i*.31;this.box(g,.11,.079,1.30,-.83,y,-.72,i===0?0x919c9f:0x242b2a);this.box(g,.016,.029,1.20,-.764,y,-.72,0x060a08);this.box(g,.09,.13,.08,-.80,y,-.03,0x7c8787);}
  for(let i=0;i<5;i++){this.box(g,.012,.16,.20,-.90,Math.max(bottom+.18,1.55)+(i%2)*.8,-1.4+i*.43,0x080d0d);for(let k=0;k<6;k++)this.box(g,.01,.011,.027,-.896,Math.max(bottom+.12,1.49)+(i%2)*.8+k*.027,-1.53+i*.43,0x979e8c);}
  for(let i=0;i<75;i++){const y=bottom+.12+(i%11)*(small?.10:.15),z=-1.71+Math.floor(i/11)*.28;this.box(g,.013,.026,.048,-.897,y,z,0x655f43);this.box(g,.016,.018,.016,-.893,y,z+.031,0xa6aaa0);}
  for(const y of [bottom+.14,2.6,4.12])for(const z of [-1.72,.55])this.screw(g,-.878,y,z,'x',.038);
  this.box(g,.18,.41,.64,-.80,1.98,.25,0x31393c);for(let i=0;i<7;i++)this.box(g,.023,.020,.54,-.695,1.82+i*.049,.25,0x627078);
  this.text(g,p.brand||'MSI',.27,.09,-.677,2.0,.25,[0,Math.PI/2,0],'#c0c5c3');
  const battery=this.cylinder(g,.095,.024,-.864,Math.max(bottom+.15,1.75),-1.35,0xc4c6c2);battery.rotation.z=Math.PI/2;this.text(g,'CR2032',.14,.035,-.842,Math.max(bottom+.15,1.75),-1.35,[0,Math.PI/2,0],'#444b4c');
  for(let i=0;i<(p.id==='b650'?4:6);i++){const y=Math.max(bottom+.1,1.80)+(i%3)*.12,z=.52+Math.floor(i/3)*.13;this.box(g,.13,.08,.10,-.83,y,z,0x181f1f);this.box(g,.008,.043,.063,-.76,y,z,0x050706);}
  for(const [id,rows,cols] of [['atx',2,12],['eps',2,4],['cpuFan',1,4],['pump',1,4],['frontFan',1,4],['rearFan',1,4],['usb3',2,10],['usb2',2,5],['audio',2,5],['panel',2,5]])this.headerSocket(g,id,rows,cols,id==='atx'?.038:.042);
  if((p.epsConnectors??(p.id==='b650'?2:1))>1)this.headerSocket(g,'eps2',2,(p.cpuPowerPinCounts?.[1]||8)/2,.042);if(p.usbCHeader)this.headerSocket(g,'usbC',2,10,.02);
  this.makeRearIO(g,p);batchSolids(g);return g;
 },
 makeRearIO(g,p){
  const panel=new THREE.Group();g.add(panel);g=panel;panel.scale.y=.86;panel.position.y=.65;
  // Port counts follow the catalog motherboard; placement remains a schematic.
  this.box(g,.52,2.06,.038,-.64,3.39,-2.12,0x3a4246);
  const x=-.64;
  if(p.ports?.length){
   const entries=p.ports.filter(port=>typeof port==='object'&&port.location==='rear'),rows=Math.ceil(entries.reduce((n,port)=>n+(port.count||1),0)/2),spacing=Math.min(.20,1.70/Math.max(1,rows-1));let index=0;
   for(const port of entries)for(let n=0;n<(port.count||1);n++){const xx=x+(index%2-.5)*.24,yy=4.20-Math.floor(index/2)*spacing;index++;const type=/audio|jack|antenna|wifi|ps2/i.test(port.type)?'round':/lan|ethernet|rj45/i.test(port.type)?'lan':/hdmi|display|dp|vga/i.test(port.type)?'video':'usb';this.rearPort(g,type,xx,yy,type==='round'?.07:port.type==='spdif'?.09:.17,type==='lan'?.13:.065,0x43535e);}
   return;
  }
  if(p.id==='b550')this.rearPort(g,'round',x,4.21,.13,.13,0x75638f,'PS/2');
  else this.text(g,'PRO B650-S WIFI',.40,.06,x,4.29,-2.18,[0,Math.PI,0],'#b3bfc0');
  for(const [i,label] of ['DP','HDMI'].entries())this.rearPort(g,'video',x,4.03-i*.17,.25,.075,0,label);
  for(let i=0;i<7;i++){const column=i%2,row=Math.floor(i/2),color=p.id==='b650'?(i<4?0x39799c:0xa6403b):(i<4?0x212726:i<6?0x39799c:0xa6403b);this.rearPort(g,'usb',x+(column-.5)*.25,3.62-row*.16,.16,.08,color);}
  this.rearPort(g,'usb',x+.12,3.14,.115,.052,0x181d21,'USB-C');
  this.rearPort(g,'lan',x,2.95,.17,.16,0,'LAN');
  for(let i=0;i<6;i++)this.rearPort(g,'round',x-.11+(i%2)*.22,2.75-Math.floor(i/2)*.12,.074,.074,[0x577ab5,0x353a3d,0x7aad72,0xc9bd97,0xc26d76,0xa58854][i]);
  if(p.id==='b650')for(const xx of [x-.11,x+.11]){this.rearPort(g,'round',xx,2.36,.060,.06,0xa6965a);this.text(g,'Wi-Fi',.16,.047,xx,2.29,-2.19,[0,Math.PI,0],'#b9b4a1');}
  this.box(g,.05,.035,.025,-.44,4.24,-2.17,0x929a9c);this.text(g,'FLASH BIOS',.25,.045,-.61,4.4,-2.17,[0,Math.PI,0],'#b1babb');
 },
 makeCPU(p){
  const g=new THREE.Group(),intel=p.brand==='Intel',height=intel?.62:.49;
  this.box(g,.045,height,.49,-.747,3.44,-.55,0x294234);this.box(g,.04,height-.065,.405,-.716,3.44,-.55,0xb9bebe,.27);
  for(const y of [3.44-height/2,3.44+height/2])for(let i=0;i<9;i++)this.box(g,.009,.018,.014,-.721,y,-.74+i*.047,0x9b8c50);
  if(p.socket==='AM5')for(const y of [3.25,3.63])for(const z of [-.71,-.39])this.box(g,.047,.040,.055,-.715,y,z,0x2c4036);
  this.text(g,p.brand,.19,.060,-.694,3.56,-.55,[0,Math.PI/2,0],'#333b39');this.text(g,p.short,.36,.08,-.694,3.45,-.55,[0,Math.PI/2,0],'#313b3a');this.text(g,p.socket,.27,.028,-.694,3.36,-.55,[0,Math.PI/2,0],'#596361');
  batchSolids(g);return g;
 },
 makeRAM(p){
  const g=new THREE.Group(),height=(p.height||34)/100,edge=-.84+height,center=-.84+height/2;
  for(let i=0;i<p.modules;i++){const z=p.modules>2?.03+i*.15:.18+i*.30;
   this.box(g,height,1.29,.045,center,3.43,z,0x17231c);this.box(g,height-.035,1.19,.069,center+.012,3.46,z,0x22292c);
   for(let j=0;j<8;j++){this.box(g,.12,.095,.020,center,2.96+j*.14,z+.044,0x0b1010);this.box(g,.02,.044,.076,edge+.003,2.94+j*.147,z,0x424d52);}
   for(let j=0;j<30;j++)this.box(g,.059,.018,.048,-.83,2.84+j*.038,z,0xb5a661);
   this.label(g,p,.88,Math.min(.20,height-.06),center,3.46,z+.057,[0,0,Math.PI/2]);this.text(g,p.memory,.27,.035,center,2.93,z+.057,[0,0,0],'#89928f');
  }batchSolids(g);return g;
 },
 makeGPU(p){const g=makeDetailedGPU.call(this,p);batchSolids(g);return g;},
 makeCooler(p){const g=(p.type==='aio'?makeAIO:makeTowerCooler).call(this,p);batchSolids(g);return g;},
 makeStorage(p){
  const g=new THREE.Group();this.box(g,.029,.22,.80,-.797,2.62,-.90,0x1d3026);
  for(let i=0;i<3;i++)this.box(g,.022,.16,.17,-.771,2.62,-1.15+i*.23,0x121819);
  this.label(g,p,.65,.19,-.754,2.62,-.92,[0,Math.PI/2,0],true);
  for(let i=0;i<9;i++)this.box(g,.035,.012,.035,-.787,2.536+i*.020,-1.301,0xb4a168);
  this.screw(g,-.762,2.62,-.50,'x',.027);batchSolids(g);return g;
 },
 makePSU(p){
  const g=new THREE.Group(),front=psuFront(p),length=front-PSU_REAR,center=(front+PSU_REAR)/2;this.box(g,1.46,.68,length,.10,.72,center,0x151c20);
  this.label(g,p,Math.min(1.16,length-.12),.46,.832,.75,center);this.text(g,(p.certification||p.efficiency||'80 PLUS')+' / '+p.watts+' W',.91,.047,.834,.46,center,[0,Math.PI/2,0],'#8a8e78');
  // IEC C14 inlet, rocker switch and rear exhaust grille.
  this.box(g,.36,.24,.055,.48,.72,-2.12,0x343d41);this.box(g,.29,.18,.062,.48,.72,-2.135,0x060a0b);
  for(const [x,y] of [[.40,.68],[.56,.68],[.48,.77]])this.box(g,.018,.051,.072,x,y,-2.154,0xa6aa9d);
  this.box(g,.11,.15,.042,.18,.73,-2.146,0x080c0e);this.text(g,'I  O',.10,.047,.18,.74,-2.174,[0,Math.PI,0],'#d1d6d2');
  for(let i=0;i<11;i++)for(let j=0;j<5;j++)this.box(g,.029,.028,.007,-.57+i*.046,.52+j*.083,PSU_REAR-.007,0x020708);
  for(const x of [-.58,.76])for(const y of [.44,.99])this.screw(g,x,y,-2.10,'z',.026);
  if(p.modular||p.id==='a850'){
   for(let i=0;i<7;i++){const x=-.42+(i%4)*.30,y=.61+Math.floor(i/4)*.22;this.box(g,.22,.13,.055,x,y,front+.012,0x303a3d);this.box(g,.17,.08,.012,x,y,front+.043,0x020606);for(let j=0;j<4;j++)this.box(g,.017,.012,.015,x-.058+j*.04,y,front+.05,0x998d61);}
   this.text(g,'MB / CPU / PCIe',1.18,.08,.08,.97,front+.052,[0,0,0],'#9caaaa');
   if(p.connector16pin){this.box(g,.18,.073,.036,.50,.84,front+.018,0x080d0e);for(let i=0;i<6;i++)this.box(g,.010,.011,.013,.443+i*.023,.84,front+.046,0xa59966);this.text(g,'16 PIN',.22,.037,.50,.905,front+.047,[0,0,0],'#a8b1aa');}
  }else{this.box(g,.22,.20,.06,.31,.72,front+.025,0x070b0b);}
  batchSolids(g);return g;
 }
};
