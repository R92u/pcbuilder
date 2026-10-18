import {revealPanel} from './motion.js';

export function createThermalPanel(container){
 const panel=document.createElement('aside');panel.className='thermal-panel';panel.hidden=true;panel.setAttribute('aria-label','Температуры компьютера');
 const rows=[['case','Воздух в корпусе'],['ram','Память'],['storage','SSD'],['motherboard','Плата / VRM'],['cooler','Радиатор кулера'],['psu','Выход БП']];
 panel.innerHTML=`<header><div><span class="thermal-eyebrow">МОНИТОРИНГ</span><h2>Температуры</h2></div><button type="button" class="round-button thermal-collapse" aria-label="Свернуть температуры" aria-expanded="true" aria-controls="thermal-details"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 14 6-6 6 6"/></svg></button></header><div class="thermal-compact" hidden></div><div id="thermal-details"><p class="thermal-status" role="status"></p><div class="thermal-primary">${[['cpu','Процессор'],['gpu','Видеокарта']].map(([key,label])=>`<div data-thermal-card="${key}"><span>${label}</span><strong data-thermal-value="${key}">—</strong><small>°C</small><div class="thermal-track"><i data-thermal-bar="${key}"></i></div></div>`).join('')}</div><dl>${rows.map(([key,label])=>`<div><dt>${label}</dt><dd><span data-thermal-value="${key}">—</span> °C</dd></div>`).join('')}</dl><footer><span>Учебный расчёт</span><time>00:00</time></footer></div>`;
 container.append(panel);
 const details=panel.querySelector('#thermal-details'),toggle=panel.querySelector('button'),compact=panel.querySelector('.thermal-compact'),status=panel.querySelector('.thermal-status'),clock=panel.querySelector('time');
 const values=Object.fromEntries([...panel.querySelectorAll('[data-thermal-value]')].map(node=>[node.dataset.thermalValue,node]));
 function expand(expanded){details.hidden=!expanded;compact.hidden=expanded;toggle.setAttribute('aria-expanded',String(expanded));toggle.setAttribute('aria-label',expanded?'Свернуть температуры':'Развернуть температуры');panel.classList.toggle('collapsed',!expanded);}
 toggle.onclick=()=>expand(toggle.getAttribute('aria-expanded')!=='true');
 return {
  show(){expand(true);revealPanel(panel,true);},
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
