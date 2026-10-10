// Shared assembly dimensions in scene units (100 mm per unit). Port, cable and
// mesh placement use the same anchors so changing a part cannot leave loose I/O.
export const CPU_CENTER={x:-.694,y:3.44,z:-.55};
export const GPU_TOP=2.43;
export const PSU_REAR=-2.12;
export function caseLayout(p={},gpu){
 if(p.concept){
  const [front,side,back,size]={panorama:[2.90,2.45,-1.19,1.20],dual:[2.65,2.85,-1.75,1.20],compact:[2.20,2.17,-1.19,.92]}[p.concept];
  return {front,side,back,rear:-2.1,centerZ:(front-2.1)/2,depth:front+2.1,fanZ:front-.15,fanYs:[1.38,2.65,3.92],fanSize:size,ioZ:front-.38};
 }
 // Compact exhibition cutaway: leave clearance for the installed card instead
 // of an empty drive cage. The catalog's physical compatibility stays separate.
 const capacity=-1.86+(p.gpuLimit||350)/100+.42;
 const front=gpu?Math.min(capacity,Math.max(1.40,gpuLayout(gpu).end+.42)):capacity;
 const side=Math.max(1.12,CPU_CENTER.x+(p.coolerLimit||165)/100+.13);
 const fanSize=(p.fanSizeMm||120)/100;
 const fanYs=(p.frontFanCount??3)===1?[2.83]:p.frontFanCount===2?[2.2,3.4]:fanSize>1.2?[1.05,2.45,3.85]:[1.4,2.65,3.9];
 return {front,rear:-2.1,centerZ:(front-2.1)/2,depth:front+2.1,side,back:-1.19,fanZ:front-.13,fanYs,fanSize,ioZ:front-.38};
}
export const CABLE_CHANNEL_X=-1.105;
export const TRAY_X=-1.03;
export const TRAY_HOLES=[
 {y:3.47,z:-.59,h:1.36,w:1.29}, // CPU backplate access, covered by the board
 {y:2.88,z:.89,h:1.94,w:.28},
 {y:4.40,z:-1.30,h:.25,w:.35},
 {y:4.40,z:-.86,h:.25,w:.35}
];
export const REAR_OPENINGS={
 io:{x:-.64,y:3.565,w:.52,h:1.772},
 slots:{x:.07,y:1.84,w:1.62,h:1.26},
 psu:{x:.10,y:.72,w:1.46,h:.68},
 fan:{x:.31,y:3.93,r:.515}
};
export function psuCableSource(p,id){
 const sockets={atx:[-.12,.61],eps:[-.42,.61],eps2:[-.42,.83],gpu1:[.18,.61],gpu2:[.48,.61],gpu3:[.18,.83],gpu16:[.50,.84]};
 return [...((p?.modular||p?.id==='a850')?sockets[id]:[.31,.72]),psuFront(p)+.055];
}
export function frontIOPosition(p,frame,id){
 const count=(p?.usbA??1)+(p?.usb2??0);
 const x={usb3:-.70,usb2:-.36,usbC:count>1?-.03:-.36,audio:.34,panel:.72}[id];
 return [x,4.645,frame.ioZ];
}
export const frontFanSource=frame=>[-.80,frame.fanYs[Math.floor(frame.fanYs.length/2)],frame.fanZ-.14];
export function gpuLayout(p={}){
 const dims=p.dimensions||[],thickness=(p.thickness||dims[2]||(p.fans>=3?52:37))/100;
 const width=(p.width||dims[1]||135)/100;
 return {rear:-1.86,end:-1.86+(p.length||240)/100,top:GPU_TOP,bottom:GPU_TOP-thickness,thickness,width,edgeX:Math.max(.45,-.80+width)};
}
export function coolerLayout(p={},ram,socket){
 const sizes=[p.fanSizeMm||(p.id==='nh-d15'?140:120)].flat().map(n=>n/100),size=Math.max(...sizes);
 const top=CPU_CENTER.x+(p.height||155)/100,finStart=-.29,finEnd=top-.04;
 const towers=p.towers>1?[-.98,-.23]:[-.55];
 const fanZ=p.towers>1?[-.60,.16]:p.fans===2?[-.94,-.17]:[-.17];
 const lift=p.adjustableFrontFan&&ram&&!p.ramUnrestrictedSockets?.includes(socket)?Math.max(0,(ram.height-(p.ramClearance||99))/100):0;
 return {size,sizes,top,finStart,finEnd,towers,fanZ,fanX:top-size/2-.01,lift,finDepth:.40};
}
export const psuFront=p=>PSU_REAR+(p?.length||140)/100;
export const boardBottom=p=>p?.form==='Micro-ATX'?1.80:1.285;

export const gpuSlots=p=>Math.min(7,Math.ceil((gpuLayout(p).thickness+.12)/.18));
