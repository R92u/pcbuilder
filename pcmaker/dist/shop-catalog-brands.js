import {regionFromCurrency} from './regions.js';
import {storePickerMarkup,mountStorePickers} from './store-picker.js';
import {catalog,categories} from './catalog.js';
import {compatibility,summarizePrices} from './engine.js';
import {isVerified} from './verification.js';
import {formatMoney,formatTotals,currencyOf} from './money.js';
import {priceQuality} from './price-quality.js';
import {verificationMarkup,offerMarkup} from './data-quality-ui.js';
import {productImages} from './product-images.js';

const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(n);
const url=u=>{try{const parsed=new URL(u);return parsed.protocol==='https:'?parsed.href:'#';}catch{return '#';}};
export const shopProducts=categories.flatMap(([category])=>catalog[category].map(p=>({...p,category})));
export const manufacturer=p=>p.manufacturer||p.brand||p.name.split(' ')[0];

// Unknown prices always remain at the end, including in descending order.
export function filterProducts(products,filters,build,prices){
 const query=(filters.query||'').trim().toLocaleLowerCase('ru');
 const list=products.filter(p=>{
  const price=prices[p.id]?.price,currency=currencyOf(prices[p.id],filters.regionCurrency||'RUB');
  const rangeCurrency=filters.currency||filters.regionCurrency||'RUB';
  return (filters.category==='all'||p.category===filters.category)&&
   (!query||`${p.name} ${p.detail} ${p.sku||''} ${p.color||''}`.toLocaleLowerCase('ru').includes(query))&&
   (!filters.budget||p.budgetTier)&&(!filters.brand||manufacturer(p)===filters.brand)&&(!filters.color||p.colors?.includes(filters.color))&&
   (!filters.memory||[p.memory].flat().includes(filters.memory))&&(!filters.socket||p.socket===filters.socket)&&
   (!filters.currency||(Number.isFinite(price)&&currency===filters.currency))&&((filters.min===''&&filters.max==='')||currency===rangeCurrency)&&
   (!filters.priced||priceQuality(prices[p.id]).status==='fresh')&&(!filters.verified||(p.kind==='peripheral'?p.specsVerified:isVerified(p)))&&
   (filters.min===''||(Number.isFinite(price)&&price>=Number(filters.min)))&&
   (filters.max===''||(Number.isFinite(price)&&price<=Number(filters.max)))&&
   (!filters.compatible||p.kind==='peripheral'||!compatibility({...build,[p.category]:p.id}).errors.some(err=>err.parts.includes(p.category)));
 });
 return list.sort((a,b)=>{
  if(filters.sort==='brand')return manufacturer(a).localeCompare(manufacturer(b),'ru')||a.name.localeCompare(b.name,'ru');
  if(filters.sort==='name')return a.name.localeCompare(b.name,'ru');
  if(['price-up','price-down'].includes(filters.sort)){
   const ap=prices[a.id]?.price,bp=prices[b.id]?.price;
   if(!Number.isFinite(ap))return Number.isFinite(bp)?1:0;
   if(!Number.isFinite(bp))return -1;
   const ac=currencyOf(prices[a.id],filters.regionCurrency||'RUB'),bc=currencyOf(prices[b.id],filters.regionCurrency||'RUB');
   if(ac!==bc)return ac==='USD'?1:bc==='USD'?-1:ac.localeCompare(bc);
   return (ap-bp)*(filters.sort==='price-down'?-1:1);
  }
  return 0;
 });
}

