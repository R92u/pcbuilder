import * as THREE from './vendor/three.module.js';

// One unit = 100 mm. A simplified, volumetric model, not a photo billboard.
function fabricMap(){
 if(typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 const ctx=canvas.getContext('2d');if(!ctx)return null;
 const pixels=ctx.createImageData(256,256);let seed=51;
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){
  seed=(seed*1664525+1013904223)>>>0;
  const v=222+Math.cos(x*Math.PI/2)*7+Math.cos(y*Math.PI/2)*5+(seed%9);
  pixels.data.set([v,v,v,255],(y*256+x)*4);
 }
 ctx.putImageData(pixels,0,0);const map=new THREE.CanvasTexture(canvas);
 map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(7,11);map.anisotropy=4;map.colorSpace=THREE.SRGBColorSpace;return map;
}
function mesh(parent,name,geometry,material,position=[0,0,0]){
 const m=new THREE.Mesh(geometry,material);m.name=name;m.position.set(...position);m.castShadow=m.receiveShadow=true;parent.add(m);return m;
}
function roundedOutline(points,depth,bevel=.1){
 const s=new THREE.Shape();s.moveTo(...points[0]);
 for(let i=1;i<points.length;i+=2)s.quadraticCurveTo(...points[i],...points[(i+1)%points.length]);
 s.closePath();return new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:10,steps:1});
}
function cushion(parent,name,w,h,d,pos,material){
 const detailed=['seat','lumbar-support','headrest-pillow'].includes(name);
 const geometry=new THREE.SphereGeometry(1,detailed?40:24,detailed?24:16),a=geometry.attributes.position;
 const pow=(v,e)=>Math.sign(v)*Math.pow(Math.abs(v),e),e1=name==='seat'?.38:.55,e2=.58;
 // A parametric superellipsoid avoids the pinched corners of coordinate-wise powers.
 const point=(lat,lon)=>{
  const y=pow(Math.sin(lat),e1),ring=Math.pow(Math.abs(Math.cos(lat)),e1);
  let x=ring*pow(Math.cos(lon),e2)*w/2,z=ring*pow(Math.sin(lon),e2)*d/2;
  if(name==='headrest-pillow'){x*=.91+.10*y;z+=.055*x*x/(w*w/4);}
  if(name==='lumbar-support'){x*=.98-.065*y;z+=.10*(1-y*y);}
  return [x,y*h/2,z];
 };
 for(let i=0;i<a.count;i++)a.setXYZ(i,...point(Math.asin(THREE.MathUtils.clamp(a.getY(i),-1,1)),Math.atan2(a.getZ(i),a.getX(i))));
 geometry.computeVertexNormals();const m=mesh(parent,name,geometry,material,pos);
 if(['lumbar-support','headrest-pillow'].includes(name)){
  const thread=new THREE.MeshStandardMaterial({color:'#929593',roughness:1});
  for(const side of [-1,1]){
   const points=[];for(let i=0;i<=24;i++){const v=point(-1.18+i/24*2.36,side<0?Math.PI-.78:.78);v[2]+=.009;points.push(v);}
   tube(m,'upholstery-seam',points,.009,thread);
  }
 }
 return m;
}
function tube(parent,name,points,r,material){return mesh(parent,name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),22,r,5,false),material);}
function rod(parent,name,a,b,r,material){
 const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
 const m=mesh(parent,name,new THREE.CylinderGeometry(r,r,delta.length(),10),material,start.clone().add(end).multiplyScalar(.5).toArray());
 m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;
}
function quiltedPanel(parent,p,cloth,inset,rear=false){
 const creeper=p.id.includes('creeper'),diamond=/imperial|clubpoint|kitty/.test(p.id);
 const racing=/atomic|bastion|gravity|cyberpunk|invader/.test(p.id);
 const width=(t)=>1.55+.32*Math.sin(Math.PI*t)+.32*Math.exp(-((t-.81)**2)/.018);
 const shell=(u,t)=>{
  const crown=(1-u*u)*Math.sin(t*Math.PI);
  const seam=racing?Math.cos((t*7-Math.abs(u)*.65)*Math.PI):Math.cos(u*3*Math.PI);
  const relief=.043*crown*seam;
  return [u*width(t),.57+6.05*t,rear?-.635-.20*crown:.22+.18*crown+relief];
 };
 const across=24,up=36,xyz=[],uv=[],indices=[];
 for(let row=0;row<=up;row++)for(let col=0;col<=across;col++){
  const u=col/across*2-1,t=row/up;xyz.push(...shell(u,t));uv.push(col/across,t);
  if(col&&row){const i=row*(across+1)+col;indices.push(i-across-2,i-across-1,i,i-across-2,i,i-1);}
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(xyz,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
 const fabric=cloth.clone();fabric.side=THREE.DoubleSide;
 mesh(parent,rear?'rear-tailored-panel':'quilted-back-insert',geometry,fabric);
 const threadColor=inset.color.clone().lerp(cloth.color,.32);
 const positions=[];
 // Place the thread on the actual padded surface, including the rounded crown.
 const line=(u1,t1,u2,t2)=>{
  for(let i=0;i<25;i++){
   const a=i/25,b=(i+.60)/25;
   for(const k of [a,b]){
    const pos=shell(u1+(u2-u1)*k,t1+(t2-t1)*k);pos[2]+=rear?-.011:.011;positions.push(...pos);
   }
  }
 };
 for(const side of [-1,1])for(const n of [.91,.96])line(side*n,.02,side*n,.99);
 if(!rear){
  if(racing||diamond)for(let i=0;i<5;i++)for(const side of [-1,1]){
   const y=.13+i*.15;line(0,y,side*.83,y+.105);
   if(diamond)line(0,y+.15,side*.83,y+.045);
  }
  else for(const u of [-.54,-.49,.49,.54])line(u,.08,u,.87);
 }else for(const side of [-1,1]){line(side*.75,.19,side*.34,.46);line(side*.34,.46,side*.78,.8);}
 const threads=new THREE.BufferGeometry();threads.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 const stitching=new THREE.LineSegments(threads,new THREE.LineBasicMaterial({color:threadColor}));stitching.name='double-needle-stitching';parent.add(stitching);
 if(creeper&&!rear){
  const pixels=['110011','110011','001100','011110','011110','010010'];
  for(let y=0;y<pixels.length;y++)for(let x=0;x<6;x++)if(pixels[y][x]==='1'){
   const at=shell((x-2.5)*.155,.83-y*.047);at[2]+=.018;
   mesh(parent,'creeper-pixel',new THREE.BoxGeometry(.31,.29,.034),inset,at);
  }
 }
 for(const side of [-1,1]){
  const pts=Array.from({length:17},(_,i)=>shell(side,i/16));tube(parent,'panel-welt',pts,.028,inset);
 }
}
function branding(parent,p){
 if(typeof document==='undefined')return;
 const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');if(!ctx)return;
 ctx.fillStyle='#85888a';ctx.textAlign='center';ctx.font='500 48px sans-serif';ctx.fillText('ZONE 51',256,60);ctx.font='500 26px sans-serif';ctx.fillText(p.name.replace(/^ZONE 51 /,'').toUpperCase(),256,103,482);
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;
 const m=mesh(parent,'embroidered-brand',new THREE.PlaneGeometry(1.55,.39),new THREE.MeshStandardMaterial({map,transparent:true,depthWrite:false,roughness:1}),[0,7.68,.91]);
 m.rotation.x=-.10;
}
export function createChairModel(p,{withTexture=true}={}){
 const g=new THREE.Group();g.name='gaming-chair';
 const style=p.chairAppearance||{};
 const leather=p.specs?.['Материалы отделки']==='Экокожа';
 const weave=withTexture&&!leather?fabricMap():null;
 const cloth=new THREE.MeshStandardMaterial({color:style.body||'#cbcccb',roughness:leather?.62:.96,metalness:0,map:weave,bumpMap:weave,bumpScale:.012});
 const inset=new THREE.MeshStandardMaterial({color:style.accent||'#b5b7b7',roughness:leather?.66:1});
 const black=new THREE.MeshStandardMaterial({color:style.hardware||'#25292b',roughness:.77});
 const metal=new THREE.MeshStandardMaterial({color:style.hardware||'#353a3c',roughness:.44,metalness:.55});
 const seam=new THREE.MeshStandardMaterial({color:style.accent||'#9a9d9d',roughness:1});
 // Five independent twin-wheel casters and swept steel spokes, all on the floor.
 for(let i=0;i<5;i++){
  const angle=i*Math.PI*2/5+Math.PI/2,x=Math.cos(angle)*3.15,z=Math.sin(angle)*3.15;
  const caster=new THREE.Group();caster.name='caster-'+i;caster.position.set(x,0,z);caster.rotation.y=-angle;g.add(caster);
  for(const side of [-1,1]){
   const wheel=mesh(caster,'wheel',new THREE.CylinderGeometry(.375,.375,.15,32),black,[side*.14,.375,0]);wheel.rotation.z=Math.PI/2;
   const hub=mesh(caster,'wheel-hub',new THREE.CylinderGeometry(.21,.21,.016,24),metal,[side*.223,.375,0]);hub.rotation.z=Math.PI/2;
   const rim=mesh(caster,'rubber-sidewall',new THREE.TorusGeometry(.29,.024,6,28),black,[side*.232,.375,0]);rim.rotation.y=Math.PI/2;
   const axle=mesh(caster,'axle-cap',new THREE.CylinderGeometry(.092,.092,.026,8),black,[side*.24,.375,0]);axle.rotation.z=Math.PI/2;
  }
  rod(caster,'caster-stem',[0,.50,0],[0,.85,0],.10,metal);
  const spoke=rod(g,'base-spoke',[0,1.05,0],[x,.78,z],.14,metal);spoke.scale.x=1.3;
  rod(g,'spoke-highlight',[0,1.18,0],[x,.91,z],.035,metal);
 }
 mesh(g,'gas-lift',new THREE.CylinderGeometry(.24,.27,2.3,20),black,[0,2.0,0]);
 mesh(g,'lift-sleeve',new THREE.CylinderGeometry(.31,.33,1,20),black,[0,1.45,0]);
 mesh(g,'sync6-mechanism',new THREE.BoxGeometry(2.6,.48,2.5),black,[0,3.05,0]);
 rod(g,'height-lever',[.8,3.1,.1],[2.7,3.15,.5],.07,metal);
 cushion(g,'lever-grip',.65,.18,.28,[2.7,3.15,.5],black);
 const dial=mesh(g,'tension-dial',new THREE.CylinderGeometry(.29,.29,.3,24),black,[-1.5,3.0,.65]);dial.rotation.z=Math.PI/2;
 cushion(g,'seat',5.8,1.4,5.15,[0,3.95,.05],cloth);
 for(const side of [-1,1]){
  const bolster=cushion(g,'seat-bolster',.7,.55,4.4,[side*2.52,4.45,-.1],inset);bolster.rotation.z=side*.10;
  const arm=new THREE.Group();arm.name=side<0?'armrest-left':'armrest-right';g.add(arm);
  rod(arm,'arm-bracket',[side*2.45,3.25,-.9],[side*3.45,3.25,-.5],.13,metal);
  mesh(arm,'arm-column',new THREE.CylinderGeometry(.17,.21,2.9,12),black,[side*3.45,4.7,-.5]);
  mesh(arm,'telescoping-sleeve',new THREE.CylinderGeometry(.22,.24,1.3,20),black,[side*3.45,4.0,-.5]);
  cushion(arm,'arm-pad-base',.93,.24,2.42,[side*3.45,6.12,-.35],metal);
  cushion(arm,'arm-pad',1.1,.35,2.7,[side*3.45,6.3,-.35],black);
  mesh(arm,'adjustment-button',new THREE.BoxGeometry(.12,.13,.35),metal,[side*3.96,6.15,-.35]);
 }
 const back=new THREE.Group();back.name='sculpted-back';back.position.set(0,4.35,-2.12);back.rotation.x=-.10;g.add(back);
 const outline=[[0,8.5],[-1.55,8.5],[-1.65,7.6],[-1.7,7.15],[-2.75,6.65],[-3.15,6.2],[-2.7,5.2],[-2.25,3.5],[-2.6,.55],[-2.6,-.1],[0,0],[2.6,-.1],[2.6,.55],[2.25,3.5],[2.7,5.2],[3.15,6.2],[2.75,6.65],[1.7,7.15],[1.65,7.6],[1.55,8.5],[0,8.5]];
 mesh(back,'back-upholstery',roundedOutline(outline,.58,.13),cloth,[0,0,-.48]);
 if(p.chairAppearance){
  cushion(back,'lumbar-support',3.55,1.45,1.08,[0,1.40,.54],inset);
  const seatWidth=Number(p.specs['Ширина сиденья (внешняя), мм']);
  const backWidth=Number(p.specs['Ширина спинки (внешняя), мм']);
  if(seatWidth && backWidth)back.scale.x=THREE.MathUtils.clamp(backWidth/seatWidth,.85,1.15);
 }else cushion(back,'lumbar-support',3.8,4.5,.85,[0,2.45,.30],cloth);
 quiltedPanel(back,p,cloth,inset);
 quiltedPanel(back,p,cloth,inset,true);
 for(const side of [-1,1]){
  const hinge=mesh(g,'recline-hinge',new THREE.CylinderGeometry(.48,.50,.27,28),black,[side*2.73,4.48,-1.76]);hinge.rotation.z=Math.PI/2;
  const cap=mesh(g,'hinge-cap',new THREE.CylinderGeometry(.26,.26,.03,16),metal,[side*2.88,4.48,-1.76]);cap.rotation.z=Math.PI/2;
  tube(g,'pivot-arm',[[side*2.72,4.35,-1.78],[side*2.71,4.86,-1.98],[side*2.47,5.62,-2.12]],.105,black);
  const strap=cushion(back,'lumbar-strap',.22,4.45,.078,[side*.99,3.4,-.79],black);
  for(const y of [-.36,.36])mesh(strap,'slide-buckle',new THREE.BoxGeometry(.31,.055,.11),metal,[0,y,-.04]);
 }
 for(const y of [1.82,1.98,2.14,2.30])mesh(g,'lift-bellows',new THREE.CylinderGeometry(.32,.37,.13,18),black,[0,y,0]);
 mesh(g,'piston',new THREE.CylinderGeometry(.19,.19,.61,18),new THREE.MeshStandardMaterial({color:0xbac0c4,metalness:.78,roughness:.25}),[0,2.61,0]);
 for(const side of [-1,1]){
  const bolster=cushion(back,'back-side-bolster',.65,4.8,.65,[side*2.15,2.65,.16],inset);bolster.rotation.z=side*.055;
  tube(back,'shoulder-stitch',[[side*1.35,7.8,.16],[side*1.7,6.7,.17],[side*1.9,5.7,.18],[side*1.55,4.85,.18]],.012,seam);
  tube(back,'rear-piping',[[side*2.25,.25,-.62],[side*2.1,3.5,-.62],[side*2.45,6.05,-.62]],.035,black);
 }
 // The head pillow and its black rear strap are separate from the backrest.
 cushion(back,'headrest-pillow',3.35,2.15,.95,[0,7.05,.42],cloth);
 for(const side of [-1,1]){
  const seamPoints=[[side*2.21,4.57,1.94],[side*2.36,4.63,1.12],[side*2.39,4.65,.04],[side*2.28,4.60,-1.50]];
  tube(g,'seat-piping',seamPoints,.034,seam);
 }
 mesh(back,'pillow-strap',new THREE.BoxGeometry(3.25,.27,.025),black,[0,7.55,-.63]);
 // Small three-pronged stitched emblem, visible from all camera distances.
 for(const angle of [Math.PI/2,7*Math.PI/6,11*Math.PI/6]){
  const shape=new THREE.Shape();shape.moveTo(-.045,.04);shape.lineTo(0,.45);shape.lineTo(.10,.13);shape.closePath();
  const logo=mesh(back,'headrest-emblem',new THREE.ShapeGeometry(shape),black,[0,7.2,.93]);logo.rotation.z=angle-Math.PI/2;
 }
 if(style.ears){
  const cat=style.ears==='cat';
  for(const side of [-1,1]){
   const holder=new THREE.Group();
   holder.position.set(side*.73,8.42,-.18);
   holder.rotation.z=side*-.19;
   back.add(holder);
   if(cat){
    const ear=new THREE.Shape();
    ear.moveTo(-.46,0);ear.lineTo(0,.68);ear.lineTo(.46,0);ear.closePath();
    mesh(holder,'cat-ear',new THREE.ExtrudeGeometry(ear,{depth:.16,bevelEnabled:false}),inset);
   }else{
    cushion(holder,'rabbit-ear',.57,1.54,.28,[0,.64,0],inset);
    cushion(holder,'ear-lining',.28,1.10,.09,[0,.68,.14],cloth);
   }
  }
 }
 if(withTexture)branding(back,p);
 // Match the declared static configuration, including the floor contact point.
 g.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(g),size=bounds.getSize(new THREE.Vector3()),[w,d,h]=p.dimensions.map(v=>v/100);
 g.scale.set(w/size.x,h/size.y,d/size.z);
 g.userData.floorOffset=-bounds.min.y*g.scale.y;g.userData.category='chair';
 return g;
}

export function chairPlacement(){return {position:[-2.1,0,7.75],rotation:Math.PI-.18};}
