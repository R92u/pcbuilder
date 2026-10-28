import {aioMount} from './aio.js';
import {coolingAnalysis} from './cooling.js';
import {categories,resolve} from './catalog.js';
import {priceQuality} from './price-quality.js';
export function compatibility(build) {
 const p=resolve(build), errors=[],warnings=[];
 const add=(code,text,parts)=>errors.push({code,text,parts});
 if(p.cpu&&p.motherboard&&p.cpu.socket!==p.motherboard.socket)add('socket',`Процессору нужен сокет ${p.cpu.socket}, а у платы — ${p.motherboard.socket}.`,['cpu','motherboard']);
 if(p.ram&&p.motherboard&&p.ram.memory!==p.motherboard.memory)add('memory',`Память ${p.ram.memory} не подходит к слотам ${p.motherboard.memory} на этой плате.`,['ram','motherboard']);
 if(p.ram&&p.cpu&&!([p.cpu.memory].flat()).includes(p.ram.memory))add('cpu-memory',`Контроллер памяти ${p.cpu.short} рассчитан на ${p.cpu.memory}.`,['ram','cpu']);
 if(p.ram&&p.motherboard&&(p.ram.capacity>p.motherboard.maxRam||p.ram.modules>p.motherboard.slots))add('ram-capacity','Превышено число слотов или поддерживаемый объём памяти.',['ram','motherboard']);
 if(p.motherboard&&p.case&&!p.case.forms.includes(p.motherboard.form))add('board-size','Формат платы не поддерживается корпусом.',['motherboard','case']);
 if(p.gpu&&p.case&&p.gpu.length>p.case.gpuLimit)add('gpu-size',`Видеокарта длиной ${p.gpu.length} мм превышает лимит корпуса ${p.case.gpuLimit} мм.`,['gpu','case']);
 if(p.cooler&&p.cpu&&!p.cooler.sockets.includes(p.cpu.socket))add('cooler-socket','Крепление кулера не подходит к сокету процессора.',['cooler','cpu']);
 if(p.cooler&&p.case&&p.cooler.height>p.case.coolerLimit)add('cooler-height','Кулер слишком высокий для корпуса.',['cooler','case']);
 const aio=aioMount(p);
 if(p.cooler?.type==='aio'&&p.case){
  if(!aio)add('radiator-size','В корпусе нет подтверждённого места под радиатор '+p.cooler.radiator+' мм.',['cooler','case']);
  if(aio?.wall==='front'&&p.gpu&&p.gpu.length>p.case.gpuLimit-p.cooler.radiatorDimensions[2])add('radiator-gpu','Передний радиатор уменьшает место под видеокарту на '+p.cooler.radiatorDimensions[2]+' мм.',['cooler','case','gpu']);
  if(aio?.wall==='top'&&p.case.id.startsWith('pop-air')&&p.ram?.height>46)add('radiator-ram','Для верхнего радиатора Pop Air высота памяти ограничена 46 мм.',['cooler','ram','case']);
  warnings.push('СЖО: радиатор '+(aio?.wall==='front'?'спереди на вдув':'сверху на выдув')+'. Корпусные вентиляторы в занятой зоне сняты. Перед покупкой проверь толщину радиатора, RAM и VRM по руководству корпуса.');
 }
 if(p.ram?.heightUnknown&&p.cooler)warnings.push('Высота выбранной памяти не подтверждена: проверь зазор с кулером или радиатором.');
 if(p.cooler&&p.ram&&!p.cooler.ramUnrestricted&&!p.cooler.ramUnrestrictedSockets?.includes(p.cpu?.socket||p.motherboard?.socket)&&p.ram.height>p.cooler.ramClearance){if(p.cooler.adjustableFrontFan){const height=p.cooler.height+p.ram.height-p.cooler.ramClearance;if(p.case&&height>p.case.coolerLimit)add('ram-height','Поднятый над памятью вентилятор кулера не помещается в корпусе.',['cooler','ram','case']);else warnings.push(`Передний вентилятор кулера нужно поднять: общая высота около ${height.toFixed(1)} мм.`);}else add('ram-height','Модули памяти не помещаются под вентилятором кулера.',['cooler','ram']);}
 if(p.psu&&p.case&&Number.isFinite(p.case.psuLimit)&&p.psu.length>p.case.psuLimit)add('psu-size','Блок питания слишком длинный для корпуса.',['psu','case']);
 if(p.psu&&p.case?.psuLimitUnknown)warnings.push('Производитель корпуса не указал предел длины БП: проверь место для блока питания и его кабелей.');
 if(p.gpu?.connectorType==='16pin'&&p.psu&&!p.psu.connector16pin)add('gpu-16pin','Для этой видеокарты выбери БП с нативным кабелем 16 pin. Комплектность переходника здесь не подтверждена.',['gpu','psu']);
 if(p.gpu?.connectorType==='16pin'&&p.psu?.connector16pinWatts&&p.gpu.power>p.psu.connector16pinWatts)add('gpu-cable-power','Мощность видеокарты превышает номинал нативного кабеля 16 pin этого БП.',['gpu','psu']);
 if(p.gpu&&p.psu&&p.gpu.connectorType!=='16pin'&&p.gpu.connectors>p.psu.connectors)add('connectors','У блока питания недостаточно разъёмов PCIe для видеокарты.',['gpu','psu']);
 const peak=(p.cpu?.peakPower||0)+(p.gpu?.power||0)+65;
 const recommended=Math.ceil(Math.max(peak*1.2,p.gpu?.recommendedPsu||0)/50)*50;
 if(p.psu&&p.cpu&&p.gpu&&p.psu.watts<peak)add('power',`Оценка пиковой мощности ${peak} Вт превышает мощность БП ${p.psu.watts} Вт.`,['psu','cpu','gpu']);
 else if(p.psu&&p.cpu&&p.gpu&&p.psu.watts<recommended)add('power-reserve',`Недостаточный запас питания: для этой сборки рекомендуем от ${recommended} Вт.`,['psu']);
 if(p.motherboard?.biosNote&&p.cpu&&p.cpu.socket===p.motherboard.socket)warnings.push(p.motherboard.biosNote);
 if(p.ram?.memory==='DDR5'&&p.cpu?.socket==='AM5')warnings.push(`${p.ram.speed} МТ/с — профиль ${p.ram.profile||'EXPO'}. Достижимая скорость зависит от процессора, платы и BIOS.`);
 if(p.case?.usbC&&p.motherboard&&!p.motherboard.usbCHeader)warnings.push('У платы нет внутреннего USB-C: передний USB-C корпуса останется без подключения.');
 if(p.gpu&&p.case&&p.case.gpuLimit-p.gpu.length<10)warnings.push('Очень маленький запас по длине видеокарты. Проверь фактическую посадку и свободное место под кабели.');
 const missing=categories.filter(([key])=>!p[key]).map(([key,name])=>({key,name}));
 return {errors,warnings,missing,ready:!errors.length&&!missing.length,peak,recommended};
}
export const workloads={idle:{name:'Простой',cpu:.08,gpu:.04},game:{name:'Игра',cpu:.48,gpu:.92},video:{name:'Работа с видео',cpu:.86,gpu:.5},stress:{name:'Стресс-тест',cpu:1,gpu:1}};
export const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function thermalTargets(build,settings) {
 const p=resolve(build),w=workloads[settings.load]||workloads.idle;
 const ambient=clamp(Number(settings.ambient)||22,10,35);
 const front=clamp(settings.front/100,0,1),rear=clamp(settings.rear/100,0,1),fan=clamp(settings.cpuFan/100,0,1);
 const requestedCPU=(p.cpu?.peakPower||0)*w.cpu,requestedGPU=(p.gpu?.power||0)*w.gpu;
 // Lumped thermal network. Conductance & resistance are illustrative coefficients.
 // A passive-cooling term remains at 0 RPM; filtered inlet/outlet limit total flow.
 const cooling=coolingAnalysis(build,settings);
 // Educational airflow proxy: balanced paths exchange more air; one-sided
 // layouts still exchange through passive vents, with diminishing returns.
 const effective=cooling.effective;
 const conductance=8+9*Math.sqrt(effective);
 const cpuR=((p.cooler?.type==='aio'?.18:.20)+.42*(1-fan)**1.4)/(p.cooler?.efficiency||.45)*(1+.18*cooling.counterflow);
 const gpuR=.10+.06*(1-(.3+.7*w.gpu)); // simplified automatic GPU fan curve
 const cpuMax=p.cpu?.tmax||95,gpuMax=p.gpu?.tmax||90;
 // Solve a stable energy balance with thermal limiting instead of simply clipping
 // temperature while continuing to inject the full electrical power as heat.
 let caseTemp=ambient,cpuPower=requestedCPU,gpuPower=requestedGPU;
 for(let i=0;i<70;i++){
  cpuPower=Math.min(requestedCPU,Math.max(0,(cpuMax-caseTemp)/cpuR));
  gpuPower=Math.min(requestedGPU,Math.max(0,(gpuMax-caseTemp)/gpuR));
  caseTemp=.5*caseTemp+.5*(ambient+(cpuPower+gpuPower+25)/conductance);
 }
 const cpuThrottle=cpuPower<requestedCPU-.01,gpuThrottle=gpuPower<requestedGPU-.01;
 return {cooling,ambient,case:caseTemp,cpu:Math.min(caseTemp+cpuPower*cpuR,cpuMax),gpu:Math.min(caseTemp+gpuPower*gpuR,gpuMax),ram:caseTemp+5+4*w.cpu,storage:caseTemp+3+(p.storage?.power||5)*1.5*(settings.load==='video'?1:w.cpu),motherboard:caseTemp+4+cpuPower*.045,cooler:caseTemp+cpuPower*cpuR*.35,psu:ambient+6+(cpuPower+gpuPower+45)*.035,cpuThrottle,gpuThrottle,cpuPower,gpuPower,power:Math.round(cpuPower+gpuPower+45),cpuLoad:Math.round(w.cpu*100),gpuLoad:Math.round(w.gpu*100),flow:Math.round(120.2*effective*.38),rpm:{front:Math.round(front*1700),rear:Math.round(rear*1700),cpu:Math.round(fan*(p.cooler?.maxRpm||1850))}};
}
export function advanceThermals(current,target,dt) {
 const out={...current}; for(const [key,tau] of [['cpu',8],['gpu',12],['case',20],['ram',24],['storage',22],['motherboard',28],['cooler',14],['psu',25]])if(current[key]!==undefined)out[key]=current[key]+(target[key]-current[key])*(1-Math.exp(-clamp(dt,0,1)/tau));return out;
}
export function summarizePrices(build,prices,now=Date.now()) {
 const all=Object.values(resolve(build)).filter(Boolean),chosen=all.filter(p=>!p.concept),known=chosen.filter(p=>Number.isFinite(prices[p.id]?.price)&&prices[p.id].price>0);
 const statuses=known.map(p=>priceQuality(prices[p.id],now).status),count=status=>statuses.filter(s=>s===status).length;
 return {total:known.reduce((s,p)=>s+prices[p.id].price,0),known:known.length,count:chosen.length,complete:known.length===chosen.length,concepts:all.length-chosen.length,stale:count('stale'),unavailable:count('unavailable'),invalid:count('invalid'),fresh:count('fresh')};
}
