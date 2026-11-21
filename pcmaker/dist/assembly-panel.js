import {categories} from './catalog.js';
import {formatMoney,formatTotals} from './money.js';
import {priceQuality,formatPriceDate} from './price-quality.js';

const groups=[
 ['Основа',['cpu','motherboard','ram']],
 ['Графика и хранение',['gpu','storage']],
 ['Питание и охлаждение',['psu','cooler','case']]
];
const labels=Object.fromEntries(categories.map(([key,name])=>[key,name]));
const dependent=new Set(['gpu','ram','storage','cooler']);
export function createAssemblyPanel({icon,escape,priceFor,highlight}){
 const get=id=>document.getElementById(id);
 const list=get('parts-list');
 let chosenKey=null,previewKey=null;
 function markRow(){
  const key=previewKey||chosenKey;
  for(const row of list.querySelectorAll('.part-row')){
   row.classList.toggle('wave-current',row.dataset.category===key);
  }
 }
 function chooseRow(key){chosenKey=key;markRow();}
 function previewRow(key){previewKey=key;markRow();}
 for(const event of ['pointerover','focusin'])list.addEventListener(event,e=>{
  const row=e.target.closest('[data-category]');
  if(row)highlight(row.dataset.category,labels[row.dataset.category]);
 });
 for(const event of ['pointerleave','focusout'])list.addEventListener(event,()=>highlight(null));
 list.addEventListener('click',event=>{
  const row=event.target.closest('.part-row');
  if(row){chooseRow(row.dataset.category);highlight(null);}
 });
 get('footer-auto')?.addEventListener('click',()=>get('autobuild-button').click());
 let frame=0,display={},previous='',dismissedHint=false;
 function price(totals,currency,estimated,caption){
  const target=JSON.stringify([totals,currency,estimated,caption]);
  if(previous===target)return;
  const animate=previous&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  previous=target;cancelAnimationFrame(frame);
  const output=get('price-total'),keys=Object.keys(totals),from={...display};
  get('price-caption').textContent=caption;
  function draw(t){
   display=Object.fromEntries(keys.map(k=>[k,t===1?totals[k]:Math.round((from[k]||0)+(totals[k]-(from[k]||0))*t)]));
   output.textContent=keys.length?(estimated?'≈ ':'')+formatTotals(display):'— '+(currency==='BYN'?'BYN':'₽');
  }
  if(!animate||!keys.length){draw(1);return;}
  const start=performance.now();
  const tick=now=>{const t=Math.min(1,(now-start)/280);draw(1-(1-t)**3);if(t<1)frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);
 }
 function render(parts,check,currency){
  const missing=check.missing.length,count=8-missing;
  const row=key=>{
   const p=parts[key],offer=p&&priceFor(p.id),state=offer&&priceQuality(offer),bad=check.errors.some(err=>err.parts.includes(key));
   const start=!parts.cpu&&!parts.motherboard&&['cpu','motherboard'].includes(key),later=!p&&!parts.motherboard&&dependent.has(key);
   const note=state?.status==='stale'?'<span class="old-price" title="Снимок от '+escape(formatPriceDate(offer.date))+'">◷ Цена устарела</span>':state?.status==='unavailable'?' · нет в наличии':state?.status==='invalid'?' · требует проверки':'';
   return '<button class="part-row '+(p?'selected':'empty')+(bad?' conflict':'')+(later?' dependent':'')+'" data-category="'+key+'" '+(later?'title="Сначала выбери плату. Этот слот тоже доступен."':'')+'><span class="part-icon">'+icon(key)+'</span><span class="part-text"><span class="part-category">'+labels[key]+(start?' <small class="start-chip">Начни здесь</small>':'')+'</span><span class="part-name">'+escape(p?.short||'Выбрать комплектующее')+'</span>'+(offer?'<span class="part-price">'+formatMoney(offer.price,offer.currency||currency)+' '+note+'</span>':'')+'</span>'+(p?'':'<span class="part-action" aria-hidden="true">+</span>')+'</button>';
  };
  list.innerHTML=groups.map(([label,keys])=>'<section class="slot-group"><h3>'+label+'</h3>'+keys.map(row).join('')+'</section>').join('');
  chosenKey??=categories.find(([key])=>parts[key])?.[0];
  markRow();
  if(count>1)dismissedHint=true;
  get('scene-hint').hidden=dismissedHint;
  const sim=get('open-simulation');
  sim.disabled=missing>0;
  sim.style.setProperty('--progress',count*12.5+'%');
  sim.innerHTML=missing?'Добавь ещё '+missing+' '+(missing===1?'деталь':missing<5?'детали':'деталей'):icon('play')+' Проверить в работе';
  const health=get('build-health');
  if(!health)return;
  const watts=parts.psu?.watts,hasLoad=!!(parts.cpu||parts.gpu),fraction=watts&&hasLoad?Math.min(100,100*check.peak/watts):0;
  health.innerHTML='<div class="power-line"><b>Пиковая мощность</b><span>'+(hasLoad?'≈ '+check.peak:'—')+' / '+(watts||'—')+' Вт</span></div><div class="power-meter" aria-hidden="true"><i style="width:'+fraction+'%"></i></div>';
 }
 return {render,price,chooseRow,previewRow,dismissHint(){dismissedHint=true;get('scene-hint').hidden=true;}};
}
