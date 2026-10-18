import {revealPanel,hidePanel} from './motion.js';
const trigger=document.getElementById('brand-toggle');
const menu=document.getElementById('brand-switcher');
if(trigger&&menu){
 const links=[...menu.querySelectorAll('a')];
 const close=(focus=false)=>{if(trigger.getAttribute('aria-expanded')!=='true')return;hidePanel(menu);trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus();};
 const open=()=>{revealPanel(menu);trigger.setAttribute('aria-expanded','true');document.dispatchEvent(new Event('pcmaker:navigation-open'));};
 trigger.addEventListener('click',()=>trigger.getAttribute('aria-expanded')==='true'?close():open());
 trigger.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();open();links[event.key==='ArrowDown'?0:links.length-1].focus();}});
 menu.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();const current=links.indexOf(document.activeElement),index=event.key==='Home'?0:event.key==='End'?links.length-1:(current+(event.key==='ArrowDown'?1:-1)+links.length)%links.length;links[index].focus();}});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){event.preventDefault();close(true);}});
 document.addEventListener('click',event=>{if(!event.target.closest('.brand-navigation'))close();});
 document.addEventListener('focusin',event=>{if(!event.target.closest('.brand-navigation'))close();});
}
