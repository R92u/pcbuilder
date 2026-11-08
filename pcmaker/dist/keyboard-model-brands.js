import * as THREE from './vendor/three.module.js';
import {keyboardLayout} from './keyboard-layout.js';

export function keyboardProfile(p){
 const light=p.colors.includes('white')&&!p.colors.includes('black');
 return {w:p.dimensions[0]/100,d:p.dimensions[1]/100,h:p.dimensions[2]/100,low:!!p.lowProfile||p.id.startsWith('anubis'),wrist:p.id==='shiva'||!!p.wristRest,knob:!!p.knob,rgb:p.rgb!==false,
  body:light?'#cdd0ce':'#171b1e',keys:light?'#d4d6d2':'#202429',modifiers:light?'#a7a8a3':'#1b2025',...p.appearance};
}
export function keycapColor(p,k){
 const s=keyboardProfile(p),l=k.legend;
 if(p.accentKeys?.[l])return p.accentKeys[l];
 if(p.id==='fizz')return l==='Esc'||l==='Space'?'#d7b700':k.modifier?'#a8a69b':'#d8dad4';
 if(p.id==='fizz-white-gray')return k.modifier&&l!=='Space'?'#dedfdc':'#525b67';
 if(p.id==='ryze')return l==='Esc'||l==='Space'?'#df592f':k.modifier||['5','6','7','8','9'].includes(l)?'#1e252d':'#dadbd6';
 if(p.id==='whisper')return l==='Esc'||l==='Space'?'#c26256':k.modifier&&l!=='Enter'||l==='\\'||/^F[5-8]$/.test(l)||['■','◀','▶','♪'].includes(l)?'#253b4b':'#dde0df';
 if(p.id==='uranus-pro-82')return l==='Esc'||l==='Space'||l==='Enter'||l==='Back'||['←','↓','→','↑'].includes(l)?'#b0d4e4':k.modifier||/^F[5-8]$/.test(l)?'#22282b':'#dfe2de';
 return k.modifier?s.modifiers:s.keys;
}
export function sanitizeKeyboardLighting(v){return {mode:['photo','color','rainbow','off'].includes(v?.mode)?v.mode:'photo',color:/^#[\da-f]{6}$/i.test(v?.color)?v.color:'#e4edff'};}
export function keyboardLightColor(p,k,time=0,settings={mode:'photo',color:'#e4edff'}){
 const s=keyboardProfile(p),c=new THREE.Color();
 if(p.lightingType==='fixed')return c.set(p.lightingColor||'#e4edff');
 if(settings.mode==='color')return c.set(settings.color);
 if(settings.mode==='rainbow')return c.setHSL(((k.x/s.w+.5)*.75+time/7000)%1,.85,.54);
 if(p.id==='fizz')return c.set('#ffb99d');
 const x=k.x/s.w+.5,z=k.z/s.d+.5;
 if(p.lightingZones===3)return c.setHSL([.97,.12,.64][Math.min(2,Math.floor(x*3))],.78,.55);
 const phase=p.id==='shiva'?.80+x*.55:p.id==='ryze'?.98-x*.43:p.id==='fizz-white-gray'||p.id==='lakshmi'?[0,.62,.03,.36,.16][k.row]:.55+x*.8+z*.3;
 return c.setHSL((phase%1+1)%1,.72,.57);
}
function mat(color){return new THREE.MeshStandardMaterial({color,roughness:.56,metalness:.05});}
function outline(w,d,r){const s=new THREE.Shape(),x=-w/2,z=-d/2;s.moveTo(x+r,z);s.lineTo(x+w-r,z);s.quadraticCurveTo(x+w,z,x+w,z+r);s.lineTo(x+w,z+d-r);s.quadraticCurveTo(x+w,z+d,x+w-r,z+d);s.lineTo(x+r,z+d);s.quadraticCurveTo(x,z+d,x,z+d-r);s.lineTo(x,z+r);s.quadraticCurveTo(x,z,x+r,z);return s;}
function slab(g,w,d,h,y,color,r=.025,z=0){
 const geo=new THREE.ExtrudeGeometry(outline(w-.012,d-.012,r),{depth:h-.012,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.006,bevelThickness:.006,curveSegments:4});geo.rotateX(-Math.PI/2);geo.translate(0,y+.006,z);
 const mesh=new THREE.Mesh(geo,mat(color));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);return mesh;
}
// Rounded, tapered keycap with a flat inset top. Geometry is shared by every key.
export function keycapGeometry(){
 const pos=[],indices=[],rings=[[.49,0],[.5,.10],[.44,.88],[.39,1]],n=24;
 for(const [size,y] of rings)for(let i=0;i<n;i++){const corner=Math.floor(i/6),a=corner*Math.PI/2+(i%6)/5*Math.PI/2,r=.075;pos.push(Math.cos(a)*r+(corner===0||corner===3?1:-1)*(size-r),y,Math.sin(a)*r+(corner<2?1:-1)*(size-r));}
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=b+n,d=a+n;indices.push(a,d,b,b,d,c);}
 const top=pos.length/3;pos.push(0,1,0);const bottom=pos.length/3;pos.push(0,0,0);
 for(let i=0;i<n;i++){indices.push(top,3*n+(i+1)%n,3*n+i,bottom,i,(i+1)%n);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
const ru=Object.fromEntries([..."QWERTYUIOP[]ASDFGHJKL;'ZXCVBNM,./"].map((l,i)=>[l,[...'ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ.'][i]]));
function legendAtlas(layout,p){
 const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.textBaseline='middle';
 layout.forEach((k,i)=>{const x=i%8*64,y=Math.floor(i/8)*32,l=k.legend;
  ctx.textAlign='left';ctx.font=(l.length>2?'11':'17')+'px Arial';ctx.fillText(l==='Space'?'—':l,x+7,y+11,50);
  if(p.legendLanguage!=='en'&&ru[l]){ctx.font='12px Arial';ctx.textAlign='right';ctx.fillText(ru[l],x+55,y+24);}
 });
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
export function createKeyboardModel(p,{withTexture=true}={}){
 const g=new THREE.Group(),s=keyboardProfile(p),{w,d,h}=s,layout=keyboardLayout(p),deckY=h*(s.low?.52:.43),capH=h*(s.low?.28:s.wrist?.27:.37);
 g.name='keyboard-'+p.id;g.userData.keyboardId=p.id;
 slab(g,w,s.wrist?d*.72:d,deckY,0,s.body,s.wrist?.035:.04,s.wrist?-d*.14:0);
 const plateD=s.wrist?d*.69:d-.055,plateZ=s.wrist?-d*.145:0;
 slab(g,w-.045,plateD,.018,deckY-.014,s.low?(p.colors.includes('white')?'#bcc3c2':'#30363a'):s.body,.018,plateZ);
 if(s.wrist){
  slab(g,w-.045,d*.255,h*.18,h*.08,'#222628',.04,d*.36);
  if(withTexture){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#222628';ctx.fillRect(0,0,512,128);ctx.fillStyle='#353a3d';for(let y=0;y<128;y+=5)for(let x=(y%10?2:0);x<512;x+=5)ctx.fillRect(x,y,1,1);ctx.fillStyle='#53585a';ctx.font='500 14px Arial';ctx.textAlign='center';ctx.fillText((p.brand||'REDRAGON').toUpperCase(),256,75);const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;const surface=new THREE.Mesh(new THREE.PlaneGeometry(w*.90,d*.20),new THREE.MeshStandardMaterial({map,roughness:.85}));surface.rotation.x=-Math.PI/2;surface.position.set(0,h*.26+.007,d*.36);g.add(surface);}
 }

 const capGeo=keycapGeometry(),caps=new THREE.InstancedMesh(capGeo,mat('#ffffff'),layout.length);caps.castShadow=true;caps.receiveShadow=true;caps.name='keycaps';g.add(caps);
 const glowMat=new THREE.MeshBasicMaterial({color:'#ffffff',toneMapped:false});
 // A narrow light well below each key, partially hidden by its opaque skirt.
 const wells=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),glowMat,layout.length);wells.name='key-light-wells';g.add(wells);
 const switches=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat('#394146'),layout.length);switches.name='key-switches';g.add(switches);
 const glyphPos=[],glyphUv=[],glyphColors=[],transforms=[],t=new THREE.Object3D(),v=new THREE.Vector3();
 layout.forEach((k,i)=>{
  const tilt=s.low?0:(k.row-2)*.018,keyH=s.wrist&&['Rec','Play'].includes(k.legend)?h*.12:capH*(k.d>.20?1:.95),y=deckY+.018+(1-(k.z+d/2)/d)*h*.12;
  t.position.set(k.x,y,k.z);t.rotation.set(tilt,0,0);t.scale.set(k.w,keyH,k.d);t.updateMatrix();caps.setMatrixAt(i,t.matrix);caps.setColorAt(i,new THREE.Color(keycapColor(p,k)));transforms.push(t.matrix.clone());
  // Keep the whole light well below the skirt, so no strips pierce key faces.
  const base=new THREE.Object3D();base.position.set(k.x,y+.005,k.z);base.scale.set(k.w*.99,.008,k.d*.99);base.updateMatrix();wells.setMatrixAt(i,base.matrix);base.position.y=(deckY+y)/2;base.scale.set(k.w*.44,y-deckY,k.d*.46);base.updateMatrix();switches.setMatrixAt(i,base.matrix);
  const gw=Math.min(.73,.20/k.w),gd=Math.min(.70,.105/k.d);
  for(const [x,z,u,vv] of [[-gw/2,-gd/2,0,1],[-gw/2,gd/2,0,0],[gw/2,-gd/2,1,1],[-gw/2,gd/2,0,0],[gw/2,gd/2,1,0],[gw/2,-gd/2,1,1]]){
   v.set(x,1.004,z).applyMatrix4(t.matrix);glyphPos.push(v.x,v.y,v.z);glyphUv.push((i%8+u)/8,(15-Math.floor(i/8)+vv)/16);glyphColors.push(1,1,1);
  }
 });
 const atlas=withTexture?legendAtlas(layout,p):null,glyphGeo=new THREE.BufferGeometry();glyphGeo.setAttribute('position',new THREE.Float32BufferAttribute(glyphPos,3));glyphGeo.setAttribute('uv',new THREE.Float32BufferAttribute(glyphUv,2));glyphGeo.setAttribute('color',new THREE.Float32BufferAttribute(glyphColors,3));glyphGeo.computeVertexNormals();
 const glyphMat=new THREE.MeshBasicMaterial({map:atlas,transparent:true,depthWrite:false,vertexColors:true,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1});
 const glyphs=new THREE.Mesh(glyphGeo,glyphMat);glyphs.name='key-legends';g.add(glyphs);
 // Slim feet, USB socket and status lamps remain inside the real dimensions.
 for(const x of [-w*.36,w*.36]){const foot=slab(g,.18,.11,.018,0,'#101417',.018,-d*.32);foot.position.x=x;}
 const usb=new THREE.Mesh(new THREE.BoxGeometry(.12,.045,.015),mat('#0b1014'));usb.position.set(p.id==='ryze'||p.id==='uranus-pro-82'?-w*.42:0,deckY*.65,-d/2-.003);g.add(usb);
 g.userData.cableStart=[usb.position.x,usb.position.y,-d/2-.012];
 if(s.knob){const knob=new THREE.Mesh(new THREE.CylinderGeometry(.10,.105,.07,32),mat('#31383b'));knob.position.set(w*.449,deckY+.053,-d*.352);g.add(knob);const top=new THREE.Mesh(new THREE.CylinderGeometry(.087,.087,.006,32),mat('#40484b'));top.position.copy(knob.position);top.position.y+=.038;g.add(top);}
 if(p.keys>=87){for(let i=0;i<3;i++){const led=new THREE.Mesh(new THREE.SphereGeometry(.009,8,4),mat(i===0?'#b5a769':'#5c6666'));led.position.set(w*.34+i*.06,deckY+.022,s.low?d*.20:-d*.36);g.add(led);}}
 g.userData.keyLayout=layout;g.userData.keyTransforms=transforms;
 g.userData.updateLighting=(settings,time=0)=>{
  const off=!s.rgb||settings.mode==='off';wells.visible=!off;
  const colors=glyphGeo.attributes.color;
  layout.forEach((k,i)=>{const ink=new THREE.Color(keycapColor(p,k)).getHSL({}).l>.4?new THREE.Color('#59636a'):new THREE.Color('#b7c0c1'),light=keyboardLightColor(p,k,time,settings),c=off||p.shineThrough===false?ink:light;wells.setColorAt(i,light);for(let j=0;j<6;j++)colors.setXYZ(i*6+j,c.r,c.g,c.b);});
  wells.instanceColor.needsUpdate=true;colors.needsUpdate=true;
 };
 g.userData.updateLighting(sanitizeKeyboardLighting());return g;
}
