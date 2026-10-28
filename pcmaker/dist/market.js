import './navigation.js';
import {isVerified} from './verification.js';
import {categories,byId,sanitizeBuild} from './catalog.js';
import {productImages} from './product-images.js';
import {compatibility} from './engine.js';
import {regionFor} from './regions.js';
import {sanitizeFanLayout,encodeFans} from './fan-layout.js';
import {sanitizeLighting} from './lighting.js';

const $=id=>document.getElementById(id);
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photo=id=>productImages[id]?.image;
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
function getBuild(){
 const build=sanitizeBuild(read('pcmaker-build',{}));let region='ru';
 try{region=regionFor(localStorage.getItem('pcmaker-region')).id;}catch{}
 return {build,region,fanLayout:sanitizeFanLayout(build,read('pcmaker-fans',{})[build.case]),lighting:sanitizeLighting(read('pcmaker-lighting',{}))};
}
function applyBuild(item){
 const build=sanitizeBuild(item.build),fans=sanitizeFanLayout(build,item.fanLayout);
 try{
  localStorage.setItem('pcmaker-build',JSON.stringify(build));
  localStorage.setItem('pcmaker-fans',JSON.stringify({...read('pcmaker-fans',{}),[build.case]:fans}));
  localStorage.setItem('pcmaker-lighting',JSON.stringify(sanitizeLighting(item.lighting)));
  localStorage.setItem('pcmaker-region',regionFor(item.region).id);
  localStorage.setItem('pcmaker-wiring',JSON.stringify({mode:'auto',connections:[],build}));
  localStorage.removeItem('pcmaker-autobuild');
 }catch{}
 const params=new URLSearchParams({build:categories.map(([key])=>build[key]||'').join(','),fans:encodeFans(fans)});
 location.href='./#'+params;
}
const draft=getBuild(),draftCount=categories.filter(([key])=>draft.build[key]).length;
$('market-draft-count').innerHTML=draftCount+'<span>/8</span>';
$('market-draft-name').textContent=byId[draft.build.cpu]?.short||'Начни с выбора комплектующих';

