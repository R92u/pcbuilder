import * as THREE from './vendor/three.module.js';

// Coordinates are in the same 100 mm units as the desk and other peripherals.
// One closed surface owns the silhouette; all seams and perforations live on it.
export function mouseProfile(p){
 const [w,d,h]=p.dimensions.map(n=>n/100);
 return {w,d,h,ergonomic:!!p.thumbRest||['g502','griffin','aatrox','gainer'].includes(p.id),
  angular:p.id==='g502'||p.name.includes('G502'),perforated:p.perforated||p.id==='mg8',metal:p.id==='mg8',
  light:p.colors.includes('white')&&!p.colors.includes('black')};
}
export function mouseSurface(profile,v,angle){
 const {w,d,h,ergonomic,angular}=profile;
 const cap=Math.sqrt(Math.max(0,1-Math.abs(v)**(angular?4:3.2)));
 const waist=1-.095*Math.exp(-(((v+.06)/.34)**2));
 const c=Math.cos(angle),s=Math.sin(angle),base=h*.12;
 let x=w*.49*cap*waist*c;
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
function texture(p,f){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');
 const body=f.light?'#e6e7e3':f.metal?'#555b60':'#30363b',seam=f.light?'#485052':'#11171b';
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
 if(f.metal){
 // Broad triangular apertures follow the magnesium model's cutout pattern.
 const holes=[[[122,163],[166,139],[169,200]],[[185,160],[215,185],[184,214]],[[298,183],[327,160],[329,214]],[[346,141],[390,165],[345,201]],[[126,216],[171,226],[168,247]],[[340,226],[386,214],[343,247]],[[125,280],[212,308],[126,345]],[[300,308],[386,280],[385,345]],[[178,330],[250,355],[175,386]],[[262,355],[335,330],[336,386]],[[127,365],[151,392],[129,426]],[[361,391],[385,365],[383,426]]];
 for(const points of holes){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle='#151b1f';ctx.fill();ctx.strokeStyle='#87909766';ctx.lineWidth=2;ctx.stroke();}
}else if(f.perforated){
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
 const shell=new THREE.Mesh(surfaceGeometry(f),new THREE.MeshStandardMaterial({color:withTexture?'#ffffff':f.light?'#e6e7e3':'#30363b',map:withTexture?texture(p,f):null,roughness:f.metal?.58:.6,metalness:f.metal?.22:.04}));shell.name='continuous-shell';shell.castShadow=true;shell.receiveShadow=true;group.add(shell);
 const dark=new THREE.MeshStandardMaterial({color:'#22292e',roughness:.7,metalness:.03});
 const sideCount=p.sideButtons??(p.id==='g502'?3:2);
 for(let i=0;i<sideCount;i++){
  const many=sideCount>3,angle=many?2.28+Math.floor(i/4)*.22:2.55,v=many?-.48+(i%4)*.18:-.30+i*.25;
  const button=new THREE.Mesh(buttonPatch(f,v,angle,many?.15:.21,many?.17:.23),dark);button.name='side-button';group.add(button);
 }
 // Rubber wheel, axle across the mouse; only the upper arc projects above the shell.
 const wheelV=-.51,wheelZ=wheelV*f.d/2,radius=f.d*.063,axleY=mouseSurface(f,wheelV,Math.PI/2).y-radius*.63;
 const wheel=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,f.w*.105,32),dark);wheel.name='scroll-wheel';wheel.rotation.z=Math.PI/2;wheel.position.set(0,axleY,wheelZ);group.add(wheel);
 const ribs=new THREE.InstancedMesh(new THREE.BoxGeometry(f.w*.107,.006,.009),new THREE.MeshStandardMaterial({color:f.light?'#9ba4a5':'#697378',roughness:.75}),24),t=new THREE.Object3D();
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2;t.position.set(0,axleY+Math.cos(a)*radius,wheelZ+Math.sin(a)*radius);t.rotation.x=a;t.updateMatrix();ribs.setMatrixAt(i,t.matrix);}ribs.name='wheel-tread';group.add(ribs);
 if(p.wired){
  const boot=new THREE.Mesh(new THREE.CylinderGeometry(.023,.028,.11,12),dark);boot.rotation.x=Math.PI/2;boot.position.set(0,f.h*.12,-f.d/2+.01);boot.name='cable-boot';group.add(boot);group.userData.cableStart=[0,f.h*.12,-f.d/2-.04];
 }
 group.userData.mouseProfile=f;return group;
}
