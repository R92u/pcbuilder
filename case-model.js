import * as THREE from 'three';
import {caseLayout,TRAY_X,TRAY_HOLES,REAR_OPENINGS,frontIOPosition} from './layout.js';
import {fanMounts} from './fan-layout.js';
import {resolve} from './catalog.js';

function rectangle(shape,x,y,w,h){const hole=new THREE.Path();hole.moveTo(x-w/2,y-h/2);hole.lineTo(x-w/2,y+h/2);hole.lineTo(x+w/2,y+h/2);hole.lineTo(x+w/2,y-h/2);hole.closePath();shape.holes.push(hole);}
function circle(shape,x,y,r){const hole=new THREE.Path();hole.absarc(x,y,r,0,Math.PI*2,true);shape.holes.push(hole);}
function sheet(shape,color){return new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false}),new THREE.MeshStandardMaterial({color,metalness:.5,roughness:.55}));}

export function makeChassis(p={id:'cc560',short:'CC560 V2',frontFanCount:3,usbA:1,usb2:1}){
 const g=new THREE.Group(),frame=caseLayout(p,resolve(this.currentBuild||{}).gpu),{front,rear,depth,centerZ,side,back}=frame;
 const white=p.color==='white',steel=white?0xc4c9cb:0x353e44,black=white?0xb8bec1:0x151b1e;
 this.root.add(g);this.caseGroup=g;g.userData.id=p.id;g.userData.componentKey='case';
 const centerX=(side+back)/2,width=side-back,mounts=fanMounts({...this.currentBuild,case:p.id});
 const holes=(shape,wall,axes)=>{for(const m of mounts.filter(s=>s.wall===wall))circle(shape,m.position[axes[0]],m.position[axes[1]],m.size*.41);};
 if(p.concept){const bottom=new THREE.Shape();bottom.moveTo(back+.04,rear+.04);bottom.lineTo(side-.04,rear+.04);bottom.lineTo(side-.04,front-.04);bottom.lineTo(back+.04,front-.04);bottom.closePath();holes(bottom,'bottom',[0,2]);const plate=sheet(bottom,black);plate.rotation.x=Math.PI/2;plate.position.y=.36;g.add(plate);}else this.box(g,width,.10,depth+.12,centerX,.31,centerZ,black);
 for(const z of [rear,front])this.box(g,width,.10,.18,centerX,4.63,z,steel);
 for(const x of [back,side])this.box(g,.10,.10,depth,x,4.63,centerZ,steel);
 const gridFront=front-.63,gridLength=gridFront-rear-.19;
 for(let i=0;i<=34;i++)this.box(g,width-.20,.020,.016,centerX,4.63,rear+.16+i*gridLength/34,steel);
 for(let i=0;i<16;i++)this.box(g,.014,.020,gridLength,back+.15+i*(width-.30)/15,4.636,rear+.16+gridLength/2,steel);
 if(p.concept){const panel=new THREE.Shape();panel.moveTo(rear,.38);panel.lineTo(front,.38);panel.lineTo(front,4.58);panel.lineTo(rear,4.58);panel.closePath();holes(panel,'left',[2,1]);this.rearPanel=sheet(panel,black);this.rearPanel.rotation.y=-Math.PI/2;this.rearPanel.position.x=back+.018;g.add(this.rearPanel);}else this.rearPanel=this.box(g,.035,4.20,depth,back,2.48,centerZ,black);this.rearPanel.userData.animated=true;
 // Continuous tray with real service apertures and rubber-edged cable slots.
 const trayShape=new THREE.Shape();trayShape.moveTo(rear+.10,p.concept?.42:1.30);trayShape.lineTo(front-.27,p.concept?.42:1.30);trayShape.lineTo(front-.27,4.55);trayShape.lineTo(rear+.10,4.55);trayShape.closePath();
 const openings=[...TRAY_HOLES,{y:4.44,z:frame.ioZ,h:.18,w:.20}];
 if(p.concept)holes(trayShape,'left',[2,1]);
 for(const hole of openings)rectangle(trayShape,hole.z,hole.y,hole.w,hole.h);
 const tray=sheet(trayShape,black);tray.rotation.y=-Math.PI/2;tray.position.x=TRAY_X+.0175;g.add(tray);
 for(const hole of openings.slice(1)){
  for(const z of [hole.z-hole.w/2,hole.z+hole.w/2])this.box(g,.05,hole.h+.05,.025,TRAY_X,hole.y,z,0x23292b);
  for(const y of [hole.y-hole.h/2,hole.y+hole.h/2])this.box(g,.05,.025,hole.w,TRAY_X,y,hole.z,0x23292b);
 }
 for(const y of [1.42,2.60,4.12])for(const z of [-1.72,.55])this.rod(g,[-1.01,y,z],[-.972,y,z],.035,0x938768);
 // An actual cutout, not a dark decal: GPU cables pass through the tunnel.
 const shape=new THREE.Shape();shape.moveTo(-.91,rear+.04);shape.lineTo(side-.05,rear+.04);shape.lineTo(side-.05,front-.35);shape.lineTo(-.91,front-.35);shape.closePath();
 for(const [x,z,w,d] of [[.62,.55,.61,.70],[-.15,front-.55,.62,.30]]){
  const hole=new THREE.Path();hole.moveTo(x-w/2,z-d/2);hole.lineTo(x-w/2,z+d/2);hole.lineTo(x+w/2,z+d/2);hole.lineTo(x+w/2,z-d/2);hole.closePath();shape.holes.push(hole);
 }
 if(p.concept)holes(shape,'bottom',[0,2]);
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
 // One stamped rear panel. Only the fan, I/O shield, PCI brackets and PSU
 // are open; fitted parts cover their respective openings without side gaps.
 const rearShape=new THREE.Shape();rearShape.moveTo(back+.04,.36);rearShape.lineTo(side-.04,.36);rearShape.lineTo(side-.04,4.58);rearShape.lineTo(back+.04,4.58);rearShape.closePath();
 for(const key of ['io','slots','psu']){const h=REAR_OPENINGS[key];rectangle(rearShape,h.x,h.y,h.w,h.h);}
 if(p.concept)holes(rearShape,'rear',[0,1]);else {const fh=REAR_OPENINGS.fan;circle(rearShape,fh.x,fh.y,fh.r);}
 const rearSheet=sheet(rearShape,steel);rearSheet.position.z=rear-.04;g.add(rearSheet);
 this.slotCovers=[];
 for(let i=0;i<7;i++){
  const cover=new THREE.Group(),y=2.38-i*.18;cover.userData.slotCenter=y;cover.userData.animated=true;g.add(cover);this.slotCovers.push(cover);
  this.box(cover,1.64,.18,.04,.07,y,rear-.045,white?0xabb3b7:0x41494b);
  for(let j=0;j<10;j++)this.box(cover,.045,.045,.009,-.46+j*.11,y,rear-.072,0x11181b);
  this.screw(cover,.84,y,rear-.085,'z',.022);
 }

 const fascia=new THREE.Group();g.add(fascia);if(p.concept)this.makeConceptFront(fascia,p);else this.makeCaseFront(fascia,p);fascia.position.z=front-2.1;fascia.scale.x=(width-.10)/2.20;fascia.position.x=centerX;
 if(white)fascia.traverse(o=>{if(o.isMesh&&o.material&&!o.material.map&&o.material.color.getHex()!==0x06090a)o.material.color.set(0xc0c6c9);});
 if(p.concept==='panorama'){
  const window=new THREE.Shape();window.moveTo(back+.08,.44);window.lineTo(side-.08,.44);window.lineTo(side-.08,4.54);window.lineTo(back+.08,4.54);window.closePath();holes(window,'front',[0,1]);
  const pane=new THREE.Mesh(new THREE.ShapeGeometry(window),new THREE.MeshPhysicalMaterial({color:0xbbceda,roughness:.1,metalness:.08,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false}));pane.position.z=front+.07;g.add(pane);
 }
 // Front intake faces the fascia (+Z); rear intake faces the interior (+Z).
 // Both exhaust through their motor struts toward -Z.

 if(!p.concept)for(const r of [.16,.24,.32,.40,.48]){const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.010,6,40),new THREE.MeshStandardMaterial({color:steel,metalness:.5,roughness:.5}));ring.position.set(.31,3.93,-2.16);g.add(ring);}
 if(!p.concept)for(const x of [-.05,.66])this.rod(g,[x,3.49,-2.165],[x,4.37,-2.165],.012,steel);
 const ioApron=new THREE.Shape();ioApron.moveTo(back+.05,front-.70);ioApron.lineTo(side-.05,front-.70);ioApron.lineTo(side-.05,front-.06);ioApron.lineTo(back+.05,front-.06);ioApron.closePath();
 rectangle(ioApron,0,frame.ioZ,1.88,.43);
 const apron=sheet(ioApron,steel);apron.rotation.x=Math.PI/2;apron.position.y=4.695;g.add(apron);
 this.box(g,1.88,.032,.43,0,4.679,frame.ioZ,black);
 for(const id of ['usb3',...(p.usb2?['usb2']:[]),...(p.usbC?['usbC']:[]),'audio','panel'])this.box(g,.13,.065,.09,...frontIOPosition(p,frame,id),0x161e21);
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
 let glassGeo=new THREE.PlaneGeometry(depth-.17,4.13);
 if(p.concept){const shape=new THREE.Shape();shape.moveTo(rear+.1,.44);shape.lineTo(front-.1,.44);shape.lineTo(front-.1,4.55);shape.lineTo(rear+.1,4.55);shape.closePath();holes(shape,'right',[2,1]);glassGeo=new THREE.ShapeGeometry(shape);}
 this.glass=new THREE.Mesh(glassGeo,new THREE.MeshPhysicalMaterial({color:0x9faeb7,roughness:.09,metalness:.18,transparent:true,opacity:.30,side:THREE.DoubleSide,depthWrite:false}));this.glass.rotation.y=Math.PI/2;this.glass.position.set(side+.06,p.concept?0:2.50,p.concept?0:centerZ);if(p.concept)this.glass.rotation.y=-Math.PI/2;this.glass.visible=!this.hideGlass;this.glass.userData.ignoreInspect=true;g.add(this.glass);
 // A mounted window has a visible perimeter and fasteners, even with a clear pane.
 const windowEdges=new THREE.LineSegments(new THREE.EdgesGeometry(glassGeo),new THREE.LineBasicMaterial({color:white?0xc6d8e1:0x849aa8,transparent:true,opacity:.72}));
 this.glass.add(windowEdges);
 // Perforated guards cover the mounting apertures, including vacant ones.
 this.sideFanGuards=[];
 if(p.concept)for(const slot of mounts){
  const guard=new THREE.Group();guard.position.set(...slot.position);guard.position.addScaledVector(new THREE.Vector3(...slot.normal),.17);guard.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(...slot.normal));g.add(guard);
  const radius=slot.size*.41;
  if(slot.wall==='right'){guard.userData.animated=true;this.sideFanGuards.push(guard);}
  for(let i=-5;i<=5;i++){const y=i*radius/6,length=2*Math.sqrt(radius*radius-y*y);this.box(guard,length,.009,.009,0,y,0,steel);}
  for(const x of [-radius*.55,0,radius*.55])this.box(guard,.009,Math.sqrt(radius*radius-x*x)*2,.009,x,0,0,steel);
  if(slot.wall==='bottom'){const shroudGuard=guard.clone();shroudGuard.position.y=1.17;g.add(shroudGuard);}
 }
 for(const y of [1.45,2.4,3.4,4.2])for(const z of [.96,-.84])this.box(g,.023,.04,.18,-1.065,y,z,steel);
 return g;
}
