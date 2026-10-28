// Keep the assembly controls available without taking space from the model.
export function createBuildPanel() {
 const panel=document.getElementById('build-panel');
 const button=document.getElementById('build-panel-toggle');
 const root=document.documentElement;
 const storageKey='pcmaker-panel-collapsed';
 let collapsed=root.dataset.panelCollapsed==='true';
 function setCollapsed(value,save=true) {
  collapsed=value;
  if(collapsed&&panel.contains(document.activeElement))button.focus();
  root.dataset.panelCollapsed=String(collapsed);
  panel.inert=collapsed;
  panel.setAttribute('aria-hidden',String(collapsed));
  button.setAttribute('aria-expanded',String(!collapsed));
  const label=collapsed?'Открыть панель сборки':'Скрыть панель сборки';
  button.setAttribute('aria-label',label);
  button.title=label;
  if(save)try{localStorage.setItem(storageKey,String(collapsed));}catch{}
 }
 button.addEventListener('click',()=>setCollapsed(!collapsed));
 setCollapsed(collapsed,false);
 return {open:()=>setCollapsed(false),get collapsed(){return collapsed;}};
}
