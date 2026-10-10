import {resolve} from './catalog.js';

// Coordinates are schematic assembly locations, not a manufacturing drawing.
export const ports = {
  atx: {name:'ATX · 24 pin', position:[-.68,3.42,.66]},
  eps: {name:'CPU_PWR · 8 pin', position:[-.68,4.13,-1.30]},
  eps2: {name:'CPU_PWR2 · 8 pin', position:[-.68,4.13,-.98]},
  gpu16: {name:'GPU · 16 pin', position:[.63,2.33,-.12]},
  gpu1: {name:'GPU · 8 pin №1', position:[.63,2.33,-.12]},
  gpu2: {name:'GPU · 8 pin №2', position:[.63,2.33,.18]},
  cpuFan: {name:'CPU_FAN · 4 pin', position:[-.64,4.12,.35]},
  frontFan: {name:'SYS_FAN · передние', position:[-.65,2.75,.64]},
  rearFan: {name:'SYS_FAN · задний', position:[-.65,3.85,-1.58]},
  usb3: {name:'JUSB3 · 19 pin', position:[-.65,2.35,.65]},
  usbC: {name:'USB-C · Type-E', position:[-.65,2.12,.65]},
  usb2: {name:'JUSB · 9 pin', position:[-.65,1.44,-.10]},
  audio: {name:'JAUD1 · HD AUDIO', position:[-.65,1.44,-1.50]},
  panel: {name:'JFP1 · кнопки / LED', position:[-.65,1.44,.58]}
};
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
 return list;
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
