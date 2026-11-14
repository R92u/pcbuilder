import {categories,byId} from './catalog.js';
import {formatMoney} from './money.js';
import {normalizePriceHistory,componentPriceSeries,buildPriceSeries} from './price-history.js';

const day=86400000;
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateLabel=value=>value.split('-').reverse().join('.');
const dateShort=value=>value.slice(5).split('-').reverse().join('.');
const stamp=value=>Date.parse(value+'T00:00:00Z');
const symbols={RUB:'₽',BYN:'BYN',USD:'$'};
const currencyFor={ru:'RUB',by:'BYN',usd:'USD'};
const availableText=offer=>offer.availability==='in-stock'?'В наличии на дату проверки':offer.availability==='out-of-stock'?'Не было в наличии':'Наличие не подтверждено';
const sourceLink=offer=>`<a href="${escape(offer.url)}" target="_blank" rel="noopener noreferrer">${escape(offer.store)} ↗</a>`;

export function createPriceHistory({getBuild,getRegion,getPrices,beforeOpen}){
 const trigger=document.getElementById('price-history-button');
 const dialog=document.createElement('dialog');
 dialog.id='price-history-dialog';dialog.className='price-history-dialog';
 dialog.setAttribute('aria-labelledby','price-history-title');
 dialog.innerHTML=`<header class="price-history-header"><div><p>ЦЕНЫ ВО ВРЕМЕНИ</p><h2 id="price-history-title">График цен</h2><p data-history-subtitle></p></div><button type="button" class="icon-button" data-history-close aria-label="Закрыть график цен"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button></header>
 <div class="price-history-controls"><label class="price-history-field">Что сравнить<select data-history-part aria-label="Комплектующая или вся сборка"></select></label><label class="price-history-field">Валюта<select data-history-currency aria-label="Валюта графика"></select></label><div class="price-history-periods" role="group" aria-label="Период графика">${[7,30,90].map(n=>`<button type="button" data-history-days="${n}" aria-pressed="${n===30}">${n} дней</button>`).join('')}</div></div>
 <div data-history-content aria-busy="false"></div>`;
 document.body.append(dialog);
 const content=dialog.querySelector('[data-history-content]'),partSelect=dialog.querySelector('[data-history-part]'),currencySelect=dialog.querySelector('[data-history-currency]');
 let history=null,loadError=false,parts=[],sellable=[],groups={},region='ru',kind='total',seriesRegion='ru',days=30,now=Date.now(),request=0,selectedDate=null,series=null;
 let chartWidth=840;
 const totalMode=()=>kind==='total';
 const currentIDs=()=>totalMode()?groups[seriesRegion]||[]:[kind];
 const nameOf=id=>byId[id]?.name||id;
 const seriesCache=new Map();
 const historyFor=ids=>({schemaVersion:1,items:{[seriesRegion]:Object.fromEntries(ids.map(id=>[id,history.items[seriesRegion]?.[id]||[]]))}});
 const seriesFor=id=>{if(!seriesCache.has(id))seriesCache.set(id,componentPriceSeries(historyFor([id]),id,{region:seriesRegion,days,now}));return seriesCache.get(id);};
 const offerOn=(id,date)=>seriesFor(id).points.find(p=>p.date===date);
 const valueOf=p=>totalMode()?p.total:p.price;
 const isFull=p=>!totalMode()||p.complete;
 const changedSource=(a,b)=>totalMode()?currentIDs().some(id=>a.sources[id]!==b.sources[id]):a.sourceKey!==b.sourceKey;
 function capture(){
  const build={...getBuild()};region=getRegion()==='by'?'by':'ru';now=Date.now();
  parts=categories.map(([key,label])=>({key,label,product:byId[build[key]]})).filter(p=>p.product);
  sellable=parts.filter(p=>!p.product.concept);groups={[region]:[],...(region==='ru'?{usd:[]}: {})};
  // Currency membership is frozen with the build: a currency/source switch must not change its historical composition.
  const prices=getPrices()?.items||{};
  for(const {product} of sellable){const currency=prices[product.id]?.currency;const group=region==='ru'&&currency==='USD'?'usd':region;groups[group].push(product.id);}
  if(!sellable.some(p=>p.product.id===kind))kind='total';seriesRegion=region;
  dialog.querySelector('[data-history-subtitle]').textContent=(region==='by'?'Беларусь · Минск':'Россия · Москва')+' · состав ПК на момент открытия';
  partSelect.innerHTML='<option value="total">Вся выбранная сборка</option>'+sellable.map(({label,product})=>`<option value="${escape(product.id)}">${escape(label+' · '+product.name)}</option>`).join('');
  partSelect.value=kind;partSelect.disabled=!sellable.length;
  setCurrencies();
 }
 function setCurrencies(){
  const choices=totalMode()?[region,...(region==='ru'&&groups.usd.length?['usd']:[])]:[region,...(region==='ru'?['usd']:[])];
  if(!choices.includes(seriesRegion))seriesRegion=choices[0];
  currencySelect.innerHTML=choices.map(id=>`<option value="${id}">${currencyFor[id]} · ${id==='usd'?'зарубежные предложения':id==='by'?'Беларусь':'Россия'}</option>`).join('');
  currencySelect.value=seriesRegion;currencySelect.disabled=choices.length===1;
 }
 async function load(){
  const token=++request;loadError=false;history=null;content.setAttribute('aria-busy','true');
  content.innerHTML='<div class="price-history-empty" role="status"><h3>Загружаем историю цен…</h3><p>Только сохранённые проверки магазинов.</p></div>';
  try{
   const response=await fetch('./price-history.json',{cache:'no-cache',signal:AbortSignal.timeout(8000)});
   if(!response.ok)throw Error('History unavailable');const data=await response.json();
   if(data?.schemaVersion!==1||!data.items)throw Error('Invalid history');
   if(token!==request)return;history=normalizePriceHistory(data,{now});
  }catch{if(token!==request)return;loadError=true;}
  if(token===request){content.setAttribute('aria-busy','false');render();}
 }
 function render(){
  dialog.querySelectorAll('[data-history-days]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.historyDays)===days)));
  if(!history&&!loadError)return;
  if(loadError){content.innerHTML='<div class="price-history-empty" role="status"><h3>Не удалось загрузить историю</h3><p>Проверь подключение к интернету и попробуй ещё раз.</p><button type="button" class="button" data-history-retry>Повторить загрузку</button></div>';return;}
  if(!sellable.length){content.innerHTML='<div class="price-history-empty"><h3>Сначала выбери комплектующие ПК</h3><p>Здесь появится история цен выбранных деталей. Учебные корпуса PCmaker не продаются и не входят в стоимость.</p></div>';return;}
  seriesCache.clear();const ids=currentIDs();series=totalMode()?buildPriceSeries(historyFor(ids),ids,{region:seriesRegion,days,now}):seriesFor(kind);
  const points=series.points,complete=points.filter(isFull),latest=points.at(-1),currency=currencyFor[seriesRegion];
  const values=complete.map(valueOf),lastLabel=totalMode()?(latest?.complete?'Последний полный снимок':'Последняя известная часть'):'Последняя проверка';
  const groupNote=totalMode()&&groups.usd?.length?'Валюты разделены по предложениям на момент открытия. В этой части '+ids.length+' из '+sellable.length+' деталей; в другой валюте — '+(sellable.length-ids.length)+'. Без пересчёта валют.':totalMode()?'Для полной суммы нужны цены всех '+ids.length+' выбранных деталей за одну дату.':'';
  const conceptCount=parts.length-sellable.length;
  const coverage=totalMode()?`${ids.length} деталей в ${currency}`:nameOf(kind);
  content.innerHTML=`<details class="price-history-composition"><summary>${escape(coverage)} · как считаем</summary>${groupNote?`<p>${escape(groupNote)}</p>`:''}${conceptCount?'<p>Учебный корпус PCmaker исключён из стоимости.</p>':''}<p>Состав зафиксирован при открытии окна. Периферия в этот график не входит.</p></details>
   <div class="price-history-summary"><div class="price-history-stat"><span>${lastLabel}</span><strong>${latest?escape(formatMoney(valueOf(latest),currency)):'—'}</strong><small>${latest?dateLabel(latest.date)+(totalMode()?' · '+latest.known+'/'+latest.totalCount+' цен':''):'Нет наблюдений за период'}</small></div><div class="price-history-stat"><span>${totalMode()?'Минимум полного снимка':'Минимум за период'}</span><strong>${values.length?escape(formatMoney(Math.min(...values),currency)):'—'}</strong><small>По сохранённым предложениям</small></div><div class="price-history-stat"><span>${totalMode()?'Максимум полного снимка':'Максимум за период'}</span><strong>${values.length?escape(formatMoney(Math.max(...values),currency)):'—'}</strong><small>Доставка не включена</small></div></div>
   <div class="price-history-range"><span>${dateLabel(series.startDate)} — ${dateLabel(series.endDate)}</span><span>Дней с наблюдениями: ${points.length}</span></div>
   <div class="price-history-chart" data-history-chart></div>
   <div class="price-history-legend"><span><i></i> Подтверждённая цена${totalMode()?' / полная сумма':''}</span>${complete.some((p,i)=>i&&changedSource(complete[i-1],p))?'<span class="is-source-change"><i></i> Смена магазина</span>':''}${totalMode()?'<span class="is-partial"><i></i> Неполный снимок — без точки суммы</span>':''}</div>
   <section class="price-history-details" data-history-details aria-live="polite" aria-label="Подробности выбранной даты"></section>
   <p class="price-history-notice">Линия соединяет реальные проверки: между ними цена могла меняться. Пунктир означает смену магазина. Пропущенные дни не заполняются старыми ценами. ${totalMode()?'Неполные суммы не сравниваются с полными. ':''}Это история сохранённых предложений, а не минимальных цен рынка; наличие указано на дату проверки.</p>
   ${points.length?`<details class="price-history-date-list"><summary>Все наблюдения за период · ${points.length}</summary><div class="price-history-table-wrap"><table class="price-history-table"><thead><tr><th scope="col">Дата</th><th scope="col">${totalMode()?'Сумма / покрытие':'Цена'}</th><th scope="col">${totalMode()?'Примечание':'Магазин и наличие'}</th></tr></thead><tbody>${points.toReversed().map(p=>`<tr><td><button type="button" data-history-date="${p.date}">${dateLabel(p.date)}</button></td><td>${escape(formatMoney(valueOf(p),currency))}${totalMode()?`<small>${p.complete?'Полный снимок':'Известная часть'} · ${p.known}/${p.totalCount}</small>`:''}</td><td>${totalMode()?escape(!p.complete?'Не хватает цен на эту дату':p.purchasable?'Все детали были в наличии':'Справочная сумма: наличие не у всех подтверждено'):sourceLink(p)+'<small>'+availableText(p)+'</small>'}</td></tr>`).join('')}</tbody></table></div></details>`:''}`;
  if(!points.some(p=>p.date===selectedDate))selectedDate=latest?.date||null;
  drawChart();renderDetails();
 }
 function drawChart(){
  const host=content.querySelector('[data-history-chart]');if(!host||!series)return;
  const points=series.points;
  if(!points.length){host.innerHTML=`<div class="price-history-empty"><h3>Нет проверенных цен за этот период</h3><p>${series.allTimeCount?'Выбери более длинный период — в истории есть более ранние снимки.':'История появится после успешной проверки цены. Оценочные цены в график не попадают.'}</p></div>`;return;}
  chartWidth=Math.round(host.getBoundingClientRect().width)||840;
  const chartStyle=getComputedStyle(host),innerWidth=chartWidth-parseFloat(chartStyle.paddingLeft)-parseFloat(chartStyle.paddingRight)-2;
  const w=Math.max(240,Math.min(940,innerWidth)),h=w<500?260:240,left=w<500?62:84,right=24,top=25,bottom=61,yBottom=h-bottom,plotHeight=yBottom-top;
  const full=points.filter(isFull),values=full.map(valueOf),min=values.length?Math.min(...values):0,max=values.length?Math.max(...values):1;
  const pad=Math.max((max-min)*.2,max*.015,1),low=Math.max(0,min-pad),high=max+pad;
  const first=stamp(series.startDate),last=stamp(series.endDate),x=date=>left+(stamp(date)-first)/Math.max(day,last-first)*(w-left-right),y=value=>yBottom-(value-low)/Math.max(1,high-low)*plotHeight;
  const ticks=Array.from({length:4},(_,i)=>low+(high-low)*i/3),tickFormat=new Intl.NumberFormat('ru-RU',{notation:'compact',maximumFractionDigits:1});
  let lines='';for(let i=1;i<full.length;i++){const a=full[i-1],b=full[i];lines+=`<path class="price-history-line${changedSource(a,b)?' is-source-change':''}" d="M${x(a.date)},${y(valueOf(a))} L${x(b.date)},${y(valueOf(b))}"/>`;}
  const xTicks=w<500?3:5;
  const svg=`<svg class="price-history-svg" viewBox="0 0 ${w} ${h}" role="group" aria-label="График цен в ${currencyFor[seriesRegion]}. Точки доступны с клавиатуры; таблица находится ниже.">
   <text class="price-history-axis" x="${left}" y="13">${symbols[currencyFor[seriesRegion]]}</text>
   ${ticks.map(v=>`<line class="price-history-grid" x1="${left}" x2="${w-right}" y1="${y(v)}" y2="${y(v)}"/><text class="price-history-axis" x="${left-10}" y="${y(v)+4}" text-anchor="end">${full.length?tickFormat.format(v):'—'}</text>`).join('')}
   ${Array.from({length:xTicks},(_,i)=>{const d=new Date(first+Math.round((last-first)/day*i/(xTicks-1))*day).toISOString().slice(0,10);return `<text class="price-history-axis" x="${x(d)}" y="${h-8}" text-anchor="middle">${dateShort(d)}</text>`;}).join('')}
   ${lines}${points.map((p,i)=>{const partial=!isFull(p),label=dateLabel(p.date)+' · '+(partial?'неполный снимок, '+p.known+' из '+p.totalCount+' цен':formatMoney(valueOf(p),currencyFor[seriesRegion]))+(!totalMode()?' · '+p.store+' · '+availableText(p):'');return `<g class="price-history-point${partial?' is-partial':''}" transform="translate(${x(p.date)},${partial?h-38:y(valueOf(p))})" role="button" tabindex="0" data-history-point="${i}" aria-label="${escape(label)}" aria-pressed="${p.date===selectedDate}"><title>${escape(label)}</title><circle class="price-history-hit" r="14"/><circle r="5"/></g>`;}).join('')}
   ${!full.length?`<text class="price-history-axis" x="${left+(w-left-right)/2}" y="${top+plotHeight/2}" text-anchor="middle">${w<500?'Нет полной суммы за день':'Нет даты с ценами всех выбранных деталей'}</text>`:''}
   </svg>`;
  host.innerHTML=svg+(full.length===1?'<p class="price-history-single">Для линии нужны две проверки'+(totalMode()?' с ценами всех выбранных деталей':'')+'. Пока есть одна.</p>':'');
 }
 function renderDetails(){
  const host=content.querySelector('[data-history-details]'),p=series?.points.find(row=>row.date===selectedDate);if(!host)return;
  if(!p){host.innerHTML='';return;}
  const price=escape(formatMoney(valueOf(p),currencyFor[seriesRegion]));
  if(!totalMode())host.innerHTML=`<h3>${dateLabel(p.date)} · ${price}</h3><p>${sourceLink(p)} · ${availableText(p)}</p>${p.sourceChanged?'<p>Источник предложения изменился. Эту разницу нельзя считать изменением цены того же магазина.</p>':''}`;
  else{
   const ids=currentIDs(),previousFull=series.points.slice(0,series.points.indexOf(p)).filter(isFull).at(-1);
   const sourceChanged=p.sourceChangedIds?.length||(p.complete&&previousFull&&changedSource(previousFull,p));
   host.innerHTML=`<h3>${dateLabel(p.date)} · ${p.complete?'Справочная сумма':'Известная часть'} ${price}</h3><p class="price-history-coverage">${p.known} из ${p.totalCount} цен подтверждены за эту дату.${p.complete&&!p.purchasable?' Не все детали были в наличии.':''}</p>${sourceChanged?'<p>Есть смена магазинов. Состав деталей остался прежним, но предложения отличаются.</p>':''}<ul>${ids.map(id=>{const offer=offerOn(id,p.date);return `<li><span>${escape(nameOf(id))}</span><span>${offer?escape(formatMoney(offer.price,offer.currency))+' · '+sourceLink(offer)+'<small>'+availableText(offer)+'</small>':'Нет проверенной цены за эту дату'}</span></li>`;}).join('')}</ul>`;
  }
  content.querySelectorAll('[data-history-point]').forEach(el=>el.setAttribute('aria-pressed',String(series.points[Number(el.dataset.historyPoint)]?.date===selectedDate)));
 }
 function selectDate(date){selectedDate=date;renderDetails();}
 partSelect.addEventListener('change',()=>{kind=partSelect.value;seriesRegion=region;selectedDate=null;setCurrencies();render();});
 currencySelect.addEventListener('change',()=>{seriesRegion=currencySelect.value;selectedDate=null;render();});
 dialog.addEventListener('click',event=>{
  if(event.target.closest('[data-history-close]'))dialog.close();
  if(event.target.closest('[data-history-retry]'))load();
  const period=event.target.closest('[data-history-days]');if(period){days=Number(period.dataset.historyDays);selectedDate=null;render();}
  const row=event.target.closest('[data-history-date]');if(row)selectDate(row.dataset.historyDate);
  const point=event.target.closest('[data-history-point]');if(point)selectDate(series.points[Number(point.dataset.historyPoint)].date);
  if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}
 });
 for(const eventName of ['pointerover','focusin'])content.addEventListener(eventName,event=>{const point=event.target.closest('[data-history-point]');if(point)selectDate(series.points[Number(point.dataset.historyPoint)].date);});
 content.addEventListener('keydown',event=>{const point=event.target.closest('[data-history-point]');if(!point)return;const index=Number(point.dataset.historyPoint);
  if(event.key==='Enter'||event.key===' '){event.preventDefault();selectDate(series.points[index].date);}
  if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();content.querySelector(`[data-history-point="${Math.max(0,Math.min(series.points.length-1,index+(event.key==='ArrowRight'?1:-1)))}"]`)?.focus();}
 });
 const resize=new ResizeObserver(()=>{const host=content.querySelector('[data-history-chart]');if(dialog.open&&host&&Math.abs(host.getBoundingClientRect().width-chartWidth)>2)drawChart();});resize.observe(dialog);
 dialog.addEventListener('close',()=>{request++;trigger?.focus();});
 return {open(){beforeOpen?.();capture();selectedDate=null;if(!dialog.open)dialog.showModal();load();}};
}
