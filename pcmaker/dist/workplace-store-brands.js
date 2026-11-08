import './navigation.js';
import {peripherals,peripheralCategories,peripheralById,sanitizeWorkplace,peripheralQuote,offersForPeripheral} from './peripherals.js?v=expanded-20261102';
import {regionFor} from './regions.js';
import {formatMoney,formatTotals,selectRegionalOffer,foreignPriceNotice} from './money.js';
import {priceQuality} from './price-quality.js';
import {offerMarkup} from './data-quality-ui.js';

export function mountPeripherals({getScene,getRegion,openShop,refreshShop}) {
const $=id=>document.getElementById(id),e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=key=>{try{return JSON.parse(localStorage.getItem(key));}catch{return null;}};
const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
let selection=sanitizeWorkplace(read('pcmaker-workplace')),inspected=null;
let regionId='ru';try{regionId=regionFor(localStorage.getItem('pcmaker-region')).id;}catch{}
const currency=()=>regionFor(regionId).symbol|| (regionId==='by'?'BYN':'₽');
regionId=getRegion();
function price(p){const offer=selectRegionalOffer(offersForPeripheral(p),regionId),quality=priceQuality(offer);if(!offer||quality.status==='invalid')return '<strong class="product-price">Нет цены '+e(currency())+'</strong><p class="price-source">Для этого региона предложение пока не проверено.</p>';
 const kind=offer.kind==='manufacturer'?'Цена каталога производителя':offer.availability==='out-of-stock'?'Последняя цена · нет в наличии':'Цена магазина';
 return `<strong class="product-price">${formatMoney(offer.price,offer.currency)}</strong>${offerMarkup(offer)}<p class="price-source">${e(kind)} · ${e(offer.store)}${offer.note?'<br>'+e(offer.note):''}</p>`;
}
function offerLink(p){if(!selectRegionalOffer(offersForPeripheral(p),regionId)&&regionId==='ru')return `<a href="https://www.dns-shop.ru/search/?q=${encodeURIComponent(p.name)}" target="_blank" rel="noopener noreferrer">Найти в DNS ↗</a>`;const offer=selectRegionalOffer(offersForPeripheral(p),regionId);return offer?`${offer.currency==='USD'?`<a href="https://www.dns-shop.ru/search/?q=${encodeURIComponent(p.name)}" target="_blank" rel="noopener noreferrer">Найти в DNS ↗</a> · `:''}<a href="${e(offer.url)}" target="_blank" rel="noopener noreferrer">${offer.kind==='manufacturer'?'Цена и магазины у производителя':'Предложение '+e(offer.store)} ↗</a>`:`<a href="https://5element.by/search/?q=${encodeURIComponent(p.name)}" target="_blank" rel="noopener noreferrer">Найти в 5 элементе ↗</a>`;}
function choose(id){const p=peripheralById[id];if(!p)return;selection[p.category]=id;const stored=save('pcmaker-workplace',selection);getScene()?.setPeripherals(selection);render();refreshShop();if(!stored){$('workplace-total-note').textContent='Браузер не разрешил сохранить выбор. Он доступен до закрытия страницы.';}}
function render(){
 $('workplace-count').textContent=Object.keys(selection).length+' устройства';
 $('workplace-selection').innerHTML=Object.entries(selection).map(([key,id])=>`<button class="workplace-selected" data-select-category="${key}" title="Выбрать ${e(peripheralCategories[key].toLowerCase())}"><span><small>${e(peripheralCategories[key])}</small><strong>${e(peripheralById[id].name)}</strong></span><span>↗</span></button>`).join('');
 const quote=peripheralQuote(selection,regionId);$('workplace-total').textContent=quote.priced?formatTotals(quote.totals):'Нет цен';
 $('workplace-total-note').textContent=quote.complete?'Сумма выбранных моделей по опубликованным ценам. '+(quote.purchasable?'':'Наличие и итоговую цену покупки нужно проверить.'):`Подтверждено цен: ${quote.priced} из 3. ${quote.priced?'Сумма неполная. ':''}Российские цены не пересчитываются в BYN.`;
 if(quote.totals.USD)$('workplace-total-note').textContent+=' '+foreignPriceNotice;
}
function details(id){const p=peripheralById[id];if(!p)return;inspected=id;
 const specs={'Артикул / модель':p.sku,'Цвет':p.color,'Размеры (Ш × Г × В)':p.dimensions.join(' × ')+' мм',...p.specs};
 $('peripheral-details').innerHTML=`<div class="peripheral-detail"><div><div class="peripheral-detail-image"><img src="./assets/peripherals/${p.id}.webp" alt="${e(p.name)}"></div>${price(p)}${offerLink(p)}<button class="button primary" data-choose="${id}">${selection[p.category]===id?'Оставить на столе':'Поставить на стол'}</button><p>3D-модель упрощена: сохранены габариты, цвет и основные особенности формы. Мелкие элементы и маркировка условные.</p><a href="${e(p.source)}" target="_blank" rel="noopener noreferrer">Источник характеристик ↗</a><p>Фото: ${e(p.photoCredit||p.name.split(' ')[0])}. Параметры сверены ${e(p.verifiedAt||'2026-11-02')}. Неуказанные производителем сведения не дополняются предположениями.</p></div><div><h2 id="peripheral-title">${e(p.name)}</h2><p>${e(p.description)}</p><dl>${Object.entries(specs).map(([k,v])=>`<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join('')}</dl></div></div>`;
 if(!$('peripheral-dialog').open)$('peripheral-dialog').showModal();
}
document.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;if(b.dataset.choose){choose(b.dataset.choose);if($('peripheral-dialog').open)$('peripheral-dialog').close();}if(b.dataset.details)details(b.dataset.details);if(b.dataset.selectCategory)openShop(b.dataset.selectCategory);});
document.addEventListener('pcmaker:region-change',()=>{regionId=getRegion();render();if($('peripheral-dialog').open)details(inspected);});
$('peripheral-close').onclick=()=>$('peripheral-dialog').close();
$('peripheral-dialog').addEventListener('click',ev=>{if(ev.target===$('peripheral-dialog')){const r=ev.target.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)ev.target.close();}});
render();
function card(product){const p=peripheralById[product.peripheralId],selected=selection[p.category]===p.id;
 return `<article class="shop-card shop-peripheral ${selected?'is-selected':''}" data-product="${e(product.id)}"><figure class="shop-photo"><div class="shop-image"><img src="./assets/peripherals/${p.id}.webp" alt="${e(p.name+' · '+p.color)}" width="240" height="170" loading="lazy"><span class="shop-photo-placeholder" hidden>Фото недоступно</span></div></figure><div class="shop-card-body"><span class="shop-card-kind">${e(peripheralCategories[p.category])}</span><h3>${e(p.name)}</h3><p class="shop-specs">${e(p.description)}<br>${e(p.color)} · ${p.dimensions.join(' × ')} мм</p><div class="shop-offer">${price(p)}${offerLink(p)}</div><div class="shop-card-actions"><button class="button ${selected?'':'primary'}" data-choose="${p.id}" ${selected?'disabled':''}>${selected?'На столе':'На стол'}</button><button class="button" data-details="${p.id}" aria-label="Характеристики ${e(p.name)}">Характеристики</button></div><p class="shop-authenticity">Проверь наличие, продавца, оригинальность и гарантию перед покупкой.</p></div></article>`;
}
return {shop:{products:peripherals.map(p=>({...p,id:'peripheral-'+p.id,peripheralId:p.id,kind:'peripheral',detail:p.description,specsVerified:p.specsVerified!==false})),categories:Object.entries(peripheralCategories),offers:()=>Object.fromEntries(peripherals.map(p=>['peripheral-'+p.id,selectRegionalOffer(offersForPeripheral(p),regionId)])),card},attach(){const scene=getScene();scene.setPeripherals(selection);scene.onProduct=details;},refresh(){render();if($('peripheral-dialog').open&&inspected)details(inspected);}};
}
