// Apply the saved skin before the page paints; changing it never reloads the app.
(() => {
 const key='pcmaker-design';
 const stylesheets={glass:document.getElementById('design-stylesheet'),terminal:document.getElementById('terminal-stylesheet')};
 const normalize=value=>value==='glass'||value==='terminal'?value:'standard';
 const saved=()=>{try{return normalize(localStorage.getItem(key));}catch{return 'standard';}};
 let current=saved();
 function apply(value){
  current=normalize(value);
  for(const [theme,stylesheet] of Object.entries(stylesheets)){
   if(stylesheet)stylesheet.media=current===theme?'all':'not all';
  }
  document.documentElement.dataset.design=current;
  const color=document.querySelector('meta[name="theme-color"]');
  if(color)color.content=current==='terminal'?'#0b0b0b':current==='glass'?'#141619':'#101014';
  document.querySelectorAll('[data-design-select]').forEach(select=>{select.value=current;});
  window.dispatchEvent(new Event('pcmaker:design-change'));
 }
 apply(current);
 document.addEventListener('DOMContentLoaded',()=>{
  apply(current);
  document.querySelectorAll('[data-design-select]').forEach(select=>select.addEventListener('change',()=>{
   apply(select.value);
   try{localStorage.setItem(key,current);}catch{}
  }));
 },{once:true});
 window.addEventListener('storage',event=>{if(event.key===key||event.key===null)apply(saved());});
 window.addEventListener('pageshow',event=>{if(event.persisted)apply(saved());});
})();
