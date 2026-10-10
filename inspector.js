export const specLabels={
 officialMemoryMaxMTs:'Память JEDEC до, МТ/с',pcie:'PCIe',pcieGeneration:'Поколение PCIe',pcieLanes:'Линии PCIe',sataPorts:'Порты SATA',profile:'Профиль памяти',readSpeed:'Чтение, МБ/с',writeSpeed:'Запись, МБ/с',operatingMaxC:'Рабочая температура до, °C',fanSizeMm:'Вентилятор, мм',minRpm:'Минимальные штатные обороты',fanAirflowCFM:'Поток вентилятора, CFM',sataConnectors:'Питание SATA',connector16pinWatts:'Мощность кабеля 16 pin, Вт',ramClearanceSingleFan:'Место под память без второго вентилятора, мм',adjustableFrontFan:'Регулируемая высота вентилятора',
 brand:'Бренд',manufacturer:'Производитель',sku:'Артикул',socket:'Сокет',sockets:'Крепления',memory:'Поколение памяти',cores:'Ядра',threads:'Потоки',tdp:'TDP / базовая мощность, Вт',peakPower:'Предел мощности в симуляции, Вт',tmax:'Температурный предел модели, °C',baseGHz:'Базовая частота, ГГц',boostGHz:'Частота Boost, ГГц',cacheMB:'Кэш L3 / Smart Cache, МБ',integratedGraphics:'Встроенная графика',vram:'Видеопамять, ГБ',vramType:'Тип видеопамяти',length:'Длина, мм',power:'Мощность, Вт',recommendedPsu:'Рекомендованный БП, Вт',connectorType:'Питание видеокарты',connectors:'Разъёмы PCIe 8 pin / входы адаптера',connector16pin:'Нативный кабель 16 pin',fans:'Вентиляторы',boostMHz:'Частота Boost, МГц',busBits:'Шина памяти, бит',ports:'Разъёмы',form:'Формат',forms:'Поддерживаемые платы',slots:'Слоты памяти',maxRam:'Максимум памяти, ГБ',m2:'Поддержка M.2',m2Slots:'Слоты M.2',chipset:'Чипсет',epsConnectors:'Разъёмы питания CPU',usbCHeader:'Внутренний разъём USB-C',capacity:'Объём',modules:'Модули в комплекте',speed:'Скорость памяти, МТ/с',height:'Высота, мм',cl:'Задержка CL',latency:'Тайминги',voltage:'Напряжение, В',interface:'Интерфейс',readMBs:'Чтение, МБ/с',writeMBs:'Запись, МБ/с',readMBps:'Чтение, МБ/с',writeMBps:'Запись, МБ/с',tbw:'Ресурс записи, ТБ',ramClearance:'Место под память, мм',maxRpm:'Максимальные обороты, об/мин',towers:'Башни радиатора',heatpipes:'Тепловые трубки',watts:'Мощность БП, Вт',modular:'Модульные кабели',certification:'Сертификат',gpuLimit:'Максимальная длина GPU, мм',coolerLimit:'Максимальная высота кулера, мм',psuLimit:'Максимальная длина БП, мм',dimensions:'Габариты',frontFanCount:'Передние вентиляторы в комплекте',rearFanCount:'Задние вентиляторы в комплекте',usbA:'USB-A спереди',usb2:'USB 2.0 спереди',usbC:'USB-C спереди',audio:'Аудиоразъёмы',wifi:'Wi-Fi',lan:'Сеть',biosNote:'BIOS'
};
export function componentSpecs(part,key){
 const rows=[];
 for(const [field,label] of Object.entries(specLabels)){
  let value=part[field];if(value===undefined||value===null)continue;if(field==='ramClearance'&&part.ramUnrestricted){rows.push(['Совместимость с памятью','Кулер не перекрывает слоты RAM']);continue;}
  if(field==='capacity')value+=' '+(key==='storage'?'ГБ':'ГБ');
  else if(field==='connectorType')value=value==='16pin'?'16 pin (12VHPWR / 12V-2x6)':'PCIe 8 pin';
  else if(field==='ports'&&Array.isArray(value))value=value.map(p=>typeof p==='string'?p:`${p.count||1} × ${p.label||p.type}`).join(' · ');
  else if(field==='dimensions'&&Array.isArray(value))value=value.join(' × ')+' мм';
  else if(Array.isArray(value))value=value.join(' / ');
  else if(typeof value==='boolean')value=value?'Да':'Нет';
  else if(field==='dimensions'&&typeof value==='object')value=`${value.length} × ${value.width} × ${value.height} мм`;else if(typeof value==='object')value=Object.entries(value).map(([k,v])=>`${k}: ${v}`).join(' · ');
  rows.push([label,String(value)]);
 }
 if(key==='psu'&&typeof part.efficiency==='string')rows.push(['Сертификат',part.efficiency]);
 return rows;
}
export const heatLabels={cpu:'Кристалл CPU',gpu:'Графический процессор',ram:'Модули памяти',storage:'Контроллер SSD',motherboard:'Область питания платы',cooler:'Радиатор кулера',psu:'Воздух на выходе БП',case:'Воздух внутри корпуса'};
