import {aioPlacement,radiatorConflict} from './aio.js';
import {resolve} from './catalog.js';
import {caseLayout,TRAY_X} from './layout.js';

export const fanWalls={front:'Спереди',rear:'Сзади',top:'Сверху',bottom:'Снизу',left:'За платой',right:'Со стороны стекла'};
const normals={front:[0,0,1],rear:[0,0,-1],top:[0,1,0],bottom:[0,-1,0],left:[-1,0,0],right:[1,0,0]};
export const CASE_FAN_DEPTH=.23;
// Rails reach the structural panels; their inner faces touch the fan housing.
// Deriving them from the slots keeps every case size and manual mount aligned.
export function fanMountRails(frame,slots){
 const outer={front:frame.front+.10,rear:frame.rear-.022,top:4.64,bottom:.33,left:frame.back,right:frame.side+.032};
 const rails=new Map();
 for(const slot of slots){
  const axis=slot.normal.findIndex(Boolean),sign=slot.normal[axis];
  const inner=slot.position[axis]+sign*CASE_FAN_DEPTH/2;
  const end=slot.railSeat??outer[slot.wall];
  const cross=axis===0?1:0,along=axis===2?1:2;
  const localBracket=slot.wall==='left'||slot.wall==='rear';
  for(const side of [-1,1]){
   const position=[...slot.position],size=[.08,.08,.08];
   position[axis]=(inner+end)/2;size[axis]=Math.abs(end-inner);
   position[cross]+=side*slot.size*.447;
   position[along]=localBracket?slot.position[along]:along===1?2.48:frame.centerZ;
   size[along]=localBracket?slot.size:along===1?4.24:frame.depth+.10;
   const key=[slot.wall,...position,...size].join(':');rails.set(key,{wall:slot.wall,position,size});
  }
 }
 return [...rails.values()];
}
export function fanGeometryKey(build,layout){
 const p=resolve(build);
 return JSON.stringify([p.case?.id,caseLayout(p.case||{},p.gpu,p.cooler),fanMounts(build),layout]);
}
export function fanMounts(build){
 const p=resolve(build),f=caseLayout(p.case||{},p.gpu,p.cooler),slots=[];
 const a=aioPlacement(p,f);
 const add=(wall,position,size,i,railSeat)=>{const slot={id:wall+'-'+(i+1),wall,position,size,normal:normals[wall],label:fanWalls[wall]+' · '+(i+1)};if(railSeat!==undefined)slot.railSeat=railSeat;if(!radiatorConflict(slot,a))slots.push(slot);};
 if(!p.case?.concept){
  for(let i=0;i<(p.case?.leftFanCount||0);i++)add('left',[TRAY_X+.145,2.10+i*1.22,f.front-.77],1.20,i,TRAY_X);
  f.fanYs.forEach((y,i)=>add('front',[0,y,f.fanZ],f.fanSize,i));add('rear',[.31,3.93,-1.99],1.03,0);return slots;
 }
 const size=f.fanSize,x=f.side-size/2-.07,ys=f.fanYs;
 const zs=[f.rear+.26+size/2,f.centerZ-.18,f.front-.84-size/2];
 for(let i=0;i<3;i++){
  add('front',[0,ys[i],f.fanZ],size,i);
  add('rear',[x,ys[i],f.rear+.15],size,i);
  add('top',[x,4.46,zs[i]],size,i);add('bottom',[x,.52,zs[i]],size,i);
  add('left',[f.back+.15,ys[i],f.front-.77],size,i);
  add('right',[f.side-.15,2.65,zs[i]],size,i);
 }
 return slots;
}
export function fanBasis(slot,direction='in'){
 const n=slot.normal.map(v=>v*(direction==='out'?-1:1));
 const u=n[1]?[1,0,0]:[n[2],0,-n[0]],v=[n[1]*u[2]-n[2]*u[1],n[2]*u[0]-n[0]*u[2],n[0]*u[1]-n[1]*u[0]];
 return {u,v,n};
}
export function fanLead(slot,direction){
 const {u,v,n}=fanBasis(slot,direction);
 return slot.position.map((value,i)=>value+u[i]*slot.size*.46+v[i]*slot.size*.35-n[i]*.10);
}
export function mountsOverlap(a,b){
 return a.position.every((v,i)=>Math.abs(v-b.position[i])<((a.normal[i]?.24:a.size)+(b.normal[i]?.24:b.size))/2-.003);
}
export function placementError(build,layout,id,slotId){
 const slots=fanMounts(build),target=slots.find(s=>s.id===slotId);
 if(!target)return 'В этом корпусе нет такого крепления.';
 for(const other of layout){if(other.id===id)continue;const slot=slots.find(s=>s.id===other.slot);if(!slot)continue;
  if(slot.id===slotId)return 'Это крепление уже занято.';
  if(mountsOverlap(target,slot))return 'Здесь вентилятор пересечётся с соседним. Сначала переставь соседний вентилятор.';
 }
 return '';
}
export function defaultFanLayout(build){
 const p=resolve(build).case,slots=fanMounts(build);
 const walls=p?.leftFanCount?['left','rear']:p?.concept==='panorama'?['left','top']:p?.concept==='dual'?['front','rear']:p?.concept==='compact'?['front','top']:['front','rear'];
 const chosen=slots.filter(s=>walls.includes(s.wall)&&(!Number.isFinite(p?.frontFanMounts)||Number(s.id.split('-')[1])<=(p[s.wall+'FanCount']||0)));
 return chosen.map((s,i)=>({id:'fan'+(i+1),slot:s.id,direction:['rear','top'].includes(s.wall)?'out':'in'}));
}
export function sanitizeFanLayout(build,input){
 if(!Array.isArray(input))return defaultFanLayout(build);
 const result=[];
 for(const item of input.slice(0,18)){
  if(!item||!/^fan([1-9]|1[0-8])$/.test(item.id)||result.some(f=>f.id===item.id)||!['in','out'].includes(item.direction))continue;
  if(!placementError(build,result,item.id,item.slot))result.push({id:item.id,slot:item.slot,direction:item.direction});
 }
 return result;
}
export function fanHub(build,direction){
 const p=resolve(build),f=caseLayout(p.case||{},p.gpu,p.cooler);
 const x=TRAY_X+.065;
 // Two splitter blocks sit flush with the steel tray, including on cases
 // whose only case fan has been reversed to act as an intake.
 // On a panoramic chassis the side intake occupies the usual splitter position.
 const intakeY=p.case?.leftFanCount?4.17:2.75;
 return direction==='in'?[x,intakeY,f.front-.31]:[x,4.34,-1.77];
}
export function fanBranchRoute(build,fan){
 const p=resolve(build),frame=caseLayout(p.case||{},p.gpu,p.cooler),slot=fanMounts(build).find(s=>s.id===fan.slot);
 const source=fanLead(slot,fan.direction),hub=fanHub(build,fan.direction),x=frame.side-.06,z=frame.front-.33;
 if(slot.wall==='left'&&p.case?.leftFanCount){
  const edge=slot.position[2]+Math.sign(source[2]-slot.position[2])*(slot.size*.5+.03);
  const inner=slot.position[0]+.17;
  const route=[source,[source[0],source[1],edge],[inner,source[1],edge],[inner,source[1],z]];
  if(fan.direction==='out')route.push([inner,4.44,z],[inner,4.44,hub[2]]);
  route.push([inner,hub[1],hub[2]],hub);return route;
 }
 if(slot.wall==='front'||slot.wall==='rear'){
  const sign=slot.normal[2],edgeX=slot.position[0]+Math.sign(source[0]-slot.position[0])*(slot.size*.5+.035);
  const serviceZ=slot.position[2]-sign*.18,wireX=hub[0]+.022;
  const route=[source,[edgeX,source[1],source[2]],[edgeX,source[1],serviceZ]];
  // A rear fan borders the I/O shield. Pass above the shield before moving
  // across to the tray, even if it was installed as an intake.
  const y=slot.wall==='rear'?Math.max(4.34,source[1]):source[1];
  route.push([edgeX,y,serviceZ],[wireX,y,serviceZ]);
  if(Math.abs(hub[2]-serviceZ)>.34)route.push([wireX,4.43,serviceZ],[wireX,4.43,hub[2]]);
  route.push([wireX,hub[1],hub[2]],hub);
  return route;
 }
 // Route on the service rail outside the side-wall rotor row. Left-wall
 // cables pass around the tray's open front edge, never through its metal.
 const railY=source[1]>2.02&&source[1]<3.30?3.30:source[1];
 const route=slot.wall==='left'?[source,[source[0],source[1],frame.front-.18],[-.80,source[1],frame.front-.18],[-.80,source[1],z]]:
  [source,[x,source[1],source[2]],[x,railY,source[2]],[x,railY,z],[-.80,railY,z]];
 route.push([-.80,hub[1],z],hub);
 if(fan.direction==='out'){route.pop();route.push([-.80,4.48,z],[-.80,4.48,-1.77],hub);}
 return route;
}
export function fanStats(build,input){
 const layout=sanitizeFanLayout(build,input),mounts=fanMounts(build);
 let intake=0,exhaust=0;
 for(const fan of layout){const slot=mounts.find(s=>s.id===fan.slot),area=(slot.size/1.2)**2;if(fan.direction==='in')intake+=area;else exhaust+=area;}
 return {intake,exhaust,inCount:layout.filter(f=>f.direction==='in').length,outCount:layout.filter(f=>f.direction==='out').length};
}
export function encodeFans(layout){return layout.map(f=>[f.id,f.slot,f.direction].join(':')).join(',');}
export function decodeFans(value){return String(value).split(',').filter(Boolean).map(s=>{const [id,slot,direction]=s.split(':');return {id,slot,direction};});}
