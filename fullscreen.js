// Fullscreen is temporary: keep the saved assembly-panel preference intact.
export function createFullscreen({beforeEnter=()=>{},notify=()=>{}}={}) {
 const root=document.documentElement,enter=document.getElementById('fullscreen-button'),exit=document.getElementById('fullscreen-exit');
 const controls=[document.querySelector('.workshop-header'),document.getElementById('build-panel'),document.getElementById('build-panel-toggle')];
 let active=false,pending=false,previous=[],scrollPosition={x:0,y:0},restoreTimer;
 function sync() {
  const next=document.fullscreenElement===root;
  if(next===active)return;
  active=next;
  if(active){
   beforeEnter();
   previous=controls.map(element=>({element,inert:element.inert,ariaHidden:element.getAttribute('aria-hidden')}));
   exit.hidden=false;
   root.classList.add('scene-fullscreen');
   window.scrollTo(0,0);
   exit.focus({preventScroll:true});
   for(const element of controls){element.inert=true;element.setAttribute('aria-hidden','true');}
  }else{
   root.classList.remove('scene-fullscreen');
   for(const {element,inert,ariaHidden} of previous){element.inert=inert;if(ariaHidden===null)element.removeAttribute('aria-hidden');else element.setAttribute('aria-hidden',ariaHidden);}
   previous=[];exit.hidden=true;
   // Wait for the header's visibility transition before returning keyboard focus.
   enter.focus({preventScroll:true});
   restoreTimer=setTimeout(()=>{if(!active){window.scrollTo(scrollPosition.x,scrollPosition.y);if(document.activeElement===document.body)enter.focus({preventScroll:true});}},380);
  }
  enter.setAttribute('aria-pressed',String(active));
 }
 enter.addEventListener('click',async()=>{
  if(pending||active)return;
  if(!root.requestFullscreen||document.fullscreenEnabled===false){notify('Полный экран недоступен в этом браузере. Открой сайт в Chrome, Edge или Firefox.');return;}
  pending=true;
  clearTimeout(restoreTimer);
  scrollPosition={x:window.scrollX,y:window.scrollY};
  try{
   // Keep the request inside the click gesture; do not wait for animations first.
   await root.requestFullscreen({navigationUI:'hide'});
   sync();
  }catch{sync();notify('Браузер не разрешил полный экран. Попробуй открыть сайт в отдельной вкладке.');}
  finally{pending=false;}
 });
 async function leave(){
  if(pending||!active)return;
  if(document.fullscreenElement!==root){sync();return;}
  pending=true;
  try{await document.exitFullscreen();sync();}
  catch{sync();notify('Не удалось выйти из полного экрана. Нажми Esc.');}
  finally{pending=false;}
 }
 exit.addEventListener('click',leave);
 // Native Esc normally exits itself; also support embedded browsers that send
 // it to the page. Never prevent the browser's own fullscreen exit shortcut.
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&active)leave();});
 document.addEventListener('fullscreenchange',sync);
}
