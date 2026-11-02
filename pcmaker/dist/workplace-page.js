import './navigation.js';
import {peripherals,peripheralCategories,peripheralById,sanitizeWorkplace,peripheralQuote} from './peripherals.js?v=expanded-20261102';
import {sanitizeBuild,demoBuild} from './catalog.js';
import {regionFor} from './regions.js';
import {priceQuality} from './price-quality.js';

const $=id=>document.getElementById(id),e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=key=>{try{return JSON.parse(localStorage.getItem(key));}catch{return null;}};
const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
let selection=sanitizeWorkplace(read('pcmaker-workplace')),category='monitor',color='all',scene,inspected=null;
let regionId='ru';try{regionId=regionFor(localStorage.getItem('pcmaker-region')).id;}catch{}
const currency=()=>regionFor(regionId).symbol|| (regionId==='by'?'BYN':'₽');
const money=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(n)+' '+currency();
$('workplace-region').value=regionId;
function price(p){const offer=p.offers[regionId],quality=priceQuality(offer);if(!offer||quality.status==='invalid')return '<strong class="product-price">Нет цены '+e(currency())+'</strong><p class="price-source">Для этого региона предложение пока не проверено.</p>';
 const kind=offer.kind==='manufacturer'?'Цена каталога производителя':offer.availability==='out-of-stock'?'Последняя цена · нет в наличии':'Цена магазина';
 return `<strong class="product-price">${money(offer.price)}</strong><p class="price-source">${e(kind)} · ${e(offer.store)}<br>Проверено ${new Date(offer.date+'T12:00:00Z').toLocaleDateString('ru-RU')}${quality.status==='stale'?'<br>Цена устарела — перепроверь':''}</p>`;
}
function offerLink(p){const offer=p.offers[regionId];return offer?`<a href="${e(offer.url)}" target="_blank" rel="noopener noreferrer">${offer.kind==='manufacturer'?'Цена и магазины у производителя':'Предложение '+e(offer.store)} ↗</a>`:`<a href="https://5element.by/search/?q=${encodeURIComponent(p.name)}" target="_blank" rel="noopener noreferrer">Найти в 5 элементе ↗</a>`;}
function choose(id){const p=peripheralById[id];if(!p)return;selection[p.category]=id;const stored=save('pcmaker-workplace',selection);scene?.setPeripherals(selection);render();if(!stored){$('workplace-scene-status').textContent='Браузер не разрешил сохранить выбор. Он останется доступен до закрытия страницы.';$('workplace-scene-status').hidden=false;}}
function setCategory(key){category=key;color='all';$('workplace-color').value=color;render();}
function render(){
 $('workplace-count').textContent=peripherals.length+' моделей';
 $('workplace-selection').innerHTML=Object.entries(selection).map(([key,id])=>`<button class="workplace-selected" data-select-category="${key}" title="Выбрать ${e(peripheralCategories[key].toLowerCase())}"><span><small>${e(peripheralCategories[key])}</small><strong>${e(peripheralById[id].name)}</strong></span><span>↗</span></button>`).join('');
 document.querySelectorAll('[data-category]').forEach(b=>{const active=b.dataset.category===category;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
 $('workplace-products').setAttribute('aria-labelledby','tab-'+category);
 const items=peripherals.filter(p=>p.category===category&&(color==='all'||p.colors.includes(color)));
 $('workplace-products').innerHTML=items.length?items.map(p=>`<article class="workplace-product ${selection[category]===p.id?'chosen':''}"><div class="workplace-product-picture"><img src="./assets/peripherals/${p.id}.webp" alt="${e(p.name+' · '+p.color)}" loading="lazy" width="512" height="512">${selection[category]===p.id?'<span>✓ На столе</span>':''}</div><div class="workplace-product-copy"><h3>${e(p.name)}</h3><p>${e(p.description)}<br>${e(p.color)} · ${p.dimensions.map(n=>new Intl.NumberFormat('ru-RU').format(n)).join(' × ')} мм</p>${price(p)}${offerLink(p)}<div class="workplace-product-actions"><button class="button ${selection[category]===p.id?'':'primary'}" data-choose="${p.id}" ${selection[category]===p.id?'disabled':''}>${selection[category]===p.id?'Выбрано':'На стол'}</button><button class="button" data-details="${p.id}">Характеристики</button></div></div></article>`).join(''):'<p class="workplace-empty">Такого цвета пока нет в этой категории.<br>Выбери «Все цвета».</p>';
 const quote=peripheralQuote(selection,regionId);$('workplace-total').textContent=quote.priced?money(quote.total):'Нет цен';
 $('workplace-total-note').textContent=quote.complete?'Сумма выбранных моделей по опубликованным ценам. '+(quote.purchasable?'':'Наличие и итоговую цену покупки нужно проверить.'):`Подтверждено цен: ${quote.priced} из 3. ${quote.priced?'Сумма неполная. ':''}Российские цены не пересчитываются в BYN.`;
}
function details(id){const p=peripheralById[id];if(!p)return;inspected=id;
 const specs={'Артикул / модель':p.sku,'Цвет':p.color,'Размеры (Ш × Г × В)':p.dimensions.join(' × ')+' мм',...p.specs};
 $('peripheral-details').innerHTML=`<div class="peripheral-detail"><div><div class="peripheral-detail-image"><img src="./assets/peripherals/${p.id}.webp" alt="${e(p.name)}"></div>${price(p)}${offerLink(p)}<button class="button primary" data-choose="${id}">${selection[p.category]===id?'Оставить на столе':'Поставить на стол'}</button><p>3D-модель упрощена: сохранены габариты, цвет и основные особенности формы. Мелкие элементы и маркировка условные.</p><a href="${e(p.source)}" target="_blank" rel="noopener noreferrer">Характеристики производителя ↗</a><p>Фото: ${e(p.photoCredit||p.name.split(' ')[0])}. Параметры сверены 02.11.2026. Неуказанные производителем сведения не дополняются предположениями.</p></div><div><h2 id="peripheral-title">${e(p.name)}</h2><p>${e(p.description)}</p><dl>${Object.entries(specs).map(([k,v])=>`<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join('')}</dl></div></div>`;
 if(!$('peripheral-dialog').open)$('peripheral-dialog').showModal();
}
document.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;if(b.dataset.choose){choose(b.dataset.choose);if($('peripheral-dialog').open)$('peripheral-dialog').close();}if(b.dataset.details)details(b.dataset.details);if(b.dataset.category)setCategory(b.dataset.category);if(b.dataset.selectCategory){setCategory(b.dataset.selectCategory);scene?.focus(b.dataset.selectCategory);}if(b.dataset.view)scene?.focus(b.dataset.view);});
document.querySelector('.workplace-tabs').addEventListener('keydown',ev=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(ev.key))return;ev.preventDefault();const keys=Object.keys(peripheralCategories),i=keys.indexOf(category),n=ev.key==='Home'?0:ev.key==='End'?2:(i+(ev.key==='ArrowRight'?1:2))%3;setCategory(keys[n]);$('tab-'+keys[n]).focus();});
$('workplace-color').onchange=()=>{color=$('workplace-color').value;render();};
$('workplace-region').onchange=()=>{regionId=regionFor($('workplace-region').value).id;try{localStorage.setItem('pcmaker-region',regionId);}catch{}render();if($('peripheral-dialog').open)details(inspected);};
$('peripheral-close').onclick=()=>$('peripheral-dialog').close();
$('peripheral-dialog').addEventListener('click',ev=>{if(ev.target===$('peripheral-dialog')){const r=ev.target.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)ev.target.close();}});
render();
const savedBuild=read('pcmaker-build'),build=sanitizeBuild(savedBuild||demoBuild);
$('workplace-pc-note').textContent=savedBuild?'Твой компьютер из конструктора':'Пример ПК · свою сборку можно создать в конструкторе';
try{
 const {WorkplaceScene}=await import('./workplace-models.js');scene=new WorkplaceScene($('workplace-canvas'),build,{fans:read('pcmaker-fans')?.[build.case],lighting:read('pcmaker-lighting')});scene.setPeripherals(selection);scene.onProduct=details;
 scene.onContextLost=()=>{$('workplace-scene-status').textContent='3D-контекст потерян. Обнови страницу; выбор сохранён.';$('workplace-scene-status').hidden=false;};
 $('workplace-scene-status').hidden=true;
}catch(error){console.error('Workplace 3D:',error);$('workplace-scene-status').textContent='Не удалось запустить 3D. Выбор товаров и характеристики доступны справа. Попробуй браузер с WebGL.';}
window.addEventListener('storage',ev=>{if(ev.key==='pcmaker-workplace'){selection=sanitizeWorkplace(read('pcmaker-workplace'));scene?.setPeripherals(selection);render();}if(ev.key==='pcmaker-region'){regionId=regionFor(ev.newValue).id;$('workplace-region').value=regionId;render();}});
window.addEventListener('pagehide',ev=>{if(!ev.persisted)scene?.dispose();});
