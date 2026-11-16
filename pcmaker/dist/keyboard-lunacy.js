import * as THREE from './vendor/three.module.js';

// Artwork is sampled from the official top view, separately on each sculpted
// key. No transparent sheet bridges the gaps; RGB never tints printed artwork.
function capGeometry(){
 const positions=[],uv=[],indices=[],n=32;
 for(const [s,y] of [[.48,0],[.49,.12],[.44,.83],[.39,1]])for(let i=0;i<n;i++){
  const corner=Math.floor(i/8),a=corner*Math.PI/2+i%8/7*Math.PI/2,r=.14;
  positions.push(Math.cos(a)*r+(corner===0||corner===3?1:-1)*(s-r),y,Math.sin(a)*r+(corner<2?1:-1)*(s-r));uv.push(0,0);
 }
 for(let j=0;j<3;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n;indices.push(a,a+n,b,b,a+n,b+n);}
 const center=positions.length/3;positions.push(0,.975,0);uv.push(0,0);
 for(let i=0;i<n;i++)indices.push(center,3*n+(i+1)%n,3*n+i);
 const bottom=positions.length/3;positions.push(0,0,0);uv.push(0,0);
 for(let i=0;i<n;i++)indices.push(bottom,i,(i+1)%n);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}

export function createLunacyKeyboard(p,{withTexture},{slab,mat,keyboardLayout,keyboardLightColor,sanitizeKeyboardLighting}){
 const g=new THREE.Group(),[w,d,h]=p.dimensions.map(n=>n/100),iskra=p.printStyle==='iskra',layout=keyboardLayout(p),deck=h*.46,capH=h*.36;
 g.name='keyboard-'+p.id;g.userData.keyboardId=p.id;
 const body=iskra?'#b62230':'#d8dcdd',dark=iskra?'#111217':'#34363a';
 slab(g,w,d,deck,0,body,.045);
 // Four fine case seams echo the layered side walls without dense geometry.
 for(let i=0;i<4;i++)slab(g,w-.008,d-.008,.006,.027+i*.026,iskra?'#571b24':'#989fa3',.04);
 slab(g,w-.075,d-.065,.022,deck-.018,dark,.035);
 const caps=new THREE.InstancedMesh(capGeometry(),mat('#ffffff'),layout.length);caps.name='keycaps';caps.castShadow=true;caps.receiveShadow=true;g.add(caps);
 const wells=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}),layout.length);wells.name='key-light-wells';g.add(wells);
 const printPos=[],printUV=[],transforms=[],o=new THREE.Object3D(),v=new THREE.Vector3(),n=32;
 const addPrint=(x,y,z,k,m)=>{v.set(x,y,z).applyMatrix4(m);printPos.push(v.x,v.y,v.z);
  // Long caps have a fixed-size rim in the source photo, not a proportional
  // margin. Fit the whole spacebar/Enter artwork inside the sculpted top.
  const keyUnits=k.photoW*1386/71,extent=.5-.12/keyUnits;
  printUV.push(k.photoX+x/.39*extent*k.photoW,1-k.photoY-z*k.photoD);};
 layout.forEach((k,i)=>{
  const accented=k.modifier||['F5','F6','F7','F8','Prt','Ins','Home','PgUp','Del','End','PgDn','↑','←','↓','→'].includes(k.legend),white=['Esc','Enter','Space'].includes(k.legend);
  const color=iskra?(white?'#dedee0':accented?'#be2535':'#17191c'):'#e1e4e4';
  o.position.set(k.x,deck+.018+(.5-k.z/d)*h*.08,k.z);o.rotation.set((k.row-2)*.015,0,0);o.scale.set(k.w,capH,k.d);o.updateMatrix();caps.setMatrixAt(i,o.matrix);caps.setColorAt(i,new THREE.Color(color));transforms.push(o.matrix.clone());
  const m=o.matrix.clone();
  for(let j=0;j<n;j++){
   addPrint(0,.980,0,k,m);
   for(const ii of [(j+1)%n,j]){const c=Math.floor(ii/8),a=c*Math.PI/2+ii%8/7*Math.PI/2;addPrint(Math.cos(a)*.14+(c===0||c===3?1:-1)*.25,1.005,Math.sin(a)*.14+(c<2?1:-1)*.25,k,m);}
  }
  o.position.y=deck+.018;o.rotation.set(0,0,0);o.scale.set(k.w*.96,.009,k.d*.96);o.updateMatrix();wells.setMatrixAt(i,o.matrix);
 });
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(printPos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(printUV,2));geo.computeVertexNormals();
 const art=withTexture?new THREE.TextureLoader().load(new URL('./assets/peripherals/lunacy-'+(iskra?'iskra':'moonlight')+'-print.webp',import.meta.url).href):null;
 if(art){art.colorSpace=THREE.SRGBColorSpace;art.anisotropy=8;}
 const ink=new THREE.MeshStandardMaterial({map:art,color:0xffffff,roughness:.7,metalness:0,polygonOffset:true,polygonOffsetFactor:-1});
 const print=new THREE.Mesh(geo,ink);print.name='key-printed-artwork';print.visible=withTexture;g.add(print);
 // The deck uses its own atlas with photographed keys removed, so no ghost
 // keys appear beneath raised geometry when the camera moves sideways.
 if(art){const deckArt=new THREE.TextureLoader().load(new URL('./assets/peripherals/lunacy-'+(iskra?'iskra':'moonlight')+'-deck.webp',import.meta.url).href);deckArt.colorSpace=THREE.SRGBColorSpace;deckArt.anisotropy=8;
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(w-.076,d-.066),new THREE.MeshStandardMaterial({map:deckArt,roughness:.72}));panel.rotation.x=-Math.PI/2;panel.position.y=deck+.005;
  const uv=panel.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,.038/w+uv.getX(i)*(1-.076/w),.033/d+uv.getY(i)*(1-.066/d));panel.name='printed-deck';g.add(panel);}
 // Round modular volume control occupies the last slot; its module replaces two keys.
 const roller=new THREE.Mesh(new THREE.CylinderGeometry(.085,.088,.075,32),mat(iskra?'#bb2534':'#c8cccf'));
 roller.position.set((1310/1386-.5)*w,deck+.062,(73/538-.5)*d);roller.name='volume-roller';g.add(roller);
 const rollerGeo=new THREE.CircleGeometry(.081,32),ru=rollerGeo.attributes.uv;
 for(let i=0;i<ru.count;i++)ru.setXY(i,1310/1386+(ru.getX(i)-.5)*68/1386,1-73/538+(ru.getY(i)-.5)*68/538);
 const rollerTop=new THREE.Mesh(rollerGeo,ink);rollerTop.rotation.x=-Math.PI/2;rollerTop.position.copy(roller.position);rollerTop.position.y+=.038;rollerTop.visible=withTexture;g.add(rollerTop);
 // Small status indicators to the right of Escape.
 for(let i=0;i<3;i++){const led=new THREE.Mesh(new THREE.BoxGeometry(.075,.009,.012),mat(iskra?'#e4e4e5':'#717b80'));led.position.set((139/1386-.5)*w,deck+.027,(51/538+i*22/538-.5)*d);g.add(led);}
 // Raised manufacturer badge and the rear USB-C / USB-A sockets.
 const badge=slab(g,w*.155,.046,.012,deck,iskra?'#aeb7b7':'#eaeded',.008,-d/2+.019);badge.position.x=-w*.34;badge.name='brand-badge';
 if(art){const face=new THREE.Mesh(new THREE.PlaneGeometry(w*.15,.037),ink);face.rotation.x=-Math.PI/2;face.position.set(-w*.34,deck+.014,-d/2+.019);const uv=face.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,.085+uv.getX(i)*.15,.97+uv.getY(i)*.03);g.add(face);}
 for(const [x,width,name] of [[-w*.34,.09,'usb-c'],[-w*.23,.14,'usb-hub']]){const port=new THREE.Mesh(new THREE.BoxGeometry(width,.035,.012),mat('#101418'));port.position.set(x,deck*.65,-d/2);port.name=name;g.add(port);}
 g.userData.cableStart=[-w*.34,deck*.65,-d/2-.008];
 g.userData.keyLayout=layout;g.userData.keyTransforms=transforms;
 g.userData.updateLighting=(settings,time=0)=>{wells.visible=settings.mode!=='off';layout.forEach((k,i)=>wells.setColorAt(i,settings.mode==='photo'?new THREE.Color(iskra?'#ff4b57':'#b9dcff'):keyboardLightColor(p,k,time,settings)));wells.instanceColor.needsUpdate=true;};
 g.userData.updateLighting(sanitizeKeyboardLighting());return g;
}
