import * as THREE from 'three';

// Punch a single repeat tile; the holes remain open to the actual fans behind it.
function screenMaterial(pattern, color, width, height, pitch) {
 const canvas=document.createElement('canvas');
 canvas.width=64;canvas.height=64;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#ffffff';ctx.fillRect(0,0,64,64);
 ctx.globalCompositeOperation='destination-out';
 function polygon(points){
  ctx.beginPath();ctx.moveTo(...points[0]);for(const point of points.slice(1))ctx.lineTo(...point);
  ctx.closePath();ctx.fill();
 }
 if(pattern==='triangle'){
  polygon([[3,5],[58,5],[30,31]]);polygon([[34,35],[88,35],[61,61]]);
  polygon([[-30,35],[24,35],[-3,61]]);
 }else if(pattern==='square'){
  ctx.fillRect(5,5,54,54);
 }else{
  for(const [x,y] of [[16,16],[48,48],[-16,48],[80,16],[48,-16],[16,80]]){
   ctx.beginPath();ctx.arc(x,y,14,0,2*Math.PI);ctx.fill();
  }
 }
 const map=new THREE.CanvasTexture(canvas);
 map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(width/pitch,height/pitch);
 map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=2;
 return new THREE.MeshStandardMaterial({map,color,metalness:.46,roughness:.65,alphaTest:.38,side:THREE.DoubleSide});
}

export function caseVent(parent,width,height,pattern,color,pitch){
 const vent=new THREE.Mesh(new THREE.PlaneGeometry(width,height),screenMaterial(pattern,color,width,height,pitch));
 parent.add(vent);return vent;
}

export function caseGlass(smoked=false){
 // A faint softbox reflection remains visible even against a transparent floor.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
 const ctx=canvas.getContext('2d'),gradient=ctx.createLinearGradient(0,0,64,45);
 const tint=smoked?'rgba(21,30,34,.32)':'rgba(37,52,55,.16)';
 gradient.addColorStop(0,tint);gradient.addColorStop(.31,tint);
 gradient.addColorStop(.43,smoked?'rgba(120,141,148,.27)':'rgba(170,195,200,.14)');
 gradient.addColorStop(.63,tint);gradient.addColorStop(1,tint);
 ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
 return new THREE.MeshPhysicalMaterial({map,roughness:.14,metalness:.04,clearcoat:1,clearcoatRoughness:.1,
  transparent:true,side:THREE.DoubleSide,depthWrite:false,forceSinglePass:true});
}

function popMesh(parent,color){
 const width=2.04,bottom=1.30,top=4.60,rows=9,cols=6,positions=[],uv=[];
 function point(i,j){
  const x=i/cols,y=j/rows;
  return [(x-.5)*width,bottom+y*(top-bottom),2.25+((i+j)%2)*.055,x,y];
 }
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const a=point(i,j),b=point(i+1,j),c=point(i+1,j+1),d=point(i,j+1);
  for(const p of (j%2?[a,b,d,b,c,d]:[a,b,c,a,c,d])){
   positions.push(...p.slice(0,3));uv.push(p[3],p[4]);
  }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();
 parent.add(new THREE.Mesh(geometry,screenMaterial('round',color,width,top-bottom,.090)));
}

