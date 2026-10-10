import * as THREE from 'three';
import {hardwareFinish} from './surfaces.js';
import {gpuLayout,gpuSlots} from './layout.js';

const finish=(color,metalness=.6,roughness=.4)=>hardwareFinish(new THREE.MeshStandardMaterial({color,metalness,roughness}));
function polygon(points){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;}
function plate(group,shape,depth,color,position,rotation){
 const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.006,bevelThickness:.004,curveSegments:8}),finish(color));
 mesh.position.set(...position);mesh.rotation.set(...rotation);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
}
function pipe(group,points,radius=.027){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');
 const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,26,radius,8,false),finish(0x9da19e,.86,.24));mesh.castShadow=true;group.add(mesh);return mesh;
}

// Original low-poly hardware geometry: open fin stacks, bent heatpipes, perforated
// backplate and sculpted rails. This is a visual approximation, not a CAD model.
export function makeDetailedGPU(p){
 const g=new THREE.Group(),len=p.length/100,rear=-1.86,end=rear+len,center=(rear+end)/2;
 const large=p.fans>=3,layout=gpuLayout(p),{thickness,top,bottom}=layout;
 const sapphire=p.manufacturer==='SAPPHIRE',zotac=p.id==='rtx3090';
 const shell=zotac?0x2b3034:0x171c20,trim=sapphire?0x71322f:0x41474b;
 // PCB, visible in the gap below the backplate, with small board components.
 this.box(g,1.36,.026,len-.12,-.04,top-.055,center,0x12211b);
 for(let i=0;i<12;i++){
  this.box(g,.09,.025,.07,.55,top-.018,rear+.17+i*(len-.35)/12,0x141719);
  this.box(g,.026,.026,.036,.63,top-.020,rear+.17+i*(len-.35)/12,0x8a8772);
 }
 for(let i=0;i<22;i++)this.box(g,.048,.045,.016,-.735,top-.045,rear+.20+i*.034,0xa39253);
 // Chamfered backplate, with real openings above the short PCB / pass-through fan.
 const outline=polygon([[-.73,rear+.05],[-.64,rear-.015],[.61,rear-.015],[.74,rear+.12],[.74,end-.18],[.60,end-.035],[-.62,end-.035],[-.73,end-.14]]);
 for(let i=0;i<5;i++){
  const x=-.52+i*.22,z=end-.40;
  outline.holes.push(new THREE.Path([new THREE.Vector2(x,z-.22),new THREE.Vector2(x+.12,z-.16),new THREE.Vector2(x+.12,z+.17),new THREE.Vector2(x,z+.11)]));
 }
 plate(g,outline,.036,shell,[0,top+.037,0],[Math.PI/2,0,0]);
 for(const x of [-.58,.58])for(const z of [rear+.18,end-.22])this.screw(g,x,top+.050,z,'y',.025);
 // Two radiator blocks leave a visible service gap for the curved heatpipes.
 const split=rear+len*.48,count=Math.round(len*39);
 for(let i=0;i<count;i++){
  const z=rear+.12+i*(len-.23)/count;
  if(Math.abs(z-split)<.075)continue;
  this.box(g,1.30,thickness-.14,.008,-.015,top-thickness/2-.012,z,i%7===0?0x697273:0x474f50,.38);
 }
 // Main heatpipes run under the fins, then curve visibly onto the open side.
 for(let i=0;i<(large?6:4);i++){
  const x=-.47+i*.19;
  pipe(g,[[x,top-.12,rear+.38],[x,bottom+.13,rear+.50],[x,bottom+.10,end-.25],[x,top-.16,end-.10]],.022);
 }
 for(let i=0;i<3;i++){
  const y=top-.16-i*.071,z=split-.21+i*.035;
  pipe(g,[[.47,top-.08,z-.20],[.67,top-.09,z-.10],[.73,y,z+.03],[.73,y,split+.19],[.73,y,end-.19],[.55,y+.035,end-.10]],.026);
 }
 // Side rails taper into the nose and rear bracket rather than covering the fins.
 const rail=polygon([[rear+.03,bottom+.045],[rear+.08,bottom+.14],[rear+.34,bottom+.015],[end-.38,bottom+.015],[end-.13,bottom+.20],[end-.03,bottom+.23],[end-.07,bottom-.035],[rear+.20,bottom-.045]]);
 for(const x of [-.755,.815])plate(g,rail,.052,shell,[x,0,0],[0,-Math.PI/2,0]);
 for(const z of [rear+.16,end-.17]){
  const cap=polygon([[z-.12,bottom+.04],[z+.11,bottom+.12],[z+.08,top-.025],[z-.05,top+.015]]);
  plate(g,cap,.055,zotac?0x51595d:shell,[.82,0,0],[0,-Math.PI/2,0]);
 }
 this.box(g,.026,.031,len-.34,.794,top-.016,center,0x434c4e);
 this.box(g,.017,.035,Math.min(.40,len*.17),.824,bottom+.015,end-.31,trim);
 this.box(g,.017,.025,.27,.824,bottom+.030,rear+.29,trim);
 // Open underside with individual fan rings, dark swept blades and angular bridges.
 for(let i=0;i<p.fans;i++){
  const z=rear+(i+.5)*len/p.fans,size=Math.min(1.16,len/p.fans-.07);
  const fan=this.fan(g,size,0,bottom-.035,z,[Math.PI/2,0,0],'gpu',false);
  fan.children.filter(o=>o.isMesh&&o.geometry.type==='TorusGeometry').forEach(o=>o.material.color.set(0x20262a));
  for(const x of [-.66,.66]){
   const bridge=this.box(g,.12,.075,len/p.fans-.10,x,bottom-.024,z,shell);bridge.rotation.z=x>0?-.17:.17;
  }
  this.text(g,sapphire?'SAPPHIRE':zotac?'ZOTAC':'MSI',.28,.055,0,bottom-.156,z,[Math.PI/2,0,0],'#969e9c');
 }
 // Small laser markings and a factory label remain attached to their surfaces.
 this.text(g,p.short.toUpperCase(),Math.min(len-.35,1.55),.075,.797,top-.020,center,[0,Math.PI/2,0],'#858d8a');
 const brand=sapphire?'SAPPHIRE':zotac?'ZOTAC GAMING':'MSI';
 this.box(g,.035,.105,.68,.818,bottom+.042,center,0x12171a);
 this.text(g,brand,.61,.090,.839,bottom+.045,center,[0,Math.PI/2,0],sapphire?'#beb5b0':'#acb5b3');
 this.label(g,p,.52,.24,.24,top+.043,rear+.65,[-Math.PI/2,0,Math.PI/2]);
 this.text(g,p.brand==='AMD'?'RADEON':'GEFORCE RTX',.83,.10,-.14,top+.045,center,[-Math.PI/2,0,Math.PI/2],'#596363');
 for(let i=0;i<3;i++){const groove=this.box(g,.65,.006,.008,-.10,top+.047,rear+.27+i*.055,0x394346);groove.rotation.y=-.24;}
 // Bracket, port interiors, mounting screws and power sockets keep their wiring anchors.
 const root=new THREE.Group();g.scale.x=layout.width/1.60;g.position.x=-.84*(1-g.scale.x);root.add(g);
 // Standard rear PCI bracket width must not scale with the cooler width.
 const bracketHeight=gpuSlots(p)*.18;
 this.box(root,1.64,bracketHeight,.035,.07,2.47-bracketHeight/2,-2.145,0x606a6b);
 const gpuPorts=p.ports?.flatMap(port=>Array.from({length:parseInt(port)||1},()=>/HDMI/i.test(port)?'HDMI':'DP'))||['DP','DP','DP','HDMI'];
 for(let i=0;i<gpuPorts.length;i++)this.rearPort(root,'video',-.49+i*.34,top-.205,.22,.083,0,gpuPorts[i]);
 for(let i=0;i<11;i++)this.box(root,.065,.045,.008,-.53+i*.115,2.47-bracketHeight+.085,-2.168,0x0a1013);
 for(const x of [-.64,.70])this.screw(root,x,top+.017,-2.17,'z',.024);
 if(p.connectorType==='16pin')this.headerSocket(root,'gpu16',2,6,.029);
 else for(let i=0;i<p.connectors;i++)this.headerSocket(root,'gpu'+(i+1),2,4,.041);
 return root;
}