export function createShop({getBuild,getPrices,getSource,onChoose,beforeOpen,icon}){
 const $=id=>document.getElementById(id),dialog=$('catalog-dialog');
 mountStorePickers(dialog);
 let category='all',peripheral=null;
 const products=()=>[...shopProducts,...(peripheral?.products||[])],sections=()=>[...categories,...(peripheral?.categories||[])];
 const title=key=>sections().find(c=>c[0]===key)?.[1]||(peripheral?'Все товары':'Все комплектующие');
 const price=p=>{const item=getPrices().items[p.id];return item&&Number.isFinite(item.price)&&item.price>0?item:null;};
 function filters(){return {category,budget:$('shop-budget-only')?.checked||false,currency:$('shop-currency')?.value||'',regionCurrency:getPrices().currency||'RUB',color:$('shop-color')?.value||'',query:$('catalog-search').value,brand:$('shop-brand').value,socket:$('shop-socket').value,memory:$('shop-memory').value,min:$('shop-price-min').value,max:$('shop-price-max').value,compatible:$('compatible-only').checked,verified:$('shop-verified-only').checked,priced:$('shop-priced-only').checked,sort:$('shop-sort').value};}
 function photo(p){
  if(p.concept)return `<figure class="shop-photo"><div class="shop-image"><img src="./assets/concepts/${p.concept}.svg" alt="Эскиз ${escape(p.name)}" width="240" height="170" loading="lazy"></div><figcaption>Авторский эскиз · учебный корпус PCmaker</figcaption></figure>`;
  const asset=productImages[p.id];
  return `<figure class="shop-photo"><div class="shop-image">${asset?.image?`<img src="./${escape(asset.image)}" alt="${escape(p.name)}" width="240" height="170" loading="lazy" decoding="async">`:''}<span class="shop-photo-placeholder" ${asset?.image?'hidden':''}>${icon(p.category)}<small>Фото пока нет</small></span><span class="shop-3d">${icon('layers')} 3D</span></div>${asset?.caption?`<figcaption>${escape(asset.caption)}</figcaption>`:''}</figure>`;
 }
 function render(){
  if($('shop-currency')){const opt=$('shop-currency').querySelector('[data-local-currency]'),current=regionFromCurrency(getPrices().currency);opt.value=current.currency;opt.textContent=current.symbol;}
  const build=getBuild(),data=getPrices(),region=regionFromCurrency(data.currency),all=products(),offers={...data.items,...peripheral?.offers()},list=filterProducts(all,filters(),build,offers),summary=summarizePrices(build,data.items),check=compatibility(build);
  document.querySelector('.shop-region').textContent=region.city+' · '+region.symbol;$('shop-price-unit').textContent='Цена, '+($('shop-currency')?.value==='USD'?'USD':region.symbol);for(const id of ['shop-price-min','shop-price-max'])$(id).step=$('shop-currency')?.value==='USD'?1:region.id==='by'?10:100;
  $('shop-price-help').textContent=$('shop-currency')?.value==='USD'?'Диапазон цен в долларах.':'Диапазон — в '+region.symbol+'. При сортировке USD идут отдельной группой после региональных цен.';
  const priced=list.filter(p=>Number.isFinite(offers[p.id]?.price)),fresh=priced.filter(p=>{const q=priceQuality(offers[p.id]);return q.status!=='invalid'&&q.age<=7;});
  if($('shop-price-coverage'))$('shop-price-coverage').textContent=`Цены: ${priced.length} из ${list.length} показанных товаров · не старше 7 дней: ${fresh.length}. Дата и наличие — в каждой карточке.`;
  $('catalog-count').textContent=`${list.length} из ${all.filter(p=>category==='all'||p.category===category).length} моделей`;
  $('shop-part-count').textContent=Object.values(build).filter(Boolean).length+'/8';
  $('shop-build-price').textContent=summary.known?formatTotals(summary.totals):'—';
  $('shop-build-price-label').textContent=summary.stale+summary.unavailable+summary.invalid?'Сумма по снимкам цен':summary.complete?'Стоимость по предложениям':'Известная часть стоимости';
  $('shop-power').textContent=check.peak?check.peak+' Вт':'—';
  $('catalog-options').innerHTML=list.map(p=>{
   if(p.kind==='peripheral')return peripheral.card(p);
   const selected=build[p.category]===p.id,offer=price(p),conflicts=compatibility({...build,[p.category]:p.id}).errors.filter(err=>err.parts.includes(p.category));
   return `<article class="shop-card ${selected?'is-selected':''}" data-product="${p.id}">${photo(p)}<div class="shop-card-body"><span class="shop-card-kind">${escape(title(p.category))}</span><h3 title="${escape(p.name)}">${escape(p.name)}</h3><p class="shop-specs">${escape(p.detail)}</p>${verificationMarkup(p,false)}${p.sku?`<span class="shop-sku">${escape(p.sku)}</span>`:''}<div class="shop-offer"><strong>${p.concept?'Учебный корпус':offer?formatMoney(offer.price,offer.currency||region.currency):'Нет цены'}</strong>${offer?`<a href="${escape(url(offer.url))}" target="_blank" rel="noopener noreferrer">${escape(offer.store)} ↗</a>${offerMarkup(offer,{compact:true})}`:(p.concept?'<span>Авторская модель · не продаётся</span>':'<span>Не включена в сумму сборки</span>')}</div>${conflicts.length?`<p class="shop-conflict">${icon('alert')}${escape(conflicts.map(err=>err.text).join(' '))}</p>`:'<p class="shop-compatible">'+icon('check')+' Нет выявленных конфликтов</p>'}<div class="shop-card-actions"><button class="button ${selected?'':'primary'}" data-shop-add="${p.id}" aria-label="${selected?'Выбрано:':'Добавить:'} ${escape(p.name)}" ${selected?'disabled':''}>${icon(selected?'check':'plus')}${selected?'В сборке':'Добавить'}</button>${selected&&p.category!=='case'?`<button class="shop-remove" data-shop-remove="${p.category}" aria-label="Убрать: ${escape(p.name)}">${icon('trash')}</button>`:''}</div>${p.concept?'':storePickerMarkup(p,p.category,data,getSource(p.id))}<div class="shop-source-links">${p.sources?.[0]?`<a href="${escape(url(p.sources[0]))}" target="_blank" rel="noopener noreferrer">Спецификации ↗</a>`:''}${productImages[p.id]?.image?`<a href="${escape(url(productImages[p.id].sourcePage))}" target="_blank" rel="noopener noreferrer">Фото ↗</a>`:''}</div></div></article>`;
  }).join('')||'<div class="shop-empty">'+icon('search')+'<h3>Ничего не найдено</h3><p>Измени запрос или сбрось фильтры.</p><button class="button" data-shop-reset>Сбросить фильтры</button></div>';
  for(const image of $('catalog-options').querySelectorAll('img'))image.addEventListener('error',()=>{image.hidden=true;if(image.nextElementSibling)image.nextElementSibling.hidden=false;},{once:true});
 }
 function populateFilters(){
  const base=products().filter(p=>category==='all'||p.category===category);
  if($('shop-color-field'))$('shop-color-field').hidden=!base.some(p=>p.kind==='peripheral');
  const onlyPeripheral=peripheral?.categories.some(([key])=>key===category);$('compatible-only').closest('label').hidden=!!onlyPeripheral;
  for(const [id,key,label] of [['shop-brand',manufacturer,'Все производители'],['shop-socket',p=>p.socket,'Все сокеты'],['shop-memory',p=>p.memory,'Все типы памяти']]){
   const values=[...new Set(base.flatMap(key).filter(Boolean))].sort();
   $(id).innerHTML=`<option value="">${label}</option>`+values.map(v=>`<option value="${escape(v)}">${escape(v)}</option>`).join('');
   if(id!=='shop-brand')$(id).closest('label').hidden=values.length<2;
  }
 }
 function reset(){if($('shop-budget-only'))$('shop-budget-only').checked=false;if($('shop-currency'))$('shop-currency').value='';if($('shop-color'))$('shop-color').value='';for(const id of ['catalog-search','shop-brand','shop-socket','shop-memory','shop-price-min','shop-price-max'])$(id).value='';$('compatible-only').checked=false;$('shop-priced-only').checked=false;$('shop-verified-only').checked=false;$('shop-sort').value='default';render();}
 function selectCategory(key){category=key;$('catalog-title').textContent=title(category);for(const button of dialog.querySelectorAll('[data-shop-category]'))button.setAttribute('aria-pressed',String(button.dataset.shopCategory===key));populateFilters();reset();$('shop-results').scrollTop=0;}
 function renderCategories(){const all=products();$('shop-categories').innerHTML=[['all',peripheral?'Все товары':'Все комплектующие','layers'],...sections().map(([key,name])=>[key,name,key])].map(([key,name,symbol])=>`<button data-shop-category="${key}" aria-pressed="${key===category}">${icon(['monitor','keyboard','mouse'].includes(symbol)?'layers':symbol)}<span>${name}</span><small>${all.filter(p=>key==='all'||p.category===key).length}</small></button>`).join('');}
 renderCategories();
 dialog.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.shopCategory){selectCategory(button.dataset.shopCategory);return;}
  if(button.hasAttribute('data-shop-reset')){reset();return;}
  if(button.dataset.shopAdd){const part=shopProducts.find(p=>p.id===button.dataset.shopAdd);onChoose(part.category,part.id);$('shop-announcement').textContent=part.short+' добавлен в сборку.';render();}
  if(button.dataset.shopRemove){onChoose(button.dataset.shopRemove,null);$('shop-announcement').textContent='Деталь убрана из сборки.';render();}
 });
 for(const id of ['catalog-search','shop-price-min','shop-price-max'])$(id).addEventListener('input',render);
 for(const id of ['shop-currency','shop-brand','shop-socket','shop-memory','compatible-only','shop-priced-only','shop-verified-only','shop-sort'])$(id).addEventListener('change',render);
 $('shop-color')?.addEventListener('change',render);
 $('shop-budget-only')?.addEventListener('change',render);
 return {registerPeripherals(adapter){peripheral=adapter;renderCategories();},open(key='all'){beforeOpen();selectCategory(key);$('shop-announcement').textContent='';if(innerWidth<=640)dialog.querySelector('.shop-filter-group').open=false;dialog.showModal();},refresh(){if(dialog.open)render();}};
}
