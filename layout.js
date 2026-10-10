// Shared assembly dimensions in scene units (100 mm per unit). Port, cable and
// mesh placement use the same anchors so changing a part cannot leave loose I/O.
export const CPU_CENTER={x:-.694,y:3.44,z:-.55};
export const GPU_TOP=2.43;
export const PSU_REAR=-2.12;
export function caseLayout(p={}){
 const front=2.1+Math.max(0,((p.gpuLimit||320)-350)/100);
 const side=Math.max(1.12,CPU_CENTER.x+(p.coolerLimit||165)/100+.13);
 const fanSize=(p.fanSizeMm||120)/100;
 const fanYs=(p.frontFanCount??3)===1?[2.83]:p.frontFanCount===2?[2.2,3.4]:fanSize>1.2?[1.05,2.45,3.85]:[1.4,2.65,3.9];
 return {front,rear:-2.1,centerZ:(front-2.1)/2,depth:front+2.1,side,back:-1.19,fanZ:front-.17,fanYs,fanSize,ioZ:front-.38};
}
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
