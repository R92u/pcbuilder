import {regionFromCurrency,storeLink} from './regions.js';
import {purposes,quoteBuild} from './autobuild.js';
import {compatibility} from './engine.js';
import {productImages} from './product-images.js';
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)?s.split('-').reverse().join('.'):s;
const safe=u=>{try{const url=new URL(u);return url.protocol==='https:'?url.href:'#';}catch{return '#';}};

export function createAutoBuilder({getPrices,beforeOpen,onApply,initialPlan=null}){
 const $=id=>document.getElementById(id),dialog=$('autobuild-dialog');let worker,result=null,purpose='game',generation=0;let region=regionFromCurrency(getPrices().currency);const money=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(n)+' '+region.symbol;
 function syncRegion(){const next=regionFromCurrency(getPrices().currency),changed=next.id!==region.id;region=next;const input=$('autobuild-budget');input.min=region.minBudget;input.max=region.maxBudget;input.setAttribute('aria-label','Бюджет в '+region.currency);$('autobuild-budget-label').textContent='Твой бюджет, '+region.symbol;$('autobuild-currency').textContent=region.symbol;document.querySelectorAll('[data-budget-preset]').forEach((b,i)=>{b.dataset.budgetPreset=region.presets[i];b.textContent=new Intl.NumberFormat('ru-RU').format(region.presets[i]);});$('autobuild-estimates').disabled=false;if(changed||!syncRegion.initialized){$('autobuild-budget').value=region.defaultBudget;$('autobuild-estimates').checked=region.id==='ru';}syncRegion.initialized=true;}

 function stop(){generation++;worker?.terminate();worker=null;$('autobuild-submit').disabled=false;$('autobuild-submit').textContent='Подобрать сборку';$('autobuild-result').removeAttribute('aria-busy');}
 function invalidate(){stop();result=null;$('autobuild-apply').disabled=true;$('autobuild-result').innerHTML='<div class="budget-empty"><span>8 деталей · одна сборка</span><h3>Подберём под твои задачи</h3><p>Укажи бюджет и нажми «Подобрать сборку». Текущие детали останутся на месте до применения результата.</p></div>';$('autobuild-status').textContent='';}
 function setPurpose(value){purpose=value;for(const b of document.querySelectorAll('[data-budget-purpose]'))b.setAttribute('aria-pressed',String(b.dataset.budgetPurpose===value));$('autobuild-purpose-note').textContent=purposes[value].description;invalidate();}
 function preview(data){
  result=data.status==='ok'?data:null;$('autobuild-apply').disabled=!result;
  if(!result){$('autobuild-result').innerHTML=`<div class="budget-empty budget-failure"><span>Подбор завершён</span><h3>${e(data.message||'Не удалось подобрать сборку.')}</h3>${data.minimum?`<p>Минимум для этого режима и набора цен: <b>${e(money(data.minimum))}</b>, включая резерв для оценочных цен.<br>Не хватает ${e(money(data.shortfall))}.</p>`:''}<p>${region.id==='by'?'Для Беларуси нужны предложения местных магазинов на проверенные модели. Можно разрешить устаревшие BYN-цены с резервом; RUB не пересчитываются.':'Можно изменить бюджет, назначение или разрешить ориентировочные цены.'}</p></div>`;$('autobuild-status').textContent=data.minimum?'Нужно от '+money(data.minimum):data.message;return;}
  const q=result.quote;
  $('autobuild-status').textContent=`Сборка подобрана. ${q.estimatedCount?'Есть ориентировочные цены.':'Все цены проверены не более 7 дней назад.'}`;
  $('autobuild-result').innerHTML=`<header class="budget-result-heading"><div><span>${e(purposes[purpose].name)} · бюджет ${e(money(result.budget))}</span><h3>Совместимая сборка</h3></div><span class="budget-ready">✓ 8 / 8 деталей</span></header>
  <div class="budget-total"><div><span>Планируемая сумма</span><strong>${q.estimatedCount?'≈ ':''}${e(money(q.planned))}</strong></div><p>Детали: ${q.estimatedCount?'≈ ':''}${e(money(q.total))}${q.reserve?`<br>Резерв: ${e(money(q.reserve))} · 10% от оценочных позиций`:''}<br>Остаток бюджета: ${e(money(Math.round((result.budget-q.planned)*100)/100))}</p></div>
  ${q.estimatedCount?`<p class="budget-estimate-note">${q.planningCount} цен — ориентиры PCmaker; ${q.staleCount} — устаревшие предложения магазинов. Фактическая покупка может стоить дороже или дешевле даже с резервом.</p>`:'<p class="budget-estimate-note">Цены — снимок предложений магазинов на указанные даты. Наличие и текущие суммы могут измениться.</p>'}
  <div class="budget-products">${q.rows.map(({key,label,part,quote})=>{const photo=productImages[part.id]?.image,link=storeLink(part,key,getPrices());return `<article class="budget-product">${photo?`<img src="./${e(photo)}" alt="" width="62" height="62" loading="lazy">`:'<span></span>'}<div><span class="budget-category">${e(label)}</span><h4>${e(part.name)}</h4><p>${e(part.detail||'')}</p><div class="budget-row-meta"><strong>${quote.estimated?'≈ ':''}${e(money(quote.price))}</strong>${quote.kind==='stale'?'<span class="budget-estimated">Цена устарела</span>':quote.estimated?'<span class="budget-estimated">Оценка PCmaker</span>':'<span>Проверена ≤ 7 дней назад</span>'}</div><small>${quote.kind==='estimate'?'Ориентир PCmaker':`<a href="${e(safe(quote.url))}" target="_blank" rel="noopener noreferrer">${e(quote.store)} ↗</a>`} · ${e(date(quote.date))}${quote.kind!=='estimate'?' · '+(quote.availability==='in-stock'?'В наличии на дату проверки':'Наличие уточняется'):''} · <a href="${e(link.url)}" target="_blank" rel="noopener noreferrer">${e(link.label)}</a></small>${quote.note?`<p class="budget-offer-note">${e(quote.note)}</p>`:''}</div></article>`;}).join('')}</div>
  <div class="budget-checks"><b>Что проверено</b><p>Сокет, поколение и объём памяти, размеры корпуса и кулера, разъёмы питания. БП — от ${result.recommendedPsu} Вт для этой конфигурации.</p>${result.warnings.length?`<details><summary>Уточнения по сборке · ${result.warnings.length}</summary><ul>${result.warnings.map(w=>`<li>${e(w)}</li>`).join('')}</ul></details>`:''}</div>`;
 }
 $('autobuild-form').onsubmit=event=>{
  event.preventDefault();stop();result=null;$('autobuild-apply').disabled=true;
  const budget=Number($('autobuild-budget').value),allowEstimates=$('autobuild-estimates').checked;
  if(!Number.isFinite(budget)||budget<region.minBudget||budget>region.maxBudget){preview({status:'invalid',message:'Укажи бюджет от '+region.minBudget+' до '+region.maxBudget+' '+region.symbol+'.'});return;}
  const request=++generation;$('autobuild-submit').disabled=true;$('autobuild-submit').textContent='Подбираем…';$('autobuild-status').textContent='Проверяем сочетания комплектующих…';$('autobuild-result').setAttribute('aria-busy','true');
  try{worker=new Worker(new URL('./autobuild-worker.js',import.meta.url),{type:'module'});
   worker.onmessage=({data})=>{if(request!==generation)return;stop();preview(data);};
   worker.onerror=()=>{if(request!==generation)return;stop();preview({status:'error',message:'Подбор не загрузился. Обнови страницу и попробуй снова.'});};
   worker.postMessage({budget,purpose,allowEstimates,currency:region.currency,prices:getPrices().items});
  }catch{stop();preview({status:'error',message:'Браузер не смог запустить подбор. Попробуй обновить страницу.'});}
 };
 $('autobuild-apply').onclick=()=>{
  if(!result)return;
  const current=quoteBuild(result.build,getPrices().items,result.allowEstimates,region.currency);
  // Never apply a stale preview after asynchronous price loading or edits.
  if(!current||JSON.stringify(current)!==JSON.stringify(result.quote)||!compatibility(result.build).ready){invalidate();$('autobuild-status').textContent='Данные обновились. Повтори подбор, чтобы увидеть актуальный расчёт.';return;}
  const applied=result;dialog.close();onApply(applied);
 };
 $('autobuild-budget').oninput=invalidate;$('autobuild-estimates').onchange=invalidate;
 document.querySelectorAll('[data-budget-purpose]').forEach(b=>b.onclick=()=>setPurpose(b.dataset.budgetPurpose));
 document.querySelectorAll('[data-budget-preset]').forEach(b=>b.onclick=()=>{$('autobuild-budget').value=b.dataset.budgetPreset;invalidate();});
 dialog.addEventListener('close',stop);
 syncRegion();
 if(Number.isFinite(initialPlan?.budget)&&initialPlan.budget>=region.minBudget&&initialPlan.budget<=region.maxBudget&&region.id==='ru'){$('autobuild-budget').value=initialPlan.budget;$('autobuild-estimates').checked=initialPlan.allowEstimates!==false;}
 setPurpose(Object.hasOwn(purposes,initialPlan?.purpose)?initialPlan.purpose:'game');
 return {open(){beforeOpen();syncRegion();invalidate();dialog.showModal();$('autobuild-budget').focus();},refresh(){syncRegion();if(dialog.open){invalidate();$('autobuild-status').textContent='Снимок цен обновлён. Можно запустить подбор.';}}};
}