let servicePromise,user=null,items=[],mine=false,query='',region='all',sort='newest',requestId=0,hasMore=false,editItem=null,authIntent=null;
const local=['localhost','127.0.0.1'].includes(location.hostname);
function configure(){
 return servicePromise||(servicePromise=Promise.all([fetch('./firebase-config.json').then(r=>{if(!r.ok)throw Error('Не удалось загрузить настройки маркета.');return r.json();}),import('./vendor/firebase-gallery.js')]).then(([config,module])=>module.createFirebaseGallery(local?{apiKey:'demo-key',projectId:'demo-pcmaker',authDomain:'demo-pcmaker.firebaseapp.com',appId:'demo-app'}:config,{emulators:local})).catch(error=>{servicePromise=null;throw error;}));
}
const call=async(...args)=>(await configure()).call(...args);
const setStatus=(text,error=false)=>{$('market-status').textContent=text;$('market-status').classList.toggle('error',error);};
const money=item=>item.price.known?new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(item.price.total)+' '+regionFor(item.region).symbol:'Нет цены';
const priceNote=item=>(item.price.known?`Учтены цены ${item.price.known} из ${item.price.count} деталей`:'Нет предложений')+(item.price.stale?` · ${item.price.stale} устарели`:'')+(item.price.unavailable?` · ${item.price.unavailable} нет в наличии`:'')+(item.price.invalid?` · ${item.price.invalid} требуют проверки`:'');
const pendingParts=build=>categories.map(([key])=>byId[build[key]]).filter(p=>p&&!p.concept&&!isVerified(p));
function updateControls(){
 $('market-account').textContent=user?.displayName||'Войти';
 document.querySelector('[data-g="all"]').setAttribute('aria-pressed',String(!mine));
 document.querySelector('[data-g="mine"]').setAttribute('aria-pressed',String(mine));
 $('market-sort').disabled=!!query;$('market-sort').value=query?'name':sort;
 $('market-count-note').textContent=query?'Поиск по началу названия · по алфавиту':mine?'Публикации твоего аккаунта':'Совместимые комплектующие';
 const filters=[mine?'Мои сборки':'',region==='all'?'':region==='by'?'Беларусь · BYN':'Россия · RUB',query?'Поиск: '+query:''].filter(Boolean);
 $('market-active-filters').hidden=!filters.length;$('market-active-filters').innerHTML=filters.map(f=>'<span>'+e(f)+'</span>').join('');
}
function card(item){
 return `<article class="gallery-card"><button class="gallery-card-picture" data-g="detail" data-id="${e(item.id)}" aria-label="Открыть ${e(item.title)}">${photo(item.build.case)?`<img src="./${photo(item.build.case)}" alt="" loading="lazy">`:'<span class="gallery-cube">▧</span>'}${photo(item.build.gpu)?`<img class="gallery-gpu" src="./${photo(item.build.gpu)}" alt="" loading="lazy">`:''}<span class="gallery-region">${e(regionFor(item.region).city)}</span><span class="market-compatible">${item.hidden?'Скрыта модератором':!item.compatible?'Проверь совместимость':pendingParts(item.build).length?'Проверь характеристики':'✓ Основные проверки пройдены'}</span></button><div class="gallery-card-copy"><small>${e(item.author.name)} · ${new Date(item.createdAt).toLocaleDateString('ru-RU')}</small><button class="gallery-title-link" data-g="detail" data-id="${e(item.id)}">${e(item.title)}</button><dl class="market-card-specs">${['cpu','gpu','ram'].map(key=>`<div><dt>${{cpu:'Процессор',gpu:'Видеокарта',ram:'Память'}[key]}</dt><dd>${e(byId[item.build[key]]?.short||'Не выбрано')}</dd></div>`).join('')}</dl><strong>${e(money(item))}</strong><p class="market-price-note">${e(priceNote(item))}</p><button class="button wide" data-g="detail" data-id="${e(item.id)}">Посмотреть сборку ↗</button></div></article>`;
}
function render(){
 updateControls();$('market-grid').innerHTML=items.map(card).join('');
 $('market-count').textContent=items.length?`Показано сборок: ${items.length}${hasMore?'+':''}`:'Сборки сообщества';
 $('market-more').hidden=!hasMore;$('market-empty').hidden=!!items.length;
 const filtered=!!query||region!=='all';
 $('market-empty').innerHTML=`<span aria-hidden="true">${filtered?'⌕':'▦'}</span><h2>${filtered?'Сборки не найдены':mine?'Твои идеи появятся здесь':'Будь первым автором'}</h2><p>${filtered?'Попробуй другое название или выбери все регионы.':mine?'Сохрани свой компьютер в маркете — к нему можно будет вернуться с любого устройства.':'Маркет только открылся. Собери компьютер и поделись своей конфигурацией с сообществом.'}</p><div class="market-empty-actions">${filtered?'<button class="button" data-g="reset">Сбросить фильтры</button>':'<button class="button primary" data-g="publish">＋ Опубликовать сборку</button><a class="button" href="./">В конструктор ↗</a>'}</div>`;
}
async function load(append=false){
 const id=++requestId;updateControls();setStatus('');$('market-results').setAttribute('aria-busy','true');$('market-more').disabled=true;
 if(!append){items=[];$('market-more').hidden=true;$('market-empty').hidden=true;$('market-grid').innerHTML='<div class="market-loading-card" aria-hidden="true"></div>'.repeat(3);$('market-count').textContent='Загружаем сборки…';}
 try{
  const data=await call('/builds?'+new URLSearchParams({mine:mine?'1':'0',q:query,region,sort,offset:append?String(items.length):'0'}));
  if(id!==requestId)return;
  items=append?[...items,...data.items]:data.items;hasMore=data.hasMore;render();
 }catch(error){
  if(id!==requestId)return;
  setStatus(error.message||'Не удалось загрузить сборки.',true);
  if(!append){$('market-grid').innerHTML='';$('market-count').textContent='Маркет временно недоступен';$('market-empty').hidden=false;$('market-empty').innerHTML='<span aria-hidden="true">↻</span><h2>Попробуем ещё раз</h2><p>Проверь соединение с интернетом. Твоя сборка остаётся в конструкторе.</p><button class="button" data-g="retry">Повторить загрузку</button>';}
 }finally{if(id===requestId){$('market-results').setAttribute('aria-busy','false');$('market-more').disabled=false;}}
}

