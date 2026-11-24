import * as THREE from './vendor/three.module.js';

export function createDeskMat(product,layout,texture=null){
 const {w,d,height}=layout,r=.10;
 const shape=new THREE.Shape();
 shape.moveTo(r,0);shape.lineTo(w-r,0);shape.quadraticCurveTo(w,0,w,r);
 shape.lineTo(w,d-r);shape.quadraticCurveTo(w,d,w-r,d);shape.lineTo(r,d);
 shape.quadraticCurveTo(0,d,0,d-r);shape.lineTo(0,r);shape.quadraticCurveTo(0,0,r,0);
 const group=new THREE.Group();
 const rubber=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:5}),new THREE.MeshStandardMaterial({color:0x20272b,roughness:.96}));
 rubber.geometry.translate(-w/2,-d/2,0);rubber.rotation.x=-Math.PI/2;rubber.receiveShadow=true;group.add(rubber);
 if(product){
  const geometry=new THREE.ShapeGeometry(shape,5),pos=geometry.attributes.position,uv=geometry.attributes.uv;
  for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/w,pos.getY(i)/d);
  geometry.translate(-w/2,-d/2,0);
  const fabric=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:0xffffff,map:texture,roughness:.94,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
  fabric.rotation.x=-Math.PI/2;fabric.position.y=height;fabric.receiveShadow=true;group.add(fabric);group.userData.productId=product.id;
 }
 return group;
}
