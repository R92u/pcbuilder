import {mg8Shell,addMG8Interior} from './mg8-model.js';
import * as THREE from './vendor/three.module.js';

// Coordinates are in the same 100 mm units as the desk and other peripherals.
// One closed surface owns the silhouette; all seams and perforations live on it.
export function mouseProfile(p){
 const [w,d,h]=p.dimensions.map(n=>n/100);
 return {w,d,h,iskra:p.printStyle==='hsr-iskra',ergonomic:!!p.thumbRest||['g502','griffin','aatrox','gainer'].includes(p.id),
  angular:p.id==='g502'||p.name.includes('G502'),perforated:p.perforated||p.id==='mg8',metal:p.id==='mg8',
  light:p.colors.includes('white')&&!p.colors.includes('black')};
}
// Silhouette widths sampled along the overhead MG8 reference, excluding the receiver.
const mg8Widths=[0, 208, 306, 362, 382, 388, 390, 392, 392, 390, 391, 394, 391, 389, 380, 382, 386, 387, 392, 396, 402, 404, 402, 400, 390, 376, 356, 324, 280, 206, 0];
function mg8Width(v){
 const t=Math.max(0,Math.min(30,(v+1)*15)),i=Math.min(29,Math.floor(t));
 return THREE.MathUtils.lerp(mg8Widths[i],mg8Widths[i+1],t-i)/404;
}
export function mouseSurface(profile,v,angle){
 const {w,d,h,ergonomic,angular}=profile;
 const cap=Math.sqrt(Math.max(0,1-Math.abs(v)**(angular?4:3.2)));
 const waist=1-.095*Math.exp(-(((v+.06)/.34)**2));
 const c=Math.cos(angle),s=Math.sin(angle),base=h*.12;
 let x=profile.metal?w*.4999*mg8Width(v)*c:w*.49*cap*waist*c;
 if(ergonomic){
  x*=.86;
  // A continuous thumb ledge, rather than an intersecting extruded plate.
  x-=w*.085*Math.exp(-(((v+.02)/.52)**2))*Math.max(0,-c)**7;
 }
 const crown=h*.86*Math.pow(Math.max(0,1-v*v),.48)*(.89+.18*v);
 const tilt=ergonomic?1-.08*c:1;
 const y=base+(s>=0?crown*Math.pow(s,.72)*tilt:base*.92*s);
 return new THREE.Vector3(x,y,v*d/2);
}
function surfaceGeometry(profile){
 const rows=64,around=64,positions=[],uv=[],index=[];
 // Single vertices at either end avoid stacks of degenerate pole triangles.
 positions.push(0,profile.h*.12,-profile.d/2);uv.push(.5,1);
 for(let row=1;row<rows;row++)for(let j=0;j<around;j++){
  const pt=mouseSurface(profile,-1+2*row/rows,j/around*Math.PI*2);
  positions.push(...pt.toArray());uv.push(pt.x/profile.w+.5,.5-pt.z/profile.d);
 }
 const end=positions.length/3;positions.push(0,profile.h*.12,profile.d/2);uv.push(.5,0);
 for(let j=0;j<around;j++){const next=(j+1)%around;index.push(0,1+j,1+next);}
 for(let row=0;row<rows-2;row++)for(let j=0;j<around;j++){
  const a=1+row*around+j,b=1+row*around+(j+1)%around,c=a+around,e=b+around;
  index.push(a,c,b,b,c,e);
 }
 for(let j=0;j<around;j++)index.push(end,1+(rows-2)*around+(j+1)%around,1+(rows-2)*around+j);
 for(let i=0;i<index.length;i+=3)[index[i+1],index[i+2]]=[index[i+2],index[i+1]];
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(index);geo.computeVertexNormals();
 return geo;
}