export function makeRetailFront(g,p){
 const white=p.color==='white',paint=p.paint||(white?0xd5d8db:0x272d30),edge=white?0xb9c0c5:0x191e21;
 const box=(w,h,d,x,y,z,col=paint)=>this.box(g,w,h,d,x,y,z,col);
 function rim(border,topBand=border,bottomBand=border){
  for(const sign of [-1,1])box(border,4.28,.20,sign*(1.10-border/2),2.50,2.18);
  box(2.20-2*border,topBand,.20,0,4.64-topBand/2,2.18);
  box(2.20-2*border,bottomBand,.20,0,.36+bottomBand/2,2.18);
 }
 function vent(w,h,pattern,color,pitch,x,y,z){
  const mesh=caseVent(g,w,h,pattern,color,pitch);mesh.position.set(x,y,z);return mesh;
 }
 const word=(name,x,y,z,size=.31)=>this.text(g,name,size,.065,x,y,z,[0,0,0],white?'#69747c':'#a2aaac');
 if(p.family==='focus-g'){
  rim(.125,.12,.18);
  vent(1.95,3.01,'round',0x222426,.072,0,2.04,2.24);
  for(const y of [3.83,4.29]){
   box(1.97,.44,.08,0,y,2.21,0x181b1d);
   vent(1.85,.34,'round',0x343638,.055,0,y,2.255);
  }
  word('fractal design',0,.71,2.27,.55);
 }else if(p.family==='view-270'){
  // A pillarless glazed corner rests on a continuous painted plinth.
  box(2.20,.15,.23,0,4.575,2.19);
  box(2.20,.87,.19,0,.795,2.19,new THREE.Color(paint).multiplyScalar(.44));
  for(const y of [.445,1.145])box(2.20,.17,.215,0,y,2.195);
  for(const x of [-1.025,1.025])box(.15,.54,.215,x,.795,2.195);
  const pane=new THREE.Mesh(new THREE.PlaneGeometry(2.19,3.27),caseGlass());
  pane.position.set(0,2.865,2.302);g.add(pane);
  box(2.19,.028,.022,0,1.245,2.30,0x1b2425);
  box(2.19,.044,.022,0,4.48,2.30,0x1b2425);
  box(.028,3.25,.024,-1.08,2.865,2.30,0x222b2e);
  box(.015,3.25,.016,1.092,2.865,2.30,0x7c9995);
  vent(1.90,.54,'round',paint,.052,0,.795,2.305);
 }else if(p.id==='cc560'){
  rim(.05,.06,.06);
  vent(2.10,4.16,'round',0x161f22,.088,0,2.50,2.20);
  box(1.32,4.21,.09,0,2.50,2.31);
  for(const sign of [-1,1]){
   const fold=box(.145,4.21,.055,sign*.712,2.50,2.291,0x343c40);fold.rotation.y=sign*.55;
   const outer=box(.090,4.22,.16,sign*1.025,2.50,2.244,edge);outer.rotation.y=-sign*.16;
  }
  word('DeepCool',.46,.56,2.358,.29);
 }else if(p.id==='4000d-airflow'){
  rim(.12,.15,.15);
  // Recessed removable triangle grille and the dark reveal around it.
  for(const x of [-.968,.968])box(.035,3.99,.14,x,2.50,2.18,0x101517);
  vent(1.89,3.95,'triangle',0x33383b,.145,0,2.50,2.235);
  word('CORSAIR',0,.435,2.283);
 }else if(p.id==='pop-air'||p.id==='pop-air-white'){
  rim(.075,.07,.08);popMesh(g,white?0xd8dce0:0x34383a);
  box(2.04,.90,.18,0,.81,2.205);
  box(.055,.16,.09,1.055,.84,2.20,edge);
  word('fractal',.68,.515,2.298);
 }else if(p.id==='h7-flow'){
  rim(.115,.115,.245);
  vent(1.97,3.92,'round',0x2b3033,.084,0,2.565,2.272);
  word('NZXT',0,.482,2.284,.30);
 }else if(p.id==='ch560-white'){
  rim(.088);
  vent(2.024,4.104,'square',0xdbdfe1,.065,0,2.50,2.264);
 }else if(p.id==='matrexx40'){
  rim(.08,.06,.08);
  vent(2.04,4.14,'round',0x171c1f,.103,0,2.50,2.19);
  // The lower louvers are continuous; the upper ends form staggered stepped slots.
  for(let i=0;i<23;i++){
   const x=(i-11)*.089,split=3.10+((i*7)%11)*.105;
   box(.039,split-.41,.115,x,(split+.41)/2,2.264);
   const top=split+.19;
   box(.039,4.59-top,.115,x,(4.59+top)/2,2.264);
  }
 }else if(p.id==='matrexx55-mesh'){
  rim(.055,.06,.09);
  vent(1.68,4.13,'round',0x343a3b,.067,.20,2.515,2.261);
  box(.37,4.24,.22,-.845,2.50,2.18,edge);
  word('DEEPCOOL',-.845,.63,2.295,.31);
 }else{
  rim(.10);vent(2,4.08,'round',paint,.10,0,2.50,2.265);
 }
}
