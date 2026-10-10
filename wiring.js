import {resolve} from './catalog.js';
import {caseLayout,gpuLayout,psuFront,boardBottom,GPU_TOP,coolerLayout,CPU_CENTER} from './layout.js';

// Coordinates are schematic assembly locations, not a manufacturing drawing.
export const ports = {
  atx: {name:'ATX · 24 pin', position:[-.68,3.42,.66]},
  eps: {name:'CPU_PWR · 8 pin', position:[-.68,4.13,-1.30]},
  eps2: {name:'CPU_PWR2 · 8 pin', position:[-.68,4.13,-.98]},
  gpu16: {name:'GPU · 16 pin', position:[.48,GPU_TOP+.06,-.12],axis:'y'},
  gpu1: {name:'GPU · 8 pin №1', position:[.48,GPU_TOP+.06,-.12],axis:'y'},
  gpu2: {name:'GPU · 8 pin №2', position:[.48,GPU_TOP+.06,.18],axis:'y'},
  gpu3: {name:'GPU · 8 pin №3', position:[.48,GPU_TOP+.06,.48],axis:'y'},
  cpuFan: {name:'CPU_FAN · 4 pin', position:[-.64,4.12,.35]},
  frontFan: {name:'SYS_FAN · передние', position:[-.65,2.75,.64]},
  rearFan: {name:'SYS_FAN · задний', position:[-.65,3.85,-1.58]},
  usb3: {name:'JUSB3 · 19 pin', position:[-.65,2.35,.65]},
  usbC: {name:'USB-C · Type-E', position:[-.65,2.12,.65]},
  usb2: {name:'JUSB · 9 pin', position:[-.65,1.44,-.10]},
  audio: {name:'JAUD1 · HD AUDIO', position:[-.65,1.44,-1.50]},
  panel: {name:'JFP1 · кнопки / LED', position:[-.65,1.44,.58]}
};
export function portsFor(build={}){
 const p=resolve(build),map=Object.fromEntries(Object.entries(ports).map(([key,value])=>[key,{...value,position:[...value.position]}]));
 for(const key of ['gpu16','gpu1','gpu2','gpu3'])map[key].position[0]=gpuLayout(p.gpu||{}).edgeX-.10;
 for(const key of ['audio','usb2','panel'])map[key].position[1]=boardBottom(p.motherboard)+.155;
 if(p.motherboard?.cpuPowerPinCounts?.[1]===4)map.eps2.name='CPU_PWR2 · 4 pin';
 return map;
}
const cable=(id,name,from,required,points,strands=4,radius=.012)=>({id,name,from,to:ports[id].name,required,points:[...points,ports[id].position],strands,radius});
export function cablesFor(build){
 const p=resolve(build),list=[];
 if(p.psu&&p.motherboard){
  list.push(cable('atx','Питание платы · ATX 24 pin','Блок питания',true,[[.1,.77,-.33],[-.60,.80,.18],[-1.025,1.30,.97],[-1.025,3.42,.98],[-.37,3.42,.96]],12));
  list.push(cable('eps','Питание CPU · EPS 4+4 pin','Блок питания',true,[[.10,.74,-.38],[-.67,.72,-.7],[-1.02,1.20,-.78],[-1.02,4.40,-1.27],[-.45,4.39,-1.30]],8));
  if((p.motherboard.epsConnectors??1)>1&&(p.psu.epsConnectors??1)>1)list.push(cable('eps2','Доп. питание CPU · EPS 4+4 pin','Блок питания',false,[[.16,.70,-.38],[-.73,.72,-.7],[-1.03,1.20,-.62],[-1.03,4.43,-.95],[-.45,4.39,-.98]],8));
 }
 if(p.psu?.connector16pin&&p.gpu?.connectorType==='16pin')list.push(cable('gpu16','Питание GPU · 16 pin','Блок питания',true,[[.30,.82,-.34],[.72,1.04,.34],[.97,1.65,.62],[.89,2.55,.42]],12));
 if(p.psu&&p.gpu&&p.gpu.connectorType!=='16pin')for(let i=0;i<p.gpu.connectors;i++)list.push(cable('gpu'+(i+1),'Питание GPU · PCIe 6+2 pin'+(p.gpu.connectors>1?' №'+(i+1):''),'Блок питания',true,[[.30+i*.18,.82,-.34],[.72+i*.11,1.04,.34],[.92+i*.07,1.48,.58],[.97+i*.04,2.08,.46],[.85,2.48,-.12+i*.30]],8));
 if(p.motherboard&&p.cooler)list.push(cable('cpuFan','Вентилятор кулера · PWM','Кулер процессора',true,[[.27,3.98,-.13],[.36,4.27,.16],[-.20,4.31,.38]],4,.007));
 if(p.motherboard){
  list.push(cable('frontFan','Передние вентиляторы · разветвитель','Группа передних вентиляторов',true,[[-.40,2.84,1.96],[-.91,2.84,1.6],[-1.02,2.70,1.12],[-.43,2.70,.93]],4,.007));
  list.push(cable('rearFan','Задний вентилятор','Вентилятор на выдув',true,[[.55,4.13,-1.99],[.2,4.40,-1.88],[-.42,4.19,-1.60]],4,.007));
  list.push(cable('usb3','Передний USB 3.0','Верхняя панель корпуса',false,[[-.35,4.52,1.72],[-1.025,4.36,1.25],[-1.025,2.42,1.2],[-.39,2.36,.96]],1,.036));
  if(p.case?.usb2)list.push(cable('usb2','Передний USB 2.0','Верхняя панель корпуса',false,[[-.09,4.52,1.72],[-1.03,4.30,1.15],[-1.03,1.33,.75],[-.54,1.33,-.10]],5,.008));
  if(p.case?.usbC&&p.motherboard.usbCHeader)list.push(cable('usbC','Передний USB-C','Верхняя панель корпуса',false,[[-.29,4.52,1.72],[-1.03,4.3,1.18],[-1.03,2.12,1.16],[-.40,2.12,.91]],1,.025));
  list.push(cable('audio','Передний аудиоразъём · HD AUDIO','Верхняя панель корпуса',false,[[.18,4.52,1.72],[-1.04,4.29,1.06],[-1.04,1.27,.70],[-1.04,1.27,-1.48],[-.53,1.29,-1.50]],1,.022));
  list.push(cable('panel','Power / Reset / LED · JFP1','Кнопки корпуса',true,[[.51,4.52,1.72],[-1.015,4.26,1.03],[-1.015,1.27,1.03],[-.48,1.28,.59]],6,.006));
 }
 const targets=portsFor(build),frame=caseLayout(p.case||{}),front=psuFront(p.psu);
 return list.map(c=>{
  const points=c.points.map(point=>[...point]);
  c.to=targets[c.id].name;
  if(c.id==='eps2'&&p.motherboard?.cpuPowerPinCounts?.[1]===4){c.strands=4;c.name='Доп. питание CPU · EPS 4 pin';}
  if(c.from==='Блок питания'){
   points[0][2]=front+.055;
   const socket={atx:[-.12,.61],eps:[-.42,.61],eps2:[-.42,.84]}[c.id];if(socket){points[0][0]=socket[0];points[0][1]=socket[1];}
   if(c.id==='atx'||c.id.startsWith('eps')){points[1][2]=Math.max(points[1][2],front+.22);points.splice(2,0,[-1.105,.72,front+.22]);}
   if(c.id.startsWith('gpu')){
    const target=targets[c.id].position;
    const z=target[2],x=target[0],index=c.id==='gpu16'?0:Number(c.id.slice(3))-1,laneZ=c.id==='gpu16'?.54:.38+index*.16,source=c.id==='gpu16'?[.50,.84]:[[.18,.61],[.48,.61],[.18,.83]][index];
    // The bundle rises through the actual opening in the PSU shroud.
    c.points=[[...source,front+.055],[.61,.91,laneZ-.06],[.62,1.18,laneZ],[.83,1.73,laneZ],[.88,GPU_TOP+.20,z],[x,GPU_TOP+.18,z],target];
    c.spreadAxis='x';return c;
   }
  }
  for(const point of points){if(point[0]<-.98)point[0]=-1.105;}
  if(c.id==='cpuFan'){const l=coolerLayout(p.cooler,p.ram,p.cpu?.socket),index=Math.min((p.cooler.fans||1)-1,l.fanZ.length-1),size=l.sizes[index]||l.size,x=l.top-size*.07-.01+l.lift,z=l.fanZ[index];points.splice(0,points.length-1,[x,CPU_CENTER.y+size*.43,z],[x+.06,4.36,z+.18],[-.28,4.34,.40]);}
  if(c.id==='rearFan')points[0]=[.75,4.35,-1.98];
  if(c.id==='frontFan'){points[0]=[-.43,frame.fanYs[Math.floor(frame.fanYs.length/2)],frame.fanZ-.04];points[1][2]=frame.fanZ-.30;}
  if(['usb3','usbC','usb2','audio','panel'].includes(c.id)){points[0][2]=frame.ioZ;points[0][1]=4.69;points[1][2]=frame.ioZ-.22;}
  // Bottom leads enter from the free lower edge of the motherboard tray.
  if(['audio','usb2','panel'].includes(c.id)){const near=points.at(-2);near[1]=1.255;points.splice(points.length-1,0,[near[0],targets[c.id].position[1]-.12,near[2]]);}
  points[points.length-1]=targets[c.id].position;c.points=points;return c;
 });
}
export function cleanConnections(build,connections){const available=new Set(cablesFor(build).map(c=>c.id));return [...new Set(Array.isArray(connections)?connections:[])].filter(id=>available.has(id));}
export function wiringMissing(build,mode,connections){return mode==='manual'?cablesFor(build).filter(c=>c.required&&!connections.includes(c.id)):[];}
export function canConnect(cableId,portId){return cableId===portId&&Object.hasOwn(ports,portId);}
export function reconcileConnections(before,after,connections){
 return cleanConnections(after,connections).filter(id=>{
  const keys=id.startsWith('gpu')?['gpu','psu']:id==='atx'||id.startsWith('eps')?['motherboard','psu']:id==='cpuFan'?['motherboard','cooler']:['motherboard','case'];
  return keys.every(key=>before[key]===after[key]);
 });
}
