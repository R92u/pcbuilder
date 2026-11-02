import * as THREE from 'three';
import {PCScene} from './scene.js';
import {peripheralById,sanitizeWorkplace} from './peripherals.js';

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
 const g=new THREE.Group(),[w,d,h]=p.dimensions.map(v=>v/100),full=p.id==='shiva',light=p.id==='fizz',base=plastic(light?'#d6d8d6':'#171b1e'),dark=plastic('#292f33'),white=plastic('#dddeda'),yellow=plastic('#d4b950');
 box(g,w,h*.5,d,0,h*.25,0,base);box(g,w-.07,.025,full?d*.68:d-.05,0,h*.53,full?-d*.13:0,dark);
 if(full){box(g,w-.05,.07,d*.24,0,.08,d*.36,plastic('#22282c'));label(g,'REDRAGON',.5,.075,0,.121,d*.36,[-Math.PI/2,0,0]);}
 const layout=[];
 const rows=full||p.keys===61?[14,14,13,12,8]:[15,15,14,14,10];
 const standardWidths=[[...Array(13).fill(1),2],[1.5,...Array(12).fill(1),1.5],[1.75,...Array(11).fill(1),2.25],[2.25,...Array(10).fill(1),2.75],[1.25,1.25,1.25,6.25,1.25,1.25,1.25,1.25]];
 const legends=[['Esc','1','2','3','4','5','6','7','8','9','0','−','=','←'],['Tab','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],['Caps','A','S','D','F','G','H','J','K','L',';',"'",'Enter'],['Shift','Z','X','C','V','B','N','M',',','.','/','Shift'],['Ctrl','Win','Alt','','Alt','Fn','Menu','Ctrl']];
 const areaW=full?w*.57:w-.12,areaD=full?d*.51:d-.12,left=full?-w*.14:0,top=full?-d*.03:0;
 for(let row=0;row<5;row++){
  const count=rows[row],unit=areaW/(full||p.keys===61?15:row===4?15:count);
  for(let col=0;col<count;col++){
   const widths=full||p.keys===61?standardWidths[row]:row===4?[1,1,1,5,1,1,1,1,1,2]:Array(count).fill(1);
   const start=widths.slice(0,col).reduce((a,b)=>a+b,0),kw=widths[col]*unit;
   layout.push({x:left-areaW/2+start*unit+kw/2,z:top-areaD/2+(row+.5)*areaD/5,w:kw-.025,d:areaD/5-.025,row,col,legend:legends[row][col]??['↑','↓','←','→'][col%4]});
  }
 }
 if(full){
  const functions=['Esc',...Array.from({length:12},(_,i)=>'F'+(i+1)),'Prt','Scr','Pause'];
  for(let i=0;i<16;i++)layout.push({x:-w*.40+i*w*.82/15,z:-d*.40,w:.18,d:.15,row:5,col:i,legend:functions[i]});
  const nav=['Ins','Home','PgUp','Del','End','PgDn','↑','←','↓','→'];
  for(let i=0;i<10;i++)layout.push({x:w*.18+(i<6?i%3:i===6?1:i-7)*.2,z:-d*.22+(i<6?Math.floor(i/3):i===6?3:4)*.22,w:.17,d:.18,row:6,col:i,legend:nav[i]});
  const numberpad=[['Num',0,0],['/',1,0],['*',2,0],['−',3,0],['7',0,1],['8',1,1],['9',2,1],['+',3,1.5],['4',0,2],['5',1,2],['6',2,2],['1',0,3],['2',1,3],['3',2,3],['Ent',3,3.5],['0',.5,4],['.',2,4]];
  numberpad.forEach(([legend,x,z],i)=>layout.push({x:w*.31+x*.18,z:-d*.23+z*.22,w:legend==='0'?.33:.15,d:['+','Ent'].includes(legend)?.40:.18,row:7,col:i,legend}));
  for(let i=0;i<8;i++)layout.push({x:-w*.47,z:-d*.35+i*.15,w:.15,d:.12,row:8,col:i,legend:i===0?'MR':i===7?'Fn':'G'+i});
  layout[0].legend='~';
 }
 const geometry=new THREE.BoxGeometry(1,1,1),keys=new THREE.InstancedMesh(geometry,plastic('#ffffff'),layout.length),t=new THREE.Object3D();keys.castShadow=true;
 layout.forEach((k,i)=>{t.position.set(k.x,h*.78,k.z);t.scale.set(k.w,h*.38,k.d);t.updateMatrix();keys.setMatrixAt(i,t.matrix);const accent=light&&(k.row===0&&k.col===0||k.row===4&&k.col===3),modifier=k.row===4||k.col===0||k.col===rows[k.row]-1;keys.setColorAt(i,new THREE.Color(accent?'#e6c52e':light?modifier?'#a59f91':'#e6e4dd':p.id==='ryze'&&k.col>0&&k.col<11?'#d7d8d4':'#3b4247'));});g.add(keys);
 // One small atlas for the key legends, shared by all key surfaces.
 const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle=light?'#605c54':'#d9e4e5';ctx.textAlign='center';
 for(let i=0;i<layout.length;i++){const text=layout[i].legend??(layout[i].row===5?'F'+(layout[i].col+1):String(layout[i].col+1));ctx.font=(text.length>2?'10':'18')+'px Arial';ctx.fillText(text,(i%8)*64+32,Math.floor(i/8)*32+22,58);}
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;const legendMat=new THREE.MeshStandardMaterial({map,transparent:true,depthWrite:false,roughness:.8});
 layout.forEach((k,i)=>{const geo=new THREE.PlaneGeometry(Math.min(k.w,.23),.115),uv=geo.attributes.uv;for(let j=0;j<uv.count;j++)uv.setXY(j,(uv.getX(j)+i%8)/8,(uv.getY(j)+15-Math.floor(i/8))/16);const m=new THREE.Mesh(geo,legendMat);m.rotation.x=-Math.PI/2;m.position.set(k.x,h*.98,k.z);g.add(m);});
 const led=new THREE.MeshStandardMaterial({color:0xc8e2e8,emissive:0xc8e2e8,emissiveIntensity:.8,roughness:.4});
 for(const sign of [-1,1])box(g,w-.1,.018,.018,0,h*.53,sign*(full?d*.32:d*.46),led);
 g.userData.cableStart=[0,.09,-d/2];
 return g;
}
function mouse(p){
 const g=new THREE.Group(),[w,d,h]=p.dimensions.map(v=>v/100),white=p.id==='griffin',mat=plastic(white?'#e2e5e3':'#242b2f'),trim=plastic('#11191d');
 const shell=new THREE.Mesh(new THREE.SphereGeometry(1,32,20,0,Math.PI*2,0,Math.PI/2),mat);shell.scale.set(w*.46,h*.92,d*.49);shell.position.y=.02;g.add(shell);
 box(g,w*.70,.045,d*.76,0,.027,0,trim);
 // Curved click panels follow the shell instead of floating rectangular pads.
 for(const side of [-1,1]){
  const vertices=[],indices=[],nx=8,nz=12;
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const z=d*(-.43+j/nz*.39),slice=Math.sqrt(1-(z/(d*.49))**2),a=.065+i/nx*.96;vertices.push(side*w*.466*slice*Math.sin(a),.026+h*.935*slice*Math.cos(a),z);}
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1;indices.push(a,c,b,b,c,c+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const paddleMaterial=plastic(white?'#eef0ed':'#30383d');paddleMaterial.side=THREE.DoubleSide;g.add(new THREE.Mesh(geo,paddleMaterial));
 }
 const wheelY=.02+h*.92*Math.sqrt(1-(.22/.49)**2);
 box(g,.095,.02,.22,0,wheelY,-d*.22,trim);
 const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.065,20),plastic('#687277'));wheel.rotation.z=Math.PI/2;wheel.position.set(0,wheelY+.015,-d*.22);g.add(wheel);
 for(let i=0;i<(p.id==='king'?1:2);i++){const z=-.02+i*.08,y=.03+h*.92*Math.sqrt(1-(z/(d*.49))**2);box(g,.065,.018,.05,0,y,z,trim);}
 for(let i=0;i<2;i++)box(g,.04,.055,.16,-w*.43,h*.46,-d*.12+i*.19,trim);
 if(p.id==='g502'||p.id==='griffin'){const shape=new THREE.Shape();shape.moveTo(-w*.35,-d*.26);shape.lineTo(-w*.51,-d*.19);shape.lineTo(-w*.53,d*.16);shape.lineTo(-w*.34,d*.32);shape.closePath();const rest=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.055,bevelEnabled:true,bevelSize:.015,bevelThickness:.01,bevelSegments:1}),trim);rest.rotation.x=Math.PI/2;rest.position.y=.10;g.add(rest);}
 if(p.id==='g502')for(let i=0;i<3;i++)box(g,.025,.02,.07,-w*.30,h*.65,-d*.23+i*.10,plastic('#a9cdd6'));
 const logoZ=d*.16,logoY=.035+h*.92*Math.sqrt(1-(logoZ/(d*.49))**2);
 label(g,p.id==='g502'?'G':'REDRAGON',p.id==='g502'?.13:.25,.07,0,logoY,logoZ,[-Math.PI/2+.24,0,0],p.rgb?'#add4dd':'#879094');
 if(p.wired)g.userData.cableStart=[0,.06,-d/2];
 return g;
}
function monitor(p){
 const g=new THREE.Group(),[w,d,h]=p.dimensions.map(v=>v/100),screenH=(w-.10)/p.ratio,bodyY=h-screenH/2-.04,black=plastic('#171d20'),metal=plastic('#2b3439');
 box(g,p.curved?2.7:2.2,.065,p.curved?2.6:1.65,0,.04,0,metal);box(g,.23,h*.55,.18,0,h*.29,-.06,metal);
 const screen=new THREE.Group();screen.position.set(0,bodyY,0);g.add(screen);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d'),bg=ctx.createLinearGradient(0,0,512,256);bg.addColorStop(0,'#152e36');bg.addColorStop(.55,'#587b89');bg.addColorStop(1,'#d0dbd7');ctx.fillStyle=bg;ctx.fillRect(0,0,512,256);
 for(let i=0;i<8;i++){ctx.strokeStyle='#d6efff25';ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(350,310,80+i*28,160+i*18,-.7,0,Math.PI*2);ctx.stroke();}ctx.fillStyle='#ffffffde';ctx.font='300 30px Arial';ctx.fillText('PCmaker',26,205);ctx.font='12px Arial';ctx.fillText('ТВОЁ РАБОЧЕЕ МЕСТО',28,229);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const surface=new THREE.PlaneGeometry(w-.09,screenH-.10,p.curved?40:1,1);
 if(p.curved){const pos=surface.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i);pos.setZ(i,x*x/30);}surface.computeVertexNormals();}
 const display=new THREE.Mesh(surface,new THREE.MeshBasicMaterial({map:texture}));display.position.z=.105;screen.add(display);
 // Match the bent panel with a segmented rear shell and flush edge strips.
 const segments=p.curved?32:1;
 for(let i=0;i<segments;i++){const x=-w/2+w/segments*(i+.5),z=p.curved?x*x/30:0,angle=p.curved?-Math.atan(x/15):0;const b=box(screen,w/segments+.006,screenH,.16,x,0,z-.01,black);b.rotation.y=angle;for(const sign of [-1,1]){const edge=box(screen,w/segments+.008,.05,.19,x,sign*screenH/2,z,black);edge.rotation.y=angle;}}
 for(const sign of [-1,1])box(screen,.045,screenH,.19,sign*w/2,0,p.curved?w*w/120:0,black);
 label(screen,'xiaomi',.48,.065,0,-screenH/2+.012,.11);
 for(let i=0;i<(p.curved?4:2);i++){box(screen,.13,.065,.03,-.25+i*.18,-screenH*.25,-.105,plastic('#839092'));box(screen,.10,.037,.035,-.25+i*.18,-screenH*.25,-.124,black);}
 g.userData.cableStart=[-.25,bodyY-screenH*.25,-.14];
 return g;
}

