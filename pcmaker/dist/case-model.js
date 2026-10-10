import * as THREE from 'three';
import {caseLayout} from './layout.js';

export function makeChassis(p={id:'cc560',short:'CC560 V2',frontFanCount:3,usbA:1,usb2:1}){
 const g=new THREE.Group(),frame=caseLayout(p),{front,rear,depth,centerZ,side,back}=frame;
 const white=p.color==='white',steel=white?0xc4c9cb:0x353e44,black=white?0xb8bec1:0x151b1e;
 this.root.add(g);this.caseGroup=g;g.userData.id=p.id;g.userData.componentKey='case';
 const centerX=(side+back)/2,width=side-back;
 this.box(g,width,.10,depth+.12,centerX,.31,centerZ,black);
 for(const z of [rear,front])this.box(g,width,.10,.18,centerX,4.63,z,steel);
 for(const x of [back,side])this.box(g,.10,.10,depth,x,4.63,centerZ,steel);
 const gridFront=front-.63,gridLength=gridFront-rear-.19;
 for(let i=0;i<=34;i++)this.box(g,width-.20,.020,.016,centerX,4.63,rear+.16+i*gridLength/34,steel);
 for(let i=0;i<16;i++)this.box(g,.014,.020,gridLength,back+.15+i*(width-.30)/15,4.636,rear+.16+gridLength/2,steel);
 this.rearPanel=this.box(g,.035,4.20,depth,back,2.48,centerZ,black);this.rearPanel.userData.animated=true;
 // Tray is behind the board standoffs and in front of the cable channel.
 for(const z of [-1.81,.80])this.box(g,.035,3.04,.14,-1.03,2.83,z,black);
 this.box(g,.035,.60,2.50,-1.03,1.60,-.50,black);
 this.box(g,.035,.26,2.50,-1.03,4.20,-.50,black);
 this.box(g,.035,1.55,.45,-1.03,3.10,.51,black);
 for(const y of [1.42,2.60,4.12])for(const z of [-1.72,.55])this.rod(g,[-1.01,y,z],[-.972,y,z],.035,0x938768);
 // An actual cutout, not a dark decal: GPU cables pass through the tunnel.
 const shape=new THREE.Shape();shape.moveTo(-.91,rear+.04);shape.lineTo(side-.05,rear+.04);shape.lineTo(side-.05,front-.35);shape.lineTo(-.91,front-.35);shape.closePath();
 for(const [x,z,w,d] of [[.62,.55,.61,.70],[-.15,front-.55,.62,.30]]){
  const hole=new THREE.Path();hole.moveTo(x-w/2,z-d/2);hole.lineTo(x-w/2,z+d/2);hole.lineTo(x+w/2,z+d/2);hole.lineTo(x+w/2,z-d/2);hole.closePath();shape.holes.push(hole);
 }
 const tunnel=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:false}),new THREE.MeshStandardMaterial({color:steel,metalness:.5,roughness:.55}));tunnel.rotation.x=Math.PI/2;tunnel.position.y=1.155;tunnel.castShadow=true;tunnel.receiveShadow=true;g.add(tunnel);
 // Low-profile rubber edging borders the open cable pass-through.
 for(const x of [.30,.94])this.box(g,.025,.020,.72,x,1.166,.55,0x242c2e);
 for(const z of [.19,.91])this.box(g,.66,.020,.025,.62,1.166,z,0x242c2e);
 this.box(g,width,.78,.045,centerX,.73,front,black);
 if(p.id==='cc560'){
  for(const z of [rear+.22,front-.22])this.box(g,.035,.76,.39,side-.07,.73,z,black);
  for(const y of [.42,1.075])this.box(g,.035,.12,depth-.40,side-.07,y,centerZ,black);
 }else this.box(g,.035,.76,depth-.20,side-.07,.73,centerZ,black);
 for(const x of [back,side])for(const z of [rear,front]){this.box(g,.10,4.25,.10,x,2.48,z,steel);for(const y of [.48,1.28,4.48])this.screw(g,x+(x>0?.06:-.06),y,z,'x');}
 for(const x of [back+.28,side-.28])for(const z of [rear+.30,front-.30]){this.box(g,.30,.19,.46,x,.16,z,black);this.box(g,.28,.04,.43,x,.065,z,0x101416);}
 for(const x of [-.98,side-.12])this.box(g,.17,3.35,.06,x,2.85,rear-.01,steel);
 for(const y of [1.14,4.47])this.box(g,width-.08,.10,.06,centerX,y,rear-.01,steel);
 this.box(g,1.08,.73,.055,.41,3.0,rear-.01,steel);
 this.slotCovers=[];
 for(let i=0;i<7;i++){
  const cover=new THREE.Group(),y=2.38-i*.18;cover.userData.slotCenter=y;cover.userData.animated=true;g.add(cover);this.slotCovers.push(cover);
  this.box(cover,1.36,.145,.04,.10,y,rear-.02,white?0xabb3b7:0x41494b);
  for(let j=0;j<10;j++)this.box(cover,.045,.045,.009,-.46+j*.11,y,rear-.046,0x11181b);
  this.screw(cover,.84,y,rear-.05,'z',.022);
 }
 const rgb=p.frontRGB??p.id==='cc560';
 for(const y of frame.fanYs)this.fan(g,frame.fanSize,0,y,frame.fanZ,[0,0,0],'front',rgb);
 const fascia=new THREE.Group();g.add(fascia);this.makeCaseFront(fascia,p);fascia.position.z=front-2.1;fascia.scale.x=(width-.10)/2.20;fascia.position.x=centerX;
 if(white)fascia.traverse(o=>{if(o.isMesh&&o.material&&!o.material.map&&o.material.color.getHex()!==0x06090a)o.material.color.set(0xc0c6c9);});
 // Intake faces the interior; rear struts and guard face the exhaust outside.
 this.fan(g,1.03,.31,3.93,-1.99,[0,0,0],'rear',rgb);
 for(const r of [.16,.24,.32,.40,.48]){const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.010,6,40),new THREE.MeshStandardMaterial({color:steel,metalness:.5,roughness:.5}));ring.position.set(.31,3.93,-2.16);g.add(ring);}
 for(const x of [-.05,.66])this.rod(g,[x,3.49,-2.165],[x,4.37,-2.165],.012,steel);
 this.box(g,1.88,.032,.43,0,4.679,frame.ioZ,black);
 // Each front I/O has its own mounting position (two USB-A never share USB-C).
 const usbX=[-.70,-.36],usbCount=(p.usbA??1)+(p.usb2??0);
 for(let i=0;i<usbCount;i++){
  const x=usbX[i],col=i<(p.usbA??1)?0x2b73ae:0x252d30;
  this.box(g,.19,.018,.105,x,4.71,frame.ioZ,0x919b9f);this.box(g,.15,.021,.076,x,4.72,frame.ioZ,0x060a0c);this.box(g,.127,.022,.020,x,4.727,frame.ioZ+.021,col);
  this.text(g,i<(p.usbA??1)?'USB 3':'USB 2',.26,.05,x,4.704,frame.ioZ-.15,[-Math.PI/2,0,0],white?'#30393b':'#9aa8af');
 }
 if(p.usbC){const x=usbCount>1?-.03:-.36;this.box(g,.115,.018,.06,x,4.71,frame.ioZ,0x8b989f);this.box(g,.083,.024,.037,x,4.717,frame.ioZ,0x080d0f);this.text(g,'USB-C',.23,.05,x,4.704,frame.ioZ-.15,[-Math.PI/2,0,0]);}
 const audioX=p.audio?.startsWith('2')?[.08,.34]:[.34];
 for(const x of audioX){this.cylinder(g,.047,.014,x,4.71,frame.ioZ,0x8d9a9c);this.cylinder(g,.031,.016,x,4.718,frame.ioZ,0x050a0c);}
 this.cylinder(g,.082,.022,.72,4.714,frame.ioZ,white?0x838e93:0x50585b);this.text(g,'⏻',.09,.09,.72,4.728,frame.ioZ,[-Math.PI/2,0,0],'#c0c4c6');
 this.text(g,p.short,.83,.06,side-.049,.46,centerZ,[0,Math.PI/2,0],white?'#343e44':'#929ca2');
 this.glass=new THREE.Mesh(new THREE.PlaneGeometry(depth-.17,4.13),new THREE.MeshPhysicalMaterial({color:0x9faeb7,roughness:.13,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}));this.glass.rotation.y=Math.PI/2;this.glass.position.set(side+.06,2.50,centerZ);this.glass.visible=false;this.glass.userData.ignoreInspect=true;g.add(this.glass);
 for(const y of [1.45,2.4,3.4,4.2])for(const z of [.96,-.84])this.box(g,.023,.04,.18,-1.065,y,z,steel);
 return g;
}
