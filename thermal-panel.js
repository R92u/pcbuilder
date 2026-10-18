import {revealPanel} from './motion.js';

function movablePanel(panel){
 const handle=panel.querySelector('.thermal-drag-handle'),storageKey='pcmaker-thermal-position',gap=12;
 let position=null,drag=null;
 try{const saved=JSON.parse(localStorage.getItem(storageKey));if(Number.isFinite(saved?.x)&&Number.isFinite(saved?.y))position={x:saved.x,y:saved.y};}catch{}
 const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(position));}catch{}};
 function place(x,y){
  if(panel.parentElement!==document.body)document.body.append(panel);
  panel.classList.add('floating');
  position={x:Math.max(gap,Math.min(x,innerWidth-panel.offsetWidth-gap)),y:Math.max(gap,Math.min(y,innerHeight-panel.offsetHeight-gap))};
  panel.style.left=position.x+'px';panel.style.top=position.y+'px';
 }
 function restore(){if(position&&!panel.hidden)place(position.x,position.y);}
 handle.addEventListener('pointerdown',event=>{
  if(event.button!==0||!event.isPrimary)return;
  panel.getAnimations().forEach(animation=>animation.cancel());
  const rect=panel.getBoundingClientRect();
  drag={id:event.pointerId,dx:event.clientX-rect.left,dy:event.clientY-rect.top};
  place(rect.left,rect.top);panel.classList.add('dragging');handle.focus({preventScroll:true});handle.setPointerCapture(event.pointerId);
  event.preventDefault();event.stopPropagation();
 });
 handle.addEventListener('pointermove',event=>{
  if(drag?.id!==event.pointerId)return;
  place(event.clientX-drag.dx,event.clientY-drag.dy);event.preventDefault();event.stopPropagation();
 });
 function finish(event){
  if(drag?.id!==event.pointerId)return;
  drag=null;panel.classList.remove('dragging');save();
  if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);
 }
 for(const name of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(name,finish);
 handle.addEventListener('keydown',event=>{
  const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
  if(!delta)return;
  event.preventDefault();event.stopPropagation();
  const rect=panel.getBoundingClientRect(),step=event.shiftKey?30:10;
  place(rect.left+delta[0]*step,rect.top+delta[1]*step);save();
 });
 window.addEventListener('resize',()=>{restore();if(position)save();});
 return {restore};
}

export function createThermalPanel(container){
 const panel=document.createElement('aside');panel.className='thermal-panel';panel.hidden=true;panel.setAttribute('aria-label','Температуры компьютера');
 const rows=[['case','Воздух в корпусе'],['ram','Память'],['storage','SSD'],['motherboard','Плата / VRM'],['cooler','Радиатор кулера'],['psu','Выход БП']];
 panel.innerHTML=`<header><div class="thermal-drag-handle" tabindex="0" role="button" aria-label="Переместить панель температур" aria-describedby="thermal-move-help" title="Перетащи за заголовок"><span class="thermal-grip" aria-hidden="true">⠿</span><div><span class="thermal-eyebrow">МОНИТОРИНГ</span><h2>Температуры</h2></div></div><button type="button" class="round-button thermal-collapse" aria-label="Свернуть температуры" aria-expanded="true" aria-controls="thermal-details"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 14 6-6 6 6"/></svg></button></header><span id="thermal-move-help" class="sr-only">Перетащи заголовок мышью или касанием. Клавиши со стрелками перемещают панель, Shift ускоряет перемещение.</span><div class="thermal-compact" hidden></div><div id="thermal-details"><p class="thermal-status" role="status"></p><div class="thermal-primary">${[['cpu','Процессор'],['gpu','Видеокарта']].map(([key,label])=>`<div data-thermal-card="${key}"><span>${label}</span><strong data-thermal-value="${key}">—</strong><small>°C</small><div class="thermal-track"><i data-thermal-bar="${key}"></i></div></div>`).join('')}</div><dl>${rows.map(([key,label])=>`<div><dt>${label}</dt><dd><span data-thermal-value="${key}">—</span> °C</dd></div>`).join('')}</dl><footer><span>Учебный расчёт</span><time>00:00</time></footer></div>`;
 container.append(panel);
 const details=panel.querySelector('#thermal-details'),toggle=panel.querySelector('button'),compact=panel.querySelector('.thermal-compact'),status=panel.querySelector('.thermal-status'),clock=panel.querySelector('time');
 const values=Object.fromEntries([...panel.querySelectorAll('[data-thermal-value]')].map(node=>[node.dataset.thermalValue,node]));
 const movement=movablePanel(panel);
 function expand(expanded){details.hidden=!expanded;compact.hidden=expanded;toggle.setAttribute('aria-expanded',String(expanded));toggle.setAttribute('aria-label',expanded?'Свернуть температуры':'Развернуть температуры');panel.classList.toggle('collapsed',!expanded);movement.restore();}
 toggle.onclick=()=>expand(toggle.getAttribute('aria-expanded')!=='true');
 return {
  show(){expand(true);panel.hidden=false;movement.restore();revealPanel(panel,true);},
  reset(){panel.hidden=true;},
  update({hasRun,running,temperatures,limits,elapsed,load}){
   if(!hasRun){panel.hidden=true;return;}
   for(const [key,node] of Object.entries(values))node.textContent=Number.isFinite(temperatures[key])?Math.round(temperatures[key]):'—';
   for(const key of ['cpu','gpu']){
    const value=temperatures[key],hot=value>=limits[key]-1;
    panel.querySelector(`[data-thermal-card="${key}"]`).classList.toggle('hot',hot);
    panel.querySelector(`[data-thermal-bar="${key}"]`).style.width=Math.max(0,Math.min(100,value/limits[key]*100))+'%';
   }
   const text=(running?'Тест идёт':'Пауза · последние значения')+(running?' · '+load:'');if(status.textContent!==text)status.textContent=text;
   panel.classList.toggle('running',running);clock.textContent=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(Math.floor(elapsed%60)).padStart(2,'0')}`;
   compact.textContent=`CPU ${values.cpu.textContent}° · GPU ${values.gpu.textContent}°`;
  }
 };
}