export class WorkplaceScene extends PCScene{
 rearPort(g,type,x,y,...rest){super.rearPort(g,type,x,y,...rest);const anchor=new THREE.Object3D();anchor.position.set(x,y,-2.20);anchor.userData.externalPort=type;g.add(anchor);}
 initInteraction(){/* Workplace selection is independent of the builder's cable tools. */}
 fitCaseView(){if(this.workplaceReady)this.fitWorkplace();}
 reset(){if(this.workplaceReady)this.focus('all');}
 constructor(container,build,options={}){
  super(container);this.controls.maxDistance=110;this.controls.minDistance=2;this.controls.enablePan=true;this.camera.far=220;this.camera.updateProjectionMatrix();this.setBuild(build);this.setFanLayout(options.fans);this.collectLights();this.setLighting(options.lighting);
  this.root.rotation.y=-Math.PI/2;this.root.position.set(6,deskY+.05,-.6);this.hideGlass=true;this.glass.visible=false;
  this.scene.children.filter(o=>o.isGridHelper).forEach(o=>o.removeFromParent());
  this.desk=new THREE.Group();this.scene.add(this.desk);box(this.desk,18,.24,8,0,deskY-.12,0,plastic('#414a4d'));
  for(const x of [-8,8])for(const z of [-3,3])box(this.desk,.25,deskY-.24,.25,x,(deskY-.24)/2,z,plastic('#1d252a'));
  box(this.desk,8.5,.025,3.5,-1.6,deskY+.013,1.5,plastic('#171f24'));
  this.peripheralRoot=new THREE.Group();this.scene.add(this.peripheralRoot);this.workplaceReady=true;this.focus('all');
  this.renderer.domElement.addEventListener('pointerdown',e=>{this.workplaceDown={x:e.clientX,y:e.clientY,button:e.button};});
  this.renderer.domElement.addEventListener('pointerup',e=>{const s=this.workplaceDown;this.workplaceDown=null;if(!s||s.button!==0||Math.hypot(e.clientX-s.x,e.clientY-s.y)>5)return;const r=container.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),this.camera);for(const hit of ray.intersectObject(this.peripheralRoot,true)){let node=hit.object;while(node&&!node.userData.productId)node=node.parent;if(node){this.onProduct?.(node.userData.productId);break;}}});
 }
 setPeripherals(value){
  for(const child of [...this.peripheralRoot.children])dispose(child);
  const selected=sanitizeWorkplace(value);for(const [key,id] of Object.entries(selected)){const p=peripheralById[id],group=key==='monitor'?monitor(p):key==='keyboard'?keyboard(p):mouse(p);group.userData.productId=id;group.position.set(key==='mouse'?1.8:-1.9,deskY+.035,key==='monitor'?-1.45:2.0);this.peripheralRoot.add(group);}
  this.connectPeripherals();
 }
 connectPeripherals(){
  this.scene.updateMatrixWorld(true);
  const ports=(part,type)=>{const result=[];part?.traverse(o=>{if(o.userData.externalPort===type)result.push(o);});return result;},usb=ports(this.parts.motherboard,'usb'),video=ports(this.parts.gpu,'video');
  for(const group of [...this.peripheralRoot.children]){
   const p=peripheralById[group.userData.productId],port=p.category==='monitor'?video[0]:usb[p.category==='keyboard'?0:1];if(!port)continue;
   const end=port.getWorldPosition(new THREE.Vector3()),wire=new THREE.Group();this.peripheralRoot.add(wire);
   if(!p.wired&&p.category==='mouse'){box(wire,.14,.055,.07,end.x+.05,end.y,end.z,plastic('#151b20'));continue;}
   const start=group.localToWorld(new THREE.Vector3(...group.userData.cableStart)),z=-3.45+(p.category==='keyboard'?.05:p.category==='mouse'?.10:0),outside=end.x+.28;
   const route=p.category==='monitor'?[[start.x,start.y,start.z],[start.x,start.y,start.z-.3],[start.x,deskY+.08,z]]:[[start.x,start.y,start.z],[start.x,deskY+.08,start.z-.3],[p.category==='keyboard'?-4:2.8,deskY+.08,.45],[p.category==='keyboard'?-4:2.8,deskY+.08,z]];
   tube(wire,[...route,[outside,deskY+.08,z],[outside,deskY+.12,end.z-.25],[outside,end.y-.15,end.z],[end.x+.1,end.y,end.z],end.toArray()],.017);
   box(wire,.12,.065,.12,end.x+.035,end.y,end.z,plastic('#151b20'));
  }
 }
 fitWorkplace(){if(!this.focusName||this.focusName==='all')this.focus('all');}
 focus(name){this.focusName=name;const views={all:{target:[0,6.1,0],offset:[13,11,25],size:21},monitor:{target:[-1.9,10,-1.45],offset:[1,1.5,12],size:10},keyboard:{target:[-1.9,7.6,2],offset:[0,5,4],size:6},mouse:{target:[1.8,7.7,2],offset:[2,2,3],size:3}};const view=views[name]||views.all,target=new THREE.Vector3(...view.target),offset=new THREE.Vector3(...view.offset);const minDistance=view.size/(2*Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2))*Math.min(this.camera.aspect,1.45));offset.setLength(Math.max(offset.length(),minDistance));this.controls.target.copy(target);this.camera.position.copy(target).add(offset);this.controls.update();}
 dispose(){if(this.peripheralRoot)dispose(this.peripheralRoot);if(this.desk)dispose(this.desk);super.dispose();}
}