const dialog=document.createElement('dialog');dialog.className='gallery-dialog';dialog.setAttribute('aria-labelledby','gallery-title');
dialog.innerHTML='<header class="gallery-header"><div><span>PCMAKER / МАРКЕТ</span><h2 id="gallery-title">Сборка</h2></div><button class="round-button" data-g="close" aria-label="Закрыть окно">×</button></header><div id="gallery-body" class="gallery-body"></div><p id="gallery-status" class="gallery-status" role="status" aria-live="polite"></p>';document.body.append(dialog);
const body=$('gallery-body'),modalStatus=$('gallery-status');let modalRequest=0;
function setModalStatus(text,error=false){modalStatus.textContent=text;modalStatus.classList.toggle('error',error);}
function openModal(title,html){
 modalRequest++;$('gallery-title').textContent=title;body.innerHTML=html;setModalStatus('');
 if(!dialog.open)dialog.showModal();body.scrollTop=0;
}
dialog.addEventListener('close',()=>{modalRequest++;authIntent=null;});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
const parts=build=>'<div class="gallery-parts">'+categories.map(([key,label])=>`<div><span>${label}</span><b>${e(byId[build[key]]?.name||'Не выбрано')}</b></div>`).join('')+'</div>';
function auth(intent=null){
 authIntent=intent;openModal('Вход в PCmaker','<section class="gallery-form-wrap"><span class="gallery-kicker">ТВОИ СБОРКИ В ОДНОМ МЕСТЕ</span><h3>Войди через Google</h3><p>Публикуй идеи, сохраняй конфигурации и редактируй свои сборки с любого компьютера.</p><button class="button primary wide" data-g="google">Продолжить с Google</button><p>В маркете будут видны имя из Google и опубликованные сборки. Email не публикуется. Пароль Google сайт PCmaker не получает.</p></section>');
}
function account(){openModal('Твой аккаунт',`<section class="gallery-form-wrap"><h3>${e(user.displayName)}</h3><p>Аккаунт Google. Вход сохранён в этой вкладке. Публикации остаются в маркете после выхода.</p><button class="button" data-g="logout">Выйти</button>${user.admin?'<button class="button" data-g="reports">Жалобы и модерация</button>':''}</section>`);}
function publish(item=null){
 if(!user)return auth('publish');
 editItem=item;const current=item||getBuild(),check=compatibility(current.build);
 openModal(item?'Редактировать сборку':'Опубликовать сборку',`<section class="gallery-form-wrap gallery-publish"><span class="gallery-kicker">${item?'ТВОЯ ПУБЛИКАЦИЯ':'СБОРКА ИЗ КОНСТРУКТОРА'}</span><form id="gallery-publish"><label>Название<input name="title" required minlength="3" maxlength="80" value="${e(item?.title||'')}" placeholder="Например, тихий ПК для учёбы"></label><label>Описание<textarea name="description" maxlength="800" rows="4" placeholder="Для чего эта сборка, что в ней интересного">${e(item?.description||'')}</textarea></label>${item?'<label class="gallery-checkbox"><input type="checkbox" name="replace"> Заменить детали и настройки на текущую сборку из конструктора</label>':''}${parts(current.build)}<p>Регион: ${e(regionFor(current.region).city)}. Опубликуются детали, расположение вентиляторов и подсветка. Личные данные в описании не нужны.</p>${!check.ready?'<p class="error">Для публикации нужны все 8 совместимых компонентов. <a href="./">Дополни сборку в конструкторе ↗</a></p>':''}<button type="submit" class="button primary wide" ${!check.ready&&!item?'disabled':''}>${item?'Сохранить изменения':'Опубликовать в маркете'}</button></form></section>`);
}
async function detail(id){
 openModal('Сборка','<p>Загружаем комплектующие…</p>');const request=modalRequest;
 const item=await call('/builds/'+id);if(request!==modalRequest||!dialog.open)return;editItem=item;
 $('gallery-title').textContent=item.title;
 body.innerHTML=`<section class="gallery-detail"><div><div class="market-detail-photo">${['case','gpu'].map(key=>photo(item.build[key])?`<img src="./${photo(item.build[key])}" alt="${e(byId[item.build[key]]?.name)}">`:'').join('')}</div><span class="gallery-kicker">${e(item.author.name)} / ${e(regionFor(item.region).city)}</span><p class="gallery-description">${e(item.description)}</p><strong class="gallery-detail-price">${e(money(item))}</strong><p>${e(priceNote(item))}. Даты и источники отдельных цен — в магазине конструктора. Недостающие цены не включены в сумму.</p><button class="button primary" data-g="apply">Открыть в конструкторе</button><p>Текущие детали заменятся этой сборкой. Кабели подключатся автоматически.</p><div class="gallery-text-actions">${user?.id===item.author.id?'<button data-g="edit">Редактировать</button><button data-g="delete-confirm">Удалить</button>':'<button data-g="report">Пожаловаться</button>'}</div></div>${parts(item.build)}${pendingParts(item.build).length?`<p class="quality-build-note">Характеристики требуют проверки: ${pendingParts(item.build).map(p=>e(p.name)).join(', ')}. Совместимость рассчитана по текущим данным каталога.</p>`:''}</section>`;
}
async function reports(){
 openModal('Жалобы пользователей','<p>Загружаем…</p>');const request=modalRequest,data=await call('/reports');if(request!==modalRequest||!dialog.open)return;
 body.innerHTML=data.items.map(r=>`<article class="gallery-report"><strong>${e(r.title)}</strong><p>${e(r.reason)}</p><button class="button" data-g="detail" data-id="${e(r.build_id)}">Посмотреть</button><button class="button" data-g="hide" data-id="${e(r.build_id)}">Скрыть</button><button class="button" data-g="restore" data-id="${e(r.build_id)}">Вернуть</button></article>`).join('');setModalStatus(data.items.length?'':'Жалоб пока нет.');
}
function report(){if(!user)return auth('report');openModal('Сообщить о проблеме','<section class="gallery-form-wrap"><form id="gallery-report"><label>Причина<textarea name="reason" required minlength="5" maxlength="400" rows="4"></textarea></label><button class="button primary">Отправить жалобу</button></form></section>');}
async function task(button,fn){if(button)button.disabled=true;try{await fn();}catch(error){(dialog.open?setModalStatus:setStatus)(error.message||'Нет связи с сервером.',true);}finally{if(button)button.disabled=false;}}
function reset(){mine=false;query='';region='all';sort='newest';$('market-query').value='';$('market-region').value=region;$('market-sort').value=sort;return load();}
document.addEventListener('click',event=>{
 const b=event.target.closest('[data-g]');if(!b)return;
 task(b,async()=>{
  const action=b.dataset.g;
  if(action==='close'){dialog.close();return;}
  if(action==='all'){mine=false;await load();}
  if(action==='mine'){if(!user)return auth('mine');mine=true;await load();}
  if(action==='more')await load(true);
  if(action==='reset')await reset();
  if(action==='retry')await load();
  if(action==='account')user?account():auth();
  if(action==='publish')publish();
  if(action==='edit')publish(editItem);
  if(action==='detail')await detail(b.dataset.id);
  if(action==='apply')applyBuild(editItem);
  if(action==='google'){
   const intent=authIntent;user=(await call('/auth/google','POST')).user;updateControls();
   if(intent==='publish')publish();else if(intent==='report')report();else{dialog.close();if(intent==='mine')mine=true;await load();}
  }
  if(action==='logout'){await call('/auth/logout','POST');user=null;mine=false;dialog.close();await load();}
  if(action==='delete-confirm')body.querySelector('.gallery-text-actions').innerHTML=`<span>Удалить эту публикацию?</span><button data-g="delete" class="button">Да, удалить</button><button data-g="detail" data-id="${e(editItem.id)}" class="button">Оставить</button>`;
  if(action==='delete'){await call('/builds/'+editItem.id,'DELETE');dialog.close();await load();setStatus('Публикация удалена.');}
  if(action==='report')report();
  if(action==='reports')await reports();
  if(['hide','restore'].includes(action)){await call('/builds/'+b.dataset.id+'/moderate','POST',{hidden:action==='hide'});await load();setModalStatus(action==='hide'?'Сборка скрыта.':'Сборка возвращена.');}
 });
});
document.addEventListener('submit',event=>{
 const form=event.target;if(!['market-search','gallery-publish','gallery-report'].includes(form.id))return;event.preventDefault();
 const data=Object.fromEntries(new FormData(form)),button=form.querySelector('[type=submit],button');
 task(button,async()=>{
  if(form.id==='market-search'){query=data.q.trim();await load();}
  if(form.id==='gallery-publish'){
   const payload=editItem&&!data.replace?editItem:getBuild();
   await call('/builds'+(editItem?'/'+editItem.id:''),editItem?'PUT':'POST',{...payload,title:data.title,description:data.description});
   dialog.close();mine=true;query='';region='all';$('market-query').value='';$('market-region').value=region;await load();setStatus('Сборка опубликована.');
  }
  if(form.id==='gallery-report'){await call('/builds/'+editItem.id+'/report','POST',data);dialog.close();setStatus('Жалоба отправлена модератору.');}
 });
});
$('market-region').addEventListener('change',()=>{region=$('market-region').value;load();});
$('market-sort').addEventListener('change',()=>{sort=$('market-sort').value;load();});
await task(null,async()=>{user=(await call('/me')).user;updateControls();});
await load();
