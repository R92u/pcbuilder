// Mount sizes from case manuals; concept cases use authored teaching dimensions.
export const radiatorSupport={matrexx40:{top:[240],front:[240]},'matrexx55-mesh':{top:[240],front:[240,360]},cc560:{top:[240],front:[240,360]},'4000d-airflow':{top:[240],front:[240,360]},'pop-air':{top:[240],front:[240]},'pop-air-white':{top:[240],front:[240]},'h7-flow':{top:[240,360],front:[240,360]},'ch560-white':{top:[240,360],front:[240,360]},'pcmaker-panorama':{top:[240,360]},'pcmaker-dual-chamber':{top:[240,360]},'pcmaker-compact':{top:[240]}};
export function aioMount(p={}){
 if(p.cooler?.type!=='aio'||!p.case)return null;
 const support=p.case.radiators||radiatorSupport[p.case.id]|| (p.case.concept==='dual'?{top:[240,360]}:{}),size=p.cooler.radiator;
 const wall=support.top?.includes(size)?'top':support.front?.includes(size)?'front':null;
 return wall?{wall,size,count:size/120,length:p.cooler.radiatorDimensions[0]/100,thickness:(p.cooler.radiatorDimensions[2]+p.cooler.fanThickness)/100}:null;
}
export function aioPlacement(p,frame){
 const mount=aioMount(p);if(!mount)return null;
 const x=p.case.concept?frame.side-.72:.28;
 const position=mount.wall==='top'?[x,4.62-.145,frame.rear+.22+mount.length/2]:[0,2.50,frame.front-.145];
 const fans=Array.from({length:mount.count},(_,i)=>mount.wall==='top'?[x,position[1]-.26,position[2]+(i-(mount.count-1)/2)*1.2]:[0,2.50+(i-(mount.count-1)/2)*1.2,position[2]-.26]);
 const a={...mount,position,fans,pumpSource:[-.17,3.055,-.39]};
 return {...a,fanSource:radiatorFanLead(a,fans.at(-1))};
}
export function radiatorFanLead(a,pos){
 return a.wall==='top'?[pos[0]+.55,pos[1],pos[2]+.40]:[pos[0]+.55,pos[1]+.40,pos[2]-.08];
}
export function radiatorFanBranches(a){
 const end=a.fanSource,rail=a.position[0]+.635;
 // The last motor plugs directly into the splitter mounted on its frame.
 return a.fans.slice(0,-1).map(pos=>{
  const start=radiatorFanLead(a,pos);
  return [start,[rail,start[1],start[2]],[rail,end[1],end[2]],end];
 });
}
export function coolantHoses(a,frame){
 return [-1,1].map(side=>{
  const start=[-.18,3.25+side*.10,-.12],lane=Math.min(frame.side-.16,.76)+side*.065;
  const top=a.wall==='top';
  const end=top?[a.position[0]+side*.15,a.position[1]-.145,a.position[2]+a.length/2-.11]:[side*.15,a.position[1]+a.length/2-.10,a.position[2]-.145];
  // Enter the radiator through its end tank, outside the swept volume of
  // its fans. Keep the two hoses on distinct lanes for their entire run.
  const turnZ=top?end[2]+.15:end[2]-.55;
  return [start,[.10+side*.06,3.22+side*.11,.13],[lane,3.29+side*.11,.46],
   [lane,3.46+side*.12,turnZ],[end[0],top?end[1]-.21:end[1],turnZ],end];
 });
}
export function radiatorConflict(slot,aio){
 if(!aio)return false;
 const ext=aio.wall==='top'?[1.2,.66,aio.length]:[1.2,aio.length,.66];
 const center=aio.position.map((v,i)=>v-(aio.wall==='top'&&i===1?.14:aio.wall==='front'&&i===2?.14:0));
 return slot.position.every((v,i)=>Math.abs(v-center[i])<(ext[i]+(slot.normal[i]?.24:slot.size))/2+.03);
}
