import {aioPlacement} from './aio.js';
import {fanHub,sanitizeFanLayout} from './fan-layout.js';
import {resolve} from './catalog.js';
import {caseLayout,gpuLayout,psuFront,boardBottom,GPU_TOP,coolerLayout,CPU_CENTER,CABLE_CHANNEL_X,psuCableSource,frontIOPosition} from './layout.js';

// Coordinates are schematic assembly locations, not a manufacturing drawing.
export const ports = {
  atx: {name:'ATX · 24 pin', position:[-.68,3.42,.66]},
  eps: {name:'CPU_PWR · 8 pin', position:[-.68,4.13,-1.30]},
  eps2: {name:'CPU_PWR2 · 8 pin', position:[-.68,4.13,-.98]},
  gpu16: {name:'GPU · 16 pin', position:[.48,GPU_TOP+.06,-.12],axis:'y'},
  gpu1: {name:'GPU · 8 pin №1', position:[.48,GPU_TOP+.06,-.12],axis:'y'},
  gpu2: {name:'GPU · 8 pin №2', position:[.48,GPU_TOP+.06,.18],axis:'y'},
  gpu3: {name:'GPU · 8 pin №3', position:[.48,GPU_TOP+.06,.48],axis:'y'},
  pump: {name:'PUMP / SYS_FAN · питание помпы',position:[-.64,4.12,-.25]},
  cpuFan: {name:'CPU_FAN · 4 pin', position:[-.64,4.12,.35]},
  frontFan: {name:'SYS_FAN · вдув', position:[-.65,2.75,.64]},
  rearFan: {name:'SYS_FAN · выдув', position:[-.65,3.85,-1.58]},
  usb3: {name:'JUSB3 · 19 pin', position:[-.65,2.35,.65]},
  usbC: {name:'USB-C · Type-E', position:[-.65,2.12,.65]},
  usb2: {name:'JUSB · 9 pin', position:[-.65,1.44,-.10]},
  audio: {name:'JAUD1 · HD AUDIO', position:[-.65,1.44,-1.50]},
  panel: {name:'JFP1 · кнопки / LED', position:[-.65,1.44,.58]}
};
export function portsFor(build={}){
 const p=resolve(build),map=Object.fromEntries(Object.entries(ports).map(([key,value])=>[key,{...value,position:[...value.position]}]));
 for(const key of ['gpu16','gpu1','gpu2','gpu3'])map[key].position[0]=gpuLayout(p.gpu||{}).edgeX-.10;
 for(const key of ['audio','usb2','panel']){map[key].position=[-.85,boardBottom(p.motherboard)+.04,map[key].position[2]];map[key].axis='-y';}
 if(p.motherboard?.cpuPowerPinCounts?.[1]===4)map.eps2.name='CPU_PWR2 · 4 pin';
 return map;
}
// Every route begins at a rendered socket / strain relief and enters the tray
// only through its apertures. Behind the tray all bends stay in one safe plane.
export function cablesFor(build,fanLayout){
 const p=resolve(build),list=[],targets=portsFor(build),frame=caseLayout(p.case||{},p.gpu,p.cooler),cx=CABLE_CHANNEL_X;
 const add=(id,name,from,required,points,strands=4,radius=.012,extra={})=>{
  const item={id,name,from,to:targets[id].name,required,points:[...points,targets[id].position],strands,radius,...extra};
  list.push(item);return item;
 };
 const supply=(id,y,z)=>{
  const source=psuCableSource(p.psu,id),exitZ=psuFront(p.psu)+.23;
  return [source,[source[0],source[1],exitZ],[cx,source[1],exitZ],[cx,y,exitZ],[cx,y,z],[-.45,y,z]];
 };
 if(p.psu&&p.motherboard){
  add('atx','Питание платы · ATX 24 pin','Блок питания',true,supply('atx',3.42,.89),12);
  add('eps','Питание CPU · EPS 4+4 pin','Блок питания',true,supply('eps',4.40,-1.30).concat([[-.45,4.13,-1.30]]),8);
  if((p.motherboard.epsConnectors??1)>1&&(p.psu.epsConnectors??1)>1){
   const pins=p.motherboard.cpuPowerPinCounts?.[1]||8;
   add('eps2','Доп. питание CPU · EPS '+(pins===4?'4':'4+4')+' pin','Блок питания',false,supply('eps2',4.40,-.86).concat([[-.45,4.34,-.98],[-.45,4.13,-.98]]),pins);
  }
 }
 const gpuIds=p.psu&&p.gpu?(p.gpu.connectorType==='16pin'?(p.psu.connector16pin?['gpu16']:[]):Array.from({length:p.gpu.connectors},(_,i)=>'gpu'+(i+1))):[];
 for(const [i,id] of gpuIds.entries()){
  const target=targets[id].position,lane=.38+i*.16,x=Math.max(.88,gpuLayout(p.gpu).edgeX+.16);
  add(id,'Питание GPU · '+(id==='gpu16'?'16 pin':'PCIe 6+2 pin'+(gpuIds.length>1?' №'+(i+1):'')),'Блок питания',true,
   [psuCableSource(p.psu,id),[.62,.86,lane],[.62,1.30,lane],[x,1.60,lane],[x,GPU_TOP+.23,target[2]],[target[0],GPU_TOP+.23,target[2]]],id==='gpu16'?12:8,.012,{spreadAxis:'x'});
 }
 if(p.motherboard&&p.cooler?.type==='aio'){
  const a=aioPlacement(p,frame);if(a){
   add('cpuFan','Вентиляторы радиатора · PWM','Разветвитель СЖО',true,[a.fanSource,[.90,4.00,a.fanSource[2]],[.90,4.00,.53],[-.44,4.12,.35]],4,.007);
   add('pump','Питание помпы СЖО','Помпа на процессоре',true,[a.pumpSource,[.02,3.10,-.39],[.02,4.07,-.39],[-.44,4.12,-.25]],3,.008);
  }
 }else if(p.motherboard&&p.cooler){
  const l=coolerLayout(p.cooler,p.ram,p.cpu?.socket),index=Math.min((p.cooler.fans||1)-1,l.fanZ.length-1),size=l.sizes[index]||l.size;
  const start=[l.top-size*.04-.01+l.lift,CPU_CENTER.y+size*.40,l.fanZ[index]-.10];
  add('cpuFan','Вентилятор кулера · PWM','Кулер процессора',true,[start,[start[0],4.39,start[2]],[start[0],4.39,.53],[-.44,4.39,.53],[-.44,4.12,.35]],4,.007);
 }
 if(p.motherboard){
  const fans=sanitizeFanLayout(build,fanLayout),intake=fanHub(build,'in'),exhaust=fanHub(build,'out');
  if(fans.some(f=>f.direction==='in'))add('frontFan','Вдув · разветвитель PWM','Разветвитель вентиляторов на вдув',true,[intake,[-.80,2.75,frame.front-.29],[-.80,2.75,.89],[-.44,2.75,.89]],4,.007);
  if(fans.some(f=>f.direction==='out'))add('rearFan','Выдув · разветвитель PWM','Разветвитель вентиляторов на выдув',true,[exhaust,[-.44,4.34,-1.77],[-.44,4.25,-1.58],[-.44,3.85,-1.58]],4,.007);
  const io=(id,y,z)=>{
   const start=frontIOPosition(p.case,frame,id),topZ=frame.ioZ;
   return [start,[start[0],4.44,topZ],[cx,4.44,topZ],[cx,y,topZ],[cx,y,z],[-.45,y,z]];
  };
  add('usb3','Передний USB 3.0','Верхняя панель корпуса',false,io('usb3',2.35,.89),1,.030);
  if(p.case?.usbC&&p.motherboard.usbCHeader)add('usbC','Передний USB-C','Верхняя панель корпуса',false,io('usbC',2.12,.89),1,.025);
  for(const [id,name,strands,radius] of [['usb2','Передний USB 2.0',5,.008],['audio','Передний аудиоразъём · HD AUDIO',1,.022],['panel','Power / Reset / LED · JFP1',6,.006]]){
   if(id==='usb2'&&!p.case?.usb2)continue;
   const target=targets[id].position;
   const route=io(id,1.225,target[2]);route[route.length-1]=[-.85,1.225,target[2]];
   add(id,name,id==='panel'?'Кнопки корпуса':'Верхняя панель корпуса',id==='panel',route.concat([[-.85,Math.max(1.23,target[1]-.14),target[2]]]),strands,radius,{endSpreadAxis:'x'});
  }
 }
 for(const c of list){
  // The fixed prefix remains anchored while only the exposed end is dragged.
  const start=c.points[0],id=c.id;
  if(c.from==='Блок питания'){
   const index=['atx','eps','eps2','gpu1','gpu2','gpu3','gpu16'].indexOf(id),z=.30+(index%4)*.15;
   c.loosePrefix=[start,[start[0],start[1],psuFront(p.psu)+.23],[.62,.85,z],[.62,1.30,z]];
   c.looseRest=[.94,1.52+(index%3)*.10,z];
  }else if(['usb3','usb2','usbC','audio','panel'].includes(id)){
   c.loosePrefix=[start,[start[0],4.43,start[2]]];c.looseRest=[start[0]+.15,4.13,start[2]-.12];
  }else if(id==='frontFan'){
   c.loosePrefix=[start,[start[0],start[1],frame.front-.36],[.95,start[1],frame.front-.36]];c.looseRest=[.95,start[1]-.22,frame.front-.40];
  }else{
   c.loosePrefix=[start,[start[0]+.09,start[1],start[2]+.12]];
   c.looseRest=[Math.min(frame.side-.20,start[0]+.30),start[1]-.25,start[2]+.22];
  }
 }
 return list;
}
export function cleanConnections(build,connections,fanLayout){const available=new Set(cablesFor(build,fanLayout).map(c=>c.id));return [...new Set(Array.isArray(connections)?connections:[])].filter(id=>available.has(id));}
export function wiringMissing(build,mode,connections,fanLayout){return mode==='manual'?cablesFor(build,fanLayout).filter(c=>c.required&&!connections.includes(c.id)):[];}
export function canConnect(cableId,portId){return cableId===portId&&Object.hasOwn(ports,portId);}
export function reconcileConnections(before,after,connections,fanLayout){
 return cleanConnections(after,connections,fanLayout).filter(id=>{
  const keys=id.startsWith('gpu')?['gpu','psu']:id==='atx'||id.startsWith('eps')?['motherboard','psu']:['cpuFan','pump'].includes(id)?['motherboard','cooler']:['motherboard','case'];
  return keys.every(key=>before[key]===after[key]);
 });
}
