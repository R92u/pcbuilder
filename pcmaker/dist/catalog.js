export const categories = [
  ['cpu','Процессор','CPU'], ['motherboard','Материнская плата','MB'],
  ['gpu','Видеокарта','GPU'], ['ram','Оперативная память','RAM'],
  ['storage','Накопитель','SSD'], ['cooler','Охлаждение','FAN'],
  ['psu','Блок питания','PSU'], ['case','Корпус','CASE']
];
// Electrical limits and dimensions are catalog facts. Thermal resistances and
// workload fractions are educational model assumptions, not benchmark results.
export const catalog = {
 cpu: [
  {id:'r5-5600',name:'AMD Ryzen 5 5600',short:'Ryzen 5 5600',brand:'AMD',socket:'AM4',memory:'DDR4',cores:6,tdp:65,peakPower:88,powerAssumed:true,tmax:90,detail:'6 ядер / 12 потоков · AM4 · 65 Вт'},
  {id:'r5-7600',name:'AMD Ryzen 5 7600',short:'Ryzen 5 7600',brand:'AMD',socket:'AM5',memory:'DDR5',cores:6,tdp:65,peakPower:88,tmax:95,detail:'6 ядер / 12 потоков · AM5 · 65 Вт'},
  {id:'r9-7900x',name:'AMD Ryzen 9 7900X',short:'Ryzen 9 7900X',brand:'AMD',socket:'AM5',memory:'DDR5',cores:12,tdp:170,peakPower:230,tmax:95,detail:'12 ядер / 24 потока · AM5 · 170 Вт'}
 ],
 motherboard: [
  {id:'b550',name:'MSI B550-A PRO',short:'B550-A PRO',socket:'AM4',memory:'DDR4',form:'ATX',slots:4,maxRam:128,m2:true,detail:'ATX · AM4 · 4 слота DDR4 · M.2',biosNote:'Для Ryzen 5 5600 может потребоваться обновление BIOS.'},
  {id:'b650',name:'MSI PRO B650-S WIFI',short:'PRO B650-S WIFI',socket:'AM5',memory:'DDR5',form:'ATX',slots:4,maxRam:256,m2:true,detail:'ATX · AM5 · 4 слота DDR5 · Wi-Fi',biosNote:'Перед покупкой сверь версию BIOS со списком поддержки CPU.'}
 ],
 gpu: [
  {id:'rtx3060',name:'MSI GeForce RTX 3060 VENTUS 2X 12G OC',short:'GeForce RTX 3060',brand:'NVIDIA',vram:12,length:235,power:170,recommendedPsu:550,connectors:1,fans:2,tmax:93,detail:'12 ГБ GDDR6 · 235 мм · 170 Вт'},
  {id:'rtx4060',name:'MSI GeForce RTX 4060 VENTUS 2X BLACK 8G',short:'GeForce RTX 4060',brand:'NVIDIA',vram:8,length:199,power:115,recommendedPsu:550,connectors:1,fans:2,tmax:90,detail:'8 ГБ GDDR6 · 199 мм · 115 Вт'},
  {id:'rtx3090',name:'ZOTAC GAMING GeForce RTX 3090 Trinity',short:'GeForce RTX 3090',brand:'NVIDIA',vram:24,length:317.8,power:350,recommendedPsu:750,connectors:2,fans:3,tmax:93,detail:'24 ГБ GDDR6X · 318 мм · 350 Вт'}
 ],
 ram: [
  {id:'ddr4-32',name:'Kingston FURY Beast 32 ГБ DDR4',short:'FURY Beast DDR4',sku:'KF432C16BBK2/32',memory:'DDR4',capacity:32,modules:2,speed:3200,height:34.1,detail:'2 × 16 ГБ · DDR4-3200 · CL16'},
  {id:'ddr5-32',name:'Kingston FURY Beast 32 ГБ DDR5',short:'FURY Beast DDR5',sku:'KF560C36BBEK2-32',memory:'DDR5',capacity:32,modules:2,speed:6000,height:34.9,detail:'2 × 16 ГБ · DDR5-6000 · CL36'}
 ],
 storage: [
  {id:'nv2',name:'Kingston NV2 1 ТБ',short:'Kingston NV2',interface:'M.2 NVMe',capacity:1000,power:5,detail:'1 ТБ · M.2 2280 · PCIe 4.0'},
  {id:'980',name:'Samsung 980 1 ТБ',short:'Samsung 980',interface:'M.2 NVMe',capacity:1000,power:6,detail:'1 ТБ · M.2 2280 · PCIe 3.0'}
 ],
 cooler: [
  {id:'ak400',name:'DeepCool AK400',short:'AK400',sockets:['AM4','AM5'],height:155,ramClearance:99,efficiency:1,maxRpm:1850,towers:1,detail:'Башенный · 155 мм · до 1850 об/мин'},
  {id:'ak620',name:'DeepCool AK620',short:'AK620',sockets:['AM4','AM5'],height:160,ramClearance:43,efficiency:1.45,maxRpm:1850,towers:2,detail:'Две башни · 160 мм · до 1850 об/мин'}
 ],
 psu: [
  {id:'pk550',name:'DeepCool PK550D',short:'PK550D · 550 Вт',watts:550,connectors:2,form:'ATX',length:140,detail:'550 Вт · 80 PLUS Bronze · ATX'},
  {id:'a850',name:'MSI MAG A850GL PCIE5',short:'A850GL · 850 Вт',watts:850,connectors:4,form:'ATX',length:140,detail:'850 Вт · 80 PLUS Gold · модульный'}
 ],
 case: [
  {id:'cc560',name:'DeepCool CC560 V2',short:'CC560 V2',forms:['ATX','Micro-ATX','Mini-ITX'],gpuLimit:320,coolerLimit:165,psuLimit:170,detail:'Mid-Tower · ATX · 3 вентилятора на вдув + 1 на выдув'}
 ]
};
export const byId = Object.fromEntries(Object.values(catalog).flat().map(p=>[p.id,p]));
export const emptyBuild = ()=>Object.fromEntries(categories.map(([key])=>[key,key==='case'?'cc560':null]));
export const demoBuild = {cpu:'r5-7600',motherboard:'b650',gpu:'rtx4060',ram:'ddr5-32',storage:'nv2',cooler:'ak400',psu:'a850',case:'cc560'};
export const resolve = build => Object.fromEntries(categories.map(([key])=>[key,catalog[key].find(p=>p.id===build[key])||null]));
export function sanitizeBuild(input) { const result=emptyBuild(); if(!input||typeof input!=='object')return result; for(const [key] of categories) if(catalog[key].some(p=>p.id===input[key]))result[key]=input[key]; return result; }
