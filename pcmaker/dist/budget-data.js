// Author-supplied planning estimates in RUB, not scraped offers or verified
// market prices. They are used only with the explicit estimates option.
// A verified offer always takes precedence; estimated positions get a reserve.
export const estimateDate='2026-10-10';
const cpuPrices=[8500,18000,36000,12500,15500,24500,30000,22000,29000,10500,13500,24000,16000,27000,27000,8500,13000,17500,27000,36000,19500,23000,33000,47000,22000,30000,43000,58000,27500,37000];
export const cpuOrder=['r5-5600','r5-7600','r9-7900x','r5-5600x','r7-5700x','r7-5800x','r7-5800x3d','r7-7700x','r7-7800x3d','i3-12100f','i5-12400f','i5-12600k','i5-13400f','i5-13600k','i5-14600k','r5-5500','r5-5600g','r7-5700g','r9-5900x','r9-5950x','r5-7600x','r7-7700','r9-7900','r9-7950x','r5-9600x','r7-9700x','r9-9900x','r9-9950x','i7-12700k','i7-14700k'];
// Relative selection weights, not measured FPS or benchmark scores.
const gpuRows=[
 ['rtx3050-6-ventus2x-e-oc',23000,.65],['rtx3050',28000,.80],['rx6600',27000,1],['rtx3060',46000,1.12],['rx6650xt',32000,1.18],['rtx4060',37000,1.25],['rx7600',41000,1.25],['rtx5050-ventus2x-oc',31000,1.20],['rtx3060ti',44000,1.40],['rtx4060ti',49000,1.55],['rtx4060ti-16-ventus2x-oc',57000,1.57],['rx7600xt-pulse',47000,1.40],['rtx5060-ventus2x-oc',40000,1.50],['rx9060xt-8-pulse',44000,1.75],['rx9060xt-16-pulse-oc',71000,1.85],['rtx5060ti-16-ventus2x-oc-plus',58000,1.90],['rx7700xt',53000,1.95],['rtx4070',63000,2.10],['rx7800xt',63000,2.25],['rtx3090',110000,2.40],['rtx4070super',82000,2.45],['rx7900gre-pulse',74000,2.50],['rtx5070-ventus2x-oc-white',77000,2.60],['rx7900xt-pulse',87000,2.85],['rtx4070tisuper-ventus3x-oc',99000,2.95],['rx9070-pulse',83000,3.00],['rx7900xtx-pulse',110000,3.30],['rtx5070ti-ventus3x-oc',110000,3.40],['rx9070xt-pulse',96000,3.40],['rtx4080super-ventus3x-oc',130000,3.50],['rtx5080-ventus3x-oc',155000,3.90],['rtx4090-ventus3x-oc',220000,4.50],['rtx5090-ventus3x-oc',320000,5.40]
];
export const gpuRanks=Object.fromEntries(gpuRows.map(([id,,rank])=>[id,rank]));
const estimates={...Object.fromEntries(cpuOrder.map((id,i)=>[id,cpuPrices[i]])),...Object.fromEntries(gpuRows.map(([id,price])=>[id,price])),
 'b550m-pro-vdh':9500,'prime-b550m-a':10000,'b550':11700,'b550-tomahawk':15500,'mpg-b550-gaming-plus':12500,'mpg-b550-gaming-edge-wifi':18000,'b550m-pro-vdh-wifi':13200,
 'b650':14500,'b650m-a-wifi':15000,'pro-b650-p-wifi':17000,'b650-gaming-plus-wifi':18500,'tuf-b650-plus-wifi':24000,'b650-eagle-ax':16000,'b650-tomahawk-wifi':27500,
 'b760m-p-ddr4':9000,'b760-p-wifi':15000,'mag-b760-tomahawk-wifi-ddr4':19000,'mag-z790-tomahawk-wifi':29000,
 'ag400':1900,'ak400':2100,'ak620':4900,'ak500':4500,'ag500':3000,'assassin-iv':10000,'nh-u12s-redux':6500,'nh-d15':12500,'nh-u12a':14000,'nh-u14s':10000,'nh-d15s-chromax':13000,'nh-d12l':12000,'nh-u9s':8500,'nh-d15-g2':19000,'nh-u12s':9500,
 'pk550':4300,'pk650d':5000,'a550bn':4600,'a650bn':5400,'a650gl':7600,'a750gl':9000,'a850':10500,'a1000g':15600,'a1000gl':13500,'a1250gl':17000,'a750g':11500,'a850g':13000,'ai1300p':26000,'pq650m':8000,'pq750m':9500,'pq850m':11500,
 'cc560':5300,'4000d-airflow':12500,'pop-air':14000,'pop-air-white':14500,'h7-flow':15500,'ch560-white':11000
};
export function estimatePrice(part,category){
 if(!part||part.concept)return null;
 if(estimates[part.id])return estimates[part.id];
 if(category==='cooler'&&part.type==='aio')return part.radiator===360?9500:7500;
 if(category==='ram')return Math.ceil(part.capacity*(part.memory==='DDR5'?460:300)*(part.id.includes('renegade')?1.15:1)/500)*500;
 if(category==='storage')return Math.ceil((3500+part.capacity*8)*(part.id.includes('990')||part.id.includes('kc3000')||part.id.includes('sn850')?1.4:1)/500)*500;
 return null;
}
