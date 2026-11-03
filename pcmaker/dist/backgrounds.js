import {backgroundDefaults,sanitizeBackground,backgroundAsset,imageSize} from './background-state.js';

const key='pcmaker-background-v1',studio=document.querySelector('.studio'),panel=document.getElementById('menu-background');
const $=id=>document.getElementById(id);
let state;try{state=sanitizeBackground(JSON.parse(localStorage.getItem(key)));}catch{state={...backgroundDefaults};}
let customURL=null,operation=0,dbPromise;
const backdrop=document.createElement('div');backdrop.className='scene-backdrop';backdrop.setAttribute('aria-hidden','true');studio.prepend(backdrop);
function status(text){$('background-status').textContent=text;}
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{status('Фон применён. Браузер не разрешил сохранить настройки.');}}
function render(){
 studio.dataset.background=state.preset;backdrop.dataset.preset=state.preset;
 const url=state.preset==='custom'?customURL:backgroundAsset(state);
 backdrop.style.backgroundImage=url?`url("${url}")`:'';
 backdrop.style.setProperty('--backdrop-blur',(['dark','light'].includes(state.preset)?0:state.blur)+'px');
 backdrop.style.setProperty('--backdrop-brightness',state.brightness/100);
 for(const b of panel.querySelectorAll('[data-background]'))b.setAttribute('aria-pressed',String(b.dataset.background===state.preset));
 for(const b of panel.querySelectorAll('[data-background-city]'))b.setAttribute('aria-pressed',String(b.dataset.backgroundCity===state.city));
 $('background-city-controls').hidden=state.preset!=='city';
 $('background-blur').value=state.blur;$('background-brightness').value=state.brightness;
 $('background-blur').disabled=['dark','light'].includes(state.preset);
 $('background-blur-value').value=state.blur+' px';$('background-brightness-value').value=state.brightness+'%';
 $('background-remove').hidden=!customURL;
 const preview=panel.querySelector('[data-preview="custom"]');preview.style.backgroundImage=customURL?`url("${customURL}")`:'';preview.textContent=customURL?'':'+';
 panel.querySelector('[data-preview="city"]').style.backgroundImage=`url("./assets/backgrounds/city-${state.city}.jpg")`;
}
function db(){
 return dbPromise??=new Promise((resolve,reject)=>{
  const req=indexedDB.open('pcmaker-backgrounds',1);
  req.onupgradeneeded=()=>req.result.createObjectStore('images');
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);req.onblocked=()=>reject(Error('Хранилище занято'));
 });
}
async function imageStore(action,blob){
 const database=await db();return new Promise((resolve,reject)=>{
  const tx=database.transaction('images',action==='get'?'readonly':'readwrite'),store=tx.objectStore('images');
  const request=action==='put'?store.put(blob,'custom'):action==='delete'?store.delete('custom'):store.get('custom');
  tx.oncomplete=()=>resolve(request.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Не удалось сохранить фон'));
 });
}
function loadImage(url){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Не удалось загрузить фон. Попробуй ещё раз.'));image.src=url;});}
async function select(patch){
 const token=++operation,next=sanitizeBackground({...state,...patch});
 if(next.preset==='custom'&&!customURL){$('background-file').click();return;}
 try{
  const url=backgroundAsset(next);if(url)await loadImage(url);
  if(token!==operation)return;state=next;status('');render();save();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)backdrop.animate([{opacity:.45},{opacity:1}],{duration:260,easing:'ease-out'});
 }catch(error){if(token===operation)status(error.message);}
}
panel.addEventListener('click',e=>{
 const preset=e.target.closest('[data-background]')?.dataset.background;if(preset){select({preset});return;}
 const city=e.target.closest('[data-background-city]')?.dataset.backgroundCity;if(city)select({city});
});
for(const prop of ['blur','brightness'])$('background-'+prop).addEventListener('input',e=>{
 state=sanitizeBackground({...state,[prop]:Number(e.target.value)});render();save();
});
$('background-upload').addEventListener('click',()=>$('background-file').click());
$('background-reset').addEventListener('click',()=>select({...backgroundDefaults}));
$('background-remove').addEventListener('click',async()=>{
 const token=++operation;try{await imageStore('delete');if(token!==operation)return;const old=customURL;customURL=null;if(state.preset==='custom')state={...state,preset:'dark'};render();save();if(old)URL.revokeObjectURL(old);status('Свой фон удалён из этого браузера.');}catch{status('Не удалось удалить сохранённый фон. Попробуй ещё раз.');}
});
$('background-file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];e.target.value='';if(!file)return;
 const token=++operation;let bitmap;
 try{
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Выбери изображение JPG, PNG или WebP.');
  if(file.size>12*1024*1024)throw Error('Файл больше 12 МБ. Выбери изображение поменьше.');
  status('Подготавливаю изображение…');try{bitmap=await createImageBitmap(file);}catch{throw Error('Не удалось прочитать изображение. Файл повреждён или имеет неподдерживаемый формат.');}
  const size=imageSize(bitmap.width,bitmap.height),canvas=document.createElement('canvas');canvas.width=size.width;canvas.height=size.height;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#252b32';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.85));if(!blob)throw Error('Не удалось подготовить изображение.');
  if(token!==operation)return;
  let saved=true;try{await imageStore('put',blob);}catch{saved=false;}
  if(token!==operation)return;
  const old=customURL;customURL=URL.createObjectURL(blob);state={...state,preset:'custom'};render();status(saved?'Свой фон сохранён в этом браузере.':'Фон применён на эту сессию. Браузер не разрешил сохранить изображение.');save();if(old)URL.revokeObjectURL(old);
 }catch(error){if(token===operation)status(error.message||'Не удалось открыть изображение.');}finally{bitmap?.close();}
});
// The background is outside #viewport: WebGL initialization may replace its children.
render();
const initialOperation=operation;
imageStore('get').then(blob=>{
 if(operation!==initialOperation)return;
 if(blob instanceof Blob){customURL=URL.createObjectURL(blob);render();}
 else if(state.preset==='custom'){state={...state,preset:'dark'};render();save();status('Выбери своё изображение для этого браузера.');}
}).catch(()=>{if(operation===initialOperation&&state.preset==='custom'){state={...state,preset:'dark'};render();status('Сохранённый фон недоступен. Можно загрузить его снова.');}});
window.addEventListener('pagehide',e=>{if(!e.persisted){operation++;if(customURL)URL.revokeObjectURL(customURL);dbPromise?.then(d=>d.close()).catch(()=>{});}});
