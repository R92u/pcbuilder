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
  cpuFan: {name:'CPU_FAN · 4 pin', position:[-.64,4.12,.58]},
  frontFan: {name:'SYS_FAN · вдув', position:[-.65,2.75,.64]},
  rearFan: {name:'SYS_FAN · выдув', position:[-.65,3.85,-1.58]},
  usb3: {name:'JUSB3 · 19 pin', position:[-.855,2.43,.67],axis:'z'},
  usbC: {name:'USB-C · Type-E', position:[-.855,3.00,.67],axis:'z'},
  usb2: {name:'JUSB · 9 pin', position:[-.65,1.44,-.10]},
  audio: {name:'JAUD1 · HD AUDIO', position:[-.65,1.44,-1.50]},
  panel: {name:'JFP1 · кнопки / LED', position:[-.65,1.44,.58]}
};
export function portsFor(build={}){
 const p=resolve(build),map=Object.fromEntries(Object.entries(ports).map(([key,value])=>[key,{...value,position:[...value.position]}]));
 const gpu=gpuLayout(p.gpu||{}),count=Math.max(1,p.gpu?.connectors||1);
 const firstZ=Math.min(-.12,gpu.end-.20-(count-1)*.30);
 const pinX=p.gpu?.modelStyle==='compact-budget'?gpu.edgeX-.14:-.84+1.45*gpu.width/1.60;
 for(const [key,index] of [['gpu16',0],['gpu1',0],['gpu2',1],['gpu3',2]])map[key].position=[pinX,GPU_TOP+.06,firstZ+index*.30];
 for(const key of ['audio','usb2','panel']){map[key].position=[-.85,boardBottom(p.motherboard)+.04,map[key].position[2]];map[key].axis='-y';}
 if(p.motherboard?.cpuPowerPinCounts?.[1]===4)map.eps2.name='CPU_PWR2 · 4 pin';
 if(p.motherboard?.cpuPowerPinCounts?.[0]===4)map.eps.name='CPU_PWR · 4 pin';
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
  add('atx','Питание платы · ATX 24 pin','Блок питания',true,supply('atx',3.42,.89).concat([[-.45,3.42,.66]]),12);
  const cpuPins=p.motherboard.cpuPowerPinCounts?.[0]||8;
  add('eps','Питание CPU · EPS '+(cpuPins===4?'4':'4+4')+' pin','Блок питания',true,supply('eps',4.40,-1.30).concat([[-.45,4.13,-1.30]]),cpuPins);
  if((p.motherboard.epsConnectors??1)>1&&(p.psu.epsConnectors??1)>1){
   const pins=p.motherboard.cpuPowerPinCounts?.[1]||8;
   add('eps2','Доп. питание CPU · EPS '+(pins===4?'4':'4+4')+' pin','Блок питания',false,supply('eps2',4.40,-.86).concat([[-.45,4.34,-.98],[-.45,4.13,-.98]]),pins);
  }
 }
 const gpuIds=p.psu&&p.gpu?(p.gpu.connectorType==='16pin'?(p.psu.connector16pin?['gpu16']:[]):Array.from({length:p.gpu.connectors},(_,i)=>'gpu'+(i+1))):[];
 for(const [i,id] of gpuIds.entries()){
  const target=targets[id].position,lane=.38+i*.16,x=Math.min(frame.side-.065,Math.max(.88,gpuLayout(p.gpu).edgeX+.14));
  add(id,'Питание GPU · '+(id==='gpu16'?'16 pin':'PCIe 6+2 pin'+(gpuIds.length>1?' №'+(i+1):'')),'Блок питания',true,
   [psuCableSource(p.psu,id),[.62,.86,lane],[.62,1.30,lane],[x,1.53,lane],[x,GPU_TOP+.23,lane],[x,GPU_TOP+.23,target[2]],[target[0],GPU_TOP+.23,target[2]]],id==='gpu16'?12:8,.012,{spreadAxis:'x',sideRun:[3,4,5]});
 }
 if(p.motherboard&&p.cooler?.type==='aio'){
  const a=aioPlacement(p,frame);if(a){
   const rail=a.position[0]+.65;
   add('cpuFan','Вентиляторы радиатора · PWM','Разветвитель СЖО',true,[a.fanSource,[rail,a.fanSource[1],a.fanSource[2]],[rail,3.97,a.fanSource[2]],[rail,3.97,.60],[-.38,3.97,.60],[-.38,4.12,targets.cpuFan.position[2]]],4,.007);
   add('pump','Питание помпы СЖО','Помпа на процессоре',true,[a.pumpSource,[-.17,2.98,-.39],[.04,2.98,-.39],[.04,4.05,-.39],[-.44,4.12,-.25]],3,.008);
  }
 }else if(p.motherboard&&p.cooler){
  const l=coolerLayout(p.cooler,p.ram,p.cpu?.socket),index=Math.min((p.cooler.fans||1)-1,l.fanZ.length-1),size=l.sizes[index]||l.size;
  const start=[l.top-size*.04-.01+l.lift,CPU_CENTER.y+size*.40,l.fanZ[index]-.10];
  add('cpuFan','Вентилятор кулера · PWM','Кулер процессора',true,[start,[start[0],4.39,start[2]],[start[0],4.39,.60],[-.44,4.39,.60],[-.44,4.12,targets.cpuFan.position[2]]],4,.007);
 }
 if(p.motherboard){
  const fans=sanitizeFanLayout(build,fanLayout),intake=fanHub(build,'in'),exhaust=fanHub(build,'out');
  if(fans.some(f=>f.direction==='in'))add('frontFan','Вдув · разветвитель PWM','Разветвитель вентиляторов на вдув',true,[intake,[-.80,2.75,intake[2]],[-.80,2.75,.89],[-.44,2.75,.89],[-.44,2.75,.64]],4,.007);
  if(fans.some(f=>f.direction==='out'))add('rearFan','Выдув · разветвитель PWM','Разветвитель вентиляторов на выдув',true,[exhaust,[-.44,4.34,-1.77],[-.44,4.25,-1.58],[-.44,3.85,-1.58]],4,.007);
  const panelName=p.case?.id==='matrexx55-mesh'?'Передняя панель корпуса':'Верхняя панель корпуса';
  const io=(id,y,z)=>{
   const start=frontIOPosition(p.case,frame,id);
   const [offsetY,offsetZ]={usb3:[.035,-.044],usbC:[.034,.038],audio:[-.034,-.054],usb2:[-.021,.004],panel:[-.020,.060]}[id];
   const topY=4.44+offsetY,topZ=frame.ioZ+offsetZ;
   return [start,[start[0],topY,topZ],[cx,topY,topZ],[cx,y,topZ],[cx,y,z],[-.45,y,z]];
  };
  for(const [id,name,radius] of [['usb3','Передний USB 3.0',.030],['usbC','Передний USB-C',.025]]){
   if(id==='usbC'&&!(p.case?.usbC&&p.motherboard.usbCHeader))continue;
   const [x,y]=targets[id].position,route=io(id,y,.89);
   route[route.length-1]=[x,y,.89];
   add(id,name,panelName,false,route,1,radius);
  }
  for(const [id,name,strands,radius] of [['usb2','Передний USB 2.0',5,.008],['audio','Передний аудиоразъём · HD AUDIO',1,.022],['panel','Power / Reset / LED · JFP1',6,.006]]){
   if(id==='usb2'&&!p.case?.usb2)continue;
   const target=targets[id].position;
   const route=io(id,1.225,target[2]);route[route.length-1]=[-.85,1.225,target[2]];
   add(id,name,id==='panel'?'Кнопки корпуса':panelName,id==='panel',route.concat([[-.85,Math.max(1.23,target[1]-.14),target[2]]]),strands,radius,{endSpreadAxis:'x'});
  }
 }
 return list;
}
export function cleanConnections(build,connections,fanLayout){const available=new Set(cablesFor(build,fanLayout).map(c=>c.id));return [...new Set(Array.isArray(connections)?connections:[])].filter(id=>available.has(id));}
// A non-modular PSU has one shared cable exit. One marker at that real exit
// offers each of its matching sockets instead of stacking indistinguishable dots.
export function cableSources(cables){
 const groups=new Map();
 for(const cable of cables){
  const key=cable.points[0].join(',');
  if(!groups.has(key))groups.set(key,{position:[...cable.points[0]],from:cable.from,cables:[]});
  groups.get(key).cables.push(cable);
 }
 return [...groups.values()];
}
export function connectionAfterDrop(build,fanLayout,mode,connections,cableId,portId){
 const available=cablesFor(build,fanLayout);
 if(!canConnect(cableId,portId)||!available.some(c=>c.id===cableId))return null;
 const existing=mode==='auto'?available.map(c=>c.id):connections;
 return {mode:'manual',connections:cleanConnections(build,[...existing,cableId],fanLayout)};
}
export function wiringMissing(build,mode,connections,fanLayout){return mode==='manual'?cablesFor(build,fanLayout).filter(c=>c.required&&!connections.includes(c.id)):[];}
export function canConnect(cableId,portId){return cableId===portId&&Object.hasOwn(ports,portId);}
export function reconcileConnections(before,after,connections,fanLayout){
 return cleanConnections(after,connections,fanLayout).filter(id=>{
  const keys=id.startsWith('gpu')?['gpu','psu']:id==='atx'||id.startsWith('eps')?['motherboard','psu']:['cpuFan','pump'].includes(id)?['motherboard','cooler']:['motherboard','case'];
  return keys.every(key=>before[key]===after[key]);
 });
}
