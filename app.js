import './navigation.js';
import {regions,regionFor,priceSnapshot} from './regions.js';
import {createAutoBuilder} from './autobuild-ui.js';
import {quoteBuild} from './autobuild.js';
import {coolingAnalysis} from './cooling.js';
import {caseLighting,gpuLighting,sanitizeLighting} from './lighting.js';
import {createFanEditor} from './fan-ui.js';
import {sanitizeFanLayout,defaultFanLayout,fanStats,encodeFans,decodeFans} from './fan-layout.js';
import {componentSpecs,heatLabels} from './inspector.js';
import {createShop} from './shop.js';
import {cablesFor,ports,cleanConnections,wiringMissing,canConnect,reconcileConnections,connectionAfterDrop} from './wiring.js';
import {catalog,categories,byId,emptyBuild,demoBuild,resolve,sanitizeBuild} from './catalog.js';
import {compatibility,thermalTargets,advanceThermals,summarizePrices,workloads} from './engine.js';
const $=id=>document.getElementById(id);
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(n);
const safeUrl=u=>{try{const url=new URL(u);return url.protocol==='https:'?url.href:'#';}catch{return '#';}};
const paths={cpu:'M7 7h10v10H7z M9 1v3m6-3v3M9 20v3m6-3v3M1 9h3m-3 6h3m16-6h3m-3 6h3',motherboard:'M4 3h16v18H4z M8 7h5v5H8z M16 6v8M8 16h8m-8 3h5',gpu:'M3 6h18v12H3z M5 18v3m3-3v2 M8 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6 M16 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',ram:'M2 7h20v10H2z M5 10h3v4H5zm6 0h3v4h-3zm6 0h2v4h-2 M5 17v3m4-3v3m4-3v3m4-3v3',storage:'M4 6h16v12H4z M8 10h5v4H8z M17 9v6',cooler:'M7 4h10v16H7z M4 7h16M4 11h16M4 15h16M4 19h16',psu:'M3 5h18v14H3z M8 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M17 9v6',case:'M5 2h14v20H5z M9 6h6M9 17h6 M10 10h4v4h-4z',fan:'M12 12c-6-2-5-9 0-9 4 0 3 5 0 9zm0 0c5-4 10 0 8 4-2 4-7 1-8-4zm0 0c1 6-5 10-8 6-3-3 2-6 8-6z',plus:'M12 5v14M5 12h14',minus:'M5 12h14',close:'m6 6 12 12M6 18 18 6',share:'M12 15V3m-5 5 5-5 5 5M5 13v7h14v-7',spark:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',rotate:'M3 10a9 9 0 1 1 1 7M3 4v6h6',zoom:'M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12 M15 15l6 6 M7 10h6m-3-3v6',orbit:'M3 12a9 4 0 1 0 18 0 9 4 0 0 0-18 0 M12 3a4 9 0 1 0 0 18 4 9 0 0 0 0-18',layers:'m12 3 10 5-10 5L2 8z M2 12l10 5 10-5M2 16l10 5 10-5',eye:'M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',wind:'M3 7h12c4 0 4-5 1-5M3 12h16c4 0 4 6 0 6M3 17h7c4 0 4 5 1 5',mouse:'M7 4c0-4 10-4 10 0v10c0 8-10 8-10 0z M12 3v5',bolt:'m13 2-9 12h7l-1 8 10-13h-7z',info:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20 M12 11v6m0-10v.1',trash:'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',play:'m7 3 14 9-14 9z',pause:'M7 4h3v16H7zm7 0h3v16h-3z',moon:'M20 14A9 9 0 0 1 10 3a9 9 0 1 0 10 11z',game:'M7 7h10c6 0 7 14 3 14l-5-5H9l-5 5C0 21 1 7 7 7z M6 10v5m-2-2h4m8-2v.1m3 3v.1',video:'M3 5h14v14H3z M17 10l5-3v10l-5-3',search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14 M16 16l5 5',check:'m5 12 4 4L19 6',alert:'m12 3 10 18H2z M12 9v5m0 3v.1'};
paths.wand='m4 20 12-12 4 4L8 24z M14 10l4 4 M6 3v4M4 5h4M17 1v4m-2-2h4M21 18v4m-2-2h4';
paths.shop='M3 9h18l-2-6H5z M4 9v12h16V9 M8 21v-7h5v7 M3 9c0 4 5 4 5 0 0 4 4 4 4 0 0 4 4 4 4 0 0 4 5 4 5 0';
const icon=n=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[n]||paths.cpu}"/></svg>`;
function icons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));}icons();
let saved;try{saved=JSON.parse(localStorage.getItem('pcmaker-build'));}catch{}
let regionId='ru';try{regionId=regionFor(localStorage.getItem('pcmaker-region')).id;}catch{}
const snapshots={ru:priceSnapshot({},'ru'),by:priceSnapshot({},'by')};
let region=regionFor(regionId);$('region-select').value=regionId;
let build=sanitizeBuild(saved), scene, priceData=snapshots[regionId], sourceData={catalog:[]};
let lastTarget=null,lastLoad='idle';
let autoPlan=null;try{autoPlan=JSON.parse(localStorage.getItem('pcmaker-autobuild'));}catch{}
let lighting=sanitizeLighting();try{lighting=sanitizeLighting(JSON.parse(localStorage.getItem('pcmaker-lighting')));}catch{}
const initialThermals=ambient=>Object.fromEntries(categories.map(([key])=>[key,ambient]));
let running=false,hasRun=false,elapsed=0,thermals=initialThermals(22),inspectedKey=null,inspectOrigin=null;
let settings={load:'idle',ambient:22,front:60,rear:60,cpuFan:60};
try{const hash=new URLSearchParams(location.hash.slice(1)).get('build');if(hash){const ids=hash.split(',');build=sanitizeBuild(Object.fromEntries(categories.map(([key],i)=>[key,ids[i]])));}}catch{}
let savedFans={};try{savedFans=JSON.parse(localStorage.getItem('pcmaker-fans'))||{};}catch{}
if(typeof savedFans!=='object'||Array.isArray(savedFans))savedFans={};
const fanQuery=new URLSearchParams(location.hash.slice(1));
if(fanQuery.has('build'))savedFans[build.case]=fanQuery.has('fans')?decodeFans(fanQuery.get('fans')):undefined;
let fanLayout=sanitizeFanLayout(build,savedFans[build.case]);settings.fanLayout=fanLayout;
function saveFans(){savedFans[build.case]=fanLayout;try{localStorage.setItem('pcmaker-fans',JSON.stringify(savedFans));}catch{}}
let activeTab='parts',wireMode='manual',connections=[],selectedCable=null,wiredBuild={...build};
try{const stored=JSON.parse(localStorage.getItem('pcmaker-wiring'));if(stored){wireMode=stored.mode==='manual'?'manual':'auto';connections=reconcileConnections(stored.build||{},build,stored.connections);}
const query=new URLSearchParams(location.hash.slice(1));if(query.has('build')){wireMode=query.get('wire')==='manual'?'manual':'auto';connections=cleanConnections(build,(query.get('connected')||'').split(','));}}catch{}
window.addEventListener('hashchange',()=>{if(new URLSearchParams(location.hash.slice(1)).has('build'))location.reload();});
function saveWiring(){try{localStorage.setItem('pcmaker-wiring',JSON.stringify({mode:wireMode,connections,build}));}catch{}
 // Keep an opened shared build in sync, so reloading it preserves later edits.
 if(new URLSearchParams(location.hash.slice(1)).has('build')){
  const params=new URLSearchParams({build:categories.map(([key])=>build[key]||'').join(','),fans:encodeFans(fanLayout)});
  if(wireMode==='manual'){params.set('wire','manual');params.set('connected',connections.join(','));}
  history.replaceState(null,'','#'+params.toString());
 }
}
function missingWires(){return wiringMissing(build,wireMode,connections,fanLayout);}
function persist(){try{localStorage.setItem('pcmaker-build',JSON.stringify(build));}catch{}}
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>$('toast').hidden=true,3500);}
function sourceFor(id){return sourceData.catalog.find(p=>p.appId===id)||byId[id];}
function priceFor(id){const p=priceData.items[id];return p&&Number.isFinite(p.price)&&p.price>0?p:null;}
function setTab(tab){closeWorkshopMenu(false);if(tab==='wiring'||tab==='fans')closeInspector(false);activeTab=tab;for(const b of document.querySelectorAll('[data-tab]')){const active=b.dataset.tab===tab;if(b.role==='tab')b.setAttribute('aria-selected',active);b.classList.toggle('active',active);}$('parts-panel').hidden=tab!=='parts';$('simulation-panel').hidden=tab!=='simulation';$('wiring-panel').hidden=tab!=='wiring';$('fans-panel').hidden=tab!=='fans';$('fans-button').setAttribute('aria-pressed',String(tab==='fans'));renderWiring();fanUI.render();}
function renderBuild(){
 document.querySelector('.price-region').textContent=region.city.toUpperCase();
 closeInspector(false);
 fanLayout=sanitizeFanLayout(build,savedFans[build.case]);settings.fanLayout=fanLayout;saveFans();if(scene)scene.fanLayout=fanLayout;
 const check=compatibility(build),parts=resolve(build);$('parts-count').textContent=`${8-check.missing.length}/8`;
 $('build-subtitle').textContent=check.missing.length?`Выбрано ${8-check.missing.length} из 8 компонентов`:'Сборка готова к проверке';
 $('parts-list').innerHTML=categories.map(([key,label])=>{const p=parts[key],price=p&&priceFor(p.id),bad=check.errors.some(err=>err.parts.includes(key));return `<button class="part-row ${p?'selected':'empty'} ${bad?'conflict':''}" data-category="${key}" aria-label="${e(label)}: ${e(p?.name||'выбрать')}"><span class="part-icon">${icon(key)}</span><span class="part-text"><span class="part-category">${e(label)}</span><span class="part-name">${e(p?.short||'Выбрать комплектующее')}</span>${p&&price?`<span class="part-price">${money(price.price)} ${region.symbol}</span>`:''}</span><span class="part-action">${key==='case'?'↗':p?'↔':'+'}</span></button>`;}).join('');
 $('scene-hint').hidden=Object.entries(parts).filter(([key,p])=>key!=='case'&&p).length>0;
 if(check.errors.length)$('compatibility').innerHTML=`<div class="compat-box error"><strong>${icon('alert')} Есть несовместимость</strong><ul>${check.errors.map(v=>`<li>${e(v.text)}</li>`).join('')}</ul></div>`;
 else if(check.missing.length)$('compatibility').innerHTML=`<div class="compat-box neutral"><strong>${icon('info')} Добавь ещё ${check.missing.length} ${check.missing.length===1?'компонент':check.missing.length<5?'компонента':'компонентов'}</strong><span>Совместимость проверяется при каждом выборе.</span></div>`;
 else $('compatibility').innerHTML=`<div class="compat-box"><strong>${icon('check')} Основные проверки пройдены</strong><span>Сокет, память, размеры и запас питания.</span>${check.warnings.map(w=>`<span class="minor-note">${e(w)}</span>`).join('')}</div>`;
 const sum=summarizePrices(build,priceData.items);
 $('price-caption').textContent=sum.concepts?'Цены комплектующих':sum.complete?'Стоимость сборки':'Подтверждённые цены';
 $('price-total').innerHTML=sum.known?`${money(sum.total)} <small>${region.symbol}</small>`:`— <small>${region.symbol}</small>`;
 $('price-note').textContent=sum.known?`${sum.known} из ${sum.count} выбранных деталей. ${sum.complete?'':'Сумма неполная: остальные цены не подтверждены.'} ${regionId==='by'?'Предложения 5element.by':'Предложения разных магазинов'} без доставки; условия — в магазине комплектующих. Снимок от ${priceData.checkedAt||'неизвестной даты'} для ${region.cityGenitive}.`:`Цены для ${region.cityGenitive} пока не подтверждены. Ссылки на магазины — в карточках деталей.`;
 if(sum.concepts)$('price-note').textContent+=' Учебный корпус PCmaker не продаётся и не включён в стоимость.';
 if((autoPlan?.region||'ru')===regionId&&autoPlan?.build&&categories.every(([key])=>autoPlan.build[key]===build[key])){
  const quote=quoteBuild(build,priceData.items,autoPlan.allowEstimates,region.currency);
  if(quote){$('price-caption').textContent=quote.estimatedCount?'Ориентировочная стоимость':'Стоимость по снимку цен';$('price-total').innerHTML=(quote.estimatedCount?'≈ ':'')+money(quote.total)+' <small>'+region.symbol+'</small>';$('price-note').textContent='Автосборка. '+quote.estimatedCount+' из 8 цен — ориентиры PCmaker. '+(quote.reserve?'С резервом 10% на оценочные позиции: ≈ '+money(quote.planned)+' '+region.symbol+'. ':'')+'Бюджет: '+money(autoPlan.budget)+' '+region.symbol+'. Фактические цены могут измениться; подробности и источники — в окне автосборки.';}
 }
 connections=reconcileConnections(wiredBuild,build,connections,fanLayout);wiredBuild={...build};scene?.setBuild(build);document.querySelector('.model-tag').textContent=parts.case?.short||'Корпус';const fans=fanStats(build,fanLayout);$('front-count').textContent=fans.inCount+' вент. на вдув';$('rear-count').textContent=fans.outCount+' вент. на выдув';$('inspect-shortcuts').innerHTML=categories.filter(([key])=>parts[key]).map(([key,label])=>`<button data-inspect="${key}" title="Характеристики: ${e(label)}" aria-label="Характеристики: ${e(label)}">${icon(key)}</button>`).join('');renderWiring();updateSimulationState();persist();fanUI.render();renderLighting();
}
function renderCooling(){
 const analysis=coolingAnalysis(build,settings);
 const html=analysis.warnings.length?'<div class="cooling-alert"><strong>Проверь охлаждение</strong><ul>'+analysis.warnings.map(w=>'<li>'+e(w.text)+'</li>').join('')+'</ul><small>Симуляция доступна: ошибки влияют на расчётный нагрев.</small></div>':'<div class="cooling-ok">✓ Явных проблем с охлаждением не найдено</div>';
 for(const id of ['cooling-parts','cooling-fans','cooling-simulation'])if($(id).innerHTML!==html)$(id).innerHTML=html;
}
function renderLighting(){
 const p=resolve(build),caseLED=caseLighting(p.case),gpuLED=gpuLighting(p.gpu);
 $('rgb-devices').innerHTML=[caseLED?'<p><b>'+e(p.case.short)+'</b><span>'+ (caseLED.type==='fixed'?'Бирюзовые LED · фиксированный цвет':'Вентиляторы · RGB')+'</span></p>':'',p.cooler?.pumpRGB?'<p><b>'+e(p.cooler.short)+'</b><span>RGB · помпа'+(p.cooler.fanRGB?' и вентиляторы':'')+'</span></p>':'',gpuLED?'<p><b>'+e(p.gpu.short)+'</b><span>RGB · боковой логотип и метка на спинке</span></p>':''].join('')||'<p>В выбранных деталях нет подсветки.</p>';
 const colorAvailable=caseLED?.type==='rgb'||!!gpuLED||!!p.cooler?.pumpRGB;
 for(const b of document.querySelectorAll('[data-rgb-mode]'))b.setAttribute('aria-pressed',String(lighting.mode===b.dataset.rgbMode));
 $('rgb-color').value=lighting.color;$('rgb-color').disabled=!colorAvailable;
 for(const b of document.querySelectorAll('[data-rgb-color]'))b.disabled=!colorAvailable;
 scene?.setLighting(lighting);
}
function changeLighting(value){lighting=sanitizeLighting({...lighting,...value});try{localStorage.setItem('pcmaker-lighting',JSON.stringify(lighting));}catch{}renderLighting();}
document.querySelectorAll('[data-rgb-mode]').forEach(b=>b.onclick=()=>changeLighting({mode:b.dataset.rgbMode}));
document.querySelectorAll('[data-rgb-color]').forEach(b=>b.onclick=()=>changeLighting({mode:'color',color:b.dataset.rgbColor}));
$('rgb-color').oninput=()=>changeLighting({mode:'color',color:$('rgb-color').value});
function resetSimulation(){lastTarget=null;running=false;hasRun=false;elapsed=0;thermals=initialThermals(settings.ambient);scene?.setOptions({running:false});}
function choosePart(key,id,keepOpen=false){build[key]=id;resetSimulation();renderBuild();if(!keepOpen)$('catalog-dialog').close();toast(id?`${byId[id].short} добавлен в сборку`:'Компонент убран из сборки');}
const shop=createShop({getBuild:()=>build,getPrices:()=>priceData,getSource:sourceFor,onChoose:(key,id)=>choosePart(key,id,true),beforeOpen:()=>{closeWorkshopMenu(false);closeInspector(false);},icon});
function openCatalog(key){shop.open(key);}
$('shop-button').onclick=()=>shop.open();
const fanUI=createFanEditor({getBuild:()=>build,getLayout:()=>fanLayout,getScene:()=>scene,isOpen:()=>activeTab==='fans',onCase:id=>{choosePart('case',id);},onChange:next=>{
 fanLayout=sanitizeFanLayout(build,next);settings.fanLayout=fanLayout;saveFans();
 connections=cleanConnections(build,connections,fanLayout);scene?.setFanLayout(fanLayout);
 const stats=fanStats(build,fanLayout);$('front-count').textContent=stats.inCount+' вент. на вдув';$('rear-count').textContent=stats.outCount+' вент. на выдув';
 lastTarget=null;if(running&&missingWires().length){running=false;scene?.setOptions({running:false});}
 renderWiring();updateSimulationState();fanUI.render();
}});
const autoBuilder=createAutoBuilder({initialPlan:autoPlan,getPrices:()=>priceData,beforeOpen:()=>{closeWorkshopMenu(false);closeInspector(false);},onApply:result=>{
 build=sanitizeBuild(result.build);autoPlan={region:regionId,build:{...build},budget:result.budget,purpose:result.purpose,allowEstimates:result.allowEstimates};try{localStorage.setItem('pcmaker-autobuild',JSON.stringify(autoPlan));}catch{}
 savedFans[build.case]=defaultFanLayout(build);connections=[];selectedCable=null;resetSimulation();renderBuild();setTab('parts');scene?.reset();toast(wireMode==='manual'?'Сборка применена. Тяни кабели от точек разъёмов прямо в 3D.':'Сборка применена. Можно запускать симуляцию.');
}});
$('autobuild-button').onclick=()=>autoBuilder.open();
document.addEventListener('pcmaker:navigation-open',()=>{closeWorkshopMenu(false);closeInspector(false);});
$('fans-button').onclick=()=>{const open=activeTab!=='fans';setTab(open?'fans':'parts');if(open){scene?.viewFanWall(fanUI.getWall());$('auto-rotate').setAttribute('aria-pressed','false');}};
$('fan-flow-toggle').onclick=()=>{$('airflow-toggle').click();};
function updateSliders(){lastTarget=null;renderCooling();for(const key of ['ambient','front','rear','cpuFan']){const input=$(key);input.style.setProperty('--fill',`${(Number(input.value)-Number(input.min))/(Number(input.max)-Number(input.min))*100}%`);$(key+'-output').textContent=settings[key]+(key==='ambient'?' °C':'%');}const t=thermalTargets(build,settings);$('front-rpm').textContent=money(t.rpm.front)+' об/мин';$('rear-rpm').textContent=money(t.rpm.rear)+' об/мин';$('cpuFan-rpm').textContent=money(t.rpm.cpu)+' об/мин';$('cpu-load').textContent=t.cpuLoad+'%';$('gpu-load').textContent=t.gpuLoad+'%';scene?.setOptions({settings:{...settings,gpuFan:30+70*workloads[settings.load].gpu}});}
function updateSimulationState(){
 const check=compatibility(build);$('run-simulation').disabled=!check.ready||missingWires().length>0;
 $('run-simulation').innerHTML=icon(running?'pause':'play')+(running?'Приостановить':hasRun?'Продолжить симуляцию':'Запустить симуляцию');
 $('simulation-warning').innerHTML=check.errors.length?`<div class="compat-box error">Сначала исправь конфликты в комплектующих. Симуляция несовместимой сборки недоступна.</div>`:check.missing.length?`<div class="compat-box neutral">Для запуска добавь: ${check.missing.map(p=>e(p.name.toLowerCase())).join(', ')}.</div>`:'';
 $('sim-status').textContent=running?'Симуляция работает':hasRun?'Пауза':'Ожидание запуска';$('sim-status-dot').classList.toggle('muted',!running);
 updateSliders();renderMetrics();
}
function renderMetrics(){
 updateInspectorHeat();$('metrics-note').textContent=hasRun?'Приблизительный учебный расчёт. Температуры меняются постепенно.':'Показатели появятся после запуска симуляции в правой панели.';
 const p=resolve(build),target=lastTarget||thermalTargets(build,settings);for(const key of ['cpu','gpu']){const value=hasRun?thermals[key]:null;$(key+'-temp').textContent=value===null?'—':Math.round(value);const limit=p[key]?.tmax||95,hot=value!==null&&value>=limit-1;$(key+'-state').textContent=!hasRun?'Нет данных':!running?'Пауза':hot?'Лимит нагрева':'Расчёт';$(key+'-state').style.color=hot?'var(--orange)':'';$(key+'-bar').style.width=value===null?'0':Math.min(100,value/limit*100)+'%';$(key+'-bar').style.background=hot?'var(--orange)':'var(--accent)';}
 $('power-value').textContent=hasRun?target.power:'—';$('power-note').textContent=hasRun?`${workloads[lastLoad].name} · приблизительно`:'Запусти симуляцию';$('fan-value').textContent=hasRun?money(target.rpm.front):'—';$('sim-time').textContent=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(Math.floor(elapsed%60)).padStart(2,'0')}`;
 if($('other-temps'))$('other-temps').innerHTML=[['case','Воздух в корпусе'],['ram','Память'],['storage','SSD'],['motherboard','Плата / VRM'],['cooler','Радиатор кулера'],['psu','Выход БП']].map(([key,name])=>`<span>${name}<b>${hasRun?Math.round(thermals[key])+' °C':'—'}</b></span>`).join('');
 if(running&&(target.cpuThrottle||target.gpuThrottle))$('simulation-warning').innerHTML='<div class="compat-box error">Расчёт достигает температурного предела. Модель снижает мощность, имитируя троттлинг. Увеличь обороты или уменьши нагрузку.</div>';
 else if(compatibility(build).ready)$('simulation-warning').innerHTML=missingWires().length?'<div class="compat-box neutral">Сначала подключи обязательные кабели: тяни их от точек разъёмов прямо в 3D.</div>':'';
}
function renderWiring(){
 const available=cablesFor(build,fanLayout),active=wireMode==='auto'?available.map(c=>c.id):connections;
 if(!available.some(c=>c.id===selectedCable))selectedCable=null;
 $('wiring-help').textContent=wireMode==='auto'?'Кабели подключены автоматически. Потяни за точку разъёма прямо в 3D: подходящее гнездо подсветится. Успешное подключение включит ручной режим, сохранив остальные провода.':'Потяни за точку разъёма прямо в 3D — без выбора в списке. Подходящее гнездо подсветится. Для клавиатуры также доступно подключение ниже.';
 $('wiring-progress').textContent=available.length?active.length+' / '+available.length+' подключено'+(missingWires().length?' · обязательных осталось: '+missingWires().length:''):'Добавь материнскую плату, блок питания и остальные детали.';
 $('cable-list').innerHTML=available.map((c,i)=>'<button class="cable-row '+(selectedCable===c.id?'selected':'')+'" data-cable="'+c.id+'" aria-pressed="'+(selectedCable===c.id)+'"><span class="cable-number">'+(i+1)+'</span><span><b>'+e(c.name)+'</b><small>'+e(c.from)+' → '+e(c.to)+'</small></span><span class="wire-state '+(active.includes(c.id)?'done':'')+'">'+(active.includes(c.id)?'✓':c.required?'•':'○')+'</span></button>').join('');
 $('connection-action').hidden=wireMode!=='manual'||!selectedCable;
 $('disconnect-all').hidden=wireMode!=='manual'||!connections.length;
 for(const b of document.querySelectorAll('[data-wiring-mode]'))b.setAttribute('aria-pressed',String(b.dataset.wiringMode===wireMode));
 const previous=$('target-port').value;$('target-port').innerHTML='<option value="">Выбери разъём…</option>'+available.map(c=>'<option value="'+c.id+'">'+e(c.to)+'</option>').join('');if(available.some(c=>c.id===previous))$('target-port').value=previous;
 $('connect-cable').textContent=connections.includes(selectedCable)?'Отсоединить кабель':'Подключить кабель';
 scene?.setWiring(wireMode,connections,selectedCable,activeTab==='wiring');saveWiring();
}
function attemptConnection(portId){
 if(wireMode!=='manual'){const c=cablesFor(build,fanLayout).find(c=>c.id===portId);if(c){selectedCable=portId;renderWiring();$('wire-feedback').textContent=c.name+' — подключён автоматически.';}return;}
 if(!selectedCable){$('wire-feedback').textContent='Сначала выбери кабель в списке.';return;}
 if(!canConnect(selectedCable,portId)){$('wire-feedback').textContent='Этот разъём не подходит. Для выбранного кабеля нужен '+ports[selectedCable].name+'.';$('wire-feedback').classList.add('error');return;}
 resetSimulation();connections=connections.includes(selectedCable)?connections.filter(id=>id!==selectedCable):[...connections,selectedCable];
 $('wire-feedback').classList.remove('error');$('wire-feedback').textContent=ports[selectedCable].name+(connections.includes(selectedCable)?' подключён.':' отсоединён.');renderWiring();updateSimulationState();
}
function completeCableDrag(id,port){
 const next=connectionAfterDrop(build,fanLayout,wireMode,connections,id,port);
 if(!next){
  const message=port?'Этот разъём не подходит. Нужен '+(ports[id]?.name||'подсвеченный разъём')+'.':'Подключение не изменено. Отпусти штекер над подсвеченным гнездом.';
  $('wire-feedback').textContent=message;$('wire-feedback').classList.add('error');toast(message);return;
 }
 resetSimulation();wireMode=next.mode;connections=next.connections;selectedCable=id;
 const message=ports[id].name+' подключён.';
 $('wire-feedback').textContent=message;$('wire-feedback').classList.remove('error');renderWiring();updateSimulationState();toast(message);
}
document.addEventListener('click',event=>{
 const mode=event.target.closest('[data-wiring-mode]');if(mode&&mode.dataset.wiringMode!==wireMode){wireMode=mode.dataset.wiringMode;connections=[];selectedCable=null;resetSimulation();renderWiring();updateSimulationState();$('wire-feedback').textContent='';}
 const c=event.target.closest('[data-cable]');if(c){closeInspector(false);selectedCable=c.dataset.cable;$('wire-feedback').textContent='';renderWiring();scene?.view('assembly');for(const b of document.querySelectorAll('[data-view]'))b.classList.toggle('active',b.dataset.view==='assembly');}
 const port=event.target.closest('[data-port]');if(port&&event.detail===0)attemptConnection(port.dataset.port);
 const view=event.target.closest('[data-view]');if(view){scene?.view(view.dataset.view);for(const b of document.querySelectorAll('[data-view]'))b.classList.toggle('active',b===view);}
});
$('connect-cable').onclick=()=>{if(connections.includes(selectedCable))attemptConnection(selectedCable);else attemptConnection($('target-port').value);};
$('disconnect-all').onclick=()=>{connections=[];resetSimulation();renderWiring();updateSimulationState();$('wire-feedback').textContent='Кабели отсоединены.';};
let activeWorkshopMenu=null;
function closeWorkshopMenu(restore=false){
 if(!activeWorkshopMenu)return;
 const key=activeWorkshopMenu,button=document.querySelector(`[data-menu="${key}"]`);$('menu-'+key).hidden=true;button.setAttribute('aria-expanded','false');activeWorkshopMenu=null;if(restore)button.focus();
}
function positionWorkshopMenu(){
 if(!activeWorkshopMenu)return;
 const panel=$('menu-'+activeWorkshopMenu),button=document.querySelector(`[data-menu="${activeWorkshopMenu}"]`),rect=button.getBoundingClientRect();panel.style.left=Math.max(12,Math.min(rect.left,innerWidth-panel.offsetWidth-12))+'px';
}
document.addEventListener('click',ev=>{
 const toggle=ev.target.closest('[data-menu]');
 if(toggle){const key=toggle.dataset.menu,wasOpen=key===activeWorkshopMenu;closeWorkshopMenu(false);if(!wasOpen){activeWorkshopMenu=key;$('menu-'+key).hidden=false;toggle.setAttribute('aria-expanded','true');positionWorkshopMenu();$('menu-'+key).querySelector('button')?.focus({preventScroll:true});}return;}
 if(ev.target.closest('[data-menu-close]')){closeWorkshopMenu(true);return;}
 if(!ev.target.closest('.workshop-menu'))closeWorkshopMenu(false);
});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape')closeWorkshopMenu(true);});
window.addEventListener('resize',positionWorkshopMenu);
function closeInspector(restore=true){if(!$('component-inspector')||$('component-inspector').hidden)return;$('component-inspector').hidden=true;inspectedKey=null;if(restore)inspectOrigin?.focus();}
function openInspector(key){
 closeWorkshopMenu(false);
 const part=resolve(build)[key];if(!part)return;
 inspectOrigin=document.activeElement;inspectedKey=key;
 const category=categories.find(c=>c[0]===key)[1],source=sourceFor(part.id),specs=componentSpecs(part,key);
 const related=cablesFor(build,fanLayout).filter(c=>key==='psu'?c.from==='Блок питания':key==='cpu'?c.id.startsWith('eps'):key==='gpu'?c.id.startsWith('gpu'):key==='cooler'?['cpuFan','pump'].includes(c.id):key==='case'?['panel','audio','usb2','usb3','usbC','frontFan','rearFan'].includes(c.id):key==='motherboard'?!c.id.startsWith('gpu'):false);
 $('inspector-category').textContent=category;$('inspector-name').textContent=part.name;
 $('inspector-content').innerHTML=`<div class="inspector-temperature"><span>${heatLabels[key]}<small>Учебный расчёт</small></span><strong id="inspector-temp">—</strong></div><p id="inspector-heat-status" class="inspector-muted"></p><dl>${specs.map(([label,value])=>`<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`).join('')}</dl><h3>Подключения</h3>${related.length?`<ul class="inspector-connections">${related.map(c=>`<li><span>${e(c.to)}</span><b>${wireMode==='auto'||connections.includes(c.id)?'Подключён':'Не подключён'}</b></li>`).join('')}</ul>`:`<p class="inspector-muted">${key==='ram'?'Вставляется в слоты DIMM':key==='storage'?'Вставляется в слот M.2':'Крепится к корпусу'}. Отдельный кабель не требуется.</p>`}${part.powerAssumed?'<p class="inspector-muted">Мощность — допущение учебной модели, а не подтверждённый предел производителя.</p>':''}${part.tmaxAssumed?'<p class="inspector-muted">Температурный предел условный: не предел датчика hotspot или BIOS этой видеокарты.</p>':''}${[part.notes||[]].flat().map(note=>`<p class="inspector-muted">${e(note)}</p>`).join('')}${source?.sources?.[0]?`<a class="shop-link" href="${e(safeUrl(source.sources[0]))}" target="_blank" rel="noopener noreferrer">Источник характеристик ↗</a>`:''}`;
 $('component-inspector').hidden=false;if($('studio').getBoundingClientRect().top<0)$('studio').scrollIntoView({block:'start',behavior:'smooth'});$('inspector-close').focus({preventScroll:true});updateInspectorHeat();
}
function updateInspectorHeat(){
 if(!inspectedKey||!$('inspector-temp'))return;
 $('inspector-temp').textContent=hasRun?Math.round(thermals[inspectedKey])+' °C':'—';
 $('inspector-heat-status').textContent=hasRun?(running?'Температура меняется с нагрузкой и охлаждением.':'Симуляция на паузе.'):'Нет данных. Запусти симуляцию во вкладке «Симуляция».';
}
$('inspector-close').onclick=()=>closeInspector();
$('inspector-change').onclick=()=>{const key=inspectedKey;closeInspector();openCatalog(key);};
document.addEventListener('keydown',ev=>{if(ev.key==='Escape')closeInspector();});
document.addEventListener('click',ev=>{const button=ev.target.closest('[data-inspect]');if(button)openInspector(button.dataset.inspect);});
function openInfo(title,html){closeWorkshopMenu(false);$('info-title').textContent=title;$('info-content').innerHTML=html;$('info-dialog').showModal();}
function method(){openInfo('Как работает симуляция',`<p>PCmaker показывает <strong>приблизительную учебную модель</strong>. Это не измерение датчиков, не прогноз FPS и не инженерный расчёт движения воздуха.</p><h3>Нагрузка → мощность → тепло</h3><p>Каждый режим задаёт условную долю нагрузки на CPU и GPU. Для новых AMD, где производитель не публикует PPT, предел мощности принят как условные TDP × 1,35; это отмечено в карточке. Intel использует опубликованный MTP. Мощность процессора оценивается отдельно от его TDP: например, в модели Ryzen 9 7900X используется предел PPT 230 Вт при TDP 170 Вт.</p><p>Температура детали зависит от воздуха в корпусе, её тепловыделения и условного теплового сопротивления кулера. Обороты влияют на это сопротивление и на отвод тепла из корпуса. Изменения происходят постепенно; при достижении предела имитируется снижение мощности.</p><h3>Что означают вентиляторы и линии</h3><p>В режиме «Вентиляторы» можно менять крепления и направление каждого вентилятора. Голубые частицы показывают вдув, оранжевые — выдув. Приближённый теплообмен зависит от числа вентиляторов, их размера, оборотов, направления и положения. Близкие вход и выход на одной стенке уменьшают обмен воздуха у деталей; путь вдали от CPU и GPU также менее эффективен. Задний вдув навстречу башенному кулеру повышает его расчётное тепловое сопротивление. Предупреждения объясняют проблемы и не блокируют запуск. Траектории заданы схематично и не рассчитывают турбулентность или столкновения с деталями. Без запуска видны только линии маршрута.</p><p>Три корпуса PCmaker — авторские учебные компоновки, а не серийные товары. Для них предусмотрено по три точки на шести стенках с проверкой пересечений. У серийных корпусов отображается ограниченный набор креплений. Скорость корпусных вентиляторов — виртуальный диапазон 0–1700 об/мин, взятый как пример PWM-вентилятора. Это не характеристика штатных вентиляторов CC560 V2. Снятие стекла, крышки и скрытие кулера меняет только вид, а не физическую конфигурацию.</p><h3>Пределы точности</h3><p>Нагрев VRM платы, радиатора кулера и воздуха БП вычисляется по условной добавке к температуре воздуха в корпусе. Это не датчики конкретных моделей. Коэффициенты теплообмена, инерция и доли нагрузки — допущения автора проекта, не замеры тестовой лаборатории. Не учитываются конкретная термопаста, BIOS, разгон, температура VRAM, пыль и расположение компьютера. Tjmax относится к кристаллу; температуры других датчиков могут отличаться.</p><p><a href="https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-9-7900x.html" target="_blank" rel="noopener noreferrer">Спецификации Ryzen 9 7900X</a> · <a href="https://www.noctua.at/en/products/nf-p12-redux-1700-pwm/specifications" target="_blank" rel="noopener noreferrer">Пример характеристик вентилятора Noctua</a></p>`);}
function sources(){openInfo('Источники и ограничения',`<p>Каталог проверен 10–11 октября 2026 года. Ссылки на характеристики доступны и в карточках комплектующих. Проверки покрывают основные ограничения: перед покупкой также нужно свериться со списком поддержки CPU, версией BIOS, комплектацией крепежа и кабелей.</p><h3>Цены — ${region.city} / ${region.currency}</h3><p>Подтверждённых цен: ${Object.keys(priceData.items).length}. Отсутствующая цена не считается нулевой. У проверенных предложений указываются дата, магазин и сумма; скидки и наличие могут измениться.</p><h3>Каталог</h3><ul>${sourceData.catalog.map(p=>`<li>${e(p.name)} — ${p.sources?.length?`<a href="${e(safeUrl(p.sources[0]))}" target="_blank" rel="noopener noreferrer">источник ↗</a>`:'источник уточняется'}</li>`).join('')}</ul><h3>Габариты и модели</h3><p>3D-детали стилизованы и имеют названия выбранных моделей. Проверка использует числовые характеристики каталога, а не геометрию изображения. Для CC560 V2 принят более консервативный предел длины GPU 320 мм: страницы производителя дают разные значения. RTX 3090 Trinity длиной 317,8 мм требует особенно внимательной проверки посадки.</p><p>DDR4 и DDR5 не взаимозаменяемы. Частота EXPO у DDR5 — дополнительный профиль, а не гарантия стабильной работы на любом процессоре.</p><p><a href="https://www.kingston.com/en/blog/pc-performance/ddr-memory-generation-differences" target="_blank" rel="noopener noreferrer">Kingston: различия DDR4 и DDR5</a></p><h3>Подсветка</h3><p>RGB размещён только на подтверждённых зонах: <a href="https://www.zotac.com/us/product/graphics_card/zotac-gaming-geforce-rtx-3090-trinity" target="_blank" rel="noopener noreferrer">логотипы ZOTAC RTX 3090 Trinity</a> и <a href="https://pl.deepcool.com/products/Cases/CH560-WH-New-Generation-of-Airflow-Case/2023/17124.shtml" target="_blank" rel="noopener noreferrer">вентиляторы CH560 WH</a>. У CC560 V2 — фиксированные бирюзовые LED. У учебных корпусов PCmaker — условные RGB-вентиляторы. Выключение и изменение цвета в меню относятся к визуализации.</p><h3>Технологии</h3><p>3D: Three.js 0.186.1 (MIT). Конструктор работает в браузере. Личные черновики сохраняются на этом устройстве. Галерея хранит опубликованные сборки и аккаунты на сервере; кнопка «Поделиться» записывает выбранные детали в ссылку.</p>`);}
document.addEventListener('click',event=>{const tab=event.target.closest('[data-tab]');if(tab)setTab(tab.dataset.tab);const close=event.target.closest('[data-close]');if(close)$(close.dataset.close).close();const part=event.target.closest('[data-category]');if(part)openCatalog(part.dataset.category);});
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',ev=>{if(ev.target===dialog){const rect=dialog.getBoundingClientRect();if(ev.clientX<rect.left||ev.clientX>rect.right||ev.clientY<rect.top||ev.clientY>rect.bottom)dialog.close();}});

$('open-simulation').onclick=()=>{setTab('simulation');if(innerWidth<840)$('build-panel')?.scrollIntoView({behavior:'smooth'});};
$('demo-button').onclick=()=>{build={...demoBuild};resetSimulation();renderBuild();toast('Пример загружен. Любую деталь можно заменить вручную.');};
$('clear-button').onclick=()=>$('clear-dialog').showModal();$('confirm-clear').onclick=()=>{build={...emptyBuild(),case:build.case};resetSimulation();renderBuild();$('clear-dialog').close();toast('Начинаем новую сборку');};
$('share-button').onclick=async()=>{const url=new URL(location.href);const shareParams=new URLSearchParams({build:categories.map(([key])=>build[key]||'').join(',')});if(wireMode==='manual'){shareParams.set('wire','manual');shareParams.set('connected',connections.join(','));}url.hash=(shareParams.set('fans',encodeFans(fanLayout)),shareParams.toString());try{await navigator.clipboard.writeText(url.href);toast('Ссылка на сборку скопирована');}catch{openInfo('Ссылка на твою сборку',`<p>Скопируй ссылку и открой её на другом компьютере.</p><input class="share-input" readonly value="${e(url.href)}" aria-label="Ссылка на сборку">`);$('info-content').querySelector('input').select();}};
$('method-button').onclick=method;$('sources-button').onclick=sources;
for(const [id,property,inverted] of [['glass-toggle','hideGlass',false],['rear-panel-toggle','hideRearPanel',false],['cooler-toggle','hideCooler',false],['airflow-toggle','airflow',false]])$(id).onclick=()=>{const active=$(id).getAttribute('aria-pressed')!=='true';$(id).setAttribute('aria-pressed',active);$(id).classList.toggle('active',active);scene?.setOptions({[property]:active});if(property==='hideGlass')$(id).innerHTML=icon('layers')+(active?' Вернуть стекло':' Снять стекло');if(property==='hideRearPanel')$(id).innerHTML=icon('layers')+(active?' Вернуть крышку за платой':' Снять крышку за платой');if(property==='airflow'){$('fan-flow-toggle').setAttribute('aria-pressed',String(active));$('fan-flow-toggle').textContent=active?'Скрыть потоки воздуха':'Показать потоки воздуха';$('airflow-legend').hidden=!active;if(active&&!running)toast('Запусти симуляцию, чтобы увидеть движение воздуха');}};
$('reset-view').onclick=()=>{scene?.reset();for(const b of document.querySelectorAll('[data-view]'))b.classList.toggle('active',b.dataset.view==='assembly');};$('zoom-in').onclick=()=>scene?.zoom(.86);$('zoom-out').onclick=()=>scene?.zoom(1.16);$('auto-rotate').onclick=()=>{const on=$('auto-rotate').getAttribute('aria-pressed')!=='true';$('auto-rotate').setAttribute('aria-pressed',on);if(scene)scene.controls.autoRotate=on;};
$('workloads').addEventListener('click',event=>{const button=event.target.closest('[data-load]');if(!button)return;settings.load=button.dataset.load;for(const b of $('workloads').querySelectorAll('button'))b.classList.toggle('active',b===button);updateSliders();});
for(const key of ['ambient','front','rear','cpuFan'])$(key).oninput=()=>{settings[key]=Number($(key).value);updateSliders();};
$('run-simulation').onclick=()=>{if(!compatibility(build).ready||missingWires().length)return;running=!running;if(running&&!hasRun){thermals=initialThermals(settings.ambient);}hasRun=true;scene?.setOptions({running});updateSimulationState();};
let last=performance.now(),paint=0;function tick(now){const dt=Math.min((now-last)/1000,.25);last=now;if(running){elapsed+=dt;lastTarget=thermalTargets(build,settings);lastLoad=settings.load;thermals=advanceThermals(thermals,lastTarget,dt);}if(now-paint>350){renderMetrics();paint=now;}requestAnimationFrame(tick);}requestAnimationFrame(tick);
renderBuild();
$('region-select').onchange=()=>{regionId=regionFor($('region-select').value).id;region=regionFor(regionId);priceData=snapshots[regionId];try{localStorage.setItem('pcmaker-region',regionId);}catch{}renderBuild();shop.refresh();autoBuilder.refresh();toast('Регион цен: '+region.city+' / '+region.currency);};
Promise.allSettled([fetch('./prices.json').then(r=>{if(!r.ok)throw Error('prices');return r.json();}),fetch('./prices-by.json').then(r=>{if(!r.ok)throw Error('prices-by');return r.json();}),fetch('./sources.json').then(r=>r.json())]).then(results=>{for(const [i,id] of ['ru','by'].entries())if(results[i].status==='fulfilled')snapshots[id]=priceSnapshot(results[i].value,id);if(results[2].status==='fulfilled')sourceData=results[2].value;priceData=snapshots[regionId];renderBuild();shop.refresh();autoBuilder.refresh();});
try{const {PCScene}=await import('./scene.js');scene=new PCScene($('viewport'));scene.onInspect=openInspector;scene.onCableDrop=completeCableDrag;scene.onCablePick=id=>{selectedCable=id;setTab('wiring');};scene.fanLayout=fanLayout;scene.setBuild(build);scene.onFanSelect=fanUI.select;scene.onFanDrop=fanUI.move;fanUI.render();scene.setOptions({running,hideGlass:$('glass-toggle').getAttribute('aria-pressed')==='true',hideCooler:$('cooler-toggle').getAttribute('aria-pressed')==='true',airflow:$('airflow-toggle').getAttribute('aria-pressed')==='true'});renderLighting();renderWiring();scene.onContextLost=()=>toast('3D-контекст потерян. Сохрани сборку и обнови страницу.');updateSliders();}catch(error){console.error('3D initialization failed',error);$('viewport').innerHTML=`<div class="fallback">${icon('case')}<strong>3D не удалось запустить</strong><p>Попробуй современный браузер с аппаратным ускорением.<br>Каталог, совместимость и симуляция остаются доступны.</p></div>`;$('scene-hint').hidden=true;}

