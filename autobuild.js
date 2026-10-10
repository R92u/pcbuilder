import {regionFromCurrency} from './regions.js';
import {catalog,categories,resolve} from './catalog.js';
import {compatibility} from './engine.js';
import {estimatePrice,estimateDate,gpuRanks} from './budget-data.js';

export const purposes={game:{name:'Игры',description:'Приоритет видеокарте и сбалансированному процессору.',ram:16,storage:1000},study:{name:'Учёба',description:'Процессор, память и SSD. Без переплаты за мощную видеокарту.',ram:16,storage:500},video:{name:'Монтаж',description:'Больше ресурсов процессору, от 32 ГБ памяти и 1 ТБ SSD.',ram:32,storage:1000}};
const kopecks=n=>Math.round(n*100);
export function budgetPrice(part,category,prices={},allowEstimates=true,currency='RUB'){
 const offer=prices[part.id];
 if((offer?.currency||'RUB')===currency&&Number.isFinite(offer?.price)&&offer.price>0&&offer.date&&offer.store&&/^https:\/\//.test(offer.url||''))return {price:offer.price,planned:kopecks(offer.price),reserve:0,estimated:false,date:offer.date,store:offer.store,url:offer.url};
 const value=currency==='RUB'&&allowEstimates&&estimatePrice(part,category);
 return value?{price:value,planned:kopecks(value)+Math.ceil(kopecks(value)*.10),reserve:Math.ceil(kopecks(value)*.10)/100,estimated:true,date:estimateDate}:null;
}
export function quoteBuild(build,prices,allowEstimates=true,currency='RUB'){
 const parts=resolve(build),rows=categories.map(([key,label])=>({key,label,part:parts[key],quote:parts[key]&&budgetPrice(parts[key],key,prices,allowEstimates,currency)}));
 if(rows.some(r=>!r.quote))return null;
 const total=rows.reduce((s,r)=>s+kopecks(r.quote.price),0)/100,reserve=rows.reduce((s,r)=>s+kopecks(r.quote.reserve),0)/100;
 return {rows,total,reserve,planned:rows.reduce((s,r)=>s+r.quote.planned,0)/100,estimatedCount:rows.filter(r=>r.quote.estimated).length};
}
function cpuScore(p,purpose){
 const generation=p.socket==='AM5'?1.2:1,clock=(p.boostGHz||4)/4.4;
 if(purpose==='video')return (p.threads||p.cores*2)*clock*generation/12;
 return (1+Math.min(p.cores,8)/8)*clock*generation*(purpose==='game'&&p.id.includes('x3d')?1.2:1);
}
export function buildScore(parts,purpose){
 const gpu=gpuRanks[parts.gpu.id]||.5,cpu=cpuScore(parts.cpu,purpose),ram=Math.min(parts.ram.capacity,purpose==='video'?64:32)/16,ssd=Math.min(parts.storage.capacity,purpose==='video'?4000:purpose==='game'?2000:1000)/1000;
 const weights=purpose==='game'?[.27,.58,.10,.05]:purpose==='video'?[.46,.25,.20,.09]:[.62,.02,.27,.09];
 return [cpu,purpose==='study'?Math.min(gpu,1):gpu,ram,ssd].reduce((s,n,i)=>s+weights[i]*Math.log(n),0);
}

export function autoBuild({budget,purpose='game',allowEstimates=true,prices={},currency='RUB'}){
 const region=regionFromCurrency(currency);if(!['RUB','BYN'].includes(currency)||!Number.isFinite(budget)||budget<region.minBudget||budget>region.maxBudget)return {status:'invalid',message:'Укажи бюджет от '+region.minBudget+' до '+region.maxBudget+' '+region.symbol+'.'};
 if(!purposes[purpose])return {status:'invalid',message:'Выбери назначение компьютера.'};
 const cost=new Map(),lists={};
 for(const [key] of categories){lists[key]=catalog[key].filter(p=>{if(p.concept)return false;const q=budgetPrice(p,key,prices,allowEstimates,currency);if(q)cost.set(p.id,q.planned);return !!q;}).sort((a,b)=>cost.get(a.id)-cost.get(b.id));}
 const absent=categories.filter(([key])=>!lists[key].length).map(([,name])=>name);
 if(absent.length)return {status:'no-data',message:'Нет подходящих цен для категорий: '+absent.join(', ')+(currency==='BYN'?'. Для Беларуси нужны цены 5element.by; российские цены и пересчёт валют не используются.':'. Разреши ориентировочные цены или обнови каталог.')};
 const profile=purposes[purpose],rams=lists.ram.filter(p=>p.capacity>=profile.ram),storages=lists.storage.filter(p=>p.capacity>=profile.storage);
 // More expensive items of equal usable capacity cannot improve this score.
 const storageOptions=storages.filter((p,i)=>!storages.slice(0,i).some(q=>Math.min(q.capacity,purpose==='video'?4000:purpose==='game'?2000:1000)>=Math.min(p.capacity,purpose==='video'?4000:purpose==='game'?2000:1000)));
 const boardCache=new Map(),coolerCache=new Map(),psuCache=new Map();
 const first=(cache,key,list,predicate)=>{if(!cache.has(key))cache.set(key,list.find(predicate)||null);return cache.get(key);};
 const valid=build=>!compatibility(build).errors.length;
 const minEfficiency=cpu=>cpu.peakPower>210?1.55:cpu.peakPower>170?1.4:cpu.peakPower>120?1.1:.95;
 let best=null,minimum=null,checked=0;
 const limit=kopecks(budget);
 for(const cpu of lists.cpu)for(const ram of rams)for(const box of lists.case){
  const key=[cpu.id,ram.id,box.id].join(':'),base={cpu:cpu.id,ram:ram.id,case:box.id};
  const board=first(boardCache,key,lists.motherboard,p=>valid({...base,motherboard:p.id}));if(!board)continue;base.motherboard=board.id;
  const cooler=first(coolerCache,key,lists.cooler,p=>p.efficiency>=minEfficiency(cpu)&&valid({...base,cooler:p.id}));if(!cooler)continue;base.cooler=cooler.id;
  const baseCost=Object.values(base).reduce((s,id)=>s+cost.get(id),0);
  for(const gpu of lists.gpu){
   if(!valid({...base,gpu:gpu.id}))continue;
   const psu=first(psuCache,[cpu.id,gpu.id,box.id].join(':'),lists.psu,p=>valid({cpu:cpu.id,gpu:gpu.id,case:box.id,psu:p.id}));if(!psu)continue;
   for(const storage of storageOptions){
    const total=baseCost+cost.get(gpu.id)+cost.get(psu.id)+cost.get(storage.id);
    const candidate={...base,gpu:gpu.id,psu:psu.id,storage:storage.id};checked++;
    if(!minimum||total<minimum.total)minimum={build:candidate,total};
    if(total>limit)continue;
    const score=buildScore({cpu,ram,gpu,storage},purpose);
    if(!best||score>best.score+1e-9||Math.abs(score-best.score)<1e-9&&total<best.total)best={build:candidate,total,score};
   }
  }
 }
 if(!minimum)return {status:'no-build',message:'Не нашлось полной совместимой сборки для выбранного режима и доступных цен.'};
 if(!best)return {status:'over-budget',minimum:minimum.total/100,shortfall:(minimum.total-limit)/100,message:'Для полной сборки в этом режиме бюджета пока не хватает.'};
 const check=compatibility(best.build);
 if(!check.ready)return {status:'no-build',message:'Не удалось подобрать совместимую сборку.'};
 return {status:'ok',build:best.build,budget,purpose,allowEstimates,currency,quote:quoteBuild(best.build,prices,allowEstimates,currency),warnings:check.warnings,recommendedPsu:check.recommended,checked};
}
