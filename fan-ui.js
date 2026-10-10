import {catalog,resolve} from './catalog.js';
import {fanMounts,fanWalls,defaultFanLayout,placementError} from './fan-layout.js';

export function createFanEditor({getBuild,getLayout,getScene,onChange,onCase,isOpen}){
 const $=id=>document.getElementById(id);
 let selected=null,wall='front',previousCase=null;
 function feedback(text){$('fan-feedback').textContent=text;}
 function select(id){selected=id;render();}
 function move(id,target){
  if(!id){feedback('Сначала выбери вентилятор или добавь новый.');return;}
  if(!target){feedback('Перетащи вентилятор ближе к подсвеченному креплению.');return;}
  const error=placementError(getBuild(),getLayout(),id,target);if(error){feedback(error);getScene()?.renderFanMarkers();return;}
  selected=id;onChange(getLayout().map(f=>f.id===id?{...f,slot:target}:f));feedback('Вентилятор закреплён. Провода и потоки обновлены.');
 }
 function render(){
  const build=getBuild(),layout=getLayout(),slots=fanMounts(build),p=resolve(build).case;
  if(previousCase!==build.case){previousCase=build.case;wall=p?.concept==='panorama'?'left':'front';selected=layout[0]?.id||null;feedback('');}
  if(!layout.some(f=>f.id===selected))selected=layout[0]?.id||null;
  $('fan-case-note').textContent=p?.concept?'Учебное шасси · по три точки на каждой из шести стенок. Направление каждого вентилятора можно изменить.':'У этой модели доступны показанные крепления спереди и сзади. Для любой стенки выбери учебное шасси ниже.';
  $('fan-concepts').innerHTML=catalog.case.filter(c=>c.concept).map(c=>`<button data-fan-case="${c.id}" aria-pressed="${c.id===build.case}"><img src="./assets/concepts/${c.concept}.svg" alt="" width="84" height="55"><span>${c.short}</span></button>`).join('');
  $('fan-walls').innerHTML=Object.entries(fanWalls).map(([key,name])=>{const count=slots.filter(s=>s.wall===key).length,installed=layout.filter(f=>f.slot.startsWith(key+'-')).length;return `<button data-fan-wall="${key}" aria-pressed="${key===wall}" ${count?'':'disabled'}><span>${name}</span><small>${installed} / ${count}</small></button>`;}).join('');
  $('fan-list').innerHTML=layout.map(f=>`<button data-fan-select="${f.id}" aria-pressed="${selected===f.id}"><b>${f.id.slice(3)}</b><span>${slots.find(s=>s.id===f.slot).label}<small>${f.direction==='in'?'↓ Вдув':'↑ Выдув'}</small></span></button>`).join('')||'<p class="small-note">Корпусных вентиляторов нет. Добавь вентилятор на свободное крепление.</p>';
  const current=layout.find(f=>f.id===selected);$('fan-selection').hidden=!current;
  $('add-fan').disabled=!slots.some(s=>s.wall===wall&&!placementError(build,layout,null,s.id));
  if(current){
   $('fan-selection-title').textContent='Вентилятор '+current.id.slice(3);
   document.querySelectorAll('[data-fan-direction]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fanDirection===current.direction)));
   $('fan-target').innerHTML=slots.map(s=>{const error=placementError(build,layout,current.id,s.id);return `<option value="${s.id}" ${s.id===current.slot?'selected':''} ${error?'disabled':''}>${s.label}${error?' · занято / пересечение':''}</option>`;}).join('');
  }
  getScene()?.setFanEditor(isOpen(),wall,selected);
 }
 $('fan-walls').onclick=ev=>{const b=ev.target.closest('[data-fan-wall]');if(!b||b.disabled)return;wall=b.dataset.fanWall;render();getScene()?.viewFanWall(wall);feedback('Показываем крепления: '+fanWalls[wall].toLowerCase()+'.');};
 $('fan-concepts').onclick=ev=>{const b=ev.target.closest('[data-fan-case]');if(b){onCase(b.dataset.fanCase);getScene()?.viewFanWall(wall);}};
 $('fan-list').onclick=ev=>{const b=ev.target.closest('[data-fan-select]');if(b)select(b.dataset.fanSelect);};
 document.querySelectorAll('[data-fan-direction]').forEach(b=>b.onclick=()=>{onChange(getLayout().map(f=>f.id===selected?{...f,direction:b.dataset.fanDirection}:f));feedback('Направление, вращение и группа PWM обновлены.');});
 $('move-fan').onclick=()=>move(selected,$('fan-target').value);
 $('remove-fan').onclick=()=>{onChange(getLayout().filter(f=>f.id!==selected));feedback('Вентилятор снят.');};
 $('add-fan').onclick=()=>{
  const layout=getLayout(),target=fanMounts(getBuild()).find(s=>s.wall===wall&&!placementError(getBuild(),layout,null,s.id));if(!target)return;
  const id=Array.from({length:18},(_,i)=>'fan'+(i+1)).find(id=>!layout.some(f=>f.id===id));if(!id)return;
  selected=id;onChange([...layout,{id,slot:target.id,direction:['top','rear'].includes(wall)?'out':'in'}]);feedback('Вентилятор добавлен. Можно перетащить его или изменить направление.');
 };
 $('reset-fans').onclick=()=>{onChange(defaultFanLayout(getBuild()));feedback('Возвращена штатная схема выбранного корпуса.');};
 return {render,select,move,getWall:()=>wall};
}
