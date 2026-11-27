import {caseVent,caseGlass} from './case-fascia.js';
import {hardwareFinish} from './surfaces.js';
import {aioPlacement} from './aio.js';
import * as THREE from 'three';
import {caseLayout,TRAY_X,TRAY_HOLES,REAR_OPENINGS,frontIOPosition} from './layout.js';
import {fanMounts} from './fan-layout.js';
import {resolve} from './catalog.js';

function rectangle(shape,x,y,w,h){const hole=new THREE.Path();hole.moveTo(x-w/2,y-h/2);hole.lineTo(x-w/2,y+h/2);hole.lineTo(x+w/2,y+h/2);hole.lineTo(x+w/2,y-h/2);hole.closePath();shape.holes.push(hole);}
function circle(shape,x,y,r){const hole=new THREE.Path();hole.absarc(x,y,r,0,Math.PI*2,true);shape.holes.push(hole);}
function sheet(shape,color){return new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false}),new THREE.MeshStandardMaterial({color,metalness:.5,roughness:.55}));}

export function makeChassis(p={id:'cc560',short:'CC560 V2',frontFanCount:3,usbA:1,usb2:1}){
 const g=new THREE.Group(),frame=caseLayout(p),{front,rear,depth,centerZ,side,back}=frame;
 const white=p.color==='white',view=p.family==='view-270',focus=p.family==='focus-g';
 const steel=p.paint||(white?0xd5dadd:0x353e44);
 const black=p.id==='view-270-pink'?0x94cede:white?0xc5cdd1:0x151b1e;
 const viewFront=front+.202,sideX=side+.035;
 const innerSteel=view?black:steel;
 this.root.add(g);this.caseGroup=g;g.userData.id=p.id;g.userData.componentKey='case';
 const centerX=(side+back)/2,width=side-back,mounts=fanMounts({...this.currentBuild,case:p.id});
 const holes=(shape,wall,axes)=>{for(const m of mounts.filter(s=>s.wall===wall))circle(shape,m.position[axes[0]],m.position[axes[1]],m.size*.41);};
 if(p.concept){const bottom=new THREE.Shape();bottom.moveTo(back+.04,rear+.04);bottom.lineTo(side-.04,rear+.04);bottom.lineTo(side-.04,front-.04);bottom.lineTo(back+.04,front-.04);bottom.closePath();holes(bottom,'bottom',[0,2]);const plate=sheet(bottom,black);plate.rotation.x=Math.PI/2;plate.position.y=.36;g.add(plate);}else this.box(g,width,.10,depth+.12,centerX,.31,centerZ,black);
 for(const z of [rear,front])this.box(g,width,.10,.18,centerX,4.63,z,steel);
 for(const x of [back,side])this.box(g,.10,.10,depth,x,4.63,centerZ,steel);
 const gridFront=front-.63,gridLength=gridFront-rear-.19;
 const roof=caseVent(g,width-.16,gridLength,p.id==='ch560-white'?'square':'round',steel,.092);
 roof.rotation.x=-Math.PI/2;roof.position.set(centerX,4.635,rear+.16+gridLength/2);
 if(p.concept||p.leftFanCount){
  const panel=new THREE.Shape();
  panel.moveTo(rear,.38);panel.lineTo(front,.38);panel.lineTo(front,4.58);panel.lineTo(rear,4.58);panel.closePath();
  holes(panel,'left',[2,1]);this.rearPanel=sheet(panel,p.paint||black);
  this.rearPanel.rotation.y=-Math.PI/2;this.rearPanel.position.x=back+.018;g.add(this.rearPanel);
  if(view){
   const lining=new THREE.Mesh(new THREE.ShapeGeometry(panel),new THREE.MeshStandardMaterial({color:black,roughness:.77,side:THREE.DoubleSide}));
   lining.position.z=-.001;this.rearPanel.add(lining);
   for(const mount of mounts.filter(m=>m.wall==='left')){
    const filter=caseVent(this.rearPanel,mount.size,mount.size,'round',black,.055);
    filter.position.set(mount.position[2],mount.position[1],.017);
   }
  }
 }else this.rearPanel=this.box(g,.035,4.20,depth,back,2.48,centerZ,p.paint||black);
 this.rearPanel.userData.animated=true;
 // Continuous tray with real service apertures and rubber-edged cable slots.
 const trayFront=front-(view?.14:.27);
 const trayShape=new THREE.Shape();trayShape.moveTo(rear+.10,p.concept?.42:1.30);trayShape.lineTo(trayFront,p.concept?.42:1.30);trayShape.lineTo(trayFront,4.55);trayShape.lineTo(rear+.10,4.55);trayShape.closePath();
 const openings=[...TRAY_HOLES,{y:4.44,z:frame.ioZ,h:.18,w:.20}];
 if(p.concept||p.leftFanCount)holes(trayShape,'left',[2,1]);
 for(const hole of openings)rectangle(trayShape,hole.z,hole.y,hole.w,hole.h);
 const tray=sheet(trayShape,black);tray.rotation.y=-Math.PI/2;tray.position.x=TRAY_X+.0175;g.add(tray);
 for(const hole of openings.slice(1)){
  for(const z of [hole.z-hole.w/2,hole.z+hole.w/2])this.box(g,.05,hole.h+.05,.025,TRAY_X,hole.y,z,0x23292b);
  for(const y of [hole.y-hole.h/2,hole.y+hole.h/2])this.box(g,.05,.025,hole.w,TRAY_X,y,hole.z,0x23292b);
 }
 for(const x of [-.44,.64])this.box(g,.10,.020,.94,x,.37,rear+.53,0x202628);
 // An actual cutout, not a dark decal: GPU cables pass through the tunnel.
 const radiator=aioPlacement(resolve(this.currentBuild||{}),frame);
 if(radiator?.wall==='front'){
  // The usual case fan rails are suppressed when the front radiator occupies them.
  for(const x of [-.56,.56])this.box(g,.08,4.30,.10,x,2.49,front+.05,steel);
 }else if(radiator?.wall==='top'){
  for(const offset of [-.56,.56])this.box(g,.08,.03,depth,radiator.position[0]+offset,4.635,centerZ,steel);
 }
 if(p.family!=='focus-g'){
  const shroudFront=view?viewFront-.025:front-(radiator?.wall==='front'?.74:.35);
  const shape=new THREE.Shape();shape.moveTo(-.91,rear+.04);shape.lineTo(side-.05,rear+.04);shape.lineTo(side-.05,shroudFront);shape.lineTo(-.91,shroudFront);shape.closePath();
  for(const [x,z,w,d] of [[.62,.55,.61,.70],[-.15,shroudFront-.20,.62,.30]]){
   const hole=new THREE.Path();hole.moveTo(x-w/2,z-d/2);hole.lineTo(x-w/2,z+d/2);hole.lineTo(x+w/2,z+d/2);hole.lineTo(x+w/2,z-d/2);hole.closePath();shape.holes.push(hole);
  }
  if(p.concept)holes(shape,'bottom',[0,2]);
  const shroudColor=view?steel:white?0xc5cdd1:0x1d2529;
  const tunnel=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:false}),hardwareFinish(new THREE.MeshStandardMaterial({color:black,metalness:.20,roughness:.91})));tunnel.rotation.x=Math.PI/2;tunnel.position.y=1.155;tunnel.castShadow=true;tunnel.receiveShadow=true;g.add(tunnel);
  // Low-profile rubber edging borders the open cable pass-through.
  for(const x of [.30,.94])this.box(g,.025,.020,.72,x,1.166,.55,0x242c2e);
  for(const z of [.19,.91])this.box(g,.66,.020,.025,.62,1.166,z,0x242c2e);
  this.box(g,side+.86,.78,.045,(side-.96)/2,.73,shroudFront,shroudColor);
  if(view){
   const frontEdge=viewFront+.001,sideLength=frontEdge-rear+.03;
   const midZ=(frontEdge+rear-.03)/2;
   this.box(g,.035,.87,sideLength,sideX-.012,.795,midZ,new THREE.Color(steel).multiplyScalar(.44));
   for(const y of [.445,1.145])this.box(g,.046,.17,sideLength,sideX,y,midZ,steel);
   for(const z of [rear+.033,frontEdge-.06])this.box(g,.046,.54,.13,sideX,.795,z,steel);
   const grille=caseVent(g,sideLength-.25,.54,'round',steel,.052);
   grille.rotation.y=Math.PI/2;grille.position.set(sideX+.024,.795,midZ);
   this.box(g,.06,.032,sideLength,sideX,1.242,midZ,black);
   const labelZ=front-.48;
   this.box(g,.012,.16,.73,sideX+.031,.70,labelZ,steel);
   this.text(g,'TT  Thermaltake',.65,.085,sideX+.041,.70,labelZ,[0,Math.PI/2,0],'#263032');
  }else if(p.id==='cc560'){
   for(const z of [rear+.22,front-.22])this.box(g,.035,.76,.39,side-.07,.73,z,shroudColor);
   for(const y of [.42,1.075])this.box(g,.035,.12,depth-.40,side-.07,y,centerZ,shroudColor);
  }else if(p.id==='ch560-white'){
   const sideMesh=caseVent(g,depth-.16,1.08,'square',0xd3d8da,.065);
   sideMesh.rotation.y=Math.PI/2;sideMesh.position.set(side+.032,.92,centerZ);
   for(const y of [.40,1.46])this.box(g,.06,.07,depth,side+.004,y,centerZ,steel);
  }else this.box(g,.035,.76,depth-.20,side-.07,.73,centerZ,shroudColor);
 }
 for(const x of [back,side])for(const z of [rear,front]){
  if(view){
   if(x===side&&z===front)continue;
   this.box(g,.065,4.24,.075,x,2.48,z,innerSteel);continue;
  }
  this.box(g,.10,4.25,.10,x,2.48,z,steel);for(const y of [.48,1.28,4.48])this.screw(g,x+(x>0?.06:-.06),y,z,'x');}
 for(const x of [back+.28,side-.28])for(const z of [rear+.30,front-.30]){this.box(g,.30,.19,.46,x,.16,z,black);this.box(g,.28,.04,.43,x,.065,z,0x101416);}
 // One stamped rear panel. Only the fan, I/O shield, PCI brackets and PSU
 // are open; fitted parts cover their respective openings without side gaps.
 const rearShape=new THREE.Shape();rearShape.moveTo(back+.04,.36);rearShape.lineTo(side-.04,.36);rearShape.lineTo(side-.04,4.58);rearShape.lineTo(back+.04,4.58);rearShape.closePath();
 for(const key of ['io','slots','psu']){const h=REAR_OPENINGS[key];rectangle(rearShape,h.x,h.y,h.w,h.h);}
 if(p.concept)holes(rearShape,'rear',[0,1]);else {const fh=REAR_OPENINGS.fan;circle(rearShape,fh.x,fh.y,fh.r);}
 const rearSheet=sheet(rearShape,innerSteel);rearSheet.position.z=rear-.04;g.add(rearSheet);
 this.slotCovers=[];
 for(let i=0;i<7;i++){
  const cover=new THREE.Group(),y=2.38-i*.18;cover.userData.slotCenter=y;cover.userData.animated=true;g.add(cover);this.slotCovers.push(cover);
  this.box(cover,1.64,.18,.04,.07,y,rear-.045,view?black:white?0xc8ced0:0x41494b);
  if(i<(p.expansionSlots||7)){
   for(let j=0;j<10;j++)this.box(cover,.045,.045,.009,-.46+j*.11,y,rear-.072,0x11181b);
   this.screw(cover,.84,y,rear-.085,'z',.022);
  }
 }

 const fascia=new THREE.Group();g.add(fascia);if(p.concept)this.makeConceptFront(fascia,p);else this.makeCaseFront(fascia,p);fascia.position.z=front-2.1;fascia.scale.x=(width+(view?.115:-.10))/2.20;fascia.position.x=centerX;
 if(white&&p.concept)fascia.traverse(o=>{if(o.isMesh&&o.material&&!o.material.map&&o.material.color.getHex()!==0x06090a)o.material.color.set(0xc0c6c9);});
 if(p.concept==='panorama'){
  const window=new THREE.Shape();window.moveTo(back+.08,.44);window.lineTo(side-.08,.44);window.lineTo(side-.08,4.54);window.lineTo(back+.08,4.54);window.closePath();holes(window,'front',[0,1]);
  const pane=new THREE.Mesh(new THREE.ShapeGeometry(window),new THREE.MeshPhysicalMaterial({color:0xbbceda,roughness:.1,metalness:.08,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false}));pane.position.z=front+.07;g.add(pane);
 }
 // Front intake faces the fascia (+Z); rear intake faces the interior (+Z).
 // Both exhaust through their motor struts toward -Z.

 if(!p.concept&&!view)for(const r of [.16,.24,.32,.40,.48]){const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.010,6,40),new THREE.MeshStandardMaterial({color:steel,metalness:.5,roughness:.5}));ring.position.set(.31,3.93,-2.16);g.add(ring);}
 if(!p.concept&&!view)for(const x of [-.05,.66])this.rod(g,[x,3.49,-2.165],[x,4.37,-2.165],.012,steel);
 if(view){
  // A stamped perforated exhaust replaces the concentric wire grille.
  const exhaust=caseVent(g,1.08,1.08,'round',black,.079);
  exhaust.position.set(.31,3.93,rear-.046);
  const capDepth=viewFront-rear+.06;
  this.box(g,.07,.15,capDepth,sideX,4.575,(viewFront+rear-.06)/2,steel);
 }
 const ioApron=new THREE.Shape();ioApron.moveTo(back+.05,front-.70);ioApron.lineTo(side-.05,front-.70);ioApron.lineTo(side-.05,front-.06);ioApron.lineTo(back+.05,front-.06);ioApron.closePath();
 const fasciaIO=p.id==='matrexx55-mesh';
 if(!fasciaIO)rectangle(ioApron,0,frame.ioZ,1.88,.43);
 const apron=sheet(ioApron,steel);apron.rotation.x=Math.PI/2;apron.position.y=4.695;g.add(apron);
 const io=new THREE.Group();g.add(io);
 if(fasciaIO){
  // MATREXX 55 carries its controls vertically on the fascia.
  io.quaternion.set(.5,.5,.5,.5);io.scale.z=.70;
  const [x,y,z]=frontIOPosition(p,frame,'panel');
  io.position.set(x-frame.ioZ*.70,y-.72,z-4.645);
 }
 this.box(io,1.88,.032,.43,0,4.679,frame.ioZ,black);
 for(const id of ['usb3',...(p.usb2?['usb2']:[]),...(p.usbC?['usbC']:[]),'audio','panel'])this.box(g,.13,.065,.09,...frontIOPosition(p,frame,id),0x161e21);
 // Each front I/O has its own mounting position (two USB-A never share USB-C).
 const usbCount=(p.usbA??1)+(p.usb2??0),usbX=usbCount>2?[-.75,-.45,-.15]:[-.70,-.36];
 for(let i=0;i<usbCount;i++){
  const x=usbX[i],col=i<(p.usbA??1)?0x2b73ae:0x252d30;
  this.box(io,.19,.018,.105,x,4.71,frame.ioZ,0x919b9f);this.box(io,.15,.021,.076,x,4.72,frame.ioZ,0x060a0c);this.box(io,.127,.022,.020,x,4.727,frame.ioZ+.021,col);
  this.text(io,i<(p.usbA??1)?'USB 3':'USB 2',.26,.05,x,4.704,frame.ioZ-.15,[-Math.PI/2,0,0],white?'#30393b':'#9aa8af');
 }
 if(p.usbC){const x=usbCount>1?-.03:-.36;this.box(io,.115,.018,.06,x,4.71,frame.ioZ,0x8b989f);this.box(io,.083,.024,.037,x,4.717,frame.ioZ,0x080d0f);this.text(io,'USB-C',.23,.05,x,4.704,frame.ioZ-.15,[-Math.PI/2,0,0]);}
 const audioX=p.audio?.startsWith('2')?[usbCount>2?.14:.08,.34]:[.34];
 for(const x of audioX){this.cylinder(io,.047,.014,x,4.71,frame.ioZ,0x8d9a9c);this.cylinder(io,.031,.016,x,4.718,frame.ioZ,0x050a0c);}
 this.cylinder(io,.082,.022,.72,4.714,frame.ioZ,white?0x838e93:0x50585b);this.text(io,'⏻',.09,.09,.72,4.728,frame.ioZ,[-Math.PI/2,0,0],'#c0c4c6');
 if(!view&&!focus)this.text(g,p.short,.83,.06,side-.049,.46,centerZ,[0,Math.PI/2,0],white?'#343e44':'#929ca2');
 const glassBottom=view?1.255:p.id==='ch560-white'?1.50:.435,glassTop=view?4.50:4.565;
 const frontEdge=view?viewFront:front-.085,backEdge=rear+.085;
 let insetFrame;
 let glassGeo=new THREE.PlaneGeometry(frontEdge-backEdge,glassTop-glassBottom);
 if(focus){
  // The Focus G uses an inset acrylic window in a coloured stamped side cover.
  const visibleWidth=depth-.58,visibleHeight=3.52,corner=.10;
  const window=new THREE.Shape(),x=visibleWidth/2,y=visibleHeight/2;
  window.moveTo(-x+corner,-y);window.lineTo(x-corner,-y);window.quadraticCurveTo(x,-y,x,-y+corner);
  window.lineTo(x,y-corner);window.quadraticCurveTo(x,y,x-corner,y);window.lineTo(-x+corner,y);
  window.quadraticCurveTo(-x,y,-x,y-corner);window.lineTo(-x,-y+corner);window.quadraticCurveTo(-x,-y,-x+corner,-y);
  const surround=new THREE.Shape();
  const w=(frontEdge-backEdge)/2,h=(glassTop-glassBottom)/2;
  surround.moveTo(-w,-h);surround.lineTo(w,-h);surround.lineTo(w,h);surround.lineTo(-w,h);surround.closePath();
  surround.holes.push(new THREE.Path(window.getPoints(4)));
  glassGeo.dispose();glassGeo=new THREE.ShapeGeometry(window);
  const uv=glassGeo.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/visibleWidth+.5,uv.getY(i)/visibleHeight+.5);
  insetFrame=sheet(surround,steel);insetFrame.position.z=-.034;
 }else if(p.concept){const shape=new THREE.Shape();shape.moveTo(rear+.1,.44);shape.lineTo(front-.1,.44);shape.lineTo(front-.1,4.55);shape.lineTo(rear+.1,4.55);shape.closePath();holes(shape,'right',[2,1]);glassGeo.dispose();glassGeo=new THREE.ShapeGeometry(shape);}
 this.glass=new THREE.Mesh(glassGeo,caseGlass(!view&&!white));
 this.glass.rotation.y=p.concept?-Math.PI/2:Math.PI/2;this.glass.position.set(sideX+(view?.022:.035),p.concept?0:(glassTop+glassBottom)/2,p.concept?0:(backEdge+frontEdge)/2);
 this.glass.visible=!this.hideGlass;this.glass.userData.ignoreInspect=true;g.add(this.glass);
 const windowEdges=new THREE.LineSegments(new THREE.EdgesGeometry(glassGeo),new THREE.LineBasicMaterial({color:focus?0x14191b:view?0x87a49f:white?0xc6d8e1:0x849aa8,transparent:true,opacity:.75}));
 this.glass.add(windowEdges);if(insetFrame)this.glass.add(insetFrame);
 // Perforated guards cover the mounting apertures, including vacant ones.
 this.sideFanGuards=[];
 if(p.concept||p.leftFanCount)for(const slot of mounts.filter(s=>p.concept||s.wall==='left')){
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
