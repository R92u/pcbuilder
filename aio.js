// Mount sizes from case manuals; concept cases use authored teaching dimensions.
export const radiatorSupport={cc560:{top:[240],front:[240,360]},'4000d-airflow':{top:[240],front:[240,360]},'pop-air':{top:[240],front:[240]},'pop-air-white':{top:[240],front:[240]},'h7-flow':{top:[240,360],front:[240,360]},'ch560-white':{top:[240,360],front:[240,360]},'pcmaker-panorama':{top:[240,360]},'pcmaker-dual-chamber':{top:[240,360]},'pcmaker-compact':{top:[240]}};
export function aioMount(p={}){
 if(p.cooler?.type!=='aio'||!p.case)return null;
 const support=radiatorSupport[p.case.id]|| (p.case.concept==='dual'?{top:[240,360]}:{}),size=p.cooler.radiator;
 const wall=support.top?.includes(size)?'top':support.front?.includes(size)?'front':null;
 return wall?{wall,size,count:size/120,length:p.cooler.radiatorDimensions[0]/100,thickness:(p.cooler.radiatorDimensions[2]+p.cooler.fanThickness)/100}:null;
}
export function aioPlacement(p,frame){
 const mount=aioMount(p);if(!mount)return null;
 const x=p.case.concept?frame.side-.72:.28;
 const position=mount.wall==='top'?[x,4.45,frame.rear+.22+mount.length/2]:[0,2.50,frame.front-.25];
 const fans=Array.from({length:mount.count},(_,i)=>mount.wall==='top'?[x,4.19,position[2]+(i-(mount.count-1)/2)*1.2]:[0,2.50+(i-(mount.count-1)/2)*1.2,frame.front-.51]);
 return {...mount,position,fans,fanSource:mount.wall==='top'?[x+.55,4.19,fans.at(-1)[2]+.40]:[.55,fans.at(-1)[1]+.40,frame.front-.59],pumpSource:[-.17,3.10,-.39]};
}
export function radiatorConflict(slot,aio){
 if(!aio)return false;
 const ext=aio.wall==='top'?[1.2,.66,aio.length]:[1.2,aio.length,.66];
 const center=aio.position.map((v,i)=>v-(aio.wall==='top'&&i===1?.14:aio.wall==='front'&&i===2?.14:0));
 return slot.position.every((v,i)=>Math.abs(v-center[i])<(ext[i]+(slot.normal[i]?.24:slot.size))/2+.03);
}
