import {sanitizeKeyboardLighting} from './keyboard-model.js';
import {peripheralById,sanitizeWorkplace} from './peripherals.js?v=expanded-20261102';

const read=key=>{try{return JSON.parse(localStorage.getItem(key));}catch{return null;}};
let settings=sanitizeKeyboardLighting(read('pcmaker-keyboard-lighting'));
let selected=sanitizeWorkplace(read('pcmaker-workplace')).keyboard;
const panel=document.createElement('section');panel.className='keyboard-lighting';
panel.innerHTML='<h3 id="keyboard-rgb-title">Клавиатура</h3><p id="keyboard-rgb-model" class="menu-note"></p><div class="rgb-modes" role="group" aria-labelledby="keyboard-rgb-title"><button data-keyboard-light="photo">По фото</button><button data-keyboard-light="color">Цвет</button><button data-keyboard-light="rainbow">Радуга</button><button data-keyboard-light="off">Выкл.</button></div><label class="rgb-color-label">Цвет клавиш<input type="color" id="keyboard-rgb-color" aria-label="Цвет подсветки клавиатуры" value="#e4edff"></label>';
document.getElementById('menu-rgb').append(panel);
const style=document.createElement('style');style.textContent='.keyboard-lighting{border-top:1px solid #ffffff26;margin-top:14px;padding-top:14px}.keyboard-lighting h3{font-size:14px;margin:0 0 6px}.keyboard-lighting .rgb-modes{flex-wrap:wrap}.keyboard-lighting button{min-width:0}';document.head.append(style);
function render(){
 const p=peripheralById[selected],available=p?.rgb!==false;
 panel.querySelector('#keyboard-rgb-model').textContent=p.name+(available?' · отдельная настройка подсветки':' · без подсветки');
 for(const b of panel.querySelectorAll('[data-keyboard-light]')){b.setAttribute('aria-pressed',String(b.dataset.keyboardLight===settings.mode));b.disabled=!available;}
 const input=panel.querySelector('input');input.value=settings.color;input.disabled=!available;
}
function change(value){settings=sanitizeKeyboardLighting({...settings,...value});try{localStorage.setItem('pcmaker-keyboard-lighting',JSON.stringify(settings));}catch{}render();document.dispatchEvent(new CustomEvent('pcmaker:keyboard-lighting',{detail:settings}));}
panel.addEventListener('click',e=>{const mode=e.target.closest('[data-keyboard-light]')?.dataset.keyboardLight;if(mode)change({mode});});
panel.querySelector('input').addEventListener('input',e=>change({mode:'color',color:e.target.value}));
document.addEventListener('pcmaker:keyboard-selected',e=>{selected=e.detail;render();});
render();