// Artwork is drawn locally: no asynchronous network dependency in the 3D scene.
function iskraTexture(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
 const c=canvas.getContext('2d'),S=1024;
 const body=c.createLinearGradient(0,0,S,S);body.addColorStop(0,'#d62c35');body.addColorStop(.55,'#b7212b');body.addColorStop(1,'#70131f');
 c.fillStyle=body;c.fillRect(0,0,S,S);
 function diamond(x,y,r,color){c.fillStyle=color;c.beginPath();c.moveTo(x,y-r);c.lineTo(x+r,y);c.lineTo(x,y+r);c.lineTo(x-r,y);c.closePath();c.fill();}
 for(let y=580;y<1024;y+=39)for(let x=24;x<1024;x+=52){const size=2+15*Math.sin((y-580)/444*Math.PI);diamond(x+(Math.round(y/39)%2)*26,y,size,'#64101c80');}
 // Split front buttons, bounded by their seam at v=-.12.
 c.fillStyle='#ecece9';c.fillRect(0,0,512,450);c.fillStyle='#101113';c.fillRect(512,0,512,450);
 c.fillStyle='#e9e9e7';c.beginPath();c.moveTo(922,0);c.lineTo(1024,0);c.lineTo(1024,450);c.lineTo(686,450);c.lineTo(735,342);c.lineTo(820,251);c.lineTo(786,218);c.closePath();c.fill();
 for(let y=8;y<196;y+=27)for(let x=12;x<1024;x+=34){const r=10*(1-y/220);diamond(x+(Math.round(y/27)%2)*17,y,r,x<512?'#b7b9b94a':'#44464a75');}
 // Pixel cross, heart and X on the left button.
 const pixel=(rows,x,y,k)=>{c.fillStyle='#17191b';rows.forEach((row,j)=>[...row].forEach((v,i)=>{if(v==='1')c.fillRect(x+i*k,y+j*k,k,k);}));};
 pixel(['00100','00100','11111','00100','00100'],262,99,8);
 pixel(['0110110','1101011','1000001','0100010','0010100','0001000'],254,185,7);
 pixel(['10001','01010','00100','01010','10001'],269,294,8);
 // White rabbit mask, dark hat and crimson ears.
 c.fillStyle='#bd2632';c.beginPath();c.moveTo(672,251);c.bezierCurveTo(632,207,649,174,663,154);c.bezierCurveTo(684,186,698,221,689,251);c.fill();
 c.beginPath();c.moveTo(878,278);c.bezierCurveTo(886,224,925,207,943,198);c.bezierCurveTo(937,238,919,266,889,286);c.fill();
 c.fillStyle='#0b0c0e';c.save();c.translate(791,268);c.rotate(.22);c.fillRect(-64,-55,125,62);c.beginPath();c.ellipse(0,17,107,17,0,0,Math.PI*2);c.fill();c.fillStyle='#bb2734';c.fillRect(-61,-9,119,14);c.restore();
 c.fillStyle='#111214';c.beginPath();c.ellipse(807,347,13,19,.3,0,Math.PI*2);c.fill();
 c.fillStyle='#c52a36';c.beginPath();c.moveTo(642,289);c.quadraticCurveTo(666,322,705,331);c.quadraticCurveTo(654,338,642,289);c.fill();
 c.fillStyle='#eeeeea';c.beginPath();c.ellipse(717,376,42,23,-.25,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(752,385,30,24,.5,0,Math.PI*2);c.fill();
 c.fillStyle='#b92430';c.beginPath();c.moveTo(715,354);c.lineTo(744,358);c.lineTo(732,370);c.closePath();c.fill();
 // Crescent cutout uses the actual gradient, rather than a flat red patch.
 c.save();c.beginPath();c.ellipse(512,857,35,61,.2,0,Math.PI*2);c.clip();c.fillStyle='#f4f3ed';c.fillRect(460,785,110,150);c.fillStyle=body;c.beginPath();c.ellipse(532,844,34,62,.2,0,Math.PI*2);c.fill();c.restore();
 c.strokeStyle='#181719';c.lineWidth=6;c.beginPath();c.moveTo(512,0);c.lineTo(512,450);c.moveTo(0,451);c.lineTo(1024,451);c.stroke();
 c.fillStyle='#111214';c.beginPath();c.roundRect(460,117,104,177,25);c.fill();
 c.fillStyle='#dce9ab';c.beginPath();c.arc(512,495,6,0,Math.PI*2);c.fill();
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
 // Projection of the official top photograph, cropped to the device silhouette.
 // UV U follows left-to-right; V follows front-to-back, as for the other mice.
 const image=new Image();
 image.onload=()=>{c.drawImage(image,image.naturalWidth*.335,image.naturalHeight*.187,image.naturalWidth*.328,image.naturalHeight*.625,0,0,S,S);map.needsUpdate=true;};
 image.onerror=()=>{}; // Keep the self-contained edition artwork if the photo is unavailable.
 map.addEventListener('dispose',()=>{image.onload=null;image.onerror=null;});
 image.src=new URL('./assets/peripherals/lunacy-one-hsr-iskra.webp',import.meta.url).href;
 return map;
}

function texture(p,f){
 if(f.iskra)return iskraTexture();
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');
 const body=p.appearance?.body||(f.light?'#e6e7e3':f.metal?'#555b60':'#30363b'),seam=f.light?'#485052':'#11171b';
 ctx.fillStyle=body;ctx.fillRect(0,0,512,512);
 const xy=(x,v)=>[(x+.5)*512,(v+1)*256];
 function path(points,color,width){ctx.beginPath();points.forEach(([x,v],i)=>{const pt=xy(x,v);i?ctx.lineTo(...pt):ctx.moveTo(...pt);});ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();}
 // U-shaped independent click buttons; no overlapping meshes or floating labels.
 const seamV=f.angular?-.02:-.12;
 const outline=[[-.39,-.91],[-.40,-.65],[-.38,-.25],[-.35,seamV-.015],[-.2,seamV],[0,seamV+.012],[.2,seamV],[.35,seamV-.015],[.38,-.25],[.40,-.65],[.39,-.91]];
 path(outline,seam,3.2);path([[0,-1],[0,seamV+.012]],seam,2.5);
 if(f.angular){path([[-.34,.04],[-.10,.17],[.28,.04]],'#11181b',9);path([[-.34,.45],[-.12,.58],[-.04,.9]],'#151c20',3);}
 // The wheel sits in this recessed aperture, partly inside the shell.
 ctx.fillStyle='#11171b';ctx.beginPath();ctx.roundRect(232,80,48,92,13);ctx.fill();
 const dpi=p.dpiButtons??(['king','k1ng-4k-pro-white','mg8','azzmach-lite-white'].includes(p.id)?0:['gainer'].includes(p.id)?1:2);
 for(let i=0;i<dpi;i++){ctx.fillStyle=seam;ctx.beginPath();ctx.roundRect(242,183+i*30,28,23,5);ctx.fill();ctx.fillStyle=f.light?'#c7ccca':'#51595e';ctx.beginPath();ctx.roundRect(245,186+i*30,22,17,4);ctx.fill();}
 if(f.perforated){
 for(let row=0;row<9;row++)for(let col=0;col<7;col++){
   const x=128+col*39+(row%2)*18,y=155+row*32;
   if(y<251&&Math.abs(x-256)<40||y>375&&Math.abs(x-256)<65||x>400)continue;
   ctx.beginPath();const sides=f.metal?3:6,r=f.metal?15:11;
   for(let i=0;i<sides;i++){const a=(i/sides)*Math.PI*2-Math.PI/2;const xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.closePath();ctx.fillStyle='#11181c';ctx.fill();ctx.strokeStyle='#6a74796b';ctx.lineWidth=1.5;ctx.stroke();
  }
 }
 ctx.fillStyle=f.light?'#939b9b':p.rgb?'#9ebcc5':'#7f8a90';ctx.textAlign='center';ctx.font=p.id==='g502'?'bold 47px Arial':'500 17px Arial';ctx.fillText(p.brand==='Logitech'||p.id==='g502'?'G':(p.brand||'REDRAGON').toUpperCase(),256,408);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return map;
}
function buttonPatch(f,v,angle,length,span){
 const positions=[],uv=[],index=[],n=8;
 for(let i=0;i<=n;i++)for(let j=0;j<=n;j++){
  const u=i/n,t=j/n,a=angle+(t-.5)*span,pt=mouseSurface(f,v+(u-.5)*length,a);
  const lift=.002+.009*Math.sin(Math.PI*u)*Math.sin(Math.PI*t);
  pt.addScaledVector(new THREE.Vector3(Math.cos(a),Math.sin(a),0),lift);
  positions.push(...pt.toArray());uv.push(u,t);
 }
 for(let i=0;i<n;i++)for(let j=0;j<n;j++){const a=i*(n+1)+j,b=a+1,c=a+n+1;index.push(a,c,b,b,c,c+1);}
 for(let i=0;i<index.length;i+=3)[index[i+1],index[i+2]]=[index[i+2],index[i+1]];
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(index);geo.computeVertexNormals();return geo;
}
export function createMouseModel(p,{withTexture=true}={}){
 const f=mouseProfile(p),group=new THREE.Group();group.name='Mouse '+p.id;
 const shellGeometry=f.metal?mg8Shell(f,mouseSurface):surfaceGeometry(f);
 if(f.iskra){
  const pos=shellGeometry.getAttribute('position'),idx=shellGeometry.index;let start=0,last=-1;
  for(let i=0;i<idx.count;i+=3){const bottom=[0,1,2].every(k=>pos.getY(idx.getX(i+k))<=f.h*.121),m=bottom?1:0;if(m!==last){if(last!==-1)shellGeometry.addGroup(start,i-start,last);start=i;last=m;}}
  shellGeometry.addGroup(start,idx.count-start,last);
 }
 const shell=new THREE.Mesh(shellGeometry,new THREE.MeshStandardMaterial({color:f.metal?'#161616':withTexture?'#ffffff':p.appearance?.body?p.appearance.body:f.iskra?'#b9232d':f.light?'#e6e7e3':'#30363b',map:withTexture&&!f.metal?texture(p,f):null,roughness:f.metal?.70:.6,metalness:f.metal?.22:.04}));if(f.iskra)shell.material=[shell.material,new THREE.MeshStandardMaterial({color:'#b9232d',roughness:.65})];shell.name='continuous-shell';shell.castShadow=true;shell.receiveShadow=true;group.add(shell);
 const dark=new THREE.MeshStandardMaterial({color:f.metal?'#111111':'#22292e',roughness:.7,metalness:.03});
 if(f.metal)addMG8Interior(group,f,mouseSurface);
 const sideCount=p.sideButtons??(p.id==='g502'?3:2);
 for(let i=0;i<sideCount;i++){
  const many=sideCount>3,angle=many?2.28+Math.floor(i/4)*.22:2.55,v=many?-.48+(i%4)*.18:-.30+i*.25;
  const button=new THREE.Mesh(buttonPatch(f,v,angle,many?.15:.21,many?.17:.23),f.iskra?new THREE.MeshStandardMaterial({color:'#efefec',roughness:.65}):dark);button.name='side-button';group.add(button);
 }
 // Rubber wheel, axle across the mouse; only the upper arc projects above the shell.
 const wheelV=-.51,wheelZ=wheelV*f.d/2,radius=f.d*.063,axleY=mouseSurface(f,wheelV,Math.PI/2).y-radius*.63;
 const wheel=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,f.w*.105,32),p.appearance?.wheel?new THREE.MeshStandardMaterial({color:p.appearance.wheel,roughness:.65}):f.iskra?new THREE.MeshStandardMaterial({color:'#bd2732',roughness:.65}):dark);wheel.name='scroll-wheel';wheel.rotation.z=Math.PI/2;wheel.position.set(0,axleY,wheelZ);group.add(wheel);
 const ribs=new THREE.InstancedMesh(new THREE.BoxGeometry(f.w*.107,.006,.009),new THREE.MeshStandardMaterial({color:f.iskra?'#101113':f.metal?'#202020':f.light?'#9ba4a5':'#697378',roughness:.75}),24),t=new THREE.Object3D();
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2;t.position.set(0,axleY+Math.cos(a)*radius,wheelZ+Math.sin(a)*radius);t.rotation.x=a;t.updateMatrix();ribs.setMatrixAt(i,t.matrix);}ribs.name='wheel-tread';group.add(ribs);
 if(p.wired){
  const boot=new THREE.Mesh(new THREE.CylinderGeometry(.023,.028,.11,12),dark);boot.rotation.x=Math.PI/2;boot.position.set(0,f.h*.12,-f.d/2+.01);boot.name='cable-boot';group.add(boot);group.userData.cableStart=[0,f.h*.12,-f.d/2-.04];
 }
 if(f.iskra){
  const padMat=new THREE.MeshStandardMaterial({color:'#101114',roughness:.8});
  for(const [x,z,w,d] of [[0,-.40,.37,.10],[-.17,.34,.11,.23],[.17,.34,.11,.23],[0,.43,.13,.10]]){
   const pad=new THREE.Mesh(new THREE.BoxGeometry(w,.008,d),padMat);pad.name='ptfe-skate';pad.position.set(x,.002,z);group.add(pad);
  }
  const sensor=new THREE.Mesh(new THREE.CylinderGeometry(.037,.037,.012,24),padMat);sensor.name='optical-sensor';sensor.position.set(0,.003,.025);group.add(sensor);
  const port=new THREE.Mesh(new THREE.BoxGeometry(.10,.028,.025),padMat);port.name='usb-c-port';port.position.set(0,f.h*.12,-f.d/2);group.add(port);group.userData.cableStart=port.position.toArray();
 }
 group.userData.mouseProfile=f;return group;
}
